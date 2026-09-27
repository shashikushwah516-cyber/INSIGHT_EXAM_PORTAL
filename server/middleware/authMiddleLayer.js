const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'insight_exam_super_secure_jwt_secret_key_2026_sih';

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authorization token is missing or invalid.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token is invalid or expired.'
        });
    }
};

const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access forbidden. Administrator privileges required.'
        });
    }

    next();
};

const candidateOnly = (req, res, next) => {
    if (!req.user || (req.user.role !== 'candidate' && req.user.role !== 'student')) {
        return res.status(403).json({
            success: false,
            message: 'Access reserved for examination candidates.'
        });
    }

    next();
};

module.exports = { protect, adminOnly, candidateOnly };