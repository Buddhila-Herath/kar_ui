import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from "../../config/apiConfig";
import { apiBaseURL } from "../../constants";
import _ from 'lodash';

export const getTotalTaxInvoiceCount = createAsyncThunk(
    'vendorDashboard/getTotalTaxInvoiceCount',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.TOTAL_INVOICE_COUNT_METRICS}?startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch data";
            return rejectWithValue({ message, errors });
        }
    }
);

export const getTotalJobsCount = createAsyncThunk(
    'vendorDashboard/getTotalJobsCount',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.TOTAL_JOBS_COUNT_METRICS}?startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch data";
            return rejectWithValue({ message, errors });
        }
    }
);

export const getTotalQuotesCount = createAsyncThunk(
    'vendorDashboard/getTotalQuotesCount',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.TOTAL_QUOTES_COUNT_METRICS}?startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch data";
            return rejectWithValue({ message, errors });
        }
    }
);

const dashboardMetricsSlice = createSlice({
    name: 'vendorDashboardMetrics',
    initialState: {
        metricsCounts: {
            invoices: 0,
            jobs: 0,
            quotes: 0
        },

        // Loading States
        isLoading: false,

        isCountsLoading: {
            invoices: false,
            jobs: false,
            quotes: false
        },

        // Errors
        error: null,
        updateError: null,
        uploadErrorMessage: null,
        uploadError: null,
        successMessage: null,
        countsError: null,

        // Other
        totalRecord: 0,
        totalPages: 0,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            
            .addCase(getTotalTaxInvoiceCount.pending, (state) => {
                state.isCountsLoading.invoices = true;
                state.countsError = null;
            })
            .addCase(getTotalTaxInvoiceCount.fulfilled, (state, action) => {
                state.isCountsLoading.invoices = false;
                state.metricsCounts.invoices = action.payload || 0;
            })
            .addCase(getTotalTaxInvoiceCount.rejected, (state, action) => {
                state.isCountsLoading.invoices = false;
                state.countsError = invoices.payload;
            })
            
            .addCase(getTotalJobsCount.pending, (state) => {
                state.isCountsLoading.jobs = true;
                state.countsError = null;
            })
            .addCase(getTotalJobsCount.fulfilled, (state, action) => {
                state.isCountsLoading.jobs = false;
                state.metricsCounts.jobs = action.payload || 0;
            })
            .addCase(getTotalJobsCount.rejected, (state, action) => {
                state.isCountsLoading.jobs = false;
                state.countsError = action.payload;
            })
            
            .addCase(getTotalQuotesCount.pending, (state) => {
                state.isCountsLoading.quotes = true;
                state.countsError = null;
            })
            .addCase(getTotalQuotesCount.fulfilled, (state, action) => {
                state.isCountsLoading.quotes = false;
                state.metricsCounts.quotes = action.payload || 0;
            })
            .addCase(getTotalQuotesCount.rejected, (state, action) => {
                state.isCountsLoading.quotes = false;
                state.countsError = action.payload;
            });

    },
});

export default dashboardMetricsSlice.reducer;