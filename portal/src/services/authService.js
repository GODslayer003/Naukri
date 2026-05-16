import api from './api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/candidate/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  register: async (userData) => {
    try {
      // Registration expects multipart/form-data for resume, but we can send JSON if no resume
      // Based on candidate.controller.js, it expects name, designation, phone, email, password
      const response = await api.post('/candidate/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  getMe: async () => {
    try {
      const response = await api.get('/candidate/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user data' };
    }
  },
  
  updateProfile: async (profileData) => {
    try {
      const response = await api.patch('/candidate/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Profile update failed' };
    }
  },

  uploadImage: async (formData) => {
    try {
      const response = await api.post('/candidate/profile/image', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Image upload failed' };
    }
  }
};

export default authService;
