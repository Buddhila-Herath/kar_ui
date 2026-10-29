import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from '../config/apiConfig';
import { apiBaseURL, toastType, Tokens } from "../constants";
import { addToast } from './toastSlice';

export const fetchAccountDetails = createAsyncThunk(
    'account/fetchAccountDetails',
    async (_, { dispatch }) => {
        const id = localStorage.getItem(Tokens.USER_ID);
        try {
            const response = await apiConfig.get(apiBaseURL.BASIC_BUSINESS_ACCOUNT_DETAILS + '/' + id);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to fetch account details";
            dispatch(addToast({ text: errorMessage, type: toastType.ERROR }));
            throw new Error(errorMessage);
        }
    }
);

const accountSlice = createSlice({
    name: 'account',
    initialState: {
        accountDetails: null,
        isAccountDetailsLoading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAccountDetails.pending, (state) => {
                state.isAccountDetailsLoading = true;
                state.error = null;
            })
            .addCase(fetchAccountDetails.fulfilled, (state, action) => {
                state.isAccountDetailsLoading = false;
                state.accountDetails = action.payload;
            })
            .addCase(fetchAccountDetails.rejected, (state, action) => {
                state.isAccountDetailsLoading = false;
                state.error = action.error.message;
            });
    },
});

export default accountSlice.reducer;
