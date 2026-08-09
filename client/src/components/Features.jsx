import React, { useState } from "react";

const features = [
  {
    icon: "🛡️",
    title: "Safe Rides",
    text: "Every ride is with a verified driver. Vehicle documents, license and permit are checked before approval. Your safety is our priority."
  },
  {
    icon: "💰",
    title: "Affordable Fare",
    text: "Transparent pricing with no hidden charges. Fare is negotiated directly between customer and driver for fair local rates."
  },
  {
    icon: "📍",
    title: "Live Tracking",
    text: "Track your driver's live location and monitor your ride status in real time throughout your journey."
  },
  {
    icon: "📞",
    title: "24×7 Support",
    text: "Support for booking, driver or payment related queries. We are here to help anytime you need assistance."
  }
];

const aboutItems = [
  {
    id: "what",
    title: "What is HimRideG?",
    content: "HimRideG is a local ride-hailing platform built specifically for Himachal Pradesh. We connect passengers with verified local taxi drivers for safe and reliable travel across Himachal."
  },
  {
    id: "vehicles",
    title: "Which vehicles are allowed?",
    content: "Only verified commercial/taxi vehicles with yellow number plates are allowed on HimRideG. Every vehicle must have valid RC, permit, insurance and fitness certificate."
  },
  {
    id: "drivers",
    title: "How are drivers verified?",
    content: "Every driver must submit their Aadhaar/identity proof, Driving Licence, Vehicle RC, Commercial Permit and Vehicle Photo. All documents are manually reviewed and approved by HimRideG admin before the driver can go online."
  },
  {
    id: "safety",
    title: "How does HimRideG ensure safety?",
    content: "Every ride includes: verified driver identity, verified vehicle details, live GPS tracking, OTP-verified ride start and complete ride history. Both driver and customer information is verified before any ride begins."
  },
  {
    id: "local",
    title: "Why local drivers?",
    content: "HimRideG supports local drivers of Himachal Pradesh by giving them a platform to find passengers reliably. Customers get drivers who know local routes, terrain and conditions better than anyone else."
  },
  {
    id: "vision",
    title: "Our Vision",
    content: "To build a safe, dependable and trusted taxi service network across all districts and remote areas of Himachal Pradesh — connecting every corner of the state with reliable local transportation."
  }
];

function AboutAccordion() {
  const [openId, setOpenId] = useState(null);
  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  return (
    <section className="featuresSection aboutSection" id="about" style={{ paddingBottom: "60px" }}>
      <div className="sectionHeading">
        <span>ABOUT HIMRIDEG</span>
        <h2>Know Your Ride Platform</h2>
        <p>Everything you need to know about HimRideG — tap to expand.</p>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto 48px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {aboutItems.map(item => (
          <div key={item.id}
            style={{
              background: openId === item.id ? "rgba(245,197,24,0.07)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${openId === item.id ? "rgba(245,197,24,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "12px", overflow: "hidden", transition: "all 0.2s"
            }}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              style={{
                width: "100%", padding: "16px 20px", display: "flex",
                justifyContent: "space-between", alignItems: "center",
                background: "none", border: "none", cursor: "pointer",
                color: openId === item.id ? "#f5c518" : "#fff",
                fontWeight: "600", fontSize: "15px", textAlign: "left"
              }}>
              {item.title}
              <span style={{ fontSize: "20px", transition: "transform 0.2s", transform: openId === item.id ? "rotate(45deg)" : "none", color: "#f5c518" }}>+</span>
            </button>
            {openId === item.id && (
              <div style={{ padding: "0 20px 16px", color: "#aaa", fontSize: "14px", lineHeight: 1.7 }}>
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sectionHeading" style={{ marginTop: "48px" }}>
        <span>WHY HIMRIDEG</span>
        <h2>Safe, Simple and Trusted Local Rides</h2>
        <p>Built for the local passengers and drivers of Himachal Pradesh.</p>
      </div>

      <div className="featureGrid">
        {features.map((feature) => (
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
