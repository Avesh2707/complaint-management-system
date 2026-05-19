# 🤖 AI-Based Smart Complaint Management System

A full-stack MERN application with AI-powered complaint analysis, built for the ESE Examination — AI Driven Full Stack Development (AI308B).

---

## 📋 Features

- ✅ **Complaint Registration** — Name, Email, Title, Description, Category, Location
- ✅ **Complaint Tracking** — Filter by category, search by location, view all
- ✅ **AI Analysis** — Priority detection, department routing, summary, auto-response (via OpenRouter)
- ✅ **JWT Authentication** — Secure login/register with bcrypt password hashing
- ✅ **Admin Role** — Status updates, delete any complaint
- ✅ **MERN Stack** — MongoDB, Express.js, React (Vite), Node.js
- ✅ **Deployed on Render**

---

## 🏗️ Project Structure

```
complaint-management-system/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Register, Login, Profile
│   │   ├── complaintController.js # CRUD operations
│   │   └── aiController.js    # OpenRouter AI integration
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT protection
│   │   └── errorHandler.js   # Global error handler
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Complaint.js       # Complaint schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   └── aiRoutes.js
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js              # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js       # Axios instance with auth
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ComplaintCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global auth state
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ComplaintForm.jsx
│   │   │   ├── ComplaintList.jsx
│   │   │   └── ComplaintDetail.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
└── README.md
```

---

## ⚡ Quick Start (Local Setup)

### Prerequisites
- Node.js v18+ installed
- MongoDB Atlas account (free tier)
- Git installed

### Step 1: Clone / Extract the Project
```bash
# If using zip
unzip complaint-management-system.zip
cd complaint-management-system
```

### Step 2: MongoDB Atlas Setup
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Go to **Database Access** → Add user → save username/password
4. Go to **Network Access** → Add IP → Allow from anywhere (0.0.0.0/0)
5. Go to **Databases** → Connect → Connect your application → Copy connection string
   Example: `mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/complaintDB`

### Step 3: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Edit the .env file with your MongoDB URI
# Open backend/.env and update MONGO_URI line:
# MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/complaintDB

# Start backend server
npm run dev
# Server runs on http://localhost:5000
```

### Step 4: Frontend Setup
```bash
# Open a NEW terminal
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
# App runs on http://localhost:5173
```

### Step 5: Open in Browser
Visit **http://localhost:5173** → Register → Login → File Complaint → Run AI Analysis!

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/profile` | Get profile | Private |
| POST | `/api/complaints` | Add complaint | Private |
| GET | `/api/complaints` | Get all complaints | Private |
| GET | `/api/complaints/:id` | Get complaint by ID | Private |
| PUT | `/api/complaints/:id` | Update status | Admin |
| DELETE | `/api/complaints/:id` | Delete complaint | Private |
| GET | `/api/complaints/search?location=X` | Search by location | Private |
| POST | `/api/ai/analyze` | Analyze saved complaint | Private |
| POST | `/api/ai/quick-analyze` | Quick AI analysis | Private |

---

## 🚀 Deployment on Render

### Backend Deployment
1. Push code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `MONGO_URI` = your Atlas URI
   - `JWT_SECRET` = `ComplaintSys@SecretKey#2025`
   - `OPENROUTER_API_KEY` = `your_openrouter_api_key`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = your Render frontend URL (add after deploying frontend)
6. Deploy → copy the backend URL (e.g. `https://complaint-api.onrender.com`)

### Frontend Deployment
1. Go to Render → New → Static Site
2. Connect same repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://complaint-api.onrender.com/api`
5. Deploy → copy the frontend URL

---

## 🔐 Authentication

- **JWT tokens** stored in localStorage
- **bcrypt** with 10 salt rounds for password hashing
- Protected routes redirect to `/login` if unauthenticated
- Admin users can update complaint status

### Make a user admin (via MongoDB Atlas)
1. Go to your Atlas cluster → Browse Collections
2. Find the `users` collection
3. Find your user document → Edit → change `"role": "user"` to `"role": "admin"`

---

## 🤖 AI Integration (OpenRouter)

Using **Mistral 7B Instruct** via OpenRouter API.

AI analyzes:
- **Priority**: High / Medium / Low (based on urgency)
- **Department**: Specific government department (e.g., Jal Board, PVVNL)
- **Summary**: 2-3 sentence concise summary
- **Auto Response**: Professional citizen response message

### Test Cases (from exam paper)
| Complaint Type | Expected AI Output |
|---|---|
| Water Leakage | Jal Board - Water Supply Department |
| Electricity Issue | High Priority, PVVNL - Electricity Dept |
| Garbage Complaint | Municipal Corporation - Sanitation Dept |
| Long complaint text | AI-generated summary |

---

## 🧪 Postman Testing

Import and test these requests:

### Register User
```
POST http://localhost:5000/api/auth/register
Body: { "name": "Rahul Kumar", "email": "rahul@gmail.com", "password": "123456" }
```

### Login
```
POST http://localhost:5000/api/auth/login
Body: { "email": "rahul@gmail.com", "password": "123456" }
→ Copy the "token" from response
```

### Add Complaint (set Authorization: Bearer <token>)
```
POST http://localhost:5000/api/complaints
Body: {
  "name": "Rahul Kumar",
  "email": "rahul@gmail.com",
  "title": "Water Leakage Issue",
  "description": "Water pipeline is severely damaged near the main market area causing flooding on the road and water wastage.",
  "category": "Water Supply",
  "location": "Ghaziabad"
}
```

### Run AI Analysis
```
POST http://localhost:5000/api/ai/analyze
Body: { "complaintId": "<complaint _id from above>" }
```

---

## 👨‍💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| AI | OpenRouter API (Mistral 7B) |
| Deployment | Render (Backend + Frontend) |
| HTTP Client | Axios |
| State | React Context API |
| Notifications | react-hot-toast |

---


