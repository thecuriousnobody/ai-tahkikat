import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cases API
export const casesApi = {
  list: (filters = {}) => api.get('/cases', { params: filters }),
  get: (id) => api.get(`/cases/${id}`),
  create: (data) => api.post('/cases', data),
  update: (id, data) => api.put(`/cases/${id}`, data),
  delete: (id) => api.delete(`/cases/${id}`),
};

// Evidence API
export const evidenceApi = {
  list: (caseId) => api.get(`/cases/${caseId}/evidence`),
  create: (caseId, data) => api.post(`/cases/${caseId}/evidence`, data),
  update: (caseId, evidenceId, data) => api.put(`/cases/${caseId}/evidence/${evidenceId}`, data),
  delete: (caseId, evidenceId) => api.delete(`/cases/${caseId}/evidence/${evidenceId}`),
};

// Interviews API
export const interviewsApi = {
  list: (caseId) => api.get(`/cases/${caseId}/interviews`),
  create: (caseId, data) => api.post(`/cases/${caseId}/interviews`, data),
  update: (caseId, interviewId, data) => api.put(`/cases/${caseId}/interviews/${interviewId}`, data),
  delete: (caseId, interviewId) => api.delete(`/cases/${caseId}/interviews/${interviewId}`),
};

// Findings API
export const findingsApi = {
  list: (caseId) => api.get(`/cases/${caseId}/findings`),
  create: (caseId, data) => api.post(`/cases/${caseId}/findings`, data),
  delete: (caseId, findingId) => api.delete(`/cases/${caseId}/findings/${findingId}`),
};

// Reports API
export const reportsApi = {
  generate: (caseId) => api.post(`/cases/${caseId}/generate-report`),
  list: (caseId) => api.get(`/cases/${caseId}/reports`),
  get: (caseId, reportId) => api.get(`/cases/${caseId}/reports/${reportId}`),
  finalize: (caseId, reportId) => api.put(`/cases/${caseId}/reports/${reportId}/finalize`),
  qualityCheck: (caseId) => api.get(`/cases/${caseId}/quality-check`),
};

export default api;
