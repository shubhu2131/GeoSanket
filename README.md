# 🇮🇳 GeoSanket — Hyper-Local Civic Awareness Engine

> Automatically delivers verified government project information to citizens  
> the moment they physically enter a geo-fenced zone — zero effort required.

🔗 **Live Demo:** https://geosanket.vercel.app  
🛠️ **API:** https://geosanket-production.up.railway.app

---

## 🎯 Problem

Every year the Indian government spends over ₹10 lakh crore on public infrastructure — yet citizens standing right next to a hospital, bridge, or road have no way to know what it cost, who built it, or who is accountable.

- Government portals require manual searching
- RTI takes 30 days and requires legal literacy
- No existing solution uses **physical presence** as the trigger

---

## 💡 Solution

A location-triggered civic notification engine that delivers verified government project data to citizens the moment they enter a geo-fenced zone — requiring **zero manual input**.

> **"Location is the query. Government data is the result.  
> The citizen's presence is the only permission needed."**

---

## 🚀 How It Works

```
Citizen walks near a govt project
        ↓
OS-level GPS detects zone entry (hardware chip, ~2% battery)
        ↓
5-minute dwell check (passers-by ignored)
        ↓
Redis dedup check (no spam — 1 notification per zone per 24hrs)
        ↓
MongoDB fetches verified project data
        ↓
Push notification delivered in ~650ms
        ↓
Citizen sees: project name, ₹ budget, completion %, leader
```

---

## 📱 What's Built

### Citizen Flow
- Anonymous device onboarding — no sign-up, no login required
- Simulate zone entry via web portal to test full pipeline
- Real browser push notifications in the demo
- Notification history with timestamps

### Admin Panel (`/admin`)
- Live map with all active geo-fence zones
- Create / delete zones with lat-lng + radius
- Add / manage government projects with full details
- Real-time notification feed via Socket.io
- Analytics dashboard — notifications over time, by zone

### Integration API
Any existing government app can plug in with **one API call**:

```http
POST /api/v1/fence-check
Content-Type: application/json

{
  "lat": 28.5672,
  "lng": 77.2090,
  "deviceId": "hashed-device-id",
  "appId": "aarogya_setu",
  "lang": "hi"
}
```

Response:
```json
{
  "shouldNotify": true,
  "notifications": [{
    "title": "AIIMS Trauma Centre",
    "body": "₹85Cr · 95% complete · Built under PMAY Health",
    "leader": "Arvind Kejriwal",
    "scheme": "PMAY Health",
    "completionPercentage": 95
  }]
}
```

### Target Integration Partners

| App | Users | Integration |
|-----|-------|-------------|
| Aarogya Setu | 240M+ | REST API |
| UMANG | 38M+ | REST API |
| DigiLocker | 150M+ | REST API |
| mParivahan | 80M+ | REST API |
| **Total** | **500M+** | **Zero new downloads** |

---

## 🔒 Smart Notification Control

- **Dwell time** — user must stay 5 min inside zone (passers-by ignored)
- **Deduplication** — Redis TTL key per user+zone, 24-hour window
- **Offline resilient** — zones cached locally, works without internet
- **Privacy first** — GPS coordinates never stored, only zone ID logged
- **Version-aware** — notification resets when govt updates project data

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind + Leaflet.js |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + 2dsphere geo-index |
| Cache | Redis (Upstash) |
| Realtime | Socket.io |
| Notifications | Firebase FCM |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## 🏗️ Architecture

```
Browser / Mobile App
        ↓ HTTPS
Railway Backend (Node.js + Express)
    ├── POST /api/v1/fence-check     ← integration API
    ├── POST /api/location/ping      ← mobile app ping
    ├── GET  /api/zones              ← zone management
    ├── GET  /api/projects           ← project management
    └── GET  /api/analytics/*        ← dashboard stats
        ↓
MongoDB Atlas          Redis (Upstash)        Firebase FCM
(zones, projects,      (dedup, dwell,         (push notifications)
 users, logs)           zone cache)
```

---

## 🚀 How to Run Locally

### Prerequisites
```
Node.js 20+
MongoDB Atlas account
Redis (Upstash free tier)
Firebase project
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your credentials in .env
npm run seed    # loads 3 Delhi zones + demo users
npm run dev     # starts on port 5000
```

### Frontend
```bash
cd frontend
npm install
# Create .env.local with:
# VITE_API_URL=http://localhost:5000
# VITE_SOCKET_URL=http://localhost:5000
npm run dev     # starts on port 3000
```

### Test the API
```bash
# Health check
curl http://localhost:5000/

# Fence check (integration API)
curl -X POST http://localhost:5000/api/v1/fence-check \
  -H "Content-Type: application/json" \
  -d '{"lat":28.5672,"lng":77.2090,"deviceId":"test-001","lang":"en"}'

# Admin login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9999999999","password":"admin123"}'
```

### Demo Credentials
```
Admin:   9999999999 / admin123
Citizen: 9876543210 / citizen123
```

---

## 📊 Demo Seed Data (Delhi)

| Zone | Type | Coordinates |
|------|------|-------------|
| AIIMS Main Gate | Hospital | 28.5672, 77.2090 |
| Signature Bridge | Bridge | 28.7073, 77.2263 |
| DU North Campus Metro | College | 28.6880, 77.2073 |

---

## 👥 Team
**Hustlers** — India Innovates 2026

## 🏆 Built For
India Innovates 2026 · Municipal Corporation of Delhi (MCD)

## 📽️ Demo
https://geosanket.vercel.app