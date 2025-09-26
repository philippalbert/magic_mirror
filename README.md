# Magic Mirror

A voice-activated magic mirror application with local LLM integration, designed to work offline without internet connectivity. Features a spy-themed UI and responds to voice commands.

## Features

- Voice activation with "Hello Mirror"
- Conversational interface allowing multiple questions
- Offline speech recognition using Web Speech API
- Local LLM integration with DeepSeek via Ollama
- Text-to-speech response output
- Spy-themed dark UI with grey color scheme
- Raspberry Pi compatible

## Requirements

- Python 3.7+
- Ollama (for local LLM)
- Modern web browser with offline speech recognition support (Chrome recommended)
- Microphone access

## Installation

### 1. Install Ollama

Download and install Ollama from [ollama.ai](https://ollama.ai). For Raspberry Pi:

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Pull the DeepSeek Model

```bash
ollama pull deepseek-r1:1.5b
```

### 3. Install Python Dependencies

```bash
pip install flask ollama
```

### 4. Browser Setup (for offline speech recognition)

- Use Chrome or Chromium
- Enable offline speech recognition:
  - Go to `chrome://settings/content/speechRecognition`
  - Ensure "Allow sites to use offline speech recognition" is enabled
  - Download offline language models if prompted

## Running the Application

### Start Ollama (if not running)

```bash
ollama serve
```

### Start the Magic Mirror Server

```bash
python app.py
```

### Access the Mirror

Open your browser and navigate to `http://localhost:5000`

## Usage

1. Allow microphone access when prompted
2. Say "Hello Mirror" or click the mirror to start a conversation
3. Ask your questions; the LLM will respond to each one
4. Say "goodbye" or "stop" to end the conversation, or click outside the modal

## Raspberry Pi Deployment

1. Install Ollama on your Raspberry Pi
2. Pull the model: `ollama pull deepseek-r1:1.5b`
3. Install Python dependencies
4. Run `python app.py` on the Pi
5. Access from any device on the network at `http://<pi-ip>:5000`

## Troubleshooting

- **Speech recognition not working**: Ensure browser has offline models downloaded
- **LLM not responding**: Check that Ollama is running with `ollama list`
- **Microphone access denied**: Grant microphone permissions in browser settings
- **Port 5000 in use**: Change the port in `app.py` if needed

## Architecture

- **Frontend**: HTML/CSS/JavaScript with Web Speech API
- **Backend**: Flask server with Ollama integration
- **LLM**: Local DeepSeek model via Ollama
- **Speech**: Browser-based recognition and synthesis (offline capable)

## Offline Operation

The entire system operates without internet:
- Speech recognition uses downloaded browser models
- LLM runs locally via Ollama
- Text-to-speech uses browser's built-in synthesis
- No external API calls required

## Customization

- Change the trigger phrase in `script.js`
- Modify the LLM model in `app.py`
- Adjust UI colors in `styles.css`
- Update speech language in `script.js` (recognition.lang)
