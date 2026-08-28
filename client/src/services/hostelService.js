import api from './api';

export async function getHostels(params = {}) {
  // Filter out empty values
  const cleaned = {};
  for (const [key, val] of Object.entries(params)) {
    if (val !== '' && val !== undefined && val !== null) {
      cleaned[key] = val;
    }
  }
  const { data } = await api.get('/hostels', { params: cleaned });
  return data; // { success, data: [...], pagination: {...} }
}
