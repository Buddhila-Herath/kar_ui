import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from "../../config/apiConfig";
import { apiBaseURL } from "../../constants";
import _ from 'lodash';

export const fetchAllInvoices = createAsyncThunk(
    'vendorFinance/fetchAllInvoices',
    async (filter = {}) => {
        let url = apiBaseURL.GET_ALL_INVOICES;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();

            if (filter.page) params.append("pageNo", filter.page);
            if (filter.size) params.append("pageSize", filter.size);
            if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
            if (filter.sortOrder) params.append('order', filter.sortOrder);
            if (filter.sortField) params.append('sortBy', filter.sortField);
            if (filter.paymentStatus) params.append('paymentStatus', filter.paymentStatus);
            if (filter.fromDate) params.append('fromDate', filter.fromDate);
            if (filter.toDate) params.append('toDate', filter.toDate);
            if (filter.jobType) params.append('jobType', filter.jobType);
            url += `?${params.toString()}`;
        } else {
            url += `?size=10&page=1`;
        }
        const response = await apiConfig.get(url);
        return response.data;
    }
);

export const fetchAllInvoicesSilent = createAsyncThunk(
    'vendorFinance/fetchAllInvoicesSilent',
    async (filter = {}) => {
        let url = apiBaseURL.GET_ALL_INVOICES;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();

            if (filter.page) params.append("pageNo", filter.page);
            if (filter.size) params.append("pageSize", filter.size);
            if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
            if (filter.sortOrder) params.append('order', filter.sortOrder);
            if (filter.sortField) params.append('sortBy', filter.sortField);
            if (filter.paymentStatus) params.append('paymentStatus', filter.paymentStatus);
            if (filter.fromDate) params.append('fromDate', filter.fromDate);
            if (filter.toDate) params.append('toDate', filter.toDate);
            if (filter.jobType) params.append('jobType', filter.jobType);
            url += `?${params.toString()}`;
        } else {
            url += `?size=10&page=1`;
        }
        const response = await apiConfig.get(url);
        return response.data;
    }
);

export const downloadExcelReport = createAsyncThunk(
    'vendorFinance/downloadExcelReport',
    async (filter = {}) => {
        let url = apiBaseURL.DOWNLOAD_INVOICES_REPORT;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();

            if (filter.page) params.append("pageNo", filter.page);
            if (filter.size) params.append("pageSize", filter.size);
            if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
            if (filter.sortOrder) params.append('order', filter.sortOrder);
            if (filter.sortField) params.append('sortBy', filter.sortField);
            if (filter.paymentStatus) params.append('paymentStatus', filter.paymentStatus);
            if (filter.fromDate) params.append('fromDate', filter.fromDate);
            if (filter.toDate) params.append('toDate', filter.toDate);
            if (filter.jobType) params.append('jobType', filter.jobType);
            url += `?${params.toString()}`;
        }
        const response = await apiConfig.get(url, { responseType: 'blob' });
        return response.data;
    }
);

export const downloadPdfFile = createAsyncThunk(
    'vendorFinance/downloadPdfFile',
    async (id) => {
        const response = await apiConfig.get(
            `${apiBaseURL.DOWNLOAD_INVOICES_REPORT}/${id}`
        );
        return response.data;
    }
);

export const createInvoice = createAsyncThunk(
    'vendorFinance/createInvoice',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.post(apiBaseURL.CREATE_VIEW_INVOICE, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const fetchInvoiceDetails = createAsyncThunk(
    'vendorFinance/fetchInvoiceDetails',
    async ({id, type}) => {
        const response = await apiConfig.get(apiBaseURL.CREATE_VIEW_INVOICE + '/' + id + '?type=' + type);
        return response.data;
    }
);

export const updatFinanceService = createAsyncThunk(
    'vendorFinance/updatFinanceService',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_FINANCE_SERVICE, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const updateFinanceSparePart = createAsyncThunk(
    'vendorFinance/updateFinanceSparePart',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_PART, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const updateInvoice = createAsyncThunk(
    'vendorFinance/updateInvoice',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_INVOICE, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const fetchFinanceMetrics = createAsyncThunk(
    'vendorJobs/fetchFinanceMetrics',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.INVOICE_MATRICS}?startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch data";
            return rejectWithValue({ message, errors });
        }
    }
);

const financeSlice = createSlice({
    name: 'vendorFinance',
    initialState: {
        // Data
        allInvoices: [],
        invoiceDetails: [],
        invoiceData: null,
        financeServiceData: [],
        financeSparePartData: [],
        jobCounts: {
            total: 0,
            pending: 0,
            onHold: 0,
            inProgress: 0,
            completed: 0
        },

        // Finance Metrics
        financeMetrics: {
            totalEstimatesCreated: 0,
            pendingEstimates: 0,
            rejectedEstimates: 0,
            totalInvoicesCreated: 0,
            totalEarned: 0,
            totalOutstanding: 0,
        },

        // Loading States
        isInvoicesLoading: false,
        isInvoiceLoading: false,
        isInvoiceDetailsLoading: false,
        isUploading: false,
        isLoading: false,
        isMetricsLoading: false,
        isDownloadLoading: false,
        isDownloadPdfLoading: false,
        isUserCustomizationSaving: false,

        isCountsLoading: {
            total: false,
            pending: false,
            onHold: false,
            inProgress: false,
            completed: false
        },

        // Errors
        error: null,
        updateError: null,
        uploadErrorMessage: null,
        uploadError: null,
        successMessage: null,
        countsError: null,
        pauseReasonError: null,

        // Other
        totalRecord: 0,
        totalPages: 0,
        totalServiceCost: null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllInvoices.fulfilled, (state, action) => {
                state.isInvoicesLoading = false;
                state.allInvoices = action.payload.data;
                state.totalRecord = action.payload.totalItems;
                state.totalPages = action.payload.totalPages
            })
            .addCase(fetchAllInvoices.rejected, (state, action) => {
                state.isInvoicesLoading = false;
                state.allInvoices = [];
                state.totalRecord = 0;
                state.error = action.error.message;
            })
            .addCase(fetchAllInvoices.pending, (state) => {
                state.isInvoicesLoading = true;
                state.error = null;
            })

            .addCase(createInvoice.pending, (state) => {
                state.isInvoiceLoading = true;
                state.error = null;
            })
            .addCase(createInvoice.fulfilled, (state, action) => {
                state.isInvoiceLoading = false;
                state.invoiceData = action.payload;
            })
            .addCase(createInvoice.rejected, (state, action) => {
                state.isInvoiceLoading = false;
                state.error = action.error.message;
            })

            .addCase(downloadPdfFile.pending, (state) => {
                state.isDownloadPdfLoading = true;
                state.error = "";
            })
            .addCase(downloadPdfFile.fulfilled, (state, action) => {
                state.isDownloadPdfLoading = false;
            })
            .addCase(downloadPdfFile.rejected, (state, action) => {
                state.isDownloadPdfLoading = false;
                state.error = action.error.message;
            })

            .addCase(downloadExcelReport.pending, (state) => {
                state.isDownloadLoading = true;
                state.error = null;
            })
            .addCase(downloadExcelReport.fulfilled, (state, action) => {
                state.isDownloadLoading = false;
            })
            .addCase(downloadExcelReport.rejected, (state, action) => {
                state.isDownloadLoading = false;
                state.error = action.error.message;
            })

            .addCase(fetchInvoiceDetails.pending, (state) => {
                state.isInvoiceDetailsLoading = true;
                state.error = null;
            })
            .addCase(fetchInvoiceDetails.fulfilled, (state, action) => {
                state.isInvoiceDetailsLoading = false;
                state.invoiceDetails = action.payload;
            })
            .addCase(fetchInvoiceDetails.rejected, (state, action) => {
                state.isInvoiceDetailsLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateInvoice.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateInvoice.fulfilled, (state, action) => {
                state.isLoading = false;
                state.invoiceData = action.payload;
            })
            .addCase(updateInvoice.rejected, (state, action) => {
                state.isLoading = false;
                state.updateError = action.payload;
            })

            .addCase(updateFinanceSparePart.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateFinanceSparePart.fulfilled, (state, action) => {
                state.isLoading = false;
                state.financeSparePartData = action.payload;
            })
            .addCase(updateFinanceSparePart.rejected, (state, action) => {
                state.isLoading = false;
                state.updateError = action.payload;
            })

            .addCase(updatFinanceService.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updatFinanceService.fulfilled, (state, action) => {
                state.isLoading = false;
                state.financeServiceData = action.payload;
            })
            .addCase(updatFinanceService.rejected, (state, action) => {
                state.isLoading = false;
                state.updateError = action.payload;
            })
            // Finance Metrics
            .addCase(fetchFinanceMetrics.pending, (state) => {
                state.isMetricsLoading = true;
                state.metricsError = null;
            })
            .addCase(fetchFinanceMetrics.fulfilled, (state, action) => {
                state.isMetricsLoading = false;
                state.financeMetrics = action.payload;
            })
            .addCase(fetchFinanceMetrics.rejected, (state, action) => {
                state.isMetricsLoading = false;
                state.metricsError = action.payload.message;
            })
            
            .addCase(fetchAllInvoicesSilent.fulfilled, (state, action) => {
                state.allInvoices = action.payload.data;
                state.totalRecord = action.payload.totalItems;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchAllInvoicesSilent.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
            });
    },
});

export default financeSlice.reducer;