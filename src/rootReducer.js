import { combineReducers } from '@reduxjs/toolkit';
import jobReducer from './slices/jobSlice';
import toastReducer from './slices/toastSlice';
import profileReducer from './slices/profileSlice';
import vendorReducer from './slices/vendorSlice';
import sparePartReducer from './slices/sparePartSlice';
import serviceReducer from './slices/serviceSlice';
import rateCardReducer from './slices/rateCardSlice';
import mobileCodesReducer from './slices/mobileCodesSlice';
import locationDataReducer from './slices/locationDataSlice';
import masterDataReducer from './slices/masterDataSlice';
import authReducer from './slices/authSlice';
import accountReducer from './slices/accountSlice';
import systemConfigurationReducer from './slices/vendor/systemConfigurationSlice';
import vendorSparepartReducer from './slices/vendor/sparePartSlice';
import vendorServiceReducer from './slices/vendor/serviceSlice';
import vendorTechnicianReducer from './slices/vendor/technicianSlice';
import vendorQuoteReducer from './slices/vendor/quoteSlice';
import vendorJobReducer from './slices/vendor/jobSlice';
import technicianJobReducer from './slices/technician/jobSlice';
import adminDashboardReducer from './slices/adminCountSlice';
import vendorFinanceReducer from './slices/vendor/financeSlice';
import vendorVehicleReducer from './slices/vendor/vehicleSlice';
import vendorClientReducer from './slices/vendor/clientSlice';
import permissionReducer from './slices/permissionSlice';
import adminDashBoardDataReducer from './slices/admin/adminDashBoardDataSlice';
import dashboardMetricsSlice from './slices/vendor/dashboardMetricsSlice';
import recentActivitiesSliceReducer from './slices/vendor/recentActivitiesSlice';
import dashboardChartsSlice from './slices/vendor/dashboardChartsSlice';
import userReducer from './slices/vendor/userSlice';
import inventoryUpdateReducer from './slices/inventoryUpdateSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    jobs: jobReducer,
    toasts: toastReducer,
    profile: profileReducer,
    vendors: vendorReducer,
    spareparts: sparePartReducer,
    services: serviceReducer,
    rateCards: rateCardReducer,
    mobileCodes: mobileCodesReducer,
    locations: locationDataReducer,
    masterData: masterDataReducer,
    account: accountReducer,
    systemConfiguration: systemConfigurationReducer,
    vendorSpareparts: vendorSparepartReducer,
    vendorServices: vendorServiceReducer,
    vendorTechnician: vendorTechnicianReducer,
    vendorQuotes: vendorQuoteReducer,
    vendorJobs: vendorJobReducer,
    technicianJobs: technicianJobReducer,
    adminDashboard: adminDashboardReducer,
    vendorFinance: vendorFinanceReducer,
    vendorVehicle: vendorVehicleReducer,
    vendorClients: vendorClientReducer,
    permission: permissionReducer,
    adminDashBoardData: adminDashBoardDataReducer,
    vendorDashboardMetrics: dashboardMetricsSlice,
    vendorRecentActivities: recentActivitiesSliceReducer,
    vendorDashboardCharts: dashboardChartsSlice,
    users: userReducer,
    inventoryUpdate: inventoryUpdateReducer
});

export default rootReducer;
