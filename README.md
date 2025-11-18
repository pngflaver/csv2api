# CSV API Server & Dashboard

This is a comprehensive, client-side React application that simulates a backend API server for CSV data. It's built with TypeScript and styled with Tailwind CSS, providing a complete user experience from login to data visualization without requiring a real backend.

## Features

- **Mock Authentication**: Secure login/logout flow with password changes (simulated).
- **CSV Upload & Parsing**: Users can upload their own CSV files, which are parsed and stored locally in the browser.
- **API Simulation**:
  - **API Key Generation**: Generate a unique, mock API key to "secure" the API endpoint.
  - **API Documentation**: A dedicated page explaining how to use the simulated API.
  - **API Testing**: An interface to make test "calls" to the local data.
- **Audit Logging**: All significant actions (login, logout, CSV upload, API calls) are timestamped and logged. Logs can be exported to a local file.
- **Usage Dashboard**: A visual dashboard with charts from `recharts` to display API usage statistics derived from the audit log.
- **Persistent State**: The application uses the browser's `localStorage` to persist all data, ensuring nothing is lost on page refresh or browser restart.
- **Fully Responsive**: Modern UI that works seamlessly on desktop and mobile devices.

## Tech Stack

- **React 18**: For building the user interface.
- **TypeScript**: For type safety and improved developer experience.
- **Tailwind CSS**: For utility-first styling and rapid UI development.
- **Recharts**: For creating beautiful and responsive charts.
- **Heroicons**: For high-quality SVG icons.

---

## Data Persistence (Current Browser-Based Method)

**This application is designed to retain all your data automatically.** There are no extra steps you need to take to save your work.

All data, including your session, uploaded CSV file, generated API key, audit logs, and custom password, is stored directly in your web browser's `localStorage`.

### How it Works:
- **Automatic Saving**: Every action you take (like generating an API key, uploading a file, or making an API call) is immediately saved.
- **Persistence on Refresh/Restart**: Because the data is in `localStorage`, it persists even if you refresh the page, close the browser tab, or restart your computer. When you reopen the application, it will load all of your previous data exactly as you left it.

This approach provides a robust, single-user experience without the need for a backend database.

---

## Transitioning to an On-Premise Server with a Database (Conceptual Guide)

While this application runs entirely in the browser, it's structured to be easily adaptable to a true on-premise server environment with a backend (e.g., using Node.js/Express, Python/Flask) and a persistent database like PostgreSQL.

For detailed instructions on installing and setting up a PostgreSQL database for this application, please see the **[DATABASE.md](DATABASE.md)** file.

### How it Would Work:

The core change is to replace every `localStorage` call in the frontend with an API call to a backend server. The server would then handle all logic and communication with the PostgreSQL database.

1.  **User Authentication & Password Storage**:
    *   **Current**: Password is in `localStorage`.
    *   **With Backend**: The `users` table in PostgreSQL would store a *hashed* version of the admin password. The login form would send credentials to a `/api/login` endpoint. The backend would hash the submitted password and compare it to the one in the database.

2.  **CSV Data Storage**:
    *   **Current**: CSV JSON is in `localStorage`.
    *   **With Backend**: When a user uploads a CSV, the file would be sent to a `/api/upload` endpoint. The backend would parse the CSV and insert each row into a dedicated `csv_data` table in PostgreSQL. API calls to fetch or search data would query this table.

3.  **Audit Logs Storage**:
    *   **Current**: Logs are an array in `localStorage`.
    *   **With Backend**: Every action in the frontend would trigger a request to a `/api/log` endpoint (e.g., `POST /api/log` with `{ action: 'LOGIN', ... }`). The backend would then insert a new entry into the `audit_logs` table in the database. The Audit Log page would fetch its data from this table.

4.  **API Key Storage**:
    *   **Current**: API Key is a string in `localStorage`.
    *   **With Backend**: The API key would be stored in a `configurations` table in the database or in a secure server-side environment file. The backend would validate incoming API requests against this stored key.

See `INSTALLATION.md` for setup instructions for the current application.
