const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  dishId: {
    type: String,
    required: [true, 'Dish ID is required'],
    unique: true,
    trim: true
  },
  dishName: {
    type: String,
    required: [true, 'Dish name is required'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  isPublished: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Dish', dishSchema);
