const mongoose = require('mongoose');

// Define the Schema for a Dish
const dishSchema = new mongoose.Schema({
  // Unique identification for the dish (e.g., 'D101')
  dishId: {
    type: String,
    required: [true, 'Dish ID is required'],
    unique: true,
    trim: true
  },
  // Name of the dish
  dishName: {
    type: String,
    required: [true, 'Dish name is required'],
    trim: true
  },
  // URL to the image of the dish
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  // Status of the dish, whether it is published or unpublished
  isPublished: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  // Add createdAt and updatedAt timestamps
  timestamps: true
});

// Create and export the model
module.exports = mongoose.model('Dish', dishSchema);
