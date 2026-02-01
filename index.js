const ticketInput = document.getElementById("ticketInput");
const nameInput = document.getElementById("nameInput");
const seatInput = document.getElementById("seatInput");
const statusEl = document.getElementById("status");
const checkinBtn = document.getElementById("checkinBtn");

checkinBtn.addEventListener("click", async () => {
    const ticket = ticketInput.value.trim();
    const name = nameInput.value.trim();
    const seat = seatInput.value.trim();
    if (!ticket || !name || !seat) {
        statusEl.textContent = "Please fill all fields.";
        return;
    }

    try {
        const res = await createCheckin(ticket, name, seat);
        statusEl.textContent = "Waiting for approval...";
        ticketInput.value = "";
        nameInput.value = "";
        seatInput.value = "";
    } catch (e) {
        statusEl.textContent = "Error creating check-in.";
    }
});
