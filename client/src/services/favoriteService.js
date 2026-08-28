import api from './api';

export async function getFavorites() {
  const { data } = await api.get('/users/favorites');
  return data;
}

export async function addFavorite(hostelId) {
  const { data } = await api.post(`/users/favorites/${hostelId}`);
  return data;
}

export async function removeFavorite(hostelId) {
  const { data } = await api.delete(`/users/favorites/${hostelId}`);
  return data;
}
