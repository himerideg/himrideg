const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "src/pages/AdminDashboard.jsx");

if (!fs.existsSync(file)) {
  console.error("HimRideG admin test-mode target missing: src/pages/AdminDashboard.jsx");
  process.exit(1);
}

let source = fs.readFileSync(file, "utf8");
const marker = "V76_ADMIN_DRIVER_TEST_MODE";

function replaceOnce(oldText, newText, label) {
  if (!source.includes(oldText)) {
    console.error(`HimRideG admin test-mode anchor missing: ${label}`);
    process.exit(1);
  }
  source = source.replace(oldText, newText);
}

if (!source.includes(marker)) {
  replaceOnce(
    'import"../admin-dashboard.css";',
    'import"../admin-dashboard.css";\nimport"../admin-test-mode.css";',
    "admin test-mode css import"
  );

  const stateAnchor = '  const[docBusyId,setDocBusyId]=useState("");';
  replaceOnce(
    stateAnchor,
    `${stateAnchor}\n\n  /* V76_ADMIN_DRIVER_TEST_MODE */\n  const[testModes,setTestModes]=useState({});\n  const[testDriverId,setTestDriverId]=useState("");\n  const[testModeBusy,setTestModeBusy]=useState("");\n\n  const loadDriverTestModes=async()=>{\n    try{\n      const{data}=await api.get("/admin/driver-test-modes");\n      const rows=data?.data?.testModes||[];\n      const next={};\n      rows.forEach(row=>{next[String(row.driverId)]={...row};});\n      setTestModes(next);\n    }catch(error){\n      console.error("Driver test mode list load error:",error?.response?.data?.message||error?.message);\n    }\n  };\n\n  useEffect(()=>{\n    loadDriverTestModes().catch(()=>{});\n  },[]);\n\n  useEffect(()=>{\n    if(!testDriverId&&drivers.length){\n      setTestDriverId(String(drivers[0]?._id||""));\n    }\n  },[drivers,testDriverId]);\n\n  const updateDriverTestMode=async(driver,enabled)=>{\n    if(!driver?._id)return;\n    try{\n      setTestModeBusy(String(driver._id));\n      const{data}=await api.patch(\`/admin/drivers/${driver._id}/test-mode\`,{enabled});\n      notify?.(data?.message||(enabled?"Test Mode ON":"Test Mode OFF"));\n      await Promise.all([loadDriverTestModes(),loadAdminData?.()]);\n    }catch(error){\n      notify?.(error?.response?.data?.message||"Test Mode update nahi hua");\n    }finally{\n      setTestModeBusy("");\n    }\n  };\n\n  const resetDriverTestPlatformFee=async(driver)=>{\n    if(!driver?._id)return;\n    if(!window.confirm(\`${driver.name||"Driver"} ki sirf TEST platform fee ₹0 karni hai? Ride history aur earnings preserve rahengi.\`))return;\n    try{\n      setTestModeBusy(String(driver._id));\n      const{data}=await api.post(\`/admin/drivers/${driver._id}/test-mode/reset-platform-fee\`,{});\n      notify?.(data?.message||"Test platform fee reset ho gayi");\n      await Promise.all([loadDriverTestModes(),loadAdminData?.()]);\n    }catch(error){\n      notify?.(error?.response?.data?.message||"Test platform fee reset nahi hui");\n    }finally{\n      setTestModeBusy("");\n    }\n  };`,
    "admin test-mode state and actions"
  );

  const gridAnchor = '              <div className="adminDriverGrid">';
  replaceOnce(
    gridAnchor,
    `              <section className="adminTestModePanel">\n                <div className="adminTestModeHead">\n                  <div>\n                    <small>परीक्षण खाता नियंत्रण</small>\n                    <h3>Driver Test Mode</h3>\n                    <p>टेस्ट Driver पर प्लेटफॉर्म फीस का ₹100 लॉक बंद रहेगा। जरूरत हो तो केवल टेस्ट बकाया फीस ₹0 करें; Ride history और कुल कमाई नहीं मिटेगी।</p>\n                  </div>\n                  <span className="adminTestBadge">ADMIN ONLY</span>\n                </div>\n\n                <div className="adminTestModeControls">\n                  <label>\n                    टेस्ट Driver चुनें\n                    <select value={testDriverId} onChange={event=>setTestDriverId(event.target.value)}>\n                      <option value="">Driver चुनें</option>\n                      {drivers.map(driver=>(\n                        <option key={driver._id} value={driver._id}>\n                          {driver.name||"Driver"} {driver.phone?`• ${driver.phone}`:""}\n                        </option>\n                      ))}\n                    </select>\n                  </label>\n\n                  {(()=>{\n                    const selectedDriver=drivers.find(driver=>String(driver._id)===String(testDriverId));\n                    if(!selectedDriver)return null;\n                    const mode=testModes[String(selectedDriver._id)]||{enabled:false};\n                    const due=Math.max(0,Number(selectedDriver?.wallet?.commissionDue||0),Number(selectedDriver?.wallet?.cashCommissionDue||0));\n                    const busy=testModeBusy===String(selectedDriver._id);\n                    return(\n                      <div className="adminTestModeSelected">\n                        <div className="adminTestModeStatus">\n                          <strong>{selectedDriver.name||"Driver"}</strong>\n                          <span className={mode.enabled?"on":"off"}>{mode.enabled?"TEST MODE ON":"TEST MODE OFF"}</span>\n                          <b>बकाया प्लेटफॉर्म फीस: ₹{Math.ceil(due)}</b>\n                        </div>\n                        <div className="adminTestModeButtons">\n                          <button\n                            type="button"\n                            className={mode.enabled?"testOff":"testOn"}\n                            disabled={busy}\n                            onClick={()=>updateDriverTestMode(selectedDriver,!mode.enabled)}\n                          >\n                            {busy?"अपडेट हो रहा है…":mode.enabled?"Test Mode बंद करें":"Test Mode चालू करें"}\n                          </button>\n                          <button\n                            type="button"\n                            className="testReset"\n                            disabled={busy||!mode.enabled||due<=0}\n                            onClick={()=>resetDriverTestPlatformFee(selectedDriver)}\n                          >\n                            टेस्ट प्लेटफॉर्म फीस ₹0 करें\n                          </button>\n                        </div>\n                        <small>Reset केवल commission due को ₹0 करता है। Ride history, completed rides और total earnings सुरक्षित रहते हैं।</small>\n                      </div>\n                    );\n                  })()}\n                </div>\n              </section>\n\n${gridAnchor}`,
    "admin test-mode manager"
  );

  fs.writeFileSync(file, source, "utf8");
  console.log("HimRideG V76 admin Driver Test Mode applied: src/pages/AdminDashboard.jsx");
} else {
  console.log("HimRideG V76 admin Driver Test Mode already applied");
}
