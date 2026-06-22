const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');

router.get('/', dishController.getAllDishes);
router.patch('/:id/toggle', dishController.toggleDishStatus);

module.exports = router;
