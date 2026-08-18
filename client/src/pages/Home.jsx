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

  const openCustomerLogin = () => {
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
        onDriverLogin={onDriverLogin}
        onAdminLogin={onAdminLogin}
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
