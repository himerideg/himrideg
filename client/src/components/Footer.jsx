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
    socialSoon: "Official social handles will appear here after publishing."
  },
  hi: {
    tagline: "Himachal के लिए safe, trusted और affordable local taxi booking platform.",
    company: "Company",
    home: "होम",
    about: "हमारे बारे में",
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
    privacyText: "HimRideG service operation, safety और legal compliance के लिए account, booking, location, driver verification और payment-related data process करता है। Sensitive payout data server पर protected रहता है।",
    privacyLink: "Privacy Policy पढ़ें",
    termsTitle: "Terms",
    termsText: "HimRideG eligible commercial taxi drivers और customers को connect करता है। Driver-customer negotiation और customer acceptance के बाद fare lock होता है।",
    termsLink: "Terms of Use पढ़ें",
    socialTitle: "HimRideG से जुड़ें",
    socialSoon: "Official social handles publish होने के बाद यहाँ दिखेंगे।"
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
        <p>© {new Date().getFullYear()} HimRideG. All rights reserved.</p>

        <div>
          <a href="/privacy/">Privacy</a>
          <a href="/terms/">Terms</a>
          <a href="/refund-cancellation/">Refunds</a>
          <a href="/accessibility/">Accessibility</a>
          <a href="/contact/">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
