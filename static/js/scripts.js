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

function createPatientPanel() {
    patientCounter++;
    let sensorCheckboxes = Object.keys(sensorTypes).map(sensor => createSensorCheckbox(sensor)).join('');

    return `
        <div class="patient-container mb-3" id="patient-panel-${patientCounter}">
            <h4>Patient ${patientCounter}</h4>
            <div class="form-group mb-2">
                <label>Patient ID:</label>
                <input type="number" class="form-control patient-id" value="${patientCounter}">
            </div>
            <div class="form-group mb-2">
                <label>Activité:</label>
                <input type="number" class="form-control activity-id" value="0">
            </div>
            <div class="mb-2">
                <label for="refresh-rate-${patientCounter}">Taux de rafraîchissement (ms):</label>
                <input type="range" class="form-range refresh-rate" id="refresh-rate-${patientCounter}" min="100" max="2000" step="100" value="${globalRefreshRate}">
                <span class="refresh-rate-value">${globalRefreshRate} ms</span>
            </div>
            <div class="sensor-checkboxes mb-2">
                ${sensorCheckboxes}
            </div>
            <div class="mb-2">
                <button onclick="startPatientStream(${patientCounter})" class="btn btn-success btn-sm">Démarrer</button>
                <button onclick="stopPatientStream(${patientCounter})" class="btn btn-warning btn-sm">Arrêter</button>
                <button onclick="removePatientPanel(${patientCounter})" class="btn btn-danger btn-sm">Supprimer</button>
            </div>
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
    
    const eventSource = new EventSource(`/data/${patientId}/${activityId}/${refreshRate}`);
    eventSources[patientNum] = eventSource;
    
    eventSource.onmessage = function(event) {
        const data = event.data.split(',');
        const selectedSensors = panel.find('.sensor-checkbox:checked').map(function() {
            return $(this).val();
        }).get();
        
        let filteredData = data.filter((value, index) => selectedSensors.includes(Object.keys(sensorTypes)[index]));
        
        if (filteredData.length > 0) {
            const formattedData = `Patient ${patientId}: ${filteredData.join(', ')}`;
            $('#common-data-container').append(`<p>${formattedData}</p>`);
            $('#common-data-container').scrollTop($('#common-data-container')[0].scrollHeight);
            
            updateChart(filteredData);
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

function createSensorCheckbox(sensor) {
    return `
        <div class="form-check">
            <input class="form-check-input sensor-checkbox" type="checkbox" id="${sensor}-${patientCounter}" value="${sensor}" checked>
            <label class="form-check-label sensor-label" for="${sensor}-${patientCounter}">
                ${sensorTypes[sensor].name} (${sensor})
                <i class="bi bi-info-circle info-icon" data-bs-toggle="tooltip" data-bs-placement="top" title="${sensorTypes[sensor].description}"></i>
            </label>
        </div>
    `;
}

function initTooltips() {
    $('[data-bs-toggle="tooltip"]').tooltip();
}

// chart
let chart;
const maxDataPoints = 100;
const datasets = Object.keys(sensorTypes).map(sensor => ({
    label: sensorTypes[sensor].name,
    data: [],
    borderColor: getRandomColor(),
    fill: false
}));

function getRandomColor() {
    return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
}

function initChart() {
    const ctx = document.getElementById('realTimeChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Temps'
                    }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Valeur'
                    }
                }
            },
            plugins: {
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy',
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy',
                    }
                }
            }
        }
    });
}

function updateChart(data) {
    const time = Date.now();
    chart.data.labels.push(time);
    data.forEach((value, index) => {
        chart.data.datasets[index].data.push({x: time, y: parseFloat(value)});
        if (chart.data.datasets[index].data.length > maxDataPoints) {
            chart.data.datasets[index].data.shift();
        }
    });
    if (chart.data.labels.length > maxDataPoints) {
        chart.data.labels.shift();
    }
    chart.update();
}

$(document).ready(function() {
    $('#global-refresh-rate').on('input', function() {
        setGlobalRefreshRate(parseInt($(this).val()));
    });

    $(document).on('input', '.refresh-rate', function() {
        const patientNum = $(this).closest('.patient-container').attr('id').replace('patient-panel-', '');
        setRefreshRate(patientNum);
    });

    updateGlobalRefreshRateDisplay();
    addPatientPanel(); // Ajoute un premier patient par défaut

    initChart();
    
    $('#dataTabs button').on('shown.bs.tab', function (e) {
        if (e.target.id === 'graph-tab') {
            chart.resize();
        }
    });
});