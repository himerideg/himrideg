import React from "react";

const COPY = {
  en: {
    tagline: "Safe, trusted and affordable local taxi booking platform for Himachal.",
    company: "Company", home: "Home", about: "About", business: "Business", driver: "Driver Login",
    support: "Support", help: "Help Center", safety: "Safety", contact: "Contact",
    refund: "Cancellation & Refund", services: "Services", local: "Local Rides",
    outstation: "Outstation Taxi", airport: "Airport Transfer", tours: "Tour Packages",
    privacyTitle: "Privacy",
    privacyText: "HimRideG processes account, booking, location, driver verification and payment-related data for service operation, safety, fraud prevention, settlement and legal compliance. Sensitive payment and payout data is protected on the server. For access, correction, deletion or grievance requests, email himrideg@gmail.com.",
    privacyLink: "Read Privacy Policy",
    termsTitle: "Terms",
    termsText: "HimRideG is a technology platform connecting customers with independent licensed taxi drivers. The driver is responsible for the vehicle, permits, insurance, conduct and ride execution. Pickup, drop, passenger and contact details must be accurate. Fare is locked after driver-customer negotiation and customer acceptance; the locked fare remains due for a completed ride.",
    termsLink: "Read Terms of Use",
    rights: "All rights reserved.", bottomPrivacy: "Privacy", bottomTerms: "Terms",
    bottomRefund: "Refunds", bottomContact: "Contact",
    otpText: "Share the ride OTP only after verifying the driver and vehicle in person. Illegal goods, harassment, fraud, payment bypass, false bookings and account sharing are prohibited. In an emergency call 112 first; report issues with ride ID and proof to himrideg@gmail.com.",
    address: "HimRideG, Vill Racchiyara, PO Saperu, Teh Palampur, District Kangra, Himachal Pradesh 176061. Terms version: 23 September 2026."
  },
  hi: {
    tagline: "हिमाचल के लिए सुरक्षित, भरोसेमंद और किफायती स्थानीय टैक्सी बुकिंग मंच।",
    company: "कंपनी", home: "मुखपृष्ठ", about: "हमारे बारे में", business: "व्यवसाय", driver: "चालक लॉगिन",
    support: "सहायता", help: "सहायता केंद्र", safety: "सुरक्षा", contact: "संपर्क",
    refund: "रद्दीकरण और धनवापसी", services: "सेवाएँ", local: "स्थानीय यात्राएँ",
    outstation: "बाहरी शहर की टैक्सी", airport: "हवाई अड्डा यात्रा", tours: "यात्रा पैकेज",
    privacyTitle: "गोपनीयता",
    privacyText: "HimRideG सेवा संचालन, सुरक्षा, fraud prevention, settlement और कानूनी अनुपालन के लिए खाते, बुकिंग, स्थान, चालक सत्यापन और भुगतान से जुड़ी जानकारी का उपयोग करता है। संवेदनशील भुगतान जानकारी सर्वर पर सुरक्षित रखी जाती है। access, correction, deletion या grievance के लिए himrideg@gmail.com पर लिखें।",
    privacyLink: "गोपनीयता नीति पढ़ें",
    termsTitle: "उपयोग के नियम",
    termsText: "HimRideG एक technology platform है जो ग्राहकों को independent licensed taxi drivers से जोड़ता है। वाहन, permit, insurance, conduct और ride execution की जिम्मेदारी driver की है। Pickup, drop, passenger और contact details सही देना जरूरी है। driver और customer की सहमति के बाद final fare lock होता है और completed ride का locked fare due रहता है।",
    termsLink: "उपयोग के नियम पढ़ें",
    rights: "सर्वाधिकार सुरक्षित।", bottomPrivacy: "गोपनीयता", bottomTerms: "नियम",
    bottomRefund: "धनवापसी", bottomContact: "संपर्क",
    otpText: "OTP केवल driver और vehicle को सामने verify करने के बाद share करें। illegal goods, harassment, fraud, payment bypass, false booking और account sharing prohibited हैं। emergency में पहले 112 call करें; ride ID और proof के साथ himrideg@gmail.com पर शिकायत करें।",
    address: "HimRideG, Vill Racchiyara, PO Saperu, Teh Palampur, District Kangra, Himachal Pradesh 176061. Terms version: 23 September 2026."
  }
};

function Footer({ language = "en" }) {
  const t = COPY[language] || COPY.en;

  return (
    <footer className="siteFooter" id="help">
      <div className="footerTop">
        <div className="footerBrand">
          <div className="brandMark">H</div>
          <div><h2>HimRideG</h2><p>{t.tagline}</p></div>
        </div>
        <div className="footerLinks">
          <div><h3>{t.company}</h3><a href="/">{t.home}</a><a href="#about">{t.about}</a><a href="/business/">{t.business}</a><a href="/driverlogin/">{t.driver}</a></div>
          <div><h3>{t.support}</h3><a href="/help/">{t.help}</a><a href="/safety/">{t.safety}</a><a href="/contact/">{t.contact}</a><a href="/refund-cancellation/">{t.refund}</a></div>
          <div><h3>{t.services}</h3><a href="/#home">{t.local}</a><a href="/#home">{t.outstation}</a><a href="/#home">{t.airport}</a><a href="/#home">{t.tours}</a></div>
        </div>
      </div>

      <div className="footerLegalSummary">
        <section id="privacy"><h3>{t.privacyTitle}</h3><p>{t.privacyText}</p><a href="/privacy/">{t.privacyLink}</a></section>
        <section id="terms"><h3>{t.termsTitle}</h3><p>{t.termsText}</p><p>{t.otpText}</p><a href="/terms/">{t.termsLink}</a></section>
        <section id="cancellation-refund"><h3>{t.refund}</h3><p>Applicable cancellation/no-show fees are shown before booking confirmation. Eligible online refunds are processed to the original payment method according to gateway and bank timelines. Mandatory consumer and statutory rights are not removed.</p><a href="/refund-cancellation/">{t.bottomRefund}</a></section>
        <section id="contact"><h3>{t.contact}</h3><p>{t.address}</p><a href="mailto:himrideg@gmail.com">himrideg@gmail.com</a></section>
      </div>

      <div className="footerBottom">
        <p>© {new Date().getFullYear()} HimRideG. {t.rights}</p>
        <div><a href="/privacy/">{t.bottomPrivacy}</a><a href="/terms/">{t.bottomTerms}</a><a href="/refund-cancellation/">{t.bottomRefund}</a><a href="/contact/">{t.bottomContact}</a></div>
      </div>
    </footer>
  );
}

export default Footer;
