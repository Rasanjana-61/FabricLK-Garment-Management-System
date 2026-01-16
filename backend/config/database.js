//backend/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('MongoDB connected...');
    } catch (error) {
        console.error('Connection Failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;