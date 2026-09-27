const mongoose = require('mongoose');

function arrayLimit(val) {
    return Array.isArray(val) && val.length === 4;
}

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    topic: {
        type: String,
        trim: true,
        default: 'General'
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    questionType: {
        type: String,
        default: 'single-choice'
    },
    options: {
        type: [String],
        required: true,
        validate: [arrayLimit, '{PATH} must have exactly 4 options']
    },
    correctOption: {
        type: Number, // 0, 1, 2, 3
        required: true,
        min: 0,
        max: 3
    },
    marks: {
        type: Number,
        default: 1
    },
    negativeMarks: {
        type: Number,
        default: 0.25
    },
    explanation: {
        type: String,
        default: 'No explanation provided.'
    },
    audioText: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
