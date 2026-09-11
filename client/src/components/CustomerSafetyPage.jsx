import React from "react";

const rideIdOf = (ride) => String(ride?._id || ride?.id || "");
const locationText = (value, fallback) => value?.address || (typeof value === "string" ? value : "") || fallback;
const pickupText = (ride) => locationText(ride?.pickup || ride?.pickupAddress, "Pickup");
const dropText = (ride) => locationText(ride?.dropoff || ride?.drop || ride?.dropAddress, "Destination");

function CustomerSafetyPage({ activeRide, onBack }) {
  const [contacts, setContacts] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("himrideg_trusted_contacts") || "[]");
      return Array.isArray(saved) ? saved.slice(0, 5) : [];
    } catch (_) {
      return [];
    }
  });
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const saveContacts = (next) => {
    const safe = next.slice(0, 5);
    setContacts(safe);
    try { localStorage.setItem("himrideg_trusted_contacts", JSON.stringify(safe)); } catch (_) {}
  };

  const addContact = () => {
    const clean = String(phone || "").replace(/\D/g, "").slice(-10);
    if (!String(name || "").trim() || clean.length !== 10) {
      window.alert("Name aur 10-digit mobile number enter karein.");
      return;
    }
    const next = [
      ...contacts.filter((item) => item.phone !== clean),
      { id: String(Date.now()), name: String(name).trim(), phone: clean }
    ];
    saveContacts(next);
    setName("");
    setPhone("");
  };

  const shareRide = async () => {
    if (!activeRide) {
      window.alert("Abhi active ride nahi hai.");
      return;
    }
    const text = [
      `HimRideG ride ${activeRide.bookingNumber || rideIdOf(activeRide)}`,
      `Pickup: ${pickupText(activeRide)}`,
      `Drop: ${dropText(activeRide)}`,
      `Status: ${activeRide.status}`,
      "HimRideG: https://www.himrideg.com"
    ].join("\n");
    try {
      if (navigator.share) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
    } catch (_) {}
  };

  return (
    <section className="cvAppSubPage cvSafetyPage">
      <header><button type="button" onClick={onBack}>‹</button><div><small>HIMRIDEG SAFETY</small><h2>Safety</h2></div></header>
      <div className="cvSafetyIntro"><h3>Your safety toolkit</h3><p>Ride se pehle, ride ke dauran aur ride ke baad.</p></div>
      <div className="cvSafetyGrid">
        {[
          ["🛡️","Verified taxi only","Commercial vehicle documents and driver approval before going online."],
          ["🔐","Ride start OTP","Pickup par OTP match hone ke baad hi trip start hoti hai."],
          ["📍","Live route","Pickup, destination aur driver location ek live map par."],
          ["📞","Emergency access","Need ho to India emergency number directly call karein."]
        ].map(([icon,title,sub]) => <article key={title}><span>{icon}</span><div><strong>{title}</strong><small>{sub}</small></div></article>)}
      </div>
      <div className="cvSafetyActions">
        <a href="tel:112">Emergency 112</a>
        <button type="button" onClick={shareRide}>Share Active Ride</button>
      </div>
      <div className="cvTrustedContacts">
        <h3>Trusted contacts</h3><p>Up to 5 contacts is device/browser par privately save hote hain.</p>
        {contacts.map((contact) => <article key={contact.id || contact.phone}><div><strong>{contact.name}</strong><small>+91 {contact.phone}</small></div><a href={`tel:+91${contact.phone}`}>Call</a></article>)}
        <label>Trusted Contact Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Family / friend" /></label>
        <label>Mobile Number<input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10 digit number" /></label>
        <button type="button" className="cvSafetySave" onClick={addContact}>Save Trusted Contact</button>
      </div>
      <div className="cvSafetyRule"><strong>Safety rule</strong><p>OTP sirf driver se face-to-face milne ke baad share karein. Payment ya OTP kisi unknown caller ko phone par mat batayein.</p></div>
    </section>
  );
}

export default CustomerSafetyPage;
