import React, { useState, useEffect } from 'react';
import { speakText } from '../utils/speech';

export default function Login({ onLoginSuccess }) {
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Roll Number, 2: Password

  useEffect(() => {
    speakText("परीक्षा पोर्टल में आपका स्वागत है। कृपया अपना रोल नंबर दर्ज करें और एंटर दबाएं।");
  }, []);

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      if (step === 1) {
        if (rollNumber.trim() === '') {
          speakText("रोल नंबर खाली नहीं हो सकता। कृपया दोबारा दर्ज करें।");
          return;
        }
        setStep(2);
        speakText("रोल नंबर दर्ज हो गया। अब अपना पासवर्ड दर्ज करें और एंटर दबाएं।");
      } else if (step === 2) {
        if (password.trim() === '') {
          speakText("पासवर्ड खाली नहीं हो सकता। कृपया दोबारा दर्ज करें।");
          return;
        }
        speakText("लॉगिन किया जा रहा है, कृपया प्रतीक्षा करें।");
        
        try {
          const response = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rollNumber, password })
          });
          const data = await response.json();
          
          if (response.ok) {
            speakText("लॉगिन सफल रहा। परीक्षा विंडो शुरू हो रही है।");
            onLoginSuccess(data.token);
          } else {
            speakText(data.message || "लॉगिन असफल रहा। कृपया सही जानकारी दें।");
            setStep(1);
            setRollNumber('');
            setPassword('');
          }
        } catch (error) {
          speakText("सर्वर से कनेक्ट करने में त्रुटि हुई।");
        }
      }
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>दृष्टिबाधित परीक्षा पोर्टल - लॉगिन</h2>
      <div style={{ margin: '20px 0' }}>
        {step === 1 ? (
          <div>
            <label>रोल नंबर (Roll Number): </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{ padding: '10px', fontSize: '18px' }}
            />
          </div>
        ) : (
          <div>
            <label>पासवर्ड (Password): </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{ padding: '10px', fontSize: '18px' }}
            />
          </div>
        )}
      </div>
      <p>सुझाव: टाइप करने के बाद **Enter** की (Key) दबाएं।</p>
    </div>
  );
}