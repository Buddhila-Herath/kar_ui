import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiBaseURL, Tokens } from "../../constants";
import apiConfig from "../../config/apiConfig";

export const fetchRecentVendorsData = createAsyncThunk(
  "admin/recent/vendors/list",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiConfig.get(
        `${apiBaseURL?.RECENT_VENDOR_LIST}?page=${params?.page}&size=${params?.size}`
      );
      return response?.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch account details";
      dispatch(addToast({ text: errorMessage, type: toastType.ERROR }));
      return rejectWithValue(error.errorMessage);
    }
  }
);

export const fetchRecentInventoryUpdateData = createAsyncThunk(
  "admin/recent/inventoryUpdates/list",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiConfig.get(
        `${apiBaseURL?.INVENTORY_SERVICE_UPDATE}?page=${params?.page}&pageSize=${params?.size}`
      );
      return response?.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch recent updates details";
      dispatch(addToast({ text: errorMessage, type: toastType.ERROR }));
      return rejectWithValue(error.errorMessage);
    }
  }
);

export const fetchRecentInventoryUpdateSparePartsData = createAsyncThunk(
  "admin/recent/fetchRecentInventoryUpdateSparePartsData/list",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiConfig.get(
        `${apiBaseURL?.INVENTORY_UPDATES_SPARE_PARTS}?page=${params?.page}&pageSize=${params?.size}`
      );
      return response?.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch recent spare part updates details";
      dispatch(addToast({ text: errorMessage, type: toastType.ERROR }));
      return rejectWithValue(error.errorMessage);
    }
  }
);

// Mark Single Notification Read ---
export const fetchMarkSingleNotificationRead = createAsyncThunk(
  "admin/notification/mark/single/read",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiConfig.put(
        `${apiBaseURL?.MARK_SINGLE_NOTIFICATION_READ_STATUS}/${id}`
      );
      return response?.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch account details";
      dispatch(addToast({ text: errorMessage, type: toastType.ERROR }));
      return rejectWithValue(error.errorMessage);
    }
  }
);

// Mark All Read Notification ---
export const fetchMarkAllReadNotification = createAsyncThunk(
  "admin/notification/mark/all/read",
  async (_, { dispatch, rejectWithValue }) => {
    try {

      const userId = localStorage.getItem(Tokens.USER_ID);
      const response = await apiConfig.put(
        `${apiBaseURL?.MARK_ALL_NOTIFICATION_READ_STATUS}/${userId}`
      );
      return response?.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch account details";
      dispatch(addToast({ text: errorMessage, type: toastType.ERROR }));
      return rejectWithValue(error.errorMessage);
    }
  }
);
// ----

// Delete The Notification List --- 
export const fetchDeleteNotificationList = createAsyncThunk(
  "admin/delete/notification/list",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiConfig.put(
        `${apiBaseURL?.DELETE_NOTIFICATION}/${id}`
      );
      return response?.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch account details";
      dispatch(addToast({ text: errorMessage, type: toastType.ERROR }));
      return rejectWithValue(error.errorMessage);
    }
  }
);
// ----

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState: {
    // Get All Notifications Data ---
    allNotifications: [],
    isAllNotificationsLoading: false, // <-- Add this
    //  ------

    recentVendorDetailsData: [],
    isRecentVendorDetailsDataLoading: false,
    error: null,

    recentInventoryUpdateData: [],
    isRecentInventoryUpdateDataLoading: false,

    recentInventoryUpdateSparePartData: [],
    isRecentInventoryUpdateSparePartDataLoading: false,

    // Get The Notification List Count 
    // getNotificationListCount: {
    //   count: 0
    // },
    // isGetNotificationListCountLoading: false,
    // getNotificationListCountError: null,

    // Mark Single Notification Read
    markSingleNotificationRead: null,
    isMarkSingleNotificationReadLoading: false,
    markSingleNotificationReadError: null,
    markSingleNotificationReadSuccess: false,

    // Mark All Read Notification
    markAllReadNotification: null,
    isMarkAllReadNotificationLoading: false,
    markAllReadNotificationError: null,
    markAllReadNotificationSuccess: false,

    // Delete The Notification List
    deleteNotificationList: null,
    isDeleteNotificationListLoading: false,
    deleteNotificationListError: null,
    deleteNotificationSuccess: false,
  },
  reducers: {

    setallNotifications: (state, action) => {
      state.allNotifications = action.payload;
      state.isAllNotificationsLoading = false; // Reset loading state
    },
    setAllNotificationsLoading: (state, action) => {
      state.isAllNotificationsLoading = action.payload;
    },
    // Clear all notifications
    clearNotifications: (state) => {
      state.allNotifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentVendorsData.pending, (state) => {
        state.isRecentVendorDetailsDataLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentVendorsData.fulfilled, (state, action) => {
        state.isRecentVendorDetailsDataLoading = false;
        state.recentVendorDetailsData = action.payload;
      })
      .addCase(fetchRecentVendorsData.rejected, (state, action) => {
        state.isRecentVendorDetailsDataLoading = false;
        state.error = action.error.message;
      })

      .addCase(fetchRecentInventoryUpdateSparePartsData.pending, (state) => {
        state.isRecentInventoryUpdateSparePartDataLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentInventoryUpdateSparePartsData.fulfilled, (state, action) => {
        state.isRecentInventoryUpdateSparePartDataLoading = false;
        state.recentInventoryUpdateSparePartData = action.payload;
      })
      .addCase(fetchRecentInventoryUpdateSparePartsData.rejected, (state, action) => {
        state.isRecentInventoryUpdateSparePartDataLoading = false;
        state.error = action.error.message;
      })

      .addCase(fetchRecentInventoryUpdateData.pending, (state) => {
        state.isRecentInventoryUpdateDataLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentInventoryUpdateData.fulfilled, (state, action) => {
        state.isRecentInventoryUpdateDataLoading = false;
        state.recentInventoryUpdateData = action.payload;
      })
      .addCase(fetchRecentInventoryUpdateData.rejected, (state, action) => {
        state.isRecentInventoryUpdateDataLoading = false;
        state.error = action.error.message;
      })

      // Get The Notification List Count 
      // .addCase(fetchGetNotificationListCount.pending, (state) => {
      //   state.isGetNotificationListCountLoading = true;
      //   state.getNotificationListCountError = null;
      // })
      // .addCase(fetchGetNotificationListCount.fulfilled, (state, action) => {
      //   state.isGetNotificationListCountLoading = false;
      //   state.getNotificationListCount = action.payload;
      //   console.log("Get Notification List Count:", action.payload);
      // })
      // .addCase(fetchGetNotificationListCount.rejected, (state, action) => {
      //   state.isGetNotificationListCountLoading = false;
      //   state.getNotificationListCountError = action.error.message;
      // })

      // Mark Single Notification Read
      .addCase(fetchMarkSingleNotificationRead.pending, (state) => {
        state.isMarkSingleNotificationReadLoading = true;
        state.markSingleNotificationReadSuccess = false;
        state.markSingleNotificationReadError = null;
      })
      .addCase(fetchMarkSingleNotificationRead.fulfilled, (state, action) => {
        state.isMarkSingleNotificationReadLoading = false;
        state.markSingleNotificationReadSuccess = true;
        state.markSingleNotificationRead = action.payload;
      })
      .addCase(fetchMarkSingleNotificationRead.rejected, (state, action) => {
        state.isMarkSingleNotificationReadLoading = false;
        state.markSingleNotificationReadSuccess = false;
        state.markSingleNotificationReadError = action.error.message;
      })
      // ----

      // Mark All Read Notification
      .addCase(fetchMarkAllReadNotification.pending, (state) => {
        state.isMarkAllReadNotificationLoading = true;
        state.markAllReadNotificationSuccess = false;
        state.markAllReadNotificationError = null;
      })
      .addCase(fetchMarkAllReadNotification.fulfilled, (state, action) => {
        state.isMarkAllReadNotificationLoading = false;
        state.markAllReadNotificationSuccess = true;
        state.markAllReadNotification = action.payload;        
      })
      .addCase(fetchMarkAllReadNotification.rejected, (state, action) => {
        state.isMarkAllReadNotificationLoading = false;
        state.markAllReadNotificationSuccess = false;
        state.markAllReadNotificationError = action.error.message;
      })
      // ----

      // Delete The Notification List
      .addCase(fetchDeleteNotificationList.pending, (state) => {
        state.deleteNotificationSuccess = false;
        state.isDeleteNotificationListLoading = true;
        state.deleteNotificationListError = null;
      })
      .addCase(fetchDeleteNotificationList.fulfilled, (state, action) => {
        state.deleteNotificationSuccess = true;
        state.isDeleteNotificationListLoading = false;
        state.deleteNotificationList = action.payload;
      })
      .addCase(fetchDeleteNotificationList.rejected, (state, action) => {
        state.deleteNotificationSuccess = false;
        state.isDeleteNotificationListLoading = false;
        state.deleteNotificationListError = action.error.message;
      });
  },
});

export const { setallNotifications, clearNotifications, setAllNotificationsLoading } = adminDashboardSlice.actions;

export const selectGetNotificationListLoading = (state) => state.adminDashBoardData.isAllNotificationsLoading;
export const selectGetNotificationList = (state) => state.adminDashBoardData.allNotifications;

// Mark Single Notification Read success
export const selectMarkSingleNotificationRead = (state) => state.adminDashBoardData.markSingleNotificationRead;

// Mark All Read Notification success
export const selectMarkAllReadNotification = (state) => state.adminDashBoardData.markAllReadNotification;

// Delete Success
export const selectNotificationDelete = (state) => state.adminDashBoardData.deleteNotificationList;

export default adminDashboardSlice.reducer;
