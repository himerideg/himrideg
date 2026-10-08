import React from "react";
import "../home-growth.css";

/*
|--------------------------------------------------------------------------
| HimRideG V96 — App download section (ADD-ONLY NEW FILE)
|--------------------------------------------------------------------------
| Home page par Customer + Driver Android APK seedha download.
| Files: client/public/downloads/HimRideG-Customer.apk / HimRideG-Driver.apk
|--------------------------------------------------------------------------
*/

const COPY = {
  en: {
    eyebrow: "HIMRIDEG APP",
    title: "Download the HimRideG apps",
    text: "Book rides or drive with HimRideG on your Android phone. Same account works on the website and the app.",
    customer: "HimRideG Customer App",
    customerHint: "Android APK · Book rides",
    driver: "HimRideG Driver App",
    driverHint: "Android APK · For drivers",
    note: "After downloading, open the file and allow \"Install unknown apps\" if your phone asks."
  },
  hi: {
    eyebrow: "HIMRIDEG ऐप",
    title: "HimRideG ऐप डाउनलोड करें",
    text: "अपने Android फ़ोन पर HimRideG से राइड बुक करें या ड्राइवर बनें। वेबसाइट और ऐप पर एक ही खाता चलता है।",
    customer: "HimRideG ग्राहक ऐप",
    customerHint: "Android APK · राइड बुक करें",
    driver: "HimRideG ड्राइवर ऐप",
    driverHint: "Android APK · ड्राइवरों के लिए",
    note: "डाउनलोड के बाद फ़ाइल खोलें और फ़ोन पूछे तो \"अज्ञात ऐप इंस्टॉल करें\" की अनुमति दें।"
  }
};

function Card({ icon, title, hint, file }) {
  return (
    <a className="homeStoreCard homeApkCard" href={file} download>
      <div className="homeStoreIcon" aria-hidden="true">{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{hint}</span>
      </div>
      <b aria-hidden="true">⬇</b>
    </a>
  );
}

export default function V96AppDownloads({ language = "en" }) {
  const t = String(language) === "hi" ? COPY.hi : COPY.en;
  return (
    <div className="homeGrowthRoot" id="download-app">
      <section className="homeGrowthSection homeAppSection" aria-labelledby="v96-app-title">
        <div className="homeAppBrand">
          <img src="/himrideg-logo.webp" alt="HimRideG" />
          <div>
            <span className="homeGrowthEyebrow">{t.eyebrow}</span>
            <h2 id="v96-app-title">{t.title}</h2>
            <p>{t.text}</p>
            <p style={{ marginTop: 10, fontSize: 12 }}>{t.note}</p>
          </div>
        </div>
        <div className="homeStoreGrid">
          <Card icon="🚕" title={t.customer} hint={t.customerHint} file="/downloads/HimRideG-Customer.apk" />
          <Card icon="🧑‍✈️" title={t.driver} hint={t.driverHint} file="/downloads/HimRideG-Driver.apk" />
        </div>
      </section>
    </div>
  );
}
