let patientCounter = 0;
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


$(document).ready(function() {
    $('#global-refresh-rate').on('input', function() {
        setGlobalRefreshRate(parseInt($(this).val()));
    });

    $(document).on('input', '.refresh-rate', function() {
        const patientNum = $(this).closest('.patient-container').attr('id').replace('patient-panel-', '');
        setRefreshRate(patientNum);
    });

    updateGlobalRefreshRateDisplay();

    initChart();
    initSensorCharts();

    $('#dataTabs button').on('shown.bs.tab', function (e) {
        if (e.target.id === 'graph-tab') {
            chart.resize();
        } else if (e.target.id === 'sensor-charts-tab') {
            Object.values(sensorCharts).forEach(chart => chart.resize());
        }
    });

    // Ajouter un gestionnaire d'événements pour les changements de checkbox
    $(document).on('change', '.sensor-checkbox', function() {
        const patientNum = $(this).closest('.patient-container').attr('id').replace('patient-panel-', '');
        if (eventSources[patientNum]) {
            startPatientStream(patientNum);
        }
    });

    addPatientPanel(); // Ajoute un premier patient par défaut
});
