🎬 Movie Ticket Booking System – Frontend (React + Vite)

This is the frontend application for the Movie Ticket Booking System. Built using React, Vite, Axios, and TailwindCSS, it provides a smooth and user‑friendly interface for browsing movies, selecting showtimes, choosing seats, and booking tickets.

🚀 Live Frontend URL

Live App: https://movie-frontend-tawny-theta.vercel.app/

Backend API Used:
https://movie-backend-production-799d.up.railway.app/api

🏗️ Tech Stack

React + Vite

Axios (API calls)

React Router DOM (routing)

Tailwind CSS (UI styling)

JWT Authentication handling

Vercel Deployment

✨ Features

👤 User Features

Login / Register using JWT

Browse list of movies

View movie details & showtimes

Select date, time, and theater

Choose seats (live availability)

Book tickets

View booking confirmation

View booking history

🛠 Admin Features (If UI implemented)

Add / update / delete movies

Manage shows & theaters

📁 Folder Structure

src/
 ├── components/        # Reusable UI components
 ├── pages/             # Page screens (Home, Login, Booking, etc.)
 ├── services/          # API services using Axios
 ├── hooks/             # Custom hooks
 ├── context/           # Auth context (if implemented)
 ├── App.jsx            # Root component
 └── main.jsx           # Entry point

⚙️ Environment Setup

1️⃣ Clone the repository

git clone <your-frontend-repo-url>
cd frontend

2️⃣ Install dependencies

npm install

3️⃣ Create .env file

Create a file named .env in the root directory:

VITE_API_BASE_URL=https://movie-backend-production-799d.up.railway.app/api

4️⃣ Start development server

npm run dev

The app runs on:
👉 http://localhost:5173

🔗 API Integration

API communication is done through Axios using:

VITE_API_BASE_URL

Example service:

axios.get(`${import.meta.env.VITE_API_BASE_URL}/movies`)

🧩 Available Pages

Login / Signup

Home (Movie List)

Movie Details

Showtime Selection

Seat Selection

Booking Confirmation

User Booking History

🧪 Testing Instructions

You can test using:

Live deployment

Local backend / deployed backend

Use browser developer tools to verify network calls.

🚀 Deployment (Vercel)

Push your code to GitHub

Go to vercel.com → Add New Project

Select your GitHub repo

Add the environment variable:

VITE_API_BASE_URL

Click Deploy

Deployment is instant.

📝 Submission Requirements

GitHub repo containing full frontend code

Frontend hosted on Vercel

Working integration with backend

