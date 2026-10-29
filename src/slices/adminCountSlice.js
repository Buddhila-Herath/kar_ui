import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from "../config/apiConfig";
import { apiBaseURL } from "../constants/index";

export const getDashboardResourcesCount = createAsyncThunk(
    'adminDashboard/getDashboardResourcesCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(apiBaseURL.ADMIN_DASHBOARD_RESOURCES_COUNT);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard data");
        }
    }
);

const adminCountSlide = createSlice({
    name: 'adminDashboard',
    initialState: {
        counts: {
            servicesCount: 0,
            productsCount: 0,
            vendorCount: 0
        },
        isLoading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDashboardResourcesCount.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getDashboardResourcesCount.fulfilled, (state, action) => {
                state.isLoading = false;
                state.counts = {
                    servicesCount: action.payload.servicesCount || 0,
                    productsCount: action.payload.productsCount || 0,
                    vendorCount: action.payload.vendorCount || 0
                };
            })
            .addCase(getDashboardResourcesCount.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default adminCountSlide.reducer;