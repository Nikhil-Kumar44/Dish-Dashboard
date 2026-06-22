# Dish Management Dashboard

A full-stack web application designed for managing dish publication statuses. It features a clean, responsive layout with a minimal design, robust REST APIs, MongoDB database persistence, and real-time updates across multiple open clients using Socket.io.

This project was built to look like a practical, structured, and easy-to-explain engineering student project (perfect for presentations or vivas).

---

## Tech Stack

- **Frontend**: React.js, Vite, Vanilla CSS (clean, responsive grid structure, minimal color palette, white background)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB via Mongoose Object Modeling
- **Real-Time Synchronisation**: Socket.io (WebSockets)

---

## Features

1. **Clean Responsive UI**: Grid of dish cards presenting the image, name, unique Dish ID, and a green/red status badge for "Published" vs "Unpublished".
2. **Immediate Toggle Action**: Toggling a status updates the UI immediately (optimistic UI update). If the database write fails, the UI gracefully rolls back to its original state.
3. **Real-time Synchronisation**: Uses WebSockets via Socket.io. When any client changes a dish's status, the server updates MongoDB and automatically broadcasts a `dishStatusUpdated` event to all other active clients, updating their dashboards without manual page reloads.
4. **Loading & Error Handling**: Custom CSS spinner during initial data fetch and custom error modal if the backend is offline, including a "Retry" button.
5. **Database Seeding**: Easily seed the database with sample menu dishes and high-quality image URLs.

---

## Project Structure

```text
Dish Dashboard/
├── backend/
│   ├── controllers/
│   │   └── dishController.js    # Express route logic (database writes + Socket.io emissions)
│   ├── models/
│   │   └── Dish.js              # Mongoose schema for the Dish collection
│   ├── routes/
│   │   └── dishRoutes.js        # REST API endpoints mapping
│   ├── .env                     # Local environment variables
│   ├── .env.example             # Example configuration template
│   ├── package.json             # Backend dependencies & running scripts
│   ├── seed.js                  # Database seed script for test data
│   └── server.js                # Core entry point (Express, Socket.io, Mongoose connection)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DishCard.jsx     # Card component displaying individual dish details
│   │   │   └── Spinner.jsx      # Clean CSS loading spinner
│   │   ├── App.jsx              # Main App wrapper (handles states, socket connection, effects)
│   │   ├── App.css              # Custom styling for dashboard, layout, and components
│   │   ├── index.css            # Base fonts, design tokens, and CSS variables
│   │   └── main.jsx             # React DOM root render
│   ├── package.json             # Frontend Vite configuration and dependencies
│   ├── vite.config.js           # Vite dev configuration
│   └── index.html               # Standard HTML template
└── README.md                    # Setup and project documentation (this file)
```

---

## Setup & Running Instructions

### Prerequisites
- **Node.js** (v16.x or higher installed)
- **MongoDB** (running locally on `mongodb://127.0.0.1:27017` or a remote MongoDB Atlas connection string)

---

### Step 1: Set Up and Run the Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables:
   - Create a copy of `.env.example` named `.env`
   - Review its contents (defaults to port `5000` and `mongodb://127.0.0.1:27017/dish_dashboard`)
4. Seed the database with sample dishes:
   ```bash
   npm run seed
   ```
5. Start the backend development server (runs via `nodemon` for auto-reloading):
   ```bash
   npm run dev
   ```

---

### Step 2: Set Up and Run the Frontend

1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Click on the URL printed in the terminal (usually `http://localhost:5173`) to view the dashboard in your browser.

---

## Testing Real-Time Updates

To verify Socket.io functionality:
1. Open **two separate browser windows** side-by-side (both pointing to `http://localhost:5173`).
2. Click the **Toggle Status** button on any dish card in the first window.
3. Observe how the status badge color and text change in the second window **immediately and automatically**, without you having to click refresh!

---

## Interview / Viva Questions (Student Guide)

Here are typical questions an examiner might ask during an engineering project presentation, and how to answer them using this codebase:

### 1. How does the real-time feature work?
**Answer**: "We integrated Socket.io on both the backend and frontend. When a user clicks 'Toggle Status', it triggers a REST API request to the backend. The backend updates the document in MongoDB. Once the update is successful, the controller uses `req.io.emit('dishStatusUpdated', updatedDish)` to broadcast the change. The frontend, which established a socket connection inside a React `useEffect` hook, listens for this event. When it hears the `dishStatusUpdated` event, it updates its local `dishes` state, causing React to automatically re-render the card with the updated status badge."

### 2. What is "Optimistic UI Updating" and why did you use it?
**Answer**: "Optimistic UI updating is a technique where the frontend state is updated immediately when the user interacts with the UI, assuming that the backend request will succeed. In `App.jsx`, when the user toggles a dish status, we immediately toggle `isPublished` in React state and then make the API call in the background. This makes the interface feel fast and responsive. If the API fails, we catch the error, alert the user, and rollback the React state to the original version."

### 3. Why did you use Mongoose instead of the native MongoDB driver?
**Answer**: "Mongoose provides a schema-based solution to model our application data. It enforces structure (like ensuring `dishId` is unique and required) at the application layer, supports validation, and simplifies queries using helper methods like `findOne` and `save`."

### 4. How did you structure your backend?
**Answer**: "We followed the MVC (Model-View-Controller) design pattern. We separated the database structure into the `models/` directory, the route endpoints into the `routes/` directory, and the business logic/socket emissions into the `controllers/` directory, with `server.js` orchestrating the application startup."
