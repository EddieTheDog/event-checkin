// Config
const BASE_URL = window.location.origin; // automatically uses your Pages domain

// Elements
const ticketInput = document.getElementById("ticket_id");
const nameInput = document.getElementById("name");
const seatInput = document.getElementById("seat");
const submitBtn = document.getElementById("submitBtn");
const kioskMessage = document.getElementById("kioskMessage");

const adminOutput = document.getElementById("adminOutput");
const approveBtn = document.getElementById("approveBtn");
const declineBtn = document.getElementById("declineBtn");
const declineReasonInput = document.getElementById("declineReason");

let latestCheckin = null;

// -------------------
// Kiosk: Submit check-in
// -------------------
submitBtn.addEventListener("click", async () => {
  const ticket_id = ticketInput.value.trim();
  const name = nameInput.value.trim();
  const seat = seatInput.value.trim();

  if (!ticket_id || !name || !seat) {
    kioskMessage.textContent = "Please fill all fields.";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id, name, seat })
    });
    const data = await res.json();
    if (data.id) {
      kioskMessage.textContent = `Check-in submitted! ID: ${data.id}`;
      ticketInput.value = "";
      nameInput.value = "";
      seatInput.value = "";
    } else {
      kioskMessage.textContent = `Error: ${data.error || "Unknown"}`;
    }
  } catch (err) {
    kioskMessage.textContent = `Error submitting check-in: ${err.message}`;
    console.error(err);
  }
});

// -------------------
// Admin: Poll latest pending check-in
// -------------------
async function pollLatest() {
  try {
    const res = await fetch(`${BASE_URL}/latest`);
    const data = await res.json();
    latestCheckin = data;
    if (latestCheckin && latestCheckin.id) {
      adminOutput.textContent = JSON.stringify(latestCheckin, null, 2);
    } else {
      adminOutput.textContent = "No pending check-ins.";
    }
  } catch (err) {
    adminOutput.textContent = `Polling error: ${err.message}`;
    console.error(err);
  }
}

// Poll every 3 seconds
setInterval(pollLatest, 3000);
pollLatest();

// -------------------
// Admin: Approve
// -------------------
approveBtn.addEventListener("click", async () => {
  if (!latestCheckin || !latestCheckin.id) return;
  try {
    await fetch(`${BASE_URL}/update/${latestCheckin.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" })
    });
    latestCheckin = null;
    adminOutput.textContent = "Approved! Waiting for next check-in...";
  } catch (err) {
    adminOutput.textContent = `Error approving: ${err.message}`;
    console.error(err);
  }
});

// -------------------
// Admin: Decline
// -------------------
declineBtn.addEventListener("click", async () => {
  if (!latestCheckin || !latestCheckin.id) return;
  const reason = declineReasonInput.value.trim() || "No reason provided";
  try {
    await fetch(`${BASE_URL}/update/${latestCheckin.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "declined", decline_reason: reason })
    });
    await fetch(`${BASE_URL}/delete/${latestCheckin.id}`, { method: "POST" });
    latestCheckin = null;
    declineReasonInput.value = "";
    adminOutput.textContent = "Declined and deleted! Waiting for next check-in...";
  } catch (err) {
    adminOutput.textContent = `Error declining: ${err.message}`;
    console.error(err);
  }
});
