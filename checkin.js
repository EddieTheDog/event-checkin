export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // Helper to return JSON
        async function jsonRes(data, status = 200) {
            return new Response(JSON.stringify(data), {
                status,
                headers: { "Content-Type": "application/json" },
            });
        }

        try {
            // POST /checkin → create new check-in
            if (path === "/checkin" && request.method === "POST") {
                const { ticket_id, name, seat, status } = await request.json();
                if (!ticket_id || !name || !seat) return jsonRes({ error: "missing fields" }, 400);

                const i = await env.checkin.prepare(`
                    INSERT INTO checkins (ticket_id, name, seat, status)
                    VALUES (?, ?, ?, ?)
                `).bind(ticket_id, name, seat, status || "pending").run();

                return jsonRes({ id: i.lastInsertRowid });
            }

            // GET /latest → get the most recent pending check-in
            if (path === "/latest" && request.method === "GET") {
                const res = await env.checkin.prepare(`
                    SELECT * FROM checkins
                    WHERE status='pending'
                    ORDER BY timestamp DESC
                    LIMIT 1
                `).all();

                return jsonRes(res.results[0] || {});
            }

            // POST /update/:id → update status (approved/declined)
            if (path.startsWith("/update/") && request.method === "POST") {
                const id = path.split("/")[2];
                const { status } = await request.json();
                await env.checkin.prepare(`UPDATE checkins SET status=? WHERE id=?`).bind(status, id).run();
                return jsonRes({ success: true });
            }

            // POST /delete/:id → delete a check-in
            if (path.startsWith("/delete/") && request.method === "POST") {
                const id = path.split("/")[2];
                await env.checkin.prepare(`DELETE FROM checkins WHERE id=?`).bind(id).run();
                return jsonRes({ deleted: true });
            }

            // GET /all → list all check-ins
            if (path === "/all" && request.method === "GET") {
                const res = await env.checkin.prepare(`SELECT * FROM checkins ORDER BY timestamp DESC`).all();
                return jsonRes(res.results || []);
            }

            // Default: not found
            return new Response("Not found", { status: 404 });

        } catch (err) {
            console.error("Server error:", err);
            return jsonRes({ error: "Internal Server Error" }, 500);
        }
    }
};
