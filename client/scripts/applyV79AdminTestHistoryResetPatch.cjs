const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "src/pages/AdminDashboard.jsx");

if (!fs.existsSync(file)) {
  console.error("HimRideG V79 target missing: src/pages/AdminDashboard.jsx");
  process.exit(1);
}

let source = fs.readFileSync(file, "utf8");
const marker = "V79_ADMIN_TEST_HISTORY_RESET";

function replaceOnce(oldText, newText, label) {
  if (!source.includes(oldText)) {
    console.error(`HimRideG V79 anchor missing: ${label}`);
    process.exit(1);
  }
  source = source.replace(oldText, newText);
}

if (!source.includes(marker)) {
  const functionAnchor = [
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

  const functionInsert = [
    functionAnchor,
    "",
    "  /* V79_ADMIN_TEST_HISTORY_RESET */",
    "  const resetDriverTestHistory=async(driver)=>{",
    "    if(!driver?._id)return;",
    "    const typed=window.prompt((driver.name||\"Driver\")+\" ki Test Ride, Earning, Payment aur Platform Fee history permanently साफ करनी है. Confirm karne ke liye DELETE likho:\");",
    "    if(String(typed||\"\").trim().toUpperCase()!==\"DELETE\"){",
    "      notify?.(\"History reset cancel kar di gayi\");",
    "      return;",
    "    }",
    "    if(!window.confirm(\"Final confirmation: past Ride History, Earning/Payment records aur wallet totals delete/reset honge. Saved UPI/Bank/Profile safe rahenge.\"))return;",
    "    try{",
    "      setTestModeBusy(String(driver._id));",
    "      const{data}=await api.post(\"/admin/drivers/\"+driver._id+\"/test-mode/reset-history\",{confirmation:\"DELETE_TEST_HISTORY\"});",
    "      notify?.(data?.message||\"Test driver history reset ho gayi\");",
    "      await Promise.all([loadDriverTestModes(),loadAdminData?.(),loadBookings?.()]);",
    "    }catch(error){",
    "      notify?.(error?.response?.data?.message||\"Test driver history reset nahi hui\");",
    "    }finally{",
    "      setTestModeBusy(\"\");",
    "    }",
    "  };"
  ].join("\n");

  replaceOnce(
    functionAnchor,
    functionInsert,
    "test history reset action"
  );

  const buttonAnchor = [
    '                          <button',
    '                            type="button"',
    '                            className="testReset"',
    '                            disabled={busy||!mode.enabled||due<=0}',
    '                            onClick={()=>resetDriverTestPlatformFee(selectedDriver)}',
    '                          >',
    '                            टेस्ट प्लेटफॉर्म फीस ₹0 करें',
    '                          </button>'
  ].join("\n");

  const buttonInsert = [
    buttonAnchor,
    '                          <button',
    '                            type="button"',
    '                            className="testHistoryReset"',
    '                            disabled={busy||!mode.enabled}',
    '                            onClick={()=>resetDriverTestHistory(selectedDriver)}',
    '                          >',
    '                            सारी Test History साफ करें',
    '                          </button>'
  ].join("\n");

  replaceOnce(
    buttonAnchor,
    buttonInsert,
    "test history reset button"
  );

  replaceOnce(
    '                        <small>Reset केवल commission due को ₹0 करता है। Ride history, completed rides और total earnings सुरक्षित रहते हैं।</small>',
    '                        <small>Fee Reset केवल बकाया फीस ₹0 करता है। “सारी Test History साफ करें” past Ride/Earning/Payment records और wallet totals reset करता है; saved UPI/Bank/Profile सुरक्षित रहते हैं।</small>',
    "test reset explanation"
  );

  fs.writeFileSync(file, source, "utf8");
  console.log("HimRideG V79 admin test history reset UI applied");
} else {
  console.log("HimRideG V79 admin test history reset UI already applied");
}
