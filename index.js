// index.js
let currentCheckinID = null;
let squareCode = ["middle", "right", "left"]; // admin unlock code
let squareInput = [];

const ticketInput = document.getElementById('ticket');
const nameInput = document.getElementById('name');
const seatInput = document.getElementById('seat');
const nextBtn = document.getElementById('nextBtn');
const statusDiv = document.getElementById('status');
const squaresContainer = document.getElementById('squaresContainer');

// Submit new check-in
nextBtn.addEventListener('click', async () => {
    const ticket = ticketInput.value.trim();
    const name = nameInput.value.trim();
    const seat = seatInput.value.trim();
    if (!ticket || !name || !seat) {
        alert("Please fill in all fields");
        return;
    }

    // Clear old frame and status
    clearFrame('frame');
    statusDiv.textContent = "";

    // Generate QR dynamically
    generateQRCode(ticket, 'frame');

    // Send data to backend
    const data = { ticket_id: ticket, name, seat, status: "pending" };
    const res = await D1_API.createCheckin(data);
    currentCheckinID = res.id;

    statusDiv.textContent = "Waiting for admin approval...";
});

// Listen for status updates
async function pollStatus() {
    if (!currentCheckinID) return;
    try {
        const data = await D1_API.fetchFullData(currentCheckinID);
        if (!data) return;

        if (data.status === "approved") {
            statusDiv.textContent = "Please wait one minute...";
            squaresContainer.style.display = "none";
        } else if (data.status === "declined") {
            statusDiv.textContent = "Please wait ■ ■ ■";
            squaresContainer.style.display = "flex";
        }
    } catch(e) {
        console.error(e);
    }
}

// Square unlock logic
squaresContainer.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('square')) return;
    squareInput.push(e.target.dataset.pos);
    if (squareInput.join() === squareCode.join()) {
        // Unlock decline reason (could be enhanced later)
        statusDiv.textContent = "Decline reason unlocked by admin";
        squareInput = [];
    } else if (squareInput.length >= 3) {
        squareInput = []; // reset if wrong
    }
});

setInterval(pollStatus, 2000);
