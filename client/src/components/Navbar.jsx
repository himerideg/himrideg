import React from "react";

function Navbar({
  onLogin,
  onRegister,
  onBookRide,
  onDriverLogin,
  onAdminLogin
}) {
  return (
    <header className="siteNavbar">
      <a
        href="#home"
        className="hrgNavbarBrand"
        aria-label="HimRideG Home"
      >
        <img
          src="/himrideg-logo.png"
          alt="HimRideG"
          className="hrgNavbarLogo"
        />

        <div className="hrgNavbarBrandName">
          <span className="hrgBrandWhite">Him</span>
          <span className="hrgBrandGold">Ride</span>
          <span className="hrgBrandWhite">G</span>
        </div>
      </a>

      <nav className="navLinks">
        <a href="#home">Home</a>

        <button
          type="button"
          onClick={onBookRide}
        >
          Book Ride
        </button>

        {/*
        |--------------------------------------------------------------------
        | Dedicated Driver Login
        |--------------------------------------------------------------------
        | This button now clearly says Driver Login and uses only the
        | dedicated onDriverLogin callback supplied by Home/App.
        */}
        <button
          type="button"
          onClick={onDriverLogin}
          title="Driver Login"
          aria-label="Open Driver Login"
        >
          🚕 Driver Login
        </button>

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
        <button
          className="loginButton"
          type="button"
          onClick={onLogin}
        >
          Login
        </button>

        <button
          className="signupButton"
          type="button"
          onClick={onRegister}
        >
          Sign Up
        </button>
      </div>

      {/*
      |--------------------------------------------------------------------
      | Mobile Role Login Actions — ADD-ONLY
      |--------------------------------------------------------------------
      | Desktop navigation already contains Driver/Admin. On screens below
      | 1000px the desktop nav is intentionally hidden, so these dedicated
      | mobile actions keep Driver Login and Admin Login visible in Chrome,
      | Safari and installed web-app/mobile browser views.
      */}
      <div className="mobileRoleActions" aria-label="HimRideG role login links">
        <button
          className="mobileDriverLoginButton"
          type="button"
          onClick={onDriverLogin}
          aria-label="Open Driver Login"
          title="Driver Login"
        >
          <span aria-hidden="true">🚕</span>
          <span>Driver Login</span>
        </button>

        <button
          className="mobileAdminLoginButton"
          type="button"
          onClick={onAdminLogin}
          aria-label="Open Admin Login"
          title="Admin Login"
        >
          <span aria-hidden="true">🔐</span>
          <span>Admin Login</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
