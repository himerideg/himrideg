import React, { useEffect, useState } from "react";
import TaxiAnimation from "./TaxiAnimation";
import "../hero.css";

function fmtStat(val) {
  if (!val) return "—";
  return String(val);
}

function Hero({ onBookRide }) {
  const [stats, setStats] = useState({ customers: "...", drivers: "..." });

  useEffect(() => {
    fetch("/api/v2/auth/stats")
      .then(r => r.json())
      .then(d => {
        if (d?.success && d?.data) {
          setStats({
            customers: fmtStat(d.data.customers),
            drivers: fmtStat(d.data.drivers)
          });
        }
      })
      .catch(() => setStats({ customers: "500+", drivers: "100+" }));
  }, []);

  return (
    <section className="hrHero" id="home">
      <div className="hrHeroOverlay" />
      <TaxiAnimation />

      <div className="hrHeroContainer">
        <div className="hrHeroContent">
          <span className="hrHeroTag">AAPKI APNI RIDE</span>

          <h1 className="hrHeroTitle">
            HimRideG
            <span>Travel With Us</span>
          </h1>

          <p className="hrHeroDescription">
            Verified drivers, transparent fares and live
            tracking for safe local and outstation taxi booking.
          </p>

          <div className="hrHeroBenefits">
            <span>✓ Verified Drivers</span>
            <span>✓ Transparent Fares</span>
            <span>✓ Live Ride Tracking</span>
          </div>

          <div className="hrHeroActions">
            <button
              type="button"
              className="hrPrimaryButton"
              onClick={onBookRide}
            >
              Book a Ride
              <strong>→</strong>
            </button>
          </div>
        </div>

        <div className="hrBookingColumn">
          <div className="hrBookingCard">
            <div className="hrBookingHeader">
              <div>
                <span>BOOK YOUR RIDE</span>
                <h2>Ready to travel?</h2>
              </div>
              <img
                src="/himrideg-logo.png"
                alt="HimRideG logo"
                className="hrBookingLogo"
              />
            </div>

            <button
              className="hrFareButton"
              type="button"
              onClick={onBookRide}
            >
              <span>Open Book Ride</span>
              <strong>→</strong>
            </button>
          </div>
        </div>
      </div>

      <div className="hrStatsBar">
        <div className="hrStat">
          <div className="hrStatIcon">👥</div>
          <div>
            <strong>{stats.customers}</strong>
            <span>Happy Riders</span>
          </div>
        </div>

        <div className="hrStat">
          <div className="hrStatIcon">🚖</div>
          <div>
            <strong>{stats.drivers}</strong>
            <span>Verified Drivers</span>
          </div>
        </div>

        <div className="hrStat">
          <div className="hrStatIcon">🎧</div>
          <div>
            <strong>24×7</strong>
            <span>Customer Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
