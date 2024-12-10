from flask import Flask, render_template, Response
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
        # Use universal_newlines and encoding for broader compatibility
        process = subprocess.Popen(
            ['./daemon', str(patient_id), str(activity)],
            stdout=subprocess.PIPE,
            universal_newlines=True,
            encoding='utf-8',
            bufsize=1,  # Line buffered output
            preexec_fn=os.setpgrp  # Allow process group termination
        )

        def generate():
            try:
                for line in iter(process.stdout.readline, ''):
                    # Explicitly format as server-sent event
                    yield f"data: {line.strip()}\n\n"
                
                # Close stdout to prevent resource leaks
                process.stdout.close()
                
                # Wait for the process to terminate
                process.wait()
            
            except Exception as e:
                # Log the error or handle it appropriately
                print(f"Error in stream generation: {e}")
            
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
    app.run(debug=True, host='0.0.0.0')