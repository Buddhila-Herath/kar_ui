import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import DataTable from "react-data-table-component";
import FilterComponent from "../../shared/components/FilterComponent";
import TableButton from "../../shared/action-buttons/TableButton";
import EmptyComponent from "./EmptyComponent";
import FilterDropdown from "../../shared/filterMenu/FilterDropdown";
import PaginationComponent from "./PaginationComponent";
import { 
    fetchAllBusinessTypes, 
    fetchAllVariations, 
    fetchAllVehicleCategory,
    fetchAllServiceRateTypes, 
    fetchAllServicesCategory, 
    fetchAllTechnicanTypes,
    fetchAllJobTypes,
    fetchAllVehicleMakes,
    fetchAllVehicleMakeList,
    fetchAllVehicleModels,
    fetchAllModifiedBy
} from '../../slices/masterDataSlice';
import { format, set } from "date-fns";
import Icons from "../../utils/icons";
import { InventoryTab } from "../../components/admin/inventory/inventoryTab";

const ReactDataTable = (props) => {
    const {
        vendorGlobalEnabled,
        vendorGlobalclass,
        className,
        columns,
        AddButton,
        items,
        tableTitle,
        countTextSingular,
        countTextPlural,
        ButtonValue,
        to,
        onChange,
        currentPage,
        pageSize,
        totalPages,
        totalRows,
        isLoading,
        isShowFilterField,
        isStatus,
        filterTitle,
        isStartDateFilter,
        isEndDateFilter,
        isStatusFilter,
        isBusinessTypeFilter,
        isServiceCategoryFilter,
        isTechnicianTypeFilter,
        isServiceRateFilter,
        isVariationFilter,
        isVehicleCategoryFilter,
        isWarentyFilter,
        isStockFilter,
        isQuoteStatusFilter,
        isFinanceStatusFiter,
        isJobTypeFilter,
        isDueDateFilter,
        isJoinedDateFilter,
        isExport,
        onExcelClick,
        isShowSearch,
        sortIcon,
        customSort,
        isDownloadLoading,
        conditionalRowStyles,
        globalSetting,             // Whether a global setting off
        noRecordsMessage,          // Message when there are no records
        globalSettingOffMessage,   // Message when global setting is off
        noFilterMatchMessage,      // Message when no data matches the filter
        isFilterApplied,            // Whether a filter is applied
        searchTextLength = 3,
        vehicleMakeFilter,
        vehicleModelFilter,
        isModifiedByFilter,
        isModifiedDateFilter,
        showtab,
        onTabChange,
        totalItemsForTabs
    } = props;
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [status, setStatus] = useState();
    const [businessTypes, setBusinessTypes] = useState([]);
    const [show, setShow] = useState(false);
    const [showCriteria, setCriteriaShow] = useState(false);
    const [reset, setReset] = useState(false);
    const [selectedData, setSelectedData] = useState("");
    const dispatch = useDispatch();
    const [isStartDateVisible, setIsStartDateVisible] = useState(false);
    const [isEndDateVisible, setIsEndDateVisible] = useState(false);
    const [isStatusVisible, setIsStatusVisible] = useState(false);
    const [isDueDateVisible, setIsDueDateVisible] = useState(false);
    const [IsJoinedDateVisible, setIsJoinedDateVisible] = useState(false);
    const { allBusinessTypes, loading,    allVehicleMakes, allVehicleMakeList,allVehicleModels,vehicleModelLoading
    } = useSelector((state) => state.masterData);
    const { allVariations } = useSelector((state) => state.masterData);
    const { allVehicleCategory } = useSelector((state) => state.masterData);
    const [variations, setVariations] = useState([]);
    const [warranty, setWarranty] = useState();
    const [isWarrantyVisible, setIswarrantyVisible] = useState(false);
    const [stockStatus, setStockStatus] = useState();
    const [isStockStatusVisible, setIsStockStatusVisible] = useState(false);
    const [vehicleCategory, setVehicleCategory] = useState([]);
    const [serviceCategory, setServiceCategory]= useState([]);
    const {allServicesCategory}=useSelector((state)=>state.masterData);
    const tableColumns = useMemo(() => columns, [columns]);
    const {allTechnicanTypes}=useSelector((state)=>state.masterData);
    const { allModifiedBy, modifiedByLoading } = useSelector((state)=>state.masterData);
    const [technicianTypes, setTechnicianTypes] = useState([]);
    const {allServiceRateTypes}=useSelector((state)=>state.masterData);
    const {allJobTypes}=useSelector((state)=>state.masterData);
    const [serviceRateTypes, setServiceRateType] = useState([])
    const [quoteStatus, setQuoteStatus] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState([]); 
    const [jobType, setJobtypes] = useState([]); 
    const [isQuoteStatusVisible, setIsQuoteStatusVisible] = useState(false);
    const [isPaymentStatusVisible, setIsPaymentStatusVisible] = useState(false);
    const [vehicleMake, setVehicleMake] = useState([]);
    const [vehicleModel, setVehicleModel] = useState([]);
    const [selectedVehicleMakeIds, setSelectedVehicleMakeIds] = useState([]);
    const [isModifiedBy, setIsModifiedBy] = useState([]);
    const [isModifiedDate, setIsModifiedDate] = useState();
    
    const handleSearch = (searchText) => {
        if (searchText.length >= searchTextLength || searchText.length === 0) {
            onChange({ searchTerm: searchText });
        }
    };

    const handleSelected = (state) => {
        setSelectedData(state.selectedRows);
    };

     useEffect(() => {
        if (selectedVehicleMakeIds.length > 0) {
          dispatch(fetchAllVehicleModels(selectedVehicleMakeIds));
        } else {
          dispatch(fetchAllVehicleModels());
        }
      }, [dispatch, selectedVehicleMakeIds]);

    useEffect(() => {
        dispatch(fetchAllBusinessTypes());
        dispatch(fetchAllVariations());
        dispatch(fetchAllVehicleCategory());
        dispatch(fetchAllServiceRateTypes());
        dispatch(fetchAllServicesCategory());
        dispatch(fetchAllTechnicanTypes());
        dispatch(fetchAllServiceRateTypes());
        dispatch(fetchAllJobTypes());
        dispatch(fetchAllVehicleMakes());
        dispatch(fetchAllVehicleMakeList());
        dispatch(fetchAllModifiedBy());
    }, [dispatch]);

    useEffect(() => {
        setCriteriaShow(areFiltersActive());
    }, [
        startDate,
        endDate,
        status,
        warranty,
        stockStatus,
        businessTypes,
        variations,
        vehicleCategory,
        serviceCategory,
        technicianTypes,
        serviceRateTypes,
        quoteStatus,
        paymentStatus,
        jobType,
        vehicleMake,
        vehicleModel,
        isModifiedBy,
        isModifiedDate
    ]);

    const businessTypesOptions = useMemo(() => {  
        return (allBusinessTypes || []).map((option) => ({
            name: option.businessName,
            id: option.id,
            checked: businessTypes.includes(option.id),
        }));
    }, [allBusinessTypes, businessTypes]);

    const vehicleMakeLists = allVehicleMakeList.map((option) => ({
      label: option.makeName,
      value: option.id,
    }));

    // Create flat vehicle options arrays like other filters
    const vehicleMakeOptionsFlat = useMemo(() => {
        return allVehicleMakes.flatMap(category => 
            category.vehicleMake.map(make => ({
                name: make.vehicleMakeName,
                id: make.vehicleMakeId,
            }))
        );
    }, [allVehicleMakes]);

    const vehicleModelOptionsFlat = useMemo(() => {
        return allVehicleModels.flatMap(category => 
            category.vehicleMake.flatMap(make => 
                make.vehicleModel.map(model => ({
                    name: model.vehicleModelName,
                    id: model.vehicleModelId,
                }))
            )
        );
    }, [allVehicleModels]);

    const vehicleMakeOptions = useMemo(
      () =>
        allVehicleMakes.map((category) => ({
            label: category.vehicleMakeCategory,
            options: category.vehicleMake.map((make) => ({
                label: make.vehicleMakeName,
                value: make.vehicleMakeId,
            })),
        })),
      [allVehicleMakes]
    );

    const vehicleModelOptions = useMemo(() => {
        return allVehicleModels.map((category) => ({
            label: category.vehicleMakeCategory,
            options: category.vehicleMake.map((make) => ({
                label: make.vehicleMakeName,
                subOptions: make.vehicleModel.map((model) => ({
                    label: model.vehicleModelName,
                    value: model.vehicleModelId,
                })),
            })),
        }));
    }, [allVehicleModels]);

    const modifiedByOptions = useMemo(() => {
    
        return (allModifiedBy || []).map((item) => {
            if (typeof item === 'string') {
                return { label: item, value: item };
            }
           
            const label = item?.name || item?.vendorName || item?.fullName || [item?.firstName, item?.lastName].filter(Boolean).join(' ') || String(item?.id || '');
            const value = item?.id ?? label;
            return { label, value };
        });
    }, [allModifiedBy]);

    const handleModifiedByChange = (values) => {
        setIsModifiedBy(values || []);
        onChange({ modifiedBy: values || [] });
    };

    const onModifiedBySearch = (searchTerm, done) => {
        dispatch(fetchAllModifiedBy(searchTerm)).finally(() => {
            if (typeof done === 'function') done();
        });
    };

    const handleAddModelValue = async (value, category) => {
        try {
            const response = await dispatch(addModel(value, category)).unwrap();
            if (response) {
              dispatch(fetchAllVehicleModels(selectedVehicleMakeIds));
            }
            return response;
        } catch (error) {
            return error;
        }
    };

    const variationOptions = useMemo(() => {
        return (allVariations || []).map((option) => ({
            name: option.variantName,
            id: option.id,
            checked: variations.includes(option.id),
        }));
    }, [allVariations, variations]);
    
    const vehicleCategoryOptions = useMemo(() => {
        return (allVehicleCategory || []).map((option) => ({
            name: option.vehicleCategory,
            id: option.id,
            checked: vehicleCategory.includes(option.id),
        }));
    }, [allVehicleCategory, vehicleCategory]);

    const serviceCategoryOptions = useMemo(() => {  
        return (allServicesCategory || []).map((option) => ({
            name: option.serviceCategoryName,
            id: option.id,
            checked: serviceCategory.includes(option.id),
        }));
    }, [allServicesCategory, serviceCategory]);

    const technicianTypeOptions = useMemo(() => {
        return (allTechnicanTypes || []).map((option) => {
            if (option.technicianSubTypeDtoList && option.technicianSubTypeDtoList.length > 0) {
                return {
                    label: option.technicianTypeName,
                    options: option.technicianSubTypeDtoList.map((subType) => ({
                        label: subType.technicianSubType,
                        value: subType.id,
                        checked: technicianTypes.includes(subType.id),
                    })),
                };
            } else {
                return {
                    label: option.technicianTypeName,
                    value: option.technicianTypeId,
                    checked: technicianTypes.includes(option.technicianTypeId),
                };
            }
        });
    }, [allTechnicanTypes, technicianTypes]); 
    
    const serviceRateTypeOptions = useMemo(() => {
        return (allServiceRateTypes || []).map((option) => ({
            name: option.rateType,
            id: option.rateTypeId,
            checked: serviceRateTypes.includes(option.rateTypeId),
        }));
    }, [allServiceRateTypes, serviceRateTypes]);

    const jobTypeOption = useMemo(() => {
        return (allJobTypes || []).map((option) => ({
            name: option.jobType,
            id: option.id,
            checked: jobType.includes(option.id),
        }));
    }, [allJobTypes, jobType]);

    const allQuoteStatus = [
        { name: "Accepted", id: "Accepted" },
        { name: "Pending", id: "Pending" },
        { name: "Rejected", id: "Rejected" }
    ]
   
    const allFinanceStatus=[
        { name: "Fully Paid", id: "Fully Paid" },
        { name: "Partially Paid", id: "Partially Paid" },
        { name: "Unpaid", id: "Unpaid" },
    ]

    const quoteStatusOption = useMemo(() => {
        return (allQuoteStatus || []).map((option) => ({
            name: option.name,
            id: option.id,
            checked: quoteStatus.includes(option.id),
        }));
    }, [allQuoteStatus, quoteStatus]);

    const paymentStatusOption = useMemo(() => {
        return (allFinanceStatus || []).map((option) => ({
            name: option.name,
            id: option.id,
            checked:paymentStatus.includes(option.id),
        }));
    }, [allFinanceStatus, paymentStatus]);    

    const handleFilterChange = (filters) => {
        onChange(filters);
        setCriteriaShow(true);
        setIsStartDateVisible(true);
        setStartDate(filters.fromDate);
        setIsEndDateVisible(true);
        setEndDate(filters.toDate);
        setIsStatusVisible(true);
        setStatus(filters.status)
        setBusinessTypes(filters.businessType);
        setVariations(filters.variation);
        setWarranty(filters.warranty);
        setIswarrantyVisible(true);
        setStockStatus(filters.stockStatus);
        setIsStockStatusVisible(true);
        setVehicleCategory(filters.vehicleCategory );
        setServiceCategory(filters.servicesCategory);
        setTechnicianTypes(filters.technicianType);
        setServiceRateType(filters.serviceRateType);
        setQuoteStatus(filters.quoteStatus);
        setIsQuoteStatusVisible(true);
        setPaymentStatus(filters.paymentStatus);
        setIsPaymentStatusVisible(true);
        setJobtypes(filters.jobType);
        setIsDueDateVisible(true);
        setIsJoinedDateVisible(true);
        setVehicleMake(filters.vehicleMake || []);
        setVehicleModel(filters.vehicleModel || []);
        setIsModifiedDate(filters.modifiedDate || null);
        setIsModifiedBy(filters.modifiedBy || []);
       
    };

    const clearFilter = () => {
        setStartDate(null);
        setEndDate(null);
        setStatus("");
        setBusinessTypes([]);
        setVariations([]);
        setWarranty("");
        setStockStatus("");
        setVehicleCategory([]);
        setServiceCategory([]);
        setTechnicianTypes([]);
        setServiceRateType([]);
        setQuoteStatus([]);
        setPaymentStatus([]);
        setJobtypes([]);
        setVehicleMake([]);
        setVehicleModel([]);
        setSelectedVehicleMakeIds([]);
        setIsStartDateVisible(false);
        setIsEndDateVisible(false);
        setIsStatusVisible(false);
        setIswarrantyVisible(false);
        setIsStockStatusVisible(false);
        setIsQuoteStatusVisible(false);
        setIsPaymentStatusVisible(false);
        setIsDueDateVisible(false);
        setIsJoinedDateVisible(false);
        setIsModifiedDate(null);
        setIsModifiedBy([]);
    
        onChange({
            status: "",
            businessType: [],
            fromDate: null,
            toDate: null,
            variation: [],
            vehicleCategory: [],
            warranty: "",
            stockStatus: "",
            servicesCategory: [],
            technicianType: [],
            serviceRateType: [],
            quoteStatus: [],
            paymentStatus: [],
            jobType: [],
            vehicleMake: [],
            vehicleModel: [],
            modifiedDate: null,
            modifiedBy: [],
        });

        setReset(true);
        setTimeout(() => {
            setReset(false);
            setCriteriaShow(false);
        }, 100);
    };

    const areFiltersActive = () => {
        return (
          (isEndDateFilter && endDate && isEndDateVisible) ||
          (isDueDateFilter && (startDate || endDate) && isDueDateVisible) ||
          (isJoinedDateFilter && (startDate || endDate) && IsJoinedDateVisible ) ||
          (isStatusFilter && status && isStatusVisible) ||
          (isWarentyFilter && warranty && isWarrantyVisible) ||
          (isStockFilter && stockStatus && isStockStatusVisible) ||
          (businessTypes && businessTypes.length > 0) ||
          (variations && variations.length > 0) ||
          (vehicleCategory && vehicleCategory.length > 0)||
          (serviceCategory && serviceCategory.length > 0)||
          (technicianTypes && technicianTypes.length > 0)||
          (serviceRateTypes && serviceRateTypes.length > 0)||
          (isQuoteStatusFilter && quoteStatus.length > 0)||
          (isFinanceStatusFiter && paymentStatus.length > 0)||
          (isJobTypeFilter && jobType.length > 0)||
          (vehicleMakeFilter && vehicleMake.length > 0) ||
          (vehicleModelFilter && vehicleModel.length > 0) ||
          (isModifiedByFilter && isModifiedBy && isModifiedBy.length > 0) ||
          (isModifiedDateFilter && !!isModifiedDate)
        );
    };      

    const removeTag = (tag) => {
        const updatedFilters = {
            status: status,
            businessType: [...businessTypes],
            fromDate: startDate,
            toDate: endDate,
            variation: [...variations],
            vehicleCategory: [...vehicleCategory],
            warranty: warranty,
            stockStatus: stockStatus,
            servicesCategory: [...serviceCategory],
            technicianType: [...technicianTypes],
            serviceRateType: [...serviceRateTypes],
            quoteStatus: [...quoteStatus],
            jobType: [...jobType],
            paymentStatus: [...paymentStatus],
            vehicleMake: [...vehicleMake],
            vehicleModel: [...vehicleModel],
            modifiedBy: [...isModifiedBy],
            modifiedDate: isModifiedDate,
            joinedDate: [
                    ...(startDate ? [startDate] : []),
                    ...(endDate ? [endDate] : [])
            ]
        };
    
        switch (tag) {
            case "startDate":
                setIsStartDateVisible(false);
                updatedFilters.fromDate = null;
                setStartDate(null);
                break;
            case "endDate":
                setIsEndDateVisible(false);
                updatedFilters.toDate = null;
                setEndDate(null);
                break;
            case "joinedDate":
                setIsStartDateVisible(false);
                setIsEndDateVisible(false);
                updatedFilters.fromDate = null;
                updatedFilters.toDate = null;
                setStartDate(null);
                setEndDate(null);
                break;
            case "dueDate":
                setIsDueDateVisible(false);
                setIsStartDateVisible(false); 
                setIsEndDateVisible(false);  
                updatedFilters.fromDate = null;
                updatedFilters.toDate = null;
                setStartDate(null);
                setEndDate(null);
                break;
            case "status":
                setIsStatusVisible(false);
                updatedFilters.status = null;
                setStatus(null);
                break;
            case "warranty":
                setIswarrantyVisible(false);
                updatedFilters.warranty = null;
                setWarranty(null);
                break;
            case "stockStatus":
                setIsStockStatusVisible(false);
                updatedFilters.stockStatus = null;
                setStockStatus(null);
                break;
            case "quoteStatus":
                setIsQuoteStatusVisible(false);
                updatedFilters.quoteStatus = null;
                setQuoteStatus(null);
                break;
            case "paymentStatus":
                setIsPaymentStatusVisible(false);
                updatedFilters.paymentStatus = null;
                setPaymentStatus(null);
                break;
            case "modifiedDate":
                updatedFilters.modifiedDate = null;
                setIsModifiedDate(null);
                break;
            default:
                if (updatedFilters.businessType.includes(tag)) {
                    updatedFilters.businessType = updatedFilters.businessType.filter((t) => t !== tag);
                    setBusinessTypes(updatedFilters.businessType);
                }
                if (updatedFilters.variation.includes(tag)) {
                    updatedFilters.variation = updatedFilters.variation.filter((t) => t !== tag);
                    setVariations(updatedFilters.variation);
                }                
                if (updatedFilters.vehicleCategory.includes(tag)) {
                    updatedFilters.vehicleCategory = updatedFilters.vehicleCategory.filter((t) => t !== tag);
                    setVehicleCategory(updatedFilters.vehicleCategory);  
                }
                if (updatedFilters.servicesCategory.includes(tag)) {
                    updatedFilters.servicesCategory = updatedFilters.servicesCategory.filter((t) => t !== tag);
                    setServiceCategory(updatedFilters.servicesCategory);  
                }
                if (updatedFilters.technicianType.includes(tag)) {
                    updatedFilters.technicianType = updatedFilters.technicianType.filter((t) => t !== tag);
                    setTechnicianTypes(updatedFilters.technicianType);  
                }
                if (updatedFilters.serviceRateType.includes(tag)) {
                    updatedFilters.serviceRateType = updatedFilters.serviceRateType.filter((t) => t !== tag);
                    setServiceRateType(updatedFilters.serviceRateType);  
                }
                if (updatedFilters.quoteStatus.includes(tag)) {
                    updatedFilters.quoteStatus = updatedFilters.quoteStatus.filter((t) => t !== tag);
                    setQuoteStatus(updatedFilters.quoteStatus);  
                }
                if (updatedFilters.paymentStatus.includes(tag)){
                    updatedFilters.paymentStatus = updatedFilters.paymentStatus.filter((t)=> t !== tag);
                    setPaymentStatus(updatedFilters.paymentStatus);
                }
                if (updatedFilters.jobType.includes(tag)){
                    updatedFilters.jobType = updatedFilters.jobType.filter((t)=> t !== tag);
                    setJobtypes(updatedFilters.jobType);
                }
                if (updatedFilters.vehicleMake.includes(tag)){
                    updatedFilters.vehicleMake = updatedFilters.vehicleMake.filter((t)=> t !== tag);
                    setVehicleMake(updatedFilters.vehicleMake);
                    if (updatedFilters.vehicleMake.length === 0) {
                        setSelectedVehicleMakeIds([]);
                    }
                }
                if (updatedFilters.vehicleModel.includes(tag)){
                    updatedFilters.vehicleModel = updatedFilters.vehicleModel.filter((t)=> t !== tag);
                    setVehicleModel(updatedFilters.vehicleModel);
                }
                if (updatedFilters.modifiedBy.includes(tag)) {
                    updatedFilters.modifiedBy = updatedFilters.modifiedBy.filter((t) => t !== tag);
                    setIsModifiedBy(updatedFilters.modifiedBy);
                }
                break;
        }
        onChange(updatedFilters);
    };

    const Checkbox = React.forwardRef(({ onClick, ...rest }, ref) => {
        return (
            <>
                <label className="table-checkbox">
                    <input
                        type="checkbox"
                        ref={ref}
                        onClick={onClick}
                        {...rest}
                    />
                    <span className="checkmark"></span>
                </label>
            </>
        )
    })

    const subHeaderComponent = (
        <>
        <div className={tableTitle=='Inventory Updates'&&'inventory'}>
            <div className="table-header">
                <div className="table-title-section">
                    <span className="table-title">{tableTitle}</span>
                    <span className="table-count">
                        {((totalRows) || 0).toString().padStart(2, '0')} {(totalRows) === 1 ? countTextSingular : countTextPlural}
                    </span>
                </div>
                <div className="add-table-section">
                    {ButtonValue && (
                        <TableButton
                            ButtonValue={ButtonValue}
                            to={to}
                            className="add-new-btn"
                            style={{ maxwidth: '150px', width: '100%' }}
                        />
                    )}
                </div>
            </div>
          
            <div className="color-differentiation-container">
                {vendorGlobalEnabled && (
                    <div className="color-differentiation desktop-view">
                        <div className="differentiation">
                            <div className="admin-color">
                                <div className="color-box"></div>
                                <span className="color-text">Added by Super Admin</span>
                            </div>
                            <div className="vendor-color">
                                <div className="color-box"></div>
                                <span className="color-text">Added by Vendor</span>
                            </div>
                        </div>
                    </div>

                )}
                <div className='search-container'>   
                    {isShowFilterField && (
                        <FilterDropdown
                            title={filterTitle}
                            isStartDateFilter={isStartDateFilter}
                            isEndDateFilter={isEndDateFilter}
                            isStatusFilter={isStatusFilter}
                            isBusinessTypeFilter={isBusinessTypeFilter}
                            isServiceCategoryFilter={isServiceCategoryFilter}
                            isTechnicianTypeFilter={isTechnicianTypeFilter}
                            isServiceRateFilter={isServiceRateFilter}
                            isVariationFilter={isVariationFilter}
                            isVehicleCategoryFilter={isVehicleCategoryFilter}
                            isWarentyFilter={isWarentyFilter}
                            isQuoteStatusFilter={isQuoteStatusFilter}
                            isStockFilter={isStockFilter}
                            show={show}
                            onhandleFilter={handleFilterChange}
                            isReset={reset}
                            businessTypesOptions={businessTypesOptions}
                            variationOptions={variationOptions}
                            vehicleCategoryOptions={vehicleCategoryOptions}
                            serviceCategoryOptions={serviceCategoryOptions}
                            quoteStatusOption={quoteStatusOption}
                            technicianTypeOptions={technicianTypeOptions}
                            serviceRateTypeOptions={serviceRateTypeOptions}
                            paymentStatusOption={paymentStatusOption}
                            jobTypeOption={jobTypeOption}
                            isFinanceStatusFiter={isFinanceStatusFiter}
                            isDueDateFilter={isDueDateFilter}
                            isJoinedDateFilter={isJoinedDateFilter}
                            isJobTypeFilter={isJobTypeFilter}
                            vehicleMakeLists= {vehicleMakeLists}
                            vehicleMakeOptions={vehicleMakeOptions}
                            vehicleModelOptions={vehicleModelOptions}
                            vehicleModelFilter={vehicleModelFilter}
                            vehicleMakeFilter={vehicleMakeFilter}
                            isModifiedDateFilter={isModifiedDateFilter}
                            isModifiedByFilter={isModifiedByFilter}
                            modifiedByOptions={modifiedByOptions}
                            handleModifiedByChange={handleModifiedByChange}
                            onModifiedBySearch={onModifiedBySearch}
                            vehicleModelLoading={vehicleModelLoading}
                            currentFilters={{
                                status,
                                businessType: businessTypes,
                                fromDate: startDate,
                                toDate: endDate,
                                variation: variations,
                                vehicleCategory: vehicleCategory,
                                warranty,
                                stockStatus,
                                servicesCategory: serviceCategory,
                                technicianType: technicianTypes,
                                serviceRateType: serviceRateTypes,
                                quoteStatus: quoteStatus,
                                paymentStatus: paymentStatus,
                                jobType: jobType,
                                vehicleMake,
                                vehicleModel,
                                modifiedBy: isModifiedBy,
                                modifiedDate: isModifiedDate
                            }}
                        />
                    )}
    
                    {isShowSearch && (
                        <FilterComponent handleSearch={handleSearch} />
                    )}
 
                    <div className="add-table-section-mobile">
                        {ButtonValue && (
                            <TableButton
                                ButtonValue={ButtonValue}
                                to={to}
                                className="add-new"
                                style={{ width: '100%' }}
                            />
                        )}
                        {vendorGlobalEnabled && (
                        <div className="color-differentiation">
                        <div className="differentiation">
                            <div className="admin-color">
                                <div className="color-box"></div>
                                <span className="color-text">Added by Super Admin</span>
                            </div>
                            <div className="vendor-color">
                                <div className="color-box"></div>
                                <span className="color-text">Added by Vendor</span>
                            </div>
                            </div>
                    </div>  
                        )}
                    </div>
                </div>
                
            </div>
        </div>
            {
            showtab&&<InventoryTab onTabChange={onTabChange} totalItemsForTabs={totalItemsForTabs} />
            }
            {showCriteria && (
                <div className="tag-box vendor-tag-box">
                    <div className="tags-container">
                        <span className="applied-filter apply-top">Applied Filters:</span>
                       <div className="filter-container">
                        {isJoinedDateFilter && ((startDate && isStartDateVisible) || (endDate && isEndDateVisible)) && (
                            <div className="filter-data-container filter-data">
                                <div className="tag table-pop due-tag">
                                    <div className="applied-filter">
                                        Joined Date:
                                        <span className="joined-date-range">
                                            {startDate && <span>{format(startDate, 'yyyy-MM-dd')}</span>}
                                            <img className="arrow-right-icon" src={Icons.arrow_right} />
                                            {endDate && <span>{format(endDate, 'yyyy-MM-dd')}</span>}
                                        </span>
                                    </div>
                                    <span className="close-btn" onClick={() => removeTag("joinedDate")} id="react-data-table-remove-joined-date-filter">
                                        <img src={Icons.x} />
                                    </span>
                                </div>
                            </div>
                        )}

                        {isDueDateFilter && ((startDate && isStartDateVisible) || (endDate && isEndDateVisible)) && (
                            <div className="filter-data-container filter-data">
                                <div className="tag table-pop due-tag">
                                    <div className="applied-filter">
                                        Due Date: 
                                         <span className="joined-date-range">
                                        {startDate && <span>  {format(startDate, 'yyyy-MM-dd')}</span>} 
                                        <img className="arrow-right-icon" src={Icons.arrow_right} />
                                        {endDate && <span>  {format(endDate, 'yyyy-MM-dd')}</span>}
                                        </span>
                                    </div>
                                    <span className="close-btn" onClick={() => removeTag("dueDate")} id="react-data-table-remove-due-date-filter">
                                        <img src={Icons.x} />
                                    </span>
                                </div>
                            </div>
                        )}
                        {isWarentyFilter && warranty && isWarrantyVisible && (
                        <div className="filter-data-container">  
                            <div className="tag table-pop">
                                <div className="applied-filter">Warranty: <span>{warranty === 'applicable' ? 'Applicable' : 'Not Applicable'}</span></div>
                                <span className="close-btn" onClick={() => removeTag("warranty")} id="react-data-table-remove-warranty-filter">
                                    <img src={Icons.x}></img>
                                </span>
                            </div>
                           </div> 
                        )}
                        {isStockFilter && stockStatus && isStockStatusVisible && (
                        <div className="filter-data-container">  
                            <div className="tag table-pop">
                                <div className="applied-filter">Stock Status: <span>{stockStatus === 'available' ? 'Available' : 'Out of Stock'}</span></div>
                                <span className="close-btn" onClick={() => removeTag("stockStatus")} id="react-data-table-remove-stock-status-filter">
                                    <img src={Icons.x}></img>
                                </span>
                            </div>
                        </div>
                        )}
                        {businessTypes && businessTypes.length > 0 && (
                        <div className="filter-data-container">
                            <div className="filter-data">
                                <span className="applied-filter inner-tag">Business Type:</span>
                                <div className="type">
                                    {businessTypes.map((typeId, index) => {
                                        const businessType = businessTypesOptions.find(option => option.id === typeId);
                                        return businessType ? (
                                            <div key={index} className="tag table-pop">
                                                {businessType.name}
                                                <span className="close-btn" onClick={() => removeTag(typeId)} id={`react-data-table-remove-business-type-filter-${typeId}`}>
                                                    <img src={Icons.x}></img>
                                                </span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                        )}
                        {variations && variations.length > 0 && (
                        <div className="filter-data-container">
                            <div className="filter-data">
                                <span className="applied-filter inner-tag">Variation :</span>
                                <div className="type">
                                    {variations.map((typeId, index) => {
                                        const variation = variationOptions.find(option => option.id === typeId);
                                        return variation ? (
                                            <div key={index} className="tag table-pop">
                                                {variation.name}
                                                <span className="close-btn" onClick={() => removeTag(typeId)} id={`react-data-table-remove-variation-filter-${typeId}`}>
                                                    <img src={Icons.x}></img>
                                                </span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                        )}
                        {vehicleCategory && vehicleCategory.length > 0 && (
                        <div className="filter-data-container">
                            <div className="filter-data">
                                <span className="applied-filter inner-tag">Vehicle Category :</span>
                                <div className="type">
                                    {vehicleCategory.map((typeId, index) => {
                                        const vehicleCategory = vehicleCategoryOptions.find(option => option.id === typeId);
                                        return vehicleCategory ? (
                                            <div key={index} className="tag table-pop">
                                                {vehicleCategory.name}
                                                <span className="close-btn" onClick={() => removeTag(typeId)} id={`react-data-table-remove-vehicle-category-filter-${typeId}`}>
                                                    <img src={Icons.x}></img>
                                                </span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                        )}
                        {serviceCategory && serviceCategory .length > 0 && (
                        <div className="filter-data-container">
                            <div className="filter-data">
                                <span className="applied-filter inner-tag">Service Category:</span>
                                <div className="type">
                                    {serviceCategory.map((typeId, index) => {
                                        const servicesCategory = serviceCategoryOptions.find(option => option.id === typeId);
                                        return servicesCategory ? (
                                            <div key={index} className="tag table-pop">
                                                {servicesCategory.name}
                                                <span className="close-btn" onClick={() => removeTag(typeId)} id={`react-data-table-remove-service-category-filter-${typeId}`}>
                                                    <img src={Icons.x}></img>
                                                </span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                        )}
                        {isStatusFilter && status && isStatusVisible && (
                            <div className="filter-data-container">  
                            <div className="tag table-pop">
                                    <div className="applied-filter">Status: <span>{status}</span></div>
                                    <span className="close-btn" onClick={() => removeTag("status")} id="react-data-table-remove-status-filter">
                                        <img src={Icons.x}></img>
                                    </span>
                                </div>
                            </div> 
                        )}
                        {technicianTypes && technicianTypes.length > 0 && (
                         <div className="filter-data-container">   
                            <div className="filter-data">
                                <span className="applied-filter inner-tag">Technician Type: </span>
                                <div className="type">
                                    {technicianTypes.map((typeId, index) => {
                                        let technicianType = technicianTypeOptions.find(option => 
                                            option.value === typeId.value
                                        );
                                        if (!technicianType) {
                                            technicianTypeOptions.forEach(option => {
                                                if (option.options) {
                                                    const subOption = option.options.find(sub => sub.value === typeId.value);
                                                    if (subOption) {
                                                        technicianType = subOption;
                                                    }
                                                }
                                            });
                                        }
                                        return technicianType ? (
                                            <div key={index} className="tag table-pop">
                                                {technicianType.label}
                                                <span className="close-btn" onClick={() => removeTag(typeId)} id={`react-data-table-remove-technician-type-filter-${typeId.value || typeId}`}>
                                                    <img src={Icons.x}></img>
                                                </span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                        )}
                        {serviceRateTypes && serviceRateTypes.length > 0 && (
                        <div className="filter-data-container">
                            <div className="filter-data">
                                <span className="applied-filter inner-tag">Service Rate Type:</span>
                                <div className="type">
                                    {serviceRateTypes.map((typeId, index) => {
                                        const serviceRateType = serviceRateTypeOptions.find(option => option.id === typeId);
                                        return serviceRateType ? (
                                            <div key={index} className="tag table-pop">
                                                {serviceRateType.name}
                                                <span className="close-btn" onClick={() => removeTag(typeId)} id={`react-data-table-remove-service-rate-type-filter-${typeId}`}>
                                                    <img src={Icons.x}></img>
                                                </span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                        )}
                        {isQuoteStatusFilter && quoteStatus.length > 0 && (
                        <div className="filter-data-container">
                            <div className="filter-data">
                                <span className="applied-filter inner-tag ">Status:</span>
                                <div className="type">
                                    {quoteStatus.map((typeId, index) => {
                                        const quoteStatus = quoteStatusOption.find(option => option.id === typeId);
                                        return quoteStatus ? (
                                            <div key={index} className="tag table-pop">
                                                {quoteStatus.name}
                                                <span className="close-btn" onClick={() => removeTag(typeId)} id={`react-data-table-remove-quote-status-filter-${typeId}`}>
                                                    <img src={Icons.x}></img>
                                                </span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                        )}
                        {isFinanceStatusFiter && paymentStatus.length > 0 && isPaymentStatusVisible && (
                        <div className="filter-data-container">
                            <div className="filter-data">
                                <span className="applied-filter inner-tag "> Payment Status:</span>
                                <div className="type">
                                    {paymentStatus.map((typeId, index) => {
                                        const paymentStatus = paymentStatusOption.find(option => option.id === typeId);
                                        return paymentStatus ? (
                                            <div key={index} className="tag table-pop">
                                                {paymentStatus.name}
                                                <span className="close-btn" onClick={() => removeTag(typeId)} id={`react-data-table-remove-payment-status-filter-${typeId}`}>
                                                    <img src={Icons.x}></img>
                                                </span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                        )}
                       {isJobTypeFilter && jobType.length > 0 && (
                        <div className="filter-data-container">
                            <div className="filter-data">
                                <span className="applied-filter inner-tag ">Job Type:</span>
                                <div className="type">
                                    {jobType.map((typeId, index) => {
                                        const jobType = jobTypeOption.find(option => option.id === typeId);
                                        return jobType ? (
                                            <div key={index} className="tag table-pop">
                                                {jobType.name}
                                                <span className="close-btn" onClick={() => removeTag(typeId)} id={`react-data-table-remove-job-type-filter-${typeId}`}>
                                                    <img src={Icons.x}></img>
                                                </span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                        )}
                        {vehicleMakeFilter && vehicleMake.length > 0 && (
                        <div className="filter-data-container">
                            <div className="filter-data">
                                <span className="applied-filter inner-tag">Vehicle Make:</span>
                                <div className="type">
                                    {vehicleMake.map((makeId, index) => {
                                        const make = vehicleMakeOptionsFlat.find(option => option.id === makeId);
                                        return make ? (
                                            <div key={index} className="tag table-pop">
                                                {make.name}
                                                <span className="close-btn" onClick={() => removeTag(makeId)} id={`react-data-table-remove-vehicle-make-filter-${makeId}`}>
                                                    <img src={Icons.x}></img>
                                                </span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                        )}
                        {vehicleModelFilter && vehicleModel.length > 0 && (
                        <div className="filter-data-container">
                            <div className="filter-data">
                                <span className="applied-filter inner-tag">Vehicle Model:</span>
                                <div className="type">
                                    {vehicleModel.map((modelId, index) => {
                                        const model = vehicleModelOptionsFlat.find(option => option.id === modelId);
                                        return model ? (
                                            <div key={index} className="tag table-pop">
                                                {model.name}
                                                <span className="close-btn" onClick={() => removeTag(modelId)} id={`react-data-table-remove-vehicle-model-filter-${modelId}`}>
                                                    <img src={Icons.x}></img>
                                                </span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                        )}
                        {isModifiedByFilter && isModifiedBy && isModifiedBy.length > 0 && (
                        <div className="filter-data-container">
                            <div className="filter-data">
                                <span className="applied-filter inner-tag">Modified By:</span>
                                <div className="type">
                                    {isModifiedBy.map((id, index) => {
                                        const opt = modifiedByOptions.find(o => o.value === id);
                                        const label = opt ? opt.label : String(id);
                                        return (
                                            <div key={index} className="tag table-pop">
                                                {label}
                                                <span className="close-btn" onClick={() => removeTag(id)} id={`react-data-table-remove-modified-by-filter-${id}`}>
                                                    <img src={Icons.x}></img>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        )}
                        {/* {isModifiedByFilter && technicianTypes.length > 0 && (
                         <div className="filter-data-container">   
                            <div className="filter-data">
                                <span className="applied-filter inner-tag">Modified By: </span>
                                <div className="type">
                                    {technicianTypes.map((typeId, index) => {
                                        let technicianType = technicianTypeOptions.find(option => 
                                            option.value === typeId.value
                                        );
                                        if (!technicianType) {
                                            technicianTypeOptions.forEach(option => {
                                                if (option.options) {
                                                    const subOption = option.options.find(sub => sub.value === typeId.value);
                                                    if (subOption) {
                                                        technicianType = subOption;
                                                    }
                                                }
                                            });
                                        }
                                        return technicianType ? (
                                            <div key={index} className="tag table-pop">
                                                {technicianType.label}
                                                <span className="close-btn" onClick={() => removeTag(typeId)} id={`react-data-table-remove-business-type-filter-${typeId}`}>
                                                    <img src={Icons.x}></img>
                                                </span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                        )} */}
                           {isModifiedDateFilter && isModifiedDate && (
                            <div className="filter-data-container filter-data">
                                <div className="tag table-pop due-tag">
                                    <div className="applied-filter">
                                        Modified Date:
                                        <span className="joined-date-range">
                                            {isModifiedDate && <span>{isModifiedDate}</span>}
                                        </span>
                                    </div>
                                    <span className="close-btn" onClick={() => removeTag("modifiedDate")} id="react-data-table-remove-modified-date-filter">
                                        <img src={Icons.x} />
                                    </span>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                    <div className="filter-btn-container">
                            <button className="filter-btn" onClick={clearFilter} id="clear-all-btn">
                                Clear All
                            </button>
                        </div>
                </div>
            )}
        </>
    );

    const emptyStateProps = {
        isLoading: isLoading,
        globalSetting: globalSetting,
        noRecordsMessage: noRecordsMessage,
        globalSettingOffMessage: globalSettingOffMessage,
        noFilterMatchMessage: noFilterMatchMessage,
        isFilterApplied: isFilterApplied
    };
    return (
        <div className={`data-table pt-0 vendor-table ${className}`}>
         
            <div className="header-part">
                <div className="table-subheader">
                    {subHeaderComponent}
                </div>
            </div>
       
            <DataTable
                fixedHeader
                fixedHeaderScrollHeight="calc(100vh - 64px - 120px)" 
                className={`dataTable-container${vendorGlobalEnabled ? ' vendor-data-tables' : ''} ${className}`}
                columns={tableColumns}
                selectableRowsComponent={Checkbox}
                selectableRowsHighlight
                highlightOnHover
                overflowY
                onSelectedRowsChange={handleSelected}
                noDataComponent={<EmptyComponent {...emptyStateProps} />}
                data={items}
                paginationComponent={() => (
                    <PaginationComponent
                        totalPages={totalPages}
                        itemsPerPage={pageSize}
                        currentPage={currentPage}
                        onPageChange={(page) => onChange({ page })}
                        onPageSizeChange={(size) => onChange({ pageSize: size, size, page: 1 })}
                        isExport={isExport}
                        onExcelClick={onExcelClick}
                        isDownloadLoading={isDownloadLoading}
                    />
                )}
                sortIcon={sortIcon}
                pagination={true}
                paginationServer={true}
                onSort={customSort}
                progressPending={isLoading}
                sortServer
                responsive
                subHeaderComponent={subHeaderComponent}
                persistTableHead={false}
                conditionalRowStyles={conditionalRowStyles}
            />
        </div>
    );
};

ReactDataTable.propTypes = {
    columns: PropTypes.array,
    totalRows: PropTypes.number,
    onChange: PropTypes.func,
    sortAction: PropTypes.func,
    noRecordsMessage: PropTypes.any,
    globalSettingOffMessage: PropTypes.any,
    noFilterMatchMessage: PropTypes.string,
    isFilterApplied: PropTypes.bool
};
export default ReactDataTable;
