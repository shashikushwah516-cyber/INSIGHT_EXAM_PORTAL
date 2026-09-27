const test = require('node:test');
const assert = require('node:assert/strict');

const BACKEND_URL = 'http://localhost:5001';
const FRONTEND_URL = 'http://localhost:5173';

test('1. Backend server is alive and healthy', async () => {
    const res = await fetch(`${BACKEND_URL}/`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.name.includes('Insight Exam'));
});

test('2. Frontend dev server is serving index.html', async () => {
    const res = await fetch(`${FRONTEND_URL}/`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('Insight Exam System') || html.includes('root'));
});

test('3. Complete End-to-End Candidate Exam Flow', async () => {
    // A. Login
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber: 'CAND101', password: 'candidate123' })
    });
    const loginData = await loginRes.json();
    assert.equal(loginRes.status, 200);
    assert.ok(loginData.token);
    const token = loginData.token;

    // B. Get Available Exams
    const examsRes = await fetch(`${BACKEND_URL}/api/exams`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const examsData = await examsRes.json();
    assert.equal(examsRes.status, 200);
    assert.ok(examsData.exams.length > 0);
    const exam = examsData.exams.find(e => e.totalQuestions >= 2) || examsData.exams[0];
    const examId = exam.id || exam._id;

    // C. Start Exam Attempt
    const startRes = await fetch(`${BACKEND_URL}/api/exams/${examId}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
    });
    const startData = await startRes.json();
    assert.equal(startRes.status, 200);
    assert.ok(startData.attemptId);
    assert.ok(startData.remainingSeconds > 0);
    assert.ok(startData.exam.questions.length > 0);
    const attemptId = startData.attemptId;

    // Verify security: candidate frontend receives questions WITHOUT correct answers
    for (const q of startData.exam.questions) {
        assert.equal(q.correctOption, undefined, 'CRITICAL: correctOption must not leak to candidate frontend!');
    }

    // D. Auto-save answers (Answer Q1 and Q2)
    const save1 = await fetch(`${BACKEND_URL}/api/attempts/${attemptId}/answers`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            questionId: startData.exam.questions[0]._id,
            questionIndex: 0,
            selectedOption: 1, // option index 1
            isMarkedForReview: false
        })
    });
    assert.equal(save1.status, 200);

    const save2 = await fetch(`${BACKEND_URL}/api/attempts/${attemptId}/answers`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            questionId: startData.exam.questions[1]._id,
            questionIndex: 1,
            selectedOption: 0, // option index 0
            isMarkedForReview: true // marked for review
        })
    });
    assert.equal(save2.status, 200);

    // E. Verify attempt session retrieval preserves saved answers
    const attemptGet = await fetch(`${BACKEND_URL}/api/attempts/${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const attemptGetData = await attemptGet.json();
    assert.equal(attemptGet.status, 200);
    assert.equal(attemptGetData.answers.length, 2);
    assert.equal(attemptGetData.answers[0].selectedOption, 1);
    assert.equal(attemptGetData.answers[1].isMarkedForReview, true);

    // F. Final Submission and Scoring Engine
    const submitRes = await fetch(`${BACKEND_URL}/api/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: [] })
    });
    const submitData = await submitRes.json();
    assert.equal(submitRes.status, 200);
    assert.equal(submitData.success, true);
    assert.ok(submitData.result);
    assert.equal(submitData.result.totalQuestions, startData.exam.questions.length);
    assert.ok(typeof submitData.result.obtainedMarks === 'number');
    assert.ok(Array.isArray(submitData.result.subjectBreakdown));
    assert.ok(Array.isArray(submitData.result.questionReview));

    // G. Fetch Results List
    const resultsListRes = await fetch(`${BACKEND_URL}/api/results`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const resultsListData = await resultsListRes.json();
    assert.equal(resultsListRes.status, 200);
    assert.ok(resultsListData.results.length >= 1);

    // H. Fetch Detailed Result Review with Explanations
    const detailedRes = await fetch(`${BACKEND_URL}/api/results/${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const detailedData = await detailedRes.json();
    assert.equal(detailedRes.status, 200);
    assert.ok(detailedData.result.score.questionReview.length > 0);
    // In review mode, correctOption and explanation ARE now visible for learning
    assert.ok(typeof detailedData.result.score.questionReview[0].correctOption === 'number');
    assert.ok(detailedData.result.score.questionReview[0].explanation);
});

test('4. Complete Admin Workflow', async () => {
    // A. Admin Login
    const adminLogin = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber: 'ADMIN001', password: 'admin123' })
    });
    const adminData = await adminLogin.json();
    assert.equal(adminLogin.status, 200);
    assert.equal(adminData.user.role, 'admin');
    const adminToken = adminData.token;

    // B. Admin Overview Metrics
    const overviewRes = await fetch(`${BACKEND_URL}/api/results/admin/overview`, {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    const overviewData = await overviewRes.json();
    assert.equal(overviewRes.status, 200);
    assert.ok(overviewData.overview.totalCandidates >= 1);
    assert.ok(overviewData.overview.totalQuestions >= 1);
    assert.ok(overviewData.overview.totalExams >= 1);

    // C. Admin Creates Question in Question Bank
    const createQRes = await fetch(`${BACKEND_URL}/api/questions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            questionText: 'What is the speed of light in vacuum?',
            subject: 'General Awareness',
            topic: 'Science',
            difficulty: 'easy',
            options: ['3 x 10^8 m/s', '3 x 10^6 m/s', '1.5 x 10^8 m/s', '3 x 10^10 m/s'],
            correctOption: 0,
            marks: 1,
            negativeMarks: 0.25,
            explanation: 'The speed of light in vacuum is approximately 300,000 km/s or 3 x 10^8 m/s.'
        })
    });
    const createQData = await createQRes.json();
    assert.equal(createQRes.status, 201);
    assert.ok(createQData.question._id);

    // D. Admin Creates New Examination
    const createExamRes = await fetch(`${BACKEND_URL}/api/exams`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: 'Science & Reasoning Mini Test',
            description: 'Short speed test evaluating fundamental science and reasoning concepts.',
            subject: 'Science',
            durationMinutes: 10,
            totalMarks: 1,
            passingMarks: 1,
            negativeMarking: true,
            negativeMarksPerQuestion: 0.25,
            isPublished: true,
            questions: [
                {
                    questionText: createQData.question.questionText,
                    options: createQData.question.options,
                    correctOption: createQData.question.correctOption,
                    marks: 1,
                    negativeMarks: 0.25,
                    explanation: createQData.question.explanation,
                    subject: 'General Awareness',
                    topic: 'Science'
                }
            ]
        })
    });
    const createExamData = await createExamRes.json();
    assert.equal(createExamRes.status, 201);
    assert.ok(createExamData.exam._id);
});
