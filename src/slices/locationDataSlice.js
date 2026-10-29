import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from '../config/apiConfig';
import { apiBaseURL } from '../constants';
import _ from 'lodash';

export const fetchAllCountries = createAsyncThunk(
    'locations/fetchAllCountries',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_COUNTRIES);

        return response.data;
    }
);

export const fetchAllDistricts = createAsyncThunk(
    'locations/fetchAllDistricts',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_DISTRICT_LIST);

        return response.data;
    }
);

export const fetchAllProvinces = createAsyncThunk(
    'locations/fetchAllProvinces',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_PROVINCE_LIST);

        return response.data;
    }
);

export const fetchAllCities = createAsyncThunk(
    'locations/fetchAllCities',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_CITY_LIST);

        return response.data;
    }
);

export const fetchAllCity = createAsyncThunk(
    'locations/fetchAllCity',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_CITY_LIST);

        return response.data;
    }
);

export const fetchAllCityList = createAsyncThunk(
    'vendorClient/fetchAllCity',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_CITY);

        return response.data;
    }
);

const locationDataSlice = createSlice({
    name: 'locations',
    initialState: {
        allCountries: [],
        allDistricts: [],
        allProvinces: [],
        allCities: [],
        error: null,
        allCityList: [],
        allCity: [],
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllCountries.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllCountries.fulfilled, (state, action) => {
                const payload = action.payload;
                state.allCountries = Array.isArray(payload)
                  ? payload
                  : (payload?.data || []);
            })
            .addCase(fetchAllCountries.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch countries failed:', action.error);
            })

            .addCase(fetchAllDistricts.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllDistricts.fulfilled, (state, action) => {
                state.allDistricts = action.payload;
            })
            .addCase(fetchAllDistricts.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch districts failed:', action.error);
            })

            .addCase(fetchAllProvinces.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllProvinces.fulfilled, (state, action) => {
                state.allProvinces = action.payload;
            })
            .addCase(fetchAllProvinces.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch provinces failed:', action.error);
            })

            .addCase(fetchAllCities.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllCities.fulfilled, (state, action) => {
                state.allCities = action.payload;
            })
            .addCase(fetchAllCities.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch cities failed:', action.error);
            })

            .addCase(fetchAllCity.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllCity.fulfilled, (state, action) => {
                state.allCityList = action.payload;
            })
            .addCase(fetchAllCity.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch City Failes:', action.error);
            })
            
            .addCase(fetchAllCityList.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllCityList.fulfilled, (state, action) => {
                state.allCity = action.payload;
            })
            .addCase(fetchAllCityList.rejected, (state, action) => {
                state.error = action.error.message;
                console.error("Fetch City List Failed:", action.error);
            });
    },
});

export default locationDataSlice.reducer;
