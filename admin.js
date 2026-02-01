window.addEventListener('DOMContentLoaded', () => {
    let currentCheckin = null;

    const frameDiv = document.getElementById('frame');
    const infoDiv = document.getElementById('info');
    const approveBtn = document.getElementById('approveBtn');
    const declineBtn = document.getElementById('declineBtn');
    const statusDiv = document.getElementById('status');

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
        } catch (e) {
            console.error("Polling error:", e);
        }
    }

    approveBtn.addEventListener('click', async () => {
        if (!currentCheckin) return;
        try {
            await D1_API.updateStatus(currentCheckin.id, "approved");
            statusDiv.textContent = "Check-in approved!";
            resetCheckin();
        } catch (e) {
            console.error("Approval failed:", e);
        }
    });

    declineBtn.addEventListener('click', async () => {
        if (!currentCheckin) return;
        try {
            await D1_API.deleteCheckin(currentCheckin.id);
            statusDiv.textContent = "Check-in declined and deleted!";
            resetCheckin();
        } catch (e) {
            console.error("Decline failed:", e);
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
