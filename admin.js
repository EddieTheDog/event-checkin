window.addEventListener('DOMContentLoaded', () => {
    const scanInput = document.getElementById('scanTicket');
    const fetchBtn = document.getElementById('fetchBtn');
    const frameDiv = document.getElementById('frame');
    const infoDiv = document.getElementById('info');
    const approveBtn = document.getElementById('approveBtn');
    const declineBtn = document.getElementById('declineBtn');
    const statusDiv = document.getElementById('status');

    let currentData = null;

    fetchBtn.addEventListener('click', async () => {
        const ticket = scanInput.value.trim();
        if (!ticket) return;
        clearFrame('frame');
        infoDiv.innerHTML = "";
        statusDiv.textContent = "";

        const data = await D1_API.findByTicket(ticket);
        if (!data || !data.id) {
            statusDiv.textContent = "Not found!";
            return;
        }

        currentData = data;
        generateQRCode(data.ticket_id, 'frame');

        infoDiv.innerHTML = `
            <p><b>Name:</b> ${data.name}</p>
            <p><b>Seat:</b> ${data.seat}</p>
        `;

        approveBtn.style.display = "inline";
        declineBtn.style.display = "inline";
    });

    approveBtn.addEventListener('click', async () => {
        if (!currentData) return;
        await D1_API.updateStatus(currentData.id, "approved");
        statusDiv.textContent = "Approved!";
        resetAfter();
    });

    declineBtn.addEventListener('click', async () => {
        if (!currentData) return;
        await D1_API.deleteCheckin(currentData.id);
        statusDiv.textContent = "Declined & deleted!";
        resetAfter();
    });

    function resetAfter() {
        currentData = null;
        approveBtn.style.display = "none";
        declineBtn.style.display = "none";
    }
});
