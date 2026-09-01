import React from "react";
import ReactDOM from "react-dom/client";
import "leaflet/dist/leaflet.css";
import App from "./App";
import "./styles.css";

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
      <App />
    </React.Suspense>
  </React.StrictMode>
);