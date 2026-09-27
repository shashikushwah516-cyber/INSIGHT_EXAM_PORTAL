const express = require('express');
const Exam = require('../models/exam');
const User = require('../models/user');
const Attempt = require('../models/attempt');
const { protect, adminOnly } = require('../middleware/authMiddleLayer');

const router = express.Router();

// Helper to sanitize questions for candidates (removing correctOption & explanations)
const sanitizeExamForCandidate = (exam) => {
    const examObj = exam.toObject ? exam.toObject() : exam;
    const sanitizedQuestions = (examObj.questions || []).map((q, idx) => ({
        _id: q._id,
        id: q._id,
        index: idx,
        questionText: q.questionText,
        options: q.options,
        marks: q.marks || 1,
        subject: q.subject || 'General',
        topic: q.topic || 'General'
        // correctOption and explanation are explicitly omitted!
    }));

    return {
        ...examObj,
        questions: sanitizedQuestions
    };
};

// GET /exams - List all exams
router.get('/exams', protect, async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
        const query = isAdmin ? {} : { isPublished: true };

        const exams = await Exam.find(query).sort({ createdAt: -1 });

        // If candidate, sanitize questions count and details
        const formattedExams = exams.map(exam => {
            const totalQ = exam.questions.length;
            const marks = exam.totalMarks || (totalQ * (exam.marksPerQuestion || 1));
            return {
                _id: exam._id,
                id: exam._id,
                title: exam.title,
                description: exam.description,
                subject: exam.subject,
                durationMinutes: exam.durationMinutes,
                totalQuestions: totalQ,
                totalMarks: marks,
                passingMarks: exam.passingMarks,
                negativeMarking: exam.negativeMarking,
                negativeMarksPerQuestion: exam.negativeMarksPerQuestion,
                isPublished: exam.isPublished,
                createdAt: exam.createdAt
            };
        });

        return res.status(200).json({
            success: true,
            count: formattedExams.length,
            exams: formattedExams
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to fetch exams.'
        });
    }
});

// GET /exams/questions - Backward compatibility endpoint for legacy client
router.get('/exams/questions', protect, async (req, res) => {
    try {
        const exam = await Exam.findOne({ isPublished: true }).sort({ createdAt: -1 });
        if (!exam) {
            return res.status(200).json([]);
        }
        const sanitized = sanitizeExamForCandidate(exam);
        return res.status(200).json(sanitized.questions);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch questions.'
        });
    }
});

// GET /exams/:id - Get specific exam details
router.get('/exams/:id', protect, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found.'
            });
        }

        const isAdmin = req.user.role === 'admin';
        const result = isAdmin ? exam : sanitizeExamForCandidate(exam);

        return res.status(200).json({
            success: true,
            exam: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to fetch exam details.'
        });
    }
});

// POST /exams - Create new exam (Admin only)
router.post('/exams', protect, adminOnly, async (req, res) => {
    try {
        const {
            title,
            description,
            subject,
            durationMinutes,
            totalMarks,
            passingMarks,
            negativeMarking,
            negativeMarksPerQuestion,
            marksPerQuestion,
            isPublished,
            instructions,
            questions
        } = req.body;

        if (!title || !description || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, and at least one question are required.'
            });
        }

        const calculatedTotalMarks = totalMarks || questions.reduce((sum, q) => sum + (q.marks || marksPerQuestion || 1), 0);

        const exam = await Exam.create({
            title: title.trim(),
            description: description.trim(),
            subject: subject || 'General Competitive',
            durationMinutes: Number(durationMinutes) || 30,
            totalMarks: calculatedTotalMarks,
            passingMarks: Number(passingMarks) || Math.round(calculatedTotalMarks * 0.4),
            negativeMarking: negativeMarking !== false,
            negativeMarksPerQuestion: Number(negativeMarksPerQuestion) || 0.25,
            marksPerQuestion: Number(marksPerQuestion) || 1,
            isPublished: isPublished !== false,
            instructions: instructions && instructions.length ? instructions : undefined,
            questions
        });

        return res.status(201).json({
            success: true,
            message: 'Exam created successfully.',
            exam
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to create exam.'
        });
    }
});

// PUT /exams/:id - Update exam (Admin only)
router.put('/exams/:id', protect, adminOnly, async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.title) updateData.title = updateData.title.trim();
        if (updateData.description) updateData.description = updateData.description.trim();

        const exam = await Exam.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Exam updated successfully.',
            exam
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to update exam.'
        });
    }
});

// DELETE /exams/:id - Delete exam (Admin only)
router.delete('/exams/:id', protect, adminOnly, async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Exam deleted successfully.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to delete exam.'
        });
    }
});

// POST /exams/:id/start - Start an exam attempt for candidate
router.post('/exams/:id/start', protect, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found.'
            });
        }

        if (!exam.isPublished && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'This examination is currently not available.'
            });
        }

        // Check if an existing in-progress attempt exists
        let attempt = await Attempt.findOne({
            userId: req.user.id,
            examId: exam._id,
            status: 'in-progress'
        });

        const now = new Date();

        if (attempt) {
            // Check if attempt has expired based on server time
            if (now > attempt.expiresAt) {
                attempt.status = 'timed-out';
                await attempt.save();
                attempt = null; // Will start fresh or show expired
            }
        }

        // If no active valid attempt, create a new one
        if (!attempt) {
            const expiresAt = new Date(now.getTime() + exam.durationMinutes * 60 * 1000);
            attempt = await Attempt.create({
                userId: req.user.id,
                examId: exam._id,
                examTitle: exam.title,
                durationMinutes: exam.durationMinutes,
                startedAt: now,
                expiresAt,
                status: 'in-progress',
                answers: []
            });
        }

        const sanitizedExam = sanitizeExamForCandidate(exam);
        const remainingSeconds = Math.max(0, Math.floor((attempt.expiresAt.getTime() - now.getTime()) / 1000));

        return res.status(200).json({
            success: true,
            message: 'Examination session initialized.',
            attemptId: attempt._id,
            exam: sanitizedExam,
            startedAt: attempt.startedAt,
            expiresAt: attempt.expiresAt,
            remainingSeconds,
            savedAnswers: attempt.answers,
            serverTime: now
        });
    } catch (error) {
        console.error('Error starting exam:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to start examination.'
        });
    }
});

// GET /attempts/:id - Get active attempt status and answers
router.get('/attempts/:id', protect, async (req, res) => {
    try {
        const attempt = await Attempt.findById(req.params.id);

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Attempt session not found.'
            });
        }

        if (attempt.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to attempt.'
            });
        }

        const now = new Date();
        const remainingSeconds = Math.max(0, Math.floor((attempt.expiresAt.getTime() - now.getTime()) / 1000));

        return res.status(200).json({
            success: true,
            attemptId: attempt._id,
            examId: attempt.examId,
            examTitle: attempt.examTitle,
            status: attempt.status,
            remainingSeconds,
            startedAt: attempt.startedAt,
            expiresAt: attempt.expiresAt,
            answers: attempt.answers,
            score: attempt.status === 'submitted' ? attempt.score : undefined
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch attempt details.'
        });
    }
});

// POST /attempts/:id/answers - Auto-save single question answer
router.post('/attempts/:id/answers', protect, async (req, res) => {
    try {
        const attempt = await Attempt.findById(req.params.id);

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Attempt session not found.'
            });
        }

        if (attempt.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized.'
            });
        }

        if (attempt.status !== 'in-progress') {
            return res.status(400).json({
                success: false,
                message: `Attempt is already ${attempt.status}. Answers cannot be modified.`
            });
        }

        // Validate time
        const now = new Date();
        if (now > attempt.expiresAt) {
            attempt.status = 'timed-out';
            await attempt.save();
            return res.status(400).json({
                success: false,
                message: 'Examination time has expired.',
                timedOut: true
            });
        }

        const { questionId, questionIndex, selectedOption, isMarkedForReview } = req.body;

        const existingAnswerIndex = attempt.answers.findIndex(
            a => a.questionId === String(questionId) || a.questionIndex === Number(questionIndex)
        );

        const newAnswerData = {
            questionId: String(questionId),
            questionIndex: Number(questionIndex),
            selectedOption: selectedOption !== undefined && selectedOption !== null ? Number(selectedOption) : null,
            isMarkedForReview: Boolean(isMarkedForReview),
            savedAt: now
        };

        if (existingAnswerIndex >= 0) {
            attempt.answers[existingAnswerIndex] = newAnswerData;
        } else {
            attempt.answers.push(newAnswerData);
        }

        await attempt.save();

        return res.status(200).json({
            success: true,
            message: 'Answer saved successfully.',
            savedAt: now,
            answer: newAnswerData
        });
    } catch (error) {
        console.error('Error saving answer:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to save answer.'
        });
    }
});

// POST /attempts/:id/submit - Final submission & server-side scoring engine
router.post('/attempts/:id/submit', protect, async (req, res) => {
    try {
        const attempt = await Attempt.findById(req.params.id);

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Attempt session not found.'
            });
        }

        if (attempt.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized.'
            });
        }

        const exam = await Exam.findById(attempt.examId);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Associated exam not found.'
            });
        }

        // If answers were passed in submit body, merge them with saved answers
        if (Array.isArray(req.body.answers) && req.body.answers.length > 0) {
            req.body.answers.forEach(subAns => {
                const idx = attempt.answers.findIndex(
                    a => a.questionId === String(subAns.questionId) || a.questionIndex === Number(subAns.questionIndex)
                );
                const item = {
                    questionId: String(subAns.questionId || (exam.questions[subAns.questionIndex] && exam.questions[subAns.questionIndex]._id)),
                    questionIndex: Number(subAns.questionIndex),
                    selectedOption: subAns.selectedOption !== undefined && subAns.selectedOption !== null ? Number(subAns.selectedOption) : null,
                    isMarkedForReview: Boolean(subAns.isMarkedForReview),
                    savedAt: new Date()
                };
                if (idx >= 0) {
                    attempt.answers[idx] = item;
                } else {
                    attempt.answers.push(item);
                }
            });
        }

        // SCORING ENGINE
        const totalQuestions = exam.questions.length;
        const marksPerQ = exam.marksPerQuestion || 1;
        const negMarksPerQ = exam.negativeMarking ? (exam.negativeMarksPerQuestion || 0.25) : 0;

        let attemptedCount = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        let unansweredCount = 0;
        let totalMarks = 0;
        let obtainedMarks = 0;

        const subjectStats = {};
        const questionReview = [];

        exam.questions.forEach((q, idx) => {
            const qMarks = q.marks || marksPerQ;
            const qNegMarks = exam.negativeMarking ? (q.negativeMarks || negMarksPerQ) : 0;
            totalMarks += qMarks;

            const subject = q.subject || 'General';
            if (!subjectStats[subject]) {
                subjectStats[subject] = { total: 0, correct: 0, incorrect: 0, unanswered: 0 };
            }
            subjectStats[subject].total += 1;

            // Find candidate's answer
            const candidateAns = attempt.answers.find(
                a => a.questionId === String(q._id) || a.questionIndex === idx
            );

            const hasAnswer = candidateAns && candidateAns.selectedOption !== null && candidateAns.selectedOption !== undefined;
            const selectedOpt = hasAnswer ? candidateAns.selectedOption : null;
            const isCorrect = hasAnswer && selectedOpt === q.correctOption;

            let qScore = 0;
            if (hasAnswer) {
                attemptedCount += 1;
                if (isCorrect) {
                    correctCount += 1;
                    qScore = qMarks;
                    obtainedMarks += qMarks;
                    subjectStats[subject].correct += 1;
                } else {
                    incorrectCount += 1;
                    qScore = -qNegMarks;
                    obtainedMarks -= qNegMarks;
                    subjectStats[subject].incorrect += 1;
                }
            } else {
                unansweredCount += 1;
                subjectStats[subject].unanswered += 1;
            }

            questionReview.push({
                questionId: String(q._id),
                questionText: q.questionText,
                options: q.options,
                selectedOption: selectedOpt,
                correctOption: q.correctOption,
                isCorrect: Boolean(isCorrect),
                marksObtained: qScore,
                explanation: q.explanation || `Correct answer is option ${q.correctOption + 1}: ${q.options[q.correctOption]}`,
                subject
            });
        });

        // Ensure obtained marks doesn't go below 0 if configured
        const finalObtainedMarks = Math.max(0, Math.round(obtainedMarks * 100) / 100);
        const percentage = totalMarks > 0 ? Math.round((finalObtainedMarks / totalMarks) * 1000) / 10 : 0;
        const passed = finalObtainedMarks >= (exam.passingMarks || Math.round(totalMarks * 0.4));

        const now = new Date();
        const timeTakenSeconds = Math.max(0, Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000));

        const subjectBreakdown = Object.keys(subjectStats).map(subj => {
            const s = subjectStats[subj];
            const accuracy = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
            return {
                subject: subj,
                total: s.total,
                correct: s.correct,
                incorrect: s.incorrect,
                unanswered: s.unanswered,
                accuracy
            };
        });

        attempt.status = 'submitted';
        attempt.submittedAt = now;
        attempt.score = {
            totalQuestions,
            attempted: attemptedCount,
            correct: correctCount,
            incorrect: incorrectCount,
            unanswered: unansweredCount,
            totalMarks,
            obtainedMarks: finalObtainedMarks,
            percentage,
            passed,
            timeTakenSeconds,
            subjectBreakdown,
            questionReview
        };

        await attempt.save();

        // Update user's exam completed flag
        await User.findByIdAndUpdate(attempt.userId, { isExamCompleted: true });

        return res.status(200).json({
            success: true,
            message: 'Examination submitted and scored successfully.',
            attemptId: attempt._id,
            result: {
                attemptId: attempt._id,
                examTitle: attempt.examTitle,
                totalQuestions,
                attempted: attemptedCount,
                correct: correctCount,
                incorrect: incorrectCount,
                unanswered: unansweredCount,
                totalMarks,
                obtainedMarks: finalObtainedMarks,
                percentage,
                passed,
                timeTakenSeconds,
                subjectBreakdown,
                questionReview
            }
        });
    } catch (error) {
        console.error('Error submitting exam:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to submit examination.'
        });
    }
});

// Backward compatibility: POST /exams/:id/submit
router.post('/exams/:id/submit', protect, async (req, res) => {
    try {
        const activeAttempt = await Attempt.findOne({
            userId: req.user.id,
            examId: req.params.id,
            status: 'in-progress'
        }).sort({ createdAt: -1 });

        if (activeAttempt) {
            req.params.id = activeAttempt._id;
            // Delegate to the attempt submission logic
            return router.handle(req, res);
        }

        // If no active attempt was created yet, create one and score immediately
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found.' });
        }

        const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
        const attempt = await Attempt.create({
            userId: req.user.id,
            examId: exam._id,
            examTitle: exam.title,
            durationMinutes: exam.durationMinutes,
            startedAt: new Date(),
            expiresAt: new Date(Date.now() + exam.durationMinutes * 60000),
            status: 'in-progress',
            answers: answers.map((ans, idx) => ({
                questionId: String(exam.questions[idx] ? exam.questions[idx]._id : idx),
                questionIndex: idx,
                selectedOption: typeof ans === 'number' ? ans : null,
                isMarkedForReview: false
            }))
        });

        req.params.id = attempt._id;
        return router.handle(req, res);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to submit exam.'
        });
    }
});

module.exports = router;
