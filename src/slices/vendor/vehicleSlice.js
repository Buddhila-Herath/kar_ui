import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiConfig from "../../config/apiConfig";
import apiConfigMultipart from "../../config/apiConfigWthFormData";
import { apiBaseURL } from "../../constants";
import _ from "lodash";

export const fetchAllVehicles = createAsyncThunk(
  "vendorVehicle/fetchAllVehicles",
  async (filter, { rejectWithValue }) => {
    try {
      let url = apiBaseURL.GET_ALL_VEHICLES;
      if (!_.isEmpty(filter)) {
        const params = new URLSearchParams();

        if (filter.page) params.append("page", filter.page);
        if (filter.size) params.append("size", filter.size);
        if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
        if (filter.sortOrder) params.append("sortOrder", filter.sortOrder);
        if (filter.sortField) params.append("sortBy", filter.sortField);
        if (filter.vehicleMake && filter.vehicleMake.length > 0) {
          params.append("vehicleMakeIds", filter.vehicleMake.join(","));
        }
        if (filter.vehicleModel && filter.vehicleModel.length > 0) {
          params.append("vehicleModelIds", filter.vehicleModel.join(","));
        }

        url += `?${params.toString()}`;
      } else {
        url += `?size=10&page=1`;
      }
      const response = await apiConfig.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors[0] || "Unknown error occurred"
      );
    }
  }
);

// Silent variant: refetch without toggling isLoading flags
export const fetchAllVehiclesSilent = createAsyncThunk(
  "vendorVehicle/fetchAllVehiclesSilent",
  async (filter, { rejectWithValue }) => {
    try {
      let url = apiBaseURL.GET_ALL_VEHICLES;
      if (!_.isEmpty(filter)) {
        const params = new URLSearchParams();

        if (filter.page) params.append("page", filter.page);
        if (filter.size) params.append("size", filter.size);
        if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
        if (filter.sortOrder) params.append("sortOrder", filter.sortOrder);
        if (filter.sortField) params.append("sortBy", filter.sortField);
        if (filter.vehicleMake && filter.vehicleMake.length > 0) {
          params.append("vehicleMakeIds", filter.vehicleMake.join(","));
        }
        if (filter.vehicleModel && filter.vehicleModel.length > 0) {
          params.append("vehicleModelIds", filter.vehicleModel.join(","));
        }

        url += `?${params.toString()}`;
      } else {
        url += `?size=10&page=1`;
      }
      const response = await apiConfig.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors?.[0] || "Unknown error occurred"
      );
    }
  }
);

export const fetchVehicleDetails = createAsyncThunk(
  "vendorVehicle/fetchVehicleDetails",
  async (id) => {
    const response = await apiConfig.get(
      apiBaseURL.GET_VEHICLE_DETAILS_BY_ID + "/" + id
    );

    return response.data;
  }
);

export const downloadExcelReport = createAsyncThunk(
  "vendorVehicle/downloadExcelReport",
  async (filter = {}) => {
    let url = apiBaseURL.VEHICLE_DOWNLOAD_EXCEL_REPORT;
    if (!_.isEmpty(filter)) {
      const params = new URLSearchParams();

      if (filter.page) params.append("page", filter.page);
      if (filter.size) params.append("size", filter.size);
      if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
      if (filter.sortOrder) params.append("order", filter.sortOrder);
      if (filter.sortField) params.append("sortBy", filter.sortField);
      if (filter.vehicleMake && filter.vehicleMake.length > 0) {
        params.append("vehicleMakeIds", filter.vehicleMake.join(","));
      }
      if (filter.vehicleModel && filter.vehicleModel.length > 0) {
        params.append("vehicleModelIds", filter.vehicleModel.join(","));
      }

      url += `?${params.toString()}`;
    } else {
      url += `?size=10&page=1`;
    }
    const response = await apiConfig.get(url, { responseType: "blob" });
    return response.data;
  }
);

export const saveVehicleData = createAsyncThunk(
  "vendorVehicle/saveVehicle",
  async (formInputs, { rejectWithValue }) => {
    try {
      const response = await apiConfig.post(
        apiBaseURL.SAVE_VEHICLE,
        formInputs
      );
      return response.data;
    } catch (error) {
      const errors = error.response?.data?.errors || [];
      const message =
        error.response?.data?.message || "Failed to save vehicle data.";

      return rejectWithValue({ message, errors });
    }
  }
);

export const uploadVehicleRegistrationImages = createAsyncThunk(
  "vendorVehicle/uploadVehicleRegistrationImages",
  async ({ formData, vehicleId }, { rejectWithValue }) => {
    try {
      const response = await apiConfigMultipart.post(
        `${apiBaseURL.UPLOAD_VEHICLE_REGISTRATION_IMAGES}/${vehicleId}`,
        formData
      );
      return response.data;
    } catch (error) {
      const errors = error.response?.data?.errors || [];
      const message =
        error.response?.data?.message ||
        "Failed to upload vehicle registration images.";

      return rejectWithValue({ message, errors });
    }
  }
);

export const fetchVehicleEditViewById = createAsyncThunk(
  "vendorVehicle/fetchVehicleEditViewById",
  async (params) => {
    const { id } = params;

    const response = await apiConfig.get(
      apiBaseURL.VEHICLE_EDIT_VIEW_BY_ID + "/" + id
    );

    return response;
  }
);

export const updateVehicleDetails = createAsyncThunk(
  "vendorVehicle/updateVehicleDetails",
  async (vehicleDetails, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiConfig.put(
        apiBaseURL.UPDATE_VEHICLE_DETAILS,
        vehicleDetails
      );
      return response.data;
    } catch (error) {
      const errors = error.response?.data?.errors || [];
      const message =
        error.response?.data?.message || "Failed to update vehicle data.";

      return rejectWithValue({ message, errors });
    }
  }
);

export const fetchAllOwnerName = createAsyncThunk(
  "vendorVehicle/fetchAllOwnerName",
  async (vehicleId = null, { rejectWithValue }) => {
    try {
      let url = apiBaseURL.GET_ALL_CUSTOMER_LIST;
      if (vehicleId) {
        url += `?vehicleId=${vehicleId}`;
      } else {
        url += `?isAll=true`;
      }
      const response = await apiConfig.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch owner list');
    }
  }
);

// saveUserCustomization moved to masterDataSlice for reuse

const vehicleSlice = createSlice({
  name: "vendorVehicle",
  initialState: {
    // Data
    allVehicles: [],
    vehicleData: null,
    vehicleDetails: null,
    vehicleData: [],
    vehicleEditView: null,
    allCustomerList: [],

    // Loading States
    isLoading: false,
    isUpdateLoading: false,
    isVehicleDetailsLoading: false,
    isDownloadLoading: false,
    isVehicleIdLoading: true,
    isVehicleEditViewLoading: false,
    isUploading: false,
    isUserCustomizationSaving: false,

    // Vehicle ID management
    vehicleId: null,

    // Errors
    error: null,
    updateError: null,
    successMessage: null,

    // Other
    totalRecord: 0,
    totalPages: 0,
  },
  reducers: {
    resetPrimaryId: (state) => {
      state.primaryId = null;
    },
    setVehicleId: (state, action) => {
      state.vehicleId = action.payload;
      state.isVehicleIdLoading = false;
    },
    setVehicleIdLoading: (state, action) => {
      state.isVehicleIdLoading = action.payload;
    },
    resetVehicleId: (state) => {
      state.vehicleId = null;
      state.isVehicleIdLoading = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllVehicles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllVehicles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allVehicles = action.payload.data;
        state.totalRecord = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Silent refetch handlers (no loading flags)
      .addCase(fetchAllVehiclesSilent.fulfilled, (state, action) => {
        state.allVehicles = action.payload.data;
        state.totalRecord = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllVehiclesSilent.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Vehicle Details
      .addCase(fetchVehicleDetails.pending, (state) => {
        state.isVehicleDetailsLoading = true;
        state.error = null;
      })
      .addCase(fetchVehicleDetails.fulfilled, (state, action) => {
        state.isVehicleDetailsLoading = false;
        state.vehicleDetails = action.payload;
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

      .addCase(saveVehicleData.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(saveVehicleData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicleData = action.payload;
      })
      .addCase(saveVehicleData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(uploadVehicleRegistrationImages.pending, (state) => {
        state.isUploading = true;
        state.error = "";
      })
      .addCase(uploadVehicleRegistrationImages.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadedImages = action.payload;
      })
      .addCase(uploadVehicleRegistrationImages.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.error.message;
      })

      .addCase(fetchVehicleEditViewById.pending, (state) => {
        state.isVehicleEditViewLoading = true;
        state.error = null;
      })
      .addCase(fetchVehicleEditViewById.fulfilled, (state, action) => {
        state.isVehicleEditViewLoading = false;
        state.vehicleEditView = action.payload.data;
      })
      .addCase(fetchVehicleEditViewById.rejected, (state, action) => {
        state.isVehicleEditViewLoading = false;
        state.error = action.error.message;
      })

      .addCase(updateVehicleDetails.pending, (state) => {
        state.isUpdateLoading = true;
        state.error = "";
      })
      .addCase(updateVehicleDetails.fulfilled, (state, action) => {
        state.isUpdateLoading = false;
        state.vehicleData = action.payload;
      })

      .addCase(fetchAllOwnerName.pending, (state) => {
        state.error = null;
        state.allCustomerList = [];
      })
      .addCase(fetchAllOwnerName.fulfilled, (state, action) => {
        state.allCustomerList = action.payload || [];
      })
      .addCase(fetchAllOwnerName.rejected, (state, action) => {
        state.error = action.error.message;
        state.allCustomerList = [];
        console.error("Fetch customer list failes:", action.error);
      })
     
      // saveUserCustomization handlers removed; centralized in masterDataSlice
  },
});

export const { setVehicleId, setVehicleIdLoading, resetVehicleId } =
  vehicleSlice.actions;
export default vehicleSlice.reducer;
