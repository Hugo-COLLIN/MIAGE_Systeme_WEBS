from flask import Flask, render_template, Response
import subprocess

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data/<int:patient_id>/<int:activity>')
def stream_data(patient_id, activity):
    process = subprocess.Popen(
        ['./daemon', str(patient_id), str(activity)],
        stdout=subprocess.PIPE,
        text=True
    )
    def generate():
        for line in process.stdout:
            yield f"data: {line}\n\n"
    return Response(generate(), mimetype='text/event-stream')

if __name__ == "__main__":
    app.run(debug=True)
