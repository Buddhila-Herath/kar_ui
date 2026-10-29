import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiConfig from "../../config/apiConfig";
import apiConfigMultipart from "../../config/apiConfigWthFormData";
import { apiBaseURL } from "../../constants";

export const fetchAllClient = createAsyncThunk(
  "vendorClient/fetchAllClient",
  async (filter = {}) => {
    let url = apiBaseURL.VENDOR_ALL_CLIENTS;
    if (!_.isEmpty(filter)) {
      const params = new URLSearchParams();
      if (filter.page) params.append("page", filter.page);
      if (filter.size) params.append("pageSize", filter.size);
      if (filter.searchTerm) params.append("search", filter.searchTerm);
      if (filter.status) params.append("status", filter.status.toLowerCase());
      if (filter.fromDate) params.append("from", filter.fromDate);
      if (filter.toDate) params.append("to", filter.toDate);
      if (filter.sortField) params.append("sortBy", filter.sortField);
      if (filter.sortOrder) params.append("order", filter.sortOrder);

      url += `?${params.toString()}`;
    }
    const response = await apiConfig.get(url);
    return response.data;
  }
);

export const fetchAllClientSilent = createAsyncThunk(
  'vendorClient/fetchAllClientSilent',
  async (filter = {}) => {
    let url = apiBaseURL.VENDOR_ALL_CLIENTS;
    if (!_.isEmpty(filter)) {
      const params = new URLSearchParams();
      if (filter.page) params.append("page", filter.page);
      if (filter.size) params.append("pageSize", filter.size);
      if (filter.searchTerm) params.append("search", filter.searchTerm);
      if (filter.status) params.append("status", filter.status.toLowerCase());
      if (filter.fromDate) params.append("from", filter.fromDate);
      if (filter.toDate) params.append("to", filter.toDate);
      if (filter.sortField) params.append("sortBy", filter.sortField);
      if (filter.sortOrder) params.append("order", filter.sortOrder);

      url += `?${params.toString()}`;
    }
    const response = await apiConfig.get(url);
    return response.data;
  }
);

export const uploadClientImage = createAsyncThunk(
  "vendorClients/uploadClientImage",
  async ({ formData, clientId }, { rejectWithValue }) => {
    try {
      const response = await apiConfigMultipart.post(
        `${apiBaseURL.UPLOAD_CLIENT_IMAGE}/${clientId}`,
        formData
      );
      const path = response?.data?.path;
      return path;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAllVehicleRegistrationNo = createAsyncThunk(
  "vendorClients/fetchAllVehicleRegistrationNo",
  async (isAssign = true) => {
    const response = await apiConfig.get(
      `${apiBaseURL.GET_VEHICLE_REGISTRATION_NO_LIST}?isAssign=${isAssign}`
    );
    return response.data;
  }
);

export const downloadExcelReport = createAsyncThunk(
  "vendorClient/downloadExcelReport",
  async (filter = {}) => {
    let url = apiBaseURL.DOWNLOAD_CLIENT_REPORT;
    if (!_.isEmpty(filter)) {
      const params = new URLSearchParams();
      if (filter.page) params.append("page", filter.page);
      if (filter.size) params.append("pageSize", filter.size);
      if (filter.searchTerm) params.append("search", filter.searchTerm);
      if (filter.status) params.append("status", filter.status.toLowerCase());
      if (filter.fromDate) params.append("from", filter.fromDate);
      if (filter.toDate) params.append("to", filter.toDate);
      if (filter.sortField) params.append("sortBy", filter.sortField);
      if (filter.sortOrder) params.append("order", filter.sortOrder);

      url += `?${params.toString()}`;
    }
    const response = await apiConfig.get(url, { responseType: "blob" });
    return response.data;
  }
);

export const fetchClientEditViewById = createAsyncThunk(
    'vendorClients/fetchClientViewDetails',
    async ( id ) => {
        const response = await apiConfig.get(
          apiBaseURL.CLIENTS_EDIT_VIEW_BY_ID + '/' + id );
        return response.data;
    }
);

export const updateClientDetails = createAsyncThunk(
    'vendorClients/updateClientDetails',
    async (clientsDetails, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_CLIENT_DETAILS, clientsDetails);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to update client data.";
            return rejectWithValue({ message, errors });
        }
    }
);

export const fetchClientDetails = createAsyncThunk(
  "vendorClients/fetchClientDetails",
  async (id) => {
    const response = await apiConfig.get(
      `${apiBaseURL.CLIENT_DETAILS_BY_ID}/${id}`
    );
    return response.data;
  }
);

export const fetchClientImageByPath = createAsyncThunk(
  'vendorClient/fetchClientImageByPath',
  async (path, { rejectWithValue }) => {
      try {
          const response = await apiConfig.get(
              `${apiBaseURL.VIEW_CLIENT_IMAGE_BY_PATH}?path=${path}`
          );
          return response.data;
      } catch (error) {
          return rejectWithValue(error.response?.data || 'Failed to fetch image');
      }
  }
);

export const addClientDetails = createAsyncThunk(
  "vendorClient/addClientDetails",
  async (formInputs, { rejectWithValue }) => {
    try {
      const response = await apiConfig.post(
        apiBaseURL.VENDOR_ALL_CLIENTS,
        formInputs
      );
      return response.data.response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to add vendor details"
      );
    }
  }
)

const clientSlice = createSlice({
  name: "vendorClients",
  initialState: {
    isClientLoading: false,
    isClientDetailLoading: false,
    isDownloadLoading: false,
    allClient: [],
    client: [],
    allVehicleRegistrationNo: [],
    totalRecord: 0,
    totalPages: 0,
    error: null,
    uploadErrorMessage: null,
    responseData: "",
    uploading: false,
    isLoading: false,
    clientDetail: null,
    clientId: null,
    isClientIdLoading: true,
    clientsDetails: null,
    updateClientDetailsLoading: false,
    updateClientDetailsSuccess: null,
    isUserCustomizationSaving: false,
  },
  reducers: {
    setClientId: (state, action) => {
      state.clientId = action.payload;
      state.isClientIdLoading = false;
    },
    setClientIdLoading: (state, action) => {
      state.isClientIdLoading = action.payload;
    },
    resetClientId: (state) => {
      state.clientId = null;
      state.isClientIdLoading = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllClient.pending, (state) => {
        state.isClientLoading = true;
        state.error = "";
      })
      .addCase(fetchAllClient.fulfilled, (state, action) => {
        state.isClientLoading = false;
        state.allClient = action.payload.data;
        state.totalRecord = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllClient.rejected, (state, action) => {
        state.isClientLoading = false;
        state.allClient = [];
        state.totalRecord = 0;
        state.error = action.payload;
      })

      .addCase(uploadClientImage.pending, (state) => {
        state.uploading = true;
        state.uploadErrorMessage = null;
      })
      .addCase(uploadClientImage.fulfilled, (state, action) => {
        state.uploading = false;
        state.responseData = action.payload;
      })
      .addCase(uploadClientImage.rejected, (state, action) => {
        state.uploading = false;
        state.uploadErrorMessage = action.payload?.errors || [];
      })

      .addCase(fetchAllVehicleRegistrationNo.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchAllVehicleRegistrationNo.fulfilled, (state, action) => {
        state.allVehicleRegistrationNo = action.payload;
      })
      .addCase(fetchAllVehicleRegistrationNo.rejected, (state, action) => {
        state.error = action.error.message;
        console.error("Fetch Vehicle RegistrationnNo failes:", action.error);
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

      .addCase(fetchClientDetails.pending, (state) => {
        state.isClientDetailLoading = true;
        state.error = null;
      })
      .addCase(fetchClientDetails.fulfilled, (state, action) => {
        state.isClientDetailLoading = false;
        state.clientDetail = action.payload;
      })
      .addCase(fetchClientDetails.rejected, (state, action) => {
        state.isClientDetailLoading = false;
        state.error = action.error.message;
      })

      .addCase(fetchClientEditViewById.pending, (state) => {
        state.isClientLoading = true;
        state.error = null;
      })
      .addCase(fetchClientEditViewById.fulfilled, (state, action) => {
        state.isClientLoading = false;
        state.clientsDetails = action.payload;
      })
      .addCase(fetchClientEditViewById.rejected, (state, action) => {
        state.isClientLoading = false;
        state.error = action.error.message;
      })

      .addCase(updateClientDetails.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(updateClientDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.client = action.payload;
      })
      .addCase(updateClientDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(addClientDetails.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(addClientDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.client = action.payload;
      })
      .addCase(addClientDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      .addCase(fetchAllClientSilent.fulfilled, (state, action) => {
          state.allClient = action.payload.data;
          state.totalRecord = action.payload.totalItems;
          state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllClientSilent.rejected, (state, action) => {
          state.error = action.payload || action.error.message;
      })
     
  },
});

export const { setClientId, setClientIdLoading, resetClientId } = clientSlice.actions;
export default clientSlice.reducer;
