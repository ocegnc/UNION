import { api } from './api';

export function useSoumission() {

  // Récupérer toutes les soumissions
  const getSoumissions = () => {
    return api.get('/soumission');
  };

  // Récupérer les soumissions d’un participant
  const getSoumissionsByParticipant = (participant_id) => {
    return api.get(`/soumission/participant/${participant_id}`);
  };

  // Récupérer une soumission spécifique
  const getSoumissionById = (id_soumission) => {
    return api.get(`/soumission/${id_soumission}`);
  };

  // Créer une soumission complète (avec réponses)
  const createSoumissionComplete = (data) => {
    // data = { participant_id, questionnaire_id, reponses: [{ question_id, choix_id?, reponse_libre? }] }
    return api.post('/soumission/complete', data);
  };

  // Supprimer une soumission
  const deleteSoumission = (id_soumission) => {
    return api.delete(`/soumission/${id_soumission}`);
  };

  return {
    getSoumissions,
    getSoumissionsByParticipant,
    getSoumissionById,
    createSoumissionComplete,
    deleteSoumission
  };
}
