// services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://government-backend-dbhv.onrender.com/api';

// Regular API instance with 10s timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// File upload API instance with 60s timeout
const fileUploadAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for file uploads
});

// Apply interceptors to both instances
[api, fileUploadAPI].forEach(instance => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Only set Content-Type to application/json for non-FormData requests
      if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }
      // For FormData, let the browser set the correct Content-Type with boundary
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin-login';
      }
      return Promise.reject(error);
    }
  );
});

export const adminAPI = {
  // Auth
  checkSetupStatus: () => api.get('/admin/setup-status'),
  setupAdmin: (data) => api.post('/admin/setup', data),
  login: (data) => api.post('/admin/login', data),
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data) => api.put('/admin/profile', data),
  logout: () => api.post('/admin/logout'),

  // Announcements
  getAnnouncements: () => api.get('/announcements'),
  getAnnouncement: (id) => api.get(`/announcements/${id}`),
  createAnnouncement: (data) => fileUploadAPI.post('/announcements', data), // Use fileUploadAPI for potential image uploads
  updateAnnouncement: (id, data) => fileUploadAPI.put(`/announcements/${id}`, data), // Use fileUploadAPI for potential image uploads
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),

  // Gallery - Use fileUploadAPI for all gallery operations
  getGallery: () => api.get('/gallery'),
  createGalleryItem: (data) => fileUploadAPI.post('/gallery', data),
  updateGalleryItem: (id, data) => fileUploadAPI.put(`/gallery/${id}`, data),
  deleteGalleryItem: (id) => api.delete(`/gallery/${id}`),

  // Awards
  getAwards: () => api.get('/awards'),
  getAward: (id) => api.get(`/awards/${id}`),
  createAward: (data) => fileUploadAPI.post('/awards', data), // Use fileUploadAPI for potential image uploads
  updateAward: (id, data) => fileUploadAPI.put(`/awards/${id}`, data), // Use fileUploadAPI for potential image uploads
  deleteAward: (id) => api.delete(`/awards/${id}`),

  // Members - Use fileUploadAPI for potential profile image uploads
  getMembers: (params) => api.get('/members', { params }),
  getMember: (id) => api.get(`/members/${id}`),
  createMember: (data) => fileUploadAPI.post('/members', data),
  updateMember: (id, data) => fileUploadAPI.put(`/members/${id}`, data),
  deleteMember: (id) => api.delete(`/members/${id}`),

  // Feedback
  getFeedback: (params) => api.get('/feedback', { params }),
  getFeedbackById: (id) => api.get(`/feedback/${id}`),
  updateFeedbackStatus: (id, data) => api.put(`/feedback/${id}/status`, data),
  deleteFeedback: (id) => api.delete(`/feedback/${id}`),

  // Nagrik Seva APIs
  getNagrikSevaHeader: () => api.get('/nagrik-seva/header'),
  updateNagrikSevaHeader: (data) => fileUploadAPI.post('/nagrik-seva/header', data), // Use fileUploadAPI for image uploads
  deleteNagrikSevaHeader: () => api.delete('/nagrik-seva/header'), // Add delete header
  getNagrikSevaApplications: () => api.get('/nagrik-seva/applications'),
  updateApplicationStatus: (id, data) => api.patch(`/nagrik-seva/applications/${id}/status`, data),
  deleteNagrikSevaApplication: (id) => api.delete(`/nagrik-seva/applications/${id}`), // Add delete application
  deleteMultipleNagrikSevaApplications: (data) => api.delete('/nagrik-seva/applications', { data }), // Add bulk delete

  // Village Detail APIs
  getVillageDetails: () => api.get('/village-details/admin'),
  getVillageDetail: (id) => api.get(`/village-details/${id}`),
  createVillageDetail: (data) => fileUploadAPI.post('/village-details', data), // Use fileUploadAPI for potential image uploads
  updateVillageDetail: (id, data) => fileUploadAPI.put(`/village-details/${id}`, data), // Use fileUploadAPI for potential image uploads
  deleteVillageDetail: (id) => api.delete(`/village-details/${id}`),

  // Program APIs
  getPrograms: () => api.get('/programs/admin'),
  createProgram: (data) => fileUploadAPI.post('/programs', data), // Use fileUploadAPI for potential image uploads
  updateProgram: (id, data) => fileUploadAPI.put(`/programs/${id}`, data), // Use fileUploadAPI for potential image uploads
  deleteProgram: (id) => api.delete(`/programs/${id}`),

  // Notifications (if you want to add them)
  getNotifications: () => api.get('/admin/notifications'),
  markNotificationAsRead: (id) => api.put(`/admin/notifications/${id}/read`),
  markAllNotificationsAsRead: () => api.put('/admin/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`)
};

export const publicAPI = {
  // Public Announcements
  getAnnouncements: () => api.get('/announcements/public'),
  
  // Public Gallery
  getGallery: () => api.get('/gallery/public'),
  
  // Public Awards
  getAwards: () => api.get('/awards/public'),
  
  // Public Members
  getMembers: () => api.get('/members/public'),
  
  // Public Feedback
  submitFeedback: (data) => api.post('/feedback/submit', data),
  
  // Public Nagrik Seva APIs
  getNagrikSevaHeader: () => api.get('/nagrik-seva/header'),
  submitNagrikSevaApplication: (data) => fileUploadAPI.post('/nagrik-seva/apply', data), // Use fileUploadAPI for potential file uploads

  // Public Village Detail API
  getVillageDetails: (lang = 'en') => api.get(`/village-details?lang=${lang}`),
  getVillageDetail: (id, lang = 'en') => api.get(`/village-details/${id}?lang=${lang}`),

  // Public Programs API
  getPrograms: () => api.get('/programs'),
  
  // Contact/General
  submitContactForm: (data) => api.post('/contact/submit', data)
};

// Export individual instances if needed
export { api as regularAPI, fileUploadAPI };

export default api;
