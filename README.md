# Insight Exam Platform
## Accessible Online Examination & Practice Platform for Visually Impaired Candidates

An end-to-end, production-quality competitive examination and practice ecosystem built specifically to empower visually impaired and low-vision candidates to independently prepare for, navigate, and participate in timed competitive examinations without requiring human scribes.

---

## 🌟 Key Highlights & Accessibility Features (WCAG 2.2 AA)

1. **Universal Screen-Reader Compatibility & Self-Reading TTS Engine**:
   - Integrated Text-To-Speech (TTS) engine using `window.speechSynthesis`.
   - Supports both **English** and **Hindi** with configurable speech rates (0.75x to 1.5x) and pitch.
   - Non-overlapping audio queues, speech cancellation on navigation, and immediate pronunciation of questions, options, timer status, and solutions.
   - Dynamic UI announcements through persistent ARIA live regions (`role="status"` / `role="alert"`).

2. **100% Keyboard-First Operation (Zero Mouse Dependency)**:
   - Complete keyboard traversal without traps:
     - `ArrowRight` / `ArrowDown` / `N`: Next Question
     - `ArrowLeft` / `ArrowUp` / `P`: Previous Question
     - `1`, `2`, `3`, `4`: Select corresponding answer option
     - `R` or `Q`: Read question and options aloud
     - `O`: Read options only
     - `S`: Read current selection
     - `M`: Toggle Mark for Review
     - `C`: Clear chosen answer
     - `T`: Announce remaining examination time
     - `Escape`: Immediately stop speech or dismiss modals
     - `?` or `H`: Open interactive accessibility shortcuts guide
     - `Tab` / `Shift+Tab`: Natural logical focus traversal with ultra-visible high-contrast focus rings (`outline: 3px solid #ffe600`).

3. **Hands-Free Bilingual Voice Command System**:
   - Web Speech Recognition API integration for voice-driven examination participation.
   - Supported commands in English and Hindi (e.g., *"Next Question"*, *"Option 1"*, *"Mark for Review"*, *"Remaining Time"*, *"Submit Exam"*, *"अगला प्रश्न"*, *"पहला विकल्प"*, *"सवाल पढ़ो"*).
   - Graceful fallback to keyboard navigation when microphone access is disabled or unsupported.

4. **Multi-Theme High-Contrast Visual System & Font Scaling**:
   - 4 WCAG-tailored color contrast themes:
     - **High Contrast Yellow on Black** (Recommended Low-Vision standard)
     - **High Contrast Cyan on Navy** (Vibrant accessible dark mode)
     - **Standard Dark Mode**
     - **Soft Light / Warm Cream** (Non-glare light mode)
   - 3 typography scaling levels: Normal (16px), Large (19px), Extra Large (22px).
   - Non-color-only question states (Icons + Distinct Badges + Text + ARIA labels for Answered, Marked, Unanswered).

5. **Tamper-Resistant Examination Engine**:
   - Server-validated timers (`expiresAt`) immune to browser refresh or client clock tampering.
   - Real-time autosave of answers to MongoDB via `POST /api/attempts/:id/answers`.
   - Critical time announcements at 15 min, 10 min, 5 min, and 1 min remaining.
   - Automatic submission on timer expiration.
   - **Zero Answer Leakage**: Active exam endpoints sanitize questions and never transmit `correctOption` or answer keys to the candidate frontend during active attempts.

6. **Interactive Subject-Wise Practice Module**:
   - Subject-wise and difficulty-based practice (Quantitative Aptitude, Reasoning Ability, English Language, General Awareness).
   - Immediate audio verification, correct answer keys, and detailed step-by-step mathematical/verbal explanations.
   - Real-time session scorecard and accuracy tracking.

7. **Comprehensive Performance Analytics & Results**:
   - Overall scorecards: marks obtained, percentage, correct/incorrect/unanswered counts, time taken, passing status.
   - Subject-wise accuracy tables with accessible textual representations alongside high-contrast visual indicators.
   - Question-by-question review with audible solutions and explanations.
   - Personalized preparation recommendations highlighting weak subjects and speed improvements.

8. **Secure Administrative Portal**:
   - Role-based authorization (`admin` vs `candidate`).
   - Central Question Bank management (CRUD) with subject tagging and audio cues.
   - Examination management (create timed exams, select questions from bank, configure negative marking, publish/unpublish).
   - Real-time candidate attempt monitoring.

---

## 🏗️ Architecture

```text
                             ACCESSIBLE EXAM PLATFORM
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 │                                             │
          CANDIDATE PORTAL                               ADMIN PORTAL
                 │                                             │
      ┌──────────┼──────────┐                       ┌──────────┼──────────┐
      │          │          │                       │          │          │
   Practice    Exams     Results                Questions    Exams      Attempts
      │          │          │                       │          │          │
      └──────────┼──────────┘                       └──────────┼──────────┘
                 │                                             │
                 └──────────────────────┬──────────────────────┘
                                        │
                            REST API (Express / Node.js)
                                        │
                         ┌──────────────┼──────────────┐
                         │              │              │
                    Auth / JWT     Exam Engine     Analytics
                         │              │              │
                         └──────────────┼──────────────┘
                                        │
                               MongoDB Database
                         (Users, Exams, Attempts, Questions)
```

---

## 💻 Tech Stack

- **Backend**: Node.js, Express.js, MongoDB / Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, CORS, Dotenv.
- **Frontend**: React 18, Vite, React Router 7, TailwindCSS, Lucide React Icons.
- **Accessibility & APIs**: Web SpeechSynthesis API, Web SpeechRecognition API, WAI-ARIA 1.2, Semantic HTML5 landmarks.
- **Testing**: Built-in `node:test` and `node:assert/strict` test runner.

---

## 🚀 Quick Start & Setup

### 1. Prerequisites
- **Node.js**: v18+ (Tested on v26)
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017` or a remote MongoDB Atlas connection URI.

### 2. Environment Configuration
Create `.env` in the root project folder (or use `.env.example`):
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/insight_exam_db
JWT_SECRET=insight_exam_super_secure_jwt_secret_key_2026_sih
NODE_ENV=development
```

### 3. Seed Development Database
Populate the database with demo candidates, subjects, realistic competitive exam questions, and sample examinations:
```bash
npm run seed
```

### 4. Run Backend & Frontend

**Option A: Run Backend Server**
```bash
npm run start
# Server listens on http://localhost:5001
```

**Option B: Run Frontend Dev Server (in another terminal)**
```bash
npm run client
# Client dev server runs on http://localhost:5173
```

---

## 🔑 Demo & Evaluation Credentials

| Role | Roll Number / Username | Password | Access Level |
|---|---|---|---|
| **Candidate (English)** | `CAND101` | `candidate123` | Candidate Dashboard, Exams, Practice, Results, Analytics |
| **Candidate (Hindi)** | `STUDENT101` | `student123` | Hindi audio prompts, High-Contrast Cyan, Extra-Large text |
| **Administrator** | `ADMIN001` | `admin123` | Question Bank CRUD, Exam Management, Attempt Monitor |

*Note: The login page includes one-click "Autofill Candidate" and "Autofill Admin" buttons for rapid testing.*

---

## 🧪 Automated Testing

Run the test suite (health checks, auth, security answer-leak prevention, scoring engine, practice check, and E2E flows):
```bash
npm test
```
All 9 test suites validate end-to-end functionality.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register candidate or administrator
- `POST /api/auth/login`: Authenticate and receive JWT token + accessibility preferences
- `GET  /api/auth/me`: Fetch authenticated user profile
- `PUT  /api/auth/preferences`: Update accessibility settings (theme, speechRate, font size)
- `POST /api/auth/logout`: End session

### Examinations (`/api/exams`)
- `GET    /api/exams`: List examinations (sanitized for candidates; draft + published for admin)
- `GET    /api/exams/:id`: Exam details (strips `correctOption` and `explanation` for candidates)
- `POST   /api/exams`: Create new examination (Admin only)
- `PUT    /api/exams/:id`: Update examination (Admin only)
- `DELETE /api/exams/:id`: Delete examination (Admin only)
- `POST   /api/exams/:id/start`: Start or resume attempt; creates server timer session
- `GET    /api/attempts/:id`: Retrieve active attempt and saved answers
- `POST   /api/attempts/:id/answers`: Real-time autosave of candidate answer / review mark
- `POST   /api/attempts/:id/submit`: Final submission & server-side scoring engine

### Question Bank (`/api/questions`)
- `GET    /api/questions`: Filterable question bank by subject, topic, and difficulty
- `POST   /api/questions`: Create question (Admin only)
- `GET    /api/questions/:id`: Get single question
- `PUT    /api/questions/:id`: Update question (Admin only)
- `DELETE /api/questions/:id`: Delete question (Admin only)
- `GET    /api/questions/meta/subjects`: Distinct subjects and topics metadata

### Practice (`/api/practice`)
- `GET  /api/practice/questions`: Retrieve randomized practice questions
- `POST /api/practice/check`: Instant check returning correctness, correct answer, and spoken explanation
- `POST /api/practice/submit`: Record completed practice session
- `GET  /api/practice/history`: Fetch candidate's practice history and accuracy

### Results & Analytics (`/api/results`)
- `GET /api/results`: List candidate's completed exam scorecards
- `GET /api/results/:attemptId`: Detailed review with question-by-question breakdown and explanations
- `GET /api/results/analytics/candidate`: Preparation analytics, subject accuracy, and personalized recommendations
- `GET /api/results/admin/overview`: Administrator system-wide statistics and recent candidate attempts

---

## ♿ Keyboard Navigation Cheatsheet

| Key | Purpose |
|---|---|
| `Tab` / `Shift+Tab` | Natural sequential focus navigation |
| `Arrow Right` / `N` | Navigate to Next Question |
| `Arrow Left` / `P` | Navigate to Previous Question |
| `1`, `2`, `3`, `4` | Select Answer Option 1, 2, 3, or 4 |
| `R` or `Q` | Read current question and options aloud via TTS |
| `O` | Read options only aloud |
| `S` | Read currently selected answer |
| `M` | Toggle Mark for Review |
| `C` | Clear chosen answer |
| `T` | Announce remaining examination time |
| `Escape` | Stop speaking immediately or dismiss modal |
| `?` or `H` | Open keyboard & voice commands guide modal |
