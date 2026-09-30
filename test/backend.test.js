const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server/server');
const http = require('node:http');

let server;
let baseUrl;

test.before(async () => {
    await new Promise((resolve) => {
        server = app.listen(0, () => {
            const port = server.address().port;
            baseUrl = `http://localhost:${port}`;
            resolve();
        });
    });
});

const mongoose = require('mongoose');

test.after(async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect();
});

test('Health check endpoint returns success', async () => {
    const res = await fetch(`${baseUrl}/`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.name.includes('Insight Exam'));
});

test('Candidate login returns token and user profile with preferences', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            rollNumber: 'CAND101',
            password: 'candidate123'
        })
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.rollNumber, 'CAND101');
    assert.ok(data.user.preferences);
});

test('Admin login returns admin role', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            rollNumber: 'ADMIN001',
            password: 'admin123'
        })
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.user.role, 'admin');
});

test('Candidate exam start does NOT leak correct options or answer keys', async () => {
    // 1. Login candidate
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber: 'CAND101', password: 'candidate123' })
    });
    const { token } = await loginRes.json();

    // 2. Fetch exams list
    const examsRes = await fetch(`${baseUrl}/api/exams`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const examsData = await examsRes.json();
    assert.equal(examsRes.status, 200);
    assert.ok(examsData.exams.length > 0);
    const examId = examsData.exams[0].id || examsData.exams[0]._id;

    // 3. Start exam attempt
    const startRes = await fetch(`${baseUrl}/api/exams/${examId}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
    });
    const startData = await startRes.json();
    assert.equal(startRes.status, 200);
    assert.ok(startData.attemptId);
    assert.ok(startData.exam.questions.length > 0);

    // Verify security: No question in startData has correctOption!
    for (const q of startData.exam.questions) {
        assert.equal(q.correctOption, undefined, 'CRITICAL: correctOption must NOT be sent to candidate!');
        assert.equal(q.explanation, undefined, 'CRITICAL: explanation must NOT be sent during exam!');
        assert.equal(q.options.length, 4);
    }
});

test('Practice questions check returns instant audio feedback and explanation', async () => {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber: 'CAND101', password: 'candidate123' })
    });
    const { token } = await loginRes.json();

    const questionsRes = await fetch(`${baseUrl}/api/practice/questions?limit=2`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const qData = await questionsRes.json();
    assert.equal(questionsRes.status, 200);
    assert.ok(qData.questions.length > 0);

    const firstQ = qData.questions[0];
    const checkRes = await fetch(`${baseUrl}/api/practice/check`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            questionId: firstQ._id,
            selectedOption: 0
        })
    });
    const checkData = await checkRes.json();
    assert.equal(checkRes.status, 200);
    assert.equal(checkData.success, true);
    assert.ok(typeof checkData.isCorrect === 'boolean');
    assert.ok(checkData.audioSpeech);
});

test('AI Assistant endpoint returns accessible response and respects exam integrity guardrail', async () => {
    // 1. General platform assistance query
    const res1 = await fetch(`${baseUrl}/api/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: 'How do I navigate questions using the keyboard?',
            isExamActive: false
        })
    });
    const data1 = await res1.json();
    assert.equal(res1.status, 200);
    assert.equal(data1.success, true);
    assert.ok(data1.reply);
    assert.ok(data1.spokenText);

    // 2. Exam integrity guardrail check: during active exam, direct question answers are prohibited
    const res2 = await fetch(`${baseUrl}/api/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: 'What is the answer to question 5?',
            isExamActive: true
        })
    });
    const data2 = await res2.json();
    assert.equal(res2.status, 200);
    assert.equal(data2.success, true);
    assert.ok(data2.reply.includes('examination mode') || data2.reply.includes('integrity') || data2.reply.includes('disabled') || data2.reply.includes('prohibited'));
});

