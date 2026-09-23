const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const target = path.join(root, "src", "pages", "CustomerDashboard.jsx");
const marker = "V89_APP_LEGAL_WEB_PAGES";

if (!fs.existsSync(target)) {
  console.error("HimRideG V89 target missing:", target);
  process.exit(1);
}

let source = fs.readFileSync(target, "utf8");

if (source.includes(marker)) {
  console.log("HimRideG V89 already applied: src/pages/CustomerDashboard.jsx");
  process.exit(0);
}

const anchor = `            </form>\n          </aside>`;

if (!source.includes(anchor)) {
  console.error("HimRideG V89 anchor missing: customer profile panel");
  process.exit(1);
}

const legalSection = `            </form>

            {/* V89_APP_LEGAL_WEB_PAGES */}
            <section
              aria-label="Legal and support"
              style={{
                marginTop: 18,
                paddingTop: 16,
                borderTop: "1px solid rgba(255,255,255,.10)"
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <strong style={{ display: "block", fontSize: 15 }}>Legal & Support</strong>
                <small style={{ color: "#9aa3ad" }}>Live pages from himrideg.com</small>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 9
                }}
              >
                {[
                  ["Terms & Conditions", "https://www.himrideg.com/terms"],
                  ["Privacy Policy", "https://www.himrideg.com/privacy"],
                  ["Cancellation & Refund", "https://www.himrideg.com/refund-cancellation"],
                  ["Safety", "https://www.himrideg.com/safety"],
                  ["Help & Support", "https://www.himrideg.com/help"],
                  ["Contact Us", "https://www.himrideg.com/contact"],
                  ["Business", "https://www.himrideg.com/business"]
                ].map(([label, url]) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => window.location.assign(url)}
                    style={{
                      minHeight: 44,
                      borderRadius: 11,
                      border: "1px solid rgba(255,255,255,.12)",
                      background: "rgba(255,255,255,.05)",
                      color: "inherit",
                      padding: "9px 10px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontWeight: 650
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <small
                style={{
                  display: "block",
                  marginTop: 10,
                  color: "#8d96a0",
                  lineHeight: 1.45
                }}
              >
                In pages ka content website se live load hota hai, isliye website update hote hi yahan bhi latest content dikhega.
              </small>
            </section>
          </aside>`;

source = source.replace(anchor, legalSection);
fs.writeFileSync(target, source, "utf8");
console.log("HimRideG V89 applied: live legal/support website pages wired into customer mobile profile");
