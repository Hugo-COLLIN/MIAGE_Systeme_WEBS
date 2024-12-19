let eventSources = {};
let reconnectAttempts = {};
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000;

function startPatientStream(patientNum) {
  stopPatientStream(patientNum);

  const panel = $(`#patient-panel-${patientNum}`);
  const patientId = panel.find('.patient-id').val();
  const activityId = panel.find('.activity-id').val();
  const refreshRate = panel.find('.refresh-rate').val();

  const eventSource = new EventSource(`/data/${patientId}/${activityId}/${refreshRate}`);
  eventSources[patientNum] = eventSource;
  reconnectAttempts[patientNum] = 0;

  eventSource.onmessage = function (event) {
    if (event.data.startsWith("ERROR:")) {
      console.error(event.data);
      $('#common-data-container').append(`<p class="text-danger">${event.data}</p>`);
      stopPatientStream(patientNum);
      return;
    }

    const data = event.data.split(',');
    const selectedSensors = panel.find('.sensor-checkbox:checked').map(function () {
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

  eventSource.onerror = function(event) {
    console.error("EventSource failed:", event);
    $('#common-data-container').append(`<p class="text-danger">Erreur de connexion pour le patient ${patientId}</p>`);
    stopPatientStream(patientNum);

    if (reconnectAttempts[patientNum] < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts[patientNum]++;
      setTimeout(() => startPatientStream(patientNum), RECONNECT_DELAY);
    } else {
      console.error(`Échec de la reconnexion après ${MAX_RECONNECT_ATTEMPTS} tentatives pour le patient ${patientId}`);
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
  $('.patient-container').each(function () {
    const patientNum = $(this).attr('id').replace('patient-panel-', '');
    startPatientStream(parseInt(patientNum));
  });
}

function stopAllStreams() {
  for (let patientNum in eventSources) {
    stopPatientStream(patientNum);
  }
}

function checkServerConnection() {
  $.ajax({
    url: '/check_connection',
    method: 'GET',
    timeout: 5000,
    success: function(response) {
      console.log(`Serveur en fonctionnement (Server Time: ${response.timestamp})`);
    },
    error: function(xhr, status, error) {
      console.error(`Impossible d'établir une connexion avec le serveur (Local Time: ${new Date(Date.now()).toISOString()})`, error);
      $('#common-data-container').append(`<p class="text-danger">Impossible d'établir une connexion avec le serveur (Local Time: ${new Date(Date.now()).toISOString()})</p>`);
      stopAllStreams();
      setTimeout(checkServerConnection, RECONNECT_DELAY);
    }
  });
}
