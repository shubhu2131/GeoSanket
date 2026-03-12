# 🇮🇳 Hyper-Local Targeting Engine 

> Delivers government project information to citizens 
> automatically when they walk near a project site.

---

## 🎯 What It Does

When a citizen walks near a government hospital, road, 
bridge, or any public project — their phone automatically 
shows a notification with details about that project.

- What was built
- How much it cost
- When it was completed
- Who is responsible

No searching. No app interaction. Just walk near it.

---

## 📱 Current Status

We have built a working mobile app where:

- App detects when user enters a project zone
- Backend fetches that project's data from database
- Push notification is sent to the user's phone
- Admin can add and manage projects inside the app

---

## 🔒 Admin Panel

Admin section is built inside the app itself.

- Add new government projects
- Draw geo-fence boundaries on map
- Edit project details anytime
- When project is updated — notification resets 
  automatically for all users

---

## 🚀 Future Plan

Currently works as a standalone app.

Next step — integrate as an extension inside 
existing government apps like Aarogya Setu and UMANG
so their existing 500M+ users get this feature 
without downloading anything new.

Any government app can connect using one API call:
```
GET /api/v1/nearby-projects?lat=21.25&lng=81.63&lang=hi
```

---

## ⚡ Key Highlights

- Max 3 notifications per location per user
- Resets only when government updates the project
- Works on Android, iOS, WhatsApp, and SMS
- GPS location is never stored — privacy safe
- Notification reaches screen in under 650ms

---

## 🛠️ Tech Stack

- Mobile — React Native
- Backend — Node.js + Express
- Database — MongoDB Atlas
- Cache — Redis
- Notifications — Firebase FCM + APNs
- Cloud — AWS

---

## 🚀 How to Run

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

### Test API
```bash
curl http://localhost:3000/

curl "http://localhost:3000/api/v1/nearby-projects
      ?lat=21.2514&lng=81.6296&lang=hi"

curl -X POST http://localhost:3000/api/fence-entry \
  -H "Content-Type: application/json" \
  -d '{"fenceId":"fence-001","deviceId":"test-001"}'
```

---

## 👥 Team
Hustlers

## 🏆 Built For
India Innovates

## 📽️ Demo
https://geosanket.vercel.app/
