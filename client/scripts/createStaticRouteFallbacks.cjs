const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const source = path.join(dist, "index.html");

if (!fs.existsSync(source)) {
  console.error("HimRideG route fallback source missing: dist/index.html");
  process.exit(1);
}

/*
|--------------------------------------------------------------------------
| Render Static Site — Direct URL Fallbacks
|--------------------------------------------------------------------------
| Render static hosting does not automatically rewrite /terms/, /privacy/,
| /login/ etc. to the Vite SPA entry point. Copying the generated index.html
| into each supported route directory keeps every existing client-side route
| refreshable/bookmarkable without changing HimRideG routing or business logic.
|--------------------------------------------------------------------------
*/
const routes = [
  "privacy",
  "terms",
  "refund-cancellation",
  "safety",
  "accessibility",
  "help",
  "contact",
  "business",
  "login",
  "driverlogin",
  "adminlogin"
];

for (const route of routes) {
  const directory = path.join(dist, route);
  fs.mkdirSync(directory, { recursive: true });
  fs.copyFileSync(source, path.join(directory, "index.html"));
}

console.log(`HimRideG static route fallbacks created: ${routes.length}`);
