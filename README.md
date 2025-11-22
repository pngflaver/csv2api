---
## Midnight Bridge v1.0.0

### Release Notes

**v1.0.0 Highlights:**
- Initial public release of CSV API Server & Dashboard
- Secure authentication and password management
- API key management and audit logging
- CSV upload, search, and lookup endpoints
- Modern React dashboard with charts and log table
- Easy setup scripts for development and production
- No external AI or template dependencies

---
## Disclaimer & Indemnity

This build is provided free of charge as a tool to help businesses and departments become API ready.
It is not to be sold, redistributed, or used for commercial resale.

By using this tool, you acknowledge that you understand and accept these terms, and agree to use this tool at your own risk.
The creators accept no liability for any misuse or damages arising from its use.

## Security Measures

This project includes several security features to protect your data and API:

- **Password Hashing:** Admin password is securely hashed using bcrypt and stored in `server/chest.txt`. Password changes are persistent and never stored in plain text.
- **API Key Management:** All sensitive endpoints require an API key or lookup key. Keys can be rotated and are stored on disk.
- **Authentication:** Only the admin user (`bruce`) can log in and change the password. Login and password change endpoints require correct credentials.
- **Rate Limiting:** The `/api/lookup` endpoint is rate-limited per IP (5 requests per minute) to prevent abuse.
- **Audit Logging:** All API requests are logged with timestamp, IP, user agent, and masked token for traceability.
- **Error Handling:** All errors return JSON with appropriate status codes; stack traces are only shown in development or server logs.
- **Token Masking:** API tokens are masked in logs to avoid leaking secrets.

See [`APIFunctions.md`](./APIFunctions.md) for endpoint-specific security requirements.

































# CSV API Server & Dashboard

This project is a full-stack Node.js/Express backend and React frontend for uploading, searching, and managing CSV data with secure authentication, API key management, and a modern dashboard.

## Features

- **Persistent Authentication**: Secure login/logout flow with password changes, stored in `server/chest.txt` and persistent across restarts.
- **CSV Upload & Parsing**: Upload CSV files via the web UI or API; data is stored on disk in NDJSON format.
- **API Key Management**: Generate, rotate, and use API keys for secure access to all endpoints.
- **API Documentation**: See [`APIFunctions.md`](./APIFunctions.md) for full API details, parameters, and examples.
- **Audit Logging**: All API requests are logged to `server/api-requests.ndjson` with timestamp, IP, user agent, and token.
- **Usage Dashboard**: Modern dashboard with charts and a sortable/filterable log table.
- **Persistent State**: All data is stored on disk in the `server/` directory and survives server restarts.
- **Fully Responsive**: Modern UI for desktop and mobile.

## Tech Stack

- **Node.js + Express**: Backend API server
- **React 18 + Vite**: Frontend
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Recharts**: Charts
- **bcrypt**: Secure password hashing

---

## API Request Logging (NDJSON)

All API requests are logged by the backend to `server/api-requests.ndjson` in [NDJSON](http://ndjson.org/) format (one JSON object per line). Each log entry includes:

- `timestamp`: ISO date/time
- `method`: HTTP method
- `path`: Request path
- `status`: HTTP status code
- `durationMs`: Request duration in ms
- `ip`: Source IP address
- `userAgent`: User agent string
- `apiToken`: Masked API token (first 4, last 4 chars)

Example log line:
```json
{"timestamp":"2025-11-21T02:30:00.000Z","method":"POST","path":"/api/lookup","status":200,"durationMs":12,"ip":"127.0.0.1","userAgent":"curl/8.0.1","apiToken":"csv-...abcd"}
```

**Troubleshooting:**
- If you get 401/403 errors, check the log for the masked received/expected API tokens (see server logs for details).
- API keys are normalized (trimmed, no newlines) before comparison.
- For rate limit errors (429), wait a minute before retrying `/api/lookup`.

---

## Password Persistence and Reset

The admin password is stored in `server/chest.txt` and persists across server restarts. If you forget the password, you can manually reset it:

- Stop the server.
- Edit or delete `server/chest.txt`.
- If deleted, the next server start will reset the password to the default: `password`.

You can also change the password via the `/api/change-password` endpoint (requires the current password).

---

## Data Persistence

All data retention is performed by the backend server and filesystem. Uploaded CSVs and searchable NDJSON are stored under `server/` so data is durable across page reloads and server restarts.

---

## API Reference

See [`APIFunctions.md`](./APIFunctions.md) for a full list of endpoints, authentication, and example requests/responses.

---

## Installation & Usage


See [`INSTALLATION.md`](./INSTALLATION.md) for setup, environment variables, and running instructions.

---

## Scripts

The `./scripts` directory contains helper scripts for starting and deploying the app:

- **dev-start.sh**: Installs dependencies and starts both the backend API server and frontend (React + Vite) in development mode. Use this after cloning the repo to quickly spin up the app for local development.

- **prod-setup.sh**: Installs dependencies, builds the frontend for production, serves the static files, and runs the backend API server with PM2 for reliability. Use this to set up and run the app in a production environment.

Both scripts are Bash scripts. On Windows, you can run them using WSL or Git Bash.

---

## License

MIT
    *   **Current**: API Key is a string in `localStorage`.
    *   **With Backend**: The API key would be stored in a `configurations` table in the database or in a secure server-side environment file. The backend would validate incoming API requests against this stored key.

See `INSTALLATION.md` for setup instructions for the current application.

