import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const axiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
    },
});

// Request Interceptor: Before sending any request, check if we have a token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 (Unauthorized) errors globally
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried refreshing yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post(baseURL + 'token/refresh/', {
                        refresh: refreshToken,
                    });

                    localStorage.setItem('access_token', response.data.access);
                    
                    axiosInstance.defaults.headers['Authorization'] = 
                        'Bearer ' + response.data.access;
                    originalRequest.headers['Authorization'] = 
                        'Bearer ' + response.data.access;

                    return axiosInstance(originalRequest);
                } catch (err) {
                    console.log("Refresh token expired or invalid.");
                    // Force logout
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;