const REQUIRED_HOURS = 486;

function stringHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function withSampleProgress(student, fallbackSeed = "") {
  const seed = String(student.id || student.student_id || student.full_name || student.email || fallbackSeed);
  const hash = stringHash(seed);
  const pct = 5 + (hash % 91); // 5% - 95%
  const required = student.required_hours || REQUIRED_HOURS;
  const approved = Math.min(Math.round((required * pct) / 100), required);
  return {
    ...student,
    required_hours: required,
    approved_hours: approved,
    remaining_hours: Math.max(required - approved, 0),
    progress: pct,
  };
}

export function sampleProgressDataset(students, count = 10) {
  return students.slice(0, count).map((s, i) => withSampleProgress(s, i));
}
