import React from "react";

const COPY = {
  en: {
    tagline: "Himachal's safe, trusted and affordable local taxi booking platform.",
    company: "Company",
    home: "Home",
    about: "About",
    business: "Business",
    driver: "Driver Login",
    support: "Support",
    help: "Help Center",
    safety: "Safety",
    contact: "Contact",
    refund: "Cancellation & Refund",
    accessibility: "Accessibility",
    services: "Services",
    local: "Local Rides",
    outstation: "Outstation Taxi",
    airport: "Airport Transfer",
    tours: "Tour Packages",
    privacyTitle: "Privacy",
    privacyText: "HimRideG processes account, booking, location, driver verification and payment-related data for service operation, safety and legal compliance. Sensitive payout data is protected on the server.",
    privacyLink: "Read Privacy Policy",
    termsTitle: "Terms",
    termsText: "HimRideG connects eligible commercial taxi drivers and customers. Fare is locked after driver-customer negotiation and customer acceptance.",
    termsLink: "Read Terms of Use",
    socialTitle: "Connect with HimRideG",
    socialSoon: "Official social handles will appear here after publishing.",
    rights: "All rights reserved.",
    bottomPrivacy: "Privacy",
    bottomTerms: "Terms",
    bottomRefund: "Refunds",
    bottomAccessibility: "Accessibility",
    bottomContact: "Contact"
  },
  hi: {
    tagline: "हिमाचल के लिए सुरक्षित, भरोसेमंद और किफायती स्थानीय टैक्सी बुकिंग मंच।",
    company: "कंपनी",
    home: "मुखपृष्ठ",
    about: "हमारे बारे में",
    business: "व्यवसाय",
    driver: "चालक लॉगिन",
    support: "सहायता",
    help: "सहायता केंद्र",
    safety: "सुरक्षा",
    contact: "संपर्क",
    refund: "रद्दीकरण और धनवापसी",
    accessibility: "सुलभता",
    services: "सेवाएँ",
    local: "स्थानीय यात्राएँ",
    outstation: "बाहरी शहर की टैक्सी",
    airport: "हवाई अड्डा यात्रा",
    tours: "यात्रा पैकेज",
    privacyTitle: "गोपनीयता",
    privacyText: "HimRideG सेवा संचालन, सुरक्षा और कानूनी अनुपालन के लिए खाते, बुकिंग, स्थान, चालक सत्यापन और भुगतान से जुड़ी जानकारी का उपयोग करता है। संवेदनशील भुगतान जानकारी सर्वर पर सुरक्षित रखी जाती है।",
    privacyLink: "गोपनीयता नीति पढ़ें",
    termsTitle: "उपयोग के नियम",
    termsText: "HimRideG पात्र व्यावसायिक टैक्सी चालकों और ग्राहकों को जोड़ता है। चालक और ग्राहक के बीच सहमति तथा ग्राहक की स्वीकृति के बाद किराया तय होता है।",
    termsLink: "उपयोग के नियम पढ़ें",
    socialTitle: "HimRideG से जुड़ें",
    socialSoon: "आधिकारिक सामाजिक माध्यम प्रकाशित होने के बाद यहाँ दिखाई देंगे।",
    rights: "सर्वाधिकार सुरक्षित।",
    bottomPrivacy: "गोपनीयता",
    bottomTerms: "नियम",
    bottomRefund: "धनवापसी",
    bottomAccessibility: "सुलभता",
    bottomContact: "संपर्क"
  }
};

function Footer({ language = "en" }) {
  const t = COPY[language] || COPY.en;
  const socialLinks = [
    ["Instagram", import.meta.env.VITE_HIMRIDEG_INSTAGRAM_URL],
    ["YouTube", import.meta.env.VITE_HIMRIDEG_YOUTUBE_URL],
    ["Facebook", import.meta.env.VITE_HIMRIDEG_FACEBOOK_URL],
    ["LinkedIn", import.meta.env.VITE_HIMRIDEG_LINKEDIN_URL],
    ["X", import.meta.env.VITE_HIMRIDEG_X_URL]
  ].filter(([, url]) => Boolean(String(url || "").trim()));

  return (
    <footer className="siteFooter" id="help">
      <div className="footerTop">
        <div className="footerBrand">
          <div className="brandMark">H</div>

          <div>
            <h2>HimRideG</h2>
            <p>{t.tagline}</p>

            <div className="footerSocialBlock">
              <strong>{t.socialTitle}</strong>
              {socialLinks.length ? (
                <div className="footerSocialLinks">
                  {socialLinks.map(([label, url]) => (
                    <a key={label} href={url} target="_blank" rel="noreferrer">{label}</a>
                  ))}
                </div>
              ) : (
                <span className="footerSocialEmpty">{t.socialSoon}</span>
              )}
            </div>
          </div>
        </div>

        <div className="footerLinks">
          <div>
            <h3>{t.company}</h3>
            <a href="/">{t.home}</a>
            <a href="#about">{t.about}</a>
            <a href="/business/">{t.business}</a>
            <a href="/driverlogin/">{t.driver}</a>
          </div>

          <div>
            <h3>{t.support}</h3>
            <a href="/help/">{t.help}</a>
            <a href="/safety/">{t.safety}</a>
            <a href="/contact/">{t.contact}</a>
            <a href="/refund-cancellation/">{t.refund}</a>
            <a href="/accessibility/">{t.accessibility}</a>
          </div>

          <div>
            <h3>{t.services}</h3>
            <a href="/#home">{t.local}</a>
            <a href="/#home">{t.outstation}</a>
            <a href="/#home">{t.airport}</a>
            <a href="/#home">{t.tours}</a>
          </div>
        </div>
      </div>

      <div className="footerLegalSummary">
        <section id="privacy">
          <h3>{t.privacyTitle}</h3>
          <p>{t.privacyText}</p>
          <a href="/privacy/">{t.privacyLink}</a>
        </section>

        <section id="terms">
          <h3>{t.termsTitle}</h3>
          <p>{t.termsText}</p>
          <a href="/terms/">{t.termsLink}</a>
        </section>
      </div>

      <div className="footerBottom">
        <p>© {new Date().getFullYear()} HimRideG. {t.rights}</p>

        <div>
          <a href="/privacy/">{t.bottomPrivacy}</a>
          <a href="/terms/">{t.bottomTerms}</a>
          <a href="/refund-cancellation/">{t.bottomRefund}</a>
          <a href="/accessibility/">{t.bottomAccessibility}</a>
          <a href="/contact/">{t.bottomContact}</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
