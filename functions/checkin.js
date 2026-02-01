export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // Helper: JSON response
    async function jsonRes(data, status = 200) {
      return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      // ------------------------------
      // POST /checkin - add new check-in
      // ------------------------------
      if (pathname === "/checkin" && request.method === "POST") {
        const { ticket_id, name, seat } = await request.json();

        if (!ticket_id || !name || !seat) {
          return jsonRes({ error: "Missing required fields" }, 400);
        }

        const result = await env.checkin
          .prepare(
            `INSERT INTO checkins (ticket_id, name, seat, status)
             VALUES (?, ?, ?, 'pending')`
          )
          .bind(ticket_id, name, seat)
          .run();

        return jsonRes({ id: result.lastInsertRowid });
      }

      // ------------------------------
      // GET /latest - get latest pending check-in
      // ------------------------------
      if (pathname === "/latest" && request.method === "GET") {
        const result = await env.checkin
          .prepare(
            `SELECT * FROM checkins WHERE status='pending' ORDER BY timestamp ASC LIMIT 1`
          )
          .all();

        if (!result.results.length) return jsonRes({});
        return jsonRes(result.results[0]);
      }

      // ------------------------------
      // POST /update/:id - approve or decline
      // ------------------------------
      if (pathname.startsWith("/update/") && request.method === "POST") {
        const id = pathname.split("/")[2];
        const { status, decline_reason } = await request.json();

        if (!["approved", "declined"].includes(status)) {
          return jsonRes({ error: "Invalid status" }, 400);
        }

        await env.checkin
          .prepare(
            `UPDATE checkins SET status=?, decline_reason=?, processed=1 WHERE id=?`
          )
          .bind(status, decline_reason || null, id)
          .run();

        return jsonRes({ success: true });
      }

      // ------------------------------
      // POST /delete/:id - delete a check-in
      // ------------------------------
      if (pathname.startsWith("/delete/") && request.method === "POST") {
        const id = pathname.split("/")[2];
        await env.checkin
          .prepare(`DELETE FROM checkins WHERE id=?`)
          .bind(id)
          .run();

        return jsonRes({ deleted: true });
      }

      // ------------------------------
      // GET /all - list all check-ins
      // ------------------------------
      if (pathname === "/all" && request.method === "GET") {
        const result = await env.checkin.prepare(`SELECT * FROM checkins`).all();
        return jsonRes(result.results);
      }

      // ------------------------------
      // Default: Not Found
      // ------------------------------
      return new Response("Not found", { status: 404 });
    } catch (err) {
      console.error("Error in checkin function:", err);
      return jsonRes({ error: err.message }, 500);
    }
  }
};
