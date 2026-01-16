


// backend/routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { protect } = require('../middleware/authMiddleware'); // use friend's middleware

// Create employee (authenticated users)
router.post('/add', protect, employeeController.addEmployee);

// List employees added by the logged-in user (authenticated users)
router.get('/list', protect, employeeController.getEmployees);

// Update employee (authenticated users)
router.put('/update/:id', protect, employeeController.updateEmployee);

// Get all employees (authenticated users)
router.get('/all', protect, employeeController.getAllEmployees);

// Delete employee (authenticated users)
router.delete('/delete/:id', protect, employeeController.deleteEmployee);

// Aggregation: counts by department (authenticated users)
router.get('/department-counts', protect, employeeController.getEmployeeCountsByDepartment);

module.exports = router;