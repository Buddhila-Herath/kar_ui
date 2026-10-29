import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from '../config/apiConfig';
import { apiBaseURL } from '../constants';
import _ from 'lodash';

export const fetchAllServices = createAsyncThunk(
    'services/fetchAllServices',
    async (filter = {}) => {
        let url = apiBaseURL.ALL_SERVICES
        if (
            !_.isEmpty(filter) &&
            (filter.page ||
                filter.pageSize ||
                filter.search ||
                filter.created_at)
        ) {
            url += requestParam(filter, null, null, null, url);
        }
        const response = await apiConfig.get(url);
        return response.data;
    }
);

const serviceSlice = createSlice({
    name: 'services',
    initialState: {
        isServicesLoading: false,
        allServices: [],
        totalRecord: 0,
        totalPages: 0,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllServices.pending, (state) => {
                state.isServicesLoading = true;
                state.error = null;
            })
            .addCase(fetchAllServices.fulfilled, (state, action) => {
                state.isServicesLoading = false;
                state.allServices = action.payload.data;
                state.totalRecord = action.payload.totalItems;
                state.totalPages = action.payload.totalPages
            })
            .addCase(fetchAllServices.rejected, (state, action) => {
                state.isServicesLoading = false;
                state.error = action.error.message;
                console.error('Fetch services failed:', action.error);
            })
    },
});

export default serviceSlice.reducer;
