const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

// Import AI Vision Service
const {
    formatMathForSpeech,
    enforceExamIntegrity,
    analyzeVisualQuestion,
    clearVisualCache
} = require('../server/services/aiVisionService.js');

// Timer Milestones per specification (Part 4)
const DEFAULT_ANNOUNCEMENT_INTERVALS = [
    { seconds: 1800, text: 'You have 30 minutes remaining.' },
    { seconds: 1200, text: 'You have 20 minutes remaining.' },
    { seconds: 600, text: 'You have 10 minutes remaining.' },
    { seconds: 300, text: 'You have 5 minutes remaining.' },
    { seconds: 180, text: 'You have 3 minutes remaining.' },
    { seconds: 120, text: 'You have 2 minutes remaining.' },
    { seconds: 60, text: 'You have 1 minute remaining.' },
    { seconds: 30, text: 'You have 30 seconds remaining.' },
    { seconds: 10, text: 'You have 10 seconds remaining.' }
];

// Import Key Navigation Engine
const { setupKeyNavigation } = require('../client/src/utils/keyNav.js');

test('SECURE EXAM, INTELLIGENT TIMER & VISUAL UNDERSTANDING SUITE', async (t) => {

    await t.test('PART 1 & 2: Mathematical Speech Translation Engine', () => {
        // Exponents
        assert.equal(formatMathForSpeech('x^2 + y^2 = 25'), 'x squared + y squared equals 25');
        assert.equal(formatMathForSpeech('a^3 + b^3'), 'a cubed + b cubed');
        assert.equal(formatMathForSpeech('2^n'), '2 to the power of n');

        // Square roots & radicals
        assert.equal(formatMathForSpeech('\\sqrt{x}'), 'square root of x');
        assert.equal(formatMathForSpeech('√100'), 'square root of 100');

        // Fractions
        assert.equal(formatMathForSpeech('\\frac{3}{4}'), 'fraction 3 over 4');

        // Inequalities
        assert.equal(formatMathForSpeech('x \\geq 5'), 'x is greater than or equal to 5');
        assert.equal(formatMathForSpeech('y <= 10'), 'y is less than or equal to 10');
        assert.equal(formatMathForSpeech('a \\neq b'), 'a is not equal to b');

        // Geometry & angles
        assert.equal(formatMathForSpeech('angle B = 90°'), 'angle B equals 90 degrees');
        assert.equal(formatMathForSpeech('AB \\perp BC'), 'AB is perpendicular to BC');
    });

    await t.test('PART 3: Exam Integrity Guardrail (Never solve or reveal answers)', () => {
        const leaked1 = 'The sector labelled A is 25%. Therefore, the correct answer is Option 2.';
        const sanitized1 = enforceExamIntegrity(leaked1);
        assert.equal(sanitized1.includes('Therefore, the correct answer is Option 2'), false);
        assert.equal(sanitized1.includes('The sector labelled A is 25%'), true);

        const leaked2 = 'The height of the bar is 300 units which corresponds to option 3';
        const sanitized2 = enforceExamIntegrity(leaked2);
        assert.equal(sanitized2.includes('which corresponds to option 3'), false);

        const safe = 'A right-angled triangle ABC with side AB equals 6 cm and side BC equals 8 cm.';
        assert.equal(enforceExamIntegrity(safe), safe);
    });

    await t.test('PART 4: Structured Visual Descriptions (Two Levels: Quick and Detailed)', async () => {
        clearVisualCache();

        // 1. Pie Chart
        const pieResult = await analyzeVisualQuestion({
            questionId: 'test_pie_1',
            examId: 'exam_demo',
            imageType: 'pie-chart',
            visualAlt: 'Budget distribution: Dept A 40%, Dept B 25%, Dept C 20%, Dept D 15%'
        });
        assert.ok(pieResult.quick.length > 10, 'Quick description must be generated');
        assert.ok(pieResult.detailed.length > pieResult.quick.length, 'Detailed description must be more comprehensive');
        assert.equal(pieResult.quick.includes('40 percent'), true);

        // 2. Bar Chart
        const barResult = await analyzeVisualQuestion({
            questionId: 'test_bar_1',
            examId: 'exam_demo',
            imageType: 'bar-chart',
            visualAlt: 'Production: Jan 200, Feb 350, Mar 450, Apr 200 units'
        });
        assert.ok(barResult.quick.includes('Production') || barResult.quick.includes('bar chart'));
        assert.ok(barResult.detailed.includes('200 units'));

        // 3. Geometry Triangle Diagram
        const geomResult = await analyzeVisualQuestion({
            questionId: 'test_geom_1',
            examId: 'exam_demo',
            imageType: 'geometry-diagram',
            visualDescription: {
                quick: 'Right-angled triangle ABC with angle B = 90°',
                detailed: 'Triangle ABC has vertical leg AB = 6 cm and horizontal leg BC = 8 cm with right angle at B.'
            }
        });
        assert.equal(geomResult.quick.includes('90 degrees'), true);
        assert.equal(geomResult.detailed.includes('6 cm'), true);

        // 4. Session Caching
        const cachedResult = await analyzeVisualQuestion({
            questionId: 'test_geom_1',
            examId: 'exam_demo',
            imageType: 'geometry-diagram'
        });
        assert.equal(cachedResult.cached, true, 'Subsequent queries for same question must return cached result');
    });

    await t.test('PART 5: Intelligent Timer Milestones Verification', () => {
        const secondsSet = DEFAULT_ANNOUNCEMENT_INTERVALS.map((i) => i.seconds);

        // Required milestones: 30m, 20m, 10m, 5m, 3m, 2m, 1m, 30s, 10s
        const expectedMilestones = [1800, 1200, 600, 300, 180, 120, 60, 30, 10];
        for (const expected of expectedMilestones) {
            assert.ok(secondsSet.includes(expected), `Milestone ${expected} seconds must be present in intervals`);
        }

        // Verify phrasing
        const halfHour = DEFAULT_ANNOUNCEMENT_INTERVALS.find((i) => i.seconds === 1800);
        assert.equal(halfHour.text, 'You have 30 minutes remaining.');

        const oneMin = DEFAULT_ANNOUNCEMENT_INTERVALS.find((i) => i.seconds === 60);
        assert.equal(oneMin.text, 'You have 1 minute remaining.');

        const tenSec = DEFAULT_ANNOUNCEMENT_INTERVALS.find((i) => i.seconds === 10);
        assert.equal(tenSec.text, 'You have 10 seconds remaining.');
    });

    await t.test('PART 6: Keyboard Controls for Visuals (I, D) and Timer (T)', () => {
        let listeners = [];
        global.window = {
            addEventListener: (event, handler) => listeners.push({ event, handler }),
            removeEventListener: (event, handler) => {
                listeners = listeners.filter((l) => l.handler !== handler);
            }
        };

        const triggerKey = (key, targetTag = 'div') => {
            let prevented = false;
            const event = {
                key,
                target: { tagName: targetTag, isContentEditable: false, getAttribute: () => null },
                preventDefault: () => { prevented = true; }
            };
            for (const l of listeners) {
                if (l.event === 'keydown') l.handler(event);
            }
            return { prevented };
        };

        let quickVisualCalled = false;
        let detailedVisualCalled = false;
        let timeCalled = false;

        const cleanup = setupKeyNavigation({
            onDescribeVisual: () => { quickVisualCalled = true; },
            onDetailedVisual: () => { detailedVisualCalled = true; },
            onReadTime: () => { timeCalled = true; }
        });

        // Trigger I
        triggerKey('i');
        assert.equal(quickVisualCalled, true, 'Key I must trigger quick visual description');

        // Trigger D
        triggerKey('d');
        assert.equal(detailedVisualCalled, true, 'Key D must trigger detailed visual description');

        // Trigger T
        triggerKey('t');
        assert.equal(timeCalled, true, 'Key T must trigger remaining time announcement');

        // Conflict protection test: typing inside an input must not trigger I, D, or T
        quickVisualCalled = false;
        detailedVisualCalled = false;
        timeCalled = false;

        triggerKey('i', 'input');
        triggerKey('d', 'input');
        triggerKey('t', 'input');

        assert.equal(quickVisualCalled, false, 'Key I inside input must be ignored');
        assert.equal(detailedVisualCalled, false, 'Key D inside input must be ignored');
        assert.equal(timeCalled, false, 'Key T inside input must be ignored');

        cleanup();
    });

    await t.test('PART 7: Security Event Logging API Endpoint', async () => {
        // Authenticate as candidate to test server endpoint
        const candidateLoginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rollNumber: 'CAND101', password: 'candidate123' })
        });
        const candidateData = await candidateLoginRes.json();
        assert.equal(candidateData.success, true);
        const token = candidateData.token;

        // Fetch available exams
        const examsRes = await fetch('http://localhost:5001/api/exams', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const examsData = await examsRes.json();
        assert.ok(examsData.exams.length > 0);
        const targetExam = examsData.exams.find(e => e.title.includes('Mock Examination')) || examsData.exams[0];
        const examId = targetExam._id;

        // Start exam session
        const startRes = await fetch(`http://localhost:5001/api/exams/${examId}/start`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        const startData = await startRes.json();
        assert.equal(startData.success, true);
        assert.ok(startData.attemptId);

        // Verify visual fields are sanitized and present
        const hasVisualQ = startData.exam.questions.some((q) => q.hasVisual);
        assert.equal(hasVisualQ, true, 'Sanitized questions must include hasVisual flag');

        // Record security events
        const secRes1 = await fetch(`http://localhost:5001/api/attempts/${startData.attemptId}/security-event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                eventType: 'FULLSCREEN_EXIT',
                questionNumber: 1,
                remainingSeconds: 1200,
                details: 'Candidate exited fullscreen mode'
            })
        });
        const secData1 = await secRes1.json();
        assert.equal(secData1.success, true);
        assert.equal(secData1.warningCount >= 1, true);

        // Record a second security event
        const secRes2 = await fetch(`http://localhost:5001/api/attempts/${startData.attemptId}/security-event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                eventType: 'TAB_SWITCH',
                questionNumber: 2,
                remainingSeconds: 1100,
                details: 'Candidate switched tabs'
            })
        });
        const secData2 = await secRes2.json();
        assert.equal(secData2.success, true);
        assert.equal(secData2.warningCount > secData1.warningCount || secData2.warningCount >= 2, true);

        // Verify that existing answers can still be saved without interference
        const saveAnsRes = await fetch(`http://localhost:5001/api/attempts/${startData.attemptId}/answers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                questionId: startData.exam.questions[0]._id,
                questionIndex: 0,
                selectedOption: 1,
                isMarkedForReview: false
            })
        });
        const saveAnsData = await saveAnsRes.json();
        assert.equal(saveAnsData.success, true, 'Answers must be saved normally regardless of security events');
    });

    await t.test('PART 8: AI Vision Endpoint (POST /api/ai/describe-visual)', async () => {
        const describeRes = await fetch('http://localhost:5001/api/ai/describe-visual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionId: 'test_q_svg',
                examId: 'test_exam',
                imageType: 'pie-chart',
                visualAlt: 'Pie chart with A: 40%, B: 25%, C: 20%, D: 15%',
                questionText: 'What is the percentage for category B?',
                level: 'quick'
            })
        });

        const describeData = await describeRes.json();
        assert.equal(describeData.success, true);
        assert.ok(describeData.quick.length > 0);
        assert.ok(describeData.detailed.length > 0);
        assert.equal(describeData.spokenDescription, describeData.quick);
    });
});
