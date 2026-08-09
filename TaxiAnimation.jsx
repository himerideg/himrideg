import React from "react";

function TaxiAnimation() {
  return (
    <div className="hrTaxiScene" aria-hidden="true">
      <div className="hrCloud hrCloudOne" />
      <div className="hrCloud hrCloudTwo" />

      <div className="hrTaxiRoad">
        <div className="hrRoadStripe" />
      </div>

      <div className="hrMovingTaxi">
        <div className="hrTaxiShadow" />

        <img
          src="/swift-dzire-white.png"
          alt=""
          className="hrTaxiImage"
        />
      </div>
    </div>
  );
}

export default TaxiAnimation;