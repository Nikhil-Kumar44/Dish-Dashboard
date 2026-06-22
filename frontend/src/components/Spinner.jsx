import React from 'react';

const Spinner = ({ message = 'Loading dishes...' }) => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p className="spinner-message">{message}</p>
    </div>
  );
};

export default Spinner;
