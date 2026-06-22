import React from 'react';

/**
 * Spinner Component
 * Displays a simple, clean CSS-based loading spinner.
 */
const Spinner = ({ message = 'Loading dishes...' }) => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p className="spinner-message">{message}</p>
    </div>
  );
};

export default Spinner;
