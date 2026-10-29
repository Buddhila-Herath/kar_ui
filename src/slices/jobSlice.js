import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from '../config/apiConfig';
import { apiBaseURL, Tokens } from '../constants';
import { addToast } from './toastSlice';
import {getFormattedMessage} from '../shared/sharedMethod';

export const fetchJobsCount = createAsyncThunk(
    'jobs/fetchJobsCount',
    async () => {
        const response = await apiConfig.get(apiBaseURL.JOB_STATUS_COUNT);
        return response.data;
    }
);

export const fetchAllJobs = createAsyncThunk(
    'jobs/fetchAllJobs',
    async () => {
        const response = await apiConfig.get(apiBaseURL.AVAILABLE_JOBS);
        return response.data;
    }
);

export const fetchMyJobs = createAsyncThunk(
    'jobs/fetchMyJobs',
    async () => {
        const technicianId = localStorage.getItem(Tokens.TECHNICIAN_ID);
        const response = await apiConfig.get(apiBaseURL.MY_JOBS + '?technicianId=' + technicianId);
        return response.data;
    }
);

export const fetchJobDetails = createAsyncThunk(
    'job/fetchJobDetails',
    async (jobId) => {
        const jobResponse = await apiConfig.get(apiBaseURL.JOB_OVERVIEW + '?jobId=' + jobId);
        const jobDetails = jobResponse.data;

        const serviceChecklists = await Promise.all(
            jobDetails.jobServices.map(async (service) => {
                const checklistResponse = await apiConfig.get(apiBaseURL.CHECKLIST_BY_SERVICE + '?serviceId=' + service.serviceId);
                return { serviceId: service.serviceId, checklist: checklistResponse.data };
            })
        );

        return { jobDetails, checklists: serviceChecklists };
    }
);

export const fetchMyJobDetails = createAsyncThunk(
    'job/fetchMyJobDetails',
    async (jobId) => {
        const technicianId = localStorage.getItem(Tokens.TECHNICIAN_ID);
        const jobResponse = await apiConfig.get(apiBaseURL.JOB_OVERVIEW + '?jobId=' + jobId);
        const myJobDetails = jobResponse.data;

        const technicianJob = myJobDetails.technicianJobs.find(
            (job) => job.technicianId === technicianId
        );

        const technicianJobStatus = technicianJob ? technicianJob.jobStatus : null;
        const technicianJobId = technicianJob ? technicianJob.id : null;

        const serviceChecklists = await Promise.all(
            myJobDetails.jobServices.map(async (service) => {
                const checklistResponse = await apiConfig.get(apiBaseURL.CHECKLIST_BY_SERVICE + '?serviceId=' + service.serviceId);
                return { serviceId: service.serviceId, checklist: checklistResponse.data };
            })
        );

        return { myJobDetails, myJobchecklists: serviceChecklists, technicianJobStatus, technicianJobId };
    }
);

export const updateJobStatus = createAsyncThunk(
    'job/updateJobStatus',
    async (jobValue, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.UPDATE_JOB_STATUS, jobValue);
            dispatch(
                addToast({
                    text: getFormattedMessage("job.success.status.message"),
                })
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to update job status");
        }
    }
);

export const claimJob = createAsyncThunk(
    'job/claimJob',
    async (jobId, { dispatch, rejectWithValue }) => {
        const technicianId = localStorage.getItem(Tokens.TECHNICIAN_ID);
        try {
            const response = await apiConfig.post(
                `${apiBaseURL.CLAIM_JOB}?jobId=${jobId}&technicianId=${technicianId}`
            );
            dispatch(
                addToast({
                    text: getFormattedMessage("job.success.claim.message"),
                })
            );
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.errors?.[0] || "An error occurred. Please try again.";
            dispatch(addToast({ text: errorMessage, type: toastType.ERROR }));
            return rejectWithValue(error.errorMessage);
        }
    }
);

const jobSlice = createSlice({
    name: 'jobs',
    initialState: {
        jobsCounts: [],
        allJobs: [],
        myJobs: [],
        jobDetails: null,
        myJobDetails:null,
        checklists: [],
        myJobchecklists: [],
        jobsCountsLoading: false,
        allJobsLoading: false,
        myJobsLoading: false,
        isLoading: false,
        error: null,
        updateStatusLoading: false, 
        updateStatusSuccess: null, 
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchJobsCount.pending, (state) => {
                state.jobsCountsLoading = true;
                state.error = null;
            })
            .addCase(fetchJobsCount.fulfilled, (state, action) => {
                state.jobsCountsLoading = false;
                state.jobsCounts = action.payload;
            })
            .addCase(fetchJobsCount.rejected, (state, action) => {
                state.jobsCountsLoading = false;
                state.error = action.error.message;
            })

            .addCase(fetchAllJobs.pending, (state) => {
                state.allJobsLoading = true;
                state.error = null;
            })
            .addCase(fetchAllJobs.fulfilled, (state, action) => {
                state.allJobsLoading = false;
                state.allJobs = action.payload;
            })
            .addCase(fetchAllJobs.rejected, (state, action) => {
                state.allJobsLoading = false;
                state.error = action.error.message;
            })

            .addCase(fetchMyJobs.pending, (state) => {
                state.myJobsLoading = true;
                state.error = null;
            })
            .addCase(fetchMyJobs.fulfilled, (state, action) => {
                state.myJobsLoading = false;
                state.myJobs = action.payload;
            })
            .addCase(fetchMyJobs.rejected, (state, action) => {
                state.myJobsLoading = false;
                state.error = action.error.message;
            })

            .addCase(fetchJobDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchJobDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.jobDetails = action.payload.jobDetails;
                state.checklists = action.payload.checklists;
            })
            .addCase(fetchJobDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(fetchMyJobDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMyJobDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myJobDetails = action.payload.myJobDetails;
                state.myJobchecklists = action.payload.myJobchecklists;
                state.technicianJobStatus = action.payload.technicianJobStatus;
                state.technicianJobId = action.payload.technicianJobId;
            })
            .addCase(fetchMyJobDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateJobStatus.pending, (state) => {
                state.updateStatusLoading = true;
                state.error = null;
                state.updateStatusSuccess = null;
            })
            .addCase(updateJobStatus.fulfilled, (state, action) => {
                state.updateStatusLoading = false;
                state.updateStatusSuccess = action.payload.message;
            })
            .addCase(updateJobStatus.rejected, (state, action) => {
                state.updateStatusLoading = false;
                state.error = action.payload || "Failed to update job status";
            })

            .addCase(claimJob.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(claimJob.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(claimJob.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export default jobSlice.reducer;
