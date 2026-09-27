const mongoose = require('mongoose');

function arrayLimit(val) {
    return Array.isArray(val) && val.length === 4;
}

const examQuestionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [String],
        required: true,
        validate: [arrayLimit, '{PATH} must have exactly 4 options']
    },
    correctOption: {
        type: Number, // 0, 1, 2, or 3
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
        default: ''
    },
    subject: {
        type: String,
        default: 'General'
    },
    topic: {
        type: String,
        default: 'General'
    }
});

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        default: 'All Subjects'
    },
    durationMinutes: {
        type: Number,
        required: true,
        default: 30
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    passingMarks: {
        type: Number,
        default: 0
    },
    negativeMarking: {
        type: Boolean,
        default: true
    },
    negativeMarksPerQuestion: {
        type: Number,
        default: 0.25
    },
    marksPerQuestion: {
        type: Number,
        default: 1
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    instructions: {
        type: [String],
        default: [
            "Use Arrow Keys or N/P to move between questions.",
            "Press keys 1, 2, 3, or 4 to select options.",
            "Press R to hear the current question read aloud.",
            "Press M to mark or unmark the question for review.",
            "Press C to clear your chosen answer.",
            "Press T to check remaining examination time.",
            "The exam will automatically submit when time expires."
        ]
    },
    questions: [examQuestionSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Exam', examSchema);