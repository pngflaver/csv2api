# API Functions Reference

This document describes all available API endpoints for your CSV-backed API server, including request/response formats, authentication, and usage examples.

---


## Authentication
All endpoints require an API key in the `Authorization` header. There are now **two separate API keys**:

- **Internal API Key**: Used for all endpoints except `/api/lookup` (admin/maintenance operations)
- **Lookup API Key**: Used only for `/api/lookup` (external/partner lookups)

Specify the key in the header:
```
Authorization: Bearer YOUR_API_KEY
```

---


## 1. Upload CSV Data
**Endpoint:** `POST /api/upload`

**Requires:** Internal API Key

**Description:**
Upload your CSV data to the server. The request body must be a JSON object with a `data` property containing an array of row objects (each row is a key-value map of column names to values).

**Request Example:**
```
POST /api/upload
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY (internal)

{
  "data": [
    {"email": "test@example.com", "firstName": "John"},
    {"email": "jane@example.com", "firstName": "Jane"}
  ]
}
```

**Response Example:**
```
{
  "saved": 2
}
```

---


## 2. Lookup Record
**Endpoint:** `POST /api/lookup`

**Requires:** Lookup API Key

**Description:**
Find a record by providing **both** `email` and `firstName` in the JSON body. Both fields are required. The endpoint now returns only the HTTP status code and the date/time when the data was last uploaded.

**Request Example:**
```
POST /api/lookup
Content-Type: application/json
Authorization: Bearer LOOKUP_API_KEY

{
  "email": "test@example.com",
  "firstName": "John"
}
```
> **Note:**
> The fields required in the `/api/lookup` request body are **dynamic** and depend on the column headers of your uploaded CSV file. For example, if your CSV has columns `email` and `firstname`, your lookup request must include those fields. If your CSV uses different headers, the lookup request must match those headers exactly.

**Response Example (success):**
```
{
  "status": 200,
  "lastUpload": "2025-11-21T02:30:00.000Z"
}
```

**Response Example (not found):**
```
{
  "status": 404,
  "lastUpload": "2025-11-21T02:30:00.000Z"
}
```

**Response Example (bad request):**
```
{
  "status": 400,
  "lastUpload": "2025-11-21T02:30:00.000Z"
}
```

**Response Example (server error):**
```
{
  "status": 500,
  "lastUpload": "2025-11-21T02:30:00.000Z"
}
```

**Note:**
- The `lastUpload` field is always present. If no data has ever been uploaded, it may be `null` or an empty string.
- The date/time is updated every time `/api/upload` succeeds, and is stored in `server/last-upload.txt`.

----


## 3. Clear All Data
**Endpoint:** `POST /api/clear`

**Requires:** Internal API Key

**Description:**
Removes all uploaded CSV data from the server.

**Request Example:**
```
POST /api/clear
Authorization: Bearer YOUR_API_KEY (internal)
```

**Response Example:**
```
{
  "cleared": true
}
```

---


## 4. Get Current API Keys
**Endpoint:** `GET /api/get-api-key`

**Description:**
Returns both the current internal and lookup API keys (for debugging or automation).

**Request Example:**
```
GET /api/get-api-key
```

**Response Example:**
```
{
  "apiKey": "csv-api-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "lookupKey": "csv-api-lookup-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---


## 5. Set/Update API Key
**Endpoint:** `POST /api/set-api-key`

**Requires:** Internal API Key

**Description:**
Update the internal API key. Requires the current valid internal API key in the header. The new key must be at least 8 characters.

**Request Example:**
```
POST /api/set-api-key
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY (internal)

{
  "newApiKey": "csv-api-NEWKEY-123456"
}
```

**Response Example:**
```
{
  "success": true,
  "apiKey": "csv-api-NEWKEY-123456"
}
```

## 6. Set/Update Lookup API Key
**Endpoint:** `POST /api/set-lookup-key`

**Requires:** Internal API Key

**Description:**
Update the lookup API key. Requires the current valid internal API key in the header. The new key must be at least 8 characters.

**Request Example:**
```
POST /api/set-lookup-key
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY (internal)

{
  "newLookupKey": "csv-api-lookup-NEWKEY-123456"
}
```

**Response Example:**
```
{
  "success": true,
  "lookupKey": "csv-api-lookup-NEWKEY-123456"
}
```

---


---
## Logging, Troubleshooting, and API Key Normalization

- All API requests are logged to `server/api-requests.ndjson` (NDJSON format, one JSON object per line).
- Each log entry includes timestamp, method, path, status, duration, IP, user agent, and masked API token.
- API keys are normalized (trimmed, no newlines) before comparison. If you get 401/403 errors, check the server log for masked received/expected tokens.
- `/api/lookup` is rate-limited to 5 requests per minute per IP (returns 429 if exceeded).
- For 500 errors, the server logs the error stack trace for debugging.
