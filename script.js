let isActivated = false;

const welcomeEl = document.getElementById('welcome');
const transcriptEl = document.getElementById('transcript');
const conversationEl = document.getElementById('conversation');
const errorEl = document.getElementById('error');
const startBtn = document.getElementById('startBtn');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    errorEl.textContent = 'Speech recognition not supported in this browser.';
    startBtn.disabled = true;
} else {
    startBtn.addEventListener('click', () => {
        startBtn.style.display = 'none';
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false; // only final
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (!isActivated && (finalTranscript.toLowerCase().includes('hello mirror') || finalTranscript.toLowerCase().includes('hello mira'))) {
                isActivated = true;
                welcomeEl.style.display = 'none';
                transcriptEl.style.display = 'block';
                conversationEl.innerHTML = '';
            }
            if (isActivated) {
                if (finalTranscript.toLowerCase().includes('goodbye')) {
                    isActivated = false;
                    transcriptEl.style.display = 'none';
                    welcomeEl.style.display = 'block';
                    conversationEl.innerHTML = '';
                } else if (finalTranscript.includes('?')) {
                    // Send to LLM
                    fetch('/ask', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ question: finalTranscript })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.answer) {
                            conversationEl.innerHTML += '<p><strong>You:</strong> ' + finalTranscript + '</p><p><strong>LLM:</strong> ' + data.answer + '</p>';
                        } else {
                            conversationEl.innerHTML += '<p><strong>You:</strong> ' + finalTranscript + '</p><p><strong>Error:</strong> ' + data.error + '</p>';
                        }
                    })
                    .catch(error => {
                        conversationEl.innerHTML += '<p><strong>You:</strong> ' + finalTranscript + '</p><p><strong>Error:</strong> ' + error.message + '</p>';
                    });
                } else {
                    // Just display speech
                    conversationEl.innerHTML += '<p><strong>You:</strong> ' + finalTranscript + '</p>';
                }
            }
        };

        recognition.onerror = (event) => {
            errorEl.textContent = 'Speech recognition error: ' + event.error;
        };

        recognition.start();
    });
}
