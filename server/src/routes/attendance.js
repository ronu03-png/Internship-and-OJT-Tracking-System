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

// Server-side clock helpers (anti-tampering: never trust client time).
// Formatted in Asia/Manila so the recorded date/time matches PH working hours.
function nowInManila() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );
}
function manilaDate() {
  return nowInManila().toISOString().slice(0, 10); // YYYY-MM-DD
}
function manilaTime() {
  const d = nowInManila();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Requirement-lock: attendance stays locked until the student has NO
// outstanding (non-approved) requirements. Students with zero requirements on
// file are allowed through so the gate never hard-blocks a fresh account.
function attendanceLockReason(internId) {
  const outstanding = db
    .prepare(
      "SELECT COUNT(*) AS n FROM requirements WHERE intern_id = ? AND status <> 'approved'"
    )
    .get(internId).n;
  if (outstanding > 0) {
    return `Attendance is locked: you have ${outstanding} pre-deployment requirement(s) still awaiting approval.`;
  }
  return null;
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

// DTR eligibility + today's open session state (intern only).
router.get("/eligibility", authRequired, requireRole("intern"), (req, res) => {
  const reason = attendanceLockReason(req.user.id);
  const today = manilaDate();
  const todayRow = db
    .prepare("SELECT * FROM attendance WHERE intern_id = ? AND date = ? ORDER BY id DESC")
    .get(req.user.id, today);
  const openSession = todayRow && todayRow.time_in && !todayRow.time_out ? todayRow : null;
  res.json({
    locked: !!reason,
    reason: reason || null,
    server_date: today,
    server_time: manilaTime(),
    today: todayRow || null,
    open_session: openSession,
    can_clock_in: !reason && !todayRow,
    can_clock_out: !!openSession,
  });
});

// Clock IN — server sets the date/time (anti-tampering); GPS from device.
router.post("/clock-in", authRequired, requireRole("intern"), (req, res) => {
  const reason = attendanceLockReason(req.user.id);
  if (reason) return res.status(403).json({ error: reason });

  const { lat, lng } = req.body || {};
  const date = manilaDate();

  // Guardrail: only one log per day.
  const existing = db
    .prepare("SELECT id, time_in, time_out FROM attendance WHERE intern_id = ? AND date = ?")
    .get(req.user.id, date);
  if (existing) {
    return res.status(409).json({ error: "You have already clocked in today." });
  }

  const info = db
    .prepare(
      `INSERT INTO attendance (intern_id, date, time_in, time_in_lat, time_in_lng, hours, status, source)
       VALUES (?, ?, ?, ?, ?, 0, 'pending', 'device')`
    )
    .run(req.user.id, date, manilaTime(), lat ?? null, lng ?? null);
  res.status(201).json(db.prepare("SELECT * FROM attendance WHERE id = ?").get(info.lastInsertRowid));
});

// Clock OUT — server sets the time; computes rendered hours with lunch rule.
router.post("/clock-out", authRequired, requireRole("intern"), (req, res) => {
  const { lat, lng } = req.body || {};
  const date = manilaDate();
  const row = db
    .prepare("SELECT * FROM attendance WHERE intern_id = ? AND date = ? ORDER BY id DESC")
    .get(req.user.id, date);
  if (!row || !row.time_in) {
    return res.status(409).json({ error: "You have not clocked in yet today." });
  }
  if (row.time_out) {
    return res.status(409).json({ error: "You have already clocked out today." });
  }
  const timeOut = manilaTime();
  const hours = computeHours(row.time_in, timeOut);
  db.prepare(
    `UPDATE attendance SET time_out = ?, time_out_lat = ?, time_out_lng = ?, hours = ?, status = 'pending' WHERE id = ?`
  ).run(timeOut, lat ?? null, lng ?? null, hours, row.id);
  res.json(db.prepare("SELECT * FROM attendance WHERE id = ?").get(row.id));
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
