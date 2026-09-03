# 🏠 StayWise

**StayWise** is a full-stack hostel and PG discovery platform designed to help students find, compare, and choose suitable accommodations based on their preferences.

It provides a centralized platform for exploring properties, comparing options, managing favorites, viewing detailed property information, and getting personalized recommendations.

---

## ✨ Features

* 🔐 **Authentication** — Secure user registration and login with protected routes.
* 🔎 **Hostel & PG Discovery** — Browse and explore available accommodation options.
* 🏠 **Property Details** — View detailed information about individual hostels and PGs.
* ⚖️ **Property Comparison** — Compare multiple accommodations side-by-side.
* ❤️ **Favorites** — Save preferred properties for quick access.
* 🎯 **Preference-Based Recommendations** — Get personalized accommodation recommendations based on user preferences.
* 📍 **Location-Aware Search** — Find accommodations based on location and proximity.
* ⭐ **Reviews & Ratings** — Add and view property reviews with structured ratings.
* 🏢 **List a Property** — Allow property owners to list their accommodation.
* 🤖 **AI Insights** — Generate useful insights from accommodation-related data.

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* React Router
* Axios
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* REST APIs

### Development

* JavaScript
* Git & GitHub

---

## 🏗️ Project Structure

```text
StayWise/
├── client/                     # React frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── utils/
│
├── server/                     # Express backend
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── scripts/
│       └── utils/
│
└── .gitignore
```

---

## 🎯 Recommendation System

StayWise includes a preference-based recommendation workflow that helps users discover accommodations matching their requirements.

```text
User Preferences
       ↓
Preference Processing
       ↓
Accommodation Data
       ↓
Matching / Scoring
       ↓
Personalized Recommendations
```

This allows users to make decisions based on multiple accommodation criteria rather than relying only on basic listing searches.

---

## 🤖 AI Insights

StayWise also includes an **AI Insights** component for generating useful insights related to accommodation data.

The AI functionality is integrated into the application through the backend service layer, keeping the feature modular and separate from the core property-management logic.

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Abhinav1jha/StayWise.git
cd StayWise
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file using `.env.example` and configure the required environment variables.

Start the server:

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create the required `.env` file inside the `server` directory using the provided `.env.example`.

Configure your database connection, authentication secrets, and other required service credentials.

> Never commit your actual `.env` file or secret keys to GitHub.

---

## 🚀 Future Improvements

* Advanced search and multi-criteria filtering
* Improved recommendation scoring
* Real-time availability updates
* Booking and reservation management
* More advanced AI-powered accommodation insights
* Notifications and alerts
* Map-based property discovery

---

## 👨‍💻 Author

**Abhinav Anand**

[GitHub](https://github.com/Abhinav1jha)

---

⭐ If you find StayWise useful, consider giving the repository a star.
