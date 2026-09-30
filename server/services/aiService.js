/**
 * Voice-First AI Assistant Service for Insight Exam Portal
 * Provides real-time guidance on platform features, exam rules, accessibility, and subject concepts.
 * Respects AI_API_KEY / AI_API_URL or graceful offline knowledge provider fallback.
 */

const KNOWLEDGE_BASE = [
    {
        keywords: ['what is this platform', 'about this platform', 'insight exam portal', 'what is this site', 'about portal', 'यह पोर्टल क्या है'],
        en: 'Insight Exam Portal is a voice-first, universally accessible online examination and practice platform designed specifically for visually impaired candidates. It features self-reading Text-to-Speech (TTS), controlled keyboard navigation with arrow keys and Enter, bilingual voice commands, and real-time auto-saving assessments.',
        hi: 'इनसाइट परीक्षा पोर्टल दृष्टिबाधित उम्मीदवारों के लिए तैयार किया गया एक वॉइस-फर्स्ट, पूर्णतः सुलभ ऑनलाइन परीक्षा एवं अभ्यास मंच है। इसमें स्वचालित टेक्स्ट-टू-स्पीच, तीर कुंजियों द्वारा कीबोर्ड नियंत्रण, द्विभाषी आवाज कमांड और सुरक्षित परीक्षा प्रणाली शामिल है।'
    },
    {
        keywords: ['keyboard', 'shortcuts', 'navigation', 'keys', 'arrow keys', 'कीबोर्ड', 'शॉर्टकट'],
        en: 'The controlled keyboard interaction model is simple: Use Up and Down Arrow keys to move between options, press Enter to select an option, press Right Arrow for next question, press Left Arrow for previous question, press Space to repeat the current question, and press C or Backspace to clear your answer. Press M to mark for review and T to hear remaining time.',
        hi: 'कीबोर्ड नेविगेशन अत्यंत सरल है: विकल्पों के बीच जाने के लिए ऊपर और नीचे तीर कुंजियों का उपयोग करें, विकल्प चुनने के लिए Enter दबाएं, अगले प्रश्न के लिए दायां तीर, पिछले के लिए बायां तीर, प्रश्न दोबारा सुनने के लिए Space और उत्तर मिटाने के लिए C दबाएं।'
    },
    {
        keywords: ['mock test', 'start exam', 'how to practice', 'practice test', 'मॉक टेस्ट', 'अभ्यास कैसे करें'],
        en: 'To start a practice session, go to the Practice Portal from the navigation menu or dashboard. You can select your subject such as Quantitative Aptitude or Reasoning, pick your difficulty level, and start practicing with instant audio feedback and step-by-step explanations.',
        hi: 'अभ्यास सत्र शुरू करने के लिए मुख्य मेनू से "Practice Portal" पर जाएं। वहां आप अपना विषय, कठिनाई स्तर चुन सकते हैं और तुरंत ऑडियो व्याख्या के साथ प्रश्नों का अभ्यास कर सकते हैं।'
    },
    {
        keywords: ['speech speed', 'voice', 'sound', 'tts', 'rate', 'आवाज की गति', 'आवाज'],
        en: 'You can customize speech speed, voice pitch, and volume at any time from the Accessibility Settings page (accessible via the profile menu or keyboard shortcut Alt+S). Speeds range from 0.5x for relaxed listening up to 2.0x for rapid review.',
        hi: 'आप सुगमता सेटिंग्स (Accessibility Settings) पृष्ठ पर जाकर कभी भी आवाज की गति, पिच और वॉल्यूम समायोजित कर सकते हैं। गति को 0.5x से 2.0x तक बदला जा सकता है।'
    },
    {
        keywords: ['timer', 'time remaining', 'समय', 'टाइमर'],
        en: 'During a competitive exam, the countdown timer is validated securely by the server. You can press the "T" key or say "Remaining Time" at any point to hear your exact time left. The platform will also automatically announce warnings at 15 minutes, 5 minutes, and 1 minute remaining.',
        hi: 'परीक्षा के दौरान शेष समय सुनने के लिए "T" कुंजी दबाएं या "Remaining Time" बोलें। मंच 15 मिनट, 5 मिनट और 1 मिनट शेष रहने पर स्वतः सूचना भी देता है।'
    },
    {
        keywords: ['high contrast', 'theme', 'color', 'थीम', 'कंट्रास्ट'],
        en: 'Insight Exam Portal offers multiple visual modes: Clean Modern Light (default), High-Contrast Yellow on Black, High-Contrast Cyan on Dark Navy, and Soft Warm Light. You can switch themes instantly from Accessibility Settings.',
        hi: 'पोर्टल पर कई डिस्प्ले मोड उपलब्ध हैं: स्वच्छ लाइट थीम, हाई-कंट्रास्ट पीला-पर-काला (लो-विज़न के लिए), सियान-ऑन-नेवी और सॉफ्ट वार्म थीम। इन्हें सुगमता सेटिंग्स से बदला जा सकता है।'
    }
];

class AIAssistantService {
    constructor() {
        this.apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || null;
        this.apiUrl = process.env.AI_API_URL || null;
    }

    /**
     * Generate an accessible response
     * @param {string} userMessage - Query from candidate
     * @param {string} language - 'en' or 'hi'
     * @param {object} context - Active page, active question, examActive status
     */
    async generateResponse(userMessage, language = 'en', context = {}) {
        if (!userMessage || typeof userMessage !== 'string') {
            return {
                reply: language === 'hi' ? 'कृपया अपना प्रश्न पूछें।' : 'Please ask a question regarding the platform, examinations, or practice.',
                provider: 'fallback'
            };
        }

        // Active Exam Security Check: AI assistance is restricted during competitive exams
        if (context.isExamActive) {
            return {
                reply: language === 'hi'
                    ? 'परीक्षा की निष्पक्षता बनाए रखने के लिए सक्रिय परीक्षा सत्र के दौरान एआई सहायता पूर्णतः अक्षम है। कृपया अपने कीबोर्ड शॉर्टकट का उपयोग करें।'
                    : 'AI Assistance is strictly disabled during active competitive examinations to maintain academic integrity. Please use your standard keyboard shortcuts and timer controls.',
                restricted: true,
                provider: 'guardrail'
            };
        }

        // Check if external API credentials are configured
        if (this.apiKey && this.apiUrl) {
            try {
                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        prompt: `You are the accessible AI Assistant for Insight Exam Portal, an online competitive exam platform for visually impaired candidates. Answer concisely in ${language === 'hi' ? 'Hindi' : 'English'}, using clear spoken phrasing suitable for Text-to-Speech screen readers. Candidate query: ${userMessage}`
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const reply = data.reply || data.choices?.[0]?.message?.content || data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (reply) {
                        return { reply: reply.trim(), provider: 'external-api' };
                    }
                }
            } catch (err) {
                console.warn('External AI API call failed, using intelligent local knowledge engine:', err.message);
            }
        }

        // Intelligent Knowledge Engine Fallback
        const normalized = userMessage.toLowerCase().trim();
        for (const item of KNOWLEDGE_BASE) {
            if (item.keywords.some((kw) => normalized.includes(kw))) {
                return {
                    reply: language === 'hi' ? item.hi : item.en,
                    provider: 'platform-knowledge'
                };
            }
        }

        // General contextual assistant response
        if (language === 'hi') {
            return {
                reply: `इनसाइट परीक्षा पोर्टल में आपका स्वागत है। आप मुझसे परीक्षा नियमों, कीबोर्ड शॉर्टकट्स, अभ्यास प्रश्नों, अथवा आवाज की गति बदलने से संबंधित सहायता मांग सकते हैं।`,
                provider: 'platform-knowledge'
            };
        }

        return {
            reply: `I am your voice assistant for the Insight Exam Portal. You can ask me how to navigate the portal, how to operate the controlled keyboard shortcuts (Arrow keys and Enter), how to start a practice test, or how to customize speech settings and display themes.`,
            provider: 'platform-knowledge'
        };
    }
}

module.exports = new AIAssistantService();
