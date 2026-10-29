import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from "../../config/apiConfig";
import { apiBaseURL } from "../../constants";
import apiConfigMultipart from '../../config/apiConfigWthFormData';
import _ from 'lodash';

export const fetchAllQuotes = createAsyncThunk(
    'vendorQuotes/fetchAllQuotes',
    async (filter = {}) => {
        let url = apiBaseURL.VENDOR_ALL_QUOTES;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();

            if (filter.page) params.append("page", filter.page);
            if (filter.size) params.append("size", filter.size);
            if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
            if (filter.sortOrder) params.append('order', filter.sortOrder);
            if (filter.sortField) params.append('sortBy', filter.sortField);
            if (filter.quoteStatus) params.append('status', filter.quoteStatus);

            url += `?${params.toString()}`;
        } else {
            url += `?size=10&page=1`;
        }
        const response = await apiConfig.get(url);
        return response.data;
    }
);

export const fetchAllQuotesSilent = createAsyncThunk(
    'vendorQuotes/fetchAllQuotesSilent',
    async (filter = {}) => {
        let url = apiBaseURL.VENDOR_ALL_QUOTES;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();

            if (filter.page) params.append("page", filter.page);
            if (filter.size) params.append("size", filter.size);
            if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
            if (filter.sortOrder) params.append('order', filter.sortOrder);
            if (filter.sortField) params.append('sortBy', filter.sortField);
            if (filter.quoteStatus) params.append('status', filter.quoteStatus);

            url += `?${params.toString()}`;
        } else {
            url += `?size=10&page=1`;
        }
        const response = await apiConfig.get(url);
        return response.data;
    }
);

export const downloadExcelReport = createAsyncThunk(
    'vendorQuotes/downloadExcelReport',
    async (filter = {}) => {
        let url = apiBaseURL.DOWNLOAD_QUOTES_REPORT;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();

            if (filter.page) params.append("page", filter.page);
            if (filter.size) params.append("size", filter.size);
            if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
            if (filter.sortOrder) params.append('order', filter.sortOrder);
            if (filter.sortField) params.append('sortBy', filter.sortField);
            if (filter.quoteStatus) params.append('status', filter.quoteStatus);
            url += `?${params.toString()}`;
        }
        const response = await apiConfig.get(url, { responseType: 'blob' });
        return response.data;
    }
);

export const fetchQuoteDetails = createAsyncThunk(
    'vendorQuotes/fetchQuoteDetails',
    async ({ id, type }) => {
        const response = await apiConfig.get(apiBaseURL.QUOTES_BY_ID + '/' + id + '?type=' + type);

        return response.data;
    }
);

export const generatePrimaryId = createAsyncThunk(
    'vendorQuotes/generatePrimaryId',
    async () => {
        try {
            const response = await apiConfig.get(apiBaseURL.GENERATE_QUOTE_PRIMARY_ID);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to load data";
            throw new Error(errorMessage);
        }
    }
);

export const downloadPdfFile = createAsyncThunk(
    'vendorQuotes/downloadPdfFile',
    async (id) => {
        const response = await apiConfig.get(
            `${apiBaseURL.DOWNLOAD_QUOTES_REPORT}/${id}`
        );
        return response.data;
    }
);

export const fetchAllCustomerList = createAsyncThunk(
    'vendorQuotes/fetchAllCustomerList',
    async (vehicleId = null, { rejectWithValue }) => {
        try {
            let url = apiBaseURL.GET_ALL_CUSTOMER_LIST;
            if (vehicleId) {
                url += `?vehicleId=${vehicleId}`;
            }
            const response = await apiConfig.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch customer list');
        }
    }
);

export const fetchAllVehicleRegistrationList = createAsyncThunk(
    'vendorQuotes/fetchAllVehicleRegistrationList',
    async (customerId = null, { rejectWithValue }) => {
        try {
            let url = apiBaseURL.GET_VEHICLE_REGISTRATION_NO_LIST;
            if (customerId) {
                url += `?customerId=${customerId}`;
            }
            const response = await apiConfig.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch vehicle registration list');
        }
    }
);

export const saveQuoteService = createAsyncThunk(
    'vendorQuotes/saveQuoteService',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.post(apiBaseURL.SAVE_SERVICE_COST, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const validateSparePart = createAsyncThunk(
    "vendorQuotes/validateSparePart",
    async ({partsId, quantity}, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.SPARE_PART_VALIDATION}?partsId=${partsId}&quantity=${quantity}`
            );
            return { data: response.data, headers: response.headers };
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to check the validation");
        }
    }
);

export const saveQuoteSparePart = createAsyncThunk(
    'vendorQuotes/saveQuoteSparePart',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.post(apiBaseURL.SAVE_SPARE_PART_COST, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const updateQuoteStatus = createAsyncThunk(
    'vendorQuotes/updateQuoteStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.QUOTES_STATUS_UPDATE + '?quoteId=' + id + '&status=' + status);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save status.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const assignSparePartToService = createAsyncThunk(
    'vendorQuotes/assignSparePartToService',
    async (partDetails, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.ASSIGN_SPARE_PART_TO_SERVICE, partDetails);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const saveQuote = createAsyncThunk(
    'vendorQuotes/saveQuote',
    async (formInputs, { rejectWithValue }) => {
        try {
            // Handle both old format (direct data) and new format ({ data, isShareQuote })
            let data, isShareQuote;
            if (formInputs && typeof formInputs === 'object' && 'data' in formInputs) {
                data = formInputs.data;
                isShareQuote = formInputs.isShareQuote;
            } else {
                data = formInputs;
                isShareQuote = undefined;
            }

            const params = {};
            if (isShareQuote !== undefined) {
                params.isShareQuote = isShareQuote;
            }
            const response = await apiConfig.post(apiBaseURL.SAVE_QUOTE, data, { params });
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

// Save Guest Customer Details
export const saveQuoteCustomerNameWithVehicleNo = createAsyncThunk(
    'vendorQuotes/saveQuoteCustomerNameWithVehicleNo',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.post(apiBaseURL.SAVE_NEW_CUSTOMER_NAME_AND_VEHICLE_NO, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

// Edit Guest Customer Details
export const editQuoteCustomerNameWithVehicleNo = createAsyncThunk(
    'vendorQuotes/editQuoteCustomerNameWithVehicleNo',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_CUSTOMER_NAME_AND_VEHICLE_NO, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const deleteQuoteSparePartOrService = createAsyncThunk(
    'vendorQuotes/deleteQuoteSparePartOrService',
    async ({ type, id, isService }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(
                `${apiBaseURL.DELETE_PART_SERVICE}?${type}=${id}&isService=${isService}`
            );
            return response.data;
        } catch (error) {
            const errorMessage =
            error.response.data?.errors?.[0] ||
            error.response.data?.message ||
            "Something went wrong. Please try again.";        
            
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateQuote = createAsyncThunk(
    'vendorQuotes/updateQuote',
    async (formInputs, { rejectWithValue }) => {
        try {
            // Handle both old format (direct data) and new format ({ data, isShareQuote })
            let data, isShareQuote;
            if (formInputs && typeof formInputs === 'object' && 'data' in formInputs) {
                data = formInputs.data;
                isShareQuote = formInputs.isShareQuote;
            } else {
                data = formInputs;
                isShareQuote = undefined;
            }

            const params = {};
            if (isShareQuote !== undefined) {
                params.isShareQuote = isShareQuote;
            }
            const response = await apiConfig.put(apiBaseURL.UPDATE_QUOTE, data, { params });
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const updateQuoteService = createAsyncThunk(
    'vendorQuotes/updateQuoteService',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_QUOTE_SERVICE, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const updateQuoteSparePart = createAsyncThunk(
    'vendorQuotes/updateQuoteSparePart',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_QUOTE_SPARE_PART, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const deleteQuoteExistingSparePart = createAsyncThunk(
    'vendorQuotes/deleteQuoteExistingSparePart',
    async ({ partId, quoteId }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.delete(
                `${apiBaseURL.DELETE_SPARE_PART_FROM_EXISTING_QUOTE}?partsId=${partId}&quoteId=${quoteId}`
            );
            return response.data;
        } catch (error) {
            const errorMessage =
            error.response.data?.errors?.[0] ||
            error.response.data?.message ||
            "Something went wrong. Please try again.";        
            
            return rejectWithValue(errorMessage);
        }
    }
);

export const deleteQuoteExistingService = createAsyncThunk(
    'vendorQuotes/deleteQuoteExistingService',
    async ({ serviceId, quoteId }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.delete(
                `${apiBaseURL.DELETE_SERVICE_FROM_EXISTING_QUOTE}?serviceId=${serviceId}&quoteId=${quoteId}`
            );
            return response.data;
        } catch (error) {
            const errorMessage =
            error.response.data?.errors?.[0] ||
            error.response.data?.message ||
            "Something went wrong. Please try again.";        
            
            return rejectWithValue(errorMessage);
        }
    }
)

// saveUserCustomization moved to masterDataSlice for reuse across modules

const quoteSlice = createSlice({
    name: 'vendorQuotes',
    initialState: {
        // Data
        allQuotes: [],
        quoteDetails: null,
        primaryId: "",
        allCustomerList: [],
        allVehicleRegistrationList: [],
        customerData: [],
        quoteData: [],
        quoteSparePartData: [],
        quoteServiceData: [],

        // Loading States
        isQuotesLoading: false,
        isQuoteDetailsLoading: false,
        isQuoteStatusUpdating: false,
        isDownloadLoading: false,
        isDownloadPdfLoading: false,
        isLoading: false,
        isSparePartUpdating: false,
        customerListLoading: false,
        vehicleListLoading: false,

        // Errors
        error: null,
        updateError: null,
        uploadErrorMessage: null,
        successMessage: null,

        // Other
        totalRecord: 0,
        totalPages: 0,
        totalServiceCost: null,
    },
    reducers: {
        clearQuoteDetails:(state)=>{
            state.quoteDetails = null;
            state.error = null;
        },
        resetPrimaryId: (state) => {
            state.primaryId = null;
        },
        clearVehicleList: (state) => {
            state.allVehicleRegistrationList = [];
        },
        clearClientList: (state) => {
            state.allCustomerList = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllQuotes.fulfilled, (state, action) => {
                state.isQuotesLoading = false;
                // state.allQuotes.push(...action.payload.data);
                state.allQuotes = action.payload.data;
                state.totalRecord = action.payload.totalItems;
                state.totalPages = action.payload.totalPages
            })
            .addCase(fetchAllQuotes.rejected, (state, action) => {
                state.isQuotesLoading = false;
                state.allQuotes = [];
                state.totalRecord = 0;
                state.error = action.error.message;
            })
            .addCase(fetchAllQuotes.pending, (state) => {
                state.isQuotesLoading = true;
                state.error = null;
            })

            .addCase(fetchQuoteDetails.pending, (state) => {
                state.isQuoteDetailsLoading = true;
                state.error = null;
            })
            .addCase(fetchQuoteDetails.fulfilled, (state, action) => {
                state.isQuoteDetailsLoading = false;
                state.quoteDetails = action.payload;
            })
            .addCase(fetchQuoteDetails.rejected, (state, action) => {
                state.isQuoteDetailsLoading = false;
                state.error = action.error.message;
            })

            .addCase(generatePrimaryId.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(generatePrimaryId.fulfilled, (state, action) => {
                state.isLoading = false;
                state.primaryId = action.payload.quotePrimaryId;
            })
            .addCase(generatePrimaryId.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(fetchAllCustomerList.pending, (state) => {
                state.customerListLoading= true;
                state.error = null;
                state.allCustomerList = [];
            })
            .addCase(fetchAllCustomerList.fulfilled, (state, action) => {
                state.customerListLoading= false;
                state.allCustomerList = action.payload || [];
            })
            .addCase(fetchAllCustomerList.rejected, (state, action) => {
                state.customerListLoading= false;
                state.error = action.error.message;
                state.allCustomerList = [];
                console.error('Fetch customer list failes:', action.error);
            })

            .addCase(fetchAllVehicleRegistrationList.pending, (state) => {
                state.vehicleListLoading = true;
                state.error = null;
                state.allVehicleRegistrationList = [];
            })
            .addCase(fetchAllVehicleRegistrationList.fulfilled, (state, action) => {
                state.vehicleListLoading = false;
                state.allVehicleRegistrationList = action.payload || [];
            })
            .addCase(fetchAllVehicleRegistrationList.rejected, (state, action) => {
                state.vehicleListLoading = false;
                state.error = action.error.message;
                state.allVehicleRegistrationList = [];
                console.error('Fetch registration list failed:', action.error);
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
            
            .addCase(updateQuoteStatus.pending, (state) => {
                state.isQuoteStatusUpdating = true;
            })
            .addCase(updateQuoteStatus.fulfilled, (state, action) => {
                state.isQuoteStatusUpdating = false;
                state.quoteDetails.status = action.payload.status;
                state.successMessage = action.payload.message
            })
            .addCase(updateQuoteStatus.rejected, (state, action) => {
                state.isQuoteStatusUpdating = false;
                state.updateError = action.payload;
            })

            .addCase(assignSparePartToService.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(assignSparePartToService.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(assignSparePartToService.rejected, (state, action) => {
                state.isLoading = false;
                state.updateError = action.payload;
            })

            .addCase(saveQuoteCustomerNameWithVehicleNo.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(saveQuoteCustomerNameWithVehicleNo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.customerData = action.payload;
            })
            .addCase(saveQuoteCustomerNameWithVehicleNo.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload.errors.join(", ")
            })

            .addCase(editQuoteCustomerNameWithVehicleNo.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(editQuoteCustomerNameWithVehicleNo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.customerData = action.payload;
            })
            .addCase(editQuoteCustomerNameWithVehicleNo.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload.errors.join(", ")
            })

            .addCase(saveQuote.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(saveQuote.fulfilled, (state, action) => {
                state.isLoading = false;
                state.quoteData = action.payload;
            })
            .addCase(saveQuote.rejected, (state, action) => {
                state.isLoading = false;
                state.updateError = action.payload;
            })

            .addCase(deleteQuoteSparePartOrService.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteQuoteSparePartOrService.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(deleteQuoteSparePartOrService.rejected, (state, action) => {
                state.isLoading = false;
                state.updateError = action.payload;
            })

            .addCase(updateQuote.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateQuote.fulfilled, (state, action) => {
                state.isLoading = false;
                state.quoteData = action.payload;
            })
            .addCase(updateQuote.rejected, (state, action) => {
                state.isLoading = false;
                state.updateError = action.payload;
            })

            .addCase(updateQuoteSparePart.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateQuoteSparePart.fulfilled, (state, action) => {
                state.isLoading = false;
                state.quoteSparePartData = action.payload;
            })
            .addCase(updateQuoteSparePart.rejected, (state, action) => {
                state.isLoading = false;
                state.updateError = action.payload;
            })

            .addCase(updateQuoteService.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateQuoteService.fulfilled, (state, action) => {
                state.isLoading = false;
                state.quoteServiceData = action.payload;
            })
            .addCase(updateQuoteService.rejected, (state, action) => {
                state.isLoading = false;
                state.updateError = action.payload;
            })

            .addCase(deleteQuoteExistingSparePart.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteQuoteExistingSparePart.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(deleteQuoteExistingSparePart.rejected, (state, action) => {
                state.isLoading = false;
                state.updateError = action.payload;
            })

            .addCase(deleteQuoteExistingService.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteQuoteExistingService.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(deleteQuoteExistingService.rejected, (state, action) => {
                state.isLoading = false;
                state.updateError = action.payload;
            })
            
            .addCase(fetchAllQuotesSilent.fulfilled, (state, action) => {
                state.allQuotes = action.payload.data;
                state.totalRecord = action.payload.totalItems;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchAllQuotesSilent.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
            })
                        

    },
});

export const { resetPrimaryId, clearVehicleList, clearClientList , clearQuoteDetails } = quoteSlice.actions;
export default quoteSlice.reducer;
