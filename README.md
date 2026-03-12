# 🇮🇳 Hyper-Local Targeting Engine

> **Civic transparency platform that delivers verified government 
> infrastructure information to citizens the moment they physically 
> enter a project zone — powered by geo-fencing technology.**

---

## 🎯 Problem

Every year the Indian government spends over ₹10 lakh crore on 
public infrastructure — yet citizens have no real-time way to know 
what was built, what it cost, or who is accountable — even when 
physically standing at the site.

- Government portals require citizens to search manually
- RTI takes 30 days and requires legal literacy  
- News coverage is episodic and politically framed
- No existing solution uses **physical presence** as the trigger

---

## 💡 Solution

A location-triggered civic notification engine that automatically 
delivers government project data to citizens the moment they enter 
a geo-fenced zone — requiring zero manual input from the citizen.

> **"Location is the query. Government data is the result. 
> The citizen's presence is the only permission needed."**

---

## 📱 Current Implementation

We have currently built and integrated this system as a 
**standalone mobile application** with:

- GPS-based geo-fence detection running in the background
- Real-time government project data fetch on zone entry
- Push notification delivery via FCM and APNs
- Admin panel built directly inside the app for content management
- Support for Android and iOS via React Native

### 🔗 Live Demo / Prototype
[👉 Click here to view the prototype](#)

### 📂 GitHub Repository
[👉 github.com/yourusername/hyper-local-targeting-engine](#)

---

## 🚀 Planned Extension — Existing Government Apps

> **This solution is designed to work as a plug-in extension 
> for existing government apps — not just as a standalone app.**

The same engine will be offered as a lightweight REST API 
integration that any existing government app can plug into 
with under 20 lines of code and one day of developer effort.

### Target Integration Partners

| App | Users | Integration Type |
|-----|-------|-----------------|
| Aarogya Setu | 240M+ | REST API |
| UMANG | 38M+ | REST API |
| DigiLocker | 150M+ | REST API |
| mParivahan | 80M+ | REST API |
| **Total Reachable** | **500M+** | **Zero new downloads** |

### How Integration Works

Any existing government app calls our single endpoint:
```
GET /api/v1/nearby-projects
    ?lat=21.2514
    &lng=81.6296
    &lang=hi
    &app_id=aarogya_setu
```

We return a ready-to-display notification payload:
```json
{
  "projects": [
    {
      "title": "Rajiv Gandhi Govt General Hospital",
      "body": "Built with ₹82 Cr · Completed 2023 · 4800+ free surgeries",
      "distance_meters": 180,
      "should_notify": true,
      "notification_count": 1
    }
  ]
}
```

The partner app renders it using their own existing 
notification UI. We power the intelligence. They own 
the citizen relationship.

---

## 🔒 Admin Panel — In-App Only

A complete admin panel is built directly inside the 
application — no separate CMS portal or external 
dashboard required.

### Admin Capabilities

**1. Geo-fence Manager**
- Draw geo-fence polygon boundaries on an interactive map
- Activate, deactivate, or edit zone boundaries
- Set fence radius and project category
- All changes reflect live within 5 minutes

**2. Project Content Editor**
- Add new government projects with full details
- Fields: project name, cost, completion year, 
  responsible authority, impact summary, source citation
- Source citation is mandatory — budget portal, 
  gazette record, or tender document required
- Two-stage verification: Submitted → Reviewed → 
  Approved → Live

**3. Content Version Control**
- Every save auto-increments the content version number
- Version change automatically resets the notification 
  counter for all users at that location
- Users who saw old information become eligible to 
  receive the updated content

**4. Analytics Dashboard**
- View notification trigger rate per project
- Track open rate, tap rate, opt-out rate
- Monitor delivery success across all 7 channels
- Geographic coverage heatmap

### Admin Access
- Role-based access control — Admin and Reviewer roles
- Secure login with JWT authentication
- All admin actions logged with timestamp and user ID
- No external CMS — everything managed inside the app

---

## ⚡ Key Features

- **Zero citizen effort** — presence triggers everything automatically
- **Notification Gate** — max 3 notifications per location per user
- **Version-aware** — resets only when government updates project data
- **7 delivery channels** — FCM, APNs, WhatsApp, SMS, Web Push, 
  UMANG, Aarogya Setu
- **Multilingual** — 9 Indian languages via IndicTrans2
- **Privacy first** — GPS coordinates never stored, DPDP Act 2023 compliant
- **650ms end-to-end** — boundary crossing to notification on screen
- **Offline resilient** — cached content works without internet

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native · Expo · expo-location · expo-task-manager |
| Backend | Node.js · Express · Go (Ingestion Service) |
| Database | MongoDB Atlas · 2dsphere Geo-index |
| Cache | Redis ElastiCache · H3 Spatial Index |
| Queue | Apache Kafka (AWS MSK) |
| Cloud | AWS ECS Fargate · API Gateway · CloudFront |
| Delivery | FCM · APNs · WhatsApp Business API · SMS |
| Security | HMAC-SHA256 · JWT · AWS WAF · KMS |
| Compliance | DPDP Act 2023 · DLT Registered SMS |

---

## 🏗️ Architecture
```
CITIZEN PHONE
     ↓  GPS Entry Event + HMAC Signature
AWS API GATEWAY + WAF
     ↓  Validated Event (T+50ms)
LOCATION INGESTION SERVICE (Go)
     ↓  Kafka Publish (T+80ms)
GEO-FENCE EVALUATOR — H3 + PostGIS
     ↓  Fence Match Confirmed (T+120ms)
CONSENT SERVICE — DPDP Gate
     ↓  Consent Verified (T+140ms)
NOTIFICATION ORCHESTRATOR
     ↓  Redis Cache Hit — 5ms (T+200ms)
NOTIFICATION GATE
     ↓  Count < 3 + Version Check (T+240ms)
CHANNEL SELECTOR
     ↓  FCM / APNs / WhatsApp / SMS (T+300ms)
CITIZEN SCREEN
     ✅ Notification Delivered (T+650ms)
```

---

## 🚀 How to Run

### Prerequisites
```
Node.js 20+
MongoDB Atlas account (free tier works)
Redis (local or Upstash free tier)
Expo CLI
```

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MongoDB and Redis credentials in .env
npm run dev
```

### Mobile Setup
```bash
cd mobile
npm install
npx expo start
# Scan QR code with Expo Go app on your phone
```

### Test the API
```bash
# Check server is running
curl http://localhost:3000/

# Fetch nearby projects
curl "http://localhost:3000/api/v1/nearby-projects?lat=21.2514&lng=81.6296&lang=hi"

# Simulate fence entry
curl -X POST http://localhost:3000/api/fence-entry \
  -H "Content-Type: application/json" \
  -d '{"fenceId":"fence-001","deviceId":"test-device-001","enteredAt":"2026-03-12T10:00:00Z"}'
```

---

## 📊 API Reference

### GET /api/v1/nearby-projects
Returns government projects near a coordinate.

| Parameter | Required | Description |
|-----------|----------|-------------|
| lat | ✅ | Latitude of current location |
| lng | ✅ | Longitude of current location |
| lang | ❌ | Language code (hi, ta, te, kn, en) |
| app_id | ❌ | Partner app identifier |

### POST /api/fence-entry
Called by mobile app on geo-fence boundary crossing.
```json
{
  "fenceId":   "fence-001",
  "deviceId":  "hashed-device-id",
  "enteredAt": "2026-03-12T10:00:00Z"
}
```

---

## 🔒 Privacy & Compliance

- **GPS coordinates never stored** — only fence ID and 
  timestamp logged
- **DPDP Act 2023 compliant** — all data stored in 
  AWS ap-south-1 Mumbai region
- **Consent-first** — every pipeline step checks 
  opt-out status before processing
- **Rate limited** — 1 ping per 30 seconds per device
- **DLT registered** — SMS sender ID registered with TRAI

---

## 👥 Team
Hustlers

## 🏆 Built For
India Innovates

## 📽️ Demo Link
[Your Netlify / prototype link here]
