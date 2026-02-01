const BASE_URL = window.location.origin;

async function fetchJSON(url, options = {}) {
    try {
        const res = await fetch(`${BASE_URL}${url}`, options);
        return await res.json();
    } catch (e) {
        console.error("Fetch error:", e);
        throw e;
    }
}

async function createCheckin(ticket_id, name, seat) {
    return fetchJSON("/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id, name, seat }),
    });
}

async function fetchLatest() {
    return fetchJSON("/latest");
}

async function updateCheckin(id, status) {
    return fetchJSON(`/update/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });
}

async function deleteCheckin(id) {
    return fetchJSON(`/delete/${id}`, { method: "POST" });
}

async function fetchAll() {
    return fetchJSON("/all");
}
