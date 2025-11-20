import { api } from './api';

export function useCategorie() {
  const getCategories = () => api.get('/categorie'); // GET /api/categorie

  return { getCategories };
}
