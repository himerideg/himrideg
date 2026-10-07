import React from "react";
import { WEB_LANGUAGES, cleanWebLanguage } from "./hinglishWeb";
import "./web-language-picker.css";

/*
|--------------------------------------------------------------------------
| Website Language Picker (V90, added)
|--------------------------------------------------------------------------
| Same choice as the HimRideG app: English / हिन्दी / Hinglish.
| - "bar": normal-flow strip at the very bottom of the page (before login),
|   so it never covers Sign Up / Login or any header button.
| - "card": the same choice inside the Profile / Settings panel after login.
| Each option is written in its own language, so a rider can always find it.
*/

const TITLE = {
  en: "Language",
  hi: "भाषा",
  hinglish: "Bhasha"
};

const HINT = {
  en: "Choose the website language",
  hi: "वेबसाइट की भाषा चुनें",
  hinglish: "Website ki bhasha chuno"
};

export default function WebLanguagePicker({
  language,
  setLanguage,
  variant = "bar"
}) {
  const current = cleanWebLanguage(language);

  return (
    <div
      className={`webLanguagePicker webLanguagePicker--${variant}`}
      role="radiogroup"
      aria-label={TITLE[current]}
    >
      <div className="webLanguagePickerHead">
        <strong>🌐 {TITLE[current]}</strong>
        {variant === "card" ? <small>{HINT[current]}</small> : null}
      </div>

      <div className="webLanguagePickerOptions">
        {WEB_LANGUAGES.map((item) => {
          const selected = item.code === current;

          return (
            <button
              key={item.code}
              type="button"
              role="radio"
              aria-checked={selected}
              className={selected ? "isSelected" : ""}
              onClick={() => setLanguage?.(item.code)}
            >
              <span>{item.label}</span>
              {variant === "card" ? <small>{item.sample}</small> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
