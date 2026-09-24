const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "src/pages/DriverDashboard.jsx");

if (!fs.existsSync(file)) {
  console.error("HimRideG V77 target missing: src/pages/DriverDashboard.jsx");
  process.exit(1);
}

let source = fs.readFileSync(file, "utf8");
const marker = "V77_PERSISTENT_ACTIVE_RIDE_PANEL";

if (!source.includes(marker)) {
  const oldFocus =
    '  const blockingCurrentRideId =\n' +
    '    getId(blockingCurrentRide);\n\n' +
    '  useEffect(() => {\n' +
    '    if (!blockingCurrentRideId) {\n' +
    '      return;\n' +
    '    }\n\n' +
    '    setSelectedRideId((currentSelectedId) =>\n' +
    '      currentSelectedId ||\n' +
    '      blockingCurrentRideId\n' +
    '    );\n' +
    '  }, [blockingCurrentRideId]);';

  const newFocus =
    '  const blockingCurrentRideId =\n' +
    '    getId(blockingCurrentRide);\n\n' +
    '  /* V77_PERSISTENT_ACTIVE_RIDE_PANEL */\n' +
    '  useEffect(() => {\n' +
    '    if (!blockingCurrentRideId) {\n' +
    '      return;\n' +
    '    }\n\n' +
    '    /*\n' +
    '    | Assigned active ride dashboard ki primary authority hai. Feed/socket\n' +
    '    | refresh ke beech selectedRideId blank ya stale ho jaye tab bhi active\n' +
    '    | ride turant wapas select rahe. New unassigned request manual tap rule\n' +
    '    | current ride na hone par hi normal tarah se kaam karta rahega.\n' +
    '    */\n' +
    '    if (selectedRideId !== blockingCurrentRideId) {\n' +
    '      setSelectedRideId(blockingCurrentRideId);\n' +
    '    }\n' +
    '  }, [blockingCurrentRideId, selectedRideId]);';

  if (!source.includes(oldFocus)) {
    console.error("HimRideG V77 active ride focus anchor missing");
    process.exit(1);
  }

  source = source.replace(oldFocus, newFocus);

  const oldHeader =
    '<div><small>NEW RIDE REQUEST</small><h2>{selectedRide ? "Ride Details" : "Ride Requests"}</h2></div>';

  const newHeader =
    '<div><small>{blockingCurrentRide ? "ACTIVE RIDE" : "NEW RIDE REQUEST"}</small><h2>{blockingCurrentRide ? "Active Ride" : selectedRide ? "Ride Details" : "Ride Requests"}</h2></div>';

  if (!source.includes(oldHeader)) {
    console.error("HimRideG V77 driver request header anchor missing");
    process.exit(1);
  }

  source = source.replace(oldHeader, newHeader);

  const oldEmpty =
    '<strong>Waiting for New Ride</strong>\n                        <p>Online raho. Nayi customer booking yahin list me dikhai degi.</p>';

  const newEmpty =
    '<strong>Waiting for New Ride</strong>\n                        <p>Online raho. Nayi customer booking aur koi assigned Active Ride isi panel me dikhai degi.</p>';

  if (source.includes(oldEmpty)) {
    source = source.replace(oldEmpty, newEmpty);
  }

  fs.writeFileSync(file, source, "utf8");
  console.log("HimRideG V77 persistent Active Ride panel applied: src/pages/DriverDashboard.jsx");
} else {
  console.log("HimRideG V77 persistent Active Ride panel already applied");
}
