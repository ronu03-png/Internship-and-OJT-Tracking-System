import { Router } from "express";
import db from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

// Compute hours between two "HH:MM" times.
function computeHours(timeIn, timeOut) {
  if (!timeIn || !timeOut) return 0;
  const [ih, im] = timeIn.split(":").map(Number);
  const [oh, om] = timeOut.split(":").map(Number);
  let mins = oh * 60 + om - (ih * 60 + im);
  if (mins <= 0) return 0;
  // Deduct a 1-hour lunch break for shifts longer than 5 hours.
  if (mins > 300) mins -= 60;
  return Math.round((mins / 60) * 100) / 100;
}

function internIdsForSupervisor(supervisorId) {
  return db
    .prepare("SELECT id FROM users WHERE supervisor_id = ?")
    .all(supervisorId)
    .map((r) => r.id);
}

// Intern logs attendance for a day.
router.post("/", authRequired, requireRole("intern"), (req, res) => {
  const { date, time_in, time_out, remarks } = req.body || {};
  if (!date) return res.status(400).json({ error: "Date is required" });
  const hours = computeHours(time_in, time_out);
  const info = db
    .prepare(
      `INSERT INTO attendance (intern_id, date, time_in, time_out, hours, remarks)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(req.user.id, date, time_in || null, time_out || null, hours, remarks || null);
  const row = db.prepare("SELECT * FROM attendance WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(row);
});

// List attendance. Intern: own records. Supervisor: their interns'.
router.get("/", authRequired, (req, res) => {
  if (req.user.role === "intern") {
    const rows = db
      .prepare("SELECT * FROM attendance WHERE intern_id = ? ORDER BY date DESC, id DESC")
      .all(req.user.id);
    return res.json(rows);
  }
  const ids = internIdsForSupervisor(req.user.id);
  if (ids.length === 0) return res.json([]);
  const placeholders = ids.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT a.*, u.full_name AS intern_name
       FROM attendance a JOIN users u ON u.id = a.intern_id
       WHERE a.intern_id IN (${placeholders})
       ORDER BY a.date DESC, a.id DESC`
    )
    .all(...ids);
  res.json(rows);
});

// Intern updates own record (e.g. add time-out).
router.put("/:id", authRequired, requireRole("intern"), (req, res) => {
  const row = db.prepare("SELECT * FROM attendance WHERE id = ?").get(req.params.id);
  if (!row || row.intern_id !== req.user.id) {
    return res.status(404).json({ error: "Record not found" });
  }
  const date = req.body.date ?? row.date;
  const time_in = req.body.time_in ?? row.time_in;
  const time_out = req.body.time_out ?? row.time_out;
  const remarks = req.body.remarks ?? row.remarks;
  const hours = computeHours(time_in, time_out);
  db.prepare(
    `UPDATE attendance SET date = ?, time_in = ?, time_out = ?, hours = ?, remarks = ?, status = 'pending' WHERE id = ?`
  ).run(date, time_in, time_out, hours, remarks, row.id);
  res.json(db.prepare("SELECT * FROM attendance WHERE id = ?").get(row.id));
});

// Supervisor approves / rejects.
router.patch("/:id/status", authRequired, requireRole("supervisor"), (req, res) => {
  const { status, remarks } = req.body || {};
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const row = db.prepare("SELECT * FROM attendance WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Record not found" });
  const ids = internIdsForSupervisor(req.user.id);
  if (!ids.includes(row.intern_id)) return res.status(403).json({ error: "Forbidden" });
  db.prepare("UPDATE attendance SET status = ?, remarks = COALESCE(?, remarks) WHERE id = ?").run(
    status,
    remarks ?? null,
    row.id
  );
  res.json(db.prepare("SELECT * FROM attendance WHERE id = ?").get(row.id));
});

router.delete("/:id", authRequired, requireRole("intern"), (req, res) => {
  const row = db.prepare("SELECT * FROM attendance WHERE id = ?").get(req.params.id);
  if (!row || row.intern_id !== req.user.id) {
    return res.status(404).json({ error: "Record not found" });
  }
  db.prepare("DELETE FROM attendance WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

export default router;
