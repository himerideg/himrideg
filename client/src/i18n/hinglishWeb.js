/*
|--------------------------------------------------------------------------
| HimRideG website — third language (Hinglish) + English fixes (V90, added)
|--------------------------------------------------------------------------
| Same three languages as the HimRideG app: English / हिन्दी / Hinglish.
| HINGLISH: English UI text -> Hinglish (Roman Hindi).
| EXTRA_ENTRIES: UI text that was written in Hinglish in the source code, so
|   English mode now shows real English and Hindi mode real Hindi.
| EXTRA_PATTERNS: the same for text with a changing value ({0}).
| Nothing here replaces the existing ENTRIES; they still win on conflicts.
*/
import { V92_ENTRIES, V92_HINGLISH } from "./v92Language";

export const HINGLISH = {
 "Home": "Home",
 "HimRideG Driver": "HimRideG Driver",
 "Active": "Active",
 "Completed": "Poori ho gayi",
 "Cancelled": "Cancel ho gayi",
 "No active ride": "Koi chalu ride nahi",
 "Vehicle": "GAADI",
 "Location": "Location",
 "Phone": "Phone",
 "Call": "Call karo",
 "Message": "Message",
 "Travel With Us": "Hamare saath safar karo",
 "Passengers": "Passengers",
 "Schedule": "Schedule",
 "Schedule Ride": "Ride Schedule karo",
 "Ride Details": "Ride details",
 "Pickup Time": "PICKUP TIME",
 "Waiting for driver": "Driver ka wait",
 "Searching driver": "Driver dhoondh rahe hain",
 "Searching Driver": "Driver dhoondh rahe hain",
 "Driver assigned": "Driver mil gaya",
 "Driver Assigned": "Driver mil gaya",
 "Driver arrived": "Driver aa gaya hai",
 "Ride started": "Ride shuru ho gayi",
 "Payment pending": "Payment baaki hai",
 "Fare Locked": "Fare lock ho gaya",
 "Fare Negotiation": "Fare negotiation",
 "Expired": "Expire ho gaya",
 "Driver FINAL Fare": "Driver ka FINAL fare",
 "Driver Fare": "DRIVER KA FARE",
 "Counter Offer": "Counter Offer",
 "One-time counter fare (₹)": "Ek baar ka counter fare (₹)",
 "Destination": "Destination",
 "Current Location": "Abhi ki location",
 "Use My Location": "Meri Location use karo",
 "Call Driver": "Driver ko call karo",
 "Status": "Status",
 "Date": "DATE",
 "Fare": "Fare",
 "Distance": "Doori",
 "From": "Se",
 "To": "Tak",
 "Today": "Aaj",
 "Notifications": "NOTIFICATIONS",
 "Retry": "Retry",
 "Waiting": "Wait ho raha hai",
 "All": "Sab",
 "Customer": "Customer",
 "Driver": "Driver",
 "Ride": "Ride",
 "Book Ride": "Ride Book Karo",
 "My Rides": "Meri Rides",
 "Ride History": "Ride History",
 "Profile": "Profile",
 "Settings": "Settings",
 "Help": "Madad",
 "Support": "Support",
 "Safety": "Safety",
 "Logout": "Logout",
 "Login": "Login",
 "Sign Up": "Sign Up karo",
 "Create Account": "account banao",
 "Back": "Wapas",
 "Cancel": "Cancel karo",
 "Confirm": "Confirm karo",
 "Continue": "Aage badho",
 "Save": "Save karo",
 "Edit": "Edit",
 "Search": "Search karo",
 "Refresh": "Refresh",
 "Loading...": "Load ho raha hai",
 "Please wait...": "THODA WAIT KARO",
 "Waiting for response": "Jawab ka wait",
 "Reject": "Reject karo",
 "Resend": "Phir se bhejo",
 "Cancel Ride": "Ride cancel karo",
 "Send Fare": "Fare bhejo",
 "Enter Fare": "FARE DAALO",
 "Final Fare": "FINAL FARE",
 "Fare locked": "Fare lock ho gaya",
 "Ride Completed": "Ride poori ho gayi",
 "Payment": "Payment",
 "Pay Online": "Online pay karo",
 "Cash Payment": "Cash Payment",
 "Payment Received": "Payment Mil Gayi",
 "Payment Successful": "Payment ho gayi",
 "Pay Now": "ABHI PAY KARO",
 "Pay Later": "Baad mein pay karo",
 "Wallet": "Wallet",
 "Pending": "Pending",
 "Name": "Naam",
 "Full Name": "Poora Naam",
 "Mobile Number": "Mobile number",
 "Phone Number": "Phone Number",
 "Email": "Email",
 "Pickup": "Pickup",
 "Drop": "Drop",
 "Time": "Time",
 "Notification": "Notification",
 "Error": "Error",
 "Live Tracking": "Live Tracking",
 "Customer Support": "Customer Support",
 "Emergency": "Emergency",
 "Verified Drivers": "Verified Drivers",
 "Transparent Fares": "Saaf Kiraya",
 "Live Ride Tracking": "Live Ride Tracking",
 "New to HimRideG?": "HimRideG par naye ho?",
 "Continue with Google": "Google se aage badho",
 "Online Drivers": "Online Drivers",
 "Cash": "Cash",
 "LIVE ROUTE": "Live route",
 "Live Route": "Live route",
 "No Ride": "Koi ride nahi",
 "COMING SOON": "Jaldi aa raha hai",
 "RIDE PAYMENT": "Ride payment",
 "Book your ride": "Apni ride book karo",
 "Saving...": "Save ho raha hai...",
 "Total Fare": "Total Fare",
 "Payment Method": "Payment ka tareeka",
 "Driver UPI": "Driver UPI",
 "Paid ✓": "Paid",
 "Payment confirmation could not be sent to the Driver": "Driver ko payment confirmation nahi bhej paye",
 "Pay Driver Direct UPI": "DRIVER KO DIRECT UPI KARO",
 "Waiting for Driver Fare": "Driver ke Fare ka wait",
 "Submit Rating": "Rating bhejo",
 "Sedan": "Sedan",
 "Traveller": "Traveller",
 "BOOK YOUR RIDE": "Apni ride book karo",
 "Pickup time": "PICKUP TIME",
 "Pickup Now": "Abhi Pickup",
 "For me": "Mere liye",
 "Safe Rides": "Safe Rides",
 "Every ride is with a verified driver. Vehicle documents, license and permit are checked before approval. Your safety is our priority.": "Har ride verified driver ke saath hoti hai. Approval se pehle gaadi ke documents, license aur permit check hote hain. Aapki safety hamari priority hai",
 "Affordable Fare": "Sasta Kiraya",
 "Transparent pricing with no hidden charges. Fare is negotiated directly between customer and driver for fair local rates.": "Koi hidden charge nahi. Sahi local rate ke liye fare customer aur driver seedha tay karte hain",
 "Track your driver's live location and monitor your ride status in real time throughout your journey.": "Poore safar mein apne driver ki live location aur ride status dekhte raho",
 "24×7 Support": "24×7 Support",
 "Support for booking, driver or payment related queries. We are here to help anytime you need assistance.": "Booking, driver ya payment ke sawalon mein support. Jab bhi zaroorat ho, hum madad ke liye hain",
 "What is HimRideG?": "HimRideG kya hai?",
 "Which vehicles are allowed?": "Kaun si gaadiyan chal sakti hain?",
 "How are drivers verified?": "Driver kaise verify hote hain?",
 "Every driver must submit their Aadhaar/identity proof, Driving Licence, Vehicle RC, Commercial Permit and Vehicle Photo. All documents are manually reviewed and approved by HimRideG admin before the driver can go online.": "Har driver ko Aadhaar/ID proof, Driving Licence, gaadi ki RC, Commercial Permit aur gaadi ki photo deni hoti hai. Driver ke online hone se pehle HimRideG admin saare documents check karke approve karte hain",
 "How does HimRideG ensure safety?": "HimRideG safety kaise pakki karta hai?",
 "Every ride includes: verified driver identity, verified vehicle details, live GPS tracking, OTP-verified ride start and complete ride history. Both driver and customer information is verified before any ride begins.": "Har ride mein: verified driver identity, verified gaadi details, live GPS tracking, OTP se ride start aur poori ride history. Ride shuru hone se pehle driver aur customer dono ki jaankari verify hoti hai",
 "Why local drivers?": "Local drivers kyun?",
 "Our Vision": "Hamara Vision",
 "To build a safe, dependable and trusted taxi service network across all districts and remote areas of Himachal Pradesh — connecting every corner of the state with reliable local transportation.": "Himachal Pradesh ke saare zilon aur door-daraaz ilaakon mein safe, bharosemand taxi service network banana — state ke har kone ko bharosemand local transport se jodna",
 "ABOUT HIMRIDEG": "HimRideG ke baare mein",
 "Know Your Ride Platform": "Apne Ride Platform ko jaano",
 "Everything you need to know about HimRideG — tap to expand.": "HimRideG ke baare mein sab kuch — kholne ke liye tap karo",
 "WHY HIMRIDEG": "HimRideG kyun",
 "Safe, Simple and Trusted Local Rides": "Safe, Aasaan aur Bharosemand Local Rides",
 "Built for the local passengers and drivers of Himachal Pradesh.": "Himachal Pradesh ke local passengers aur drivers ke liye bana",
 "Company": "Company",
 "About": "About",
 "Business": "Business",
 "Driver Login": "Driver Login",
 "Help Center": "Help Center",
 "Contact": "Contact",
 "Cancellation & Refund": "Cancellation & Refund",
 "Services": "Services",
 "Local Rides": "Local Rides",
 "Outstation Taxi": "Outstation Taxi",
 "Airport Transfer": "Airport Transfer",
 "Tour Packages": "Tour Packages",
 "Privacy": "Privacy",
 "Terms": "Terms",
 "Refunds": "Refunds",
 "YOUR OWN RIDE": "AAPKI APNI RIDE",
 "Verified drivers, transparent fares and live tracking for safe local and outstation taxi booking.": "Safe local aur outstation taxi booking ke liye verified drivers, saaf fare aur live tracking",
 "Open Book Ride": "Ride Booking kholo",
 "Happy Riders": "Khush Riders",
 "← Back to Home": "Home par wapas jao",
 "{0} km away": "{0} km door",
 "Search Ride": "Ride Search karo",
 "Rider": "RIDER",
 "Use my location": "Meri Location use karo",
 "More": "Aur",
 "Privacy Policy": "Privacy Policy",
 "Cancellation & Refund Policy": "Cancellation & Refund Policy",
 "Accessibility": "Accessibility",
 "Dashboard": "Dashboard",
 "Customer Dashboard": "Customer Dashboard",
 "Driver Dashboard": "Driver Dashboard",
 "Admin Dashboard": "Admin Dashboard",
 "HIMACHAL KI APNI RIDE": "HIMACHAL KI APNI RIDE",
 "HimRideG Customer": "HimRideG Customer",
 "HimRideG Admin": "HimRideG Admin",
 "Admin Panel": "Admin Panel",
 "Admin Portal": "Admin Portal",
 "Overview": "Overview",
 "Requests": "Requests",
 "Request": "Request",
 "New Requests": "Naye Requests",
 "Driver Rides": "Driver Rides",
 "Scheduled": "Scheduled",
 "Waiting Payment": "Payment ka Intezaar",
 "Accepted": "Accepted",
 "Started": "Shuru Ho Gayi",
 "My QR": "Mera QR",
 "My Profile": "Meri Profile",
 "Driver Profile": "Driver Profile",
 "Customer Profile": "Customer Profile",
 "Personal Details": "Personal Details",
 "Payment Settings": "Payment Settings",
 "Save Changes": "Changes Save Karo",
 "Back to Dashboard": "Dashboard Par Wapas Jao",
 "Online • Available": "Online • Available",
 "Online • Busy": "Online • Busy",
 "Ride notifications": "Ride notifications",
 "Toggle online status": "Online status badlo",
 "Is section me koi ride nahi hai": "Is section me koi ride nahi hai",
 "No ride requests": "Koi ride request nahi hai",
 "No new requests": "Koi naya request nahi hai",
 "No completed rides": "Koi completed ride nahi hai",
 "No scheduled rides": "Koi scheduled ride nahi hai",
 "No payment pending rides": "Koi payment pending ride nahi hai",
 "Current Ride": "Current Ride",
 "Incoming Requests": "Aane Wale Requests",
 "Request Details": "Request Details",
 "Customer Name": "Customer ka Naam",
 "Requested Vehicle": "Request ki Gayi Vehicle",
 "Requested Vehicle Type": "Request ki Gayi Vehicle Type",
 "My Location": "Meri Location",
 "Open Map": "Map Kholo",
 "View Route": "Route Dekho",
 "Start Navigation": "Navigation Shuru Karo",
 "Customer Contact": "Customer Contact",
 "Driver Contact": "Driver Contact",
 "Open": "Kholo",
 "View": "Dekho",
 "Book New Ride": "Nayi Ride Book Karo",
 "BOOK A RIDE": "RIDE BOOK KARO",
 "Recent Activity": "Haal ki Activity",
 "My Account": "Mera Account",
 "Account Details": "Account Details",
 "Passenger": "Passenger",
 "Scheduled Ride": "Scheduled Ride",
 "Payment Option": "Payment Option",
 "Driver Details": "Driver Details",
 "Booking Details": "Booking Details",
 "Booking ID": "Booking ID",
 "Ride ID": "Ride ID",
 "Created At": "Kab Bana",
 "Travel Date": "Travel Date",
 "Drop Time": "Drop Time",
 "Search Driver": "Driver Dhundho",
 "Searching for driver": "Driver dhundh rahe hain",
 "Driver is arriving": "Driver aa raha hai",
 "Driver has arrived": "Driver aa gaya hai",
 "Driver Applications": "Driver Applications",
 "Waiting Approval": "Approval ka Intezaar",
 "Driver Documents": "Driver Documents",
 "Document Verification": "Document Verification",
 "Approve Application": "Application Approve Karo",
 "Reject Application": "Application Reject Karo",
 "Send Warning": "Warning Bhejo",
 "Warnings": "Warnings",
 "Blocked Drivers": "Blocked Drivers",
 "Waiting Drivers": "Waiting Drivers",
 "All Drivers": "Saare Drivers",
 "All Customers": "Saare Customers",
 "Bookings": "Bookings",
 "Withdrawals": "Withdrawals",
 "Withdrawal Requests": "Withdrawal Requests",
 "Pending Withdrawals": "Pending Withdrawals",
 "Paid Withdrawals": "Paid Withdrawals",
 "Rejected Withdrawals": "Rejected Withdrawals",
 "Mark Paid": "Paid Mark Karo",
 "Admin Note": "Admin Note",
 "Payout Reference": "Payout Reference",
 "Refresh Data": "Data Refresh Karo",
 "Driver Test Mode": "Driver Test Mode",
 "Test Drivers": "Test Drivers",
 "All Bookings": "Saari Bookings",
 "Pending Bookings": "Pending Bookings",
 "Accepted Bookings": "Accepted Bookings",
 "Started Bookings": "Started Bookings",
 "Completed Bookings": "Completed Bookings",
 "Cancelled Bookings": "Cancelled Bookings",
 "Search by name, phone or vehicle": "Naam, phone ya vehicle se search karo",
 "No drivers found": "Koi driver nahi mila",
 "No customers found": "Koi customer nahi mila",
 "No bookings found": "Koi booking nahi mili",
 "No withdrawal requests": "Koi withdrawal request nahi hai",
 "Driver arriving": "Driver aa raha hai",
 "Driver ne fare offer kiya": "Driver ne fare offer kiya",
 "Fare Lock ho gaya ✅": "Fare Lock ho gaya ✅",
 "Fare Offer Sent": "Fare Offer Bhej Diya",
 "Accepted — Fare bhejo": "Accepted — Fare bhejo",
 "Going to Pickup": "Pickup Par Ja Rahe Hain",
 "Waiting for Payment": "Payment ka Intezaar",
 "Final Fare Sync Recovery": "Final Fare Sync Recovery",
 "One-Time Counter Sent": "Ek baar ka Counter bhej diya",
 "Fare accept ho gaya. Driver ka GO TO PICKUP ab enabled hai.": "Fare accept ho gaya. Driver ka GO TO PICKUP ab enabled hai.",
 "Driver final fare amount sync nahi hua. Driver ko FINAL fare resend karna hoga. ₹0 ko Accept/Reject ke liye kabhi show nahi kiya jayega.": "Driver final fare amount sync nahi hua. Driver ko FINAL fare resend karna hoga. ₹0 ko Accept/Reject ke liye kabhi show nahi kiya jayega.",
 "Ye driver ka final offer hai. Ab sirf Accept ya Reject kar sakte hain. Accept par fare lock hoga aur driver ka GO TO PICKUP enable hoga.": "Ye driver ka final offer hai. Ab sirf Accept ya Reject kar sakte hain. Accept par fare lock hoga aur driver ka GO TO PICKUP enable hoga.",
 "Waiting for driver FINAL fare... Counter Offer ab dobara available nahi hoga.": "Driver ke FINAL fare ka intezaar... Counter Offer ab dobara available nahi hoga.",
 "Fare pasand hai to Accept karein. Reject kar sakte hain, ya ek baar Counter Offer bhej sakte hain.": "Fare pasand hai to Accept karein. Reject kar sakte hain, ya ek baar Counter Offer bhej sakte hain.",
 "Not selected": "Select nahi kiya",
 "Pickup location": "Pickup location",
 "Drop location": "Drop location",
 "Navigate": "Navigate Karo",
 "Call Customer": "Customer ko Call Karo",
 "View Details": "Details Dekho",
 "Details": "Details",
 "This Week": "Is Hafte",
 "This Month": "Is Mahine",
 "No rides found": "Koi ride nahi mili",
 "No data found": "Koi data nahi mila",
 "Total Drivers": "Kul Drivers",
 "Total Customers": "Kul Customers",
 "Total Rides": "Kul Rides",
 "Pending Approvals": "Pending Approvals",
 "Driver Management": "Driver Management",
 "Customer Management": "Customer Management",
 "Booking Management": "Booking Management",
 "Warning": "Warning",
 "Block Driver": "Driver Block Karo",
 "Unblock Driver": "Driver Unblock Karo",
 "Verify": "Verify Karo",
 "Verified": "Verified",
 "Rejected": "Reject Ho Gaya",
 "Blocked": "Blocked",
 "Data refreshed": "Data refresh ho gaya",
 "Legal Name": "Legal Naam",
 "Vehicle Details": "Vehicle Details",
 "Registration Number": "Registration Number",
 "Document verified!": "Document verify ho gaya!",
 "Document rejected!": "Document reject ho gaya!",
 "Driver successfully approved": "Driver approve ho gaya",
 "Driver application rejected": "Driver application reject ho gayi",
 "Driver blocked": "Driver block ho gaya",
 "Driver unblocked": "Driver unblock ho gaya",
 "Admin": "Admin",
 "Customers": "Customers",
 "Drivers": "Drivers",
 "Rides": "Rides",
 "Book a Ride": "Ride book karo",
 "Active Ride": "Active Ride",
 "ACTIVE RIDE": "ACTIVE RIDE",
 "Ride Requests": "Ride Requests",
 "New Ride Request": "Nayi Ride Request",
 "Recent Rides": "Haal Ki Rides",
 "Completed Rides": "Complete Hui Rides",
 "Cancelled Rides": "Cancel Hui Rides",
 "Earning History": "Kamai Ki History",
 "History": "History",
 "Account": "Account",
 "Log Out": "Log Out",
 "Close": "Band karo",
 "Update": "Update Karo",
 "Delete": "Delete Karo",
 "Submit": "Submit Karo",
 "Done": "Ho gaya",
 "Online": "Online",
 "Offline": "Offline",
 "Go Online": "Online Ho Jao",
 "Go Offline": "Offline Ho Jao",
 "Available": "Available",
 "Unavailable": "Available Nahi",
 "Waiting for new request": "Nayi request ka intezaar hai",
 "Accept": "Accept Karo",
 "Go to Pickup": "Pickup Par Jao",
 "I Have Arrived": "Main Pahunch Gaya",
 "Arrived": "Pahunch Gaya",
 "Generate OTP": "OTP Banao",
 "Regenerate OTP": "OTP Dobara Banao",
 "Enter OTP": "OTP Daalo",
 "Verify OTP": "OTP Verify Karo",
 "Start Ride": "Ride Start Karo",
 "Complete Ride": "Ride Complete Karo",
 "Payments": "Payments",
 "Payment History": "Payment History",
 "Cash Received": "Cash Mil Gaya",
 "Payment Failed": "Payment Fail Ho Gayi",
 "Wallet & Withdraw": "Wallet & Withdraw",
 "Wallet Balance": "Wallet Balance",
 "Available Balance": "Available Balance",
 "Total Earnings": "Kul Kamai",
 "Total Earned": "Kul Kamaya",
 "Withdraw": "Withdraw",
 "Withdraw Money": "Paise Withdraw Karo",
 "Withdrawal History": "Withdrawal History",
 "UPI & Payment Settings": "UPI & Payment Settings",
 "UPI ID": "UPI ID",
 "Bank Account": "Bank Account",
 "Payout Method": "Payout Ka Tareeka",
 "Primary": "Primary",
 "Platform Fee": "Platform Fee",
 "Platform Fee Due": "Platform Fee Baaki",
 "Driver Share": "Driver Ka Hissa",
 "Commission": "Commission",
 "Test Mode": "Test Mode",
 "Test Mode ON": "Test Mode ON",
 "Test Mode OFF": "Test Mode OFF",
 "Reset Platform Fee": "Platform Fee Reset Karo",
 "Approved": "Approved",
 "Approve": "Approve Karo",
 "Approve Driver": "Driver Approve Karo",
 "Reject Driver": "Driver Reject Karo",
 "Pending Drivers": "Pending Drivers",
 "Approved Drivers": "Approved Drivers",
 "Driver Verification": "Driver Verification",
 "Check Documents": "Documents Check Karo",
 "Documents": "Documents",
 "Document": "Document",
 "Driving Licence": "Driving Licence",
 "Driving License": "Driving License",
 "Vehicle RC": "Vehicle RC",
 "Commercial Permit": "Commercial Permit",
 "Vehicle Photo": "Vehicle Ki Photo",
 "Upload": "Upload Karo",
 "Choose File": "File Chuno",
 "Verification Pending": "Verification Baaki Hai",
 "Verification Approved": "Verification Approve Ho Gaya",
 "Password": "Password",
 "Vehicle Number": "Vehicle Number",
 "Vehicle Type": "Vehicle Type",
 "Pickup Location": "Pickup Location",
 "Drop Location": "Drop Location",
 "Duration": "Samay",
 "Schedule Booking": "Booking schedule karo",
 "No notifications": "Koi notification nahi",
 "No ride found": "Koi ride nahi mili",
 "No requests": "Koi request nahi",
 "Try Again": "Dobara Try Karo",
 "Success": "Ho Gaya",
 "Use Current Location": "Abhi Ki Location Use Karo",
 "Live Location": "Live Location",
 "Map": "Map",
 "SOS": "SOS",
 "Welcome to HimRideG": "HimRideG mein aapka swagat hai",
 "Back to HimRideG": "HimRideG par wapas jao",
 "Trusted and approved local drivers": "Bharosemand aur approved local drivers",
 "No hidden charges": "Koi chhupa charge nahi",
 "Track your ride in real-time": "Apni ride real-time mein track karo",
 "Google account chooser": "Google account chuno",
 "Already registered?": "Pehle se registered ho?",
 "Create Account / Sign Up": "Account Banao / Sign Up",
 "Sign Up with Google": "Google se Sign Up Karo",
 "Verifying...": "Verify ho raha hai...",
 "How it works": "Kaise kaam karta hai",
 "SAFE • RELIABLE • HIMACHAL": "SAFE • RELIABLE • HIMACHAL",
 "Your journey. Our responsibility.": "Aapka safar. Hamari zimmedari.",
 "SECURE ADMINISTRATION": "SECURE ADMINISTRATION",
 "Admin Login": "Admin Login",
 "Authorized HimRideG administrators only": "Sirf authorized HimRideG administrators ke liye",
 "Admin Email": "Admin Email",
 "Enter admin email": "Admin email daalo",
 "Enter admin password": "Admin password daalo",
 "Signing in...": "Sign in ho raha hai...",
 "Login to Admin Panel →": "Admin Panel mein Login Karo →",
 "← Back to www.himrideg.com": "← www.himrideg.com par wapas jao",
 "HimRideG protected management access • Customer login is separate": "HimRideG protected management access • Customer login alag hai",
 "All Rides": "Saari Rides",
 "System Logs": "System Logs",
 "Admin Tools": "Admin Tools",
 "Actions": "Actions",
 "Search driver": "Driver search karo",
 "Search customer": "Customer search karo",
 "Search rides": "Rides search karo",
 "Basic Info": "Basic Jaankari",
 "Complete your profile": "Apni profile complete karo",
 "Continue to Dashboard": "Dashboard par chalo",
 "Save & Continue": "Save Karke Aage Badho",
 "Driver Onboarding": "Driver Onboarding",
 "Complete Driver Profile": "Driver Profile Complete Karo",
 "Submit for Verification": "Verification Ke Liye Submit Karo",
 "Waiting for approval": "Approval ka intezaar hai",
 "Your account is under review": "Aapka account review mein hai",
 "Add UPI": "UPI Jodo",
 "Add Bank Account": "Bank Account Jodo",
 "Set as Primary": "Primary Banao",
 "Remove": "Hatao",
 "Amount": "Amount",
 "Transaction": "Transaction",
 "Transactions": "Transactions",
 "Transaction ID": "Transaction ID",
 "Reference": "Reference",
 "Driver Earnings": "Driver ki Kamai",
 "Earnings": "Kamai",
 "Net Earnings": "Net Kamai",
 "Gross Fare": "Gross Fare",
 "Direct UPI": "Direct UPI",
 "Online Payment": "Online Payment",
 "Online raho, ride accept karo aur apna final fare khud decide karo.": "Online raho, ride accept karo aur apna final fare khud decide karo.",
 "Approved Driver": "Approved Driver",
 "Driver Summary": "Driver Summary",
 "Route Map": "Route Map",
 "TODAY'S SUMMARY": "AAJ KA SUMMARY",
 "Today's Summary": "Aaj ka Summary",
 "Waiting for New Ride": "Nayi Ride ka intezaar",
 "Waiting for Ride": "Ride ka intezaar",
 "Online raho. Nayi customer booking aur koi assigned Active Ride isi panel me dikhai degi.": "Online raho. Nayi customer booking aur koi assigned Active Ride isi panel me dikhai degi.",
 "New Ride": "Nayi Ride",
 "New Booking": "Nayi Booking",
 "Assigned Ride": "Assigned Ride",
 "Driver Status": "Driver Status",
 "Available Driver": "Available Driver",
 "Route": "Route",
 "Summary": "Summary",
 "Total Trips": "Total Trips",
 "Payment Waiting": "Payment ka intezaar",
 "Online — UPI": "Online — UPI",
 "Pay completed ride": "Complete hui ride ki payment karo",
 "View completed rides →": "Complete hui rides dekho →",
 "Locked Fare": "Locked Fare",
 "Payment Center": "Payment Center",
 "Payment Methods": "Payment Methods",
 "Your Driver": "Aapka Driver",
 "Driver is on the way": "Driver raste mein hai",
 "Where do you want to go?": "Kahan jaana hai?",
 "Mobile par UPI app open hogi. Desktop par UPI QR scan karke payment ki ja sakti hai. Amount customer type nahi karega — locked fare automatically payment order me jayega.": "Mobile par UPI app open hogi. Desktop par UPI QR scan karke payment ki ja sakti hai. Amount customer type nahi karega — locked fare automatically payment order me jayega.",
 "Ride complete hone ke baad customer Cash select kar sakta hai. Driver ko locked fare cash dene ke baad assigned driver payment receive confirm karega.": "Ride complete hone ke baad customer Cash select kar sakta hai. Driver ko locked fare cash dene ke baad assigned driver payment receive confirm karega.",
 "Payment button driver ke ride complete karne ke baad hi enable hoga. Final locked fare ke bina payment start nahi hogi.": "Payment button driver ke ride complete karne ke baad hi enable hoga. Final locked fare ke bina payment start nahi hogi.",
 "ADMIN CONTROL": "ADMIN CONTROL",
 "Dashboard Overview": "Dashboard Overview",
 "Manage Drivers": "Drivers Manage karo",
 "Manage Customers": "Customers Manage karo",
 "Manage Rides": "Rides Manage karo",
 "System Status": "System Status",
 "Quick Actions": "Quick Actions",
 "No records found": "Koi record nahi mila",
 "Earnings & Platform Fee": "Kamai aur Platform Fee",
 "Outstanding Platform Fee": "Baaki Platform Fee",
 "Test Mode On": "Test Mode On",
 "New Rides Blocked": "Nayi Rides Band",
 "Rides Available": "Rides Chalu",
 "Fee Clear ✓": "Fee Clear ✓",
 "This is a test account. Platform fee blocking will not apply to new Rides. Turn off Test Mode from Admin after testing is complete.": "Ye test account hai. Nayi Rides par platform fee blocking lagu nahi hogi. Testing khatam hone ke baad Admin se Test Mode off karo.",
 "Pay your outstanding platform fee before accepting a new Ride. New Rides cannot be accepted when the outstanding fee is ₹100 or more.": "Nayi Ride accept karne se pehle apni baaki platform fee pay karo. Baaki fee ₹100 ya usse zyada hone par nayi Rides accept nahi ho sakti.",
 "Your outstanding platform fee is below ₹100, so you can continue taking new Rides. Pay the platform fee on time to avoid interruption.": "Aapki baaki platform fee ₹100 se kam hai, isliye aap nayi Rides lete reh sakte ho. Rukawat se bachne ke liye platform fee time par pay karo.",
 "Your platform fee is fully clear. You can take new Rides.": "Aapki platform fee poori clear hai. Aap nayi Rides le sakte ho.",
 "This is a test account. Platform fee blocking is currently disabled.": "Ye test account hai. Platform fee blocking abhi band hai.",
 "Platform Fee Paid": "Platform Fee Jama",
 "Primary Receiving Account": "Paise lene ka Primary Account",
 "Primary Bank Account": "Primary Bank Account",
 "Primary UPI": "Primary UPI",
 "No account selected": "Koi account select nahi hua",
 "Add an account from the App/Website UPI & Bank Settings": "App/Website ki UPI aur Bank Settings se account add karo",
 "Manage": "Manage",
 "Add": "Add",
 "UPI & Bank Settings": "UPI aur Bank Settings",
 "Customer Direct UPI/Cash fare goes to the Driver and HimRideG tracks only a 5% platform fee. After RazorpayX is enabled, automatic payouts will go to the selected primary account.": "Customer ka Direct UPI/Cash fare Driver ko milega aur HimRideG sirf 5% platform fee track karega. RazorpayX enable hone ke baad automatic payouts select kiye gaye primary account par jayenge.",
 "Updating…": "Update ho raha hai…",
 "DRIVER ACCOUNT": "DRIVER ACCOUNT",
 "RECEIVING MONEY": "PAISE RECEIVE KARNA",
 "Primary Payout Account": "Primary Payout Account",
 "After an online Ride payment is verified, the HimRideG platform fee is deducted. When RazorpayX live access is available, the payout will be processed to the selected Primary account.": "Online Ride payment verify hone ke baad HimRideG platform fee deduct hoti hai. RazorpayX live access milne par payout select kiye gaye Primary account par process hoga.",
 "No primary account": "Koi primary account nahi",
 "UPI Account": "UPI Account",
 "Add UPI or bank account below": "Neeche UPI ya bank account add karo",
 "PRIMARY": "PRIMARY",
 "Add payment method": "Payment method add karo",
 "Add UPI ID": "UPI ID add karo",
 "Open your UPI app, copy your UPI ID, then paste it here. HimRideG never reads a UPI ID silently from another app.": "Apni UPI app kholo, UPI ID copy karo, phir yahan paste karo. HimRideG kabhi bhi doosri app se UPI ID chupke se read nahi karta.",
 "Save UPI": "UPI Save karo",
 "Account Holder Name": "Account Holder ka Naam",
 "Bank Name": "Bank ka Naam",
 "Account Number": "Account Number",
 "Confirm Account Number": "Account Number Confirm karo",
 "Name as per bank": "Bank ke hisaab se naam",
 "Bank name": "Bank ka naam",
 "Account number": "Account number",
 "Re-enter account number": "Account number dobara daalo",
 "Save Bank Account": "Bank Account Save karo",
 "Payment Accounts": "Payment Accounts",
 "Loading saved accounts…": "Saved accounts load ho rahe hain…",
 "Make Primary Receiving Account": "Primary Receiving Account banao",
 "Future automatic payouts will go to this Primary account.": "Aage ke automatic payouts is Primary account par jayenge.",
 "Delete / Remove": "Delete / Remove",
 "No UPI or bank account is saved yet.": "Abhi koi UPI ya bank account save nahi hai.",
 "Bank/UPI details will be used for payouts. HimRideG never asks for your UPI PIN, OTP or bank password.": "Bank/UPI details payouts ke liye use hongi. HimRideG kabhi aapka UPI PIN, OTP ya bank password nahi maangta.",
 "UPI app did not open. Paste the UPI ID manually.": "UPI app open nahi hui. UPI ID manually paste karo.",
 "Enter a valid UPI ID, for example name@upi.": "Sahi UPI ID daalo, jaise name@upi.",
 "UPI receiving method saved.": "UPI receiving method save ho gaya.",
 "UPI could not be saved.": "UPI save nahi hui.",
 "Account holder name is required.": "Account holder ka naam zaroori hai.",
 "Bank name is required.": "Bank ka naam zaroori hai.",
 "Enter a valid account number and IFSC.": "Sahi account number aur IFSC daalo.",
 "Account number and confirmation do not match.": "Account number aur confirmation match nahi kar rahe.",
 "Bank account saved.": "Bank account save ho gaya.",
 "Bank account could not be saved.": "Bank account save nahi hua.",
 "Primary receiving account updated.": "Primary receiving account update ho gaya.",
 "Primary account could not be changed.": "Primary account change nahi hua.",
 "Remove this payout method?": "Ye payout method remove karna hai?",
 "Payment method removed.": "Payment method remove ho gaya.",
 "Payment method could not be removed.": "Payment method remove nahi hua.",
 "DRIVER HISTORY": "DRIVER HISTORY",
 "Fare, Platform Fee, Payment and Driver Net": "Fare, Platform Fee, Payment aur Driver Net",
 "Net": "Net",
 "Fee Due": "Fee Baaki",
 "Completed, Cancelled and Previous Rides": "Completed, Cancelled aur Pichli Rides",
 "Total": "Total",
 "Driver Net": "Driver Net",
 "Received ✓": "Mil gaya ✓",
 "HimRideG Online": "HimRideG Online",
 "Date & Time": "Date aur Time",
 "Payment / Status": "Payment / Status",
 "No earning record for this filter.": "Is filter me koi earning record nahi hai.",
 "No Ride for this filter.": "Is filter me koi Ride nahi hai.",
 "Driver UPI is not available": "Driver UPI available nahi hai",
 "Driver UPI could not be loaded": "Driver UPI load nahi hua",
 "UPI app did not open. Copy the UPI ID and make the payment manually.": "UPI app open nahi hui. UPI ID copy karke manually payment karo.",
 "Payment confirmation could not be sent": "Payment confirmation nahi bheji ja saki",
 "Loading Driver UPI…": "Driver UPI load ho raha hai…",
 "Until RazorpayX approval, you can pay the fare directly to the Driver's saved UPI.": "RazorpayX approval tak aap fare seedha Driver ke saved UPI par pay kar sakte ho.",
 "DIRECT DRIVER UPI": "DIRECT DRIVER UPI",
 "Copied ✓": "Copy ho gaya ✓",
 "Copy UPI": "UPI Copy karo",
 "Informing the Driver…": "Driver ko bata rahe hain…",
 "Press “I Paid” only after the payment is successful in your UPI app. Payment becomes final only after the Driver checks the amount in their account and confirms it.": "UPI app me payment successful hone ke baad hi “I Paid” dabao. Payment tabhi final hogi jab Driver apne account me amount check karke confirm karega.",
 "Confirming…": "Confirm ho raha hai…",
 "Confirm payment only after physically receiving the cash. Customer response is not required.": "Cash haath me milne ke baad hi payment confirm karo. Customer ka response zaroori nahi hai.",
 "Cash selected by customer": "Customer ne Cash chuna",
 "Waiting for customer": "Customer ka intezaar",
 "Payment complete": "Payment complete ho gayi",
 "Close payment status": "Payment status band karo",
 "Fare accepted. GO TO PICKUP is now enabled for the Driver.": "Fare accept ho gaya. Driver ke liye GO TO PICKUP ab enable hai.",
 "The Driver's final fare amount did not sync. The Driver must resend the FINAL fare. ₹0 will never be shown for Accept/Reject.": "Driver ka final fare amount sync nahi hua. Driver ko FINAL fare dobara bhejna hoga. Accept/Reject ke liye ₹0 kabhi nahi dikhega.",
 "This is the Driver's final offer. You can now only Accept or Reject it. Accepting locks the fare and enables GO TO PICKUP for the Driver.": "Ye Driver ka final offer hai. Ab aap sirf Accept ya Reject kar sakte ho. Accept karne par fare lock ho jayega aur Driver ke liye GO TO PICKUP enable ho jayega.",
 "Waiting for the Driver's FINAL fare... Counter Offer is no longer available.": "Driver ke FINAL fare ka intezaar... Counter Offer ab available nahi hai.",
 "If you like the fare, Accept it. You can Reject it or send one Counter Offer.": "Fare pasand hai to Accept karo. Aap Reject kar sakte ho ya ek Counter Offer bhej sakte ho.",
 "A Counter can be sent only once. After the Counter, the Driver will send one FINAL fare.": "Counter sirf ek baar bheja ja sakta hai. Counter ke baad Driver ek FINAL fare bhejega.",
 "Fare Rejected": "Fare Reject ho gaya",
 "Searching for a new nearby Driver.": "Naya nearby Driver dhoondh rahe hain.",
 "Accept / Reject / Counter will appear here as soon as the Driver sends the initial fare.": "Driver ke initial fare bhejte hi Accept / Reject / Counter yahin dikhega.",
 "Very poor": "Bahut bura",
 "Poor": "Theek nahi tha",
 "Okay": "Theek tha",
 "Good": "Achha tha",
 "Excellent": "Bahut achha!",
 "Ride Complete!": "Ride Complete ho gayi!",
 "Write a comment (optional)...": "Comment likho (optional)...",
 "Please give a star rating": "Please star rating do",
 "Rating could not be submitted": "Rating submit nahi ho payi",
 "Submitting Rating...": "Rating submit ho rahi hai...",
 "Do it later": "Baad mein karo",
 "&copy; OpenStreetMap contributors &copy; CARTO": "&copy; OpenStreetMap contributors &copy; CARTO",
 "0 20px 16px": "0 20px 16px",
 "0 auto 48px": "0 auto 48px",
 "16px 20px": "16px 20px",
 "1px solid rgba(245,197,24,0.3)": "1px solid rgba(245,197,24,0.3)",
 "1px solid {0}": "1px solid {0}",
 "6px 14px": "6px 14px",
 "<span class=\"hbrPin\" style=\"background:{0}\" ></span>": "<span class=\"hbrPin\" style=\"background:{0}\" ></span>",
 "A HimRideG Ride for every plan": "Har plan ke liye ek HimRideG Ride",
 "Accessible interaction": "Accessible interaction",
 "Account access": "Account access",
 "All rights reserved.": "Sabhi adhikaar surakshit hain.",
 "Android App": "Android App",
 "Applicable cancellation/no-show fees are shown before booking confirmation. Eligible online refunds are processed to the original payment method according to gateway and bank timelines. Mandatory consumer and statutory rights are not removed.": "Lagu hone wali cancellation/no-show fees booking confirm karne se pehle dikhayi jaati hai. Eligible online refunds gateway aur bank ki timelines ke hisaab se original payment method mein process kiye jaate hain. Zaroori consumer aur statutory rights hataye nahi jaate.",
 "Availability": "Availability",
 "Availability depends on verified drivers being online near your pickup. Coverage grows as more local commercial taxis join.": "Availability is par depend karti hai ki aapke pickup ke paas verified drivers online hain ya nahi. Jaise-jaise aur local commercial taxis judengi, coverage badhta jayega.",
 "Become a Driver": "Driver bano",
 "Before the ride": "Ride se pehle",
 "Bir Billing": "Bir Billing",
 "Book local travel, outstation trips, airport transfers or a scheduled Ride from the same trusted flow.": "Local travel, outstation trips, airport transfers ya scheduled Ride, sab ek hi trusted flow se book karo.",
 "Book now": "Abhi book karo",
 "Booking help": "Booking help",
 "Booking time": "Booking ka time",
 "Built for Himachal, expanding district by district": "Himachal ke liye bana, district by district badh raha hai",
 "Business and travel-partner information for HimRideG taxi services.": "HimRideG taxi services ke liye business aur travel-partner ki jaankari.",
 "Business travel": "Business travel",
 "Capital • Hill travel": "Capital • Pahadi travel",
 "Cash rides": "Cash rides",
 "Chamba": "Chamba",
 "Chamba hills • Scenic routes": "Chamba ki pahadiyan • Scenic routes",
 "Choose a future date and time instead of booking immediately.": "Abhi book karne ki jagah aage ki date aur time chuno.",
 "Choose a rider": "Rider chuno",
 "City • McLeod Ganj access": "City • McLeod Ganj access",
 "Contact & Support": "Contact aur Support",
 "Continue booking": "Booking jaari rakho",
 "Core terms for customers and commercial taxi drivers using HimRideG.": "HimRideG use karne wale customers aur commercial taxi drivers ke liye main terms.",
 "Customer and driver support": "Customer aur driver support",
 "Customers and drivers must behave respectfully, avoid unlawful or unsafe conduct and follow reasonable safety instructions. HimRideG may restrict accounts where there is suspected fraud, abuse, safety risk or misuse of the service.": "Customers aur drivers ko respectful vyavhaar karna hoga, gair-kanooni ya unsafe conduct se bachna hoga aur reasonable safety instructions follow karne honge. Jahan fraud, abuse, safety risk ya service ke misuse ka shak ho, wahan HimRideG accounts ko restrict kar sakta hai.",
 "DRIVE WITH HIMRIDEG": "HIMRIDEG KE SAATH DRIVE KARO",
 "Dalhousie": "Dalhousie",
 "Dharamshala": "Dharamshala",
 "Drive on your schedule. Earn with local riders.": "Apne schedule par drive karo. Local riders se kamao.",
 "Driver eligibility": "Driver eligibility",
 "Driver help": "Driver help",
 "Driver will offer the fare": "Driver fare offer karega",
 "Drivers can use Account, Wallet & Withdraw, UPI & Payment Settings and ride History for account, payout and completed-ride information.": "Drivers account, payout aur completed-ride ki jaankari ke liye Account, Wallet & Withdraw, UPI & Payment Settings aur ride History use kar sakte hain.",
 "Drivers must maintain the registrations, permits, licences and other approvals applicable to their vehicle and operation. HimRideG may require verification before a driver can receive rides and may suspend access when required information is invalid or expired.": "Drivers ko apni vehicle aur operation par lagu hone wale registrations, permits, licences aur dusri approvals maintain karni hongi. HimRideG kisi driver ko rides milne se pehle verification maang sakta hai aur zaroori jaankari invalid ya expired hone par access suspend kar sakta hai.",
 "Duplicate transactions": "Duplicate transactions",
 "During the ride": "Ride ke dauraan",
 "EXPLORE HIMACHAL": "HIMACHAL GHUMO",
 "EXPLORE SERVICES": "SERVICES DEKHO",
 "Eligible commercial taxi owners and travel partners can use the Driver onboarding flow to submit required account and vehicle information for verification.": "Eligible commercial taxi owners aur travel partners Driver onboarding flow use karke verification ke liye zaroori account aur vehicle ki jaankari submit kar sakte hain.",
 "Eligible refunds": "Eligible refunds",
 "English": "English",
 "Enter destination": "Destination daalo",
 "Enter pickup location": "Pickup location daalo",
 "Estimated distance": "Andaazit doori",
 "Estimated time": "Andaazit time",
 "Explore Business": "Business dekho",
 "Fare agreement": "Fare agreement",
 "Fast local taxi booking with verified commercial drivers.": "Verified commercial drivers ke saath fast local taxi booking.",
 "Finding your location…": "Aapki location dhoondh rahe hain…",
 "For an immediate emergency in India, contact the appropriate emergency service, including 112 where applicable. HimRideG support is not a replacement for emergency services.": "India mein turant emergency ke liye sahi emergency service se contact karo, jahan lagu ho wahan 112 bhi. HimRideG support emergency services ki jagah nahi le sakta.",
 "For drivers, HimRideG may also process vehicle and verification documents required to operate the service and verify commercial taxi eligibility.": "Drivers ke liye, HimRideG service chalane aur commercial taxi eligibility verify karne ke liye zaroori vehicle aur verification documents bhi process kar sakta hai.",
 "For immediate danger or an emergency, contact emergency services first. HimRideG support can be used afterward for platform records and follow-up.": "Turant khatre ya emergency mein pehle emergency services se contact karo. Platform records aur follow-up ke liye HimRideG support baad mein use kiya ja sakta hai.",
 "For pickup, drop, driver assignment, fare negotiation or active-ride issues, open My Rides and select the relevant ride before contacting support.": "Pickup, drop, driver assignment, fare negotiation ya active-ride issues ke liye, support se contact karne se pehle My Rides kholo aur sambandhit ride chuno.",
 "Future business features": "Aane wale business features",
 "GPS accuracy": "GPS accuracy",
 "Getting high-accuracy GPS location…": "High-accuracy GPS location li ja rahi hai…",
 "HIMRIDEG APP": "HIMRIDEG APP",
 "HIMRIDEG FOR BUSINESS": "HIMRIDEG FOR BUSINESS",
 "Hamirpur": "Hamirpur",
 "Help for HimRideG bookings, fares, payments, accounts and driver operations.": "HimRideG bookings, fares, payments, accounts aur driver operations ke liye help.",
 "Him": "Him",
 "HimRideG": "HimRideG",
 "HimRideG Home": "HimRideG Home",
 "HimRideG aims to keep important booking, account, Ride, payment and support actions usable with clear labels, readable contrast, keyboard-friendly controls where practical and meaningful focus states.": "HimRideG ka maksad hai ki zaroori booking, account, Ride, payment aur support actions clear labels, padhne layak contrast, jahan practical ho wahan keyboard-friendly controls aur meaningful focus states ke saath use karne layak rahein.",
 "HimRideG connects eligible commercial taxi drivers with customers while keeping Ride, fare, payment and history tools in one account.": "HimRideG eligible commercial taxi drivers ko customers se jodta hai, aur Ride, fare, payment aur history tools ek hi account mein rakhta hai.",
 "HimRideG for Business": "HimRideG for Business",
 "HimRideG is a local ride-hailing platform built specifically for Himachal Pradesh. We connect passengers with verified local taxi drivers for safe and reliable travel across Himachal.": "HimRideG ek local ride-hailing platform hai jo khaas taur par Himachal Pradesh ke liye bana hai. Hum passengers ko verified local taxi drivers se jodte hain taaki poore Himachal mein safe aur reliable travel ho sake.",
 "HimRideG is a technology platform that helps customers request rides and helps eligible commercial taxi drivers receive and manage ride requests. Users must provide accurate information and use the platform lawfully.": "HimRideG ek technology platform hai jo customers ko rides request karne mein aur eligible commercial taxi drivers ko ride requests receive aur manage karne mein madad karta hai. Users ko sahi jaankari deni hogi aur platform ko kanooni tareeke se use karna hoga.",
 "HimRideG is being built for reliable local and outstation commercial taxi travel in Himachal Pradesh, with booking records and structured ride workflows for customers and drivers.": "HimRideG Himachal Pradesh mein reliable local aur outstation commercial taxi travel ke liye banaya ja raha hai, jismein customers aur drivers ke liye booking records aur structured ride workflows hain.",
 "HimRideG may process account details, contact information, ride pickup/drop information, location needed for ride operations, booking history, support messages and device/session information.": "HimRideG account details, contact information, ride pickup/drop ki jaankari, ride operations ke liye zaroori location, booking history, support messages aur device/session ki jaankari process kar sakta hai.",
 "HimRideG processes account, booking, location, driver verification and payment-related data for service operation, safety, fraud prevention, settlement and legal compliance. Sensitive payment and payout data is protected on the server. For access, correction, deletion or grievance requests, email himrideg@gmail.com.": "HimRideG service operation, safety, fraud prevention, settlement aur legal compliance ke liye account, booking, location, driver verification aur payment se jude data ko process karta hai. Sensitive payment aur payout data server par protected rehta hai. Access, correction, deletion ya grievance requests ke liye himrideg@gmail.com par email karo.",
 "HimRideG supports local drivers of Himachal Pradesh by giving them a platform to find passengers reliably. Customers get drivers who know local routes, terrain and conditions better than anyone else.": "HimRideG Himachal Pradesh ke local drivers ko passengers bharose ke saath dhoondhne ka platform dekar unka saath deta hai. Customers ko aise drivers milte hain jo local routes, terrain aur halaat ko kisi se bhi behtar jaante hain.",
 "HimRideG, Vill Racchiyara, PO Saperu, Teh Palampur, District Kangra, Himachal Pradesh 176061. Terms version: 23 September 2026.": "HimRideG, Vill Racchiyara, PO Saperu, Teh Palampur, District Kangra, Himachal Pradesh 176061. Terms version: 23 September 2026.",
 "HimRideG.": "HimRideG.",
 "Himachal coverage regions": "Himachal ke coverage regions",
 "How HimRideG handles account, booking, location, driver verification and payment-related data.": "HimRideG account, booking, location, driver verification aur payment se jude data ko kaise handle karta hai.",
 "How HimRideG handles ride cancellations, failed payments and eligible online-payment refunds.": "HimRideG ride cancellations, failed payments aur eligible online-payment refunds ko kaise handle karta hai.",
 "How HimRideG is working to keep its web and mobile experience usable for more people.": "HimRideG apne web aur mobile experience ko zyada logon ke liye use karne layak banane par kaise kaam kar raha hai.",
 "Important controls should not rely only on colour. Text labels and status messages are used alongside visual indicators wherever the product flow allows.": "Zaroori controls sirf rang par depend nahi hone chahiye. Jahan bhi product flow allow karta hai, visual indicators ke saath text labels aur status messages bhi use kiye jaate hain.",
 "Information we use": "Jo jaankari hum use karte hain",
 "Internet, maps, payment providers, mobile networks and other third-party services can occasionally be unavailable. HimRideG works to recover safely from such failures but cannot guarantee uninterrupted availability of every external service.": "Internet, maps, payment providers, mobile networks aur dusri third-party services kabhi-kabhi unavailable ho sakti hain. HimRideG aisi failures se safely recover karne ki koshish karta hai, lekin har external service ki bina rukawat availability ki guarantee nahi de sakta.",
 "Kangra": "Kangra",
 "Kullu": "Kullu",
 "Local + outstation travel": "Local + outstation travel",
 "Local Ride": "Local Ride",
 "Location and live ride data": "Location aur live ride data",
 "Location and maps": "Location aur maps",
 "Location could not be detected": "Location detect nahi ho payi",
 "Location is used when needed for pickup, navigation, nearby-driver matching, live ride progress, safety and route-related features. Location permissions remain controlled by your device or browser settings.": "Location ka use zaroorat padne par pickup, navigation, paas ke driver se matching, live ride progress, safety aur route se jude features ke liye hota hai. Location permissions aapke device ya browser settings se hi control hoti hain.",
 "Manali": "Manali",
 "Mandi": "Mandi",
 "Map features are supported by text pickup/drop fields and status messages so essential booking information is not available only through map visuals. Location permission remains under the user's device or browser control.": "Map features ke saath text pickup/drop fields aur status messages bhi diye gaye hain, taaki zaroori booking information sirf map visuals par depend na kare. Location permission hamesha user ke device ya browser ke control mein rehti hai.",
 "Me": "Main",
 "Mini / Hatchback": "Mini / Hatchback",
 "Mobile HimRideG navigation": "Mobile HimRideG navigation",
 "My Location could not be detected": "Meri Location detect nahi ho payi",
 "My Location set • GPS accuracy ±{0}m": "Meri Location set ho gayi • GPS accuracy ±{0}m",
 "My Location set • GPS ±{0}m": "Meri location set • GPS ±{0}m",
 "Need assistance?": "Madad chahiye?",
 "No matching location": "Koi matching location nahi mili",
 "Number of passengers is required": "Passengers ki sankhya daalna zaroori hai",
 "Official business contact": "Official business contact",
 "Online payment failures": "Online payment fail hona",
 "Online payments and payouts may be processed by authorised payment service providers. HimRideG stores transaction references and settlement records needed for payment confirmation, accounting, dispute handling and fraud prevention.": "Online payments aur payouts authorised payment service providers ke through process ho sakte hain. HimRideG payment confirmation, accounting, dispute handling aur fraud rokne ke liye zaroori transaction references aur settlement records store karta hai.",
 "Only verified commercial/taxi vehicles with yellow number plates are allowed on HimRideG. HimRideG onboarding checks Vehicle RC, Commercial Permit and Vehicle Photo; drivers must also comply with all applicable transport and legal requirements.": "HimRideG par sirf yellow number plate wale verified commercial/taxi vehicles allowed hain. HimRideG onboarding mein Vehicle RC, Commercial Permit aur Vehicle Photo check hote hain; drivers ko saare applicable transport aur legal requirements ka bhi palan karna zaroori hai.",
 "Open Admin Login": "Admin Login kholo",
 "Open Driver Login": "Driver Login kholo",
 "Open download": "Download kholo",
 "Open full booking": "Poori booking kholo",
 "Open more navigation options": "Aur navigation options kholo",
 "Order ride for someone else": "Kisi aur ke liye ride book karo",
 "Outstation": "Outstation",
 "Palampur": "Palampur",
 "Paragliding • Mountain travel": "Paragliding • Mountain travel",
 "Payment disputes": "Payment disputes",
 "Payment help": "Payment help",
 "Payments and records": "Payments aur records",
 "Pick up where you left off": "Jahan chhoda tha wahin se shuru karo",
 "Plan intercity and long-distance travel across Himachal and nearby states.": "Himachal aur aas-paas ke states mein intercity aur long-distance travel plan karo.",
 "Plan your next Himachal journey": "Apni agli Himachal journey plan karo",
 "Platform service": "Platform service",
 "Practical safety guidance for HimRideG customers and drivers.": "HimRideG customers aur drivers ke liye practical safety guidance.",
 "Pre-plan airport pickup or drop with your trip details saved.": "Apni trip details save karke airport pickup ya drop pehle se plan karo.",
 "Public download coming soon": "Public download jaldi aa raha hai",
 "Public information": "Public information",
 "Quick ride booking": "Quick ride booking",
 "Read Privacy Policy": "Privacy Policy padho",
 "Read Terms of Use": "Terms of Use padho",
 "Ready to travel?": "Travel ke liye ready ho?",
 "Records are retained only for as long as reasonably needed for service operation, safety, accounting, dispute resolution and applicable legal obligations. Access is restricted and production systems use security controls designed to protect account and transaction information.": "Records sirf utne samay tak rakhe jaate hain jitna service operation, safety, accounting, dispute resolution aur applicable legal obligations ke liye reasonably zaroori ho. Access restricted hai aur production systems mein account aur transaction information ko protect karne ke liye security controls use hote hain.",
 "Reliable travel workflows for business and travel partners": "Business aur travel partners ke liye reliable travel workflows",
 "Report a safety concern": "Safety concern report karo",
 "Retention and security": "Retention aur security",
 "Ride cancellation": "Ride cancellation",
 "Ride conduct and safety": "Ride conduct aur safety",
 "Ride for": "Ride kiske liye",
 "Safe local taxi technology for Himachal.": "Himachal ke liye safe local taxi technology.",
 "Safe, trusted and affordable local taxi booking platform for Himachal.": "Himachal ke liye safe, trusted aur affordable local taxi booking platform.",
 "Safety emergencies": "Safety emergencies",
 "Schedule date and time": "Date aur time schedule karo",
 "Searching locations…": "Locations dhoondh rahe hain…",
 "Searching…": "Dhoondh rahe hain…",
 "Secure local taxi booking": "Secure local taxi booking",
 "Select a date and time for the scheduled booking": "Scheduled booking ke liye date aur time chuno",
 "Select a destination from suggestions": "Suggestions mein se destination chuno",
 "Select a destination from the suggestion list": "Suggestion list mein se destination chuno",
 "Select a pickup from suggestions": "Suggestions mein se pickup chuno",
 "Select a pickup from the suggestion list": "Suggestion list mein se pickup chuno",
 "Select destination": "Destination chuno",
 "Select pickup": "Pickup chuno",
 "Select time": "Time chuno",
 "Shared Ride records": "Shared Ride records",
 "Shimla": "Shimla",
 "Sign in to view your recent bookings, active Ride and payment status across your devices.": "Apne saare devices par recent bookings, active Ride aur payment status dekhne ke liye sign in karo.",
 "Someone else": "Kisi aur ke liye",
 "Switch to Hindi": "Hindi mein badlo",
 "Take HimRideG with you": "HimRideG ko apne saath le jao",
 "Tea gardens • Kangra Valley": "Tea gardens • Kangra Valley",
 "Terms of Use": "Terms of Use",
 "Text and language": "Text aur language",
 "Travel partners": "Travel partners",
 "Type at least 2 letters and select the correct location.": "Kam se kam 2 letters type karo aur sahi location chuno.",
 "Use structured Ride records and verified-driver flows for business travel. Dedicated business tools can expand as the network grows.": "Business travel ke liye structured Ride records aur verified-driver flows use karo. Network badhne ke saath dedicated business tools bhi badh sakte hain.",
 "Use the correct Customer, Driver or Admin login route. If a session expires, sign in again rather than creating a duplicate account.": "Sahi Customer, Driver ya Admin login route use karo. Agar session expire ho jaye, to duplicate account banane ke bajaye dobara sign in karo.",
 "Use the live ride information and trip-sharing features when available. Keep personal belongings secure and avoid asking a driver to operate a vehicle unsafely or unlawfully.": "Jab available ho, live ride information aur trip-sharing features use karo. Apna personal saamaan surakshit rakho aur driver se vehicle unsafe ya gair-kaanooni tareeke se chalane ko mat kaho.",
 "Use these popular regions as inspiration, then choose your exact pickup and destination in Book Ride.": "In popular regions se idea lo, phir Book Ride mein apna exact pickup aur destination chuno.",
 "Valley • Snow routes": "Valley • Snow routes",
 "Vehicle type": "Vehicle type",
 "Verified commercial drivers": "Verified commercial drivers",
 "View recent activity": "Recent activity dekho",
 "Ways to reach HimRideG support for ride, payment, account and safety issues.": "Ride, payment, account aur safety issues ke liye HimRideG support tak pahunchne ke tareeke.",
 "We use data to provide and secure accounts, create and complete rides, connect customers and drivers, calculate and settle payments, provide support, prevent abuse and maintain legally or operationally necessary records.": "Hum data ka use accounts provide aur secure karne, rides create aur complete karne, customers aur drivers ko connect karne, payments calculate aur settle karne, support dene, misuse rokne aur legally ya operationally zaroori records maintain karne ke liye karte hain.",
 "Where are you going?": "Kahan ja rahe ho?",
 "Where to?": "Kahan jaana hai?",
 "Why we process data": "Hum data kyun process karte hain",
 "YOUR RIDES": "AAPKI RIDES",
 "You can control device permissions such as location and notifications. Account or privacy requests can be raised through HimRideG Help/Support. Some transaction or ride records may need to be retained where required for settlement, safety or legal purposes.": "Aap location aur notifications jaise device permissions control kar sakte ho. Account ya privacy requests HimRideG Help/Support ke through raise ki ja sakti hain. Kuch transaction ya ride records ko settlement, safety ya legal purposes ke liye zaroorat padne par retain karna pad sakta hai.",
 "Your choices": "Aapke choices",
 "about-answer-{0}": "about-answer-{0}",
 "all 0.2s": "all 0.2s",
 "hbrInput {0}": "hbrInput {0}",
 "hbrRiderOption {0}": "hbrRiderOption {0}",
 "himrideg@gmail.com": "himrideg@gmail.com",
 "iPhone App": "iPhone App",
 "index,follow": "index,follow",
 "meta[name=\"{0}\"]": "meta[name=\"{0}\"]",
 "rotate(45deg)": "rotate(45deg)",
 "transform 0.2s": "transform 0.2s",
 "{0} km": "{0} km",
 "{0} min": "{0} min",
 "{0} | HimRideG": "{0} | HimRideG",
 "◎ Getting My Location…": "◎ Meri location mil rahi hai…",
 "◎ My Location": "◎ Meri Location",
 "🔒 This booking will continue after you log in or sign up.": "🔒 Login ya sign up karne ke baad yeh booking continue hogi.",
 "Your session has expired. Please log in again.": "Session expire ho gaya. Dobara login karo.",
 "Token or user was not found in the login response": "Login response mein token ya user nahi mila",
 "Please select the saved booking's location again": "Saved booking ki location dobara select karo",
 "The saved scheduled booking's time has expired. Please select a new time": "Saved scheduled booking ka time expire ho gaya hai. Naya time select karo",
 "Enter your phone number to continue booking": "Booking continue karne ke liye phone number bharo",
 "Confirming saved booking...": "Saved booking confirm ho rahi hai...",
 "Ride booked successfully": "Ride successfully book ho gayi",
 "Logged in, but the saved ride could not be booked. Your booking details are safe.": "Login ho gaya, lekin saved ride book nahi hui. Booking details safe hain.",
 "Basic info was saved, but the session could not continue. Please log in again.": "Basic info save ho gayi, lekin session continue nahi ho paya. Dobara login karo.",
 "Failed to load rides": "Rides load nahi hui",
 "Driver is online": "Driver online hai",
 "Driver is offline": "Driver offline hai",
 "Failed to update driver status": "Driver status update nahi hua",
 "Failed to load drivers": "Drivers load nahi hue",
 "A new ride request has arrived.": "Nayi ride request aayi hai.",
 "Ride status has been updated.": "Ride status update ho gaya hai.",
 "The customer selected a cash payment of ₹{0}.": "Customer ne ₹{0} cash payment select kiya hai.",
 "Rejected by admin.": "Admin ne reject kiya.",
 "Enter pickup and drop locations": "Pickup aur drop location bharo",
 "Enter phone number": "Phone number bharo",
 "Select pickup and drop on the map first": "Pehle map par pickup aur drop select karo",
 "Ride could not be booked": "Ride book nahi hui",
 "Ride ID or status is missing": "Ride ID ya status missing hai",
 "Ride updated": "Ride update ho gayi",
 "Failed to update ride": "Ride update nahi hui",
 "Driver updated": "Driver update ho gaya",
 "Failed to update driver": "Driver update nahi hua",
 "Customer updated": "Customer update ho gaya",
 "Failed to update customer": "Customer update nahi hua",
 "This device does not support location.": "Is device mein location support nahi hai.",
 "📡 Starting live location...": "📡 Live location start ho rahi hai...",
 "Reconnecting live socket...": "Live socket reconnect ho raha hai...",
 "Please allow location permission.": "Location permission allow karo.",
 "Current location is not available.": "Current location available nahi hai.",
 "📡 Retrying GPS signal...": "📡 GPS signal retry ho raha hai...",
 "Unable to get current location.": "Current location nahi mil rahi.",
 "Could not calculate road route": "Road route calculate nahi hua",
 "Road route is not available": "Road route available nahi hai",
 "Could not calculate the road route to pickup.": "Pickup tak ka road route calculate nahi hua.",
 "Could not calculate the road route to destination.": "Destination ka road route calculate nahi hua.",
 "Map location is not available": "Map location available nahi hai",
 "Pickup and drop coordinates were not saved for this booking.": "Is booking mein pickup aur drop coordinates save nahi hue hain.",
 "To pickup": "Pickup tak",
 "Your current location": "Aapki current location",
 "Your live location is shown on the map. When a new ride arrives, the pickup and destination route will automatically appear here.": "Aapki live location map par dikh rahi hai. Nayi ride aate hi pickup aur destination route automatically yahin show hoga.",
 "Setting pickup pin…": "Pickup pin set ho raha hai…",
 "Setting destination pin…": "Destination pin set ho raha hai…",
 "Pickup set from map": "Pickup map se set ho gaya",
 "Destination set from map": "Destination map se set ho gaya",
 "Could not convert map location to an address": "Map location address mein convert nahi hui",
 "Calculating road route…": "Road route calculate ho raha hai…",
 "Access token was not found in the refresh response": "Refresh response mein access token nahi mila",
 "Searching matching locations...": "Matching locations search ho rahi hain...",
 "No matching location found.": "Koi matching location nahi mili.",
 "Enter pickup area name": "Pickup area ka naam likho",
 "Enter destination area name": "Destination area ka naam likho",
 "Online / Cash after the ride is complete": "Ride complete hone ke baad Online / Cash",
 "UPI payment after the ride is complete": "UPI payment ride complete hone ke baad",
 "Only for scheduled bookings — actual payment after the ride is complete": "Sirf scheduled booking ke liye — actual payment ride complete hone ke baad",
 "🔒 The payment button will be enabled only after the driver completes the ride. The final locked fare will be the Online UPI / Cash payment amount.": "🔒 Payment button driver ke ride complete karne ke baad hi enable hoga. Final locked fare hi Online UPI / Cash payment amount hoga.",
 "📱 Online: after the ride is completed, pay the locked fare via a UPI app / QR scanner.": "📱 Online: ride complete hone ke baad UPI App / QR Scanner se locked fare pay hoga.",
 "💵 Cash: after the ride is completed, pay the locked fare to the driver; the driver will confirm receipt.": "💵 Cash: ride complete hone ke baad driver ko locked fare do; driver receive confirm karega.",
 "Enter your name and 10-digit mobile number.": "Name aur 10-digit mobile number enter karo.",
 "There is no active ride right now.": "Abhi koi active ride nahi hai.",
 "Before, during and after the ride.": "Ride se pehle, ride ke dauran aur ride ke baad.",
 "The trip starts only after the OTP matches at pickup.": "Pickup par OTP match hone ke baad hi trip start hoti hai.",
 "If needed, call the India emergency number directly.": "Zaroorat ho to India emergency number directly call karo.",
 "Share the OTP only after meeting the driver face-to-face. Never tell your payment details or OTP to an unknown caller over the phone.": "OTP sirf driver se face-to-face milne ke baad share karo. Payment ya OTP kisi unknown caller ko phone par mat batao.",
 "The driver receives the customer's fare directly through UPI or cash, while HimRideG tracks only the": "Driver customer ka fare directly UPI ya cash se receive karta hai, jabki HimRideG sirf",
 "The advance amount must be between ₹1 and {0}.": "Advance amount ₹1 se {0} ke beech hona chahiye.",
 "Could not send the advance request": "Advance request nahi bheji ja saki",
 "Payment was not confirmed": "Payment confirm nahi hua",
 "Confirm only after the amount arrives in your UPI/bank account. The customer's I Paid tap alone does not finalize the payment.": "Apne UPI/bank account mein amount aane ke baad hi confirm karo. Customer ka sirf I Paid tap karna payment final nahi karta.",
 "The customer will only see the Pay Online / Pay Later options.": "Customer ko sirf Pay Online / Pay Later options milenge.",
 "Continue the ride as normal. The full remaining fare will be due after Complete Ride.": "Ride normal continue karo. Complete Ride ke baad poora remaining fare due hoga.",
 "The advance has already been deducted automatically from the final ride payment.": "Final ride payment mein advance automatically minus ho chuka hai.",
 "The Razorpay payment has been verified on the server. As soon as you confirm Payment Received, the ride will be Completed and both driver and customer will be released.": "Razorpay payment server par verify ho chuka hai. Payment Received confirm karte hi ride Completed hogi aur driver/customer dono release honge.",
 "Both driver and customer are released for the next ride.": "Driver aur customer dono next ride ke liye release hain.",
 "Could not load warnings.": "Warnings load nahi ho payi.",
 "Warning acknowledged.": "Warning acknowledge ho gayi.",
 "Could not acknowledge the warning.": "Warning acknowledge nahi hui.",
 "Write a reply for the admin.": "Admin ke liye reply likho.",
 "Reply must be shorter than 500 characters.": "Reply 500 characters se chhota hona chahiye.",
 "Reply sent to the admin.": "Reply admin ko bhej diya gaya.",
 "Reply was not sent.": "Reply send nahi hua.",
 "Date not available": "Date available nahi hai",
 "Loading warnings...": "Warnings load ho rahi hain...",
 "No warnings": "Koi warning nahi hai",
 "Keep following HimRideG's rules and Terms & Conditions.": "HimRideG ke rules aur Terms & Conditions follow karte raho.",
 "Read the admin's messages carefully, acknowledge them and reply when needed.": "Admin ke messages dhyan se padho, acknowledge karo aur zaroorat ho to reply do.",
 "Warning message not available.": "Warning message available nahi hai.",
 "Write your reply to the admin...": "Admin ko apna jawab likho...",
 "HimRideG is a technology platform connecting customers with independent licensed taxi drivers. The driver is responsible for the vehicle, permits, insurance, conduct and ride execution. Pickup, drop, passenger and contact details must be accurate. Fare is locked after driver-customer negotiation and customer acceptance; the locked fare remains due for a completed ride.": "HimRideG ek technology platform hai jo customers ko independent licensed taxi drivers se jodta hai. Vehicle, permits, insurance, conduct aur ride execution ki zimmedari driver ki hai. Pickup, drop, passenger aur contact details sahi honi chahiye. Driver-customer negotiation aur customer ki acceptance ke baad fare lock ho jata hai; completed ride ke liye locked fare due rehta hai.",
 "Share the ride OTP only after verifying the driver and vehicle in person. Illegal goods, harassment, fraud, payment bypass, false bookings and account sharing are prohibited. In an emergency call 112 first; report issues with ride ID and proof to himrideg@gmail.com.": "Driver aur vehicle ko khud verify karne ke baad hi ride OTP share karo. Illegal saamaan, harassment, fraud, payment bypass, fake bookings aur account sharing mana hai. Emergency mein pehle 112 call karo; issues ride ID aur proof ke saath himrideg@gmail.com par report karo.",
 "Use the same account and shared Ride data across web and mobile. Store download links appear here as soon as the public apps are published.": "Web aur mobile par same account aur shared Ride data use karo. Public apps publish hote hi store download links yahan dikhenge.",
 "Payable amount is not valid": "Payable amount valid nahi hai",
 "Could not load Razorpay checkout": "Razorpay checkout load nahi ho saka",
 "Payment order is not ready": "Payment order ready nahi hua",
 "Server payment amount does not match the ride amount": "Server payment amount ride amount se match nahi karta",
 "Payment could not be verified": "Payment verify nahi hua",
 "Could not save Pay Later": "Pay Later save nahi hua",
 "Could not select cash": "Cash select nahi hua",
 "Cash payment was not confirmed": "Cash payment confirm nahi hua",
 "The driver will check the amount in their UPI/bank account and confirm Payment Received. Only then will the ride payment be final.": "Driver apne UPI/bank account mein amount check karke Payment Received confirm karega. Uske baad hi ride payment final hoga.",
 "If you have paid in cash, tap Payment Done. The driver can also confirm Cash Received independently.": "Cash de diya hai to Payment Done dabao. Driver bhi Cash Received independently confirm kar sakta hai.",
 "Complete the payment": "Payment complete karo",
 "If you pay an advance, it will be automatically deducted from the final fare. If you choose Pay Later, the ride can continue and the amount will remain in the remaining payment at the end.": "Advance pay karne par final fare se automatically minus hoga. Pay Later choose karne par ride continue ho sakti hai aur amount end mein remaining payment mein rahega.",
 "Your payment has been verified on the server. The ride will be marked Completed automatically after the driver confirms.": "Aapka payment server par verify ho chuka hai. Driver confirmation ke baad ride automatically Completed hogi.",
 "pay in cash": "cash do",
 "Pickup/drop coordinates are required": "Pickup/drop coordinates required hain",
 "Allow location permission, then tap My Location again.": "Location permission allow karo, phir My Location dobara dabao.",
 "GPS/location is unavailable. Please turn on location services.": "GPS/location unavailable hai. Location services ON karo.",
 "GPS response timed out. Please try again in an open area.": "GPS response timeout ho gaya. Open area mein dobara try karo.",
 "Could not get a high-accuracy GPS location": "High-accuracy GPS location nahi mili",
 "Please select an image file only": "Sirf image file select karo",
 "Image must be smaller than 8 MB": "Image 8 MB se chhoti honi chahiye",
 "Your ride has been completed successfully.": "Aapki ride successfully complete ho gayi.",
 "— please rate them.": "ko rate karo.",
 "Wallet balance, add money and wallet credits features are being prepared for launch. The ride payment section is available now and will use only the locked fare of the completed ride.": "Wallet balance, add money aur wallet credits feature abhi launch ke liye prepare ho raha hai. Ride payment section abhi se available hai aur completed ride ka locked fare hi use karega.",
 "Wallet balance, add money and wallet transaction features will be available soon. For now, customers can pay for rides via Online UPI or Cash.": "Wallet balance, add money aur wallet transaction features jaldi available honge. Abhi customer ride payment Online UPI ya Cash se kar sakta hai.",
 "Payment will be enabled here once a completed ride is unpaid.": "Completed unpaid ride aayegi to payment yahin enable ho jayega.",
 "Could not accept the final fare": "Final fare accept nahi ho saka",
 "Enter a valid counter fare between ₹50 and ₹10,000": "Valid counter fare ₹50 se ₹10,000 ke beech enter karo",
 "Could not send the counter offer": "Counter offer nahi ho saka",
 "Could not reject the final fare": "Final fare reject nahi hua",
 "Profile updated successfully": "Profile successfully update ho gayi",
 "Profile could not be updated": "Profile update nahi hui",
 "Do you want to cancel the ride?": "Kya aap ride cancel karna chahte hain?",
 "Payment will be enabled only after the driver completes the ride and the final fare is locked.": "Payment driver ke ride complete karne aur final fare lock hone ke baad hi enable hoga.",
 "Support: Contact the HimRideG team": "Support: HimRideG team se contact karo",
 "Your ride, in your own mountains.": "Aapki ride, aapke apne pahadon mein.",
 "Hello, I am messaging about HimRideG booking {0}.": "Namaste, main HimRideG booking {0} ke baare mein message kar raha/rahi hoon.",
 "Driver's number is not available right now": "Driver number abhi available nahi hai",
 "No active ride right now": "Abhi koi active ride nahi hai",
 "Select pickup and destination to book a ride.": "Pickup aur destination select karke ride book karo.",
 "There are no rides in this list yet.": "Is list mein abhi koi ride nahi hai.",
 "The Refer & Earn feature will be enabled with the live service.": "Refer & Earn feature live service ke saath enable hoga.",
 "The content on these pages loads live from the website, so the latest content will appear here as soon as the website is updated.": "In pages ka content website se live load hota hai, isliye website update hote hi yahan bhi latest content dikhega.",
 "The driver has arrived. Share this OTP with the driver once you meet in person.": "Driver arrive ho gaya hai. Driver se milne ke baad ye OTP batao.",
 "This popup will close automatically once the OTP is verified.": "OTP verify hote hi ye popup automatically close ho jayega.",
 "Google login did not load.": "Google login load nahi hua.",
 "Google Identity Services did not load.": "Google Identity Services load nahi hui.",
 "Google credential not found. Please try again.": "Google credential nahi mila. Dobara try karo.",
 "Token or user not found in the Google login response.": "Google login response mein token ya user nahi mila.",
 "This is not a {0} account.": "Ye {0} account nahi hai.",
 "Google login failed.": "Google login nahi ho paya.",
 "Google Client ID has not been configured yet.": "Google Client ID configure karna baaki hai.",
 "Please accept the Terms, Privacy and Cancellation rules before continuing.": "Continue karne se pehle Terms, Privacy aur Cancellation rules accept karo.",
 "Google login is not ready yet.": "Google login abhi ready nahi hai.",
 "Enter your mobile number and verify your {0} account with Google": "Mobile number enter karo aur Google se {0} account verify karo",
 "Enter your mobile number and log in securely to {0} with Google": "Mobile number enter karo aur Google se secure {0} login karo",
 "After Google verification, you will go directly to the Dashboard.": "Google verification ke baad direct Dashboard par jaoge.",
 "Request could not be completed": "Request complete nahi hui",
 "Pickup and Drop Map": "Pickup aur Drop Map",
 "Razorpay checkout did not load": "Razorpay checkout load nahi hua",
 "Keep the top-up between ₹100 and ₹50,000.": "Top-up ₹100 se ₹50,000 ke beech rakho.",
 "Top-up could not be verified": "Top-up verify nahi hua",
 "Wallet payment failed": "Wallet payment fail ho gayi",
 "Wallet top-up could not be started": "Wallet top-up start nahi hua",
 "Opening payment...": "Payment open ho rahi hai...",
 "Minimum withdrawal is ₹100.": "Minimum withdrawal ₹100 hai.",
 "Balance is only ₹{0}.": "Balance sirf ₹{0} hai.",
 "Enter your UPI ID.": "UPI ID enter karo.",
 "Account number and IFSC are required.": "Account number aur IFSC zaroori hai.",
 "Request submitted!": "Request submit ho gayi!",
 "Request could not be submitted.": "Request submit nahi ho saki.",
 "Send Withdrawal Request": "Withdrawal Request Bhejo",
 "Minimum \\u20b9100 balance required.": "Minimum \\u20b9100 balance chahiye.",
 "Enter bank account number and IFSC.": "Bank account number aur IFSC enter karo.",
 "Payout details saved.": "Payout details save ho gayi.",
 "Payout details could not be saved.": "Payout details save nahi ho saki.",
 "Live RazorpayX payout is not ready on the server yet.": "Live RazorpayX payout server par abhi ready nahi hai.",
 "Select a primary UPI/Bank account or save a UPI ID.": "Primary UPI/Bank account select karo ya UPI ID save karo.",
 "Select a primary bank account or save bank details.": "Primary bank account select karo ya bank details save karo.",
 "Payout submitted!": "Payout submit ho gaya!",
 "Payout could not be submitted.": "Payout submit nahi ho saka.",
 "Add a bank/UPI account in UPI & Payment Settings and select it as Primary.": "UPI & Payment Settings mein bank/UPI add karke Primary select karo.",
 "Instant withdrawal is not available right now. Your wallet earnings will stay safe.": "Instant withdrawal abhi available nahi hai. Wallet earning safe rahegi.",
 "Processing payout...": "Payout ho raha hai...",
 "Minimum ₹100 balance required.": "Minimum ₹100 balance chahiye.",
 "A ride is currently active. Accept / Reject will be available after the ride is completed.": "Current ride active hai. Ride complete hone ke baad Accept / Reject available hoga.",
 "A new nearby ride has arrived. It is preview-only because a ride is currently active.": "Nayi nearby ride aayi hai. Current ride active hone ki wajah se ye preview-only hai.",
 "The ride request is no longer available.": "Ride request ab available nahi hai.",
 "Ride completed successfully.": "Ride successfully complete ho gayi.",
 "The customer sent a counter offer of ₹{0}.": "Customer ne ₹{0} ka counter offer bheja.",
 "The fare is now final and locked. Please continue the ride.": "Fare final lock ho gaya. Ride continue karo.",
 "The customer rejected the FINAL fare. The ride has been released and a new driver will be searched.": "Customer ne FINAL fare reject kiya. Ride release ho gayi aur naya driver search hoga.",
 "The customer selected Advance Payment. Ride actions are locked until the payment is made.": "Customer ne Advance Payment select ki. Payment paid hone tak ride actions locked hain.",
 "The customer selected Scheduled Payment. The Pay Now option is available.": "Customer ne Scheduled Payment select ki. Pay Now option available hai.",
 "Booking ID not found.": "Booking ID nahi mili.",
 "Enter a fare between ₹50 and ₹10,000.": "Fare ₹50 se ₹10,000 ke beech enter karo.",
 "The final fare could not be sent. Please retry.": "Final fare nahi bheja ja saka. Retry karo.",
 "₹{0} fare sent to the customer. The customer will now Accept, Reject or make a one-time Counter.": "₹{0} fare customer ko bhej diya. Ab customer Accept, Reject ya one-time Counter karega.",
 "The fare offer could not be sent. Please retry.": "Fare offer nahi bheja ja saka. Retry karo.",
 "The customer's counter fare is not valid.": "Customer ka counter fare valid nahi hai.",
 "The customer's ₹{0} counter was accepted. Fare locked.": "Customer ka ₹{0} counter accept ho gaya. Fare locked.",
 "The counter offer could not be accepted.": "Counter offer accept nahi hua.",
 "The counter offer could not be rejected.": "Counter offer reject nahi hua.",
 "Counter rejected. Now send a new fare.": "Counter reject ho gaya. Ab naya fare bhejo.",
 "Ride accepted.": "Ride accept ho gayi.",
 "Release this unconfirmed ride? You will immediately be available to take the next ride.": "Is unconfirmed ride ko release karna hai? Aap turant next ride lene ke liye available ho jaoge.",
 "Ride released. You can take the next ride.": "Ride release ho gayi. Aap next ride le sakte ho.",
 "The ride could not be released.": "Ride release nahi hui.",
 "Confirm that ₹{0} cash was received from the customer?": "Customer se ₹{0} cash receive hua, confirm karna hai?",
 "Cash payment could not be confirmed.": "Cash payment confirm nahi hui.",
 "Journey to pickup has started.": "Pickup ke liye journey start ho gayi.",
 "OTP sent to the customer. Ask the customer for the OTP and enter it manually.": "OTP customer ko bhej diya. Customer se OTP poochkar manually enter karo.",
 "OTP verified. The ride has started.": "OTP verified. Ride start ho gayi.",
 "Has the customer reached the destination?": "Kya customer destination par pahunch gaya hai?",
 "Ride completed at the destination. Now waiting for the customer's payment.": "Ride destination par complete ho gayi. Ab customer payment ka wait hai.",
 "Profile saved": "Profile save ho gayi",
 "Profile photo updated": "Profile photo update ho gayi",
 "Enter your full name as on your Aadhaar card": "Aadhaar card wala poora naam enter karo",
 "Document uploaded ✓": "Document upload ho gaya ✓",
 "The customer's cash payment is complete. You can take the next ride.": "Customer ki cash payment complete ho gayi. Aap next ride le sakte ho.",
 "The customer's online payment has been received. You can take the next ride.": "Customer ki online payment receive ho gayi. Aap next ride le sakte ho.",
 "Some Documents Were Rejected": "Kuch Documents Reject Hue",
 "Upload Documents": "Documents Upload Karo",
 "Upload the rejected documents again. Dashboard access will not be available until then.": "Rejected documents dobara upload karo. Tab tak dashboard access nahi milega.",
 "Upload all 5 required documents before taking rides. The admin will verify them.": "Ride lene se pehle saare 5 required documents upload karo. Admin verify karega.",
 "Not uploaded": "Upload nahi hua",
 "All your documents will be verified by the admin once uploaded. The dashboard and rides will be available after verification.": "Saare documents upload hone ke baad Admin verify karega. Verification ke baad dashboard aur rides available honge.",
 "All your documents are with the admin for review.": "Aapke saare documents admin ke paas review ke liye hain.",
 "Rides will start coming in after approval.": "Approval ke baad rides aana shuru ho jayengi.",
 "ℹ What will the admin do?": "ℹ Admin kya karega?",
 "After verification, your account will be approved": "Verification ke baad aapka account approve hoga",
 "and the dashboard + rides will unlock automatically.": "aur dashboard + rides automatically unlock ho jayenge.",
 "Refresh the page, or log out and log in again, to check your approval status.": "Approval status check karne ke liye page refresh karo ya logout karke dobara login karo.",
 "Enter Customer OTP": "Customer OTP Enter Karo",
 "Enter the ride-start OTP shown on the customer's phone.": "Customer ke phone par dikh raha ride-start OTP enter karo.",
 "Once a new OTP is generated, the old OTP will become invalid.": "Naya OTP banne par purana OTP invalid ho jayega.",
 "Your performance": "Aapki performance",
 "The customer will scan this QR by opening the Camera Scanner from the completed ride's payment screen. The QR verifies the driver's identity; the payment amount will always be the final locked fare.": "Customer completed ride ki payment screen se Camera Scanner open karke is QR ko scan karega. QR driver identity verify karta hai; payment amount hamesha final locked fare hi rahega.",
 "The customer will pay the locked fare via Paytm / UPI. After the ride is complete + the payment is verified": "Customer Paytm / UPI se locked fare pay karega. Ride complete + payment verify hone ke baad",
 "the platform commission will be retained in the Razorpay collection and": "platform commission Razorpay collection me retain hogi aur",
 "will be credited to this earnings wallet. Withdrawals go to your saved UPI or bank account via live RazorpayX payout.": "is earnings wallet me credit hoga. Withdrawal live RazorpayX payout se saved UPI ya bank account par jayega.",
 "Your latest ride credits, cash commission and withdrawals are clearly shown here.": "Latest ride credits, cash commission aur withdrawals yahan clearly dikhte hain.",
 "No wallet transaction history yet.": "Abhi wallet transaction history nahi hai.",
 "The existing add-money code is preserved. It is kept for clearing pending HimRideG commission on cash rides. 90% of the customer's online ride earnings is credited to the real earnings wallet, separate from this top-up.": "Existing add-money code preserve hai. Iska use cash rides ki pending HimRideG commission clear karne ke liye rakha gaya hai. Customer online ride earning ka 90% is top-up se alag real earnings wallet me credit hota hai.",
 "Upload and verify these documents before taking rides": "Ride lene se pehle yeh documents upload aur verify karwao",
 "Later": "Baad mein",
 "📤 Upload Documents": "📤 Documents Upload Karo",
 "Manage your profile, wallet, rides and summary all in one place.": "Profile, wallet, rides aur summary sab ek jagah se manage karo.",
 "The Refer and Earn feature will be enabled with the public rollout.": "Refer and Earn feature public rollout ke saath enable hoga.",
 "Invite other verified taxi drivers to HimRideG": "Dusre verified taxi drivers ko HimRideG par invite karo",
 "Help: Contact HimRideG support for ride, payment or driver verification issues.": "Help: ride, payment ya driver verification issue ke liye HimRideG support se contact karo.",
 "Full name as on Aadhaar": "Aadhaar wala poora naam",
 "✓ Admin verified — cannot be changed": "✓ Admin verified — change nahi hoga",
 "The admin will verify after Aadhaar is uploaded": "Aadhaar upload ke baad admin verify karega",
 "Cannot be changed without OTP verification": "OTP verification ke bina change nahi hoga",
 "Only commercial vehicles are allowed on HimRideG": "HimRideG par sirf commercial vehicles allowed hain",
 "No transactions in this filter yet.": "Is filter me abhi koi transaction nahi hai.",
 "JPG, PNG, WEBP or PDF • Max 5MB • The admin will verify after upload": "JPG, PNG, WEBP ya PDF • Max 5MB • Upload ke baad Admin verify karega",
 "Could not open document:": "Document open nahi ho saka:",
 "Tap the ride request. Accept / Reject will appear only after the details open.": "Ride request par tap karo. Accept / Reject sirf details open hone ke baad aayega.",
 "The customer selected Cash Payment. Confirm only after physically receiving the cash.": "Customer ne Cash Payment select kiya hai. Cash physically milne ke baad confirm karo.",
 "The ride is complete. Whether or not the customer selects Cash, confirm Receive Cash as soon as you physically receive the cash.": "Ride complete hai. Customer Cash select kare ya na kare, cash physically milte hi Receive Cash confirm karo.",
 "The fare will be LOCKED only after the customer accepts.": "Fare sirf customer ke Accept karne ke baad LOCK hoga.",
 "The final fare status was saved, but the amount was missing/₹0. ₹0 will never be sent to the customer. Please send your FINAL fare again; once a valid amount is saved, the customer will only get Accept / Reject.": "Final fare status save hua tha lekin amount missing/₹0 mila. Customer ko ₹0 kabhi nahi bheja jayega. Apna FINAL fare dobara bhejo; valid amount save hote hi customer ko sirf Accept / Reject milega.",
 "Resend FINAL fare": "FINAL fare resend karo",
 "You now have 2 options: accept the customer's counter to lock the fare immediately, or send your FINAL fare.": "Ab 2 option hain: customer ka counter Accept karke fare turant lock karo, ya apna FINAL fare bhejo.",
 "Your FINAL fare": "Apna FINAL fare",
 "The customer can now Accept, Reject or make one Counter Offer on this fare. The initial fare cannot be sent again.": "Customer ab is fare ko Accept, Reject ya ek baar Counter Offer kar sakta hai. Initial fare dobara send nahi hoga.",
 "Enter your initial fare": "Apna initial fare enter karo",
 "⏳ Waiting for the customer's final Accept / Reject": "⏳ Customer ke final Accept / Reject ka wait",
 "⚠ A ₹0 final fare is invalid — please resend the recovery fare": "⚠ ₹0 final fare invalid hai — recovery fare resend karo",
 "⏳ Waiting for the customer's Accept / Reject / Counter": "⏳ Customer ke Accept / Reject / Counter ka wait",
 "🔒 A current ride is active. This is a preview of the next ride; Accept / Reject will be available only after the current ride is complete.": "🔒 Current ride active hai. Ye next ride preview hai; current ride complete hone ke baad hi Accept / Reject available hoga.",
 "The customer selected a cash payment of ₹{0}. Press Receive Cash after physically receiving the cash.": "Customer ne ₹{0} Cash Payment select kiya hai. Cash physically milne ke baad Receive Cash dabao.",
 "The ride is complete. Press Receive Cash as soon as you physically receive ₹{0} in cash; this action will disappear automatically once an online payment succeeds.": "Ride complete hai. ₹{0} cash physically milte hi Receive Cash dabao; online payment successful hote hi ye action khud hat jayega.",
 "Could not load status.": "Status load nahi ho saka.",
 "Vehicle details saved": "Vehicle details save ho gayi",
 "Vehicle details could not be saved.": "Vehicle details save nahi hui.",
 "The file must be smaller than 5 MB.": "File 5 MB se choti honi chahiye.",
 "Document uploaded!": "Document upload ho gaya!",
 "Document not uploaded.": "Document upload nahi hua.",
 "Request sent!": "Request bhej di gayi!",
 "Request not submitted.": "Request submit nahi hui.",
 "We have received all your documents. The admin is verifying them — this may take 24 to 48 hours.": "Aapke saare documents mil gaye hain. Admin verification kar raha hai — 24 se 48 ghante lag sakte hain.",
 "Your dashboard will open automatically once you are approved.": "Approve hote hi aapka dashboard khud khul jayega.",
 "Refresh Status": "Status Refresh Karo",
 "Request Rejected": "Request Reject Hui",
 "To take rides, you first need to get your documents and vehicle details verified.": "Rides lene ke liye pehle apne documents aur gaadi ki jaankari verify karwani hogi.",
 "You cannot accept rides until you are approved.": "Approval milne tak aap rides accept nahi kar sakte.",
 "Enter the name exactly as it appears on your Aadhaar card": "Bilkul wohi naam likho jo Aadhaar card par hai",
 "✓ Verified by admin — name is locked": "✓ Admin ne verify kar diya — naam lock hai",
 "⚠️ Exactly the same name as on Aadhaar — the admin will verify and lock it": "⚠️ Exactly same naam jo Aadhaar par hai — admin verify karke lock karega",
 "Name saved ✓": "Naam save ho gaya ✓",
 "Name not saved": "Naam save nahi hua",
 "Fill in vehicle details": "Gaadi ki jaankari bharo",
 "⚠️ Commercial Vehicles Only": "⚠️ Sirf Commercial Vehicle",
 "Only yellow-plate (commercial) vehicles are allowed on HimRideG. The vehicle class on the RC must be Motor Cab / Maxi Cab / LMV-Taxi.": "HimRideG par sirf yellow plate (commercial) gaadi allowed hai. RC par vehicle class Motor Cab / Maxi Cab / LMV-Taxi honi chahiye.",
 "Save Vehicle Details": "Vehicle Details Save Karo",
 "A request will be sent to the admin once everything is complete": "Sab complete hone par admin ko request jayegi",
 "These items are still pending:": "Ye cheezein abhi baaki hain:",
 "Send Approval Request": "Approval Request Bhejo",
 "Enter your full name.": "Apna full name enter karo.",
 "Updated user not found in the response.": "Updated user response me nahi mila.",
 "Basic info saved.": "Basic info save ho gayi.",
 "Basic info could not be saved.": "Basic info save nahi ho payi.",
 "Your Google account has been verified. No password or OTP is needed.": "Google account verify ho chuka hai. Password ya OTP ki zarurat nahi hai.",
 "Your Google account name and the mobile number entered at login have been filled in here automatically.": "Google account ka name aur login par enter kiya mobile number automatically yahan aa gaya hai.",
 "Your mobile number will be saved for ride contact and account communication.": "Mobile number ride contact aur account communication ke liye save hoga.",
 "Your name and email came from secure Google sign-in.": "Name aur email secure Google sign-in se aaye hain.",
 "Creating a password is not mandatory for accounts that use Google login.": "Google login wale account ke liye password create karna compulsory nahi hai.",
 "Once your basic info is saved, your next login will open the dashboard directly.": "Basic info save hone ke baad next login direct dashboard kholega.",
 "Password not required": "Password required nahi hai",
 "No password field": "Password field nahi hai",
 "You can continue to sign in directly with your Google account.": "Aage bhi Google account se direct sign in kar sakte ho.",
 "Sensitive saved driver payout identifiers are protected on the server and masked when shown in the interface.": "Driver ke saved sensitive payout identifiers server par protected rehte hain aur interface me dikhate waqt masked hote hain.",
 "Where fare negotiation is enabled, the driver can send an offer, the customer can respond, and the final fare becomes locked only after the customer accepts the final amount. The accepted final fare is the amount used for the ride payment flow unless a lawful adjustment is required.": "Jahan fare negotiation enabled hai, wahan driver offer bhej sakta hai, customer respond kar sakta hai, aur final fare tabhi lock hota hai jab customer final amount accept kare. Accept kiya gaya final fare hi ride payment flow me use hota hai, jab tak koi lawful adjustment zaroori na ho.",
 "A ride may support online payment or cash according to the options shown in the product. Payment, commission, wallet and payout records may be retained for settlement, reconciliation, support and dispute handling.": "Product me dikhaye gaye options ke hisaab se ride me online payment ya cash support ho sakta hai. Payment, commission, wallet aur payout records settlement, reconciliation, support aur dispute handling ke liye rakhe ja sakte hain.",
 "A ride may be cancelled through the options shown in the customer or driver flow. The applicable ride state, accepted fare, driver assignment and any payment already made are considered before the cancellation is finalised.": "Customer ya driver flow me dikhaye gaye options se ride cancel ki ja sakti hai. Cancellation final karne se pehle ride state, accepted fare, driver assignment aur pehle se kiya gaya koi bhi payment dekha jata hai.",
 "A payment that is not verified as successful is not treated as a completed payment. If money is debited but HimRideG does not receive a verified success confirmation, the transaction is reconciled using the payment provider status before any duplicate collection or refund decision is made.": "Jo payment successful verify nahi hua, use completed payment nahi mana jata. Agar paise debit ho gaye lekin HimRideG ko verified success confirmation nahi mila, to duplicate collection ya refund ka decision lene se pehle payment provider status se transaction reconcile kiya jata hai.",
 "Where an online payment is eligible for refund, the refund is sent through the original or otherwise supported payment channel after verification. Bank or payment-provider processing time can vary after a refund has been initiated.": "Jahan online payment refund ke liye eligible hai, wahan verification ke baad refund original ya kisi aur supported payment channel se bheja jata hai. Refund initiate hone ke baad bank ya payment provider ka processing time alag ho sakta hai.",
 "Cash payments are confirmed within the ride flow. A cash-payment dispute should be raised through Help/Support with the ride details so it can be reviewed against the recorded ride and payment status.": "Cash payments ride flow ke andar hi confirm hote hain. Cash-payment dispute ride details ke saath Help/Support se raise karo, taaki recorded ride aur payment status ke against review ho sake.",
 "If the same ride appears to have been charged more than once, raise a support request with the ride and transaction reference. HimRideG will verify provider records before arranging any eligible correction.": "Agar ek hi ride ka charge ek se zyada baar laga lage, to ride aur transaction reference ke saath support request raise karo. HimRideG koi bhi eligible correction karne se pehle provider records verify karega.",
 "Check the driver and vehicle details shown for your booking before starting the ride. Drivers should confirm the correct customer and pickup before proceeding.": "Ride start karne se pehle apni booking ke liye dikhaye gaye driver aur vehicle details check karo. Drivers aage badhne se pehle sahi customer aur pickup confirm karein.",
 "Use the Safety or Help area in HimRideG to report a ride, driver, customer or payment-related safety concern. Provide the ride reference and relevant details so the event can be reviewed.": "Ride, driver, customer ya payment se judi safety concern report karne ke liye HimRideG me Safety ya Help area use karo. Ride reference aur relevant details do taaki event review ho sake.",
 "The public home experience supports English and Hindi content. Device and browser text-size or zoom controls can be used to enlarge the interface, and responsive layouts are designed to adapt across mobile and desktop screens.": "Public home experience English aur Hindi content support karta hai. Interface bada karne ke liye device aur browser ke text-size ya zoom controls use kar sakte ho, aur responsive layouts mobile aur desktop screens par adjust hone ke liye design kiye gaye hain.",
 "If an accessibility issue prevents you from using an important HimRideG feature, contact HimRideG support and describe the screen, device and action that is difficult to use so the issue can be reviewed.": "Agar kisi accessibility issue ki wajah se aap HimRideG ka koi important feature use nahi kar pa rahe, to HimRideG support se contact karo aur batao kaunsi screen, device aur action use karna mushkil hai, taaki issue review ho sake.",
 "For a failed, pending or duplicate online payment, keep the ride and transaction reference available. Do not repeat a payment solely because a screen is delayed; first check the ride payment status.": "Failed, pending ya duplicate online payment ke liye ride aur transaction reference ready rakho. Sirf screen delay hone ki wajah se payment dobara mat karo; pehle ride payment status check karo.",
 "Use the Help/Support section inside HimRideG and include the relevant ride reference, transaction reference or account context. This keeps the request linked to the correct service record.": "HimRideG ke andar Help/Support section use karo aur relevant ride reference, transaction reference ya account context add karo. Isse request sahi service record se linked rehti hai.",
 "For payment or payout issues, include the ride or withdrawal reference and the approximate transaction time. Never send passwords, OTPs, card PINs or UPI PINs to support.": "Payment ya payout issues ke liye ride ya withdrawal reference aur approx transaction time add karo. Support ko kabhi bhi password, OTP, card PIN ya UPI PIN mat bhejo.",
 "HimRideG will publish its verified public business/grievance contact details on this page once the final business profile is confirmed. Until then, use the authenticated Help/Support flow so requests are tied to the correct account and ride.": "Final business profile confirm hone par HimRideG is page par apne verified public business/grievance contact details publish karega. Tab tak authenticated Help/Support flow use karo taaki requests sahi account aur ride se jude rahein.",
 "Additional business booking, reporting and partner features may be introduced as the network expands. Features are shown as available only when they are enabled in the live product.": "Network expand hone ke saath extra business booking, reporting aur partner features aa sakte hain. Features tabhi available dikhaye jaate hain jab wo live product me enable hon.",
 "new ride": "nayi ride",
 "driver is on the way": "driver aa raha hai",
 "Select a valid future schedule date/time": "Valid future schedule date/time select karo",
 "Unsupported ride status: {0}": "Unsupported ride status: {0}",
 "logout request failed": "logout request fail ho gaya",
 "📍 Live location active": "📍 Live location active hai",
 "{0} hr {1} min": "{0} ghanta {1} min",
 "{0} hr": "{0} ghanta",
 "Your browser does not support location.": "Browser location support nahi karta.",
 "Allow driver location permission.": "Driver location permission allow karo.",
 "Could not get current location.": "Current location nahi mil paayi.",
 "Selected Ride Route": "Selected Ride Route",
 "● Live": "● Live",
 "Calculating...": "Calculate ho raha hai...",
 "Trip time": "Trip time",
 "Navigate to Pickup": "Pickup tak navigate karo",
 "View Full Trip": "Poori trip dekho",
 "DRIVER LOCATION": "DRIVER LOCATION",
 "km •": "km •",
 "Driver Live": "Driver Live",
 "Could not get my location": "Meri location nahi mil saki",
 "Plan your journey": "Apni journey plan karo",
 "Close booking": "Booking band karo",
 "Schedule Date &amp; Time": "Schedule Date &amp; Time",
 "Online Preferred": "Online Preferred",
 "Schedule Payment": "Schedule Payment",
 "Note": "Note",
 "Landmark, luggage, special instructions...": "Landmark, luggage, special instructions...",
 "Est. Time": "Est. Time",
 "Driver will offer": "Driver offer karega",
 "Active ride already exists": "Active ride pehle se hai",
 "HimRideG ride {0}": "HimRideG ride {0}",
 "Pickup: {0}": "Pickup: {0}",
 "Drop: {0}": "Drop: {0}",
 "Status: {0}": "Status: {0}",
 "HimRideG: https://www.himrideg.com": "HimRideG: https://www.himrideg.com",
 "HIMRIDEG SAFETY": "HIMRIDEG SAFETY",
 "Your safety toolkit": "Aapka safety toolkit",
 "Verified taxi only": "Sirf verified taxi",
 "Commercial vehicle documents and driver approval before going online.": "Online hone se pehle commercial vehicle documents aur driver approval.",
 "Ride start OTP": "Ride start OTP",
 "Pickup, destination and driver location on one live map.": "Pickup, destination aur driver location ek live map par.",
 "Emergency access": "Emergency access",
 "Emergency 112": "Emergency 112",
 "Share Active Ride": "Active Ride share karo",
 "Trusted contacts": "Trusted contacts",
 "Up to 5 contacts are saved privately on this device/browser.": "Up to 5 contacts is device/browser par privately save hote hain.",
 "Trusted Contact Name": "Trusted Contact ka naam",
 "Family / friend": "Family / friend",
 "Save Trusted Contact": "Trusted Contact save karo",
 "Safety rule": "Safety rule",
 "UPI ID: {0}": "UPI ID: {0}",
 "Open UPI App · Pay": "UPI App kholo · Pay karo",
 "I Paid {0} · Driver Will Verify": "Maine {0} pay kiya · Driver verify karega",
 "Driver earnings and platform fee": "Driver earnings aur platform fee",
 "Earnings &amp; Platform Fee": "Earnings &amp; Platform Fee",
 "Rides Active": "Rides Active",
 "Test mode is active. Platform fee blocking will not apply when accepting new rides. Once testing is complete, ask the admin to disable Test Mode.": "Test mode active hai. Nayi rides accept karte waqt platform fee blocking apply nahi hogi. Testing complete hone par admin se Test Mode band karne ko bolo.",
 "Pay your outstanding platform fee before accepting a new ride. New rides are blocked when the outstanding fee reaches ₹100 or more.": "Nayi ride accept karne se pehle apni pending platform fee pay karo. Pending fee ₹100 ya usse zyada hone par nayi rides block ho jaati hain.",
 "Your outstanding platform fee is below ₹100, so you can continue accepting new rides. Pay it on time to avoid interruptions.": "Aapki pending platform fee ₹100 se kam hai, isliye aap nayi rides accept karte reh sakte ho. Rukawat se bachne ke liye time par pay karo.",
 "Your platform fee is fully cleared. You can accept new rides.": "Aapki platform fee poori clear ho gayi hai. Aap nayi rides accept kar sakte ho.",
 "Pay Platform Fee ₹": "Platform Fee Pay karo ₹",
 "Saved UPI": "Saved UPI",
 "% platform fee. The driver keeps": "% platform fee. Driver ko milta hai",
 "%. Once RazorpayX is enabled, automatic payouts will be sent to this selected primary account.": "%. RazorpayX enable hone ke baad automatic payouts is selected primary account mein bheje jaayenge.",
 "UPI Payment Received {0}": "UPI Payment mil gaya {0}",
 "Cash Received {0}": "Cash mil gaya {0}",
 "Payment Status": "Payment Status",
 "Advance Received:": "Advance mila:",
 "Remaining:": "Baaki:",
 "OPTIONAL ADVANCE": "OPTIONAL ADVANCE",
 "Request Advance Before Ride Start": "Ride start se pehle Advance request karo",
 "Sending…": "Bhej rahe hain…",
 "Request Advance": "Advance request karo",
 "CUSTOMER CHOSE PAY LATER": "CUSTOMER NE PAY LATER CHOOSE KIYA",
 "Advance skipped": "Advance skip kiya gaya",
 "ADVANCE REQUEST SENT": "ADVANCE REQUEST BHEJ DIYA",
 "The customer will choose Pay Online or Pay Later.": "Customer Pay Online ya Pay Later choose karega.",
 "ADVANCE RECEIVED": "ADVANCE MIL GAYA",
 "Customer payment pending": "Customer payment pending",
 "ONLINE PAYMENT VERIFIED": "ONLINE PAYMENT VERIFIED",
 "✅ Confirm Payment Received": "✅ Payment milne ka confirm karo",
 "Receive": "Receive",
 "Payment fully received": "Payment poora mil gaya",
 "Confirm only after receiving cash": "Cash milne ke baad hi confirm karo",
 "UPI and Payment Settings": "UPI aur Payment Settings",
 "Close payment settings": "Payment settings band karo",
 "Google Pay": "Google Pay",
 "PhonePe": "PhonePe",
 "Paytm": "Paytm",
 "Invalid date": "Invalid date",
 "High": "High",
 "Medium": "Medium",
 "Low": "Low",
 "ACCOUNT STATUS": "ACCOUNT STATUS",
 "Refreshing...": "Refresh ho raha hai...",
 "ADMIN WARNINGS": "ADMIN WARNINGS",
 "Warnings & Messages": "Warnings & Messages",
 "Acknowledged": "Acknowledged",
 "Action Required": "Action Required",
 "⚠ Admin Warning": "⚠ Admin Warning",
 "Reason": "Reason",
 "Acknowledged on": "Acknowledge kiya",
 "Your reply": "Aapka reply",
 "Sent on": "Bheja gaya",
 "Reply to Admin": "Admin ko reply karo",
 "Sending...": "Bhej rahe hain...",
 "Send Reply": "Reply bhejo",
 "I Understand": "Samajh gaya",
 "Edit Reply": "Reply edit karo",
 "Your response": "Aapka response",
 "Waiting for {0}": "{0} ka wait",
 "Auto cancelling…": "Auto cancel ho raha hai…",
 "Advance {0}": "Advance {0}",
 "Remaining ride payment {0}": "Baaki ride payment {0}",
 "UPI payment sent · Driver verification pending": "UPI payment bhej diya · Driver verification pending",
 "Cash selected": "Cash select kiya",
 "Payment Done": "Payment ho gaya",
 "Opening…": "Khul raha hai…",
 "Selecting…": "Select ho raha hai…",
 "Payment status": "Payment status",
 "Close payment": "Payment band karo",
 "Ride Status:": "Ride Status:",
 "DRIVER REQUESTED ADVANCE": "DRIVER NE ADVANCE MAANGA",
 "Choose payment method": "Payment method chuno",
 "Waiting for driver to confirm payment received": "Driver ke payment received confirm karne ka wait",
 "CASH SELECTED": "CASH SELECT KIYA",
 "To driver": "Driver ko",
 "Pay Online {0}": "Online pay karo {0}",
 "UPI / Card / Netbanking": "UPI / Card / Netbanking",
 "Saving…": "Save ho raha hai…",
 "Skip advance; pay the remaining amount later": "Advance skip karo; baaki baad mein",
 "Cash Payment {0}": "Cash Payment {0}",
 "Pay driver in cash": "Driver ko cash mein pay karo",
 "Waiting for driver cash confirmation": "Driver ke cash confirmation ka wait",
 "Aadhaar Card": "Aadhaar Card",
 "Pollution Certificate": "Pollution Certificate",
 "Fitness Certificate": "Fitness Certificate",
 "Hello,": "Hello,",
 "DRIVER WALLET": "DRIVER WALLET",
 "Not available": "Available nahi",
 "Requested:": "Request kiya:",
 "Unknown": "Pata nahi",
 "Hide Details": "Details chhupao",
 "✅ Accept ₹": "✅ Accept karo ₹",
 "Send Counter ₹": "Counter bhejo ₹",
 "{0} star": "{0} star",
 "Customer Wallet": "Customer Wallet",
 "HimRideG Wallet": "HimRideG Wallet",
 "↻ Refresh Payments": "↻ Payments refresh karo",
 "CUSTOMER WALLET": "CUSTOMER WALLET",
 "Available Soon": "Jaldi available",
 "🔒 Locked Fare ₹": "🔒 Locked Fare ₹",
 "Pay ₹{0}": "₹{0} pay karo",
 "Payment Locked": "Payment lock hai",
 "No pending payment": "Koi payment pending nahi",
 "Other pending ride payments": "Baaki pending ride payments",
 "· Locked ₹": "· Locked ₹",
 "Pay": "Pay karo",
 "Recent paid rides": "Recent paid rides",
 "✅ Paid ₹": "✅ Paid ₹",
 "Driver will be assigned": "Driver assign hoga",
 "HimRideG Taxi": "HimRideG Taxi",
 "Number pending": "Number pending",
 "Himachal Pradesh": "Himachal Pradesh",
 "· Open ride →": "· Ride kholo →",
 "Travel": "Travel karo",
 "With Us": "Hamare saath",
 "🚕 &nbsp; Book New Ride": "🚕 &nbsp; Nayi Ride book karo",
 "Your Active Ride": "Aapki Active Ride",
 "Live": "Live",
 "🔒 Locked": "🔒 Locked",
 "ETA:": "ETA:",
 "• {0} km": "• {0} km",
 "🔵 Waiting for driver live location…": "🔵 Driver ki live location ka wait…",
 "Message driver": "Driver ko message karo",
 "💳 Pay ₹": "💳 Pay karo ₹",
 "{0} • GPS connecting": "{0} • GPS connect ho raha hai",
 "• {0} min": "• {0} min",
 "Ready": "Ready",
 "View all →": "Sab dekho →",
 "Upcoming": "Upcoming",
 "✅ Paid": "✅ Paid",
 "HimRideG Account": "HimRideG Account",
 "Wallet & Payments": "Wallet & Payments",
 "Wallet, UPI, cash, QR and passbook": "Wallet, UPI, cash, QR aur passbook",
 "Active and previous ride history": "Active aur purani rides ki history",
 "Trusted contacts, SOS and live trip safety": "Trusted contacts, SOS aur live trip safety",
 "Support, FAQs and emergency help": "Support, FAQs aur emergency help",
 "Refer and Earn": "Refer karo aur kamao",
 "Invite friends to HimRideG": "Dosto ko HimRideG pe invite karo",
 "My Rewards coming soon.": "My Rewards jaldi aa raha hai.",
 "My Rewards": "My Rewards",
 "Offers and ride rewards": "Offers aur ride rewards",
 "Ride Pass coming soon.": "Ride Pass jaldi aa raha hai.",
 "Ride Pass": "Ride Pass",
 "Future ride passes and benefits": "Aane wale ride passes aur benefits",
 "HimRideG Coins coming soon.": "HimRideG Coins jaldi aa rahe hain.",
 "HimRideG Coins": "HimRideG Coins",
 "Coins and reward balance": "Coins aur reward balance",
 "Ride, fare and payment updates": "Ride, fare aur payment updates",
 "Claims feature coming soon.": "Claims feature jaldi aa raha hai.",
 "Claims": "Claims",
 "Ride and payment claim support": "Ride aur payment claim support",
 "Account Settings": "Account Settings",
 "Name, mobile, email and profile photo": "Naam, mobile, email aur profile photo",
 "Change Photo": "Photo badlo",
 "Edit Profile": "Profile edit karo",
 "Primary Mobile Number": "Primary Mobile Number",
 "Alternative Mobile Number": "Alternative Mobile Number",
 "Email Address": "Email Address",
 "Legal and support": "Legal aur support",
 "Legal & Support": "Legal & Support",
 "Live pages from himrideg.com": "himrideg.com ke live pages",
 "Terms & Conditions": "Terms & Conditions",
 "Help & Support": "Help & Support",
 "Contact Us": "Contact karo",
 "Customer mobile navigation": "Customer mobile navigation",
 "Ride Start OTP": "Ride Start OTP",
 "Enter a valid 10-digit mobile number.": "Valid 10 digit mobile number enter karo.",
 "Back to HimRideG home": "HimRideG home par wapas jao",
 "Your journey.": "Aapki journey.",
 "Our": "Hamari",
 "Verified drivers, transparent rides and live tracking for local and outstation taxi travel.": "Local aur outstation taxi travel ke liye verified drivers, transparent rides aur live tracking.",
 "Create {0} Account": "{0} Account banao",
 "Enter 10 digit mobile number": "10 digit mobile number enter karo",
 "Cancellation/Refund rules": "Cancellation/Refund rules",
 "Mobile number → Google verification → first-time Basic Info confirmation → Dashboard. Returning registered": "Mobile number → Google verification → pehli baar Basic Info confirmation → Dashboard. Pehle se registered",
 "Vehicle Insurance": "Vehicle Insurance",
 "RIDE ROUTE": "RIDE ROUTE",
 "Live location active": "Live location active hai",
 "Location loading...": "Location load ho rahi hai...",
 "Driver current location": "Driver ki current location",
 "Wallet top-up order details are incomplete": "Wallet top-up order details incomplete hain",
 "Driver Wallet Top-up": "Driver Wallet Top-up",
 "Wallet top-up successful": "Wallet top-up ho gaya",
 "Add Money amount (₹100 - ₹50,000)": "Add Money amount (₹100 - ₹50,000)",
 "＋ Add Money to Wallet": "＋ Wallet mein paise add karo",
 "Bank Transfer": "Bank Transfer",
 "Amount (min ₹100, max ₹{0})": "Amount (min ₹100, max ₹{0})",
 "UPI ID (e.g. name@upi)": "UPI ID (jaise name@upi)",
 "IFSC Code": "IFSC Code",
 "Primary account required": "Primary account zaroori hai",
 "UPI • {0}": "UPI • {0}",
 "Add account": "Account add karo",
 "Saved payout details": "Saved payout details",
 "● Withdrawals ready": "● Withdrawal ready hai",
 "● Withdrawal setup pending": "● Withdrawal setup pending hai",
 "Technical status": "Technical status",
 "PAYOUT ACCOUNT SAVED": "PAYOUT ACCOUNT SAVE HO GAYA",
 "Bank / IMPS": "Bank / IMPS",
 "Account {0}": "Account {0}",
 "UPI {0}": "UPI {0}",
 "Edit Details": "Details edit karo",
 "Saved account:": "Saved account:",
 "New Account Number (blank = saved)": "Naya Account Number (blank = saved)",
 "Automatic transfer": "Automatic transfer",
 "Scheduled payout when the wallet crosses the minimum": "Wallet minimum cross kare to scheduled payout",
 "Daily": "Daily",
 "Weekly": "Weekly",
 "Monthly": "Monthly",
 "Save UPI / Bank & Schedule": "UPI / Bank & Schedule save karo",
 "Instant Withdraw": "Instant Withdraw",
 "Withdraw to {0}": "{0} mein withdraw karo",
 "Primary Bank": "Primary Bank",
 "Bank": "Bank",
 "The customer selected online payment.": "Customer ne Payment Online select kiya.",
 "Cash Received ₹{0} ✅": "Cash mil gaya ₹{0} ✅",
 "Payment Received ₹{0} ✅": "Payment mil gaya ₹{0} ✅",
 "₹{0} final fare sent to the customer. The customer will now accept or reject it.": "₹{0} final fare customer ko bhej diya. Ab customer Accept / Reject karega.",
 "Driver account approval is required.": "Driver account approval zaroori hai.",
 "Ride request rejected.": "Ride request reject kar di.",
 "Customer not responding / ride not confirmed": "Customer jawab nahi de raha / ride confirm nahi hui",
 "Cash payment confirmed.": "Cash payment confirm ho gaya.",
 "Arrival update sent to the customer.": "Customer ko arrival update bhej diya.",
 "Enter a valid 4-digit OTP.": "Valid 4 digit OTP enter karo.",
 "Close payment receipt": "Payment receipt band karo",
 "Upload Progress": "Upload Progress",
 "⏳ Admin review pending": "⏳ Admin review pending hai",
 "Uploading...": "Upload ho raha hai...",
 "📤 Re-Upload": "📤 Dobara upload karo",
 "Documents Under Review": "Documents review mein hain",
 "DOCUMENT STATUS": "DOCUMENT STATUS",
 "Verification Progress": "Verification Progress",
 "The admin will open and verify your documents.": "Admin aapke documents khol kar verify karega.",
 "Generating New OTP...": "Naya OTP generate ho raha hai...",
 "Verify & Start Ride": "Verify karo & Ride start karo",
 "Total Requests": "Total Requests",
 "Ongoing": "Chal rahi hai",
 "Rating": "Rating",
 "Open Wallet →": "Wallet kholo →",
 "DRIVER WALLET QR": "DRIVER WALLET QR",
 "Fixed Payment QR": "Fixed Payment QR",
 "HimRideG Driver Wallet QR - {0}": "HimRideG Driver Wallet QR - {0}",
 "Driver ID:": "Driver ID:",
 "🔒 Fixed QR · No editable amount · Assigned-driver verification": "🔒 Fixed QR · Amount edit nahi hoga · Assigned-driver verification",
 "▦ Show My Fixed Driver Wallet QR": "▦ Mera Fixed Driver Wallet QR dikhao",
 "Real Wallet Balance": "Real Wallet Balance",
 "Pending Amount": "Pending Amount",
 "Total Withdrawn": "Total Withdrawn",
 "Today's Earnings": "Aaj ki Earnings",
 "Cash Commission Due": "Cash Commission Due",
 "Completed Trips": "Completed Trips",
 "HimRideG Commission": "HimRideG Commission",
 "Driver Online Share": "Driver Online Share",
 "💰 Real Driver Earnings Wallet": "💰 Real Driver Earnings Wallet",
 "Refreshing Wallet...": "Wallet refresh ho raha hai...",
 "↻ Refresh Real Wallet": "↻ Real Wallet refresh karo",
 "🧾 Recent Wallet Activity": "🧾 Recent Wallet Activity",
 "Wallet activity": "Wallet activity",
 "＋ Cash Commission Top-up": "＋ Cash Commission Top-up",
 "💸 Real Wallet Withdrawal": "💸 Real Wallet Withdrawal",
 "AVAILABLE TO WITHDRAW": "WITHDRAW KE LIYE AVAILABLE",
 "Available Earnings Balance:": "Available Earnings Balance:",
 "Documents Required": "Documents Required",
 "Missing": "Missing",
 "⚠ Action Required — {0} rejected": "⚠ Action Required — {0} reject hua",
 "⏳ Documents Under Review": "⏳ Documents review mein hain",
 "⌂ Menu": "⌂ Menu",
 "📄 Docs": "📄 Docs",
 "Add bank/UPI and choose Primary receiving account": "Bank/UPI add karo aur Primary receiving account choose karo",
 "Personal info, vehicle and contact details": "Personal info, vehicle aur contact details",
 "available · add money, withdraw & payout history": "available · add money, withdraw & payout history",
 "Requests, completed rides, rating & total earnings": "Requests, completed rides, rating aur total earnings",
 "Active, pending-payment and completed ride history": "Active, payment pending aur completed ride history",
 "Completed, cancelled and expired rides": "Completed, cancelled aur expired rides",
 "Licence, RC, permit and verification status": "Licence, RC, permit aur verification status",
 "New customer requests and notifications": "Naye customer requests aur notifications",
 "Safety & Compliance": "Safety & Compliance",
 "Verification documents, taxi compliance and account safety": "Verification documents, taxi compliance aur account safety",
 "Contact, vehicle and personal account settings": "Contact, vehicle aur personal account settings",
 "Ride, payment and verification support": "Ride, payment aur verification support",
 "↪ Logout Driver": "↪ Driver Logout",
 "Legal Name (As per Aadhaar)": "Legal Name (Aadhaar ke anusar)",
 "Verified — locked": "Verified — locked",
 "Primary Verified Mobile": "Primary Verified Mobile",
 "Alternative Mobile": "Alternative Mobile",
 "Address": "Address",
 "House/locality, tehsil, district, HP": "Ghar/mohalla, tehsil, district, HP",
 "Hatchback": "Hatchback",
 "Other": "Other",
 "Brand": "Brand",
 "Maruti, Tata, Hyundai...": "Maruti, Tata, Hyundai...",
 "Model": "Model",
 "Swift Dzire, Nexon...": "Swift Dzire, Nexon...",
 "Fuel Type": "Fuel Type",
 "Petrol": "Petrol",
 "Diesel": "Diesel",
 "Electric": "Electric",
 "Hybrid": "Hybrid",
 "Color": "Color",
 "White, Silver...": "White, Silver...",
 "🟡 Commercial / Yellow Plate Vehicle": "🟡 Commercial / Yellow Plate Vehicle",
 "💾 Save Profile": "💾 Profile Save karo",
 "💸 Withdraw / Wallet Settings": "💸 Withdraw / Wallet Settings",
 "▦ My Driver QR": "▦ Mera Driver QR",
 "Transaction History": "Transaction History",
 "Failed": "Failed",
 "Wallet transaction": "Wallet transaction",
 "💰 Open Wallet": "💰 Wallet Kholo",
 "🚕 View My Rides": "🚕 Meri Rides Dekho",
 "Pending Admin Review": "Admin Review Pending",
 "Fetch failed": "Load nahi hua",
 "Reason:": "Reason:",
 "📤 Upload Again": "📤 Dobara Upload karo",
 "🔄 Replace": "🔄 Replace karo",
 "Approval Pending": "Approval Pending",
 "🔒 Preview only": "🔒 Sirf preview",
 "Tap to view →": "Dekhne ke liye tap karo →",
 "Cash Payment Selected": "Cash Payment Select hua",
 "💵 Receive Cash ₹": "💵 Cash Receive karo ₹",
 "The Receive Cash option will be removed automatically as soon as the online payment succeeds.": "Online payment successful hote hi Receive Cash option automatically hat jayega.",
 "Confirm Receive Cash only after you have physically received the cash.": "Cash haath mein milne ke baad hi Receive Cash confirm karo.",
 "🔒 Contact": "🔒 Contact",
 "Driver → Customer → Final": "Driver → Customer → Final",
 "YOUR EARNING": "AAPKI EARNING",
 "📨 FINAL FARE SENT": "📨 FINAL FARE BHEJ DIYA",
 "⏳ Waiting for Customer Response": "⏳ Customer ke response ka intezaar",
 "Cancelling...": "Cancel ho raha hai...",
 "Customer Counter ₹": "Customer Counter ₹",
 "Customer One-Time Counter": "Customer ka One-Time Counter",
 "Accepting...": "Accept ho raha hai...",
 "✅ Accept ₹{0}": "✅ ₹{0} Accept karo",
 "Send Final Fare": "Final Fare Bhejo",
 "Initial Fare Sent": "Initial Fare Bhej diya",
 "✓ Accept Ride": "✓ Ride Accept karo",
 "× Reject Ride": "× Ride Reject karo",
 "PAYMENT STATUS": "PAYMENT STATUS",
 "Pickup to Destination": "Pickup se Destination tak",
 "Cash Selected": "Cash Select hua",
 "Receive Cash Ready": "Receive Cash Ready",
 "Confirming...": "Confirm ho raha hai...",
 "💵 Receive Cash ₹{0}": "💵 Cash Receive karo ₹{0}",
 "➤ Navigate to Pickup": "➤ Pickup tak Navigate karo",
 "➤ Navigate to Destination": "➤ Destination tak Navigate karo",
 "🔒 Navigate to Pickup": "🔒 Pickup tak Navigate karo",
 "🔒 Navigate to Destination": "🔒 Destination tak Navigate karo",
 "₹ Fare Negotiation": "₹ Fare Negotiation",
 "💳 Payment Status": "💳 Payment Status",
 "🔒 GO TO PICKUP Disabled Until Customer Accepts the Fare": "🔒 Customer Fare Accept Hone Tak GO TO PICKUP Disabled",
 "🔒 Cancel Ride Unavailable": "🔒 Cancel Ride Available Nahi",
 "🔒 Advance Payment Pending — Customer Must Pay Now": "🔒 Advance Payment Pending — Customer Abhi Pay Kare",
 "🔐 Generate OTP (Customer Must Be Present)": "🔐 OTP Generate karo (Customer Saamne Ho)",
 "View Full Summary →": "Poora Summary Dekho →",
 "💰 Open Driver Wallet · ₹": "💰 Driver Wallet Kholo · ₹",
 "Driver mobile navigation": "Driver mobile navigation",
 "Bike": "Bike",
 "Motor Cab (Taxi)": "Motor Cab (Taxi)",
 "Maxi Cab": "Maxi Cab",
 "LMV - Taxi": "LMV - Taxi",
 "Omni Bus": "Omni Bus",
 "% complete": "% complete",
 "documents uploaded": "documents upload ho gaye",
 "Documents & Vehicle": "Documents aur Vehicle",
 "E.g.: Nishan Kumar / Rajesh Sharma": "Jaise: Nishan Kumar / Rajesh Sharma",
 "💾 Save Name": "💾 Naam Save karo",
 "Required Documents": "Zaroori Documents",
 "JPG, PNG, WEBP or PDF — max 5 MB": "JPG, PNG, WEBP ya PDF — max 5 MB",
 "Re-upload": "Re-upload karo",
 "Vehicle Class": "Vehicle Class",
 "Maruti Suzuki": "Maruti Suzuki",
 "Dzire": "Dzire",
 "White": "White",
 "Seating Capacity": "Seating Capacity",
 "Submit for Approval": "Approval ke liye Submit karo",
 "GOOGLE LOGIN VERIFIED": "GOOGLE LOGIN VERIFIED",
 "Confirm your Google verified details": "Google verified details confirm karo",
 "Just complete your basic info": "Bas basic info complete karo",
 "Google verified": "Google verified",
 "No password required": "Password ki zaroorat nahi",
 "One-time setup": "One-time setup",
 "Verified Basic Info": "Verified Basic Info",
 "Google Verified Name": "Google Verified Name",
 "Enter your full name": "Apna poora naam daalo",
 "Google Email": "Google Email",
 "Save & Continue to Driver Verification": "Save karo aur Driver Verification par aage badho",
 "Use another account": "Doosra account use karo",
 "Gender": "Gender",
 "Male": "Male",
 "Female": "Female",
 "Date of Birth": "Janam Tithi",
 "Your live location": "Aapki live location",
 "Allow location permission to see yourself on the map.": "Map par khud ko dekhne ke liye location permission allow karo.",
 "GPS signal is weak. Retrying…": "GPS signal kamzor hai. Phir se try ho raha hai…",
 "This browser does not support location.": "Ye browser location support nahi karta.",
 "Google Client ID is not configured yet.": "Google Client ID configure karna baaki hai.",
 "responsibility.": "zimmedari.",
 "HIMACHAL'S OWN RIDE": "HIMACHAL KI APNI RIDE",
 "There are no rides in this section": "Is section mein koi ride nahi hai",
 "Fare locked ✅": "Fare lock ho gaya ✅",
 "Fare accepted. The driver's GO TO PICKUP is now enabled.": "Fare accept ho gaya. Driver ka GO TO PICKUP ab enabled hai.",
 "The driver's final fare did not sync. The driver must resend the FINAL fare. ₹0 is never shown for Accept/Reject.": "Driver ka final fare sync nahi hua. Driver ko FINAL fare dobara bhejna hoga. ₹0 kabhi Accept/Reject ke liye nahi dikhega.",
 "This is the driver's final offer. You can now only Accept or Reject. On Accept the fare is locked and the driver's GO TO PICKUP is enabled.": "Ye driver ka final offer hai. Ab sirf Accept ya Reject kar sakte ho. Accept karne par fare lock hoga aur driver ka GO TO PICKUP enable hoga.",
 "Waiting for the driver's FINAL fare... A counter offer is no longer available.": "Driver ke FINAL fare ka intezaar... Counter Offer ab dobara nahi milega.",
 "Accept if you like the fare. You can Reject it, or send one Counter Offer.": "Fare pasand hai to Accept karo. Reject kar sakte ho, ya ek baar Counter Offer bhej sakte ho.",
 "Stay online, accept rides and decide your own final fare.": "Online raho, ride accept karo aur apna final fare khud decide karo.",
 "Stay online. New customer bookings and any assigned active ride will appear in this panel.": "Online raho. Nayi customer booking aur assigned Active Ride isi panel mein dikhegi.",
 "On mobile the UPI app opens. On desktop you can pay by scanning the UPI QR. The customer does not type the amount — the locked fare goes into the payment order automatically.": "Mobile par UPI app khulegi. Desktop par UPI QR scan karke payment kar sakte ho. Amount customer type nahi karega — locked fare apne aap payment order mein jayega.",
 "After the ride is complete, the customer can select Cash. After the locked fare is paid in cash, the assigned driver confirms the payment.": "Ride complete hone ke baad customer Cash select kar sakta hai. Driver ko locked fare cash mein dene ke baad wahi driver payment receive confirm karega.",
 "The payment button is enabled only after the driver completes the ride. Payment cannot start without the final locked fare.": "Payment button driver ke ride complete karne ke baad hi enable hoga. Final locked fare ke bina payment start nahi hogi."
};

export const EXTRA_ENTRIES = [
 {
  "en": "Your session has expired. Please log in again.",
  "hi": "सत्र समाप्त हो गया है। कृपया दोबारा लॉगिन करें।",
  "aliases": [
   "Session expire ho gayi. Dobara login karo.",
   "Session expire ho gaya. Dobara login karo."
  ]
 },
 {
  "en": "Token or user was not found in the login response",
  "hi": "लॉगिन प्रतिक्रिया में टोकन या उपयोगकर्ता नहीं मिला",
  "aliases": [
   "Login response me token ya user nahi mila",
   "Login response mein token ya user nahi mila"
  ]
 },
 {
  "en": "Please select the saved booking's location again",
  "hi": "सहेजी गई बुकिंग का स्थान दोबारा चुनें",
  "aliases": [
   "Saved booking ki location dobara select karo",
   "Saved booking ki location dobara select karo"
  ]
 },
 {
  "en": "The saved scheduled booking's time has expired. Please select a new time",
  "hi": "सहेजी गई शेड्यूल बुकिंग का समय समाप्त हो गया है। नया समय चुनें",
  "aliases": [
   "Saved scheduled booking ka time expire ho gaya hai. Naya time select karo",
   "Saved scheduled booking ka time expire ho gaya hai. Naya time select karo"
  ]
 },
 {
  "en": "Enter your phone number to continue booking",
  "hi": "बुकिंग जारी रखने के लिए फ़ोन नंबर दर्ज करें",
  "aliases": [
   "Booking continue karne ke liye phone number bharo",
   "Booking continue karne ke liye phone number bharo"
  ]
 },
 {
  "en": "Confirming saved booking...",
  "hi": "सहेजी गई बुकिंग की पुष्टि हो रही है...",
  "aliases": [
   "Saved booking confirm ho rahi hai...",
   "Saved booking confirm ho rahi hai..."
  ]
 },
 {
  "en": "Ride booked successfully",
  "hi": "यात्रा सफलतापूर्वक बुक हो गई",
  "aliases": [
   "Ride successfully book ho gayi",
   "Ride successfully book ho gayi"
  ]
 },
 {
  "en": "Logged in, but the saved ride could not be booked. Your booking details are safe.",
  "hi": "लॉगिन हो गया, लेकिन सहेजी गई यात्रा बुक नहीं हुई। बुकिंग विवरण सुरक्षित हैं।",
  "aliases": [
   "Login ho gaya, lekin saved ride book nahi hui. Booking details safe hain.",
   "Login ho gaya, lekin saved ride book nahi hui. Booking details safe hain."
  ]
 },
 {
  "en": "Basic info was saved, but the session could not continue. Please log in again.",
  "hi": "मूल जानकारी सहेज ली गई, लेकिन सत्र जारी नहीं रह सका। कृपया दोबारा लॉगिन करें।",
  "aliases": [
   "Basic info save hui, lekin session continue nahi ho paya. Dobara login karo.",
   "Basic info save ho gayi, lekin session continue nahi ho paya. Dobara login karo."
  ]
 },
 {
  "en": "Failed to load rides",
  "hi": "यात्राएँ लोड नहीं हुईं",
  "aliases": [
   "Rides load nahi hui",
   "Rides load nahi hui"
  ]
 },
 {
  "en": "Driver is online",
  "hi": "चालक ऑनलाइन है",
  "aliases": [
   "Driver online hai",
   "Driver online hai"
  ]
 },
 {
  "en": "Driver is offline",
  "hi": "चालक ऑफ़लाइन है",
  "aliases": [
   "Driver offline hai",
   "Driver offline hai"
  ]
 },
 {
  "en": "Failed to update driver status",
  "hi": "चालक की स्थिति अपडेट नहीं हुई",
  "aliases": [
   "Driver status update nahi hua",
   "Driver status update nahi hua"
  ]
 },
 {
  "en": "Failed to load drivers",
  "hi": "चालक लोड नहीं हुए",
  "aliases": [
   "Drivers load nahi hue",
   "Drivers load nahi hue"
  ]
 },
 {
  "en": "A new ride request has arrived.",
  "hi": "नई यात्रा अनुरोध आया है।",
  "aliases": [
   "Nayi ride request aayi hai.",
   "Nayi ride request aayi hai."
  ]
 },
 {
  "en": "Ride status has been updated.",
  "hi": "यात्रा की स्थिति अपडेट हो गई है।",
  "aliases": [
   "Ride status update hua hai.",
   "Ride status update ho gaya hai."
  ]
 },
 {
  "en": "Rejected by admin.",
  "hi": "एडमिन ने अस्वीकार किया।",
  "aliases": [
   "Admin ne reject kiya.",
   "Admin ne reject kiya."
  ]
 },
 {
  "en": "Enter pickup and drop locations",
  "hi": "पिकअप और ड्रॉप स्थान दर्ज करें",
  "aliases": [
   "Pickup aur drop location bharo",
   "Pickup aur drop location bharo"
  ]
 },
 {
  "en": "Enter phone number",
  "hi": "फ़ोन नंबर दर्ज करें",
  "aliases": [
   "Phone number bharo",
   "Phone number bharo"
  ]
 },
 {
  "en": "Select pickup and drop on the map first",
  "hi": "पहले नक्शे पर पिकअप और ड्रॉप चुनें",
  "aliases": [
   "Pehle map par pickup aur drop select karo",
   "Pehle map par pickup aur drop select karo"
  ]
 },
 {
  "en": "Ride could not be booked",
  "hi": "यात्रा बुक नहीं हुई",
  "aliases": [
   "Ride book nahi hui",
   "Ride book nahi hui"
  ]
 },
 {
  "en": "Ride ID or status is missing",
  "hi": "यात्रा ID या स्थिति उपलब्ध नहीं है",
  "aliases": [
   "Ride ID ya status missing hai",
   "Ride ID ya status missing hai"
  ]
 },
 {
  "en": "Ride updated",
  "hi": "यात्रा अपडेट हो गई",
  "aliases": [
   "Ride update ho gayi",
   "Ride update ho gayi"
  ]
 },
 {
  "en": "Failed to update ride",
  "hi": "यात्रा अपडेट नहीं हुई",
  "aliases": [
   "Ride update nahi hui",
   "Ride update nahi hui"
  ]
 },
 {
  "en": "Driver updated",
  "hi": "चालक अपडेट हो गया",
  "aliases": [
   "Driver update ho gaya",
   "Driver update ho gaya"
  ]
 },
 {
  "en": "Failed to update driver",
  "hi": "चालक अपडेट नहीं हुआ",
  "aliases": [
   "Driver update nahi hua",
   "Driver update nahi hua"
  ]
 },
 {
  "en": "Customer updated",
  "hi": "ग्राहक अपडेट हो गया",
  "aliases": [
   "Customer update ho gaya",
   "Customer update ho gaya"
  ]
 },
 {
  "en": "Failed to update customer",
  "hi": "ग्राहक अपडेट नहीं हुआ",
  "aliases": [
   "Customer update nahi hua",
   "Customer update nahi hua"
  ]
 },
 {
  "en": "This device does not support location.",
  "hi": "इस डिवाइस में स्थान की सुविधा उपलब्ध नहीं है।",
  "aliases": [
   "Is device me location support nahi hai.",
   "Is device mein location support nahi hai."
  ]
 },
 {
  "en": "📡 Starting live location...",
  "hi": "📡 लाइव स्थान शुरू हो रहा है...",
  "aliases": [
   "📡 Live location start ho rahi hai...",
   "📡 Live location start ho rahi hai..."
  ]
 },
 {
  "en": "Reconnecting live socket...",
  "hi": "लाइव कनेक्शन दोबारा जुड़ रहा है...",
  "aliases": [
   "Live socket reconnect ho raha hai...",
   "Live socket reconnect ho raha hai..."
  ]
 },
 {
  "en": "Please allow location permission.",
  "hi": "कृपया स्थान की अनुमति दें।",
  "aliases": [
   "Location permission allow karo.",
   "Location permission allow karo."
  ]
 },
 {
  "en": "Current location is not available.",
  "hi": "वर्तमान स्थान उपलब्ध नहीं है।",
  "aliases": [
   "Current location available nahi hai.",
   "Current location available nahi hai."
  ]
 },
 {
  "en": "📡 Retrying GPS signal...",
  "hi": "📡 GPS सिग्नल दोबारा खोजा जा रहा है...",
  "aliases": [
   "📡 GPS signal retry ho raha hai...",
   "📡 GPS signal retry ho raha hai..."
  ]
 },
 {
  "en": "Unable to get current location.",
  "hi": "वर्तमान स्थान नहीं मिल रहा है।",
  "aliases": [
   "Current location nahi mil rahi.",
   "Current location nahi mil rahi."
  ]
 },
 {
  "en": "Could not calculate road route",
  "hi": "सड़क मार्ग की गणना नहीं हो सकी",
  "aliases": [
   "Road route calculate nahi hua",
   "Road route calculate nahi hua"
  ]
 },
 {
  "en": "Road route is not available",
  "hi": "सड़क मार्ग उपलब्ध नहीं है",
  "aliases": [
   "Road route available nahi hai",
   "Road route available nahi hai"
  ]
 },
 {
  "en": "Could not calculate the road route to pickup.",
  "hi": "पिकअप तक का सड़क मार्ग नहीं निकाला जा सका।",
  "aliases": [
   "Pickup tak ka road route calculate nahi hua.",
   "Pickup tak ka road route calculate nahi hua."
  ]
 },
 {
  "en": "Could not calculate the road route to destination.",
  "hi": "गंतव्य तक का सड़क मार्ग नहीं निकाला जा सका।",
  "aliases": [
   "Destination ka road route calculate nahi hua.",
   "Destination ka road route calculate nahi hua."
  ]
 },
 {
  "en": "Map location is not available",
  "hi": "नक्शे पर स्थान उपलब्ध नहीं है",
  "aliases": [
   "Map location available nahi hai",
   "Map location available nahi hai"
  ]
 },
 {
  "en": "Pickup and drop coordinates were not saved for this booking.",
  "hi": "इस बुकिंग में पिकअप और ड्रॉप निर्देशांक सहेजे नहीं गए हैं।",
  "aliases": [
   "Is booking me pickup aur drop coordinates save nahi hue hain.",
   "Is booking mein pickup aur drop coordinates save nahi hue hain."
  ]
 },
 {
  "en": "To pickup",
  "hi": "पिकअप तक",
  "aliases": [
   "Pickup tak",
   "Pickup tak"
  ]
 },
 {
  "en": "Your current location",
  "hi": "आपका वर्तमान स्थान",
  "aliases": [
   "Aapki current location",
   "Aapki current location"
  ]
 },
 {
  "en": "Your live location is shown on the map. When a new ride arrives, the pickup and destination route will automatically appear here.",
  "hi": "आपका लाइव स्थान नक्शे पर दिख रहा है। नई यात्रा आते ही पिकअप और गंतव्य का मार्ग अपने आप यहीं दिखेगा।",
  "aliases": [
   "Aapki live location map par dikh rahi hai. Nayi ride aate hi pickup aur destination route automatically yahin show hoga.",
   "Aapki live location map par dikh rahi hai. Nayi ride aate hi pickup aur destination route automatically yahin show hoga."
  ]
 },
 {
  "en": "Setting pickup pin…",
  "hi": "पिकअप पिन सेट हो रहा है…",
  "aliases": [
   "Pickup pin set ho raha hai…",
   "Pickup pin set ho raha hai…"
  ]
 },
 {
  "en": "Setting destination pin…",
  "hi": "गंतव्य पिन सेट हो रहा है…",
  "aliases": [
   "Destination pin set ho raha hai…",
   "Destination pin set ho raha hai…"
  ]
 },
 {
  "en": "Pickup set from map",
  "hi": "पिकअप नक्शे से सेट हो गया",
  "aliases": [
   "Pickup map se set ho gaya",
   "Pickup map se set ho gaya"
  ]
 },
 {
  "en": "Destination set from map",
  "hi": "गंतव्य नक्शे से सेट हो गया",
  "aliases": [
   "Destination map se set ho gaya",
   "Destination map se set ho gaya"
  ]
 },
 {
  "en": "Could not convert map location to an address",
  "hi": "नक्शे के स्थान को पते में नहीं बदला जा सका",
  "aliases": [
   "Map location address me convert nahi hui",
   "Map location address mein convert nahi hui"
  ]
 },
 {
  "en": "Calculating road route…",
  "hi": "सड़क मार्ग की गणना हो रही है…",
  "aliases": [
   "Road route calculate ho raha hai…",
   "Road route calculate ho raha hai…"
  ]
 },
 {
  "en": "Access token was not found in the refresh response",
  "hi": "रिफ़्रेश प्रतिक्रिया में एक्सेस टोकन नहीं मिला",
  "aliases": [
   "Refresh response me access token nahi mila",
   "Refresh response mein access token nahi mila"
  ]
 },
 {
  "en": "Searching matching locations...",
  "hi": "मिलते-जुलते स्थान खोजे जा रहे हैं...",
  "aliases": [
   "Matching locations search ho rahi hain...",
   "Matching locations search ho rahi hain..."
  ]
 },
 {
  "en": "No matching location found.",
  "hi": "कोई मिलता-जुलता स्थान नहीं मिला।",
  "aliases": [
   "Koi matching location nahi mili.",
   "Koi matching location nahi mili."
  ]
 },
 {
  "en": "Getting high-accuracy GPS location…",
  "hi": "उच्च-सटीकता वाला GPS स्थान लिया जा रहा है…",
  "aliases": [
   "High-accuracy GPS location li ja rahi hai…",
   "High-accuracy GPS location li ja rahi hai…"
  ]
 },
 {
  "en": "Enter pickup area name",
  "hi": "पिकअप क्षेत्र का नाम लिखें",
  "aliases": [
   "Pickup area ka naam likhein",
   "Pickup area ka naam likho"
  ]
 },
 {
  "en": "Enter destination area name",
  "hi": "गंतव्य क्षेत्र का नाम लिखें",
  "aliases": [
   "Destination area ka naam likhein",
   "Destination area ka naam likho"
  ]
 },
 {
  "en": "Online / Cash after the ride is complete",
  "hi": "यात्रा पूरी होने के बाद ऑनलाइन / नकद",
  "aliases": [
   "Ride complete hone ke baad Online / Cash",
   "Ride complete hone ke baad Online / Cash"
  ]
 },
 {
  "en": "UPI payment after the ride is complete",
  "hi": "यात्रा पूरी होने के बाद UPI भुगतान",
  "aliases": [
   "UPI payment ride complete hone ke baad",
   "UPI payment ride complete hone ke baad"
  ]
 },
 {
  "en": "Only for scheduled bookings — actual payment after the ride is complete",
  "hi": "केवल शेड्यूल बुकिंग के लिए — वास्तविक भुगतान यात्रा पूरी होने के बाद",
  "aliases": [
   "Sirf scheduled booking ke liye — actual payment ride complete hone ke baad",
   "Sirf scheduled booking ke liye — actual payment ride complete hone ke baad"
  ]
 },
 {
  "en": "🔒 The payment button will be enabled only after the driver completes the ride. The final locked fare will be the Online UPI / Cash payment amount.",
  "hi": "🔒 भुगतान बटन चालक द्वारा यात्रा पूरी करने के बाद ही सक्रिय होगा। अंतिम लॉक किया गया किराया ही ऑनलाइन UPI / नकद भुगतान राशि होगी।",
  "aliases": [
   "🔒 Payment button driver ke ride complete karne ke baad hi enable hoga. Final locked fare hi Online UPI / Cash payment amount hoga.",
   "🔒 Payment button driver ke ride complete karne ke baad hi enable hoga. Final locked fare hi Online UPI / Cash payment amount hoga."
  ]
 },
 {
  "en": "📱 Online: after the ride is completed, pay the locked fare via a UPI app / QR scanner.",
  "hi": "📱 ऑनलाइन: यात्रा पूरी होने के बाद UPI ऐप / QR स्कैनर से लॉक किया गया किराया भुगतान होगा।",
  "aliases": [
   "📱 Online: completed ride ke baad UPI App / QR Scanner se locked fare pay hoga.",
   "📱 Online: ride complete hone ke baad UPI App / QR Scanner se locked fare pay hoga."
  ]
 },
 {
  "en": "💵 Cash: after the ride is completed, pay the locked fare to the driver; the driver will confirm receipt.",
  "hi": "💵 नकद: यात्रा पूरी होने के बाद चालक को लॉक किया गया किराया दें; चालक प्राप्ति की पुष्टि करेगा।",
  "aliases": [
   "💵 Cash: completed ride ke baad driver ko locked fare dein; driver receive confirm karega.",
   "💵 Cash: ride complete hone ke baad driver ko locked fare do; driver receive confirm karega."
  ]
 },
 {
  "en": "Enter your name and 10-digit mobile number.",
  "hi": "नाम और 10-अंकों का मोबाइल नंबर दर्ज करें।",
  "aliases": [
   "Name aur 10-digit mobile number enter karein.",
   "Name aur 10-digit mobile number enter karo."
  ]
 },
 {
  "en": "There is no active ride right now.",
  "hi": "अभी कोई सक्रिय यात्रा नहीं है।",
  "aliases": [
   "Abhi active ride nahi hai.",
   "Abhi koi active ride nahi hai."
  ]
 },
 {
  "en": "Before, during and after the ride.",
  "hi": "यात्रा से पहले, यात्रा के दौरान और यात्रा के बाद।",
  "aliases": [
   "Ride se pehle, ride ke dauran aur ride ke baad.",
   "Ride se pehle, ride ke dauran aur ride ke baad."
  ]
 },
 {
  "en": "The trip starts only after the OTP matches at pickup.",
  "hi": "पिकअप पर OTP मिलने के बाद ही यात्रा शुरू होती है।",
  "aliases": [
   "Pickup par OTP match hone ke baad hi trip start hoti hai.",
   "Pickup par OTP match hone ke baad hi trip start hoti hai."
  ]
 },
 {
  "en": "If needed, call the India emergency number directly.",
  "hi": "ज़रूरत हो तो सीधे भारत के आपातकालीन नंबर पर कॉल करें।",
  "aliases": [
   "Need ho to India emergency number directly call karein.",
   "Zaroorat ho to India emergency number directly call karo."
  ]
 },
 {
  "en": "Share the OTP only after meeting the driver face-to-face. Never tell your payment details or OTP to an unknown caller over the phone.",
  "hi": "OTP केवल चालक से आमने-सामने मिलने के बाद ही साझा करें। भुगतान या OTP किसी अनजान कॉलर को फ़ोन पर न बताएं।",
  "aliases": [
   "OTP sirf driver se face-to-face milne ke baad share karein. Payment ya OTP kisi unknown caller ko phone par mat batayein.",
   "OTP sirf driver se face-to-face milne ke baad share karo. Payment ya OTP kisi unknown caller ko phone par mat batao."
  ]
 },
 {
  "en": "The driver receives the customer's fare directly through UPI or cash, while HimRideG tracks only the",
  "hi": "चालक ग्राहक का किराया सीधे UPI या नकद के माध्यम से प्राप्त करता है, जबकि HimRideG केवल",
  "aliases": [
   "The driver receives the customer's fare directly through UPI or cash, while HimRideG tracks only the",
   "Driver customer ka fare directly UPI ya cash se receive karta hai, jabki HimRideG sirf"
  ]
 },
 {
  "en": "Could not send the advance request",
  "hi": "अग्रिम अनुरोध नहीं भेजा जा सका",
  "aliases": [
   "Advance request nahi bheji ja saki",
   "Advance request nahi bheji ja saki"
  ]
 },
 {
  "en": "Payment was not confirmed",
  "hi": "भुगतान की पुष्टि नहीं हुई",
  "aliases": [
   "Payment confirm nahi hui",
   "Payment confirm nahi hua"
  ]
 },
 {
  "en": "Confirm only after the amount arrives in your UPI/bank account. The customer's I Paid tap alone does not finalize the payment.",
  "hi": "अपने UPI/बैंक खाते में राशि आने के बाद ही पुष्टि करें। ग्राहक का केवल I Paid दबाना भुगतान को अंतिम नहीं करता।",
  "aliases": [
   "Apne UPI/bank account me amount aane ke baad hi confirm karein. Customer ka I Paid tap akela payment final nahi karta.",
   "Apne UPI/bank account mein amount aane ke baad hi confirm karo. Customer ka sirf I Paid tap karna payment final nahi karta."
  ]
 },
 {
  "en": "The customer will only see the Pay Online / Pay Later options.",
  "hi": "ग्राहक को केवल Pay Online / Pay Later विकल्प मिलेंगे।",
  "aliases": [
   "Customer ko sirf Pay Online / Pay Later options milenge.",
   "Customer ko sirf Pay Online / Pay Later options milenge."
  ]
 },
 {
  "en": "Continue the ride as normal. The full remaining fare will be due after Complete Ride.",
  "hi": "यात्रा सामान्य रूप से जारी रखें। Complete Ride के बाद पूरा शेष किराया देय होगा।",
  "aliases": [
   "Ride normal continue karein. Complete Ride ke baad full remaining fare due hoga.",
   "Ride normal continue karo. Complete Ride ke baad poora remaining fare due hoga."
  ]
 },
 {
  "en": "The advance has already been deducted automatically from the final ride payment.",
  "hi": "अंतिम यात्रा भुगतान में से अग्रिम राशि अपने आप घटा दी गई है।",
  "aliases": [
   "Final ride payment me advance automatically minus ho chuka hai.",
   "Final ride payment mein advance automatically minus ho chuka hai."
  ]
 },
 {
  "en": "The Razorpay payment has been verified on the server. As soon as you confirm Payment Received, the ride will be Completed and both driver and customer will be released.",
  "hi": "Razorpay भुगतान सर्वर पर सत्यापित हो चुका है। Payment Received की पुष्टि करते ही यात्रा Completed होगी और चालक व ग्राहक दोनों मुक्त हो जाएंगे।",
  "aliases": [
   "Razorpay payment server par verify ho chuki hai. Payment Received confirm karte hi ride Completed hogi aur driver/customer dono release honge.",
   "Razorpay payment server par verify ho chuka hai. Payment Received confirm karte hi ride Completed hogi aur driver/customer dono release honge."
  ]
 },
 {
  "en": "Both driver and customer are released for the next ride.",
  "hi": "चालक और ग्राहक दोनों अगली यात्रा के लिए मुक्त हैं।",
  "aliases": [
   "Driver aur customer dono next ride ke liye release hain.",
   "Driver aur customer dono next ride ke liye release hain."
  ]
 },
 {
  "en": "Could not load warnings.",
  "hi": "चेतावनियाँ लोड नहीं हो पाईं।",
  "aliases": [
   "Warnings load nahi ho paayi.",
   "Warnings load nahi ho payi."
  ]
 },
 {
  "en": "Warning acknowledged.",
  "hi": "चेतावनी स्वीकार कर ली गई।",
  "aliases": [
   "Warning acknowledge ho gayi.",
   "Warning acknowledge ho gayi."
  ]
 },
 {
  "en": "Could not acknowledge the warning.",
  "hi": "चेतावनी स्वीकार नहीं हुई।",
  "aliases": [
   "Warning acknowledge nahi hui.",
   "Warning acknowledge nahi hui."
  ]
 },
 {
  "en": "Write a reply for the admin.",
  "hi": "एडमिन के लिए उत्तर लिखें।",
  "aliases": [
   "Admin ke liye reply likho.",
   "Admin ke liye reply likho."
  ]
 },
 {
  "en": "Reply must be shorter than 500 characters.",
  "hi": "उत्तर 500 अक्षरों से छोटा होना चाहिए।",
  "aliases": [
   "Reply 500 characters se chhota hona chahiye.",
   "Reply 500 characters se chhota hona chahiye."
  ]
 },
 {
  "en": "Reply sent to the admin.",
  "hi": "उत्तर एडमिन को भेज दिया गया।",
  "aliases": [
   "Reply admin ko bhej diya gaya.",
   "Reply admin ko bhej diya gaya."
  ]
 },
 {
  "en": "Reply was not sent.",
  "hi": "उत्तर नहीं भेजा गया।",
  "aliases": [
   "Reply send nahi hua.",
   "Reply send nahi hua."
  ]
 },
 {
  "en": "Date not available",
  "hi": "तारीख उपलब्ध नहीं है",
  "aliases": [
   "Date available nahi hai",
   "Date available nahi hai"
  ]
 },
 {
  "en": "Loading warnings...",
  "hi": "चेतावनियाँ लोड हो रही हैं...",
  "aliases": [
   "Warnings load ho rahi hain...",
   "Warnings load ho rahi hain..."
  ]
 },
 {
  "en": "No warnings",
  "hi": "कोई चेतावनी नहीं है",
  "aliases": [
   "Koi warning nahi hai",
   "Koi warning nahi hai"
  ]
 },
 {
  "en": "Keep following HimRideG's rules and Terms & Conditions.",
  "hi": "HimRideG के नियमों और नियम व शर्तों का पालन करते रहें।",
  "aliases": [
   "HimRideG ke rules aur Terms & Conditions follow karte raho.",
   "HimRideG ke rules aur Terms & Conditions follow karte raho."
  ]
 },
 {
  "en": "Read the admin's messages carefully, acknowledge them and reply when needed.",
  "hi": "एडमिन के संदेश ध्यान से पढ़ें, स्वीकार करें और ज़रूरत पड़ने पर उत्तर दें।",
  "aliases": [
   "Admin ke messages dhyan se padhein, acknowledge karein aur zaroorat par reply dein.",
   "Admin ke messages dhyan se padho, acknowledge karo aur zaroorat ho to reply do."
  ]
 },
 {
  "en": "Warning message not available.",
  "hi": "चेतावनी संदेश उपलब्ध नहीं है।",
  "aliases": [
   "Warning message available nahi hai.",
   "Warning message available nahi hai."
  ]
 },
 {
  "en": "Write your reply to the admin...",
  "hi": "एडमिन को अपना उत्तर लिखें...",
  "aliases": [
   "Admin ko apna jawab likho...",
   "Admin ko apna jawab likho..."
  ]
 },
 {
  "en": "HimRideG is a technology platform connecting customers with independent licensed taxi drivers. The driver is responsible for the vehicle, permits, insurance, conduct and ride execution. Pickup, drop, passenger and contact details must be accurate. Fare is locked after driver-customer negotiation and customer acceptance; the locked fare remains due for a completed ride.",
  "hi": "HimRideG एक तकनीकी प्लेटफ़ॉर्म है जो ग्राहकों को स्वतंत्र लाइसेंस प्राप्त टैक्सी चालकों से जोड़ता है। वाहन, परमिट, बीमा, आचरण और यात्रा संचालन की ज़िम्मेदारी चालक की है। पिकअप, ड्रॉप, यात्री और संपर्क विवरण सही होने चाहिए। चालक-ग्राहक बातचीत और ग्राहक की स्वीकृति के बाद किराया लॉक हो जाता है; पूरी हुई यात्रा के लिए लॉक किया गया किराया देय रहता है।",
  "aliases": [
   "HimRideG is a technology platform connecting customers with independent licensed taxi drivers. The driver is responsible for the vehicle, permits, insurance, conduct and ride execution. Pickup, drop, passenger and contact details must be accurate. Fare is locked after driver-customer negotiation and customer acceptance; the locked fare remains due for a completed ride.",
   "HimRideG ek technology platform hai jo customers ko independent licensed taxi drivers se jodta hai. Vehicle, permits, insurance, conduct aur ride execution ki zimmedari driver ki hai. Pickup, drop, passenger aur contact details sahi honi chahiye. Driver-customer negotiation aur customer ki acceptance ke baad fare lock ho jata hai; completed ride ke liye locked fare due rehta hai."
  ]
 },
 {
  "en": "Share the ride OTP only after verifying the driver and vehicle in person. Illegal goods, harassment, fraud, payment bypass, false bookings and account sharing are prohibited. In an emergency call 112 first; report issues with ride ID and proof to himrideg@gmail.com.",
  "hi": "चालक और वाहन को व्यक्तिगत रूप से सत्यापित करने के बाद ही यात्रा OTP साझा करें। अवैध सामान, उत्पीड़न, धोखाधड़ी, भुगतान से बचना, झूठी बुकिंग और खाता साझा करना प्रतिबंधित है। आपात स्थिति में पहले 112 पर कॉल करें; समस्याओं की रिपोर्ट यात्रा ID और प्रमाण के साथ himrideg@gmail.com पर करें।",
  "aliases": [
   "Share the ride OTP only after verifying the driver and vehicle in person. Illegal goods, harassment, fraud, payment bypass, false bookings and account sharing are prohibited. In an emergency call 112 first; report issues with ride ID and proof to himrideg@gmail.com.",
   "Driver aur vehicle ko khud verify karne ke baad hi ride OTP share karo. Illegal saamaan, harassment, fraud, payment bypass, fake bookings aur account sharing mana hai. Emergency mein pehle 112 call karo; issues ride ID aur proof ke saath himrideg@gmail.com par report karo."
  ]
 },
 {
  "en": "Use the same account and shared Ride data across web and mobile. Store download links appear here as soon as the public apps are published.",
  "hi": "वेब और मोबाइल पर एक ही खाता और साझा यात्रा डेटा उपयोग करें। सार्वजनिक ऐप प्रकाशित होते ही स्टोर डाउनलोड लिंक यहाँ दिखाई देंगे।",
  "aliases": [
   "Use the same account and shared Ride data across web and mobile. Store download links appear here as soon as the public apps are published.",
   "Web aur mobile par same account aur shared Ride data use karo. Public apps publish hote hi store download links yahan dikhenge."
  ]
 },
 {
  "en": "Payable amount is not valid",
  "hi": "देय राशि मान्य नहीं है",
  "aliases": [
   "Payable amount valid nahi hai",
   "Payable amount valid nahi hai"
  ]
 },
 {
  "en": "Could not load Razorpay checkout",
  "hi": "Razorpay चेकआउट लोड नहीं हो सका",
  "aliases": [
   "Razorpay checkout load nahi ho saka",
   "Razorpay checkout load nahi ho saka"
  ]
 },
 {
  "en": "Payment order is not ready",
  "hi": "भुगतान ऑर्डर तैयार नहीं हुआ",
  "aliases": [
   "Payment order ready nahi hua",
   "Payment order ready nahi hua"
  ]
 },
 {
  "en": "Server payment amount does not match the ride amount",
  "hi": "सर्वर की भुगतान राशि यात्रा राशि से मेल नहीं खाती",
  "aliases": [
   "Server payment amount ride amount se match nahi karti",
   "Server payment amount ride amount se match nahi karta"
  ]
 },
 {
  "en": "Payment could not be verified",
  "hi": "भुगतान सत्यापित नहीं हुआ",
  "aliases": [
   "Payment verify nahi hui",
   "Payment verify nahi hua"
  ]
 },
 {
  "en": "Could not save Pay Later",
  "hi": "Pay Later सहेजा नहीं गया",
  "aliases": [
   "Pay Later save nahi hua",
   "Pay Later save nahi hua"
  ]
 },
 {
  "en": "Could not select cash",
  "hi": "नकद चुना नहीं जा सका",
  "aliases": [
   "Cash select nahi hua",
   "Cash select nahi hua"
  ]
 },
 {
  "en": "Cash payment was not confirmed",
  "hi": "नकद भुगतान की पुष्टि नहीं हुई",
  "aliases": [
   "Cash payment confirm nahi hui",
   "Cash payment confirm nahi hua"
  ]
 },
 {
  "en": "The driver will check the amount in their UPI/bank account and confirm Payment Received. Only then will the ride payment be final.",
  "hi": "चालक अपने UPI/बैंक खाते में राशि जाँचकर Payment Received की पुष्टि करेगा। उसके बाद ही यात्रा भुगतान अंतिम होगा।",
  "aliases": [
   "Driver apne UPI/bank account me amount check karke Payment Received confirm karega. Uske baad hi ride payment final hogi.",
   "Driver apne UPI/bank account mein amount check karke Payment Received confirm karega. Uske baad hi ride payment final hoga."
  ]
 },
 {
  "en": "If you have paid in cash, tap Payment Done. The driver can also confirm Cash Received independently.",
  "hi": "यदि नकद दे दिया है तो Payment Done दबाएं। चालक भी स्वतंत्र रूप से Cash Received की पुष्टि कर सकता है।",
  "aliases": [
   "Cash de diya hai to Payment Done dabayein. Driver bhi Cash Received independently confirm kar sakta hai.",
   "Cash de diya hai to Payment Done dabao. Driver bhi Cash Received independently confirm kar sakta hai."
  ]
 },
 {
  "en": "Complete the payment",
  "hi": "भुगतान पूरा करें",
  "aliases": [
   "Payment complete karein",
   "Payment complete karo"
  ]
 },
 {
  "en": "If you pay an advance, it will be automatically deducted from the final fare. If you choose Pay Later, the ride can continue and the amount will remain in the remaining payment at the end.",
  "hi": "अग्रिम भुगतान करने पर वह अंतिम किराये से अपने आप घट जाएगा। Pay Later चुनने पर यात्रा जारी रह सकती है और राशि अंत में शेष भुगतान में रहेगी।",
  "aliases": [
   "Advance pay hone par final fare se automatically minus hoga. Pay Later choose karne par ride process continue ho sakti hai aur amount end me remaining payment me rahega.",
   "Advance pay karne par final fare se automatically minus hoga. Pay Later choose karne par ride continue ho sakti hai aur amount end mein remaining payment mein rahega."
  ]
 },
 {
  "en": "Your payment has been verified on the server. The ride will be marked Completed automatically after the driver confirms.",
  "hi": "आपका भुगतान सर्वर पर सत्यापित हो चुका है। चालक की पुष्टि के बाद यात्रा अपने आप Completed हो जाएगी।",
  "aliases": [
   "Aapka payment server par verify ho chuka hai. Driver confirmation ke baad ride automatically Completed hogi.",
   "Aapka payment server par verify ho chuka hai. Driver confirmation ke baad ride automatically Completed hogi."
  ]
 },
 {
  "en": "pay in cash",
  "hi": "नकद दें",
  "aliases": [
   "cash dein",
   "cash do"
  ]
 },
 {
  "en": "Pickup/drop coordinates are required",
  "hi": "पिकअप/ड्रॉप निर्देशांक आवश्यक हैं",
  "aliases": [
   "Pickup/drop coordinates required hain",
   "Pickup/drop coordinates required hain"
  ]
 },
 {
  "en": "Allow location permission, then tap My Location again.",
  "hi": "स्थान की अनुमति दें, फिर My Location दोबारा दबाएं।",
  "aliases": [
   "Location permission allow karein, phir My Location dobara dabayein.",
   "Location permission allow karo, phir My Location dobara dabao."
  ]
 },
 {
  "en": "GPS/location is unavailable. Please turn on location services.",
  "hi": "GPS/स्थान उपलब्ध नहीं है। स्थान सेवाएं चालू करें।",
  "aliases": [
   "GPS/location unavailable hai. Location services ON karein.",
   "GPS/location unavailable hai. Location services ON karo."
  ]
 },
 {
  "en": "GPS response timed out. Please try again in an open area.",
  "hi": "GPS प्रतिक्रिया का समय समाप्त हो गया। खुले स्थान में दोबारा प्रयास करें।",
  "aliases": [
   "GPS response timeout hua. Open area me dobara try karein.",
   "GPS response timeout ho gaya. Open area mein dobara try karo."
  ]
 },
 {
  "en": "Could not get a high-accuracy GPS location",
  "hi": "उच्च सटीकता वाला GPS स्थान नहीं मिला",
  "aliases": [
   "High-accuracy GPS location nahi mili",
   "High-accuracy GPS location nahi mili"
  ]
 },
 {
  "en": "Please select an image file only",
  "hi": "केवल इमेज फ़ाइल चुनें",
  "aliases": [
   "Sirf image file select karein",
   "Sirf image file select karo"
  ]
 },
 {
  "en": "Image must be smaller than 8 MB",
  "hi": "इमेज 8 MB से छोटी होनी चाहिए",
  "aliases": [
   "Image 8 MB se chhoti honi chahiye",
   "Image 8 MB se chhoti honi chahiye"
  ]
 },
 {
  "en": "Your ride has been completed successfully.",
  "hi": "आपकी यात्रा सफलतापूर्वक पूरी हो गई।",
  "aliases": [
   "Aapki ride successfully complete ho gayi.",
   "Aapki ride successfully complete ho gayi."
  ]
 },
 {
  "en": "— please rate them.",
  "hi": "को रेट करें।",
  "aliases": [
   "ko rate karein.",
   "ko rate karo."
  ]
 },
 {
  "en": "Wallet balance, add money and wallet credits features are being prepared for launch. The ride payment section is available now and will use only the locked fare of the completed ride.",
  "hi": "वॉलेट बैलेंस, पैसे जोड़ने और वॉलेट क्रेडिट की सुविधा अभी लॉन्च के लिए तैयार की जा रही है। यात्रा भुगतान अनुभाग अभी से उपलब्ध है और पूरी हुई यात्रा का लॉक किया गया किराया ही उपयोग करेगा।",
  "aliases": [
   "Wallet balance, add money aur wallet credits feature abhi launch ke liye prepare ho raha hai. Ride payment section abhi se available hai aur completed ride ka locked fare hi use karega.",
   "Wallet balance, add money aur wallet credits feature abhi launch ke liye prepare ho raha hai. Ride payment section abhi se available hai aur completed ride ka locked fare hi use karega."
  ]
 },
 {
  "en": "Wallet balance, add money and wallet transaction features will be available soon. For now, customers can pay for rides via Online UPI or Cash.",
  "hi": "वॉलेट बैलेंस, पैसे जोड़ने और वॉलेट लेन-देन की सुविधाएं जल्द उपलब्ध होंगी। अभी ग्राहक यात्रा का भुगतान ऑनलाइन UPI या नकद से कर सकते हैं।",
  "aliases": [
   "Wallet balance, add money aur wallet transaction features jaldi available honge. Abhi customer ride payment Online UPI ya Cash se kar sakta hai.",
   "Wallet balance, add money aur wallet transaction features jaldi available honge. Abhi customer ride payment Online UPI ya Cash se kar sakta hai."
  ]
 },
 {
  "en": "Payment will be enabled here once a completed ride is unpaid.",
  "hi": "पूरी हुई यात्रा का भुगतान बाकी होने पर भुगतान यहीं सक्रिय हो जाएगा।",
  "aliases": [
   "Completed unpaid ride aayegi to payment yahin enable ho jayega.",
   "Completed unpaid ride aayegi to payment yahin enable ho jayega."
  ]
 },
 {
  "en": "Could not accept the final fare",
  "hi": "अंतिम किराया स्वीकार नहीं हो सका",
  "aliases": [
   "Final fare accept nahi ho saka",
   "Final fare accept nahi ho saka"
  ]
 },
 {
  "en": "Enter a valid counter fare between ₹50 and ₹10,000",
  "hi": "₹50 से ₹10,000 के बीच मान्य काउंटर किराया दर्ज करें",
  "aliases": [
   "Valid counter fare ₹50 se ₹10,000 ke beech enter karo",
   "Valid counter fare ₹50 se ₹10,000 ke beech enter karo"
  ]
 },
 {
  "en": "Could not send the counter offer",
  "hi": "काउंटर ऑफ़र नहीं भेजा जा सका",
  "aliases": [
   "Counter offer nahi ho saka",
   "Counter offer nahi ho saka"
  ]
 },
 {
  "en": "Could not reject the final fare",
  "hi": "अंतिम किराया अस्वीकार नहीं हुआ",
  "aliases": [
   "Final fare reject nahi hua",
   "Final fare reject nahi hua"
  ]
 },
 {
  "en": "Profile updated successfully",
  "hi": "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई",
  "aliases": [
   "Profile successfully update ho gayi",
   "Profile successfully update ho gayi"
  ]
 },
 {
  "en": "Profile could not be updated",
  "hi": "प्रोफ़ाइल अपडेट नहीं हुई",
  "aliases": [
   "Profile update nahi hui",
   "Profile update nahi hui"
  ]
 },
 {
  "en": "Do you want to cancel the ride?",
  "hi": "क्या आप यात्रा रद्द करना चाहते हैं?",
  "aliases": [
   "Kya aap ride cancel karna chahte hain?",
   "Kya aap ride cancel karna chahte hain?"
  ]
 },
 {
  "en": "Payment will be enabled only after the driver completes the ride and the final fare is locked.",
  "hi": "भुगतान चालक द्वारा यात्रा पूरी करने और अंतिम किराया लॉक होने के बाद ही सक्रिय होगा।",
  "aliases": [
   "Payment driver ke ride complete karne aur final fare lock hone ke baad hi enable hoga.",
   "Payment driver ke ride complete karne aur final fare lock hone ke baad hi enable hoga."
  ]
 },
 {
  "en": "Support: Contact the HimRideG team",
  "hi": "सहायता: HimRideG टीम से संपर्क करें",
  "aliases": [
   "Support: HimRideG team se contact karein",
   "Support: HimRideG team se contact karo"
  ]
 },
 {
  "en": "Your ride, in your own mountains.",
  "hi": "आपकी यात्रा, आपके अपने पहाड़ों में।",
  "aliases": [
   "Aapki ride, aapke apne pahadon mein.",
   "Aapki ride, aapke apne pahadon mein."
  ]
 },
 {
  "en": "Driver's number is not available right now",
  "hi": "चालक का नंबर अभी उपलब्ध नहीं है",
  "aliases": [
   "Driver number abhi available nahi hai",
   "Driver number abhi available nahi hai"
  ]
 },
 {
  "en": "No active ride right now",
  "hi": "अभी कोई सक्रिय यात्रा नहीं है",
  "aliases": [
   "Abhi koi active ride nahi hai",
   "Abhi koi active ride nahi hai"
  ]
 },
 {
  "en": "Select pickup and destination to book a ride.",
  "hi": "यात्रा बुक करने के लिए पिकअप और गंतव्य चुनें।",
  "aliases": [
   "Pickup aur destination select karke ride book karein.",
   "Pickup aur destination select karke ride book karo."
  ]
 },
 {
  "en": "There are no rides in this list yet.",
  "hi": "इस सूची में अभी कोई यात्रा नहीं है।",
  "aliases": [
   "Is list mein abhi koi ride nahi hai.",
   "Is list mein abhi koi ride nahi hai."
  ]
 },
 {
  "en": "The Refer & Earn feature will be enabled with the live service.",
  "hi": "Refer & Earn सुविधा लाइव सेवा के साथ सक्रिय होगी।",
  "aliases": [
   "Refer & Earn feature live service ke saath enable hoga.",
   "Refer & Earn feature live service ke saath enable hoga."
  ]
 },
 {
  "en": "The content on these pages loads live from the website, so the latest content will appear here as soon as the website is updated.",
  "hi": "इन पेजों की सामग्री वेबसाइट से लाइव लोड होती है, इसलिए वेबसाइट अपडेट होते ही यहाँ भी नवीनतम सामग्री दिखेगी।",
  "aliases": [
   "In pages ka content website se live load hota hai, isliye website update hote hi yahan bhi latest content dikhega.",
   "In pages ka content website se live load hota hai, isliye website update hote hi yahan bhi latest content dikhega."
  ]
 },
 {
  "en": "The driver has arrived. Share this OTP with the driver once you meet in person.",
  "hi": "चालक पहुँच गया है। चालक से मिलने के बाद उन्हें यह OTP बताएं।",
  "aliases": [
   "Driver arrive ho gaya hai. Driver ko saamne milne ke baad ye OTP batayein.",
   "Driver arrive ho gaya hai. Driver se milne ke baad ye OTP batao."
  ]
 },
 {
  "en": "This popup will close automatically once the OTP is verified.",
  "hi": "OTP सत्यापित होते ही यह पॉपअप अपने आप बंद हो जाएगा।",
  "aliases": [
   "OTP verify hote hi ye popup automatically close ho jayega.",
   "OTP verify hote hi ye popup automatically close ho jayega."
  ]
 },
 {
  "en": "Google login did not load.",
  "hi": "Google लॉगिन लोड नहीं हुआ।",
  "aliases": [
   "Google login load nahi hua.",
   "Google login load nahi hua."
  ]
 },
 {
  "en": "Google Identity Services did not load.",
  "hi": "Google Identity Services लोड नहीं हुई।",
  "aliases": [
   "Google Identity Services load nahi hui.",
   "Google Identity Services load nahi hui."
  ]
 },
 {
  "en": "Google credential not found. Please try again.",
  "hi": "Google क्रेडेंशियल नहीं मिला। दोबारा प्रयास करें।",
  "aliases": [
   "Google credential nahi mila. Dobara try karo.",
   "Google credential nahi mila. Dobara try karo."
  ]
 },
 {
  "en": "Token or user not found in the Google login response.",
  "hi": "Google लॉगिन प्रतिक्रिया में टोकन या उपयोगकर्ता नहीं मिला।",
  "aliases": [
   "Google login response me token ya user nahi mila.",
   "Google login response mein token ya user nahi mila."
  ]
 },
 {
  "en": "Google login failed.",
  "hi": "Google लॉगिन नहीं हो पाया।",
  "aliases": [
   "Google login nahi ho paya.",
   "Google login nahi ho paya."
  ]
 },
 {
  "en": "Google Client ID has not been configured yet.",
  "hi": "Google Client ID अभी कॉन्फ़िगर करना बाकी है।",
  "aliases": [
   "Google Client ID configure karna baaki hai.",
   "Google Client ID configure karna baaki hai."
  ]
 },
 {
  "en": "Please accept the Terms, Privacy and Cancellation rules before continuing.",
  "hi": "आगे बढ़ने से पहले नियम, गोपनीयता और रद्दीकरण नियम स्वीकार करें।",
  "aliases": [
   "Continue karne se pehle Terms, Privacy aur Cancellation rules accept karein.",
   "Continue karne se pehle Terms, Privacy aur Cancellation rules accept karo."
  ]
 },
 {
  "en": "Google login is not ready yet.",
  "hi": "Google लॉगिन अभी तैयार नहीं है।",
  "aliases": [
   "Google login abhi ready nahi hai.",
   "Google login abhi ready nahi hai."
  ]
 },
 {
  "en": "After Google verification, you will go directly to the Dashboard.",
  "hi": "Google सत्यापन के बाद आप सीधे डैशबोर्ड पर पहुँचेंगे।",
  "aliases": [
   "Google verification ke baad direct Dashboard par jayega.",
   "Google verification ke baad direct Dashboard par jaoge."
  ]
 },
 {
  "en": "Request could not be completed",
  "hi": "अनुरोध पूरा नहीं हुआ",
  "aliases": [
   "Request complete nahi hui",
   "Request complete nahi hui"
  ]
 },
 {
  "en": "Pickup and Drop Map",
  "hi": "पिकअप और ड्रॉप नक्शा",
  "aliases": [
   "Pickup aur Drop Map",
   "Pickup aur Drop Map"
  ]
 },
 {
  "en": "Razorpay checkout did not load",
  "hi": "Razorpay चेकआउट लोड नहीं हुआ",
  "aliases": [
   "Razorpay checkout load nahi hua",
   "Razorpay checkout load nahi hua"
  ]
 },
 {
  "en": "Keep the top-up between ₹100 and ₹50,000.",
  "hi": "टॉप-अप ₹100 से ₹50,000 के बीच रखें।",
  "aliases": [
   "Top-up ₹100 se ₹50,000 ke beech rakho.",
   "Top-up ₹100 se ₹50,000 ke beech rakho."
  ]
 },
 {
  "en": "Top-up could not be verified",
  "hi": "टॉप-अप सत्यापित नहीं हुआ",
  "aliases": [
   "Top-up verify nahi hua",
   "Top-up verify nahi hua"
  ]
 },
 {
  "en": "Wallet payment failed",
  "hi": "वॉलेट भुगतान विफल हो गया",
  "aliases": [
   "Wallet payment fail ho gayi",
   "Wallet payment fail ho gayi"
  ]
 },
 {
  "en": "Wallet top-up could not be started",
  "hi": "वॉलेट टॉप-अप शुरू नहीं हुआ",
  "aliases": [
   "Wallet top-up start nahi hua",
   "Wallet top-up start nahi hua"
  ]
 },
 {
  "en": "Opening payment...",
  "hi": "भुगतान खुल रहा है...",
  "aliases": [
   "Payment open ho rahi hai...",
   "Payment open ho rahi hai..."
  ]
 },
 {
  "en": "Minimum withdrawal is ₹100.",
  "hi": "न्यूनतम निकासी ₹100 है।",
  "aliases": [
   "Minimum ₹100 withdrawal hai.",
   "Minimum withdrawal ₹100 hai."
  ]
 },
 {
  "en": "Enter your UPI ID.",
  "hi": "UPI ID दर्ज करें।",
  "aliases": [
   "UPI ID enter karo.",
   "UPI ID enter karo."
  ]
 },
 {
  "en": "Account number and IFSC are required.",
  "hi": "खाता संख्या और IFSC आवश्यक हैं।",
  "aliases": [
   "Account number aur IFSC zaroori hai.",
   "Account number aur IFSC zaroori hai."
  ]
 },
 {
  "en": "Request submitted!",
  "hi": "अनुरोध सबमिट हो गया!",
  "aliases": [
   "Request submit ho gayi!",
   "Request submit ho gayi!"
  ]
 },
 {
  "en": "Request could not be submitted.",
  "hi": "अनुरोध सबमिट नहीं हो सका।",
  "aliases": [
   "Request submit nahi ho saki.",
   "Request submit nahi ho saki."
  ]
 },
 {
  "en": "Send Withdrawal Request",
  "hi": "निकासी अनुरोध भेजें",
  "aliases": [
   "Withdrawal Request Bhejo",
   "Withdrawal Request Bhejo"
  ]
 },
 {
  "en": "Minimum \\u20b9100 balance required.",
  "hi": "न्यूनतम \\u20b9100 बैलेंस आवश्यक है।",
  "aliases": [
   "Minimum \\u20b9100 balance chahiye.",
   "Minimum \\u20b9100 balance chahiye."
  ]
 },
 {
  "en": "Enter bank account number and IFSC.",
  "hi": "बैंक खाता संख्या और IFSC दर्ज करें।",
  "aliases": [
   "Bank account number aur IFSC enter karo.",
   "Bank account number aur IFSC enter karo."
  ]
 },
 {
  "en": "Payout details saved.",
  "hi": "भुगतान प्राप्ति विवरण सेव हो गए।",
  "aliases": [
   "Payout details save ho gayi.",
   "Payout details save ho gayi."
  ]
 },
 {
  "en": "Payout details could not be saved.",
  "hi": "भुगतान प्राप्ति विवरण सेव नहीं हो सके।",
  "aliases": [
   "Payout details save nahi ho saki.",
   "Payout details save nahi ho saki."
  ]
 },
 {
  "en": "Live RazorpayX payout is not ready on the server yet.",
  "hi": "लाइव RazorpayX पेआउट अभी सर्वर पर तैयार नहीं है।",
  "aliases": [
   "Live RazorpayX payout server par abhi ready nahi hai.",
   "Live RazorpayX payout server par abhi ready nahi hai."
  ]
 },
 {
  "en": "Select a primary UPI/Bank account or save a UPI ID.",
  "hi": "प्राथमिक UPI/बैंक खाता चुनें या UPI ID सेव करें।",
  "aliases": [
   "Primary UPI/Bank account select karo ya UPI ID save karo.",
   "Primary UPI/Bank account select karo ya UPI ID save karo."
  ]
 },
 {
  "en": "Select a primary bank account or save bank details.",
  "hi": "प्राथमिक बैंक खाता चुनें या बैंक विवरण सेव करें।",
  "aliases": [
   "Primary bank account select karo ya bank details save karo.",
   "Primary bank account select karo ya bank details save karo."
  ]
 },
 {
  "en": "Payout submitted!",
  "hi": "पेआउट सबमिट हो गया!",
  "aliases": [
   "Payout submit ho gaya!",
   "Payout submit ho gaya!"
  ]
 },
 {
  "en": "Payout could not be submitted.",
  "hi": "पेआउट सबमिट नहीं हो सका।",
  "aliases": [
   "Payout submit nahi ho saka.",
   "Payout submit nahi ho saka."
  ]
 },
 {
  "en": "Add a bank/UPI account in UPI & Payment Settings and select it as Primary.",
  "hi": "UPI & Payment Settings में बैंक/UPI जोड़कर उसे प्राथमिक चुनें।",
  "aliases": [
   "UPI & Payment Settings me bank/UPI add karke Primary select karein.",
   "UPI & Payment Settings mein bank/UPI add karke Primary select karo."
  ]
 },
 {
  "en": "Instant withdrawal is not available right now. Your wallet earnings will stay safe.",
  "hi": "तुरंत निकासी अभी उपलब्ध नहीं है। वॉलेट की कमाई सुरक्षित रहेगी।",
  "aliases": [
   "Instant withdrawal abhi available nahi hai. Wallet earning safe rahegi.",
   "Instant withdrawal abhi available nahi hai. Wallet earning safe rahegi."
  ]
 },
 {
  "en": "Processing payout...",
  "hi": "पेआउट हो रहा है...",
  "aliases": [
   "Payout ho raha hai...",
   "Payout ho raha hai..."
  ]
 },
 {
  "en": "Minimum ₹100 balance required.",
  "hi": "न्यूनतम ₹100 बैलेंस आवश्यक है।",
  "aliases": [
   "Minimum ₹100 balance chahiye.",
   "Minimum ₹100 balance chahiye."
  ]
 },
 {
  "en": "A ride is currently active. Accept / Reject will be available after the ride is completed.",
  "hi": "वर्तमान यात्रा सक्रिय है। यात्रा पूरी होने के बाद Accept / Reject उपलब्ध होगा।",
  "aliases": [
   "Current ride active. Ride complete hone ke baad Accept / Reject available hoga.",
   "Current ride active hai. Ride complete hone ke baad Accept / Reject available hoga."
  ]
 },
 {
  "en": "A new nearby ride has arrived. It is preview-only because a ride is currently active.",
  "hi": "पास में नई यात्रा आई है। वर्तमान यात्रा सक्रिय होने के कारण यह केवल पूर्वावलोकन के लिए है।",
  "aliases": [
   "Nayi nearby ride aayi hai. Current ride active hone ki wajah se ye preview-only hai.",
   "Nayi nearby ride aayi hai. Current ride active hone ki wajah se ye preview-only hai."
  ]
 },
 {
  "en": "The ride request is no longer available.",
  "hi": "यात्रा अनुरोध अब उपलब्ध नहीं है।",
  "aliases": [
   "Ride request available nahi rahi.",
   "Ride request ab available nahi hai."
  ]
 },
 {
  "en": "Ride completed successfully.",
  "hi": "यात्रा सफलतापूर्वक पूरी हो गई।",
  "aliases": [
   "Ride successfully complete ho gayi.",
   "Ride successfully complete ho gayi."
  ]
 },
 {
  "en": "The fare is now final and locked. Please continue the ride.",
  "hi": "किराया अंतिम रूप से लॉक हो गया। यात्रा जारी रखें।",
  "aliases": [
   "Fare final lock ho gaya. Ride continue karein.",
   "Fare final lock ho gaya. Ride continue karo."
  ]
 },
 {
  "en": "The customer rejected the FINAL fare. The ride has been released and a new driver will be searched.",
  "hi": "ग्राहक ने अंतिम किराया अस्वीकार किया। यात्रा रिलीज़ हो गई और नए चालक की खोज होगी।",
  "aliases": [
   "Customer ne FINAL fare reject kiya. Ride release ho gayi aur naya driver search hoga.",
   "Customer ne FINAL fare reject kiya. Ride release ho gayi aur naya driver search hoga."
  ]
 },
 {
  "en": "The customer selected Advance Payment. Ride actions are locked until the payment is made.",
  "hi": "ग्राहक ने अग्रिम भुगतान चुना। भुगतान होने तक यात्रा की कार्रवाइयाँ लॉक हैं।",
  "aliases": [
   "Customer ne Advance Payment select ki. Payment paid hone tak ride actions locked hain.",
   "Customer ne Advance Payment select ki. Payment paid hone tak ride actions locked hain."
  ]
 },
 {
  "en": "The customer selected Scheduled Payment. The Pay Now option is available.",
  "hi": "ग्राहक ने निर्धारित भुगतान चुना। Pay Now विकल्प उपलब्ध है।",
  "aliases": [
   "Customer ne Scheduled Payment select ki. Pay Now option available hai.",
   "Customer ne Scheduled Payment select ki. Pay Now option available hai."
  ]
 },
 {
  "en": "Booking ID not found.",
  "hi": "बुकिंग ID नहीं मिली।",
  "aliases": [
   "Booking ID nahi mili.",
   "Booking ID nahi mili."
  ]
 },
 {
  "en": "Enter a fare between ₹50 and ₹10,000.",
  "hi": "₹50 से ₹10,000 के बीच किराया दर्ज करें।",
  "aliases": [
   "Fare ₹50 se ₹10,000 ke beech enter karo.",
   "Fare ₹50 se ₹10,000 ke beech enter karo."
  ]
 },
 {
  "en": "The final fare could not be sent. Please retry.",
  "hi": "अंतिम किराया नहीं भेजा जा सका। दोबारा प्रयास करें।",
  "aliases": [
   "Final fare nahi bheja ja saka. Retry karein.",
   "Final fare nahi bheja ja saka. Retry karo."
  ]
 },
 {
  "en": "The fare offer could not be sent. Please retry.",
  "hi": "किराया ऑफ़र नहीं भेजा जा सका। दोबारा प्रयास करें।",
  "aliases": [
   "Fare offer nahi bheja ja saka. Retry karein.",
   "Fare offer nahi bheja ja saka. Retry karo."
  ]
 },
 {
  "en": "The customer's counter fare is not valid.",
  "hi": "ग्राहक का काउंटर किराया मान्य नहीं है।",
  "aliases": [
   "Customer counter fare valid nahi hai.",
   "Customer ka counter fare valid nahi hai."
  ]
 },
 {
  "en": "The counter offer could not be accepted.",
  "hi": "काउंटर ऑफ़र स्वीकार नहीं हुआ।",
  "aliases": [
   "Counter offer accept nahi hua.",
   "Counter offer accept nahi hua."
  ]
 },
 {
  "en": "The counter offer could not be rejected.",
  "hi": "काउंटर ऑफ़र अस्वीकार नहीं हुआ।",
  "aliases": [
   "Counter offer reject nahi hua.",
   "Counter offer reject nahi hua."
  ]
 },
 {
  "en": "Counter rejected. Now send a new fare.",
  "hi": "काउंटर अस्वीकार हुआ। अब नया किराया भेजें।",
  "aliases": [
   "Counter reject hua. Ab naya fare bhejo.",
   "Counter reject ho gaya. Ab naya fare bhejo."
  ]
 },
 {
  "en": "Ride accepted.",
  "hi": "यात्रा स्वीकार हो गई।",
  "aliases": [
   "Ride accept ho gayi.",
   "Ride accept ho gayi."
  ]
 },
 {
  "en": "Release this unconfirmed ride? You will immediately be available to take the next ride.",
  "hi": "क्या इस अपुष्ट यात्रा को रिलीज़ करना है? आप तुरंत अगली यात्रा लेने के लिए उपलब्ध हो जाएंगे।",
  "aliases": [
   "Is unconfirmed ride ko release karna hai? Aap turant next ride lene ke liye available ho jayenge.",
   "Is unconfirmed ride ko release karna hai? Aap turant next ride lene ke liye available ho jaoge."
  ]
 },
 {
  "en": "Ride released. You can take the next ride.",
  "hi": "यात्रा रिलीज़ हो गई। आप अगली यात्रा ले सकते हैं।",
  "aliases": [
   "Ride release ho gayi. Aap next ride le sakte hain.",
   "Ride release ho gayi. Aap next ride le sakte ho."
  ]
 },
 {
  "en": "The ride could not be released.",
  "hi": "यात्रा रिलीज़ नहीं हुई।",
  "aliases": [
   "Ride release nahi hui.",
   "Ride release nahi hui."
  ]
 },
 {
  "en": "Cash payment could not be confirmed.",
  "hi": "नकद भुगतान की पुष्टि नहीं हुई।",
  "aliases": [
   "Cash payment confirm nahi hui.",
   "Cash payment confirm nahi hui."
  ]
 },
 {
  "en": "Journey to pickup has started.",
  "hi": "पिकअप के लिए यात्रा शुरू हो गई।",
  "aliases": [
   "Pickup ke liye journey start ho gayi.",
   "Pickup ke liye journey start ho gayi."
  ]
 },
 {
  "en": "OTP sent to the customer. Ask the customer for the OTP and enter it manually.",
  "hi": "OTP ग्राहक को भेज दिया। ग्राहक से OTP पूछकर स्वयं दर्ज करें।",
  "aliases": [
   "OTP customer ko bhej diya. Customer se OTP poochkar manually enter karein.",
   "OTP customer ko bhej diya. Customer se OTP poochkar manually enter karo."
  ]
 },
 {
  "en": "OTP verified. The ride has started.",
  "hi": "OTP सत्यापित। यात्रा शुरू हो गई।",
  "aliases": [
   "OTP verified. Ride start ho gayi.",
   "OTP verified. Ride start ho gayi."
  ]
 },
 {
  "en": "Has the customer reached the destination?",
  "hi": "क्या ग्राहक गंतव्य पर पहुँच गया है?",
  "aliases": [
   "Kya customer destination par pahunch gaya hai?",
   "Kya customer destination par pahunch gaya hai?"
  ]
 },
 {
  "en": "Ride completed at the destination. Now waiting for the customer's payment.",
  "hi": "यात्रा गंतव्य पर पूरी हो गई। अब ग्राहक के भुगतान की प्रतीक्षा है।",
  "aliases": [
   "Ride destination par complete ho gayi. Ab customer payment ka wait hai.",
   "Ride destination par complete ho gayi. Ab customer payment ka wait hai."
  ]
 },
 {
  "en": "Profile saved",
  "hi": "प्रोफ़ाइल सेव हो गई",
  "aliases": [
   "Profile save ho gayi",
   "Profile save ho gayi"
  ]
 },
 {
  "en": "Profile photo updated",
  "hi": "प्रोफ़ाइल फ़ोटो अपडेट हो गई",
  "aliases": [
   "Profile photo update ho gayi",
   "Profile photo update ho gayi"
  ]
 },
 {
  "en": "Enter your full name as on your Aadhaar card",
  "hi": "आधार कार्ड के अनुसार पूरा नाम दर्ज करें",
  "aliases": [
   "Aadhaar card wala poora naam enter karo",
   "Aadhaar card wala poora naam enter karo"
  ]
 },
 {
  "en": "Document uploaded ✓",
  "hi": "दस्तावेज़ अपलोड हो गया ✓",
  "aliases": [
   "Document upload ho gaya ✓",
   "Document upload ho gaya ✓"
  ]
 },
 {
  "en": "The customer's cash payment is complete. You can take the next ride.",
  "hi": "ग्राहक का नकद भुगतान पूरा हो गया। आप अगली यात्रा ले सकते हैं।",
  "aliases": [
   "Customer ki cash payment complete ho gayi. Aap next ride le sakte hain.",
   "Customer ki cash payment complete ho gayi. Aap next ride le sakte ho."
  ]
 },
 {
  "en": "The customer's online payment has been received. You can take the next ride.",
  "hi": "ग्राहक का ऑनलाइन भुगतान प्राप्त हो गया। आप अगली यात्रा ले सकते हैं।",
  "aliases": [
   "Customer ki online payment receive ho gayi. Aap next ride le sakte hain.",
   "Customer ki online payment receive ho gayi. Aap next ride le sakte ho."
  ]
 },
 {
  "en": "Some Documents Were Rejected",
  "hi": "कुछ दस्तावेज़ अस्वीकार हुए",
  "aliases": [
   "Kuch Documents Reject Hue",
   "Kuch Documents Reject Hue"
  ]
 },
 {
  "en": "Upload Documents",
  "hi": "दस्तावेज़ अपलोड करें",
  "aliases": [
   "Documents Upload Karo",
   "Documents Upload Karo"
  ]
 },
 {
  "en": "Upload the rejected documents again. Dashboard access will not be available until then.",
  "hi": "अस्वीकार किए गए दस्तावेज़ दोबारा अपलोड करें। तब तक डैशबोर्ड का उपयोग नहीं मिलेगा।",
  "aliases": [
   "Rejected documents dobara upload karo. Tab tak dashboard access nahi milega.",
   "Rejected documents dobara upload karo. Tab tak dashboard access nahi milega."
  ]
 },
 {
  "en": "Upload all 5 required documents before taking rides. The admin will verify them.",
  "hi": "यात्रा लेने से पहले सभी 5 आवश्यक दस्तावेज़ अपलोड करें। एडमिन सत्यापित करेगा।",
  "aliases": [
   "Ride lene se pehle saare 5 required documents upload karo. Admin verify karega.",
   "Ride lene se pehle saare 5 required documents upload karo. Admin verify karega."
  ]
 },
 {
  "en": "Not uploaded",
  "hi": "अपलोड नहीं हुआ",
  "aliases": [
   "Upload nahi hua",
   "Upload nahi hua"
  ]
 },
 {
  "en": "All your documents will be verified by the admin once uploaded. The dashboard and rides will be available after verification.",
  "hi": "सभी दस्तावेज़ अपलोड होने के बाद एडमिन उन्हें सत्यापित करेंगे। सत्यापन के बाद डैशबोर्ड और यात्राएँ उपलब्ध होंगी।",
  "aliases": [
   "Saare documents upload hone ke baad Admin verify karega. Verification ke baad dashboard aur rides available honge.",
   "Saare documents upload hone ke baad Admin verify karega. Verification ke baad dashboard aur rides available honge."
  ]
 },
 {
  "en": "All your documents are with the admin for review.",
  "hi": "आपके सभी दस्तावेज़ एडमिन के पास समीक्षा के लिए हैं।",
  "aliases": [
   "Tumhare saare documents admin ke paas review ke liye hain.",
   "Aapke saare documents admin ke paas review ke liye hain."
  ]
 },
 {
  "en": "Rides will start coming in after approval.",
  "hi": "स्वीकृति के बाद यात्राएँ आनी शुरू हो जाएँगी।",
  "aliases": [
   "Approval ke baad rides aana shuru hongi.",
   "Approval ke baad rides aana shuru ho jayengi."
  ]
 },
 {
  "en": "ℹ What will the admin do?",
  "hi": "ℹ एडमिन क्या करेंगे?",
  "aliases": [
   "ℹ Admin kya karega?",
   "ℹ Admin kya karega?"
  ]
 },
 {
  "en": "After verification, your account will be approved",
  "hi": "सत्यापन के बाद आपका खाता स्वीकृत होगा",
  "aliases": [
   "Verification ke baad tumhara account approve hoga",
   "Verification ke baad aapka account approve hoga"
  ]
 },
 {
  "en": "and the dashboard + rides will unlock automatically.",
  "hi": "और डैशबोर्ड + यात्राएँ अपने आप अनलॉक हो जाएँगी।",
  "aliases": [
   "aur dashboard + rides automatically unlock ho jayenge.",
   "aur dashboard + rides automatically unlock ho jayenge."
  ]
 },
 {
  "en": "Refresh the page, or log out and log in again, to check your approval status.",
  "hi": "स्वीकृति की स्थिति देखने के लिए पेज रिफ्रेश करें या लॉगआउट करके दोबारा लॉगिन करें।",
  "aliases": [
   "Page refresh karo ya logout karke dobara login karo approval status check karne ke liye.",
   "Approval status check karne ke liye page refresh karo ya logout karke dobara login karo."
  ]
 },
 {
  "en": "Enter Customer OTP",
  "hi": "ग्राहक का OTP दर्ज करें",
  "aliases": [
   "Customer OTP Enter Karo",
   "Customer OTP Enter Karo"
  ]
 },
 {
  "en": "Enter the ride-start OTP shown on the customer's phone.",
  "hi": "ग्राहक के फ़ोन पर दिख रहा यात्रा-शुरू OTP दर्ज करें।",
  "aliases": [
   "Customer ke phone par dikh raha ride-start OTP enter karo.",
   "Customer ke phone par dikh raha ride-start OTP enter karo."
  ]
 },
 {
  "en": "Once a new OTP is generated, the old OTP will become invalid.",
  "hi": "नया OTP बनने पर पुराना OTP अमान्य हो जाएगा।",
  "aliases": [
   "Naya OTP banne par purana OTP invalid ho jayega.",
   "Naya OTP banne par purana OTP invalid ho jayega."
  ]
 },
 {
  "en": "Your performance",
  "hi": "आपका प्रदर्शन",
  "aliases": [
   "Aapki performance",
   "Aapki performance"
  ]
 },
 {
  "en": "The customer will scan this QR by opening the Camera Scanner from the completed ride's payment screen. The QR verifies the driver's identity; the payment amount will always be the final locked fare.",
  "hi": "ग्राहक पूरी हुई यात्रा की भुगतान स्क्रीन से कैमरा स्कैनर खोलकर इस QR को स्कैन करेंगे। QR चालक की पहचान सत्यापित करता है; भुगतान राशि हमेशा अंतिम लॉक किया गया किराया ही रहेगी।",
  "aliases": [
   "Customer completed ride ke payment screen se Camera Scanner open karke is QR ko scan karega. QR driver identity verify karta hai; payment amount hamesha final locked fare rahega.",
   "Customer completed ride ki payment screen se Camera Scanner open karke is QR ko scan karega. QR driver identity verify karta hai; payment amount hamesha final locked fare hi rahega."
  ]
 },
 {
  "en": "The customer will pay the locked fare via Paytm / UPI. After the ride is complete + the payment is verified",
  "hi": "ग्राहक Paytm / UPI से लॉक किया गया किराया चुकाएँगे। यात्रा पूरी होने + भुगतान सत्यापित होने के बाद",
  "aliases": [
   "Customer Paytm / UPI se locked fare pay karega. Ride complete + payment verify hone ke baad",
   "Customer Paytm / UPI se locked fare pay karega. Ride complete + payment verify hone ke baad"
  ]
 },
 {
  "en": "the platform commission will be retained in the Razorpay collection and",
  "hi": "प्लेटफ़ॉर्म कमीशन Razorpay कलेक्शन में रखा जाएगा और",
  "aliases": [
   "platform Razorpay collection me retain hogi aur",
   "platform commission Razorpay collection me retain hogi aur"
  ]
 },
 {
  "en": "will be credited to this earnings wallet. Withdrawals go to your saved UPI or bank account via live RazorpayX payout.",
  "hi": "इस कमाई वॉलेट में जमा होगा। निकासी लाइव RazorpayX पेआउट से सहेजे गए UPI या बैंक खाते में जाएगी।",
  "aliases": [
   "is earnings wallet me credit hoga. Withdrawal live RazorpayX payout se saved UPI ya bank account par jayega.",
   "is earnings wallet me credit hoga. Withdrawal live RazorpayX payout se saved UPI ya bank account par jayega."
  ]
 },
 {
  "en": "Your latest ride credits, cash commission and withdrawals are clearly shown here.",
  "hi": "नवीनतम यात्रा क्रेडिट, नकद कमीशन और निकासी यहाँ स्पष्ट रूप से दिखाई देते हैं।",
  "aliases": [
   "Latest ride credits, cash commission aur withdrawals yahan clearly dikhte hain.",
   "Latest ride credits, cash commission aur withdrawals yahan clearly dikhte hain."
  ]
 },
 {
  "en": "No wallet transaction history yet.",
  "hi": "अभी वॉलेट लेनदेन का कोई इतिहास नहीं है।",
  "aliases": [
   "Abhi wallet transaction history nahi hai.",
   "Abhi wallet transaction history nahi hai."
  ]
 },
 {
  "en": "The existing add-money code is preserved. It is kept for clearing pending HimRideG commission on cash rides. 90% of the customer's online ride earnings is credited to the real earnings wallet, separate from this top-up.",
  "hi": "मौजूदा ऐड-मनी कोड सुरक्षित रखा गया है। इसका उपयोग नकद यात्राओं का बकाया HimRideG कमीशन चुकाने के लिए रखा गया है। ग्राहक की ऑनलाइन यात्रा की कमाई का 90% इस टॉप-अप से अलग असली कमाई वॉलेट में जमा होता है।",
  "aliases": [
   "Existing add-money code preserve hai. Iska use cash rides ki pending HimRideG commission clear karne ke liye rakha gaya hai. Customer online ride earning ka 90% is top-up se alag real earnings wallet credit hota hai.",
   "Existing add-money code preserve hai. Iska use cash rides ki pending HimRideG commission clear karne ke liye rakha gaya hai. Customer online ride earning ka 90% is top-up se alag real earnings wallet me credit hota hai."
  ]
 },
 {
  "en": "Upload and verify these documents before taking rides",
  "hi": "यात्रा लेने से पहले ये दस्तावेज़ अपलोड और सत्यापित करवाएँ",
  "aliases": [
   "Ride lene se pehle yeh documents upload aur verify karwao",
   "Ride lene se pehle yeh documents upload aur verify karwao"
  ]
 },
 {
  "en": "Later",
  "hi": "बाद में",
  "aliases": [
   "Baad mein",
   "Baad mein"
  ]
 },
 {
  "en": "📤 Upload Documents",
  "hi": "📤 दस्तावेज़ अपलोड करें",
  "aliases": [
   "📤 Documents Upload Karo",
   "📤 Documents Upload Karo"
  ]
 },
 {
  "en": "Manage your profile, wallet, rides and summary all in one place.",
  "hi": "प्रोफ़ाइल, वॉलेट, यात्राएँ और सारांश सब एक ही जगह से प्रबंधित करें।",
  "aliases": [
   "Profile, wallet, rides aur summary sab ek jagah se manage karo.",
   "Profile, wallet, rides aur summary sab ek jagah se manage karo."
  ]
 },
 {
  "en": "The Refer and Earn feature will be enabled with the public rollout.",
  "hi": "रेफ़र एंड अर्न सुविधा सार्वजनिक लॉन्च के साथ शुरू होगी।",
  "aliases": [
   "Refer and Earn feature public rollout ke saath enable hoga.",
   "Refer and Earn feature public rollout ke saath enable hoga."
  ]
 },
 {
  "en": "Invite other verified taxi drivers to HimRideG",
  "hi": "अन्य सत्यापित टैक्सी चालकों को HimRideG पर आमंत्रित करें",
  "aliases": [
   "Dusre verified taxi drivers ko HimRideG par invite karein",
   "Dusre verified taxi drivers ko HimRideG par invite karo"
  ]
 },
 {
  "en": "Help: Contact HimRideG support for ride, payment or driver verification issues.",
  "hi": "सहायता: यात्रा, भुगतान या चालक सत्यापन संबंधी समस्या के लिए HimRideG सहायता से संपर्क करें।",
  "aliases": [
   "Help: ride, payment ya driver verification issue ke liye HimRideG support se contact karein.",
   "Help: ride, payment ya driver verification issue ke liye HimRideG support se contact karo."
  ]
 },
 {
  "en": "Full name as on Aadhaar",
  "hi": "आधार के अनुसार पूरा नाम",
  "aliases": [
   "Aadhaar wala poora naam",
   "Aadhaar wala poora naam"
  ]
 },
 {
  "en": "✓ Admin verified — cannot be changed",
  "hi": "✓ एडमिन द्वारा सत्यापित — बदला नहीं जा सकता",
  "aliases": [
   "✓ Admin verified — change nahi hoga",
   "✓ Admin verified — change nahi hoga"
  ]
 },
 {
  "en": "The admin will verify after Aadhaar is uploaded",
  "hi": "आधार अपलोड होने के बाद एडमिन सत्यापित करेंगे",
  "aliases": [
   "Aadhaar upload ke baad admin verify karega",
   "Aadhaar upload ke baad admin verify karega"
  ]
 },
 {
  "en": "Cannot be changed without OTP verification",
  "hi": "OTP सत्यापन के बिना बदला नहीं जा सकता",
  "aliases": [
   "OTP verification ke bina change nahi hoga",
   "OTP verification ke bina change nahi hoga"
  ]
 },
 {
  "en": "Only commercial vehicles are allowed on HimRideG",
  "hi": "HimRideG पर केवल व्यावसायिक वाहनों की अनुमति है",
  "aliases": [
   "HimRideG par sirf commercial vehicles allowed hain",
   "HimRideG par sirf commercial vehicles allowed hain"
  ]
 },
 {
  "en": "No transactions in this filter yet.",
  "hi": "इस फ़िल्टर में अभी कोई लेनदेन नहीं है।",
  "aliases": [
   "Is filter me abhi koi transaction nahi hai.",
   "Is filter me abhi koi transaction nahi hai."
  ]
 },
 {
  "en": "JPG, PNG, WEBP or PDF • Max 5MB • The admin will verify after upload",
  "hi": "JPG, PNG, WEBP या PDF • अधिकतम 5MB • अपलोड के बाद एडमिन सत्यापित करेंगे",
  "aliases": [
   "JPG, PNG, WEBP ya PDF • Max 5MB • Upload ke baad Admin verify karega",
   "JPG, PNG, WEBP ya PDF • Max 5MB • Upload ke baad Admin verify karega"
  ]
 },
 {
  "en": "Could not open document:",
  "hi": "दस्तावेज़ नहीं खुल सका:",
  "aliases": [
   "Document open nahi ho saka:",
   "Document open nahi ho saka:"
  ]
 },
 {
  "en": "Tap the ride request. Accept / Reject will appear only after the details open.",
  "hi": "यात्रा अनुरोध पर टैप करें। स्वीकार / अस्वीकार विवरण खुलने के बाद ही दिखेगा।",
  "aliases": [
   "Ride request par tap karo. Accept / Reject sirf details open hone ke baad aayega.",
   "Ride request par tap karo. Accept / Reject sirf details open hone ke baad aayega."
  ]
 },
 {
  "en": "The customer selected Cash Payment. Confirm only after physically receiving the cash.",
  "hi": "ग्राहक ने नकद भुगतान चुना है। नकद हाथ में मिलने के बाद ही पुष्टि करें।",
  "aliases": [
   "Customer ne Cash Payment select ki hai. Cash physically receive hone ke baad confirm karein.",
   "Customer ne Cash Payment select kiya hai. Cash physically milne ke baad confirm karo."
  ]
 },
 {
  "en": "The ride is complete. Whether or not the customer selects Cash, confirm Receive Cash as soon as you physically receive the cash.",
  "hi": "यात्रा पूरी हो गई है। ग्राहक नकद चुनें या न चुनें, नकद हाथ में मिलते ही Receive Cash की पुष्टि करें।",
  "aliases": [
   "Ride complete hai. Customer Cash select kare ya na kare, cash physically milte hi Receive Cash confirm karein.",
   "Ride complete hai. Customer Cash select kare ya na kare, cash physically milte hi Receive Cash confirm karo."
  ]
 },
 {
  "en": "The fare will be LOCKED only after the customer accepts.",
  "hi": "किराया ग्राहक के स्वीकार करने के बाद ही LOCK होगा।",
  "aliases": [
   "Fare sirf customer ke Accept karne ke baad LOCK hoga.",
   "Fare sirf customer ke Accept karne ke baad LOCK hoga."
  ]
 },
 {
  "en": "The final fare status was saved, but the amount was missing/₹0. ₹0 will never be sent to the customer. Please send your FINAL fare again; once a valid amount is saved, the customer will only get Accept / Reject.",
  "hi": "अंतिम किराये की स्थिति सहेजी गई थी, लेकिन राशि गायब/₹0 मिली। ग्राहक को ₹0 कभी नहीं भेजा जाएगा। अपना FINAL किराया दोबारा भेजें; मान्य राशि सहेजते ही ग्राहक को केवल स्वीकार / अस्वीकार मिलेगा।",
  "aliases": [
   "Final fare status save hua tha lekin amount missing/₹0 mila. Customer ko ₹0 kabhi nahi bheja jayega. Apna FINAL fare dobara bhejein; valid amount save hote hi customer ko sirf Accept / Reject milega.",
   "Final fare status save hua tha lekin amount missing/₹0 mila. Customer ko ₹0 kabhi nahi bheja jayega. Apna FINAL fare dobara bhejo; valid amount save hote hi customer ko sirf Accept / Reject milega."
  ]
 },
 {
  "en": "Resend FINAL fare",
  "hi": "FINAL किराया दोबारा भेजें",
  "aliases": [
   "FINAL fare resend kare",
   "FINAL fare resend karo"
  ]
 },
 {
  "en": "You now have 2 options: accept the customer's counter to lock the fare immediately, or send your FINAL fare.",
  "hi": "अब 2 विकल्प हैं: ग्राहक का काउंटर स्वीकार करके किराया तुरंत लॉक करें, या अपना FINAL किराया भेजें।",
  "aliases": [
   "Ab 2 option hain: customer ka counter Accept karke fare turant lock karein, ya apna FINAL fare bhejein.",
   "Ab 2 option hain: customer ka counter Accept karke fare turant lock karo, ya apna FINAL fare bhejo."
  ]
 },
 {
  "en": "Your FINAL fare",
  "hi": "आपका FINAL किराया",
  "aliases": [
   "Apna FINAL fare",
   "Apna FINAL fare"
  ]
 },
 {
  "en": "The customer can now Accept, Reject or make one Counter Offer on this fare. The initial fare cannot be sent again.",
  "hi": "ग्राहक अब इस किराये को स्वीकार, अस्वीकार या एक बार काउंटर ऑफ़र कर सकते हैं। प्रारंभिक किराया दोबारा नहीं भेजा जाएगा।",
  "aliases": [
   "Customer ab is fare ko Accept, Reject ya ek baar Counter Offer kar sakta hai. Initial fare dobara send nahi hoga.",
   "Customer ab is fare ko Accept, Reject ya ek baar Counter Offer kar sakta hai. Initial fare dobara send nahi hoga."
  ]
 },
 {
  "en": "Enter your initial fare",
  "hi": "अपना प्रारंभिक किराया दर्ज करें",
  "aliases": [
   "Apna initial fare enter kare",
   "Apna initial fare enter karo"
  ]
 },
 {
  "en": "⏳ Waiting for the customer's final Accept / Reject",
  "hi": "⏳ ग्राहक के अंतिम स्वीकार / अस्वीकार की प्रतीक्षा",
  "aliases": [
   "⏳ Customer ke final Accept / Reject ka wait",
   "⏳ Customer ke final Accept / Reject ka wait"
  ]
 },
 {
  "en": "⚠ A ₹0 final fare is invalid — please resend the recovery fare",
  "hi": "⚠ ₹0 अंतिम किराया अमान्य है — सुधार किराया दोबारा भेजें",
  "aliases": [
   "⚠ ₹0 final fare invalid hai — recovery fare resend karein",
   "⚠ ₹0 final fare invalid hai — recovery fare resend karo"
  ]
 },
 {
  "en": "⏳ Waiting for the customer's Accept / Reject / Counter",
  "hi": "⏳ ग्राहक के स्वीकार / अस्वीकार / काउंटर की प्रतीक्षा",
  "aliases": [
   "⏳ Customer ke Accept / Reject / Counter ka wait",
   "⏳ Customer ke Accept / Reject / Counter ka wait"
  ]
 },
 {
  "en": "🔒 A current ride is active. This is a preview of the next ride; Accept / Reject will be available only after the current ride is complete.",
  "hi": "🔒 वर्तमान यात्रा सक्रिय है। यह अगली यात्रा का पूर्वावलोकन है; वर्तमान यात्रा पूरी होने के बाद ही स्वीकार / अस्वीकार उपलब्ध होगा।",
  "aliases": [
   "🔒 Current ride active hai. Ye next ride preview hai; current ride complete hone ke baad hi Accept / Reject available hoga.",
   "🔒 Current ride active hai. Ye next ride preview hai; current ride complete hone ke baad hi Accept / Reject available hoga."
  ]
 },
 {
  "en": "Could not load status.",
  "hi": "स्थिति लोड नहीं हो सकी।",
  "aliases": [
   "Status load nahi ho saka.",
   "Status load nahi ho saka."
  ]
 },
 {
  "en": "Vehicle details saved",
  "hi": "वाहन विवरण सहेज लिया गया",
  "aliases": [
   "Vehicle details save ho gayi",
   "Vehicle details save ho gayi"
  ]
 },
 {
  "en": "Vehicle details could not be saved.",
  "hi": "वाहन विवरण सहेजा नहीं जा सका।",
  "aliases": [
   "Vehicle details save nahi hui.",
   "Vehicle details save nahi hui."
  ]
 },
 {
  "en": "The file must be smaller than 5 MB.",
  "hi": "फ़ाइल 5 MB से छोटी होनी चाहिए।",
  "aliases": [
   "File 5 MB se choti honi chahiye.",
   "File 5 MB se choti honi chahiye."
  ]
 },
 {
  "en": "Document uploaded!",
  "hi": "दस्तावेज़ अपलोड हो गया!",
  "aliases": [
   "Document upload ho gaya!",
   "Document upload ho gaya!"
  ]
 },
 {
  "en": "Document not uploaded.",
  "hi": "दस्तावेज़ अपलोड नहीं हुआ।",
  "aliases": [
   "Document upload nahi hua.",
   "Document upload nahi hua."
  ]
 },
 {
  "en": "Request sent!",
  "hi": "अनुरोध भेज दिया गया!",
  "aliases": [
   "Request bhej di gayi!",
   "Request bhej di gayi!"
  ]
 },
 {
  "en": "Request not submitted.",
  "hi": "अनुरोध सबमिट नहीं हुआ।",
  "aliases": [
   "Request submit nahi hui.",
   "Request submit nahi hui."
  ]
 },
 {
  "en": "We have received all your documents. The admin is verifying them — this may take 24 to 48 hours.",
  "hi": "आपके सभी दस्तावेज़ मिल गए हैं। एडमिन सत्यापन कर रहे हैं — इसमें 24 से 48 घंटे लग सकते हैं।",
  "aliases": [
   "Aapke saare documents mil gaye hain. Admin verification kar raha hai — 24 se 48 ghante lag sakte hain.",
   "Aapke saare documents mil gaye hain. Admin verification kar raha hai — 24 se 48 ghante lag sakte hain."
  ]
 },
 {
  "en": "Your dashboard will open automatically once you are approved.",
  "hi": "स्वीकृति मिलते ही आपका डैशबोर्ड अपने आप खुल जाएगा।",
  "aliases": [
   "Approve hote hi aapka dashboard khud khul jayega.",
   "Approve hote hi aapka dashboard khud khul jayega."
  ]
 },
 {
  "en": "Refresh Status",
  "hi": "स्थिति रिफ्रेश करें",
  "aliases": [
   "Status Refresh Karo",
   "Status Refresh Karo"
  ]
 },
 {
  "en": "Request Rejected",
  "hi": "अनुरोध अस्वीकार हुआ",
  "aliases": [
   "Request Reject Hui",
   "Request Reject Hui"
  ]
 },
 {
  "en": "Verification Pending",
  "hi": "सत्यापन बाकी है",
  "aliases": [
   "Verification Baaki Hai",
   "Verification Baaki Hai"
  ]
 },
 {
  "en": "To take rides, you first need to get your documents and vehicle details verified.",
  "hi": "यात्राएँ लेने के लिए पहले अपने दस्तावेज़ और गाड़ी की जानकारी सत्यापित करवानी होगी।",
  "aliases": [
   "Rides lene ke liye pehle apne documents aur gaadi ki jaankari verify karwani hogi.",
   "Rides lene ke liye pehle apne documents aur gaadi ki jaankari verify karwani hogi."
  ]
 },
 {
  "en": "You cannot accept rides until you are approved.",
  "hi": "स्वीकृति मिलने तक आप यात्राएँ स्वीकार नहीं कर सकते।",
  "aliases": [
   "Approval milne tak aap rides accept nahi kar sakte.",
   "Approval milne tak aap rides accept nahi kar sakte."
  ]
 },
 {
  "en": "Enter the name exactly as it appears on your Aadhaar card",
  "hi": "बिल्कुल वही नाम लिखें जो आधार कार्ड पर है",
  "aliases": [
   "Bilkul wohi naam likho jo Aadhaar card par hai",
   "Bilkul wohi naam likho jo Aadhaar card par hai"
  ]
 },
 {
  "en": "✓ Verified by admin — name is locked",
  "hi": "✓ एडमिन ने सत्यापित कर दिया — नाम लॉक है",
  "aliases": [
   "✓ Admin ne verify kar diya — naam lock hai",
   "✓ Admin ne verify kar diya — naam lock hai"
  ]
 },
 {
  "en": "⚠️ Exactly the same name as on Aadhaar — the admin will verify and lock it",
  "hi": "⚠️ बिल्कुल वही नाम जो आधार पर है — एडमिन सत्यापित करके लॉक करेंगे",
  "aliases": [
   "⚠️ Exactly same naam jo Aadhaar par hai — admin verify karke lock karega",
   "⚠️ Exactly same naam jo Aadhaar par hai — admin verify karke lock karega"
  ]
 },
 {
  "en": "Name saved ✓",
  "hi": "नाम सहेज लिया गया ✓",
  "aliases": [
   "Naam save ho gaya ✓",
   "Naam save ho gaya ✓"
  ]
 },
 {
  "en": "Name not saved",
  "hi": "नाम सहेजा नहीं गया",
  "aliases": [
   "Naam save nahi hua",
   "Naam save nahi hua"
  ]
 },
 {
  "en": "Fill in vehicle details",
  "hi": "गाड़ी की जानकारी भरें",
  "aliases": [
   "Gaadi ki jaankari bharo",
   "Gaadi ki jaankari bharo"
  ]
 },
 {
  "en": "⚠️ Commercial Vehicles Only",
  "hi": "⚠️ केवल व्यावसायिक वाहन",
  "aliases": [
   "⚠️ Sirf Commercial Vehicle",
   "⚠️ Sirf Commercial Vehicle"
  ]
 },
 {
  "en": "Only yellow-plate (commercial) vehicles are allowed on HimRideG. The vehicle class on the RC must be Motor Cab / Maxi Cab / LMV-Taxi.",
  "hi": "HimRideG पर केवल पीली नंबर प्लेट (व्यावसायिक) वाली गाड़ियों की अनुमति है। RC पर वाहन श्रेणी Motor Cab / Maxi Cab / LMV-Taxi होनी चाहिए।",
  "aliases": [
   "HimRideG par sirf yellow plate (commercial) gaadi allowed hai. RC par vehicle class Motor Cab / Maxi Cab / LMV-Taxi honi chahiye.",
   "HimRideG par sirf yellow plate (commercial) gaadi allowed hai. RC par vehicle class Motor Cab / Maxi Cab / LMV-Taxi honi chahiye."
  ]
 },
 {
  "en": "Saving...",
  "hi": "सहेजा जा रहा है...",
  "aliases": [
   "Save ho raha hai...",
   "Save ho raha hai..."
  ]
 },
 {
  "en": "Save Vehicle Details",
  "hi": "वाहन विवरण सहेजें",
  "aliases": [
   "Vehicle Details Save Karo",
   "Vehicle Details Save Karo"
  ]
 },
 {
  "en": "A request will be sent to the admin once everything is complete",
  "hi": "सब पूरा होने पर एडमिन को अनुरोध भेजा जाएगा",
  "aliases": [
   "Sab complete hone par admin ko request jayegi",
   "Sab complete hone par admin ko request jayegi"
  ]
 },
 {
  "en": "These items are still pending:",
  "hi": "ये चीज़ें अभी बाकी हैं:",
  "aliases": [
   "Ye cheezein abhi baaki hain:",
   "Ye cheezein abhi baaki hain:"
  ]
 },
 {
  "en": "Send Approval Request",
  "hi": "स्वीकृति अनुरोध भेजें",
  "aliases": [
   "Approval Request Bhejo",
   "Approval Request Bhejo"
  ]
 },
 {
  "en": "Enter your full name.",
  "hi": "अपना पूरा नाम दर्ज करें।",
  "aliases": [
   "Apna full name enter karo.",
   "Apna full name enter karo."
  ]
 },
 {
  "en": "Updated user not found in the response.",
  "hi": "अपडेट किया गया उपयोगकर्ता प्रतिक्रिया में नहीं मिला।",
  "aliases": [
   "Updated user response me nahi mila.",
   "Updated user response me nahi mila."
  ]
 },
 {
  "en": "Basic info saved.",
  "hi": "मूल जानकारी सहेज ली गई।",
  "aliases": [
   "Basic info save ho gayi.",
   "Basic info save ho gayi."
  ]
 },
 {
  "en": "Basic info could not be saved.",
  "hi": "मूल जानकारी सहेजी नहीं जा सकी।",
  "aliases": [
   "Basic info save nahi ho payi.",
   "Basic info save nahi ho payi."
  ]
 },
 {
  "en": "Your Google account has been verified. No password or OTP is needed.",
  "hi": "आपका Google खाता सत्यापित हो चुका है। पासवर्ड या OTP की ज़रूरत नहीं है।",
  "aliases": [
   "Google account verify ho chuka hai. Password ya OTP ki zarurat nahi hai.",
   "Google account verify ho chuka hai. Password ya OTP ki zarurat nahi hai."
  ]
 },
 {
  "en": "Your Google account name and the mobile number entered at login have been filled in here automatically.",
  "hi": "Google खाते का नाम और लॉगिन पर दर्ज किया गया मोबाइल नंबर यहाँ अपने आप आ गया है।",
  "aliases": [
   "Google account ka name aur login par enter kiya mobile automatically yahan aa gaya hai.",
   "Google account ka name aur login par enter kiya mobile number automatically yahan aa gaya hai."
  ]
 },
 {
  "en": "Your mobile number will be saved for ride contact and account communication.",
  "hi": "मोबाइल नंबर यात्रा संपर्क और खाते से जुड़े संचार के लिए सहेजा जाएगा।",
  "aliases": [
   "Mobile number ride contact aur account communication ke liye save hoga.",
   "Mobile number ride contact aur account communication ke liye save hoga."
  ]
 },
 {
  "en": "Your name and email came from secure Google sign-in.",
  "hi": "नाम और ईमेल सुरक्षित Google साइन-इन से आए हैं।",
  "aliases": [
   "Name aur email secure Google sign-in se aaye hain.",
   "Name aur email secure Google sign-in se aaye hain."
  ]
 },
 {
  "en": "Creating a password is not mandatory for accounts that use Google login.",
  "hi": "Google लॉगिन वाले खाते के लिए पासवर्ड बनाना अनिवार्य नहीं है।",
  "aliases": [
   "Google login wale account ke liye password create karna compulsory nahi hai.",
   "Google login wale account ke liye password create karna compulsory nahi hai."
  ]
 },
 {
  "en": "Once your basic info is saved, your next login will open the dashboard directly.",
  "hi": "मूल जानकारी सहेजने के बाद अगला लॉगिन सीधे डैशबोर्ड खोलेगा।",
  "aliases": [
   "Basic info save hone ke baad next login direct dashboard kholega.",
   "Basic info save hone ke baad next login direct dashboard kholega."
  ]
 },
 {
  "en": "Password not required",
  "hi": "पासवर्ड आवश्यक नहीं है",
  "aliases": [
   "Password required nahi hai",
   "Password required nahi hai"
  ]
 },
 {
  "en": "No password field",
  "hi": "पासवर्ड फ़ील्ड नहीं है",
  "aliases": [
   "Password field nahi hai",
   "Password field nahi hai"
  ]
 },
 {
  "en": "You can continue to sign in directly with your Google account.",
  "hi": "आप आगे भी Google खाते से सीधे साइन इन कर सकते हैं।",
  "aliases": [
   "Aage bhi Google account se direct sign in kar sakte ho.",
   "Aage bhi Google account se direct sign in kar sakte ho."
  ]
 },
 {
  "en": "Sensitive saved driver payout identifiers are protected on the server and masked when shown in the interface.",
  "hi": "चालक के सहेजे गए संवेदनशील पेआउट विवरण सर्वर पर सुरक्षित रखे जाते हैं और इंटरफ़ेस में दिखाते समय छिपाए (मास्क) जाते हैं।",
  "aliases": [
   "Sensitive saved driver payout identifiers are protected on the server and masked when shown in the interface.",
   "Driver ke saved sensitive payout identifiers server par protected rehte hain aur interface me dikhate waqt masked hote hain."
  ]
 },
 {
  "en": "Where fare negotiation is enabled, the driver can send an offer, the customer can respond, and the final fare becomes locked only after the customer accepts the final amount. The accepted final fare is the amount used for the ride payment flow unless a lawful adjustment is required.",
  "hi": "जहाँ किराया मोलभाव उपलब्ध है, वहाँ चालक ऑफ़र भेज सकते हैं, ग्राहक जवाब दे सकते हैं, और अंतिम किराया ग्राहक द्वारा अंतिम राशि स्वीकार करने के बाद ही लॉक होता है। जब तक कोई वैध समायोजन आवश्यक न हो, स्वीकार किया गया अंतिम किराया ही यात्रा भुगतान के लिए उपयोग होता है।",
  "aliases": [
   "Where fare negotiation is enabled, the driver can send an offer, the customer can respond, and the final fare becomes locked only after the customer accepts the final amount. The accepted final fare is the amount used for the ride payment flow unless a lawful adjustment is required.",
   "Jahan fare negotiation enabled hai, wahan driver offer bhej sakta hai, customer respond kar sakta hai, aur final fare tabhi lock hota hai jab customer final amount accept kare. Accept kiya gaya final fare hi ride payment flow me use hota hai, jab tak koi lawful adjustment zaroori na ho."
  ]
 },
 {
  "en": "A ride may support online payment or cash according to the options shown in the product. Payment, commission, wallet and payout records may be retained for settlement, reconciliation, support and dispute handling.",
  "hi": "उत्पाद में दिखाए गए विकल्पों के अनुसार यात्रा में ऑनलाइन भुगतान या नकद की सुविधा हो सकती है। भुगतान, कमीशन, वॉलेट और पेआउट रिकॉर्ड निपटान, मिलान, सहायता और विवाद समाधान के लिए रखे जा सकते हैं।",
  "aliases": [
   "A ride may support online payment or cash according to the options shown in the product. Payment, commission, wallet and payout records may be retained for settlement, reconciliation, support and dispute handling.",
   "Product me dikhaye gaye options ke hisaab se ride me online payment ya cash support ho sakta hai. Payment, commission, wallet aur payout records settlement, reconciliation, support aur dispute handling ke liye rakhe ja sakte hain."
  ]
 },
 {
  "en": "A ride may be cancelled through the options shown in the customer or driver flow. The applicable ride state, accepted fare, driver assignment and any payment already made are considered before the cancellation is finalised.",
  "hi": "ग्राहक या चालक फ़्लो में दिखाए गए विकल्पों से यात्रा रद्द की जा सकती है। रद्दीकरण अंतिम करने से पहले यात्रा की स्थिति, स्वीकार किया गया किराया, चालक असाइनमेंट और पहले से किया गया कोई भी भुगतान ध्यान में रखा जाता है।",
  "aliases": [
   "A ride may be cancelled through the options shown in the customer or driver flow. The applicable ride state, accepted fare, driver assignment and any payment already made are considered before the cancellation is finalised.",
   "Customer ya driver flow me dikhaye gaye options se ride cancel ki ja sakti hai. Cancellation final karne se pehle ride state, accepted fare, driver assignment aur pehle se kiya gaya koi bhi payment dekha jata hai."
  ]
 },
 {
  "en": "A payment that is not verified as successful is not treated as a completed payment. If money is debited but HimRideG does not receive a verified success confirmation, the transaction is reconciled using the payment provider status before any duplicate collection or refund decision is made.",
  "hi": "जो भुगतान सफल के रूप में सत्यापित नहीं है, उसे पूरा भुगतान नहीं माना जाता। यदि पैसे कट गए हैं लेकिन HimRideG को सत्यापित सफलता की पुष्टि नहीं मिलती, तो दोबारा वसूली या रिफ़ंड का निर्णय लेने से पहले भुगतान प्रदाता की स्थिति से लेनदेन का मिलान किया जाता है।",
  "aliases": [
   "A payment that is not verified as successful is not treated as a completed payment. If money is debited but HimRideG does not receive a verified success confirmation, the transaction is reconciled using the payment provider status before any duplicate collection or refund decision is made.",
   "Jo payment successful verify nahi hua, use completed payment nahi mana jata. Agar paise debit ho gaye lekin HimRideG ko verified success confirmation nahi mila, to duplicate collection ya refund ka decision lene se pehle payment provider status se transaction reconcile kiya jata hai."
  ]
 },
 {
  "en": "Where an online payment is eligible for refund, the refund is sent through the original or otherwise supported payment channel after verification. Bank or payment-provider processing time can vary after a refund has been initiated.",
  "hi": "जहाँ ऑनलाइन भुगतान रिफ़ंड के योग्य है, वहाँ सत्यापन के बाद रिफ़ंड मूल या किसी अन्य समर्थित भुगतान माध्यम से भेजा जाता है। रिफ़ंड शुरू होने के बाद बैंक या भुगतान प्रदाता का प्रोसेसिंग समय अलग-अलग हो सकता है।",
  "aliases": [
   "Where an online payment is eligible for refund, the refund is sent through the original or otherwise supported payment channel after verification. Bank or payment-provider processing time can vary after a refund has been initiated.",
   "Jahan online payment refund ke liye eligible hai, wahan verification ke baad refund original ya kisi aur supported payment channel se bheja jata hai. Refund initiate hone ke baad bank ya payment provider ka processing time alag ho sakta hai."
  ]
 },
 {
  "en": "Cash payments are confirmed within the ride flow. A cash-payment dispute should be raised through Help/Support with the ride details so it can be reviewed against the recorded ride and payment status.",
  "hi": "नकद भुगतान की पुष्टि यात्रा फ़्लो के भीतर होती है। नकद भुगतान से जुड़ा विवाद यात्रा विवरण के साथ Help/Support के माध्यम से उठाएँ, ताकि दर्ज यात्रा और भुगतान स्थिति के आधार पर उसकी समीक्षा की जा सके।",
  "aliases": [
   "Cash payments are confirmed within the ride flow. A cash-payment dispute should be raised through Help/Support with the ride details so it can be reviewed against the recorded ride and payment status.",
   "Cash payments ride flow ke andar hi confirm hote hain. Cash-payment dispute ride details ke saath Help/Support se raise karo, taaki recorded ride aur payment status ke against review ho sake."
  ]
 },
 {
  "en": "If the same ride appears to have been charged more than once, raise a support request with the ride and transaction reference. HimRideG will verify provider records before arranging any eligible correction.",
  "hi": "यदि एक ही यात्रा का भुगतान एक से अधिक बार कटा हुआ लगे, तो यात्रा और लेनदेन संदर्भ के साथ सहायता अनुरोध भेजें। HimRideG किसी भी योग्य सुधार की व्यवस्था करने से पहले प्रदाता के रिकॉर्ड सत्यापित करेगा।",
  "aliases": [
   "If the same ride appears to have been charged more than once, raise a support request with the ride and transaction reference. HimRideG will verify provider records before arranging any eligible correction.",
   "Agar ek hi ride ka charge ek se zyada baar laga lage, to ride aur transaction reference ke saath support request raise karo. HimRideG koi bhi eligible correction karne se pehle provider records verify karega."
  ]
 },
 {
  "en": "Check the driver and vehicle details shown for your booking before starting the ride. Drivers should confirm the correct customer and pickup before proceeding.",
  "hi": "यात्रा शुरू करने से पहले अपनी बुकिंग के लिए दिखाए गए चालक और वाहन विवरण जाँच लें। चालक आगे बढ़ने से पहले सही ग्राहक और पिकअप की पुष्टि करें।",
  "aliases": [
   "Check the driver and vehicle details shown for your booking before starting the ride. Drivers should confirm the correct customer and pickup before proceeding.",
   "Ride start karne se pehle apni booking ke liye dikhaye gaye driver aur vehicle details check karo. Drivers aage badhne se pehle sahi customer aur pickup confirm karein."
  ]
 },
 {
  "en": "Use the Safety or Help area in HimRideG to report a ride, driver, customer or payment-related safety concern. Provide the ride reference and relevant details so the event can be reviewed.",
  "hi": "यात्रा, चालक, ग्राहक या भुगतान से जुड़ी किसी सुरक्षा चिंता की रिपोर्ट करने के लिए HimRideG में Safety या Help सेक्शन का उपयोग करें। यात्रा संदर्भ और संबंधित विवरण दें ताकि घटना की समीक्षा की जा सके।",
  "aliases": [
   "Use the Safety or Help area in HimRideG to report a ride, driver, customer or payment-related safety concern. Provide the ride reference and relevant details so the event can be reviewed.",
   "Ride, driver, customer ya payment se judi safety concern report karne ke liye HimRideG me Safety ya Help area use karo. Ride reference aur relevant details do taaki event review ho sake."
  ]
 },
 {
  "en": "The public home experience supports English and Hindi content. Device and browser text-size or zoom controls can be used to enlarge the interface, and responsive layouts are designed to adapt across mobile and desktop screens.",
  "hi": "सार्वजनिक होम पेज अंग्रेज़ी और हिंदी सामग्री को सपोर्ट करता है। इंटरफ़ेस बड़ा करने के लिए डिवाइस और ब्राउज़र के टेक्स्ट-साइज़ या ज़ूम नियंत्रणों का उपयोग किया जा सकता है, और रिस्पॉन्सिव लेआउट मोबाइल व डेस्कटॉप स्क्रीन के अनुसार ढलने के लिए बनाए गए हैं।",
  "aliases": [
   "The public home experience supports English and Hindi content. Device and browser text-size or zoom controls can be used to enlarge the interface, and responsive layouts are designed to adapt across mobile and desktop screens.",
   "Public home experience English aur Hindi content support karta hai. Interface bada karne ke liye device aur browser ke text-size ya zoom controls use kar sakte ho, aur responsive layouts mobile aur desktop screens par adjust hone ke liye design kiye gaye hain."
  ]
 },
 {
  "en": "If an accessibility issue prevents you from using an important HimRideG feature, contact HimRideG support and describe the screen, device and action that is difficult to use so the issue can be reviewed.",
  "hi": "यदि किसी सुगम्यता समस्या के कारण आप HimRideG की कोई महत्वपूर्ण सुविधा उपयोग नहीं कर पा रहे हैं, तो HimRideG सहायता से संपर्क करें और वह स्क्रीन, डिवाइस और कार्य बताएँ जिसे उपयोग करना कठिन है, ताकि समस्या की समीक्षा की जा सके।",
  "aliases": [
   "If an accessibility issue prevents you from using an important HimRideG feature, contact HimRideG support and describe the screen, device and action that is difficult to use so the issue can be reviewed.",
   "Agar kisi accessibility issue ki wajah se aap HimRideG ka koi important feature use nahi kar pa rahe, to HimRideG support se contact karo aur batao kaunsi screen, device aur action use karna mushkil hai, taaki issue review ho sake."
  ]
 },
 {
  "en": "For a failed, pending or duplicate online payment, keep the ride and transaction reference available. Do not repeat a payment solely because a screen is delayed; first check the ride payment status.",
  "hi": "असफल, लंबित या दोहरे ऑनलाइन भुगतान के लिए यात्रा और लेनदेन संदर्भ उपलब्ध रखें। केवल स्क्रीन में देरी होने के कारण भुगतान दोबारा न करें; पहले यात्रा भुगतान की स्थिति जाँचें।",
  "aliases": [
   "For a failed, pending or duplicate online payment, keep the ride and transaction reference available. Do not repeat a payment solely because a screen is delayed; first check the ride payment status.",
   "Failed, pending ya duplicate online payment ke liye ride aur transaction reference ready rakho. Sirf screen delay hone ki wajah se payment dobara mat karo; pehle ride payment status check karo."
  ]
 },
 {
  "en": "Use the Help/Support section inside HimRideG and include the relevant ride reference, transaction reference or account context. This keeps the request linked to the correct service record.",
  "hi": "HimRideG के अंदर Help/Support सेक्शन का उपयोग करें और संबंधित यात्रा संदर्भ, लेनदेन संदर्भ या खाते की जानकारी शामिल करें। इससे अनुरोध सही सेवा रिकॉर्ड से जुड़ा रहता है।",
  "aliases": [
   "Use the Help/Support section inside HimRideG and include the relevant ride reference, transaction reference or account context. This keeps the request linked to the correct service record.",
   "HimRideG ke andar Help/Support section use karo aur relevant ride reference, transaction reference ya account context add karo. Isse request sahi service record se linked rehti hai."
  ]
 },
 {
  "en": "For payment or payout issues, include the ride or withdrawal reference and the approximate transaction time. Never send passwords, OTPs, card PINs or UPI PINs to support.",
  "hi": "भुगतान या पेआउट समस्याओं के लिए यात्रा या निकासी संदर्भ और लेनदेन का अनुमानित समय शामिल करें। सहायता टीम को कभी भी पासवर्ड, OTP, कार्ड PIN या UPI PIN न भेजें।",
  "aliases": [
   "For payment or payout issues, include the ride or withdrawal reference and the approximate transaction time. Never send passwords, OTPs, card PINs or UPI PINs to support.",
   "Payment ya payout issues ke liye ride ya withdrawal reference aur approx transaction time add karo. Support ko kabhi bhi password, OTP, card PIN ya UPI PIN mat bhejo."
  ]
 },
 {
  "en": "HimRideG will publish its verified public business/grievance contact details on this page once the final business profile is confirmed. Until then, use the authenticated Help/Support flow so requests are tied to the correct account and ride.",
  "hi": "अंतिम व्यावसायिक प्रोफ़ाइल की पुष्टि होने पर HimRideG इस पेज पर अपने सत्यापित सार्वजनिक व्यवसाय/शिकायत संपर्क विवरण प्रकाशित करेगा। तब तक लॉगिन के बाद Help/Support फ़्लो का उपयोग करें ताकि अनुरोध सही खाते और यात्रा से जुड़े रहें।",
  "aliases": [
   "HimRideG will publish its verified public business/grievance contact details on this page once the final business profile is confirmed. Until then, use the authenticated Help/Support flow so requests are tied to the correct account and ride.",
   "Final business profile confirm hone par HimRideG is page par apne verified public business/grievance contact details publish karega. Tab tak authenticated Help/Support flow use karo taaki requests sahi account aur ride se jude rahein."
  ]
 },
 {
  "en": "Additional business booking, reporting and partner features may be introduced as the network expands. Features are shown as available only when they are enabled in the live product.",
  "hi": "नेटवर्क के विस्तार के साथ अतिरिक्त व्यावसायिक बुकिंग, रिपोर्टिंग और पार्टनर सुविधाएँ शुरू की जा सकती हैं। सुविधाएँ केवल तभी उपलब्ध दिखाई जाती हैं जब वे लाइव उत्पाद में सक्षम हों।",
  "aliases": [
   "Additional business booking, reporting and partner features may be introduced as the network expands. Features are shown as available only when they are enabled in the live product.",
   "Network expand hone ke saath extra business booking, reporting aur partner features aa sakte hain. Features tabhi available dikhaye jaate hain jab wo live product me enable hon."
  ]
 },
 {
  "en": "new ride",
  "hi": "नई यात्रा",
  "aliases": [
   "nayi ride",
   "nayi ride"
  ]
 },
 {
  "en": "driver is on the way",
  "hi": "चालक आ रहे हैं",
  "aliases": [
   "driver aa raha",
   "driver aa raha hai"
  ]
 },
 {
  "en": "HimRideG",
  "hi": "HimRideG",
  "aliases": [
   "HimRideG",
   "HimRideG"
  ]
 },
 {
  "en": "Select a valid future schedule date/time",
  "hi": "मान्य भविष्य की शेड्यूल तिथि/समय चुनें",
  "aliases": [
   "Valid future schedule date/time select karo",
   "Valid future schedule date/time select karo"
  ]
 },
 {
  "en": "logout request failed",
  "hi": "लॉगआउट अनुरोध विफल रहा",
  "aliases": [
   "logout request failed",
   "logout request fail ho gaya"
  ]
 },
 {
  "en": "📍 Live location active",
  "hi": "📍 लाइव स्थान सक्रिय",
  "aliases": [
   "📍 Live location active",
   "📍 Live location active hai"
  ]
 },
 {
  "en": "Your browser does not support location.",
  "hi": "आपका ब्राउज़र स्थान सुविधा का समर्थन नहीं करता।",
  "aliases": [
   "Browser location support nahi karta.",
   "Browser location support nahi karta."
  ]
 },
 {
  "en": "Allow driver location permission.",
  "hi": "चालक स्थान की अनुमति दें।",
  "aliases": [
   "Driver location permission allow karo.",
   "Driver location permission allow karo."
  ]
 },
 {
  "en": "Could not get current location.",
  "hi": "वर्तमान स्थान नहीं मिल सका।",
  "aliases": [
   "Current location nahi mil paayi.",
   "Current location nahi mil paayi."
  ]
 },
 {
  "en": "Selected Ride Route",
  "hi": "चयनित यात्रा मार्ग",
  "aliases": [
   "Selected Ride Route",
   "Selected Ride Route"
  ]
 },
 {
  "en": "● Live",
  "hi": "● लाइव",
  "aliases": [
   "● Live",
   "● Live"
  ]
 },
 {
  "en": "Calculating...",
  "hi": "गणना हो रही है...",
  "aliases": [
   "Calculating...",
   "Calculate ho raha hai..."
  ]
 },
 {
  "en": "Trip time",
  "hi": "यात्रा समय",
  "aliases": [
   "Trip time",
   "Trip time"
  ]
 },
 {
  "en": "Navigate to Pickup",
  "hi": "पिकअप तक नेविगेट करें",
  "aliases": [
   "Navigate to Pickup",
   "Pickup tak navigate karo"
  ]
 },
 {
  "en": "View Full Trip",
  "hi": "पूरी यात्रा देखें",
  "aliases": [
   "View Full Trip",
   "Poori trip dekho"
  ]
 },
 {
  "en": "DRIVER LOCATION",
  "hi": "चालक का स्थान",
  "aliases": [
   "DRIVER LOCATION",
   "DRIVER LOCATION"
  ]
 },
 {
  "en": "km •",
  "hi": "किमी •",
  "aliases": [
   "km •",
   "km •"
  ]
 },
 {
  "en": "Driver Live",
  "hi": "चालक लाइव",
  "aliases": [
   "Driver Live",
   "Driver Live"
  ]
 },
 {
  "en": "Mini / Hatchback",
  "hi": "मिनी / हैचबैक",
  "aliases": [
   "Mini / Hatchback",
   "Mini / Hatchback"
  ]
 },
 {
  "en": "Sedan",
  "hi": "सेडान",
  "aliases": [
   "Sedan",
   "Sedan"
  ]
 },
 {
  "en": "Traveller",
  "hi": "ट्रैवलर",
  "aliases": [
   "Traveller",
   "Traveller"
  ]
 },
 {
  "en": "◎ Getting My Location…",
  "hi": "◎ मेरा स्थान प्राप्त हो रहा है…",
  "aliases": [
   "◎ Getting My Location…",
   "◎ Meri location mil rahi hai…"
  ]
 },
 {
  "en": "Could not get my location",
  "hi": "मेरा स्थान नहीं मिल सका",
  "aliases": [
   "My Location nahi mil saki",
   "Meri location nahi mil saki"
  ]
 },
 {
  "en": "Plan your journey",
  "hi": "अपनी यात्रा की योजना बनाएं",
  "aliases": [
   "Plan your journey",
   "Apni journey plan karo"
  ]
 },
 {
  "en": "Close booking",
  "hi": "बुकिंग बंद करें",
  "aliases": [
   "Close booking",
   "Booking band karo"
  ]
 },
 {
  "en": "Pickup Now",
  "hi": "अभी पिकअप",
  "aliases": [
   "Pickup Now",
   "Abhi Pickup"
  ]
 },
 {
  "en": "Ride for",
  "hi": "यात्रा किसके लिए",
  "aliases": [
   "Ride for",
   "Ride kiske liye"
  ]
 },
 {
  "en": "For me",
  "hi": "मेरे लिए",
  "aliases": [
   "For me",
   "Mere liye"
  ]
 },
 {
  "en": "Someone else",
  "hi": "किसी और के लिए",
  "aliases": [
   "Someone else",
   "Kisi aur ke liye"
  ]
 },
 {
  "en": "Schedule Date &amp; Time",
  "hi": "शेड्यूल तिथि और समय",
  "aliases": [
   "Schedule Date &amp; Time",
   "Schedule Date &amp; Time"
  ]
 },
 {
  "en": "Online Preferred",
  "hi": "ऑनलाइन भुगतान पसंदीदा",
  "aliases": [
   "Online Preferred",
   "Online Preferred"
  ]
 },
 {
  "en": "Schedule Payment",
  "hi": "शेड्यूल भुगतान",
  "aliases": [
   "Schedule Payment",
   "Schedule Payment"
  ]
 },
 {
  "en": "Note",
  "hi": "टिप्पणी",
  "aliases": [
   "Note",
   "Note"
  ]
 },
 {
  "en": "Landmark, luggage, special instructions...",
  "hi": "लैंडमार्क, सामान, विशेष निर्देश...",
  "aliases": [
   "Landmark, luggage, special instructions...",
   "Landmark, luggage, special instructions..."
  ]
 },
 {
  "en": "Est. Time",
  "hi": "अनुमानित समय",
  "aliases": [
   "Est. Time",
   "Est. Time"
  ]
 },
 {
  "en": "Driver will offer",
  "hi": "चालक प्रस्ताव देगा",
  "aliases": [
   "Driver offer karega",
   "Driver offer karega"
  ]
 },
 {
  "en": "Active ride already exists",
  "hi": "सक्रिय यात्रा पहले से मौजूद है",
  "aliases": [
   "Active ride already exists",
   "Active ride pehle se hai"
  ]
 },
 {
  "en": "HimRideG: https://www.himrideg.com",
  "hi": "HimRideG: https://www.himrideg.com",
  "aliases": [
   "HimRideG: https://www.himrideg.com",
   "HimRideG: https://www.himrideg.com"
  ]
 },
 {
  "en": "HIMRIDEG SAFETY",
  "hi": "HimRideG सुरक्षा",
  "aliases": [
   "HIMRIDEG SAFETY",
   "HIMRIDEG SAFETY"
  ]
 },
 {
  "en": "Your safety toolkit",
  "hi": "आपकी सुरक्षा टूलकिट",
  "aliases": [
   "Your safety toolkit",
   "Aapka safety toolkit"
  ]
 },
 {
  "en": "Verified taxi only",
  "hi": "केवल सत्यापित टैक्सी",
  "aliases": [
   "Verified taxi only",
   "Sirf verified taxi"
  ]
 },
 {
  "en": "Commercial vehicle documents and driver approval before going online.",
  "hi": "ऑनलाइन होने से पहले व्यावसायिक वाहन दस्तावेज़ और चालक की स्वीकृति।",
  "aliases": [
   "Commercial vehicle documents and driver approval before going online.",
   "Online hone se pehle commercial vehicle documents aur driver approval."
  ]
 },
 {
  "en": "Ride start OTP",
  "hi": "यात्रा प्रारंभ OTP",
  "aliases": [
   "Ride start OTP",
   "Ride start OTP"
  ]
 },
 {
  "en": "Pickup, destination and driver location on one live map.",
  "hi": "पिकअप, गंतव्य और चालक का स्थान एक लाइव नक्शे पर।",
  "aliases": [
   "Pickup, destination aur driver location ek live map par.",
   "Pickup, destination aur driver location ek live map par."
  ]
 },
 {
  "en": "Emergency access",
  "hi": "आपातकालीन सहायता",
  "aliases": [
   "Emergency access",
   "Emergency access"
  ]
 },
 {
  "en": "Emergency 112",
  "hi": "आपातकाल 112",
  "aliases": [
   "Emergency 112",
   "Emergency 112"
  ]
 },
 {
  "en": "Share Active Ride",
  "hi": "सक्रिय यात्रा साझा करें",
  "aliases": [
   "Share Active Ride",
   "Active Ride share karo"
  ]
 },
 {
  "en": "Trusted contacts",
  "hi": "विश्वसनीय संपर्क",
  "aliases": [
   "Trusted contacts",
   "Trusted contacts"
  ]
 },
 {
  "en": "Up to 5 contacts are saved privately on this device/browser.",
  "hi": "अधिकतम 5 संपर्क इस डिवाइस/ब्राउज़र पर निजी रूप से सहेजे जाते हैं।",
  "aliases": [
   "Up to 5 contacts is device/browser par privately save hote hain.",
   "Up to 5 contacts is device/browser par privately save hote hain."
  ]
 },
 {
  "en": "Trusted Contact Name",
  "hi": "विश्वसनीय संपर्क का नाम",
  "aliases": [
   "Trusted Contact Name",
   "Trusted Contact ka naam"
  ]
 },
 {
  "en": "Family / friend",
  "hi": "परिवार / मित्र",
  "aliases": [
   "Family / friend",
   "Family / friend"
  ]
 },
 {
  "en": "Save Trusted Contact",
  "hi": "विश्वसनीय संपर्क सहेजें",
  "aliases": [
   "Save Trusted Contact",
   "Trusted Contact save karo"
  ]
 },
 {
  "en": "Safety rule",
  "hi": "सुरक्षा नियम",
  "aliases": [
   "Safety rule",
   "Safety rule"
  ]
 },
 {
  "en": "Open UPI App · Pay",
  "hi": "UPI ऐप खोलें · भुगतान करें",
  "aliases": [
   "Open UPI App · Pay",
   "UPI App kholo · Pay karo"
  ]
 },
 {
  "en": "Driver earnings and platform fee",
  "hi": "चालक की कमाई और प्लेटफ़ॉर्म शुल्क",
  "aliases": [
   "Driver earnings and platform fee",
   "Driver earnings aur platform fee"
  ]
 },
 {
  "en": "Earnings &amp; Platform Fee",
  "hi": "कमाई और प्लेटफ़ॉर्म शुल्क",
  "aliases": [
   "Earnings &amp; Platform Fee",
   "Earnings &amp; Platform Fee"
  ]
 },
 {
  "en": "Rides Active",
  "hi": "यात्राएं सक्रिय",
  "aliases": [
   "Rides Active",
   "Rides Active"
  ]
 },
 {
  "en": "Test mode is active. Platform fee blocking will not apply when accepting new rides. Once testing is complete, ask the admin to disable Test Mode.",
  "hi": "टेस्ट मोड सक्रिय है। नई यात्राएं स्वीकार करते समय प्लेटफ़ॉर्म शुल्क की रोक लागू नहीं होगी। परीक्षण पूरा होने पर एडमिन से टेस्ट मोड बंद करने को कहें।",
  "aliases": [
   "Test mode is active. Platform fee blocking will not apply when accepting new rides. Once testing is complete, ask the admin to disable Test Mode.",
   "Test mode active hai. Nayi rides accept karte waqt platform fee blocking apply nahi hogi. Testing complete hone par admin se Test Mode band karne ko bolo."
  ]
 },
 {
  "en": "Pay your outstanding platform fee before accepting a new ride. New rides are blocked when the outstanding fee reaches ₹100 or more.",
  "hi": "नई यात्रा स्वीकार करने से पहले अपना बकाया प्लेटफ़ॉर्म शुल्क भुगतान करें। बकाया शुल्क ₹100 या अधिक होने पर नई यात्राएं रोक दी जाती हैं।",
  "aliases": [
   "Pay your outstanding platform fee before accepting a new ride. New rides are blocked when the outstanding fee reaches ₹100 or more.",
   "Nayi ride accept karne se pehle apni pending platform fee pay karo. Pending fee ₹100 ya usse zyada hone par nayi rides block ho jaati hain."
  ]
 },
 {
  "en": "Your outstanding platform fee is below ₹100, so you can continue accepting new rides. Pay it on time to avoid interruptions.",
  "hi": "आपका बकाया प्लेटफ़ॉर्म शुल्क ₹100 से कम है, इसलिए आप नई यात्राएं स्वीकार करना जारी रख सकते हैं। रुकावट से बचने के लिए समय पर भुगतान करें।",
  "aliases": [
   "Your outstanding platform fee is below ₹100, so you can continue accepting new rides. Pay it on time to avoid interruptions.",
   "Aapki pending platform fee ₹100 se kam hai, isliye aap nayi rides accept karte reh sakte ho. Rukawat se bachne ke liye time par pay karo."
  ]
 },
 {
  "en": "Your platform fee is fully cleared. You can accept new rides.",
  "hi": "आपका प्लेटफ़ॉर्म शुल्क पूरी तरह चुका दिया गया है। आप नई यात्राएं स्वीकार कर सकते हैं।",
  "aliases": [
   "Your platform fee is fully cleared. You can accept new rides.",
   "Aapki platform fee poori clear ho gayi hai. Aap nayi rides accept kar sakte ho."
  ]
 },
 {
  "en": "Pay Platform Fee ₹",
  "hi": "प्लेटफ़ॉर्म शुल्क भुगतान करें ₹",
  "aliases": [
   "Pay Platform Fee ₹",
   "Platform Fee Pay karo ₹"
  ]
 },
 {
  "en": "Saved UPI",
  "hi": "सहेजा गया UPI",
  "aliases": [
   "Saved UPI",
   "Saved UPI"
  ]
 },
 {
  "en": "% platform fee. The driver keeps",
  "hi": "% प्लेटफ़ॉर्म शुल्क। चालक को मिलता है",
  "aliases": [
   "% platform fee. The driver keeps",
   "% platform fee. Driver ko milta hai"
  ]
 },
 {
  "en": "%. Once RazorpayX is enabled, automatic payouts will be sent to this selected primary account.",
  "hi": "%। RazorpayX सक्षम होने पर स्वचालित भुगतान इस चयनित प्राथमिक खाते में भेजे जाएंगे।",
  "aliases": [
   "%. Once RazorpayX is enabled, automatic payouts will be sent to this selected primary account.",
   "%. RazorpayX enable hone ke baad automatic payouts is selected primary account mein bheje jaayenge."
  ]
 },
 {
  "en": "Payment Status",
  "hi": "भुगतान स्थिति",
  "aliases": [
   "Payment Status",
   "Payment Status"
  ]
 },
 {
  "en": "Advance Received:",
  "hi": "प्राप्त अग्रिम:",
  "aliases": [
   "Advance Received:",
   "Advance mila:"
  ]
 },
 {
  "en": "Remaining:",
  "hi": "शेष:",
  "aliases": [
   "Remaining:",
   "Baaki:"
  ]
 },
 {
  "en": "OPTIONAL ADVANCE",
  "hi": "वैकल्पिक अग्रिम",
  "aliases": [
   "OPTIONAL ADVANCE",
   "OPTIONAL ADVANCE"
  ]
 },
 {
  "en": "Request Advance Before Ride Start",
  "hi": "यात्रा शुरू होने से पहले अग्रिम का अनुरोध करें",
  "aliases": [
   "Request Advance Before Ride Start",
   "Ride start se pehle Advance request karo"
  ]
 },
 {
  "en": "Sending…",
  "hi": "भेजा जा रहा है…",
  "aliases": [
   "Sending…",
   "Bhej rahe hain…"
  ]
 },
 {
  "en": "Request Advance",
  "hi": "अग्रिम का अनुरोध करें",
  "aliases": [
   "Request Advance",
   "Advance request karo"
  ]
 },
 {
  "en": "CUSTOMER CHOSE PAY LATER",
  "hi": "ग्राहक ने बाद में भुगतान चुना",
  "aliases": [
   "CUSTOMER CHOSE PAY LATER",
   "CUSTOMER NE PAY LATER CHOOSE KIYA"
  ]
 },
 {
  "en": "Advance skipped",
  "hi": "अग्रिम छोड़ा गया",
  "aliases": [
   "Advance skipped",
   "Advance skip kiya gaya"
  ]
 },
 {
  "en": "ADVANCE REQUEST SENT",
  "hi": "अग्रिम अनुरोध भेजा गया",
  "aliases": [
   "ADVANCE REQUEST SENT",
   "ADVANCE REQUEST BHEJ DIYA"
  ]
 },
 {
  "en": "The customer will choose Pay Online or Pay Later.",
  "hi": "ग्राहक ऑनलाइन भुगतान या बाद में भुगतान चुनेगा।",
  "aliases": [
   "Customer Pay Online ya Pay Later choose karega.",
   "Customer Pay Online ya Pay Later choose karega."
  ]
 },
 {
  "en": "ADVANCE RECEIVED",
  "hi": "अग्रिम प्राप्त हुआ",
  "aliases": [
   "ADVANCE RECEIVED",
   "ADVANCE MIL GAYA"
  ]
 },
 {
  "en": "Customer payment pending",
  "hi": "ग्राहक का भुगतान लंबित",
  "aliases": [
   "Customer payment pending",
   "Customer payment pending"
  ]
 },
 {
  "en": "ONLINE PAYMENT VERIFIED",
  "hi": "ऑनलाइन भुगतान सत्यापित",
  "aliases": [
   "ONLINE PAYMENT VERIFIED",
   "ONLINE PAYMENT VERIFIED"
  ]
 },
 {
  "en": "✅ Confirm Payment Received",
  "hi": "✅ भुगतान प्राप्ति की पुष्टि करें",
  "aliases": [
   "✅ Confirm Payment Received",
   "✅ Payment milne ka confirm karo"
  ]
 },
 {
  "en": "Receive",
  "hi": "प्राप्त करें",
  "aliases": [
   "Receive",
   "Receive"
  ]
 },
 {
  "en": "Payment fully received",
  "hi": "भुगतान पूरा प्राप्त हुआ",
  "aliases": [
   "Payment fully received",
   "Payment poora mil gaya"
  ]
 },
 {
  "en": "Confirm only after receiving cash",
  "hi": "नकद प्राप्त करने के बाद ही पुष्टि करें",
  "aliases": [
   "Confirm only after receiving cash",
   "Cash milne ke baad hi confirm karo"
  ]
 },
 {
  "en": "UPI and Payment Settings",
  "hi": "UPI और भुगतान सेटिंग्स",
  "aliases": [
   "UPI and Payment Settings",
   "UPI aur Payment Settings"
  ]
 },
 {
  "en": "Close payment settings",
  "hi": "भुगतान सेटिंग्स बंद करें",
  "aliases": [
   "Close payment settings",
   "Payment settings band karo"
  ]
 },
 {
  "en": "Google Pay",
  "hi": "Google Pay",
  "aliases": [
   "Google Pay",
   "Google Pay"
  ]
 },
 {
  "en": "PhonePe",
  "hi": "PhonePe",
  "aliases": [
   "PhonePe",
   "PhonePe"
  ]
 },
 {
  "en": "Paytm",
  "hi": "Paytm",
  "aliases": [
   "Paytm",
   "Paytm"
  ]
 },
 {
  "en": "Invalid date",
  "hi": "अमान्य तिथि",
  "aliases": [
   "Invalid date",
   "Invalid date"
  ]
 },
 {
  "en": "High",
  "hi": "उच्च",
  "aliases": [
   "High",
   "High"
  ]
 },
 {
  "en": "Medium",
  "hi": "मध्यम",
  "aliases": [
   "Medium",
   "Medium"
  ]
 },
 {
  "en": "Low",
  "hi": "निम्न",
  "aliases": [
   "Low",
   "Low"
  ]
 },
 {
  "en": "ACCOUNT STATUS",
  "hi": "खाता स्थिति",
  "aliases": [
   "ACCOUNT STATUS",
   "ACCOUNT STATUS"
  ]
 },
 {
  "en": "Refreshing...",
  "hi": "रीफ़्रेश हो रहा है...",
  "aliases": [
   "Refreshing...",
   "Refresh ho raha hai..."
  ]
 },
 {
  "en": "ADMIN WARNINGS",
  "hi": "एडमिन चेतावनियां",
  "aliases": [
   "ADMIN WARNINGS",
   "ADMIN WARNINGS"
  ]
 },
 {
  "en": "Warnings & Messages",
  "hi": "चेतावनियां और संदेश",
  "aliases": [
   "Warnings & Messages",
   "Warnings & Messages"
  ]
 },
 {
  "en": "Acknowledged",
  "hi": "स्वीकार किया गया",
  "aliases": [
   "Acknowledged",
   "Acknowledged"
  ]
 },
 {
  "en": "Action Required",
  "hi": "आवश्यक कार्रवाई",
  "aliases": [
   "Action Required",
   "Action Required"
  ]
 },
 {
  "en": "⚠ Admin Warning",
  "hi": "⚠ एडमिन चेतावनी",
  "aliases": [
   "⚠ Admin Warning",
   "⚠ Admin Warning"
  ]
 },
 {
  "en": "Reason",
  "hi": "कारण",
  "aliases": [
   "Reason",
   "Reason"
  ]
 },
 {
  "en": "Acknowledged on",
  "hi": "स्वीकार किया गया",
  "aliases": [
   "Acknowledged on",
   "Acknowledge kiya"
  ]
 },
 {
  "en": "Your reply",
  "hi": "आपका उत्तर",
  "aliases": [
   "Your reply",
   "Aapka reply"
  ]
 },
 {
  "en": "Sent on",
  "hi": "भेजा गया",
  "aliases": [
   "Sent on",
   "Bheja gaya"
  ]
 },
 {
  "en": "Reply to Admin",
  "hi": "एडमिन को उत्तर दें",
  "aliases": [
   "Reply to Admin",
   "Admin ko reply karo"
  ]
 },
 {
  "en": "Sending...",
  "hi": "भेजा जा रहा है...",
  "aliases": [
   "Sending...",
   "Bhej rahe hain..."
  ]
 },
 {
  "en": "Send Reply",
  "hi": "उत्तर भेजें",
  "aliases": [
   "Send Reply",
   "Reply bhejo"
  ]
 },
 {
  "en": "I Understand",
  "hi": "मैं समझ गया",
  "aliases": [
   "I Understand",
   "Samajh gaya"
  ]
 },
 {
  "en": "Edit Reply",
  "hi": "उत्तर संपादित करें",
  "aliases": [
   "Edit Reply",
   "Reply edit karo"
  ]
 },
 {
  "en": "Business",
  "hi": "व्यवसाय",
  "aliases": [
   "Business",
   "Business"
  ]
 },
 {
  "en": "Driver Login",
  "hi": "चालक लॉगिन",
  "aliases": [
   "Driver Login",
   "Driver Login"
  ]
 },
 {
  "en": "Cancellation & Refund",
  "hi": "रद्दीकरण और धनवापसी",
  "aliases": [
   "Cancellation & Refund",
   "Cancellation & Refund"
  ]
 },
 {
  "en": "Privacy",
  "hi": "गोपनीयता",
  "aliases": [
   "Privacy",
   "Privacy"
  ]
 },
 {
  "en": "Terms",
  "hi": "नियम व शर्तें",
  "aliases": [
   "Terms",
   "Terms"
  ]
 },
 {
  "en": "Your response",
  "hi": "आपका जवाब",
  "aliases": [
   "Your response",
   "Aapka response"
  ]
 },
 {
  "en": "Auto cancelling…",
  "hi": "स्वतः रद्द हो रहा है…",
  "aliases": [
   "Auto cancelling…",
   "Auto cancel ho raha hai…"
  ]
 },
 {
  "en": "UPI payment sent · Driver verification pending",
  "hi": "UPI भुगतान भेजा गया · चालक सत्यापन लंबित",
  "aliases": [
   "UPI payment sent · Driver verification pending",
   "UPI payment bhej diya · Driver verification pending"
  ]
 },
 {
  "en": "Cash selected",
  "hi": "नकद चुना गया",
  "aliases": [
   "Cash selected",
   "Cash select kiya"
  ]
 },
 {
  "en": "Payment Done",
  "hi": "भुगतान हो गया",
  "aliases": [
   "Payment Done",
   "Payment ho gaya"
  ]
 },
 {
  "en": "Opening…",
  "hi": "खुल रहा है…",
  "aliases": [
   "Opening…",
   "Khul raha hai…"
  ]
 },
 {
  "en": "Selecting…",
  "hi": "चुना जा रहा है…",
  "aliases": [
   "Selecting…",
   "Select ho raha hai…"
  ]
 },
 {
  "en": "Payment status",
  "hi": "भुगतान स्थिति",
  "aliases": [
   "Payment status",
   "Payment status"
  ]
 },
 {
  "en": "Close payment",
  "hi": "भुगतान बंद करें",
  "aliases": [
   "Close payment",
   "Payment band karo"
  ]
 },
 {
  "en": "Ride Status:",
  "hi": "यात्रा स्थिति:",
  "aliases": [
   "Ride Status:",
   "Ride Status:"
  ]
 },
 {
  "en": "DRIVER REQUESTED ADVANCE",
  "hi": "चालक ने अग्रिम माँगा",
  "aliases": [
   "DRIVER REQUESTED ADVANCE",
   "DRIVER NE ADVANCE MAANGA"
  ]
 },
 {
  "en": "Choose payment method",
  "hi": "भुगतान का तरीका चुनें",
  "aliases": [
   "Choose payment method",
   "Payment method chuno"
  ]
 },
 {
  "en": "Waiting for driver to confirm payment received",
  "hi": "चालक द्वारा भुगतान प्राप्ति की पुष्टि की प्रतीक्षा",
  "aliases": [
   "Waiting for Driver Payment Received confirmation",
   "Driver ke payment received confirm karne ka wait"
  ]
 },
 {
  "en": "CASH SELECTED",
  "hi": "नकद चुना गया",
  "aliases": [
   "CASH SELECTED",
   "CASH SELECT KIYA"
  ]
 },
 {
  "en": "To driver",
  "hi": "चालक को",
  "aliases": [
   "Driver ko",
   "Driver ko"
  ]
 },
 {
  "en": "UPI / Card / Netbanking",
  "hi": "UPI / कार्ड / नेटबैंकिंग",
  "aliases": [
   "UPI / Card / Netbanking",
   "UPI / Card / Netbanking"
  ]
 },
 {
  "en": "Saving…",
  "hi": "सहेजा जा रहा है…",
  "aliases": [
   "Saving…",
   "Save ho raha hai…"
  ]
 },
 {
  "en": "Skip advance; pay the remaining amount later",
  "hi": "अग्रिम छोड़ें; शेष राशि बाद में",
  "aliases": [
   "Advance skip; final remaining later",
   "Advance skip karo; baaki baad mein"
  ]
 },
 {
  "en": "Pay driver in cash",
  "hi": "चालक को नकद भुगतान करें",
  "aliases": [
   "Pay driver in cash",
   "Driver ko cash mein pay karo"
  ]
 },
 {
  "en": "Waiting for driver cash confirmation",
  "hi": "चालक की नकद पुष्टि की प्रतीक्षा",
  "aliases": [
   "Waiting for driver cash confirmation",
   "Driver ke cash confirmation ka wait"
  ]
 },
 {
  "en": "Aadhaar Card",
  "hi": "आधार कार्ड",
  "aliases": [
   "Aadhaar Card",
   "Aadhaar Card"
  ]
 },
 {
  "en": "Pollution Certificate",
  "hi": "प्रदूषण प्रमाणपत्र",
  "aliases": [
   "Pollution Certificate",
   "Pollution Certificate"
  ]
 },
 {
  "en": "Fitness Certificate",
  "hi": "फिटनेस प्रमाणपत्र",
  "aliases": [
   "Fitness Certificate",
   "Fitness Certificate"
  ]
 },
 {
  "en": "Hello,",
  "hi": "नमस्ते,",
  "aliases": [
   "Namaste,",
   "Namaste,"
  ]
 },
 {
  "en": "DRIVER WALLET",
  "hi": "चालक वॉलेट",
  "aliases": [
   "DRIVER WALLET",
   "DRIVER WALLET"
  ]
 },
 {
  "en": "Not available",
  "hi": "उपलब्ध नहीं",
  "aliases": [
   "Not available",
   "Available nahi"
  ]
 },
 {
  "en": "Requested:",
  "hi": "अनुरोधित:",
  "aliases": [
   "Requested:",
   "Request kiya:"
  ]
 },
 {
  "en": "Unknown",
  "hi": "अज्ञात",
  "aliases": [
   "Unknown",
   "Pata nahi"
  ]
 },
 {
  "en": "Hide Details",
  "hi": "विवरण छिपाएँ",
  "aliases": [
   "Hide Details",
   "Details chhupao"
  ]
 },
 {
  "en": "✅ Accept ₹",
  "hi": "✅ स्वीकार करें ₹",
  "aliases": [
   "✅ Accept ₹",
   "✅ Accept karo ₹"
  ]
 },
 {
  "en": "Send Counter ₹",
  "hi": "काउंटर ऑफ़र भेजें ₹",
  "aliases": [
   "Send Counter ₹",
   "Counter bhejo ₹"
  ]
 },
 {
  "en": "Customer Wallet",
  "hi": "ग्राहक वॉलेट",
  "aliases": [
   "Customer Wallet",
   "Customer Wallet"
  ]
 },
 {
  "en": "HimRideG Wallet",
  "hi": "HimRideG वॉलेट",
  "aliases": [
   "HimRideG Wallet",
   "HimRideG Wallet"
  ]
 },
 {
  "en": "↻ Refresh Payments",
  "hi": "↻ भुगतान रीफ़्रेश करें",
  "aliases": [
   "↻ Refresh Payments",
   "↻ Payments refresh karo"
  ]
 },
 {
  "en": "CUSTOMER WALLET",
  "hi": "ग्राहक वॉलेट",
  "aliases": [
   "CUSTOMER WALLET",
   "CUSTOMER WALLET"
  ]
 },
 {
  "en": "Available Soon",
  "hi": "जल्द उपलब्ध",
  "aliases": [
   "Available Soon",
   "Jaldi available"
  ]
 },
 {
  "en": "🔒 Locked Fare ₹",
  "hi": "🔒 तय किराया ₹",
  "aliases": [
   "🔒 Locked Fare ₹",
   "🔒 Locked Fare ₹"
  ]
 },
 {
  "en": "Payment Locked",
  "hi": "भुगतान लॉक है",
  "aliases": [
   "Payment Locked",
   "Payment lock hai"
  ]
 },
 {
  "en": "No pending payment",
  "hi": "कोई भुगतान लंबित नहीं",
  "aliases": [
   "No pending payment",
   "Koi payment pending nahi"
  ]
 },
 {
  "en": "Other pending ride payments",
  "hi": "अन्य लंबित यात्रा भुगतान",
  "aliases": [
   "Other pending ride payments",
   "Baaki pending ride payments"
  ]
 },
 {
  "en": "· Locked ₹",
  "hi": "· तय ₹",
  "aliases": [
   "· Locked ₹",
   "· Locked ₹"
  ]
 },
 {
  "en": "Pay",
  "hi": "भुगतान करें",
  "aliases": [
   "Pay",
   "Pay karo"
  ]
 },
 {
  "en": "Recent paid rides",
  "hi": "हाल की भुगतान की गई यात्राएँ",
  "aliases": [
   "Recent paid rides",
   "Recent paid rides"
  ]
 },
 {
  "en": "✅ Paid ₹",
  "hi": "✅ भुगतान किया ₹",
  "aliases": [
   "✅ Paid ₹",
   "✅ Paid ₹"
  ]
 },
 {
  "en": "Driver will be assigned",
  "hi": "चालक नियुक्त किया जाएगा",
  "aliases": [
   "Driver will be assigned",
   "Driver assign hoga"
  ]
 },
 {
  "en": "HimRideG Taxi",
  "hi": "HimRideG टैक्सी",
  "aliases": [
   "HimRideG Taxi",
   "HimRideG Taxi"
  ]
 },
 {
  "en": "Number pending",
  "hi": "नंबर लंबित",
  "aliases": [
   "Number pending",
   "Number pending"
  ]
 },
 {
  "en": "Himachal Pradesh",
  "hi": "हिमाचल प्रदेश",
  "aliases": [
   "Himachal Pradesh",
   "Himachal Pradesh"
  ]
 },
 {
  "en": "Hello,",
  "hi": "नमस्ते,",
  "aliases": [
   "Hello,",
   "Hello,"
  ]
 },
 {
  "en": "· Open ride →",
  "hi": "· यात्रा खोलें →",
  "aliases": [
   "· Open ride →",
   "· Ride kholo →"
  ]
 },
 {
  "en": "Travel",
  "hi": "यात्रा करें",
  "aliases": [
   "Travel",
   "Travel karo"
  ]
 },
 {
  "en": "With Us",
  "hi": "हमारे साथ",
  "aliases": [
   "With Us",
   "Hamare saath"
  ]
 },
 {
  "en": "🚕 &nbsp; Book New Ride",
  "hi": "🚕 &nbsp; नई यात्रा बुक करें",
  "aliases": [
   "🚕 &nbsp; Book New Ride",
   "🚕 &nbsp; Nayi Ride book karo"
  ]
 },
 {
  "en": "Your Active Ride",
  "hi": "आपकी चालू यात्रा",
  "aliases": [
   "Your Active Ride",
   "Aapki Active Ride"
  ]
 },
 {
  "en": "Live",
  "hi": "लाइव",
  "aliases": [
   "Live",
   "Live"
  ]
 },
 {
  "en": "🔒 Locked",
  "hi": "🔒 लॉक",
  "aliases": [
   "🔒 Locked",
   "🔒 Locked"
  ]
 },
 {
  "en": "ETA:",
  "hi": "पहुँचने का समय:",
  "aliases": [
   "ETA:",
   "ETA:"
  ]
 },
 {
  "en": "🔵 Waiting for driver live location…",
  "hi": "🔵 चालक के लाइव स्थान की प्रतीक्षा…",
  "aliases": [
   "🔵 Waiting for driver live location…",
   "🔵 Driver ki live location ka wait…"
  ]
 },
 {
  "en": "Message driver",
  "hi": "चालक को संदेश भेजें",
  "aliases": [
   "Message driver",
   "Driver ko message karo"
  ]
 },
 {
  "en": "💳 Pay ₹",
  "hi": "💳 भुगतान करें ₹",
  "aliases": [
   "💳 Pay ₹",
   "💳 Pay karo ₹"
  ]
 },
 {
  "en": "Ready",
  "hi": "तैयार",
  "aliases": [
   "Ready",
   "Ready"
  ]
 },
 {
  "en": "View all →",
  "hi": "सभी देखें →",
  "aliases": [
   "View all →",
   "Sab dekho →"
  ]
 },
 {
  "en": "Upcoming",
  "hi": "आगामी",
  "aliases": [
   "Upcoming",
   "Upcoming"
  ]
 },
 {
  "en": "✅ Paid",
  "hi": "✅ भुगतान हो गया",
  "aliases": [
   "✅ Paid",
   "✅ Paid"
  ]
 },
 {
  "en": "HimRideG Account",
  "hi": "HimRideG खाता",
  "aliases": [
   "HimRideG Account",
   "HimRideG Account"
  ]
 },
 {
  "en": "Wallet & Payments",
  "hi": "वॉलेट और भुगतान",
  "aliases": [
   "Wallet & Payments",
   "Wallet & Payments"
  ]
 },
 {
  "en": "Wallet, UPI, cash, QR and passbook",
  "hi": "वॉलेट, UPI, नकद, QR और पासबुक",
  "aliases": [
   "Wallet, UPI, cash, QR and passbook",
   "Wallet, UPI, cash, QR aur passbook"
  ]
 },
 {
  "en": "Active and previous ride history",
  "hi": "चालू और पिछली यात्राओं का इतिहास",
  "aliases": [
   "Active and previous ride history",
   "Active aur purani rides ki history"
  ]
 },
 {
  "en": "Trusted contacts, SOS and live trip safety",
  "hi": "भरोसेमंद संपर्क, SOS और लाइव यात्रा सुरक्षा",
  "aliases": [
   "Trusted contacts, SOS and live trip safety",
   "Trusted contacts, SOS aur live trip safety"
  ]
 },
 {
  "en": "Support, FAQs and emergency help",
  "hi": "सहायता, FAQ और आपातकालीन मदद",
  "aliases": [
   "Support, FAQs and emergency help",
   "Support, FAQs aur emergency help"
  ]
 },
 {
  "en": "Refer and Earn",
  "hi": "रेफ़र करें और कमाएँ",
  "aliases": [
   "Refer and Earn",
   "Refer karo aur kamao"
  ]
 },
 {
  "en": "Invite friends to HimRideG",
  "hi": "दोस्तों को HimRideG पर आमंत्रित करें",
  "aliases": [
   "Invite friends to HimRideG",
   "Dosto ko HimRideG pe invite karo"
  ]
 },
 {
  "en": "My Rewards coming soon.",
  "hi": "मेरे पुरस्कार जल्द आ रहे हैं।",
  "aliases": [
   "My Rewards coming soon.",
   "My Rewards jaldi aa raha hai."
  ]
 },
 {
  "en": "My Rewards",
  "hi": "मेरे पुरस्कार",
  "aliases": [
   "My Rewards",
   "My Rewards"
  ]
 },
 {
  "en": "Offers and ride rewards",
  "hi": "ऑफ़र और यात्रा पुरस्कार",
  "aliases": [
   "Offers and ride rewards",
   "Offers aur ride rewards"
  ]
 },
 {
  "en": "Ride Pass coming soon.",
  "hi": "यात्रा पास जल्द आ रहा है।",
  "aliases": [
   "Ride Pass coming soon.",
   "Ride Pass jaldi aa raha hai."
  ]
 },
 {
  "en": "Ride Pass",
  "hi": "यात्रा पास",
  "aliases": [
   "Ride Pass",
   "Ride Pass"
  ]
 },
 {
  "en": "Future ride passes and benefits",
  "hi": "आगामी यात्रा पास और लाभ",
  "aliases": [
   "Future ride passes and benefits",
   "Aane wale ride passes aur benefits"
  ]
 },
 {
  "en": "HimRideG Coins coming soon.",
  "hi": "HimRideG कॉइन्स जल्द आ रहे हैं।",
  "aliases": [
   "HimRideG Coins coming soon.",
   "HimRideG Coins jaldi aa rahe hain."
  ]
 },
 {
  "en": "HimRideG Coins",
  "hi": "HimRideG कॉइन्स",
  "aliases": [
   "HimRideG Coins",
   "HimRideG Coins"
  ]
 },
 {
  "en": "Coins and reward balance",
  "hi": "कॉइन्स और पुरस्कार शेष राशि",
  "aliases": [
   "Coins and reward balance",
   "Coins aur reward balance"
  ]
 },
 {
  "en": "Ride, fare and payment updates",
  "hi": "यात्रा, किराया और भुगतान अपडेट",
  "aliases": [
   "Ride, fare and payment updates",
   "Ride, fare aur payment updates"
  ]
 },
 {
  "en": "Claims feature coming soon.",
  "hi": "दावा सुविधा जल्द आ रही है।",
  "aliases": [
   "Claims feature coming soon.",
   "Claims feature jaldi aa raha hai."
  ]
 },
 {
  "en": "Claims",
  "hi": "दावे",
  "aliases": [
   "Claims",
   "Claims"
  ]
 },
 {
  "en": "Ride and payment claim support",
  "hi": "यात्रा और भुगतान दावा सहायता",
  "aliases": [
   "Ride and payment claim support",
   "Ride aur payment claim support"
  ]
 },
 {
  "en": "Account Settings",
  "hi": "खाता सेटिंग्स",
  "aliases": [
   "Account Settings",
   "Account Settings"
  ]
 },
 {
  "en": "Name, mobile, email and profile photo",
  "hi": "नाम, मोबाइल, ईमेल और प्रोफ़ाइल फ़ोटो",
  "aliases": [
   "Name, mobile, email and profile photo",
   "Naam, mobile, email aur profile photo"
  ]
 },
 {
  "en": "Change Photo",
  "hi": "फ़ोटो बदलें",
  "aliases": [
   "Change Photo",
   "Photo badlo"
  ]
 },
 {
  "en": "Edit Profile",
  "hi": "प्रोफ़ाइल संपादित करें",
  "aliases": [
   "Edit Profile",
   "Profile edit karo"
  ]
 },
 {
  "en": "Primary Mobile Number",
  "hi": "मुख्य मोबाइल नंबर",
  "aliases": [
   "Primary Mobile Number",
   "Primary Mobile Number"
  ]
 },
 {
  "en": "Alternative Mobile Number",
  "hi": "वैकल्पिक मोबाइल नंबर",
  "aliases": [
   "Alternative Mobile Number",
   "Alternative Mobile Number"
  ]
 },
 {
  "en": "Email Address",
  "hi": "ईमेल पता",
  "aliases": [
   "Email Address",
   "Email Address"
  ]
 },
 {
  "en": "Legal and support",
  "hi": "कानूनी और सहायता",
  "aliases": [
   "Legal and support",
   "Legal aur support"
  ]
 },
 {
  "en": "Legal & Support",
  "hi": "कानूनी और सहायता",
  "aliases": [
   "Legal & Support",
   "Legal & Support"
  ]
 },
 {
  "en": "Live pages from himrideg.com",
  "hi": "himrideg.com के लाइव पेज",
  "aliases": [
   "Live pages from himrideg.com",
   "himrideg.com ke live pages"
  ]
 },
 {
  "en": "Terms & Conditions",
  "hi": "नियम और शर्तें",
  "aliases": [
   "Terms & Conditions",
   "Terms & Conditions"
  ]
 },
 {
  "en": "Privacy Policy",
  "hi": "गोपनीयता नीति",
  "aliases": [
   "Privacy Policy",
   "Privacy Policy"
  ]
 },
 {
  "en": "Help & Support",
  "hi": "सहायता और समर्थन",
  "aliases": [
   "Help & Support",
   "Help & Support"
  ]
 },
 {
  "en": "Contact Us",
  "hi": "संपर्क करें",
  "aliases": [
   "Contact Us",
   "Contact karo"
  ]
 },
 {
  "en": "Customer mobile navigation",
  "hi": "ग्राहक मोबाइल नेविगेशन",
  "aliases": [
   "Customer mobile navigation",
   "Customer mobile navigation"
  ]
 },
 {
  "en": "Ride Start OTP",
  "hi": "यात्रा प्रारंभ OTP",
  "aliases": [
   "Ride Start OTP",
   "Ride Start OTP"
  ]
 },
 {
  "en": "Enter a valid 10-digit mobile number.",
  "hi": "कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।",
  "aliases": [
   "Valid 10 digit mobile number enter karo.",
   "Valid 10 digit mobile number enter karo."
  ]
 },
 {
  "en": "Back to HimRideG home",
  "hi": "HimRideG होम पर वापस जाएँ",
  "aliases": [
   "Back to HimRideG home",
   "HimRideG home par wapas jao"
  ]
 },
 {
  "en": "Your journey.",
  "hi": "आपकी यात्रा।",
  "aliases": [
   "Your journey.",
   "Aapki journey."
  ]
 },
 {
  "en": "Our",
  "hi": "हमारी",
  "aliases": [
   "Our",
   "Hamari"
  ]
 },
 {
  "en": "Verified drivers, transparent rides and live tracking for local and outstation taxi travel.",
  "hi": "स्थानीय और आउटस्टेशन टैक्सी यात्रा के लिए सत्यापित चालक, पारदर्शी यात्राएँ और लाइव ट्रैकिंग।",
  "aliases": [
   "Verified drivers, transparent rides and live tracking for local and outstation taxi travel.",
   "Local aur outstation taxi travel ke liye verified drivers, transparent rides aur live tracking."
  ]
 },
 {
  "en": "Enter 10 digit mobile number",
  "hi": "10 अंकों का मोबाइल नंबर दर्ज करें",
  "aliases": [
   "Enter 10 digit mobile number",
   "10 digit mobile number enter karo"
  ]
 },
 {
  "en": "Cancellation/Refund rules",
  "hi": "रद्दीकरण/धनवापसी नियम",
  "aliases": [
   "Cancellation/Refund rules",
   "Cancellation/Refund rules"
  ]
 },
 {
  "en": "Mobile number → Google verification → first-time Basic Info confirmation → Dashboard. Returning registered",
  "hi": "मोबाइल नंबर → Google सत्यापन → पहली बार मूल जानकारी की पुष्टि → डैशबोर्ड। पहले से पंजीकृत",
  "aliases": [
   "Mobile number → Google verification → first time Basic Info confirmation → Dashboard. Returning registered",
   "Mobile number → Google verification → pehli baar Basic Info confirmation → Dashboard. Pehle se registered"
  ]
 },
 {
  "en": "Vehicle Insurance",
  "hi": "वाहन बीमा",
  "aliases": [
   "Vehicle Insurance",
   "Vehicle Insurance"
  ]
 },
 {
  "en": "RIDE ROUTE",
  "hi": "यात्रा मार्ग",
  "aliases": [
   "RIDE ROUTE",
   "RIDE ROUTE"
  ]
 },
 {
  "en": "Live location active",
  "hi": "लाइव स्थान सक्रिय",
  "aliases": [
   "Live location active",
   "Live location active hai"
  ]
 },
 {
  "en": "Location loading...",
  "hi": "स्थान लोड हो रहा है...",
  "aliases": [
   "Location loading...",
   "Location load ho rahi hai..."
  ]
 },
 {
  "en": "Driver current location",
  "hi": "चालक का वर्तमान स्थान",
  "aliases": [
   "Driver current location",
   "Driver ki current location"
  ]
 },
 {
  "en": "Wallet top-up order details are incomplete",
  "hi": "वॉलेट टॉप-अप ऑर्डर का विवरण अधूरा है",
  "aliases": [
   "Wallet top-up order details incomplete hain",
   "Wallet top-up order details incomplete hain"
  ]
 },
 {
  "en": "Driver Wallet Top-up",
  "hi": "चालक वॉलेट टॉप-अप",
  "aliases": [
   "Driver Wallet Top-up",
   "Driver Wallet Top-up"
  ]
 },
 {
  "en": "Wallet top-up successful",
  "hi": "वॉलेट टॉप-अप सफल रहा",
  "aliases": [
   "Wallet top-up successful",
   "Wallet top-up ho gaya"
  ]
 },
 {
  "en": "Add Money amount (₹100 - ₹50,000)",
  "hi": "जोड़ी जाने वाली राशि (₹100 - ₹50,000)",
  "aliases": [
   "Add Money amount (₹100 - ₹50,000)",
   "Add Money amount (₹100 - ₹50,000)"
  ]
 },
 {
  "en": "＋ Add Money to Wallet",
  "hi": "＋ वॉलेट में पैसे जोड़ें",
  "aliases": [
   "＋ Add Money to Wallet",
   "＋ Wallet mein paise add karo"
  ]
 },
 {
  "en": "Bank Transfer",
  "hi": "बैंक ट्रांसफर",
  "aliases": [
   "Bank Transfer",
   "Bank Transfer"
  ]
 },
 {
  "en": "UPI ID (e.g. name@upi)",
  "hi": "UPI ID (जैसे name@upi)",
  "aliases": [
   "UPI ID (e.g. name@upi)",
   "UPI ID (jaise name@upi)"
  ]
 },
 {
  "en": "IFSC Code",
  "hi": "IFSC कोड",
  "aliases": [
   "IFSC Code",
   "IFSC Code"
  ]
 },
 {
  "en": "Primary account required",
  "hi": "प्राथमिक खाता आवश्यक है",
  "aliases": [
   "Primary account required",
   "Primary account zaroori hai"
  ]
 },
 {
  "en": "Add account",
  "hi": "खाता जोड़ें",
  "aliases": [
   "Add account",
   "Account add karo"
  ]
 },
 {
  "en": "Saved payout details",
  "hi": "सहेजे गए भुगतान प्राप्ति विवरण",
  "aliases": [
   "Saved payout details",
   "Saved payout details"
  ]
 },
 {
  "en": "● Withdrawals ready",
  "hi": "● निकासी के लिए तैयार",
  "aliases": [
   "● Withdrawals ready",
   "● Withdrawal ready hai"
  ]
 },
 {
  "en": "● Withdrawal setup pending",
  "hi": "● निकासी सेटअप लंबित है",
  "aliases": [
   "● Withdrawal setup pending",
   "● Withdrawal setup pending hai"
  ]
 },
 {
  "en": "Technical status",
  "hi": "तकनीकी स्थिति",
  "aliases": [
   "Technical status",
   "Technical status"
  ]
 },
 {
  "en": "PAYOUT ACCOUNT SAVED",
  "hi": "भुगतान प्राप्ति खाता सहेजा गया",
  "aliases": [
   "PAYOUT ACCOUNT SAVED",
   "PAYOUT ACCOUNT SAVE HO GAYA"
  ]
 },
 {
  "en": "Bank / IMPS",
  "hi": "बैंक / IMPS",
  "aliases": [
   "Bank / IMPS",
   "Bank / IMPS"
  ]
 },
 {
  "en": "Edit Details",
  "hi": "विवरण संपादित करें",
  "aliases": [
   "Edit Details",
   "Details edit karo"
  ]
 },
 {
  "en": "Saved account:",
  "hi": "सहेजा गया खाता:",
  "aliases": [
   "Saved account:",
   "Saved account:"
  ]
 },
 {
  "en": "New Account Number (blank = saved)",
  "hi": "नया खाता नंबर (खाली = सहेजा गया)",
  "aliases": [
   "New Account Number (blank = saved)",
   "Naya Account Number (blank = saved)"
  ]
 },
 {
  "en": "Automatic transfer",
  "hi": "स्वचालित ट्रांसफर",
  "aliases": [
   "Automatic transfer",
   "Automatic transfer"
  ]
 },
 {
  "en": "Scheduled payout when the wallet crosses the minimum",
  "hi": "वॉलेट न्यूनतम राशि पार करने पर निर्धारित भुगतान",
  "aliases": [
   "Wallet minimum cross kare to scheduled payout",
   "Wallet minimum cross kare to scheduled payout"
  ]
 },
 {
  "en": "Daily",
  "hi": "दैनिक",
  "aliases": [
   "Daily",
   "Daily"
  ]
 },
 {
  "en": "Weekly",
  "hi": "साप्ताहिक",
  "aliases": [
   "Weekly",
   "Weekly"
  ]
 },
 {
  "en": "Monthly",
  "hi": "मासिक",
  "aliases": [
   "Monthly",
   "Monthly"
  ]
 },
 {
  "en": "Save UPI / Bank & Schedule",
  "hi": "UPI / बैंक और शेड्यूल सहेजें",
  "aliases": [
   "Save UPI / Bank & Schedule",
   "UPI / Bank & Schedule save karo"
  ]
 },
 {
  "en": "Instant Withdraw",
  "hi": "तुरंत निकासी",
  "aliases": [
   "Instant Withdraw",
   "Instant Withdraw"
  ]
 },
 {
  "en": "Primary Bank",
  "hi": "प्राथमिक बैंक",
  "aliases": [
   "Primary Bank",
   "Primary Bank"
  ]
 },
 {
  "en": "Bank",
  "hi": "बैंक",
  "aliases": [
   "Bank",
   "Bank"
  ]
 },
 {
  "en": "The customer selected online payment.",
  "hi": "ग्राहक ने ऑनलाइन भुगतान चुना है।",
  "aliases": [
   "Customer ne Payment Online select ki.",
   "Customer ne Payment Online select kiya."
  ]
 },
 {
  "en": "Driver account approval is required.",
  "hi": "चालक खाते की स्वीकृति आवश्यक है।",
  "aliases": [
   "Driver account approval required hai.",
   "Driver account approval zaroori hai."
  ]
 },
 {
  "en": "Ride request rejected.",
  "hi": "यात्रा अनुरोध अस्वीकार कर दिया गया।",
  "aliases": [
   "Ride request reject kar di.",
   "Ride request reject kar di."
  ]
 },
 {
  "en": "Customer not responding / ride not confirmed",
  "hi": "ग्राहक जवाब नहीं दे रहा / यात्रा की पुष्टि नहीं हुई",
  "aliases": [
   "Customer not responding / ride not confirmed",
   "Customer jawab nahi de raha / ride confirm nahi hui"
  ]
 },
 {
  "en": "Cash payment confirmed.",
  "hi": "नकद भुगतान की पुष्टि हो गई।",
  "aliases": [
   "Cash payment confirmed.",
   "Cash payment confirm ho gaya."
  ]
 },
 {
  "en": "Arrival update sent to the customer.",
  "hi": "ग्राहक को आगमन की सूचना भेज दी गई।",
  "aliases": [
   "Customer ko arrival update bhej diya.",
   "Customer ko arrival update bhej diya."
  ]
 },
 {
  "en": "Enter a valid 4-digit OTP.",
  "hi": "कृपया मान्य 4 अंकों का OTP दर्ज करें।",
  "aliases": [
   "Valid 4 digit OTP enter karo.",
   "Valid 4 digit OTP enter karo."
  ]
 },
 {
  "en": "Close payment receipt",
  "hi": "भुगतान रसीद बंद करें",
  "aliases": [
   "Close payment receipt",
   "Payment receipt band karo"
  ]
 },
 {
  "en": "Upload Progress",
  "hi": "अपलोड प्रगति",
  "aliases": [
   "Upload Progress",
   "Upload Progress"
  ]
 },
 {
  "en": "⏳ Admin review pending",
  "hi": "⏳ एडमिन समीक्षा लंबित है",
  "aliases": [
   "⏳ Admin review pending",
   "⏳ Admin review pending hai"
  ]
 },
 {
  "en": "Uploading...",
  "hi": "अपलोड हो रहा है...",
  "aliases": [
   "Uploading...",
   "Upload ho raha hai..."
  ]
 },
 {
  "en": "📤 Re-Upload",
  "hi": "📤 फिर से अपलोड करें",
  "aliases": [
   "📤 Re-Upload",
   "📤 Dobara upload karo"
  ]
 },
 {
  "en": "Documents Under Review",
  "hi": "दस्तावेज़ समीक्षा में हैं",
  "aliases": [
   "Documents Under Review",
   "Documents review mein hain"
  ]
 },
 {
  "en": "DOCUMENT STATUS",
  "hi": "दस्तावेज़ स्थिति",
  "aliases": [
   "DOCUMENT STATUS",
   "DOCUMENT STATUS"
  ]
 },
 {
  "en": "Verification Progress",
  "hi": "सत्यापन प्रगति",
  "aliases": [
   "Verification Progress",
   "Verification Progress"
  ]
 },
 {
  "en": "The admin will open and verify your documents.",
  "hi": "एडमिन आपके दस्तावेज़ खोलकर सत्यापित करेगा।",
  "aliases": [
   "Admin tumhare documents khol kar verify karega.",
   "Admin aapke documents khol kar verify karega."
  ]
 },
 {
  "en": "Generating New OTP...",
  "hi": "नया OTP बनाया जा रहा है...",
  "aliases": [
   "Generating New OTP...",
   "Naya OTP generate ho raha hai..."
  ]
 },
 {
  "en": "Verify & Start Ride",
  "hi": "सत्यापित करें और यात्रा शुरू करें",
  "aliases": [
   "Verify & Start Ride",
   "Verify karo & Ride start karo"
  ]
 },
 {
  "en": "Total Requests",
  "hi": "कुल अनुरोध",
  "aliases": [
   "Total Requests",
   "Total Requests"
  ]
 },
 {
  "en": "Ongoing",
  "hi": "जारी",
  "aliases": [
   "Ongoing",
   "Chal rahi hai"
  ]
 },
 {
  "en": "Rating",
  "hi": "रेटिंग",
  "aliases": [
   "Rating",
   "Rating"
  ]
 },
 {
  "en": "Open Wallet →",
  "hi": "वॉलेट खोलें →",
  "aliases": [
   "Open Wallet →",
   "Wallet kholo →"
  ]
 },
 {
  "en": "DRIVER WALLET QR",
  "hi": "चालक वॉलेट QR",
  "aliases": [
   "DRIVER WALLET QR",
   "DRIVER WALLET QR"
  ]
 },
 {
  "en": "Fixed Payment QR",
  "hi": "स्थायी भुगतान QR",
  "aliases": [
   "Fixed Payment QR",
   "Fixed Payment QR"
  ]
 },
 {
  "en": "Driver ID:",
  "hi": "चालक ID:",
  "aliases": [
   "Driver ID:",
   "Driver ID:"
  ]
 },
 {
  "en": "🔒 Fixed QR · No editable amount · Assigned-driver verification",
  "hi": "🔒 स्थायी QR · राशि बदली नहीं जा सकती · नियुक्त चालक सत्यापन",
  "aliases": [
   "🔒 Fixed QR · No editable amount · Assigned-driver verification",
   "🔒 Fixed QR · Amount edit nahi hoga · Assigned-driver verification"
  ]
 },
 {
  "en": "▦ Show My Fixed Driver Wallet QR",
  "hi": "▦ मेरा स्थायी चालक वॉलेट QR दिखाएँ",
  "aliases": [
   "▦ Show My Fixed Driver Wallet QR",
   "▦ Mera Fixed Driver Wallet QR dikhao"
  ]
 },
 {
  "en": "Real Wallet Balance",
  "hi": "वास्तविक वॉलेट शेष राशि",
  "aliases": [
   "Real Wallet Balance",
   "Real Wallet Balance"
  ]
 },
 {
  "en": "Pending Amount",
  "hi": "लंबित राशि",
  "aliases": [
   "Pending Amount",
   "Pending Amount"
  ]
 },
 {
  "en": "Total Withdrawn",
  "hi": "कुल निकासी",
  "aliases": [
   "Total Withdrawn",
   "Total Withdrawn"
  ]
 },
 {
  "en": "Today's Earnings",
  "hi": "आज की कमाई",
  "aliases": [
   "Today Earnings",
   "Aaj ki Earnings"
  ]
 },
 {
  "en": "Cash Commission Due",
  "hi": "बकाया नकद कमीशन",
  "aliases": [
   "Cash Commission Due",
   "Cash Commission Due"
  ]
 },
 {
  "en": "Completed Trips",
  "hi": "पूर्ण यात्राएँ",
  "aliases": [
   "Completed Trips",
   "Completed Trips"
  ]
 },
 {
  "en": "HimRideG Commission",
  "hi": "HimRideG कमीशन",
  "aliases": [
   "HimRideG Commission",
   "HimRideG Commission"
  ]
 },
 {
  "en": "Driver Online Share",
  "hi": "चालक ऑनलाइन हिस्सा",
  "aliases": [
   "Driver Online Share",
   "Driver Online Share"
  ]
 },
 {
  "en": "💰 Real Driver Earnings Wallet",
  "hi": "💰 वास्तविक चालक कमाई वॉलेट",
  "aliases": [
   "💰 Real Driver Earnings Wallet",
   "💰 Real Driver Earnings Wallet"
  ]
 },
 {
  "en": "Refreshing Wallet...",
  "hi": "वॉलेट रीफ़्रेश हो रहा है...",
  "aliases": [
   "Refreshing Wallet...",
   "Wallet refresh ho raha hai..."
  ]
 },
 {
  "en": "↻ Refresh Real Wallet",
  "hi": "↻ वास्तविक वॉलेट रीफ़्रेश करें",
  "aliases": [
   "↻ Refresh Real Wallet",
   "↻ Real Wallet refresh karo"
  ]
 },
 {
  "en": "🧾 Recent Wallet Activity",
  "hi": "🧾 हाल की वॉलेट गतिविधि",
  "aliases": [
   "🧾 Recent Wallet Activity",
   "🧾 Recent Wallet Activity"
  ]
 },
 {
  "en": "Wallet activity",
  "hi": "वॉलेट गतिविधि",
  "aliases": [
   "Wallet activity",
   "Wallet activity"
  ]
 },
 {
  "en": "＋ Cash Commission Top-up",
  "hi": "＋ नकद कमीशन टॉप-अप",
  "aliases": [
   "＋ Cash Commission Top-up",
   "＋ Cash Commission Top-up"
  ]
 },
 {
  "en": "💸 Real Wallet Withdrawal",
  "hi": "💸 वास्तविक वॉलेट निकासी",
  "aliases": [
   "💸 Real Wallet Withdrawal",
   "💸 Real Wallet Withdrawal"
  ]
 },
 {
  "en": "AVAILABLE TO WITHDRAW",
  "hi": "निकासी के लिए उपलब्ध",
  "aliases": [
   "AVAILABLE TO WITHDRAW",
   "WITHDRAW KE LIYE AVAILABLE"
  ]
 },
 {
  "en": "Available Earnings Balance:",
  "hi": "उपलब्ध कमाई शेष राशि:",
  "aliases": [
   "Available Earnings Balance:",
   "Available Earnings Balance:"
  ]
 },
 {
  "en": "Documents Required",
  "hi": "आवश्यक दस्तावेज़",
  "aliases": [
   "Documents Required",
   "Documents Required"
  ]
 },
 {
  "en": "Missing",
  "hi": "अनुपलब्ध",
  "aliases": [
   "Missing",
   "Missing"
  ]
 },
 {
  "en": "⏳ Documents Under Review",
  "hi": "⏳ दस्तावेज़ समीक्षा में हैं",
  "aliases": [
   "⏳ Documents Under Review",
   "⏳ Documents review mein hain"
  ]
 },
 {
  "en": "⌂ Menu",
  "hi": "⌂ मेनू",
  "aliases": [
   "⌂ Menu",
   "⌂ Menu"
  ]
 },
 {
  "en": "📄 Docs",
  "hi": "📄 दस्तावेज़",
  "aliases": [
   "📄 Docs",
   "📄 Docs"
  ]
 },
 {
  "en": "Add bank/UPI and choose Primary receiving account",
  "hi": "बैंक/UPI जोड़ें और प्राथमिक प्राप्ति खाता चुनें",
  "aliases": [
   "Add bank/UPI and choose Primary receiving account",
   "Bank/UPI add karo aur Primary receiving account choose karo"
  ]
 },
 {
  "en": "Personal info, vehicle and contact details",
  "hi": "व्यक्तिगत जानकारी, वाहन और संपर्क विवरण",
  "aliases": [
   "Personal info, vehicle aur contact details",
   "Personal info, vehicle aur contact details"
  ]
 },
 {
  "en": "available · add money, withdraw & payout history",
  "hi": "उपलब्ध · पैसे जोड़ें, निकासी और भुगतान प्राप्ति इतिहास",
  "aliases": [
   "available · add money, withdraw & payout history",
   "available · add money, withdraw & payout history"
  ]
 },
 {
  "en": "Requests, completed rides, rating & total earnings",
  "hi": "अनुरोध, पूर्ण यात्राएँ, रेटिंग और कुल कमाई",
  "aliases": [
   "Requests, completed rides, rating & total earnings",
   "Requests, completed rides, rating aur total earnings"
  ]
 },
 {
  "en": "Active, pending-payment and completed ride history",
  "hi": "सक्रिय, भुगतान लंबित और पूर्ण यात्रा इतिहास",
  "aliases": [
   "Active, payment pending aur completed ride history",
   "Active, payment pending aur completed ride history"
  ]
 },
 {
  "en": "Completed, cancelled and expired rides",
  "hi": "पूर्ण, रद्द और समाप्त यात्राएँ",
  "aliases": [
   "Completed, cancelled aur expired rides",
   "Completed, cancelled aur expired rides"
  ]
 },
 {
  "en": "Licence, RC, permit and verification status",
  "hi": "लाइसेंस, RC, परमिट और सत्यापन स्थिति",
  "aliases": [
   "Licence, RC, permit aur verification status",
   "Licence, RC, permit aur verification status"
  ]
 },
 {
  "en": "New customer requests and notifications",
  "hi": "नए ग्राहक अनुरोध और सूचनाएँ",
  "aliases": [
   "New customer requests aur notifications",
   "Naye customer requests aur notifications"
  ]
 },
 {
  "en": "Safety & Compliance",
  "hi": "सुरक्षा और अनुपालन",
  "aliases": [
   "Safety & Compliance",
   "Safety & Compliance"
  ]
 },
 {
  "en": "Verification documents, taxi compliance and account safety",
  "hi": "सत्यापन दस्तावेज़, टैक्सी अनुपालन और खाता सुरक्षा",
  "aliases": [
   "Verification documents, taxi compliance aur account safety",
   "Verification documents, taxi compliance aur account safety"
  ]
 },
 {
  "en": "Contact, vehicle and personal account settings",
  "hi": "संपर्क, वाहन और व्यक्तिगत खाता सेटिंग्स",
  "aliases": [
   "Contact, vehicle aur personal account settings",
   "Contact, vehicle aur personal account settings"
  ]
 },
 {
  "en": "Ride, payment and verification support",
  "hi": "यात्रा, भुगतान और सत्यापन सहायता",
  "aliases": [
   "Ride, payment aur verification support",
   "Ride, payment aur verification support"
  ]
 },
 {
  "en": "↪ Logout Driver",
  "hi": "↪ चालक लॉगआउट",
  "aliases": [
   "↪ Logout Driver",
   "↪ Driver Logout"
  ]
 },
 {
  "en": "Legal Name (As per Aadhaar)",
  "hi": "कानूनी नाम (आधार के अनुसार)",
  "aliases": [
   "Legal Name (As per Aadhaar)",
   "Legal Name (Aadhaar ke anusar)"
  ]
 },
 {
  "en": "Verified — locked",
  "hi": "सत्यापित — लॉक",
  "aliases": [
   "Verified — locked",
   "Verified — locked"
  ]
 },
 {
  "en": "Primary Verified Mobile",
  "hi": "प्राथमिक सत्यापित मोबाइल",
  "aliases": [
   "Primary Verified Mobile",
   "Primary Verified Mobile"
  ]
 },
 {
  "en": "Alternative Mobile",
  "hi": "वैकल्पिक मोबाइल",
  "aliases": [
   "Alternative Mobile",
   "Alternative Mobile"
  ]
 },
 {
  "en": "Address",
  "hi": "पता",
  "aliases": [
   "Address",
   "Address"
  ]
 },
 {
  "en": "House/locality, tehsil, district, HP",
  "hi": "घर/मोहल्ला, तहसील, ज़िला, HP",
  "aliases": [
   "Ghar/mohalla, tehsil, district, HP",
   "Ghar/mohalla, tehsil, district, HP"
  ]
 },
 {
  "en": "Hatchback",
  "hi": "हैचबैक",
  "aliases": [
   "Hatchback",
   "Hatchback"
  ]
 },
 {
  "en": "Other",
  "hi": "अन्य",
  "aliases": [
   "Other",
   "Other"
  ]
 },
 {
  "en": "Brand",
  "hi": "ब्रांड",
  "aliases": [
   "Brand",
   "Brand"
  ]
 },
 {
  "en": "Maruti, Tata, Hyundai...",
  "hi": "मारुति, टाटा, ह्युंडई...",
  "aliases": [
   "Maruti, Tata, Hyundai...",
   "Maruti, Tata, Hyundai..."
  ]
 },
 {
  "en": "Model",
  "hi": "मॉडल",
  "aliases": [
   "Model",
   "Model"
  ]
 },
 {
  "en": "Swift Dzire, Nexon...",
  "hi": "स्विफ्ट डिज़ायर, नेक्सन...",
  "aliases": [
   "Swift Dzire, Nexon...",
   "Swift Dzire, Nexon..."
  ]
 },
 {
  "en": "Fuel Type",
  "hi": "ईंधन प्रकार",
  "aliases": [
   "Fuel Type",
   "Fuel Type"
  ]
 },
 {
  "en": "Petrol",
  "hi": "पेट्रोल",
  "aliases": [
   "Petrol",
   "Petrol"
  ]
 },
 {
  "en": "Diesel",
  "hi": "डीज़ल",
  "aliases": [
   "Diesel",
   "Diesel"
  ]
 },
 {
  "en": "Electric",
  "hi": "इलेक्ट्रिक",
  "aliases": [
   "Electric",
   "Electric"
  ]
 },
 {
  "en": "Hybrid",
  "hi": "हाइब्रिड",
  "aliases": [
   "Hybrid",
   "Hybrid"
  ]
 },
 {
  "en": "Color",
  "hi": "रंग",
  "aliases": [
   "Color",
   "Color"
  ]
 },
 {
  "en": "White, Silver...",
  "hi": "सफ़ेद, सिल्वर...",
  "aliases": [
   "White, Silver...",
   "White, Silver..."
  ]
 },
 {
  "en": "🟡 Commercial / Yellow Plate Vehicle",
  "hi": "🟡 व्यावसायिक / पीली नंबर प्लेट वाहन",
  "aliases": [
   "🟡 Commercial / Yellow Plate Vehicle",
   "🟡 Commercial / Yellow Plate Vehicle"
  ]
 },
 {
  "en": "💾 Save Profile",
  "hi": "💾 प्रोफ़ाइल सहेजें",
  "aliases": [
   "💾 Save Profile",
   "💾 Profile Save karo"
  ]
 },
 {
  "en": "💸 Withdraw / Wallet Settings",
  "hi": "💸 निकासी / वॉलेट सेटिंग्स",
  "aliases": [
   "💸 Withdraw / Wallet Settings",
   "💸 Withdraw / Wallet Settings"
  ]
 },
 {
  "en": "▦ My Driver QR",
  "hi": "▦ मेरा चालक QR",
  "aliases": [
   "▦ My Driver QR",
   "▦ Mera Driver QR"
  ]
 },
 {
  "en": "Transaction History",
  "hi": "लेन-देन इतिहास",
  "aliases": [
   "Transaction History",
   "Transaction History"
  ]
 },
 {
  "en": "Failed",
  "hi": "विफल",
  "aliases": [
   "Failed",
   "Failed"
  ]
 },
 {
  "en": "Wallet transaction",
  "hi": "वॉलेट लेन-देन",
  "aliases": [
   "Wallet transaction",
   "Wallet transaction"
  ]
 },
 {
  "en": "💰 Open Wallet",
  "hi": "💰 वॉलेट खोलें",
  "aliases": [
   "💰 Open Wallet",
   "💰 Wallet Kholo"
  ]
 },
 {
  "en": "🚕 View My Rides",
  "hi": "🚕 मेरी यात्राएँ देखें",
  "aliases": [
   "🚕 View My Rides",
   "🚕 Meri Rides Dekho"
  ]
 },
 {
  "en": "Pending Admin Review",
  "hi": "एडमिन समीक्षा लंबित",
  "aliases": [
   "Pending Admin Review",
   "Admin Review Pending"
  ]
 },
 {
  "en": "Fetch failed",
  "hi": "लोड नहीं हो सका",
  "aliases": [
   "Fetch failed",
   "Load nahi hua"
  ]
 },
 {
  "en": "Reason:",
  "hi": "कारण:",
  "aliases": [
   "Reason:",
   "Reason:"
  ]
 },
 {
  "en": "📤 Upload Again",
  "hi": "📤 फिर से अपलोड करें",
  "aliases": [
   "📤 Upload Again",
   "📤 Dobara Upload karo"
  ]
 },
 {
  "en": "🔄 Replace",
  "hi": "🔄 बदलें",
  "aliases": [
   "🔄 Replace",
   "🔄 Replace karo"
  ]
 },
 {
  "en": "Approval Pending",
  "hi": "स्वीकृति लंबित",
  "aliases": [
   "Approval Pending",
   "Approval Pending"
  ]
 },
 {
  "en": "🔒 Preview only",
  "hi": "🔒 केवल पूर्वावलोकन",
  "aliases": [
   "🔒 Preview only",
   "🔒 Sirf preview"
  ]
 },
 {
  "en": "Tap to view →",
  "hi": "देखने के लिए टैप करें →",
  "aliases": [
   "Tap to view →",
   "Dekhne ke liye tap karo →"
  ]
 },
 {
  "en": "Cash Payment Selected",
  "hi": "नकद भुगतान चुना गया",
  "aliases": [
   "Cash Payment Selected",
   "Cash Payment Select hua"
  ]
 },
 {
  "en": "💵 Receive Cash ₹",
  "hi": "💵 नकद प्राप्त करें ₹",
  "aliases": [
   "💵 Receive Cash ₹",
   "💵 Cash Receive karo ₹"
  ]
 },
 {
  "en": "The Receive Cash option will be removed automatically as soon as the online payment succeeds.",
  "hi": "ऑनलाइन भुगतान सफल होते ही 'नकद प्राप्त करें' विकल्प अपने आप हट जाएगा।",
  "aliases": [
   "Online payment successful hote hi Receive Cash option automatically hat jayega.",
   "Online payment successful hote hi Receive Cash option automatically hat jayega."
  ]
 },
 {
  "en": "Confirm Receive Cash only after you have physically received the cash.",
  "hi": "नकद हाथ में मिलने के बाद ही 'नकद प्राप्त करें' की पुष्टि करें।",
  "aliases": [
   "Cash physically mile tabhi Receive Cash confirm karein.",
   "Cash haath mein milne ke baad hi Receive Cash confirm karo."
  ]
 },
 {
  "en": "🔒 Contact",
  "hi": "🔒 संपर्क",
  "aliases": [
   "🔒 Contact",
   "🔒 Contact"
  ]
 },
 {
  "en": "Driver → Customer → Final",
  "hi": "चालक → ग्राहक → अंतिम",
  "aliases": [
   "Driver → Customer → Final",
   "Driver → Customer → Final"
  ]
 },
 {
  "en": "YOUR EARNING",
  "hi": "आपकी कमाई",
  "aliases": [
   "YOUR EARNING",
   "AAPKI EARNING"
  ]
 },
 {
  "en": "📨 FINAL FARE SENT",
  "hi": "📨 अंतिम किराया भेजा गया",
  "aliases": [
   "📨 FINAL FARE SENT",
   "📨 FINAL FARE BHEJ DIYA"
  ]
 },
 {
  "en": "⏳ Waiting for Customer Response",
  "hi": "⏳ ग्राहक के जवाब की प्रतीक्षा",
  "aliases": [
   "⏳ Waiting for Customer Response",
   "⏳ Customer ke response ka intezaar"
  ]
 },
 {
  "en": "Cancelling...",
  "hi": "रद्द किया जा रहा है...",
  "aliases": [
   "Cancelling...",
   "Cancel ho raha hai..."
  ]
 },
 {
  "en": "Customer Counter ₹",
  "hi": "ग्राहक का प्रस्ताव ₹",
  "aliases": [
   "Customer Counter ₹",
   "Customer Counter ₹"
  ]
 },
 {
  "en": "Customer One-Time Counter",
  "hi": "ग्राहक का एक-बार का प्रस्ताव",
  "aliases": [
   "Customer One-Time Counter",
   "Customer ka One-Time Counter"
  ]
 },
 {
  "en": "Accepting...",
  "hi": "स्वीकार किया जा रहा है...",
  "aliases": [
   "Accepting...",
   "Accept ho raha hai..."
  ]
 },
 {
  "en": "Send Final Fare",
  "hi": "अंतिम किराया भेजें",
  "aliases": [
   "Send Final Fare",
   "Final Fare Bhejo"
  ]
 },
 {
  "en": "Initial Fare Sent",
  "hi": "प्रारंभिक किराया भेजा गया",
  "aliases": [
   "Initial Fare Sent",
   "Initial Fare Bhej diya"
  ]
 },
 {
  "en": "✓ Accept Ride",
  "hi": "✓ यात्रा स्वीकार करें",
  "aliases": [
   "✓ Accept Ride",
   "✓ Ride Accept karo"
  ]
 },
 {
  "en": "× Reject Ride",
  "hi": "× यात्रा अस्वीकार करें",
  "aliases": [
   "× Reject Ride",
   "× Ride Reject karo"
  ]
 },
 {
  "en": "PAYMENT STATUS",
  "hi": "भुगतान स्थिति",
  "aliases": [
   "PAYMENT STATUS",
   "PAYMENT STATUS"
  ]
 },
 {
  "en": "Pickup to Destination",
  "hi": "पिकअप से गंतव्य तक",
  "aliases": [
   "Pickup to Destination",
   "Pickup se Destination tak"
  ]
 },
 {
  "en": "Cash Selected",
  "hi": "नकद चुना गया",
  "aliases": [
   "Cash Selected",
   "Cash Select hua"
  ]
 },
 {
  "en": "Receive Cash Ready",
  "hi": "नकद प्राप्ति तैयार",
  "aliases": [
   "Receive Cash Ready",
   "Receive Cash Ready"
  ]
 },
 {
  "en": "Confirming...",
  "hi": "पुष्टि की जा रही है...",
  "aliases": [
   "Confirming...",
   "Confirm ho raha hai..."
  ]
 },
 {
  "en": "➤ Navigate to Pickup",
  "hi": "➤ पिकअप तक मार्ग देखें",
  "aliases": [
   "➤ Navigate Pickup",
   "➤ Pickup tak Navigate karo"
  ]
 },
 {
  "en": "➤ Navigate to Destination",
  "hi": "➤ गंतव्य तक मार्ग देखें",
  "aliases": [
   "➤ Navigate Destination",
   "➤ Destination tak Navigate karo"
  ]
 },
 {
  "en": "🔒 Navigate to Pickup",
  "hi": "🔒 पिकअप तक मार्ग देखें",
  "aliases": [
   "🔒 Navigate Pickup",
   "🔒 Pickup tak Navigate karo"
  ]
 },
 {
  "en": "🔒 Navigate to Destination",
  "hi": "🔒 गंतव्य तक मार्ग देखें",
  "aliases": [
   "🔒 Navigate Destination",
   "🔒 Destination tak Navigate karo"
  ]
 },
 {
  "en": "₹ Fare Negotiation",
  "hi": "₹ किराया मोलभाव",
  "aliases": [
   "₹ Fare Negotiation",
   "₹ Fare Negotiation"
  ]
 },
 {
  "en": "💳 Payment Status",
  "hi": "💳 भुगतान स्थिति",
  "aliases": [
   "💳 Payment Status",
   "💳 Payment Status"
  ]
 },
 {
  "en": "🔒 GO TO PICKUP Disabled Until Customer Accepts the Fare",
  "hi": "🔒 ग्राहक द्वारा किराया स्वीकार करने तक 'पिकअप पर जाएँ' बंद है",
  "aliases": [
   "🔒 Customer Fare Accept Hone Tak GO TO PICKUP Disabled",
   "🔒 Customer Fare Accept Hone Tak GO TO PICKUP Disabled"
  ]
 },
 {
  "en": "🔒 Cancel Ride Unavailable",
  "hi": "🔒 यात्रा रद्द करना उपलब्ध नहीं",
  "aliases": [
   "🔒 Cancel Ride Unavailable",
   "🔒 Cancel Ride Available Nahi"
  ]
 },
 {
  "en": "🔒 Advance Payment Pending — Customer Must Pay Now",
  "hi": "🔒 अग्रिम भुगतान लंबित — ग्राहक अभी भुगतान करें",
  "aliases": [
   "🔒 Advance Payment Pending — Customer Pay Now Kare",
   "🔒 Advance Payment Pending — Customer Abhi Pay Kare"
  ]
 },
 {
  "en": "🔐 Generate OTP (Customer Must Be Present)",
  "hi": "🔐 OTP बनाएँ (ग्राहक सामने हों)",
  "aliases": [
   "🔐 Generate OTP (Customer Saamne Ho)",
   "🔐 OTP Generate karo (Customer Saamne Ho)"
  ]
 },
 {
  "en": "View Full Summary →",
  "hi": "पूरा सारांश देखें →",
  "aliases": [
   "View Full Summary →",
   "Poora Summary Dekho →"
  ]
 },
 {
  "en": "💰 Open Driver Wallet · ₹",
  "hi": "💰 चालक वॉलेट खोलें · ₹",
  "aliases": [
   "💰 Open Driver Wallet · ₹",
   "💰 Driver Wallet Kholo · ₹"
  ]
 },
 {
  "en": "Driver mobile navigation",
  "hi": "चालक मोबाइल नेविगेशन",
  "aliases": [
   "Driver mobile navigation",
   "Driver mobile navigation"
  ]
 },
 {
  "en": "Bike",
  "hi": "बाइक",
  "aliases": [
   "Bike",
   "Bike"
  ]
 },
 {
  "en": "Motor Cab (Taxi)",
  "hi": "मोटर कैब (टैक्सी)",
  "aliases": [
   "Motor Cab (Taxi)",
   "Motor Cab (Taxi)"
  ]
 },
 {
  "en": "Maxi Cab",
  "hi": "मैक्सी कैब",
  "aliases": [
   "Maxi Cab",
   "Maxi Cab"
  ]
 },
 {
  "en": "LMV - Taxi",
  "hi": "LMV - टैक्सी",
  "aliases": [
   "LMV - Taxi",
   "LMV - Taxi"
  ]
 },
 {
  "en": "Omni Bus",
  "hi": "ओमनी बस",
  "aliases": [
   "Omni Bus",
   "Omni Bus"
  ]
 },
 {
  "en": "% complete",
  "hi": "% पूर्ण",
  "aliases": [
   "% complete",
   "% complete"
  ]
 },
 {
  "en": "documents uploaded",
  "hi": "दस्तावेज़ अपलोड हुए",
  "aliases": [
   "documents uploaded",
   "documents upload ho gaye"
  ]
 },
 {
  "en": "Documents & Vehicle",
  "hi": "दस्तावेज़ और वाहन",
  "aliases": [
   "Documents & Vehicle",
   "Documents aur Vehicle"
  ]
 },
 {
  "en": "E.g.: Nishan Kumar / Rajesh Sharma",
  "hi": "जैसे: निशान कुमार / राजेश शर्मा",
  "aliases": [
   "Jaise: Nishan Kumar / Rajesh Sharma",
   "Jaise: Nishan Kumar / Rajesh Sharma"
  ]
 },
 {
  "en": "💾 Save Name",
  "hi": "💾 नाम सहेजें",
  "aliases": [
   "💾 Save Name",
   "💾 Naam Save karo"
  ]
 },
 {
  "en": "Required Documents",
  "hi": "आवश्यक दस्तावेज़",
  "aliases": [
   "Required Documents",
   "Zaroori Documents"
  ]
 },
 {
  "en": "JPG, PNG, WEBP or PDF — max 5 MB",
  "hi": "JPG, PNG, WEBP या PDF — अधिकतम 5 MB",
  "aliases": [
   "JPG, PNG, WEBP ya PDF — max 5 MB",
   "JPG, PNG, WEBP ya PDF — max 5 MB"
  ]
 },
 {
  "en": "Re-upload",
  "hi": "दोबारा अपलोड करें",
  "aliases": [
   "Re-upload",
   "Re-upload karo"
  ]
 },
 {
  "en": "Vehicle Class",
  "hi": "वाहन श्रेणी",
  "aliases": [
   "Vehicle Class",
   "Vehicle Class"
  ]
 },
 {
  "en": "Maruti Suzuki",
  "hi": "मारुति सुज़ुकी",
  "aliases": [
   "Maruti Suzuki",
   "Maruti Suzuki"
  ]
 },
 {
  "en": "Dzire",
  "hi": "डिज़ायर",
  "aliases": [
   "Dzire",
   "Dzire"
  ]
 },
 {
  "en": "White",
  "hi": "सफ़ेद",
  "aliases": [
   "White",
   "White"
  ]
 },
 {
  "en": "Seating Capacity",
  "hi": "बैठने की क्षमता",
  "aliases": [
   "Seating Capacity",
   "Seating Capacity"
  ]
 },
 {
  "en": "Submit for Approval",
  "hi": "स्वीकृति के लिए जमा करें",
  "aliases": [
   "Submit for Approval",
   "Approval ke liye Submit karo"
  ]
 },
 {
  "en": "GOOGLE LOGIN VERIFIED",
  "hi": "Google लॉगिन सत्यापित",
  "aliases": [
   "GOOGLE LOGIN VERIFIED",
   "GOOGLE LOGIN VERIFIED"
  ]
 },
 {
  "en": "Confirm your Google verified details",
  "hi": "Google से सत्यापित विवरण की पुष्टि करें",
  "aliases": [
   "Google verified details confirm karo",
   "Google verified details confirm karo"
  ]
 },
 {
  "en": "Just complete your basic info",
  "hi": "बस अपनी बुनियादी जानकारी पूरी करें",
  "aliases": [
   "Bas basic info complete karo",
   "Bas basic info complete karo"
  ]
 },
 {
  "en": "Google verified",
  "hi": "Google द्वारा सत्यापित",
  "aliases": [
   "Google verified",
   "Google verified"
  ]
 },
 {
  "en": "No password required",
  "hi": "पासवर्ड की आवश्यकता नहीं",
  "aliases": [
   "No password required",
   "Password ki zaroorat nahi"
  ]
 },
 {
  "en": "One-time setup",
  "hi": "एक बार का सेटअप",
  "aliases": [
   "One-time setup",
   "One-time setup"
  ]
 },
 {
  "en": "Verified Basic Info",
  "hi": "सत्यापित बुनियादी जानकारी",
  "aliases": [
   "Verified Basic Info",
   "Verified Basic Info"
  ]
 },
 {
  "en": "Google Verified Name",
  "hi": "Google सत्यापित नाम",
  "aliases": [
   "Google Verified Name",
   "Google Verified Name"
  ]
 },
 {
  "en": "Enter your full name",
  "hi": "अपना पूरा नाम दर्ज करें",
  "aliases": [
   "Enter your full name",
   "Apna poora naam daalo"
  ]
 },
 {
  "en": "Google Email",
  "hi": "Google ईमेल",
  "aliases": [
   "Google Email",
   "Google Email"
  ]
 },
 {
  "en": "Save & Continue to Driver Verification",
  "hi": "सहेजें और चालक सत्यापन पर आगे बढ़ें",
  "aliases": [
   "Save & Continue to Driver Verification",
   "Save karo aur Driver Verification par aage badho"
  ]
 },
 {
  "en": "Use another account",
  "hi": "दूसरा खाता इस्तेमाल करें",
  "aliases": [
   "Use another account",
   "Doosra account use karo"
  ]
 },
 {
  "en": "Gender",
  "hi": "लिंग",
  "aliases": [
   "Gender"
  ]
 },
 {
  "en": "Male",
  "hi": "पुरुष",
  "aliases": [
   "Male"
  ]
 },
 {
  "en": "Female",
  "hi": "महिला",
  "aliases": [
   "Female"
  ]
 },
 {
  "en": "Other",
  "hi": "अन्य",
  "aliases": [
   "Other"
  ]
 },
 {
  "en": "Date of Birth",
  "hi": "जन्म तिथि",
  "aliases": [
   "Janam Tithi"
  ]
 },
 {
  "en": "Finding your location…",
  "hi": "आपका स्थान खोजा जा रहा है…",
  "aliases": [
   "Aapki location dhoondh rahe hain…"
  ]
 },
 {
  "en": "Your live location",
  "hi": "आपका लाइव स्थान",
  "aliases": [
   "Aapki live location"
  ]
 },
 {
  "en": "Allow location permission to see yourself on the map.",
  "hi": "नक्शे पर खुद को देखने के लिए स्थान अनुमति दें।",
  "aliases": [
   "Map par khud ko dekhne ke liye location permission allow karo."
  ]
 },
 {
  "en": "GPS signal is weak. Retrying…",
  "hi": "GPS सिग्नल कमज़ोर है। फिर से कोशिश हो रही है…",
  "aliases": [
   "GPS signal kamzor hai. Phir se try ho raha hai…"
  ]
 },
 {
  "en": "This browser does not support location.",
  "hi": "यह ब्राउज़र स्थान सुविधा का समर्थन नहीं करता।",
  "aliases": [
   "Ye browser location support nahi karta."
  ]
 },
 {
  "en": "Waiting for Ride",
  "hi": "यात्रा की प्रतीक्षा",
  "aliases": [
   "Ride ka intezaar"
  ]
 },
 {
  "en": "Google Client ID is not configured yet.",
  "hi": "Google क्लाइंट ID अभी कॉन्फ़िगर नहीं हुआ है।",
  "aliases": [
   "Google Client ID configure karna baaki hai."
  ]
 },
 {
  "en": "responsibility.",
  "hi": "ज़िम्मेदारी।",
  "aliases": [
   "zimmedari."
  ]
 }
];

export const EXTRA_PATTERNS = [
 {
  "source": "Customer ne ₹{0} cash payment select ki hai.",
  "en": "The customer selected a cash payment of ₹{0}.",
  "hi": "ग्राहक ने ₹{0} का नकद भुगतान चुना है।",
  "hinglish": "Customer ne ₹{0} cash payment select kiya hai."
 },
 {
  "source": "Advance amount ₹1 se {0} ke beech hona chahiye.",
  "en": "The advance amount must be between ₹1 and {0}.",
  "hi": "अग्रिम राशि ₹1 से {0} के बीच होनी चाहिए।",
  "hinglish": "Advance amount ₹1 se {0} ke beech hona chahiye."
 },
 {
  "source": "Namaste, main HimRideG booking {0} ke baare mein message kar raha/rahi hoon.",
  "en": "Hello, I am messaging about HimRideG booking {0}.",
  "hi": "नमस्ते, मैं HimRideG बुकिंग {0} के बारे में संदेश भेज रहा/रही हूँ।",
  "hinglish": "Namaste, main HimRideG booking {0} ke baare mein message kar raha/rahi hoon."
 },
 {
  "source": "Ye {0} account nahi hai.",
  "en": "This is not a {0} account.",
  "hi": "यह {0} खाता नहीं है।",
  "hinglish": "Ye {0} account nahi hai."
 },
 {
  "source": "Mobile number enter karo aur Google se {0} account verify karo",
  "en": "Enter your mobile number and verify your {0} account with Google",
  "hi": "मोबाइल नंबर दर्ज करें और Google से अपना {0} खाता सत्यापित करें",
  "hinglish": "Mobile number enter karo aur Google se {0} account verify karo"
 },
 {
  "source": "Mobile number enter karo aur Google se secure {0} login karo",
  "en": "Enter your mobile number and log in securely to {0} with Google",
  "hi": "मोबाइल नंबर दर्ज करें और Google से सुरक्षित {0} लॉगिन करें",
  "hinglish": "Mobile number enter karo aur Google se secure {0} login karo"
 },
 {
  "source": "Balance sirf ₹{0} hai.",
  "en": "Balance is only ₹{0}.",
  "hi": "बैलेंस केवल ₹{0} है।",
  "hinglish": "Balance sirf ₹{0} hai."
 },
 {
  "source": "Customer ne ₹{0} ka counter offer bheja.",
  "en": "The customer sent a counter offer of ₹{0}.",
  "hi": "ग्राहक ने ₹{0} का काउंटर ऑफ़र भेजा।",
  "hinglish": "Customer ne ₹{0} ka counter offer bheja."
 },
 {
  "source": "₹{0} fare customer ko bhej diya. Ab customer Accept, Reject ya one-time Counter karega.",
  "en": "₹{0} fare sent to the customer. The customer will now Accept, Reject or make a one-time Counter.",
  "hi": "₹{0} किराया ग्राहक को भेज दिया। अब ग्राहक Accept, Reject या एक बार Counter करेगा।",
  "hinglish": "₹{0} fare customer ko bhej diya. Ab customer Accept, Reject ya one-time Counter karega."
 },
 {
  "source": "Customer ka ₹{0} counter accept ho gaya. Fare locked.",
  "en": "The customer's ₹{0} counter was accepted. Fare locked.",
  "hi": "ग्राहक का ₹{0} काउंटर स्वीकार हो गया। किराया लॉक।",
  "hinglish": "Customer ka ₹{0} counter accept ho gaya. Fare locked."
 },
 {
  "source": "Customer se ₹{0} cash receive hua confirm karna hai?",
  "en": "Confirm that ₹{0} cash was received from the customer?",
  "hi": "क्या ग्राहक से ₹{0} नकद प्राप्त होने की पुष्टि करनी है?",
  "hinglish": "Customer se ₹{0} cash receive hua, confirm karna hai?"
 },
 {
  "source": "Customer ne ₹{0} Cash Payment select ki hai. Cash physically milne ke baad Receive Cash dabayein.",
  "en": "The customer selected a cash payment of ₹{0}. Press Receive Cash after physically receiving the cash.",
  "hi": "ग्राहक ने ₹{0} का नकद भुगतान चुना है। नकद हाथ में मिलने के बाद Receive Cash दबाएँ।",
  "hinglish": "Customer ne ₹{0} Cash Payment select kiya hai. Cash physically milne ke baad Receive Cash dabao."
 },
 {
  "source": "Ride complete hai. ₹{0} cash physically milte hi Receive Cash dabayein; online payment successful hote hi ye action khud hat jayega.",
  "en": "The ride is complete. Press Receive Cash as soon as you physically receive ₹{0} in cash; this action will disappear automatically once an online payment succeeds.",
  "hi": "यात्रा पूरी हो गई है। ₹{0} नकद हाथ में मिलते ही Receive Cash दबाएँ; ऑनलाइन भुगतान सफल होते ही यह विकल्प अपने आप हट जाएगा।",
  "hinglish": "Ride complete hai. ₹{0} cash physically milte hi Receive Cash dabao; online payment successful hote hi ye action khud hat jayega."
 },
 {
  "source": "Unsupported ride status: {0}",
  "en": "Unsupported ride status: {0}",
  "hi": "असमर्थित यात्रा स्थिति: {0}",
  "hinglish": "Unsupported ride status: {0}"
 },
 {
  "source": "{0} min",
  "en": "{0} min",
  "hi": "{0} मिनट",
  "hinglish": "{0} min"
 },
 {
  "source": "{0} hr {1} min",
  "en": "{0} hr {1} min",
  "hi": "{0} घंटे {1} मिनट",
  "hinglish": "{0} ghanta {1} min"
 },
 {
  "source": "{0} hr",
  "en": "{0} hr",
  "hi": "{0} घंटे",
  "hinglish": "{0} ghanta"
 },
 {
  "source": "{0} km",
  "en": "{0} km",
  "hi": "{0} किमी",
  "hinglish": "{0} km"
 },
 {
  "source": "My Location set • GPS ±{0}m",
  "en": "My Location set • GPS ±{0}m",
  "hi": "मेरा स्थान सेट • GPS ±{0} मी",
  "hinglish": "Meri location set • GPS ±{0}m"
 },
 {
  "source": "HimRideG ride {0}",
  "en": "HimRideG ride {0}",
  "hi": "HimRideG यात्रा {0}",
  "hinglish": "HimRideG ride {0}"
 },
 {
  "source": "Pickup: {0}",
  "en": "Pickup: {0}",
  "hi": "पिकअप: {0}",
  "hinglish": "Pickup: {0}"
 },
 {
  "source": "Drop: {0}",
  "en": "Drop: {0}",
  "hi": "ड्रॉप: {0}",
  "hinglish": "Drop: {0}"
 },
 {
  "source": "Status: {0}",
  "en": "Status: {0}",
  "hi": "स्थिति: {0}",
  "hinglish": "Status: {0}"
 },
 {
  "source": "UPI ID: {0}",
  "en": "UPI ID: {0}",
  "hi": "UPI ID: {0}",
  "hinglish": "UPI ID: {0}"
 },
 {
  "source": "I Paid {0} · Driver Verify Kare",
  "en": "I Paid {0} · Driver Will Verify",
  "hi": "मैंने {0} का भुगतान किया · चालक सत्यापित करेगा",
  "hinglish": "Maine {0} pay kiya · Driver verify karega"
 },
 {
  "source": "UPI Payment Received {0}",
  "en": "UPI Payment Received {0}",
  "hi": "UPI भुगतान प्राप्त हुआ {0}",
  "hinglish": "UPI Payment mil gaya {0}"
 },
 {
  "source": "Cash Received {0}",
  "en": "Cash Received {0}",
  "hi": "नकद प्राप्त हुआ {0}",
  "hinglish": "Cash mil gaya {0}"
 },
 {
  "source": "Waiting for {0}",
  "en": "Waiting for {0}",
  "hi": "{0} की प्रतीक्षा",
  "hinglish": "{0} ka wait"
 },
 {
  "source": "Advance {0}",
  "en": "Advance {0}",
  "hi": "अग्रिम {0}",
  "hinglish": "Advance {0}"
 },
 {
  "source": "Remaining ride payment {0}",
  "en": "Remaining ride payment {0}",
  "hi": "यात्रा का शेष भुगतान {0}",
  "hinglish": "Baaki ride payment {0}"
 },
 {
  "source": "Pay Online {0}",
  "en": "Pay Online {0}",
  "hi": "ऑनलाइन भुगतान करें {0}",
  "hinglish": "Online pay karo {0}"
 },
 {
  "source": "Cash Payment {0}",
  "en": "Cash Payment {0}",
  "hi": "नकद भुगतान {0}",
  "hinglish": "Cash Payment {0}"
 },
 {
  "source": "{0} star",
  "en": "{0} star",
  "hi": "{0} स्टार",
  "hinglish": "{0} star"
 },
 {
  "source": "Pay ₹{0}",
  "en": "Pay ₹{0}",
  "hi": "₹{0} भुगतान करें",
  "hinglish": "₹{0} pay karo"
 },
 {
  "source": "• {0} km",
  "en": "• {0} km",
  "hi": "• {0} किमी",
  "hinglish": "• {0} km"
 },
 {
  "source": "{0} • GPS connecting",
  "en": "{0} • GPS connecting",
  "hi": "{0} • GPS जुड़ रहा है",
  "hinglish": "{0} • GPS connect ho raha hai"
 },
 {
  "source": "• {0} min",
  "en": "• {0} min",
  "hi": "• {0} मिनट",
  "hinglish": "• {0} min"
 },
 {
  "source": "Create {0} Account",
  "en": "Create {0} Account",
  "hi": "{0} खाता बनाएँ",
  "hinglish": "{0} Account banao"
 },
 {
  "source": "Amount (min ₹100, max ₹{0})",
  "en": "Amount (min ₹100, max ₹{0})",
  "hi": "राशि (न्यूनतम ₹100, अधिकतम ₹{0})",
  "hinglish": "Amount (min ₹100, max ₹{0})"
 },
 {
  "source": "UPI • {0}",
  "en": "UPI • {0}",
  "hi": "UPI • {0}",
  "hinglish": "UPI • {0}"
 },
 {
  "source": "Account {0}",
  "en": "Account {0}",
  "hi": "खाता {0}",
  "hinglish": "Account {0}"
 },
 {
  "source": "UPI {0}",
  "en": "UPI {0}",
  "hi": "UPI {0}",
  "hinglish": "UPI {0}"
 },
 {
  "source": "Withdraw to {0}",
  "en": "Withdraw to {0}",
  "hi": "{0} में निकासी करें",
  "hinglish": "{0} mein withdraw karo"
 },
 {
  "source": "Cash Received ₹{0} ✅",
  "en": "Cash Received ₹{0} ✅",
  "hi": "नकद प्राप्त ₹{0} ✅",
  "hinglish": "Cash mil gaya ₹{0} ✅"
 },
 {
  "source": "Payment Received ₹{0} ✅",
  "en": "Payment Received ₹{0} ✅",
  "hi": "भुगतान प्राप्त ₹{0} ✅",
  "hinglish": "Payment mil gaya ₹{0} ✅"
 },
 {
  "source": "₹{0} final fare customer ko bhej diya. Ab customer Accept / Reject karega.",
  "en": "₹{0} final fare sent to the customer. The customer will now accept or reject it.",
  "hi": "₹{0} अंतिम किराया ग्राहक को भेज दिया गया है। अब ग्राहक इसे स्वीकार या अस्वीकार करेगा।",
  "hinglish": "₹{0} final fare customer ko bhej diya. Ab customer Accept / Reject karega."
 },
 {
  "source": "HimRideG Driver Wallet QR - {0}",
  "en": "HimRideG Driver Wallet QR - {0}",
  "hi": "HimRideG चालक वॉलेट QR - {0}",
  "hinglish": "HimRideG Driver Wallet QR - {0}"
 },
 {
  "source": "⚠ Action Required — {0} rejected",
  "en": "⚠ Action Required — {0} rejected",
  "hi": "⚠ कार्रवाई आवश्यक — {0} अस्वीकृत",
  "hinglish": "⚠ Action Required — {0} reject hua"
 },
 {
  "source": "✅ Accept ₹{0}",
  "en": "✅ Accept ₹{0}",
  "hi": "✅ ₹{0} स्वीकार करें",
  "hinglish": "✅ ₹{0} Accept karo"
 },
 {
  "source": "💵 Receive Cash ₹{0}",
  "en": "💵 Receive Cash ₹{0}",
  "hi": "💵 नकद प्राप्त करें ₹{0}",
  "hinglish": "💵 Cash Receive karo ₹{0}"
 }
];

// Existing entries whose "en" text was Hinglish. Placed AFTER the original
// ENTRIES, so English mode shows real English (old text kept as an alias).
export const EN_FIXES = [
 {
  "en": "HIMACHAL'S OWN RIDE",
  "hi": "हिमाचल की अपनी यात्रा",
  "aliases": [
   "HIMACHAL KI APNI RIDE",
   "HIMACHAL KI APNI RIDE"
  ]
 },
 {
  "en": "There are no rides in this section",
  "hi": "इस भाग में कोई यात्रा नहीं है",
  "aliases": [
   "Is section me koi ride nahi hai",
   "Is section mein koi ride nahi hai"
  ]
 },
 {
  "en": "Fare locked ✅",
  "hi": "किराया तय हो गया ✅",
  "aliases": [
   "Fare Lock ho gaya ✅",
   "Fare lock ho gaya ✅"
  ]
 },
 {
  "en": "Fare accepted. The driver's GO TO PICKUP is now enabled.",
  "hi": "किराया स्वीकार हो गया। चालक अब पिकअप के लिए रवाना हो सकता है।",
  "aliases": [
   "Fare accept ho gaya. Driver ka GO TO PICKUP ab enabled hai.",
   "Fare accept ho gaya. Driver ka GO TO PICKUP ab enabled hai."
  ]
 },
 {
  "en": "The driver's final fare did not sync. The driver must resend the FINAL fare. ₹0 is never shown for Accept/Reject.",
  "hi": "चालक का अंतिम किराया समन्वित नहीं हुआ। चालक को अंतिम किराया दोबारा भेजना होगा। ₹0 को स्वीकार या अस्वीकार करने के लिए नहीं दिखाया जाएगा।",
  "aliases": [
   "Driver final fare amount sync nahi hua. Driver ko FINAL fare resend karna hoga. ₹0 ko Accept/Reject ke liye kabhi show nahi kiya jayega.",
   "Driver ka final fare sync nahi hua. Driver ko FINAL fare dobara bhejna hoga. ₹0 kabhi Accept/Reject ke liye nahi dikhega."
  ]
 },
 {
  "en": "This is the driver's final offer. You can now only Accept or Reject. On Accept the fare is locked and the driver's GO TO PICKUP is enabled.",
  "hi": "यह चालक का अंतिम किराया प्रस्ताव है। अब केवल स्वीकार या अस्वीकार किया जा सकता है। स्वीकार करने पर किराया तय होगा और चालक पिकअप के लिए जा सकेगा।",
  "aliases": [
   "Ye driver ka final offer hai. Ab sirf Accept ya Reject kar sakte hain. Accept par fare lock hoga aur driver ka GO TO PICKUP enable hoga.",
   "Ye driver ka final offer hai. Ab sirf Accept ya Reject kar sakte ho. Accept karne par fare lock hoga aur driver ka GO TO PICKUP enable hoga."
  ]
 },
 {
  "en": "Waiting for the driver's FINAL fare... A counter offer is no longer available.",
  "hi": "चालक के अंतिम किराए की प्रतीक्षा है। अब दोबारा प्रतिप्रस्ताव नहीं भेजा जा सकता।",
  "aliases": [
   "Waiting for driver FINAL fare... Counter Offer ab dobara available nahi hoga.",
   "Driver ke FINAL fare ka intezaar... Counter Offer ab dobara nahi milega."
  ]
 },
 {
  "en": "Accept if you like the fare. You can Reject it, or send one Counter Offer.",
  "hi": "किराया सही लगे तो स्वीकार करें। आप अस्वीकार कर सकते हैं या एक बार किराया प्रतिप्रस्ताव भेज सकते हैं।",
  "aliases": [
   "Fare pasand hai to Accept karein. Reject kar sakte hain, ya ek baar Counter Offer bhej sakte hain.",
   "Fare pasand hai to Accept karo. Reject kar sakte ho, ya ek baar Counter Offer bhej sakte ho."
  ]
 },
 {
  "en": "Stay online, accept rides and decide your own final fare.",
  "hi": "ऑनलाइन रहें, यात्रा स्वीकार करें और अपना अंतिम किराया स्वयं तय करें।",
  "aliases": [
   "Online raho, ride accept karo aur apna final fare khud decide karo.",
   "Online raho, ride accept karo aur apna final fare khud decide karo."
  ]
 },
 {
  "en": "Stay online. New customer bookings and any assigned active ride will appear in this panel.",
  "hi": "ऑनलाइन रहें। नई ग्राहक बुकिंग और कोई निर्धारित सक्रिय यात्रा इसी पैनल में दिखाई देगी।",
  "aliases": [
   "Online raho. Nayi customer booking aur koi assigned Active Ride isi panel me dikhai degi.",
   "Online raho. Nayi customer booking aur assigned Active Ride isi panel mein dikhegi."
  ]
 },
 {
  "en": "On mobile the UPI app opens. On desktop you can pay by scanning the UPI QR. The customer does not type the amount — the locked fare goes into the payment order automatically.",
  "hi": "मोबाइल पर यूपीआई ऐप खुलेगी। डेस्कटॉप पर यूपीआई क्यूआर स्कैन करके भुगतान किया जा सकता है। राशि ग्राहक को दर्ज नहीं करनी होगी — तय किराया अपने-आप भुगतान में जाएगा।",
  "aliases": [
   "Mobile par UPI app open hogi. Desktop par UPI QR scan karke payment ki ja sakti hai. Amount customer type nahi karega — locked fare automatically payment order me jayega.",
   "Mobile par UPI app khulegi. Desktop par UPI QR scan karke payment kar sakte ho. Amount customer type nahi karega — locked fare apne aap payment order mein jayega."
  ]
 },
 {
  "en": "After the ride is complete, the customer can select Cash. After the locked fare is paid in cash, the assigned driver confirms the payment.",
  "hi": "यात्रा पूरी होने के बाद ग्राहक नकद भुगतान चुन सकता है। चालक को तय किराया नकद देने के बाद वही चालक भुगतान प्राप्त होने की पुष्टि करेगा।",
  "aliases": [
   "Ride complete hone ke baad customer Cash select kar sakta hai. Driver ko locked fare cash dene ke baad assigned driver payment receive confirm karega.",
   "Ride complete hone ke baad customer Cash select kar sakta hai. Driver ko locked fare cash mein dene ke baad wahi driver payment receive confirm karega."
  ]
 },
 {
  "en": "The payment button is enabled only after the driver completes the ride. Payment cannot start without the final locked fare.",
  "hi": "भुगतान बटन चालक द्वारा यात्रा पूरी करने के बाद ही सक्रिय होगा। अंतिम तय किराए के बिना भुगतान शुरू नहीं होगा।",
  "aliases": [
   "Payment button driver ke ride complete karne ke baad hi enable hoga. Final locked fare ke bina payment start nahi hogi.",
   "Payment button driver ke ride complete karne ke baad hi enable hoga. Final locked fare ke bina payment start nahi hogi."
  ]
 }
];

const normalizeKey = (value) =>
  String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

// V92 introduced support and admin copy after the V90 translation audit.
EXTRA_ENTRIES.push(...V92_ENTRIES);
const HINGLISH_INDEX = new Map([
  ...Object.keys(HINGLISH).map((key) => [normalizeKey(key), HINGLISH[key]]),
  ...[...V92_HINGLISH].map(([key, value]) => [normalizeKey(key), value])
]);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function compileTemplate(template) {
  const order = [];
  const source = escapeRegExp(String(template).trim()).replace(/\\\{(\d+)\\\}/g, (_, index) => {
    order.push(Number(index));
    return "(.+?)";
  });
  return { regex: new RegExp("^" + source + "$", "i"), order };
}

function fill(template, order, match) {
  let out = String(template);
  order.forEach((placeholder, index) => {
    out = out.split("{" + placeholder + "}").join(match[index + 1]);
  });
  return out;
}

// English templates in HINGLISH (with {0}), most specific first.
const HINGLISH_TEMPLATES = Object.keys(HINGLISH)
  .filter((key) => /\{\d+\}/.test(key))
  .map((key) => ({ ...compileTemplate(key), target: HINGLISH[key] }))
  .sort((a, b) => b.regex.source.length - a.regex.source.length);

const EXTRA_COMPILED = EXTRA_PATTERNS.map((item) => ({ ...compileTemplate(item.source), item }));

const DECORATION = /^([^A-Za-z0-9\u0900-\u097F₹]*)(.*?)([^A-Za-z0-9\u0900-\u097F%₹)]*)$/u;

function lookupHinglish(core) {
  const exact = HINGLISH_INDEX.get(normalizeKey(core));
  if (exact !== undefined) return exact;
  for (const template of HINGLISH_TEMPLATES) {
    const match = String(core).trim().match(template.regex);
    if (match) return fill(template.target, template.order, match);
  }
  return undefined;
}

// English text (as shown in English mode) -> Hinglish. Unknown text is
// returned unchanged, so nothing ever disappears.
export function toHinglish(english) {
  const value = String(english ?? "");
  const core = value.trim();
  if (!core || /[\u0900-\u097F]/.test(core)) return value;

  const direct = lookupHinglish(core);
  if (direct !== undefined) return value.replace(core, direct);

  const decorated = core.match(DECORATION);
  if (decorated && decorated[2]) {
    const inner = lookupHinglish(decorated[2]);
    if (inner !== undefined) return value.replace(core, decorated[1] + inner + decorated[3]);
  }
  return value;
}

// Hinglish-source text with a value, e.g. "Customer ne ₹500 cash payment
// select ki hai." -> English / Hindi / Hinglish. null = not one of ours.
export function translateExtraPattern(value, language) {
  const core = String(value || "").trim();
  for (const entry of EXTRA_COMPILED) {
    const match = core.match(entry.regex);
    if (match) {
      const target = language === "hi" ? entry.item.hi : language === "hinglish" ? entry.item.hinglish : entry.item.en;
      return fill(target, entry.order, match);
    }
  }
  return null;
}

export const WEB_LANGUAGES = [
  { code: "en", label: "English", sample: "Book your ride" },
  { code: "hi", label: "हिन्दी", sample: "अपनी यात्रा बुक करें" },
  { code: "hinglish", label: "Hinglish", sample: "Apni ride book karo" }
];

// <html lang>: en / hi / hi-Latn (Hinglish)
export function htmlLangFor(value) {
  return value === "hi" ? "hi" : value === "hinglish" ? "hi-Latn" : "en";
}

export function cleanWebLanguage(value) {
  return value === "hi" || value === "hinglish" ? value : "en";
}
