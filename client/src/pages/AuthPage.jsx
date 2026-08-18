import React, {
  useEffect,
  useState
} from "react";

import api from "../api";

import "../auth.css";

/*
|--------------------------------------------------------------------------
| Auth Page
|--------------------------------------------------------------------------
*/

function AuthPage({
  initialMode = "login",
  onBack,
  onSuccess
}) {
  const [mode, setMode] =
    useState(initialMode);

  const [
    accountType,
    setAccountType
  ] = useState("customer");

  const [step, setStep] =
    useState(1);

  const [phone, setPhone] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [name, setName] =
    useState("");

  const [
    adminEmail,
    setAdminEmail
  ] = useState("");

  const [
    adminPassword,
    setAdminPassword
  ] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [message, setMessage] =
    useState("");

  const [
    messageType,
    setMessageType
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    developmentOtp,
    setDevelopmentOtp
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Sync Initial Mode
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  /*
  |--------------------------------------------------------------------------
  | Notification
  |--------------------------------------------------------------------------
  */

  const notify = (
    text,
    type = "info"
  ) => {
    setMessage(
      String(text || "")
    );

    setMessageType(type);

    window.setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 4500);
  };

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const cleanPhone = (value) => {
    return String(value || "")
      .replace(/\D/g, "")
      .slice(0, 10);
  };

  const cleanOtp = (value) => {
    return String(value || "")
      .replace(/\D/g, "")
      .slice(0, 6);
  };

  const getResponseData = (
    response
  ) => {
    return (
      response?.data?.data ||
      response?.data ||
      {}
    );
  };

  const getRoleLabel = () => {
    if (
      accountType === "admin"
    ) {
      return "Admin";
    }

    if (
      accountType === "driver"
    ) {
      return "Driver";
    }

    return "Customer";
  };

  const getSendOtpEndpoint =
    () => {
      return accountType ===
        "driver"
        ? "/auth/driver/send-otp"
        : "/auth/customer/send-otp";
    };

  const getVerifyOtpEndpoint =
    () => {
      return accountType ===
        "driver"
        ? "/auth/driver/verify-otp"
        : "/auth/customer/verify-otp";
    };

  const saveLoginData = (
    accessToken,
    user
  ) => {
    sessionStorage.setItem(
      "himrideg_token",
      accessToken
    );

    sessionStorage.setItem(
      "himrideg_user",
      JSON.stringify(user)
    );

    sessionStorage.setItem(
      "himrideg_role",
      user.role
    );

    /*
    |--------------------------------------------------------------------------
    | Compatibility Keys
    |--------------------------------------------------------------------------
    */

    sessionStorage.setItem(
      "accessToken",
      accessToken
    );

    sessionStorage.setItem(
      "token",
      accessToken
    );
  };

  const resetOtpStep = () => {
    setStep(1);
    setOtp("");
    setDevelopmentOtp("");
    setMessage("");
    setMessageType("");
  };

  /*
  |--------------------------------------------------------------------------
  | Change Account Type
  |--------------------------------------------------------------------------
  */

  const changeAccountType = (
    newAccountType
  ) => {
    if (loading) {
      return;
    }

    setAccountType(
      newAccountType
    );

    setPhone("");
    setOtp("");
    setName("");
    setAdminEmail("");
    setAdminPassword("");
    resetOtpStep();
  };

  /*
  |--------------------------------------------------------------------------
  | Change Login/Register Mode
  |--------------------------------------------------------------------------
  */

  const changeMode = (
    newMode
  ) => {
    if (loading) {
      return;
    }

    setMode(newMode);

    /*
    |--------------------------------------------------------------------------
    | Admin Registration Frontend Se Allowed Nahi
    |--------------------------------------------------------------------------
    */

    if (
      newMode === "register" &&
      accountType === "admin"
    ) {
      setAccountType(
        "customer"
      );
    }

    setPhone("");
    setOtp("");
    setName("");
    setAdminEmail("");
    setAdminPassword("");
    resetOtpStep();
  };

  /*
  |--------------------------------------------------------------------------
  | Send Customer / Driver OTP
  |--------------------------------------------------------------------------
  */

  const handleSendOtp = async (
    event
  ) => {
    event.preventDefault();

    const trimmedPhone =
      phone.trim();

    if (
      !/^[6-9]\d{9}$/.test(
        trimmedPhone
      )
    ) {
      notify(
        "Valid 10 digit Indian mobile number enter karo.",
        "error"
      );

      return;
    }

    try {
      setLoading(true);
      setDevelopmentOtp("");

      const response =
        await api.post(
          getSendOtpEndpoint(),
          {
            phone: trimmedPhone
          }
        );

      const responseData =
        getResponseData(
          response
        );

      if (
        responseData
          ?.developmentOtp
      ) {
        const devOtp =
          String(
            responseData
              .developmentOtp
          );

        setDevelopmentOtp(
          devOtp
        );

        setOtp(devOtp);
      } else {
        setOtp("");
      }

      setStep(2);

      notify(
        response?.data
          ?.message ||
          `${getRoleLabel()} OTP sent successfully`,
        "success"
      );
    } catch (error) {
      notify(
        error?.response?.data
          ?.message ||
          error?.message ||
          "OTP send nahi ho paya.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Verify Customer / Driver OTP
  |--------------------------------------------------------------------------
  */

  const handleVerifyOtp = async (
    event
  ) => {
    event.preventDefault();

    const trimmedPhone =
      phone.trim();

    const trimmedOtp =
      otp.trim();

    const trimmedName =
      name.trim();

    if (
      !/^[6-9]\d{9}$/.test(
        trimmedPhone
      )
    ) {
      notify(
        "Valid phone number enter karo.",
        "error"
      );

      setStep(1);

      return;
    }

    if (
      !/^\d{6}$/.test(
        trimmedOtp
      )
    ) {
      notify(
        "Valid 6 digit OTP enter karo.",
        "error"
      );

      return;
    }

    if (
      mode === "register" &&
      trimmedName.length < 2
    ) {
      notify(
        "Apna full name enter karo.",
        "error"
      );

      return;
    }

    try {
      setLoading(true);

      const payload = {
        phone: trimmedPhone,
        otp: trimmedOtp
      };

      /*
      |--------------------------------------------------------------------------
      | Registration Name
      |--------------------------------------------------------------------------
      */

      if (
        mode === "register"
      ) {
        payload.name =
          trimmedName;
      }

      /*
      |--------------------------------------------------------------------------
      | Driver Login Validator Compatibility
      |--------------------------------------------------------------------------
      */

      if (
        mode === "login" &&
        accountType ===
          "driver"
      ) {
        payload.name =
          trimmedName ||
          "HimRideG Driver";
      }

      const response =
        await api.post(
          getVerifyOtpEndpoint(),
          payload
        );

      const responseData =
        getResponseData(
          response
        );

      const accessToken =
        responseData
          ?.accessToken ||
        responseData?.token;

      const authenticatedUser =
        responseData?.user;

      if (!accessToken) {
        throw new Error(
          "Access token response me nahi mila."
        );
      }

      if (
        !authenticatedUser
      ) {
        throw new Error(
          "User information response me nahi mili."
        );
      }

      if (
        authenticatedUser.role &&
        authenticatedUser.role !==
          accountType
      ) {
        throw new Error(
          `Ye number ${authenticatedUser.role} account se registered hai.`
        );
      }

      saveLoginData(
        accessToken,
        authenticatedUser
      );

      notify(
        response?.data
          ?.message ||
          `${getRoleLabel()} login successful`,
        "success"
      );

      if (onSuccess) {
        onSuccess({
          ...responseData,

          accessToken,

          user:
            authenticatedUser,

          accountType:
            authenticatedUser.role ||
            accountType,

          message:
            response?.data
              ?.message ||
            "Login successful"
        });
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data
          ?.message ||
        error?.message ||
        "OTP verify nahi ho paya.";

      /*
      |--------------------------------------------------------------------------
      | New Customer Registration
      |--------------------------------------------------------------------------
      */

      if (
        mode === "login" &&
        accountType ===
          "customer" &&
        errorMessage
          .toLowerCase()
          .includes(
            "name is required"
          )
      ) {
        setMode("register");

        notify(
          "Naya customer account hai. Full name enter karke account create karo.",
          "info"
        );

        return;
      }

      notify(
        errorMessage,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Admin Login
  |--------------------------------------------------------------------------
  */

  const handleAdminLogin =
    async (event) => {
      event.preventDefault();

      const email =
        adminEmail
          .trim()
          .toLowerCase();

      const password =
        adminPassword;

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          email
        )
      ) {
        notify(
          "Valid admin email enter karo.",
          "error"
        );

        return;
      }

      if (
        password.length < 6
      ) {
        notify(
          "Admin password kam se kam 6 characters ka hona chahiye.",
          "error"
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await api.post(
            "/admin/login",
            {
              email,
              password
            }
          );

        const responseData =
          getResponseData(
            response
          );

        const accessToken =
          responseData
            ?.accessToken ||
          responseData?.token;

        const adminUser =
          responseData?.user;

        if (!accessToken) {
          throw new Error(
            "Admin access token response me nahi mila."
          );
        }

        if (!adminUser) {
          throw new Error(
            "Admin information response me nahi mili."
          );
        }

        if (
          adminUser.role !==
          "admin"
        ) {
          throw new Error(
            "Ye admin account nahi hai."
          );
        }

        saveLoginData(
          accessToken,
          adminUser
        );

        notify(
          response?.data
            ?.message ||
            "Admin login successful",
          "success"
        );

        if (onSuccess) {
          onSuccess({
            ...responseData,

            accessToken,

            user: adminUser,

            accountType:
              "admin",

            message:
              response?.data
                ?.message ||
              "Admin login successful"
          });
        }
      } catch (error) {
        notify(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Admin login nahi ho paya.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Resend OTP
  |--------------------------------------------------------------------------
  */

  const handleResendOtp =
    async () => {
      if (loading) {
        return;
      }

      try {
        setLoading(true);
        setDevelopmentOtp("");

        const response =
          await api.post(
            getSendOtpEndpoint(),
            {
              phone:
                phone.trim()
            }
          );

        const responseData =
          getResponseData(
            response
          );

        if (
          responseData
            ?.developmentOtp
        ) {
          const devOtp =
            String(
              responseData
                .developmentOtp
            );

          setDevelopmentOtp(
            devOtp
          );

          setOtp(devOtp);
        } else {
          setOtp("");
        }

        notify(
          response?.data
            ?.message ||
            "OTP dobara bhej diya gaya.",
          "success"
        );
      } catch (error) {
        notify(
          error?.response?.data
            ?.message ||
            error?.message ||
            "OTP resend nahi ho paya.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Change Phone
  |--------------------------------------------------------------------------
  */

  const handleChangePhone =
    () => {
      resetOtpStep();
    };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="authPage">
      <style>
        {`
          .authRoleSection {
            margin-bottom: 22px;
          }

          .authRoleHeading {
            display: block;
            margin-bottom: 10px;
            color: #344054;
            font-size: 13px;
            font-weight: 800;
          }

          .authRoleOptions {
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
            gap: 10px;
          }

          .authRoleButton {
            min-height: 52px;
            padding: 10px 12px;
            border: 2px solid #e1e5eb;
            border-radius: 13px;
            color: #344054;
            background: #ffffff;
            font-size: 14px;
            font-weight: 900;
            cursor: pointer;
            transition:
              border-color 0.2s ease,
              background 0.2s ease,
              transform 0.2s ease;
          }

          .authRoleButton:hover {
            transform: translateY(-1px);
            border-color: #f2bd16;
          }

          .authRoleButton.active {
            border-color: #f2bd16;
            color: #172033;
            background: #fff8db;
            box-shadow:
              0 7px 20px
              rgba(242, 189, 22, 0.18);
          }

          .authRoleButton:disabled {
            cursor: not-allowed;
            opacity: 0.65;
          }

          .authSelectedAccount {
            margin: 0 0 18px;
            padding: 11px 13px;
            border-radius: 11px;
            color: #344054;
            background: #f3f5f8;
            font-size: 13px;
            font-weight: 800;
          }

          .authSelectedAccount.driver {
            color: #075e31;
            background: #e9fff1;
          }

          .authSelectedAccount.customer {
            color: #1d4ed8;
            background: #eef4ff;
          }

          .authSelectedAccount.admin {
            color: #8a3800;
            background: #fff1e7;
          }

          .authToast.success {
            background: #087a36;
          }

          .authToast.error {
            background: #b42318;
          }

          .authToast.info {
            background: #172033;
          }

          .adminSecurityNote {
            margin: 15px 0 0;
            padding: 12px 13px;
            border: 1px solid #f2bd16;
            border-radius: 11px;
            color: #6b4b00;
            background: #fff8db;
            font-size: 12px;
            line-height: 1.5;
          }

          @media (max-width: 700px) {
            .authRoleOptions {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      {message && (
        <div
          className={`authToast ${messageType}`}
        >
          {message}
        </div>
      )}

      {/* ── Terms Modal ── */}
      {showTermsModal && (
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}} onClick={()=>setShowTermsModal(false)}>
          <div style={{background:"#fff",borderRadius:"16px",maxWidth:"680px",width:"100%",maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"20px 24px",borderBottom:"1px solid #eee",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h2 style={{margin:0,fontSize:"18px",color:"#172033"}}>Terms & Conditions</h2>
              <button type="button" onClick={()=>setShowTermsModal(false)} style={{background:"#f3f5f8",border:"none",borderRadius:"8px",padding:"6px 12px",cursor:"pointer",fontWeight:"700"}}>✕ Close</button>
            </div>
            <div style={{overflowY:"auto",padding:"24px",fontSize:"13px",lineHeight:1.7,color:"#344054"}}>
              <p><strong>Effective Date:</strong> 01/01/2025</p>
              <h3>1. About HimRideG</h3>
              <p>HimRideG is a local ride-hailing platform connecting customers and verified commercial taxi drivers in Himachal Pradesh. By using this platform you agree to these Terms.</p>
              <h3>2. Account Eligibility</h3>
              <p>You must be 18+ to create an account. You are responsible for providing accurate information during registration. One person may not operate multiple accounts.</p>
              <h3>3. Driver Requirements</h3>
              <p>Drivers must hold a valid commercial driving licence, vehicle RC, commercial permit, insurance and fitness certificate. All documents must be genuine and submitted for admin verification. False or forged documents will result in permanent account termination.</p>
              <h3>4. Document Verification & Approval</h3>
              <p>Driver documents are reviewed manually by HimRideG admin. Drivers may not go online or receive rides until all required documents are verified and the account is approved.</p>
              <h3>5. Booking & Ride Rules</h3>
              <p>Rides are created by customers and accepted by available drivers. The final fare is negotiated between customer and driver. Once locked, the fare cannot be changed. Both parties must complete the ride as agreed.</p>
              <h3>6. Fare Negotiation</h3>
              <p>Drivers propose an initial fare. Customers may accept or counter-offer. After the negotiation limit, the driver&apos;s final offer becomes the locked fare. Customers must accept or cancel before the ride begins.</p>
              <h3>7. Cancellation</h3>
              <p>Either party may cancel before the ride starts. Repeated unnecessary cancellations may result in account warnings or suspension.</p>
              <h3>8. Payment</h3>
              <p>Payment is made through the platform wallet or UPI. Cash arrangements are between customer and driver. Platform does not guarantee payment disputes outside the platform.</p>
              <h3>9. Behaviour & Safety</h3>
              <p>Abuse, harassment, fraud, illegal activity or threats are strictly prohibited. Violations may result in immediate suspension or permanent blocking of the account.</p>
              <h3>10. Tracking & Location</h3>
              <p>Location data is used solely for ride matching, navigation and safety purposes. Live tracking is active only during rides.</p>
              <h3>11. Liability Limitation</h3>
              <p>HimRideG is a technology platform connecting customers and independent service-provider drivers. HimRideG is not responsible for accidents, delays, traffic, road closures or weather conditions beyond its reasonable control.</p>
              <h3>12. Account Actions</h3>
              <p>Accounts may receive warnings, suspension or permanent blocking for violations. Fraud, fake documents or repeated misconduct will result in termination.</p>
              <h3>13. Refunds & Disputes</h3>
              <p>Disputes must be raised through the platform support channel. Refunds are handled case-by-case based on investigation findings.</p>
              <h3>14. Updates to Terms</h3>
              <p>HimRideG may update these Terms at any time. Continued use of the platform after changes constitutes acceptance.</p>
              <h3>15. Governing Law</h3>
              <p>These Terms are governed by Indian law. Disputes shall be subject to the jurisdiction of courts in Himachal Pradesh.</p>
              <h3>16. Contact</h3>
              <p>For support: support@himrideg.com | HimRideG, Himachal Pradesh, India</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Privacy Policy Modal ── */}
      {showPrivacyModal && (
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}} onClick={()=>setShowPrivacyModal(false)}>
          <div style={{background:"#fff",borderRadius:"16px",maxWidth:"680px",width:"100%",maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"20px 24px",borderBottom:"1px solid #eee",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h2 style={{margin:0,fontSize:"18px",color:"#172033"}}>Privacy Policy</h2>
              <button type="button" onClick={()=>setShowPrivacyModal(false)} style={{background:"#f3f5f8",border:"none",borderRadius:"8px",padding:"6px 12px",cursor:"pointer",fontWeight:"700"}}>✕ Close</button>
            </div>
            <div style={{overflowY:"auto",padding:"24px",fontSize:"13px",lineHeight:1.7,color:"#344054"}}>
              <p><strong>Effective Date:</strong> 01/01/2025 | <strong>Last Updated:</strong> 01/01/2025</p>
              <h3>1. Data We Collect — Customers</h3>
              <p>Name, mobile number, alternate mobile, email, address, profile photo, pickup & destination locations, approximate/precise location (with permission), ride history, booking status, support requests, ratings and payment transaction references.</p>
              <h3>2. Data We Collect — Drivers</h3>
              <p>Legal name, verified mobile, email, residential address, photograph, identity-verification documents (Aadhaar/government ID, DL, RC, permit, insurance, fitness certificate), vehicle photographs, bank/UPI information for payouts, approval status, trip records, ratings, warnings and grievance records.</p>
              <h3>3. Location Data</h3>
              <p>Location is used for: pickup identification, driver discovery, distance & fare calculation, navigation, live ride tracking and safety. Location access depends on device permissions. Live tracking stops when the ride ends.</p>
              <h3>4. Why We Use Your Data</h3>
              <p>Account creation & OTP verification; ride booking & driver matching; fare calculation; payment processing; document verification; fraud prevention; driver & passenger safety; support & complaints; legal compliance; and improving platform reliability.</p>
              <h3>5. Aadhaar & Identity Documents</h3>
              <p>Driver identity documents are used only for onboarding, verification and safety. Documents are stored in non-public, access-controlled storage. Verified documents are locked to protect the integrity of the verification process. HimRideG prefers Masked Aadhaar or alternative government-issued ID where legally accepted.</p>
              <h3>6. Data Sharing</h3>
              <p>We share limited data with: assigned driver/customer (only ride-relevant info); payment providers; mapping/navigation providers; OTP/SMS providers; cloud infrastructure providers; authorized verification services; and government/law-enforcement when legally required. We do not sell personal data.</p>
              <h3>7. Driver Info Visible to Customers</h3>
              <p>For confirmed rides, customers see: driver name, profile photo, vehicle type, vehicle number and rating. Private identity documents are never shared with customers.</p>
              <h3>8. Security</h3>
              <p>We use encrypted communications, controlled admin access, role-based document access, authentication protections and regular security monitoring. No internet service can guarantee absolute security. Report suspected unauthorized access immediately.</p>
              <h3>9. Data Retention</h3>
              <p>Account data is retained while the account is active. Ride, payment and transaction records are retained as required by law. Driver verification documents are retained for legal compliance periods. Data no longer required is securely erased.</p>
              <h3>10. Your Rights</h3>
              <p>You may request access to, correction of, or erasure of your data. Requests require identity verification. Contact: privacy@himrideg.com</p>
              <h3>11. Account Deletion</h3>
              <p>You may request account deletion through the app or by email. Certain data may be retained for legal, tax, fraud prevention or dispute-resolution requirements.</p>
              <h3>12. Changes</h3>
              <p>This Privacy Policy may be updated. Material changes will be communicated through the app.</p>
              <h3>13. Contact</h3>
              <p>Grievance Officer: grievance@himrideg.com | HimRideG, Himachal Pradesh, India</p>
            </div>
          </div>
        </div>
      )}

      <header className="authTopbar">
        <button
          type="button"
          className="authBrandButton"
          onClick={onBack}
          aria-label="Back to home"
        >
          <img
            src="/himrideg-logo.png"
            alt="HimRideG"
            className="authBrandLogo"
          />
        </button>

        <button
          type="button"
          className="authBackButton"
          onClick={onBack}
        >
          ← Back to Home
        </button>
      </header>

      <main className="authLayout">
        <section className="authVisualPanel">
          <div
            className="authVisualShade"
          />

          <div
            className="authVisualContent"
          >
            <span
              className="authVisualTag"
            >
              HIMACHAL KI APNI RIDE
            </span>

            <h1>
              Himachal Ki
              <span>
                Apni Ride
              </span>
            </h1>

            <p>
              Safe travel. Trusted
              drivers.
              <br />
              Har safar, befikar.
            </p>

            <div
              className="authBenefits"
            >
              <article>
                <div>✓</div>

                <span>
                  <strong>
                    Verified Drivers
                  </strong>

                  <small>
                    Trusted and approved
                    local drivers
                  </small>
                </span>
              </article>

              <article>
                <div>₹</div>

                <span>
                  <strong>
                    Transparent Fares
                  </strong>

                  <small>
                    No hidden charges
                  </small>
                </span>
              </article>

              <article>
                <div>⌖</div>

                <span>
                  <strong>
                    Live Ride Tracking
                  </strong>

                  <small>
                    Track your ride in
                    real-time
                  </small>
                </span>
              </article>
            </div>
          </div>
        </section>

        <section
          className="authFormPanel"
        >
          <div className="authCard">
            <div style={{textAlign:"center",marginBottom:"12px"}}>
              <img src="/himrideg-logo.png" alt="HimRideG" style={{height:"48px",width:"auto",objectFit:"contain"}} />
            </div>
            <div
              className="authCardIcon"
            >
              {accountType ===
              "admin"
                ? "🛡️"
                : accountType ===
                    "driver"
                  ? "🚕"
                  : "⛰"}
            </div>

            <h2>
              {accountType ===
              "admin"
                ? "Admin Login"
                : mode ===
                    "register"
                  ? "Create your account"
                  : "Welcome back"}
            </h2>

            <p
              className="authSubtitle"
            >
              {accountType ===
              "admin"
                ? "Secure HimRideG administration access"
                : mode ===
                    "register"
                  ? "Customer ya Driver account select karke Sign Up karo"
                  : "Customer, Driver aur Admin yahin se Login kar sakte hain"}
            </p>

            <div
              className="authRoleSection"
            >
              <span
                className="authRoleHeading"
              >
                {mode === "register"
                  ? "Choose Sign Up Type"
                  : "Login As"}
              </span>

              <div
                className="authRoleOptions"
              >
                <button
                  type="button"
                  className={`authRoleButton ${
                    accountType ===
                    "customer"
                      ? "active"
                      : ""
                  }`}
                  disabled={loading}
                  onClick={() =>
                    changeAccountType(
                      "customer"
                    )
                  }
                >
                  👤 Customer{" "}
                  {mode ===
                  "register"
                    ? "Sign Up"
                    : "Login"}
                </button>

                <button
                  type="button"
                  className={`authRoleButton ${
                    accountType ===
                    "driver"
                      ? "active"
                      : ""
                  }`}
                  disabled={loading}
                  onClick={() =>
                    changeAccountType(
                      "driver"
                    )
                  }
                >
                  🚕 Driver{" "}
                  {mode ===
                  "register"
                    ? "Sign Up"
                    : "Login"}
                </button>

                {mode === "login" && (
                  <button
                    type="button"
                    className={`authRoleButton ${
                      accountType ===
                      "admin"
                        ? "active"
                        : ""
                    }`}
                    disabled={loading}
                    onClick={() =>
                      changeAccountType(
                        "admin"
                      )
                    }
                  >
                    🛡️ Admin Login
                  </button>
                )}
              </div>
            </div>

            <div
              className={`authSelectedAccount ${accountType}`}
            >
              Selected:{" "}
              {getRoleLabel()}{" "}
              {accountType ===
              "admin"
                ? "Login"
                : mode ===
                    "register"
                  ? "Sign Up"
                  : "Login"}
            </div>

            {accountType ===
            "admin" ? (
              /*
              |--------------------------------------------------------------------------
              | Admin Email Password Login
              |--------------------------------------------------------------------------
              */

              <form
                onSubmit={
                  handleAdminLogin
                }
              >
                <label
                  className="authField"
                >
                  <span>
                    Admin Email
                  </span>

                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="Enter admin email"
                    value={adminEmail}
                    onChange={(
                      event
                    ) =>
                      setAdminEmail(
                        event.target
                          .value
                      )
                    }
                    disabled={loading}
                    required
                  />
                </label>

                <label
                  className="authField"
                >
                  <span>
                    Admin Password
                  </span>

                  <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter admin password"
                    value={
                      adminPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setAdminPassword(
                        event.target
                          .value
                      )
                    }
                    disabled={loading}
                    required
                  />
                </label>

                <button
                  className="authPrimaryButton"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Logging in..."
                    : "Login as Admin"}

                  <span>→</span>
                </button>

                <p
                  className="adminSecurityNote"
                >
                  Admin access sirf
                  authorized HimRideG
                  administrator ke liye
                  hai.
                </p>
              </form>
            ) : step === 1 ? (
              /*
              |--------------------------------------------------------------------------
              | Send OTP Form
              |--------------------------------------------------------------------------
              */

              <form
                onSubmit={
                  handleSendOtp
                }
              >
                <label
                  className="authLabel"
                >
                  Phone Number
                </label>

                <div
                  className="authPhoneField"
                >
                  <span>+91</span>

                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(
                      event
                    ) =>
                      setPhone(
                        cleanPhone(
                          event.target
                            .value
                        )
                      )
                    }
                    maxLength={10}
                    disabled={loading}
                  />
                </div>

                {accountType !== "admin" && (
                  <div style={{marginBottom:"14px"}}>
                    <label style={{display:"flex",alignItems:"flex-start",gap:"10px",cursor:"pointer",fontSize:"13px",color:"#344054",lineHeight:1.5}}>
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={e=>{setTermsAccepted(e.target.checked);setTermsError(false);}}
                        style={{marginTop:"2px",width:"16px",height:"16px",accentColor:"#f2bd16",flexShrink:0,
                          outline: termsError ? "2px solid #b42318" : "none",
                          borderRadius:"3px"}}
                      />
                      <span>
                        I have read and agree to HimRideG&apos;s{" "}
                        <button type="button" onClick={()=>setShowTermsModal(true)} style={{background:"none",border:"none",color:"#f2bd16",fontWeight:"700",cursor:"pointer",padding:0,textDecoration:"underline",fontSize:"13px"}}>Terms & Conditions</button>
                        {" "}and acknowledge the{" "}
                        <button type="button" onClick={()=>setShowPrivacyModal(true)} style={{background:"none",border:"none",color:"#f2bd16",fontWeight:"700",cursor:"pointer",padding:0,textDecoration:"underline",fontSize:"13px"}}>Privacy Policy</button>.
                      </span>
                    </label>
                    {termsError && <p style={{color:"#b42318",fontSize:"12px",margin:"6px 0 0"}}>Please accept Terms & Conditions to continue.</p>}
                  </div>
                )}

                <button
                  className="authPrimaryButton"
                  type="submit"
                  disabled={loading || (accountType !== "admin" && !termsAccepted)}
                  onClick={e => {
                    if (accountType !== "admin" && !termsAccepted) {
                      e.preventDefault();
                      setTermsError(true);
                    }
                  }}
                  style={{opacity: (accountType !== "admin" && !termsAccepted) ? 0.6 : 1}}
                >
                  {loading
                    ? "Sending OTP..."
                    : `Send ${getRoleLabel()} OTP`}

                  <span>→</span>
                </button>
              </form>
            ) : (
              /*
              |--------------------------------------------------------------------------
              | Verify OTP Form
              |--------------------------------------------------------------------------
              */

              <form
                onSubmit={
                  handleVerifyOtp
                }
              >
                <div
                  className="authField"
                >
                  <span>
                    Phone Number
                  </span>

                  <input
                    type="text"
                    value={`+91 ${phone}`}
                    readOnly
                  />
                </div>

                {mode ===
                  "register" && (
                  <label
                    className="authField"
                  >
                    <span>
                      Full Name
                    </span>

                    <input
                      type="text"
                      autoComplete="name"
                      placeholder={
                        accountType ===
                        "driver"
                          ? "Enter driver full name"
                          : "Enter your full name"
                      }
                      value={name}
                      onChange={(
                        event
                      ) =>
                        setName(
                          event.target
                            .value
                        )
                      }
                      disabled={
                        loading
                      }
                      required
                    />
                  </label>
                )}

                <label
                  className="authField"
                >
                  <span>
                    Enter OTP
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter 6 digit OTP"
                    value={otp}
                    onChange={(
                      event
                    ) =>
                      setOtp(
                        cleanOtp(
                          event.target
                            .value
                        )
                      )
                    }
                    maxLength={6}
                    disabled={loading}
                    required
                    autoFocus
                  />
                </label>

                {developmentOtp && (
                  <p
                    className="authTerms"
                  >
                    Development OTP:{" "}
                    <strong>
                      {developmentOtp}
                    </strong>
                  </p>
                )}

                <button
                  className="authPrimaryButton"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Verifying..."
                    : mode ===
                        "register"
                      ? `Create ${getRoleLabel()} Account`
                      : `Login as ${getRoleLabel()}`}

                  <span>→</span>
                </button>

                <button
                  type="button"
                  className="authEditPhone"
                  onClick={
                    handleChangePhone
                  }
                  disabled={loading}
                >
                  Change phone number
                </button>

                <button
                  type="button"
                  className="authEditPhone"
                  onClick={
                    handleResendOtp
                  }
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </form>
            )}

            {accountType !==
              "admin" && (
              <>
                <div
                  className="authDivider"
                >
                  <span />
                  <p>or</p>
                  <span />
                </div>

                <button
                  type="button"
                  className="authSocialButton"
                  onClick={() =>
                    notify(
                      "Google login baad me connect hoga.",
                      "info"
                    )
                  }
                >
                  <b>G</b>
                  Continue with Google
                </button>

                <button
                  type="button"
                  className="authSocialButton"
                  onClick={() =>
                    notify(
                      "Apple login baad me connect hoga.",
                      "info"
                    )
                  }
                >
                  <b>●</b>
                  Continue with Apple
                </button>

                <p
                  className="authTerms"
                >
                  By continuing, you
                  agree to our
                  <a href="#terms">
                    {" "}
                    Terms of Service{" "}
                  </a>
                  and
                  <a href="#privacy">
                    {" "}
                    Privacy Policy
                  </a>
                  .
                </p>

                <div
                  className="authModeSwitch"
                >
                  {mode ===
                  "login" ? (
                    <>
                      New to HimRideG?

                      <button
                        type="button"
                        onClick={() =>
                          changeMode(
                            "register"
                          )
                        }
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an
                      account?

                      <button
                        type="button"
                        onClick={() =>
                          changeMode(
                            "login"
                          )
                        }
                      >
                        Log in
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AuthPage;