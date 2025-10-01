let isActivated = false;
let messages = [];

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
            messages = [];
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
                messages.push({role: 'user', content: finalTranscript});
                let history = messages.slice(-6); // last 3 pairs, 6 messages
                fetch('/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: history })
                })
                .then(response => response.json())
                .then(data => {
                    thinkingEl.style.display = 'none';
                    if (data.answer) {
                        const formattedAnswer = data.answer.replace(/\n/g, '<br>');
                        conversationEl.innerHTML += '<div class="llm-response"><strong>LLM:</strong><br>' + formattedAnswer + '</div>';
                        messages.push({role: 'assistant', content: data.answer});
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

    recognition.onend = () => {
        // Restart recognition if activated
        if (isActivated) {
            recognition.start();
        }
    };

    recognition.onerror = (event) => {
        errorEl.textContent = 'Speech recognition error: ' + event.error;
        // Attempt to restart after error
        if (isActivated) {
            setTimeout(() => {
                recognition.start();
            }, 1000); // Small delay to avoid rapid restarts
        }
    };

    recognition.start();
}
