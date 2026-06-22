import React from 'react';

/**
 * DishCard Component
 * Displays individual dish information and a button to toggle its publication status.
 * Keep it simple and readable for easy explanation in interviews.
 */
const DishCard = ({ dish, onToggle, isToggling }) => {
  const { dishId, dishName, imageUrl, isPublished } = dish;

  return (
    <div className="dish-card">
      <div className="dish-image-container">
        <img 
          src={imageUrl} 
          alt={dishName} 
          className="dish-image"
          onError={(e) => {
            // Fallback placeholder image if the original URL fails to load
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
          }}
        />
      </div>
      
      <div className="dish-info">
        <h3 className="dish-name">{dishName}</h3>
        <p className="dish-id">
          <strong>Dish ID:</strong> {dishId}
        </p>
        
        <div className="dish-status-container">
          <strong>Status:</strong>{' '}
          <span className={`status-badge ${isPublished ? 'published' : 'unpublished'}`}>
            {isPublished ? 'Published' : 'Unpublished'}
          </span>
        </div>
      </div>

      <div className="dish-actions">
        <button 
          onClick={() => onToggle(dish)} 
          className={`toggle-btn ${isPublished ? 'btn-unpublish' : 'btn-publish'}`}
          disabled={isToggling}
        >
          {isToggling ? 'Updating...' : 'Toggle Status'}
        </button>
      </div>
    </div>
  );
};

export default DishCard;
