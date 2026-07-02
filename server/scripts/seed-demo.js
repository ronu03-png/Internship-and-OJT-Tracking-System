import bcrypt from "bcryptjs";
import db from "../src/db.js";

function seedDemo() {
  const existing = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role IN ('supervisor','intern')").get().n;
  if (existing > 0) {
    console.log("Demo users already exist. Skipping seed.");
    return;
  }

  const hash = bcrypt.hashSync("demo123", 10);

  const supervisor = db
    .prepare(
      "INSERT INTO users (full_name, email, password_hash, role, company_name, department, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run("Demo Supervisor", "supervisor@demo.com", hash, "supervisor", "City Hall HR", "Human Resources", "active");
  const supervisorId = supervisor.lastInsertRowid;

  const company = db
    .prepare(
      "INSERT INTO companies (name, address, industry, email, supervisor_id, department, available_slots, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run("City Hall HR Department", "Main City Hall Building", "Government", "hr@cityhall.gov", supervisorId, "Human Resources", 10, "active");
  const companyId = company.lastInsertRowid;

  const students = [
    { name: "Juan Dela Cruz", email: "juan@demo.com", course: "BS Information Technology" },
    { name: "Maria Santos", email: "maria@demo.com", course: "BS Computer Science" },
    { name: "Pedro Reyes", email: "pedro@demo.com", course: "BS Information Systems" },
  ];

  students.forEach((s, idx) => {
    const student = db
      .prepare(
        "INSERT INTO users (full_name, email, password_hash, role, course, department, required_hours, supervisor_id, company_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(s.name, s.email, hash, "intern", s.course, "College of Engineering", 486, supervisorId, companyId, "active");
    const studentId = student.lastInsertRowid;

    // attendance
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      db.prepare(
        "INSERT INTO attendance (intern_id, date, time_in, time_out, hours, status) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(studentId, dateStr, "08:00", "17:00", 8, "approved");
    }

    // journals
    db.prepare(
      "INSERT INTO daily_journals (intern_id, date, accomplishments, status) VALUES (?, ?, ?, ?)"
    ).run(
      studentId,
      new Date().toISOString().split("T")[0],
      `Today I worked on ${s.course} related tasks and completed assigned documentation.`,
      "approved"
    );

    // weekly report
    db.prepare(
      "INSERT INTO weekly_reports (intern_id, week_number, title, accomplishments, reflection, status) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(
      studentId,
      1,
      "Week 1 Report",
      "Completed orientation and initial system setup.",
      "I learned about the HR department workflow.",
      "approved"
    );

    // requirements
    ["Resume", "Application Letter", "Medical Certificate", "Parent Consent"].forEach((req) => {
      db.prepare(
        "INSERT INTO requirements (intern_id, name, link, status) VALUES (?, ?, ?, ?)"
      ).run(studentId, req, "https://example.com/demo-doc", "approved");
    });

    // placement
    db.prepare(
      "INSERT INTO internship_placements (student_id, company_id, supervisor_id, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(
      studentId,
      companyId,
      supervisorId,
      "approved",
      "2026-06-01",
      "2026-08-31"
    );
  });

  // announcement
  db.prepare(
    "INSERT INTO announcements (title, content, author_id, pinned) VALUES (?, ?, ?, ?)"
  ).run(
    "Welcome OJT Students",
    "Welcome to the City Hall HR Department OJT program. Please complete your requirements and log your attendance daily.",
    supervisorId,
    1
  );

  // calendar event
  db.prepare(
    "INSERT INTO calendar_events (title, type, start_date, end_date, description, created_by) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    "OJT Orientation",
    "meeting",
    "2026-06-01",
    "2026-06-01",
    "Orientation for all OJT students.",
    supervisorId
  );

  console.log("Demo data seeded successfully.");
  console.log("Demo accounts:");
  console.log("  supervisor@demo.com / demo123");
  console.log("  juan@demo.com / demo123");
  console.log("  maria@demo.com / demo123");
  console.log("  pedro@demo.com / demo123");
}

seedDemo();
