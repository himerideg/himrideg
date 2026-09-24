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
    destinations: [
      ["Palampur", "Tea gardens • Kangra Valley"],
      ["Dharamshala", "City • McLeod Ganj access"],
      ["Bir Billing", "Paragliding • Mountain travel"],
      ["Manali", "Valley • Snow routes"],
      ["Shimla", "Capital • Hill travel"],
      ["Dalhousie", "Chamba hills • Scenic routes"]
    ],
    coverageEyebrow: "COVERAGE",
    coverageTitle: "Built for Himachal, expanding district by district",
    coverageText: "Availability depends on verified drivers being online near your pickup. Coverage grows as more local commercial taxis join.",
    coverage: ["Kangra", "Palampur", "Dharamshala", "Hamirpur", "Mandi", "Shimla", "Kullu", "Chamba"],
    coverageAria: "Himachal coverage regions",
    businessEyebrow: "HIMRIDEG FOR BUSINESS",
    businessTitle: "Reliable travel workflows for business and travel partners",
    businessText: "Use structured Ride records and verified-driver flows for business travel. Dedicated business tools can expand as the network grows.",
    businessButton: "Explore Business",
    businessStats: ["Verified commercial drivers", "Shared Ride records", "Local + outstation travel"],
    appEyebrow: "HIMRIDEG APP",
    appTitle: "Take HimRideG with you",
    appText: "Use the same account and shared Ride data across web and mobile. Store download links appear here as soon as the public apps are published.",
    android: "Android App",
    ios: "iPhone App",
    available: "Open download",
    soon: "Public download coming soon"
  },
  hi: {
    recentEyebrow: "आपकी यात्राएँ",
    recentTitle: "जहाँ छोड़ा था वहीं से आगे बढ़ें",
    recentText: "अपनी हाल की बुकिंग, चल रही यात्रा और भुगतान की स्थिति सभी उपकरणों पर देखने के लिए लॉगिन करें।",
    recentButton: "हाल की गतिविधि देखें",
    servicesEyebrow: "सेवाएँ देखें",
    servicesTitle: "हर योजना के लिए HimRideG यात्रा",
    servicesText: "स्थानीय यात्रा, बाहरी शहर की यात्रा, हवाई अड्डा यात्रा या पहले से तय यात्रा एक ही भरोसेमंद प्रक्रिया से बुक करें।",
    serviceCards: [
      ["🚕", "स्थानीय यात्रा", "सत्यापित व्यावसायिक चालकों के साथ तेज स्थानीय टैक्सी बुकिंग।"],
      ["🏔️", "बाहरी शहर की यात्रा", "हिमाचल और पास के राज्यों में शहरों के बीच तथा लंबी दूरी की यात्रा की योजना बनाएँ।"],
      ["✈️", "हवाई अड्डा यात्रा", "हवाई अड्डे से लेने या छोड़ने की यात्रा पहले से तय करें और यात्रा विवरण सुरक्षित रखें।"],
      ["🗓️", "निर्धारित यात्रा", "तुरंत बुकिंग की जगह भविष्य की तारीख और समय चुनें।"]
    ],
    book: "अभी बुक करें",
    driverEyebrow: "HIMRIDEG के साथ चलाएँ",
    driverTitle: "अपने समय पर गाड़ी चलाएँ और स्थानीय यात्रियों से कमाएँ",
    driverText: "HimRideG पात्र व्यावसायिक टैक्सी चालकों को ग्राहकों से जोड़ता है और यात्रा, किराया, भुगतान तथा इतिहास की सुविधाएँ एक ही खाते में रखता है।",
    driverButton: "चालक बनें",
    driverLogin: "चालक लॉगिन",
    exploreEyebrow: "हिमाचल देखें",
    exploreTitle: "अपनी अगली हिमाचल यात्रा की योजना बनाएँ",
    exploreText: "इन लोकप्रिय क्षेत्रों से विचार लें, फिर यात्रा बुक करते समय अपना सही प्रारंभ स्थान और गंतव्य चुनें।",
    destinations: [
      ["पालमपुर", "चाय बागान • कांगड़ा घाटी"],
      ["धर्मशाला", "शहर • मैक्लोडगंज मार्ग"],
      ["बीर बिलिंग", "पैराग्लाइडिंग • पर्वतीय यात्रा"],
      ["मनाली", "घाटी • बर्फीले मार्ग"],
      ["शिमला", "राजधानी • पहाड़ी यात्रा"],
      ["डलहौजी", "चंबा पहाड़ियाँ • सुंदर मार्ग"]
    ],
    coverageEyebrow: "सेवा क्षेत्र",
    coverageTitle: "हिमाचल के लिए बना, जिला-दर-जिला बढ़ रहा है",
    coverageText: "सेवा की उपलब्धता आपके प्रारंभ स्थान के पास ऑनलाइन सत्यापित चालकों पर निर्भर करती है। अधिक स्थानीय व्यावसायिक टैक्सियों के जुड़ने के साथ सेवा क्षेत्र बढ़ेगा।",
    coverage: ["कांगड़ा", "पालमपुर", "धर्मशाला", "हमीरपुर", "मंडी", "शिमला", "कुल्लू", "चंबा"],
    coverageAria: "हिमाचल सेवा क्षेत्र",
    businessEyebrow: "व्यवसाय के लिए HIMRIDEG",
    businessTitle: "व्यवसाय और यात्रा साझेदारों के लिए भरोसेमंद यात्रा व्यवस्था",
    businessText: "व्यावसायिक यात्रा के लिए व्यवस्थित यात्रा रिकॉर्ड और सत्यापित चालक प्रक्रिया का उपयोग करें। नेटवर्क बढ़ने के साथ विशेष व्यावसायिक सुविधाएँ भी बढ़ाई जा सकती हैं।",
    businessButton: "व्यवसाय सेवा देखें",
    businessStats: ["सत्यापित व्यावसायिक चालक", "साझा यात्रा रिकॉर्ड", "स्थानीय और बाहरी शहर की यात्रा"],
    appEyebrow: "HIMRIDEG ऐप",
    appTitle: "HimRideG को अपने साथ रखें",
    appText: "वेब और मोबाइल पर एक ही खाते और साझा यात्रा जानकारी का उपयोग करें। सार्वजनिक ऐप प्रकाशित होते ही डाउनलोड लिंक यहाँ दिखाई देंगे।",
    android: "Android ऐप",
    ios: "iPhone ऐप",
    available: "डाउनलोड खोलें",
    soon: "सार्वजनिक डाउनलोड जल्द उपलब्ध होगा"
  }
};

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
          <b>HimRideG</b>
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
          {t.destinations.map(([name, subtitle]) => (
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
        <div className="homeCoverageChips" aria-label={t.coverageAria}>
          {t.coverage.map((place) => <span key={place}>✓ {place}</span>)}
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
          {t.businessStats.map((label, index) => (
            <span key={label}><b>0{index + 1}</b> {label}</span>
          ))}
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
