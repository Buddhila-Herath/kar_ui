import { createSlice, createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import apiConfig from "../../config/apiConfig"
import { apiBaseURL } from "../../constants";
import { Tokens } from "../../constants";
import { fetchImageByPath } from "../masterDataSlice";
import { logout } from "../authSlice";

export const fetchVendorRecentActivities = createAsyncThunk(
  "vendorRecentActivities/fetchVendorRecentActivities",
  async (_, { rejectWithValue, dispatch }) => {
    const id = localStorage.getItem(Tokens.VENDOR_USER_ID);
    try {
      const response = await apiConfig.get(
        `${apiBaseURL.RECENT_VENDOR_ACTIVITIES}?vendorId=${id}`
      );
      const data = response.data || {};

      // Preserve groups (Today/Yesterday/Earlier) and enrich each item with profilePhoto
      const groupNames = Object.keys(data);
      const groupedActivitiesEntries = await Promise.all(
        groupNames.map(async (groupName) => {
          const items = Array.isArray(data[groupName]) ? data[groupName] : [];
          const itemsWithImages = await Promise.all(
            items.map(async (activity) => {
              if (activity.profilePath) {
                const imgRes = await dispatch(fetchImageByPath(activity.profilePath));
                if (imgRes.payload) {
                  return {
                    ...activity,
                    profilePhoto: imgRes.payload.url,
                  };
                }
              }
              return { ...activity, profilePhoto: null };
            })
          );
          return [groupName, itemsWithImages];
        })
      );

      const groupedActivities = Object.fromEntries(groupedActivitiesEntries);
      return groupedActivities;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch recent activities";
      return rejectWithValue(errorMessage);
    }
  }
);

const recentActivitiesSlice = createSlice({
  name: "vendorRecentActivities",
  initialState: {
    activities: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearRecentActivities: (state) => {
      state.activities = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorRecentActivities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVendorRecentActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities = action.payload; // { Today: [...], Yesterday: [...], Earlier: [...] }
      })
      .addCase(fetchVendorRecentActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      // Reset recent activities on logout
      .addCase(logout, (state) => {
        state.activities = [];
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { clearRecentActivities } = recentActivitiesSlice.actions;
export default recentActivitiesSlice.reducer;