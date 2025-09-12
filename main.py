import tkinter as tk
import speech_recognition as sr
import threading
import time
import ollama
import pyttsx3

class MagicMirror:
    def __init__(self, root):
        self.root = root
        self.root.title("Magic Mirror")
        self.root.attributes("-fullscreen", True)
        self.root.configure(bg='black')

        self.label = tk.Label(root, text="Speak 'Hello Mirror' to begin", font=("Courier", 24), fg="#888", bg="black")
        self.label.pack(expand=True)

        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.engine = pyttsx3.init()
        self.listening = False
        self.question_mode = False

        # Start listening thread
        self.listen_thread = threading.Thread(target=self.listen_loop)
        self.listen_thread.daemon = True
        self.listen_thread.start()

    def listen_loop(self):
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source)
            while True:
                try:
                    audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=10)
                    text = self.recognizer.recognize_sphinx(audio).lower()
                    print(f"Heard: {text}")
                    if not self.question_mode and "hello mirror" in text:
                        self.start_question_mode()
                    elif self.question_mode:
                        self.process_question(text)
                except sr.WaitTimeoutError:
                    pass
                except sr.UnknownValueError:
                    pass
                except sr.RequestError:
                    pass

    def start_question_mode(self):
        self.question_mode = True
        self.label.config(text="Ask your question...")
        self.root.after(5000, self.reset_mode)  # Reset after 5 seconds if no question

    def process_question(self, question):
        self.question_mode = False
        self.label.config(text="Thinking...")
        self.animate_dots()

        # Query Ollama
        try:
            response = ollama.chat(model='deepseek-r1:1.5b', messages=[{'role': 'user', 'content': question}])
            answer = response['message']['content']
            self.label.config(text=answer)
            self.engine.say(answer)
            self.engine.runAndWait()
        except Exception as e:
            self.label.config(text="Error contacting LLM")
            print(e)

        self.root.after(10000, self.reset_to_idle)  # Show answer for 10 seconds

    def animate_dots(self):
        dots = ""
        for i in range(3):
            dots += "."
            self.label.config(text=f"Thinking{dots}")
            time.sleep(0.5)

    def reset_mode(self):
        if self.question_mode:
            self.question_mode = False
            self.reset_to_idle()

    def reset_to_idle(self):
        self.label.config(text="Speak 'Hello Mirror' to begin")

if __name__ == "__main__":
    root = tk.Tk()
    app = MagicMirror(root)
    root.mainloop()
