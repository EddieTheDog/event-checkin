// admin.js
let latestID = null;
let currentCheckin = null;

const frameDiv = document.getElementById('frame');
const adminName = document.getElementById('adminName');
const adminSeat = document.getElementById('adminSeat');
const approveBtn = document.getElementById('approveBtn');
const declineBtn = document.getElementById('declineBtn');
const declineReasonsDiv = document.getElementById('declineReasons');
const finishBtn = document.getElementById('finishBtn');
const statusDiv = document.getElementById('status');

// Poll latest check-in ID every 3s
async function pollLatest() {
    try {
        const res = await D1_API.fetchLatestID();
        if (res.latest_checkin_id && res.latest_checkin_id !== latestID) {
            latestID = res.latest_checkin_id;
            fetchFullData(latestID);
        }
    } catch(e) {
        console.error(e);
    }
}

// Fetch full data
async function fetchFullData(id) {
    const data = await D1_API.fetchFullData(id);
    if (!data) return;
    currentCheckin = data;

    clearFrame('frame');
    generateQRCode(data.ticket_id, 'frame');
    adminName.value = data.name;
    adminSeat.value = data.seat;
    statusDiv.textContent = "New check-in received.";
    declineReasonsDiv.style.display = "none";
    finishBtn.style.display = "none";
}

// Approve
approveBtn.addEventListener('click', async () => {
    if (!currentCheckin) return;
    await D1_API.updateStatus(currentCheckin.id, "approved");
    statusDiv.textContent = "Approved. Waiting for name tag retrieval.";
});

// Decline
declineBtn.addEventListener('click', () => {
    declineReasonsDiv.style.display = "block";
});

// Select decline reason
declineReasonsDiv.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('decline-reason')) return;
    const reason = e.target.dataset.reason;
    await D1_API.updateStatus(currentCheckin.id, "declined", reason);
    statusDiv.textContent = "Declined: " + reason;
    finishBtn.style.display = "inline-block";
});

// Finish workflow
finishBtn.addEventListener('click', () => {
    clearFrame('frame');
    adminName.value = "";
    adminSeat.value = "";
    statusDiv.textContent = "Ready for next guest.";
    declineReasonsDiv.style.display = "none";
    finishBtn.style.display = "none";
    currentCheckin = null;
    latestID = null;
});

setInterval(pollLatest, 3000);
