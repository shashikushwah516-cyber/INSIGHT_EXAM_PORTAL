const express = require('express');
const Question = require('../models/question');
const PracticeAttempt = require('../models/practiceAttempt');
const { protect } = require('../middleware/authMiddleLayer');

const router = express.Router();

// GET /practice/questions - Fetch practice questions with filters
router.get('/questions', protect, async (req, res) => {
    try {
        const { subject, topic, difficulty, limit = 10 } = req.query;
        const filter = {};

        if (subject && subject !== 'all') {
            filter.subject = subject;
        }
        if (topic && topic !== 'all') {
            filter.topic = topic;
        }
        if (difficulty && difficulty !== 'all') {
            filter.difficulty = difficulty;
        }

        const count = await Question.countDocuments(filter);
        const sampleLimit = Math.min(Number(limit) || 10, 50);

        // Fetch random questions or sorted
        const questions = await Question.aggregate([
            { $match: filter },
            { $sample: { size: sampleLimit } },
            {
                $project: {
                    _id: 1,
                    questionText: 1,
                    options: 1,
                    subject: 1,
                    topic: 1,
                    difficulty: 1,
                    marks: 1,
                    audioText: 1
                    // correctOption & explanation are returned only upon checking or completion
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            count: questions.length,
            totalAvailable: count,
            questions
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch practice questions.'
        });
    }
});

// POST /practice/check - Instant check for interactive practice
router.post('/check', protect, async (req, res) => {
    try {
        const { questionId, selectedOption } = req.body;

        if (!questionId || selectedOption === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Question ID and selected option are required.'
            });
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found.'
            });
        }

        const isCorrect = Number(selectedOption) === question.correctOption;
        const correctText = question.options[question.correctOption];
        const audioSpeech = isCorrect
            ? `सही उत्तर! विकल्प ${question.correctOption + 1}: ${correctText}। ${question.explanation || ''}`
            : `गलत उत्तर। सही उत्तर विकल्प ${question.correctOption + 1} है: ${correctText}। स्पष्टीकरण: ${question.explanation || ''}`;

        return res.status(200).json({
            success: true,
            isCorrect,
            correctOption: question.correctOption,
            correctOptionText: correctText,
            explanation: question.explanation,
            audioSpeech
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to verify answer.'
        });
    }
});

// POST /practice/submit - Save practice attempt summary
router.post('/submit', protect, async (req, res) => {
    try {
        const {
            subject = 'General',
            topic = 'All Topics',
            difficulty = 'all',
            totalQuestions = 0,
            attempted = 0,
            correct = 0,
            incorrect = 0,
            timeTakenSeconds = 0
        } = req.body;

        const score = correct;
        const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

        const practiceAttempt = await PracticeAttempt.create({
            userId: req.user.id,
            subject,
            topic,
            difficulty,
            totalQuestions,
            attempted,
            correct,
            incorrect,
            score,
            accuracy,
            timeTakenSeconds
        });

        return res.status(201).json({
            success: true,
            message: 'Practice session completed and saved.',
            practiceAttempt
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to save practice record.'
        });
    }
});

// GET /practice/history - Candidate's practice history
router.get('/history', protect, async (req, res) => {
    try {
        const history = await PracticeAttempt.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        const totalPracticed = history.reduce((sum, h) => sum + h.totalQuestions, 0);
        const totalCorrect = history.reduce((sum, h) => sum + h.correct, 0);
        const overallAccuracy = totalPracticed > 0 ? Math.round((totalCorrect / totalPracticed) * 100) : 0;

        return res.status(200).json({
            success: true,
            count: history.length,
            stats: {
                totalSessions: history.length,
                totalPracticed,
                totalCorrect,
                overallAccuracy
            },
            history
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch practice history.'
        });
    }
});

module.exports = router;
