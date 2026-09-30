const mongoose = require('mongoose');

const answerItemSchema = new mongoose.Schema({
    questionId: {
        type: String,
        required: true
    },
    questionIndex: {
        type: Number,
        required: true
    },
    selectedOption: {
        type: Number, // 0, 1, 2, 3 or null if cleared
        default: null
    },
    isMarkedForReview: {
        type: Boolean,
        default: false
    },
    savedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const questionReviewSchema = new mongoose.Schema({
    questionId: String,
    questionText: String,
    options: [String],
    selectedOption: Number,
    correctOption: Number,
    isCorrect: Boolean,
    marksObtained: Number,
    explanation: String,
    subject: String
}, { _id: false });

const subjectBreakdownSchema = new mongoose.Schema({
    subject: String,
    total: Number,
    correct: Number,
    incorrect: Number,
    unanswered: Number,
    accuracy: Number
}, { _id: false });

const securityEventSchema = new mongoose.Schema({
    eventType: {
        type: String,
        enum: ['FULLSCREEN_EXIT', 'TAB_SWITCH', 'WINDOW_BLUR', 'PAGE_HIDDEN', 'NAVIGATION_ATTEMPT', 'REPEATED_FOCUS_LOSS', 'SECURITY_WARNING'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    questionNumber: {
        type: Number,
        default: 1
    },
    remainingSeconds: {
        type: Number,
        default: 0
    },
    warningCount: {
        type: Number,
        default: 1
    },
    details: {
        type: String,
        default: ''
    }
}, { _id: false });

const attemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
        index: true
    },
    examTitle: {
        type: String,
        required: true
    },
    durationMinutes: {
        type: Number,
        required: true
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    submittedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['in-progress', 'submitted', 'timed-out'],
        default: 'in-progress',
        index: true
    },
    answers: [answerItemSchema],
    securityEvents: {
        type: [securityEventSchema],
        default: []
    },
    securityWarningCount: {
        type: Number,
        default: 0
    },
    score: {
        totalQuestions: { type: Number, default: 0 },
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        incorrect: { type: Number, default: 0 },
        unanswered: { type: Number, default: 0 },
        totalMarks: { type: Number, default: 0 },
        obtainedMarks: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        passed: { type: Boolean, default: false },
        timeTakenSeconds: { type: Number, default: 0 },
        subjectBreakdown: [subjectBreakdownSchema],
        questionReview: [questionReviewSchema]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Attempt', attemptSchema);
