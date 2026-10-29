import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from '../config/apiConfig';
import apiConfigMultipart from '../config/apiConfigWthFormData';
import { apiBaseURL, dateFormat } from '../constants';
import { format } from "date-fns";
import _ from 'lodash';

export const fetchAllVendors = createAsyncThunk(
    'vendors/fetchAllVendors',
    async (filter = {}) => {
        let url = apiBaseURL.ALL_VENDORS;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();
            if (filter.page) params.append('page', filter.page);
            if (filter.size) params.append('size', filter.size);
            if (filter.searchTerm) params.append('searchTerm', filter.searchTerm);
            if (filter.status) {
                const statusValue = filter.status.toLowerCase() === 'active' ? "true" : "false";
                params.append('status', statusValue);
            }
            if (filter.businessType) params.append('businessType', filter.businessType);
            if (filter.fromDate) params.append('fromDate', filter.fromDate);
            if (filter.toDate) params.append('toDate', filter.toDate);
            if (filter.sortField) params.append('sortBy', filter.sortField);
            if (filter.sortOrder) params.append('order', filter.sortOrder);

            url += `?${params.toString()}`;
        }
        const response = await apiConfig.get(url);
        return response.data;
    }
);

export const fetchAllVendorsSilent = createAsyncThunk(
    'vendors/fetchAllVendorsSilent',
    async (filter = {}) => {
        let url = apiBaseURL.ALL_VENDORS;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();
            if (filter.page) params.append('page', filter.page);
            if (filter.size) params.append('size', filter.size);
            if (filter.searchTerm) params.append('searchTerm', filter.searchTerm);
            if (filter.status) {
                const statusValue = filter.status.toLowerCase() === 'active' ? "true" : "false";
                params.append('status', statusValue);
            }
            if (filter.businessType) params.append('businessType', filter.businessType);
            if (filter.fromDate) params.append('fromDate', filter.fromDate);
            if (filter.toDate) params.append('toDate', filter.toDate);
            if (filter.sortField) params.append('sortBy', filter.sortField);
            if (filter.sortOrder) params.append('order', filter.sortOrder);

            url += `?${params.toString()}`;
        }
        const response = await apiConfig.get(url);
        return response.data;
    }
);

export const fetchVendorDetails = createAsyncThunk(
    'vendors/fetchVendorDetails',
    async ({ id, type }) => {
      const response = await apiConfig.get(`${apiBaseURL.VENDOR_DETAILS_BY_ID}/${id}?viewType=${type}`);
      return response.data;
    }
);

export const updateVendorDetails = createAsyncThunk(
    'vendors/updateVendorDetails',
    async (vendorDetails, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_VENDOR_DETAILS_BY_ID, vendorDetails);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to update vendor data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const addVendorDetails = createAsyncThunk(
    "vendors/addVendorDetails",
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.post(apiBaseURL.ADD_VENDOR_DETAILS, formInputs);
            return response.data.response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to add vendor details");
        }
    }
);

export const deleteVendorDetails = createAsyncThunk(
    'vendors/deleteVendorDetails',
    async (vendorId, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.DELETE_VENDOR_DETAILS_BY_ID + '/' + vendorId);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.errors?.[0] || "An error occurred. Please try again.";
            return rejectWithValue(error.errorMessage);
        }
    }
);

export const downloadExcelReport = createAsyncThunk(
    'vendors/downloadExcelReport',
    async (filter = {}) => {
        let url = apiBaseURL.DOWNLOAD_VENDOR_EXCEL_REPORT;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();
            if (filter.page) params.append('page', filter.page);
            if (filter.size) params.append('size', filter.size);
            if (filter.searchTerm) params.append('searchTerm', filter.searchTerm);
            if (filter.status) {
                const statusValue = filter.status.toLowerCase() === 'active' ? "true" : "false";
                params.append('status', statusValue);
            }
            if (filter.businessType) params.append('businessType', filter.businessType);
            if (filter.fromDate) params.append('fromDate', filter.fromDate);
            if (filter.toDate) params.append('toDate', filter.toDate);
            if (filter.sortField) params.append('sortBy', filter.sortField);
            if (filter.sortOrder) params.append('order', filter.sortOrder);

            url += `?${params.toString()}`;
        }
        const response = await apiConfig.get(url, { responseType: 'blob' });
        return response.data;
    }
);

export const uploadImage = createAsyncThunk(
    'vendors/uploadImage',
    async ({ formData, vendorId, type }, { rejectWithValue }) => {
        try {
            const response = await apiConfigMultipart.post(
                `${apiBaseURL.UPLOAD_VENDOR_IMAGE}/${type}/${vendorId}`,
                formData
            );
            const path = response?.data?.path;
            return path;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


export const generatePrimaryId = createAsyncThunk(
    'vendors/generatePrimaryId',
    async () => {
        try {
            const response = await apiConfig.get(apiBaseURL.GENERATE_VENDOR_ID);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to load data";
            throw new Error(errorMessage);
        }
    }
);

export const deleteVendorDocument = createAsyncThunk(
  'vendors/deleteVendorDocument',
  async ({ vendorId, type }, { rejectWithValue }) => {
    try {
        const response = await axios.delete(
            `${apiBaseURL.ALL_VENDORS}/${vendorId}?type=${type}`,
        );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const vendorSlice = createSlice({
    name: 'vendors',
    initialState: {
        isVendorsLoading: false,
        isDownloadLoading: false,
        allVendors: [],
        vendor: [],
        totalRecord: 0,
        totalPages: 0,
        error: null,
        vendorDetails: null,
        isVendorDetailsLoading: false,
        updateVendorDetailsLoading: false,
        updateVendorDetailsSuccess: null,
        isUserCustomizationSaving: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllVendors.pending, (state) => {
                state.isVendorsLoading = true;
                state.error = null;
            })
            .addCase(fetchAllVendors.fulfilled, (state, action) => {
                state.isVendorsLoading = false;
                state.allVendors = action.payload.data;
                state.totalRecord = action.payload.totalItems;
                state.totalPages = action.payload.totalPages
            })
            .addCase(fetchAllVendors.rejected, (state, action) => {
                state.isVendorsLoading = false;
                state.allVendors = [];
                state.totalRecord = 0;
                state.error = action.error.message;
            })

            .addCase(fetchVendorDetails.pending, (state) => {
                state.isVendorDetailsLoading = true;
                state.error = null;
            })
            .addCase(fetchVendorDetails.fulfilled, (state, action) => {
                state.isVendorDetailsLoading = false;
                state.vendorDetails = action.payload;
            })
            .addCase(fetchVendorDetails.rejected, (state, action) => {
                state.isVendorDetailsLoading = false;
                state.error = action.error.message;
            })

            .addCase(deleteVendorDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteVendorDetails.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(deleteVendorDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(addVendorDetails.pending, (state) => {
                state.isLoading = true;
                state.error = "";
            })
            .addCase(addVendorDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.vendor = action.payload;
            })
            .addCase(addVendorDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateVendorDetails.pending, (state) => {
                state.isLoading = true;
                state.error = "";
            })
            .addCase(updateVendorDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.vendor = action.payload;
            })
            .addCase(updateVendorDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(uploadImage.pending, (state) => {
                state.uploading = true;
                state.uploadErrorMessage = null;
            })
            .addCase(uploadImage.fulfilled, (state, action) => {
                state.uploading = false;
                state.responseData = action.payload;
            })
            .addCase(uploadImage.rejected, (state, action) => {
                state.uploading = false;
                state.uploadErrorMessage = action.payload?.errors || [];
            })

            .addCase(generatePrimaryId.pending, (state) => {
                state.isLoading = true;
                state.error = "";
            })
            .addCase(generatePrimaryId.fulfilled, (state, action) => {
                state.isLoading = false;
                state.primaryId = action.payload.vendorId;
            })
            .addCase(generatePrimaryId.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
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

            .addCase(deleteVendorDocument.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteVendorDocument.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(deleteVendorDocument.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

           .addCase(fetchAllVendorsSilent.fulfilled, (state, action) => {
                state.allVendors = action.payload.data;
                state.totalRecord = action.payload.totalItems;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchAllVendorsSilent.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
            });
    },
});

export const { resetPrimaryId } = vendorSlice.actions;
export default vendorSlice.reducer;
