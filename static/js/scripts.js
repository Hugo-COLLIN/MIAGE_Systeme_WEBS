let eventSources = {};
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

            // Limiter le nombre de lignes affichées dans le conteneur de texte
            const maxTextLines = 100;
            const textContainer = $('#common-data-container');
            if (textContainer.children().length > maxTextLines) {
                textContainer.children().slice(0, textContainer.children().length - maxTextLines).remove();
            }

            textContainer.scrollTop(textContainer[0].scrollHeight);

            updateChart(patientId, filteredData, selectedSensors);
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
