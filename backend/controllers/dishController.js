const mongoose = require('mongoose');
const Dish = require('../models/Dish');

// GET /api/dishes
// Fetch all dishes from the database
exports.getAllDishes = async (req, res) => {
  try {
    // Retrieve all dishes and sort them so they appear in a consistent order
    const dishes = await Dish.find().sort({ dishId: 1 });
    res.status(200).json(dishes);
  } catch (error) {
    console.error('Error fetching dishes:', error);
    res.status(500).json({ message: 'Server error: Failed to fetch dishes.' });
  }
};

// PATCH /api/dishes/:id/toggle
// Toggle the isPublished value of a dish and notify all clients via Socket.io
exports.toggleDishStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Support querying by both MongoDB ObjectId and the custom dishId string
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { dishId: id };
    }

    const dish = await Dish.findOne(query);

    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    // Toggle the published status
    dish.isPublished = !dish.isPublished;
    await dish.save();

    // Emit the real-time update event to all connected Socket.io clients
    // The 'io' instance is attached to the request object in server.js
    if (req.io) {
      req.io.emit('dishStatusUpdated', dish);
      console.log(`Socket.io: Emitted status change for dish ${dish.dishId} (${dish.isPublished})`);
    } else {
      console.warn('Socket.io instance not found on request, real-time update not emitted');
    }

    res.status(200).json(dish);
  } catch (error) {
    console.error('Error toggling dish status:', error);
    res.status(500).json({ message: 'Server error: Failed to toggle status.' });
  }
};
