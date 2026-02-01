// admin.js - admin panel with server output and copy button
window.addEventListener('DOMContentLoaded', () => {
    let currentCheckin = null;

    const frameDiv = document.getElementById('frame');
    const infoDiv = document.getElementById('info');
    const approveBtn = document.getElementById('approveBtn');
    const declineBtn = document.getElementById('declineBtn');
    const statusDiv = document.getElementById('status');
    const consoleDiv = document.getElementById('serverConsole');
    const copyBtn = document.getElementById('copyConsole');

    function logConsole(msg) {
        const timestamp = new Date().toLocaleTimeString();
        consoleDiv.textContent += `[${timestamp}] ${msg}\n`;
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(consoleDiv.textContent)
            .then(() => logConsole("Copied console to clipboard"))
            .catch(err => logConsole("Copy failed: " + err));
    });

    async function pollLatest() {
        try {
            const latest = await D1_API.fetchLatestPending();
            if (!latest || !latest.id || (currentCheckin && latest.id === currentCheckin.id)) return;

            currentCheckin = latest;

            clearFrame('frame');
            generateQRCode(latest.ticket_id, 'frame');

            infoDiv.innerHTML = `<p><b>Name:</b> ${latest.name}</p>
                                 <p><b>Seat:</b> ${latest.seat}</p>
                                 <p><b>Ticket ID:</b> ${latest.ticket_id}</p>`;

            approveBtn.style.display = "inline";
            declineBtn.style.display = "inline";
            statusDiv.textContent = "New check-in received";

            logConsole("Fetched latest check-in: " + JSON.stringify(latest));
        } catch (e) {
            logConsole("Polling error: " + e);
        }
    }

    approveBtn.addEventListener('click', async () => {
        if (!currentCheckin) return;
        try {
            const res = await D1_API.updateStatus(currentCheckin.id, "approved");
            statusDiv.textContent = "Check-in approved!";
            logConsole("Approved: " + JSON.stringify(res));
            resetCheckin();
        } catch (e) {
            logConsole("Approval failed: " + e);
        }
    });

    declineBtn.addEventListener('click', async () => {
        if (!currentCheckin) return;
        try {
            const res = await D1_API.deleteCheckin(currentCheckin.id);
            statusDiv.textContent = "Check-in declined and deleted!";
            logConsole("Declined: " + JSON.stringify(res));
            resetCheckin();
        } catch (e) {
            logConsole("Decline failed: " + e);
        }
    });

    function resetCheckin() {
        currentCheckin = null;
        approveBtn.style.display = "none";
        declineBtn.style.display = "none";
        clearFrame('frame');
        infoDiv.innerHTML = "";
    }

    setInterval(pollLatest, 2000);
});
