import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from '../config/apiConfig';
import { apiBaseURL } from '../constants';
import _ from 'lodash';

export const fetchAllSpareParts = createAsyncThunk(
    'spareparts/fetchAllSpareParts',
    async (filter = {}) => {
        let url = apiBaseURL.ALL_SPARE_PARTS
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

const sparePartSlice = createSlice({
    name: 'spareparts',
    initialState: {
        isSparePartsLoading: false,
        allSpareParts: [],
        totalRecord: 0,
        totalPages: 0,
        error: null,
    },
    reducers: {},
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
                state.totalPages = action.payload.totalPages
            })
            .addCase(fetchAllSpareParts.rejected, (state, action) => {
                state.isSparePartsLoading = false;
                state.error = action.error.message;
                console.error('Fetch spare parts failed:', action.error);
            })
    },
});

export default sparePartSlice.reducer;
