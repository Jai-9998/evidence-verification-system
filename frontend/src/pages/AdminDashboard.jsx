import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
  const nav = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3000/get-all-evidence")
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load evidence records."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: "#eef2ff" }}>
      <div className="container" style={{ maxWidth: 860 }}>
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <span className="badge bg-primary mb-2">Admin</span>
            <h4 className="fw-semibold mb-1">Admin Dashboard</h4>
            <p className="text-muted mb-0" style={{ fontSize: 14 }}>
              All submitted evidence records.
            </p>
          </div>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => nav("/")}
          >
            Back to home
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ fontSize: 14 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted mt-3 mb-0" style={{ fontSize: 14 }}>
              Loading records...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="card border-0 shadow-sm text-center py-5">
            <p className="text-muted mb-0">No evidence records found.</p>
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ fontSize: 13, width: 40 }}>#</th>
                    <th style={{ fontSize: 13, width: 50 }}>ID</th>
                    <th style={{ fontSize: 13, width: 180 }}>Metadata</th>
                    <th style={{ fontSize: 13, width: 160 }}>Owner</th>
                    <th style={{ fontSize: 13, width: 160 }}>Date</th>
                    <th style={{ fontSize: 13, width: 80 }}>IPFS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((e, i) => (
                    <tr key={e.id}>
                      <td className="text-muted" style={{ fontSize: 13 }}>
                        {i + 1}
                      </td>
                      <td style={{ fontSize: 13 }}>
                        <code>{e.id}</code>
                      </td>
                      <td
                        style={{
                          fontSize: 13,
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span title={e.metadataHash}>{e.metadataHash}</span>
                      </td>
                      <td
                        style={{
                          fontSize: 13,
                          maxWidth: 160,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span title={e.owner}>{e.owner}</span>
                      </td>
                      <td className="text-muted" style={{ fontSize: 13 }}>
                        {new Date(Number(e.timestamp) * 1000).toLocaleString()}
                      </td>
                      <td>
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${e.ipfsHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-primary btn-sm"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              className="px-3 py-2 border-top text-muted"
              style={{ fontSize: 12 }}
            >
              {data.length} record{data.length !== 1 ? "s" : ""} found
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
