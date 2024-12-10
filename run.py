from flask import Flask, render_template, Response
import subprocess
import signal
import os

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
            universal_newlines=True,
            preexec_fn=os.setpgrp  # Allow process group termination
        )

        def generate():
            try:
                for line in process.stdout:
                    yield f"data: {line}\n\n"
            finally:
                # Ensure process is terminated
                try:
                    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                except Exception:
                    pass

        return Response(generate(), mimetype='text/event-stream')

    except subprocess.SubprocessError as e:
        return f"Error running daemon: {e}", 500

if __name__ == "__main__":
    app.run(debug=True)