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
            <a href="/driverlogin/">Driver Login</a>
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
            <a href="#home">Local Rides</a>
            <a href="#home">Outstation Taxi</a>
            <a href="#home">Airport Transfer</a>
            <a href="#home">Tour Packages</a>
          </div>
        </div>
      </div>

      <div className="footerLegalSummary">
        <section id="privacy">
          <h3>Privacy</h3>
          <p>HimRideG account, booking, location, driver verification aur payment data ko service, safety, fraud prevention, settlement aur legal compliance ke liye process karta hai. Payment secrets browser me store nahi kiye jaate. Access/correction/deletion/grievance ke liye <a href="mailto:himrideg@gmail.com">himrideg@gmail.com</a> par likhein.</p>
        </section>

        <section id="terms">
          <h3>Terms</h3>
          <p>HimRideG ek technology platform hai jo customers ko independent licensed taxi drivers se connect karta hai; vehicle, permit, insurance, conduct aur ride execution driver ki responsibility hai. Pickup/drop, passenger count aur contact details accurate dein. Fare customer ke in-app acceptance par lock hota hai aur completed ride ka locked fare due rahega.</p>
          <p>OTP sirf saamne driver/vehicle verify karke share karein. Illegal goods, harassment, fraud, payment bypass, false booking ya account sharing prohibited hai. Emergency me 112, complaint me ride ID/screenshots ke saath <a href="mailto:himrideg@gmail.com">himrideg@gmail.com</a>.</p>
        </section>

        <section id="cancellation-refund">
          <h3>Cancellation & Refund</h3>
          <p>Applicable cancellation/no-show fee booking screen par pehle dikhayi jayegi. Customer-requested cancellation ya driver pickup par pahunchne ke baad cancellation par fee lag sakti hai. Eligible online refunds original payment method par gateway/bank timeline ke anusaar process honge; mandatory consumer/statutory rights prabhavit nahi hote.</p>
        </section>

        <section id="contact">
          <h3>Grievance contact</h3>
          <p>HimRideG, Vill Racchiyara, PO Saperu, Teh Palampur, District Kangra, Himachal Pradesh 176061 · <a href="mailto:himrideg@gmail.com">himrideg@gmail.com</a> · Terms version: 23 September 2026.</p>
        </section>
      </div>

      <div className="footerBottom">
        <p>
          © {new Date().getFullYear()} HimRideG. All rights reserved.
        </p>

        <div>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#cancellation-refund">Cancellation & Refund</a>
          <a href="#contact">Grievance contact</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
