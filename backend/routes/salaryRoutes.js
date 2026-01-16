const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");
const { validateSalary } = require("../middleware/validation");

// Protected at index.js with `protect`
router.post("/", validateSalary, salaryController.createSalary);
router.get("/", salaryController.getAllSalaries);
router.get("/summary", salaryController.getSalarySummary);
router.get("/:id", salaryController.getSalary);
router.put("/:id/status", salaryController.updateSalaryStatus);
router.put("/:id", validateSalary, salaryController.updateSalary);
router.delete("/:id", salaryController.deleteSalary);

module.exports = router;