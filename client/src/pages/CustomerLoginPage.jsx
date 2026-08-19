import React, {
  useEffect,
  useRef,
  useState
} from "react";

import api from "../api";
import "../customer-login.css";

/*
|--------------------------------------------------------------------------
| Google Identity Services
|--------------------------------------------------------------------------
*/

const GOOGLE_CLIENT_ID = String(
  import.meta.env.VITE_GOOGLE_CLIENT_ID || ""
).trim();

let googleScriptPromise = null;

// GIS initialize() page-level singleton hai. React re-render / StrictMode /
// login-register mode switch me isko dobara initialize nahi karna.
let googleInitializedClientId = "";
let activeGoogleCredentialHandler = null;

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(
      "google-identity-services"
    );

    if (existing) {
      if (window.google?.accounts?.id) {
        resolve(window.google);
        return;
      }

      existing.addEventListener(
        "load",
        () => resolve(window.google),
        { once: true }
      );
      existing.addEventListener(
        "error",
        () => reject(new Error("Google login load nahi hua.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "google-identity-services";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () =>
      reject(new Error("Google Identity Services load nahi hui."));

    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function cleanPhone(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, 10);
}

function isValidPhone(value) {
  return /^[6-9]\d{9}$/.test(cleanPhone(value));
}

function getResponseData(response) {
  return response?.data?.data || response?.data || {};
}

/*
|--------------------------------------------------------------------------
| Customer Login Page
|--------------------------------------------------------------------------
|
| Customer login rule:
| - Mobile number is entered first.
| - NO SMS OTP is sent.
| - Google account verifies the identity.
| - First-time Google customer sees Basic Info confirmation page with the
|   Google account name + entered mobile already filled.
| - Returning completed customer goes straight to dashboard.
| - Terms checkbox is intentionally NOT required for Google sign-in.
|
*/

function CustomerLoginPage({
  initialMode = "login",
  onSuccess,
  onBack
}) {
  const [mode, setMode] = useState(initialMode);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [googleArmed, setGoogleArmed] = useState(false);

  const googleButtonRef = useRef(null);
  const googleCallbackRef = useRef(null);
  const expectedPhoneRef = useRef("");
  const initializedRef = useRef(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const notify = (text, type = "info") => {
    setMessage(String(text || ""));
    setMessageType(type);
  };

  const finishGoogleLogin = async (credential) => {
    const expectedPhone = cleanPhone(
      expectedPhoneRef.current || phone
    );

    if (!isValidPhone(expectedPhone)) {
      notify("Valid 10 digit mobile number enter karo.", "error");
      return;
    }

    if (!credential) {
      notify("Google credential nahi mila. Dobara try karo.", "error");
      return;
    }

    try {
      setLoading(true);
      notify("");

      const response = await api.post("/auth/google", {
        credential,
        role: "customer",
        expectedPhone
      });

      const responseData = getResponseData(response);
      const accessToken =
        responseData?.accessToken ||
        responseData?.token;
      const authenticatedUser = responseData?.user;

      if (!accessToken || !authenticatedUser) {
        throw new Error(
          "Google login response me token ya user nahi mila."
        );
      }

      if (authenticatedUser.role !== "customer") {
        throw new Error("Ye Customer account nahi hai.");
      }

      sessionStorage.setItem(
        "himrideg_token",
        String(accessToken).replace(/^Bearer\s+/i, "").trim()
      );
      sessionStorage.setItem(
        "himrideg_user",
        JSON.stringify(authenticatedUser)
      );
      sessionStorage.setItem("himrideg_role", "customer");

      if (onSuccess) {
        onSuccess({
          ...responseData,
          accessToken,
          user: authenticatedUser,
          accountType: "customer",
          provider: "google",
          requiresBasicInfo: Boolean(
            responseData?.requiresBasicInfo ||
              authenticatedUser?.needsBasicInfo
          )
        });
      }
    } catch (error) {
      notify(
        error?.response?.data?.message ||
          error?.message ||
          "Google login nahi ho paya.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  googleCallbackRef.current = finishGoogleLogin;

  const configureGoogle = () => {
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts?.id) {
      return false;
    }

    // Latest mounted CustomerLoginPage ka callback active rakho without
    // re-running google.accounts.id.initialize().
    activeGoogleCredentialHandler = (response) => {
      if (response?.credential && googleCallbackRef.current) {
        googleCallbackRef.current(response.credential);
      }
    };

    if (googleInitializedClientId !== GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (activeGoogleCredentialHandler) {
            activeGoogleCredentialHandler(response);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: "popup",
        use_fedcm_for_button: true
      });

      googleInitializedClientId = GOOGLE_CLIENT_ID;
    }

    initializedRef.current = true;
    return true;
  };

  useEffect(() => {
    let cancelled = false;

    if (!GOOGLE_CLIENT_ID) {
      setGoogleError("Google Client ID configure karna baaki hai.");
      return undefined;
    }

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled) return;
        configureGoogle();
        setGoogleReady(true);
        setGoogleError("");
      })
      .catch((error) => {
        if (cancelled) return;
        setGoogleReady(false);
        setGoogleError(error?.message || "Google login load nahi hua.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (
      !googleArmed ||
      !googleReady ||
      !googleButtonRef.current ||
      !window.google?.accounts?.id
    ) {
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";
      }
      return;
    }

    if (!initializedRef.current) {
      configureGoogle();
    }

    const host = googleButtonRef.current;
    host.innerHTML = "";

    const width = Math.max(
      230,
      Math.min(400, Math.floor(host.getBoundingClientRect().width || 360))
    );

    window.google.accounts.id.renderButton(host, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: mode === "register" ? "signup_with" : "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width
    });
  }, [googleArmed, googleReady, mode]);

  const startGoogleVerification = () => {
    if (loading) return;

    const clean = cleanPhone(phone);

    if (!isValidPhone(clean)) {
      notify("Valid 10 digit mobile number enter karo.", "error");
      return;
    }

    if (!googleReady || !window.google?.accounts?.id) {
      notify(
        googleError || "Google login abhi ready nahi hai.",
        "error"
      );
      return;
    }

    expectedPhoneRef.current = clean;
    setGoogleArmed(true);
    notify("");
    configureGoogle();

    // One Tap / browser FedCM prompt ko preserve rakha hai. Latest FedCM
    // migration me display-moment status methods deprecated/removed hain,
    // isliye prompt callback par UI depend nahi karta. Official Google
    // button neeche parallel fallback ke roop me rendered rahega.
    window.google.accounts.id.prompt();
  };

  const handleAppleLogin = () => {
    notify(
      "Apple Login button ready rakha hai. Live Apple sign-in ke liye Apple Developer Service ID configure karna hoga. Filhaal Google se continue karo.",
      "info"
    );
  };

  const switchMode = () => {
    setMode((current) =>
      current === "login" ? "register" : "login"
    );
    setGoogleArmed(false);
    notify("");
  };

  return (
    <main className="customerLoginPage">
      <section className="customerLoginBrandPanel">
        <button
          type="button"
          className="customerLoginBrand"
          onClick={onBack}
          aria-label="Back to HimRideG home"
        >
          <img src="/himrideg-logo.png" alt="HimRideG" />
          <span>
            HimRide<span>G</span>
          </span>
        </button>

        <div className="customerLoginBrandCopy">
          <span className="customerLoginBadge">✓ SAFE • RELIABLE • HIMACHAL</span>
          <h1>
            Your journey.<br />
            Our <strong>responsibility.</strong>
          </h1>
          <p>
            Verified drivers, transparent rides and live tracking for local
            and outstation taxi travel.
          </p>
        </div>

        <div className="customerLoginBenefits">
          <article>
            <span>✓</span>
            <div>
              <strong>Verified Drivers</strong>
              <small>Trusted and approved local drivers</small>
            </div>
          </article>
          <article>
            <span>₹</span>
            <div>
              <strong>Transparent Fares</strong>
              <small>No hidden charges</small>
            </div>
          </article>
          <article>
            <span>⌖</span>
            <div>
              <strong>Live Ride Tracking</strong>
              <small>Track your ride in real-time</small>
            </div>
          </article>
        </div>
      </section>

      <section className="customerLoginFormPanel">
        <button
          type="button"
          className="customerLoginBackButton"
          onClick={onBack}
          aria-label="Back to HimRideG home"
        >
          <span aria-hidden="true">←</span>
          Back to HimRideG
        </button>

        <div className="customerLoginCard">
          <header>
            <img src="/himrideg-logo.png" alt="HimRideG" />
            <span className="customerLoginUserIcon">♙</span>
            <h2>
              {mode === "register"
                ? "Create Customer Account"
                : "Welcome to HimRideG"}
            </h2>
            <p>
              {mode === "register"
                ? "Mobile number enter karo aur Google se account verify karo"
                : "Mobile number enter karo aur Google se secure login karo"}
            </p>
          </header>

          {message && (
            <div className={`customerLoginMessage ${messageType}`}>
              {message}
            </div>
          )}

          <label className="customerLoginField">
            <span>Mobile Number <b>*</b></span>
            <div className="customerPhoneInput">
              <span className="customerPhonePrefix">🇮🇳 +91</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Enter 10 digit mobile number"
                value={phone}
                maxLength={10}
                disabled={loading}
                onChange={(event) => {
                  setPhone(cleanPhone(event.target.value));
                  setGoogleArmed(false);
                  notify("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    startGoogleVerification();
                  }
                }}
              />
            </div>
          </label>

          <button
            type="button"
            className="customerGooglePrimary"
            disabled={loading || !googleReady}
            onClick={startGoogleVerification}
          >
            <span className="googleG">G</span>
            {loading
              ? "Verifying..."
              : mode === "register"
                ? "Sign Up with Google"
                : "Continue with Google"}
          </button>

          {googleError && (
            <p className="customerGoogleError">{googleError}</p>
          )}

          {googleArmed && (
            <div className="customerOfficialGoogleWrap">
              <small>Google account chooser</small>
              <div ref={googleButtonRef} className="customerOfficialGoogle" />
            </div>
          )}

          <div className="customerLoginDivider"><span />or<span /></div>

          <button
            type="button"
            className="customerAppleButton"
            onClick={handleAppleLogin}
            disabled={loading}
          >
            <span className="appleMark">●</span>
            Continue with Apple
          </button>

          <div className="customerSignupBlock">
            <span>
              {mode === "register"
                ? "Already registered?"
                : "New to HimRideG?"}
            </span>
            <button type="button" onClick={switchMode} disabled={loading}>
              {mode === "register" ? "Login" : "Create Account / Sign Up"}
            </button>
          </div>

          <p className="customerTermsText">
            Google login ke liye koi checkbox compulsory nahi hai. Continue
            karne par HimRideG Terms & Privacy Policy apply hoti hai.
          </p>

          {/*
            Customer login deliberately isolated hai. Driver aur Admin ke
            dedicated URLs /driverlogin/ aur /adminlogin/ par hi access honge.
            Customer screen par unke tabs/buttons render nahi kiye jaate.
          */}

          <div className="customerLoginHowItWorks">
            <strong>How it works</strong>
            <p>
              Mobile number → Google verification → first time Basic Info
              confirmation → Dashboard. Returning registered customer Google
              verification ke baad direct Dashboard par jayega.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default CustomerLoginPage;
