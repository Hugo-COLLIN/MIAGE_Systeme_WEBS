const eventSources = {};

function startStreaming(patientNumber) {
    const patientId = $(`#patientId${patientNumber}`).val();
    const activityId = $(`#activityId${patientNumber}`).val();
    
    // Fermer la source d'événements existante pour ce patient si elle existe
    if (eventSources[patientNumber]) {
        eventSources[patientNumber].close();
    }
    
    // Créer une nouvelle source d'événements
    const eventSource = new EventSource(`/data/${patientId}/${activityId}`);
    eventSources[patientNumber] = eventSource;
    
    // Vider le conteneur précédent
    $(`#data-container${patientNumber}`).empty();
    
    // Gérer les messages pour ce patient
    eventSource.onmessage = function(event) {
        $(`#data-container${patientNumber}`).append(`<p>${event.data}</p>`);
    };
    
    // Gestion des erreurs
    eventSource.onerror = function(error) {
        console.error(`Erreur pour le patient ${patientNumber}:`, error);
        $(`#data-container${patientNumber}`).append(`<p class="text-danger">Erreur de connexion</p>`);
        eventSource.close();
    };
}