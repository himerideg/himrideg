import React, { useState } from "react";
import api from "../api";
import "../admin-login-page.css";

function getResponseData(response) {
  return response?.data?.data || response?.data || {};
}

function AdminLoginPage({ onSuccess, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setMessage("Valid admin email enter karo.");
      return;
    }

    if (String(password || "").length < 6) {
      setMessage("Admin password kam se kam 6 characters ka hona chahiye.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await api.post("/admin/login", {
        email: cleanEmail,
        password
      });

      const data = getResponseData(response);
      const accessToken = data?.accessToken || data?.token;
      const adminUser = data?.user || data?.admin;

      if (!accessToken || !adminUser) {
        throw new Error("Admin login response incomplete hai.");
      }

      if (adminUser.role !== "admin") {
        throw new Error("Ye Admin account nahi hai.");
      }

      if (onSuccess) {
        onSuccess({
          ...data,
          accessToken,
          user: adminUser,
          accountType: "admin"
        });
      }
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Admin login nahi ho paya."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="adminLoginPage">
      <section className="adminLoginShell">
        <button type="button" className="adminLoginBrand" onClick={onBack}>
          <img src="/himrideg-logo.png" alt="HimRideG" />
          <span>HimRide<span>G</span> Admin</span>
        </button>

        <div className="adminLoginShield">🛡️</div>
        <p className="adminLoginEyebrow">SECURE ADMINISTRATION</p>
        <h1>Admin Login</h1>
        <p className="adminLoginSubtitle">
          Authorized HimRideG administrators only
        </p>

        <form onSubmit={handleSubmit} className="adminLoginForm">
          {message && <div className="adminLoginError">{message}</div>}

          <label>
            <span>Admin Email <b>*</b></span>
            <input
              type="email"
              autoComplete="email"
              placeholder="Enter admin email"
              value={email}
              disabled={loading}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Password <b>*</b></span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Enter admin password"
              value={password}
              disabled={loading}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button type="submit" className="adminLoginPrimary" disabled={loading}>
            {loading ? "Signing in..." : "Login to Admin Panel →"}
          </button>
        </form>

        <button type="button" className="adminBackWebsite" onClick={onBack}>
          ← Back to www.himrideg.com
        </button>

        <footer>
          HimRideG protected management access • Customer login is separate
        </footer>
      </section>
    </main>
  );
}

export default AdminLoginPage;
