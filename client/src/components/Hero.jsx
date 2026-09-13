import api from "../api";
import React, { useEffect, useState } from "react";
import TaxiAnimation from "./TaxiAnimation";
import HomeQuickBook from "./HomeQuickBook";
import "../hero.css";

function fmtStat(val) {
  if (!val) return "—";
  return String(val);
}

const COPY = {
  en: {
    tag: "AAPKI APNI RIDE",
    title: "Travel With Us",
    description:
      "Verified drivers, transparent fares and live tracking for safe local and outstation taxi booking.",
    verified: "Verified Drivers",
    fare: "Transparent Fares",
    tracking: "Live Ride Tracking",
    book: "Book a Ride",
    booking: "BOOK YOUR RIDE",
    ready: "Ready to travel?",
    full: "Open Book Ride",
    riders: "Happy Riders",
    drivers: "Verified Drivers",
    support: "Customer Support"
  },
  hi: {
    tag: "आपकी अपनी RIDE",
    title: "हमारे साथ सफर करें",
    description:
      "Safe local और outstation taxi booking के लिए verified drivers, transparent fares और live tracking.",
    verified: "Verified Drivers",
    fare: "Transparent Fares",
    tracking: "Live Ride Tracking",
    book: "Ride Book करें",
    booking: "अपनी RIDE BOOK करें",
    ready: "सफर के लिए तैयार?",
    full: "Full Booking खोलें",
    riders: "Happy Riders",
    drivers: "Verified Drivers",
    support: "Customer Support"
  }
};

function Hero({ onBookRide, language = "en" }) {
  const [stats, setStats] = useState({ customers: "...", drivers: "..." });
  const t = COPY[language] || COPY.en;

  useEffect(() => {
    api.get("/auth/stats")
      .then(({ data }) => {
        if (data?.success && data?.data) {
          setStats({
            customers: fmtStat(data.data.customers),
            drivers: fmtStat(data.data.drivers)
          });
        }
      })
      .catch(() => setStats({ customers: "—", drivers: "—" }));
  }, []);

  return (
    <section className="hrHero" id="home">
      <div className="hrHeroOverlay" />
      <TaxiAnimation />

      <div className="hrHeroContainer">
        <div className="hrHeroContent">
          <span className="hrHeroTag">{t.tag}</span>

          <h1 className="hrHeroTitle">
            HimRideG
            <span>{t.title}</span>
          </h1>

          <p className="hrHeroDescription">{t.description}</p>

          <div className="hrHeroBenefits">
            <span>✓ {t.verified}</span>
            <span>✓ {t.fare}</span>
            <span>✓ {t.tracking}</span>
          </div>

          <div className="hrHeroActions">
            <button
              type="button"
              className="hrPrimaryButton"
              onClick={onBookRide}
            >
              {t.book}
              <strong>→</strong>
            </button>
          </div>
        </div>

        <div className="hrBookingColumn">
          <div className="hrBookingCard">
            <div className="hrBookingHeader">
              <div>
                <span>{t.booking}</span>
                <h2>{t.ready}</h2>
              </div>
              <img
                src="/himrideg-logo.webp"
                alt="HimRideG logo"
                className="hrBookingLogo"
              />
            </div>

            <HomeQuickBook
              onBookRide={onBookRide}
              language={language}
            />

            <button
              className="hrFareButton"
              type="button"
              onClick={onBookRide}
            >
              <span>{t.full}</span>
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
            <span>{t.riders}</span>
          </div>
        </div>

        <div className="hrStat">
          <div className="hrStatIcon">🚖</div>
          <div>
            <strong>{stats.drivers}</strong>
            <span>{t.drivers}</span>
          </div>
        </div>

        <div className="hrStat">
          <div className="hrStatIcon">🎧</div>
          <div>
            <strong>24×7</strong>
            <span>{t.support}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
