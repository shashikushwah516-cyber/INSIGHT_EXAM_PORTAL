const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri || process.env.SKIP_DB_CONNECT === 'true') {
        console.warn('MongoDB connection skipped.');
        return null;
    }

    try {
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 1500,
            connectTimeoutMS: 1500,
            socketTimeoutMS: 1500,
        });
        console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        return null;
    }
};

module.exports = connectDB;