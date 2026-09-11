import React, { useEffect } from "react";
import "./PublicInfoPage.css";

const PAGE_CONTENT = {
  "/privacy": {
    title: "Privacy Policy",
    description:
      "How HimRideG handles account, booking, location, driver verification and payment-related data.",
    sections: [
      {
        heading: "Information we use",
        body: [
          "HimRideG may process account details, contact information, ride pickup/drop information, location needed for ride operations, booking history, support messages and device/session information.",
          "For drivers, HimRideG may also process vehicle and verification documents required to operate the service and verify commercial taxi eligibility."
        ]
      },
      {
        heading: "Payments",
        body: [
          "Online payments and payouts may be processed by authorised payment service providers. HimRideG stores transaction references and settlement records needed for payment confirmation, accounting, dispute handling and fraud prevention.",
          "Sensitive saved driver payout identifiers are protected on the server and masked when shown in the interface."
        ]
      },
      {
        heading: "Location and live ride data",
        body: [
          "Location is used when needed for pickup, navigation, nearby-driver matching, live ride progress, safety and route-related features. Location permissions remain controlled by your device or browser settings."
        ]
      },
      {
        heading: "Why we process data",
        body: [
          "We use data to provide and secure accounts, create and complete rides, connect customers and drivers, calculate and settle payments, provide support, prevent abuse and maintain legally or operationally necessary records."
        ]
      },
      {
        heading: "Retention and security",
        body: [
          "Records are retained only for as long as reasonably needed for service operation, safety, accounting, dispute resolution and applicable legal obligations. Access is restricted and production systems use security controls designed to protect account and transaction information."
        ]
      },
      {
        heading: "Your choices",
        body: [
          "You can control device permissions such as location and notifications. Account or privacy requests can be raised through HimRideG Help/Support. Some transaction or ride records may need to be retained where required for settlement, safety or legal purposes."
        ]
      }
    ]
  },

  "/terms": {
    title: "Terms of Use",
    description:
      "Core terms for customers and commercial taxi drivers using HimRideG.",
    sections: [
      {
        heading: "Platform service",
        body: [
          "HimRideG is a technology platform that helps customers request rides and helps eligible commercial taxi drivers receive and manage ride requests. Users must provide accurate information and use the platform lawfully."
        ]
      },
      {
        heading: "Driver eligibility",
        body: [
          "Drivers must maintain the registrations, permits, licences and other approvals applicable to their vehicle and operation. HimRideG may require verification before a driver can receive rides and may suspend access when required information is invalid or expired."
        ]
      },
      {
        heading: "Fare agreement",
        body: [
          "Where fare negotiation is enabled, the driver can send an offer, the customer can respond, and the final fare becomes locked only after the customer accepts the final amount. The accepted final fare is the amount used for the ride payment flow unless a lawful adjustment is required."
        ]
      },
      {
        heading: "Ride conduct and safety",
        body: [
          "Customers and drivers must behave respectfully, avoid unlawful or unsafe conduct and follow reasonable safety instructions. HimRideG may restrict accounts where there is suspected fraud, abuse, safety risk or misuse of the service."
        ]
      },
      {
        heading: "Payments and records",
        body: [
          "A ride may support online payment or cash according to the options shown in the product. Payment, commission, wallet and payout records may be retained for settlement, reconciliation, support and dispute handling."
        ]
      },
      {
        heading: "Availability",
        body: [
          "Internet, maps, payment providers, mobile networks and other third-party services can occasionally be unavailable. HimRideG works to recover safely from such failures but cannot guarantee uninterrupted availability of every external service."
        ]
      }
    ]
  },

  "/refund-cancellation": {
    title: "Cancellation & Refund Policy",
    description:
      "How HimRideG handles ride cancellations, failed payments and eligible online-payment refunds.",
    sections: [
      {
        heading: "Ride cancellation",
        body: [
          "A ride may be cancelled through the options shown in the customer or driver flow. The applicable ride state, accepted fare, driver assignment and any payment already made are considered before the cancellation is finalised."
        ]
      },
      {
        heading: "Online payment failures",
        body: [
          "A payment that is not verified as successful is not treated as a completed payment. If money is debited but HimRideG does not receive a verified success confirmation, the transaction is reconciled using the payment provider status before any duplicate collection or refund decision is made."
        ]
      },
      {
        heading: "Eligible refunds",
        body: [
          "Where an online payment is eligible for refund, the refund is sent through the original or otherwise supported payment channel after verification. Bank or payment-provider processing time can vary after a refund has been initiated."
        ]
      },
      {
        heading: "Cash rides",
        body: [
          "Cash payments are confirmed within the ride flow. A cash-payment dispute should be raised through Help/Support with the ride details so it can be reviewed against the recorded ride and payment status."
        ]
      },
      {
        heading: "Duplicate transactions",
        body: [
          "If the same ride appears to have been charged more than once, raise a support request with the ride and transaction reference. HimRideG will verify provider records before arranging any eligible correction."
        ]
      }
    ]
  },

  "/safety": {
    title: "Safety",
    description:
      "Practical safety guidance for HimRideG customers and drivers.",
    sections: [
      {
        heading: "Before the ride",
        body: [
          "Check the driver and vehicle details shown for your booking before starting the ride. Drivers should confirm the correct customer and pickup before proceeding."
        ]
      },
      {
        heading: "During the ride",
        body: [
          "Use the live ride information and trip-sharing features when available. Keep personal belongings secure and avoid asking a driver to operate a vehicle unsafely or unlawfully."
        ]
      },
      {
        heading: "Emergency",
        body: [
          "For an immediate emergency in India, contact the appropriate emergency service, including 112 where applicable. HimRideG support is not a replacement for emergency services."
        ]
      },
      {
        heading: "Report a safety concern",
        body: [
          "Use the Safety or Help area in HimRideG to report a ride, driver, customer or payment-related safety concern. Provide the ride reference and relevant details so the event can be reviewed."
        ]
      }
    ]
  },

  "/help": {
    title: "Help Center",
    description:
      "Help for HimRideG bookings, fares, payments, accounts and driver operations.",
    sections: [
      {
        heading: "Booking help",
        body: [
          "For pickup, drop, driver assignment, fare negotiation or active-ride issues, open My Rides and select the relevant ride before contacting support."
        ]
      },
      {
        heading: "Payment help",
        body: [
          "For a failed, pending or duplicate online payment, keep the ride and transaction reference available. Do not repeat a payment solely because a screen is delayed; first check the ride payment status."
        ]
      },
      {
        heading: "Driver help",
        body: [
          "Drivers can use Account, Wallet & Withdraw, UPI & Payment Settings and ride History for account, payout and completed-ride information."
        ]
      },
      {
        heading: "Account access",
        body: [
          "Use the correct Customer, Driver or Admin login route. If a session expires, sign in again rather than creating a duplicate account."
        ]
      }
    ]
  },

  "/contact": {
    title: "Contact & Support",
    description:
      "Ways to reach HimRideG support for ride, payment, account and safety issues.",
    sections: [
      {
        heading: "Customer and driver support",
        body: [
          "Use the Help/Support section inside HimRideG and include the relevant ride reference, transaction reference or account context. This keeps the request linked to the correct service record."
        ]
      },
      {
        heading: "Payment disputes",
        body: [
          "For payment or payout issues, include the ride or withdrawal reference and the approximate transaction time. Never send passwords, OTPs, card PINs or UPI PINs to support."
        ]
      },
      {
        heading: "Safety emergencies",
        body: [
          "For immediate danger or an emergency, contact emergency services first. HimRideG support can be used afterward for platform records and follow-up."
        ]
      },
      {
        heading: "Official business contact",
        body: [
          "HimRideG will publish its verified public business/grievance contact details on this page once the final business profile is confirmed. Until then, use the authenticated Help/Support flow so requests are tied to the correct account and ride."
        ]
      }
    ]
  },

  "/business": {
    title: "HimRideG for Business",
    description:
      "Business and travel-partner information for HimRideG taxi services.",
    sections: [
      {
        heading: "Business travel",
        body: [
          "HimRideG is being built for reliable local and outstation commercial taxi travel in Himachal Pradesh, with booking records and structured ride workflows for customers and drivers."
        ]
      },
      {
        heading: "Travel partners",
        body: [
          "Eligible commercial taxi owners and travel partners can use the Driver onboarding flow to submit required account and vehicle information for verification."
        ]
      },
      {
        heading: "Future business features",
        body: [
          "Additional business booking, reporting and partner features may be introduced as the network expands. Features are shown as available only when they are enabled in the live product."
        ]
      }
    ]
  }
};

export function isPublicInfoPath(pathname) {
  const normalized = String(pathname || "/")
    .toLowerCase()
    .replace(/\/+$/, "") || "/";

  return Boolean(PAGE_CONTENT[normalized]);
}

function ensureMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function PublicInfoPage() {
  const path =
    String(window.location.pathname || "/")
      .toLowerCase()
      .replace(/\/+$/, "") || "/";

  const page = PAGE_CONTENT[path] || PAGE_CONTENT["/help"];

  useEffect(() => {
    document.title = `${page.title} | HimRideG`;
    ensureMeta("description", page.description);
    ensureMeta("robots", "index,follow");
  }, [page]);

  return (
    <div className="publicInfoPage">
      <header className="publicInfoHeader">
        <a className="publicInfoBrand" href="/" aria-label="HimRideG Home">
          <span className="publicInfoBrandMark">H</span>
          <span>HimRideG</span>
        </a>

        <nav className="publicInfoNav" aria-label="Public information">
          <a href="/safety/">Safety</a>
          <a href="/help/">Help</a>
          <a href="/contact/">Contact</a>
          <a className="publicInfoHomeLink" href="/">Book Ride</a>
        </nav>
      </header>

      <main className="publicInfoMain">
        <div className="publicInfoHero">
          <span className="publicInfoEyebrow">HimRideG</span>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
        </div>

        <div className="publicInfoSections">
          {page.sections.map((section) => (
            <section key={section.heading} className="publicInfoCard">
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </main>

      <footer className="publicInfoFooter">
        <div>
          <strong>HimRideG</strong>
          <span>Safe local taxi technology for Himachal.</span>
        </div>

        <div className="publicInfoFooterLinks">
          <a href="/privacy/">Privacy</a>
          <a href="/terms/">Terms</a>
          <a href="/refund-cancellation/">Cancellation & Refund</a>
          <a href="/contact/">Contact</a>
        </div>

        <small>© {new Date().getFullYear()} HimRideG. All rights reserved.</small>
      </footer>
    </div>
  );
}

export default PublicInfoPage;
