const Income = require('../models/incomeModel');

exports.addIncome = async (req, res) => {
  try {
    const { title, amount, date, category, description } = req.body;

    if (!title || !amount || !category || !description || !date) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newIncome = new Income({
      title,
      amount,
      date,
      category,
      description,
      createdBy: req.user._id,
    });

    await newIncome.save();

    res.status(201).json({ success: true, message: "Income added successfully", data: newIncome });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getIncomes = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const filter = { createdBy: req.user._id };

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (category) filter.category = category;

    const incomes = await Income.find(filter).sort({ date: -1 });
    res.status(200).json({ success: true, data: incomes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

//get single income by Id
exports.getIncome = async (req, res) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!income) return res.status(404).json({ success: false, message: "Income not found" });
    res.status(200).json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.updateIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!income) return res.status(404).json({ success: false, message: "Income not found" });
    res.status(200).json({ success: true, message: "Income updated successfully", data: income });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!income) return res.status(404).json({ success: false, message: "Income not found" });
    res.status(200).json({ success: true, message: "Income deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getIncomeSummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    const matchStage = { createdBy: req.user._id };

    if (year) {
      matchStage.date = { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) };
    }
    if (month && year) {
      matchStage.date = { $gte: new Date(`${year}-${month}-01`), $lte: new Date(`${year}-${month}-31`) };
    }

    const summary = await Income.aggregate([
      { $match: matchStage },
      { $group: { _id: "$category", totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { totalAmount: -1 } },
    ]);

    const totalIncomes = await Income.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byCategory: summary,
        total: totalIncomes[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};