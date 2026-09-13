import React from "react";

const COPY = {
  en: {
    home: "Home",
    services: "Services",
    book: "Book Ride",
    driver: "Driver Login",
    about: "About",
    business: "Business",
    help: "Help",
    admin: "Admin",
    login: "Login",
    signup: "Sign Up",
    more: "More",
    language: "हिंदी",
    driverTitle: "Driver Login",
    driverAria: "Open Driver Login",
    adminTitle: "Admin Login",
    adminAria: "Open Admin Login",
    languageAria: "Switch to Hindi",
    navAria: "Mobile HimRideG navigation",
    moreAria: "Open more navigation options"
  },
  hi: {
    home: "मुखपृष्ठ",
    services: "सेवाएँ",
    book: "यात्रा बुक करें",
    driver: "चालक लॉगिन",
    about: "हमारे बारे में",
    business: "व्यवसाय",
    help: "सहायता",
    admin: "प्रशासन",
    login: "लॉगिन",
    signup: "खाता बनाएँ",
    more: "अधिक",
    language: "English",
    driverTitle: "चालक लॉगिन",
    driverAria: "चालक लॉगिन खोलें",
    adminTitle: "प्रशासन लॉगिन",
    adminAria: "प्रशासन लॉगिन खोलें",
    languageAria: "अंग्रेज़ी में बदलें",
    navAria: "मोबाइल HimRideG नेविगेशन",
    moreAria: "अधिक विकल्प खोलें"
  }
};

function Navbar({
  onLogin,
  onRegister,
  onBookRide,
  onDriverLogin,
  onAdminLogin,
  language = "en",
  onLanguageToggle
}) {
  const t = COPY[language] || COPY.en;

  return (
    <header className="siteNavbar">
      <a
        href="#home"
        className="hrgNavbarBrand"
        aria-label="HimRideG Home"
      >
        <img
          src="/himrideg-logo.webp"
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
        <a href="#home">{t.home}</a>
        <a href="#services">{t.services}</a>

        <button type="button" onClick={onBookRide}>
          {t.book}
        </button>

        <button
          type="button"
          onClick={onDriverLogin}
          title={t.driverTitle}
          aria-label={t.driverAria}
        >
          🚕 {t.driver}
        </button>

        <a href="/business/">{t.business}</a>
        <a href="#about">{t.about}</a>

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
          title={t.adminTitle}
          aria-label={t.adminAria}
        >
          🔐 {t.admin}
        </button>

        <a href="#help">{t.help}</a>
      </nav>

      <div className="navActions">
        <button
          type="button"
          className="homeLanguageButton"
          onClick={onLanguageToggle}
          aria-label={t.languageAria}
          title={t.languageAria}
        >
          🌐 {t.language}
        </button>

        <button className="loginButton" type="button" onClick={onLogin}>
          {t.login}
        </button>

        <button className="signupButton" type="button" onClick={onRegister}>
          {t.signup}
        </button>
      </div>

      <nav className="mobileNavLinks" aria-label={t.navAria}>
        <a href="#home" className="mobileNavDirectItem">
          {t.home}
        </a>

        <button
          type="button"
          className="mobileNavDirectItem"
          onClick={onBookRide}
        >
          {t.book}
        </button>

        <button
          type="button"
          className="mobileNavDirectItem mobileDriverNavItem"
          onClick={onDriverLogin}
          title={t.driverTitle}
          aria-label={t.driverAria}
        >
          <span aria-hidden="true">🚕</span>
          <span>{t.driver}</span>
        </button>

        <details className="mobileMoreMenu">
          <summary aria-label={t.moreAria}>
            {t.more}
            <span className="mobileMoreChevron" aria-hidden="true">▾</span>
          </summary>

          <div className="mobileMoreDropdown">
            <a href="#services">{t.services}</a>
            <a href="/business/">{t.business}</a>
            <a href="#about">{t.about}</a>

            <button
              type="button"
              onClick={onLanguageToggle}
              title={t.languageAria}
              aria-label={t.languageAria}
            >
              <span aria-hidden="true">🌐</span>
              <span>{t.language}</span>
            </button>

            <button
              type="button"
              onClick={onAdminLogin}
              title={t.adminTitle}
              aria-label={t.adminAria}
            >
              <span aria-hidden="true">🔐</span>
              <span>{t.adminTitle}</span>
            </button>

            <a href="#help">{t.help}</a>
          </div>
        </details>
      </nav>
    </header>
  );
}

export default Navbar;
