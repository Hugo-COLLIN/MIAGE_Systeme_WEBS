function startStreaming() {
    const patientId = $('#patientId').val();
    const activityId = $('#activityId').val();
    const eventSource = new EventSource(`/data/${patientId}/${activityId}`);

    $('#data-container').empty();  // Clear previous data
    eventSource.onmessage = function(event) {
        $('#data-container').append(`<p>${event.data}</p>`);
    };
}
