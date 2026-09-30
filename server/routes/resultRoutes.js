const express = require('express');
const Attempt = require('../models/attempt');
const User = require('../models/user');
const Exam = require('../models/exam');
const Question = require('../models/question');
const PracticeAttempt = require('../models/practiceAttempt');
const { protect, adminOnly } = require('../middleware/authMiddleLayer');

const router = express.Router();

// GET /results - Candidate's submitted exam results
router.get('/', protect, async (req, res) => {
    try {
        const query = req.user.role === 'admin'
            ? { status: 'submitted' }
            : { userId: req.user.id, status: 'submitted' };

        const attempts = await Attempt.find(query)
            .sort({ submittedAt: -1 })
            .select('-score.questionReview'); // Omit heavy questionReview from list

        return res.status(200).json({
            success: true,
            count: attempts.length,
            results: attempts.map(att => ({
                id: att._id,
                attemptId: att._id,
                _id: att._id,
                examId: att.examId,
                examTitle: att.examTitle,
                startedAt: att.startedAt,
                submittedAt: att.submittedAt,
                createdAt: att.createdAt || att.submittedAt,
                score: att.score
            }))
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch results.'
        });
    }
});

// GET /results/analytics/candidate - Candidate's comprehensive analytics
// NOTE: MUST be defined BEFORE /:attemptId to prevent Express route collision!
router.get('/analytics/candidate', protect, async (req, res) => {
    try {
        const [attempts, practiceHistory] = await Promise.all([
            Attempt.find({ userId: req.user.id, status: 'submitted' }).sort({ submittedAt: 1 }),
            PracticeAttempt.find({ userId: req.user.id }).sort({ createdAt: -1 })
        ]);

        const totalPracticed = practiceHistory.reduce((sum, h) => sum + (h.totalQuestions || 0), 0);
        const totalPracticeCorrect = practiceHistory.reduce((sum, h) => sum + (h.correct || 0), 0);
        const practiceAccuracy = totalPracticed > 0 ? Math.round((totalPracticeCorrect / totalPracticed) * 100) : 0;

        const totalExams = attempts.length;
        if (totalExams === 0) {
            return res.status(200).json({
                success: true,
                analytics: {
                    totalExamsAttempted: 0,
                    totalPracticed,
                    practiceAccuracy,
                    averagePercentage: 0,
                    accuracy: practiceAccuracy || 0,
                    attemptRate: 0,
                    averageTimePerQuestion: 0,
                    subjectAccuracy: [],
                    history: [],
                    recommendations: [
                        'Take your first timed mock examination to start tracking your performance.',
                        'Try subject-wise practice in Quantitative Aptitude and Reasoning to build familiarity.'
                    ]
                }
            });
        }

        let totalQuestionsAll = 0;
        let totalAttemptedAll = 0;
        let totalCorrectAll = 0;
        let totalTimeSeconds = 0;
        let totalPercentageSum = 0;

        const subjectAggregates = {};

        const history = attempts.map(att => {
            const sc = att.score || {};
            totalQuestionsAll += sc.totalQuestions || 0;
            totalAttemptedAll += sc.attempted || 0;
            totalCorrectAll += sc.correct || 0;
            totalTimeSeconds += sc.timeTakenSeconds || 0;
            totalPercentageSum += sc.percentage || 0;

            if (Array.isArray(sc.subjectBreakdown)) {
                sc.subjectBreakdown.forEach(sb => {
                    if (!subjectAggregates[sb.subject]) {
                        subjectAggregates[sb.subject] = { total: 0, correct: 0 };
                    }
                    subjectAggregates[sb.subject].total += sb.total || 0;
                    subjectAggregates[sb.subject].correct += sb.correct || 0;
                });
            }

            return {
                id: att._id,
                attemptId: att._id,
                examTitle: att.examTitle,
                date: att.submittedAt,
                percentage: sc.percentage || 0,
                obtainedMarks: sc.obtainedMarks || 0,
                totalMarks: sc.totalMarks || 0
            };
        });

        const averagePercentage = Math.round((totalPercentageSum / totalExams) * 10) / 10;
        const accuracy = totalAttemptedAll > 0 ? Math.round((totalCorrectAll / totalAttemptedAll) * 100) : 0;
        const attemptRate = totalQuestionsAll > 0 ? Math.round((totalAttemptedAll / totalQuestionsAll) * 100) : 0;
        const avgTimePerQuestion = totalAttemptedAll > 0 ? Math.round(totalTimeSeconds / totalAttemptedAll) : 0;

        const subjectAccuracy = Object.entries(subjectAggregates).map(([subject, data]) => ({
            subject,
            totalQuestions: data.total,
            correct: data.correct,
            accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
        }));

        // Dynamic Recommendations based on metrics
        const recommendations = [];
        if (accuracy < 60) {
            recommendations.push('Overall accuracy is below 60%. Focus on question comprehension and practice with voice narration enabled.');
        } else if (accuracy >= 80) {
            recommendations.push('High accuracy achieved! You are well-prepared for competitive standards.');
        }

        subjectAccuracy.forEach(sa => {
            if (sa.accuracy < 50 && sa.totalQuestions >= 5) {
                recommendations.push(`Subject Alert: Accuracy in ${sa.subject} is ${sa.accuracy}%. Try targeted practice sessions in this area.`);
            }
        });

        if (avgTimePerQuestion > 90) {
            recommendations.push(`Average time per question is ${avgTimePerQuestion} seconds. Use keyboard shortcuts (1-4 and Arrow keys) to reduce navigation time.`);
        }

        if (recommendations.length === 0) {
            recommendations.push('Consistent performance across subjects. Continue full-length mock examinations to improve endurance.');
        }

        return res.status(200).json({
            success: true,
            analytics: {
                totalExamsAttempted: totalExams,
                totalPracticed,
                practiceAccuracy,
                averagePercentage,
                accuracy,
                attemptRate,
                averageTimePerQuestion: avgTimePerQuestion,
                subjectAccuracy,
                history,
                recommendations
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to calculate analytics.'
        });
    }
});

// GET /results/admin/overview - Admin high-level system dashboard analytics
// NOTE: MUST be defined BEFORE /:attemptId to prevent Express route collision!
router.get('/admin/overview', protect, adminOnly, async (req, res) => {
    try {
        const totalCandidates = await User.countDocuments({ role: { $in: ['candidate', 'student'] } });
        const totalExams = await Exam.countDocuments();
        const totalQuestions = await Question.countDocuments();
        const totalAttempts = await Attempt.countDocuments({ status: 'submitted' });

        const recentAttempts = await Attempt.find({ status: 'submitted' })
            .populate('userId', 'rollNumber name')
            .sort({ submittedAt: -1 })
            .limit(10);

        const allSubmitted = await Attempt.find({ status: 'submitted' }).select('score.percentage score.obtainedMarks');
        const avgScore = allSubmitted.length > 0
            ? Math.round((allSubmitted.reduce((sum, a) => sum + (a.score?.percentage || 0), 0) / allSubmitted.length) * 10) / 10
            : 0;

        return res.status(200).json({
            success: true,
            overview: {
                totalCandidates,
                totalExams,
                totalQuestions,
                totalAttempts,
                averageScore: avgScore,
                recentAttempts: recentAttempts.map(att => ({
                    id: att._id,
                    attemptId: att._id,
                    candidateRoll: att.userId ? att.userId.rollNumber : 'Unknown',
                    candidateName: att.userId ? att.userId.name : 'Unknown',
                    examTitle: att.examTitle,
                    percentage: att.score?.percentage || 0,
                    obtainedMarks: att.score?.obtainedMarks || 0,
                    totalMarks: att.score?.totalMarks || 0,
                    submittedAt: att.submittedAt
                }))
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch admin overview.'
        });
    }
});

// GET /results/:attemptId - Detailed result with full question review
router.get('/:attemptId', protect, async (req, res) => {
    try {
        const attempt = await Attempt.findById(req.params.attemptId);

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Result not found.'
            });
        }

        if (attempt.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to this result.'
            });
        }

        return res.status(200).json({
            success: true,
            result: {
                id: attempt._id,
                attemptId: attempt._id,
                _id: attempt._id,
                examId: attempt.examId,
                examTitle: attempt.examTitle,
                startedAt: attempt.startedAt,
                submittedAt: attempt.submittedAt,
                durationMinutes: attempt.durationMinutes,
                score: attempt.score
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch detailed result.'
        });
    }
});

module.exports = router;
