const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const aiVisionService = require('../services/aiVisionService');

/**
 * @route   POST /api/ai/describe-visual
 * @desc    Generate structured, accessibility-focused visual descriptions for charts, diagrams, tables & formulas
 * @access  Candidate / Public
 */
router.post('/describe-visual', async (req, res) => {
    try {
        const {
            questionId = '',
            examId = '',
            imageUrl = '',
            imageType = '',
            visualDescription = null,
            visualAlt = '',
            questionText = '',
            level = 'quick'
        } = req.body;

        const analysis = await aiVisionService.analyzeVisualQuestion({
            questionId,
            examId,
            imageUrl,
            imageType,
            visualDescription,
            visualAlt,
            questionText
        });

        const spokenDescription = level === 'detailed' ? analysis.detailed : analysis.quick;

        return res.status(200).json({
            success: true,
            quick: analysis.quick,
            detailed: analysis.detailed,
            spokenDescription,
            imageType: analysis.imageType,
            cached: analysis.cached
        });
    } catch (err) {
        console.error('[AI Vision Route] Error processing visual request:', err);
        return res.status(200).json({
            success: true,
            quick: 'Visual description is temporarily unavailable.',
            detailed: 'Visual description is temporarily unavailable. Please proceed with the examination questions.',
            spokenDescription: 'Visual description is temporarily unavailable.',
            fallback: true
        });
    }
});

/**
 * @route   POST /api/ai/assistant
 * @desc    Generate accessible answers for platform guidance, practice queries, and navigation
 * @access  Public / Candidate
 */
router.post('/assistant', async (req, res, next) => {
    try {
        const { message, language = 'en', context = {}, isExamActive } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'A message query is required.'
            });
        }

        const effectiveContext = {
            ...context,
            isExamActive: isExamActive !== undefined ? isExamActive : context.isExamActive
        };

        const result = await aiService.generateResponse(message, language, effectiveContext);

        res.status(200).json({
            success: true,
            reply: result.reply,
            spokenText: result.reply,
            restricted: result.restricted || false,
            provider: result.provider
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
