require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

// Existing routes from your friend's project
const orderRoutes = require("./routes/orderRoutes");

// Finance models used in summary/KPI endpoints
const Expense = require("./models/expenseModel");
const Income = require("./models/incomeModel");
const Salary = require("./models/salaryModel");

// Finance routers
const expenseRoutes = require("./routes/expenseRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const taxRoutes = require("./routes/taxRoutes");
const productRoutes = require("./routes/productRoutes");

const paymentRoutes = require('./routes/payment');
const supplierSubmissionRoutes = require('./routes/supplierSubmissionRoutes')


// Auth protect
const { protect } = require("./middleware/authMiddleware");

// Initialize Express App
const app = express();

// Connect to MongoDB Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- API Routes (friend's existing) ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/drivers", require("./routes/driverRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/deliveries", require("./routes/deliveryRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/faqs", require("./routes/faqRoutes"));
app.use("/api/inquiries", require("./routes/inquiryRoutes"));
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/orders", orderRoutes);
app.use("/api/employees", require("./routes/employee.route"));

// --- Finance Manager API Routes (protected) ---
app.use("/api/expenses", protect, expenseRoutes);
app.use("/api/incomes", protect, incomeRoutes);
app.use("/api/salaries", protect, salaryRoutes);
app.use("/api/taxes", protect, taxRoutes);


app.use("/api/products", productRoutes);

app.use('/api/payment', paymentRoutes);

app.use('/api/supplier-submissions', supplierSubmissionRoutes);


// --- Finance Aggregated Endpoints (protected) ---
app.get("/api/finance/summary", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const { startDate, endDate } = req.query;

    // Default to last 30 days
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const start = startDate ? new Date(startDate) : defaultStartDate;
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : defaultEndDate;
    end.setHours(23, 59, 59, 999);

    const match = {
      createdBy: userId,
      date: { $gte: start, $lte: end },
    };

    const [expenseAgg] = await Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const [incomeAgg] = await Income.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalExpenses = expenseAgg?.total || 0;
    const totalIncomes = incomeAgg?.total || 0;

    res.json({
      success: true,
      data: {
        totalExpenses,
        totalIncomes,
        netProfit: totalIncomes - totalExpenses,
      },
    });
  } catch (error) {
    console.error("Error in finance summary:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching finance summary",
      error: error.message,
    });
  }
});

app.get("/api/finance/kpis", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    currentMonthStart.setHours(0, 0, 0, 0);
    previousMonthStart.setHours(0, 0, 0, 0);
    previousMonthEnd.setHours(23, 59, 59, 999);
    now.setHours(23, 59, 59, 999);

    const dateMatch = (from, to) => ({
      createdBy: userId,
      date: { $gte: from, $lte: to },
    });

    // Current month totals
    const [currentExpensesAgg] = await Expense.aggregate([
      { $match: dateMatch(currentMonthStart, now) },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const [currentIncomesAgg] = await Income.aggregate([
      { $match: dateMatch(currentMonthStart, now) },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Previous month totals
    const [previousExpensesAgg] = await Expense.aggregate([
      { $match: dateMatch(previousMonthStart, previousMonthEnd) },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const [previousIncomesAgg] = await Income.aggregate([
      { $match: dateMatch(previousMonthStart, previousMonthEnd) },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const currentExpenseTotal = currentExpensesAgg?.total || 0;
    const previousExpenseTotal = previousExpensesAgg?.total || 0;
    const currentIncomeTotal = currentIncomesAgg?.total || 0;
    const previousIncomeTotal = previousIncomesAgg?.total || 0;

    const growth = (curr, prev) =>
      prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0;

    const revenueGrowth = growth(currentIncomeTotal, previousIncomeTotal);
    const expensesGrowth = growth(currentExpenseTotal, previousExpenseTotal);
    const profit = currentIncomeTotal - currentExpenseTotal;
    const profitMargin = currentIncomeTotal > 0 ? (profit / currentIncomeTotal) * 100 : 0;

    // Employees count for this user (distinct names in salaries)
    const employeeNames = await Salary.distinct("employeeName", { createdBy: userId });
    const employeeCount = employeeNames.length;

    res.json({
      success: true,
      data: {
        revenue: currentIncomeTotal,
        revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
        expenses: currentExpenseTotal,
        expensesGrowth: parseFloat(expensesGrowth.toFixed(2)),
        employees: employeeCount,
        profit,
        profitMargin: parseFloat(profitMargin.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Error in finance KPIs:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching finance KPIs",
      error: error.message,
    });
  }
});

app.get("/api/finance/monthly", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const monthlyData = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);

      monthStart.setHours(0, 0, 0, 0);
      monthEnd.setHours(23, 59, 59, 999);

      const [monthExpensesAgg] = await Expense.aggregate([
        { $match: { createdBy: userId, date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const [monthIncomesAgg] = await Income.aggregate([
        { $match: { createdBy: userId, date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      monthlyData.push({
        month: monthStart.toLocaleString("default", { month: "short", year: "numeric" }),
        revenue: monthIncomesAgg?.total || 0,
        expenses: monthExpensesAgg?.total || 0,
      });
    }

    res.json({ success: true, data: monthlyData });
  } catch (error) {
    console.error("Error in monthly finance data:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching monthly finance data",
      error: error.message,
    });
  }
});

// Error handling
app.use(errorHandler);

// IMPORTANT: match your frontend default (often 5000)
const PORT = process.env.PORT || 5001;

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});