# PostgreSQL Installation & Setup Guide

This guide provides instructions on how to install PostgreSQL and set up a database for use with the CSV API Server application. This setup is necessary when transitioning from the browser's `localStorage` to a persistent, on-premise database server.

This guide assumes you are building a backend service (e.g., in Node.js, Python, or Go) that will connect to this database. The React frontend cannot connect to it directly.

## 1. PostgreSQL Installation

Choose the guide for your operating system.

### on macOS (using Homebrew)
If you don't have Homebrew, install it from [brew.sh](https://brew.sh/).

1.  **Install PostgreSQL**:
    ```bash
    brew install postgresql
    ```
2.  **Start the PostgreSQL Service**:
    ```bash
    brew services start postgresql
    ```
3.  **Create a Database User** (Optional but recommended):
    By default, your user account is a superuser. You can create a dedicated user:
    ```bash
    createuser --interactive
    ```
    Follow the prompts. Give the user a name (e.g., `api_user`) and make them a superuser if needed for setup.

### on Ubuntu / Debian
1.  **Update and Install**:
    ```bash
    sudo apt update
    sudo apt install postgresql postgresql-contrib
    ```
2.  **Start and Enable the Service**:
    ```bash
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    ```
3.  **Access the `psql` Shell**:
    PostgreSQL creates a `postgres` user. Switch to it to run commands.
    ```bash
    sudo -u postgres psql
    ```

### on Windows
1.  **Download the Installer**: Go to the [PostgreSQL website](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) and download the installer for your version of Windows.
2.  **Run the Installer**: Follow the on-screen instructions.
    -   When prompted, set a strong password for the `postgres` superuser. **Remember this password.**
    -   You can leave the port as the default (`5432`).
    -   The installer may also offer to install Stack Builder, which can be used to install additional tools like PostGIS. You can skip this for now.
3.  **Add PostgreSQL to your PATH**: The installer usually does this automatically, but you should verify it. This allows you to run `psql` from any command prompt.

---

## 2. Create the Database and Tables

Once PostgreSQL is installed and running, you need to create the database and the required tables.

1.  **Open the `psql` shell**:
    -   On macOS/Linux: `psql`
    -   On Windows: Open the "SQL Shell (psql)" application from your Start Menu. You may be prompted for the server, database, port, username, and password. Defaults are usually fine, just enter the password you set during installation.

2.  **Create the Database**:
    Run the following SQL command to create a new database.
    ```sql
    CREATE DATABASE csv_api_server;
    ```

3.  **Connect to Your New Database**:
    In the `psql` shell, connect to the newly created database.
    ```sql
    \c csv_api_server
    ```

4.  **Create the Tables**:
    Copy and paste the following SQL commands into the `psql` shell to create the tables needed for the application.

    **Table for Admin User (and Password)**
    *This table will store a HASHED password, not a plaintext one.*
    ```sql
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL
    );

    -- Insert the default admin user (password should be hashed by your backend)
    -- For example, if 'password' becomes 'hashed_password_string'
    INSERT INTO users (username, password_hash) VALUES ('admin', 'your_hashed_password_here');
    ```

    **Table for Audit Logs**
    ```sql
    CREATE TABLE audit_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        username VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        details TEXT
    );
    ```

    **Table for CSV Data**
    *This table structure is generic. You may need to alter it or create a new one dynamically based on the headers of the uploaded CSV file.*
    ```sql
    CREATE TABLE csv_data (
        id SERIAL PRIMARY KEY,
        file_id INT, -- To link rows to a specific file upload
        row_data JSONB NOT NULL -- Storing each row as a flexible JSON object
    );
    ```

---

## 3. Database Connection String

Your backend application will need a connection string to connect to this database. The format is typically:
`postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE_NAME]`

-   **USER**: `postgres` or the user you created (e.g., `api_user`).
-   **PASSWORD**: The password you set for that user.
-   **HOST**: `localhost` (since it's running on your on-prem server).
-   **PORT**: `5432` (the default).
-   **DATABASE_NAME**: `csv_api_server`.

**Example:**
`postgresql://postgres:mysecretpassword@localhost:5432/csv_api_server`

This connection string should be stored securely in your backend's environment variables.
