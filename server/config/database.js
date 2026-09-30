const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri || process.env.SKIP_DB_CONNECT === 'true') {
        console.warn('MongoDB connection skipped.');
        return null;
    }

    try {
        const timeout = process.env.NODE_ENV === 'test' ? 3000 : 15000;
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: timeout,
            connectTimeoutMS: timeout,
            socketTimeoutMS: 30000,
        });
        console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        return null;
    }
};

module.exports = connectDB;