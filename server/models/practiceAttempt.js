const mongoose = require('mongoose');

const practiceAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    subject: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        default: 'All Topics'
    },
    difficulty: {
        type: String,
        default: 'all'
    },
    totalQuestions: {
        type: Number,
        default: 0
    },
    attempted: {
        type: Number,
        default: 0
    },
    correct: {
        type: Number,
        default: 0
    },
    incorrect: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: 0
    },
    accuracy: {
        type: Number,
        default: 0
    },
    timeTakenSeconds: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PracticeAttempt', practiceAttemptSchema);
