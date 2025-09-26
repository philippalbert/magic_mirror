from flask import Flask, send_from_directory, request, jsonify
import requests
import os
import json
from duckduckgo_search import DDGS

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
    question = data.get('question', '')
    if not question:
        return jsonify({'error': 'No question provided'}), 400
    
    try:
        messages = [{'role': 'user', 'content': question}]
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "web_search",
                    "description": "Search the web for current information",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "The search query"
                            }
                        },
                        "required": ["query"]
                    }
                }
            }
        ]
        
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {GROQ_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'llama-3.1-8b-instant',
                'messages': messages,
                'tools': tools,
                'max_tokens': 300
            }
        )
        
        if response.status_code != 200:
            return jsonify({'error': f'Groq API error: {response.text}'}), 500
        
        result = response.json()
        message = result['choices'][0]['message']
        
        if 'tool_calls' in message:
            for tool_call in message['tool_calls']:
                if tool_call['function']['name'] == 'web_search':
                    arguments = json.loads(tool_call['function']['arguments'])
                    query = arguments['query']
                    # Perform search
                    search_results = DDGS().text(query, max_results=3)
                    context = '\n'.join([r.get('body', '') for r in search_results])
                    
                    # Add tool response
                    messages.append(message)
                    messages.append({
                        'role': 'tool',
                        'tool_call_id': tool_call['id'],
                        'content': context
                    })
                    
                    # Second API call
                    response2 = requests.post(
                        'https://api.groq.com/openai/v1/chat/completions',
                        headers={
                            'Authorization': f'Bearer {GROQ_API_KEY}',
                            'Content-Type': 'application/json'
                        },
                        json={
                            'model': 'llama-3.1-8b-instant',
                            'messages': messages,
                            'max_tokens': 300
                        }
                    )
                    if response2.status_code == 200:
                        result = response2.json()
                        answer = result['choices'][0]['message']['content']
                    else:
                        answer = 'Error in second API call'
                else:
                    answer = message.get('content', 'No content')
        else:
            answer = message.get('content', 'No content')
        
        return jsonify({'answer': answer})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
