import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function IssuerLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (email === "issuer@gmail.com" && pass === "123") {
      nav("/issuer-dashboard");
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ backgroundColor: "#f0fdf4" }}
    >
      <div
        className="card shadow-sm border-0 p-4"
        style={{ width: "100%", maxWidth: 420 }}
      >
        <div className="mb-4">
          <span className="badge bg-success mb-2">📄 Issuer</span>
          <h4 className="fw-semibold mb-1">Issuer login</h4>
          <p className="text-muted mb-0" style={{ fontSize: 14 }}>
            Sign in to manage document credentials.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger py-2" style={{ fontSize: 14 }}>
            {error}
          </div>
        )}

        <div className="mb-3">
          <label className="form-label fw-medium">Email</label>
          <input
            className="form-control"
            placeholder="issuer@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-medium">Password</label>
          <input
            className="form-control"
            type="password"
            placeholder="Enter your password"
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <button
          className="btn btn-success w-100 fw-medium"
          onClick={handleLogin}
        >
          Sign in
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
