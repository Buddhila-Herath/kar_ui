import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiConfig from "../../config/apiConfig";
import { apiBaseURL } from "../../constants";
import _ from "lodash";

export const fetchJobCompletionRate = createAsyncThunk(
  "vendorDashboardCharts/fetchJobCompletionRate",  async ({scaleVal, rangeName, rangeValue, additionalParams = {}}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('scale', scaleVal);
      params.append(rangeName, rangeValue);
    
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      
      const url = `${apiBaseURL.JOB_COMPLETION_RATE_PIE}?${params.toString()}`;
      
      const response = await apiConfig.get(url);
      return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.errors?.[0] || "An error occurred. Please try again.";
        return rejectWithValue(errorMessage);
      }
  }
);

export const fetchEstimatesCount = createAsyncThunk(
  "vendorDashboardCharts/fetchEstimatesCount",
  async ({scaleVal, rangeName, rangeValue, additionalParams = {}}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('scale', scaleVal);
      params.append(rangeName, rangeValue);
    
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      
      const url = `${apiBaseURL.ESTIMATES_STATUS_CHART}?${params.toString()}`;
      
      const response = await apiConfig.get(url);
      return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.errors?.[0] || "An error occurred. Please try again.";
        return rejectWithValue(errorMessage);
      }
  }
);

export const fetchSalesStats = createAsyncThunk(
  "vendorDashboardCharts/fetchSalesStats",
  async ({scaleVal, rangeName, rangeValue, additionalParams = {}}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('scale', scaleVal);
      params.append(rangeName, rangeValue);
    
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      
      const url = `${apiBaseURL.SALES_OVERVIEW_CHART}?${params.toString()}`;
      
      const response = await apiConfig.get(url);
      return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.errors?.[0] || "An error occurred. Please try again.";
        return rejectWithValue(errorMessage);
      }
  }
);

export const fetchComparisonValues = createAsyncThunk(
  "vendorDashboardCharts/fetchComparisonValues",
  async ({scaleVal, rangeName, rangeValue, additionalParams = {}}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('scale', scaleVal);
      params.append(rangeName, rangeValue);
    
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      
      const url = `${apiBaseURL.COMPARISON_CHART}?${params.toString()}`;
      
      const response = await apiConfig.get(url);
      return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.errors?.[0] || "An error occurred. Please try again.";
        return rejectWithValue(errorMessage);
      }
  }
);



const dashboardChartsSlice = createSlice({
  name: "vendorDashboardCharts",
  initialState: {
    // Data
    completionRateData: null,
    estimatesCountData: null,
    salesData: null,
    comparisonData: null,

    // Loading States
    isLoading: false,

    // Errors
    error: null,
    completionRateError: null,

    // Other
    totalRecord: 0,
    totalPages: 0,
  },
  reducers: {
    clearCompletionRateError: (state) => {
      state.error = null;
      state.completionRateError = null;
    },
    clearEstimatesCountError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobCompletionRate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.completionRateError = null;
      })
      .addCase(fetchJobCompletionRate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.completionRateData = action.payload;
        state.error = null;
        state.completionRateError = null;
      })
      .addCase(fetchJobCompletionRate.rejected, (state, action) => {
        state.isLoading = false;
        state.completionRateData = null;
        state.error = action.payload;
        state.completionRateError = action.payload;
      })

      .addCase(fetchEstimatesCount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEstimatesCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.estimatesCountData = action.payload;
        state.error = null;
      })
      .addCase(fetchEstimatesCount.rejected, (state, action) => {
        state.isLoading = false;
        state.estimatesCountData = null;
        state.error = action.payload;
      })

      .addCase(fetchSalesStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.salesData = action.payload;
        state.error = null;
      })
      .addCase(fetchSalesStats.rejected, (state, action) => {
        state.isLoading = false;
        state.salesData = null;
        state.error = action.payload;
      })

      .addCase(fetchComparisonValues.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComparisonValues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comparisonData = action.payload;
        state.error = null;
      })
      .addCase(fetchComparisonValues.rejected, (state, action) => {
        state.isLoading = false;
        state.comparisonData = null;
        state.error = action.payload;
      });
  },
});

export const { clearCompletionRateError, clearEstimatesCountError } = dashboardChartsSlice.actions;
export default dashboardChartsSlice.reducer;
