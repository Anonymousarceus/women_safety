# Kavach — Women Safety Platform

A full-stack real-time women safety web application built with the **MERN stack** (MongoDB, Express.js, React, Node.js). Kavach provides emergency SOS alerts, live journey tracking, safety mapping, unsafe area reporting, and a guardian monitoring system — all designed to help women feel safer in their everyday lives.

---

## Features

| Feature | Description |
|---------|-------------|
| **SOS Alert** | One-tap emergency button that captures GPS location, notifies emergency contacts via email, and logs the event in real time |
| **Live Journey Tracking** | Start a journey and share a live-tracking link with guardians; location updates via WebSockets |
| **Guardian Monitoring** | Family/friends can enter a journey ID and watch the user's live location on a map |
| **Safety Map** | Interactive heatmap showing community-reported unsafe zones overlaid on a city map |
| **Safe Places Finder** | Finds nearby police stations, hospitals, and pharmacies using the Overpass API |
| **Unsafe Area Reporting** | Users report unsafe locations with category, description, and optional severity rating |
| **Fake Call** | Simulates an incoming phone call to help users escape uncomfortable situations |
| **User Profile & Emergency Contacts** | Manage personal info and add up to 5 emergency contacts who receive SOS emails |
| **JWT Authentication** | Secure signup/login with hashed passwords and token-based sessions |

---

## Tech Stack

### Frontend
- **React 18** — Component-based UI
- **Vite** — Fast build tool and dev server
- **Tailwind CSS 3** — Utility-first CSS with custom design system
- **React Router v6** — Client-side routing with protected routes
- **Leaflet + React-Leaflet** — Interactive maps with custom markers
- **Socket.io Client** — Real-time communication with backend
- **Axios** — HTTP client for REST API calls

### Backend
- **Node.js + Express.js** — RESTful API server
- **MongoDB Atlas + Mongoose** — Cloud-hosted NoSQL database with ODM
- **Socket.io** — WebSocket server for live journey tracking
- **JWT (jsonwebtoken)** — Stateless authentication
- **bcryptjs** — Password hashing
- **Nodemailer** — Email notifications for SOS alerts
- **Helmet** — HTTP security headers
- **express-rate-limit** — API rate limiting
- **express-validator** — Request body validation

### External APIs
- **Geoapify** — Map tiles and geocoding
- **Overpass API** — OpenStreetMap POI queries (police stations, hospitals, pharmacies)

---

## Project Structure

```
kavach/
├── backend/
│   ├── server.js              # Express app entry point + Socket.io setup
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── constants.js       # App-wide constants
│   ├── controllers/           # Route handler logic
│   │   ├── auth.controller.js
│   │   ├── journey.controller.js
│   │   ├── map.controller.js
│   │   ├── report.controller.js
│   │   ├── sos.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT verification
│   │   └── validate.middleware.js  # Input validation
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── Journey.js
│   │   ├── SOSEvent.js
│   │   └── UnsafeReport.js
│   ├── routes/                # Express route definitions
│   ├── services/
│   │   └── email.service.js   # Nodemailer email helper
│   └── sockets/
│       └── socket.handler.js  # Socket.io event handlers
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx            # Router + context providers
│       ├── main.jsx           # React DOM entry
│       ├── index.css          # Global styles + utilities
│       ├── components/        # Reusable UI components
│       │   ├── Layout.jsx     # Sidebar + Navbar wrapper
│       │   ├── Sidebar.jsx
│       │   ├── Navbar.jsx
│       │   ├── Button.jsx
│       │   ├── Card.jsx
│       │   ├── AlertBanner.jsx
│       │   ├── SafetyMap.jsx
│       │   ├── SOSButton.jsx
│       │   └── FakeCallButton.jsx
│       ├── pages/             # Route-level pages
│       │   ├── DashboardPage.jsx
│       │   ├── SafetyMapPage.jsx
│       │   ├── SafePlacesPage.jsx
│       │   ├── ReportPage.jsx
│       │   ├── JourneyPage.jsx
│       │   ├── GuardianPage.jsx
│       │   ├── ProfilePage.jsx
│       │   ├── LoginPage.jsx
│       │   └── RegisterPage.jsx
│       ├── context/           # React context providers
│       │   ├── AuthContext.jsx
│       │   └── SocketContext.jsx
│       ├── hooks/
│       │   └── useGeolocation.js
│       ├── services/          # API layer
│       │   ├── api.js         # Axios instance + interceptors
│       │   └── endpoints.js   # API endpoint functions
│       └── utils/
│           └── constants.js
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js** v18+
- **npm** v9+
- **MongoDB Atlas** account (or a local MongoDB instance)
- **Geoapify** API key (free tier: https://www.geoapify.com/)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/kavach.git
cd kavach
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
JWT_SECRET=your_secret_key
GEOAPIFY_API_KEY=your_geoapify_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
CLIENT_URL=http://localhost:5173
```

> **Note:** For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

Start the backend:
```bash
npm run dev
```
The server runs on `http://localhost:3000`.

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```
The app opens on `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| PUT | `/api/users/profile` | Yes | Update profile info |
| PUT | `/api/users/emergency-contacts` | Yes | Update emergency contacts |
| POST | `/api/sos/trigger` | Yes | Trigger SOS alert |
| PUT | `/api/sos/:id/resolve` | Yes | Resolve SOS event |
| GET | `/api/sos/my-events` | Yes | Get user's SOS history |
| POST | `/api/journeys/start` | Yes | Start a live journey |
| PUT | `/api/journeys/:id/end` | Yes | End a journey |
| GET | `/api/journeys/:id` | No | Get journey details (for guardian) |
| POST | `/api/reports` | Yes | Submit an unsafe area report |
| GET | `/api/reports/nearby` | Yes | Get reports near coordinates |
| GET | `/api/map/safe-places` | Yes | Find nearby safe places |
| GET | `/api/health` | No | Server health check |

---

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-journey` | Client → Server | Guardian joins a journey room |
| `location-update` | Client → Server | User sends GPS update during journey |
| `location-updated` | Server → Client | Broadcast new location to guardians |
| `journey-ended` | Server → Client | Notify guardians that journey ended |
| `sos-triggered` | Server → Client | Real-time SOS notification |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `PORT` | No | Server port (default: 3000) |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `GEOAPIFY_API_KEY` | Yes | Geoapify API key for map tiles |
| `EMAIL_USER` | Yes | Gmail address for sending alerts |
| `EMAIL_PASS` | Yes | Gmail App Password |
| `CLIENT_URL` | No | Frontend URL (default: http://localhost:5173) |

---

## Screenshots

> Add screenshots of the Dashboard, Safety Map, SOS Alert, Journey Tracking, and Fake Call screens here.

---

## License

This project is built for educational purposes.
