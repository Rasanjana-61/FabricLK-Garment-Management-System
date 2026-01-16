const Salary = require('../models/salaryModel');
const Employee = require('../models/employee.model');

exports.createSalary = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      role,
      department,
      basicSalary,
      allowances,
      deductions,
      paymentDate,
      otHours,
      otRate,
      epfRate,
      etfRate
    } = req.body;

    // If employeeId was sent, fetch employee and snapshot fields
    let snapName = employeeName;
    let snapRole = role;
    let snapDept = department || '';

    if (employeeId) {
      const emp = await Employee.findById(employeeId).lean();
      if (!emp) {
        return res.status(400).json({ success: false, message: 'Invalid employee selected' });
      }
      snapName = emp.name;
      snapRole = emp.position;
      snapDept = emp.department || '';
    }

    // Validate minimum required snapshot fields
    if (!snapName || !snapRole) {
      return res.status(400).json({
        success: false,
        message: 'Employee name and role are required (select employee or provide both fields).'
      });
    }

    // Parse numbers safely
    const b = parseFloat(basicSalary);
    if (isNaN(b) || b <= 0) {
      return res.status(400).json({ success: false, message: 'Basic salary must be a positive number' });
    }

    const a = parseFloat(allowances) || 0;
    const d = parseFloat(deductions) || 0;
    const otH = parseFloat(otHours) || 0;
    const otR = parseFloat(otRate) || 1.5;
    const epfR = parseFloat(epfRate) || 8;
    const etfR = parseFloat(etfRate) || 3;

    if (!paymentDate) {
      return res.status(400).json({ success: false, message: 'Payment date is required' });
    }

    const hourlyRate = b / 160;
    const otPay = otH * hourlyRate * otR;
    const epfDeduction = (b + otPay) * (epfR / 100);
    const etfDeduction = (b + otPay) * (etfR / 100);
    const netSalary = b + otPay + a - (d + epfDeduction + etfDeduction);

    const salary = new Salary({
      employeeId: employeeId || undefined,
      employeeName: snapName,
      role: snapRole,
      department: snapDept,

      basicSalary: b,
      allowances: a,
      deductions: d,

      otHours: otH,
      otRate: otR,
      otPay,

      epfRate: epfR,
      epfDeduction,

      etfRate: etfR,
      etfDeduction,

      netSalary: netSalary > 0 ? netSalary : 0,
      paymentDate,
      status: 'Pending',
      createdBy: req.user._id,
    });

    await salary.save();
    res.status(201).json({ success: true, message: "Salary created successfully", data: salary });
  } catch (error) {
    console.error("Error creating salary:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getAllSalaries = async (req, res) => {
  try {
    const { month, year, status } = req.query;
    const filter = { createdBy: req.user._id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      filter.paymentDate = { $gte: startDate, $lte: endDate };
    }

    if (status) filter.status = status;

    const salaries = await Salary.find(filter)
      .sort({ paymentDate: -1 })
      .populate({ path: 'employeeId', select: 'employeeID name position department' });

    res.status(200).json({ success: true, data: salaries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getSalary = async (req, res) => {
  try {
    const salary = await Salary.findOne({ _id: req.params.id, createdBy: req.user._id })
      .populate({ path: 'employeeId', select: 'employeeID name position department' });
    if (!salary) return res.status(404).json({ success: false, message: "Salary record not found" });
    res.status(200).json({ success: true, data: salary });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.updateSalaryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Paid"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const salary = await Salary.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!salary) return res.status(404).json({ success: false, message: "Salary record not found" });

    res.status(200).json({ success: true, message: `Salary status updated to ${status}`, data: salary });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.updateSalary = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      role,
      department,
      basicSalary,
      allowances,
      deductions,
      paymentDate,
      otHours,
      otRate,
      epfRate,
      etfRate
    } = req.body;

    // Find the existing salary record
    const existingSalary = await Salary.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!existingSalary) {
      return res.status(404).json({ success: false, message: "Salary record not found" });
    }

    // Check if salary is already paid - if so, don't allow editing
    if (existingSalary.status === "Paid") {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot edit a salary that has already been paid" 
      });
    }

    // If employeeId was sent, fetch employee and snapshot fields
    let snapName = employeeName;
    let snapRole = role;
    let snapDept = department || '';

    if (employeeId) {
      const emp = await Employee.findById(employeeId).lean();
      if (!emp) {
        return res.status(400).json({ success: false, message: 'Invalid employee selected' });
      }
      snapName = emp.name;
      snapRole = emp.position;
      snapDept = emp.department || '';
    }

    // Validate minimum required snapshot fields
    if (!snapName || !snapRole) {
      return res.status(400).json({
        success: false,
        message: 'Employee name and role are required (select employee or provide both fields).'
      });
    }

    // Parse numbers safely
    const b = parseFloat(basicSalary);
    if (isNaN(b) || b <= 0) {
      return res.status(400).json({ success: false, message: 'Basic salary must be a positive number' });
    }

    const a = parseFloat(allowances) || 0;
    const d = parseFloat(deductions) || 0;
    const otH = parseFloat(otHours) || 0;
    const otR = parseFloat(otRate) || 1.5;
    const epfR = parseFloat(epfRate) || 8;
    const etfR = parseFloat(etfRate) || 3;

    if (!paymentDate) {
      return res.status(400).json({ success: false, message: 'Payment date is required' });
    }

    // Calculate salary components
    const hourlyRate = b / 160;
    const otPay = otH * hourlyRate * otR;
    const epfDeduction = (b + otPay) * (epfR / 100);
    const etfDeduction = (b + otPay) * (etfR / 100);
    const netSalary = b + otPay + a - (d + epfDeduction + etfDeduction);

    // Update the salary record
    const updatedSalary = await Salary.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      {
        employeeId: employeeId || undefined,
        employeeName: snapName,
        role: snapRole,
        department: snapDept,

        basicSalary: b,
        allowances: a,
        deductions: d,

        otHours: otH,
        otRate: otR,
        otPay,

        epfRate: epfR,
        epfDeduction,

        etfRate: etfR,
        etfDeduction,

        netSalary: netSalary > 0 ? netSalary : 0,
        paymentDate,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      success: true, 
      message: "Salary updated successfully", 
      data: updatedSalary 
    });
  } catch (error) {
    console.error("Error updating salary:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

exports.deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!salary) return res.status(404).json({ success: false, message: "Salary record not found" });
    res.status(200).json({ success: true, message: "Salary record deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getSalarySummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    const matchStage = { createdBy: req.user._id };

    if (year) {
      matchStage.paymentDate = { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) };
    }
    if (month && year) {
      matchStage.paymentDate = { $gte: new Date(`${year}-${month}-01`), $lte: new Date(`${year}-${month}-31`) };
    }

    const summary = await Salary.aggregate([
      { $match: matchStage },
      { $group: { _id: "$role", totalSalary: { $sum: "$netSalary" }, count: { $sum: 1 } } },
      { $sort: { totalSalary: -1 } },
    ]);

    const totalSalaries = await Salary.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: "$netSalary" } } },
    ]);

    res.status(200).json({
      success: true,
      data: { byRole: summary, total: totalSalaries[0]?.total || 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};