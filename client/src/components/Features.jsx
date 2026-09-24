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
      { icon: "🛡️", title: "सुरक्षित यात्राएँ", text: "हर यात्रा सत्यापित चालक के साथ होती है। स्वीकृति से पहले वाहन के दस्तावेज़, ड्राइविंग लाइसेंस और परमिट की जाँच की जाती है। आपकी सुरक्षा हमारी प्राथमिकता है।" },
      { icon: "💰", title: "उचित किराया", text: "बिना छिपे शुल्क के स्पष्ट मूल्य व्यवस्था। स्थानीय परिस्थितियों के अनुसार ग्राहक और चालक आपसी सहमति से किराया तय करते हैं।" },
      { icon: "📍", title: "सीधी स्थान निगरानी", text: "यात्रा के दौरान चालक की वर्तमान जगह और यात्रा की स्थिति को वास्तविक समय में देखें।" },
      { icon: "📞", title: "24×7 सहायता", text: "बुकिंग, चालक या भुगतान से जुड़े प्रश्नों के लिए सहायता उपलब्ध है। जरूरत पड़ने पर हम आपकी मदद के लिए मौजूद हैं।" }
    ],
    aboutItems: [
      { id: "what", title: "HimRideG क्या है?", content: "HimRideG हिमाचल प्रदेश के लिए बनाया गया स्थानीय टैक्सी मंच है। यह यात्रियों को सत्यापित स्थानीय टैक्सी चालकों से जोड़ता है ताकि हिमाचल में सुरक्षित और भरोसेमंद यात्रा मिल सके।" },
      { id: "vehicles", title: "कौन से वाहन मान्य हैं?", content: "HimRideG पर केवल सत्यापित व्यावसायिक या टैक्सी वाहन, जिन पर पीली नंबर प्लेट हो, मान्य हैं। पंजीकरण के समय वाहन आरसी, व्यावसायिक परमिट और वाहन की तस्वीर की जाँच की जाती है। चालक को लागू परिवहन और कानूनी नियमों का पालन करना भी आवश्यक है।" },
      { id: "drivers", title: "चालकों का सत्यापन कैसे होता है?", content: "हर चालक को आधार या पहचान प्रमाण, ड्राइविंग लाइसेंस, वाहन आरसी, व्यावसायिक परमिट और वाहन की तस्वीर देनी होती है। चालक के ऑनलाइन होने से पहले HimRideG प्रशासन इन दस्तावेज़ों की जाँच और स्वीकृति करता है।" },
      { id: "safety", title: "HimRideG सुरक्षा कैसे सुनिश्चित करता है?", content: "हर यात्रा में सत्यापित चालक पहचान, सत्यापित वाहन विवरण, सीधी GPS निगरानी, OTP से सत्यापित यात्रा आरंभ और पूरी यात्रा का इतिहास शामिल रहता है। यात्रा शुरू होने से पहले उपलब्ध चालक और ग्राहक जानकारी की पुष्टि की जाती है।" },
      { id: "local", title: "स्थानीय चालक क्यों?", content: "HimRideG हिमाचल के स्थानीय चालकों को यात्रियों से जोड़कर उनका समर्थन करता है। स्थानीय चालक रास्तों, पहाड़ी भूभाग और स्थानीय परिस्थितियों को बेहतर जानते हैं।" },
      { id: "vision", title: "हमारा लक्ष्य", content: "हिमाचल प्रदेश के सभी जिलों और दूरस्थ क्षेत्रों में सुरक्षित, भरोसेमंद और विश्वसनीय टैक्सी सेवा नेटवर्क बनाना, ताकि राज्य के हर हिस्से तक स्थानीय परिवहन की पहुँच हो।" }
    ],
    aboutTag: "HIMRIDEG के बारे में",
    aboutTitle: "अपने यात्रा मंच को जानें",
    aboutText: "HimRideG के बारे में जरूरी जानकारी देखने के लिए किसी प्रश्न पर दबाएँ।",
    whyTag: "HIMRIDEG क्यों",
    whyTitle: "सुरक्षित, सरल और भरोसेमंद स्थानीय यात्राएँ",
    whyText: "हिमाचल प्रदेश के स्थानीय यात्रियों और चालकों के लिए बनाया गया।"
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
