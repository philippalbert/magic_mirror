from flask import Flask, send_from_directory, request, jsonify
import groq
import os

app = Flask(__name__)

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
if not GROQ_API_KEY:
    print("Warning: GROQ_API_KEY not set")

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/script.js')
def script():
    return send_from_directory('.', 'script.js')

@app.route('/ask', methods=['POST'])
def ask():
    if not GROQ_API_KEY:
        return jsonify({'error': 'GROQ_API_KEY not configured'}), 500

    data = request.get_json()
    messages = data.get('messages', [])
    if not messages:
        return jsonify({'error': 'No messages provided'}), 400

    try:
        client = groq.Groq(api_key=GROQ_API_KEY)

        response = client.chat.completions.create(
            model="groq/compound",
            messages=messages,
            max_tokens=300
        )

        answer = response.choices[0].message.content or 'No content'
        
        return jsonify({'answer': answer})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
