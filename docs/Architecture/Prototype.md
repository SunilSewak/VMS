```
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

```
<title>VMS Lite V9</title>
```

```
<style>
body{
    font-family:Arial, sans-serif;
    margin:20px;
    background:#f4f4f4;
}
h1{
    margin-bottom:20px;
}
.section{
    background:white;
    border:1px solid #ddd;
    padding:15px;
    margin-bottom:15px;
}
table{
    width:100%;
    border-collapse:collapse;
}
th,td{
    border:1px solid #ccc;
    padding:8px;
    text-align:left;
}
input,select{
    padding:6px;
    margin:4px;
}
button{
    padding:8px 12px;
    cursor:pointer;
    margin:4px;
}
textarea{
    padding:8px;
    margin:4px;
    font-family:Arial, sans-serif;
}
.card-container{
    display:flex;
    gap:10px;
    flex-wrap:wrap;
}
.card{
    background:white;
    border:1px solid #ccc;
```

```
    padding:10px;
    min-width:180px;
}
.placeholder{
    color:#777;
    font-style:italic;
}
.booking-status-available{
    color:green;
    font-weight:bold;
}
.booking-status-booked{
    color:red;
    font-weight:bold;
}
hr{
    margin:20px 0;
    border:1px solid #ddd;
}
</style>
</head>
<body>
<h1>VMS Lite V9</h1>
<!-- DASHBOARD -->
<div class="section">
<h2>Dashboard</h2>
<div class="card-container">
<div class="card">
<h3>Total Events</h3>
<div id="totalEvents">0</div>
</div>
<div class="card">
<h3>Pending Review</h3>
<div id="pendingReviewCount">0</div>
</div>
<div class="card">
<h3>Alternative Requests</h3>
<div id="alternativeRequestCount">0</div>
</div>
<div class="card">
<h3>Approved</h3>
<div id="approvedEvents">0</div>
</div>
<div class="card">
<h3>Booking Pending</h3>
<div id="bookingPendingCount">0</div>
</div>
```

```
<div class="card">
<h3>Bookings Confirmed</h3>
<div id="bookingConfirmedCount">0</div>
</div>
<div class="card">
<h3>Participants</h3>
<div id="participantCount">0</div>
</div>
<div class="card">
<h3>Finalized Roomings</h3>
<div id="finalizedRoomingCount">0</div>
</div>
<div class="card">
<h3>Invoices Received</h3>
<div id="invoiceCount">0</div>
</div>
<div class="card">
<h3>Audits Completed</h3>
<div id="auditCount">0</div>
</div>
<div class="card">
<h3>SAP Uploaded</h3>
<div id="sapUploadedCount">0</div>
</div>
<div class="card">
<h3>Closed Events</h3>
<div id="closedEventCount">0</div>
</div>
<div class="card">
<h3>Commercials Expiring</h3>
<div id="commercialExpiryCount">0</div>
</div>
<div class="card">
<h3>Annual Calendar</h3>
<div id="calendarCount">0</div>
</div>
<div class="card">
<h3>Monthly Plans</h3>
<div id="monthlyPlanCount">0</div>
</div>
</div>
</div>
<!-- PLANNING -->
<div class="section">
<h2>Annual Calendar</h2>
<input id="calDivision" placeholder="Division">
<input id="calMeeting" placeholder="Meeting">
```

```
<select id="calMonth">
```

```
<option>April</option>
<option>May</option>
<option>June</option>
<option>July</option>
<option>August</option>
<option>September</option>
<option>October</option>
<option>November</option>
<option>December</option>
<option>January</option>
<option>February</option>
<option>March</option>
</select>
<input id="calCity" placeholder="Preferred City">
<input id="calPax" type="number" placeholder="Expected PAX">
<button onclick="addAnnualCalendar()">
Add Calendar Entry
</button>
```

```
<table>
<thead>
<tr>
<th>Division</th>
<th>Meeting</th>
<th>Month</th>
<th>City</th>
<th>PAX</th>
</tr>
</thead>
```

```
<tbody id="annualCalendarTable">
```

```
</tbody>
</table>
</div>
<!-- MONTHLY PLAN -->
<div class="section">
<h2>Monthly Plan</h2>
<button onclick="generateMonthlyPlan()">
Generate Monthly Plan
</button>
<table>
<thead>
```

```
<tr>
<th>Meeting</th>
<th>City</th>
<th>PAX</th>
<th>Status</th>
```

```
<th>Action</th>
</tr>
```

```
</thead>
```

```
<tbody id="monthlyPlanTable">
```

```
</tbody>
</table>
```

```
</div>
```

```
<!-- MASTER DATA CENTER -->
```

```
<div class="section">
<h2>Master Data Center</h2>
```

```
<h3>Zone Master</h3>
```

```
<input id="zoneName" placeholder="Zone">
<button onclick="addZone()">
```

```
Add Zone
```

```
</button>
```

```
<select id="zoneList"></select>
```

```
<hr>
```

```
<h3>State Master</h3>
```

```
<input id="stateName" placeholder="State">
<select id="stateZone"></select>
<button onclick="addState()">
```

```
Add State
```

```
</button>
```

```
<select id="stateList"></select>
```

```
<hr>
```

```
<h3>City Master</h3>
```

```
<input id="cityNameMaster" placeholder="City">
<select id="cityState"></select>
<button onclick="addCityMaster()">
```

```
Add City
```

```
</button>
```

```
<select id="cityList"></select>
```

```
<hr>
```

```
<h3>Hotel Master</h3>
```

```
<input id="hotelNameMaster"
placeholder="Hotel Name">
```

```
<select id="hotelCity"></select>
```

```
<button onclick="addHotel()">
```

```
Add Hotel
```

```
</button>
```

```
<table>
```

```
<thead>
```

```
<tr>
```

```
<th>Hotel</th>
<th>City</th>
```

```
</tr>
```

```
</thead>
```

```
<tbody id="hotelMasterTable">
```

```
</tbody>
```

```
</table>
```

```
<hr>
```

```
<h3>Hall Master</h3>
```

```
<select id="hallHotel">
</select>
```

```
<input id="hallNameMaster"
placeholder="Hall Name">
```

```
<input id="hallCapacityMaster"
type="number"
placeholder="Capacity">
```

```
<button onclick="addHall()">
```

```
Add Hall
```

```
</button>
```

```
<table>
```

```
<thead>
```

```
<tr>
```

```
<th>Hotel</th>
<th>Hall</th>
<th>Capacity</th>
```

```
</tr>
```

```
</thead>
```

```
<tbody id="hallMasterTable">
```

```
</tbody>
```

```
</table>
```

```
<hr>
```

```
<h3>Inventory Master</h3>
```

```
<select id="inventoryHotel">
</select>
```

```
<input id="tripleInventory"
type="number"
placeholder="Triple Rooms">
```

```
<input id="doubleInventory"
type="number"
placeholder="Double Rooms">
```

```
<input id="singleInventory"
type="number"
placeholder="Single Rooms">
```

```
<input id="suiteInventory"
type="number"
placeholder="Suites">
```

```
<button onclick="saveInventory()">
```

```
Save Inventory
```

```
</button>
```

```
<table>
```

```
<thead>
```

```
<tr>
```

```
<th>Hotel</th>
```

```
<th>Triple</th>
```

```
<th>Double</th>
```

```
<th>Single</th>
```

```
<th>Suite</th>
```

```
</tr>
```

```
</thead>
<tbody id="inventoryTable">
```

```
</tbody>
```

```
</table>
```

```
<hr>
```

```
<h3>Approved Commercial Master</h3>
```

```
<select id="commercialHotel">
```

```
</select>
```

```
<input
id="approvedRoomRate"
type="number"
placeholder="Room Rate">
<input
id="approvedFoodRate"
type="number"
placeholder="Food Rate Per Pax">
<input
id="approvedHallRate"
type="number"
placeholder="Hall Rate">
<input
id="agreementValidTill"
type="date">
```

```
<button onclick="saveCommercialMaster()">
Save Commercial
</button>
<table>
<thead>
<tr>
<th>Hotel</th>
<th>Room Rate</th>
<th>Food Rate</th>
<th>Hall Rate</th>
<th>Valid Till</th>
```

```
</tr>
</thead>
<tbody id="commercialMasterTable">
```

```
</tbody>
</table>
```

```
<hr>
```

```
<h3>Commercial Rate Card</h3>
<select id="rateHotel">
</select>
<input id="roomRate"
type="number"
```

```
placeholder="Room Rate (₹)">
```

```
<input id="hallRate"
type="number"
placeholder="Hall Rate (₹)">
<input id="foodRate"
type="number"
placeholder="Food Rate per PAX (₹)">
```

```
<button onclick="saveRateCard()">
```

```
Save Rate Card
</button>
<table>
<thead>
```

```
<tr>
<th>Hotel</th>
<th>Room Rate</th>
<th>Hall Rate</th>
<th>Food Rate/PAX</th>
```

```
</tr>
```

```
</thead>
<tbody id="rateCardTable">
</tbody>
</table>
</div>
<!-- EVENT CREATION -->
<div class="section">
<h2>Create Event</h2>
<input id="meetingName" placeholder="Meeting Name">
<input id="city" placeholder="City">
<input id="startDate" type="date">
<input id="endDate" type="date">
<button onclick="createEvent()">
Create Event
</button>
</div>
```

```
<!-- EVENT GRID -->
<div class="section">
<h2>Events</h2>
```

```
<table>
<thead>
<tr>
<th>Meeting</th>
<th>City</th>
<th>Dates</th>
<th>Lifecycle</th>
<th>Action</th>
</tr>
</thead>
<tbody id="eventTable">
</tbody>
</table>
</div>
<!-- ROOM BLOCKING -->
<div class="section">
<h2>Room Blocking Engine</h2>
<p>
Selected Event:
<b id="selectedEventName">
No Event Selected
</b>
</p>
<table>
<tr>
<td>SO</td>
<td>
<input id="soCount" type="number" value="0">
</td>
</tr>
<tr>
<td>DM</td>
<td>
<input id="dmCount" type="number" value="0">
</td>
</tr>
<tr>
<td>RSM</td>
<td>
<input id="rsmCount" type="number" value="0">
</td>
</tr>
<tr>
<td>DSM</td>
<td>
<input id="dsmCount" type="number" value="0">
</td>
```

```
</tr>
<tr>
<td>CH</td>
<td>
<input id="chCount" type="number" value="0">
</td>
</tr>
<tr>
<td>IBH</td>
<td>
<input id="ibhCount" type="number" value="0">
</td>
</tr>
<tr>
<td>NSM</td>
<td>
<input id="nsmCount" type="number" value="0">
</td>
</tr>
```

```
</table>
<br>
<button onclick="calculateRoomBlocking()">
Calculate Room Requirement
</button>
```

```
<h3>Room Requirement Summary</h3>
```

```
<table>
```

```
<tr>
<td>Triple Rooms</td>
<td id="tripleRooms">0</td>
</tr>
<tr>
<td>Double Rooms</td>
<td id="doubleRooms">0</td>
</tr>
```

```
<tr>
<td>Single Rooms</td>
<td id="singleRooms">0</td>
</tr>
```

```
<tr>
<td>Suites</td>
<td id="suiteRooms">0</td>
</tr>
```

```
<tr>
<td>Total PAX</td>
<td id="totalPax">0</td>
</tr>
```

```
</table>
```

```
</div>
```

```
<!-- VENUE ALLOCATION -->
```

```
<div class="section">
```

```
<h2>Venue Allocation Engine</h2>
```

```
<p>
Selected Event:
<b id="allocationEvent">
No Event Selected
</b>
</p>
```

```
<h3>Select Hotel</h3>
```

```
<select id="hotelSelect"
onchange="loadHotelInventory()">
```

```
<option value="">
Select Hotel
</option>
```

```
</select>
```

```
<h3>Hotel Inventory</h3>
```

```
<table>
```

```
<tr>
<td>Triple Rooms Available</td>
<td id="availTriple">0</td>
</tr>
```

```
<tr>
<td>Double Rooms Available</td>
<td id="availDouble">0</td>
</tr>
```

```
<tr>
<td>Single Rooms Available</td>
<td id="availSingle">0</td>
</tr>
```

```
<tr>
<td>Suites Available</td>
<td id="availSuite">0</td>
</tr>
```

```
</table>
```

```
<br>
```

```
<h3>Select Hall</h3>
<select id="hallSelect" onchange="updateAvailability()">
<option value="">
Select Hall
</option>
</select>
<br><br>
```

```
<h3>
Availability:
<span id="availabilityStatus">
Unknown
</span>
</h3>
<br>
```

```
<button onclick="validateVenueAllocation()">
Validate Allocation
</button>
<button onclick="bookVenue()">
Propose Venue
</button>
</div>
<!-- DECISION ENGINE -->
<div class="section">
<h2>Decision Engine</h2>
<table>
<thead>
<tr>
<th>Validation</th>
<th>Required</th>
<th>Available</th>
<th>Shortfall</th>
<th>Status</th>
</tr>
</thead>
<tbody id="decisionTable">
</tbody>
</table>
<br>
<h2 id="allocationDecision">
Not Evaluated
</h2>
</div>
<!-- BOOKING REGISTRY -->
<div class="section">
<h2>Booking Registry</h2>
<table>
<thead>
```

```
<tr>
<th>Meeting</th>
<th>Hotel</th>
<th>Hall</th>
<th>Start</th>
<th>End</th>
</tr>
```

```
</thead>
<tbody id="bookingTable">
</tbody>
</table>
</div>
<!-- SALES HEAD REVIEW -->
<div class="section">
<h2>Sales Head Review</h2>
```

```
<p>
Selected Event:
<b id="reviewEventName">
No Event Selected
</b>
</p>
<textarea
id="reviewRemarks"
placeholder="Remarks / Justification"
style="width:100%;height:80px;">
</textarea>
```

```
<br><br>
```

```
<button onclick="acceptVenue()">
Accept Venue
</button>
<button onclick="requestAlternative()">
Request Alternative Venue
</button>
```

```
<button onclick="approveVenue()">
Final Approval
</button>
```

```
<h3>
```

```
Review Status:
```

```
<span id="reviewStatus">
```

```
Pending
</span>
</h3>
</div>
```

```
<!-- VENUE BOOKING -->
<div class="section">
<h2>Venue Booking</h2>
<p>
Selected Event:
<b id="bookingEventName">
No Event Selected
```

```
</b>
</p>
<input
id="bookingReference"
placeholder="Booking Reference">
<input
id="bookingDate"
type="date">
```

```
<select id="bookingStatus">
<option value="Pending">
Pending
</option>
<option value="Booked">
Booked
</option>
<option value="Cancelled">
Cancelled
</option>
</select>
<button onclick="confirmBooking()">
Confirm Booking
```

```
</button>
```

```
<button onclick="cancelBooking()">
```

```
Cancel Booking
```

```
</button>
```

```
<table>
<thead>
```

```
<tr>
```

```
<th>Meeting</th>
<th>Booking Ref</th>
<th>Booking Date</th>
<th>Status</th>
```

```
</tr>
```

```
</thead>
```

```
<tbody id="bookingConfirmationTable">
```

```
</tbody>
```

```
</table>
```

```
</div>
```

```
<!-- ROOMING LIST SUBMISSION -->
```

```
<div class="section">
```

```
<h2>Rooming List Submission</h2>
```

```
<p>
```

```
Selected Event:
```

```
<b id="roomingEventName">
```

```
No Event Selected
```

```
</b>
```

```
</p>
```

```
<input
id="participantName"
placeholder="Employee Name">
```

```
<input
id="participantDesignation"
placeholder="Designation">
```

```
<input
id="participantDivision"
placeholder="Division">
```

```
<input
id="participantState"
```

```
placeholder="State">
```

```
<input
id="participantRegion"
placeholder="Region">
```

```
<select id="occupancyType">
```

```
<option value="Single">
Single
</option>
<option value="Double">
Double
</option>
<option value="Triple">
Triple
</option>
</select>
<input
id="checkInDate"
type="date">
<input
id="checkOutDate"
type="date">
```

```
<select id="nrcFlag">
<option value="No">
```

```
No
</option>
<option value="Yes">
Yes
</option>
</select>
<button onclick="addParticipant()">
Add Participant
</button>
<table>
<thead>
<tr>
```

```
<th>Name</th>
```

```
<th>Designation</th>
<th>Division</th>
<th>Occupancy</th>
<th>NRC</th>
```

```
</tr>
```

```
</thead>
<tbody id="roomingTable">
```

```
</tbody>
```

```
</table>
```

```
</div>
```

```
<!-- ROOMING LIST FINALIZATION -->
<div class="section">
```

```
<h2>Rooming List Finalization</h2>
```

```
<p>
Selected Event:
<b id="finalizationEventName">
No Event Selected
```

```
</b>
```

```
</p>
```

```
<h3>
```

```
Current Status:
```

```
<span id="roomingStatusDisplay">
```

```
Draft
```

```
</span>
```

```
</h3>
```

```
<button onclick="finalizeRooming()">
Finalize Rooming List
</button>
```

```
<button onclick="unlockRooming()">
Unlock Rooming List
</button>
```

```
<table>
```

```
<thead>
```

```
<tr>
```

```
<th>Metric</th>
```

```
<th>Value</th>
```

```
</tr>
```

```
</thead>
```

```
<tbody>
```

```
<tr>
```

```
<td>Total Participants</td>
```

```
<td id="finalParticipantCount">
```

```
0
```

```
</td>
```

```
</tr>
```

```
<tr>
```

```
<td>Single Occupancy</td>
```

```
<td id="singleCount">
```

```
0
```

```
</td>
```

```
</tr>
```

```
<tr>
```

```
<td>Double Occupancy</td>
```

```
<td id="doubleCount">
```

```
0
```

```
</td>
```

```
</tr>
```

```
<tr>
```

```
<td>Triple Occupancy</td>
```

```
<td id="tripleCount">
```

```
0
```

```
</td>
```

```
</tr>
```

```
<tr>
```

```
<td>NRC Count</td>
```

```
<td id="nrcCount">
```

```
0
```

```
</td>
```

```
</tr>
```

```
</tbody>
```

```
</table>
```

```
</div>
```

```
<!-- INVOICE RECEIPT -->
```

```
<div class="section">
<h2>Invoice Receipt</h2>
```

```
<p>
Selected Event:
```

```
<b id="invoiceEventName">
No Event Selected
```

```
</b>
```

```
</p>
<input
id="invoiceNumber"
placeholder="Invoice Number">
```

```
<input
id="invoiceDate"
type="date">
```

```
<input
id="invoiceAmount"
type="number"
placeholder="Invoice Amount">
```

```
<button onclick="receiveInvoice()">
```

```
Receive Invoice
```

```
</button>
```

```
<table>
```

```
<thead>
```

```
<tr>
```

```
<th>Invoice No</th>
<th>Date</th>
<th>Amount</th>
<th>Status</th>
```

```
</tr>
```

```
</thead>
```

```
<tbody id="invoiceTable">
```

```
</tbody>
</table>
```

```
</div>
```

```
<!-- INVOICE AUDIT -->
```

```
<div class="section">
<h2>Invoice Audit</h2>
<button onclick="auditInvoice()">
Run Audit
</button>
```

```
<table>
<thead>
```

```
<tr>
```

```
<th>Metric</th>
<th>Value</th>
```

```
</tr>
```

```
</thead>
<tbody id="auditTable">
```

```
</tbody>
```

```
</table>
```

```
</div>
```

```
<!-- SAP UPLOAD & CLOSURE -->
<div class="section">
```

```
<h2>SAP Upload & Closure</h2>
```

```
<p>
```

```
Selected Event:
```

```
<b id="sapEventName">
No Event Selected
```

```
</b>
</p>
```

```
<input
id="sapReference"
placeholder="SAP Reference Number">
```

```
<input
id="sapUploadDate"
type="date">
```

```
<select id="paymentStatus">
```

```
<option value="Pending">
```

```
Pending
```

```
</option>
<option value="Processed">
Processed
</option>
<option value="Paid">
Paid
```

```
</option>
</select>
<button onclick="uploadToSAP()">
Upload To SAP
</button>
<button onclick="closeEvent()">
```

```
Close Event
```

```
</button>
<table>
<thead>
```

```
<tr>
```

```
<th>Meeting</th>
<th>SAP Ref</th>
<th>Upload Date</th>
<th>Payment Status</th>
<th>Closure</th>
```

```
</tr>
```

```
</thead>
<tbody id="sapTable">
```

```
</tbody>
</table>
```

```
</div>
```

```
<!-- RECOMMENDATION ENGINE -->
```

```
<div class="section">
```

```
<h2>Recommendation Engine</h2>
```

```
<button onclick="generateRecommendations()">
```

```
Generate Recommendations
```

```
</button>
<br><br>
<table>
<thead>
```

```
<tr>
```

```
<th>Hotel</th>
<th>Hall Fit</th>
<th>Accommodation Fit</th>
```

```
<th>Shortfalls</th>
<th>Score</th>
```

```
<th>Estimated Cost</th>
```

```
<th>Recommendation</th>
```

```
</tr>
</thead>
<tbody id="recommendationTable">
</tbody>
</table>
</div>
<script>
/********************************
 DATA MODEL
********************************/
const events = [];
const bookings = [];
const annualCalendar = [];
const monthlyPlans = [];
const zones = [];
const states = [];
const cities = [];
```

```
const hotels = [];
const halls = [];
const inventories = [];
const rateCards = [];
const bookingConfirmations = [];
const roomingLists = [];
const finalizedRoomings = [];
const invoices = [];
const invoiceAudits = [];
const approvedCommercials = [];
const sapClosures = [];
let selectedPlan = null;
let selectedEvent = null;
let roomRequirement = {
    triple:0,
    double:0,
    single:0,
    suite:0,
    pax:0
};
/********************************
 ZONE FUNCTIONS
********************************/
```

```
function addZone(){
const zone = {
id:Date.now(),
name:
document.getElementById(
'zoneName'
).value
};
zones.push(zone);
renderZoneMasters();
document.getElementById('zoneName').value = '';
}
function renderZoneMasters(){
const zoneList =
```

```
document.getElementById(
'zoneList'
);
const stateZone =
document.getElementById(
'stateZone'
);
zoneList.innerHTML='';
stateZone.innerHTML='';
zones.forEach(z=>{
zoneList.innerHTML +=
`<option value="${z.id}">
${z.name}
</option>`;
stateZone.innerHTML +=
`<option value="${z.id}">
${z.name}
</option>`;
});
}
/********************************
 STATE FUNCTIONS
********************************/
function addState(){
const state = {
id:Date.now(),
name:
document.getElementById(
'stateName'
).value,
zoneId:
document.getElementById(
'stateZone'
).value
};
states.push(state);
renderStateMasters();
document.getElementById('stateName').value = '';
}
```

```
function renderStateMasters(){
const stateList =
document.getElementById(
'stateList'
);
const cityState =
document.getElementById(
'cityState'
);
stateList.innerHTML='';
cityState.innerHTML='';
states.forEach(s=>{
stateList.innerHTML +=
`<option value="${s.id}">
${s.name}
</option>`;
cityState.innerHTML +=
`<option value="${s.id}">
${s.name}
</option>`;
});
}
/********************************
 CITY FUNCTIONS
********************************/
function addCityMaster(){
const city = {
id:Date.now(),
name:
document.getElementById(
'cityNameMaster'
).value,
stateId:
document.getElementById(
'cityState'
).value
};
cities.push(city);
renderCityMasters();
```

```
document.getElementById('cityNameMaster').value = '';
}
function renderCityMasters(){
const cityList =
document.getElementById(
'cityList'
);
cityList.innerHTML='';
cities.forEach(c=>{
cityList.innerHTML +=
`<option value="${c.id}">
${c.name}
</option>`;
});
const hotelCity =
document.getElementById(
'hotelCity'
);
hotelCity.innerHTML='';
cities.forEach(c=>{
hotelCity.innerHTML +=
`
<option value="${c.id}">
${c.name}
</option>
`;
});
}
/********************************
 HOTEL FUNCTIONS
********************************/
function addHotel(){
const hotel = {
id:Date.now(),
```

```
name:
document.getElementById(
'hotelNameMaster'
```

```
).value,
cityId:
document.getElementById(
'hotelCity'
).value
};
hotels.push(hotel);
renderHotels();
populateHotelDropdown();
document.getElementById('hotelNameMaster').value = '';
```

```
}
function renderHotels(){
const tbody =
document.getElementById(
'hotelMasterTable'
);
tbody.innerHTML='';
hotels.forEach(h=>{
const city =
cities.find(
c=>c.id==h.cityId
);
tbody.innerHTML += `
<tr>
<td>${h.name}</td>
<td>
${city
?
city.name
:
''}
</td>
</tr>
`;
});
// Populate hall hotel dropdown
const hallHotel =
document.getElementById(
'hallHotel'
);
hallHotel.innerHTML='';
```

```
hotels.forEach(h=>{
hallHotel.innerHTML += `
<option value="${h.id}">
${h.name}
</option>
`;
});
// Populate inventory hotel dropdown
const inventoryHotel =
document.getElementById(
'inventoryHotel'
);
inventoryHotel.innerHTML='';
hotels.forEach(h=>{
inventoryHotel.innerHTML += `
<option value="${h.id}">
${h.name}
</option>
`;
});
// Populate rate hotel dropdown
const rateHotel =
document.getElementById(
'rateHotel'
);
rateHotel.innerHTML='';
hotels.forEach(h=>{
rateHotel.innerHTML += `
<option value="${h.id}">
${h.name}
</option>
`;
});
// Populate commercial hotel dropdown
const commercialHotel =
document.getElementById(
'commercialHotel'
);
```

```
commercialHotel.innerHTML='';
hotels.forEach(h=>{
commercialHotel.innerHTML += `
<option value="${h.id}">
${h.name}
</option>
`;
});
}
function populateHotelDropdown(){
const hotelSelect =
document.getElementById(
'hotelSelect'
);
hotelSelect.innerHTML =
'<option value="">Select Hotel</option>';
hotels.forEach(h=>{
hotelSelect.innerHTML +=
`
```

```
<option value="${h.id}">
${h.name}
</option>
`;
});
}
/********************************
 HALL FUNCTIONS
********************************/
function addHall(){
const hall = {
id:Date.now(),
hotelId:
document.getElementById(
'hallHotel'
).value,
```

```
name:
```

```
document.getElementById(
'hallNameMaster'
).value,
capacity:
Number(
document.getElementById(
'hallCapacityMaster'
).value
)
};
halls.push(hall);
renderHallMaster();
populateHallDropdown();
```

```
document.getElementById('hallNameMaster').value = '';
document.getElementById('hallCapacityMaster').value = '';
}
function renderHallMaster(){
const tbody =
document.getElementById(
'hallMasterTable'
);
tbody.innerHTML='';
halls.forEach(h=>{
const hotel =
hotels.find(
x=>x.id==h.hotelId
);
tbody.innerHTML += `
<tr>
<td>
${hotel ? hotel.name : ''}
</td>
<td>
${h.name}
</td>
<td>
${h.capacity}
</td>
</tr>
`;
```

```
});
}
```

```
function populateHallDropdown(){
```

```
const hotelId =
document.getElementById(
'hotelSelect'
).value;
const hallSelect =
document.getElementById(
'hallSelect'
);
hallSelect.innerHTML =
'<option value="">Select Hall</option>';
halls
.filter(
h=>h.hotelId==hotelId
)
.forEach(h=>{
hallSelect.innerHTML += `
<option value="${h.id}">
${h.name}
</option>
`;
});
updateAvailability();
}
/********************************
 INVENTORY FUNCTIONS
********************************/
function saveInventory(){
const hotelId =
document.getElementById(
'inventoryHotel'
).value;
if(!hotelId){
alert('Please select a hotel');
return;
}
const inventory = {
hotelId: hotelId,
triple:
Number(
document.getElementById(
'tripleInventory'
).value
) || 0,
```

```
double:
Number(
document.getElementById(
'doubleInventory'
).value
) || 0,
single:
Number(
document.getElementById(
'singleInventory'
).value
) || 0,
suite:
Number(
document.getElementById(
'suiteInventory'
).value
) || 0
};
const existing =
inventories.find(
x=>x.hotelId ==
inventory.hotelId
);
if(existing){
Object.assign(
existing,
inventory
);
}
else{
inventories.push(
inventory
);
}
renderInventory();
document.getElementById('tripleInventory').value = '';
document.getElementById('doubleInventory').value = '';
document.getElementById('singleInventory').value = '';
document.getElementById('suiteInventory').value = '';
alert('Inventory saved successfully!');
}
function renderInventory(){
const tbody =
document.getElementById(
'inventoryTable'
);
```

```
tbody.innerHTML='';
inventories.forEach(i=>{
```

```
const hotel =
hotels.find(
h=>h.id==i.hotelId
);
tbody.innerHTML += `
```

```
<tr>
<td>${hotel?.name || ''}</td>
<td>${i.triple}</td>
<td>${i.double}</td>
<td>${i.single}</td>
<td>${i.suite}</td>
</tr>
`;
});
}
/********************************
 COMMERCIAL MASTER FUNCTIONS
********************************/
```

```
function saveCommercialMaster(){
```

```
const hotelId =
document.getElementById(
'commercialHotel'
).value;
if(!hotelId){
alert('Please select a hotel');
return;
}
const commercial = {
hotelId: hotelId,
roomRate:
Number(
document.getElementById(
'approvedRoomRate'
).value
) || 0,
foodRate:
Number(
document.getElementById(
'approvedFoodRate'
).value
```

```
) || 0,
```

```
hallRate:
Number(
document.getElementById(
'approvedHallRate'
).value
) || 0,
validTill:
document.getElementById(
'agreementValidTill'
).value
};
const existing =
approvedCommercials.find(
x=>x.hotelId ==
commercial.hotelId
);
if(existing){
Object.assign(
existing,
commercial
);
}
else{
approvedCommercials.push(
commercial
);
}
renderCommercialMaster();
```

```
document.getElementById('approvedRoomRate').value = '';
document.getElementById('approvedFoodRate').value = '';
document.getElementById('approvedHallRate').value = '';
document.getElementById('agreementValidTill').value = '';
```

```
alert('Commercial saved successfully!');
}
function renderCommercialMaster(){
const tbody =
document.getElementById(
'commercialMasterTable'
);
tbody.innerHTML='';
approvedCommercials.forEach(c=>{
```

```
const hotel =
hotels.find(
h=>h.id==c.hotelId
);
```

```
tbody.innerHTML += `
```

```
<tr>
```

```
<td>${hotel?.name || ''}</td>
```

```
<td>₹${c.roomRate.toLocaleString()}</td>
<td>₹${c.foodRate.toLocaleString()}</td>
<td>₹${c.hallRate.toLocaleString()}</td>
<td>${c.validTill}</td>
</tr>
`;
});
}
/********************************
 RATE CARD FUNCTIONS
********************************/
function saveRateCard(){
```

```
const hotelId =
document.getElementById(
'rateHotel'
).value;
if(!hotelId){
alert('Please select a hotel');
return;
}
const rateCard = {
hotelId: hotelId,
roomRate:
Number(
document.getElementById(
'roomRate'
).value
) || 0,
hallRate:
Number(
document.getElementById(
'hallRate'
).value
) || 0,
foodRate:
Number(
document.getElementById(
'foodRate'
).value
) || 0
```

```
};
const existing =
rateCards.find(
x=>x.hotelId ==
rateCard.hotelId
);
if(existing){
Object.assign(
existing,
rateCard
);
}
else{
rateCards.push(
rateCard
);
}
renderRateCards();
```

```
document.getElementById('roomRate').value = '';
document.getElementById('hallRate').value = '';
document.getElementById('foodRate').value = '';
```

```
alert('Rate card saved successfully!');
}
```

```
function renderRateCards(){
```

```
const tbody =
document.getElementById(
'rateCardTable'
);
tbody.innerHTML='';
rateCards.forEach(r=>{
```

```
const hotel =
hotels.find(
h=>h.id==r.hotelId
);
tbody.innerHTML += `
```

```
<tr>
```

```
<td>${hotel?.name || ''}</td>
<td>₹${r.roomRate.toLocaleString()}</td>
<td>₹${r.hallRate.toLocaleString()}</td>
<td>₹${r.foodRate.toLocaleString()}</td>
</tr>
```

```
`;
```

```
});
}
/********************************
 ANNUAL CALENDAR
********************************/
```

```
function addAnnualCalendar(){
const entry = {
id:Date.now(),
```

```
division:
document.getElementById(
'calDivision'
).value,
meeting:
document.getElementById(
'calMeeting'
).value,
month:
document.getElementById(
'calMonth'
).value,
city:
document.getElementById(
'calCity'
).value,
pax:
Number(
document.getElementById(
'calPax'
).value
)
};
annualCalendar.push(entry);
renderAnnualCalendar();
```

```
document.getElementById('calDivision').value = '';
document.getElementById('calMeeting').value = '';
document.getElementById('calCity').value = '';
document.getElementById('calPax').value = '';
}
function renderAnnualCalendar(){
const tbody =
document.getElementById(
'annualCalendarTable'
);
tbody.innerHTML='';
```

```
annualCalendar.forEach(x=>{
tbody.innerHTML += `
```

```
<tr>
```

```
<td>${x.division}</td>
```

```
<td>${x.meeting}</td>
<td>${x.month}</td>
<td>${x.city}</td>
<td>${x.pax}</td>
</tr>
`;
});
updateDashboard();
}
/********************************
 MONTHLY PLAN
********************************/
function generateMonthlyPlan(){
monthlyPlans.length = 0;
annualCalendar.forEach(x=>{
monthlyPlans.push({
id:x.id,
meeting:x.meeting,
city:x.city,
pax:x.pax,
status:'Draft'
});
```

```
});
renderMonthlyPlan();
}
function renderMonthlyPlan(){
```

```
const tbody =
document.getElementById(
'monthlyPlanTable'
);
```

```
tbody.innerHTML='';
monthlyPlans.forEach(plan=>{
tbody.innerHTML += `
```

```
<tr>
```

```
<td>${plan.meeting}</td>
```

```
<td>${plan.city}</td>
```

```
<td>${plan.pax}</td>
```

```
<td>${plan.status}</td>
```

```
<td>
```

```
<button
onclick="createEventFromPlan(${plan.id})">
```

```
Generate Event
```

```
</button>
```

```
</td>
```

```
</tr>
```

```
`;
```

```
});
```

```
updateDashboard();
```

```
}
/********************************
 CREATE EVENT FROM PLAN
********************************/
```

```
function createEventFromPlan(id){
```

```
const plan =
monthlyPlans.find(
x=>x.id===id
);
if(!plan){
return;
}
const event = {
```

```
id:Date.now(),
meetingName:
plan.meeting,
city:
plan.city,
startDate:'',
```

```
endDate:'',
status:'Draft',
roomingStatus:'Draft',
expectedPax:
plan.pax
};
events.push(event);
plan.status =
'Event Created';
renderEvents();
renderMonthlyPlan();
updateDashboard();
}
/********************************
 EVENT CREATION
********************************/
function createEvent(){
    const event = {
        id: Date.now(),
        meetingName:
        document.getElementById('meetingName').value,
        city:
        document.getElementById('city').value,
        startDate:
        document.getElementById('startDate').value,
        endDate:
        document.getElementById('endDate').value,
        status:'Draft',
        roomingStatus:'Draft'
    };
    events.push(event);
    renderEvents();
    document.getElementById('meetingName').value = '';
    document.getElementById('city').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
```

```
}
/********************************
```

```
 EVENT GRID
********************************/
```

```
function renderEvents(){
```

```
    const tbody =
    document.getElementById('eventTable');
```

```
    tbody.innerHTML='';
```

```
    events.forEach(event=>{
```

```
        let statusColor = 'black';
```

```
        if(event.status === 'Venue Proposed')
            statusColor='orange';
        if(event.status === 'Accepted')
            statusColor='green';
        if(event.status === 'Alternative Requested')
            statusColor='red';
```

```
        if(event.status === 'Approved')
            statusColor='blue';
        if(event.status === 'Booked')
            statusColor='purple';
        if(event.status === 'Ready For Event')
            statusColor='darkgreen';
        if(event.status === 'Completed')
            statusColor='green';
        if(event.status === 'Invoice Pending')
            statusColor='orange';
        if(event.status === 'SAP Uploaded')
            statusColor='brown';
        if(event.status === 'Closed')
            statusColor='gray';
        if(event.status === 'Draft')
            statusColor='gray';
        tbody.innerHTML += `
```

```
        <tr>
```

```
        <td>${event.meetingName}</td>
```

```
        <td>${event.city}</td>
```

```
        <td>
        ${event.startDate}
        -
        ${event.endDate}
        </td>
        <td style="color:${statusColor};font-weight:bold;">
        ${event.status}
        </td>
```

```
        <td>
        <button
        onclick="openEvent(${event.id})">
        Open
        </button>
        </td>
        </tr>
        `;
    });
    updateDashboard();
}
/********************************
 OPEN EVENT
********************************/
```

```
function openEvent(id){
```

```
selectedEvent =
events.find(x=>x.id===id);
```

```
document.getElementById(
'selectedEventName'
).innerText =
selectedEvent.meetingName;
```

```
document.getElementById(
'allocationEvent'
).innerText =
selectedEvent.meetingName;
```

```
document.getElementById(
'reviewEventName'
).innerText =
selectedEvent.meetingName;
```

```
document.getElementById(
'reviewStatus'
).innerText =
selectedEvent.status;
```

```
document.getElementById(
'bookingEventName'
).innerText =
selectedEvent.meetingName;
```

```
document.getElementById(
'roomingEventName'
).innerText =
selectedEvent.meetingName;
```

```
document.getElementById(
'finalizationEventName'
).innerText =
```

```
selectedEvent.meetingName;
```

```
document.getElementById(
'invoiceEventName'
).innerText =
selectedEvent.meetingName;
```

```
document.getElementById(
'sapEventName'
).innerText =
selectedEvent.meetingName;
```

```
document.getElementById(
'roomingStatusDisplay'
).innerText =
selectedEvent.roomingStatus ||
'Draft';
```

```
// Reset availability status
document.getElementById(
'availabilityStatus'
).innerText = 'Unknown';
document.getElementById(
'availabilityStatus'
).style.color = 'black';
```

```
// Reset hall dropdown and load halls for selected hotel
populateHallDropdown();
```

```
// Refresh rooming list for this event
renderRoomingList();
// Update rooming summary
updateRoomingSummary();
// Refresh invoice list
renderInvoices();
// Refresh audit
renderAudit();
// Refresh SAP records
renderSAPClosures();
}
/********************************
 DASHBOARD
********************************/
```

```
function updateDashboard(){
```

```
    document.getElementById(
    'totalEvents'
    ).innerText = events.length;
    document.getElementById(
    'pendingReviewCount'
    ).innerText =
    events.filter(
    x=>x.status ===
    'Venue Proposed'
```

```
    ).length;
    document.getElementById(
    'alternativeRequestCount'
    ).innerText =
    events.filter(
    x=>x.status ===
    'Alternative Requested'
    ).length;
    document.getElementById(
    'approvedEvents'
    ).innerText =
    events.filter(
    x=>x.status ===
    'Approved'
    ).length;
    document.getElementById(
    'bookingPendingCount'
    ).innerText =
    events.filter(
    x=>x.status ===
    'Approved'
    ).length;
    document.getElementById(
    'bookingConfirmedCount'
    ).innerText =
    events.filter(
    x=>x.status ===
    'Booked'
    ).length;
    document.getElementById(
    'participantCount'
    ).innerText =
    roomingLists.length;
```

```
    document.getElementById(
    'finalizedRoomingCount'
    ).innerText =
    events.filter(
    x=>x.roomingStatus ===
    'Finalized'
    ).length;
    document.getElementById(
    'invoiceCount'
    ).innerText =
    invoices.length;
    document.getElementById(
    'auditCount'
    ).innerText =
    invoiceAudits.length;
```

```
    document.getElementById(
    'sapUploadedCount'
```

```
    ).innerText =
    events.filter(
    x=>x.status ===
    'SAP Uploaded'
    ).length;
    document.getElementById(
    'closedEventCount'
    ).innerText =
    events.filter(
    x=>x.status ===
    'Closed'
    ).length;
    // Commercial expiry count
    const today = new Date();
    const expiring =
    approvedCommercials.filter(c=>{
```

```
        const expiry =
        new Date(c.validTill);
        const diff =
        (expiry - today)
        / 86400000;
        return diff <= 30 && diff > 0;
    });
    document.getElementById(
    'commercialExpiryCount'
    ).innerText =
    expiring.length;
    document.getElementById(
    'calendarCount'
    ).innerText =
    annualCalendar.length;
    document.getElementById(
    'monthlyPlanCount'
    ).innerText =
    monthlyPlans.length;
```

```
}
/********************************
 ROOM BLOCKING ENGINE
********************************/
function calculateRoomBlocking(){
```

```
    if(!selectedEvent || selectedEvent.status !== 'Booked'){
        alert('Booking Confirmation Required');
        return;
```

```
    }
    const so =
    Number(
    document.getElementById(
    'soCount'
    ).value);
    const dm =
    Number(
    document.getElementById(
    'dmCount'
    ).value);
    const rsm =
    Number(
    document.getElementById(
    'rsmCount'
    ).value);
    const dsm =
    Number(
    document.getElementById(
    'dsmCount'
    ).value);
    const ch =
    Number(
    document.getElementById(
    'chCount'
    ).value);
    const ibh =
    Number(
    document.getElementById(
    'ibhCount'
    ).value);
    const nsm =
    Number(
    document.getElementById(
    'nsmCount'
    ).value);
    roomRequirement.triple =
    Math.ceil(so/3)
    +
    Math.ceil(dm/3);
    roomRequirement.double =
    Math.ceil(rsm/2)
    +
    Math.ceil(dsm/2)
    +
    Math.ceil(nsm/2);
    roomRequirement.single =
    ch;
    roomRequirement.suite =
    ibh;
    roomRequirement.pax =
    so + dm + rsm + dsm +
```

```
    ch + ibh + nsm;
```

```
    document.getElementById(
    'tripleRooms'
    ).innerText =
    roomRequirement.triple;
```

```
    document.getElementById(
    'doubleRooms'
    ).innerText =
    roomRequirement.double;
    document.getElementById(
    'singleRooms'
    ).innerText =
    roomRequirement.single;
    document.getElementById(
    'suiteRooms'
    ).innerText =
    roomRequirement.suite;
    document.getElementById(
    'totalPax'
    ).innerText =
    roomRequirement.pax;
}
/********************************
 LOAD HOTEL INVENTORY
********************************/
```

```
function loadHotelInventory(){
```

```
const hotelId =
document.getElementById(
'hotelSelect'
).value;
// Populate halls for this hotel
populateHallDropdown();
if(!hotelId){
```

```
// Reset inventory display
document.getElementById('availTriple').innerText = '0';
document.getElementById('availDouble').innerText = '0';
document.getElementById('availSingle').innerText = '0';
document.getElementById('availSuite').innerText = '0';
updateAvailability();
return;
}
// Get inventory for this hotel
const inventory =
inventories.find(
x=>x.hotelId==hotelId
);
document.getElementById(
```

```
'availTriple'
).innerText =
inventory?.triple || 0;
```

```
document.getElementById(
'availDouble'
).innerText =
inventory?.double || 0;
```

```
document.getElementById(
'availSingle'
).innerText =
inventory?.single || 0;
document.getElementById(
'availSuite'
).innerText =
inventory?.suite || 0;
updateAvailability();
}
/********************************
 AVAILABILITY CHECKER
********************************/
function checkAvailability(){
if(!selectedEvent){
return true;
}
const hotelId =
document.getElementById(
'hotelSelect'
).value;
if(!hotelId){
return true;
}
const hallSelect =
document.getElementById(
'hallSelect'
);
if(!hallSelect.value){
return true;
}
const hallName =
hallSelect.options[
hallSelect.selectedIndex
].text;
const hotelName = hotels.find(h => h.id == hotelId)?.name || '';
for(const booking of bookings){
if(
booking.hotel === hotelName &&
```

```
booking.hall === hallName &&
```

```
booking.startDate ===
selectedEvent.startDate
```

```
){
```

```
return false;
```

```
}
}
```

```
return true;
```

```
}
/********************************
 UPDATE AVAILABILITY
********************************/
```

```
function updateAvailability(){
```

```
const status =
document.getElementById(
'availabilityStatus'
);
if(!selectedEvent){
status.innerText =
'No Event Selected';
status.style.color =
'black';
return;
}
const hotelId =
document.getElementById(
'hotelSelect'
).value;
if(!hotelId){
status.innerText =
'Select Hotel';
status.style.color =
'black';
return;
}
const hallSelect =
document.getElementById(
'hallSelect'
);
if(!hallSelect.value){
```

```
status.innerText =
'Select Hall';
status.style.color =
'black';
return;
}
```

```
if(checkAvailability()){
status.innerText =
'Available';
status.style.color =
'green';
}
else{
status.innerText =
'Already Booked';
status.style.color =
'red';
}
}
/********************************
 VALIDATE VENUE ALLOCATION
********************************/
```

```
function validateVenueAllocation(){
if(!checkAvailability()){
document.getElementById(
'allocationDecision'
).innerText =
'ALREADY BOOKED';
document.getElementById(
'allocationDecision'
).style.color =
'red';
return;
}
const hotelId =
document.getElementById(
'hotelSelect'
).value;
if(!hotelId){
alert('Select Hotel');
return;
```

```
}
const hallSelect =
document.getElementById(
'hallSelect'
);
if(!hallSelect.value){
alert('Select Hall');
return;
}
// Get hall capacity from halls array
const hall = halls.find(
h=>h.id == hallSelect.value
);
if(!hall){
alert('Hall not found');
return;
}
const hallCapacity = hall.capacity;
const inventory =
inventories.find(
x=>x.hotelId==hotelId
);
if(!inventory){
alert('Hotel inventory not found. Please set up inventory first.');
return;
}
const tbody =
document.getElementById(
'decisionTable'
);
tbody.innerHTML='';
let hallFail = false;
let warning = false;
/********************************
HALL CAPACITY
********************************/
const hallShortfall =
Math.max(
0,
roomRequirement.pax
-
hallCapacity
);
if(hallShortfall>0){
hallFail=true;
```

```
}
```

```
tbody.innerHTML += `
```

```
<tr>
```

```
<td>Hall Capacity</td>
```

```
<td>${roomRequirement.pax}</td>
```

```
<td>${hallCapacity}</td>
<td>${hallShortfall}</td>
```

```
<td>
${hallFail
?
'FAIL'
:
'PASS'}
</td>
</tr>
`;
/********************************
TRIPLE
********************************/
addAccommodationRow(
'Triple Rooms',
roomRequirement.triple,
inventory.triple || 0
);
/********************************
DOUBLE
********************************/
addAccommodationRow(
'Double Rooms',
roomRequirement.double,
inventory.double || 0
);
/********************************
SINGLE
********************************/
addAccommodationRow(
'Single Rooms',
roomRequirement.single,
inventory.single || 0
);
/********************************
SUITES
********************************/
```

```
addAccommodationRow(
```

```
'Suites',
roomRequirement.suite,
inventory.suite || 0
);
function addAccommodationRow(
label,
required,
available
){
const shortfall =
Math.max(
0,
required
-
available
);
let status='PASS';
if(shortfall>0){
status='WARNING';
warning=true;
}
tbody.innerHTML += `
<tr>
<td>${label}</td>
<td>${required}</td>
<td>${available}</td>
<td>${shortfall}</td>
<td>${status}</td>
</tr>
`;
}
/********************************
FINAL DECISION
********************************/
const decision =
document.getElementById(
'allocationDecision'
);
if(hallFail){
decision.innerText =
'NOT ALLOCATABLE';
decision.style.color =
```

```
'red';
```

```
}
else if(warning){
decision.innerText =
'ALLOCATABLE WITH WARNINGS';
decision.style.color =
'orange';
}
else{
decision.innerText =
'ALLOCATABLE';
decision.style.color =
```

```
'green';
}
generateRecommendations();
}
/********************************
 BOOK VENUE - Creates Proposal
********************************/
```

```
function bookVenue(){
```

```
if(!selectedEvent){
alert(
'Select Event'
);
return;
}
const hotelId =
document.getElementById(
'hotelSelect'
).value;
const hallSelect =
document.getElementById(
'hallSelect'
);
```

```
if(!hotelId){
```

```
alert(
'Select Hotel'
);
return;
```

```
}
```

```
if(!hallSelect.value){
```

```
alert(
'Select Hall'
);
return;
}
```

```
if(!checkAvailability()){
```

```
alert(
'This venue is already booked for this date!'
);
```

```
return;
}
const hallName =
hallSelect.options[
hallSelect.selectedIndex
].text;
```

```
const hotelName = hotels.find(h => h.id == hotelId)?.name || 'Unknown Hotel';
const booking = {
eventId:
selectedEvent.id,
meeting:
selectedEvent.meetingName,
```

```
hotel:
hotelName,
hall:
hallName,
startDate:
selectedEvent.startDate,
endDate:
selectedEvent.endDate
};
bookings.push(
booking
);
// Set status to Venue Proposed (not Booked)
selectedEvent.status =
'Venue Proposed';
```

```
renderBookings();
renderEvents();
updateDashboard();
updateAvailability();
```

```
alert(
'Venue Proposed Successfully! Waiting for Sales Head Review.'
);
```

```
}
/********************************
 RENDER BOOKINGS
********************************/
```

```
function renderBookings(){
```

```
const tbody =
document.getElementById(
'bookingTable'
);
```

```
tbody.innerHTML='';
bookings.forEach(b=>{
tbody.innerHTML += `
<tr>
<td>${b.meeting}</td>
<td>${b.hotel}</td>
<td>${b.hall}</td>
<td>${b.startDate}</td>
<td>${b.endDate}</td>
```

```
</tr>
```

```
`;
```

```
});
}
/********************************
 SALES HEAD REVIEW FUNCTIONS
********************************/
function acceptVenue(){
if(!selectedEvent){
alert(
'Select Event'
);
return;
}
selectedEvent.status =
'Accepted';
document.getElementById(
```

```
'reviewStatus'
).innerText =
'Accepted';
```

```
renderEvents();
```

```
updateDashboard();
alert('Venue Accepted!');
```

```
}
function requestAlternative(){
if(!selectedEvent){
```

```
alert(
'Select Event'
);
return;
}
selectedEvent.status =
'Alternative Requested';
```

```
selectedEvent.reviewRemarks =
document.getElementById(
'reviewRemarks'
).value;
document.getElementById(
'reviewStatus'
).innerText =
'Alternative Requested';
renderEvents();
updateDashboard();
alert('Alternative venue requested with remarks.');
}
function approveVenue(){
if(!selectedEvent){
alert(
'Select Event'
);
return;
}
selectedEvent.status =
'Approved';
document.getElementById(
'reviewStatus'
).innerText =
'Approved';
```

```
renderEvents();
updateDashboard();
alert('Venue Approved! Ready for booking confirmation.');
}
/********************************
 VENUE BOOKING FUNCTIONS
********************************/
```

```
function confirmBooking(){
if(!selectedEvent){
alert(
'Select Event'
);
return;
}
if(
selectedEvent.status !==
'Approved'
){
alert(
'Sales Head Approval Required'
);
return;
}
// Get the hotel from the booking
const bookingRecord =
bookings.find(
x=>x.eventId === selectedEvent.id
);
if(!bookingRecord){
alert('Booking record not found');
return;
}
const hotel =
hotels.find(
h=>h.name === bookingRecord.hotel
);
if(!hotel){
alert('Hotel not found');
return;
}
// Check for approved commercial
const commercial =
approvedCommercials.find(
x=>x.hotelId == hotel.id
);
```

```
if(!commercial){
alert(
'Approved Commercial Missing for ' + hotel.name + '. Please set up commercial
rates first.'
);
return;
}
const booking = {
eventId:
selectedEvent.id,
meeting:
selectedEvent.meetingName,
bookingReference:
document.getElementById(
'bookingReference'
).value,
bookingDate:
document.getElementById(
'bookingDate'
).value,
status:
'Booked'
};
const existing =
bookingConfirmations.find(
x=>x.eventId ===
selectedEvent.id
);
if(existing){
Object.assign(
existing,
booking
);
}
else{
bookingConfirmations.push(
booking
);
}
selectedEvent.status =
'Booked';
renderBookingConfirmations();
renderEvents();
```

```
updateDashboard();
```

```
alert(
'Booking Confirmed'
);
}
function cancelBooking(){
if(!selectedEvent){
return;
}
selectedEvent.status =
'Cancelled';
const booking =
bookingConfirmations.find(
x=>x.eventId ===
selectedEvent.id
);
if(booking){
booking.status =
'Cancelled';
}
renderBookingConfirmations();
renderEvents();
updateDashboard();
alert('Booking Cancelled');
}
function renderBookingConfirmations(){
const tbody =
document.getElementById(
'bookingConfirmationTable'
);
tbody.innerHTML='';
bookingConfirmations.forEach(b=>{
tbody.innerHTML += `
<tr>
<td>${b.meeting}</td>
<td>${b.bookingReference}</td>
<td>${b.bookingDate}</td>
<td>${b.status}</td>
```

```
</tr>
```

```
`;
```

```
});
```

```
}
/********************************
 ROOMING LIST FUNCTIONS
********************************/
```

```
function addParticipant(){
```

```
if(!selectedEvent){
```

```
alert(
'Select Event'
);
return;
}
if(
selectedEvent.roomingStatus ===
'Finalized'
){
alert(
'Rooming List Locked'
);
return;
```

```
}
```

```
const participant = {
```

```
eventId:
selectedEvent.id,
```

```
name:
document.getElementById(
'participantName'
).value,
```

```
designation:
document.getElementById(
'participantDesignation'
).value,
```

```
division:
document.getElementById(
'participantDivision'
).value,
```

```
state:
document.getElementById(
'participantState'
).value,
```

```
region:
```

```
document.getElementById(
'participantRegion'
).value,
occupancy:
document.getElementById(
'occupancyType'
).value,
checkIn:
document.getElementById(
'checkInDate'
).value,
checkOut:
document.getElementById(
'checkOutDate'
).value,
nrc:
document.getElementById(
'nrcFlag'
).value
};
roomingLists.push(
participant
);
renderRoomingList();
updateDashboard();
updateRoomingSummary();
```

```
// Clear form fields
document.getElementById('participantName').value = '';
document.getElementById('participantDesignation').value = '';
document.getElementById('participantDivision').value = '';
document.getElementById('participantState').value = '';
document.getElementById('participantRegion').value = '';
document.getElementById('checkInDate').value = '';
document.getElementById('checkOutDate').value = '';
}
function renderRoomingList(){
const tbody =
document.getElementById(
'roomingTable'
);
tbody.innerHTML='';
```

```
roomingLists
.filter(
x=>
selectedEvent &&
x.eventId ===
selectedEvent.id
)
.forEach(x=>{
```

```
tbody.innerHTML += `
```

```
<tr>
```

```
<td>${x.name}</td>
<td>${x.designation}</td>
<td>${x.division}</td>
<td>${x.occupancy}</td>
<td>${x.nrc}</td>
</tr>
`;
});
}
/********************************
 ROOMING SUMMARY ENGINE
********************************/
function updateRoomingSummary(){
if(!selectedEvent){
return;
}
const participants =
roomingLists.filter(
x=>x.eventId ===
selectedEvent.id
);
document.getElementById(
'finalParticipantCount'
).innerText =
participants.length;
document.getElementById(
'singleCount'
).innerText =
participants.filter(
x=>x.occupancy ===
'Single'
).length;
document.getElementById(
'doubleCount'
).innerText =
participants.filter(
x=>x.occupancy ===
'Double'
).length;
```

```
document.getElementById(
'tripleCount'
).innerText =
participants.filter(
x=>x.occupancy ===
'Triple'
).length;
document.getElementById(
'nrcCount'
).innerText =
participants.filter(
x=>x.nrc ===
'Yes'
).length;
}
/********************************
 ROOMING FINALIZATION FUNCTIONS
********************************/
function finalizeRooming(){
if(!selectedEvent){
alert(
'Select Event'
);
return;
}
const participants =
roomingLists.filter(
x=>x.eventId ===
selectedEvent.id
);
if(
participants.length === 0
){
alert(
'No Participants Found'
);
return;
}
selectedEvent.roomingStatus =
'Finalized';
selectedEvent.status =
'Ready For Event';
finalizedRoomings.push({
```

```
eventId:
selectedEvent.id,
```

```
finalizedDate:
new Date()
.toLocaleDateString(),
```

```
participantCount:
participants.length
});
document.getElementById(
'roomingStatusDisplay'
).innerText =
'Finalized';
renderEvents();
updateDashboard();
alert(
'Rooming List Finalized'
);
}
function unlockRooming(){
if(!selectedEvent){
return;
}
selectedEvent.roomingStatus =
'Draft';
document.getElementById(
'roomingStatusDisplay'
).innerText =
'Draft';
renderEvents();
alert('Rooming List Unlocked');
}
/********************************
 INVOICE FUNCTIONS
********************************/
function receiveInvoice(){
if(!selectedEvent){
```

```
alert(
'Select Event'
);
return;
}
```

```
if(
selectedEvent.roomingStatus !==
'Finalized'
){
alert(
'Finalize Rooming First'
);
return;
}
const invoice = {
eventId:
selectedEvent.id,
invoiceNumber:
document.getElementById(
'invoiceNumber'
).value,
invoiceDate:
document.getElementById(
'invoiceDate'
).value,
invoiceAmount:
Number(
document.getElementById(
'invoiceAmount'
).value
),
status:
'Received'
};
invoices.push(
invoice
);
selectedEvent.status =
'Invoice Pending';
renderInvoices();
renderEvents();
updateDashboard();
document.getElementById('invoiceNumber').value = '';
document.getElementById('invoiceDate').value = '';
document.getElementById('invoiceAmount').value = '';
alert('Invoice Received Successfully!');
```

```
}
function renderInvoices(){
```

```
const tbody =
document.getElementById(
'invoiceTable'
);
tbody.innerHTML='';
invoices.forEach(i=>{
tbody.innerHTML += `
<tr>
<td>${i.invoiceNumber}</td>
<td>${i.invoiceDate}</td>
<td>₹${i.invoiceAmount.toLocaleString()}</td>
<td>${i.status}</td>
</tr>
```

```
`;
```

```
});
}
/********************************
 INVOICE AUDIT FUNCTIONS
********************************/
```

```
function auditInvoice(){
```

```
if(!selectedEvent){
alert('Select Event First');
return;
}
const invoice =
invoices.find(
x=>x.eventId ===
selectedEvent.id
);
```

```
if(!invoice){
```

```
alert(
'No Invoice Found'
);
return;
```

```
}
const participants =
```

```
roomingLists.filter(
x=>x.eventId ===
selectedEvent.id
).length;
```

```
// Get booking to find hotel
const booking =
bookings.find(
x=>x.eventId ===
selectedEvent.id
);
if(!booking){
alert('Booking not found');
return;
}
const hotel =
hotels.find(
h=>h.name ===
booking.hotel
);
if(!hotel){
alert('Hotel not found');
return;
}
const commercial =
approvedCommercials.find(
x=>x.hotelId ==
hotel.id
);
if(!commercial){
alert('Approved Commercial not found');
return;
}
const expectedFood =
participants *
commercial.foodRate;
const expectedHall =
commercial.hallRate;
const expectedCost =
expectedFood +
expectedHall;
const foodVariance =
invoice.invoiceAmount -
expectedFood;
const hallVariance =
0; // Hall rate is fixed, no variance from invoice
const totalVariance =
invoice.invoiceAmount -
expectedCost;
invoiceAudits.push({
eventId:
selectedEvent.id,
participants,
```

```
expectedFood,
expectedHall,
expectedCost,
actualCost:
invoice.invoiceAmount,
foodVariance,
hallVariance,
totalVariance
});
renderAudit();
updateDashboard();
alert('Audit Completed!');
}
function renderAudit(){
```

```
const audit =
invoiceAudits.find(
x=>x.eventId ===
selectedEvent.id
);
if(!audit){
return;
}
const tbody =
document.getElementById(
'auditTable'
);
tbody.innerHTML = `
```

```
<tr>
```

```
<td>Participants</td>
```

```
<td>${audit.participants}</td>
```

```
</tr>
```

```
<tr>
```

```
<td>Expected Food Cost</td>
<td>₹${audit.expectedFood.toLocaleString()}</td>
</tr>
```

```
<tr>
```

```
<td>Expected Hall Cost</td>
```

```
<td>₹${audit.expectedHall.toLocaleString()}</td>
```

```
</tr>
```

```
<tr>
```

```
<td>Expected Total</td>
```

```
<td>₹${audit.expectedCost.toLocaleString()}</td>
```

```
</tr>
```

```
<tr>
```

```
<td>Actual Cost</td>
```

```
<td>₹${audit.actualCost.toLocaleString()}</td>
```

```
</tr>
```

## `<tr>` 

## `<td>Food Variance</td>` 

```
<td style="color:${audit.foodVariance > 0 ? 'red' : 'green'};font-weight:bold;">
₹${audit.foodVariance.toLocaleString()}
</td>
```

```
</tr>
```

## `<tr>` 

## `<td>Total Variance</td>` 

```
<td style="color:${audit.totalVariance > 0 ? 'red' : 'green'};font-
weight:bold;">
₹${audit.totalVariance.toLocaleString()}
</td>
```

## `</tr>` 

```
`;
```

```
}
/********************************
 SAP UPLOAD & CLOSURE FUNCTIONS
********************************/
```

```
function uploadToSAP(){
```

```
if(!selectedEvent){
```

```
alert(
'Select Event'
);
```

```
return;
```

```
}
const audit =
invoiceAudits.find(
x=>x.eventId ===
```

```
selectedEvent.id
);
if(!audit){
alert(
'Invoice Audit Required'
);
return;
}
const sapRecord = {
eventId:
selectedEvent.id,
meeting:
selectedEvent.meetingName,
sapReference:
document.getElementById(
'sapReference'
).value,
uploadDate:
document.getElementById(
'sapUploadDate'
).value,
paymentStatus:
document.getElementById(
'paymentStatus'
).value,
closureStatus:
'Open'
};
const existing =
sapClosures.find(
x=>x.eventId ===
selectedEvent.id
);
if(existing){
Object.assign(
existing,
sapRecord
);
}
else{
sapClosures.push(
sapRecord
);
}
selectedEvent.status =
```

```
'SAP Uploaded';
```

```
renderSAPClosures();
renderEvents();
updateDashboard();
```

```
document.getElementById('sapReference').value = '';
document.getElementById('sapUploadDate').value = '';
```

```
alert('Uploaded to SAP Successfully!');
```

```
}
function closeEvent(){
if(!selectedEvent){
alert('Select Event First');
return;
}
const sapRecord =
sapClosures.find(
x=>x.eventId ===
selectedEvent.id
);
if(!sapRecord){
alert(
'SAP Upload Required'
);
return;
}
if(
sapRecord.paymentStatus !==
'Paid'
){
alert(
'Payment Not Completed'
);
return;
}
sapRecord.closureStatus =
'Closed';
selectedEvent.status =
'Closed';
renderSAPClosures();
renderEvents();
updateDashboard();
```

```
alert('Event Closed Successfully!');
}
```

```
function renderSAPClosures(){
```

```
const tbody =
document.getElementById(
'sapTable'
);
tbody.innerHTML='';
sapClosures.forEach(x=>{
tbody.innerHTML += `
```

```
<tr>
```

```
<td>${x.meeting}</td>
<td>${x.sapReference}</td>
<td>${x.uploadDate}</td>
<td>${x.paymentStatus}</td>
<td>${x.closureStatus}</td>
```

```
</tr>
```

```
`;
```

```
});
```

```
}
/********************************
 RECOMMENDATION ENGINE
********************************/
```

```
function generateRecommendations(){
```

```
const tbody =
document.getElementById(
'recommendationTable'
);
```

```
tbody.innerHTML='';
```

```
let recommendationData = [];
/********************************
COUNT HALL PASS HOTELS
********************************/
```

```
let hallPassCount = 0;
```

```
hotels.forEach(hotel=>{
```

```
// Find halls for this hotel
const hotelHalls =
halls.filter(
```

```
h=>h.hotelId==hotel.id
);
let bestHallCapacity = 0;
hotelHalls.forEach(h=>{
if(h.capacity > bestHallCapacity){
bestHallCapacity = h.capacity;
}
```

```
});
if(
roomRequirement.pax <=
bestHallCapacity
){
hallPassCount++;
```

```
}
```

```
});
hotels.forEach(hotel=>{
const hotelId = hotel.id;
/********************************
HALL FIT
********************************/
const hotelHalls =
halls.filter(
h=>h.hotelId==hotelId
);
let bestHallCapacity = 0;
hotelHalls.forEach(h=>{
```

```
if(
h.capacity >
bestHallCapacity
){
bestHallCapacity =
h.capacity;
}
});
const hallFit =
roomRequirement.pax
<=
bestHallCapacity;
/********************************
GET INVENTORY
********************************/
```

```
const inventory =
inventories.find(
x=>x.hotelId==hotelId
);
/********************************
ACCOMMODATION FIT
********************************/
```

```
const tripleShortfall =
Math.max(
0,
roomRequirement.triple
-
(inventory?.triple || 0)
);
const doubleShortfall =
Math.max(
0,
roomRequirement.double
-
(inventory?.double || 0)
);
const singleShortfall =
Math.max(
0,
roomRequirement.single
-
(inventory?.single || 0)
);
const suiteShortfall =
Math.max(
0,
roomRequirement.suite
-
(inventory?.suite || 0)
);
const totalShortfall =
tripleShortfall +
doubleShortfall +
singleShortfall +
suiteShortfall;
/********************************
GET APPROVED COMMERCIAL
********************************/
const commercial =
approvedCommercials.find(
x=>x.hotelId==hotelId
);
/********************************
ESTIMATED COST
********************************/
```

```
const requiredRooms =
```

```
roomRequirement.triple +
```

```
roomRequirement.double +
```

```
roomRequirement.single +
```

```
roomRequirement.suite;
```

```
const roomRate = commercial?.roomRate || 0;
const hallRate = commercial?.hallRate || 0;
const foodRate = commercial?.foodRate || 0;
```

```
const accommodationCost =
requiredRooms * roomRate;
```

```
const foodCost =
roomRequirement.pax * foodRate;
```

```
const estimatedCost =
```

```
accommodationCost +
```

```
hallRate +
```

```
foodCost;
/********************************
FIT %
********************************/
let score = 100;
```

```
score =
score -
(totalShortfall * 5);
```

```
if(
!hallFit
){
score = 0;
```

```
}
```

```
if(
score < 0
){
```

```
score = 0;
```

```
}
/********************************
SHORTFALL TEXT
********************************/
```

```
let shortfalls=[];
```

```
if(
tripleShortfall>0
){
```

```
shortfalls.push(
'Triple: ' +
tripleShortfall
);
}
if(
doubleShortfall>0
){
shortfalls.push(
'Double: ' +
doubleShortfall
);
}
if(
singleShortfall>0
){
shortfalls.push(
'Single: ' +
singleShortfall
);
}
if(
suiteShortfall>0
){
shortfalls.push(
'Suite: ' +
suiteShortfall
);
}
if(
shortfalls.length===0
){
shortfalls.push(
'None'
);
}
/********************************
RECOMMENDATION
********************************/
let recommendation='';
if(!hallFit){
recommendation =
'NOT SUITABLE';
}
else if(
```

```
hallPassCount === 1
){
recommendation =
'ONLY VIABLE OPTION';
}
else if(
score >= 95
){
recommendation =
'BEST MATCH';
}
else if(
score >= 80
){
recommendation =
'GOOD MATCH';
}
else{
recommendation =
'ALTERNATIVE';
}
/********************************
ACCOMMODATION FIT LABEL
********************************/
```

```
let accommodationFit='PASS';
```

```
if(
totalShortfall>0
){
accommodationFit=
'WARNING';
}
/********************************
STORE DATA
********************************/
recommendationData.push({
hotel:hotel.name,
hallFit:hallFit,
accommodationFit:
accommodationFit,
shortfalls:
shortfalls.join(', '),
score:score,
estimatedCost:
```

```
estimatedCost,
```

```
recommendation:
recommendation
```

```
});
```

```
});
```

```
/********************************
SORT & RENDER
********************************/
```

```
recommendationData.sort(
```

```
(a,b)=>{
```

```
if(
b.score !== a.score
){
return b.score - a.score;
```

```
}
```

```
return a.estimatedCost -
b.estimatedCost;
```

```
}
```

```
);
```

```
recommendationData.forEach(r=>{
```

```
let label =
r.recommendation;
```

```
if(
r.score >= 95 &&
r === recommendationData[0]
){
```

```
label =
'BEST VALUE';
```

```
}
```

```
tbody.innerHTML += `
```

```
<tr>
```

```
<td>${r.hotel}</td>
```

```
<td>${r.hallFit?'PASS':'FAIL'}</td>
```

```
<td>${r.accommodationFit}</td>
```

```
<td>${r.shortfalls}</td>
```

```
<td>${r.score}%</td>
```

```
<td>
₹${r.estimatedCost.toLocaleString()}
</td>
```

```
<td>
```

```
${label}
```

`${label === 'ONLY VIABLE OPTION' ? ' '` ⭐ 

```
: ''}
```

```
</td>
```

```
</tr>
```

```
`;
```

```
});
```

```
}
```

```
</script>
```

```
</body>
</html>
```

