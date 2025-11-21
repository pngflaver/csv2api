
## API Response Changes

The `/api/lookup` endpoint now returns only the HTTP status code and the date/time when the data was last uploaded. The date is stored in `server/last-upload.txt` and is updated every time `/api/upload` succeeds.

**Example response:**
```
{
	"status": 200,
	"lastUpload": "2025-11-21T02:30:00.000Z"
}
```

See `apifunctions.md` for full API documentation and examples.























# Installation Guide

This project is a full-stack Node.js/Express backend and React frontend. You will need Node.js and npm installed.

## 1. Clone the Project

Clone or download all project files into a single directory.

## 2. Install Dependencies

Open your terminal, navigate to the project root, and run:

```bash
npm install
npm install bcrypt
```

This will install all backend and frontend dependencies, including bcrypt for secure password hashing.

## 3. Run the Backend API Server

Start the backend server (Node.js/Express):

```bash
npm run start:api
```

The API server will start on `http://localhost:3001` by default.

## 4. Run the Frontend (React)

In a separate terminal, start the React frontend:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or similar).

## 5. Default Credentials

- **Username:** `bruce`
- **Password:** `password` (change via `/api/change-password` or by editing `server/chest.txt`)

## 6. API Documentation

See [`APIFunctions.md`](./APIFunctions.md) for all endpoints, authentication, and usage examples.

---

## Building for Production

To build the frontend for production:

```bash
npm run build
```

This will output the production build to the `dist` directory. Serve it with any static file server.

---

## Troubleshooting

- If you forget the password, delete `server/chest.txt` and restart the server to reset to the default password.
- All data is stored in the `server/` directory and persists across restarts.
