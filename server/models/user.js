const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
    language: {
        type: String,
        enum: ['en', 'hi'],
        default: 'en'
    },
    speechRate: {
        type: Number,
        default: 1.0,
        min: 0.5,
        max: 2.0
    },
    voicePitch: {
        type: Number,
        default: 1.0,
        min: 0.5,
        max: 1.5
    },
    theme: {
        type: String,
        enum: ['high-contrast-yellow', 'high-contrast-cyan', 'standard-dark', 'soft-light'],
        default: 'high-contrast-yellow'
    },
    fontSize: {
        type: String,
        enum: ['normal', 'large', 'extra-large'],
        default: 'large'
    },
    reducedMotion: {
        type: Boolean,
        default: false
    },
    keyboardNavigation: {
        type: Boolean,
        default: true
    },
    voiceCommands: {
        type: Boolean,
        default: true
    },
    autoReadQuestion: {
        type: Boolean,
        default: true
    },
    screenReaderAnnounce: {
        type: Boolean,
        default: true
    }
}, { _id: false });

const userSchema = new mongoose.Schema({
    rollNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        trim: true,
        default: 'Candidate'
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'candidate', 'admin'],
        default: 'candidate'
    },
    isExamCompleted: {
        type: Boolean,
        default: false
    },
    preferences: {
        type: userPreferencesSchema,
        default: () => ({})
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);