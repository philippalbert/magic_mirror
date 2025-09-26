let isActivated = false;
let fullTranscript = '';

const welcomeEl = document.getElementById('welcome');
const transcriptEl = document.getElementById('transcript');
const textEl = document.getElementById('text');
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
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            if (!isActivated && (finalTranscript.toLowerCase().includes('hello mirror') || finalTranscript.toLowerCase().includes('hello mira'))) {
                isActivated = true;
                welcomeEl.style.display = 'none';
                transcriptEl.style.display = 'block';
                fullTranscript = ''; // reset
            }
            if (isActivated) {
                if (finalTranscript.toLowerCase().includes('goodbye')) {
                    isActivated = false;
                    transcriptEl.style.display = 'none';
                    welcomeEl.style.display = 'block';
                    fullTranscript = '';
                    textEl.innerHTML = '';
                } else {
                    fullTranscript += finalTranscript;
                    textEl.innerHTML = fullTranscript + '<span style="color:gray;">' + interimTranscript + '</span>';
                }
            }
        };

        recognition.onerror = (event) => {
            errorEl.textContent = 'Speech recognition error: ' + event.error;
        };

        recognition.start();
    });
}
