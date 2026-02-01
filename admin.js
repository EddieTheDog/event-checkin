const infoEl = document.getElementById("info");
const consoleEl = document.getElementById("console");
const approveBtn = document.getElementById("approveBtn");
const declineBtn = document.getElementById("declineBtn");

let currentCheckin = null;

function log(msg) {
    consoleEl.textContent += `[${new Date().toLocaleTimeString()}] ${msg}\n`;
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

async function pollLatest() {
    try {
        const data = await fetchLatest();
        if (data && data.id && (!currentCheckin || currentCheckin.id !== data.id)) {
            currentCheckin = data;
            infoEl.textContent = JSON.stringify(data, null, 2);
            log(`New check-in ID ${data.id} detected.`);
        }
    } catch (e) {
        log(`Polling error: ${e}`);
    }
}

approveBtn.addEventListener("click", async () => {
    if (!currentCheckin) return;
    await updateCheckin(currentCheckin.id, "approved");
    log(`Approved ID ${currentCheckin.id}`);
    currentCheckin = null;
    infoEl.textContent = "";
});

declineBtn.addEventListener("click", async () => {
    if (!currentCheckin) return;
    await updateCheckin(currentCheckin.id, "declined");
    log(`Declined ID ${currentCheckin.id}`);
    await deleteCheckin(currentCheckin.id); // clear declined
    currentCheckin = null;
    infoEl.textContent = "";
});

// Poll every 3 seconds
setInterval(pollLatest, 3000);
pollLatest();
