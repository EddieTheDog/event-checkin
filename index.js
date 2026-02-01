window.addEventListener('DOMContentLoaded', () => {
    let currentId = null;
    const ticketInput = document.getElementById('ticket');
    const nameInput = document.getElementById('name');
    const seatInput = document.getElementById('seat');
    const nextBtn = document.getElementById('nextBtn');
    const statusDiv = document.getElementById('status');
    const squaresContainer = document.getElementById('squaresContainer');

    nextBtn.addEventListener('click', async () => {
        const ticket = ticketInput.value.trim();
        const name = nameInput.value.trim();
        const seat = seatInput.value.trim();
        if (!ticket || !name || !seat) {
            alert("Fill all fields.");
            return;
        }

        clearFrame('frame');
        generateQRCode(ticket, 'frame');

        const res = await D1_API.createCheckin({
            ticket_id: ticket,
            name,
            seat,
            status: "pending"
        });
        currentId = res.id;
        statusDiv.textContent = "Waiting for approval...";
    });

    async function pollStatus() {
        if (!currentId) return;
        const data = await D1_API.findByTicket(currentId.ticket_id || "");
        if (data && data.status === "approved") {
            statusDiv.textContent = "Please wait one minute...";
            squaresContainer.style.display = "none";
        }
        if (data && data.status === "declined") {
            statusDiv.textContent = "Please wait ■ ■ ■";
            squaresContainer.style.display = "flex";
        }
    }

    setInterval(pollStatus, 2000);
});
