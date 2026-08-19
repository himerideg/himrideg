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
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#driver">Driver</a>
            <a href="#business">Business</a>
          </div>

          <div>
            <h3>Support</h3>
            <a href="#help">Help Center</a>
            <a href="#help">Safety</a>
            <a href="#help">Contact</a>
            <a href="#help">FAQs</a>
          </div>

          <div>
            <h3>Services</h3>
            <a href="#ride">Local Rides</a>
            <a href="#ride">Outstation Taxi</a>
            <a href="#ride">Airport Transfer</a>
            <a href="#ride">Tour Packages</a>
          </div>
        </div>
      </div>

      <div className="footerLegalSummary">
        <section id="privacy">
          <h3>Privacy</h3>
          <p>HimRideG account, booking, location, driver verification aur payment data ko service operate karne, safety aur legal compliance ke liye process karta hai. Payment secrets browser me store nahi kiye jaate.</p>
        </section>

        <section id="terms">
          <h3>Terms</h3>
          <p>HimRideG verified commercial taxi drivers aur customers ko connect karta hai. Fare driver-customer negotiation ke baad customer acceptance par lock hota hai. Ride, cancellation aur payment records safety aur settlement ke liye maintain hote hain.</p>
        </section>
      </div>

      <div className="footerBottom">
        <p>
          © {new Date().getFullYear()} HimRideG. All rights reserved.
        </p>

        <div>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;