import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import IssuerLogin from "./pages/IssuerLogin.jsx";
import IssuerDashboard from "./pages/IssuerDashboard.jsx";
import Verify from "./pages/Verify.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/issuer-login" element={<IssuerLogin />} />
      <Route path="/issuer-dashboard" element={<IssuerDashboard />} />
      <Route path="/verify" element={<Verify />} />
    </Routes>
  );
}

export default App;
