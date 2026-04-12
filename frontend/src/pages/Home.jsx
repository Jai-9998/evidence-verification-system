import { useNavigate } from "react-router-dom";

const roles = [
  {
    label: "Admin login",
    hint: "Manage users, records & settings",
    route: "/admin-login",
    icon: "🛡️",
    variant: "primary",
  },
  {
    label: "Issuer login",
    hint: "Issue & manage document credentials",
    route: "/issuer-login",
    icon: "📄",
    variant: "success",
  },
];

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div
        className="card shadow-sm border-0 p-4"
        style={{ width: "100%", maxWidth: 420 }}
      >
        <h4 className="fw-semibold mb-1">Evidence Verification</h4>
        <p className="text-muted mb-4" style={{ fontSize: 14 }}>
          Select how you'd like to continue.
        </p>

        <div className="d-flex flex-column gap-2 mb-3">
          {roles.map(({ label, hint, route, icon, variant }) => (
            <button
              key={route}
              onClick={() => nav(route)}
              className={`btn btn-outline-${variant} d-flex justify-content-between align-items-center py-3 px-3 text-start`}
            >
              <div className="d-flex align-items-center gap-2">
                <span>{icon}</span>
                <div>
                  <div className="fw-medium">{label}</div>
                  <small className="opacity-75">{hint}</small>
                </div>
              </div>
              <span>›</span>
            </button>
          ))}
        </div>

        <hr className="text-muted" />

        <button
          onClick={() => nav("/verify")}
          className="btn btn-warning w-100 fw-medium"
        >
          🔍 Verify a document
        </button>
      </div>
    </div>
  );
}
