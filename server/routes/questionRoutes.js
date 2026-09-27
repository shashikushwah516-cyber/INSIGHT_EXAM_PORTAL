const express = require('express');
const Question = require('../models/question');
const Subject = require('../models/subject');
const { protect, adminOnly } = require('../middleware/authMiddleLayer');

const router = express.Router();

// Get questions list with search & filter
router.get('/', protect, async (req, res) => {
    try {
        const { subject, difficulty, topic, search } = req.query;
        const query = {};

        if (subject && subject !== 'all') {
            query.subject = subject;
        }
        if (difficulty && difficulty !== 'all') {
            query.difficulty = difficulty;
        }
        if (topic && topic !== 'all') {
            query.topic = topic;
        }
        if (search) {
            query.questionText = { $regex: search, $options: 'i' };
        }

        const questions = await Question.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: questions.length,
            questions
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to fetch questions.'
        });
    }
});

// Get question subjects and topics metadata
router.get('/meta/subjects', protect, async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ name: 1 });
        const distinctSubjects = await Question.distinct('subject');
        const distinctTopics = await Question.distinct('topic');

        return res.status(200).json({
            success: true,
            subjects,
            distinctSubjects,
            distinctTopics
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch subjects metadata.'
        });
    }
});

// Get single question by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found.'
            });
        }
        return res.status(200).json({
            success: true,
            question
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch question.'
        });
    }
});

// Create question (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { questionText, subject, topic, difficulty, options, correctOption, marks, negativeMarks, explanation, audioText } = req.body;

        if (!questionText || !subject || !Array.isArray(options) || options.length !== 4 || correctOption === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Question text, subject, exactly 4 options, and correct option index are required.'
            });
        }

        const newQuestion = await Question.create({
            questionText: questionText.trim(),
            subject: subject.trim(),
            topic: topic ? topic.trim() : 'General',
            difficulty: difficulty || 'medium',
            options: options.map(opt => String(opt).trim()),
            correctOption: Number(correctOption),
            marks: Number(marks) || 1,
            negativeMarks: Number(negativeMarks) || 0.25,
            explanation: explanation ? explanation.trim() : '',
            audioText: audioText ? audioText.trim() : ''
        });

        // Also add topic to Subject if not exists
        await Subject.findOneAndUpdate(
            { name: subject },
            { $addToSet: { topics: topic || 'General' } },
            { upsert: true }
        );

        return res.status(201).json({
            success: true,
            message: 'Question created successfully in Question Bank.',
            question: newQuestion
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to create question.'
        });
    }
});

// Update question (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { questionText, subject, topic, difficulty, options, correctOption, marks, negativeMarks, explanation, audioText } = req.body;

        const updateData = {};
        if (questionText) updateData.questionText = questionText.trim();
        if (subject) updateData.subject = subject.trim();
        if (topic) updateData.topic = topic.trim();
        if (difficulty) updateData.difficulty = difficulty;
        if (options && Array.isArray(options) && options.length === 4) {
            updateData.options = options.map(opt => String(opt).trim());
        }
        if (correctOption !== undefined) updateData.correctOption = Number(correctOption);
        if (marks !== undefined) updateData.marks = Number(marks);
        if (negativeMarks !== undefined) updateData.negativeMarks = Number(negativeMarks);
        if (explanation !== undefined) updateData.explanation = explanation.trim();
        if (audioText !== undefined) updateData.audioText = audioText.trim();

        const updated = await Question.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Question not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Question updated successfully.',
            question: updated
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to update question.'
        });
    }
});

// Delete question (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const deleted = await Question.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Question not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Question removed successfully from Question Bank.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to delete question.'
        });
    }
});

module.exports = router;
