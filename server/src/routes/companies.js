import { Router } from "express";
import db from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

// List companies (all authenticated users)
router.get("/", authRequired, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM companies ORDER BY status DESC, name ASC")
    .all();
  res.json(rows);
});

// Create company (admin or coordinator)
router.post("/", authRequired, requireRole("admin", "coordinator"), (req, res) => {
  const {
    name,
    address,
    industry,
    email,
    phone,
    website,
    department,
    description,
    available_slots,
  } = req.body || {};
  if (!name) return res.status(400).json({ error: "Company name is required" });
  const info = db
    .prepare(
      `INSERT INTO companies (name, address, industry, email, phone, website, department, description, available_slots)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      name,
      address || null,
      industry || null,
      email || null,
      phone || null,
      website || null,
      department || null,
      description || null,
      Number(available_slots) || 0
    );
  res.status(201).json(db.prepare("SELECT * FROM companies WHERE id = ?").get(info.lastInsertRowid));
});

// Update company
router.put("/:id", authRequired, requireRole("admin", "coordinator"), (req, res) => {
  const row = db.prepare("SELECT * FROM companies WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Company not found" });
  const f = req.body || {};
  db.prepare(
    `UPDATE companies SET name = ?, address = ?, industry = ?, email = ?, phone = ?, website = ?, department = ?, description = ?, available_slots = ?, status = ? WHERE id = ?`
  ).run(
    f.name ?? row.name,
    f.address ?? row.address,
    f.industry ?? row.industry,
    f.email ?? row.email,
    f.phone ?? row.phone,
    f.website ?? row.website,
    f.department ?? row.department,
    f.description ?? row.description,
    f.available_slots != null ? Number(f.available_slots) : row.available_slots,
    f.status ?? row.status,
    row.id
  );
  res.json(db.prepare("SELECT * FROM companies WHERE id = ?").get(row.id));
});

export default router;
