const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "src/components/HomeBookRide.jsx");

if (!fs.existsSync(file)) {
  console.error("HimRideG V81 target missing: src/components/HomeBookRide.jsx");
  process.exit(1);
}

let source = fs.readFileSync(file, "utf8");

const brokenClass = 'className="hbrModal{hi ? "पूरा करें" : "Done"}"';
if (source.includes(brokenClass)) {
  source = source.replace(brokenClass, 'className="hbrModalDone"');
}

const doneAnchor = "              Done\n            </button>";
if (source.includes(doneAnchor)) {
  source = source.replace(
    doneAnchor,
    '              {hi ? "पूरा करें" : "Done"}\n            </button>'
  );
}

if (!source.includes('className="hbrModalDone"')) {
  console.error("HimRideG V81 could not restore hbrModalDone class");
  process.exit(1);
}

if (!source.includes('{hi ? "पूरा करें" : "Done"}')) {
  console.error("HimRideG V81 could not translate Done button");
  process.exit(1);
}

fs.writeFileSync(file, source, "utf8");
console.log("HimRideG V81 bilingual booking Done hotfix applied");
