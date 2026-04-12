import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Verify() {
  const nav = useNavigate();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verify = async () => {
    if (!file) {
      setError("Please select a file to verify.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      setError("");

      const form = new FormData();
      form.append("file", file);

      const res = await axios.post(
        "http://localhost:3000/verify-evidence",
        form,
      );

      setResult(res.data);
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ backgroundColor: "#fefce8" }}
    >
      <div
        className="card shadow-sm border-0 p-4"
        style={{ width: "100%", maxWidth: 480 }}
      >
        <div className="mb-4">
          <span className="badge bg-warning text-dark mb-2">Verify</span>
          <h4 className="fw-semibold mb-1">Verify document</h4>
          <p className="text-muted mb-0" style={{ fontSize: 14 }}>
            Upload a document to verify its authenticity using blockchain.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger py-2" style={{ fontSize: 14 }}>
            {error}
          </div>
        )}

        {result && (
          <div
            className={`alert py-2 ${
              result.isValid ? "alert-success" : "alert-danger"
            }`}
            style={{ fontSize: 14 }}
          >
            <strong>{result.message}</strong>
          </div>
        )}

        <div className="mb-4">
          <label className="form-label fw-medium">Document file</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setError("");
              setResult(null);
            }}
          />
          {file && (
            <small className="text-muted mt-1 d-block">
              Selected: {file.name}
            </small>
          )}
        </div>

        <button
          className="btn btn-warning w-100 fw-medium"
          onClick={verify}
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              />
              Verifying...
            </>
          ) : (
            "Verify document"
          )}
        </button>

        <button
          className="btn btn-link text-muted mt-2 w-100"
          style={{ fontSize: 13 }}
          onClick={() => nav("/")}
        >
          Back to home
        </button>
      </div>
    </div>
  );
}
