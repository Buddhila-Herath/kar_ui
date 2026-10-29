import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from '../../config/apiConfig';
import { apiBaseURL, Tokens } from "../../constants";

export const fetchSystemConfiguration = createAsyncThunk(
    'systemConfiguration/fetchSystemConfiguration',
    async () => {
        try {
            const response = await apiConfig.get(apiBaseURL.GET_SYSTEM_CONFIGURATION);
            localStorage.setItem(Tokens.GLOBAL_SPARE_PART, response.data.partsIsEnabled ?? false);
            localStorage.setItem(Tokens.GLOBAL_SERVICES, response.data.serviceIsEnabled ?? false);
            localStorage.setItem(Tokens.GLOBAL_RATE_CARD, response.data.rateCardIsEnabled ?? false);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to data";
            throw new Error(errorMessage);
        }
    }
);

export const updateSystemConfiguration = createAsyncThunk(
    'systemConfiguration/updateSystemConfiguration',
    async (config, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams({
                rateCardEnable: config.rateCardEnable,
                sparePartsEnable: config.sparePartsEnable,
                serviceEnable: config.serviceEnable,
            }).toString();

            const response = await apiConfig.put(`${apiBaseURL.UPDATE_SYSTEM_CONFIGURATION}?${queryParams}`);
            localStorage.setItem(Tokens.GLOBAL_SPARE_PART, response.data.partsIsEnabled ?? false);
            localStorage.setItem(Tokens.GLOBAL_SERVICES, response.data.serviceIsEnabled ?? false);
            localStorage.setItem(Tokens.GLOBAL_RATE_CARD, response.data.rateCardIsEnabled ?? false);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.errors?.[0] ||
                error.response?.data?.message ||
                "An error occurred while updating the configuration.";
            return rejectWithValue(errorMessage);
        }
    }
);

export const fetchAllGlobalRateCards = createAsyncThunk(
    'systemConfiguration/fetchAllGlobalRateCards',
    async () => {
        try {
            const response = await apiConfig.get(apiBaseURL.GET_ALL_GLOBAL_RATE_CARDS);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to data";
            throw new Error(errorMessage);
        }
    }
);

export const updateRateCard = createAsyncThunk(
    'systemConfiguration/updateRateCard',
    async (rateCardData, { dispatch, rejectWithValue }) => {
        try {const response = await apiConfig.post(
            apiBaseURL.UPDATE_RATE_CARD_VENDOR, 
            {
                id: rateCardData.id,
                rateTypeId: rateCardData.rateTypeId,
                additionalCharges: rateCardData.additionalCharges,
                baseRatePerHour: rateCardData.baseRatePerHour,
                discount: rateCardData.discount,
            }
        );
            await dispatch(fetchAllGlobalRateCards());
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

const systemConfigurationSlice = createSlice({
    name: 'systemConfiguration',
    initialState: {
        systemConfig: null,
        globalRateCards: [],
        editRateCard: {},
        isLoading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSystemConfiguration.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSystemConfiguration.fulfilled, (state, action) => {
                state.isLoading = false;
                state.systemConfig = action.payload;
            })
            .addCase(fetchSystemConfiguration.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateSystemConfiguration.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateSystemConfiguration.fulfilled, (state, action) => {
                state.isLoading = false;
                state.systemConfig = { ...state.systemConfig, ...action.payload };
            })
            .addCase(updateSystemConfiguration.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(fetchAllGlobalRateCards.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllGlobalRateCards.fulfilled, (state, action) => {
                state.isLoading = false;
                state.globalRateCards = action.payload;
            })
            .addCase(fetchAllGlobalRateCards.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
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

export default systemConfigurationSlice.reducer;
