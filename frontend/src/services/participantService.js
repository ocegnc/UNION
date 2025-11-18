import { api } from './api';

export function useParticipant() {

  const getParticipants = () => {
    return api.get('/participant');
  };

  const getParticipantById = (id) => {
    return api.get(`/participant/${id}`);
  };

  const createParticipant = (data) => {
    return api.post('/participant', data);
  };

  return {
    getParticipants,
    getParticipantById,
    createParticipant
  };
}
