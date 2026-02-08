# Smart Hostel Food Management System (HFMS)

## 1. System Architecture
The system follows a **Three-Tier Architecture**:
1.  **Presentation Layer (Frontend)**: built with **Next.js (React)** and **Tailwind CSS**. It handles user interaction, displays menus, charts, and forms.
2.  **Application Layer (Backend)**: built with **Node.js** and **Express**. It handles API requests, authentication (JWT), business logic, and communicates with the AI service.
3.  **Data Layer (Database)**: **MongoDB** stores all user data, menus, ratings, and logs.

**Flow**:
User -> Next.js Client -> REST API (Express) -> Controller Logic -> MongoDB -> Response

**AI Integration**:
A separate Python script or Node.js process runs periodically or on-demand to process ratings and generate menu predictions/sentiment analysis.

---

## 2. Folder Structure

```
/HMS
│
├── /client                 # Frontend (Next.js)
│   ├── /components         # Reusable UI components (Navbar, Layout, Charts)
│   ├── /pages              # Routes (admin/dashboard, student/menu)
│   ├── /styles             # Global styles (Tailwind)
│   ├── /public             # Static assets
│   └── package.json
│
├── /server                 # Backend (Node/Express)
│   ├── /controllers        # Logic for routes
│   ├── /models             # Mongoose Schemas (User, Menu, Meal, etc.)
│   ├── /routes             # API Endpoints
│   ├── /middleware         # Auth, Error handling
│   ├── /utils              # Helpers (AI integration, Email)
│   └── server.js           # Entry point
│
├── /ai_engine              # AI Logic
│   ├── predictor.py        # Python script for menu prediction
│   ├── sentiment.py        # Sentiment analysis logic
│   └── requirements.txt
│
└── README.md
```

---

## 3. Database Schema Design (MongoDB)

### Users
- `_id`, `name`, `email`, `password` (hashed), `role` (admin/student), `rollNumber` (student only), `profilePic`

### Menus
- `_id`, `date`, `dayOfWeek`, `meals` { `breakfast`: [MealID], `lunch`: [MealID], `dinner`: [MealID] }

### Meals
- `_id`, `name`, `category` (veg/non-veg), `image`, `nutritionalInfo`, `avgRating`

### Ratings
- `_id`, `userId`, `mealId`, `rating` (1-5), `review`, `timestamp`, `foodWasteDetails`

### Votes
- `_id`, `userId`, `suggestedDish`, `voteCount`, `weekStartDate`

### Attendance
- `_id`, `userId`, `date`, `status` (present/absent/leave), `mealType`

### Complaints
- `_id`, `userId`, `subject`, `description`, `status` (open/resolved), `image`

---

## 4. REST API Routes

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Menu
- `GET /api/menu/today`
- `GET /api/menu/weekly`
- `POST /api/menu` (Admin)

### Meals
- `GET /api/meals`
- `POST /api/meals` (Admin)
- `POST /api/meals/:id/rate` (Student - formatted time window check here)

### Analytics
- `GET /api/analytics/ratings`
- `GET /api/analytics/waste`
- `GET /api/analytics/predictions` (Calls AI)

---

## 6. Frontend Pages (Next.js)

The frontend is located in `/client`. Key directories:
- `/pages`: Contains routes for `admin` and `student` dashboards.
- `/components`: Reusable UI components.
- `/styles`: Global styles using Tailwind CSS.

### Key Pages:
- `pages/index.js`: Landing page.
- `pages/login.js`: Authentication page.
- `pages/admin/dashboard.js`: Shows Chart.js analytics for ratings and waste.
- `pages/student/dashboard.js`: Allows students to view menus and rate meals.

## 7. Chart.js Integration

We use `react-chartjs-2` in the Admin Dashboard.
- **Line Chart**: Tracks daily ratings.
- **Bar Chart**: Tracks daily food waste in kg.

## 8. AI Logic (Python)

Located in `/ai_engine`.
Run `python predictor.py <category>` to get a recommendation based on past ratings.
The Node server can spawn a child process to call this script:

```javascript
const { spawn } = require('child_process');
const python = spawn('python', ['../ai_engine/predictor.py', 'Breakfast']);
python.stdout.on('data', (data) => {
  console.log('Prediction:', data.toString());
});
```

## 9. Sentiment Analysis (Node.js)

Located in `/server/utils/sentiment.js`.
Uses the `sentiment` library to analyze student comments and tag them as Positive, Negative, or Neutral automatically.

## 10. Deployment Steps

### Backend (Node/Express)
1.  Push code to GitHub.
2.  Create a project on **Render** or **Railway**.
3.  Connect your repo.
4.  Set environment variables (`MONGO_URI`, `JWT_SECRET`).
5.  Deploy.

### Frontend (Next.js)
1.  Push code to GitHub.
2.  Create a project on **Vercel**.
3.  Connect your repo.
4.  Set build command: `npm run build`.
5.  Set environment variable `NEXT_PUBLIC_API_URL` to your backend URL.
6.  Deploy.

### Database (MongoDB)
1.  Create a free cluster on **MongoDB Atlas**.
2.  Whitelist `0.0.0.0/0` (or specific IPs).
3.  Get connection string and use in backend `.env`.

---
**Run Locally:**
1.  **Backend**: `cd server && npm install && npm start`
2.  **Frontend**: `cd client && npm install && npm run dev`
3.  **AI**: `cd ai_engine && pip install -r requirements.txt`
