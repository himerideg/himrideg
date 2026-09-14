import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
// Phase 4: HomeBookRide is lazy-loaded below so Leaflet is not in first paint.

/*
|--------------------------------------------------------------------------
| Phase 4 — Lazy Home Booking Map
|--------------------------------------------------------------------------
| HomeBookRide imports Leaflet. Loading it only when Book Ride opens keeps
| the public landing page lighter without changing booking behavior.
*/
const HomeBookRide = React.lazy(
  () => import("../components/HomeBookRide")
);

function getSavedHomeLanguage() {
  const saved = String(localStorage.getItem("himrideg_home_language") || "en");
  return saved === "hi" ? "hi" : "en";
}

function Home({
  onLogin,
  onRegister,
  onDriverLogin,
  onAdminLogin
}) {
  const [bookRideOpen, setBookRideOpen] = useState(false);
  const [language, setLanguage] = useState(getSavedHomeLanguage);

  useEffect(() => {
    document.documentElement.lang = language === "hi" ? "hi" : "en";
    localStorage.setItem("himrideg_home_language", language);
  }, [language]);

  /*
  |--------------------------------------------------------------------------
  | Shared Hindi / English state — layout untouched
  |--------------------------------------------------------------------------
  | The global language control is fixed-position and does not participate in
  | Home layout. Home only listens for the shared selection so its existing
  | sections can switch copy without adding/removing any visual blocks.
  */
  useEffect(() => {
    const syncLanguage = (event) => {
      const next = event?.detail?.language === "hi" ? "hi" : "en";
      setLanguage(next);
    };

    const syncStoredLanguage = () => {
      setLanguage(getSavedHomeLanguage());
    };

    window.addEventListener("himrideg:language-change", syncLanguage);
    window.addEventListener("storage", syncStoredLanguage);

    return () => {
      window.removeEventListener("himrideg:language-change", syncLanguage);
      window.removeEventListener("storage", syncStoredLanguage);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Driver Login
  |--------------------------------------------------------------------------
  |
  | App.jsx already sends a dedicated onDriverLogin callback which opens
  | /driverlogin/. Keep the stored account type for existing compatibility,
  | and preserve the dedicated driver callback.
  */
  const openDriverLogin = () => {
    localStorage.setItem(
      "himrideg_auth_account_type",
      "driver"
    );

    if (typeof onDriverLogin === "function") {
      onDriverLogin();
      return;
    }

    onLogin?.();
  };

  /*
  |--------------------------------------------------------------------------
  | Customer Login
  |--------------------------------------------------------------------------
  */
  const openCustomerLogin = () => {
    localStorage.setItem(
      "himrideg_auth_account_type",
      "customer"
    );

    onLogin?.();
  };

  /*
  |--------------------------------------------------------------------------
  | Admin Login
  |--------------------------------------------------------------------------
  */
  const openAdminLogin = () => {
    localStorage.setItem(
      "himrideg_auth_account_type",
      "admin"
    );

    if (typeof onAdminLogin === "function") {
      onAdminLogin();
      return;
    }

    onLogin?.();
  };

  /*
  | V82 compatibility anchor. The global fixed language switch is the visible
  | control; this function remains intentionally layout-neutral.
  */
  const toggleLanguage = () => {
    setLanguage((current) => current === "en" ? "hi" : "en");
  };

  void toggleLanguage;

  /*
  |--------------------------------------------------------------------------
  | Home Booking Screen
  |--------------------------------------------------------------------------
  */
  if (bookRideOpen) {
    return (
      <HomeBookRide
        onBack={() => setBookRideOpen(false)}
        onContinue={openCustomerLogin}
        language={language}
      />
    );
  }

  return (
    <div className="homePage">
      <Navbar
        onLogin={openCustomerLogin}
        onRegister={onRegister}
        onBookRide={() => setBookRideOpen(true)}
        onDriverLogin={openDriverLogin}
        onAdminLogin={openAdminLogin}
        language={language}
      />

      <main>
        <Hero
          onBookRide={() => setBookRideOpen(true)}
          language={language}
        />

        <Features language={language} />
      </main>

      <Footer language={language} />
    </div>
  );
}

export default Home;
