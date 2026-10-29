import { getConfig } from '../config/service';

// Get current environment type
export const getCurrentEnv = () => {
    const config = getConfig();
    return config.environment;
};

export const getAdminPortalUrl = () => {
    const config = getConfig();
    return config.adminPortalUrl;
};

export const getVendorPortalUrl = () => {
    const config = getConfig();
    return config.vendorPortalUrl;
};

export const getTechnicianPortalUrl = () => {
    const config = getConfig();
    return config.technicianPortalUrl;
};

export const client_app = {
    URL: getVendorPortalUrl() ?? "https://karstation.com"
};

export const technician_app = {
    URL: getTechnicianPortalUrl() ?? "https://karstation.com"
};

export const admin_app = {
    URL: getAdminPortalUrl() ?? "https://karstation.com"
};