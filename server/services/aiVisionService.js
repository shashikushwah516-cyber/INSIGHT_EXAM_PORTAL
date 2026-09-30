/**
 * Visual Question Understanding Service for Visually Impaired Candidates
 * 
 * Capabilities:
 * 1. Analyzes charts (pie, bar, line), geometry diagrams, coordinate graphs, tables, and mathematical equations.
 * 2. Formats mathematical expressions into natural spoken language (e.g., x^2 -> "x squared", \sqrt{x} -> "square root of x").
 * 3. Provides two levels of descriptions: Level 1 (Quick summary) and Level 2 (Detailed breakdown).
 * 4. Strictly enforces Exam Integrity: describes visual information accurately WITHOUT solving the question or revealing the correct option.
 * 5. In-memory session caching to avoid redundant API or processing overhead.
 * 6. Graceful accessible fallbacks if external vision service is unavailable.
 */

// In-memory description cache: keyed by `${examId || 'general'}_${questionId || imageKey}`
const visualDescriptionCache = new Map();

/**
 * Format mathematical symbols, equations, and expressions into candidate-friendly spoken words
 * @param {string} text - Mathematical or descriptive text
 * @returns {string} - Spoken mathematical representation
 */
function formatMathForSpeech(text) {
    if (!text || typeof text !== 'string') return '';

    let spoken = text;

    // Powers and exponents
    spoken = spoken.replace(/([a-zA-Z0-9]+)\^2(?![0-9])/g, '$1 squared');
    spoken = spoken.replace(/([a-zA-Z0-9]+)\^{2}/g, '$1 squared');
    spoken = spoken.replace(/([a-zA-Z0-9]+)\^3(?![0-9])/g, '$1 cubed');
    spoken = spoken.replace(/([a-zA-Z0-9]+)\^{3}/g, '$1 cubed');
    spoken = spoken.replace(/([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/g, '$1 to the power of $2');
    spoken = spoken.replace(/([a-zA-Z0-9]+)\^{([^}]+)}/g, '$1 to the power of $2');

    // Square roots & radicals
    spoken = spoken.replace(/\\sqrt\[([0-9]+)\]{([^}]+)}/g, 'the $1th root of $2');
    spoken = spoken.replace(/\\sqrt{([^}]+)}/g, 'square root of $1');
    spoken = spoken.replace(/√([a-zA-Z0-9]+)/g, 'square root of $1');

    // Fractions
    spoken = spoken.replace(/\\frac{([^}]+)}{([^}]+)}/g, 'fraction $1 over $2');

    // Inequalities & Comparison
    spoken = spoken.replace(/\\geq|>=|≥/g, ' is greater than or equal to ');
    spoken = spoken.replace(/\\leq|<=|≤/g, ' is less than or equal to ');
    spoken = spoken.replace(/\\neq|!=|≠/g, ' is not equal to ');
    spoken = spoken.replace(/\\approx|≈/g, ' is approximately equal to ');
    spoken = spoken.replace(/>/g, ' is greater than ');
    spoken = spoken.replace(/</g, ' is less than ');
    spoken = spoken.replace(/=/g, ' equals ');

    // Geometric symbols
    spoken = spoken.replace(/\\perp|⟂/g, ' is perpendicular to ');
    spoken = spoken.replace(/\\parallel|∥/g, ' is parallel to ');
    spoken = spoken.replace(/\\angle|∠/g, 'angle ');
    spoken = spoken.replace(/\\triangle|△/g, 'triangle ');
    spoken = spoken.replace(/\\circ|°/g, ' degrees');

    // Greek letters & constants
    spoken = spoken.replace(/\\pi|π/g, 'pi');
    spoken = spoken.replace(/\\theta|θ/g, 'theta');
    spoken = spoken.replace(/\\alpha|α/g, 'alpha');
    spoken = spoken.replace(/\\beta|β/g, 'beta');
    spoken = spoken.replace(/\\pm|±/g, ' plus or minus ');
    spoken = spoken.replace(/%/g, ' percent');

    // Clean multiple spaces
    spoken = spoken.replace(/\s+/g, ' ').trim();
    return spoken;
}

/**
 * Anti-spoiler integrity guardrail:
 * Strips any phrasing that attempts to answer the question or suggest an option choice.
 * @param {string} text - Candidate description
 * @returns {string} - Clean, descriptive text
 */
function enforceExamIntegrity(text) {
    if (!text || typeof text !== 'string') return '';

    let cleaned = text;

    // Remove direct option pointers
    const spoilerPatterns = [
        /(?:therefore|hence|thus|so)\s*,?\s*(?:the\s+)?(?:correct\s+)?answer\s+(?:is|would be)\s*(?:option\s*[1-4A-Da-d]|choice\s*[1-4A-Da-d]|#?[1-4])/gi,
        /(?:the\s+)?correct\s+(?:option|answer|choice)\s+is\s*(?:option\s*)?[1-4A-Da-d]/gi,
        /option\s+[1-4A-Da-d]\s+is\s+(?:the\s+)?correct(?:\s+answer)?/gi,
        /which\s+corresponds\s+to\s+option\s+[1-4A-Da-d]/gi,
        /select\s+option\s+[1-4A-Da-d]/gi,
        /this\s+gives\s+(?:us\s+)?option\s+[1-4A-Da-d]/gi
    ];

    for (const pattern of spoilerPatterns) {
        cleaned = cleaned.replace(pattern, '');
    }

    return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Built-in structured visual descriptor generator
 * Used when questions contain predefined visual specs or when external AI is not needed/available.
 */
function generateStructuredVisualDescription({
    imageType = '',
    visualDescription = null,
    visualAlt = '',
    questionText = '',
    metadata = {}
}) {
    // If high-quality author-provided visual descriptions exist, format math and sanitize
    if (visualDescription && (visualDescription.quick || visualDescription.detailed)) {
        return {
            quick: enforceExamIntegrity(formatMathForSpeech(visualDescription.quick || visualAlt || 'Visual figure for question.')),
            detailed: enforceExamIntegrity(formatMathForSpeech(visualDescription.detailed || visualDescription.quick || visualAlt)),
            imageType: imageType || 'general',
            source: 'curated'
        };
    }

    // Dynamic generation based on image type and accessible alt text
    const cleanAlt = visualAlt ? formatMathForSpeech(visualAlt) : '';
    let quick = '';
    let detailed = '';

    switch (imageType) {
        case 'pie-chart':
            quick = cleanAlt || 'This question contains a pie chart showing proportional distribution across categories.';
            detailed = cleanAlt
                ? `Detailed description: ${cleanAlt} Note the relative sector angles and percentage values displayed.`
                : 'Detailed description: The image is a circular pie chart divided into sectors. Refer to the question text and category labels to calculate the requested values.';
            break;

        case 'bar-chart':
            quick = cleanAlt || 'This question contains a bar chart comparing data values across categories.';
            detailed = cleanAlt
                ? `Detailed description: ${cleanAlt} Examine the horizontal and vertical axes to compare the bar heights.`
                : 'Detailed description: The image contains a bar chart with horizontal category markers and vertical numerical values. Compare the relative bar heights to evaluate the question.';
            break;

        case 'line-graph':
            quick = cleanAlt || 'This question contains a line graph showing trends over a continuous variable.';
            detailed = cleanAlt
                ? `Detailed description: ${cleanAlt} Follow the plotted points and slope changes along the axes.`
                : 'Detailed description: Plotted coordinates are connected by line segments indicating changes over time or distance. Check the axis scales and key coordinates.';
            break;

        case 'geometry-diagram':
            quick = cleanAlt || 'This question contains a geometric figure with labelled points, angles, and dimensions.';
            detailed = cleanAlt
                ? `Detailed description: ${cleanAlt} Use the indicated lengths and angle markings to establish geometric relationships.`
                : 'Detailed description: The diagram illustrates geometric shapes such as triangles, circles, or polygons with lettered vertices and dimension markers.';
            break;

        case 'coordinate-graph':
            quick = cleanAlt || 'This question contains a Cartesian coordinate plane with axes, grid lines, and plotted points.';
            detailed = cleanAlt
                ? `Detailed description: ${cleanAlt} Note the x-axis and y-axis coordinates, intercepts, and slope.`
                : 'Detailed description: The visual presents an x and y coordinate grid with origin at (0, 0). Identify plotted coordinates by their horizontal and vertical distances.';
            break;

        case 'table-image':
            quick = cleanAlt || 'This question contains a data table organized into rows and columns.';
            detailed = cleanAlt
                ? `Detailed description: ${cleanAlt}`
                : 'Detailed description: The table organizes categories into columns and rows with header titles and numerical cells.';
            break;

        case 'equation-image':
            quick = cleanAlt || 'This question contains a mathematical expression or equation presented as an image.';
            detailed = cleanAlt
                ? `Detailed description: ${cleanAlt}`
                : 'Detailed description: A formal mathematical formula with symbols, exponents, or fraction notations. Read the expression components carefully.';
            break;

        default:
            quick = cleanAlt || 'This question contains an accompanying visual figure.';
            detailed = cleanAlt
                ? `Detailed description: ${cleanAlt}`
                : `Detailed description: An illustrative visual diagram is provided to accompany the question: "${questionText.substring(0, 80)}...".`;
            break;
    }

    return {
        quick: enforceExamIntegrity(formatMathForSpeech(quick)),
        detailed: enforceExamIntegrity(formatMathForSpeech(detailed)),
        imageType: imageType || 'general',
        source: 'structured-engine'
    };
}

/**
 * Main service abstraction: analyzeVisualQuestion
 * 
 * @param {object} params
 * @param {string} params.questionId - Question identifier
 * @param {string} params.examId - Active exam identifier
 * @param {string} params.imageUrl - URL or data URI of image
 * @param {string} params.imageType - Type of visual
 * @param {object} params.visualDescription - Pre-existing quick/detailed description
 * @param {string} params.visualAlt - Alt text
 * @param {string} params.questionText - Text of question
 * @returns {Promise<{quick: string, detailed: string, imageType: string, cached: boolean}>}
 */
async function analyzeVisualQuestion({
    questionId = '',
    examId = '',
    imageUrl = '',
    imageType = '',
    visualDescription = null,
    visualAlt = '',
    questionText = '',
    forceRefresh = false
} = {}) {
    const cacheKey = `${examId || 'general'}_${questionId || imageUrl || 'default'}`;

    // Return cached description if available (Part 13)
    if (!forceRefresh && visualDescriptionCache.has(cacheKey)) {
        const cached = visualDescriptionCache.get(cacheKey);
        return { ...cached, cached: true };
    }

    let result = null;

    // Check if external Vision API is configured
    const apiKey = process.env.AI_VISION_API_KEY || process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    const apiUrl = process.env.AI_VISION_API_URL || null;

    if (apiKey && apiUrl && imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:image'))) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout guard

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    imageUrl,
                    prompt: `You are an accessibility visual describer for a visually impaired candidate taking a competitive examination.
Describe the visual content accurately in natural spoken mathematical language (e.g., 'x squared', 'square root of x', 'is greater than or equal to').
CRITICAL RULES FOR EXAM INTEGRITY:
1. Describe the figures, axes, scales, coordinates, points, sectors, percentages, or tables.
2. DO NOT SOLVE THE PROBLEM.
3. DO NOT STATE THE ANSWER OR REVEAL WHICH OPTION IS CORRECT.
4. Output JSON format: {"quick": "1-2 sentence overview", "detailed": "thorough structured description"}.
Question context: "${questionText}"`,
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                let parsed = null;
                try {
                    parsed = typeof data.reply === 'string' ? JSON.parse(data.reply) : data;
                } catch {
                    parsed = { quick: data.quick || data.reply, detailed: data.detailed || data.reply };
                }

                if (parsed && (parsed.quick || parsed.detailed)) {
                    result = {
                        quick: enforceExamIntegrity(formatMathForSpeech(parsed.quick || '')),
                        detailed: enforceExamIntegrity(formatMathForSpeech(parsed.detailed || parsed.quick || '')),
                        imageType: imageType || 'ai-vision',
                        source: 'external-vision-api'
                    };
                }
            }
        } catch (err) {
            console.warn('[AI Vision Service] External API call fallback triggered:', err.message);
        }
    }

    // If external call was not used or failed, use the structured accessibility generator
    if (!result) {
        result = generateStructuredVisualDescription({
            imageType,
            visualDescription,
            visualAlt,
            questionText
        });
    }

    // Cache the result for the session (Part 13)
    visualDescriptionCache.set(cacheKey, result);

    return {
        ...result,
        cached: false
    };
}

/**
 * Clear cache for a specific session or entire cache
 */
function clearVisualCache(examId = null) {
    if (!examId) {
        visualDescriptionCache.clear();
        return;
    }
    for (const key of visualDescriptionCache.keys()) {
        if (key.startsWith(`${examId}_`)) {
            visualDescriptionCache.delete(key);
        }
    }
}

module.exports = {
    analyzeVisualQuestion,
    formatMathForSpeech,
    enforceExamIntegrity,
    clearVisualCache
};
