import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from '../config/apiConfig';
import { apiBaseURL } from '../constants';
import _ from 'lodash';

export const fetchAllMobileCodes = createAsyncThunk(
    'locations/fetchAllMobileCodes',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_MOBILE_CODES);

        return response.data;
    }
);

const mobileCodesSlice = createSlice({
    name: 'locations',
    initialState: {
        allMobileCodes: [],
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllMobileCodes.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllMobileCodes.fulfilled, (state, action) => {
                state.allMobileCodes = action.payload.data;
            })
            .addCase(fetchAllMobileCodes.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch mobile codes failed:', action.error);
            })
    },
});

export default mobileCodesSlice.reducer;
