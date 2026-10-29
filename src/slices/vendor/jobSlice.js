import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from "../../config/apiConfig";
import { apiBaseURL } from "../../constants";
import apiConfigMultipart from '../../config/apiConfigWthFormData';
import _ from 'lodash';

export const createJob = createAsyncThunk(
    'vendorJobs/createJob',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.post(apiBaseURL.CREATE_JOB, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const fetchAllJobs = createAsyncThunk(
    'vendorJobs/fetchAllJobs',
    async ({type, searchTerm}) => {
        const url = searchTerm 
        ? `${apiBaseURL.GET_JOBS}?jobType=${type}&searchTerm=${encodeURIComponent(searchTerm)}`
        : `${apiBaseURL.GET_JOBS}?jobType=${type}`;
        const response = await apiConfig.get(url);
        return response;
    }
);

export const fetchJobDetails = createAsyncThunk(
    'vendorJobs/fetchJobDetails',
    async (id) => {
        const response = await apiConfig.get(apiBaseURL.VIEW_JOB + '/' + id);
        return response.data;
    }
);
export const fetchJobServiceDetails = createAsyncThunk(
    'vendorJobs/fetchJobServiceDetails',
    async (id) => {
        const response = await apiConfig.get(apiBaseURL.VIEW_JOB + '/' + id+'/service-details');
        return response.data;
    }
);

export const updateJobStatus = createAsyncThunk(
    'vendorJobs/updateJobStatus',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_JOB_STATUS, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const updateUniversalJobStatus = createAsyncThunk(
    'vendorJobs/updateUniversalJobStatus',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_UNIVERSAL_JOB_STATUS, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const updateVehicleArrivalDate = createAsyncThunk(
    'vendorJobs/updateVehicleArrivalDate',
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

export const uploadJobImages = createAsyncThunk(
    'vendorJobs/uploadJobImages',
    async ({ type, formData }, { rejectWithValue }) => {
        try {
            const response = await apiConfigMultipart.post(
                `${apiBaseURL.UPLOAD_JOB_IMAGES}/${type}/J06`, formData,
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to upload images.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const uploadPauseReasonImages = createAsyncThunk(
    'vendorJobs/uploadPauseReasonImages',
    async ({ feedbackType, returnPartType, formData }, { rejectWithValue }) => {
        try {
            const response = await apiConfigMultipart.post(
                `${apiBaseURL.UPLOAD_JOB_IMAGES}/feedBack/J06?feedBackType=${feedbackType}&returnPartType=${returnPartType}`, 
                formData
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const saveCurrentWorkImages = createAsyncThunk(
    'vendorJobs/saveCurrentWorkImages',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.SAVE_CURRENT_WORK_IMAGES, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const saveCompletionWorkImages = createAsyncThunk(
    'vendorJobs/saveCompletionWorkImages',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.SAVE_POST_COMPLETION_IMAGES, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const assignUniversalTechnician = createAsyncThunk(
    'vendorJobs/assignUniversalTechnician',
    async ({ jobId, serviceCategoryId, universalTechnicianId }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(
                `${apiBaseURL.ASSIGN_UNIVERSAL_TECHNICIAN}`,
                {
                    jobId,
                    serviceCategoryId,
                    universalTechnicianId
                }
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to assign technician";
            return rejectWithValue({ message, errors });
        }
    }
);

export const getTechnicianNames = createAsyncThunk(
    'vendorJobs/getTechnicianNames',
    async (serviceCategoryId, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.GET_TECHNICIAN_NAME_LIST}?serviceCategoryId=${serviceCategoryId}`
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch technicians";
            return rejectWithValue({ message, errors });
        }
    }
);

export const getPauseReasonTypes = createAsyncThunk(
    'vendorJobs/getPauseReasonTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(apiBaseURL.SAVE_GET_PAUSE_REASON);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch data";
            return rejectWithValue({ message, errors });
        }
    }
);

export const saveMileage= createAsyncThunk(
    'vendorJobs/SaveMileage',
    async (formInputs, {rejectWithValue})=>{
        try {
            const response=await apiConfig.put(apiBaseURL.ADD_JOB_MILAGE, formInputs);
            return response.data;
        } catch (error) {
            const errors=error.response?.data?.errors || [];
            const message= error.response?.data.message || "Failed to save data";

            return rejectWithValue({message, errors});
        }
    }
);

export const savePauseReasonFeedback = createAsyncThunk(
    'vendorJobs/savePauseReasonFeedback',
    async (formInputs, { rejectWithValue }) => {
        try {
            const response = await apiConfig.post(apiBaseURL.SAVE_GET_PAUSE_REASON, formInputs);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";

            return rejectWithValue({ message, errors });
        }
    }
);

export const getTotalJobCount = createAsyncThunk(
    'vendorJobs/getTotalJobCount',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.GET_TOTAL_JOB_COUNT}?startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch data";
            return rejectWithValue({ message, errors });
        }
    }
);

export const getTotalPendingJobCount = createAsyncThunk(
    'vendorJobs/getTotalPendingJobCount',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.GET_TOTAL_PENDING_JOB_COUNT}?startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch data";
            return rejectWithValue({ message, errors });
        }
    }
);

export const getTotalOnHoldJobCount = createAsyncThunk(
    'vendorJobs/getTotalOnHoldJobCount',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.GET_TOTAL_ON_HOLD_JOB_COUNT}?startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch data";
            return rejectWithValue({ message, errors });
        }
    }
);

export const getTotalInProgressJobCount = createAsyncThunk(
    'vendorJobs/getTotalInProgressJobCount',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.GET_TOTAL_IN_PROGRESS_JOB_COUNT}?startDate=${startDate}&endDate=${endDate}`
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
    'vendorJobs/getTotalCompletedJobCount',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.GET_TOTAL_COMPLETED_JOB_COUNT}?startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch data";
            return rejectWithValue({ message, errors });
        }
    }
);

export const AssignTechnicianToJob = createAsyncThunk(
    'vendorJobs/AssignTechnicianToJob',
    async (requestBody, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.ASSIGN_TECHNICIAN_TO_JOB, (requestBody));
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to save data.";
            return rejectWithValue({ message, errors });
        }
    }
);

export const getJobPauseReason = createAsyncThunk(
    'vendorJobs/getJobPauseReason',
    async (serviceId, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.VIEW_PAUSE_REASON_BY_SERVICE_ID}/${serviceId}`
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch data";
            return rejectWithValue({ message, errors });
        }
    }
);

export const removeNewlyAddedPartService = createAsyncThunk(
    'vendorJobs/removeNewlyAddedPartService',
    async (requestBody, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.REMOVE_NEWLY_ADDED_PARTS_SERVICE, (requestBody));
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to update data.";
            return rejectWithValue({ message, errors });
        }
    }
);

export const removeUpdatedPartService = createAsyncThunk(
    'vendorJobs/removeUpdatedPartService',
    async (requestBody, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.REMOVE_UPDATED_PARTS_SERVICE, (requestBody));
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to update data.";
            return rejectWithValue({ message, errors });
        }
    }
);

export const fetchJobsCount = createAsyncThunk(
    'vendorJobs/fetchJobsCount',
    async (searchTerm = '') => {
        const url = searchTerm 
            ? `${apiBaseURL.JOBS_COUNT}?searchTerm=${encodeURIComponent(searchTerm)}`
            : apiBaseURL.JOBS_COUNT;
        
        const response = await apiConfig.get(url);
        return response.data;
    }
);

export const getTotalIdleTime = createAsyncThunk(
    'vendorJobs/getTotalIdleTime',
    async (jobId, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.GET_TOTAL_IDLE_TIME}?jobId=${jobId}`
            );
            return response.data; 
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to fetch Total Idle Time";
            return rejectWithValue({ message, errors });
        }
    }
);

const jobSlice = createSlice({
    name: 'vendorJobs',
    initialState: {
        // Data
        allJobs: [],
        jobData: null,
        jobDetails: null,
        jobServiceDetails: null,
        technicanNames: null,
        jobTechnicianListAdd: null,
        pauseReason: null,
        totalIdleTime:null,
        jobsCount: 0,
        jobCounts: {
            total: 0,
            pending: 0,
            onHold: 0,
            inProgress: 0,
            completed: 0
        },

        // Loading States
        isLoading: false,
        isServiceDetailsLoading: false,
        isUpdateLoading: false,
        isUploading: false,
        isTechnicianNamesLoading: false,
        isSaveJobTechnicianListAddLoading: false,
        isPauseReasonLoading: false,
        isVehicleUpdateLoading: false,
        isJobsCountLoading: false,
        isTotalIdleTimeLoading:false,

        isCountsLoading: {
            total: false,
            pending: false,
            onHold: false,
            inProgress: false,
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
        totalIdleTimeError: null,
        // Other
        totalRecord: 0,
        totalPages: 0,
        totalServiceCost: null,
    },
    reducers: {
        updateLocalArrivalDate: (state, action) => {
            if (state.jobDetails) {
                state.jobDetails.vehicleArrivalDate = action.payload;
            }
        },
        clearJobDetails:(state)=>{
            state.jobDetails = null;
            state.jobServiceDetails = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllJobs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllJobs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allJobs = action.payload;
            })
            .addCase(fetchAllJobs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(createJob.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createJob.fulfilled, (state, action) => {
                state.isLoading = false;
                state.jobData = action.payload;
            })
            .addCase(createJob.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(fetchJobDetails.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchJobDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.jobDetails = action.payload;                
            })
            .addCase(fetchJobDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(fetchJobServiceDetails.pending, (state) => {
                state.isServiceDetailsLoading = true;
            })
            .addCase(fetchJobServiceDetails.fulfilled, (state, action) => {
                state.isServiceDetailsLoading = false;
                state.jobServiceDetails = action.payload;                
            })
            .addCase(fetchJobServiceDetails.rejected, (state, action) => {
                state.isServiceDetailsLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateJobStatus.pending, (state) => {
                state.isUpdateLoading = true;
            })
            .addCase(updateJobStatus.fulfilled, (state, action) => {
                state.isUpdateLoading = false;
            })
            .addCase(updateJobStatus.rejected, (state, action) => {
                state.isUpdateLoading = false;
                state.error = action.payload;
            })

            .addCase(updateUniversalJobStatus.pending, (state) => {
                state.isUpdateLoading = true;
            })
            .addCase(updateUniversalJobStatus.fulfilled, (state, action) => {
                state.isUpdateLoading = false;
            })
            .addCase(updateUniversalJobStatus.rejected, (state, action) => {
                state.isUpdateLoading = false;
                state.error = action.payload;
            })

            .addCase(assignUniversalTechnician.pending, (state) => {
                state.isUpdateLoading = true;
            })
            .addCase(assignUniversalTechnician.fulfilled, (state, action) => {
                state.isUpdateLoading = false;
            })
            .addCase(assignUniversalTechnician.rejected, (state, action) => {
                state.isUpdateLoading = false;
                state.error = action.payload;
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

            .addCase(uploadJobImages.pending, (state) => {
                state.isUploading = true;
                state.uploadError = null;
            })
            .addCase(uploadJobImages.fulfilled, (state, action) => {
                state.isUploading = false;
            })
            .addCase(uploadJobImages.rejected, (state, action) => {
                state.isUploading = false;
                state.uploadError = action.payload;
            })

            .addCase(uploadPauseReasonImages.pending, (state) => {
                state.isUploading = true;
                state.uploadError = null;
            })
            .addCase(uploadPauseReasonImages.fulfilled, (state, action) => {
                state.isUploading = false;
            })
            .addCase(uploadPauseReasonImages.rejected, (state, action) => {
                state.isUploading = false;
                state.uploadError = action.payload;
            })

            .addCase(saveCurrentWorkImages.pending, (state) => {
                state.isUploading = true;
            })
            .addCase(saveCurrentWorkImages.fulfilled, (state, action) => {
                state.isUploading = false;
                if (state.jobDetails && action.meta.arg.imageDtoList) {
                    // Update jobCurrentWorkPicturesList with new images
                    if (!state.jobDetails.jobCurrentWorkPicturesList) {
                        state.jobDetails.jobCurrentWorkPicturesList = [];
                    }
                    // Convert imageDtoList to the format expected (with path and order)
                    const newImages = action.meta.arg.imageDtoList.map((item, index) => ({
                        path: item.image,
                        order: item.order || index + 1
                    }));
                    // Append new images to existing list
                    state.jobDetails.jobCurrentWorkPicturesList = [
                        ...state.jobDetails.jobCurrentWorkPicturesList,
                        ...newImages
                    ];
                }
            })
            .addCase(saveCurrentWorkImages.rejected, (state) => {
                state.isUploading = false;
            })

            .addCase(saveCompletionWorkImages.pending, (state) => {
                state.isUploading = true;
            })
            .addCase(saveCompletionWorkImages.fulfilled, (state, action) => {
                state.isUploading = false;
                if (state.jobDetails && action.meta.arg.imageDtoList) {
                    // Update postCompletionPictures with new images
                    if (!state.jobDetails.postCompletionPictures) {
                        state.jobDetails.postCompletionPictures = [];
                    }
                    // Convert imageDtoList to the format expected (with path and order)
                    const newImages = action.meta.arg.imageDtoList.map((item, index) => ({
                        path: item.image,
                        order: item.order || index + 1
                    }));
                    // Append new images to existing list
                    state.jobDetails.postCompletionPictures = [
                        ...state.jobDetails.postCompletionPictures,
                        ...newImages
                    ];
                }
            })
            .addCase(saveCompletionWorkImages.rejected, (state) => {
                state.isUploading = false;
            })

            .addCase(getTechnicianNames.pending, (state) => {
                state.isTechnicianNamesLoading = true;
            })
            .addCase(getTechnicianNames.fulfilled, (state, action) => {
                state.isTechnicianNamesLoading = false;
                state.technicanNames = action.payload.data;
            })
            .addCase(getTechnicianNames.rejected, (state) => {
                state.isTechnicianNamesLoading = false;
            })

            .addCase(savePauseReasonFeedback.pending, (state) => {
                state.isUploading = true;
                state.uploadError = null;
            })
            .addCase(savePauseReasonFeedback.fulfilled, (state, action) => {
                state.isUploading = false;
            })
            .addCase(savePauseReasonFeedback.rejected, (state, action) => {
                state.isUploading = false;
                state.uploadError = action.payload;
            })

            .addCase(getTotalJobCount.pending, (state) => {
                state.isCountsLoading.total = true;
                state.countsError = null;
            })
            .addCase(getTotalJobCount.fulfilled, (state, action) => {
                state.isCountsLoading.total = false;
                state.jobCounts.total = action.payload.totalJobsCount || 0;
            })
            .addCase(getTotalJobCount.rejected, (state, action) => {
                state.isCountsLoading.total = false;
                state.countsError = action.payload;
            })
            
            .addCase(getTotalPendingJobCount.pending, (state) => {
                state.isCountsLoading.pending = true;
                state.countsError = null;
            })
            .addCase(getTotalPendingJobCount.fulfilled, (state, action) => {
                state.isCountsLoading.pending = false;
                state.jobCounts.pending = action.payload.pendingJobsCount || 0;
            })
            .addCase(getTotalPendingJobCount.rejected, (state, action) => {
                state.isCountsLoading.pending = false;
                state.countsError = action.payload;
            })
            
            .addCase(getTotalOnHoldJobCount.pending, (state) => {
                state.isCountsLoading.onHold = true;
                state.countsError = null;
            })
            .addCase(getTotalOnHoldJobCount.fulfilled, (state, action) => {
                state.isCountsLoading.onHold = false;
                state.jobCounts.onHold = action.payload.onHoldJobsCount || 0;
            })
            .addCase(getTotalOnHoldJobCount.rejected, (state, action) => {
                state.isCountsLoading.onHold = false;
                state.countsError = action.payload;
            })
            
            .addCase(getTotalInProgressJobCount.pending, (state) => {
                state.isCountsLoading.inProgress = true;
                state.countsError = null;
            })
            .addCase(getTotalInProgressJobCount.fulfilled, (state, action) => {
                state.isCountsLoading.inProgress = false;
                state.jobCounts.inProgress = action.payload.inProgressJobsCount || 0;
            })
            .addCase(getTotalInProgressJobCount.rejected, (state, action) => {
                state.isCountsLoading.inProgress = false;
                state.countsError = action.payload;
            })

            .addCase(getTotalCompletedJobCount.pending, (state) => {
                state.isCountsLoading.completed = true;
                state.countsError = null;
            })
            .addCase(getTotalCompletedJobCount.fulfilled, (state, action) => {
                state.isCountsLoading.completed = false;
                state.jobCounts.completed = action.payload.completedJobsCount || 0;
            })
            .addCase(getTotalCompletedJobCount.rejected, (state, action) => {
                state.isCountsLoading.completed = false;
                state.countsError = action.payload;
            })

            .addCase(AssignTechnicianToJob.pending, (state) => {
                state.isSaveJobTechnicianListAddLoading = true;
            })
            .addCase(AssignTechnicianToJob.fulfilled, (state, action) => {
                state.isSaveJobTechnicianListAddLoading = false;
                state.jobTechnicianListAdd = action.payload;
            })
            .addCase(AssignTechnicianToJob.rejected, (state) => {
                state.isSaveJobTechnicianListAddLoading = false;
            })

            .addCase(getJobPauseReason.pending, (state) => {
                state.isPauseReasonLoading = true;
            })
            .addCase(getJobPauseReason.fulfilled, (state, action) => {
                state.isPauseReasonLoading = false;
                state.pauseReason = action.payload;
            })
            .addCase(getJobPauseReason.rejected, (state, action) => {
                state.isPauseReasonLoading = false;
                state.pauseReasonError = action.payload;
            })

            .addCase(fetchJobsCount.pending, (state) => {
                state.isJobsCountLoading = true;
            })
            .addCase(fetchJobsCount.fulfilled, (state, action) => {
                state.isJobsCountLoading = false;
                state.jobsCount = action.payload.count;
            })
            .addCase(fetchJobsCount.rejected, (state, action) => {
                state.isJobsCountLoading = false;
                state.error = action.payload;
            })

            .addCase(getTotalIdleTime.pending, (state) => {
                state.isTotalIdleTimeLoading = true;
            })
            .addCase(getTotalIdleTime.fulfilled, (state, action) => {
                state.isTotalIdleTimeLoading = false;
                state.totalIdleTime = action.payload;
            })
            .addCase(getTotalIdleTime.rejected, (state, action) => {
                state.isTotalIdleTimeLoading = false;
                state.totalIdleTimeError = action.payload;
            })

            .addCase(saveMileage.pending, (state) => {
                state.isUpdateLoading = true;
            })
            .addCase(saveMileage.fulfilled, (state, action) => {
                const formattedMileage = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
                }).format(Number(action.meta.arg.mileage));
                state.isUpdateLoading = false;
                if (state.jobDetails) {
                    state.jobDetails.mileage = `${formattedMileage} ${action.meta.arg.mileageUnit}`;
                }
            })
            .addCase(saveMileage.rejected, (state, action) => {
                state.isUpdateLoading = false;
                state.error = action.payload;
            });
    },
});

export const { updateLocalArrivalDate,clearJobDetails } = jobSlice.actions;
export const selectSaveAddJobTechnicians = (state) => state.vendorJobs.jobTechnicianListAdd;

export default jobSlice.reducer;