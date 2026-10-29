import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from "../config/apiConfig";
import { apiBaseURL } from "../constants";

export const fetchPrivilages = createAsyncThunk(
    'permissionJobs/fetchPrivilages',
    async (type) => {
        const response = await apiConfig.get(apiBaseURL.USER_PRIVILAGE);
        return response.data;
    }
);

const permissionSlice = createSlice({
    name: 'permission',
    initialState: {
        // Data
        allPrivilages: [],

        // Loading States
        isLoading: false,

        // Errors
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPrivilages.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPrivilages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allPrivilages = action.payload;
            })
            .addCase(fetchPrivilages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            });
    },
});

export default permissionSlice.reducer;