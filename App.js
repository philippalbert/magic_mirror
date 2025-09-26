const { useState, useEffect } = React;

function MagicMirror() {
    const [transcript, setTranscript] = useState('');
    const [isActivated, setIsActivated] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (!isActivated && finalTranscript.toLowerCase().includes('hello mirror')) {
                setIsActivated(true);
                setTranscript(''); // Reset transcript on activation
            }
            if (isActivated) {
                setTranscript(prev => prev + finalTranscript);
            }
        };

        recognition.onerror = (event) => {
            setError('Speech recognition error: ' + event.error);
        };

        recognition.start();

        return () => {
            recognition.stop();
        };
    }, [isActivated]);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Magic Mirror</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!isActivated ? (
                <p>Welcome! Say "hello mirror" to start the magic.</p>
            ) : (
                <div>
                    <p>You said:</p>
                    <p style={{ fontSize: '18px', border: '1px solid #ccc', padding: '10px', minHeight: '100px' }}>
                        {transcript}
                    </p>
                </div>
            )}
        </div>
    );
}

ReactDOM.render(<MagicMirror />, document.getElementById('root'));
