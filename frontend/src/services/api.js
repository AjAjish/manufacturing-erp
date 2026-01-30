import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/accounts/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API service functions
export const authService = {
  login: (email, password) => api.post('/accounts/login/', { email, password }),
  logout: (refresh) => api.post('/accounts/logout/', { refresh }),
  refreshToken: (refresh) => api.post('/accounts/token/refresh/', { refresh }),
  getProfile: () => api.get('/accounts/users/me/'),
  updateProfile: (data) => api.put('/accounts/users/update_profile/', data),
  changePassword: (data) => api.post('/accounts/users/change_password/', data),
};

export const orderService = {
  getAll: (params) => api.get('/crm/orders/', { params }),
  getById: (id) => api.get(`/crm/orders/${id}/`),
  create: (data) => api.post('/crm/orders/', data),
  update: (id, data) => api.patch(`/crm/orders/${id}/`, data),
  delete: (id) => api.delete(`/crm/orders/${id}/`),
  updateStatus: (id, data) => api.post(`/crm/orders/${id}/update_status/`, data),
  getStatusHistory: (id) => api.get(`/crm/orders/${id}/status_history/`),
  getDelayed: () => api.get('/crm/orders/delayed/'),
  getByStatus: () => api.get('/crm/orders/by_status/'),
};

export const customerService = {
  getAll: (params) => api.get('/crm/customers/', { params }),
  getById: (id) => api.get(`/crm/customers/${id}/`),
  create: (data) => api.post('/crm/customers/', data),
  update: (id, data) => api.patch(`/crm/customers/${id}/`, data),
  delete: (id) => api.delete(`/crm/customers/${id}/`),
  getOrders: (id) => api.get(`/crm/customers/${id}/orders/`),
};

export const materialService = {
  getTypes: () => api.get('/materials/types/'),
  getAll: (params) => api.get('/materials/materials/', { params }),
  getById: (id) => api.get(`/materials/materials/${id}/`),
  create: (data) => api.post('/materials/materials/', data),
  update: (id, data) => api.patch(`/materials/materials/${id}/`, data),
  getLowStock: () => api.get('/materials/materials/low_stock/'),
  adjustStock: (id, data) => api.post(`/materials/materials/${id}/adjust_stock/`, data),
  getOrderMaterials: (params) => api.get('/materials/order-materials/', { params }),
  issueMaterial: (id, data) => api.post(`/materials/order-materials/${id}/issue/`, data),
};

export const productionService = {
  getRecords: (params) => api.get('/production/records/', { params }),
  getById: (id) => api.get(`/production/records/${id}/`),
  create: (data) => api.post('/production/records/', data),
  update: (id, data) => api.patch(`/production/records/${id}/`, data),
  verify: (id) => api.post(`/production/records/${id}/verify/`),
  getDailySummary: (date) => api.get('/production/records/daily_summary/', { params: { date } }),
  getYieldAnalysis: (params) => api.get('/production/records/yield_analysis/', { params }),
  getSummaries: (params) => api.get('/production/summaries/', { params }),
};

export const fabricationService = {
  getProcesses: () => api.get('/fabrication/processes/'),
  getOrderFabrications: (params) => api.get('/fabrication/order-fabrications/', { params }),
  start: (id) => api.post(`/fabrication/order-fabrications/${id}/start/`),
  complete: (id, data) => api.post(`/fabrication/order-fabrications/${id}/complete/`, data),
  hold: (id, data) => api.post(`/fabrication/order-fabrications/${id}/hold/`, data),
  bulkCreate: (data) => api.post('/fabrication/order-fabrications/bulk_create/', data),
};

export const inspectionService = {
  getTypes: () => api.get('/inspection/types/'),
  getAll: (params) => api.get('/inspection/order-inspections/', { params }),
  getById: (id) => api.get(`/inspection/order-inspections/${id}/`),
  create: (data) => api.post('/inspection/order-inspections/', data),
  update: (id, data) => api.patch(`/inspection/order-inspections/${id}/`, data),
  qaApprove: (id, data) => api.post(`/inspection/order-inspections/${id}/qa_approve/`, data),
  getPendingApproval: () => api.get('/inspection/order-inspections/pending_approval/'),
  getDispatchBlocked: () => api.get('/inspection/order-inspections/dispatch_blocked/'),
};

export const logisticsService = {
  getPackingStandards: () => api.get('/logistics/packing-standards/'),
  getAll: (params) => api.get('/logistics/dispatches/', { params }),
  getById: (id) => api.get(`/logistics/dispatches/${id}/`),
  create: (data) => api.post('/logistics/dispatches/', data),
  update: (id, data) => api.patch(`/logistics/dispatches/${id}/`, data),
  startPacking: (id) => api.post(`/logistics/dispatches/${id}/start_packing/`),
  markPacked: (id, data) => api.post(`/logistics/dispatches/${id}/mark_packed/`, data),
  dispatch: (id, data) => api.post(`/logistics/dispatches/${id}/dispatch/`, data),
  markDelivered: (id) => api.post(`/logistics/dispatches/${id}/mark_delivered/`),
  getPendingDispatch: () => api.get('/logistics/dispatches/pending_dispatch/'),
  getInTransit: () => api.get('/logistics/dispatches/in_transit/'),
};

export const dashboardService = {
  getOverview: () => api.get('/dashboards/overview/'),
  getOrderTracking: (orderId) => api.get('/dashboards/order-tracking/', { params: { order_id: orderId } }),
  getDelayedOrders: () => api.get('/dashboards/delayed-orders/'),
  getProductionAnalytics: (days) => api.get('/dashboards/production-analytics/', { params: { days } }),
  getDepartmentPerformance: () => api.get('/dashboards/department-performance/'),
  getCustomerSummary: () => api.get('/dashboards/customer-summary/'),
  getMonthlyTrends: (months) => api.get('/dashboards/monthly-trends/', { params: { months } }),
  getRealTimeStatus: () => api.get('/dashboards/real-time-status/'),
};

export const userService = {
  getAll: (params) => api.get('/accounts/users/', { params }),
  getById: (id) => api.get(`/accounts/users/${id}/`),
  create: (data) => api.post('/accounts/users/', data),
  update: (id, data) => api.patch(`/accounts/users/${id}/`, data),
  changeRole: (id, role) => api.post(`/accounts/users/${id}/change_role/`, { role }),
  toggleActive: (id) => api.post(`/accounts/users/${id}/toggle_active/`),
};