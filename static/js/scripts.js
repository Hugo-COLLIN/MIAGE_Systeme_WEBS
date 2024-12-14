let eventSources = [];

function startMultiStreaming() {
    stopAllStreams();
    
    const patient1Id = $('.patient1-id').val();
    const patient1Activity = $('.patient1-activity').val();
    const patient2Id = $('.patient2-id').val();
    const patient2Activity = $('.patient2-activity').val();

    $('#data-container-1').empty();
    $('#data-container-2').empty();

    startPatientStream(patient1Id, patient1Activity, 1);
    startPatientStream(patient2Id, patient2Activity, 2);
}

function startPatientStream(patientId, activityId, containerNum) {
    const eventSource = new EventSource(`/data/${patientId}/${activityId}`);
    eventSources.push(eventSource);
    
    eventSource.onmessage = function(event) {
        $(`#data-container-${containerNum}`).append(`<p>${event.data}</p>`);
    };
}

function stopAllStreams() {
    eventSources.forEach(es => es.close());
    eventSources = [];
}
