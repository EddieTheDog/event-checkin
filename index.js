window.addEventListener('DOMContentLoaded', () => {
    let currentCheckin = null;

    const ticketInput = document.getElementById('ticket');
    const nameInput = document.getElementById('name');
    const seatInput = document.getElementById('seat');
    const nextBtn = document.getElementById('nextBtn');
    const statusDiv = document.getElementById('status');

    nextBtn.addEventListener('click', async () => {
        const ticket = ticketInput.value.trim();
        const name = nameInput.value.trim();
        const seat = seatInput.value.trim();

        if (!ticket || !name || !seat) {
            alert("Please fill in all fields");
            return;
        }

        clearFrame('frame');
        generateQRCode(ticket, 'frame');

        const res = await D1_API.createCheckin({ ticket_id: ticket, name, seat, status: "pending" });
        currentCheckin = res;

        statusDiv.textContent = "Waiting for admin approval...";
    });

    async function pollStatus() {
        if (!currentCheckin) return;
        try {
            const latest = await D1_API.fetchLatestPending();
            if (!latest || !latest.id) return;

            if (latest.id === currentCheckin.id) {
                if (latest.status === "approved") {
                    statusDiv.textContent = "Please wait one minute...";
                    currentCheckin = null;
                } else if (latest.status === "declined") {
                    statusDiv.textContent = "Check-in declined!";
                    currentCheckin = null;
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    setInterval(pollStatus, 2000);
});
