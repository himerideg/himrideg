import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
import HomeBookRide from "../components/HomeBookRide";

function Home({ onLogin, onRegister }) {
  const [bookRideOpen, setBookRideOpen] = useState(false);

  const openDriverLogin = () => {
    localStorage.setItem("himrideg_auth_account_type", "driver");
    onLogin?.();
  };

  const openCustomerLogin = () => {
    localStorage.setItem("himrideg_auth_account_type", "customer");
    onLogin?.();
  };

  const openAdminLogin = () => {
    localStorage.setItem("himrideg_auth_account_type", "admin");
    onLogin?.();
  };

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
        onLogin={onLogin}
        onRegister={onRegister}
        onBookRide={() => setBookRideOpen(true)}
        onDriverLogin={openDriverLogin}
        onAdminLogin={openAdminLogin}
      />

      <main>
        <Hero onBookRide={() => setBookRideOpen(true)} />
        <Features />
      </main>

      <Footer />
    </div>
  );
}

export default Home;
