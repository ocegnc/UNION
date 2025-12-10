import { api } from './api';

export function useQuestionnaire() {

  const getQuestionnaireById = (categorie) => {
    return api.get(`/questionnaire/${categorie}/complet`);
  };

  return {
    getQuestionnaireById
  };
}
