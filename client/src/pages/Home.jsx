import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
import HomeBookRide from "../components/HomeBookRide";

function Home({
  onLogin,
  onRegister,
  onDriverLogin,
  onAdminLogin
}) {
  const [bookRideOpen, setBookRideOpen] = useState(false);

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
      />

      <main>
        <Hero
          onBookRide={() => setBookRideOpen(true)}
        />
        <Features />
      </main>

      <Footer />
    </div>
  );
}

export default Home;
