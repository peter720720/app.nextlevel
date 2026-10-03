import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically bundle authentication headers with requests when a token is present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('school_platform_token') || sessionStorage.getItem('school_platform_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
