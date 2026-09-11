import React from "react";

function Footer() {
  return (
    <footer className="siteFooter" id="help">
      <div className="footerTop">
        <div className="footerBrand">
          <div className="brandMark">H</div>

          <div>
            <h2>HimRideG</h2>
            <p>
              Himachal ke liye safe, trusted aur affordable
              local taxi booking platform.
            </p>
          </div>
        </div>

        <div className="footerLinks">
          <div>
            <h3>Company</h3>
            <a href="/">Home</a>
            <a href="#about">About</a>
            <a href="/business/">Business</a>
            <a href="/driverlogin/">Driver Login</a>
          </div>

          <div>
            <h3>Support</h3>
            <a href="/help/">Help Center</a>
            <a href="/safety/">Safety</a>
            <a href="/contact/">Contact</a>
            <a href="/refund-cancellation/">Cancellation & Refund</a>
          </div>

          <div>
            <h3>Services</h3>
            <a href="/#home">Local Rides</a>
            <a href="/#home">Outstation Taxi</a>
            <a href="/#home">Airport Transfer</a>
            <a href="/#home">Tour Packages</a>
          </div>
        </div>
      </div>

      <div className="footerLegalSummary">
        <section id="privacy">
          <h3>Privacy</h3>
          <p>
            HimRideG account, booking, location, driver verification aur
            payment-related data ko service operation, safety aur legal
            compliance ke liye process karta hai. Sensitive payout data server
            par protected storage me rakha jata hai.
          </p>
          <a href="/privacy/">Read Privacy Policy</a>
        </section>

        <section id="terms">
          <h3>Terms</h3>
          <p>
            HimRideG eligible commercial taxi drivers aur customers ko connect
            karta hai. Fare driver-customer negotiation ke baad customer
            acceptance par lock hota hai.
          </p>
          <a href="/terms/">Read Terms of Use</a>
        </section>
      </div>

      <div className="footerBottom">
        <p>
          © {new Date().getFullYear()} HimRideG. All rights reserved.
        </p>

        <div>
          <a href="/privacy/">Privacy</a>
          <a href="/terms/">Terms</a>
          <a href="/refund-cancellation/">Refunds</a>
          <a href="/contact/">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
