import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiConfig from "../../config/apiConfig";
import apiConfigMultipart from '../../config/apiConfigWthFormData';
import { apiBaseURL } from "../../constants";
import _ from "lodash";

export const fetchAllSpareParts = createAsyncThunk(
    "vendorSpareparts/fetchAllSpareParts",
    async (filter = {}) => {
        let url = apiBaseURL.VENDOR_ALL_SPARE_PARTS;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();
            if (filter.page) params.append("page", filter.page);
            if (filter.size) params.append("pageSize", filter.size);
            if (filter.searchTerm) params.append("search", filter.searchTerm);
            if (filter.warranty) {
                const warrantyValue =
                    filter.warranty.toLowerCase() === "applicable"
                        ? "APPLICABLE"
                        : "NOT_APPLICABLE";
                params.append("warranty", warrantyValue);
            }
            if (filter.stockStatus) {
                const stockStatusValue =
                    filter.stockStatus.toLowerCase() === "available"
                        ? "IN_STOCK"
                        : "OUT_OF_STOCK";
                params.append("stockStatus", stockStatusValue);
            }
            if (filter.variation) params.append("variationId", filter.variation);
            if (filter.vehicleCategory) params.append("vehicleCategoryId", filter.vehicleCategory);
            if (filter.sortOrder) params.append('order', filter.sortOrder);
            if (filter.sortField) params.append('sortBy', filter.sortField);

            url += `?${params.toString()}`;
        } else {
            url += `?pageSize=10&page=1`;
        }
        const response = await apiConfig.get(url);
        return response.data;
    }
);

export const fetchAllSparePartsSilent = createAsyncThunk(
    "vendorSpareparts/fetchAllSparePartsSilent",
    async (filter = {}) => {
        let url = apiBaseURL.VENDOR_ALL_SPARE_PARTS;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();
            if (filter.page) params.append("page", filter.page);
            if (filter.size) params.append("pageSize", filter.size);
            if (filter.searchTerm) params.append("search", filter.searchTerm);
            if (filter.warranty) {
                const warrantyValue =
                    filter.warranty.toLowerCase() === "applicable"
                        ? "APPLICABLE"
                        : "NOT_APPLICABLE";
                params.append("warranty", warrantyValue);
            }
            if (filter.stockStatus) {
                const stockStatusValue =
                    filter.stockStatus.toLowerCase() === "available"
                        ? "IN_STOCK"
                        : "OUT_OF_STOCK";
                params.append("stockStatus", stockStatusValue);
            }
            if (filter.variation) params.append("variationId", filter.variation);
            if (filter.vehicleCategory) params.append("vehicleCategoryId", filter.vehicleCategory);
            if (filter.sortOrder) params.append('order', filter.sortOrder);
            if (filter.sortField) params.append('sortBy', filter.sortField);

            url += `?${params.toString()}`;
        } else {
            url += `?pageSize=10&page=1`;
        }
        const response = await apiConfig.get(url);
        return response.data;
    }
);

export const deleteSparePartDetails = createAsyncThunk(
    'vendorSpareparts/deleteSparePartDetails',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.DELETE_SPARE_PART + '/' + id);
            await dispatch(fetchAllSpareParts());
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.errors?.[0] || "An error occurred. Please try again.";
            return rejectWithValue(error.errorMessage);
        }
    }
);

export const downloadExcelReport = createAsyncThunk(
    'vendorSpareparts/downloadExcelReport',
    async (filter = {}) => {
        let url = apiBaseURL.DOWNLOAD_SPARE_PART_EXCEL_REPORT;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();
            if (filter.page) params.append("page", filter.page);
            if (filter.size) params.append("pageSize", filter.size);
            if (filter.searchTerm) params.append("search", filter.searchTerm);
            if (filter.warranty) {
                const warrantyValue =
                    filter.warranty.toLowerCase() === "applicable"
                        ? "APPLICABLE"
                        : "NOT_APPLICABLE";
                params.append("warranty", warrantyValue);
            }
            if (filter.stockStatus) {
                const stockStatusValue =
                    filter.stockStatus.toLowerCase() === "available"
                        ? "IN_STOCK"
                        : "OUT_OF_STOCK";
                params.append("stockStatus", stockStatusValue);
            }
            if (filter.variation) params.append("variationId", filter.variation);
            if (filter.vehicleCategory) params.append("vehicleCategoryId", filter.vehicleCategory);
            if (filter.sortOrder) params.append('order', filter.sortOrder);
            if (filter.sortField) params.append('sortBy', filter.sortField);

            url += `?${params.toString()}`;
        }
        const response = await apiConfig.get(url, { responseType: 'blob' });
        return response.data;
    }
);

export const generatePrimaryId = createAsyncThunk(
    'vendorSpareparts/generatePrimaryId',
    async () => {
        try {
            const response = await apiConfig.get(apiBaseURL.GENERATE_SPARE_PART_ID);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to load data";
            throw new Error(errorMessage);
        }
    }
);

export const downloadSparePartTemplate = createAsyncThunk(
    'vendorSpareparts/downloadSparePartTemplate',
    async () => {
        try {
            const response = await apiConfig.get(apiBaseURL.DOWNLOAD_SPARE_PART_TEMPLETE, {
                responseType: "blob",
            });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to load data";
            throw new Error(errorMessage);
        }
    }
);

export const uploadBulkSparePart = createAsyncThunk(
    'vendorSpareparts/uploadBulkSparePart',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await apiConfigMultipart.post(apiBaseURL.UPLOAD_BULK_SPARE_PARTS, formData);
            return response.data;
        } catch (error) {
            if (error.response) {
                const errorMessage =
                    error.response.data?.errors?.[0] ||
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

export const fetchSparePartsDetails = createAsyncThunk(
    'vendorSpareparts/fetchSparePartsDetails',
    async (id) => {
        const response = await apiConfig.get(apiBaseURL.SPARE_PART_DETAILS_BY_ID + '/' + id);

        return response.data;
    }
);

export const fetchSparePartsDetailsForEdit = createAsyncThunk(
    'vendorSpareparts/fetchSparePartsDetailsForEdit',
    async (id) => {
        const response = await apiConfig.get(apiBaseURL.SPARE_PART_DETAILS_BY_ID_FOR_EDIT + '/' + id);

        return response.data;
    }
);

export const downloadNoteAttachment = createAsyncThunk(
    "vendorSpareparts/downloadNoteAttachment",
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

export const uploadSparePartImage = createAsyncThunk(
    'vendorSpareparts/uploadSparePartImage',
    async ({ formData, primaryId }, { rejectWithValue }) => {
      try {
        const response = await apiConfigMultipart.post(
          `${apiBaseURL.UPLOAD_SPARE_PART_IMAGE}/${primaryId}`,
          formData
        );
        const path = response?.data?.folderPaths?.[0]?.path;
        return path;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
);  

export const saveSparePart = createAsyncThunk(
    'vendorSpareparts/saveSparePart',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.post(apiBaseURL.SAVE_SPARE_PART, formInputs);
            return response.data;
        } catch (error) {    
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save spare part.";
            
            return rejectWithValue({ message, errors });
        }
    }
);

export const uploadSparePartNoteFile = createAsyncThunk(
    'vendorSpareparts/uploadSparePartNoteFile',
    async ({formData, primaryId}, { rejectWithValue }) => {
        try {
            const response = await apiConfigMultipart.post(
              `${apiBaseURL.UPLOAD_SPARE_PART_NOTE_FILES}/${primaryId}`,
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

export const saveSparePartNote = createAsyncThunk(
    'vendorSpareparts/saveSparePartNote',
    async (formInputs, { rejectWithValue }) => {
        const transformedData = {
          notes: formInputs.note,
          isAdmin: true,
          serviceAttachments: formInputs.serviceAttachments
        };
        try {
            const response = await apiConfig.post(apiBaseURL.SAVE_SPARE_PART_NOTE, transformedData);
            return response.data;
        } catch (error) {    
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save note.";
            
            return rejectWithValue({ message, errors });
        }
    }
);

export const deleteSparePartNote = createAsyncThunk(
    'vendorSpareparts/deleteSparePartNote',
    async (id, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(`${apiBaseURL.DELETE_SPARE_PART_NOTE}/${id}`);
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

export const updateSparePart = createAsyncThunk(
    'vendorSpareparts/updateSparePart',
    async (formInputs, { rejectWithValue }) => {
      try {
        const response = await apiConfig.put(apiBaseURL.UPDATE_SPARE_PART, formInputs);
        return response.data;
      } catch (error) {    
        const errors = error.response?.data?.errors || [];
        const message = error.response?.data?.message || "Failed to update Spare Parts";
        
        return rejectWithValue({ message, errors });
      }
    }
);

export const updateAdminSparePart = createAsyncThunk(
    'vendorSpareparts/updateAdminSparePart',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_ADMIN_SPARE_PART, formInputs);
            return response.data;
        } catch (error) {
        const errors = error.response?.data?.errors || [];
        const message = error.response?.data?.message || "Failed to update spare part.";
        
        return rejectWithValue({ message, errors });
        }
    }
);


// Fetch Part Placement Code by name and portal context
export const fetchPartPlacementCode = createAsyncThunk(
    'vendorSpareparts/fetchPartPlacementCode',
    async ({ name, isVendor }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (name) params.append('name', name);
            params.append('isVendor', String(!!isVendor));
            const url = `${apiBaseURL.PART_PLACEMENT_CODE}?${params.toString()}`;
            const response = await apiConfig.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data || error.message);
        }
    }
);

const sparePartSlice = createSlice({
    name: "vendorSpareparts",
    initialState: {
        isSparePartsLoading: false,
        isDownloadLoading: false,
        allSpareParts: [],
        primaryId: null,
        totalRecord: 0,
        totalPages: 0,
        error: null,
        uploadErrorMessage: null,
        responseData: "",
        uploading: false,
        isLoading: false,
        sparePartDetails: null,
        sparePart: null,
        sparePartNote: null,
        isPartPlacementCodeLoading: false,
        partPlacementCodeData: null,
        isUserCustomizationSaving: false,
    },
    reducers: {
      resetPrimaryId: (state) => {
        state.primaryId = null;
      },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllSpareParts.pending, (state) => {
                state.isSparePartsLoading = true;
                state.error = null;
            })
            .addCase(fetchAllSpareParts.fulfilled, (state, action) => {
                state.isSparePartsLoading = false;
                state.allSpareParts = action.payload.data;
                state.totalRecord = action.payload.totalItems;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchAllSpareParts.rejected, (state, action) => {
                state.isSparePartsLoading = false;
                state.allSpareParts = [];
                state.totalRecord = 0;
                state.error = action.error.message;
            })

            .addCase(deleteSparePartDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteSparePartDetails.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(deleteSparePartDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(generatePrimaryId.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(generatePrimaryId.fulfilled, (state, action) => {
                state.isLoading = false;
                state.primaryId = action.payload.sparePartsPrimaryId;
            })
            .addCase(generatePrimaryId.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(downloadSparePartTemplate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(downloadSparePartTemplate.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(downloadSparePartTemplate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(uploadBulkSparePart.pending, (state) => {
                state.uploading = true;
                state.uploadErrorMessage = null;
            })
            .addCase(uploadBulkSparePart.fulfilled, (state, action) => {
                state.uploading = false;
                state.responseData = action.payload;
            })
            .addCase(uploadBulkSparePart.rejected, (state, action) => {
                state.uploading = false;
                state.uploadErrorMessage = action.payload;
            })

            .addCase(fetchSparePartsDetailsForEdit.pending, (state) => {
                state.isSparePartsLoading = true;
                state.error = null;
            })
            .addCase(fetchSparePartsDetailsForEdit.fulfilled, (state, action) => {
                state.isSparePartsLoading = false;
                state.sparePartDetails = action.payload;
            })
            .addCase(fetchSparePartsDetailsForEdit.rejected, (state, action) => {
                state.isSparePartsLoading = false;
                state.error = action.error.message;
            })

            .addCase(fetchSparePartsDetails.pending, (state) => {
                state.isSparePartsLoading = true;
                state.error = null;
            })
            .addCase(fetchSparePartsDetails.fulfilled, (state, action) => {
                state.isSparePartsLoading = false;
                state.sparePartDetails = action.payload;
            })
            .addCase(fetchSparePartsDetails.rejected, (state, action) => {
                state.isSparePartsLoading = false;
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

            .addCase(uploadSparePartImage.pending, (state) => {
                state.uploading = true;
                state.uploadErrorMessage = null;
            })
            .addCase(uploadSparePartImage.fulfilled, (state, action) => {
                state.uploading = false;
                state.responseData = action.payload;
            })
            .addCase(uploadSparePartImage.rejected, (state, action) => {
                state.uploading = false;
                state.uploadErrorMessage = action.payload?.errors || [];
            })

            .addCase(uploadSparePartNoteFile.pending, (state) => {
                state.uploading = true;
                state.uploadErrorMessage = null;
            })
            .addCase(uploadSparePartNoteFile.fulfilled, (state, action) => {
                state.uploading = false;
                state.responseData = action.payload;
            })
            .addCase(uploadSparePartNoteFile.rejected, (state, action) => {
                state.uploading = false;
                state.uploadErrorMessage = action.payload?.errors || [];
            })

            .addCase(saveSparePartNote.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(saveSparePartNote.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sparePartNote = action.payload;
            })
            .addCase(saveSparePartNote.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(saveSparePart.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(saveSparePart.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sparePart = action.payload;
            })
            .addCase(saveSparePart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(deleteSparePartNote.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteSparePartNote.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sparePartNote = action.payload;
            })
            .addCase(deleteSparePartNote.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            
            .addCase(updateSparePart.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateSparePart.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sparePart = action.payload;
            })
            .addCase(updateSparePart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            
            .addCase(fetchPartPlacementCode.pending, (state) => {
                state.isPartPlacementCodeLoading = true;
                state.error = null;
            })
            .addCase(fetchPartPlacementCode.fulfilled, (state, action) => {
                state.isPartPlacementCodeLoading = false;
                state.partPlacementCodeData = action.payload;
            })
            .addCase(fetchPartPlacementCode.rejected, (state, action) => {
                state.isPartPlacementCodeLoading = false;
                state.partPlacementCodeData = null;
                state.error = action.payload || action.error.message;
            })
            
            .addCase(fetchAllSparePartsSilent.fulfilled, (state, action) => {
                state.allSpareParts = action.payload.data;
                state.totalRecord = action.payload.totalItems;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchAllSparePartsSilent.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
            });
            
    },
});

export const { resetPrimaryId } = sparePartSlice.actions;
export default sparePartSlice.reducer;