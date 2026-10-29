import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from "../../config/apiConfig";
import { apiBaseURL } from "../../constants";
import apiConfigMultipart from '../../config/apiConfigWthFormData';
import _ from 'lodash';

export const fetchAllServices = createAsyncThunk(
    'vendorServices/fetchAllServices',
    async (filter = {}) => {
        let url = apiBaseURL.VENDOR_ALL_SERVICES;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();

            if (filter.page) params.append("page", filter.page);
            if (filter.size) params.append("size", filter.size);
            if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
            if (filter.sortOrder) params.append('order', filter.sortOrder);
            if (filter.sortField) params.append('sortBy', filter.sortField);
            if (filter.serviceRateType) params.append('serviceRateType', filter.serviceRateType);
            if (filter.technicianType) {
                const selectedValues = filter.technicianType.map((option) => option.value);
                params.append('technicianType', selectedValues);
            }
            if (filter.servicesCategory) params.append('serviceCategory', filter.servicesCategory);

            url += `?${params.toString()}`;
        } else {
            url += `?size=10&page=1`;
        }
        const response = await apiConfig.get(url);
        return response.data;
    }
);

export const fetchAllServicesSilent = createAsyncThunk(
    'vendorServices/fetchAllServicesSilent',
    async (filter = {}) => {
        let url = apiBaseURL.VENDOR_ALL_SERVICES;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();

            if (filter.page) params.append("page", filter.page);
            if (filter.size) params.append("size", filter.size);
            if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
            if (filter.sortOrder) params.append('order', filter.sortOrder);
            if (filter.sortField) params.append('sortBy', filter.sortField);
            if (filter.serviceRateType) params.append('serviceRateType', filter.serviceRateType);
            if (filter.technicianType) {
                const selectedValues = filter.technicianType.map((option) => option.value);
                params.append('technicianType', selectedValues);
            }
            if (filter.servicesCategory) params.append('serviceCategory', filter.servicesCategory);

            url += `?${params.toString()}`;
        } else {
            url += `?size=10&page=1`;
        }
        const response = await apiConfig.get(url);
        return response.data;
    }
);

export const downloadExcelReport = createAsyncThunk(
    'vendorServices/downloadExcelReport',
    async (filter = {}) => {
        let url = apiBaseURL.DOWNLOAD_SERVICE_EXCEL_REPORT;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();
            
            if (filter.page) params.append("page", filter.page);
            if (filter.size) params.append("size", filter.size);
            if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
            if (filter.sortOrder) params.append('order', filter.sortOrder);
            if (filter.sortField) params.append('sortBy', filter.sortField);
            if (filter.serviceRateType) params.append('serviceRateType', filter.serviceRateType);
            if (filter.technicianType) {
                const selectedValues = filter.technicianType.map((option) => option.value);
                params.append('technicianType', selectedValues);
            }
            if (filter.servicesCategory) params.append('serviceCategory', filter.servicesCategory);
            url += `?${params.toString()}`;
        }
        const response = await apiConfig.get(url, { responseType: 'blob' });
        return response.data;
    }
);

export const deleteServices = createAsyncThunk(
    'vendorServices/deleteServices',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.DELETE_SERVICES + '/' + id);
            await dispatch(fetchAllServices());
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.errors?.[0] || "An error occurred. Please try again.";
            return rejectWithValue(error.errorMessage);
        }
    }
);

export const fetchServiceDetails = createAsyncThunk(
    'vendorServices/fetchServiceDetails',
    async ({id, type}) => {
        const response = await apiConfig.get(apiBaseURL.SERVICE_BY_ID + '?serviceId=' + id + '&type=' + type);

        return response.data;
    }
);

export const bulkServiceUpload = createAsyncThunk(
    'vendorServices/bulkServiceUpload',
    async ({formData,isAdmin = false} ,{ rejectWithValue }) => {
        try {
            const response = await apiConfigMultipart.post(
                `${apiBaseURL.UPLOAD_BULK_SERVICES}?isAdmin=${isAdmin}`,
                formData
            );
            return response.data;
        } catch (error) {
            if (error.response) {
                const errorMessage =
                    error.response.data?.errors?.[0] ||
                    error.response.data?.errors ||
                    error.response.data?.message ||
                    "Something went wrong. Please try again.";
                
                return rejectWithValue(errorMessage);
            } else if (error.request) {
                return rejectWithValue("No response from server. Please check your network.");
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

export const downloadNoteAttachment = createAsyncThunk(
    "vendorServices/downloadNoteAttachment",
    async (path, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.SPARE_PART_NOTE_ATTACHMENT_DOWNLOAD}?path=${path}`,
                { responseType: "blob" }
            );
            return { data: response.data, headers: response.headers };
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to download the attachment");
        }
    }
);

export const generatePrimaryId = createAsyncThunk(
    'vendorServices/generatePrimaryId',
    async () => {
        try {
            const response = await apiConfig.get(apiBaseURL.GENERATE_SERVICE_PRIMARY_ID);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to load data";
            throw new Error(errorMessage);
        }
    }
);

export const getTotalCost = createAsyncThunk(
    "vendorServices/getTotalCost",
    async ({ hours, serviceRateTypeId, additionalCost }, { rejectWithValue }) => {
      try {
        const queryParams = new URLSearchParams({
          hours,
          serviceRateTypeId,
          additionalCost,
        });
  
        const response = await apiConfig.get(
          `${apiBaseURL.CALCULATE_TOTALSERVICE_COST}?${queryParams}`
        );
        return response.data.totalCost;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to load total cost data");
      }
    }
);

export const saveServices = createAsyncThunk(
    'vendorServices/saveServices',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.post(apiBaseURL.ADD_SERVICE_DETAILS, formInputs);
            return response.data;
        } catch (error) {    
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save service.";
            
            return rejectWithValue({ message, errors });
        }
    }
);

export const uploadServiceChecklist = createAsyncThunk(
    'vendorServices/uploadServiceChecklist',
    async ({ formData, primaryId }, { rejectWithValue }) => {
      try {
        const response = await apiConfigMultipart.post(
          `${apiBaseURL.UPLOAD_SERVICE_CHECKLIST}/${primaryId}`,
          formData
        );
        const paths = response?.data?.folderPaths?.map(f => f.path) || [];
        return paths;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
);  

export const uploadServiceNoteFile = createAsyncThunk(
    'vendorServices/uploadServiceNoteFile',
    async ({formData, primaryId}, { rejectWithValue }) => {
        try {
            const response = await apiConfigMultipart.post(
              `${apiBaseURL.UPLOAD_SERVICE_ATTACHMENT}/${primaryId}`,
              formData
            );
            const paths = response?.data?.folderPaths?.map(f => f.path) || [];
            return paths;
        } catch (error) {    
            const errorMessage =
            error.response.data?.errors?.[0] ||
            error.response.data?.message ||
            "Something went wrong. Please try again.";
            
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateServices = createAsyncThunk(
    'vendorServices/updateServices',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_SERVICE, formInputs);
            return response.data;
        } catch (error) {    
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to update service.";
            
            return rejectWithValue({ message, errors });
        }
    }
);

export const updateAdminServices = createAsyncThunk(
    'vendorServices/updateAdminServices',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_ADMIN_SERVICES, formInputs);
            return response.data;
        } catch (error) {    
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to update service.";
            
            return rejectWithValue({ message, errors });
        }
    }
);

const serviceSlice = createSlice({
    name: 'vendorServices',
    initialState: {
        isServicesLoading: false,
        isServiceDetailsLoading: false,
        allServices: [],
        totalRecord: 0,
        totalPages: 0,
        error: null,
        uploadErrorMessage: null,
        responseData: "",
        uploading: false,
        isLoading: false,
        serviceDetails: null,
        isDownloadLoading: false,
        primaryId: "",
        totalServiceCost: null,
        service: null,
    },
    reducers: {
      resetPrimaryId: (state) => {
        state.primaryId = null;
      },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllServices.fulfilled, (state, action) => {
                state.isServicesLoading = false;
                state.allServices = action.payload.data;
                state.totalRecord = action.payload.totalItems;
                state.totalPages = action.payload.totalPages
            })
            .addCase(fetchAllServices.rejected, (state, action) => {
                state.isServicesLoading = false;
                state.allServices = [];
                state.totalRecord = 0;
                state.error = action.error.message;
            })
            .addCase(fetchAllServices.pending, (state) => {
                state.isServicesLoading = true;
                state.error = null;
            })

            .addCase(deleteServices.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteServices.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(deleteServices.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(fetchServiceDetails.pending, (state) => {
                state.isServiceDetailsLoading = true;
                state.error = null;
            })
            .addCase(fetchServiceDetails.fulfilled, (state, action) => {
                state.isServiceDetailsLoading = false;
                state.serviceDetails = action.payload;
            })
            .addCase(fetchServiceDetails.rejected, (state, action) => {
                state.isServiceDetailsLoading = false;
                state.error = action.error.message;
            })

            .addCase(downloadNoteAttachment.pending, (state) => {
                state.isDownloadLoading = true;
                state.error = null;
            })
            .addCase(downloadNoteAttachment.fulfilled, (state, action) => {
                state.isDownloadLoading = false;
            })
            .addCase(downloadNoteAttachment.rejected, (state, action) => {
                state.isDownloadLoading = false;
                state.error = action.error.message;
            })

            .addCase(bulkServiceUpload.pending, (state) => {
                state.uploading = true;
                state.uploadErrorMessage = null;
            })
            .addCase(bulkServiceUpload.fulfilled, (state, action) => {
                state.uploading = false;
                state.responseData = action.payload;
            })
            .addCase(bulkServiceUpload.rejected, (state, action) => {
                state.uploading = false;
                state.uploadErrorMessage = action.payload;
            })

            .addCase(generatePrimaryId.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(generatePrimaryId.fulfilled, (state, action) => {
                state.isLoading = false;
                state.primaryId = action.payload.servicePrimaryId;
            })
            .addCase(generatePrimaryId.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            .addCase(saveServices.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(saveServices.fulfilled, (state, action) => {
                state.isLoading = false;
                state.service = action.payload;
            })
            .addCase(saveServices.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(getTotalCost.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getTotalCost.fulfilled, (state, action) => {
                state.isLoading = false;
                state.totalServiceCost = action.payload;
            })
            .addCase(getTotalCost.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            
            .addCase(uploadServiceChecklist.pending, (state) => {
                state.uploading = true;
                state.uploadErrorMessage = null;
            })
            .addCase(uploadServiceChecklist.fulfilled, (state, action) => {
                state.uploading = false;
                state.responseData = action.payload;
            })
            .addCase(uploadServiceChecklist.rejected, (state, action) => {
                state.uploading = false;
                state.uploadErrorMessage = action.payload?.errors || [];
            })

            .addCase(uploadServiceNoteFile.pending, (state) => {
                state.uploading = true;
                state.uploadErrorMessage = null;
            })
            .addCase(uploadServiceNoteFile.fulfilled, (state, action) => {
                state.uploading = false;
                state.responseData = action.payload;
            })
            .addCase(uploadServiceNoteFile.rejected, (state, action) => {
                state.uploading = false;
                state.uploadErrorMessage = action.payload?.errors || [];
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
            
            .addCase(updateServices.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateServices.fulfilled, (state, action) => {
                state.isLoading = false;
                state.service = action.payload;
            })
            .addCase(updateServices.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateAdminServices.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateAdminServices.fulfilled, (state, action) => {
                state.isLoading = false;
                state.service = action.payload;
            })
            .addCase(updateAdminServices.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            
            .addCase(fetchAllServicesSilent.fulfilled, (state, action) => {
                state.allServices = action.payload.data;
                state.totalRecord = action.payload.totalItems;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchAllServicesSilent.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
            });
    },
});

export const { resetPrimaryId } = serviceSlice.actions;
export default serviceSlice.reducer;
