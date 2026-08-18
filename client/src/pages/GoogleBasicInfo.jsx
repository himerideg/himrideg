import React, {
  useMemo,
  useState
} from "react";

import api from "../api";

import "../google-basic-info.css";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const cleanPhone = (value) =>
  String(value || "")
    .replace(/\D/g, "")
    .slice(-10);

const cleanName = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trimStart()
    .slice(0, 100);

const normalizeInitialName = (
  user
) => {
  const value =
    String(
      user?.name || ""
    ).trim();

  if (
    value === "HimRideG Customer" ||
    value === "HimRideG Driver"
  ) {
    return "";
  }

  return value;
};

const getInitials = (
  value
) => {
  const words =
    String(value || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (!words.length) {
    return "G";
  }

  return words
    .slice(0, 2)
    .map((word) =>
      word.charAt(0)
    )
    .join("")
    .toUpperCase();
};

/*
|--------------------------------------------------------------------------
| Google Basic Info Page
|--------------------------------------------------------------------------
|
| Google account already verify ho chuka hai. Is page par password kabhi
| required nahi hai. Customer ke case me Google verified name aur login par
| enter kiya hua mobile yahan automatically prefilled dikhte hain.
|
*/

function GoogleBasicInfo({
  user,
  onComplete,
  logout
}) {
  const [name, setName] =
    useState(
      normalizeInitialName(
        user
      )
    );

  const [phone, setPhone] =
    useState(
      /^[6-9]\d{9}$/.test(
        String(
          user?.phone || ""
        )
      )
        ? String(user.phone)
        : ""
    );

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  const roleLabel =
    user?.role === "driver"
      ? "Driver"
      : "Customer";

  const email =
    String(
      user?.googleEmail ||
        user?.email ||
        ""
    ).trim();

  const displayName =
    name.trim() ||
    email.split("@")[0] ||
    `HimRideG ${roleLabel}`;

  const initials =
    useMemo(
      () =>
        getInitials(
          displayName
        ),
      [displayName]
    );

  const showMessage = (
    text,
    type = "info"
  ) => {
    setMessage(
      String(text || "")
    );
    setMessageType(type);
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const finalName =
      name.trim()
        .replace(/\s+/g, " ");

    const finalPhone =
      cleanPhone(phone);

    if (
      finalName.length < 2
    ) {
      showMessage(
        "Apna full name enter karo.",
        "error"
      );
      return;
    }

    if (
      !/^[6-9]\d{9}$/.test(
        finalPhone
      )
    ) {
      showMessage(
        "Valid 10 digit mobile number enter karo.",
        "error"
      );
      return;
    }

    try {
      setLoading(true);
      showMessage("");

      const response =
        await api.patch(
          "/auth/google/basic-info",
          {
            name:
              finalName,
            phone:
              finalPhone
          }
        );

      const responseData =
        response?.data?.data ||
        response?.data ||
        {};

      const updatedUser =
        responseData?.user;

      if (!updatedUser) {
        throw new Error(
          "Updated user response me nahi mila."
        );
      }

      sessionStorage.setItem(
        "himrideg_user",
        JSON.stringify(
          updatedUser
        )
      );

      showMessage(
        response?.data?.message ||
          "Basic info save ho gayi.",
        "success"
      );

      if (onComplete) {
        onComplete(
          updatedUser
        );
      }
    } catch (error) {
      showMessage(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Basic info save nahi ho payi.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="googleBasicInfoPage">
      <section className="googleBasicInfoShell">
        <aside className="googleBasicInfoBrand">
          <div className="googleBasicInfoBrandBadge">
            HimRideG
          </div>

          <div>
            <p className="googleBasicInfoEyebrow">
              GOOGLE LOGIN VERIFIED
            </p>

            <h1>
              {user?.role === "customer"
                ? "Google verified details confirm karo"
                : "Bas basic info complete karo"}
            </h1>

            <p className="googleBasicInfoBrandCopy">
              Google account verify ho chuka hai. Password ya OTP ki zarurat nahi hai.
              {user?.role === "customer"
                ? " Google account ka name aur login par enter kiya mobile automatically yahan aa gaya hai."
                : " Mobile number ride contact aur account communication ke liye save hoga."}
            </p>
          </div>

          <div className="googleBasicInfoPoints">
            <article>
              <span>✓</span>
              <div>
                <strong>Google verified</strong>
                <p>Name aur email secure Google sign-in se aaye hain.</p>
              </div>
            </article>

            <article>
              <span>✓</span>
              <div>
                <strong>No password required</strong>
                <p>Google login wale account ke liye password create karna compulsory nahi hai.</p>
              </div>
            </article>

            <article>
              <span>✓</span>
              <div>
                <strong>One-time setup</strong>
                <p>Basic info save hone ke baad next login direct dashboard kholega.</p>
              </div>
            </article>
          </div>
        </aside>

        <section className="googleBasicInfoCard">
          <header className="googleBasicInfoHeader">
            <div className="googleBasicInfoAvatar">
              {user?.profileImage ? (
                <img
                  src={
                    user.profileImage
                  }
                  alt={displayName}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>
                  {initials}
                </span>
              )}
            </div>

            <div>
              <span className="googleBasicInfoRole">
                {roleLabel} Account
              </span>

              <h2>
                {user?.role === "customer" ? "Verified Basic Info" : "Basic Info"}
              </h2>

              <p>
                Password required nahi hai
              </p>
            </div>
          </header>

          <form
            onSubmit={
              handleSubmit
            }
          >
            <label className="googleBasicInfoField">
              <span>
                {user?.role === "customer" ? "Google Verified Name" : "Full Name"} <b>*</b>
              </span>

              <input
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) =>
                  setName(
                    cleanName(
                      event.target.value
                    )
                  )
                }
                readOnly={user?.role === "customer" && name.trim().length >= 2}
                disabled={loading}
                required
              />
            </label>

            <label className="googleBasicInfoField">
              <span>
                Mobile Number <b>*</b>
              </span>

              <div className="googleBasicInfoPhone">
                <strong>+91</strong>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10 digit mobile number"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      cleanPhone(
                        event.target.value
                      )
                    )
                  }
                  readOnly={user?.role === "customer" && /^[6-9]\d{9}$/.test(phone)}
                  maxLength={10}
                  disabled={loading}
                  required
                />
              </div>
            </label>

            <label className="googleBasicInfoField">
              <span>
                Google Email
              </span>

              <div className="googleBasicInfoVerifiedInput">
                <input
                  type="email"
                  value={email}
                  readOnly
                />

                <em>
                  Verified
                </em>
              </div>
            </label>

            <div className="googleBasicInfoNoPassword">
              <span>🔐</span>
              <div>
                <strong>
                  Password field nahi hai
                </strong>
                <p>
                  Aage bhi Google account se direct sign in kar sakte ho.
                </p>
              </div>
            </div>

            {message && (
              <p
                className={`googleBasicInfoMessage ${messageType}`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              className="googleBasicInfoContinue"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : user?.role === "driver"
                  ? "Save & Continue to Driver Verification"
                  : "Continue to Dashboard"}
              <span>→</span>
            </button>

            <button
              type="button"
              className="googleBasicInfoLogout"
              onClick={logout}
              disabled={loading}
            >
              Use another account
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

export default GoogleBasicInfo;
