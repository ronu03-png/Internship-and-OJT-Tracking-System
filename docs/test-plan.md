# Test Plan

## InternTrack: OJT Placement & Tracking System

### 1. Test Objectives
- Verify all four roles can log in and access their respective features.
- Verify CRUD operations for companies, placements, reports, and requirements.
- Verify attendance hour computations and evaluation scoring.
- Ensure the UI is responsive and error messages are clear.

### 2. Test Scope
- Authentication (login, register, logout)
- Role-based navigation
- Company and placement management
- Attendance logging and approval
- Journal, weekly, monthly, and final report submission
- Requirements upload and review
- Performance evaluation
- Messaging and announcements
- Calendar, analytics, settings, audit logs

### 3. Test Cases

| ID | Description | Steps | Expected Result |
|----|-------------|-------|-----------------|
| TC-01 | Admin login | Log in with default admin credentials | Admin dashboard loads |
| TC-02 | Create user | Admin adds a coordinator | User appears in user list |
| TC-03 | Student registers | Register as student with course | Student dashboard loads |
| TC-04 | Supervisor reviews attendance | Student logs time; supervisor approves | Attendance status changes to approved |
| TC-05 | Coordinator assigns placement | Select student, company, supervisor | Placement record created |
| TC-06 | Student submits journal | Student writes daily journal | Journal appears in supervisor review |
| TC-07 | Supervisor evaluates intern | Supervisor fills evaluation form | Overall rating computed and saved |
| TC-08 | Announcements | Coordinator posts announcement | All users see announcement |

### 4. Testing Tools
- Manual browser testing
- Build verification (`npm run build`)
- Server start verification (`npm --prefix server start`)
