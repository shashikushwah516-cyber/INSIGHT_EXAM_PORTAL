const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../server/models/user');
const Exam = require('../server/models/exam');
const Attempt = require('../server/models/attempt');

dotenv.config();
const BASE_URL = 'http://localhost:5001';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/insight_exam_db';

test.before(async () => {
    await mongoose.connect(MONGO_URI);
});

test.after(async () => {
    await mongoose.disconnect();
});

test('FLOW 1: User Registration with password hashing & DB persistence', async () => {
    const testRoll = `TEST_REG_${Date.now().toString().slice(-4)}`;
    const regPayload = {
        name: 'Automated Test Candidate',
        rollNumber: testRoll,
        email: `${testRoll.toLowerCase()}@testdomain.edu`,
        password: 'securePassword123!',
        role: 'candidate'
    };

    const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regPayload)
    });

    const data = await res.json();
    assert.equal(res.status, 201, 'Registration should return 201 Created');
    assert.equal(data.success, true);
    assert.ok(data.token, 'Token must be issued upon registration');

    // Verify database record
    const userInDb = await User.findOne({ rollNumber: testRoll });
    assert.ok(userInDb, 'User must exist in MongoDB');
    assert.notEqual(userInDb.password, 'securePassword123!', 'Password must NOT be stored as plain text');
    const isPasswordHashValid = await bcrypt.compare('securePassword123!', userInDb.password);
    assert.equal(isPasswordHashValid, true, 'Stored password must be a valid bcrypt hash');
});

test('FLOW 2: Real Login with registered database credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber: 'CAND101', password: 'candidate123' })
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.token, 'JWT session token must be provided');
    assert.equal(data.user.rollNumber, 'CAND101');
    assert.equal(data.user.role, 'candidate');
});

test('FLOW 3: Invalid Login with wrong password rejected with clear error', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber: 'CAND101', password: 'completelyWrongPassword!' })
    });

    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
    assert.equal(data.token, undefined, 'No token should be provided on invalid login');
    assert.match(data.message, /incorrect|invalid/i);
});

test('FLOW 4: Student Exam Flow with server-side scoring & attempt recording', async () => {
    // 1. Login as student
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber: 'CAND101', password: 'candidate123' })
    });
    const { token } = await loginRes.json();

    // 2. Fetch available exams from database
    const examsRes = await fetch(`${BASE_URL}/api/exams`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const examsData = await examsRes.json();
    assert.ok(examsData.exams.length > 0, 'Exams must be loaded from DB');
    const targetExam = examsData.exams[0];

    // 3. Start Exam - create in-progress attempt
    const startRes = await fetch(`${BASE_URL}/api/exams/${targetExam._id}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const startData = await startRes.json();
    assert.equal(startRes.status, 200);
    assert.ok(startData.attemptId);

    // 4. Submit Exam responses
    const submitRes = await fetch(`${BASE_URL}/api/attempts/${startData.attemptId}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            answers: [
                { questionIndex: 0, selectedOption: 1 },
                { questionIndex: 1, selectedOption: 0 }
            ]
        })
    });

    const submitData = await submitRes.json();
    assert.equal(submitRes.status, 200);
    assert.equal(submitData.success, true);
    assert.ok(submitData.result);
    assert.equal(typeof submitData.result.obtainedMarks, 'number', 'Score must be calculated by backend');

    // 5. Verify attempt in MongoDB is saved as submitted
    const attemptInDb = await Attempt.findById(startData.attemptId);
    assert.equal(attemptInDb.status, 'submitted');
    assert.ok(attemptInDb.submittedAt);
});

test('FLOW 5: Admin Workflow - create exam, manage students, view results', async () => {
    // 1. Admin login
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber: 'ADMIN001', password: 'admin123' })
    });
    const { token: adminToken } = await adminLoginRes.json();

    // 2. Fetch real stats
    const statsRes = await fetch(`${BASE_URL}/api/results/admin/overview`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    assert.equal(statsRes.status, 200);
    assert.ok(statsData.overview.totalCandidates >= 1);

    // 3. Admin Student Management - fetch students list
    const studentsRes = await fetch(`${BASE_URL}/api/admin/students`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const studentsData = await studentsRes.json();
    assert.equal(studentsRes.status, 200);
    assert.ok(studentsData.count >= 2);

    // 4. Admin creates a new exam
    const newExamRes = await fetch(`${BASE_URL}/api/exams`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
            title: `Admin Automated Test Exam ${Date.now()}`,
            description: 'Automated assessment verification exam',
            durationMinutes: 15,
            subject: 'Automated QA',
            isPublished: true,
            questions: [
                {
                    questionText: 'What is the speed of light in vacuum?',
                    options: ['3 x 10^8 m/s', '3 x 10^6 m/s', '1.5 x 10^8 m/s', '3 x 10^10 m/s'],
                    correctOption: 0,
                    marks: 1
                }
            ]
        })
    });
    const newExamData = await newExamRes.json();
    assert.equal(newExamRes.status, 201);
    assert.ok(newExamData.exam._id);
});

test('FLOW 6: Role-Based Security & Protected Route Authorization', async () => {
    // 1. Candidate login
    const candLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber: 'CAND101', password: 'candidate123' })
    });
    const { token: candidateToken } = await candLoginRes.json();

    // 2. Candidate attempts to call Admin Students API -> Must be rejected (403 Forbidden)
    const adminCheckRes = await fetch(`${BASE_URL}/api/admin/students`, {
        headers: { 'Authorization': `Bearer ${candidateToken}` }
    });
    assert.equal(adminCheckRes.status, 403, 'Candidate must NOT access admin endpoints');

    // 3. Unauthenticated request to protected endpoint -> Must be rejected (401 Unauthorized)
    const unauthRes = await fetch(`${BASE_URL}/api/auth/me`);
    assert.equal(unauthRes.status, 401, 'Unauthenticated request must return 401');
});
