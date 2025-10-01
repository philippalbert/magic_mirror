let isActivated = false;

const transcriptEl = document.getElementById('transcript');
const conversationEl = document.getElementById('conversation');
const thinkingEl = document.getElementById('thinking');
const errorEl = document.getElementById('error');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    errorEl.textContent = 'Speech recognition not supported in this browser.';
} else {
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
            transcriptEl.style.display = 'block';
            conversationEl.innerHTML = '';
        }
        if (isActivated) {
            if (finalTranscript.toLowerCase().includes('goodbye')) {
                isActivated = false;
                transcriptEl.style.display = 'none';
                conversationEl.innerHTML = '';
            } else if (finalTranscript.toLowerCase().includes('ask the llm')) {
                // Send to LLM
                conversationEl.innerHTML += '<p><strong>You:</strong> ' + finalTranscript + '</p>';
                thinkingEl.style.display = 'block';
                fetch('/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: finalTranscript })
                })
                .then(response => response.json())
                .then(data => {
                    thinkingEl.style.display = 'none';
                    if (data.answer) {
                        const formattedAnswer = data.answer.replace(/\n/g, '<br>');
                        conversationEl.innerHTML += '<div class="llm-response"><strong>LLM:</strong><br>' + formattedAnswer + '</div>';
                    } else {
                        conversationEl.innerHTML += '<p><strong>Error:</strong> ' + data.error + '</p>';
                    }
                })
                .catch(error => {
                    thinkingEl.style.display = 'none';
                    conversationEl.innerHTML += '<p><strong>Error:</strong> ' + error.message + '</p>';
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
}
