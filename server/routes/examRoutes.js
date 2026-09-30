const express = require('express');
const mongoose = require('mongoose');
const Exam = require('../models/exam');
const User = require('../models/user');
const Attempt = require('../models/attempt');
const { protect, optionalProtect, adminOnly } = require('../middleware/authMiddleLayer');

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
        topic: q.topic || 'General',
        imageUrl: q.imageUrl || '',
        imageType: q.imageType || '',
        visualDescription: q.visualDescription || { quick: '', detailed: '' },
        visualAlt: q.visualAlt || '',
        hasVisual: Boolean(q.imageUrl || (q.visualDescription && (q.visualDescription.quick || q.visualDescription.detailed)))
        // correctOption and explanation are explicitly omitted!
    }));

    return {
        ...examObj,
        questions: sanitizedQuestions
    };
};

// GET /exams - List all exams (public can view published exams; admins view all)
router.get('/exams', optionalProtect, async (req, res) => {
    try {
        const isAdmin = req.user && req.user.role === 'admin';
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
router.get('/exams/:id', optionalProtect, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found.'
            });
        }

        const isAdmin = req.user && req.user.role === 'admin';
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

// GET /attempts/active/session - Check if user has an active ongoing attempt
router.get('/attempts/active/session', protect, async (req, res) => {
    try {
        const attempt = await Attempt.findOne({
            userId: req.user.id,
            status: 'in-progress'
        }).sort({ startedAt: -1 });

        if (!attempt) {
            return res.status(200).json({
                success: true,
                activeAttempt: null
            });
        }

        const now = new Date();
        if (now > attempt.expiresAt) {
            attempt.status = 'timed-out';
            await attempt.save();
            return res.status(200).json({
                success: true,
                activeAttempt: null
            });
        }

        const remainingSeconds = Math.max(0, Math.floor((attempt.expiresAt.getTime() - now.getTime()) / 1000));
        return res.status(200).json({
            success: true,
            activeAttempt: {
                attemptId: attempt._id,
                examId: attempt.examId,
                examTitle: attempt.examTitle,
                durationMinutes: attempt.durationMinutes,
                startedAt: attempt.startedAt,
                expiresAt: attempt.expiresAt,
                remainingSeconds,
                answersCount: (attempt.answers || []).filter(a => a.selectedOption !== null && a.selectedOption !== undefined).length
            }
        });
    } catch (error) {
        console.error('Error fetching active attempt session:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to check active session.'
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

// POST /attempts/:id/security-event - Record exam security / focus loss event
router.post('/attempts/:id/security-event', protect, async (req, res) => {
    try {
        const attempt = await Attempt.findById(req.params.id);
        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Attempt session not found.' });
        }

        if (attempt.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized.' });
        }

        const { eventType, questionNumber = 1, remainingSeconds = 0, details = '' } = req.body;

        const validEvents = ['FULLSCREEN_EXIT', 'TAB_SWITCH', 'WINDOW_BLUR', 'PAGE_HIDDEN', 'NAVIGATION_ATTEMPT', 'REPEATED_FOCUS_LOSS', 'SECURITY_WARNING'];
        const safeEvent = validEvents.includes(eventType) ? eventType : 'WINDOW_BLUR';

        attempt.securityWarningCount = (attempt.securityWarningCount || 0) + 1;
        const warningCount = attempt.securityWarningCount;
        const MAX_SECURITY_WARNINGS = 3;

        attempt.securityEvents.push({
            eventType: safeEvent,
            timestamp: new Date(),
            questionNumber: Number(questionNumber) || 1,
            remainingSeconds: Number(remainingSeconds) || 0,
            warningCount,
            details: details ? String(details).substring(0, 300) : ''
        });

        await attempt.save();

        return res.status(200).json({
            success: true,
            warningCount,
            maxWarnings: MAX_SECURITY_WARNINGS,
            limitReached: warningCount >= MAX_SECURITY_WARNINGS,
            eventType: safeEvent,
            message: warningCount >= MAX_SECURITY_WARNINGS 
                ? 'Warning limit reached. Please follow the examination instructions.'
                : `Security warning ${warningCount} of ${MAX_SECURITY_WARNINGS} recorded.`
        });
    } catch (error) {
        console.error('Error logging security event:', error);
        return res.status(500).json({ success: false, message: 'Unable to log security event.' });
    }
});

// Helper: Process and log security event on an attempt
const handleSecurityEvent = async (attempt, req, res) => {
    const { eventType, questionNumber = 1, remainingSeconds = 0, details = '' } = req.body;
    const validEvents = ['FULLSCREEN_EXIT', 'TAB_SWITCH', 'WINDOW_BLUR', 'PAGE_HIDDEN', 'NAVIGATION_ATTEMPT', 'REPEATED_FOCUS_LOSS', 'SECURITY_WARNING'];
    const safeEvent = validEvents.includes(eventType) ? eventType : 'WINDOW_BLUR';

    attempt.securityWarningCount = (attempt.securityWarningCount || 0) + 1;
    const warningCount = attempt.securityWarningCount;
    const MAX_SECURITY_WARNINGS = 3;

    attempt.securityEvents.push({
        eventType: safeEvent,
        timestamp: new Date(),
        questionNumber: Number(questionNumber) || 1,
        remainingSeconds: Number(remainingSeconds) || 0,
        warningCount,
        details: details ? String(details).substring(0, 300) : ''
    });

    await attempt.save();

    return res.status(200).json({
        success: true,
        warningCount,
        maxWarnings: MAX_SECURITY_WARNINGS,
        limitReached: warningCount >= MAX_SECURITY_WARNINGS,
        eventType: safeEvent,
        message: warningCount >= MAX_SECURITY_WARNINGS 
            ? 'Warning limit reached. Please follow the examination instructions.'
            : `Security warning ${warningCount} of ${MAX_SECURITY_WARNINGS} recorded.`
    });
};

// POST /exams/:id/security-event - Record security event by exam ID
router.post('/exams/:id/security-event', protect, async (req, res) => {
    try {
        const activeAttempt = await Attempt.findOne({
            userId: req.user.id,
            examId: req.params.id,
            status: 'in-progress'
        }).sort({ createdAt: -1 });

        if (!activeAttempt) {
            return res.status(404).json({ success: false, message: 'No active attempt found for this exam.' });
        }

        return await handleSecurityEvent(activeAttempt, req, res);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to log security event.' });
    }
});

// Helper: Process exam scoring and persistence
const processExamSubmission = async (attempt, exam, rawAnswers, req, res) => {
    // If answers were passed in submit body, merge them with saved answers
    if (Array.isArray(rawAnswers) && rawAnswers.length > 0) {
        rawAnswers.forEach(subAns => {
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
    const startedAt = attempt.startedAt || now;
    const timeTakenSeconds = Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000));

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
};

// Unified Submission Route Handler (Supports attemptId, examId, and generic submit)
const handleUnifiedSubmission = async (req, res) => {
    try {
        const targetId = req.params.id || req.body.attemptId || req.body.examId;
        let attempt = null;

        // 1. Try finding Attempt by _id
        if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
            attempt = await Attempt.findById(targetId);
        }

        // 2. If not found by attempt _id, check if targetId was an examId
        if (!attempt && targetId && mongoose.Types.ObjectId.isValid(targetId)) {
            attempt = await Attempt.findOne({
                userId: req.user.id,
                examId: targetId,
                status: { $in: ['in-progress', 'timed-out'] }
            }).sort({ createdAt: -1 });
        }

        // 3. If still not found, check any active in-progress attempt for this user
        if (!attempt) {
            attempt = await Attempt.findOne({
                userId: req.user.id,
                status: 'in-progress'
            }).sort({ createdAt: -1 });
        }

        // 4. If still not found and targetId is valid, check ANY attempt for this user and exam
        if (!attempt && targetId && mongoose.Types.ObjectId.isValid(targetId)) {
            attempt = await Attempt.findOne({
                userId: req.user.id,
                examId: targetId
            }).sort({ createdAt: -1 });
        }

        // 5. If no attempt exists at all, auto-create one from target exam or latest published exam
        if (!attempt) {
            let exam = null;
            if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
                exam = await Exam.findById(targetId);
            }
            if (!exam) {
                exam = await Exam.findOne({ isPublished: true }).sort({ createdAt: -1 });
            }
            if (!exam) {
                return res.status(404).json({ success: false, message: 'Examination not found to submit.' });
            }

            attempt = await Attempt.create({
                userId: req.user.id,
                examId: exam._id,
                examTitle: exam.title,
                durationMinutes: exam.durationMinutes || 30,
                startedAt: new Date(),
                expiresAt: new Date(Date.now() + (exam.durationMinutes || 30) * 60000),
                status: 'in-progress',
                answers: []
            });
        }

        if (attempt.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized.' });
        }

        const exam = await Exam.findById(attempt.examId);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Associated exam not found.' });
        }

        return await processExamSubmission(attempt, exam, req.body.answers, req, res);
    } catch (error) {
        console.error('Error submitting exam:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to submit examination.'
        });
    }
};

// Route registrations for submission
router.post('/attempts/:id/submit', protect, handleUnifiedSubmission);
router.post('/attempts/submit', protect, handleUnifiedSubmission);
router.post('/exams/:id/submit', protect, handleUnifiedSubmission);
router.post('/exams/submit', protect, handleUnifiedSubmission);

module.exports = router;
