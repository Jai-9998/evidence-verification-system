import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function IssuerDashboard() {
  const nav = useNavigate();
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file || !metadata) {
      setStatus({
        type: "danger",
        msg: "Please select a file and enter metadata.",
      });
      return;
    }
    try {
      setLoading(true);
      const form = new FormData();
      form.append("file", file);
      form.append("metadata", metadata);
      await axios.post("http://localhost:3000/create-evidence", form);
      setStatus({ type: "success", msg: "Evidence uploaded successfully." });
      setFile(null);
      setMetadata("");
    } catch (err) {
      setStatus({ type: "danger", msg: "Upload failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ backgroundColor: "#f0fdf4" }}
    >
      <div
        className="card shadow-sm border-0 p-4"
        style={{ width: "100%", maxWidth: 480 }}
      >
        <div className="mb-4">
          <span className="badge bg-success mb-2">📄 Issuer</span>
          <h4 className="fw-semibold mb-1">Upload evidence</h4>
          <p className="text-muted mb-0" style={{ fontSize: 14 }}>
            Attach a file and provide metadata to issue a new credential.
          </p>
        </div>

        {status && (
          <div
            className={`alert alert-${status.type} py-2`}
            style={{ fontSize: 14 }}
          >
            {status.msg}
          </div>
        )}

        <div className="mb-3">
          <label className="form-label fw-medium">Evidence file</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setStatus(null);
            }}
          />
          {file && (
            <small className="text-muted mt-1 d-block">
              Selected: {file.name}
            </small>
          )}
        </div>

        <div className="mb-4">
          <label className="form-label fw-medium">Metadata</label>
          <input
            className="form-control"
            placeholder="e.g. Case ID, description, date..."
            value={metadata}
            onChange={(e) => {
              setMetadata(e.target.value);
              setStatus(null);
            }}
          />
        </div>

        <button
          className="btn btn-success w-100 fw-medium"
          onClick={upload}
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              />
              Uploading...
            </>
          ) : (
            "Upload evidence"
          )}
        </button>

        <button
          className="btn btn-link text-muted mt-2 w-100"
          style={{ fontSize: 13 }}
          onClick={() => nav("/")}
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}
