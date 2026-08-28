import api from './api';

export async function getHostelReviews(hostelId, params = {}) {
  const { data } = await api.get(`/hostels/${hostelId}/reviews`, { params });
  return data;
}

export async function createReview(hostelId, reviewData) {
  const { data } = await api.post(`/hostels/${hostelId}/reviews`, reviewData);
  return data;
}

export async function analyzeReview(reviewId) {
  const { data } = await api.post(`/reviews/${reviewId}/analyze`);
  return data;
}
