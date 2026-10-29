import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiConfig from "../config/apiConfig";
import apiConfigMultipart from "../config/apiConfigWthFormData";
import { apiBaseURL, toastType, Tokens } from "../constants";
import { addToast } from "./toastSlice";
import {
  isVendorPortal,
  isTechnicianPortal,
  isAdminPortal,
} from "../utils/portalUtils";
import { fetchImageByPath } from "./masterDataSlice";

export const fetchMyProfile = createAsyncThunk(
  "profile/fetchMyProfile",
  async (_, { dispatch }) => {
    const id = localStorage.getItem(Tokens.USER_ID);
    try {
      let response;
      /*if (isVendorPortal()) {
        response = await apiConfig.get(apiBaseURL.VENDOR_PROFILE + "/" + id);
      }*/

      // Schedules silent refresh of the signed image URL using the stored path
      const scheduleProfileImageRefresh = (path) => {
        if (!path) return;
        // Refresh slightly before typical 5-min expiry (e.g., at 4 minutes)
        setTimeout(async () => {
          try {
            const imageRes = await dispatch(fetchImageByPath(path));
            const freshUrl = imageRes?.payload?.url;
            if (freshUrl) {
              localStorage.setItem(Tokens.IMAGE, freshUrl);
              try { localStorage.setItem(Tokens.IMAGE_PATH, path); } catch (_) {}
            }
          } catch (_) {
            // ignore; next fetchMyProfile will repair
          }
          // Chain next refresh
          scheduleProfileImageRefresh(path);
        }, 4 * 60 * 1000);
      };
      const scheduleBusinessLogoImageRefresh = (path) => {
        if (!path) return;
        // Refresh slightly before typical 5-min expiry (e.g., at 4 minutes)
        setTimeout(async () => {
          try {
            const imageRes = await dispatch(fetchImageByPath(path));
            const freshUrl = imageRes?.payload?.url;
            if (freshUrl) {
              localStorage.setItem(Tokens.BUSINESS_LOGO, freshUrl);
              try { localStorage.setItem(Tokens.BUSINESS_LOGO_PATH, path); } catch (_) {}
            }
          } catch (_) {
            // ignore; next fetchMyProfile will repair
          }
          // Chain next refresh
          scheduleBusinessLogoImageRefresh(path);
        }, 4 * 60 * 1000);
      };

      if (isAdminPortal()) {
        response = await apiConfig.get(apiBaseURL.ADMIN_PROFILE);
        if (response.data.profilePhotoPath) {
          const imageResult = await dispatch(
            fetchImageByPath(response.data.profilePhotoPath)
          );
          if (imageResult.payload) {
            localStorage.setItem(Tokens.IMAGE, imageResult.payload.url);
            try { localStorage.setItem(Tokens.IMAGE_PATH, response.data.profilePhotoPath); } catch (_) {}
            scheduleProfileImageRefresh(response.data.profilePhotoPath);
          } else {
            localStorage.setItem(Tokens.IMAGE, "");
          }
        } else {
          localStorage.setItem(Tokens.IMAGE, "");
        }
      } else if (isVendorPortal()) {
        response = await apiConfig.get(apiBaseURL.VENDOR_PROFILE + '/' + id);
        if(response.data.profilePhotoPath) {
          try {
            const imageResult = await dispatch(fetchImageByPath(response.data.profilePhotoPath));
            if (imageResult.payload && imageResult.payload.url) {
              localStorage.setItem(Tokens.IMAGE, imageResult.payload.url);
              try { localStorage.setItem(Tokens.IMAGE_PATH, response.data.profilePhotoPath); } catch (_) {}
              scheduleProfileImageRefresh(response.data.profilePhotoPath);
            } else {
              localStorage.setItem(Tokens.IMAGE, '');
            }
          } catch (error) {
            console.error('Failed to fetch vendor profile image:', error);
            localStorage.setItem(Tokens.IMAGE, '');
          }
        } else {
            localStorage.setItem(Tokens.IMAGE, '');
        }
        if(response.data.businessLogo) {
          try {
            const imageResult = await dispatch(fetchImageByPath(response.data.businessLogo));
            if (imageResult.payload && imageResult.payload.url) {
              localStorage.setItem(Tokens.BUSINESS_LOGO, imageResult.payload.url);
              try { localStorage.setItem(Tokens.BUSINESS_LOGO_PATH, response.data.businessLogo); } catch (_) {}
              scheduleBusinessLogoImageRefresh(response.data.businessLogo);
            } else {
              localStorage.setItem(Tokens.BUSINESS_LOGO, '');
            }
          } catch (error) {
            console.error('Failed to fetch vendor business logo:', error);
            localStorage.setItem(Tokens.BUSINESS_LOGO, '');
          }
        } else {
            localStorage.setItem(Tokens.BUSINESS_LOGO, '');
        }
      } else {
        response = await apiConfig.get(apiBaseURL.TECHNICIAN_PROFILE + "/" + id);
        if (response.data.profilePhotoPath) {
          try {
            const imageResult = await dispatch(fetchImageByPath(response.data.profilePhotoPath));
            if (imageResult.payload && imageResult.payload.url) {
              localStorage.setItem(Tokens.IMAGE, imageResult.payload.url);
              try { localStorage.setItem(Tokens.IMAGE_PATH, response.data.profilePhotoPath); } catch (_) {}
              scheduleProfileImageRefresh(response.data.profilePhotoPath);
            } else {
              localStorage.setItem(Tokens.IMAGE, "");
            }
          } catch (error) {
            console.error('Failed to fetch technician profile image:', error);
            localStorage.setItem(Tokens.IMAGE, "");
          }
        } else {
          localStorage.setItem(Tokens.IMAGE, "");
        }
      }

      localStorage.setItem(Tokens.FIRST_NAME, response.data.firstName);
      localStorage.setItem(Tokens.LAST_NAME, response.data.lastName);
      if (isVendorPortal()) {
        localStorage.setItem(Tokens.VENDOR_ID, response.data.vendorId);
        localStorage.setItem(Tokens.VENDOR_USER_ID, response.data.id);
      }
      if (isAdminPortal()) {
        localStorage.setItem(Tokens.ADMIN_ID, response.data.id);
      }
      if (isTechnicianPortal()) {
        localStorage.setItem(Tokens.TECHNICIAN_ID, response.data.id);
      }
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch profile.";
      dispatch(addToast({ text: errorMessage, type: toastType.ERROR }));
      throw new Error(errorMessage);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (profile, { dispatch, rejectWithValue }) => {
    try {
      let response;
      if (isVendorPortal()) {
        response = await apiConfig.put(apiBaseURL.UPDATE_PROFILE, profile);
      } else if (isAdminPortal()) {
        response = await apiConfig.put(
          apiBaseURL.UPDATE_ADMIN_PROFILE,
          profile
        );
      } else {
        response = await apiConfig.put(
          apiBaseURL.UPDATE_TECHNICAN_PROFILE,
          profile
        );
      }
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        "Failed to update profile.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  "profile/uploadProfilePicture",
  async (formData, { rejectWithValue }) => {
    try {
      const isVendor = isVendorPortal();
      const isTechnician = isTechnicianPortal();

      const vendorId = localStorage.getItem(Tokens.VENDOR_ID);
      const adminId = localStorage.getItem(Tokens.ADMIN_ID);
      const technicianId = "T34201"; // TODO: Replace with actual ID when available

      // Upload profile picture
      let uploadEndpoint;
      if (isVendor) {
        uploadEndpoint = `${apiBaseURL.UPLOAD_PROFILE_PICTURE}/${vendorId}`;
      } else if (isTechnician) {
        uploadEndpoint = `${apiBaseURL.UPLOAD_TECHINCIAN_PROFILE_PICTURE}/${technicianId}`;
      } else {
        uploadEndpoint = `${apiBaseURL.UPLOAD_ADMIN_PROFILE_PICTURE}/${adminId}`;
      }

      const uploadResponse = await apiConfigMultipart.post(
        uploadEndpoint,
        formData
      );

      const folderPath =
        uploadResponse.data.folderPaths?.[0]?.path ??
        uploadResponse.data.path ??
        null;

      if (!folderPath) {
        throw new Error("Failed to upload profile picture: No path returned");
      }

      // Update profile picture path
      let updatePathEndpoint;
      if (isVendor) {
        updatePathEndpoint = `${apiBaseURL.UPDATE_PROFILE_PICTURE_PATH}?path=${folderPath}`;
      } else if (isTechnician) {
        updatePathEndpoint = `${apiBaseURL.UPDATE_TECHNICAN_PROFILE_PICTURE_PATH}?path=${folderPath}`;
      } else {
        updatePathEndpoint = `${apiBaseURL.UPDATE_ADMIN_PROFILE_PICTURE_PATH}?path=${folderPath}`;
      }

      const updatePathResponse = await apiConfig.put(updatePathEndpoint);

      return updatePathResponse.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.errors?.[0] ??
        error.response?.data?.message ??
        error.message ??
        "Failed to upload profile picture.";

      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteProfilePicture = createAsyncThunk(
  "profile/deleteProfilePicture",
  async (_, { rejectWithValue }) => {
    try {
      let response;
      if (isVendorPortal()) {
        response = await apiConfig.put(apiBaseURL.DELETE_PROFILE_PICTURE);
      } else if (isAdminPortal()) {
        response = await apiConfig.put(apiBaseURL.DELETE_ADMIN_PROFILE_PICTURE);
      } else {
        response = await apiConfig.put(
          apiBaseURL.DELETE_TECHNICAN_PROFILE_PICTURE
        );
      }
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        "Failed to delete profile picture.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (user, { rejectWithValue }) => {
    try {
      const response = await apiConfig.put(
        apiBaseURL.USER_RESET_PASSWORD,
        user
      );
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

export const checkTermsApproval = createAsyncThunk(
  "auth/checkTermsApproval",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiConfig.get(
        apiBaseURL.CHECK_TERMS_AGREEMENT_APPROVAL
      );
      localStorage.setItem(Tokens.TERMS_ACCEPTED, response.data.isTermAccepted);
      localStorage.setItem(Tokens.USER_ID, response.data.id);
      localStorage.setItem(Tokens.EMAIL, response.data.email);
      localStorage.setItem(Tokens.FIRST_NAME, response.data.firstName);
      localStorage.setItem(Tokens.LAST_NAME, response.data.lastName);

      // I added here
      if (isVendorPortal() || isTechnicianPortal() || isAdminPortal()) {
        await dispatch(fetchMyProfile());
      }
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

export const updateTermsApproval = createAsyncThunk(
  "auth/updateTermsApproval",
  async ({ isAccepted }, { rejectWithValue }) => {
    try {
      const response = await apiConfig.put(
        `${apiBaseURL.UPDATE_TERMS_AGREEMENT_APPROVAL}?isAccepted=${isAccepted}`
      );
      localStorage.setItem("termsAccepted", true);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        "Failed to update terms approval status.";
      return rejectWithValue(errorMessage);
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
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
      })

      .addCase(updateProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.editProfile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      .addCase(uploadProfilePicture.pending, (state) => {
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.myProfile.profilePhoto = action.payload.profilePhoto;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      .addCase(deleteProfilePicture.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteProfilePicture.fulfilled, (state) => {
        state.myProfile.profilePhoto = null;
      })
      .addCase(deleteProfilePicture.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      .addCase(resetPassword.pending, (state) => {
        state.isResetPasswordLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isResetPasswordLoading = false;
        state.success = true;
      })
      .addCase(resetPassword.rejected, (state, { payload }) => {
        state.isResetPasswordLoading = false;
        state.error = payload;
      })

      .addCase(checkTermsApproval.pending, (state) => {
        state.error = null;
      })
      .addCase(checkTermsApproval.fulfilled, (state, action) => {
        state.isTermAccepted = action.payload;
      })
      .addCase(checkTermsApproval.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      .addCase(updateTermsApproval.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTermsApproval.fulfilled, (state, action) => {
        state.isTermAccepted = action.payload.isTermAccepted;
      })
      .addCase(updateTermsApproval.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export default profileSlice.reducer;
