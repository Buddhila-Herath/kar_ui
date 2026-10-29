import React, { useState, useMemo, useEffect, useRef, useCallback,forwardRef  } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Dropdown, Button, Menu, Typography, Checkbox, Tag, Radio } from 'antd';
import ReactDatePicker from '../datepicker/ReactDatePicker';
import MultipleSelect from '../select/MultipleSelect';
import Icons from "../../utils/icons";
import { format } from "date-fns"; 
import { dateFormat } from '../../constants';
import GroupMultipleSelect from "../../shared/select/GroupMultipleSelect";
import CustomGroupSelect from '../select/CustomGroupSelect';
import CustomSubGroupSelect from '../select/CustomSubGroupSelect';
import CustomMultiSelectWithApiSearch from '../select/CustomMultiSelectWithApiSearch';

const FilterDropdown =forwardRef((props,ref) => {

    const {
        title,
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
        onhandleFilter,
        businessTypesOptions,
        variationOptions,
        vehicleCategoryOptions,
        isReset,
        currentFilters,
        technicianTypeOptions,
        serviceRateTypeOptions,
        serviceCategoryOptions,
        isQuoteStatusFilter,
        quoteStatusOption,
        paymentStatusOption,
        isFinanceStatusFiter,
        isDueDateFilter,
        isJoinedDateFilter,
        isDateFilter,
        jobTypeOption,
        isJobTypeFilter,
        vehicleMakeFilter,
        vehicleModelFilter,
        vehicleMakeLists,
        vehicleMakeOptions,
        vehicleModelOptions,
        vehicleModelLoading,isModifiedDateFilter,isModifiedByFilter
        ,modifiedByOptions
        ,onModifiedBySearch
        ,isPriorityFilter
        ,priorityOption
    } = props;
    
    const dispatch = useDispatch();
    const [visible, setVisible] = useState(false);
    const menuRef = useRef(null);
    const daysBeforeToday = 7;
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - daysBeforeToday);
    const today = new Date();
   
    const [filters, setFilters] = useState({
        page: 1,
        status: "",
        businessType: [],
        // fromDate: format(currentDate, dateFormat.NATIVE),
        // toDate: format(new Date(), dateFormat.NATIVE),
        fromDate: null,
        toDate: null,
        variation: [],
        warranty: "",
        stockStatus: "",
        vehicleCategory: [],
        servicesCategory:[],
        technicianType:[],
        serviceRateType:[],
        quoteStatus: [],
        paymentStatus: [], 
        jobType: [],  
        businessType: [],
        vehicleMake: [],
        vehicleModel: [],
        modifiedDate: null,
        modifiedBy: [],
        priority: [],
    });
    const [modifiedByResetTick, setModifiedByResetTick] = useState(0);
    const [modifiedByClearSignal, setModifiedByClearSignal] = useState(0);


    const [dateErrors, setDateErrors] = useState({
        fromDate: "",
        toDate: ""
    });

    const handleStatusChange = (value) => {
        setFilters((prev) => ({
            ...prev,
            status: value,
        }));
    };

    const handleBusinessTypeChange = (updatedBusinessTypes) => {
        setFilters((prev) => ({
            ...prev,
            businessType: updatedBusinessTypes, 
        }));
    };
    
    const handleStartDateChange = (date) => {
        setFilters((prev) => ({
            ...prev,
            fromDate: date ? format(date, dateFormat.API_NATIVE) : null
        }));
        setDateErrors(prev => ({
            ...prev,
            fromDate: ""
        }));
    };

    const handleEndDateChange = (date) => {
        setFilters((prev) => ({
            ...prev,
            toDate: date ? format(date, dateFormat.API_NATIVE) : null
        }));
        setDateErrors(prev => ({
            ...prev,
            toDate: ""
        }));
    };
    const handleModifiedDateChange = (date) => {
        setFilters((prev) => ({
            ...prev,
            modifiedDate: date ? format(date, dateFormat.API_NATIVE) : null
        }));
    };

    const handleFilterNow = () => {
        if ((isDueDateFilter || isDateFilter) && (filters.fromDate || filters.toDate) && (!filters.fromDate || !filters.toDate)) {
            setDateErrors({
                fromDate: !filters.fromDate ? "Please select from date" : "",
                toDate: !filters.toDate ? "Please select to date" : ""
            });
            return;
        }
        if (isJoinedDateFilter && (filters.fromDate || filters.toDate) && (!filters.fromDate || !filters.toDate)) {
            setDateErrors({
                fromDate: !filters.fromDate ? "Please select from date" : "",
                toDate: !filters.toDate ? "Please select to date" : ""
            });
            return;
        }
        const cleanedFilters = Object.fromEntries(
            Object.entries(filters).map(([key, value]) => {
            if (Array.isArray(value) && value.length === 0) return [key, []];
            if (!value) return [key, null];
            return [key, value];
            })
        );

        onhandleFilter(cleanedFilters); 
        // Clear the search text in Modified By multi-select without refreshing options
        setModifiedByClearSignal(prev => prev + 1);
        setVisible(false);    
    
    };

    const handleClose = () => {
        setVisible(false);
        // resetFilters();

        setFilters((prevFilters) => ({
            ...prevFilters,
            warranty: currentFilters.warranty || "",
            stockStatus: currentFilters.stockStatus || "",
            variation: currentFilters.variation || variationOptions,
            vehicleCategory: currentFilters.vehicleCategory || vehicleCategoryOptions,
            servicesCategory: currentFilters.servicesCategory || serviceCategoryOptions,
            technicianType: currentFilters.technicianType || technicianTypeOptions,
            serviceRateType: currentFilters.serviceRateType|| serviceRateTypeOptions,
            quoteStatus: currentFilters.quoteStatus|| quoteStatusOption,
            paymentStatus: currentFilters.paymentStatus || paymentStatusOption,
            jobType: currentFilters.jobType || jobTypeOption,
            fromDate: currentFilters.fromDate || null, 
            toDate: currentFilters.toDate || null,
            businessType: currentFilters.businessType || businessTypesOptions,
            status: currentFilters.status || "",
            vehicleMake: currentFilters.vehicleMake || [],
            vehicleModel: currentFilters.vehicleModel || [],
            modifiedDate: currentFilters.modifiedDate || null,
            modifiedBy: currentFilters.modifiedBy || [],
        }));
    };
 
    const handleVariationChange = (updatedVariations) => {
        setFilters((prev) => ({
            ...prev,
            variation: updatedVariations, 
        }));
    }

    const handleVehicleCategory = (updatedVehicleCategory) => {
        setFilters((prev) => ({
            ...prev,
            vehicleCategory: updatedVehicleCategory, 
        }));
    }

    const handleWarrantyChange = (value) => {
        setFilters((prev) => ({
            ...prev,
            warranty: value,
        }));
    };

    const handlestockStatusChange = (value) => {
        setFilters((prev) => ({
            ...prev,
            stockStatus: value,
        }));
    };

    const handleserviceCategoryChange = (updatedserviceCategory) => {
        setFilters((prev) => ({
            ...prev,
            servicesCategory: updatedserviceCategory,
        }));
    };

    const handletechnicianTypeChange = (updatedtechnicianTypes) => {
        setFilters((prev) => ({
            ...prev,
            technicianType: updatedtechnicianTypes,
        }));
    };

    const handleserviceRateTypeChange = (updatedserviceRateTypes) => {
        setFilters((prev) => ({
            ...prev,
            serviceRateType: updatedserviceRateTypes,
        }));
    };

    const handleQuoteStatus = (updatedQuoteStatus) => {
        setFilters((prev) => ({
            ...prev,
            quoteStatus: updatedQuoteStatus, 
        }));
    }

    const handleModifiedByChangeLocal = (updatedModifiedBy) => {
        setFilters((prev) => ({
            ...prev,
            modifiedBy: updatedModifiedBy || [],
        }));
    };
    
    const handlePaymentStatus= (updatedPaymentStatus)=>{
        setFilters((prev) => ({
            ...prev,
            paymentStatus: updatedPaymentStatus, 
        }));
    }
    
    const handleJobtype=(updatedJobType)=>{
        setFilters((prev) => ({
            ...prev,
            jobType: updatedJobType, 
        }));
    }

    const handlePriorityChange = (updatedPriority) => {
        setFilters((prev) => ({
            ...prev,
            priority: updatedPriority, 
        }));
    }
    useEffect(() => {
        if (currentFilters && isReset === false) {  
            setFilters((prevFilters) => ({
                ...prevFilters,
                warranty: currentFilters.warranty || "",
                stockStatus: currentFilters.stockStatus || "",
                variation: currentFilters.variation || variationOptions,
                vehicleCategory: currentFilters.vehicleCategory || vehicleCategoryOptions,
                servicesCategory: currentFilters.servicesCategory || serviceCategoryOptions,
                technicianType: currentFilters.technicianType || technicianTypeOptions,
                serviceRateType: currentFilters.serviceRateType|| serviceRateTypeOptions,
                quoteStatus: currentFilters.quoteStatus|| quoteStatusOption,
                paymentStatus: currentFilters.paymentStatus || paymentStatusOption,
                jobType: currentFilters.jobType || jobTypeOption,
                fromDate: currentFilters.fromDate || null,
                toDate: currentFilters.toDate || null,
                businessType: currentFilters.businessType || businessTypesOptions,
                status: currentFilters.status || "",
                vehicleMake: currentFilters.vehicleMake || vehicleMakeOptions,
                vehicleModel: currentFilters.vehicleModel || vehicleModelOptions,
                modifiedDate: currentFilters.modifiedDate || null,
                modifiedBy: currentFilters.modifiedBy || [],
            }));
        }
    }, [currentFilters]);

    useEffect(() => {
        if (isReset) {
            setModifiedByResetTick((prev) => prev + 1);
            if (typeof onModifiedBySearch === 'function') {
                onModifiedBySearch("");
            }
        }
    }, [isReset, onModifiedBySearch]);

    useEffect(() => {
        if (isReset) {
           resetFilters();
        }
    }, [isReset]);

    const resetFilters = () => {
        setFilters({
            page: 1,
            status: "",
            businessType: [],
            fromDate: null,
            toDate: null,
            variation: [],
            warranty: "",
            stockStatus: "",
            vehicleCategory: [],
            servicesCategory: [],
            technicianType: [],
            serviceRateType: [],
            quoteStatus: [],
            paymentStatus: [],
            jobType: [],
            businessType: [],
            vehicleMake: [],
            vehicleModel: [],
            modifiedDate: null,
            modifiedBy: [],
            priority: [],
        });
        if (typeof onModifiedBySearch === 'function') {
            onModifiedBySearch("");
        }
        setVisible(false);
    };

    const menu = (
        <Menu className="filter-menu filter-pop">
            <div className="pop-head ">
                <Typography.Title level={5} style={{ marginBottom: 0 }}>{title}</Typography.Title>
                <img className='filter-close' id="filter-close-btn" onClick={handleClose} src={Icons.close_icon} alt="Filter Icon" />
            </div>

           {isDateFilter && (
                <div className="mb-6 joined-date filter-picker date-filter-section">
                    <label className="joined">Date</label>

                    <div className="filters-opt from-date">
                        <label className="form-label">
                            From:
                            <img src={Icons.asterisk} className="required" />
                        </label>
                        <ReactDatePicker 
                            onChangeDate={handleStartDateChange} 
                            maxDate={today}
                            className="filter-picker"
                            newStartDate={filters.fromDate ? new Date(filters.fromDate) : null}
                            readOnlyref={false}
                            id="from-date-picker"
                        />
                        {dateErrors.fromDate && (
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{dateErrors.fromDate}</h6>
                            </div>
                        )}
                    </div>

                    <div className="joined-date to-picker">
                        <label className="form-label">
                            To:
                            <img src={Icons.asterisk} className="required" />
                        </label>
                        <ReactDatePicker 
                            onChangeDate={handleEndDateChange} 
                            newStartDate={filters.toDate ? new Date(filters.toDate) : null}
                            readOnlyref={false}
                            maxDate={today}
                             popperPlacement="bottom-start"
                             className="filter-picker"
                            minDate={filters.fromDate ? new Date(filters.fromDate) : null}
                            id="to-date-picker"
                        />
                        {dateErrors.toDate && (
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{dateErrors.toDate}</h6>
                            </div>
                        )}
                    </div>
                </div>
            )}

           {isJoinedDateFilter && (
                <div className="mb-6 joined-date filter-picker">
                    <label className="joined">Joined Date</label>

                    <div className="filters-opt from-date">
                        <label className="form-label">
                            From:
                            <img src={Icons.asterisk} className="required" />
                        </label>
                        <ReactDatePicker 
                            onChangeDate={handleStartDateChange} 
                            maxDate={today}
                            className="filter-picker"
                            newStartDate={filters.fromDate ? new Date(filters.fromDate) : null}
                            readOnlyref={false}
                            id="from-date-picker"
                        />
                        {dateErrors.fromDate && (
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{dateErrors.fromDate}</h6>
                            </div>
                        )}
                    </div>

                    <div className="mb-6 joined-date to-picker">
                        <label className="form-label">
                            To:
                            <img src={Icons.asterisk} className="required" />
                        </label>
                        <ReactDatePicker 
                            onChangeDate={handleEndDateChange} 
                            newStartDate={filters.toDate ? new Date(filters.toDate) : null}
                            readOnlyref={false}
                            maxDate={today}
                             popperPlacement="bottom-start"
                             className="filter-picker"
                            minDate={filters.fromDate ? new Date(filters.fromDate) : null}
                            id="to-date-picker"
                        />
                        {dateErrors.toDate && (
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{dateErrors.toDate}</h6>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isEndDateFilter && (
                <div className="mb-6">
                    <label className="form-label">To:
                        <img src={Icons.asterisk} className="required" />
                    </label>
                    <ReactDatePicker  onChangeDate={handleEndDateChange} newStartDate={filters.toDate ? new Date(filters.toDate) : null} readOnlyref={true} id="to-date-picker" /> 
                </div>
            )}

             {isDueDateFilter && (
                <div className="mb-6 filter-date">
                     <label className='due-date'>Due Date</label>
                    <div className="from-date">
                        <label className="form-label">
                            From:
                            <img src={Icons.asterisk} className="required" />
                        </label>
                        <ReactDatePicker 
                            onChangeDate={handleStartDateChange} 
                            newStartDate={filters.fromDate ? new Date(filters.fromDate) : null}
                            readOnlyref={false}
                            id="from-date-picker"
                        /> 
                        {dateErrors.fromDate && 
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{dateErrors.fromDate}</h6>
                            </div>
                        }
                    </div>
                    <label className="form-label">
                        To:
                        <img src={Icons.asterisk} className="required" />
                    </label>
                    <ReactDatePicker 
                        onChangeDate={handleEndDateChange} 
                        newStartDate={filters.toDate ? new Date(filters.toDate) : null} 
                        readOnlyref={false}
                        minDate={filters.fromDate ? new Date(filters.fromDate) : null}
                        id="to-date-picker"
                    />
                    {dateErrors.toDate && 
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{dateErrors.toDate}</h6>
                      </div>
                    }
                </div>
            )}
            
             {isTechnicianTypeFilter && (
                <div className="mb-6 ">
                    <label>Technician Type</label>
                    <GroupMultipleSelect 
                        groupedOptions={technicianTypeOptions} 
                        listStyle={{ marginTop: '4px' }}
                        value={filters.technicianType}
                        onChange={handletechnicianTypeChange}
                        id="technician-type-select"
                    />
                </div>
            )}

             {isStatusFilter && (
                <div className="mb-6 filters-opt vendor-status tech-status pop-up-line"> 
                    <label>Status</label>
                    <Radio.Group className="custom-radio-group d-flex" onChange={e => handleStatusChange(e.target.value)} value={filters.status}>
                        <Radio.Button value="active" style={{ textAlign: 'center' }} id="active-btn">Active</Radio.Button>
                        <Radio.Button value="inactive" style={{ textAlign: 'center' }} id="inactive-btn">Inactive</Radio.Button>
                    </Radio.Group>
                </div>
            )}

            {isBusinessTypeFilter && (
                <div className="mb-6 filters-opt pop-up-line">
                    <label>Business Type</label>
                    <MultipleSelect 
                        placeholder="Select Business Type "
                        options={businessTypesOptions} 
                        maxTagsToShow="2"
                        listStyle={{ marginTop: '4px' }}
                        value={filters.businessType} 
                        onChange={handleBusinessTypeChange} 
                        id="business-type-select"
                    />
                </div>
            )}  

            {isServiceCategoryFilter && (
                <div className="mb-6">
                    <label>Service Category</label>
                    <MultipleSelect 
                        options={serviceCategoryOptions} 
                        maxTagsToShow="1"
                        listStyle={{ marginTop: '4px' }}
                        value={filters.servicesCategory} 
                        onChange={handleserviceCategoryChange} 
                        id="service-category-select"
                    />
                </div>
            )}

            {isServiceRateFilter && (
                <div className="mb-6 pop-up-line">
                    <label>Service Rate Type</label>
                    <MultipleSelect 
                        options={serviceRateTypeOptions} 
                        maxTagsToShow="2"
                        listStyle={{ marginTop: '4px' }}
                        value={filters.serviceRateType} 
                        onChange={handleserviceRateTypeChange} 
                        id="service-rate-type-select"
                    />
                </div>
            )}

            {isVariationFilter && (
                <div className="mb-6 ">
                    <label>Variation</label>
                    <MultipleSelect 
                        placeholder=""
                        options={variationOptions} 
                        maxTagsToShow="2"
                        listStyle={{ marginTop: '4px' }}
                        value={filters.variation} 
                        onChange={handleVariationChange} 
                        id="variation-select"
                    />
                </div>
            )}

            {isFinanceStatusFiter && (
                <div className="mb-6">
                    <label>Payment Status</label>
                    <MultipleSelect 
                        placeholder=""
                        options={paymentStatusOption}
                        maxTagsToShow="2"
                        listStyle={{ marginTop: '4px' }}
                        value={filters.paymentStatus} 
                        onChange={handlePaymentStatus} 
                        id="payment-status-select"
                    />
                </div>
            )}

            {isJobTypeFilter && (
                <div className="mb-6 pop-up-line">
                    <label>Job Type</label>
                    <MultipleSelect 
                        placeholder=""
                        options={jobTypeOption}
                        maxTagsToShow="2"
                        listStyle={{ marginTop: '4px' }}
                        onChange={handleJobtype}
                        value={filters.jobType} 
                        id="job-type-select"
                    />
                </div>
            )}
            
            {isVehicleCategoryFilter && (
                <div className="mb-6 vehicle-list">
                    <label>Vehicle Category</label>
                    <MultipleSelect 
                        placeholder=""
                        options={vehicleCategoryOptions} 
                        maxTagsToShow="2"
                        listStyle={{ marginTop: '4px' }}
                        value={filters.vehicleCategory} 
                        onChange={handleVehicleCategory} 
                        id="vehicle-category-select"
                    />
                </div>
            )}

            {isWarentyFilter ?
                <div className="mb-6 filters-opt">
                    <label>Warranty</label>
                    <Radio.Group className="custom-radio-group d-flex" onChange={e => handleWarrantyChange(e.target.value)} value={filters.warranty}>
                        <Radio.Button className='applied' value="applicable" style={{ textAlign: 'center' }} id="applicable-btn">Applicable</Radio.Button>
                        <Radio.Button className='not-applicable' value="notapplicable" style={{ textAlign: 'center' }} id="not-applicable-btn">Not Applicable</Radio.Button>
                    </Radio.Group>
                </div>
            : null}

            {isStockFilter ?
                <div className="mb-6 pop-up-line">
                    <label>Stock Status</label>
                    <Radio.Group className="custom-radio-group d-flex"onChange={e => handlestockStatusChange(e.target.value)} value={filters.stockStatus}>
                        <Radio.Button className='radio-available' value="available" style={{ textAlign: 'center' }} id="available-btn">Available</Radio.Button>
                        <Radio.Button className='out-of-stock' value="outofstock" style={{ textAlign: 'center' }} id="out-of-stock-btn">Out of Stock</Radio.Button>
                    </Radio.Group>
                </div>
            : null}     

            {vehicleMakeFilter && vehicleMakeOptions && (
                <div className="mb-6 filters-opt vehicle-make-fillter">
                    <label>Vehicle Make</label>
                    <CustomGroupSelect
                        groupedOptions={vehicleMakeOptions}
                        dropdownPlaceholderText="Select vehicle make"
                        modalDropdownPlaceholderText="Select make category"
                        addNewOption={false}
                        value={filters.vehicleMake}
                        className="vehicle-make-fillter"
                        id="vehicle-make-select"
                        onChange={(selectedValues) => {
                            setFilters((prev) => ({
                                ...prev,
                                vehicleMake: selectedValues || [],
                                vehicleModel: [],
                            }));
                        }}
                        type="make"
                    />
                </div>
            )}
            
            {vehicleModelFilter && vehicleModelOptions && (
                <div className="mb-6 filters-opt vehicle-make-fillter pop-up-line">
                    <label>Vehicle Model</label>
                    <CustomSubGroupSelect
                        selectOptions={vehicleMakeLists}
                        placeholderText={vehicleModelLoading ? "Loading..." : "Select model"}
                        options={vehicleModelOptions}
                        addNewOption={false}
                        value={filters.vehicleModel}
                        id="vehicle-model-select"
                        onChange={(selectedValues) => {
                            setFilters((prev) => ({
                                ...prev,
                                vehicleModel: selectedValues || [],
                            }));
                        }}
                        type="model"
                    />
                </div>
            )}

              {isQuoteStatusFilter && (
                <div className="mb-6 pop-up-line">
                    <label>Status</label>
                    <MultipleSelect 
                        placeholder=""
                        options={quoteStatusOption}
                        maxTagsToShow="2"
                        listStyle={{ marginTop: '4px' }}
                        value={filters.quoteStatus} 
                        onChange={handleQuoteStatus} 
                        id="quote-status-select"
                    />
                </div>
            )}
             {isModifiedByFilter && (
                <div className="mb-6 ">
                    <label>Modified By</label>
                    <CustomMultiSelectWithApiSearch
                        key={`modifiedBy-${modifiedByResetTick}`}
                        groupedOptions={modifiedByOptions}
                        selectOptions={modifiedByOptions}
                        onChange={handleModifiedByChangeLocal}
                        onSearch={onModifiedBySearch}
                        value={filters.modifiedBy}
                        clearSignal={modifiedByClearSignal}
                        className="api-search-option"
                        id="modified-by-select"
                    />
                </div>
            )}
             {isModifiedDateFilter && (
                <div className="mb-6 modified-date-filter">
                    <label>Modified Date</label>
                    <ReactDatePicker 
                        onChangeDate={handleModifiedDateChange}
                        newStartDate={filters.modifiedDate ? new Date(filters.modifiedDate) : null}
                        readOnlyref={true}
                        maxDate={today}
                        id="modified-date-picker"
                    /> 
                </div>
            )}

            {isPriorityFilter && (
                <div className="mb-6 pop-up-line priority-filter-section">
                    <label>Priority</label>
                    <MultipleSelect 
                        placeholder=""
                        options={priorityOption}
                        maxTagsToShow="2"
                        listStyle={{ marginTop: '4px' }}
                        value={filters.priority} 
                        onChange={handlePriorityChange} 
                        id="priority-select"
                    />
                </div>
            )}
    
            <div className="d-flex justify-content-between filter-pop-btn">
                <button onClick={handleClose} className='pop-cancel-btn' id="cancel-filter-btn">
                    Cancel
                </button>
                <button className='pop-filter-btn' onClick={ handleFilterNow } id="filter-now-btn">
                    Filter Now
                </button>
            </div>
        </Menu>
    );

    return (
        <Dropdown
            overlay={menu}
            trigger={['click']}
            ref={ref}
            open={visible}
            onOpenChange={setVisible}
            className="filter-dropdown"
            getPopupContainer={trigger => trigger.parentNode}
            placement='bottomRight'
        >
            <button className="" id="filter-dropdown-btn">
                <img src={Icons.funnel_simple} alt="Filter Icon" />
                <span className="filter-text ms-2">Filter</span>
            </button>
        </Dropdown>
    );
});

const mapStateToProps = (state) => {
    const { base } = state;
    return { base };
};

export default connect(mapStateToProps)(FilterDropdown);

