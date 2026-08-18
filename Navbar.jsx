import React from "react";

function Navbar({ onLogin, onRegister, onBookRide, onDriverLogin, onAdminLogin }) {
  return (
    <header className="siteNavbar">
      <a href="#home" className="hrgNavbarBrand" aria-label="HimRideG Home">
        <img src="/himrideg-logo.png" alt="HimRideG" className="hrgNavbarLogo" />
        <div className="hrgNavbarBrandName">
          <span className="hrgBrandWhite">Him</span>
          <span className="hrgBrandGold">Ride</span>
          <span className="hrgBrandWhite">G</span>
        </div>
      </a>

      <nav className="navLinks">
        <a href="#home">Home</a>
        <button type="button" onClick={onBookRide}>Book Ride</button>
        <button type="button" onClick={onDriverLogin}>Driver</button>
        <a href="#about">About</a>
        <button
          type="button"
          onClick={onAdminLogin}
          style={{
            background: "rgba(245,197,24,0.08)",
            border: "1px solid rgba(245,197,24,0.3)",
            color: "#f5c518",
            borderRadius: "8px",
            padding: "6px 14px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px"
          }}
          title="Admin Login"
        >
          🔐 Admin
        </button>
        <a href="#help">Help</a>
      </nav>

      <div className="navActions">
        <button className="loginButton" type="button" onClick={onLogin}>Login</button>
        <button className="signupButton" type="button" onClick={onRegister}>Sign Up</button>
      </div>
    </header>
  );
}

export default Navbar;
