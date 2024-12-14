let eventSources = {};
let patientCounter = 0;

function createPatientPanel() {
    patientCounter++;
    return `
        <div class="patient-container" id="patient-panel-${patientCounter}">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3>Patient ${patientCounter}</h3>
                <button onclick="removePatientPanel(${patientCounter})" class="btn btn-danger btn-sm">Supprimer</button>
            </div>
            <div class="form-group mb-3">
                <label>Patient ID:</label>
                <input type="number" class="form-control patient-id" value="${patientCounter}">
                <label>Activité:</label>
                <input type="number" class="form-control activity-id" value="0">
            </div>
            <div class="mb-3">
                <button onclick="startPatientStream(${patientCounter})" class="btn btn-success btn-sm">Démarrer</button>
                <button onclick="stopPatientStream(${patientCounter})" class="btn btn-warning btn-sm">Arrêter</button>
            </div>
            <div id="data-container-${patientCounter}" class="data-display"></div>
        </div>
    `;
}

function addPatientPanel() {
    $('#patients-container').append(createPatientPanel());
}

function removePatientPanel(patientNum) {
    stopPatientStream(patientNum);
    $(`#patient-panel-${patientNum}`).remove();
}

function startPatientStream(patientNum) {
    stopPatientStream(patientNum);
    
    const panel = $(`#patient-panel-${patientNum}`);
    const patientId = panel.find('.patient-id').val();
    const activityId = panel.find('.activity-id').val();
    const container = $(`#data-container-${patientNum}`);
    
    container.empty();
    
    const eventSource = new EventSource(`/data/${patientId}/${activityId}`);
    eventSources[patientNum] = eventSource;
    
    eventSource.onmessage = function(event) {
        container.append(`<p>${event.data}</p>`);
        container.scrollTop(container[0].scrollHeight);
    };
}

function stopPatientStream(patientNum) {
    if (eventSources[patientNum]) {
        eventSources[patientNum].close();
        delete eventSources[patientNum];
    }
}

function startAllStreams() {
    $('.patient-container').each(function() {
        const patientNum = $(this).attr('id').replace('patient-panel-', '');
        startPatientStream(parseInt(patientNum));
    });
}

function stopAllStreams() {
    for (let patientNum in eventSources) {
        stopPatientStream(patientNum);
    }
}

// Ajouter automatiquement un premier patient au chargement
$(document).ready(function() {
    addPatientPanel();
});
