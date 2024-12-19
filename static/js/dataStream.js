let eventSources = {};

function startPatientStream(patientNum) {
  stopPatientStream(patientNum);

  const panel = $(`#patient-panel-${patientNum}`);
  const patientId = panel.find('.patient-id').val();
  const activityId = panel.find('.activity-id').val();
  const refreshRate = panel.find('.refresh-rate').val();

  const eventSource = new EventSource(`/data/${patientId}/${activityId}/${refreshRate}`);
  eventSources[patientNum] = eventSource;

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
