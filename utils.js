// utils.js - shared functions

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

const D1_API = {
    BASE_URL: window.location.origin,

    async createCheckin(data) {
        const r = await fetch(`${this.BASE_URL}/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return r.json();
    },

    async fetchLatestPending() {
        const r = await fetch(`${this.BASE_URL}/latest`);
        return r.json();
    },

    async updateStatus(id, status) {
        const r = await fetch(`${this.BASE_URL}/update/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return r.json();
    },

    async deleteCheckin(id) {
        const r = await fetch(`${this.BASE_URL}/delete/${id}`, { method: 'POST' });
        return r.json();
    }
};
