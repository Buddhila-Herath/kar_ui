import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from '../config/apiConfig';
import apiConfigMultipart from '../config/apiConfigWthFormData';
import { apiBaseURL, toastType, Tokens } from "../constants";
import { addToast } from './toastSlice';
import { isVendorPortal } from '../utils/portalUtils';
import { fetchImageByPath } from './masterDataSlice';

export const fetchMyProfile = createAsyncThunk(
    'profile/fetchMyProfile',
    async (_, { dispatch }) => {
        const id = localStorage.getItem(Tokens.USER_ID);
        try {
            let response;
            if (isVendorPortal()) {
                response = await apiConfig.get(apiBaseURL.VENDOR_PROFILE + '/' + id);
            } else {
                response = await apiConfig.get(apiBaseURL.TECHNICIAN_PROFILE + '/' + id);
            }
            
            localStorage.setItem(Tokens.FIRST_NAME, response.data.firstName);
            localStorage.setItem(Tokens.LAST_NAME, response.data.lastName);
            
            if(response.data.profilePhotoPath) {
                try {
                    const imageResult = await dispatch(fetchImageByPath(response.data.profilePhotoPath));
                    if (imageResult.payload && imageResult.payload.url) {
                        localStorage.setItem(Tokens.IMAGE, imageResult.payload.url);
                    } else {
                        localStorage.setItem(Tokens.IMAGE, '');
                    }
                } catch (error) {
                    console.error('Failed to fetch profile image:', error);
                    localStorage.setItem(Tokens.IMAGE, '');
                }
            } else {
                localStorage.setItem(Tokens.IMAGE, '');
            }
            if (isVendorPortal()) {
                localStorage.setItem(Tokens.VENDOR_ID, response.data.vendorId);
            }
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to fetch profile.";
            dispatch(addToast({ text: errorMessage, type: toastType.ERROR }));
            throw new Error(errorMessage);
        }
    }
);


const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        myProfile: [],
        isProfileLoading: false,
        editProfile: [],
        error: null,
        isResetPasswordLoading: false,
        success: false,
        isTermAccepted: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyProfile.pending, (state) => {
                state.isProfileLoading = true;
                state.error = null;
            })
            .addCase(fetchMyProfile.fulfilled, (state, action) => {
                state.isProfileLoading = false;
                state.myProfile = action.payload;
            })
            .addCase(fetchMyProfile.rejected, (state, action) => {
                state.isProfileLoading = false;
                state.error = action.error.message;
            });
    },
});

export default profileSlice.reducer;
