document.addEventListener('DOMContentLoaded', () => {
    const mirror = document.getElementById('mirror');
    const modal = document.getElementById('modal');
    const thinking = document.getElementById('thinking');
    const answer = document.getElementById('answer');
    const responseText = document.getElementById('response-text');

    // Speech recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Set language, can be changed

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            console.log('Heard:', transcript);
            if (transcript.includes('mirror') || transcript.includes('hey mirror')) {
                triggerMirror();
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
            // Restart listening
            recognition.start();
        };

        // Start listening
        recognition.start();
    } else {
        console.warn('Speech recognition not supported in this browser.');
    }

    async function triggerMirror() {
        modal.classList.remove('hidden');
        thinking.classList.remove('hidden');
        answer.classList.add('hidden');

        // Get the question from speech
        const question = await getQuestion();
        if (!question) {
            modal.classList.add('hidden');
            return;
        }

        try {
            const response = await fetch('/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question: question })
            });
            const data = await response.json();
            const answerText = data.answer || "Error getting answer";

            thinking.classList.add('hidden');
            answer.classList.remove('hidden');
            responseText.textContent = answerText;

            // Speak the answer
            speak(answerText);
        } catch (error) {
            console.error('Error:', error);
            thinking.classList.add('hidden');
            answer.classList.remove('hidden');
            responseText.textContent = "Error contacting the mirror.";
        }
    }

    async function getQuestion() {
        return new Promise((resolve) => {
            let question = null;
            const questionRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            questionRecognition.continuous = false;
            questionRecognition.interimResults = false;
            questionRecognition.lang = 'en-US';

            questionRecognition.onresult = (event) => {
                question = event.results[0][0].transcript;
                console.log('Question:', question);
            };

            questionRecognition.onend = () => {
                resolve(question);
            };

            questionRecognition.onerror = () => {
                resolve(null);
            };

            questionRecognition.start();
        });
    }

    function speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    }

    mirror.addEventListener('click', triggerMirror);

    // Close modal on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});
