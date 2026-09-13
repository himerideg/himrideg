import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HomeGrowthSections from "../components/HomeGrowthSections";
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
  | Driver Login
  |--------------------------------------------------------------------------
  |
  | App.jsx already sends a dedicated onDriverLogin callback which opens
  | /driverlogin/. Earlier Home.jsx was ignoring that prop and was calling
  | the normal customer onLogin callback instead. Because of that the Driver
  | button could open the customer login page.
  |
  | Keep the stored account type for existing compatibility, but use the
  | dedicated driver callback whenever it is available.
  |
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

    // Legacy fallback only. Existing integrations that still pass only
    // onLogin will continue to work instead of breaking.
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
  |
  | Same dedicated-navigation fix as Driver Login. App.jsx already provides
  | onAdminLogin for /adminlogin/, so do not route it through customer login.
  |
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

    // Legacy fallback preserves old Home usage.
    onLogin?.();
  };

  const toggleLanguage = () => {
    setLanguage((current) => current === "en" ? "hi" : "en");
  };

  const openScheduledRide = () => {
    let existing = {};
    try {
      existing = JSON.parse(localStorage.getItem("himrideg_pending_booking") || "{}") || {};
    } catch {
      existing = {};
    }

    localStorage.setItem(
      "himrideg_pending_booking",
      JSON.stringify({
        ...existing,
        bookingMode: "scheduled"
      })
    );

    setBookRideOpen(true);
  };

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
        onLanguageToggle={toggleLanguage}
      />

      <main>
        <Hero
          onBookRide={() => setBookRideOpen(true)}
          language={language}
        />

        <HomeGrowthSections
          language={language}
          onBookRide={() => setBookRideOpen(true)}
          onScheduledRide={openScheduledRide}
          onRecentRide={openCustomerLogin}
          onDriverLogin={openDriverLogin}
        />

        <Features language={language} />
      </main>

      <Footer language={language} />
    </div>
  );
}

export default Home;
