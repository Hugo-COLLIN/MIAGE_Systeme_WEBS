function createPatientPanel() {
  patientCounter++;
  let sensorCheckboxes = Object.keys(sensorTypes).map(sensor => createSensorCheckbox(sensor)).join('');

  // Ajouter un gestionnaire d'événements pour les changements de checkbox
  $(`#patient-panel-${patientCounter}`).on('change', '.sensor-checkbox', function () {
    const patientNum = $(this).closest('.patient-container').attr('id').replace('patient-panel-', '');
    if (eventSources[patientNum]) {
      startPatientStream(patientNum);
    }
  });

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

  // Ajouter un gestionnaire d'événements pour les changements de checkbox
  $(`#patient-panel-${patientCounter}`).on('change', '.sensor-checkbox', function () {
    const patientNum = $(this).closest('.patient-container').attr('id').replace('patient-panel-', '');
    if (eventSources[patientNum]) {
      startPatientStream(patientNum);
    }
  });
}

function removePatientPanel(patientNum) {
  stopPatientStream(patientNum);
  $(`#patient-panel-${patientNum}`).remove();

  // Supprimer les données du patient des graphiques par capteur
  Object.values(sensorCharts).forEach(chart => {
    chart.data.datasets = chart.data.datasets.filter(ds => ds.patientId !== patientNum);
    chart.update();
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
