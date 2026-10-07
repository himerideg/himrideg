import { useState } from "react";
import api from "../api";
// V93: popup text language ke hisaab se
import { dialogText } from "../i18n/v93Language";

/*
|--------------------------------------------------------------------------
| HimRideG Website V91 — Official personal details (ADD-ONLY NEW FILE)
|--------------------------------------------------------------------------
| Uber / bank style: saved detail ek box me dikhti hai, right side Edit.
| Date of birth ek baar save hone ke baad lock (backend bhi enforce karta hai).
|--------------------------------------------------------------------------
*/

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" }
];

function genderLabel(value) {
  const clean = String(value || "").trim().toLowerCase();
  return GENDERS.find((item) => item.value === clean)?.label || "";
}

function dobLabel(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "";
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function V91PersonalDetails({ user, name, onUserUpdate }) {
  const [editor, setEditor] = useState("");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [localUser, setLocalUser] = useState(null);

  const current = localUser || user || {};
  const savedDob = String(current?.dateOfBirth || current?.dob || "").slice(0, 10);
  const savedGender = String(current?.gender || "");
  const dobLocked = Boolean(savedDob);

  const open = (key) => {
    setError("");
    setEditor(key);
    setValue(key === "gender" ? savedGender : savedDob);
  };

  const save = async () => {
    const clean = String(value || "").trim();
    if (!clean) {
      setError(editor === "dob" ? "Date chunein" : "Ek option chunein");
      return;
    }
    if (editor === "dob") {
      if (clean > todayIso()) {
        setError("Future date nahi ho sakti");
        return;
      }
      const ok = window.confirm(
        // V93: popup bhi user ki language me
        dialogText("dobConfirm", dobLabel(clean))
      );
      if (!ok) return;
    }

    setBusy(true);
    setError("");
    try {
      const { data } = await api.patch("/auth/customer/profile", {
        name: String(name || current?.name || "Customer").trim() || "Customer",
        ...(editor === "gender" ? { gender: clean.toLowerCase() } : { dateOfBirth: clean })
      });
      const updatedUser = data?.data?.user || data?.user || data?.data;
      if (updatedUser?._id) {
        localStorage.setItem("himrideg_user", JSON.stringify(updatedUser));
        sessionStorage.setItem("himrideg_user", JSON.stringify(updatedUser));
        setLocalUser(updatedUser);
        onUserUpdate?.(updatedUser);
      }
      setEditor("");
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Save nahi ho saka"
      );
    } finally {
      setBusy(false);
    }
  };

  const rows = [
    { key: "gender", icon: "⚥", label: "Gender", value: genderLabel(savedGender), locked: false },
    { key: "dob", icon: "📅", label: "Date of birth", value: dobLabel(savedDob), locked: dobLocked }
  ];

  return (
    <div>
      <p className="v91ProfileSectionTitle">PERSONAL DETAILS</p>
      <div className="v91ProfileCard">
        {rows.map((row) => (
          <div key={row.key}>
            <div className="v91ProfileRow">
              <span className="v91ProfileIcon" aria-hidden="true">{row.icon}</span>
              <div className="v91ProfileText">
                <p className="v91ProfileLabel">{row.label}</p>
                <p className={`v91ProfileValue${row.value ? "" : " empty"}`}>
                  {row.value || "Not added"}
                </p>
              </div>
              {row.locked ? (
                <span
                  className="v91ProfileLock"
                  title="Date of birth lock hai. Badalne ke liye Help & Support se contact karein."
                >
                  🔒 Locked
                </span>
              ) : editor !== row.key ? (
                <button type="button" className="v91ProfileEdit" onClick={() => open(row.key)}>
                  {row.value ? "Edit" : "Add"}
                </button>
              ) : null}
            </div>

            {editor === row.key ? (
              <div className="v91ProfileEditor">
                {row.key === "gender" ? (
                  <select
                    value={value}
                    onChange={(event) => {
                      setValue(event.target.value);
                      setError("");
                    }}
                  >
                    <option value="">Select gender</option>
                    {GENDERS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="date"
                    max={todayIso()}
                    value={value}
                    onChange={(event) => {
                      setValue(event.target.value);
                      setError("");
                    }}
                  />
                )}
                {error ? <p className="v91ProfileError">{error}</p> : null}
                {row.key === "dob" ? (
                  <p className="v91ProfileNote">Save ke baad date of birth lock ho jayegi.</p>
                ) : null}
                <div className="v91ProfileEditorActions">
                  <button type="button" className="v91ProfileCancel" onClick={() => setEditor("")}>
                    Cancel
                  </button>
                  <button type="button" className="v91ProfileSave" disabled={busy} onClick={save}>
                    {busy ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
