export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname;

    async function jsonRes(data, status=200) {
        return new Response(JSON.stringify(data), {
            status,
            headers: { "Content-Type": "application/json" }
        });
    }

    // POST /checkin
    if (path === "/checkin" && request.method === "POST") {
        try {
            const { ticket_id, name, seat, status } = await request.json();
            if (!ticket_id || !name || !seat) return jsonRes({ error: "missing" }, 400);

            const i = await env.checkin.prepare(`
                INSERT INTO checkins (ticket_id, name, seat, status)
                VALUES (?, ?, ?, ?)
            `).bind(ticket_id, name, seat, status || "pending").run();

            return jsonRes({ id: i.lastInsertRowid });
        } catch (e) {
            console.error("Checkin insert failed:", e);
            return jsonRes({ error: "Internal Server Error" }, 500);
        }
    }

    // GET /latest
    if (path === "/latest" && request.method === "GET") {
        try {
            const res = await env.checkin.prepare(`
                SELECT * FROM checkins
                WHERE status='pending'
                ORDER BY timestamp DESC
                LIMIT 1
            `).all();

            return jsonRes(res.results[0] || {});
        } catch (e) {
            console.error("Fetch latest failed:", e);
            return jsonRes({ error: "Internal Server Error" }, 500);
        }
    }

    // POST /update/:id
    if (path.startsWith("/update/") && request.method === "POST") {
        try {
            const id = path.split("/")[2];
            const { status } = await request.json();
            await env.checkin.prepare(`UPDATE checkins SET status=? WHERE id=?`).bind(status, id).run();
            return jsonRes({ success: true });
        } catch (e) {
            console.error("Update failed:", e);
            return jsonRes({ error: "Internal Server Error" }, 500);
        }
    }

    // POST /delete/:id
    if (path.startsWith("/delete/") && request.method === "POST") {
        try {
            const id = path.split("/")[2];
            await env.checkin.prepare(`DELETE FROM checkins WHERE id=?`).bind(id).run();
            return jsonRes({ deleted: true });
        } catch (e) {
            console.error("Delete failed:", e);
            return jsonRes({ error: "Internal Server Error" }, 500);
        }
    }

    return new Response("Not found", { status: 404 });
}
