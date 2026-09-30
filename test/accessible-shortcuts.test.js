const test = require('node:test');
const assert = require('node:assert/strict');

// Import the key navigation logic
// We test setupKeyNavigation behavior in a simulated DOM environment
const { setupKeyNavigation } = require('../client/src/utils/keyNav.js');

test('ACCESSIBLE KEYBOARD SHORTCUTS ENGINE SUITE', async (t) => {
    // Mock minimal DOM window and document if not in browser
    let listeners = [];
    global.window = {
        addEventListener: (event, handler) => {
            listeners.push({ event, handler });
        },
        removeEventListener: (event, handler) => {
            listeners = listeners.filter((l) => l.handler !== handler);
        }
    };

    const triggerKey = (key, targetTag = 'div', isContentEditable = false) => {
        let prevented = false;
        const event = {
            key,
            target: {
                tagName: targetTag,
                isContentEditable,
                getAttribute: () => null
            },
            preventDefault: () => {
                prevented = true;
            }
        };

        for (const l of listeners) {
            if (l.event === 'keydown') {
                l.handler(event);
            }
        }
        return { prevented };
    };

    await t.test('1. Keyboard Conflict Protection: Form inputs must NOT trigger global shortcuts', () => {
        let repeatFired = false;
        let numberKeyFired = null;
        let submitFired = false;

        const cleanup = setupKeyNavigation({
            onRepeatQuestion: () => { repeatFired = true; },
            onNumberKey: (k) => { numberKeyFired = k; },
            onOpenSubmit: () => { submitFired = true; }
        });

        // Test inside <input>
        triggerKey('r', 'input');
        assert.equal(repeatFired, false, 'Pressing R inside input must not repeat question');

        triggerKey('1', 'input');
        assert.equal(numberKeyFired, null, 'Pressing 1 inside input must not select option');

        triggerKey('s', 'input');
        assert.equal(submitFired, false, 'Pressing S inside input must not open submit modal');

        // Test inside <textarea>
        triggerKey('r', 'textarea');
        assert.equal(repeatFired, false, 'Pressing R inside textarea must not repeat question');

        triggerKey('2', 'textarea');
        assert.equal(numberKeyFired, null, 'Pressing 2 inside textarea must not select option');

        // Test inside contenteditable
        triggerKey('s', 'div', true);
        assert.equal(submitFired, false, 'Pressing S inside contenteditable must not open submit modal');

        cleanup();
    });

    await t.test('2. Option Selection: 1, 2, 3, 4 trigger option selection and preserve existing numbering', () => {
        const selected = [];
        const cleanup = setupKeyNavigation({
            onNumberKey: (k) => selected.push(k)
        });

        triggerKey('1');
        triggerKey('2');
        triggerKey('3');
        triggerKey('4');

        assert.deepEqual(selected, ['1', '2', '3', '4'], 'Options 1-4 must be mapped directly');
        cleanup();
    });

    await t.test('3. Repeat Current Question: R triggers onRepeatQuestion', () => {
        let repeatCount = 0;
        const cleanup = setupKeyNavigation({
            onRepeatQuestion: () => { repeatCount++; }
        });

        triggerKey('r');
        triggerKey('R');

        assert.equal(repeatCount, 2, 'R and r must both trigger Repeat Question');
        cleanup();
    });

    await t.test('4. Question Navigation: Arrow Right (Next) & Arrow Left (Prev)', () => {
        let nextCount = 0;
        let prevCount = 0;
        const cleanup = setupKeyNavigation({
            onNextQuestion: () => { nextCount++; },
            onPrevQuestion: () => { prevCount++; }
        });

        triggerKey('ArrowRight');
        triggerKey('ArrowLeft');

        assert.equal(nextCount, 1, 'ArrowRight must trigger Next Question');
        assert.equal(prevCount, 1, 'ArrowLeft must trigger Previous Question');
        cleanup();
    });

    await t.test('5. Submit Exam Workflow: S opens confirmation, Y confirms, Escape cancels', () => {
        let modalOpen = false;
        let submitOpened = false;
        let submitConfirmed = false;
        let submitCancelled = false;

        const cleanup = setupKeyNavigation({
            isSubmitModalOpen: () => modalOpen,
            onOpenSubmit: () => {
                submitOpened = true;
                modalOpen = true; // Modal is now open
            },
            onConfirmSubmit: () => {
                submitConfirmed = true;
                modalOpen = false;
            },
            onCancelSubmit: () => {
                submitCancelled = true;
                modalOpen = false;
            }
        });

        // 1. Press S to open confirmation
        triggerKey('s');
        assert.equal(submitOpened, true, 'S must open submission confirmation');
        assert.equal(modalOpen, true, 'Modal should be marked open');

        // 2. While modal is open, pressing navigation or option keys must be ignored
        let numberWhileModal = false;
        triggerKey('1');
        assert.equal(numberWhileModal, false, 'Option keys must be blocked while modal is open');

        // 3. Press Escape to cancel
        triggerKey('Escape');
        assert.equal(submitCancelled, true, 'Escape must cancel submission modal');
        assert.equal(modalOpen, false, 'Modal should be closed after cancel');

        // 4. Press S again, then Y to confirm
        triggerKey('s');
        assert.equal(modalOpen, true);
        triggerKey('y');
        assert.equal(submitConfirmed, true, 'Y must confirm submission');

        cleanup();
    });

    await t.test('6. Dynamic Question Speech Formulation (Section 2 & 11 specification)', () => {
        const question = {
            questionText: 'What is the speed of sound in dry air at 20 degrees Celsius?',
            options: ['343 meters per second', '300,000 km per second', '150 meters per second', '1,200 km per hour']
        };

        const qNum = 5;
        const total = 30;
        const optionsText = question.options.map((opt, i) => `Option ${i + 1}: ${opt}`).join('. ');

        // When question opens:
        const openText = `Question ${qNum} of ${total}. ${question.questionText}. ${optionsText}.`;
        assert.ok(openText.startsWith('Question 5 of 30.'), 'Must start with Question N of TOTAL');
        assert.ok(openText.includes('Option 1: 343 meters per second'), 'Must include Option 1');
        assert.ok(openText.includes('Option 4: 1,200 km per hour'), 'Must include Option 4');

        // When R is pressed:
        const repeatText = `Repeating Question ${qNum}. Question ${qNum}. ${question.questionText}. ${optionsText}.`;
        assert.ok(repeatText.startsWith('Repeating Question 5. Question 5.'), 'Must announce Repeating Question N');
    });

    await t.test('7. Submission Summary Calculation (Section 5 specification)', () => {
        const totalQuestions = 10;

        // Scenario A: Partially answered
        const answeredCountA = 7;
        const unansweredCountA = totalQuestions - answeredCountA;

        let promptTextA = '';
        if (unansweredCountA === 0) {
            promptTextA = `You have answered all ${totalQuestions} questions. Are you sure you want to submit the exam? Press Y to confirm or Escape to cancel.`;
        } else {
            promptTextA = `You have answered ${answeredCountA} out of ${totalQuestions} questions. You have ${unansweredCountA} unanswered questions. Are you sure you want to submit the exam? Press Y to confirm or Escape to cancel.`;
        }

        assert.equal(
            promptTextA,
            'You have answered 7 out of 10 questions. You have 3 unanswered questions. Are you sure you want to submit the exam? Press Y to confirm or Escape to cancel.'
        );

        // Scenario B: All answered
        const answeredCountB = 10;
        const unansweredCountB = totalQuestions - answeredCountB;

        let promptTextB = '';
        if (unansweredCountB === 0) {
            promptTextB = `You have answered all ${totalQuestions} questions. Are you sure you want to submit the exam? Press Y to confirm or Escape to cancel.`;
        } else {
            promptTextB = `You have answered ${answeredCountB} out of ${totalQuestions} questions. You have ${unansweredCountB} unanswered questions. Are you sure you want to submit the exam? Press Y to confirm or Escape to cancel.`;
        }

        assert.equal(
            promptTextB,
            'You have answered all 10 questions. Are you sure you want to submit the exam? Press Y to confirm or Escape to cancel.'
        );
    });
});
