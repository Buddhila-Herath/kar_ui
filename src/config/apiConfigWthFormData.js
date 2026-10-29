import axios from 'axios';
import axiosInterceptor from './axiosInterceptor';
import { getConfig } from './service';

let axiosInstance = null;

export const createFormDataAxiosInstance = async () => {
    if (axiosInstance) {
        return axiosInstance;
    }

    const config = await getConfig();
    const apacheServer = config.apiUrl + 'api/v1/';
    axiosInstance = axios.create({
        baseURL: apacheServer,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    axiosInterceptor.setupInterceptors(axiosInstance, true, true);
    return axiosInstance;
};

// Create a promise that will resolve with the axios instance
const axiosPromise = createFormDataAxiosInstance();

// Default export for backward compatibility
const axiosApi = {
    get: (...args) => axiosPromise.then(instance => instance.get(...args)),
    post: (...args) => axiosPromise.then(instance => instance.post(...args)),
    put: (...args) => axiosPromise.then(instance => instance.put(...args)),
    delete: (...args) => axiosPromise.then(instance => instance.delete(...args)),
    patch: (...args) => axiosPromise.then(instance => instance.patch(...args))
};

export default axiosApi;
