import { Tokens } from '../constants';
import { refreshToken } from '../slices/authSlice';
import { isAdminPortal, isVendorPortal, isTechnicianPortal } from '../utils/portalUtils';

export default {
    setupInterceptors: (axios, isToken = false, isFormData = false) => {
        axios.interceptors.request.use(
            (config) => {
                let token = null;
                if (isToken) {
                    if (isAdminPortal()) {
                        token = localStorage.getItem(Tokens.ADMIN);
                    } else if (isVendorPortal()) {
                        token = localStorage.getItem(Tokens.VENDOR);
                    } else if (isTechnicianPortal()) {
                        token = localStorage.getItem(Tokens.TECHNICIAN);
                    }

                    if (token) {
                        config.headers['Authorization'] = `Bearer ${token}`;
                    }
                }
                if (isFormData) {
                    config.headers['Content-Type'] = 'multipart/form-data';
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        axios.interceptors.response.use(
            (response) => successHandler(response),
            async (error) => {
                const originalRequest = error.config;

                // Only attempt token refresh for requests that were sent with authentication
                const hadAuthorizationHeader = originalRequest.headers['Authorization'];

                if (error.response?.status === 401 && 
                    !originalRequest._retry && 
                    hadAuthorizationHeader) {
                    
                    originalRequest._retry = true;

                    try {
                        const { store } = await import('../store'); 
                        const refreshResponse = await store.dispatch(refreshToken()).unwrap();

                        const newAccessToken = refreshResponse.accessToken;
                        if (isAdminPortal()) {
                            localStorage.setItem(Tokens.ADMIN, newAccessToken);
                        } else if (isVendorPortal()) {
                            localStorage.setItem(Tokens.VENDOR, newAccessToken);
                        } else if (isTechnicianPortal()) {
                            localStorage.setItem(Tokens.TECHNICIAN, newAccessToken);
                        }

                        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                        return axios(originalRequest);
                    } catch (refreshError) {
                        console.log('Refresh token failed:', refreshError);
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }
};

const successHandler = (response) => {
    return response;
};