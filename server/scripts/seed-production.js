import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "..", "data.sqlite");

// Wipe the existing SQLite file so the new schema is created fresh.
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log("Removed existing database to recreate schema.");
}

const db = (await import("../src/db.js")).default;

const hash = bcrypt.hashSync("demo123", 10);

const COURSES = ["BS Information Technology", "BS Computer Science", "BS Information Systems", "BS Computer Engineering", "BS Electronics Engineering", "BS Accountancy", "BS Business Administration", "BS Hospitality Management", "BS Tourism Management", "BS Psychology"];
const FIRST_NAMES = ["Juan","Maria","Pedro","Jose","Ana","Liza","Mark","Kevin","John","Paul","Michael","Sarah","Jessica","Daniel","David","Emily","Rachel","Chris","Mark","Samantha","Robert","Laura","James","Jennifer","Ryan","Michelle","Eric","Amanda","Jason","Stephanie","Jonathan","Nicole","Brian","Ashley","Catherine","Matthew","Rebecca","Andrew","Kimberly","Joshua","Lauren","Tyler","Christine","Jacob","Melissa","Nicholas","Angela","Brandon","Kelly","Justin","Tiffany","Austin","Brittany","Dylan","Crystal","Caleb","Erica","Zachary","Kathleen","Noah","Megan","Logan","Vanessa","Mason","Alyssa","Elijah","Hannah","Lucas","Rachel","Oliver","Natalie","Ethan","Brooke","Alexander","Julia","William","Olivia","Benjamin","Grace","Henry","Victoria","Sebastian","Chloe","Jack","Zoe","Owen","Lily","Gabriel","Aria","Carter","Penelope","Jayden","Layla","Leo","Nora","Isaac","Hazel","Samuel","Violet","Miles","Stella","Wyatt","Paisley","Caleb","Haley","Adam","Gabrielle"];
const LAST_NAMES = ["Dela Cruz","Santos","Reyes","Garcia","Mendoza","Torres","Bautista","Ramos","Villanueva","Flores","Sanchez","Perez","Lopez","Gonzales","Marquez","Castillo","Rivera","Aquino","Navarro","Dominguez","Fernandez","Cruz","Morales","Andres","Silva","Lim","Tan","Wong","Chua","Sy","Lee","Ong","Yap","Go","Tiu","King","Co","Tan","Uy","Ching","Goh","Ang","See","Chong","Kho","Po","Uy","Dy","Sia","Ko","Gao","Liu","Zhang","Chen","Wu","Huang","Lin","Yang","Wang","Zhao","Zhou","Sun","Ma","Zhu","He","Guo","Xu","Liang","Song","Deng","Cao","Peng","Xie","Han","Tang","Feng","Pan","Dong","Yuan","Jiang","Cai","Jia","Tao","Ding","Shao","Cui","Liao","Zeng","Yu","Xiao","Tian","Jin","Qian","Hou","Long","Shi","Yao","Yan","Gong"];

const COMPANIES = [
  { name: "TechNova Solutions", industry: "Software Development", address: "Makati City", slots: 12, rating: 4.8 },
  { name: "ABC Technologies", industry: "IT Services", address: "Quezon City", slots: 8, rating: 4.5 },
  { name: "NexGen Software", industry: "Software Development", address: "Taguig City", slots: 10, rating: 4.7 },
  { name: "PixelWorks IT", industry: "Digital Media", address: "Pasig City", slots: 6, rating: 4.3 },
  { name: "Innovatech Systems", industry: "Enterprise IT", address: "Mandaluyong City", slots: 9, rating: 4.6 },
  { name: "Globe Telecom", industry: "Telecommunications", address: "Taguig City", slots: 15, rating: 4.7 },
  { name: "PLDT Enterprise", industry: "Telecommunications", address: "Makati City", slots: 14, rating: 4.6 },
  { name: "Accenture", industry: "Consulting & Technology", address: "Manila", slots: 20, rating: 4.8 },
  { name: "IBM Philippines", industry: "Technology", address: "Taguig City", slots: 12, rating: 4.7 },
  { name: "Oracle Philippines", industry: "Cloud Technology", address: "Makati City", slots: 10, rating: 4.6 },
  { name: "Microsoft Philippines", industry: "Technology", address: "Taguig City", slots: 11, rating: 4.9 },
  { name: "SAP Philippines", industry: "Enterprise Software", address: "Makati City", slots: 8, rating: 4.5 },
  { name: "Cisco Philippines", industry: "Networking", address: "Makati City", slots: 7, rating: 4.6 },
  { name: "Huawei Philippines", industry: "Telecommunications", address: "Taguig City", slots: 9, rating: 4.4 },
  { name: "Samsung SDS", industry: "IT Services", address: "Makati City", slots: 8, rating: 4.7 },
  { name: "Fujitsu Philippines", industry: "IT Services", address: "Taguig City", slots: 6, rating: 4.5 },
  { name: "Infosys", industry: "Consulting & IT", address: "Manila", slots: 10, rating: 4.6 },
  { name: "TCS Philippines", industry: "IT Services", address: "Taguig City", slots: 12, rating: 4.5 },
  { name: "Wipro Philippines", industry: "IT Consulting", address: "Manila", slots: 8, rating: 4.4 },
  { name: "Capgemini", industry: "Consulting", address: "Makati City", slots: 9, rating: 4.6 },
  { name: "Deloitte Philippines", industry: "Consulting", address: "Taguig City", slots: 10, rating: 4.8 },
  { name: "KPMG Philippines", industry: "Consulting", address: "Makati City", slots: 8, rating: 4.7 },
  { name: "PWC Philippines", industry: "Consulting", address: "Taguig City", slots: 9, rating: 4.8 },
  { name: "EY Philippines", industry: "Consulting", address: "Makati City", slots: 8, rating: 4.7 },
  { name: "Sitel Philippines", industry: "BPO", address: "Pasay City", slots: 20, rating: 4.2 },
  { name: "Concentrix", industry: "BPO", address: "Makati City", slots: 18, rating: 4.3 },
  { name: "Teleperformance", industry: "BPO", address: "Pasay City", slots: 22, rating: 4.2 },
  { name: "Alorica", industry: "BPO", address: "Quezon City", slots: 16, rating: 4.1 },
  { name: "TaskUs", industry: "BPO", address: "Taguig City", slots: 15, rating: 4.3 },
  { name: "Cloudstaff", industry: "BPO", address: "Angeles City", slots: 12, rating: 4.2 },
  { name: "Lazada Philippines", industry: "E-commerce", address: "Makati City", slots: 10, rating: 4.5 },
  { name: "Shopee Philippines", industry: "E-commerce", address: "Taguig City", slots: 11, rating: 4.5 },
  { name: "Zalora Philippines", industry: "E-commerce", address: "Manila", slots: 6, rating: 4.3 },
  { name: "Food Panda", industry: "Food Tech", address: "Makati City", slots: 8, rating: 4.2 },
  { name: "Grab Philippines", industry: "Ride Hailing", address: "Taguig City", slots: 10, rating: 4.4 },
  { name: "Angkas", industry: "Ride Hailing", address: "Mandaluyong City", slots: 5, rating: 4.1 },
  { name: "UnionBank", industry: "Banking", address: "Pasig City", slots: 9, rating: 4.6 },
  { name: "BDO Unibank", industry: "Banking", address: "Makati City", slots: 12, rating: 4.7 },
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pad2(n) { return String(n).padStart(2, "0"); }

function seed() {
  console.log("Seeding admin...");
  const admin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  const adminId = admin ? admin.id : 1;

  console.log("Seeding program supervisor...");
  const programSupervisor = db.prepare("INSERT INTO users (full_name, email, password_hash, role, department, phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))")
    .run("Prof. Elena Rodriguez", "program.supervisor@demo.com", hash, "supervisor", "College of Computer Studies", "+63 912 345 6701", "active");
  const programSupervisorId = programSupervisor.lastInsertRowid;

  console.log("Seeding companies and supervisors...");
  const companyIds = [];
  const supervisorIds = [];
  COMPANIES.forEach((c) => {
    const company = db.prepare(
      "INSERT INTO companies (name, address, industry, email, phone, website, supervisor_id, department, available_slots, status, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))"
    ).run(c.name, c.address, c.industry, `${c.name.toLowerCase().replace(/\s+/g, ".")}@demo.com`, `+63 9${randInt(10,99)} ${randInt(100,999)} ${randInt(1000,9999)}`, `https://${c.name.toLowerCase().replace(/\s+/g, "")}.demo`, null, "Human Resources", c.slots, "active", `${c.name} is a leading ${c.industry} company in the Philippines.`);
    const companyId = company.lastInsertRowid;
    companyIds.push(companyId);

    const supervisor = db.prepare(
      "INSERT INTO users (full_name, email, password_hash, role, company_name, department, company_id, phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))"
    ).run(`${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`, `supervisor${companyId}@demo.com`, hash, "supervisor", c.name, "Human Resources", companyId, `+63 9${randInt(10,99)} ${randInt(100,999)} ${randInt(1000,9999)}`, "active");
    const supervisorId = supervisor.lastInsertRowid;
    supervisorIds.push(supervisorId);

    db.prepare("UPDATE companies SET supervisor_id = ? WHERE id = ?").run(supervisorId, companyId);
  });

  console.log("Seeding 248 students...");
  const studentIds = [];
  const used = new Set();
  for (let i = 1; i <= 248; i++) {
    const fn = rand(FIRST_NAMES);
    const ln = rand(LAST_NAMES);
    const name = `${fn} ${ln}`;
    if (used.has(name)) { i--; continue; }
    used.add(name);
    const course = rand(COURSES);
    const studentIdStr = `2024-${pad2(i)}`;
    const status = i <= 46 ? "completed" : "active";
    const requiredHours = 486;
    const completedHours = status === "completed" ? requiredHours : randInt(100, 470);
    const companyIndex = (i - 1) % companyIds.length;
    const companyId = companyIds[companyIndex];
    const supervisorId = supervisorIds[companyIndex];

    const student = db.prepare(
      "INSERT INTO users (full_name, email, password_hash, role, student_id, course, department, required_hours, approved_hours, supervisor_id, company_id, status, gender, address, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))"
    ).run(name, `student${pad2(i)}@demo.com`, hash, "intern", studentIdStr, course, "College of Computer Studies", requiredHours, completedHours, supervisorId, companyId, status, randInt(0,1) ? "male" : "female", `${randInt(1,999)} ${rand(LAST_NAMES)} St., Metro Manila`, `+63 9${randInt(10,99)} ${randInt(100,999)} ${randInt(1000,9999)}`);
    const studentId = student.lastInsertRowid;
    studentIds.push(studentId);

    // placement
    db.prepare(
      "INSERT INTO internship_placements (student_id, company_id, supervisor_id, coordinator_id, status, start_date, end_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))"
    ).run(studentId, companyId, supervisorId, programSupervisorId, status === "completed" ? "completed" : "approved", "2026-06-01", status === "completed" ? "2026-07-15" : "2026-08-31");

    // attendance (last 30 days)
    const baseDate = new Date("2026-06-01");
    for (let d = 0; d < 30; d++) {
      if (Math.random() < 0.85) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + d);
        const isLate = Math.random() < 0.12;
        const timeIn = isLate ? `08:${randInt(10, 45)}` : `07:${randInt(50, 59)}`;
        const timeOut = `17:${randInt(0, 30)}`;
        const hours = 8;
        const attStatus = isLate ? "late" : "present";
        db.prepare("INSERT INTO attendance (intern_id, date, time_in, time_out, hours, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))")
          .run(studentId, date.toISOString().split("T")[0], timeIn, timeOut, hours, attStatus);
      }
    }

    // journals
    for (let j = 1; j <= 5; j++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + j * 5);
      db.prepare("INSERT INTO daily_journals (intern_id, date, accomplishments, skills_learned, status, supervisor_feedback, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))")
        .run(studentId, date.toISOString().split("T")[0], `Assisted in ${rand(["database design","API development","UI testing","client meetings","documentation","code review","QA testing","report generation"])}.`, `${rand(["React","Laravel","MySQL","Bootstrap","Git","Python","Java","Communication","Teamwork"])}`, rand(["approved","pending","approved","approved"]), "Excellent progress and dedication.");
    }

    // weekly reports
    for (let w = 1; w <= 4; w++) {
      db.prepare("INSERT INTO weekly_reports (intern_id, week_number, title, accomplishments, reflection, problems, solutions, status, supervisor_comments, coordinator_notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))")
        .run(studentId, w, `Week ${w} Report`, `Completed ${rand(["orientation","module development","testing phase","client presentation","documentation","deployment"])}.`, `I learned ${rand(["team collaboration","time management","technical debugging","professional communication"])}.`, `Faced ${rand(["tight deadlines","technical errors","miscommunication","unfamiliar tools"])}.`, `Resolved by ${rand(["asking supervisor","researching online","team discussion","trial and error"])}.`, w <= 3 ? "approved" : "pending", "Great work this week.", "Keep up the good performance.");
    }

    // monthly reports
    db.prepare("INSERT INTO monthly_reports (intern_id, month, summary, hours_rendered, performance, learning_outcomes, supervisor_remarks, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))")
      .run(studentId, "June 2026", `Monthly summary for ${name}. Completed assigned tasks and attended all required meetings.`, completedHours, "Satisfactory", "Technical skills, communication, professionalism", "Good performance and consistent attendance.", status === "completed" ? "approved" : "pending");

    // final report (only completed students)
    if (status === "completed") {
      db.prepare("INSERT INTO final_reports (intern_id, narrative_report, terminal_report, presentation_url, final_documentation_url, completion_form_url, certificate_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))")
        .run(studentId, "I completed my OJT successfully and gained valuable industry experience.", "All required outputs were submitted and approved.", "https://demo.com/presentation", "https://demo.com/documentation", "https://demo.com/completion", "https://demo.com/certificate", "approved");
    }

    // requirements
    const reqNames = ["Resume", "Application Letter", "Medical Certificate", "Barangay Clearance", "Police Clearance", "NBI Clearance", "MOA", "Training Plan", "Completion Certificate", "Parent Consent"];
    reqNames.forEach((reqName) => {
      const approved = Math.random() < 0.85;
      db.prepare("INSERT INTO requirements (intern_id, name, link, note, status, feedback, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))")
        .run(studentId, reqName, `https://files.demo.com/${reqName.toLowerCase().replace(/\s+/g, "-")}-${studentIdStr}.pdf`, `Submitted by ${name}`, approved ? "approved" : "pending", approved ? "Verified" : "Please upload a clearer copy");
    });

    // evaluations (only completed or active with supervisor)
    if (status === "completed" || Math.random() < 0.3) {
      const metrics = ["attendance","punctuality","communication","technical_skills","professionalism","initiative","productivity","adaptability","teamwork","leadership","problem_solving"];
      const values = {};
      let total = 0;
      metrics.forEach((m) => { const v = randInt(88, 99); values[m] = v; total += v; });
      const overall = Math.round(total / metrics.length);
      db.prepare(
        `INSERT INTO evaluations (intern_id, supervisor_id, ${metrics.join(",")}, overall_rating, comments, created_at) VALUES (?, ?, ${metrics.map(() => "?").join(",")}, ?, ?, datetime('now'))`
      ).run(studentId, supervisorId, ...metrics.map((m) => values[m]), overall, overall >= 95 ? "Excellent intern with strong skills and work ethic." : "Good intern, shows improvement over time.");
    }
  }

  console.log("Seeding announcements...");
  const announcements = [
    { title: "Welcome OJT Students", content: "Welcome to the OJT program! Please complete your requirements and log your attendance daily.", pinned: 1 },
    { title: "Monthly Report Deadline", content: "All monthly reports for June are due on July 5, 2026.", pinned: 0 },
    { title: "Evaluation Schedule", content: "Supervisors will begin final evaluations on July 15, 2026.", pinned: 0 },
    { title: "Completion Ceremony", content: "The OJT completion ceremony will be held on August 31, 2026.", pinned: 0 },
  ];
  announcements.forEach((a) => {
    db.prepare("INSERT INTO announcements (title, content, author_id, pinned, created_at) VALUES (?, ?, ?, ?, datetime('now'))").run(a.title, a.content, programSupervisorId, a.pinned);
  });

  console.log("Seeding calendar events...");
  const events = [
    { title: "OJT Orientation", type: "meeting", start: "2026-06-01", end: "2026-06-01" },
    { title: "Internship Start", type: "event", start: "2026-06-02", end: "2026-06-02" },
    { title: "Weekly Report Deadline", type: "deadline", start: "2026-06-07", end: "2026-06-07" },
    { title: "Evaluation Day", type: "meeting", start: "2026-07-15", end: "2026-07-15" },
    { title: "Final Defense", type: "deadline", start: "2026-08-20", end: "2026-08-20" },
    { title: "Completion Ceremony", type: "event", start: "2026-08-31", end: "2026-08-31" },
  ];
  events.forEach((e) => {
    db.prepare("INSERT INTO calendar_events (title, type, start_date, end_date, description, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))")
      .run(e.title, e.type, e.start, e.end, `${e.title} for OJT students.`, programSupervisorId);
  });

  console.log("Seeding messages...");
  const sampleMessages = [
    { from: programSupervisorId, to: supervisorIds[0], body: "Good morning! Please review the pending evaluations this week." },
    { from: supervisorIds[0], to: programSupervisorId, body: "Noted. I will complete them by Friday." },
    { from: programSupervisorId, to: studentIds[0], body: "Please submit your missing medical certificate." },
    { from: studentIds[0], to: programSupervisorId, body: "I will upload it today, ma'am." },
    { from: supervisorIds[1], to: studentIds[1], body: "Great job on the presentation today!" },
  ];
  sampleMessages.forEach((m) => {
    db.prepare("INSERT INTO messages (sender_id, recipient_id, body, created_at) VALUES (?, ?, ?, datetime('now'))").run(m.from, m.to, m.body);
  });

  console.log("Seeding notifications...");
  const notifTypes = ["requirement_approved","attendance_verified","report_approved","announcement","evaluation_available","reminder"];
  const notifTitles = ["Resume Approved","Attendance Verified","Weekly Report Approved","New Announcement","Evaluation Available","Reminder: Submit Monthly Report"];
  studentIds.slice(0, 50).forEach((sid, idx) => {
    const type = notifTypes[idx % notifTypes.length];
    const title = notifTitles[idx % notifTitles.length];
    db.prepare("INSERT INTO notifications (user_id, type, title, message, read_at, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))")
      .run(sid, type, title, `${title} - check your dashboard for details.`, idx % 2 === 0 ? null : new Date().toISOString());
  });

  console.log("Seeding audit logs...");
  const actions = ["LOGIN","CREATE_USER","UPDATE_PLACEMENT","APPROVE_ATTENDANCE","CREATE_ANNOUNCEMENT","SUBMIT_REPORT"];
  const entities = ["user","placement","attendance","announcement","report"];
  for (let i = 0; i < 50; i++) {
    db.prepare("INSERT INTO audit_logs (user_id, action, entity, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, datetime('now','-'||?||' minutes'))")
      .run(rand([adminId, programSupervisorId, ...supervisorIds]), rand(actions), rand(entities), randInt(1, 100), "System activity recorded", i * 30);
  }

  console.log("Seeding settings...");
  const settings = [
    { key: "school_name", value: "University of Example Philippines" },
    { key: "academic_year", value: "2025-2026" },
    { key: "semester", value: "2nd Semester" },
    { key: "required_hours", value: "486" },
    { key: "theme", value: "light" },
  ];
  const insertSetting = db.prepare("INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at");
  settings.forEach((s) => insertSetting.run(s.key, s.value));

  console.log("Production demo seed complete.");
  console.log("Accounts:");
  console.log("  admin@interntrack.local / admin123");
  console.log("  program.supervisor@demo.com / demo123");
  console.log("  supervisor1@demo.com / demo123");
  console.log("  student01@demo.com / demo123");
}

seed();
