// scripts.js
let eventSources = {};
let patientCounter = 0;
const sensorTypes = {
    'alx': {name: 'Accélération sur l\'axe X', description: 'Centrale inertielle placée sur la cheville gauche'},
    'aly': {name: 'Accélération sur l\'axe Y', description: 'Centrale inertielle placée sur la cheville gauche'},
    'alz': {name: 'Accélération sur l\'axe Z', description: 'Centrale inertielle placée sur la cheville gauche'},
    'glx': {name: 'Position angulaire sur l\'axe X', description: 'Gyroscope placé sur la cheville gauche'},
    'gly': {name: 'Position angulaire sur l\'axe Y', description: 'Gyroscope placé sur la cheville gauche'},
    'glz': {name: 'Position angulaire sur l\'axe Z', description: 'Gyroscope placé sur la cheville gauche'},
    'arx': {name: 'Accélération sur l\'axe X', description: 'Centrale inertielle placée sur l\'avant bras droit'},
    'ary': {name: 'Accélération sur l\'axe Y', description: 'Centrale inertielle placée sur l\'avant bras droit'},
    'arz': {name: 'Accélération sur l\'axe Z', description: 'Centrale inertielle placée sur l\'avant bras droit'},
    'grx': {name: 'Position angulaire sur l\'axe X', description: 'Gyroscope placé sur l\'avant bras droit'},
    'gry': {name: 'Position angulaire sur l\'axe Y', description: 'Gyroscope placé sur l\'avant bras droit'},
    'grz': {name: 'Position angulaire sur l\'axe Z', description: 'Gyroscope placé sur l\'avant bras droit'}
};
let globalRefreshRate = 1000;

function updateGlobalRefreshRateDisplay() {
    $('#global-refresh-rate-value').text(globalRefreshRate + ' ms');
}

function setGlobalRefreshRate(rate) {
    globalRefreshRate = rate;
    updateGlobalRefreshRateDisplay();
    $('.patient-container').each(function() {
        const patientNum = $(this).attr('id').replace('patient-panel-', '');
        $(this).find('.refresh-rate').val(rate);
        updateRefreshRateDisplay(patientNum);
        if (eventSources[patientNum]) {
            startPatientStream(patientNum);
        }
    });
}

function updateRefreshRateDisplay(patientNum) {
    const panel = $(`#patient-panel-${patientNum}`);
    const refreshRate = panel.find('.refresh-rate').val();
    panel.find('.refresh-rate-value').text(refreshRate + ' ms');
}

function setRefreshRate(patientNum) {
    updateRefreshRateDisplay(patientNum);
    if (eventSources[patientNum]) {
        startPatientStream(patientNum);
    }
}

function createSensorCheckbox(sensor, isGlobal = false) {
    const id = isGlobal ? `global-${sensor}` : `${sensor}-${patientCounter}`;
    return `
        <div class="form-check">
            <input class="form-check-input sensor-checkbox ${isGlobal ? 'global-sensor' : ''}" type="checkbox" id="${id}" value="${sensor}" checked>
            <label class="form-check-label sensor-label" for="${id}">
                ${sensorTypes[sensor].name} (${sensor})
                <i class="bi bi-info-circle info-icon" data-bs-toggle="tooltip" data-bs-placement="top" title="${sensorTypes[sensor].description}"></i>
            </label>
        </div>
    `;
}

function createPatientPanel() {
    patientCounter++;
    let sensorCheckboxes = Object.keys(sensorTypes).map(sensor => createSensorCheckbox(sensor)).join('');

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
                <label for="refresh-rate-${patientCounter}">Taux de rafraîchissement (ms):</label>
                <input type="range" class="form-range refresh-rate" id="refresh-rate-${patientCounter}" min="100" max="2000" step="100" value="${globalRefreshRate}">
                <span class="refresh-rate-value">${globalRefreshRate} ms</span>
            </div>
            <div class="sensor-checkboxes mb-3">
                ${sensorCheckboxes}
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
    initTooltips();
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
    const refreshRate = panel.find('.refresh-rate').val();
    const container = $(`#data-container-${patientNum}`);
    
    container.empty();
    
    const eventSource = new EventSource(`/data/${patientId}/${activityId}/${refreshRate}`);
    eventSources[patientNum] = eventSource;
    
    eventSource.onmessage = function(event) {
        const data = event.data.split(',');
        const selectedSensors = panel.find('.sensor-checkbox:checked').map(function() {
            return $(this).val();
        }).get();
        
        let filteredData = data.filter((value, index) => selectedSensors.includes(Object.keys(sensorTypes)[index]));
        
        if (filteredData.length > 0) {
            container.append(`<p>${filteredData.join(', ')}</p>`);
            container.scrollTop(container[0].scrollHeight);
        }
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

function initTooltips() {
    $('[data-bs-toggle="tooltip"]').tooltip();
}

function createGlobalSensorCheckboxes() {
    let checkboxes = Object.keys(sensorTypes).map(sensor => createSensorCheckbox(sensor, true)).join('');
    $('#global-sensor-checkboxes').html(checkboxes);
}

function initGlobalSensorControls() {
    $(document).on('change', '.global-sensor', function() {
        const sensor = $(this).val();
        const isChecked = $(this).prop('checked');
        $(`.sensor-checkbox[value="${sensor}"]:not(.global-sensor)`).prop('checked', isChecked);
    });
}

// Initialisation
$(document).ready(function() {
    createGlobalSensorCheckboxes();
    initGlobalSensorControls();
    addPatientPanel();
    initTooltips();

    $('#global-refresh-rate').on('input', function() {
        setGlobalRefreshRate(parseInt($(this).val()));
    });

    $(document).on('input', '.refresh-rate', function() {
        const patientNum = $(this).closest('.patient-container').attr('id').replace('patient-panel-', '');
        setRefreshRate(patientNum);
    });

    updateGlobalRefreshRateDisplay();
});
