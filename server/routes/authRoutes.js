const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Attempt = require('../models/attempt');
const { protect, adminOnly } = require('../middleware/authMiddleLayer');

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
        const rollNumber = req.body.rollNumber || req.body.identifier || req.body.email || req.body.username;
        const password = req.body.password;

        if (!rollNumber || !password) {
            return res.status(400).json({
                success: false,
                message: 'Roll number or Email, and password are required.'
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

        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact platform administration.'
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

// Forgot / Reset Password endpoint
router.post('/forgot-password', async (req, res) => {
    try {
        const { rollNumber, email, newPassword } = req.body;

        if ((!rollNumber && !email) || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Roll number or email, and new password are required.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters in length.'
            });
        }

        const query = [];
        if (rollNumber) {
            query.push({ rollNumber: rollNumber.trim().toUpperCase() });
            query.push({ rollNumber: rollNumber.trim() });
        }
        if (email) {
            query.push({ email: email.trim().toLowerCase() });
        }

        const user = await User.findOne({ $or: query });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No candidate account found matching the provided details.'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `Password has been reset successfully for ${user.name || user.rollNumber}. You can now sign in.`
        });
    } catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error occurred while resetting password.'
        });
    }
});

// ==========================================
// ADMIN STUDENT MANAGEMENT ENDPOINTS
// ==========================================

// GET /students - List all students / candidates (Admin only)
router.get('/students', protect, adminOnly, async (req, res) => {
    try {
        const { search, role, status } = req.query;
        const query = {};

        if (role && role !== 'all') {
            query.role = role;
        }

        if (status === 'active') {
            query.isActive = { $ne: false };
        } else if (status === 'inactive') {
            query.isActive = false;
        }

        if (search) {
            const regex = { $regex: search, $options: 'i' };
            query.$or = [
                { rollNumber: regex },
                { name: regex },
                { email: regex }
            ];
        }

        const students = await User.find(query).select('-password').sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to fetch students list.'
        });
    }
});

// POST /students - Create student from Admin Console (Admin only)
router.post('/students', protect, adminOnly, async (req, res) => {
    try {
        const { rollNumber, name, email, password, role } = req.body;

        if (!rollNumber || !password) {
            return res.status(400).json({
                success: false,
                message: 'Roll number and password are required.'
            });
        }

        const normalizedRoll = rollNumber.trim().toUpperCase();
        const existing = await User.findOne({ rollNumber: normalizedRoll });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'A student with this roll number already exists.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const student = await User.create({
            rollNumber: normalizedRoll,
            name: name ? name.trim() : `Candidate ${normalizedRoll}`,
            email: email ? email.trim().toLowerCase() : undefined,
            password: hashedPassword,
            role: role === 'admin' ? 'admin' : 'candidate',
            isActive: true
        });

        return res.status(201).json({
            success: true,
            message: 'Student account created successfully.',
            student: {
                id: student._id,
                rollNumber: student.rollNumber,
                name: student.name,
                email: student.email,
                role: student.role,
                isActive: student.isActive,
                createdAt: student.createdAt
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to create student.'
        });
    }
});

// GET /students/:id - Get student details & attempts (Admin only)
router.get('/students/:id', protect, adminOnly, async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select('-password');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student record not found.'
            });
        }

        const attempts = await Attempt.find({ userId: student._id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            student,
            attempts
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to fetch student details.'
        });
    }
});

// PUT /students/:id - Update student record (Admin only)
router.put('/students/:id', protect, adminOnly, async (req, res) => {
    try {
        const { name, email, rollNumber, role, isActive, newPassword } = req.body;
        const student = await User.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student record not found.'
            });
        }

        if (name) student.name = name.trim();
        if (email) student.email = email.trim().toLowerCase();
        if (rollNumber) student.rollNumber = rollNumber.trim().toUpperCase();
        if (role) student.role = role;
        if (typeof isActive === 'boolean') student.isActive = isActive;
        if (newPassword && newPassword.length >= 6) {
            student.password = await bcrypt.hash(newPassword, 10);
        }

        await student.save();

        return res.status(200).json({
            success: true,
            message: 'Student record updated successfully.',
            student: {
                id: student._id,
                rollNumber: student.rollNumber,
                name: student.name,
                email: student.email,
                role: student.role,
                isActive: student.isActive,
                updatedAt: student.updatedAt
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to update student record.'
        });
    }
});

// DELETE /students/:id - Delete student record (Admin only)
router.delete('/students/:id', protect, adminOnly, async (req, res) => {
    try {
        const student = await User.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student record not found.'
            });
        }

        // Clean up attempts associated with this student
        await Attempt.deleteMany({ userId: student._id });

        return res.status(200).json({
            success: true,
            message: `Student ${student.name || student.rollNumber} deleted successfully.`
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to delete student.'
        });
    }
});

module.exports = router;

