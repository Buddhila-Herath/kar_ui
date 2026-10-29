import { getConfig } from '../config/service';

// Get current portal type
export const getCurrentPortal = () => {
    const config = getConfig();
    return config.portal;
};

// Check if current portal is Admin
export const isAdminPortal = () => {
    return getCurrentPortal() === 'ADMIN';
};

// Check if current portal is Vendor
export const isVendorPortal = () => {
    return getCurrentPortal() === 'VENDOR';
};

// Check if current portal is Technician
export const isTechnicianPortal = () => {
    return getCurrentPortal() === 'TECHNICIAN';
};

// Get grant type based on portal
export const getGrantType = () => {
    const portal = getCurrentPortal();
    if (portal === 'ADMIN') return 'SUPERADMIN';
    if (portal === 'TECHNICIAN') return 'TECHNICIAN';
    return 'VENDOR';
}; 