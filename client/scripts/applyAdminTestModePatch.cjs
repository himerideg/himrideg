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
  const stateInsert = [
    stateAnchor,
    "",
    "  /* V76_ADMIN_DRIVER_TEST_MODE */",
    "  const[testModes,setTestModes]=useState({});",
    "  const[testDriverId,setTestDriverId]=useState(\"\");",
    "  const[testModeBusy,setTestModeBusy]=useState(\"\");",
    "",
    "  const loadDriverTestModes=async()=>{",
    "    try{",
    "      const{data}=await api.get(\"/admin/driver-test-modes\");",
    "      const rows=data?.data?.testModes||[];",
    "      const next={};",
    "      rows.forEach(row=>{next[String(row.driverId)]={...row};});",
    "      setTestModes(next);",
    "    }catch(error){",
    "      console.error(\"Driver test mode list load error:\",error?.response?.data?.message||error?.message);",
    "    }",
    "  };",
    "",
    "  useEffect(()=>{",
    "    loadDriverTestModes().catch(()=>{});",
    "  },[]);",
    "",
    "  useEffect(()=>{",
    "    if(!testDriverId&&drivers.length){",
    "      setTestDriverId(String(drivers[0]?._id||\"\"));",
    "    }",
    "  },[drivers,testDriverId]);",
    "",
    "  const updateDriverTestMode=async(driver,enabled)=>{",
    "    if(!driver?._id)return;",
    "    try{",
    "      setTestModeBusy(String(driver._id));",
    "      const{data}=await api.patch(\"/admin/drivers/\"+driver._id+\"/test-mode\",{enabled});",
    "      notify?.(data?.message||(enabled?\"Test Mode ON\":\"Test Mode OFF\"));",
    "      await Promise.all([loadDriverTestModes(),loadAdminData?.()]);",
    "    }catch(error){",
    "      notify?.(error?.response?.data?.message||\"Test Mode update nahi hua\");",
    "    }finally{",
    "      setTestModeBusy(\"\");",
    "    }",
    "  };",
    "",
    "  const resetDriverTestPlatformFee=async(driver)=>{",
    "    if(!driver?._id)return;",
    "    if(!window.confirm((driver.name||\"Driver\")+\" ki sirf TEST platform fee ₹0 karni hai? Ride history aur earnings preserve rahengi.\"))return;",
    "    try{",
    "      setTestModeBusy(String(driver._id));",
    "      const{data}=await api.post(\"/admin/drivers/\"+driver._id+\"/test-mode/reset-platform-fee\",{});",
    "      notify?.(data?.message||\"Test platform fee reset ho gayi\");",
    "      await Promise.all([loadDriverTestModes(),loadAdminData?.()]);",
    "    }catch(error){",
    "      notify?.(error?.response?.data?.message||\"Test platform fee reset nahi hui\");",
    "    }finally{",
    "      setTestModeBusy(\"\");",
    "    }",
    "  };"
  ].join("\n");

  replaceOnce(
    stateAnchor,
    stateInsert,
    "admin test-mode state and actions"
  );

  const gridAnchor = '              <div className="adminDriverGrid">';
  const manager = [
    '              <section className="adminTestModePanel">',
    '                <div className="adminTestModeHead">',
    '                  <div>',
    '                    <small>परीक्षण खाता नियंत्रण</small>',
    '                    <h3>Driver Test Mode</h3>',
    '                    <p>टेस्ट Driver पर प्लेटफॉर्म फीस का ₹100 लॉक बंद रहेगा। जरूरत हो तो केवल टेस्ट बकाया फीस ₹0 करें; Ride history और कुल कमाई नहीं मिटेगी।</p>',
    '                  </div>',
    '                  <span className="adminTestBadge">ADMIN ONLY</span>',
    '                </div>',
    '',
    '                <div className="adminTestModeControls">',
    '                  <label>',
    '                    टेस्ट Driver चुनें',
    '                    <select value={testDriverId} onChange={event=>setTestDriverId(event.target.value)}>',
    '                      <option value="">Driver चुनें</option>',
    '                      {drivers.map(driver=>(',
    '                        <option key={driver._id} value={driver._id}>',
    '                          {driver.name||"Driver"} {driver.phone?("• "+driver.phone):""}',
    '                        </option>',
    '                      ))}',
    '                    </select>',
    '                  </label>',
    '',
    '                  {(()=>{',
    '                    const selectedDriver=drivers.find(driver=>String(driver._id)===String(testDriverId));',
    '                    if(!selectedDriver)return null;',
    '                    const mode=testModes[String(selectedDriver._id)]||{enabled:false};',
    '                    const due=Math.max(0,Number(selectedDriver?.wallet?.commissionDue||0),Number(selectedDriver?.wallet?.cashCommissionDue||0));',
    '                    const busy=testModeBusy===String(selectedDriver._id);',
    '                    return(',
    '                      <div className="adminTestModeSelected">',
    '                        <div className="adminTestModeStatus">',
    '                          <strong>{selectedDriver.name||"Driver"}</strong>',
    '                          <span className={mode.enabled?"on":"off"}>{mode.enabled?"TEST MODE ON":"TEST MODE OFF"}</span>',
    '                          <b>बकाया प्लेटफॉर्म फीस: ₹{Math.ceil(due)}</b>',
    '                        </div>',
    '                        <div className="adminTestModeButtons">',
    '                          <button',
    '                            type="button"',
    '                            className={mode.enabled?"testOff":"testOn"}',
    '                            disabled={busy}',
    '                            onClick={()=>updateDriverTestMode(selectedDriver,!mode.enabled)}',
    '                          >',
    '                            {busy?"अपडेट हो रहा है…":mode.enabled?"Test Mode बंद करें":"Test Mode चालू करें"}',
    '                          </button>',
    '                          <button',
    '                            type="button"',
    '                            className="testReset"',
    '                            disabled={busy||!mode.enabled||due<=0}',
    '                            onClick={()=>resetDriverTestPlatformFee(selectedDriver)}',
    '                          >',
    '                            टेस्ट प्लेटफॉर्म फीस ₹0 करें',
    '                          </button>',
    '                        </div>',
    '                        <small>Reset केवल commission due को ₹0 करता है। Ride history, completed rides और total earnings सुरक्षित रहते हैं।</small>',
    '                      </div>',
    '                    );',
    '                  })()}',
    '                </div>',
    '              </section>',
    '',
    gridAnchor
  ].join("\n");

  replaceOnce(
    gridAnchor,
    manager,
    "admin test-mode manager"
  );

  fs.writeFileSync(file, source, "utf8");
  console.log("HimRideG V76 admin Driver Test Mode applied: src/pages/AdminDashboard.jsx");
} else {
  console.log("HimRideG V76 admin Driver Test Mode already applied");
}
