import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from '../config/apiConfig';
import { apiBaseURL } from '../constants';
import _ from 'lodash';

export const fetchAllInventoryServiceUpdate = createAsyncThunk(
    'inventoryUpdate/fetchAllInventoryServiceUpdate',
   async (filter = {}) => {
          let url = apiBaseURL.INVENTORY_SERVICE_UPDATE;
          if (!_.isEmpty(filter)) {
              const params = new URLSearchParams();

              if (filter.page) params.append("page", filter.page);
              if (filter.pageSize) params.append("pageSize", filter.pageSize);
              if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
              if (filter.modifiedBy) params.append("modifiedBy", filter.modifiedBy);
              if (filter.modifiedDate) params.append("modifiedDate", filter.modifiedDate);
              url += `?${params.toString()}`;
          } else {
              url += `?pageSize=10&page=1`;
          }
          const response = await apiConfig.get(url);
          return response.data;
      }
);

export const fetchAllInventorySparePartsUpdate = createAsyncThunk(
    'inventoryUpdate/fetchAllInventorySparePartsUpdate',
   async (filter = {}) => {
          let url = apiBaseURL.INVENTORY_UPDATES_SPARE_PARTS;
          if (!_.isEmpty(filter)) {
              const params = new URLSearchParams();

              if (filter.page) params.append("page", filter.page);
              if (filter.pageSize) params.append("pageSize", filter.pageSize);
              if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
              if (filter.modifiedBy) params.append("modifiedBy", filter.modifiedBy);
              if (filter.modifiedDate) params.append("modifiedDate", filter.modifiedDate);
              url += `?${params.toString()}`;
          } else {
              url += `?pageSize=10&page=1`;
          }
          const response = await apiConfig.get(url);
          return response.data;
      }
);

export const fetchInventoryUpdateViewById = createAsyncThunk(
    'inventoryUpdate/fetchInventoryUpdateViewDetails',
    async ( id ) => {
        const response = await apiConfig.get(
          apiBaseURL.VIEW_SINGLE_INVENTORY_UPDATE + '/' + id );
        return response.data;
    }
);

export const fetchSparePartInventoryUpdateViewById = createAsyncThunk(
    'inventoryUpdate/fetchSparePartInventoryUpdateViewDetails',
    async ( id ) => {
        const response = await apiConfig.get(
          apiBaseURL.VIEW_SINGLE_SPARE_PART_INVENTORY_UPDATE + '/' + id );
        return response.data;
    }
);

export const fetchInventoryUpdatesCount = createAsyncThunk(
    'inventoryUpdate/fetchInventoryUpdatesCount',
    async () => {
        const response = await apiConfig.get(
          apiBaseURL.INVENTORY_UPDATES_COUNTS);
        return response.data;
    }
);

export const updateInventoryStatus = createAsyncThunk(
    'inventoryUpdate/updateInventoryStatus',
   async (inventoryValue, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConfig.put(`${apiBaseURL.UPDATE_INVENTORY_STATUS}?recentModificationDetailId=${inventoryValue.id}&isApproved=${inventoryValue.status}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to update status");
        }
    }
);

export const updateInventorySparePartStatus = createAsyncThunk(
    'inventoryUpdate/updateInventorySparePartStatus',
   async (inventoryValue, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConfig.put(`${apiBaseURL.UPDATE_INVENTORY_SPARE_PART_STATUS}?recentModificationDetailId=${inventoryValue.id}&isApproved=${inventoryValue.status}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to update status");
        }
    }
);

const inventoryUpdateSlice = createSlice({
    name: 'inventoryUpdate',
    initialState: {
        isLoading: false,
        data: [],
        totalItems: 0,
        totalPages: 0,
        servicesTotalItems: 0,
        sparePartsTotalItems: 0,
        inventoryUpdatesCount: [],
        error: null,
        viewInventoryDataById: null,
        isInventoryByIdViewLoading: false,
        viewSparePartInventoryDataById: null,
        isSparePartInventoryByIdViewLoading: false, 
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllInventoryServiceUpdate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllInventoryServiceUpdate.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.meta?.arg?.forCount) {
                    state.servicesTotalItems = action.payload?.totalItems;
                } else {
                    state.data = action.payload?.data;
                    state.servicesTotalItems = action.payload?.totalItems;
                    state.totalItems = action.payload?.totalItems;
                    state.totalPages = action.payload?.totalPages;
                }
            })
            .addCase(fetchAllInventoryServiceUpdate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error?.message || 'Failed to load data';
            })

            .addCase(fetchAllInventorySparePartsUpdate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllInventorySparePartsUpdate.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.meta?.arg?.forCount) {
                    state.sparePartsTotalItems = action.payload?.totalItems;
                } else {
                    state.data = action.payload?.data;
                    state.sparePartsTotalItems = action.payload?.totalItems;
                    state.totalItems = action.payload?.totalItems;
                    state.totalPages = action.payload?.totalPages;
                }
            })
            .addCase(fetchAllInventorySparePartsUpdate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error?.message || 'Failed to load data';
            })

           .addCase(fetchInventoryUpdateViewById.pending, (state) => {
                state.isInventoryByIdViewLoading = true;
                state.error = null;
                state.viewInventoryDataById = null;
            })
            .addCase(fetchInventoryUpdateViewById.fulfilled, (state, action) => {
                state.isInventoryByIdViewLoading = false;
                state.viewInventoryDataById = action.payload;
            })
            .addCase(fetchInventoryUpdateViewById.rejected, (state, action) => {
                state.isInventoryByIdViewLoading = false;
                state.error = action.error.message;
                state.viewInventoryDataById = null
            })

            .addCase(fetchInventoryUpdatesCount.pending, (state) => {
                 state.error = null;
             })
             .addCase(fetchInventoryUpdatesCount.fulfilled, (state, action) => {
                 state.inventoryUpdatesCount = action.payload;
             })
             .addCase(fetchInventoryUpdatesCount.rejected, (state, action) => {
                 state.error = action.error.message;
             })

            .addCase(updateInventoryStatus.pending, (state) => {
                state.updateStatusLoading = true;
                state.error = null;
                state.updateStatusSuccess = null;
            })
            .addCase(updateInventoryStatus.fulfilled, (state, action) => {
                state.updateStatusLoading = false;
                state.updateStatusSuccess = action.payload.message;
            })
            .addCase(updateInventoryStatus.rejected, (state, action) => {
                state.updateStatusLoading = false;
                state.error = action.payload || "Failed to update job status";
            })

            .addCase(fetchSparePartInventoryUpdateViewById.pending, (state) => {
                state.isSparePartInventoryByIdViewLoading = true;
                state.error = null;
                state.viewSparePartInventoryDataById = null;
            })
            .addCase(fetchSparePartInventoryUpdateViewById.fulfilled, (state, action) => {
                state.isSparePartInventoryByIdViewLoading = false;
                state.viewSparePartInventoryDataById = action.payload;
            })
            .addCase(fetchSparePartInventoryUpdateViewById.rejected, (state, action) => {
                state.isSparePartInventoryByIdViewLoading = false;
                state.error = action.error.message;
                state.viewSparePartInventoryDataById = null
            })

            .addCase(updateInventorySparePartStatus.pending, (state) => {
                state.updateStatusLoading = true;
                state.error = null;
                state.updateStatusSuccess = null;
            })
            .addCase(updateInventorySparePartStatus.fulfilled, (state, action) => {
                state.updateStatusLoading = false;
                state.updateStatusSuccess = action.payload.message;
            })
            .addCase(updateInventorySparePartStatus.rejected, (state, action) => {
                state.updateStatusLoading = false;
                state.error = action.payload || "Failed to update job status";
            })
    },
});

export default inventoryUpdateSlice.reducer;