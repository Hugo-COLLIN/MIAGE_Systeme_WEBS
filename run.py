from flask import Flask, render_template, Response, stream_with_context
import subprocess
import os
import signal

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data/<int:patient_id>/<int:activity>')
def stream_data(patient_id, activity):
    try:
        process = subprocess.Popen(
            ['./daemon', str(patient_id), str(activity)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            bufsize=1,
            preexec_fn=os.setpgrp
        )
        
        def generate():
            try:
                while True:
                    line = process.stdout.readline()
                    if not line:
                        break
                    yield f"data: {line.strip()}\n\n"
            finally:
                process.stdout.close()
                process.wait()
                try:
                    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                except Exception:
                    pass
        
        return Response(stream_with_context(generate()), mimetype='text/event-stream')
    
    except subprocess.SubprocessError as e:
        return f"Erreur lors de l'exécution du daemon : {e}", 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')