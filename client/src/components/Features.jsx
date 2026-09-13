import React, { useState } from "react";

const CONTENT = {
  en: {
    features: [
      { icon: "🛡️", title: "Safe Rides", text: "Every ride is with a verified driver. Vehicle documents, license and permit are checked before approval. Your safety is our priority." },
      { icon: "💰", title: "Affordable Fare", text: "Transparent pricing with no hidden charges. Fare is negotiated directly between customer and driver for fair local rates." },
      { icon: "📍", title: "Live Tracking", text: "Track your driver's live location and monitor your ride status in real time throughout your journey." },
      { icon: "📞", title: "24×7 Support", text: "Support for booking, driver or payment related queries. We are here to help anytime you need assistance." }
    ],
    aboutItems: [
      { id: "what", title: "What is HimRideG?", content: "HimRideG is a local ride-hailing platform built specifically for Himachal Pradesh. We connect passengers with verified local taxi drivers for safe and reliable travel across Himachal." },
      { id: "vehicles", title: "Which vehicles are allowed?", content: "Only verified commercial/taxi vehicles with yellow number plates are allowed on HimRideG. HimRideG onboarding checks Vehicle RC, Commercial Permit and Vehicle Photo; drivers must also comply with all applicable transport and legal requirements." },
      { id: "drivers", title: "How are drivers verified?", content: "Every driver must submit their Aadhaar/identity proof, Driving Licence, Vehicle RC, Commercial Permit and Vehicle Photo. All documents are manually reviewed and approved by HimRideG admin before the driver can go online." },
      { id: "safety", title: "How does HimRideG ensure safety?", content: "Every ride includes: verified driver identity, verified vehicle details, live GPS tracking, OTP-verified ride start and complete ride history. Both driver and customer information is verified before any ride begins." },
      { id: "local", title: "Why local drivers?", content: "HimRideG supports local drivers of Himachal Pradesh by giving them a platform to find passengers reliably. Customers get drivers who know local routes, terrain and conditions better than anyone else." },
      { id: "vision", title: "Our Vision", content: "To build a safe, dependable and trusted taxi service network across all districts and remote areas of Himachal Pradesh — connecting every corner of the state with reliable local transportation." }
    ],
    aboutTag: "ABOUT HIMRIDEG",
    aboutTitle: "Know Your Ride Platform",
    aboutText: "Everything you need to know about HimRideG — tap to expand.",
    whyTag: "WHY HIMRIDEG",
    whyTitle: "Safe, Simple and Trusted Local Rides",
    whyText: "Built for the local passengers and drivers of Himachal Pradesh."
  },
  hi: {
    features: [
      { icon: "🛡️", title: "Safe Rides", text: "हर Ride verified driver के साथ होती है। Approval से पहले vehicle documents, licence और permit check किए जाते हैं।" },
      { icon: "💰", title: "Affordable Fare", text: "Hidden charges के बिना transparent pricing। Local rates के लिए customer और driver fare पर सहमति करते हैं।" },
      { icon: "📍", title: "Live Tracking", text: "Journey के दौरान driver की live location और Ride status real time में देखें।" },
      { icon: "📞", title: "24×7 Support", text: "Booking, driver और payment से जुड़े सवालों के लिए support उपलब्ध है।" }
    ],
    aboutItems: [
      { id: "what", title: "HimRideG क्या है?", content: "HimRideG Himachal Pradesh के लिए बनाया गया local ride-hailing platform है, जो passengers को verified local taxi drivers से जोड़ता है।" },
      { id: "vehicles", title: "कौन से vehicles allowed हैं?", content: "HimRideG पर verified commercial/taxi vehicles with yellow number plates allowed हैं। Onboarding में Vehicle RC, Commercial Permit और Vehicle Photo check होते हैं।" },
      { id: "drivers", title: "Drivers verify कैसे होते हैं?", content: "Driver से identity proof, Driving Licence, Vehicle RC, Commercial Permit और Vehicle Photo लिया जाता है। Online होने से पहले admin review और approval होता है।" },
      { id: "safety", title: "HimRideG safety कैसे रखता है?", content: "Verified driver identity, verified vehicle details, live GPS tracking, OTP-verified Ride start और Ride history safety flow का हिस्सा हैं।" },
      { id: "local", title: "Local drivers क्यों?", content: "HimRideG Himachal के local drivers को passengers से जोड़ता है। Local drivers routes, terrain और conditions को बेहतर जानते हैं।" },
      { id: "vision", title: "हमारी Vision", content: "Himachal Pradesh के districts और remote areas में safe, dependable और trusted taxi network बनाना।" }
    ],
    aboutTag: "HIMRIDEG के बारे में",
    aboutTitle: "अपने Ride Platform को जानें",
    aboutText: "HimRideG के बारे में जरूरी जानकारी — देखने के लिए tap करें।",
    whyTag: "WHY HIMRIDEG",
    whyTitle: "Safe, Simple और Trusted Local Rides",
    whyText: "Himachal Pradesh के local passengers और drivers के लिए बनाया गया।"
  }
};

function AboutAccordion({ language = "en" }) {
  const [openId, setOpenId] = useState(null);
  const toggle = (id) => setOpenId(prev => prev === id ? null : id);
  const c = CONTENT[language] || CONTENT.en;

  return (
    <section className="featuresSection aboutSection" id="about" style={{ paddingBottom: "60px" }}>
      <div className="sectionHeading">
        <span>{c.aboutTag}</span>
        <h2>{c.aboutTitle}</h2>
        <p>{c.aboutText}</p>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto 48px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {c.aboutItems.map(item => (
          <div key={item.id} className="aboutAccordionItem" data-open={openId === item.id ? "true" : "false"} style={{ background: openId === item.id ? "rgba(245,197,24,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${openId === item.id ? "rgba(245,197,24,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: "12px", overflow: "hidden", transition: "all 0.2s" }}>
            <button className="aboutAccordionQuestion" type="button" aria-expanded={openId === item.id} aria-controls={`about-answer-${item.id}`} onClick={() => toggle(item.id)} style={{ width: "100%", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: openId === item.id ? "#f5c518" : "#fff", fontWeight: "600", fontSize: "15px", textAlign: "left" }}>
              {item.title}
              <span style={{ fontSize: "20px", transition: "transform 0.2s", transform: openId === item.id ? "rotate(45deg)" : "none", color: "#f5c518" }}>+</span>
            </button>
            {openId === item.id && (
              <div id={`about-answer-${item.id}`} className="aboutAccordionAnswer" style={{ padding: "0 20px 16px", color: "#aaa", fontSize: "14px", lineHeight: 1.7 }}>
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sectionHeading" style={{ marginTop: "48px" }}>
        <span>{c.whyTag}</span>
        <h2>{c.whyTitle}</h2>
        <p>{c.whyText}</p>
      </div>

      <div className="featureGrid">
        {c.features.map((feature) => (
          <article className="featureCard" key={feature.title}>
            <div className="featureIcon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AboutAccordion;
