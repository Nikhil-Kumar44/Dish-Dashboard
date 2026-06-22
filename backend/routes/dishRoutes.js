const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');

// Route to get all dishes
// Endpoint: GET /api/dishes
router.get('/', dishController.getAllDishes);

// Route to toggle a dish status
// Endpoint: PATCH /api/dishes/:id/toggle
router.patch('/:id/toggle', dishController.toggleDishStatus);

module.exports = router;
