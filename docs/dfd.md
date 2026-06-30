# Data Flow Diagram (DFD)

## InternTrack OJT System

### Level 0 (Context Diagram)

```
+----------------+        +-----------------------------+        +-------------------+
|   Student      | <----> |                             | <----> |   Company / City  |
|                |        |   InternTrack Web System    |        |   Office          |
+----------------+        |                             |        +-------------------+
                          |  - Auth                     |
+----------------+        |  - Dashboards               |        +-------------------+
|   Coordinator  | <----> |  - Placements               | <----> |   Database        |
|                |        |  - Attendance & Reports       |        |   (SQLite/MySQL)  |
+----------------+        |  - Evaluations              |        +-------------------+
                          |  - Announcements & Calendar   |
+----------------+        |  - Messaging & Analytics    |        +-------------------+
|   Administrator| <----> |                             | <----> |   Audit Logs      |
+----------------+        +-----------------------------+        +-------------------+
```

### Level 1 (Main Processes)

1. **P1: Authentication**
   - Input: login credentials, registration data
   - Output: JWT token, user profile

2. **P2: User Management**
   - Input: user details, role assignments
   - Output: user records, status updates

3. **P3: Company & Placement Management**
   - Input: company details, student-company assignment
   - Output: placement records, assignment letters

4. **P4: Attendance Tracking**
   - Input: time in/out, supervisor approval
   - Output: attendance logs, computed hours

5. **P5: Reports & Requirements**
   - Input: student submissions, supervisor feedback
   - Output: approved/rejected reports and documents

6. **P6: Evaluation**
   - Input: supervisor ratings
   - Output: evaluation records, overall rating

7. **P7: Communication**
   - Input: messages, announcements, calendar events
   - Output: notifications, stored messages/events

8. **P8: Analytics & Audit**
   - Input: system activity
   - Output: statistics, audit logs, reports
