# Entity Relationship Diagram (ERD)

## InternTrack Database Schema

### Core Tables

```
users (id, full_name, email, password_hash, role, company_name, position, department, course, phone, address, gender, birthdate, required_hours, supervisor_id, company_id, status, created_at)

companies (id, name, logo_url, address, industry, email, phone, website, supervisor_id, department, description, available_slots, status, moa_file_url, created_at)

internship_placements (id, student_id, company_id, supervisor_id, coordinator_id, status, start_date, end_date, assignment_letter_url, created_at)

attendance (id, intern_id, date, time_in, time_out, hours, status, remarks, created_at)

daily_journals (id, intern_id, date, accomplishments, photo_urls, file_urls, status, supervisor_feedback, coordinator_notes, created_at)

weekly_reports (id, intern_id, week_number, title, accomplishments, reflection, problems, solutions, file_urls, status, supervisor_comments, coordinator_notes, created_at)

monthly_reports (id, intern_id, month, summary, hours_rendered, performance, learning_outcomes, supervisor_remarks, status, created_at)

final_reports (id, intern_id, narrative_report, terminal_report, presentation_url, final_documentation_url, completion_form_url, certificate_url, status, created_at)

requirements (id, intern_id, name, link, note, status, feedback, created_at)

evaluations (id, intern_id, supervisor_id, attendance, punctuality, communication, technical_skills, professionalism, initiative, productivity, adaptability, teamwork, leadership, problem_solving, overall_rating, comments, created_at)

announcements (id, title, content, author_id, pinned, attachment_url, created_at)

notifications (id, user_id, type, title, message, read_at, related_id, created_at)

calendar_events (id, title, type, start_date, end_date, description, created_by, created_at)

audit_logs (id, user_id, action, entity, entity_id, details, ip_address, created_at)

settings (id, key, value, updated_at)

academic_years (id, year, semester, start_date, end_date, is_active, created_at)

files (id, filename, original_name, mime_type, size, path, uploaded_by, created_at)

messages (id, sender_id, recipient_id, body, read_at, created_at)

openings (id, supervisor_id, title, company_name, department, course, location, slots, description, contact_email, contact_phone, status, created_at)

applications (id, opening_id, student_id, message, status, created_at)
```

### Relationships

- `users.supervisor_id` → `users.id`
- `users.company_id` → `companies.id`
- `internship_placements.student_id` → `users.id`
- `internship_placements.company_id` → `companies.id`
- `internship_placements.supervisor_id` → `users.id`
- `attendance.intern_id` → `users.id`
- `daily_journals.intern_id` → `users.id`
- `weekly_reports.intern_id` → `users.id`
- `monthly_reports.intern_id` → `users.id`
- `final_reports.intern_id` → `users.id`
- `requirements.intern_id` → `users.id`
- `evaluations.intern_id` → `users.id`
- `evaluations.supervisor_id` → `users.id`
- `announcements.author_id` → `users.id`
- `notifications.user_id` → `users.id`
- `calendar_events.created_by` → `users.id`
- `audit_logs.user_id` → `users.id`
- `files.uploaded_by` → `users.id`
- `messages.sender_id` → `users.id`
- `messages.recipient_id` → `users.id`
- `openings.supervisor_id` → `users.id`
- `applications.opening_id` → `openings.id`
- `applications.student_id` → `users.id`
