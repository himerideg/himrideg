import React from "react";
import "../home-growth.css";

const COPY = {
  en: {
    recentEyebrow: "YOUR RIDES",
    recentTitle: "Pick up where you left off",
    recentText: "Sign in to view your recent bookings, active Ride and payment status across your devices.",
    recentButton: "View recent activity",
    servicesEyebrow: "EXPLORE SERVICES",
    servicesTitle: "A HimRideG Ride for every plan",
    servicesText: "Book local travel, outstation trips, airport transfers or a scheduled Ride from the same trusted flow.",
    serviceCards: [
      ["🚕", "Local Ride", "Fast local taxi booking with verified commercial drivers."],
      ["🏔️", "Outstation", "Plan intercity and long-distance travel across Himachal and nearby states."],
      ["✈️", "Airport Transfer", "Pre-plan airport pickup or drop with your trip details saved."],
      ["🗓️", "Scheduled Ride", "Choose a future date and time instead of booking immediately."]
    ],
    book: "Book now",
    driverEyebrow: "DRIVE WITH HIMRIDEG",
    driverTitle: "Drive on your schedule. Earn with local riders.",
    driverText: "HimRideG connects eligible commercial taxi drivers with customers while keeping Ride, fare, payment and history tools in one account.",
    driverButton: "Become a Driver",
    driverLogin: "Driver Login",
    exploreEyebrow: "EXPLORE HIMACHAL",
    exploreTitle: "Plan your next Himachal journey",
    exploreText: "Use these popular regions as inspiration, then choose your exact pickup and destination in Book Ride.",
    coverageEyebrow: "COVERAGE",
    coverageTitle: "Built for Himachal, expanding district by district",
    coverageText: "Availability depends on verified drivers being online near your pickup. Coverage grows as more local commercial taxis join.",
    businessEyebrow: "HIMRIDEG FOR BUSINESS",
    businessTitle: "Reliable travel workflows for business and travel partners",
    businessText: "Use structured Ride records and verified-driver flows for business travel. Dedicated business tools can expand as the network grows.",
    businessButton: "Explore Business",
    appEyebrow: "HIMRIDEG APP",
    appTitle: "Take HimRideG with you",
    appText: "Use the same account and shared Ride data across web and mobile. Store download links appear here as soon as the public apps are published.",
    android: "Android App",
    ios: "iPhone App",
    available: "Open download",
    soon: "Public download coming soon"
  },
  hi: {
    recentEyebrow: "आपकी RIDES",
    recentTitle: "जहाँ छोड़ा था वहीं से आगे बढ़ें",
    recentText: "अपनी recent bookings, active Ride और payment status सभी devices पर देखने के लिए login करें।",
    recentButton: "Recent activity देखें",
    servicesEyebrow: "SERVICES",
    servicesTitle: "हर plan के लिए HimRideG Ride",
    servicesText: "Local travel, outstation, airport transfer या scheduled Ride एक ही trusted flow से book करें।",
    serviceCards: [
      ["🚕", "Local Ride", "Verified commercial drivers के साथ local taxi booking."],
      ["🏔️", "Outstation", "Himachal और nearby states के लिए intercity और long-distance travel."],
      ["✈️", "Airport Transfer", "Airport pickup या drop को पहले से plan करें."],
      ["🗓️", "Scheduled Ride", "तुरंत booking की जगह future date और time चुनें."]
    ],
    book: "Book करें",
    driverEyebrow: "HIMRIDEG के साथ DRIVE करें",
    driverTitle: "अपने schedule पर drive करें और local riders से कमाएँ",
    driverText: "HimRideG eligible commercial taxi drivers को customers से जोड़ता है और Ride, fare, payment तथा history tools एक account में रखता है।",
    driverButton: "Driver बनें",
    driverLogin: "Driver Login",
    exploreEyebrow: "HIMACHAL EXPLORE करें",
    exploreTitle: "अपनी अगली Himachal journey plan करें",
    exploreText: "इन popular regions से idea लें और Book Ride में exact pickup तथा destination चुनें।",
    coverageEyebrow: "COVERAGE",
    coverageTitle: "Himachal के लिए बना, district by district बढ़ रहा है",
    coverageText: "Availability आपके pickup के पास online verified drivers पर depend करती है। जैसे-जैसे local commercial taxis जुड़ेंगी coverage बढ़ेगी।",
    businessEyebrow: "HIMRIDEG FOR BUSINESS",
    businessTitle: "Business और travel partners के लिए reliable travel workflows",
    businessText: "Business travel के लिए structured Ride records और verified-driver flow इस्तेमाल करें। Network बढ़ने के साथ dedicated business tools भी बढ़ेंगे।",
    businessButton: "Business देखें",
    appEyebrow: "HIMRIDEG APP",
    appTitle: "HimRideG अपने साथ रखें",
    appText: "Web और mobile पर वही account और shared Ride data इस्तेमाल करें। Public apps publish होते ही store download links यहाँ दिखेंगे।",
    android: "Android App",
    ios: "iPhone App",
    available: "Download खोलें",
    soon: "Public download जल्द आएगा"
  }
};

const DESTINATIONS = [
  ["Palampur", "Tea gardens • Kangra Valley"],
  ["Dharamshala", "City • McLeod Ganj access"],
  ["Bir Billing", "Paragliding • Mountain travel"],
  ["Manali", "Valley • Snow routes"],
  ["Shimla", "Capital • Hill travel"],
  ["Dalhousie", "Chamba hills • Scenic routes"]
];

const COVERAGE = ["Kangra", "Palampur", "Dharamshala", "Hamirpur", "Mandi", "Shimla", "Kullu", "Chamba"];

function StoreCard({ icon, title, url, t }) {
  const available = Boolean(String(url || "").trim());
  const content = (
    <>
      <div className="homeStoreIcon" aria-hidden="true">{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{available ? t.available : t.soon}</span>
      </div>
      <b aria-hidden="true">{available ? "↗" : "…"}</b>
    </>
  );

  if (available) {
    return (
      <a className="homeStoreCard" href={url} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return <div className="homeStoreCard isSoon">{content}</div>;
}

function HomeGrowthSections({
  language = "en",
  onBookRide,
  onScheduledRide,
  onRecentRide,
  onDriverLogin
}) {
  const t = COPY[language] || COPY.en;
  const androidUrl = import.meta.env.VITE_ANDROID_APP_URL || "";
  const iosUrl = import.meta.env.VITE_IOS_APP_URL || "";

  return (
    <div className="homeGrowthRoot">
      <section className="homeGrowthSection homeRecentSection" aria-labelledby="home-recent-title">
        <div className="homeRecentIcon" aria-hidden="true">↻</div>
        <div className="homeRecentCopy">
          <span className="homeGrowthEyebrow">{t.recentEyebrow}</span>
          <h2 id="home-recent-title">{t.recentTitle}</h2>
          <p>{t.recentText}</p>
        </div>
        <button type="button" className="homeOutlineButton" onClick={onRecentRide}>
          {t.recentButton} →
        </button>
      </section>

      <section className="homeGrowthSection" id="services" aria-labelledby="home-services-title">
        <div className="homeGrowthHeading">
          <span className="homeGrowthEyebrow">{t.servicesEyebrow}</span>
          <h2 id="home-services-title">{t.servicesTitle}</h2>
          <p>{t.servicesText}</p>
        </div>
        <div className="homeServiceGrid">
          {t.serviceCards.map(([icon, title, text], index) => (
            <article className="homeServiceCard" key={title}>
              <div className="homeServiceIcon" aria-hidden="true">{icon}</div>
              <h3>{title}</h3>
              <p>{text}</p>
              <button
                type="button"
                onClick={index === 3 ? onScheduledRide : onBookRide}
              >
                {t.book} <span>→</span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="homeGrowthSection homeDriverSection" aria-labelledby="home-driver-title">
        <div className="homeDriverVisual" aria-hidden="true">
          <span>🚕</span>
          <b>HimRideG Driver</b>
        </div>
        <div className="homeDriverCopy">
          <span className="homeGrowthEyebrow">{t.driverEyebrow}</span>
          <h2 id="home-driver-title">{t.driverTitle}</h2>
          <p>{t.driverText}</p>
          <div className="homeDriverActions">
            <button type="button" className="homePrimaryButton" onClick={onDriverLogin}>
              {t.driverButton} →
            </button>
            <button type="button" className="homeTextButton" onClick={onDriverLogin}>
              {t.driverLogin}
            </button>
          </div>
        </div>
      </section>

      <section className="homeGrowthSection" id="explore-himachal" aria-labelledby="home-explore-title">
        <div className="homeGrowthHeading">
          <span className="homeGrowthEyebrow">{t.exploreEyebrow}</span>
          <h2 id="home-explore-title">{t.exploreTitle}</h2>
          <p>{t.exploreText}</p>
        </div>
        <div className="homeDestinationGrid">
          {DESTINATIONS.map(([name, subtitle]) => (
            <button type="button" className="homeDestinationCard" key={name} onClick={onBookRide}>
              <span className="homeDestinationPin" aria-hidden="true">⌖</span>
              <strong>{name}</strong>
              <small>{subtitle}</small>
              <b aria-hidden="true">→</b>
            </button>
          ))}
        </div>
      </section>

      <section className="homeGrowthSection homeCoverageSection" aria-labelledby="home-coverage-title">
        <div className="homeGrowthHeading compact">
          <span className="homeGrowthEyebrow">{t.coverageEyebrow}</span>
          <h2 id="home-coverage-title">{t.coverageTitle}</h2>
          <p>{t.coverageText}</p>
        </div>
        <div className="homeCoverageChips" aria-label="Himachal coverage regions">
          {COVERAGE.map((place) => <span key={place}>✓ {place}</span>)}
        </div>
      </section>

      <section className="homeGrowthSection homeBusinessSection" aria-labelledby="home-business-title">
        <div>
          <span className="homeGrowthEyebrow">{t.businessEyebrow}</span>
          <h2 id="home-business-title">{t.businessTitle}</h2>
          <p>{t.businessText}</p>
          <a className="homePrimaryButton asLink" href="/business/">{t.businessButton} →</a>
        </div>
        <div className="homeBusinessStats" aria-hidden="true">
          <span><b>01</b> Verified commercial drivers</span>
          <span><b>02</b> Shared Ride records</span>
          <span><b>03</b> Local + outstation travel</span>
        </div>
      </section>

      <section className="homeGrowthSection homeAppSection" aria-labelledby="home-app-title">
        <div className="homeAppBrand">
          <img src="/himrideg-logo.webp" alt="HimRideG" />
          <div>
            <span className="homeGrowthEyebrow">{t.appEyebrow}</span>
            <h2 id="home-app-title">{t.appTitle}</h2>
            <p>{t.appText}</p>
          </div>
        </div>
        <div className="homeStoreGrid">
          <StoreCard icon="▶" title={t.android} url={androidUrl} t={t} />
          <StoreCard icon="●" title={t.ios} url={iosUrl} t={t} />
        </div>
      </section>
    </div>
  );
}

export default HomeGrowthSections;
