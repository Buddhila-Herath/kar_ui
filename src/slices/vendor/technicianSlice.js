import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiConfig from "../../config/apiConfig";
import apiConfigMultipart from '../../config/apiConfigWthFormData';
import { apiBaseURL } from "../../constants";
import _ from "lodash";

export const fetchAllTechnician = createAsyncThunk(
  "vendorTechnician/fetchAllTechnician",
  async (filter, { rejectWithValue }) => {
    try {
      let url = apiBaseURL.VENDOR_ALL_TECHNICIANS;
      if (!_.isEmpty(filter)) {
        const params = new URLSearchParams();

        if (filter.page) params.append("page", filter.page);
        if (filter.size) params.append("size", filter.size);
        if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
        if (filter.sortOrder) params.append("order", filter.sortOrder);
        if (filter.sortField) params.append("sortBy", filter.sortField);
        if (filter.status) {
          const statusValue =
            filter.status.toLowerCase() === "active"
              ? "Active"
              : "Inactive";
          params.append("status", statusValue);
        }
        if (filter.technicianType) {
          const selectedValues = filter.technicianType.map(
            (option) => option.value
          );
          params.append("technicianType", selectedValues);
        }

        url += `?${params.toString()}`;
      } else {
        url += `?size=10&page=1`;
      }
      const response = await apiConfig.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.errors[0] || "Unknown error occurred");
    }
  }
);

export const fetchAllTechnicianSilent = createAsyncThunk(
  "vendorTechnician/fetchAllTechnicianSilent",
  async (filter, { rejectWithValue }) => {
    try {
      let url = apiBaseURL.VENDOR_ALL_TECHNICIANS;
      if (!_.isEmpty(filter)) {
        const params = new URLSearchParams();

        if (filter.page) params.append("page", filter.page);
        if (filter.size) params.append("size", filter.size);
        if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
        if (filter.sortOrder) params.append("order", filter.sortOrder);
        if (filter.sortField) params.append("sortBy", filter.sortField);
        if (filter.status) {
          const statusValue =
            filter.status.toLowerCase() === "active"
              ? "Active"
              : "Inactive";
          params.append("status", statusValue);
        }
        if (filter.technicianType) {
          const selectedValues = filter.technicianType.map(
            (option) => option.value
          );
          params.append("technicianType", selectedValues);
        }

        url += `?${params.toString()}`;
      } else {
        url += `?size=10&page=1`;
      }
      const response = await apiConfig.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.errors[0] || "Unknown error occurred");
    }
  }
);

export const fetchTechnicianDetails = createAsyncThunk(
  "vendorTechnician/fetchTechnicianDetails",
  async ({ id, type }) => {
    const response = await apiConfig.get(
      `${apiBaseURL.TECHNICIAN_DETAILS_BY_ID}/${id}?type=${type}`
    );
    return response.data;
  }
);

export const downloadExcelReport = createAsyncThunk(
  'vendorTechnician/downloadExcelReport',
  async (filter = {}) => {
    let url = apiBaseURL.TECHNICIAN_DOWNLOAD_EXCEL_REPORT;
    if (!_.isEmpty(filter)) {
      const params = new URLSearchParams();

      if (filter.page) params.append("page", filter.page);
      if (filter.size) params.append("size", filter.size);
      if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
      if (filter.sortOrder) params.append("order", filter.sortOrder);
      if (filter.sortField) params.append("sortBy", filter.sortField);
      if (filter.status) {
        const statusValue =
          filter.status.toLowerCase() === "active"
            ? "Active"
            : "Inactive";
        params.append("status", statusValue);
      }
      if (filter.technicianType) {
        const selectedValues = filter.technicianType.map(
          (option) => option.value
        );
        params.append("technicianType", selectedValues);
      }

      url += `?${params.toString()}`;
    } else {
      url += `?size=10&page=1`;
    }
    const response = await apiConfig.get(url, { responseType: 'blob' });
    return response.data;
  }
);

export const downloadPdfFile = createAsyncThunk(
  'vendorTechnician/downloadPdfFile',
  async (id) => {
    const response = await apiConfig.get(
      `${apiBaseURL.DOWNLOAD_TECHINCIAN_DETAILS}/${id}`
    );
    return response.data;
  }
);

export const generatePrimaryId = createAsyncThunk(
  'vendorTechnician/generatePrimaryId',
  async () => {
    try {
      const response = await apiConfig.get(apiBaseURL.GENERATE_TECHINCIAN_PRIMARY_ID);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to load data";
      throw new Error(errorMessage);
    }
  }
);

export const saveTechinicianData = createAsyncThunk(
  'vendorTechnician/saveTechinicianData',
  async (formInputs, { rejectWithValue }) => {
    try {
      const response = await apiConfig.post(apiBaseURL.SAVE_TECHINCIAN_DATA, formInputs);
      return response.data;
    } catch (error) {
      const errors = error.response?.data?.errors || [];
      const message = error.response?.data?.message || "Failed to save techinician data.";

      return rejectWithValue({ message, errors });
    }
  }
);

export const uploadImage = createAsyncThunk(
  'vendorTechnician/uploadImage',
  async ({ formData, type, primaryId }, { rejectWithValue }) => {
    try {
      const response = await apiConfigMultipart.post(
        `${apiBaseURL.UPLOAD_TECHINCIAN_IMAGE}/${type}/${primaryId}`,
        formData
      );
      const path = response?.data?.path;
      return path;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTechinicianData = createAsyncThunk(
  'vendorTechnician/updateTechinicianData',
  async (formInputs, { rejectWithValue }) => {
    try {
      const response = await apiConfig.put(apiBaseURL.SAVE_TECHINCIAN_DATA, formInputs);
      return response.data;
    } catch (error) {
      const errors = error.response?.data?.errors || [];
      const message = error.response?.data?.message || "Failed to update techinician data.";

      return rejectWithValue({ message, errors });
    }
  }
);

const technicianSlice = createSlice({
  name: "vendorTechnician",
  initialState: {
    isTechnicianLoading: false,
    isTechnicianDetailLoading: false,
    isDownloadLoading: false,
    isDownloadPdfLoading: false,
    allTechnician: [],
    totalRecord: 0,
    totalPages: 0,
    error: "",
    technicianDetails: null,
    techinician: [],
    primaryId: null,
    responseData: "",
    uploadErrorMessage: null,
    uploading: false,
    isUserCustomizationSaving: false,
  },
  reducers: {
    resetPrimaryId: (state) => {
      state.primaryId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTechnician.pending, (state) => {
        state.isTechnicianLoading = true;
        state.error = "";
      })
      .addCase(fetchAllTechnician.fulfilled, (state, action) => {
        state.isTechnicianLoading = false;
        state.allTechnician = action.payload.data;
        state.totalRecord = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllTechnician.rejected, (state, action) => {
        state.isTechnicianLoading = false;
        state.allTechnician = [];
        state.totalRecord = 0;
        state.error = action.payload;
      })

      .addCase(fetchTechnicianDetails.pending, (state) => {
        state.isTechnicianDetailLoading = true;
        state.error = "";
      })
      .addCase(fetchTechnicianDetails.fulfilled, (state, action) => {
        state.isTechnicianDetailLoading = false;
        state.technicianDetails = action.payload;
      })
      .addCase(fetchTechnicianDetails.rejected, (state, action) => {
        state.isTechnicianDetailLoading = false;
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

      .addCase(generatePrimaryId.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(generatePrimaryId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.primaryId = action.payload.primaryId;
      })
      .addCase(generatePrimaryId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(saveTechinicianData.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(saveTechinicianData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.techinician = action.payload;
      })
      .addCase(saveTechinicianData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(updateTechinicianData.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(updateTechinicianData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.techinician = action.payload;
      })
      .addCase(updateTechinicianData.rejected, (state, action) => {
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
      
      .addCase(fetchAllTechnicianSilent.fulfilled, (state, action) => {
          state.allTechnician = action.payload.data;
          state.totalRecord = action.payload.totalItems;
          state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllTechnicianSilent.rejected, (state, action) => {
          state.error = action.payload || action.error.message;
      });
  },
});

export const { resetPrimaryId } = technicianSlice.actions;
export default technicianSlice.reducer;
