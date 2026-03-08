# Kavach — Project Explanation & Viva Preparation

---

## 1. What is this project?

Kavach is a **women safety web application**. It helps women stay safe by providing emergency tools like an SOS panic button, live journey tracking, a safety map of dangerous areas, a nearby safe-places finder, and a fake call feature — all accessible from a single dashboard in their browser.

---

## 2. Why did I build this?

Women face safety concerns while commuting alone, especially at night. Existing solutions are either hardware devices (expensive) or basic apps that only make a phone call. Kavach is a **free, browser-based** solution that combines multiple safety features in one place — SOS alerts with GPS, real-time tracking for family, community-sourced danger maps, and quick-access nearby police/hospital lookup — without requiring any special hardware.

---

## 3. Tech Stack — What I used and Why

### Frontend

| Technology | Why I chose it |
|------------|---------------|
| **React 18** | Component-based architecture makes it easy to build reusable UI pieces (Button, Card, Map). Virtual DOM gives smooth updates when location data changes in real time. |
| **Vite** | Much faster than Create React App for development. Hot Module Replacement (HMR) means instant feedback while coding. |
| **Tailwind CSS** | Utility-first approach removes the need for separate CSS files. Makes responsive design simple with `sm:`, `md:` prefixes. Consistent spacing/colors across the entire app. |
| **React Router v6** | Handles client-side navigation without page reloads. Supports protected routes (redirect to login if not authenticated). |
| **Leaflet + React-Leaflet** | Free and open-source mapping library. No API cost unlike Google Maps. Supports custom markers, popups, and layers for showing danger zones and safe places. |
| **Socket.io Client** | Enables real-time bidirectional communication. Needed for live location sharing during journeys — guardian sees location update instantly without refreshing. |
| **Axios** | Better than native fetch — supports interceptors (automatically attach JWT token to every request), request/response error handling, and timeout configuration. |

### Backend

| Technology | Why I chose it |
|------------|---------------|
| **Node.js + Express.js** | JavaScript on both frontend and backend — one language for the whole project. Express is lightweight and has a huge middleware ecosystem. |
| **MongoDB Atlas + Mongoose** | NoSQL database is perfect for this project — user data, reports, and journey logs don't need rigid table schemas. Location data (coordinates) works naturally with MongoDB's GeoJSON. Atlas provides free cloud hosting. |
| **Socket.io** | Server-side WebSocket library that pairs with the client. Manages "rooms" so each journey has its own channel — only the guardians watching that journey get updates. |
| **JWT (jsonwebtoken)** | Stateless authentication — the server doesn't need to store sessions. The token contains user ID and expiry, verified on every protected API call. |
| **bcryptjs** | Hashes passwords with a salt before storing in the database. Even if the database is compromised, passwords can't be read. |
| **Nodemailer** | Sends emergency emails to contacts during SOS. Uses Gmail SMTP — simple setup, no third-party email service needed. |
| **Helmet** | Adds security headers (X-Frame-Options, X-Content-Type-Options, etc.) to prevent common web vulnerabilities. One line of middleware. |
| **express-rate-limit** | Prevents abuse by limiting repeated requests from the same IP. Protects the SOS and auth endpoints from brute-force attacks. |
| **express-validator** | Validates and sanitizes request bodies (email format, required fields, string length) before they reach the controller. Stops bad data at the gate. |

### External APIs

| API | Why I chose it |
|-----|---------------|
| **Geoapify** | Free map tiles and geocoding. Used for rendering the interactive map on every map page. |
| **Overpass API** | Queries OpenStreetMap data for nearby Points of Interest (police stations, hospitals, pharmacies). Completely free, no API key needed for basic queries. |

---

## 4. How does each feature work?

### SOS Alert
1. User taps the SOS button (always visible in bottom-right corner)
2. Browser's Geolocation API captures current latitude/longitude
3. Frontend sends POST request to `/api/sos/trigger` with coordinates
4. Backend creates an `SOSEvent` document in MongoDB
5. Backend fetches the user's emergency contacts from their profile
6. Nodemailer sends an email to each contact with the user's name, time, and a Google Maps link to their location
7. Socket.io emits `sos-triggered` event so the dashboard updates in real time
8. User can tap "I'm Safe" to resolve the SOS

### Live Journey Tracking
1. User starts a journey → backend creates a `Journey` document with status "active" and returns a journey ID
2. Frontend starts watching GPS with `navigator.geolocation.watchPosition()`
3. Every location change is sent via Socket.io `location-update` event to the server
4. Server broadcasts the new coordinates to all clients in that journey's Socket room
5. Guardian enters the journey ID on the Guardian page → joins the room → sees live pin movement on the map
6. When user ends the journey, server marks it complete and emits `journey-ended`

### Safety Map
1. Page loads → calls `/api/reports/nearby` with user's coordinates and a radius
2. Backend queries MongoDB for `UnsafeReport` documents within that radius
3. Frontend plots each report as a colored circle on the Leaflet map (red = dangerous, orange = moderate)
4. Clicking a marker shows the report details in a popup

### Safe Places Finder
1. User's location is detected via Geolocation API
2. Frontend sends GET request to `/api/map/safe-places` with coordinates
3. Backend queries the Overpass API for `amenity=police`, `amenity=hospital`, `amenity=pharmacy` within a radius
4. Results cached to avoid hitting rate limits
5. Frontend shows results as markers on the map with distance from user

### Fake Call
1. User taps the phone icon (bottom-left corner)
2. A full-screen overlay appears simulating an incoming call from "Mom"
3. If the device supports it, the phone vibrates
4. User taps accept or decline to dismiss — gives them an excuse to leave an uncomfortable situation

### Unsafe Area Reporting
1. User fills a form: location (picked on map or typed), category (harassment, theft, poor lighting, etc.), description, severity
2. POST request to `/api/reports` saves it to MongoDB with coordinates
3. The report then appears on the Safety Map for all users

---

## 5. Database Schema (Models)

### User
- `name`, `email` (unique), `password` (hashed), `phone`
- `emergencyContacts[]` — array of { name, phone, email, relation }
- Timestamps

### Journey
- `userId` (reference to User)
- `status` — "active" or "completed"
- `startLocation` — { latitude, longitude }
- `currentLocation` — updated in real time
- `route[]` — array of { latitude, longitude, timestamp } breadcrumbs
- Timestamps

### SOSEvent
- `userId`, `location` { latitude, longitude }
- `status` — "active" or "resolved"
- `resolvedAt` — timestamp when marked safe
- Timestamps

### UnsafeReport
- `userId`, `location` { latitude, longitude }
- `category` — harassment, theft, poorLighting, other
- `description`, `severity` (1-5)
- Timestamps

---

## 6. Authentication Flow

1. **Register**: User submits name, email, password → backend hashes password with bcrypt → saves to MongoDB → returns JWT token
2. **Login**: User submits email + password → backend verifies with `bcrypt.compare()` → if match, signs a JWT with user ID → returns token
3. **Protected Routes**: Frontend stores token in localStorage → Axios interceptor attaches `Authorization: Bearer <token>` to every request → backend middleware decodes token, finds user, attaches to `req.user`
4. **Auto-login**: On app load, AuthContext calls `/api/auth/me` with stored token → if valid, user is logged in automatically

---

## 7. Real-time Architecture (Socket.io)

```
User's Browser                    Server                    Guardian's Browser
     |                              |                              |
     |-- join-journey (journeyId)-->|                              |
     |                              |<-- join-journey (journeyId)--|
     |                              |                              |
     |-- location-update ---------> |                              |
     |                              |-- location-updated --------> |
     |                              |                              |
     |-- end-journey -------------> |                              |
     |                              |-- journey-ended -----------> |
```

- Each journey has its own **room** (identified by journey ID)
- Only clients who joined that room receive location updates
- This is efficient — no broadcasting to all connected users

---

## 8. Security Measures

| Measure | Implementation |
|---------|----------------|
| Password hashing | bcryptjs with salt rounds |
| JWT authentication | Token-based, stateless, expires after set time |
| Helmet | Security headers on all responses |
| Rate limiting | Limits requests per IP per time window |
| Input validation | express-validator on all POST/PUT routes |
| CORS | Only allows requests from the configured client URL |
| Environment variables | Secrets stored in .env, not in code |

---

## 9. Possible Viva Questions & Answers

### General

**Q: What problem does your project solve?**
A: It addresses women's safety by combining SOS alerts, live tracking, danger-zone mapping, and nearby safe-place lookup into a single web app — eliminating the need for expensive hardware devices.

**Q: Why a web app and not a mobile app?**
A: A web app works on any device with a browser — no installation required, works on both Android and iOS. PWA capabilities can be added later for offline support.

**Q: Who is the target user?**
A: Women who commute alone — college students, working professionals, and their family members who want to monitor their safety.

### Technical

**Q: Why MongoDB instead of MySQL?**
A: The data (reports, journey breadcrumbs, user contacts) doesn't have complex relationships. MongoDB's flexible schema handles arrays of coordinates and embedded documents naturally. Also, MongoDB has built-in support for geospatial queries which is useful for finding nearby reports.

**Q: How does real-time tracking work?**
A: WebSockets via Socket.io. The browser watches GPS position using the Geolocation API. On every change, coordinates are sent to the server through a persistent WebSocket connection. The server broadcasts them to all guardians in that journey's room — so the map updates instantly without polling.

**Q: What happens if the user loses internet during a journey?**
A: The journey stays in "active" state. When connectivity returns, the browser reconnects automatically (Socket.io handles reconnection). The last known location is preserved on the server.

**Q: How are passwords stored?**
A: Using bcryptjs — the password is hashed with a random salt before storage. Even with database access, the original password cannot be recovered. During login, `bcrypt.compare()` verifies the entered password against the hash.

**Q: What is JWT and why use it?**
A: JSON Web Token — a compact, self-contained token that carries the user's ID and expiry time. It's signed with a secret key. On every request, the server verifies the signature without needing a session database. This makes the API stateless and scalable.

**Q: How does the SOS email notification work?**
A: When SOS is triggered, the backend fetches the user's emergency contacts, then uses Nodemailer with Gmail SMTP to send an email to each contact. The email contains the user's name, timestamp, and a direct Google Maps link to their GPS coordinates.

**Q: What is Helmet and why is it used?**
A: Helmet is an Express middleware that sets various HTTP security headers — like X-Frame-Options (prevents clickjacking), X-Content-Type-Options (prevents MIME sniffing), and Strict-Transport-Security. It's a single line that hardens the app against common web attacks.

**Q: How do you find nearby safe places?**
A: The Overpass API queries OpenStreetMap's database. We send a query asking for nodes tagged as `amenity=police`, `amenity=hospital`, or `amenity=pharmacy` within a specified radius of the user's coordinates. The results include names, coordinates, and metadata.

**Q: How does the fake call feature work technically?**
A: It's entirely client-side. A React state toggle shows a full-screen overlay that looks like a phone's incoming call screen. It uses the Vibration API (`navigator.vibrate()`) if the device supports it. No server call is needed.

**Q: What design patterns did you use?**
A: Context API pattern for global state (auth, socket), custom hooks (`useGeolocation`) for reusable logic, service layer pattern for API calls (separating endpoint definitions from components), and MVC pattern on the backend (Model-Controller-Routes).

**Q: How do you handle API errors?**
A: Axios interceptors catch 401 errors globally (logs user out if token expired). In components, try-catch blocks handle specific errors with user-friendly AlertBanner messages. The backend uses express-validator for input errors and returns consistent JSON error responses.

**Q: What would you improve if you had more time?**
A: (1) Add push notifications instead of only email for SOS. (2) Make it a Progressive Web App for offline support. (3) Add a machine learning model to predict unsafe areas from report data. (4) Add voice-activated SOS for hands-free triggering. (5) Add end-to-end encryption for location data.

### Architecture

**Q: Explain the folder structure.**
A: Backend follows MVC — models/ for database schemas, controllers/ for business logic, routes/ for URL mapping, middleware/ for auth and validation, services/ for utilities like email. Frontend follows feature-based organization — pages/ for route-level views, components/ for reusable UI, context/ for global state, hooks/ for reusable logic, services/ for API calls.

**Q: How does the frontend communicate with the backend?**
A: Two ways — (1) REST API via Axios for CRUD operations (login, fetch reports, trigger SOS), and (2) WebSockets via Socket.io for real-time data (live journey locations, SOS notifications).

**Q: What is CORS and why do you need it?**
A: Cross-Origin Resource Sharing. The frontend (port 5173) and backend (port 3000) run on different ports, which browsers treat as different origins. Without CORS headers, the browser blocks API requests. The `cors` middleware tells the browser that our frontend URL is allowed to access the API.

---

## 10. Key Learnings

1. **Real-time is hard** — handling Socket.io rooms, reconnection, and state sync between multiple clients taught me how real-time apps work under the hood
2. **Maps need explicit heights** — Leaflet maps won't render in CSS flex/grid containers without a fixed pixel height
3. **Rate limiting matters** — the Overpass API rate-limits aggressively; caching responses on the backend was essential
4. **Security is layered** — no single measure is enough; combining hashing + JWT + validation + rate limiting + CORS + Helmet creates defense in depth
5. **Geolocation is unreliable** — browsers may deny permission, GPS may be inaccurate, or take time to lock on; always provide fallback handling
