import db from "../src/db.js";

const rows = db.prepare("SELECT id, full_name, email, role FROM users WHERE email LIKE '%@demo.com'").all();
console.log("Demo users:", rows);
