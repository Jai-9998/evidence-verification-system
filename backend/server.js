require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");
const multer = require("multer")

// Multer config

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ dest: "uploads/" });
const uploadToIPFS = async (filePath) => {
  const data = new FormData();
  data.append("file", fs.createReadStream(filePath));

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        maxBodyLength: "Infinity",
        headers: {
          ...data.getHeaders(),
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
        },
      }
    );

    return res.data.IpfsHash;

  } catch (error) {
    console.error("Pinata Error:", error.response?.data || error.message);
    throw error;
  }
};


// Load ABI
const abi = require("./contract/abi.json");

// Provider (Ganache)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Wallet (Ganache account private key)
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract instance
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  wallet
);


// Generate SHA256 hash (metadata hash)
const generateHash = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

// file hash
const generateFileHash = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
};


// Health Check
app.get("/", (req, res) => {
  res.send("Backend is running");
});



app.post("/create-evidence", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const { metadata } = req.body;

    if (!file || !metadata) {
      return res.status(400).json({
        error: "File and metadata are required"
      });
    }

    console.log("Uploading file to IPFS...");

    // Generate file hash BEFORE deleting file
    const fileHash = generateFileHash(file.path);

    // Upload file to IPFS
    const ipfsHash = await uploadToIPFS(file.path);

    // Delete local file
    fs.unlinkSync(file.path);

    // Generate metadata hash
    const metadataHash = crypto
      .createHash("sha256")
      .update(metadata)
      .digest("hex");

    // console.log("IPFS Hash:", ipfsHash);
    // console.log("Metadata Hash:", metadataHash);
    // console.log("File Hash:", fileHash);
    // Call smart contract (UPDATED)
    const tx = await contract.createEvidence(
      ipfsHash,
      metadataHash,
      fileHash
    );

    await tx.wait();

    res.json({
      message: "Evidence stored successfully",
      ipfsHash,
      metadataHash,
      fileHash,
      transactionHash: tx.hash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to store evidence",
      details: error.message
    });
  }
});



app.get("/count", async (req, res) => {
  try {
    const count = await contract.count();

    res.json({
      totalEvidence: count.toString()
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error fetching count"
    });
  }
});




app.get("/get-all-evidence", async (req, res) => {
  try {
    const count = await contract.count();

    let evidences = [];

    for (let i = 0; i < count; i++) {
      const data = await contract.getEvidence(i);

      evidences.push({
        id: i,
        ipfsHash: data[0],
        metadataHash: data[1],
        fileHash: data[2],
        owner: data[3],
        timestamp: data[4].toString()
      });
    }

    res.json(evidences);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error fetching evidences"
    });
  }
});

// verify
app.post("/verify-evidence/:id", upload.single("file"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    console.log("🔍 Verifying Evidence ID:", id);

    // ✅ Step 1: Generate new file hash
    const newFileHash = generateFileHash(file.path);

    // ✅ Step 2: Delete temp file
    fs.unlinkSync(file.path);

    // ✅ Step 3: Get stored data from blockchain
    const data = await contract.getEvidence(id);

    const storedFileHash = data[2]; // IMPORTANT: index 2 = fileHash

    console.log("New File Hash:", newFileHash);
    console.log("Stored File Hash:", storedFileHash);

    // ✅ Step 4: Compare hashes
    const isValid = newFileHash === storedFileHash;

    // ✅ Step 5: Return result
    res.json({
      evidenceId: id,
      isValid,
      message: isValid
        ? "✅ Evidence is authentic (not tampered)"
        : "❌ Evidence has been tampered",
      newFileHash,
      storedFileHash
    });

  } catch (error) {
    console.error("❌ Verification Error:", error);
    res.status(500).json({
      error: "Verification failed",
      details: error.message
    });
  }
});



const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});