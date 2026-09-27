const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/user');
const Subject = require('../models/subject');
const Question = require('../models/question');
const Exam = require('../models/exam');
const Attempt = require('../models/attempt');
const PracticeAttempt = require('../models/practiceAttempt');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/insight_exam_db';

const subjectsData = [
    {
        name: 'Quantitative Aptitude',
        code: 'QUANT',
        description: 'Arithmetic, numerical ability, percentages, ratios, and data interpretation',
        topics: ['Percentages', 'Profit and Loss', 'Simple Interest', 'Time and Work', 'Number Series']
    },
    {
        name: 'Reasoning Ability',
        code: 'REAS',
        description: 'Verbal reasoning, syllogism, coding-decoding, blood relations, and direction sense',
        topics: ['Syllogism', 'Coding Decoding', 'Blood Relations', 'Direction Sense', 'Analogy']
    },
    {
        name: 'General Awareness',
        code: 'GK',
        description: 'Indian Constitution, general science, geography, and current developments',
        topics: ['Indian Constitution', 'History', 'Geography', 'Science & Technology']
    },
    {
        name: 'English Language',
        code: 'ENG',
        description: 'Grammar, vocabulary, sentence correction, and reading comprehension',
        topics: ['Synonyms and Antonyms', 'Sentence Correction', 'Idioms and Phrases', 'Prepositions']
    }
];

const questionsData = [
    // Quantitative Aptitude
    {
        questionText: 'If 25% of a number is 75, what is 40% of that same number?',
        subject: 'Quantitative Aptitude',
        topic: 'Percentages',
        difficulty: 'easy',
        options: ['100', '120', '150', '160'],
        correctOption: 1, // 120
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'Let the number be x. 0.25 * x = 75, so x = 75 / 0.25 = 300. Now, 40% of 300 = 0.40 * 300 = 120.',
        audioText: 'If twenty-five percent of a number is seventy-five, what is forty percent of that same number?'
    },
    {
        questionText: 'A train 150 meters long is running at a speed of 54 km/hr. In how many seconds will it pass a stationary telegraph post?',
        subject: 'Quantitative Aptitude',
        topic: 'Time and Distance',
        difficulty: 'medium',
        options: ['10 seconds', '12 seconds', '15 seconds', '18 seconds'],
        correctOption: 0, // 10 seconds
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'Speed = 54 * (5/18) = 15 m/s. Time to pass a post = Length of train / Speed = 150 / 15 = 10 seconds.',
        audioText: 'A train one hundred fifty meters long is running at a speed of fifty-four kilometers per hour. In how many seconds will it pass a stationary telegraph post?'
    },
    {
        questionText: 'A sum of money doubles itself in 5 years at simple interest. What is the rate of interest per annum?',
        subject: 'Quantitative Aptitude',
        topic: 'Simple Interest',
        difficulty: 'easy',
        options: ['15%', '20%', '25%', '10%'],
        correctOption: 1, // 20%
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'Let Principal be P. Amount = 2P, so Simple Interest = P. Formula: SI = (P * R * T) / 100. P = (P * R * 5) / 100 => R = 100 / 5 = 20%.',
        audioText: 'A sum of money doubles itself in five years at simple interest. What is the rate of interest per annum?'
    },
    {
        questionText: 'A and B together can complete a piece of work in 12 days, while B alone can finish it in 30 days. In how many days can A alone complete the work?',
        subject: 'Quantitative Aptitude',
        topic: 'Time and Work',
        difficulty: 'medium',
        options: ['18 days', '20 days', '24 days', '25 days'],
        correctOption: 1, // 20 days
        marks: 1,
        negativeMarks: 0.25,
        explanation: "1/A + 1/B = 1/12. Since 1/B = 1/30, 1/A = 1/12 - 1/30 = (5 - 2)/60 = 3/60 = 1/20. Thus, A alone takes 20 days.",
        audioText: 'A and B together can complete a piece of work in twelve days, while B alone can finish it in thirty days. In how many days can A alone complete the work?'
    },
    {
        questionText: 'Find the next number in the sequence: 3, 7, 15, 31, 63, ?',
        subject: 'Quantitative Aptitude',
        topic: 'Number Series',
        difficulty: 'easy',
        options: ['125', '127', '128', '131'],
        correctOption: 1, // 127
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'Each term is (previous term * 2) + 1. 3*2+1=7, 7*2+1=15, 15*2+1=31, 31*2+1=63, 63*2+1=127.',
        audioText: 'Find the next number in the sequence: three, seven, fifteen, thirty-one, sixty-three, question mark.'
    },

    // Reasoning Ability
    {
        questionText: 'In a certain code language, "LIGHT" is written as "MJHIU". How will "SOUND" be written in that same code?',
        subject: 'Reasoning Ability',
        topic: 'Coding Decoding',
        difficulty: 'easy',
        options: ['TPVOE', 'TOVPE', 'UPVOE', 'TPVOF'],
        correctOption: 0, // TPVOE
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'Each letter is shifted forward by 1 letter: S->T, O->P, U->V, N->O, D->E. Result is TPVOE.',
        audioText: 'In a certain code language, L I G H T is written as M J H I U. How will S O U N D be written in that same code?'
    },
    {
        questionText: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
        subject: 'Reasoning Ability',
        topic: 'Blood Relations',
        difficulty: 'medium',
        options: ['Brother', 'Uncle', 'Father', 'Grandfather'],
        correctOption: 2, // Father
        marks: 1,
        negativeMarks: 0.25,
        explanation: '"The only son of my mother" means Suresh himself. Therefore, the boy is the son of Suresh. Suresh is his father.',
        audioText: 'Pointing to a photograph of a boy, Suresh said: He is the son of the only son of my mother. How is Suresh related to that boy?'
    },
    {
        questionText: 'Statements: (1) All mangoes are golden. (2) No golden things are cheap. Conclusion I: All mangoes are cheap. Conclusion II: Golden mangoes are not cheap.',
        subject: 'Reasoning Ability',
        topic: 'Syllogism',
        difficulty: 'medium',
        options: ['Only Conclusion I follows', 'Only Conclusion II follows', 'Both follow', 'Neither follows'],
        correctOption: 1, // Only Conclusion II follows
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'Since all mangoes are golden and golden things are not cheap, mangoes cannot be cheap. Thus, Conclusion II strictly follows.',
        audioText: 'Statements: All mangoes are golden. No golden things are cheap. Conclusion one: All mangoes are cheap. Conclusion two: Golden mangoes are not cheap.'
    },
    {
        questionText: 'A man walks 5 km South, turns left and walks 3 km. He then turns left again and walks 5 km. In which direction is he now facing?',
        subject: 'Reasoning Ability',
        topic: 'Direction Sense',
        difficulty: 'easy',
        options: ['North', 'South', 'East', 'West'],
        correctOption: 0, // North
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'Facing South, turning left points him East. Walking East and turning left again points him North.',
        audioText: 'A man walks five kilometers South, turns left and walks three kilometers. He then turns left again and walks five kilometers. In which direction is he now facing?'
    },
    {
        questionText: 'Choose the word that has the same relationship as: Clock is to Time as Thermometer is to what?',
        subject: 'Reasoning Ability',
        topic: 'Analogy',
        difficulty: 'easy',
        options: ['Pressure', 'Heat', 'Temperature', 'Radiation'],
        correctOption: 2, // Temperature
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'A clock measures time; a thermometer measures temperature.',
        audioText: 'Clock is to Time as Thermometer is to what?'
    },

    // General Awareness
    {
        questionText: 'Which Article of the Constitution of India guarantees the Right to Equality before the law?',
        subject: 'General Awareness',
        topic: 'Indian Constitution',
        difficulty: 'easy',
        options: ['Article 12', 'Article 14', 'Article 19', 'Article 21'],
        correctOption: 1, // Article 14
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'Article 14 of the Constitution provides equality before the law and equal protection of the laws to all persons within the territory of India.',
        audioText: 'Which Article of the Constitution of India guarantees the Right to Equality before the law?'
    },
    {
        questionText: 'Who was the first Chief Justice of independent India?',
        subject: 'General Awareness',
        topic: 'History',
        difficulty: 'medium',
        options: ['H. J. Kania', 'M. Patanjali Sastri', 'Mehar Chand Mahajan', 'B. K. Mukherjea'],
        correctOption: 0, // H. J. Kania
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'Sir Hiralal Jekisundas Kania served as the first Chief Justice of India from 1950 to 1951.',
        audioText: 'Who was the first Chief Justice of independent India?'
    },
    {
        questionText: 'Which planet in our solar system is known as the "Red Planet"?',
        subject: 'General Awareness',
        topic: 'Science & Technology',
        difficulty: 'easy',
        options: ['Venus', 'Mars', 'Jupiter', 'Mercury'],
        correctOption: 1, // Mars
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'Mars is called the Red Planet because iron minerals in the Martian soil oxidize or rust, causing the soil and atmosphere to look reddish.',
        audioText: 'Which planet in our solar system is known as the Red Planet?'
    },
    {
        questionText: 'In which year did the Reserve Bank of India (RBI) commence its operations?',
        subject: 'General Awareness',
        topic: 'History',
        difficulty: 'medium',
        options: ['1930', '1935', '1947', '1950'],
        correctOption: 1, // 1935
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'The Reserve Bank of India commenced operations on April 1, 1935 in accordance with the RBI Act, 1934.',
        audioText: 'In which year did the Reserve Bank of India commence its operations?'
    },

    // English Language
    {
        questionText: 'Select the most appropriate synonym for the word: "CANDID"',
        subject: 'English Language',
        topic: 'Synonyms and Antonyms',
        difficulty: 'easy',
        options: ['Secretive', 'Frank', 'Deceitful', 'Cruel'],
        correctOption: 1, // Frank
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'Candid means truthful and straightforward; frank.',
        audioText: 'Select the most appropriate synonym for the word: Candid.'
    },
    {
        questionText: 'Choose the correct preposition: She is remarkably good _______ solving mathematical puzzles.',
        subject: 'English Language',
        topic: 'Prepositions',
        difficulty: 'easy',
        options: ['in', 'at', 'with', 'for'],
        correctOption: 1, // at
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'We use the preposition "at" after "good" when referring to skills and abilities (e.g., "good at mathematics").',
        audioText: 'Choose the correct preposition: She is remarkably good blank solving mathematical puzzles.'
    },
    {
        questionText: 'What is the meaning of the idiom: "To beat around the bush"?',
        subject: 'English Language',
        topic: 'Idioms and Phrases',
        difficulty: 'easy',
        options: [
            'To search vigorously in a garden',
            'To avoid talking about what is important',
            'To achieve a task with excessive force',
            'To easily overcome a difficult hurdle'
        ],
        correctOption: 1,
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'The idiom "beat around the bush" means to discuss a matter without coming directly to the point.',
        audioText: 'What is the meaning of the idiom: To beat around the bush?'
    },
    {
        questionText: 'Identify the antonym of the word: "EPHEMERAL"',
        subject: 'English Language',
        topic: 'Synonyms and Antonyms',
        difficulty: 'medium',
        options: ['Transient', 'Fleeting', 'Permanent', 'Fragile'],
        correctOption: 2, // Permanent
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'Ephemeral means lasting for a very short time. Its opposite (antonym) is permanent or everlasting.',
        audioText: 'Identify the antonym of the word: Ephemeral.'
    }
];

async function seed() {
    try {
        console.log('Connecting to database:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connection established.');

        // Clear existing data
        await User.deleteMany({});
        await Subject.deleteMany({});
        await Question.deleteMany({});
        await Exam.deleteMany({});
        await Attempt.deleteMany({});
        await PracticeAttempt.deleteMany({});

        console.log('Cleared existing collections.');

        // 1. Create Users
        const adminPassword = await bcrypt.hash('admin123', 10);
        const candidatePassword = await bcrypt.hash('candidate123', 10);
        const studentPassword = await bcrypt.hash('student123', 10);

        const adminUser = await User.create({
            rollNumber: 'ADMIN001',
            name: 'System Administrator',
            email: 'admin@insightexam.org',
            password: adminPassword,
            role: 'admin',
            preferences: {
                language: 'en',
                speechRate: 1.0,
                theme: 'high-contrast-yellow',
                fontSize: 'large',
                voiceCommands: true
            }
        });

        const candidateUser = await User.create({
            rollNumber: 'CAND101',
            name: 'Aarav Sharma',
            email: 'aarav@insightexam.org',
            password: candidatePassword,
            role: 'candidate',
            preferences: {
                language: 'en',
                speechRate: 1.0,
                theme: 'high-contrast-yellow',
                fontSize: 'large',
                voiceCommands: true,
                autoReadQuestion: true
            }
        });

        const studentUser = await User.create({
            rollNumber: 'STUDENT101',
            name: 'Priya Verma',
            email: 'priya@insightexam.org',
            password: studentPassword,
            role: 'candidate',
            preferences: {
                language: 'hi',
                speechRate: 0.9,
                theme: 'high-contrast-cyan',
                fontSize: 'extra-large',
                voiceCommands: true,
                autoReadQuestion: true
            }
        });

        console.log('Created Users: ADMIN001, CAND101, STUDENT101');

        // 2. Create Subjects
        await Subject.insertMany(subjectsData);
        console.log(`Created ${subjectsData.length} Subjects.`);

        // 3. Create Questions
        const insertedQuestions = await Question.insertMany(questionsData);
        console.log(`Created ${insertedQuestions.length} Questions in Question Bank.`);

        // 4. Create Examinations
        // Exam 1: All India Competitive Entrance Mock Examination
        const exam1Questions = insertedQuestions.slice(0, 10).map((q, idx) => ({
            questionText: q.questionText,
            options: q.options,
            correctOption: q.correctOption,
            marks: q.marks,
            negativeMarks: q.negativeMarks,
            explanation: q.explanation,
            subject: q.subject,
            topic: q.topic
        }));

        const exam1 = await Exam.create({
            title: 'All India Competitive Entrance Mock Examination 2026',
            description: 'Comprehensive national-level practice examination covering Quantitative Aptitude, Reasoning Ability, and General Awareness. Fully accessible for screen readers with keyboard audio shortcuts.',
            subject: 'Comprehensive Competitive',
            durationMinutes: 20,
            totalMarks: 10,
            passingMarks: 4,
            negativeMarking: true,
            negativeMarksPerQuestion: 0.25,
            marksPerQuestion: 1,
            isPublished: true,
            instructions: [
                'Total duration is 20 minutes with automatic server synchronization.',
                'Each question carries 1 positive mark. An incorrect answer deducts 0.25 negative marks.',
                'Use Arrow Keys or N and P to move between questions.',
                'Press keys 1, 2, 3, or 4 on the number row to choose your answer.',
                'Press R or Q to have the current question read aloud through Text-To-Speech.',
                'Press M to mark question for review. Press C to clear answer.',
                'Press T to announce remaining time.',
                'When you finish, press Enter on the Submit Exam button.'
            ],
            questions: exam1Questions
        });

        // Exam 2: Reasoning and English Speed Assessment
        const exam2Questions = insertedQuestions.slice(5, 12).map((q, idx) => ({
            questionText: q.questionText,
            options: q.options,
            correctOption: q.correctOption,
            marks: 2,
            negativeMarks: 0.5,
            explanation: q.explanation,
            subject: q.subject,
            topic: q.topic
        }));

        const exam2 = await Exam.create({
            title: 'Reasoning & Verbal Ability Speed Test',
            description: 'Focused test assessing deductive reasoning, coding-decoding, and English comprehension.',
            subject: 'Reasoning & English',
            durationMinutes: 15,
            totalMarks: 14,
            passingMarks: 6,
            negativeMarking: true,
            negativeMarksPerQuestion: 0.5,
            marksPerQuestion: 2,
            isPublished: true,
            instructions: [
                'Total duration is 15 minutes for 7 questions.',
                'Each correct answer earns 2 marks. 0.5 marks are deducted for incorrect answers.',
                'Navigation keys: Arrow Left/Right or Previous/Next buttons.',
                'Audio readout active on all questions.'
            ],
            questions: exam2Questions
        });

        console.log('Created Exams:');
        console.log(` - ${exam1.title} (${exam1._id})`);
        console.log(` - ${exam2.title} (${exam2._id})`);

        // 5. Create a Sample Completed Attempt for candidateUser to immediately demo results and analytics!
        const now = new Date();
        const startedAt = new Date(now.getTime() - 15 * 60 * 1000); // 15 mins ago
        const submittedAt = new Date(now.getTime() - 2 * 60 * 1000);

        const sampleAnswers = [
            { questionId: String(exam1Questions[0]._id || 0), questionIndex: 0, selectedOption: 1, isMarkedForReview: false }, // correct (120)
            { questionId: String(exam1Questions[1]._id || 1), questionIndex: 1, selectedOption: 0, isMarkedForReview: false }, // correct (10 sec)
            { questionId: String(exam1Questions[2]._id || 2), questionIndex: 2, selectedOption: 1, isMarkedForReview: false }, // correct (20%)
            { questionId: String(exam1Questions[3]._id || 3), questionIndex: 3, selectedOption: 0, isMarkedForReview: false }, // incorrect (chose 18 days, correct is 20)
            { questionId: String(exam1Questions[4]._id || 4), questionIndex: 4, selectedOption: 1, isMarkedForReview: true },  // correct (127)
            { questionId: String(exam1Questions[5]._id || 5), questionIndex: 5, selectedOption: 0, isMarkedForReview: false }, // correct (TPVOE)
            { questionId: String(exam1Questions[6]._id || 6), questionIndex: 6, selectedOption: 2, isMarkedForReview: false }, // correct (Father)
            { questionId: String(exam1Questions[7]._id || 7), questionIndex: 7, selectedOption: 1, isMarkedForReview: false }, // correct (Only II)
            { questionId: String(exam1Questions[8]._id || 8), questionIndex: 8, selectedOption: 0, isMarkedForReview: false }, // correct (North)
            { questionId: String(exam1Questions[9]._id || 9), questionIndex: 9, selectedOption: null, isMarkedForReview: true } // unanswered
        ];

        // 8 correct, 1 incorrect, 1 unanswered
        // Total marks: 10
        // Correct marks: 8
        // Neg marks: 0.25
        // Obtained marks: 7.75
        const questionReviews = exam1Questions.map((q, idx) => {
            const ans = sampleAnswers[idx];
            const hasAns = ans && ans.selectedOption !== null;
            const isCorr = hasAns && ans.selectedOption === q.correctOption;
            return {
                questionId: String(idx),
                questionText: q.questionText,
                options: q.options,
                selectedOption: hasAns ? ans.selectedOption : null,
                correctOption: q.correctOption,
                isCorrect: isCorr,
                marksObtained: isCorr ? 1 : (hasAns ? -0.25 : 0),
                explanation: q.explanation,
                subject: q.subject
            };
        });

        await Attempt.create({
            userId: candidateUser._id,
            examId: exam1._id,
            examTitle: exam1.title,
            durationMinutes: 20,
            startedAt,
            expiresAt: new Date(startedAt.getTime() + 20 * 60 * 1000),
            submittedAt,
            status: 'submitted',
            answers: sampleAnswers,
            score: {
                totalQuestions: 10,
                attempted: 9,
                correct: 8,
                incorrect: 1,
                unanswered: 1,
                totalMarks: 10,
                obtainedMarks: 7.75,
                percentage: 77.5,
                passed: true,
                timeTakenSeconds: 780,
                subjectBreakdown: [
                    { subject: 'Quantitative Aptitude', total: 5, correct: 4, incorrect: 1, unanswered: 0, accuracy: 80 },
                    { subject: 'Reasoning Ability', total: 5, correct: 4, incorrect: 0, unanswered: 1, accuracy: 100 }
                ],
                questionReview: questionReviews
            }
        });

        // 6. Create sample practice attempts
        await PracticeAttempt.create({
            userId: candidateUser._id,
            subject: 'Quantitative Aptitude',
            topic: 'Percentages',
            difficulty: 'easy',
            totalQuestions: 5,
            attempted: 5,
            correct: 4,
            incorrect: 1,
            score: 4,
            accuracy: 80,
            timeTakenSeconds: 240
        });

        await PracticeAttempt.create({
            userId: candidateUser._id,
            subject: 'Reasoning Ability',
            topic: 'Syllogism',
            difficulty: 'medium',
            totalQuestions: 5,
            attempted: 5,
            correct: 5,
            incorrect: 0,
            score: 5,
            accuracy: 100,
            timeTakenSeconds: 190
        });

        console.log('Seeded sample attempt and practice records.');
        console.log('\n--- SEED COMPLETE ---');
        console.log('Candidate credentials: CAND101 / candidate123');
        console.log('Admin credentials:     ADMIN001 / admin123');
        console.log('---------------------');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
