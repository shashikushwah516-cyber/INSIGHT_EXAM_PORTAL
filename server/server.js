const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');
const questionRoutes = require('./routes/questionRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const resultRoutes = require('./routes/resultRoutes');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Flexible CORS for Render and Cloud Environments
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : true;

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Dedicated Health Check Endpoint for Render Zero-Downtime Deploys & Monitors
app.get(['/health', '/api/health'], (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'Insight Exam Platform API',
        version: '2.0.0',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

// Mounted API Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/admin', authRoutes);
app.use('/admin', authRoutes);

app.use('/api/questions', questionRoutes);
app.use('/questions', questionRoutes);

app.use('/api/practice', practiceRoutes);
app.use('/practice', practiceRoutes);

app.use('/api/results', resultRoutes);
app.use('/results', resultRoutes);

// Exam & Attempt routes mounted on /api and /exam
app.use('/api', examRoutes);
app.use('/exam', examRoutes);

// Voice-First AI Assistant
app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

// Static client assets serving (Production unified service on Render)
const clientDistPath = path.resolve(__dirname, '../client/dist');
const hasClientBuild = fs.existsSync(clientDistPath);

if (hasClientBuild) {
    app.use(express.static(clientDistPath, { index: false }));
}

// Root endpoint: Serves SPA index.html to browsers, JSON API info to API callers/tests
app.get('/', (req, res) => {
    const acceptsHtml = req.headers['accept'] && req.headers['accept'].includes('text/html');
    const isExplicitJson = req.query.format === 'json' || (req.headers['accept'] && req.headers['accept'].includes('application/json'));

    if (hasClientBuild && acceptsHtml && !isExplicitJson) {
        return res.sendFile(path.join(clientDistPath, 'index.html'));
    }

    res.status(200).json({
        success: true,
        name: 'Insight Exam Platform API',
        version: '2.0.0',
        message: 'Accessible Online Examination & Practice Platform Backend is running.'
    });
});

// API 404 handler to ensure unmatched /api routes return JSON error
app.all('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint ${req.originalUrl} not found`
    });
});

// SPA fallback: Route all unmatched client-side requests to index.html
if (hasClientBuild) {
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/admin') ||
            req.path.startsWith('/questions') || req.path.startsWith('/practice') || req.path.startsWith('/results') ||
            req.path.startsWith('/exam') || req.path.startsWith('/ai') || req.path.startsWith('/health')) {
            return next();
        }
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
}

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
const HOST = process.env.HOST || '0.0.0.0';

if (require.main === module) {
    app.listen(PORT, HOST, () => {
        console.log(`Insight Accessible Exam Server listening on ${HOST}:${PORT}`);
    });
}

module.exports = app;