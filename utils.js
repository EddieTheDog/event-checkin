// utils.js
// Shared utilities for QR generation, ephemeral frames, and D1 API calls

// QR code generation (using QRCode.js)
function generateQRCode(text, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // clear old frame
    new QRCode(container, {
        text: text,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Clean ephemeral frame
function clearFrame(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
}

// D1 API calls
const D1_API = {
    BASE_URL: "https://YOUR_WORKER_URL", // replace with your Cloudflare Worker endpoint

    // Create new check-in
    async createCheckin(data) {
        const res = await fetch(`${this.BASE_URL}/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // Fetch latest check-in ID
    async fetchLatestID() {
        const res = await fetch(`${this.BASE_URL}/latest`);
        return res.json(); // { latest_checkin_id: 123 }
    },

    // Fetch full check-in data by ID
    async fetchFullData(id) {
        const res = await fetch(`${this.BASE_URL}/checkin/${id}`);
        return res.json();
    },

    // Update check-in status
    async updateStatus(id, status, declineReason = null) {
        const res = await fetch(`${this.BASE_URL}/update/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, decline_reason: declineReason })
        });
        return res.json();
    }
};
