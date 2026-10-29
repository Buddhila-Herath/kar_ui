import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from "../../config/apiConfig";
import { apiBaseURL ,toastType, Tokens } from "../../constants";
import apiConfigMultipart from '../../config/apiConfigWthFormData';
import _ from 'lodash';
import { saveMileage, saveCurrentWorkImages, saveCompletionWorkImages } from '../vendor/jobSlice';

export const getTotalOpenJobCount = createAsyncThunk(
    'technicianJobs/getTotalOpenJobCount',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.GET_TECHNICIAN_OPEN_JOB_COUNT}?startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch data";
            return rejectWithValue({ message, errors });
        }
    }
);

export const getTotalUnderTakenJobCount = createAsyncThunk(
    'technicianJobs/getTotalUnderTakenJobCount',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.GET_TECHNICIAN_UNDER_TAKEN_JOB_COUNT}?startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch data";
            return rejectWithValue({ message, errors });
        }
    }
);

export const getTotalCompletedJobCount = createAsyncThunk(
    'technicianJobs/getTotalCompletedJobCount',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.GET_TECHNICIAN_COMPLETED_JOB_COUNT}?startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch data";
            return rejectWithValue({ message, errors });
        }
    }
);

export const getAvailableMyJobsCount = createAsyncThunk(
    'technicianJobs/getAvailableMyJobsCount',
    async ({ startDate, endDate, searchTerm, priority } = {}, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (searchTerm) params.append('searchTerm', searchTerm);
            if (priority && priority.length > 0) {
                params.append('priority', priority.join(','));
            }
            
            const url = params.toString() 
                ? `${apiBaseURL.GET_TECHNICIAN_JOB_COUNT}?${params.toString()}`
                : apiBaseURL.GET_TECHNICIAN_JOB_COUNT;
            
            const response = await apiConfig.get(url);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch data";
            return rejectWithValue({ message, errors });
        }
    }
);

export const fetchAllJobs = createAsyncThunk(
    'technicianJobs/fetchAllJobs',
    async ({ type, startDate, endDate, searchTerm, priority }, { rejectWithValue }) => {
        try {
            const id = localStorage.getItem(Tokens.TECHNICIAN_ID);
            const params = new URLSearchParams();
            
            params.append('type', type);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (searchTerm) params.append('searchTerm', searchTerm);
            if (priority && priority.length > 0) {
                params.append('priority', priority.join(','));
            }
            
            const response = await apiConfig.get(
                `${apiBaseURL.GET_TECHNICIAN_JOBS}/${id}?${params.toString()}`
            );
            
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch data";
            return rejectWithValue({ message, errors });
        }
    }    
);

export const fetchJobDetails = createAsyncThunk(
    'technicianJobs/fetchJobDetails',
    async (id) => {
        const response = await apiConfig.get(apiBaseURL.GET_TECHNICIAN_JOB_BY_ID + '/' + id);
        return response;
    }
);

export const updateVehicleArrivalDate = createAsyncThunk(
    'technicianJobs/updateVehicleArrivalDate',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_VEHICLE_ARRIVAL_DATE, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

const jobSlice = createSlice({
    name: 'technicianJobs',
    initialState: {
        // Data
        jobsByType: {
            AVAILABLE: [],
            TASKTOCOMPLETED: [],
            TASKCOMPLETED: []
        },
        jobData: null,
        jobDetails: null,
        jobCounts: {
            open: 0,
            underTaken: 0,
            completed: 0
        },
        myJobCounts: {
            availableJobsCount: 0,
            myJobsCount: 0
        },

        // Loading States
        isLoading: false,
        isUpdateLoading: false,
        isUploading: false,
        isjobDetailsLoading: false,
        isVehicleUpdateLoading: false,

        isCountsLoading: {
            open: false,
            underTaken: false,
            completed: false
        },

        // Errors
        error: null,
        updateError: null,
        uploadErrorMessage: null,
        uploadError: null,
        successMessage: null,
        countsError: null,
        pauseReasonError: null,

        // Other
        totalRecord: 0,
        totalPages: 0,
    },
    reducers: {
        updateLocalArrivalDate: (state, action) => {
            if (state.jobDetails) {
                state.jobDetails.vehicleArrivalDate = action.payload;
            }
        },
         clearVendorJobDetails:(state)=>{
                    state.jobDetails = null;
                    state.error = null;
            },
    },
    extraReducers: (builder) => {
        builder
            
            .addCase(getTotalOpenJobCount.pending, (state) => {
                state.isCountsLoading.open = true;
                state.countsError = null;
            })
            .addCase(getTotalOpenJobCount.fulfilled, (state, action) => {
                state.isCountsLoading.open = false;
                state.jobCounts.open = action.payload.count || 0;
            })
            .addCase(getTotalOpenJobCount.rejected, (state, action) => {
                state.isCountsLoading.open = false;
                state.countsError = action.payload;
            })
            
            .addCase(getTotalUnderTakenJobCount.pending, (state) => {
                state.isCountsLoading.underTaken = true;
                state.countsError = null;
            })
            .addCase(getTotalUnderTakenJobCount.fulfilled, (state, action) => {
                state.isCountsLoading.underTaken = false;
                state.jobCounts.underTaken = action.payload.count || 0;
            })
            .addCase(getTotalUnderTakenJobCount.rejected, (state, action) => {
                state.isCountsLoading.onHold = false;
                state.countsError = action.payload;
            })
            
            .addCase(getTotalCompletedJobCount.pending, (state) => {
                state.isCountsLoading.completed = true;
                state.countsError = null;
            })
            .addCase(getTotalCompletedJobCount.fulfilled, (state, action) => {
                state.isCountsLoading.completed = false;
                state.jobCounts.completed = action.payload.count || 0;
            })
            .addCase(getTotalCompletedJobCount.rejected, (state, action) => {
                state.isCountsLoading.completed = false;
                state.countsError = action.payload;
            })
             .addCase(fetchAllJobs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllJobs.fulfilled, (state, action) => {
                state.isLoading = false;
                const type = action.meta.arg.type;
                state.jobsByType[type] = action.payload;
            })
            .addCase(fetchAllJobs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || action.error.message;
            })

            .addCase(fetchJobDetails.pending, (state) => {
                state.isjobDetailsLoading = true;
            })
            .addCase(fetchJobDetails.fulfilled, (state, action) => {
                state.isjobDetailsLoading = false;
                state.jobDetails = action.payload.data;                
            })
            .addCase(fetchJobDetails.rejected, (state, action) => {
                state.isjobDetailsLoading = false;
                state.error = action.error.message;
            })

            .addCase(getAvailableMyJobsCount.fulfilled, (state, action) => {
                state.myJobCounts = action.payload;
            })


            .addCase(updateVehicleArrivalDate.pending, (state) => {
                state.isVehicleUpdateLoading = true;
            })
            .addCase(updateVehicleArrivalDate.fulfilled, (state, action) => {
                state.isVehicleUpdateLoading = false;
                if (state.jobDetails) {
                    state.jobDetails.vehicleArrivalDate = action.meta.arg.vehicleArrivalDate;
                }
            })
            .addCase(updateVehicleArrivalDate.rejected, (state, action) => {
                state.isVehicleUpdateLoading = false;
                state.error = action.payload;
            })

            // Handle vendor slice actions to sync technician slice jobDetails
            .addCase(saveMileage.fulfilled, (state, action) => {
                if (state.jobDetails) {
                    const formattedMileage = new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(Number(action.meta.arg.mileage));
                    state.jobDetails.mileage = `${formattedMileage} ${action.meta.arg.mileageUnit}`;
                    state.jobDetails.mileageUnit = action.meta.arg.mileageUnit;
                }
            })
            .addCase(saveCurrentWorkImages.fulfilled, (state, action) => {
                if (state.jobDetails && action.meta.arg.imageDtoList) {
                    if (!state.jobDetails.jobCurrentWorkPicturesList) {
                        state.jobDetails.jobCurrentWorkPicturesList = [];
                    }
                    const newImages = action.meta.arg.imageDtoList.map((item, index) => ({
                        path: item.image,
                        order: item.order || index + 1
                    }));
                    state.jobDetails.jobCurrentWorkPicturesList = [
                        ...state.jobDetails.jobCurrentWorkPicturesList,
                        ...newImages
                    ];
                }
            })
            .addCase(saveCompletionWorkImages.fulfilled, (state, action) => {
                if (state.jobDetails && action.meta.arg.imageDtoList) {
                    if (!state.jobDetails.postCompletionPictures) {
                        state.jobDetails.postCompletionPictures = [];
                    }
                    const newImages = action.meta.arg.imageDtoList.map((item, index) => ({
                        path: item.image,
                        order: item.order || index + 1
                    }));
                    state.jobDetails.postCompletionPictures = [
                        ...state.jobDetails.postCompletionPictures,
                        ...newImages
                    ];
                }
            });

    },
});

export const { updateLocalArrivalDate,clearVendorJobDetails } = jobSlice.actions;
export default jobSlice.reducer;