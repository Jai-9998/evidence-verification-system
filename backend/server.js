require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");
const multer = require("multer");

const app = express();
app.use(express.json());
app.use(cors());


const upload = multer({ dest: "uploads/" });

const uploadToIPFS = async (filePath) => {
  const data = new FormData();
  data.append("file", fs.createReadStream(filePath));

  // ✅ Add Group + Metadata
  data.append(
    "pinataMetadata",
    JSON.stringify({
      name: "evidence-file",
      keyvalues: {
        project: "evidence-verification-system",
        type: "evidence"
      }
    })
  );

  data.append(
    "pinataOptions",
    JSON.stringify({
      cidVersion: 1,
      groupId: process.env.PINATA_GROUP_ID // ✅ IMPORTANT
    })
  );

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


const abi = require("./contract/abi.json");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  wallet
);

console.log("Wallet:", wallet.address);
console.log("Contract:", process.env.CONTRACT_ADDRESS);


const generateMetadataHash = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

const generateFileHash = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
};



// Health
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
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

    console.log("📂 Uploading file to IPFS...");

    // ✅ Generate file hash
    const fileHash = generateFileHash(file.path);

    // ✅ Upload to IPFS
    const ipfsHash = await uploadToIPFS(file.path);

    // ✅ Delete temp file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // ✅ Generate metadata hash
    const metadataHash = generateMetadataHash(metadata);

    // ✅ Store on blockchain
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


app.get("/get-evidence/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const data = await contract.getEvidence(id);

    res.json({
      id,
      ipfsHash: data[0],
      metadataHash: data[1],
      fileHash: data[2],
      owner: data[3],
      timestamp: data[4].toString()
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error fetching evidence",
      details: error.message
    });
  }
});

app.get("/count", async (req, res) => {
  try {
    const count = Number(await contract.count());

    res.json({
      totalEvidence: count
    });

  } catch (error) {
    res.status(500).json({ error: "Error fetching count" });
  }
});


app.get("/get-all-evidence", async (req, res) => {
  try {
    const count = Number(await contract.count());

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
    res.status(500).json({ error: "Error fetching evidences" });
  }
});


app.post("/verify-evidence", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    console.log("🔍 Verifying Evidence (hash-based)...");

    // ✅ Generate hash of uploaded file
    const newFileHash = generateFileHash(file.path);

    // Delete temp file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // ✅ Get total evidence count
    const count = Number(await contract.count());

    let found = false;
    let matchedEvidence = null;

    // ✅ Loop through all evidences
    for (let i = 0; i < count; i++) {
      const data = await contract.getEvidence(i);

      const storedFileHash = data[2];

      if (storedFileHash === newFileHash) {
        found = true;
        matchedEvidence = {
          id: i,
          ipfsHash: data[0],
          owner: data[3],
          timestamp: data[4].toString()
        };
        break;
      }
    }

    // ✅ Result
    if (found) {
      res.json({
        isValid: true,
        message: "✅ Evidence is authentic",
        fileHash: newFileHash,
        evidence: matchedEvidence
      });
    } else {
      res.json({
        isValid: false,
        message: "❌ Evidence is tampered",
        fileHash: newFileHash
      });
    }

  } catch (error) {
    console.error(error);
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