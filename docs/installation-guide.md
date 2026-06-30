# Installation Guide

## InternTrack: OJT Placement & Tracking System

### Requirements
- Node.js 18+
- npm
- Windows, macOS, or Linux

### Steps

1. **Extract the project** to your local machine.

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Start the development server** (runs both client and server):
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Start production server**:
   ```bash
   npm start
   ```

### Default Ports
- Client: http://localhost:5173
- Server: http://localhost:4000

### Default Admin
- Email: `admin@interntrack.local`
- Password: `admin123`

### Notes
- The server uses SQLite (`server/data.sqlite`) by default.
- To use MySQL, replace the database connection in `server/src/db.js` with a MySQL-compatible driver and update the schema.
