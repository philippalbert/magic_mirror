document.addEventListener('DOMContentLoaded', () => {
    const mirror = document.getElementById('mirror');
    const modal = document.getElementById('modal');
    const listening = document.getElementById('listening');
    const questionDiv = document.getElementById('question');
    const questionText = document.getElementById('question-text');
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
            if (transcript.includes('hello mirror')) {
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
        recognition.stop(); // Stop continuous listening during conversation

        while (true) {
            listening.classList.remove('hidden');
            thinking.classList.add('hidden');
            answer.classList.add('hidden');

            // Get the question from speech
            const userQuestion = await getQuestion();
            if (!userQuestion || userQuestion.toLowerCase().includes('goodbye') || userQuestion.toLowerCase().includes('stop')) {
                modal.classList.add('hidden');
                recognition.start(); // Restart continuous listening
                return;
            }

            listening.classList.add('hidden');
            questionDiv.classList.remove('hidden');
            questionText.textContent = userQuestion;

            // Brief pause to show the question
            await new Promise(resolve => setTimeout(resolve, 1500));

            questionDiv.classList.add('hidden');
            thinking.classList.remove('hidden');

            try {
                const response = await fetch('/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question: userQuestion })
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
                listening.classList.add('hidden');
                thinking.classList.add('hidden');
                answer.classList.remove('hidden');
                responseText.textContent = "Error contacting the mirror.";
                break; // Exit on error
            }
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
