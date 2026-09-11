import React from "react";
import ReactDOM from "react-dom/client";
import "leaflet/dist/leaflet.css";
import App from "./App";
import PublicInfoPage, {
  isPublicInfoPath
} from "./pages/PublicInfoPage";
import "./styles.css";

/*
|--------------------------------------------------------------------------
| Public Information Routes — ADD-ONLY
|--------------------------------------------------------------------------
| HimRideG ka existing app/login/dashboard routing App.jsx me untouched hai.
| Dedicated public Privacy/Terms/Refund/Safety/Help/Contact/Business URLs ko
| entry point par render karte hain, isliye mobile/app-parity flow break nahi
| hota aur search engines ko stable crawlable URLs milte hain.
|--------------------------------------------------------------------------
*/

const RootScreen = isPublicInfoPath(window.location.pathname)
  ? PublicInfoPage
  : App;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <React.Suspense
      fallback={
        <div className="hrgRouteLoading">
          <span>HimRideG</span>
          <small>Loading...</small>
        </div>
      }
    >
      <RootScreen />
    </React.Suspense>
  </React.StrictMode>
);
