import { Router } from "express";
import db from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

function internIdsForSupervisor(supervisorId) {
  return db.prepare("SELECT id FROM users WHERE supervisor_id = ?").all(supervisorId).map((r) => r.id);
}

router.post("/", authRequired, requireRole("intern"), (req, res) => {
  const { narrative_report, terminal_report, presentation_url, final_documentation_url, completion_form_url, certificate_url } = req.body || {};
  const existing = db.prepare("SELECT id FROM final_reports WHERE intern_id = ?").get(req.user.id);
  if (existing) return res.status(409).json({ error: "Final report already exists; update it instead" });
  const info = db
    .prepare(
      `INSERT INTO final_reports (intern_id, narrative_report, terminal_report, presentation_url, final_documentation_url, completion_form_url, certificate_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.user.id,
      narrative_report || null,
      terminal_report || null,
      presentation_url || null,
      final_documentation_url || null,
      completion_form_url || null,
      certificate_url || null
    );
  res.status(201).json(db.prepare("SELECT * FROM final_reports WHERE id = ?").get(info.lastInsertRowid));
});

router.put("/", authRequired, requireRole("intern"), (req, res) => {
  const row = db.prepare("SELECT * FROM final_reports WHERE intern_id = ?").get(req.user.id);
  if (!row) return res.status(404).json({ error: "Final report not found" });
  const f = req.body || {};
  db.prepare(
    `UPDATE final_reports SET narrative_report = ?, terminal_report = ?, presentation_url = ?, final_documentation_url = ?, completion_form_url = ?, certificate_url = ? WHERE id = ?`
  ).run(
    f.narrative_report ?? row.narrative_report,
    f.terminal_report ?? row.terminal_report,
    f.presentation_url ?? row.presentation_url,
    f.final_documentation_url ?? row.final_documentation_url,
    f.completion_form_url ?? row.completion_form_url,
    f.certificate_url ?? row.certificate_url,
    row.id
  );
  res.json(db.prepare("SELECT * FROM final_reports WHERE id = ?").get(row.id));
});

router.get("/", authRequired, (req, res) => {
  if (req.user.role === "intern") {
    const row = db.prepare("SELECT * FROM final_reports WHERE intern_id = ?").get(req.user.id);
    return res.json(row ? [row] : []);
  }
  const ids = internIdsForSupervisor(req.user.id);
  if (ids.length === 0) return res.json([]);
  const placeholders = ids.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT r.*, u.full_name AS intern_name FROM final_reports r
       JOIN users u ON u.id = r.intern_id
       WHERE r.intern_id IN (${placeholders})`
    )
    .all(...ids);
  res.json(rows);
});

router.patch("/:id/review", authRequired, requireRole("supervisor", "coordinator"), (req, res) => {
  const { status } = req.body || {};
  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const row = db.prepare("SELECT * FROM final_reports WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Report not found" });
  const ids = internIdsForSupervisor(req.user.id);
  if (req.user.role === "supervisor" && !ids.includes(row.intern_id)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  db.prepare("UPDATE final_reports SET status = ? WHERE id = ?").run(status, row.id);
  res.json(db.prepare("SELECT * FROM final_reports WHERE id = ?").get(row.id));
});

export default router;
