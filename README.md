# Drill Down Form — Vehicle Selection App

A full-stack React + Express application for selecting a vehicle (Make → Model → Badge) and uploading a service logbook.

---

## Project Structure

```
new_assignment/
├── backend/          # Express API server
│   ├── server.js
│   └── package.json
└── frontend/         # React app (Create React App)
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.js
        ├── App.css
        └── components/
            └── VehicleForm.js
```

---

## Running the App

### 1. Start the Backend

```bash
cd new_assignment/backend
npm install
node server.js
```

The server starts on **http://localhost:5001**.


### 2. Start the Frontend (in a separate terminal)

```bash
cd new_assignment/frontend
npm install
npm start
```

The React app opens at **http://localhost:3000** and proxies all `/api/*` calls to `http://localhost:5001`.

---

## Features

| Feature | Details |
|---|---|
| **Cascading dropdowns** | Make → Model → Badge. Changing a parent resets all downstream selections. |
| **Quick-select buttons** | "Tesla Model 3 Performance" and "BMW 130d xDrive 26d" pre-fill all three dropdowns instantly. |
| **Logbook upload** | Accepts `.txt` files only. |
| **Form submission** | `POST /api/submit` with `multipart/form-data`. |
| **Response display** | Shows selected vehicle and logbook contents after a successful submit. |
| **Error handling** | Client-side validation + server error messages shown in a red banner. |

---

## API

### `GET /api/health`
Returns `{ "status": "ok" }`.

### `POST /api/submit`
**Content-Type:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `make` | string | Vehicle make (e.g. `tesla`) |
| `model` | string | Vehicle model (e.g. `Model 3`) |
| `badge` | string | Vehicle badge (e.g. `Performance`) |
| `logbook` | file (`.txt`) | Plain-text service logbook |

**Success response (200):**
```json
{
  "success": true,
  "vehicle": {
    "make": "tesla",
    "model": "Model 3",
    "badge": "Performance"
  },
  "logbookContents": "Service log entry 1\nOil changed at 50000km\n"
}
```

**Error response (400):**
```json
{
  "success": false,
  "error": "Missing required field(s): logbook."
}
```

---

## Vehicle Data

```js
const VEHICLES = {
  ford: {
    Ranger:       ['Raptor', 'Raptor X', 'Wildtrak'],
    Falcon:       ['XR6', 'XR6 Turbo', 'XR8'],
    'Falcon Ute': ['XR6', 'XR6 Turbo'],
  },
  bmw: {
    '130d': ['xDrive 26d', 'xDrive 30d'],
    '240i': ['xDrive 30d', 'xDrive 50d'],
    '320e': ['xDrive 75d', 'xDrive 80d', 'xDrive 85d'],
  },
  tesla: {
    'Model 3': ['Performance', 'Long Range', 'Dual Motor'],
  },
};
```
