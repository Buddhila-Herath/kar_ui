import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import toastConfig from '../config/toastConfig';
import ToastCard from '../shared/toast/ToastCard';
import { toastType } from '../constants';

// Thunk for displaying a message based on success or error
export const displayMessage = createAsyncThunk(
    'toasts/displayMessage',
    async ({ message, success }, { dispatch }) => {
        const type = success ? toastType.ADD_TOAST : toastType.ERROR;
        dispatch(addToast({ text: message, type }));
    }
);

const notify = (options, toastsConfig) => {
    const newConfig = { ...toastsConfig.config, toastId: toastsConfig.id };
    toast(<ToastCard {...options} />, newConfig);
};

// Slice for managing toasts
const toastSlice = createSlice({
    name: 'toasts',
    initialState: [],
    reducers: {
        addToast: (state, action) => {
            const toastsConfig = toastConfig(action.payload);
            notify(action.payload, toastsConfig);
            state.push(toastsConfig);
        },
        removeToast: (state, action) => {
            return state.filter(toast => toast.id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder.addCase(displayMessage.fulfilled, (state, action) => {
            // No additional state updates needed for displayMessage
        });
    }
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
