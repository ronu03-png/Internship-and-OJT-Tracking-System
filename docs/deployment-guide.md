# Deployment Guide

## InternTrack: OJT Placement & Tracking System

### 1. Production Build

```bash
npm run build
```

This creates the client build in `client/dist/`.

### 2. Environment Variables

Create a `.env` file in the server folder:

```env
PORT=4000
JWT_SECRET=your-strong-secret-key
```

### 3. Server Deployment

- The server can run on any Node.js hosting platform.
- Make sure `server/data.sqlite` is writable.
- For production, consider switching to MySQL.

### 4. Client Deployment

- Serve the contents of `client/dist/` using a static file server.
- Ensure the client can reach the API server at the configured URL.
- Update `client/src/api.js` if the server URL changes.

### 5. Backup

- Regularly back up `server/data.sqlite`.
- Store uploaded files and backups in a secure location.

### 6. Maintenance

- Monitor server logs.
- Rotate audit logs when needed.
- Update dependencies periodically.
