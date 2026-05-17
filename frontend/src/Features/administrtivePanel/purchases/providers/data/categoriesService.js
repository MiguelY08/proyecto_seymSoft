import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/categories';

const getAuthToken = () => {
  return localStorage.getItem('accessToken') || '';
};

export const categoriesService = {
  getAll: async () => {
    const response = await axios.get(API_BASE_URL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    return response.data;
  }
};