import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from '../config/apiConfigWithoutToken';
import { apiBaseURL, Tokens } from '../constants';
import _ from 'lodash';
import { checkTermsApproval } from './profileSlice';
import { fetchSystemConfiguration } from './vendor/systemConfigurationSlice';
import { isAdminPortal, isTechnicianPortal, isVendorPortal, getGrantType } from '../utils/portalUtils';

export const userLogin = createAsyncThunk(
    'auth/login',
    async (formInputs, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConfig.post(apiBaseURL.USER_LOGIN, formInputs);
            if(isAdminPortal()) {
                localStorage.setItem(Tokens.ADMIN, response.data.accessToken);
            } else if (isTechnicianPortal()) {
                localStorage.setItem(Tokens.TECHNICIAN, response.data.accessToken);
            } else {
                localStorage.setItem(Tokens.VENDOR, response.data.accessToken);
            }
            localStorage.setItem(Tokens.REFRESH, response.data.refreshToken);
            localStorage.removeItem("jobsActiveTab");

            await dispatch(checkTermsApproval());
            
            if(isVendorPortal()) {
                await dispatch(fetchSystemConfiguration());
            }
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.errors?.[0] ||
                error.response?.data?.message ||
                error.message ||
                "An unknown error occurred. Please try again.";

            return rejectWithValue(errorMessage);
        }
    }
);

export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, { rejectWithValue }) => {
        try {
            const refreshToken = localStorage.getItem(Tokens.REFRESH);
            if (!refreshToken) {
                throw new Error('No refresh token found.');
            }

            const response = await apiConfig.post(apiBaseURL.REFRESH_TOKEN, { refreshToken });
            if(isAdminPortal()) {
                localStorage.setItem(Tokens.ADMIN, response.data.accessToken);
            } else if (isTechnicianPortal()) {
                localStorage.setItem(Tokens.TECHNICIAN, response.data.accessToken);
            } else {
                localStorage.setItem(Tokens.VENDOR, response.data.accessToken);
            }
            localStorage.setItem(Tokens.REFRESH, response.data.refreshToken);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Unable to refresh token. Please log in again."
            );
        }
    }
);

export const userForgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { dispatch, rejectWithValue }) => {
        try {
            const grantType = getGrantType();
            const response = await apiConfig.post(`${apiBaseURL.ADMIN_FORGOT_PASSWORD}/${email}?isAdminRequest=false&grantType=${grantType}`);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.errors?.[0] ||
                error.response?.data?.message ||
                "An error occurred. Please try again.";
            return rejectWithValue(errorMessage);
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (user, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiConfig.put(apiBaseURL.RESET_PASSWORD, user);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data || "Something went wrong. Please try again.";
            return rejectWithValue(errorMessage);
        }
    }
);

export const validateResetToken = createAsyncThunk(
    'auth/validateResetToken',
    async ({ token }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams({ verificationToken: token }).toString();
            const response = await apiConfig.get(`${apiBaseURL.VALIDATE_TOKEN}?${params}`);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Invalid or expired reset token.";
            return rejectWithValue(errorMessage);
        }
    }
);

export const authSlice = createSlice({
    name: 'user',
    initialState: {
        loading: false,
        userToken: null,
        error: null,
        success: false,
        isTokenValid: null,
    },
    reducers: {
      logout: (state, { dispatch }) => {
            localStorage.removeItem(Tokens.ADMIN);
            localStorage.removeItem(Tokens.VENDOR);
            localStorage.removeItem(Tokens.TECHNICIAN);
            localStorage.removeItem(Tokens.ADMIN_ID);
            localStorage.removeItem(Tokens.TECHNICIAN_ID);
            localStorage.removeItem(Tokens.USER_ID);
            localStorage.removeItem(Tokens.USER);
            localStorage.removeItem(Tokens.REFRESH);
            localStorage.removeItem(Tokens.EMAIL);
            localStorage.removeItem(Tokens.IMAGE);
            localStorage.removeItem(Tokens.VENDOR_ID);
            localStorage.removeItem(Tokens.VENDOR_USER_ID);
            localStorage.removeItem(Tokens.FIRST_NAME);
            localStorage.removeItem(Tokens.LAST_NAME);
            localStorage.removeItem(Tokens.GLOBAL_SPARE_PART);
            localStorage.removeItem(Tokens.GLOBAL_SERVICES);
            localStorage.removeItem(Tokens.GLOBAL_RATE_CARD);
            localStorage.removeItem("jobsActiveTab");
            localStorage.removeItem(Tokens.BUSINESS_LOGO);
            localStorage.removeItem(Tokens.BUSINESS_LOGO_PATH);
            localStorage.removeItem(Tokens.IMAGE_PATH);
            state.loading = false
            state.userInfo = null
            state.userToken = null
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(userLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(userLogin.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.userToken = payload.accessToken;
            })
            .addCase(userLogin.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })

            .addCase(refreshToken.fulfilled, (state, { payload }) => {
                state.userToken = payload.accessToken;
            })
            .addCase(refreshToken.rejected, (state) => {
                state.userToken = null;
                state.error = "Session expired. Please log in again.";
            })

            .addCase(userForgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(userForgotPassword.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(userForgotPassword.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })

            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(resetPassword.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })

            .addCase(validateResetToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(validateResetToken.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.isTokenValid = true;
            })
            .addCase(validateResetToken.rejected, (state, { payload }) => {
                state.loading = false;
                state.isTokenValid = false;
                state.error = payload;
            });
    }    
});
export const { logout } = authSlice.actions;
export default authSlice.reducer;
