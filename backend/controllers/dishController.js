const mongoose = require('mongoose');
const Dish = require('../models/Dish');

exports.getAllDishes = async (req, res) => {
  try {
    const dishes = await Dish.find().sort({ dishId: 1 });
    res.status(200).json(dishes);
  } catch (error) {
    console.error('Error fetching dishes:', error);
    res.status(500).json({ message: 'Server error: Failed to fetch dishes.' });
  }
};

exports.toggleDishStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
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

    dish.isPublished = !dish.isPublished;
    await dish.save();

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
