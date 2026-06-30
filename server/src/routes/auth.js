import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import { signToken, authRequired } from "../middleware/auth.js";

const router = Router();

const publicUser = (u) => ({
  id: u.id,
  full_name: u.full_name,
  email: u.email,
  role: u.role,
  company_name: u.company_name,
  company_id: u.company_id,
  position: u.position,
  department: u.department,
  course: u.course,
  phone: u.phone,
  address: u.address,
  gender: u.gender,
  birthdate: u.birthdate,
  required_hours: u.required_hours,
  supervisor_id: u.supervisor_id,
  status: u.status,
  student_id: u.student_id,
  employee_id: u.employee_id,
  year_level: u.year_level,
  section: u.section,
  institution: u.institution,
  username: u.username,
  security_question: u.security_question,
});

// List supervisors (for intern registration dropdown)
router.get("/supervisors", (req, res) => {
  const rows = db
    .prepare(
      "SELECT id, full_name, company_name, department FROM users WHERE role = 'supervisor' AND status = 'active' ORDER BY company_name"
    )
    .all();
  res.json(rows);
});

// List all users (admin only)
router.get("/users", authRequired, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const rows = db
    .prepare(
      "SELECT id, full_name, email, role, department, course, company_name, status, created_at FROM users ORDER BY role, full_name"
    )
    .all();
  res.json(rows);
});

router.post("/register", (req, res) => {
  const {
    full_name,
    email,
    password,
    role,
    company_name,
    position,
    department,
    course,
    phone,
    address,
    gender,
    birthdate,
    required_hours,
    supervisor_id,
    company_id,
    student_id,
    employee_id,
    year_level,
    section,
    institution,
    username,
    security_question,
  } = req.body || {};

  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!["admin", "supervisor", "intern"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) return res.status(409).json({ error: "Email already registered" });

  const hash = bcrypt.hashSync(password, 10);
  try {
    const info = db
      .prepare(
        `INSERT INTO users (full_name, email, password_hash, role, company_name, position, department, course, phone, address, gender, birthdate, required_hours, supervisor_id, company_id, student_id, employee_id, year_level, section, institution, username, security_question)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        full_name,
        email,
        hash,
        role,
        company_name || null,
        position || null,
        department || null,
        role === "intern" ? course || null : null,
        phone || null,
        address || null,
        gender || null,
        birthdate || null,
        role === "intern" ? Number(required_hours) || 0 : 0,
        role === "intern" ? supervisor_id || null : null,
        company_id || null,
        role === "intern" ? student_id || null : null,
        role !== "intern" ? employee_id || null : null,
        role === "intern" ? year_level || null : null,
        role === "intern" ? section || null : null,
        role === "admin" ? username || null : null,
        role === "admin" ? security_question || null : null
      );
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (e) {
    res.status(500).json({ error: "Could not create account" });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.get("/me", authRequired, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});

export default router;
export { publicUser };
