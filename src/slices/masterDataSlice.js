import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiConfig from '../config/apiConfig';
import apiConfigMultipart from '../config/apiConfigWthFormData';
import { apiBaseURL } from '../constants';
import _ from 'lodash';

export const fetchAllBusinessTypes = createAsyncThunk(
    'masterData/fetchAllBusinessTypes',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_BUSINESS_TYPES_LIST);

        return response.data;
    }
);

export const fetchAllServicesTypes = createAsyncThunk(
    'masterData/fetchAllServicesTypes',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_SERVICE_TYPES);

        return response.data;
    }
);

export const fetchServiceTypesByCategory = createAsyncThunk(
    'masterData/fetchServiceTypesByCategory',
    async (serviceCategoryId, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(`${apiBaseURL.GET_ALL_SERVICE_TYPES}/${serviceCategoryId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch service types by category');
        }
    }
);

export const fetchAllServicesCategory = createAsyncThunk(
    'masterData/fetchAllServicesCategory',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_SERVICE_CATEGORY);

        return response.data;
    }
);

export const fetchAllModifiedBy = createAsyncThunk(
    'masterData/fetchAllModifiedBy',
    async (searchTerm = null, { rejectWithValue }) => {
        try {
            let url = apiBaseURL.GET_MODIFIED_BY;
            if (searchTerm !== null && searchTerm !== undefined) {
                const params = new URLSearchParams();
                if (searchTerm) params.append('searchTerm', searchTerm);
                if (params.toString()) url += `?${params.toString()}`;
            }
            const response = await apiConfig.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch modified by list');
        }
    }
);

export const fetchAllServicesNamesBasedOnCategory = createAsyncThunk(
    'vendorQuotes/fetchAllServicesNamesBasedOnCategory',
    async (serviceCategoryId = null, { rejectWithValue }) => {
        try {
            let url = apiBaseURL.GET_SERVICE_NAMES_BASED_ON_CATEGORY;
            if (serviceCategoryId) {
                url += `?serviceCategoryId=${serviceCategoryId}`;
            }
            const response = await apiConfig.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch service name list');
        }
    }
);

export const searchServicesNamesBasedOnCategory = createAsyncThunk(
    'masterData/searchServicesNamesBasedOnCategory',
    async ({ serviceCategoryId, searchTerm }, { rejectWithValue }) => {
        try {
            let url = apiBaseURL.GET_SERVICE_NAMES_BASED_ON_CATEGORY;
            const params = new URLSearchParams();
            if (serviceCategoryId) {
                params.append('serviceCategoryId', serviceCategoryId);
            }
            if (searchTerm) {
                params.append('searchTerm', searchTerm);
            }
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            const response = await apiConfig.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to search service names');
        }
    }
);

export const fetchAllTechnicanTypes = createAsyncThunk(
    'masterData/fetchAllTechnicanTypes',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_TECHNICAN_TYPES);

        return response.data;
    }
);

export const fetchAllTechnicanTypesBasedOnServiceType = createAsyncThunk(
    'masterData/fetchAllTechnicanTypesBasedOnServiceType',
    async ({ serviceTypeId, serviceSubTypeId = null }, { rejectWithValue }) => {
        try {
            const subPath = serviceSubTypeId ? serviceSubTypeId : 'null';
            const url = `${apiBaseURL.GET_ALL_TECHNICAN_TYPES}/${serviceTypeId}/${subPath}`;
            const response = await apiConfig.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch technician types by service type');
        }
    }
);

export const fetchAllServiceRateTypes = createAsyncThunk(
    'masterData/fetchAllServiceRateTypes',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_SERVICE_RATE_TYPES);

        return response.data;
    }
);

export const fetchAllVariations = createAsyncThunk(
    'masterData/fetchAllVarriations',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_VARIATIONS);

        return response.data;
    }
);

export const fetchAllVehicleCategory = createAsyncThunk(
    'masterData/fetchAllVehicleCategory',
    async () => {
        const response = await apiConfig.get(
            `${apiBaseURL.GET_ALL_VEHICLE_CATEGORY}?isAll=false`
        );

        return response.data;
    }
);

export const fetchAllUnits = createAsyncThunk(
    'masterData/fetchAllUnits',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_UNITS);

        return response.data;
    }
);

export const fetchAllVehicleMakesCategories = createAsyncThunk(
    'masterData/fetchAllVehicleMakesCategories',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_VEHICLE_MAKES_CATEGORIES);

        return response.data;
    }
);

export const fetchAllVehicleMakes = createAsyncThunk(
    'masterData/fetchAllVehicleMakes',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_VEHICLE_MAKES_GROUP);

        return response.data;
    }
);

export const fetchAllVehicleModels = createAsyncThunk(
    'masterData/fetchAllVehicleModels',
    async (makeId = null, { rejectWithValue }) => {
        try {
            let url = apiBaseURL.GET_ALL_VEHICLE_MODELS_GROUP;
            if (makeId) {
                url += `?vehicleMakeId=${makeId}`;
            }
            const response = await apiConfig.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch model list');
        }
    }
);

export const fetchAllVehicleMakeList = createAsyncThunk(
    'masterData/fetchAllVehicleMakeList',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_VEHICLE_MAKES);

        return response.data;
    }
);

export const fetchAllRequiredSpareParts = createAsyncThunk(
    'masterData/fetchAllRequiredSpareParts',
    async () => {
        const response = await apiConfig.get(apiBaseURL.REQUIRED_SPARE_PARTS);

        return response.data;
    }
);

export const searchRequiredSpareParts = createAsyncThunk(
    'masterData/searchRequiredSpareParts',
    async ({ searchTerm }, { rejectWithValue }) => {
        try {
            let url = apiBaseURL.REQUIRED_SPARE_PARTS;
            const params = new URLSearchParams();
            if (searchTerm) {
                params.append('searchTerm', searchTerm);
            }
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            const response = await apiConfig.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to search required spare parts');
        }
    }
);

export const addUnit = createAsyncThunk(
    'masterData/addUnit',
    async (unitData, { rejectWithValue }) => {
        const transformedData = {
            unitName: unitData.value,
            status: true,
        };

        try {
            const response = await apiConfig.post(apiBaseURL.ADD_UNIT, transformedData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.errors?.[0] ||
                error.response?.data?.message ||
                "Failed to add data.";
            return rejectWithValue(errorMessage);
        }
    }
);

export const addVehicleCategory = createAsyncThunk(
    'masterData/addVehicleCategory',
    async (vehicleCategoryData, { rejectWithValue }) => {
        const transformedData = {
            vehicleCategory: vehicleCategoryData.value,
            ...(vehicleCategoryData?.code ? { categoryCode: vehicleCategoryData.code } : {}),
            status: true,
        };
        try {
            const response = await apiConfig.post(apiBaseURL.ADD_VEHICLE_CATEGORY, transformedData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.errors?.[0] ||
                error.response?.data?.message ||
                "Failed to add data.";
            return rejectWithValue(errorMessage);
        }
    }
);

export const validateSparePartStock = createAsyncThunk(
  "masterData/validateSparePartStock",
  async (partsId, { rejectWithValue }) => {
    try {
      const response = await apiConfig.get(
        `${apiBaseURL.SPARE_PART_VALIDATION}?partsId=${partsId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error validating stock");
    }
  }
);

export const downloadAttachment = createAsyncThunk(
    "masterData/downloadAttachment",
    async (path, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.SPARE_PART_NOTE_ATTACHMENT_DOWNLOAD}?path=${path}`,
                { responseType: "blob" }
            );
            return { data: response.data, headers: response.headers };
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to download the attachment");
        }
    }
);

export const addMake = createAsyncThunk(
    'masterData/addMake',
    async (formData, { rejectWithValue }) => {
        const transformedData = {
            makeName: formData.value,
            ...(formData?.code ? { makeCode: formData.code } : {}),
            status: true,
            vehicleMakeCategory: {
                id: formData.category
            }
        };

        try {
            const response = await apiConfig.post(apiBaseURL.ADD_VEHICLE_MAKE, transformedData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.errors?.[0] ||
                error.response?.data?.message ||
                "Failed to add data.";
            return rejectWithValue(errorMessage);
        }
    }
);

export const addModel = createAsyncThunk(
    'masterData/addModel',
    async (formData, { rejectWithValue }) => {

        const brand = await apiConfig.get(`${apiBaseURL.GET_VEHICLE_MAKE_CATEGORY_BY_MAKE_ID}?makeId=${formData.category}`);

        const transformedData = {
            modelName: formData.value,
            ...(formData?.code ? { modelCode: formData.code } : {}),
            status: true,
            vehicleMakeDto: {
                id: formData.category,
                vehicleMakeCategory: {
                    id: brand.data.id
                }
            }
        };

        try {
            const response = await apiConfig.post(apiBaseURL.ADD_VEHICLE_MODEL, transformedData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.errors?.[0] ||
                error.response?.data?.message ||
                "Failed to add data.";
            return rejectWithValue(errorMessage);
        }
    }
);

export const fetchAllInsuranceCompanyList = createAsyncThunk(
    'masterData/fetchAllInsuranceCompanyList',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.GET_INSURANCE_COMPANY_LIST}?isAll=false`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch insurance companies');
        }
    }
);

export const addInsuranceCompany = createAsyncThunk(
    'masterData/addInsuranceCompany',
    async (formData, { rejectWithValue }) => {
        const transformedData = {
            insuranceName: formData,
        };

        try {
            const response = await apiConfig.post(apiBaseURL.ADD_NEW_INSURANCE_COMPANY, transformedData);
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.errors?.[0] ||
                error.response?.data?.message ||
                "Failed to add data.";
            return rejectWithValue(errorMessage);
        }
    }
);

export const fetchAllJobTypes = createAsyncThunk(
    'masterData/fetchAllJobTypes',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_JOB_TYPE_LIST);

        return response.data;
    }
);

export const fetchAllPriorityList = createAsyncThunk(
    'masterData/fetchAllPriorityList',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_PRIORITY_LIST);

        return response.data;
    }
);

export const fetchAllPartNamesBasedOnCategory = createAsyncThunk(
    'masterData/fetchAllPartNamesBasedOnCategory',
    async (category = null, { rejectWithValue }) => {
        try {
            let url = apiBaseURL.GET_PART_NAME_BASED_ON_CATEGORY;
            if (category) {
                url += `?category=${category}`;
            }
            const response = await apiConfig.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch part name list');
        }
    }
);

export const searchPartNamesBasedOnCategory = createAsyncThunk(
    'masterData/searchPartNamesBasedOnCategory',
    async ({ category, searchTerm }, { rejectWithValue }) => {
        try {
            let url = apiBaseURL.GET_PART_NAME_BASED_ON_CATEGORY;
            const params = new URLSearchParams();
            if (category) {
                params.append('category', category);
            }
            if (searchTerm) {
                params.append('searchTerm', searchTerm);
            }
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            const response = await apiConfig.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to search part names');
        }
    }
);

export const fetchImageByPath = createAsyncThunk(
    'masterData/fetchImageByPath',
    async (path, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.VIEW_IMAGE_BY_PATH}?id=${path}`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch image');
        }
    }
);

export const saveUserCustomization = createAsyncThunk(
    "vendorClients/saveUserCustomization",
    async (
      { columnsName = [], moduleName = "CLIENT_MANAGEMENT" },
      { rejectWithValue }
    ) => {
      try {
        const response = await apiConfig.post(
          apiBaseURL.SAVE_USER_CUSTOMIZATION,
          {
            moduleName,
            columnsName,
          }
        );
        return response.data;
      } catch (error) {
        const errors = error.response?.data?.errors || [];
        const message =
          error.response?.data?.message || "Failed to save user customization.";
  
        return rejectWithValue({ message, errors });
      }
    }
);

export const fetchAllFuelTypes = createAsyncThunk(
    'masterData/fetchAllFuelTypes',
    async () => {
        const response = await apiConfig.get(apiBaseURL.GET_ALL_FUEL_TYPES);

        return response.data;
    }
);

export const uploadOrderImage = createAsyncThunk(
    'masterData/uploadOrderImage',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await apiConfigMultipart.post(apiBaseURL.ORDER_UPLOAD_IMAGE, formData);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to upload images.";
            return rejectWithValue({ message, errors });
        }
    }
);

export const uploadPostCompletionImage = createAsyncThunk(
    'masterData/uploadPostCompletionImage',
    async ({ jobId, formData }, { rejectWithValue }) => {
        try {
            const response = await apiConfigMultipart.post(
                `${apiBaseURL.UPLOAD_POST_COMPLETION_IMAGE}/${jobId}`,
                formData
            );
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to upload post completion images.";
            return rejectWithValue({ message, errors });
        }
    }
);

export const deleteUploadedImage = createAsyncThunk(
    'masterData/deleteUploadedImage',
    async ({ path }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.put(`${apiBaseURL.DELETE_UPLOADED_IMAGE}?paths=${path}`);
            return response.data;
        } catch (error) {
            const errors = error.response?.data?.errors || [];
            const message = error.response?.data?.message || "Failed to delete uploaded image.";
            return rejectWithValue({ message, errors });
        }
    }
);

export const shareQuoteInvoice = createAsyncThunk(
    'masterData/shareQuoteInvoice',
    async ({ id, type }, { rejectWithValue }) => {
        try {
            const response = await apiConfig.get(
                `${apiBaseURL.SHARE_QUOTE_INVOICE}/${id}?type=${type}`
            );
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.errors?.[0] ||
                error.response?.data?.message ||
                "Failed to add data.";
            return rejectWithValue(errorMessage);
        }
    }
);

const masterDataSlice = createSlice({
    name: 'masterData',
    initialState: {
        allBusinessTypes: [],
        allServicesTypes: [],
        allServicesCategory: [],
        allTechnicanTypes: [],
        allServiceRateTypes: [],
        allVariations: [],
        allVehicleCategory: [],
        allUnits: [],
        allVehicleMakes: [],
        allVehicleModels: [],
        allVehicleMakeCategory: [],
        allVehicleMakeList: [],
        allRequiredSpareParts: [],
        technicianTypesByService: null,
        allInsuranceCompanyList: [],
        allJobTypes: [],
        allPriorityList: [],
        allServiceList: [],
        allPartNameList: [],
        allFuelTypes: [],
        allCountries: [],
        allModifiedBy: [],
        insuranceCompanies: [],
        orderImage: [],
        error: null,
        loading: false,
        isDownloadLoading: false,
        partNamesLoading: false,
        serviceNamesLoading : false,
        vehicleModelLoading : false,
        modifiedByLoading: false,
        requiredSparePartsLoading: false,
        isUserCustomizationSaving: false,
        stockData: null,
        loading: false,
        error: null,
        isUploading: false,
    },
    reducers: {
        clearServiceList: (state) => {
            state.allServiceList = [];
        },
        clearPartNameList: (state) => {
            state.allPartNameList = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllBusinessTypes.pending, (state) => {
                state.loading = true; 
                state.error = null;
            })
            .addCase(fetchAllBusinessTypes.fulfilled, (state, action) => {
                state.loading = false; 
                state.allBusinessTypes = action.payload;
            })
            .addCase(fetchAllBusinessTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                console.error('Fetch business types failed:', action.error);
            })

            .addCase(fetchAllServicesTypes.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllServicesTypes.fulfilled, (state, action) => {
                state.allServicesTypes = action.payload;
            })
            .addCase(fetchAllServicesTypes.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch service types failed:', action.error);
            })

            .addCase(fetchServiceTypesByCategory.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchServiceTypesByCategory.fulfilled, (state, action) => {
                state.allServicesTypes = action.payload;
            })
            .addCase(fetchServiceTypesByCategory.rejected, (state, action) => {
                state.error = action.payload?.message || action.error.message;
                console.error('Fetch service types by category failed:', action.error || action.payload);
            })

            .addCase(fetchAllServicesCategory.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllServicesCategory.fulfilled, (state, action) => {
                state.allServicesCategory = action.payload;
            })
            .addCase(fetchAllServicesCategory.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch service category failed:', action.error);
            })

            .addCase(fetchAllTechnicanTypes.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllTechnicanTypes.fulfilled, (state, action) => {
                state.allTechnicanTypes = action.payload;
            })
            .addCase(fetchAllTechnicanTypes.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch technician types failed:', action.error);
            })

            .addCase(fetchAllTechnicanTypesBasedOnServiceType.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllTechnicanTypesBasedOnServiceType.fulfilled, (state, action) => {
                state.technicianTypesByService = action.payload;
            })
            .addCase(fetchAllTechnicanTypesBasedOnServiceType.rejected, (state, action) => {
                state.error = action.payload?.message || action.error.message;
                state.technicianTypesByService = null;
                console.error('Fetch types by service failed:', action.error || action.payload);
            })

            .addCase(fetchAllServiceRateTypes.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllServiceRateTypes.fulfilled, (state, action) => {
                state.allServiceRateTypes = action.payload;
            })
            .addCase(fetchAllServiceRateTypes.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch service rate types failed:', action.error);
            })

            .addCase(fetchAllVariations.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllVariations.fulfilled, (state, action) => {
                state.allVariations = action.payload;
            })
            .addCase(fetchAllVariations.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch Variations failes:', action.error);
            })

            .addCase(fetchAllVehicleCategory.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllVehicleCategory.fulfilled, (state, action) => {
                state.allVehicleCategory = action.payload;
            })
            .addCase(fetchAllVehicleCategory.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch Vehicle Category failed:', action.error);
            })

            .addCase(fetchAllUnits.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllUnits.fulfilled, (state, action) => {
                state.allUnits = action.payload;
            })
            .addCase(fetchAllUnits.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch Units failes:', action.error);
            })

            .addCase(fetchAllVehicleMakesCategories.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllVehicleMakesCategories.fulfilled, (state, action) => {
                state.allVehicleMakeCategory = action.payload;
            })
            .addCase(fetchAllVehicleMakesCategories.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch Vehicle Makes Categories failes:', action.error);
            })

            .addCase(fetchAllVehicleMakes.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllVehicleMakes.fulfilled, (state, action) => {
                state.allVehicleMakes = action.payload;
            })
            .addCase(fetchAllVehicleMakes.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch Vehicle Makes failes:', action.error);
            })

            .addCase(fetchAllVehicleModels.pending, (state) => {
                state.vehicleModelLoading = true;
                state.error = null;
            })
            .addCase(fetchAllVehicleModels.fulfilled, (state, action) => {
                state.vehicleModelLoading = false;
                state.allVehicleModels = action.payload;
            })
            .addCase(fetchAllVehicleModels.rejected, (state, action) => {
                state.vehicleModelLoading = false;
                state.error = action.error.message;
                console.error('Fetch Vehicle Models failes:', action.error);
            })

            .addCase(fetchAllVehicleMakeList.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllVehicleMakeList.fulfilled, (state, action) => {
                state.allVehicleMakeList = action.payload;
            })
            .addCase(fetchAllVehicleMakeList.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch Vehicle Model lists failes:', action.error);
            })

            .addCase(addUnit.pending, (state) => {
                state.error = null;
            })
            .addCase(addUnit.fulfilled, (state, action) => {
                const newUnit = { label: action.meta.arg.value, id: action.payload.id };
                state.allUnits.push(newUnit);
            })
            .addCase(addUnit.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Failed to add data:', action.error);
            })

            .addCase(addVehicleCategory.pending, (state) => {
                state.error = null;
            })
            .addCase(addVehicleCategory.fulfilled, (state, action) => {
                const newCategory = { label: action.meta.arg.value, id: action.payload.id };
                state.allVehicleCategory.push(newCategory);
            })
            .addCase(addVehicleCategory.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Failed to add data:', action.error);
            })
            
            
            .addCase(addMake.pending, (state) => {
                state.error = null;
            })
            .addCase(addMake.fulfilled, (state, action) => {
                const newMake = { label: action.meta.arg.value, id: action.payload.id };
                state.allVehicleMakeCategory.push(newMake);
            })
            .addCase(addMake.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Failed to add data:', action.error);
            })

            .addCase(addModel.pending, (state) => {
                state.error = null;
            })
            .addCase(addModel.fulfilled, (state, action) => {
                const newModel = { label: action.meta.arg.value, id: action.payload.id };
                //state.allVehicleModels.push(newModel);
            })
            .addCase(addModel.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Failed to add data:', action.error);
            })

            .addCase(fetchAllRequiredSpareParts.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllRequiredSpareParts.fulfilled, (state, action) => {
                state.allRequiredSpareParts = action.payload;
            })
            .addCase(fetchAllRequiredSpareParts.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch Spare Parts failes:', action.error);
            })

            .addCase(searchRequiredSpareParts.pending, (state) => {
                state.requiredSparePartsLoading = true;
                state.error = null;
            })
            .addCase(searchRequiredSpareParts.fulfilled, (state, action) => {
                state.requiredSparePartsLoading = false;
                if (action.payload && action.payload.status === 400) {
                    state.allRequiredSpareParts = [];
                    state.error = action.payload.message || 'No spare parts found';
                } else {
                    state.allRequiredSpareParts = action.payload;
                    state.error = null;
                }
            })
            .addCase(searchRequiredSpareParts.rejected, (state, action) => {
                state.requiredSparePartsLoading = false;
                state.error = action.error.message;
                state.allRequiredSpareParts = [];
                console.error('Search spare parts failes:', action.error);
            })

            .addCase(fetchAllInsuranceCompanyList.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllInsuranceCompanyList.fulfilled, (state, action) => {
                state.allInsuranceCompanyList = action.payload;
            })
            .addCase(fetchAllInsuranceCompanyList.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch insurance company list failes:', action.error);
            })

            .addCase(fetchAllModifiedBy.pending, (state) => {
                state.modifiedByLoading = true;
                state.error = null;
            })
            .addCase(fetchAllModifiedBy.fulfilled, (state, action) => {
                state.modifiedByLoading = false;
                state.allModifiedBy = action.payload || [];
            })
            .addCase(fetchAllModifiedBy.rejected, (state, action) => {
                state.modifiedByLoading = false;
                state.error = action.payload?.message || action.error.message;
                state.allModifiedBy = [];
                console.error('Fetch Modified By failed:', action.error);
            })

            .addCase(fetchAllJobTypes.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllJobTypes.fulfilled, (state, action) => {
                state.allJobTypes = action.payload;
            })
            .addCase(fetchAllJobTypes.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch job types failes:', action.error);
            })

            .addCase(fetchAllPriorityList.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchAllPriorityList.fulfilled, (state, action) => {
                state.allPriorityList = action.payload;
            })
            .addCase(fetchAllPriorityList.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Fetch priority list failes:', action.error);
            })

            .addCase(fetchAllServicesNamesBasedOnCategory.pending, (state) => {
                state.serviceNamesLoading = true;
                state.error = null;
            })
            .addCase(fetchAllServicesNamesBasedOnCategory.fulfilled, (state, action) => {
                 state.serviceNamesLoading = false;
                 if (action.payload && action.payload.status === 400) {
                     state.allServiceList = [];
                     state.error = action.payload.message || 'No services found';
                 } else {
                     state.allServiceList = action.payload;
                     state.error = null;
                 }
            })
            .addCase(fetchAllServicesNamesBasedOnCategory.rejected, (state, action) => {
                 state.serviceNamesLoading = false;
                 state.error = action.error.message;
                 state.allServiceList = [];
                console.error('Fetch service list failes:', action.error);
            })

            .addCase(fetchAllPartNamesBasedOnCategory.pending, (state) => {
                state.partNamesLoading = true;
                state.error = null;
            })
            .addCase(fetchAllPartNamesBasedOnCategory.fulfilled, (state, action) => {
                state.partNamesLoading = false;
                if (action.payload && action.payload.status === 400) {
                    state.allPartNameList = [];
                    state.error = action.payload.message || 'No parts found';
                } else {
                    state.allPartNameList = action.payload;
                    state.error = null;
                }
            })
            .addCase(fetchAllPartNamesBasedOnCategory.rejected, (state, action) => {
                state.partNamesLoading = false;
                state.error = action.error.message;
                state.allPartNameList = [];
                console.error('Fetch part name list failes:', action.error);
            })

            .addCase(searchPartNamesBasedOnCategory.pending, (state) => {
                state.error = null;
            })
            .addCase(searchPartNamesBasedOnCategory.fulfilled, (state, action) => {
                if (action.payload && action.payload.status === 400) {
                    state.allPartNameList = [];
                    state.error = action.payload.message || 'No parts found';
                } else {
                    state.allPartNameList = action.payload;
                    state.error = null;
                }
            })
            .addCase(searchPartNamesBasedOnCategory.rejected, (state, action) => {
                state.error = action.error.message;
                state.allPartNameList = [];
                console.error('Search part names failes:', action.error);
            })

            .addCase(searchServicesNamesBasedOnCategory.pending, (state) => {
                state.error = null;
            })
            .addCase(searchServicesNamesBasedOnCategory.fulfilled, (state, action) => {
                if (action.payload && action.payload.status === 400) {
                    state.allServiceList = [];
                    state.error = action.payload.message || 'No services found';
                } else {
                    state.allServiceList = action.payload;
                    state.error = null;
                }
            })
            .addCase(searchServicesNamesBasedOnCategory.rejected, (state, action) => {
                state.error = action.error.message;
                state.allServiceList = [];
                console.error('Search service names failes:', action.error);
            })

            .addCase(addInsuranceCompany.pending, (state) => {
                state.error = null;
            })
            .addCase(addInsuranceCompany.fulfilled, (state, action) => {
                state.error = null;
                state.insuranceCompanies = action.payload;
            })
            .addCase(addInsuranceCompany.rejected, (state, action) => {
                state.error = action.error.message;
                console.error('Failed to add data:', action.error);
            })

            .addCase(validateSparePartStock.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(validateSparePartStock.fulfilled, (state, action) => {
                state.loading = false;
                state.stockData = action.payload;
            })
            .addCase(validateSparePartStock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(downloadAttachment.pending, (state) => {
                state.isDownloadLoading = true;
                state.error = null;
            })
            .addCase(downloadAttachment.fulfilled, (state, action) => {
                state.isDownloadLoading = false;
            })
            .addCase(downloadAttachment.rejected, (state, action) => {
                state.isDownloadLoading = false;
                state.error = action.error.message;
            }) 
            .addCase(saveUserCustomization.pending, (state) => {
                state.isUserCustomizationSaving = true;
                state.error = null;
            })
            .addCase(saveUserCustomization.fulfilled, (state, action) => {
                state.isUserCustomizationSaving = false;
                state.successMessage = action.payload?.message || state.successMessage;
            })
            .addCase(saveUserCustomization.rejected, (state, action) => {
                state.isUserCustomizationSaving = false;
                state.error = action.payload?.message || action.error.message;
            })
            .addCase(fetchAllFuelTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllFuelTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.allFuelTypes = action.payload;
            })
            .addCase(fetchAllFuelTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(uploadOrderImage.pending, (state) => {
                state.error = null;
            })
            .addCase(uploadOrderImage.fulfilled, (state, action) => {
                state.orderImage = action.payload;
            })
            .addCase(uploadOrderImage.rejected, (state, action) => {
                state.error = action.error.message;
            })
            
            .addCase(uploadPostCompletionImage.pending, (state) => {
                state.isUploading = true;
                state.error = null;
            })
            .addCase(uploadPostCompletionImage.fulfilled, (state, action) => {
                state.isUploading = false;
                state.postCompletionImage = action.payload;
            })
            .addCase(uploadPostCompletionImage.rejected, (state, action) => {
                state.isUploading = false;
                state.error = action.error.message;
            })

            .addCase(deleteUploadedImage.pending, (state) => {
                state.isUploading = true;
                state.error = null;
            })
            .addCase(deleteUploadedImage.fulfilled, (state, action) => {
                state.isUploading = false;
            })
            .addCase(deleteUploadedImage.rejected, (state, action) => {
                state.isUploading = false;
                state.error = action.error.message;
            })
    },
});

export const { clearPartNameList, clearServiceList } = masterDataSlice.actions;
export default masterDataSlice.reducer;
