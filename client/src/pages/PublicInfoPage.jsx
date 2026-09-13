import React, { useEffect, useState } from "react";
import "./PublicInfoPage.css";

const PAGE_CONTENT = {
  en: {
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

    "/accessibility": {
      title: "Accessibility",
      description:
        "How HimRideG is working to keep its web and mobile experience usable for more people.",
      sections: [
        {
          heading: "Accessible interaction",
          body: [
            "HimRideG aims to keep important booking, account, Ride, payment and support actions usable with clear labels, readable contrast, keyboard-friendly controls where practical and meaningful focus states.",
            "Important controls should not rely only on colour. Text labels and status messages are used alongside visual indicators wherever the product flow allows."
          ]
        },
        {
          heading: "Text and language",
          body: [
            "The public home experience supports English and Hindi content. Device and browser text-size or zoom controls can be used to enlarge the interface, and responsive layouts are designed to adapt across mobile and desktop screens."
          ]
        },
        {
          heading: "Location and maps",
          body: [
            "Map features are supported by text pickup/drop fields and status messages so essential booking information is not available only through map visuals. Location permission remains under the user's device or browser control."
          ]
        },
        {
          heading: "Need assistance?",
          body: [
            "If an accessibility issue prevents you from using an important HimRideG feature, contact HimRideG support and describe the screen, device and action that is difficult to use so the issue can be reviewed."
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
  },

  hi: {
    "/privacy": {
      title: "गोपनीयता नीति",
      description:
        "HimRideG खाते, बुकिंग, स्थान, चालक सत्यापन और भुगतान से जुड़ी जानकारी का उपयोग कैसे करता है।",
      sections: [
        {
          heading: "हम कौन-सी जानकारी उपयोग करते हैं",
          body: [
            "HimRideG खाते का विवरण, संपर्क जानकारी, यात्रा के आरंभ और गंतव्य की जानकारी, यात्रा संचालन के लिए आवश्यक स्थान, बुकिंग इतिहास, सहायता संदेश और उपकरण या सत्र की जानकारी का उपयोग कर सकता है।",
            "चालकों के लिए HimRideG वाहन और सत्यापन दस्तावेज़ों का भी उपयोग कर सकता है, जो सेवा चलाने और व्यावसायिक टैक्सी की पात्रता जाँचने के लिए आवश्यक हैं।"
          ]
        },
        {
          heading: "भुगतान",
          body: [
            "ऑनलाइन भुगतान और चालक को राशि भेजने की प्रक्रिया अधिकृत भुगतान सेवा प्रदाताओं के माध्यम से हो सकती है। HimRideG भुगतान की पुष्टि, लेखा, विवाद निपटान और धोखाधड़ी रोकने के लिए लेन-देन संदर्भ और निपटान रिकॉर्ड रखता है।",
            "चालक के सुरक्षित किए गए संवेदनशील भुगतान पहचान विवरण सर्वर पर सुरक्षित रखे जाते हैं और स्क्रीन पर दिखाते समय छिपाए जाते हैं।"
          ]
        },
        {
          heading: "स्थान और सीधी यात्रा जानकारी",
          body: [
            "स्थान का उपयोग यात्रा शुरू करने की जगह, रास्ता दिखाने, पास के चालक से मिलान, यात्रा की सीधी प्रगति, सुरक्षा और मार्ग संबंधी सुविधाओं के लिए किया जाता है। स्थान की अनुमति आपके उपकरण या ब्राउज़र की सेटिंग के नियंत्रण में रहती है।"
          ]
        },
        {
          heading: "हम जानकारी का उपयोग क्यों करते हैं",
          body: [
            "हम जानकारी का उपयोग खाते उपलब्ध और सुरक्षित रखने, यात्रा बनाने और पूरी करने, ग्राहक और चालक को जोड़ने, भुगतान की गणना और निपटान करने, सहायता देने, दुरुपयोग रोकने और कानूनी या संचालन के लिए आवश्यक रिकॉर्ड रखने में करते हैं।"
          ]
        },
        {
          heading: "जानकारी रखने की अवधि और सुरक्षा",
          body: [
            "रिकॉर्ड केवल उतनी अवधि तक रखे जाते हैं जितनी सेवा संचालन, सुरक्षा, लेखा, विवाद निपटान और लागू कानूनी दायित्वों के लिए उचित रूप से आवश्यक हो। पहुँच सीमित रखी जाती है और उत्पादन प्रणालियों में खाते तथा लेन-देन की जानकारी की सुरक्षा के लिए नियंत्रण लगाए जाते हैं।"
          ]
        },
        {
          heading: "आपके विकल्प",
          body: [
            "आप स्थान और सूचनाओं जैसी उपकरण अनुमतियों को नियंत्रित कर सकते हैं। खाते या गोपनीयता से जुड़ी मांग HimRideG सहायता केंद्र के माध्यम से भेजी जा सकती है। निपटान, सुरक्षा या कानूनी आवश्यकता के कारण कुछ लेन-देन या यात्रा रिकॉर्ड रखना जरूरी हो सकता है।"
          ]
        }
      ]
    },

    "/terms": {
      title: "उपयोग के नियम",
      description:
        "HimRideG का उपयोग करने वाले ग्राहकों और व्यावसायिक टैक्सी चालकों के लिए मुख्य नियम।",
      sections: [
        {
          heading: "मंच की सेवा",
          body: [
            "HimRideG एक तकनीकी मंच है जो ग्राहकों को यात्रा का अनुरोध करने और पात्र व्यावसायिक टैक्सी चालकों को यात्रा अनुरोध प्राप्त तथा प्रबंधित करने में सहायता करता है। उपयोगकर्ताओं को सही जानकारी देनी होगी और मंच का उपयोग कानून के अनुसार करना होगा।"
          ]
        },
        {
          heading: "चालक की पात्रता",
          body: [
            "चालक को अपने वाहन और संचालन पर लागू पंजीकरण, परमिट, लाइसेंस और अन्य स्वीकृतियाँ वैध रखनी होंगी। यात्रा अनुरोध प्राप्त करने से पहले HimRideG सत्यापन मांग सकता है और आवश्यक जानकारी गलत या समाप्त होने पर पहुँच रोक सकता है।"
          ]
        },
        {
          heading: "किराये पर सहमति",
          body: [
            "जहाँ किराये पर सहमति की सुविधा उपलब्ध है, चालक राशि भेज सकता है, ग्राहक उत्तर दे सकता है और अंतिम किराया तभी तय होता है जब ग्राहक अंतिम राशि स्वीकार करता है। स्वीकार किया गया अंतिम किराया ही यात्रा के भुगतान में उपयोग होगा, जब तक किसी वैध कारण से बदलाव आवश्यक न हो।"
          ]
        },
        {
          heading: "यात्रा के दौरान व्यवहार और सुरक्षा",
          body: [
            "ग्राहक और चालक सम्मानजनक व्यवहार करें, गैरकानूनी या असुरक्षित गतिविधि से बचें और उचित सुरक्षा निर्देशों का पालन करें। धोखाधड़ी, दुरुपयोग, सुरक्षा जोखिम या सेवा के गलत उपयोग का संदेह होने पर HimRideG खाते की पहुँच सीमित कर सकता है।"
          ]
        },
        {
          heading: "भुगतान और रिकॉर्ड",
          body: [
            "स्क्रीन पर उपलब्ध विकल्पों के अनुसार यात्रा में ऑनलाइन या नकद भुगतान हो सकता है। भुगतान, मंच शुल्क, वॉलेट और राशि हस्तांतरण के रिकॉर्ड निपटान, मिलान, सहायता और विवाद समाधान के लिए रखे जा सकते हैं।"
          ]
        },
        {
          heading: "सेवा की उपलब्धता",
          body: [
            "इंटरनेट, नक्शे, भुगतान सेवा प्रदाता, मोबाइल नेटवर्क और अन्य बाहरी सेवाएँ कभी-कभी उपलब्ध नहीं हो सकतीं। HimRideG ऐसी स्थिति से सुरक्षित रूप से उबरने का प्रयास करता है, लेकिन हर बाहरी सेवा की लगातार उपलब्धता की गारंटी नहीं दे सकता।"
          ]
        }
      ]
    },

    "/refund-cancellation": {
      title: "रद्दीकरण और धनवापसी नीति",
      description:
        "HimRideG यात्रा रद्द होने, असफल भुगतान और पात्र ऑनलाइन धनवापसी को कैसे संभालता है।",
      sections: [
        {
          heading: "यात्रा रद्द करना",
          body: [
            "ग्राहक या चालक की स्क्रीन पर उपलब्ध विकल्पों से यात्रा रद्द की जा सकती है। रद्दीकरण पूरा करने से पहले यात्रा की स्थिति, स्वीकार किया गया किराया, चालक की नियुक्ति और पहले किए गए भुगतान को ध्यान में रखा जाता है।"
          ]
        },
        {
          heading: "ऑनलाइन भुगतान असफल होना",
          body: [
            "जिस भुगतान की सफलता सत्यापित नहीं हुई हो, उसे पूरा भुगतान नहीं माना जाता। यदि राशि कट जाए लेकिन HimRideG को सत्यापित सफलता की पुष्टि न मिले, तो दोबारा भुगतान लेने या धनवापसी का निर्णय करने से पहले भुगतान सेवा प्रदाता की स्थिति से लेन-देन का मिलान किया जाता है।"
          ]
        },
        {
          heading: "पात्र धनवापसी",
          body: [
            "जहाँ ऑनलाइन भुगतान धनवापसी के लिए पात्र हो, सत्यापन के बाद राशि मूल या समर्थित भुगतान माध्यम से वापस भेजी जाती है। धनवापसी शुरू होने के बाद बैंक या भुगतान सेवा प्रदाता का प्रसंस्करण समय अलग हो सकता है।"
          ]
        },
        {
          heading: "नकद यात्राएँ",
          body: [
            "नकद भुगतान की पुष्टि यात्रा प्रक्रिया के अंदर की जाती है। नकद भुगतान से जुड़े विवाद में यात्रा का विवरण सहायता केंद्र को दें, ताकि दर्ज यात्रा और भुगतान की स्थिति के आधार पर जाँच की जा सके।"
          ]
        },
        {
          heading: "एक ही भुगतान दो बार दिखाई देना",
          body: [
            "यदि एक ही यात्रा के लिए एक से अधिक बार राशि कटती दिखाई दे, तो यात्रा और लेन-देन संदर्भ के साथ सहायता अनुरोध भेजें। किसी सुधार या धनवापसी से पहले HimRideG भुगतान सेवा प्रदाता के रिकॉर्ड की जाँच करेगा।"
          ]
        }
      ]
    },

    "/safety": {
      title: "सुरक्षा",
      description:
        "HimRideG के ग्राहकों और चालकों के लिए व्यावहारिक सुरक्षा मार्गदर्शन।",
      sections: [
        {
          heading: "यात्रा शुरू होने से पहले",
          body: [
            "यात्रा शुरू करने से पहले अपनी बुकिंग में दिखाए गए चालक और वाहन के विवरण की जाँच करें। चालक आगे बढ़ने से पहले सही ग्राहक और यात्रा शुरू करने की जगह की पुष्टि करें।"
          ]
        },
        {
          heading: "यात्रा के दौरान",
          body: [
            "उपलब्ध होने पर सीधी यात्रा जानकारी और यात्रा साझा करने की सुविधा का उपयोग करें। अपना सामान सुरक्षित रखें और चालक से वाहन को असुरक्षित या गैरकानूनी तरीके से चलाने के लिए न कहें।"
          ]
        },
        {
          heading: "आपातकाल",
          body: [
            "भारत में तत्काल आपात स्थिति होने पर उपयुक्त आपात सेवा से संपर्क करें, जहाँ लागू हो वहाँ 112 का उपयोग करें। HimRideG सहायता आपात सेवाओं का विकल्प नहीं है।"
          ]
        },
        {
          heading: "सुरक्षा संबंधी समस्या की सूचना दें",
          body: [
            "यात्रा, चालक, ग्राहक या भुगतान से जुड़ी सुरक्षा समस्या की सूचना देने के लिए HimRideG की सुरक्षा या सहायता सुविधा का उपयोग करें। जाँच के लिए यात्रा संदर्भ और जरूरी विवरण दें।"
          ]
        }
      ]
    },

    "/accessibility": {
      title: "सुलभता",
      description:
        "HimRideG अपने वेब और मोबाइल अनुभव को अधिक लोगों के लिए उपयोग में आसान बनाने के लिए कैसे काम कर रहा है।",
      sections: [
        {
          heading: "सुलभ उपयोग",
          body: [
            "HimRideG महत्वपूर्ण बुकिंग, खाते, यात्रा, भुगतान और सहायता से जुड़े कार्यों को स्पष्ट नाम, पढ़ने योग्य रंग-अंतर, जहाँ व्यावहारिक हो वहाँ कीबोर्ड से उपयोग योग्य नियंत्रण और साफ चयन संकेतों के साथ उपलब्ध रखने का प्रयास करता है।",
            "महत्वपूर्ण नियंत्रण केवल रंग पर निर्भर नहीं होने चाहिए। जहाँ संभव हो वहाँ दृश्य संकेतों के साथ लिखित नाम और स्थिति संदेश भी दिए जाते हैं।"
          ]
        },
        {
          heading: "लिखावट और भाषा",
          body: [
            "सार्वजनिक HimRideG अनुभव अंग्रेज़ी और हिन्दी दोनों में उपलब्ध है। इंटरफ़ेस बड़ा देखने के लिए उपकरण या ब्राउज़र के अक्षर आकार और ज़ूम नियंत्रण का उपयोग किया जा सकता है। मोबाइल और कंप्यूटर स्क्रीन के अनुसार रूपरेखा अपने आप ढलने के लिए बनाई गई है।"
          ]
        },
        {
          heading: "स्थान और नक्शे",
          body: [
            "नक्शे की सुविधाओं के साथ यात्रा शुरू करने और गंतव्य के लिखित स्थान तथा स्थिति संदेश भी दिए जाते हैं, ताकि जरूरी बुकिंग जानकारी केवल नक्शे की तस्वीर पर निर्भर न रहे। स्थान की अनुमति आपके उपकरण या ब्राउज़र के नियंत्रण में रहती है।"
          ]
        },
        {
          heading: "सहायता चाहिए?",
          body: [
            "यदि सुलभता से जुड़ी कोई समस्या आपको HimRideG की जरूरी सुविधा उपयोग करने से रोकती है, तो सहायता केंद्र से संपर्क करें और स्क्रीन, उपकरण तथा जिस कार्य में कठिनाई हो रही है उसका विवरण दें।"
          ]
        }
      ]
    },

    "/help": {
      title: "सहायता केंद्र",
      description:
        "HimRideG बुकिंग, किराया, भुगतान, खाते और चालक संचालन के लिए सहायता।",
      sections: [
        {
          heading: "बुकिंग सहायता",
          body: [
            "यात्रा शुरू करने की जगह, गंतव्य, चालक नियुक्ति, किराये पर सहमति या चल रही यात्रा से जुड़ी समस्या के लिए सहायता से संपर्क करने से पहले अपनी यात्राएँ खोलें और संबंधित यात्रा चुनें।"
          ]
        },
        {
          heading: "भुगतान सहायता",
          body: [
            "असफल, लंबित या दोहराए गए ऑनलाइन भुगतान के लिए यात्रा और लेन-देन संदर्भ अपने पास रखें। केवल स्क्रीन देर से बदलने के कारण भुगतान दोबारा न करें; पहले यात्रा के भुगतान की स्थिति देखें।"
          ]
        },
        {
          heading: "चालक सहायता",
          body: [
            "चालक खाते, वॉलेट और निकासी, UPI तथा भुगतान सेटिंग और यात्रा इतिहास का उपयोग खाते, राशि हस्तांतरण और पूरी यात्राओं की जानकारी के लिए कर सकते हैं।"
          ]
        },
        {
          heading: "खाते में प्रवेश",
          body: [
            "ग्राहक, चालक या प्रशासन के लिए सही लॉगिन मार्ग का उपयोग करें। सत्र समाप्त होने पर नया खाता बनाने की जगह दोबारा लॉगिन करें।"
          ]
        }
      ]
    },

    "/contact": {
      title: "संपर्क और सहायता",
      description:
        "यात्रा, भुगतान, खाते और सुरक्षा से जुड़ी समस्याओं के लिए HimRideG सहायता से संपर्क करने के तरीके।",
      sections: [
        {
          heading: "ग्राहक और चालक सहायता",
          body: [
            "HimRideG के अंदर सहायता केंद्र का उपयोग करें और संबंधित यात्रा संदर्भ, लेन-देन संदर्भ या खाते का संदर्भ शामिल करें। इससे अनुरोध सही सेवा रिकॉर्ड से जुड़ा रहता है।"
          ]
        },
        {
          heading: "भुगतान विवाद",
          body: [
            "भुगतान या राशि हस्तांतरण से जुड़ी समस्या में यात्रा या निकासी संदर्भ और लेन-देन का लगभग समय दें। सहायता को कभी भी पासवर्ड, OTP, कार्ड PIN या UPI PIN न भेजें।"
          ]
        },
        {
          heading: "सुरक्षा आपात स्थिति",
          body: [
            "तत्काल खतरे या आपात स्थिति में पहले आपात सेवाओं से संपर्क करें। उसके बाद मंच के रिकॉर्ड और आगे की सहायता के लिए HimRideG सहायता का उपयोग किया जा सकता है।"
          ]
        },
        {
          heading: "आधिकारिक व्यावसायिक संपर्क",
          body: [
            "अंतिम व्यावसायिक प्रोफ़ाइल की पुष्टि होने के बाद HimRideG इस पृष्ठ पर सत्यापित सार्वजनिक व्यवसाय और शिकायत संपर्क विवरण प्रकाशित करेगा। तब तक प्रमाणित सहायता प्रक्रिया का उपयोग करें, ताकि अनुरोध सही खाते और यात्रा से जुड़ा रहे।"
          ]
        }
      ]
    },

    "/business": {
      title: "व्यवसाय के लिए HimRideG",
      description:
        "HimRideG टैक्सी सेवाओं के लिए व्यवसाय और यात्रा साझेदारों की जानकारी।",
      sections: [
        {
          heading: "व्यावसायिक यात्रा",
          body: [
            "HimRideG हिमाचल प्रदेश में भरोसेमंद स्थानीय और बाहरी शहर की व्यावसायिक टैक्सी यात्रा के लिए बनाया जा रहा है, जिसमें ग्राहकों और चालकों के लिए बुकिंग रिकॉर्ड और व्यवस्थित यात्रा प्रक्रिया शामिल है।"
          ]
        },
        {
          heading: "यात्रा साझेदार",
          body: [
            "पात्र व्यावसायिक टैक्सी मालिक और यात्रा साझेदार चालक पंजीकरण प्रक्रिया का उपयोग करके सत्यापन के लिए जरूरी खाते और वाहन की जानकारी जमा कर सकते हैं।"
          ]
        },
        {
          heading: "भविष्य की व्यावसायिक सुविधाएँ",
          body: [
            "नेटवर्क बढ़ने के साथ अतिरिक्त व्यावसायिक बुकिंग, रिपोर्ट और साझेदार सुविधाएँ जोड़ी जा सकती हैं। कोई सुविधा तभी उपलब्ध दिखाई जाएगी जब वह सीधे उत्पाद में चालू हो।"
          ]
        }
      ]
    }
  }
};

const UI_COPY = {
  en: {
    safety: "Safety",
    accessibility: "Accessibility",
    help: "Help",
    contact: "Contact",
    book: "Book Ride",
    language: "हिंदी",
    languageAria: "Switch to Hindi",
    navAria: "Public information",
    footerTagline: "Safe local taxi technology for Himachal.",
    privacy: "Privacy",
    terms: "Terms",
    refund: "Cancellation & Refund",
    rights: "All rights reserved."
  },
  hi: {
    safety: "सुरक्षा",
    accessibility: "सुलभता",
    help: "सहायता",
    contact: "संपर्क",
    book: "यात्रा बुक करें",
    language: "English",
    languageAria: "अंग्रेज़ी में बदलें",
    navAria: "सार्वजनिक जानकारी",
    footerTagline: "हिमाचल के लिए सुरक्षित स्थानीय टैक्सी तकनीक।",
    privacy: "गोपनीयता",
    terms: "नियम",
    refund: "रद्दीकरण और धनवापसी",
    rights: "सर्वाधिकार सुरक्षित।"
  }
};

function normalizePath(pathname) {
  return String(pathname || "/")
    .toLowerCase()
    .replace(/\/+$/, "") || "/";
}

function savedLanguage() {
  return String(localStorage.getItem("himrideg_home_language") || "en") === "hi"
    ? "hi"
    : "en";
}

export function isPublicInfoPath(pathname) {
  const normalized = normalizePath(pathname);
  return Boolean(PAGE_CONTENT.en[normalized]);
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
  const [language, setLanguage] = useState(savedLanguage);
  const path = normalizePath(window.location.pathname);
  const languagePages = PAGE_CONTENT[language] || PAGE_CONTENT.en;
  const page = languagePages[path] || languagePages["/help"];
  const ui = UI_COPY[language] || UI_COPY.en;

  useEffect(() => {
    document.documentElement.lang = language === "hi" ? "hi" : "en";
    document.title = `${page.title} | HimRideG`;
    ensureMeta("description", page.description);
    ensureMeta("robots", "index,follow");
  }, [language, page]);

  const toggleLanguage = () => {
    setLanguage((current) => {
      const next = current === "en" ? "hi" : "en";
      localStorage.setItem("himrideg_home_language", next);
      return next;
    });
  };

  return (
    <div className="publicInfoPage">
      <header className="publicInfoHeader">
        <a className="publicInfoBrand" href="/" aria-label="HimRideG Home">
          <span className="publicInfoBrandMark">H</span>
          <span>HimRideG</span>
        </a>

        <nav className="publicInfoNav" aria-label={ui.navAria}>
          <a href="/safety/">{ui.safety}</a>
          <a href="/accessibility/">{ui.accessibility}</a>
          <a href="/help/">{ui.help}</a>
          <a href="/contact/">{ui.contact}</a>
          <button
            type="button"
            className="publicInfoLanguageButton"
            onClick={toggleLanguage}
            aria-label={ui.languageAria}
            title={ui.languageAria}
          >
            🌐 {ui.language}
          </button>
          <a className="publicInfoHomeLink" href="/">{ui.book}</a>
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
          <span>{ui.footerTagline}</span>
        </div>

        <div className="publicInfoFooterLinks">
          <a href="/privacy/">{ui.privacy}</a>
          <a href="/terms/">{ui.terms}</a>
          <a href="/refund-cancellation/">{ui.refund}</a>
          <a href="/accessibility/">{ui.accessibility}</a>
          <a href="/contact/">{ui.contact}</a>
        </div>

        <small>© {new Date().getFullYear()} HimRideG. {ui.rights}</small>
      </footer>
    </div>
  );
}

export default PublicInfoPage;
