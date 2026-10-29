import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from '../../config/apiConfig';
import apiConfigMultipart from '../../config/apiConfigWthFormData';
import { apiBaseURL, dateFormat } from '../../constants';
import _ from 'lodash';

export const fetchAllUsers = createAsyncThunk(
    'vendors/fetchAllUsers',
    async (filter = {}) => {
        let url = apiBaseURL.GET_ALL_VENDOR_USERS;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();
            if (filter.page) params.append('pageNumber', filter.page);
            if (filter.size) params.append('pageSize', filter.size);
            if (filter.searchTerm) params.append('searchTerm', filter.searchTerm);
            if (filter.status) params.append('status', filter.status);
            if (filter.fromDate) params.append('startDate', filter.fromDate);
            if (filter.toDate) params.append('endDate', filter.toDate);
            if (filter.sortField) params.append('sortBy', filter.sortField);
            if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);

            url += `?${params.toString()}`;
        }
        const response = await apiConfig.get(url);
        return response.data;
    }
);

export const fetchAllUsersSilent = createAsyncThunk(
    'vendors/fetchAllUsersSilent',
    async (filter = {}) => {
        let url = apiBaseURL.GET_ALL_VENDOR_USERS;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();
            if (filter.page) params.append('pageNumber', filter.page);
            if (filter.size) params.append('pageSize', filter.size);
            if (filter.searchTerm) params.append('searchTerm', filter.searchTerm);
            if (filter.status) params.append('status', filter.status);
            if (filter.fromDate) params.append('startDate', filter.fromDate);
            if (filter.toDate) params.append('endDate', filter.toDate);
            if (filter.sortField) params.append('sortBy', filter.sortField);
            if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);

            url += `?${params.toString()}`;
        }
        const response = await apiConfig.get(url);
        return response.data;
    }
);

export const fetchUserDetails = createAsyncThunk(
    'vendors/fetchUserDetails',
    async ({ id, type }) => {
      const response = await apiConfig.get(`${apiBaseURL.VIEW_USER_DETAILS_BY_ID}/${id}?type=${type}`);
      return response.data;
    }
);

export const updateUserDetails = createAsyncThunk(
    'vendors/updateUserDetails',
    async (vendorDetails, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_USER_DETAILS_BY_ID, vendorDetails);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to update vendor data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const addUserDetails = createAsyncThunk(
    "vendors/addUserDetails",
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.post(apiBaseURL.SAVE_VENDOR_USER, formInputs);
            return response.data.response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to add user details");
        }
    }
);

export const downloadExcelReport = createAsyncThunk(
    'vendors/downloadExcelReport',
    async (filter = {}) => {
        let url = apiBaseURL.DOWNLOAD_VENDOR_USER_EXCEL_REPORT;
        if (!_.isEmpty(filter)) {
            const params = new URLSearchParams();
            if (filter.page) params.append('pageNumber', filter.page);
            if (filter.size) params.append('pageSize', filter.size);
            if (filter.searchTerm) params.append('searchTerm', filter.searchTerm);
            if (filter.status) params.append('status', filter.status);
            if (filter.fromDate) params.append('startDate', filter.fromDate);
            if (filter.toDate) params.append('endDate', filter.toDate);
            if (filter.sortField) params.append('sortBy', filter.sortField);
            if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);

            url += `?${params.toString()}`;
        }
        const response = await apiConfig.get(url, { responseType: 'blob' });
        return response.data;
    }
);

export const uploadImage = createAsyncThunk(
    'vendors/uploadImage',
    async ({ formData, userId, type }, { rejectWithValue }) => {
        try {
            const response = await apiConfigMultipart.post(
                `${apiBaseURL.UPLOAD_VENDOR_USER_FILE}/${type}/${userId}`,
                formData
            );
            const path = response?.data?.path;
            return path;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState: {
        isUsersLoading: false,
        isDownloadLoading: false,
        allUsers: [],
        user: [],
        totalRecord: 0,
        totalPages: 0,
        error: null,
        userId: null,
        userDetails: null,
        isUserIdLoading: false,
        uploading: false,
        isUserDetailsLoading: false,
        updateUserDetailsLoading: false,
        updateUserDetailsSuccess: null
    },
    reducers: {
      setUserId: (state, action) => {
        state.userId = action.payload;
        state.isUserIdLoading = false;
      },
      setUserIdLoading: (state, action) => {
        state.isUserIdLoading = action.payload;
      },
      resetUserId: (state) => {
        state.userId = null;
        state.isUserIdLoading = true;
      },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.isUsersLoading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.isUsersLoading = false;
                state.allUsers = action.payload.data;
                state.totalRecord = action.payload.totalItems;
                state.totalPages = action.payload.totalPages
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.isUsersLoading = false;
                state.allUsers = [];
                state.totalRecord = 0;
                state.error = action.error.message;
            })

            .addCase(fetchUserDetails.pending, (state) => {
                state.isUserDetailsLoading = true;
                state.error = null;
            })
            .addCase(fetchUserDetails.fulfilled, (state, action) => {
                state.isUserDetailsLoading = false;
                state.userDetails = action.payload;
            })
            .addCase(fetchUserDetails.rejected, (state, action) => {
                state.isUserDetailsLoading = false;
                state.error = action.error.message;
            })

            .addCase(addUserDetails.pending, (state) => {
                state.isLoading = true;
                state.error = "";
            })
            .addCase(addUserDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(addUserDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateUserDetails.pending, (state) => {
                state.isLoading = true;
                state.error = "";
            })
            .addCase(updateUserDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(updateUserDetails.rejected, (state, action) => {
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
            
            .addCase(fetchAllUsersSilent.fulfilled, (state, action) => {
                state.allUsers = action.payload.data;
                state.totalRecord = action.payload.totalItems;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchAllUsersSilent.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
            });
    },
});

export const { setUserId, setUserIdLoading, resetUserId } = userSlice.actions;
export default userSlice.reducer;
