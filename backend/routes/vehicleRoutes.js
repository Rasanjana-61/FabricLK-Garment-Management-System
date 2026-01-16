const express = require('express');
const router = express.Router();
const { getVehicles, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/').get(protect, isAdmin, getVehicles).post(protect, isAdmin, createVehicle);
router.route('/:id').put(protect, isAdmin, updateVehicle).delete(protect, isAdmin, deleteVehicle);

module.exports = router;
