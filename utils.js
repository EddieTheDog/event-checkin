// utils.js - shared functions for kiosk & admin

function generateQRCode(text, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    new QRCode(container, {
        text: text,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

function clearFrame(containerId) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = '';
}

// Use absolute URLs to prevent HTML instead of JSON
const D1_API = {
    BASE_URL: window.location.origin, // same domain

    async createCheckin(data) {
        const res = await fetch(`${this.BASE_URL}/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async fetchLatestPending() {
        const res = await fetch(`${this.BASE_URL}/latest`);
        return res.json();
    },

    async updateStatus(id, status) {
        const res = await fetch(`${this.BASE_URL}/update/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return res.json();
    },

    async deleteCheckin(id) {
        const res = await fetch(`${this.BASE_URL}/delete/${id}`, { method: 'POST' });
        return res.json();
    }
};
