import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from '../config/apiConfig';
import { apiBaseURL } from '../constants';
import _ from 'lodash';

export const fetchAllRateCards = createAsyncThunk(
    'rateCards/fetchAllRateCards',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_GLOBAL_RATE_CARDS);
        return response.data;
    }
);

export const updateRateCard = createAsyncThunk(
    'rateCards/updateRateCard',
    async (rateCardData, { dispatch, rejectWithValue }) => {
        try {const response = await apiConfig.put(
            apiBaseURL.UPDATE_GLOBAL_RATE_CARD, 
            {
                id: rateCardData.id,
                rateTypeId: rateCardData.rateTypeId,
                additionalCharges: rateCardData.additionalCharges,
                baseRatePerHour: rateCardData.baseRatePerHour,
                discount: rateCardData.discount,
            }
        );
            await dispatch(fetchAllRateCards());
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.errors?.[0] ||
                error.response?.data?.message ||
                "Failed to update rate card.";
            return rejectWithValue(errorMessage);
        }
    }
);

const rateCardSlice = createSlice({
    name: 'rateCards',
    initialState: {
        isRateCardsLoading: false,
        allRateCards: [],
        editRateCard: {},
        totalRecord: 0,
        totalPages: 0,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllRateCards.pending, (state) => {
                state.isRateCardsLoading = true;
                state.error = null;
            })
            .addCase(fetchAllRateCards.fulfilled, (state, action) => {
                state.isRateCardsLoading = false;
                state.allRateCards = action.payload;
                state.totalRecord = action.payload.totalItems;
                state.totalPages = action.payload.totalPages
            })
            .addCase(fetchAllRateCards.rejected, (state, action) => {
                state.isRateCardsLoading = false;
                state.error = action.error.message;
                console.error('Fetch rate cards failed:', action.error);
            })


            .addCase(updateRateCard.pending, (state) => {
                state.error = null;
            })
            .addCase(updateRateCard.fulfilled, (state, action) => {
                state.editRateCard = action.payload;
            })
            .addCase(updateRateCard.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
            });
    },
});

export default rateCardSlice.reducer;
