/*
|--------------------------------------------------------------------------
| V116 ADD-ONLY: English server messages
|--------------------------------------------------------------------------
| Purane messages (Hinglish) code me waise hi rakhe hain. Response, socket
| event aur push notification bahar jaane se pehle yahan se professional
| English me badal jaate hain. Website / apps unhe English ya Hindi me
| dikhati hain (user ki chuni hui language).
|--------------------------------------------------------------------------
*/

const EXACT = new Map([
 [
  "Sirf admin booking details dekh sakta hai.",
  "Only an admin can view booking details."
 ],
 [
  "Valid booking ID required hai.",
  "A valid booking ID is required."
 ],
 [
  "Booking nahi mili.",
  "Booking not found."
 ],
 [
  "Booking details load nahi hui.",
  "Booking details could not be loaded."
 ],
 [
  "Commission settings load nahi hui",
  "Commission settings could not be loaded"
 ],
 [
  "Range 2 ki km seema Range 1 se zyada honi chahiye",
  "The Range 2 distance limit must be greater than Range 1"
 ],
 [
  "Free period ki date sahi nahi hai",
  "The free period date is not valid"
 ],
 [
  "Commission settings save nahi hui",
  "Commission settings could not be saved"
 ],
 [
  "History load nahi hui",
  "History could not be loaded"
 ],
 [
  "Sirf admin ye dekh sakta hai.",
  "Only an admin can view this."
 ],
 [
  "User nahi mila",
  "User not found"
 ],
 [
  "Deleted account ko block/unblock nahi kar sakte",
  "A deleted account cannot be blocked or unblocked"
 ],
 [
  "Account block ho gaya.",
  "Account blocked."
 ],
 [
  "Account unblock ho gaya.",
  "Account unblocked."
 ],
 [
  "Complaint nahi mili",
  "Complaint not found"
 ],
 [
  "Aapki complaint par action le liya gaya hai. Dhanyavaad.",
  "Action has been taken on your complaint. Thank you."
 ],
 [
  "Aapki complaint review ho gayi hai.",
  "Your complaint has been reviewed."
 ],
 [
  "Complaint update ho gayi.",
  "Complaint updated."
 ],
 [
  "Aapki complaint par driver ko warning di gayi hai. Dhanyavaad.",
  "The driver has been warned about your complaint. Thank you."
 ],
 [
  "Driver ko warning bhej di gayi aur complaint update ho gayi.",
  "Warning sent to the driver and the complaint updated."
 ],
 [
  "Request nahi mili",
  "Request not found"
 ],
 [
  "Is number par koi account nahi mila",
  "No account found for this number"
 ],
 [
  "Is number par koi account nahi mila — request close kar di.",
  "No account found for this number — the request has been closed."
 ],
 [
  "Account abhi delete nahi ho sakta:",
  "The account cannot be deleted yet:"
 ],
 [
  "Pending request nahi mili",
  "No pending request found"
 ],
 [
  "Aapki request abhi process nahi ho saki. Support se contact karein.",
  "Your request could not be processed. Please contact support."
 ],
 [
  "Request reject ho gayi.",
  "Request rejected."
 ],
 [
  "Account pehle hi delete hai",
  "The account is already deleted"
 ],
 [
  "Delete karne ka reason likhein",
  "Enter a reason for deletion"
 ],
 [
  "Account delete ho gaya.",
  "Account deleted."
 ],
 [
  "Admin email aur password required hain.",
  "Admin email and password are required."
 ],
 [
  "Valid admin email enter karo.",
  "Enter a valid admin email."
 ],
 [
  "Admin email ya password galat hai.",
  "The admin email or password is incorrect."
 ],
 [
  "Sirf admin is route ko access kar sakta hai.",
  "Only an admin can access this."
 ],
 [
  "Admin account nahi mila.",
  "Admin account not found."
 ],
 [
  "Admin profile fetch nahi ho payi.",
  "The admin profile could not be loaded."
 ],
 [
  "Sirf admin dashboard access kar sakta hai.",
  "Only an admin can open the dashboard."
 ],
 [
  "Admin dashboard data load nahi hua.",
  "Admin dashboard data could not be loaded."
 ],
 [
  "Sirf admin drivers dekh sakta hai.",
  "Only an admin can view drivers."
 ],
 [
  "Drivers load nahi hue.",
  "Drivers could not be loaded."
 ],
 [
  "Sirf admin driver update kar sakta hai.",
  "Only an admin can update a driver."
 ],
 [
  "Valid driver ID required hai.",
  "A valid driver ID is required."
 ],
 [
  "Driver account nahi mila.",
  "Driver account not found."
 ],
 [
  "Driver update ho gaya.",
  "Driver updated."
 ],
 [
  "Driver successfully approve ho gaya.",
  "Driver approved successfully."
 ],
 [
  "Driver application reject ho gayi.",
  "Driver application rejected."
 ],
 [
  "Warning message required hai.",
  "A warning message is required."
 ],
 [
  "Warning driver ko bhej di gayi.",
  "Warning sent to the driver."
 ],
 [
  "Driver block karne ka reason required hai.",
  "A reason is required to block the driver."
 ],
 [
  "Driver successfully block ho gaya.",
  "Driver blocked successfully."
 ],
 [
  "Driver successfully unblock ho gaya.",
  "Driver unblocked successfully."
 ],
 [
  "Driver blocked nahi hai.",
  "The driver is not blocked."
 ],
 [
  "Driver unblock request reject ho gayi.",
  "Driver unblock request rejected."
 ],
 [
  "Driver suspend ho gaya.",
  "Driver suspended."
 ],
 [
  "Driver update nahi hua.",
  "The driver could not be updated."
 ],
 [
  "Sirf admin customers dekh sakta hai.",
  "Only an admin can view customers."
 ],
 [
  "Customers load nahi ho sake.",
  "Customers could not be loaded."
 ],
 [
  "Sirf admin yeh action kar sakta hai.",
  "Only an admin can perform this action."
 ],
 [
  "Customer nahi mila.",
  "Customer not found."
 ],
 [
  "Block karne ka reason zaroori hai.",
  "A reason is required to block."
 ],
 [
  "Customer block ho gaya.",
  "Customer blocked."
 ],
 [
  "Customer unblock ho gaya.",
  "Customer unblocked."
 ],
 [
  "Invalid action. Sirf block ya unblock allowed hai.",
  "Invalid action. Only block or unblock is allowed."
 ],
 [
  "Customer update nahi ho saka.",
  "The customer could not be updated."
 ],
 [
  "Sirf admin documents dekh sakta hai.",
  "Only an admin can view documents."
 ],
 [
  "Document nahi mila.",
  "Document not found."
 ],
 [
  "Document file disk/shared storage par nahi mili.",
  "The document file was not found in storage."
 ],
 [
  "Document serve nahi ho saka.",
  "The document could not be opened."
 ],
 [
  "Sirf admin document verify kar sakta hai.",
  "Only an admin can verify documents."
 ],
 [
  "Action 'verify' ya 'reject' hona chahiye.",
  "The action must be 'verify' or 'reject'."
 ],
 [
  "Document clear nahi hai. Dobara upload karo.",
  "The document is not clear. Please upload it again."
 ],
 [
  "Document verified ho gaya.",
  "Document verified."
 ],
 [
  "Document reject ho gaya.",
  "Document rejected."
 ],
 [
  "Document update nahi ho saka.",
  "The document could not be updated."
 ],
 [
  "Sirf admin naam update kar sakta hai.",
  "Only an admin can update the name."
 ],
 [
  "Naam khali nahi ho sakta.",
  "The name cannot be empty."
 ],
 [
  "Naam already verified & locked hai.",
  "The name is already verified and locked."
 ],
 [
  "Naam verify karke lock kar diya gaya.",
  "The name has been verified and locked."
 ],
 [
  "Naam update ho gaya.",
  "Name updated."
 ],
 [
  "Naam update nahi ho saka.",
  "The name could not be updated."
 ],
 [
  "Sirf admin Route account configure kar sakta hai.",
  "Only an admin can configure the Route account."
 ],
 [
  "Razorpay Linked Account ID acc_ se start honi chahiye.",
  "The Razorpay linked account ID must start with acc_."
 ],
 [
  "Driver Razorpay Route account map ho gaya.",
  "Driver's Razorpay Route account linked."
 ],
 [
  "Driver Razorpay Route account mapping clear ho gayi.",
  "Driver's Razorpay Route account link removed."
 ],
 [
  "Razorpay Route account save nahi hua.",
  "The Razorpay Route account could not be saved."
 ],
 [
  "Sirf admin test mode manage kar sakta hai",
  "Only an admin can manage test mode"
 ],
 [
  "Test mode list load nahi hui",
  "The test mode list could not be loaded"
 ],
 [
  "Driver account nahi mila",
  "Driver account not found"
 ],
 [
  "Driver Test Mode update nahi hua",
  "Driver Test Mode could not be updated"
 ],
 [
  "Sirf admin test fee reset kar sakta hai",
  "Only an admin can reset the test fee"
 ],
 [
  "Platform fee reset se pehle is driver ka Test Mode ON karo",
  "Turn on Test Mode for this driver before resetting the platform fee"
 ],
 [
  "Test platform fee reset nahi hui",
  "Test platform fee could not be reset"
 ],
 [
  "Sirf admin test driver history reset kar sakta hai",
  "Only an admin can reset test driver history"
 ],
 [
  "History reset ke liye confirmation required hai",
  "Confirmation is required to reset history"
 ],
 [
  "History reset se pehle is driver ka Test Mode ON karo",
  "Turn on Test Mode for this driver before resetting history"
 ],
 [
  "Driver ki active Ride chal rahi hai. Pehle Ride complete/cancel karo, phir Test History reset karo.",
  "The driver has an active ride. Complete or cancel it first, then reset the test history."
 ],
 [
  "Test driver history reset nahi hui",
  "Test driver history could not be reset"
 ],
 [
  "Admin access required hai",
  "Admin access is required"
 ],
 [
  "Withdrawal list load nahi hui",
  "The withdrawal list could not be loaded"
 ],
 [
  "Withdrawal request nahi mili",
  "Withdrawal request not found"
 ],
 [
  "Sirf pending request approve ho sakti hai",
  "Only a pending request can be approved"
 ],
 [
  "Ye request reject nahi ho sakti",
  "This request cannot be rejected"
 ],
 [
  "Withdrawal pehle approve karo",
  "Approve the withdrawal first"
 ],
 [
  "Driver pending wallet amount mismatch hai",
  "The driver's pending wallet amount does not match"
 ],
 [
  "Withdrawal update nahi hui",
  "The withdrawal could not be updated"
 ],
 [
  "OTP SMS deliver nahi ho saki. Thodi der baad dobara try karein.",
  "The OTP SMS could not be delivered. Please try again shortly."
 ],
 [
  "Refresh token nahi mila. Dobara login karo.",
  "Session expired. Please log in again."
 ],
 [
  "Refresh token invalid ya expire ho gaya. Dobara login karo.",
  "Your session has expired. Please log in again."
 ],
 [
  "Session role mismatch. Is tab me dobara sahi account se login karo.",
  "This session belongs to a different account type. Please log in again with the correct account."
 ],
 [
  "User nahi mila.",
  "User not found."
 ],
 [
  "Account active nahi hai. Admin se sampark karo.",
  "This account is not active. Please contact the admin."
 ],
 [
  "Session nahi mili. Dobara login karo.",
  "Session not found. Please log in again."
 ],
 [
  "Session refresh ho gayi",
  "Session refreshed"
 ],
 [
  "Alternative phone primary phone se alag hona chahiye",
  "The alternative phone must be different from the primary phone"
 ],
 [
  "Profile successfully update ho gayi",
  "Profile updated successfully"
 ],
 [
  "Theme dark ya light hona chahiye",
  "Theme must be dark or light"
 ],
 [
  "Preferred UPI app any ya paytm hona chahiye",
  "Preferred UPI app must be 'any' or 'paytm'"
 ],
 [
  "Driver ko direct payment ride complete hone ke baad hi available hai",
  "Direct payment to the driver is available only after the ride is completed"
 ],
 [
  "Final locked fare valid nahi hai",
  "The final locked fare is not valid"
 ],
 [
  "Aap is ride ka driver payment access nahi kar sakte",
  "You cannot access the driver payment for this ride"
 ],
 [
  "Ye ride aapko assigned nahi hai",
  "This ride is not assigned to you"
 ],
 [
  "Assigned driver nahi mila",
  "Assigned driver not found"
 ],
 [
  "Driver ne abhi direct receiving UPI add nahi ki hai. Cash ya HimRideG online payment use karein.",
  "The driver has not added a UPI ID for direct payments yet. Please pay by cash or HimRideG online payment."
 ],
 [
  "Driver UPI payment details load nahi hui",
  "The driver's UPI payment details could not be loaded"
 ],
 [
  "Pehle driver UPI payment details open karein",
  "Open the driver's UPI payment details first"
 ],
 [
  "Driver ko payment confirmation bhej di gayi. Driver amount receive check karke confirm karega.",
  "Payment confirmation sent to the driver. The driver will confirm after checking the amount."
 ],
 [
  "Direct driver payment confirmation nahi bheji ja saki",
  "The direct payment confirmation could not be sent"
 ],
 [
  "Customer ka direct UPI payment confirmation abhi pending hai",
  "The customer's direct UPI payment confirmation is still pending"
 ],
 [
  "Ride complete hone ke baad hi payment receive confirm karein",
  "Confirm payment received only after the ride is completed"
 ],
 [
  "UPI payment received confirm ho gayi. HimRideG platform fee earning history me record ho gayi hai.",
  "UPI payment receipt confirmed. The HimRideG platform fee has been recorded in your earning history."
 ],
 [
  "Driver payment confirmation complete nahi hui",
  "The driver payment confirmation could not be completed"
 ],
 [
  "Direct payment history load nahi hui",
  "Direct payment history could not be loaded"
 ],
 [
  "Driver OTP SMS deliver nahi ho saki. Thodi der baad dobara try karein.",
  "The OTP SMS could not be delivered. Please try again shortly."
 ],
 [
  "Valid alternative mobile number enter karo",
  "Enter a valid alternative mobile number"
 ],
 [
  "Valid email address enter karo",
  "Enter a valid email address"
 ],
 [
  "Driver available hai",
  "Driver is available"
 ],
 [
  "Driver busy hai",
  "Driver is busy"
 ],
 [
  "Warning ID required hai",
  "Warning ID is required"
 ],
 [
  "Warning nahi mili",
  "Warning not found"
 ],
 [
  "Warning acknowledge ho gayi.",
  "Warning acknowledged."
 ],
 [
  "Reply required hai",
  "A reply is required"
 ],
 [
  "Reply admin ko bhej diya gaya.",
  "Reply sent to the admin."
 ],
 [
  "Driver nahi mila.",
  "Driver not found."
 ],
 [
  "Minimum withdrawal ₹100 hai.",
  "The minimum withdrawal is ₹100."
 ],
 [
  "UPI ID ya Bank Account number zaroori hai.",
  "A UPI ID or bank account number is required."
 ],
 [
  "Valid vehicle number enter karo (example: HP01AB1234)",
  "Enter a valid vehicle number (example: HP01AB1234)"
 ],
 [
  "Vehicle details save ho gayi",
  "Vehicle details saved"
 ],
 [
  "Aapka account already approved hai.",
  "Your account is already approved."
 ],
 [
  "Approval request already pending hai. Admin review kar raha hai.",
  "An approval request is already pending. The admin is reviewing it."
 ],
 [
  "Approval request admin ko bhej di gayi. 24-48 ghante mein review hoga.",
  "Approval request sent to the admin. It will be reviewed within 24–48 hours."
 ],
 [
  "Gender male, female ya other hona chahiye",
  "Gender must be male, female or other"
 ],
 [
  "Date of birth ek baar save hone ke baad lock ho jati hai. Badalne ke liye Help & Support se contact karein.",
  "Date of birth is locked once saved. Contact Help & Support to change it."
 ],
 [
  "Profile update ho gayi",
  "Profile updated"
 ],
 [
  "Driver account active nahi hai",
  "The driver account is not active"
 ],
 [
  "Approved driver account required hai",
  "An approved driver account is required"
 ],
 [
  "Ride accept karne ke liye driver online aur available hona chahiye",
  "You must be online and available to accept a ride"
 ],
 [
  "Ride request ab available nahi hai",
  "This ride request is no longer available"
 ],
 [
  "Current ride active. Ride complete hone ke baad Accept / Reject available hoga.",
  "You have an active ride. Accept / Reject will be available after it is completed."
 ],
 [
  "Driver abhi new ride accept nahi kar sakta",
  "You cannot accept a new ride right now"
 ],
 [
  "Ride release ho gayi. Driver ab next ride le sakta hai.",
  "Ride released. You can now take the next ride."
 ],
 [
  "Sirf driver test mode status dekh sakta hai",
  "Only a driver can view the test mode status"
 ],
 [
  "Test mode status load nahi hua",
  "Test mode status could not be loaded"
 ],
 [
  "Customer ne fare reject kiya. Ride current driver se release ho rahi hai.",
  "The customer rejected the fare. The ride is being released from the current driver."
 ],
 [
  "Booking ID valid nahi hai",
  "The booking ID is not valid"
 ],
 [
  "Aap is ride ka fare nahi dekh sakte",
  "You cannot view the fare for this ride"
 ],
 [
  "Fare details nahi mil sakin",
  "Fare details could not be found"
 ],
 [
  "Valid fare enter karo",
  "Enter a valid fare"
 ],
 [
  "Sirf driver fare bhej sakta hai",
  "Only the driver can send a fare"
 ],
 [
  "Is ride par driver assign nahi hai",
  "No driver is assigned to this ride"
 ],
 [
  "Aap is ride ke assigned driver nahi hain",
  "You are not the assigned driver for this ride"
 ],
 [
  "Finished ride par fare offer nahi bhej sakte",
  "A fare cannot be sent for a finished ride"
 ],
 [
  "Fare pehle hi final ho chuka hai",
  "The fare is already final"
 ],
 [
  "Initial driver fare pehle hi bheja ja chuka hai. Ab customer ke Accept / Reject / one-time Counter ka wait karo.",
  "Your initial fare has already been sent. Please wait for the customer to accept, reject or send a one-time counter."
 ],
 [
  "Initial fare sirf ride accept hone ke turant baad bhej sakte ho",
  "The initial fare can be sent only right after accepting the ride"
 ],
 [
  "Driver fare offer nahi bhej saka",
  "The fare offer could not be sent"
 ],
 [
  "Valid counter fare enter karo",
  "Enter a valid counter fare"
 ],
 [
  "Sirf customer counter offer bhej sakta hai",
  "Only the customer can send a counter offer"
 ],
 [
  "Aap is booking ke customer nahi hain",
  "You are not the customer for this booking"
 ],
 [
  "Finished ride par counter offer nahi bhej sakte",
  "A counter offer cannot be sent for a finished ride"
 ],
 [
  "Driver ke initial fare ke baad hi one-time counter bhej sakte hain",
  "A one-time counter can be sent only after the driver's initial fare"
 ],
 [
  "Customer ka one-time counter already use ho chuka hai",
  "The one-time counter offer has already been used"
 ],
 [
  "Counter offer nahi bheja ja saka",
  "The counter offer could not be sent"
 ],
 [
  "Finished ride ka fare accept nahi kar sakte",
  "The fare for a finished ride cannot be accepted"
 ],
 [
  "Fare pehle hi accept ho chuka hai",
  "The fare has already been accepted"
 ],
 [
  "Driver sirf customer ke active counter offer ko Accept kar sakta hai. Warna FINAL fare bhejein.",
  "You can only accept the customer's active counter offer. Otherwise, send your FINAL fare."
 ],
 [
  "Customer sirf active driver fare ko accept kar sakta hai.",
  "You can only accept the driver's active fare."
 ],
 [
  "Accept karne ke liye driver ka active offer nahi hai",
  "There is no active driver offer to accept"
 ],
 [
  "Accept karne ke liye customer ka active counter offer nahi hai",
  "There is no active customer counter offer to accept"
 ],
 [
  "Sirf customer ya driver fare accept kar sakta hai",
  "Only the customer or driver can accept the fare"
 ],
 [
  "Fare accept nahi ho saka",
  "The fare could not be accepted"
 ],
 [
  "Valid final fare enter karo",
  "Enter a valid final fare"
 ],
 [
  "Sirf driver final fare bhej sakta hai",
  "Only the driver can send the final fare"
 ],
 [
  "Finished ride par final fare nahi bhej sakte",
  "A final fare cannot be sent for a finished ride"
 ],
 [
  "Fare already locked hai",
  "The fare is already locked"
 ],
 [
  "Customer counter fare ke baad hi driver final fare bhejega",
  "The final fare can be sent only after the customer's counter offer"
 ],
 [
  "Final fare send nahi hua",
  "The final fare could not be sent"
 ],
 [
  "Sirf customer final fare accept kar sakta hai",
  "Only the customer can accept the final fare"
 ],
 [
  "Customer ke liye active driver fare available nahi hai",
  "There is no active driver fare available"
 ],
 [
  "Final fare accept nahi hua",
  "The final fare could not be accepted"
 ],
 [
  "Sirf booking customer final fare reject kar sakta hai",
  "Only the booking customer can reject the final fare"
 ],
 [
  "Reject karne ke liye active driver fare pending nahi hai",
  "There is no pending driver fare to reject"
 ],
 [
  "Final fare reject hua. Naya driver search ho raha hai.",
  "Final fare rejected. Searching for a new driver."
 ],
 [
  "Final fare reject nahi hua",
  "The final fare could not be rejected"
 ],
 [
  "Finished ride ka fare reject nahi kar sakte",
  "The fare for a finished ride cannot be rejected"
 ],
 [
  "Accepted fare reject nahi kiya ja sakta",
  "An accepted fare cannot be rejected"
 ],
 [
  "Driver customer counter reject nahi karega. Driver ko FINAL fare bhejna hai.",
  "Instead of rejecting the counter offer, send your FINAL fare."
 ],
 [
  "Reject option sirf active driver fare par customer ke liye available hai.",
  "Reject is available only to the customer on an active driver fare."
 ],
 [
  "Driver ka active offer nahi hai",
  "There is no active driver offer"
 ],
 [
  "Customer ka active counter offer nahi hai",
  "There is no active customer counter offer"
 ],
 [
  "Sirf customer ya driver fare reject kar sakta hai",
  "Only the customer or driver can reject the fare"
 ],
 [
  "Fare offer reject ho gaya",
  "Fare offer rejected"
 ],
 [
  "Fare reject nahi ho saka",
  "The fare could not be rejected"
 ],
 [
  "Valid Google account email enter karo",
  "Enter a valid Google account email"
 ],
 [
  "Google login sirf Customer ya Driver ke liye available hai",
  "Google login is available only for customers and drivers"
 ],
 [
  "Valid mobile number required hai",
  "A valid mobile number is required"
 ],
 [
  "Valid 10 digit Indian mobile number enter karo",
  "Enter a valid 10-digit Indian mobile number"
 ],
 [
  "Full name required hai",
  "Full name is required"
 ],
 [
  "Full name 100 characters se zyada nahi ho sakta",
  "Full name cannot be longer than 100 characters"
 ],
 [
  "Google sign-in verify nahi ho paya. Dobara Google account select karo.",
  "Google sign-in could not be verified. Please choose your Google account again."
 ],
 [
  "Is HimRideG account ke saath doosra Google account linked hai",
  "A different Google account is linked to this HimRideG account"
 ],
 [
  "Entered mobile number is Google-linked HimRideG account se match nahi karta",
  "The mobile number does not match the HimRideG account linked to this Google account"
 ],
 [
  "Ye mobile number pehle se doosre HimRideG account me registered hai",
  "This mobile number is already registered with another HimRideG account"
 ],
 [
  "Ye mobile number pehle se HimRideG account me registered hai. Us account ke linked Google account se login karo.",
  "This mobile number is already registered with HimRideG. Log in with the Google account linked to it."
 ],
 [
  "Google login successful. Basic info complete karo.",
  "Google login successful. Please complete your basic info."
 ],
 [
  "Basic Info route sirf Google login account ke liye hai",
  "Basic info is only for accounts that signed in with Google"
 ],
 [
  "Google Basic Info sirf Customer ya Driver ke liye available hai",
  "Google basic info is available only for customers and drivers"
 ],
 [
  "Basic info saved. Ab driver verification complete karo.",
  "Basic info saved. Now complete driver verification."
 ],
 [
  "Sirf booking customer online payment start kar sakta hai",
  "Only the booking customer can start an online payment"
 ],
 [
  "Cancelled/expired ride ka payment nahi ho sakta",
  "A cancelled or expired ride cannot be paid"
 ],
 [
  "Final locked fare ke bina payment start nahi ho sakti",
  "Payment cannot start without a final locked fare"
 ],
 [
  "Payment driver ke ride complete karne ke baad hi start hogi",
  "Payment starts only after the driver completes the ride"
 ],
 [
  "Online payment ride complete hone ke baad Pay Now hogi",
  "Online payment (Pay Now) is available after the ride is completed"
 ],
 [
  "Pehle payment option choose karo",
  "Choose a payment option first"
 ],
 [
  "Booking ID required hai",
  "A booking ID is required"
 ],
 [
  "Booking nahi mili",
  "Booking not found"
 ],
 [
  "Payment pehle hi complete hai",
  "The payment is already complete"
 ],
 [
  "Razorpay payment order ready hai",
  "Razorpay payment order is ready"
 ],
 [
  "Payment order create nahi ho saka",
  "The payment order could not be created"
 ],
 [
  "Payment verification details incomplete hain",
  "Payment verification details are incomplete"
 ],
 [
  "Payment pehle hi verify hai",
  "The payment is already verified"
 ],
 [
  "Razorpay Order ID match nahi hui",
  "The Razorpay order ID does not match"
 ],
 [
  "Payment signature invalid hai",
  "The payment signature is invalid"
 ],
 [
  "Payment successfully verify ho gayi",
  "Payment verified successfully"
 ],
 [
  "Payment verify nahi ho saka",
  "The payment could not be verified"
 ],
 [
  "Payment option Online, Advance ya Scheduled hona chahiye",
  "The payment option must be Online, Advance or Scheduled"
 ],
 [
  "Final fare lock hone ke baad hi payment option choose hoga",
  "A payment option can be chosen only after the fare is locked"
 ],
 [
  "Is ride par payment option change nahi ho sakta",
  "The payment option for this ride cannot be changed"
 ],
 [
  "Payment option ride complete hone ke baad hi choose ho sakta hai",
  "A payment option can be chosen only after the ride is completed"
 ],
 [
  "Payment already complete hai",
  "The payment is already complete"
 ],
 [
  "Ride process start hone ke baad Advance Payment select nahi ho sakti",
  "Advance payment cannot be selected after the ride has started"
 ],
 [
  "Scheduled Payment selected — Pay Now option available hai",
  "Scheduled payment selected — Pay Now is available"
 ],
 [
  "Online Payment selected — ride complete hone ke baad payment hogi",
  "Online payment selected — you will pay after the ride is completed"
 ],
 [
  "Payment option select nahi ho saka",
  "The payment option could not be selected"
 ],
 [
  "Payment method Online ya Cash hona chahiye",
  "The payment method must be Online or Cash"
 ],
 [
  "Is ride ka payment already complete hai",
  "Payment for this ride is already complete"
 ],
 [
  "Online/Cash final method ride complete hone ke baad choose hoga",
  "Online or cash can be chosen after the ride is completed"
 ],
 [
  "Final fare lock nahi hai",
  "The final fare is not locked"
 ],
 [
  "Payment method select nahi ho saka",
  "The payment method could not be selected"
 ],
 [
  "Sirf assigned driver ya admin cash payment confirm kar sakta hai",
  "Only the assigned driver or an admin can confirm a cash payment"
 ],
 [
  "Cash payment ride complete hone ke baad confirm hogi",
  "A cash payment can be confirmed after the ride is completed"
 ],
 [
  "Ride ka online payment already paid hai",
  "This ride has already been paid online"
 ],
 [
  "Cash payment already confirmed hai",
  "The cash payment is already confirmed"
 ],
 [
  "Cash received confirm ho gaya",
  "Cash receipt confirmed"
 ],
 [
  "Cash payment confirm nahi ho saka",
  "The cash payment could not be confirmed"
 ],
 [
  "Payment status nahi mil saka",
  "The payment status could not be found"
 ],
 [
  "Is booking ka payment abhi paid nahi hai",
  "This booking has not been paid yet"
 ],
 [
  "Receipt nahi mil saka",
  "The receipt could not be found"
 ],
 [
  "Sirf admin settlement retry kar sakta hai",
  "Only an admin can retry a settlement"
 ],
 [
  "Sirf paid online booking ka settlement retry ho sakta hai",
  "Settlement can be retried only for a paid online booking"
 ],
 [
  "Driver wallet settlement ride complete hone ke baad retry hoga",
  "The driver wallet settlement can be retried after the ride is completed"
 ],
 [
  "Settlement retry nahi hua",
  "The settlement retry failed"
 ],
 [
  "Sirf driver wallet access kar sakta hai",
  "Only a driver can access the wallet"
 ],
 [
  "Driver nahi mila",
  "Driver not found"
 ],
 [
  "Wallet load nahi hua",
  "The wallet could not be loaded"
 ],
 [
  "Wallet top-up ₹100 se ₹50,000 ke beech hona chahiye",
  "Wallet top-up must be between ₹100 and ₹50,000"
 ],
 [
  "Top-up order create nahi hua",
  "The top-up order could not be created"
 ],
 [
  "Top-up verification details invalid hain",
  "Top-up verification details are invalid"
 ],
 [
  "Top-up payment signature invalid hai",
  "The top-up payment signature is invalid"
 ],
 [
  "Top-up already credited hai",
  "The top-up has already been credited"
 ],
 [
  "Top-up verify nahi hua",
  "The top-up could not be verified"
 ],
 [
  "Minimum withdrawal ₹100 hai",
  "The minimum withdrawal is ₹100"
 ],
 [
  "Valid payout method select karo",
  "Select a valid payout method"
 ],
 [
  "Wallet balance kam hai",
  "Insufficient wallet balance"
 ],
 [
  "Bank account details complete nahi hain",
  "Bank account details are incomplete"
 ],
 [
  "UPI ID configured nahi hai",
  "No UPI ID is set up"
 ],
 [
  "Withdrawal request admin ko bhej di gayi",
  "Withdrawal request sent to the admin"
 ],
 [
  "Withdrawal request nahi bani",
  "The withdrawal request could not be created"
 ],
 [
  "Withdrawals load nahi hui",
  "Withdrawals could not be loaded"
 ],
 [
  "Valid latitude/longitude required hai",
  "A valid location is required"
 ],
 [
  "Route ke liye valid pickup/drop coordinates required hain",
  "Valid pickup and drop locations are required for the route"
 ],
 [
  "Road route available nahi hai",
  "No road route is available"
 ],
 [
  "Valid Expo push token required hai",
  "A valid push token is required"
 ],
 [
  "Push token register nahi hua",
  "Notifications could not be registered"
 ],
 [
  "Push token unregister nahi hua",
  "Notifications could not be turned off"
 ],
 [
  "Agar ye phone tray me aayi hai to push registration working hai.",
  "If this appears in your notification tray, notifications are working."
 ],
 [
  "Registered push device nahi mila",
  "No registered device found for notifications"
 ],
 [
  "Test push send nahi hui",
  "The test notification could not be sent"
 ],
 [
  "Aap is booking ka payment nahi kar sakte",
  "You cannot pay for this booking"
 ],
 [
  "Is ride stage/payment plan par online payment allowed nahi hai",
  "Online payment is not allowed at this stage of the ride"
 ],
 [
  "Razorpay Payment ID missing hai",
  "The Razorpay payment ID is missing"
 ],
 [
  "Razorpay payment amount/currency booking fare se match nahi karti",
  "The payment amount does not match the booking fare"
 ],
 [
  "Booking kisi doosri payment se already paid hai",
  "This booking has already been paid by another payment"
 ],
 [
  "Final fare lock/payment plan ke hisaab se Pay Now abhi available nahi hai",
  "Pay Now is not available yet for this ride"
 ],
 [
  "Is booking ka payment pehle hi ho chuka hai",
  "This booking has already been paid"
 ],
 [
  "Final fare valid nahi hai — driver/customer fare lock check karo",
  "The final fare is not valid — please check the locked fare"
 ],
 [
  "Razorpay payment ready hai",
  "Razorpay payment is ready"
 ],
 [
  "Is ride stage/payment plan par payment verify nahi ho sakta",
  "Payment cannot be verified at this stage of the ride"
 ],
 [
  "Payment signature invalid hai — payment verify nahi hui",
  "The payment signature is invalid — payment not verified"
 ],
 [
  "Fetched payment ki Order ID mismatch hai",
  "The payment order ID does not match"
 ],
 [
  "Fetched payment amount booking fare se match nahi karti",
  "The payment amount does not match the booking fare"
 ],
 [
  "Customer ki online payment successfully receive ho gayi.",
  "The customer's online payment has been received."
 ],
 [
  "Payment captured aur successfully verify ho gayi! 🎉",
  "Payment received and verified successfully! 🎉"
 ],
 [
  "Payment failure record ho gaya",
  "Payment failure recorded"
 ],
 [
  "Payment failure record nahi ho saka",
  "The payment failure could not be recorded"
 ],
 [
  "Cash payment ride complete hone ke baad select karo",
  "Choose cash payment after the ride is completed"
 ],
 [
  "Customer ne cash payment select ki hai. Cash receive karke confirm karein.",
  "The customer chose to pay in cash. Confirm after receiving the cash."
 ],
 [
  "Cash payment select nahi ho saka",
  "Cash payment could not be selected"
 ],
 [
  "Cash payment ko sirf assigned driver Cash Received confirm karke Paid kar sakta hai",
  "Only the assigned driver can mark a cash payment as paid by confirming Cash Received"
 ],
 [
  "Ride complete hone ke baad cash confirm karo",
  "Confirm cash after the ride is completed"
 ],
 [
  "Payment already complete hai — driver release ho chuka hai",
  "Payment is already complete — the driver has been released"
 ],
 [
  "Final fare valid nahi hai",
  "The final fare is not valid"
 ],
 [
  "Cash payment successfully confirm ho gayi. Ab aap next ride le sakte hain.",
  "Cash payment confirmed. You can now take the next ride."
 ],
 [
  "Cash payment confirm ho gaya! Driver release ho gaya. ✅",
  "Cash payment confirmed! The driver has been released. ✅"
 ],
 [
  "Advance payment abhi disabled hai. Ride complete hone ke baad Pay Online ya Cash Payment use karein.",
  "Advance payment is currently disabled. After the ride, use Pay Online or Cash Payment."
 ],
 [
  "Sirf assigned driver ya admin online receipt status confirm kar sakta hai",
  "Only the assigned driver or an admin can confirm online payment receipt"
 ],
 [
  "Online payment abhi server par verified paid nahi hai",
  "The online payment is not yet verified as paid"
 ],
 [
  "Online payment already verified hai",
  "The online payment is already verified"
 ],
 [
  "Online payment receipt confirm nahi ho saka",
  "The online payment receipt could not be confirmed"
 ],
 [
  "Is booking ka payment abhi tak complete nahi hua",
  "Payment for this booking is not complete yet"
 ],
 [
  "Payment receipt nahi mil saki",
  "The payment receipt could not be found"
 ],
 [
  "Ride close sirf driver ya admin kar sakta hai",
  "Only the driver or an admin can close the ride"
 ],
 [
  "Payment already complete hai. Aap next ride ke liye free hain ✅",
  "Payment is already complete. You are free for the next ride ✅"
 ],
 [
  "Ride close ho gayi. Aap next ride ke liye free hain ✅ (customer payment pending)",
  "Ride closed. You are free for the next ride ✅ (customer payment pending)"
 ],
 [
  "Ride close nahi ho saki",
  "The ride could not be closed"
 ],
 [
  "Ye aapki ride nahi hai",
  "This is not your ride"
 ],
 [
  "Ride complete hone ke baad hi pay later chun sakte hain",
  "Pay Later can be chosen only after the ride is completed"
 ],
 [
  "Theek hai — payment baad me 'My Rides' ya Home banner se kar sakte hain.",
  "Okay — you can pay later from My Rides or the Home banner."
 ],
 [
  "Pay later set nahi ho saka",
  "Pay Later could not be set"
 ],
 [
  "Sirf driver platform fee access kar sakta hai",
  "Only a driver can access the platform fee"
 ],
 [
  "Platform fee status load nahi hua",
  "Platform fee status could not be loaded"
 ],
 [
  "Platform fee payment ke liye Razorpay live payment setup ready nahi hai",
  "Online payment for the platform fee is not available yet"
 ],
 [
  "Aapki HimRideG platform fee already clear hai",
  "Your HimRideG platform fee is already cleared"
 ],
 [
  "Platform fee payment ready hai",
  "Platform fee payment is ready"
 ],
 [
  "Platform fee order create nahi hua",
  "The platform fee order could not be created"
 ],
 [
  "Platform fee verification details incomplete hain",
  "Platform fee verification details are incomplete"
 ],
 [
  "Razorpay live payment setup ready nahi hai",
  "Online payment is not available yet"
 ],
 [
  "Platform fee payment signature invalid hai",
  "The platform fee payment signature is invalid"
 ],
 [
  "Platform fee order is driver account se match nahi karta",
  "The platform fee order does not match this driver account"
 ],
 [
  "Razorpay payment/order mismatch hai",
  "The payment does not match the order"
 ],
 [
  "Platform fee payment amount/currency mismatch hai",
  "The platform fee payment amount does not match"
 ],
 [
  "Platform fee payment successful ✅ Ab aap ride accept kar sakte hain.",
  "Platform fee paid ✅ You can now accept rides."
 ],
 [
  "Platform fee verify nahi hui",
  "The platform fee could not be verified"
 ],
 [
  "Sirf customer complaint kar sakta hai",
  "Only a customer can file a complaint"
 ],
 [
  "Ride select karein",
  "Select a ride"
 ],
 [
  "Complaint thoda detail me likhein (kam se kam 5 akshar)",
  "Please describe the complaint in more detail (at least 5 characters)"
 ],
 [
  "Ride nahi mili",
  "Ride not found"
 ],
 [
  "Is ride me koi driver assign nahi tha",
  "No driver was assigned to this ride"
 ],
 [
  "Driver ke pickup par pahunchne ke baad hi complaint kar sakte hain",
  "A complaint can be filed only after the driver reaches the pickup"
 ],
 [
  "Is ride ki complaint pehle hi ho chuki hai. Admin team dekh rahi hai.",
  "A complaint for this ride has already been filed. The admin team is reviewing it."
 ],
 [
  "Complaint admin team ko bhej di gayi. Aapki details driver ko nahi dikhayi jaayengi.",
  "Complaint sent to the admin team. Your details will not be shown to the driver."
 ],
 [
  "Aapki account delete request pehle se admin ke paas hai. 7 din ke andar process hogi.",
  "Your account deletion request is already with the admin. It will be processed within 7 days."
 ],
 [
  "Account delete request admin ko bhej di gayi. 7 din ke andar process hogi aur aapko SMS/notification milega.",
  "Account deletion request sent to the admin. It will be processed within 7 days and you will receive an SMS/notification."
 ],
 [
  "Delete request cancel ho gayi.",
  "Deletion request cancelled."
 ],
 [
  "Koi pending request nahi hai.",
  "There is no pending request."
 ],
 [
  "Email sahi nahi hai (khali chhod sakte hain)",
  "The email is not valid (you can leave it empty)"
 ],
 [
  "Request mil gayi. HimRideG team 7 din ke andar is number par call/SMS karke verify karegi, phir account delete hoga.",
  "Request received. The HimRideG team will verify it by call/SMS on this number within 7 days, then the account will be deleted."
 ],
 [
  "Payment confirm nahi hui",
  "The payment could not be confirmed"
 ],
 [
  "Payment confirm ho gayi. Aap next ride ke liye free hain ✅",
  "Payment confirmed. You are free for the next ride ✅"
 ],
 [
  "Payment sirf assigned driver confirm kar sakta hai",
  "Only the assigned driver can confirm the payment"
 ],
 [
  "Sirf assigned driver is ride ki payment confirm kar sakta hai",
  "Only the assigned driver can confirm payment for this ride"
 ],
 [
  "Payment confirm save ho gayi. Ride complete karte hi booking release ho jayegi ✅",
  "Payment confirmation saved. The booking will be released when you complete the ride ✅"
 ],
 [
  "Is ride status me payment confirm nahi ho sakti",
  "Payment cannot be confirmed at this stage of the ride"
 ],
 [
  "Payment confirm nahi ho saki",
  "The payment could not be confirmed"
 ],
 [
  "Sirf is ride ka customer report kar sakta hai",
  "Only this ride's customer can file a report"
 ],
 [
  "Is ride me driver assigned nahi hai",
  "No driver is assigned to this ride"
 ],
 [
  "Report admin ko bhej di gayi. HimRideG team check karegi.",
  "Report sent to the admin. The HimRideG team will look into it."
 ],
 [
  "Report nahi bhej saki",
  "The report could not be sent"
 ],
 [
  "Payment status check nahi ho saka",
  "The payment status could not be checked"
 ],
 [
  "Website link nahi ban saka. Dobara try karein.",
  "The website link could not be created. Please try again."
 ],
 [
  "Ye link expire ho gaya hai. App me dobara 'Upload on Website' dabayein.",
  "This link has expired. Tap 'Upload on Website' in the app again."
 ],
 [
  "Account nahi mila",
  "Account not found"
 ],
 [
  "Website login nahi ho saka. App se dobara try karein.",
  "Website login failed. Please try again from the app."
 ],
 [
  "Payment method nahi mila",
  "Payment method not found"
 ],
 [
  "Primary payout method secure data nahi mila",
  "Secure details for the primary payout method were not found"
 ],
 [
  "Primary UPI ID required hai",
  "A primary UPI ID is required"
 ],
 [
  "Primary bank account secure data incomplete hai",
  "Secure details for the primary bank account are incomplete"
 ],
 [
  "Wallet load nahi ho saka",
  "The wallet could not be loaded"
 ],
 [
  "Payout settings save ho gayi",
  "Payout settings saved"
 ],
 [
  "Payout settings save nahi ho saki",
  "Payout settings could not be saved"
 ],
 [
  "Valid payout method required hai",
  "A valid payout method is required"
 ],
 [
  "Valid UPI ID required hai",
  "A valid UPI ID is required"
 ],
 [
  "UPI pehle se saved hai",
  "This UPI ID is already saved"
 ],
 [
  "Account holder name required hai",
  "Account holder name is required"
 ],
 [
  "Bank name required hai",
  "Bank name is required"
 ],
 [
  "Valid account number required hai",
  "A valid account number is required"
 ],
 [
  "Valid IFSC required hai",
  "A valid IFSC is required"
 ],
 [
  "Bank account pehle se saved hai",
  "This bank account is already saved"
 ],
 [
  "Payment method securely save ho gaya",
  "Payment method saved securely"
 ],
 [
  "Payment method save nahi hua",
  "The payment method could not be saved"
 ],
 [
  "Primary receiving account update ho gaya",
  "Primary receiving account updated"
 ],
 [
  "Primary receiving account update nahi hua",
  "The primary receiving account could not be updated"
 ],
 [
  "Payment method remove ho gaya",
  "Payment method removed"
 ],
 [
  "Payment method remove nahi hua",
  "The payment method could not be removed"
 ],
 [
  "Primary payout method nahi mila",
  "Primary payout method not found"
 ],
 [
  "Primary payout method required hai",
  "A primary payout method is required"
 ],
 [
  "Payout processed ho gaya",
  "Payout processed"
 ],
 [
  "Payout request bank/RazorpayX confirmation me hai. Duplicate payout se bachne ke liye same request safely reconcile hogi.",
  "The payout is awaiting bank confirmation. The same request will be reconciled safely to avoid a duplicate payout."
 ],
 [
  "Payout RazorpayX ko submit ho gaya",
  "Payout submitted"
 ],
 [
  "Withdrawal request nahi ho saki",
  "The withdrawal request could not be made"
 ],
 [
  "Withdrawal history load nahi hui",
  "Withdrawal history could not be loaded"
 ],
 [
  "Withdrawal request nahi mila",
  "Withdrawal request not found"
 ],
 [
  "Sirf failed withdrawal ko retry kar sakte hain",
  "Only a failed withdrawal can be retried"
 ],
 [
  "Withdrawal retry start ho gaya",
  "Withdrawal retry started"
 ],
 [
  "Withdrawal retry nahi hua",
  "The withdrawal retry failed"
 ],
 [
  "Payout status sync nahi ho saka",
  "The payout status could not be updated"
 ],
 [
  "Sirf driver ride accept kar sakta hai",
  "Only a driver can accept rides"
 ],
 [
  "Bahut zyada OTP requests hui hain. 10 minute baad dobara try karein.",
  "Too many OTP requests. Please try again in 10 minutes."
 ],
 [
  "Bahut zyada login attempts hui hain. Thodi der baad dobara try karein.",
  "Too many login attempts. Please try again shortly."
 ],
 [
  "Admin login attempts limit ho gayi hai. Thodi der baad try karein.",
  "Admin login attempt limit reached. Please try again shortly."
 ],
 [
  "Payment requests temporarily limited hain. Thodi der baad try karein.",
  "Payment requests are temporarily limited. Please try again shortly."
 ],
 [
  "Bahut zyada requests aa rahi hain. Ek minute baad try karein.",
  "Too many requests. Please try again in a minute."
 ],
 [
  "Ride actions bahut tezi se aa rahe hain. Thodi der baad dobara try karein.",
  "Too many ride actions at once. Please try again shortly."
 ],
 [
  "Live location updates temporarily limited hain. Ek moment baad retry karein.",
  "Live location updates are temporarily limited. Please retry in a moment."
 ],
 [
  "Sirf JPG, PNG, WEBP ya PDF file upload karo",
  "Upload only a JPG, PNG, WEBP or PDF file"
 ],
 [
  "Thodi der baad try karein.",
  "Please try again shortly."
 ],
 [
  "Driver auto-release ho gaya. Customer payment baad me bhi kar sakta hai.",
  "The driver has been released automatically. The customer can still pay later."
 ],
 [
  "Driver ne ride close kar di. Aap payment baad me bhi kar sakte hain.",
  "The driver has closed the ride. You can still pay later."
 ],
 [
  "Aap next ride ke liye free hain ✅",
  "You are free for the next ride ✅"
 ],
 [
  "Pichli ride ka payment pending hai, par aapko next ride milti rahegi.",
  "Payment for your last ride is pending, but you will keep getting new rides."
 ],
 [
  "Ride close ho gayi. Ab nayi bookings aayengi.",
  "Ride closed. New bookings will now come in."
 ],
 [
  "Aapki ride complete hai. Payment app me 'My Rides' se kabhi bhi kar sakte hain.",
  "Your ride is complete. You can pay anytime from My Rides in the app."
 ],
 [
  "Sirf assigned driver is ride ko close kar sakta hai",
  "Only the assigned driver can close this ride"
 ],
 [
  "Ride complete hone ke baad hi close kar sakte ho",
  "The ride can be closed only after it is completed"
 ],
 [
  "Payment confirmation pending hai. Payment receive hone ke baad next ride available hogi",
  "Payment confirmation is pending. The next ride will be available after the payment is received"
 ],
 [
  "Google credential required hai",
  "Google sign-in is required"
 ],
 [
  "Google credential invalid hai",
  "Google sign-in is invalid"
 ],
 [
  "Google ID token expire ho chuka hai",
  "Google sign-in has expired. Please try again."
 ],
 [
  "Google email verified nahi hai",
  "Your Google email is not verified"
 ],
 [
  "Aap is booking ke payment data access nahi kar sakte",
  "You cannot access payment data for this booking"
 ],
 [
  "Driver assigned nahi hai",
  "No driver is assigned"
 ],
 [
  "Primary payout account ko ride earning submit ho gayi.",
  "Ride earnings sent to your primary payout account."
 ],
 [
  "Payout amount valid nahi hai",
  "The payout amount is not valid"
 ],
 [
  "Scheduled ride ke liye date/time required hai",
  "A date and time are required for a scheduled ride"
 ],
 [
  "Current ride active. Ride complete hone ke baad action available hoga.",
  "You have an active ride. This action will be available after it is completed."
 ],
 [
  "Final fare accept hone ke baad hi pickup ke liye ja sakte ho",
  "You can go to pickup only after the final fare is accepted"
 ],
 [
  "Sirf unconfirmed accepted ride ko release kar sakte ho",
  "Only an accepted ride without a locked fare can be released"
 ],
 [
  "Driver ne unconfirmed ride release ki. Naya driver search ho raha hai.",
  "The driver released the ride. Searching for a new driver."
 ],
 [
  "Ride request ab kisi aur driver ne accept kar li ya expire ho gayi",
  "This ride request was accepted by another driver or has expired"
 ],
 [
  "Ride accept process already in progress hai. Request refresh karo.",
  "This ride is already being accepted. Please refresh."
 ],
 [
  "Fast2SMS se OTP send nahi ho saka",
  "The OTP could not be sent"
 ],
 [
  "Booking me assigned driver nahi hai",
  "No driver is assigned to this booking"
 ],
 [
  "Driver wallet nahi mila",
  "Driver wallet not found"
 ],
 [
  "Valid UPI ID save karo",
  "Save a valid UPI ID"
 ],
 [
  "Valid bank account number save karo",
  "Save a valid bank account number"
 ],
 [
  "Valid IFSC code save karo",
  "Save a valid IFSC code"
 ],
 [
  "Withdrawal method UPI ya bank hona chahiye",
  "The withdrawal method must be UPI or bank"
 ],
 [
  "Sirf driver fare offer kar sakta hai",
  "Only the driver can offer a fare"
 ],
 [
  "Booking ID aur valid amount required hai",
  "A booking ID and a valid amount are required"
 ],
 [
  "Fare ₹50 se ₹10,000 ke beech hona chahiye",
  "The fare must be between ₹50 and ₹10,000"
 ],
 [
  "Initial driver fare already sent. Customer ke one-time counter ka wait karo.",
  "Your initial fare has already been sent. Please wait for the customer's one-time counter."
 ],
 [
  "Initial fare sirf accepted ride par bhej sakte ho.",
  "The initial fare can be sent only on an accepted ride."
 ],
 [
  "Fare offer nahi ho saka",
  "The fare could not be offered"
 ],
 [
  "Sirf customer counter offer kar sakta hai",
  "Only the customer can send a counter offer"
 ],
 [
  "Counter fare ₹50 se ₹10,000 ke beech hona chahiye",
  "The counter fare must be between ₹50 and ₹10,000"
 ],
 [
  "Counter sirf driver ke initial fare ke baad bhej sakte ho.",
  "A counter can be sent only after the driver's initial fare."
 ],
 [
  "Customer ka one-time counter already use ho chuka hai.",
  "The one-time counter offer has already been used."
 ],
 [
  "Counter offer nahi ho saka",
  "The counter offer could not be sent"
 ],
 [
  "Ride complete hone par payment karna hoga",
  "Payment is due when the ride is completed"
 ],
 [
  "Updated fare flow required: Reject sirf driver FINAL fare par customer karega.",
  "Only the customer can reject, and only the driver's final fare."
 ],
 [
  "Fare reject ho gaya. Phir se negotiate karo ya ride cancel karo.",
  "Fare rejected. Negotiate again or cancel the ride."
 ],
 [
  "Fare reject ho gaya",
  "Fare rejected"
 ],
 [
  "Booking ID aur payment method required hai",
  "A booking ID and payment method are required"
 ],
 [
  "Payment method online ya cash hona chahiye",
  "The payment method must be online or cash"
 ],
 [
  "Payment sirf completed ride ke liye",
  "Payment is only for a completed ride"
 ],
 [
  "Payment already ho chuki hai",
  "Payment has already been made"
 ],
 [
  "Driver ko cash collection notify kar diya",
  "The driver has been notified to collect cash"
 ],
 [
  "Online payment ke liye proceed karo",
  "Proceed to online payment"
 ],
 [
  "Payment initiate nahi ho saka",
  "The payment could not be started"
 ],
 [
  "Google public keys response empty hai",
  "Google sign-in could not be verified. Please try again."
 ],
 [
  "Google signing key nahi mili",
  "Google sign-in could not be verified. Please try again."
 ],
 [
  "Google ID token signature invalid hai",
  "Google sign-in could not be verified. Please try again."
 ],
 [
  "GOOGLE_CLIENT_ID server environment me configured nahi hai",
  "Google sign-in could not be verified. Please try again."
 ],
 [
  "Google ID token format invalid hai",
  "Google sign-in could not be verified. Please try again."
 ],
 [
  "Google ID token algorithm invalid hai",
  "Google sign-in could not be verified. Please try again."
 ],
 [
  "Google ID token issuer invalid hai",
  "Google sign-in could not be verified. Please try again."
 ],
 [
  "Google ID token audience invalid hai",
  "Google sign-in could not be verified. Please try again."
 ],
 [
  "Google ID token issue time invalid hai",
  "Google sign-in could not be verified. Please try again."
 ],
 [
  "Google account ID missing hai",
  "Google sign-in could not be verified. Please try again."
 ],
 [
  "Razorpay live keys server par configure nahi hain",
  "Online payment is not available right now."
 ],
 [
  "REAL_MONEY_MODE me rzp_live_ Razorpay key required hai",
  "Online payment is not available right now."
 ],
 [
  "Razorpay API keys configured nahi hain",
  "Online payment is not available right now."
 ],
 [
  "Production map service key configured nahi hai",
  "The service is temporarily unavailable. Please try again later."
 ],
 [
  "Razorpay payment ID missing hai",
  "The Razorpay payment ID is missing"
 ],
 [
  "Driver Razorpay Route linked account configured nahi hai",
  "The driver's payout account is not linked yet"
 ],
 [
  "Booking order ID se nahi mili",
  "Booking not found for this order"
 ],
 [
  "Webhook process nahi hua",
  "The service is temporarily unavailable. Please try again later."
 ],
 [
  "Booking webhook mapping nahi mili",
  "The service is temporarily unavailable. Please try again later."
 ],
 [
  "Matching withdrawal nahi mili",
  "Matching withdrawal not found"
 ],
 [
  "Valid date of birth chahiye",
  "A valid date of birth is required"
 ],
 [
  "Wallet top-up hua aur commission due automatically clear hua",
  "Wallet topped up and commission due cleared automatically"
 ],
 [
  "Cash selected. Driver cash receive karke confirm karega.",
  "Cash selected. The driver will confirm after receiving the cash."
 ],
 [
  "Admin ne driver application reject ki.",
  "Your driver application was rejected by the admin."
 ],
 [
  "Admin ne unblock request reject ki.",
  "Your unblock request was rejected by the admin."
 ],
 [
  "Admin ne account suspend kiya.",
  "Your account has been suspended by the admin."
 ],
 [
  "Online ya Offline (cash) chuniye",
  "Choose Online or Offline (cash)"
 ],
 [
  "Withdrawal rejected — amount wallet me release",
  "Withdrawal rejected — the amount has been returned to the wallet"
 ],
 [
  "Mode aur rates valid daaliye",
  "Enter a valid mode and rates"
 ],
 [
  "Fare aur km valid daaliye",
  "Enter a valid fare and distance"
 ],
 [
  "Sahi 10 digit mobile number likhein",
  "Enter a valid 10-digit mobile number"
 ],
 [
  "Cash ride platform commission wallet se debit",
  "Cash ride platform commission debited from the wallet"
 ],
 [
  "Counter offer bhej diya gaya",
  "Counter offer sent"
 ]
].map(([source, english]) => [normalize(source), english]));

const PATTERNS = [
 [
  "Request pehle hi {0} hai",
  "The request is already {0}"
 ],
 [
  "Driver approve nahi ho sakta. Yeh documents missing ya rejected hain: {0}",
  "The driver cannot be approved. These documents are missing or rejected: {0}"
 ],
 [
  "{0} document verify ho gaya!",
  "{0} document verified!"
 ],
 [
  "Aapka naam verify ho gaya: {0}",
  "Your name has been verified: {0}"
 ],
 [
  "{0} ka Test Mode ON ho gaya. Platform fee lock bypass rahega.",
  "Test Mode is ON for {0}. The platform fee lock will be bypassed."
 ],
 [
  "{0} ka Test Mode OFF ho gaya. Normal platform fee rule apply hoga.",
  "Test Mode is OFF for {0}. The normal platform fee rule applies."
 ],
 [
  "Test platform fee ₹{0} reset ho gayi. Ride history aur earnings preserve hain.",
  "Test platform fee of ₹{0} has been reset. Ride history and earnings are kept."
 ],
 [
  "Customer ne ₹{0} aapke UPI par pay karne ka confirmation diya hai. Account me amount check karke Payment Received confirm karein.",
  "The customer has confirmed paying ₹{0} to your UPI. Check the amount in your account and confirm Payment Received."
 ],
 [
  "Driver ne ₹{0} UPI payment receive confirm kar di. Ride payment complete hai.",
  "The driver has confirmed receiving ₹{0} by UPI. The ride payment is complete."
 ],
 [
  "Insufficient balance. Aapka balance ₹{0} hai.",
  "Insufficient balance. Your balance is ₹{0}."
 ],
 [
  "₹{0} withdrawal request submit ho gayi. Admin 24-48 ghante mein process karega.",
  "Withdrawal request of ₹{0} submitted. The admin will process it within 24–48 hours."
 ],
 [
  "Ye cheezein abhi baaki hain: {0}",
  "These items are still pending: {0}"
 ],
 [
  "Driver ne ₹{0} fare bheja. Accept, Reject ya Counter karein.",
  "The driver sent a fare of ₹{0}. Accept, reject or counter it."
 ],
 [
  "Customer ne ₹{0} counter bheja. Accept karein ya apna FINAL fare bhejein.",
  "The customer sent a counter offer of ₹{0}. Accept it or send your FINAL fare."
 ],
 [
  "Driver ne ₹{0} final fare bheja. Accept ya Reject karein.",
  "The driver sent a final fare of ₹{0}. Accept or reject it."
 ],
 [
  "₹{0} fare accept ho gaya. GO TO PICKUP enabled hai.",
  "Fare of ₹{0} accepted. Go to Pickup is now enabled."
 ],
 [
  "Driver ne aapka ₹{0} counter accept kar liya. Fare lock ho gaya.",
  "The driver accepted your counter offer of ₹{0}. The fare is locked."
 ],
 [
  "₹{0} final fare accept ho gaya",
  "Final fare of ₹{0} accepted"
 ],
 [
  "Google account email match nahi hui. {0} wale Google account se continue karo.",
  "The Google account email does not match. Continue with the Google account for {0}."
 ],
 [
  "Ye mobile number pehle se {0} account me registered hai",
  "This mobile number is already registered with a {0} account"
 ],
 [
  "Customer ne ₹{0} cash payment select ki hai. Cash receive karke confirm karein.",
  "The customer chose to pay ₹{0} in cash. Confirm after receiving the cash."
 ],
 [
  "Customer ne ₹{0} cash select kiya. Cash receive karke confirm karein.",
  "The customer chose to pay ₹{0} in cash. Confirm after receiving the cash."
 ],
 [
  "Payment captured nahi hai. Current status: {0}",
  "The payment has not been captured. Current status: {0}"
 ],
 [
  "₹{0} online payment successful ho gayi.",
  "Online payment of ₹{0} successful."
 ],
 [
  "Platform fee payment captured nahi hai. Status: {0}",
  "The platform fee payment has not been captured. Status: {0}"
 ],
 [
  "₹{0} platform fee paid. ₹{1} abhi due hai.",
  "₹{0} platform fee paid. ₹{1} is still due."
 ],
 [
  "Driver ne {0} payment milna confirm kiya. Agar aapne payment nahi di to \"Payment nahi di\" report karein.",
  "The driver confirmed receiving the {0} payment. If you have not paid, report \"I haven't paid\"."
 ],
 [
  "₹{0} {1} payment driver ne confirm ki. Galat hai to app me report karein.",
  "The driver confirmed a ₹{0} {1} payment. If this is wrong, report it in the app."
 ],
 [
  "Driver ne {0} payment milna confirm kiya. Ride complete hote hi booking close ho jayegi.",
  "The driver confirmed receiving the {0} payment. The booking will close when the ride is completed."
 ],
 [
  "Customer report: maine payment nahi di, lekin driver ne {0} payment confirm kar di.",
  "Customer report: I have not paid, but the driver confirmed the {0} payment."
 ],
 [
  "₹{0} platform commission due hai. Wallet top-up karke due clear karo.",
  "₹{0} platform commission is due. Top up your wallet to clear it."
 ],
 [
  "{0} minute tak customer response nahi aaya. Ride automatically cancel ho gayi.",
  "No response from the customer for {0} minutes. The ride was cancelled automatically."
 ],
 [
  "{0} minute tak driver response nahi aaya. Ride automatically cancel ho gayi.",
  "No response from the driver for {0} minutes. The ride was cancelled automatically."
 ],
 [
  "{0} Aap next ride ke liye available hain.",
  "{0} You are available for the next ride."
 ],
 [
  "₹{0} platform commission due hai",
  "₹{0} platform commission is due"
 ],
 [
  "Cash commission ₹{0} wallet me insufficient balance ki wajah se due hai",
  "Cash commission of ₹{0} is due because of insufficient wallet balance"
 ],
 [
  "Insufficient wallet balance. Available ₹{0} hai.",
  "Insufficient wallet balance. ₹{0} is available."
 ],
 [
  "Driver ne ₹{0} ka offer diya hai",
  "The driver has offered ₹{0}"
 ],
 [
  "Fare ₹{0} pe lock ho gaya! 🎉",
  "Fare locked at ₹{0}! 🎉"
 ],
 [
  "Fare ₹{0} accept ho gaya",
  "Fare of ₹{0} accepted"
 ],
 [
  "Google ID token {0} invalid hai",
  "Google sign-in could not be verified. Please try again."
 ],
 [
  "RazorpayX live payout ready nahi hai: {0}",
  "Automatic payouts are not available right now."
 ],
 [
  "Instant payout live ready nahi hai: {0}",
  "Instant payout is not available right now."
 ],
 [
  "{0} configure nahi hai",
  "The service is temporarily unavailable. Please try again later."
 ],
 [
  "Cash commission me ₹{0} due raha",
  "₹{0} cash commission remains due"
 ],
 [
  "Top-up ₹{0}; commission due ₹{1} automatically clear hua",
  "Top-up ₹{0}; commission due of ₹{1} cleared automatically"
 ],
 [
  "Driver ne ₹{0} cash received confirm kar diya.",
  "The driver confirmed receiving ₹{0} in cash."
 ],
 [
  "Admin ne naam update kiya: {0}",
  "The admin updated your name: {0}"
 ],
 [
  "Driver ne ₹{0} ka fare offer bheja",
  "The driver sent a fare offer of ₹{0}"
 ],
 [
  "Customer ne ₹{0} ka counter offer bheja",
  "The customer sent a counter offer of ₹{0}"
 ],
 [
  "Driver final fare ₹{0} customer ko bhej diya",
  "Final fare of ₹{0} sent to the customer"
 ],
 [
  "₹{0} final fare customer ne accept kiya — fare locked",
  "The customer accepted the final fare of ₹{0} — fare locked"
 ],
 [
  "Online earning ₹{0}; ₹{1} old cash commission recover hua, ₹{2} wallet credit",
  "Online earning ₹{0}; ₹{1} old cash commission recovered, ₹{2} credited to wallet"
 ],
 [
  "Processed payout ₹{0} reverse hua; wallet restore kiya",
  "Payout of ₹{0} was reversed; the wallet has been restored"
 ],
 [
  "Failed payout ₹{0} wallet me restore hua",
  "Failed payout of ₹{0} returned to the wallet"
 ],
 [
  "Payout start fail hua; ₹{0} wallet me restore kiya",
  "The payout could not start; ₹{0} returned to the wallet"
 ],
 [
  "Fare ₹{0} offer bhej diya",
  "Fare offer of ₹{0} sent"
 ],
 [
  "Customer ne ₹{0} ka counter offer diya",
  "The customer made a counter offer of ₹{0}"
 ],
 [
  "Customer ₹{0} cash dega",
  "The customer will pay ₹{0} in cash"
 ]
].map(([source, english]) => compile(source, english));

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compile(source, english) {
  const order = [];
  const body = escapeRegExp(String(source).trim()).replace(/\\\{(\d+)\\\}/g, (_, index) => {
    order.push(Number(index));
    return "(.+?)";
  });
  return { regex: new RegExp("^" + body + "$", "i"), order, english };
}

function translateLine(line) {
  const raw = String(line);
  const core = raw.trim();
  if (!core) return raw;
  const exact = EXACT.get(normalize(core));
  if (exact) return raw.replace(core, exact);
  for (const item of PATTERNS) {
    const match = core.match(item.regex);
    if (match) {
      let out = item.english;
      item.order.forEach((placeholder, index) => {
        out = out.split("{" + placeholder + "}").join(match[index + 1]);
      });
      return raw.replace(core, out);
    }
  }
  return raw;
}

function toEnglish(value) {
  if (typeof value !== "string" || !value) return value;
  if (value.includes("\n")) return value.split("\n").map(translateLine).join("\n");
  return translateLine(value);
}

const TEXT_KEYS = ["message", "title", "body", "error", "reason", "notice", "statusMessage", "description", "hint"];

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

// Top-level + one nested level ("data", "error") only; never touches
// database documents or arrays, so payload shapes stay exactly the same.
function translatePayload(payload, depth = 0) {
  if (typeof payload === "string") return depth === 0 ? payload : toEnglish(payload);
  if (!isPlainObject(payload)) return payload;
  let copy = null;
  for (const key of TEXT_KEYS) {
    if (typeof payload[key] === "string") {
      const next = toEnglish(payload[key]);
      if (next !== payload[key]) {
        copy = copy || { ...payload };
        copy[key] = next;
      }
    }
  }
  if (depth < 1) {
    for (const key of ["data", "error"]) {
      if (isPlainObject(payload[key])) {
        const next = translatePayload(payload[key], depth + 1);
        if (next !== payload[key]) {
          copy = copy || { ...payload };
          copy[key] = next;
        }
      }
    }
  }
  return copy || payload;
}

// Express: every JSON response.
function englishResponses(req, res, next) {
  const json = res.json.bind(res);
  res.json = (body) => {
    try {
      return json(translatePayload(body));
    } catch (error) {
      return json(body);
    }
  };
  next();
}

// Socket.IO: io.emit, io.to(room).emit and socket.emit.
function installSocketEnglish(io) {
  const patch = (proto) => {
    if (!proto || proto.__hrgV116English || typeof proto.emit !== "function") return;
    const emit = proto.emit;
    proto.emit = function v116EnglishEmit(event, ...args) {
      let next = args;
      try {
        next = args.map((arg) => (typeof arg === "function" ? arg : translatePayload(arg)));
      } catch (error) {
        next = args;
      }
      return emit.call(this, event, ...next);
    };
    proto.__hrgV116English = true;
  };
  for (const [file, name] of [
    ["socket.io/dist/broadcast-operator", "BroadcastOperator"],
    ["socket.io/dist/socket", "Socket"],
    ["socket.io/dist/namespace", "Namespace"]
  ]) {
    try {
      const mod = require(file);
      patch(mod && mod[name] && mod[name].prototype);
    } catch (error) {
      /* optional */
    }
  }
  // Same patch through the live instance (works even if deep paths are not exported).
  if (io) {
    try { patch(Object.getPrototypeOf(io.to("__hrg_v116_probe__"))); } catch (error) { /* ignore */ }
    try { patch(Object.getPrototypeOf(io.of("/"))); } catch (error) { /* ignore */ }
    try {
      io.on("connection", (socket) => {
        try { patch(Object.getPrototypeOf(socket)); } catch (error) { /* ignore */ }
      });
    } catch (error) { /* ignore */ }
  }
}

module.exports = { toEnglish, translatePayload, englishResponses, installSocketEnglish };
