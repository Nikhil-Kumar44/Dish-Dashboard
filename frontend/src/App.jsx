import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import DishCard from './components/DishCard';
import Spinner from './components/Spinner';
import './App.css';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingIds, setTogglingIds] = useState(new Set());

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
        setError(err.message || 'some error occurred please retry again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  useEffect(() => {
    const socket = io(BACKEND_URL);

    socket.on('dishStatusUpdated', (updatedDish) => {
      setDishes((prevDishes) => {
        const exists = prevDishes.some(
          (dish) => dish._id === updatedDish._id || dish.dishId === updatedDish.dishId
        );

        if (!exists) {
          return [...prevDishes, updatedDish].sort((a, b) => a.dishId.localeCompare(b.dishId));
        }

        return prevDishes.map((dish) => {
          if (dish._id === updatedDish._id || dish.dishId === updatedDish.dishId) {
            return updatedDish;
          }
          return dish;
        });
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleToggleStatus = async (dish) => {
    const idToToggle = dish._id || dish.dishId;

    setTogglingIds((prev) => {
      const next = new Set(prev);
      next.add(idToToggle);
      return next;
    });

    // Optimistic UI update
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
      setDishes(originalDishes);
    } finally {
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
        <p>Dish Dashboard &copy; 2026</p>
      </footer>
    </div>
  );
}

export default App;
