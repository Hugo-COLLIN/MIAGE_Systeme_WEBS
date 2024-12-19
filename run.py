from flask import Flask, render_template, Response, stream_with_context, jsonify
from datetime import datetime
import os
import signal
import subprocess

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/data/<int:patient_id>/<int:activity>/<int:refresh_rate>')
def stream_data(patient_id, activity, refresh_rate):
    def generate():
        try:
            process = subprocess.Popen(
                ['./daemon', str(patient_id), str(activity), str(refresh_rate)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True,
                bufsize=1,
                preexec_fn=os.setpgrp
            )

            while True:
                line = process.stdout.readline()
                if not line:
                    error = process.stderr.read()
                    if error:
                        yield f"data: ERROR: {error.strip()}\n\n"
                    break
                yield f"data: {line.strip()}\n\n"

        except subprocess.SubprocessError as e:
            yield f"data: ERROR: Erreur lors de l'exécution du daemon : {e}\n\n"
        except Exception as e:
            yield f"data: ERROR: Une erreur inattendue s'est produite : {e}\n\n"
        finally:
            if 'process' in locals():
                process.stdout.close()
                process.wait()
                try:
                    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                except Exception:
                    pass

    return Response(stream_with_context(generate()), mimetype='text/event-stream')


@app.route('/check_connection')
def check_connection():
    return jsonify({"status": "connected", "timestamp": datetime.now().isoformat()})


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', threaded=True)
