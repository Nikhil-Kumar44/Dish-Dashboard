import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import DishCard from './components/DishCard';
import Spinner from './components/Spinner';
import './App.css';

// Read the backend URL from environment variables, or default to localhost for local development
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Keep track of which dishes are currently toggling to disable their buttons during API requests
  const [togglingIds, setTogglingIds] = useState(new Set());

  // 1. Fetch all dishes on initial load
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${BACKEND_URL}/api/dishes`);
        if (!response.ok) {
          throw new Error(`Failed to fetch dishes (Status: ${response.status})`);
        }
        
        const data = await response.json();
        setDishes(data);
      } catch (err) {
        console.error('Error fetching dishes:', err);
        setError(err.message || 'Could not connect to backend server. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  // 2. Real-Time Updates via Socket.io
  useEffect(() => {
    // Establish connection to Socket.io server
    const socket = io(BACKEND_URL);

    // Event listener for dish status changes from any client or backend update
    socket.on('dishStatusUpdated', (updatedDish) => {
      console.log('Real-time update received:', updatedDish);
      
      setDishes((prevDishes) => {
        // Find if this dish exists in our state
        const exists = prevDishes.some(
          (dish) => dish._id === updatedDish._id || dish.dishId === updatedDish.dishId
        );

        if (!exists) {
          // If it's a new dish not in list, add it
          return [...prevDishes, updatedDish].sort((a, b) => a.dishId.localeCompare(b.dishId));
        }

        // Update the status of the matching dish
        return prevDishes.map((dish) => {
          if (dish._id === updatedDish._id || dish.dishId === updatedDish.dishId) {
            return updatedDish;
          }
          return dish;
        });
      });
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.io server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
    });

    // Cleanup connection on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // 3. Toggle Status of a Dish
  const handleToggleStatus = async (dish) => {
    const idToToggle = dish._id || dish.dishId;

    // Track toggling state for this specific dish ID (for disabling button / showing loader)
    setTogglingIds((prev) => {
      const next = new Set(prev);
      next.add(idToToggle);
      return next;
    });

    // Optimistic UI Update: immediately change the status locally for instantaneous feedback
    const originalDishes = [...dishes];
    setDishes((prevDishes) =>
      prevDishes.map((d) => {
        if (d._id === dish._id || d.dishId === dish.dishId) {
          return { ...d, isPublished: !d.isPublished };
        }
        return d;
      })
    );

    try {
      const response = await fetch(`${BACKEND_URL}/api/dishes/${idToToggle}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to update dish status (Status: ${response.status})`);
      }

      const updatedDish = await response.json();

      // Ensure local state matches exactly what the backend returned
      setDishes((prevDishes) =>
        prevDishes.map((d) => {
          if (d._id === updatedDish._id || d.dishId === updatedDish.dishId) {
            return updatedDish;
          }
          return d;
        })
      );
    } catch (err) {
      console.error('Error toggling dish status:', err);
      alert(`Error updating dish status: ${err.message}. Reverting changes...`);
      // Revert back to the original dishes if the API request fails
      setDishes(originalDishes);
    } finally {
      // Remove from toggling state
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(idToToggle);
        return next;
      });
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Dish Management Dashboard</h1>
      </header>

      <main className="app-content">
        {loading && <Spinner message="Fetching dishes from database..." />}

        {error && (
          <div className="error-container">
            <div className="error-card">
              <span className="error-icon">⚠️</span>
              <h3>Failed to Load Data</h3>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="retry-btn"
              >
                Retry Loading
              </button>
            </div>
          </div>
        )}

        {!loading && !error && dishes.length === 0 && (
          <div className="empty-state">
            <p>No dishes found. Please run the seed script to populate data.</p>
          </div>
        )}

        {!loading && !error && dishes.length > 0 && (
          <div className="dishes-grid">
            {dishes.map((dish) => (
              <DishCard
                key={dish._id || dish.dishId}
                dish={dish}
                onToggle={handleToggleStatus}
                isToggling={togglingIds.has(dish._id || dish.dishId)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Dish Dashboard &copy; 2026 - Student Engineering Project</p>
      </footer>
    </div>
  );
}

export default App;
