// backend/controllers/employee.controller.js
const Employee = require('../models/employee.model');
const Counter = require('../models/counter.model');

exports.addEmployee = async (req, res) => {
  try {
    const { name, position, department, contactNumber, address } = req.body;
    const hrManagerId = req.user._id;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;
    const counter = await Counter.findOneAndUpdate(
      { key },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const number = String(counter.seq).padStart(4, '0');
    const employeeID = `EID-${year}-${month}-${number}`;

    const employee = new Employee({
      employeeID,
      name,
      position,
      department,
      contactNumber,
      address,
      addedByHR: hrManagerId,
    });

    await employee.save();

    res.status(201).json({ message: 'Employee added successfully!', employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const hrManagerId = req.user._id;
    const { search, department } = req.query;

    let filter = { addedByHR: hrManagerId };

    if (department && department !== 'All') {
      filter.department = department;
    }

    if (search) {
      filter.$or = [
        { employeeID: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 }).lean();

    res.json({ employees });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const { search, department } = req.query;
    let filter = {};

    if (department && department !== 'All') {
      filter.department = department;
    }

    if (search) {
      filter.$or = [
        { employeeID: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 }).lean();

    res.json({ employees });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updateData = req.body;

    const employee = await Employee.findByIdAndUpdate(employeeId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const employee = await Employee.findByIdAndDelete(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEmployeeCountsByDepartment = async (req, res) => {
  try {
    const counts = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    res.json({ counts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};