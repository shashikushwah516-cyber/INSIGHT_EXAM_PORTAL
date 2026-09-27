import React, { useState, useEffect } from 'react';
import { speakText } from '../utils/speech';

export default function ExamWindow({ token }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    // परीक्षा के सवाल फ़ेच करना
    fetch('http://localhost:5001/api/exams/questions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        if (data.length > 0) {
          readQuestion(data[0]);
        }
      })
      .catch(() => speakText("सवाल लोड करने में त्रुटि हुई।"));
  }, [token]);

  const readQuestion = (q) => {
    const text = `प्रश्न ${currentIndex + 1}: ${q.questionText}। विकल्प 1: ${q.options[0]}। विकल्प 2: ${q.options[1]}। विकल्प 3: ${q.options[2]}। विकल्प 4: ${q.options[3]}। उत्तर चुनने के लिए नंबर की या स्पेस दबाएं।`;
    speakText(text);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (questions.length === 0) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        // अगला सवाल
        if (currentIndex < questions.length - 1) {
          const nextIdx = currentIndex + 1;
          setCurrentIndex(nextIdx);
          readQuestion(questions[nextIdx]);
        } else {
          speakText("यह अंतिम प्रश्न है।");
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        // पिछला सवाल
        if (currentIndex > 0) {
          const prevIdx = currentIndex - 1;
          setCurrentIndex(prevIdx);
          readQuestion(questions[prevIdx]);
        } else {
          speakText("यह पहला प्रश्न है।");
        }
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const optIndex = parseInt(e.key) - 1;
        setSelectedOption(optIndex);
        speakText(`विकल्प ${e.key} चुना गया।`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions]);

  if (questions.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><h2>प्रश्न लोड हो रहे हैं...</h2></div>;
  }

  const currentQ = questions[currentIndex];

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#111', color: '#fff', height: '100vh' }}>
      <h2>परीक्षा चल रही है (कीबोर्ड नेविगेशन मोड सक्रिय)</h2>
      <p>प्रश्न {currentIndex + 1} / {questions.length}</p>
      <h3>{currentQ.questionText}</h3>
      <ul>
        {currentQ.options.map((opt, idx) => (
          <li key={idx} style={{ padding: '10px 0', fontSize: '20px', color: selectedOption === idx ? '#00ffcc' : '#fff' }}>
            विकल्प {idx + 1}: {opt} {selectedOption === idx ? ' (चयनित)' : ''}
          </li>
        ))}
      </ul>
      <p style={{ marginTop: '30px', color: '#aaa' }}>
        * ऊपर/नीचे तीर (Arrow Keys) से सवाल बदलें। 1 से 4 दबाकर विकल्प चुनें।
      </p>
    </div>
  );
}