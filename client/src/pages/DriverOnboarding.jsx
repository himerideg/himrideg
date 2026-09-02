import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import api from "../api";

import "../driver-onboarding.css";

/*
|--------------------------------------------------------------------------
| Document Icons
|--------------------------------------------------------------------------
*/

const DOCUMENT_ICONS = {
  aadhaar: "🪪",
  driving_license: "🚗",
  vehicle_rc: "📄",
  vehicle_photo: "📸",
  permit: "📋",
  insurance: "🛡️",
  pollution_certificate: "🌿"
};

const VEHICLE_TYPES = [
  { value: "hatchback", label: "Hatchback" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "traveller", label: "Traveller" },
  { value: "bike", label: "Bike" },
  { value: "other", label: "Other" }
];

const VEHICLE_CLASSES = [
  { value: "motor_cab", label: "Motor Cab (Taxi)" },
  { value: "maxi_cab", label: "Maxi Cab" },
  { value: "lmv_taxi", label: "LMV - Taxi" },
  { value: "omni_bus", label: "Omni Bus" },
  { value: "other", label: "Other" }
];

const FUEL_TYPES = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "cng", label: "CNG" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" }
];

/*
|--------------------------------------------------------------------------
| Driver Onboarding Popup
|--------------------------------------------------------------------------
| Dashboard ke upar popup ke roop mein aata hai.
| Pehle intro screen, "Upload Documents" tap karte hi form khulta hai.
*/

function DriverOnboarding({
  onApproved,
  user
}) {
  const [view, setView] = useState("intro");

  /*
  |--------------------------------------------------------------------------
  | Parent Approved User Safety — Phase 10 ADD-ONLY
  |--------------------------------------------------------------------------
  */

  const parentUserApproved =
    Boolean(
      user?.approved === true ||
        user?.isApproved === true ||
        user?.driverProfile
          ?.isApproved === true ||
        String(
          user?.approvalStatus ||
            user?.driverProfile
              ?.approvalStatus ||
            ""
        )
          .trim()
          .toLowerCase() ===
          "approved" ||
        (
          user?.driverProfile
            ?.approvedAt &&
          user?.driverProfile
            ?.approvedBy
        )
    );

  const [onboarding, setOnboarding] =
    useState(null);

  const [vehicle, setVehicle] = useState({
    vehicleClass: "motor_cab",
    vehicleType: "sedan",
    brand: "",
    model: "",
    color: "",
    registrationNumber: "",
    fuelType: "petrol",
    seatingCapacity: 4,
    manufacturingYear: ""
  });

  const [loading, setLoading] =
    useState(true);

  const [savingVehicle, setSavingVehicle] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [uploadingType, setUploadingType] =
    useState("");

  // NEW: Legal name as per Aadhaar
  const [legalName, setLegalName] = useState("");

  const [notice, setNotice] = useState({
    text: "",
    type: ""
  });

  const fileInputRef = useRef(null);
  const pendingDocTypeRef = useRef("");
  const onApprovedRef = useRef(onApproved);
  const vehicleDirtyRef = useRef(false);

  useEffect(() => {
    onApprovedRef.current = onApproved;
  }, [onApproved]);

  /*
  |------------------------------------------------------------------
  | Load Status
  |------------------------------------------------------------------
  */

  const loadStatus = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }

      try {
        const { data } = await api.get(
          "/driver/onboarding"
        );

        const status =
          data?.data?.onboarding;

        const vehicleData =
          data?.data?.vehicle || {};

        setOnboarding(status || null);

        if (!vehicleDirtyRef.current) {
          setVehicle((current) => ({
            ...current,
            vehicleClass:
              vehicleData.vehicleClass ||
              "motor_cab",
            vehicleType:
              vehicleData.vehicleType ||
              "sedan",
            brand: vehicleData.brand || "",
            model: vehicleData.model || "",
            color: vehicleData.color || "",
            registrationNumber:
              vehicleData.registrationNumber ||
              "",
            fuelType:
              vehicleData.fuelType ||
              "petrol",
            seatingCapacity:
              vehicleData.seatingCapacity ||
              4,
            manufacturingYear:
              vehicleData.manufacturingYear ||
              ""
          }));
        }

        /*
        |------------------------------------------------------------------
        | Canonical Approved Driver Bypass — ADD-ONLY FIX
        |------------------------------------------------------------------
        | Backend ke isApproved ke saath approvalStatus ko bhi accept karo.
        | Admin-approved driver ko documents stale/missing dikhne par popup
        | reopen nahi hona chahiye.
        */

        const canonicalApproved =
          Boolean(
            parentUserApproved ||
              status?.isApproved === true ||
              String(
                status?.approvalStatus || ""
              )
                .trim()
                .toLowerCase() ===
                "approved"
          );

        if (canonicalApproved) {
          onApprovedRef.current?.();
        }
      } catch (error) {
        setNotice({
          text:
            error?.response?.data
              ?.message ||
            "Status load nahi ho saka.",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    },
    [
      parentUserApproved
    ]
  );

  useEffect(() => {
    if (
      parentUserApproved
    ) {
      onApprovedRef.current?.();
      return;
    }

    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    parentUserApproved
  ]);

  useEffect(() => {
    if (
      onboarding?.approvalStatus !==
      "pending"
    ) {
      return undefined;
    }

    const timer = setInterval(() => {
      loadStatus(true);
    }, 30000);

    return () => clearInterval(timer);
  }, [
    onboarding?.approvalStatus,
    loadStatus
  ]);

  /*
  |------------------------------------------------------------------
  | Vehicle Save
  |------------------------------------------------------------------
  */

  const editVehicle = useCallback(
    (patch) => {
      vehicleDirtyRef.current = true;
      setVehicle((current) => ({
        ...current,
        ...patch
      }));
    },
    []
  );

  const saveVehicle = async () => {
    setNotice({ text: "", type: "" });
    setSavingVehicle(true);

    try {
      const { data } = await api.patch(
        "/driver/vehicle",
        vehicle
      );

      setOnboarding(
        data?.data?.onboarding ||
          onboarding
      );

      vehicleDirtyRef.current = false;

      setNotice({
        text:
          data?.message ||
          "Vehicle details save ho gayi",
        type: "success"
      });
    } catch (error) {
      setNotice({
        text:
          error?.response?.data?.message ||
          "Vehicle details save nahi hui.",
        type: "error"
      });
    } finally {
      setSavingVehicle(false);
    }
  };

  /*
  |------------------------------------------------------------------
  | Document Upload
  |------------------------------------------------------------------
  */

  const openFilePicker = (documentType) => {
    pendingDocTypeRef.current =
      documentType;

    fileInputRef.current?.click();
  };

  const handleFileSelected = async (
    event
  ) => {
    const file = event.target.files?.[0];
    const documentType =
      pendingDocTypeRef.current;

    event.target.value = "";

    if (!file || !documentType) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotice({
        text: "File 5 MB se choti honi chahiye.",
        type: "error"
      });
      return;
    }

    setUploadingType(documentType);
    setNotice({ text: "", type: "" });

    try {
      const formData = new FormData();
      formData.append("document", file);

      await api.post(
        `/driver/documents/${documentType}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

      setNotice({
        text: "Document upload ho gaya!",
        type: "success"
      });

      await loadStatus(true);
    } catch (error) {
      setNotice({
        text:
          error?.response?.data?.message ||
          "Document upload nahi hua.",
        type: "error"
      });
    } finally {
      setUploadingType("");
    }
  };

  /*
  |------------------------------------------------------------------
  | Submit
  |------------------------------------------------------------------
  */

  const submitApproval = async () => {
    setNotice({ text: "", type: "" });
    setSubmitting(true);

    try {
      const { data } = await api.post(
        "/driver/submit-approval"
      );

      setOnboarding(
        data?.data?.onboarding ||
          onboarding
      );

      setNotice({
        text:
          data?.message ||
          "Request bhej di gayi!",
        type: "success"
      });
    } catch (error) {
      setNotice({
        text:
          error?.response?.data?.message ||
          "Request submit nahi hui.",
        type: "error"
      });
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |------------------------------------------------------------------
  | Loading
  |------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="onbOverlay">
        <div className="onbModal onbModalSmall">
          <div className="onbSpinner" />
          <p className="onbLoadText">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  const approvalStatus =
    onboarding?.approvalStatus ||
    "not_submitted";

  const isPending =
    approvalStatus === "pending";

  const isRejected =
    approvalStatus === "rejected";

  const isComplete = Boolean(
    onboarding?.isComplete
  );

  const progress =
    onboarding?.progressPercent || 0;

  const docList =
    onboarding?.documentChecklist || [];

  const totalDocs = docList.length;

  const doneDocs = docList.filter(
    (doc) => doc.uploaded
  ).length;

  /*
  |------------------------------------------------------------------
  | Pending Popup
  |------------------------------------------------------------------
  */

  if (isPending) {
    return (
      <div className="onbOverlay">
        <div className="onbModal onbModalSmall">
          <div className="onbBigIcon">
            ⏳
          </div>
          <h2>Approval Pending</h2>
          <p>
            Aapke saare documents mil gaye
            hain. Admin verification kar
            raha hai — 24 se 48 ghante lag
            sakte hain.
          </p>
          <p className="onbSubText">
            Approve hote hi aapka dashboard
            khud khul jayega.
          </p>

          <button
            type="button"
            className="onbPrimaryBtn"
            onClick={() => loadStatus()}
          >
            Status Refresh Karo
          </button>
        </div>
      </div>
    );
  }

  /*
  |------------------------------------------------------------------
  | Intro Popup
  |------------------------------------------------------------------
  */

  if (view === "intro") {
    return (
      <div className="onbOverlay">
        <div className="onbModal onbModalSmall">
          <div className="onbBigIcon">
            {isRejected ? "❌" : "📋"}
          </div>

          <h2>
            {isRejected
              ? "Request Reject Hui"
              : "Verification Baaki Hai"}
          </h2>

          {isRejected &&
          onboarding?.rejectionReason ? (
            <div className="onbRejectBox">
              <strong>Reason:</strong>
              <p>
                {
                  onboarding.rejectionReason
                }
              </p>
            </div>
          ) : (
            <p>
              Rides lene ke liye pehle apne
              documents aur gaadi ki
              jaankari verify karwani hogi.
            </p>
          )}

          <div className="onbProgressWrap">
            <div className="onbProgressBar">
              <div
                className="onbProgressFill"
                style={{
                  width: `${progress}%`
                }}
              />
            </div>
            <span>
              {progress}% complete
            </span>
          </div>

          <div className="onbQuickStat">
            📄 {doneDocs} / {totalDocs}{" "}
            documents uploaded
          </div>

          <button
            type="button"
            className="onbPrimaryBtn"
            onClick={() => setView("form")}
          >
            📤 Upload Documents
          </button>

          <p className="onbSubText">
            Approval milne tak aap rides
            accept nahi kar sakte.
          </p>
        </div>
      </div>
    );
  }

  /*
  |------------------------------------------------------------------
  | Form Popup
  |------------------------------------------------------------------
  */

  return (
    <div className="onbOverlay">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      <div className="onbModal">
        <header className="onbModalHead">
          <button
            type="button"
            className="onbBackBtn"
            onClick={() => setView("intro")}
          >
            ←
          </button>
          <div>
            <small>
              DRIVER VERIFICATION
            </small>
            <h2>Documents & Vehicle</h2>
          </div>
        </header>

        <div className="onbModalBody">
          <div className="onbProgressWrap">
            <div className="onbProgressBar">
              <div
                className="onbProgressFill"
                style={{
                  width: `${progress}%`
                }}
              />
            </div>
            <span>
              {progress}% complete
            </span>
          </div>

          {notice.text && (
            <div
              className={`onbNotice ${notice.type}`}
            >
              {notice.text}
            </div>
          )}

          {/* ═══ STEP 0: Legal Name as per Aadhaar (NEW) ═══ */}
          <section className="onbSection" style={{
            background:"rgba(245,197,24,0.06)",
            border:"1px solid rgba(245,197,24,0.25)",
            borderRadius:"14px",
            padding:"20px"
          }}>
            <div className="onbSectionHead">
              <span className="onbStepBadge" style={{background:"#f5c518",color:"#000"}}>0</span>
              <div>
                <h3>Legal Name (As per Aadhaar)</h3>
                <p>Bilkul wohi naam likho jo Aadhaar card par hai</p>
              </div>
            </div>
            {onboarding?.driverProfile?.legalNameVerified ? (
              <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"12px 14px",background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:"10px"}}>
                <span style={{fontSize:"20px"}}>🔒</span>
                <div>
                  <div style={{color:"#4ade80",fontWeight:"700",fontSize:"15px"}}>{onboarding?.driverProfile?.legalName||"—"}</div>
                  <div style={{color:"#888",fontSize:"12px",marginTop:"2px"}}>✓ Admin ne verify kar diya — naam lock hai</div>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Jaise: Nishan Kumar / Rajesh Sharma"
                  value={legalName}
                  onChange={e=>setLegalName(e.target.value)}
                  maxLength={100}
                  style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(245,197,24,0.3)",borderRadius:"10px",color:"#fff",fontSize:"15px",fontWeight:"500",boxSizing:"border-box",outline:"none",marginBottom:"8px"}}
                />
                <p style={{color:"#888",fontSize:"12px",margin:0}}>⚠️ Exactly same naam jo Aadhaar par hai — admin verify karke lock karega</p>
                {legalName.trim().length>=2&&(
                  <button type="button"
                    style={{marginTop:"10px",padding:"8px 20px",background:"#f5c518",border:"none",borderRadius:"8px",color:"#000",fontWeight:"700",cursor:"pointer",fontSize:"13px"}}
                    onClick={async()=>{
                      try{
                        await api.patch("/driver/profile",{aadhaarName:legalName.trim()});
                        setNotice({text:"Naam save ho gaya ✓",type:"success"});
                      }catch{
                        setNotice({text:"Naam save nahi hua",type:"error"});
                      }
                    }}
                  >💾 Save Name</button>
                )}
              </div>
            )}
          </section>

          {/* ═══ END STEP 0 ═══ */}
          <section className="onbSection">
            <div className="onbSectionHead">
              <span className="onbStepBadge">
                1
              </span>
              <div>
                <h3>
                  Required Documents
                </h3>
                <p>
                  JPG, PNG, WEBP ya PDF —
                  max 5 MB
                </p>
              </div>
            </div>

            <div className="onbDocList">
              {docList.map((doc) => (
                <div
                  key={doc.type}
                  className={`onbDocItem ${
                    doc.uploaded
                      ? "done"
                      : "missing"
                  } ${
                    doc.status ===
                    "rejected"
                      ? "rejected"
                      : ""
                  }`}
                >
                  <div className="onbDocIcon">
                    {DOCUMENT_ICONS[
                      doc.type
                    ] || "📎"}
                  </div>

                  <div className="onbDocInfo">
                    <strong>
                      {doc.label}
                    </strong>
                    <span
                      className={`onbDocStatus ${doc.status}`}
                    >
                      {doc.status ===
                        "not_uploaded" &&
                        "Not uploaded"}
                      {doc.status ===
                        "pending" &&
                        "Verification pending"}
                      {doc.status ===
                        "verified" &&
                        "✓ Verified"}
                      {doc.status ===
                        "rejected" &&
                        "✗ Rejected"}
                    </span>
                    {doc.rejectionReason && (
                      <small className="onbDocReason">
                        {
                          doc.rejectionReason
                        }
                      </small>
                    )}
                  </div>

                  <button
                    type="button"
                    className="onbUploadBtn"
                    disabled={
                      uploadingType ===
                      doc.type
                    }
                    onClick={() =>
                      openFilePicker(
                        doc.type
                      )
                    }
                  >
                    {uploadingType ===
                    doc.type
                      ? "..."
                      : doc.uploaded
                      ? "Re-upload"
                      : "Upload"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="onbSection">
            <div className="onbSectionHead">
              <span className="onbStepBadge">
                2
              </span>
              <div>
                <h3>Vehicle Details</h3>
                <p>
                  Gaadi ki jaankari bharo
                </p>
              </div>
            </div>

            <div className="onbCommercialNote">
              <strong>
                ⚠️ Sirf Commercial Vehicle
              </strong>
              <p>
                HimRideG par sirf yellow
                plate (commercial) gaadi
                allowed hai. RC par vehicle
                class Motor Cab / Maxi Cab
                / LMV-Taxi honi chahiye.
              </p>
            </div>

            <div className="onbFieldGrid">
              <label>
                <span>
                  Vehicle Number{" "}
                  <b className="req">*</b>
                </span>
                <input
                  type="text"
                  placeholder="HP01AB1234"
                  value={
                    vehicle.registrationNumber
                  }
                  onChange={(e) =>
                    editVehicle({
                      registrationNumber:
                        e.target.value.toUpperCase()
                    })
                  }
                />
              </label>

              <label>
                <span>Vehicle Class</span>
                <select
                  value={
                    vehicle.vehicleClass
                  }
                  onChange={(e) =>
                    editVehicle({
                      vehicleClass:
                        e.target.value
                    })
                  }
                >
                  {VEHICLE_CLASSES.map(
                    (item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span>
                  Brand{" "}
                  <b className="req">*</b>
                </span>
                <input
                  type="text"
                  placeholder="Maruti Suzuki"
                  value={vehicle.brand}
                  onChange={(e) =>
                    editVehicle({
                      brand: e.target.value
                    })
                  }
                />
              </label>

              <label>
                <span>
                  Model{" "}
                  <b className="req">*</b>
                </span>
                <input
                  type="text"
                  placeholder="Dzire"
                  value={vehicle.model}
                  onChange={(e) =>
                    editVehicle({
                      model: e.target.value
                    })
                  }
                />
              </label>

              <label>
                <span>Vehicle Type</span>
                <select
                  value={
                    vehicle.vehicleType
                  }
                  onChange={(e) =>
                    editVehicle({
                      vehicleType:
                        e.target.value
                    })
                  }
                >
                  {VEHICLE_TYPES.map(
                    (item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span>Color</span>
                <input
                  type="text"
                  placeholder="White"
                  value={vehicle.color}
                  onChange={(e) =>
                    editVehicle({
                      color: e.target.value
                    })
                  }
                />
              </label>

              <label>
                <span>Fuel Type</span>
                <select
                  value={vehicle.fuelType}
                  onChange={(e) =>
                    editVehicle({
                      fuelType:
                        e.target.value
                    })
                  }
                >
                  {FUEL_TYPES.map(
                    (item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span>
                  Seating Capacity
                </span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={
                    vehicle.seatingCapacity
                  }
                  onChange={(e) =>
                    editVehicle({
                      seatingCapacity:
                        e.target.value
                    })
                  }
                />
              </label>
            </div>

            <button
              type="button"
              className="onbSaveBtn"
              onClick={saveVehicle}
              disabled={savingVehicle}
            >
              {savingVehicle
                ? "Save ho raha hai..."
                : "Vehicle Details Save Karo"}
            </button>
          </section>

          <section className="onbSection">
            <div className="onbSectionHead">
              <span className="onbStepBadge">
                3
              </span>
              <div>
                <h3>
                  Submit for Approval
                </h3>
                <p>
                  Sab complete hone par
                  admin ko request jayegi
                </p>
              </div>
            </div>

            {!isComplete && (
              <div className="onbMissingBox">
                <strong>
                  Ye cheezein abhi baaki
                  hain:
                </strong>
                <ul>
                  {(
                    onboarding?.missingVehicleFields ||
                    []
                  ).map((item) => (
                    <li key={item.field}>
                      {item.label}
                    </li>
                  ))}
                  {(
                    onboarding?.missingDocuments ||
                    []
                  ).map((item) => (
                    <li key={item.type}>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              className="onbSubmitBtn"
              onClick={submitApproval}
              disabled={
                !isComplete || submitting
              }
            >
              {submitting
                ? "Submit ho raha hai..."
                : isComplete
                ? "Approval Request Bhejo"
                : "Submit"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DriverOnboarding;
