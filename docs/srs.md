# Software Requirements Specification

## InternTrack: OJT Placement & Tracking System

### 1. Introduction
This document specifies the functional and non-functional requirements for InternTrack.

### 2. Functional Requirements

#### 2.1 Authentication
- FR-1: Users shall register with full name, email, password, role, department, and course/company.
- FR-2: Users shall log in with email and password.
- FR-3: The system shall support role-based access control (admin, coordinator, supervisor, intern).
- FR-4: The system shall remember me via a secure token in local storage.
- FR-5: Users shall be able to log out.

#### 2.2 Dashboard
- FR-6: Each role shall have a dedicated dashboard with relevant widgets and statistics.
- FR-7: Dashboards shall display counts and progress indicators.

#### 2.3 User Management
- FR-8: Administrators can create, view, and deactivate users.
- FR-9: Coordinators can view students and companies.
- FR-10: Supervisors can view their assigned interns.

#### 2.4 Company and Placement
- FR-11: Coordinators can create and manage companies/offices.
- FR-12: Coordinators can assign students to companies and supervisors.
- FR-13: Students can browse OJT openings and apply.
- FR-14: Supervisors can accept/decline applications.

#### 2.5 Attendance
- FR-15: Students can log time in/out.
- FR-16: The system shall compute approved hours.
- FR-17: Supervisors can approve/reject attendance.

#### 2.6 Reports and Journals
- FR-18: Students can submit daily journals.
- FR-19: Students can submit weekly, monthly, and final reports.
- FR-20: Supervisors can review and approve/reject reports and journals.

#### 2.7 Requirements
- FR-21: Students can upload required documents.
- FR-22: Supervisors can approve, reject, or request revisions.

#### 2.8 Evaluations
- FR-23: Supervisors can evaluate interns across multiple criteria.
- FR-24: The system shall compute an overall rating.

#### 2.9 Communication
- FR-25: Students and supervisors can send private messages.
- FR-26: Coordinators and administrators can post announcements.
- FR-27: Users can view calendar events.

#### 2.10 Analytics and Audit
- FR-28: Administrators can view audit logs.
- FR-29: Administrators can configure system settings.
- FR-30: Users can view analytics and reports.

### 3. Non-Functional Requirements
- NFR-1: The system shall be responsive on desktop, tablet, and mobile.
- NFR-2: Passwords shall be hashed using bcrypt.
- NFR-3: API endpoints shall be protected by JWT.
- NFR-4: The database shall enforce foreign key relationships.
- NFR-5: The UI shall follow the blue/emerald/white theme.
- NFR-6: The system shall support SQLite for easy deployment and MySQL for production.
