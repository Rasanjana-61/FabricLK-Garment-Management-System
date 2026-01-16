const express = require('express');
const router = express.Router();
const { getDrivers, createDriver, updateDriver, deleteDriver } = require('../controllers/driverController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/').get(protect, isAdmin, getDrivers).post(protect, isAdmin, createDriver);
router.route('/:id').put(protect, isAdmin, updateDriver).delete(protect, isAdmin, deleteDriver);

module.exports = router;
