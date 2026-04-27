# Scholarship Finder

A smart web platform that helps students discover scholarships they are eligible for based on their profile, education level, marks, income category, location, and interests.

## Project Structure

```
scholarship-finder/
├── package.json          # Node.js dependencies and scripts
├── server.js             # Express backend API & mock database
├── README.md             # Documentation
└── public/               # Frontend Assets (HTML, CSS, JS)
    ├── css/
    │   └── style.css     # UI Design styling
    ├── index.html        # Landing Page
    ├── profile.html      # Student Profile / Search Form
    ├── results.html      # Scholarship Match Results
    ├── details.html      # Detailed view of a scholarship
    ├── dashboard.html    # Student dashboard (Saved scholarships)
    └── admin.html        # Admin panel to manage scholarships
```

## Features Complete
1. **Frontend**: Clean, modern, beginner-friendly UI using HTML/CSS/JS.
2. **Backend**: Node.js & Express API.
3. **Database**: Mock in-memory DB in `server.js` (Easily swappable with MongoDB).
4. **Matching Logic**: Dynamic filtering based on Marks, Income, Education Level, and Category. Ranks by highest amount.
5. **Dashboard**: Session-based (mocked via localStorage) saving of scholarships.
6. **Admin Panel**: Add and delete scholarships dynamically.

## Setup Guide

**Prerequisites:** Node.js installed on your machine.

1. Open a terminal in the project directory (`scholarship-finder/`).
2. Run `npm install` to install dependencies (Express, CORS).
3. Run `npm run dev` (if nodemon is installed) or `npm start`.
4. The server will start on `http://localhost:3000`.
5. Open your browser and go to `http://localhost:3000` to view the app!

## Deployment Guide

To host this project live:

1. **GitHub**: Push your code to a GitHub repository.
2. **Render or Vercel or Heroku**:
   - Create an account on Render (render.com).
   - Create a new "Web Service".
   - Connect your GitHub repo.
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Render will provide you with a live URL (e.g., `https://scholarship-finder.onrender.com`).

## Future Improvements & Optional AI
- **Real Database**: Replace the in-memory array in `server.js` with Firebase Firestore or MongoDB (Mongoose).
- **Authentication**: Add JWT-based user login instead of passing userIds via frontend storage.
- **AI Integration**: Use Google Gemini API to analyze a student's inputted "Interests" paragraph and suggest niche, unconventional scholarships.
- **Email Alerts**: Add `nodemailer` to send automated emails when a saved scholarship deadline is approaching.
