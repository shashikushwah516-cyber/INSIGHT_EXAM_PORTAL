const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');
const questionRoutes = require('./routes/questionRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const resultRoutes = require('./routes/resultRoutes');

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Root Health Check
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        name: 'Insight Exam Platform API',
        version: '2.0.0',
        message: 'Accessible Online Examination & Practice Platform Backend is running.'
    });
});

// Mounted Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/questions', questionRoutes);
app.use('/questions', questionRoutes);

app.use('/api/practice', practiceRoutes);
app.use('/practice', practiceRoutes);

app.use('/api/results', resultRoutes);
app.use('/results', resultRoutes);

// Exam & Attempt routes mounted on /api and /exam
app.use('/api', examRoutes);
app.use('/exam', examRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        code: err.code || 'INTERNAL_ERROR'
    });
});

const PORT = process.env.PORT || 5001;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Insight Accessible Exam Server listening on port ${PORT}`);
    });
}

module.exports = app;