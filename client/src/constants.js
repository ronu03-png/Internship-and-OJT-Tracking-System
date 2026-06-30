// App-wide branding and academic structure used across the InternTrack client.

export const APP_NAME = "OJT InternTrack";
export const APP_TAGLINE = "Internship Placement & Tracking System";

// Departments grouped by college, each mapped to the courses (programs) under
// it. Students pick their department + course; openings can target a
// department/course so students find the right OJT placements.
export const DEPARTMENTS = [
  {
    name: "College of Computer Studies",
    courses: [
      "BS Information Technology",
      "BS Computer Science",
      "BS Information Systems",
      "BS Computer Engineering",
    ],
  },
  {
    name: "College of Business & Accountancy",
    courses: [
      "BS Business Administration",
      "BS Accountancy",
      "BS Management Accounting",
      "BS Office Administration",
    ],
  },
  {
    name: "College of Engineering",
    courses: [
      "BS Civil Engineering",
      "BS Electrical Engineering",
      "BS Mechanical Engineering",
      "BS Electronics Engineering",
    ],
  },
  {
    name: "College of Hospitality & Tourism",
    courses: ["BS Hospitality Management", "BS Tourism Management"],
  },
  {
    name: "College of Education",
    courses: ["Bachelor of Elementary Education", "Bachelor of Secondary Education"],
  },
  {
    name: "College of Arts & Sciences",
    courses: ["BA Communication", "BS Psychology"],
  },
];

export const DEPARTMENT_NAMES = DEPARTMENTS.map((d) => d.name);

export function coursesForDepartment(deptName) {
  return DEPARTMENTS.find((d) => d.name === deptName)?.courses || [];
}

// Standard OJT requirements students typically need to submit.
export const REQUIREMENT_PRESETS = [
  "Resume / CV",
  "Endorsement Letter",
  "Memorandum of Agreement (MOA)",
  "Parent's Consent / Waiver",
  "Medical Certificate",
  "Insurance",
  "Daily Time Record (DTR)",
  "Company Evaluation Form",
];
