const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { protect } = require('../middleware/authMiddleLayer');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'insight_exam_super_secure_jwt_secret_key_2026_sih';

const createToken = (user) =>
    jwt.sign(
        {
            id: user._id,
            rollNumber: user.rollNumber,
            role: user.role,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

// Register user
router.post('/register', async (req, res) => {
    try {
        const { rollNumber, password, role, name, email, preferences } = req.body;

        if (!rollNumber || !password) {
            return res.status(400).json({
                success: false,
                message: 'Roll number and password are required.'
            });
        }

        const normalizedRoll = rollNumber.trim().toUpperCase();

        if (normalizedRoll.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Roll number must be at least 3 characters long.'
            });
        }

        const existingUser = await User.findOne({ rollNumber: normalizedRoll });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'A candidate with this roll number already exists.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const assignedRole = role === 'admin' ? 'admin' : 'candidate';

        const user = await User.create({
            rollNumber: normalizedRoll,
            name: name ? name.trim() : `Candidate ${normalizedRoll}`,
            email: email ? email.trim().toLowerCase() : undefined,
            password: hashedPassword,
            role: assignedRole,
            preferences: preferences || {}
        });

        const token = createToken(user);

        return res.status(201).json({
            success: true,
            message: 'Registration successful. Welcome to the portal.',
            token,
            user: {
                id: user._id,
                rollNumber: user.rollNumber,
                name: user.name,
                email: user.email,
                role: user.role,
                isExamCompleted: user.isExamCompleted,
                preferences: user.preferences
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error occurred while registering user.'
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { rollNumber, password } = req.body;

        if (!rollNumber || !password) {
            return res.status(400).json({
                success: false,
                message: 'Roll number and password are required.'
            });
        }

        const normalizedRoll = rollNumber.trim().toUpperCase();
        // Support finding by rollNumber (case-insensitive) or email
        const user = await User.findOne({
            $or: [
                { rollNumber: normalizedRoll },
                { rollNumber: rollNumber.trim() },
                { email: rollNumber.trim().toLowerCase() }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. User not found.'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Incorrect password.'
            });
        }

        const token = createToken(user);

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name || user.rollNumber}. Login successful.`,
            token,
            user: {
                id: user._id,
                rollNumber: user.rollNumber,
                name: user.name,
                email: user.email,
                role: user.role,
                isExamCompleted: user.isExamCompleted,
                preferences: user.preferences
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error occurred while logging in.'
        });
    }
});

// Get current user profile & preferences
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account not found.'
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                rollNumber: user.rollNumber,
                name: user.name,
                email: user.email,
                role: user.role,
                isExamCompleted: user.isExamCompleted,
                preferences: user.preferences,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to fetch user profile.'
        });
    }
});

// Update accessibility preferences
router.put('/preferences', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account not found.'
            });
        }

        user.preferences = {
            ...user.preferences.toObject(),
            ...req.body
        };

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Accessibility preferences updated successfully.',
            preferences: user.preferences
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update accessibility preferences.'
        });
    }
});

// Update profile details
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        if (name) user.name = name.trim();
        if (email) user.email = email.trim().toLowerCase();

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            user: {
                id: user._id,
                rollNumber: user.rollNumber,
                name: user.name,
                email: user.email,
                role: user.role,
                preferences: user.preferences
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update profile.'
        });
    }
});

// Logout endpoint for accessibility announcements
router.post('/logout', protect, (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Successfully logged out. Your session has ended safely.'
    });
});

module.exports = router;
