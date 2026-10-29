import React, { useState, useEffect, useMemo } from "react";
import { Modal, notification } from "antd";
import Icons from "../../../utils/icons";
import FormMultipleSelect from "../../../shared/select/FormMultipleSelect";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllServicesCategory,
    fetchAllServicesNamesBasedOnCategory,
    clearServiceList,
    searchServicesNamesBasedOnCategory
} from "../../../slices/masterDataSlice";
import CustomSelectWithApiSearch from "../../../shared/select/CustomSelectWithApiSearch";

const AddServiceModal = ({
    visible,
    onClickCancelModel,
    onSubmitService,
    isEdit,
    initialData,
    isEditQuote
}) => {

    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const {
        allServicesCategory,
        allServiceList
    } = useSelector((state) => state.masterData);

    const initialFormState = {
        serviceCategory: "",
        serviceId: "",
        hours: "",
        hourRate: "",
        totalServiceCost: ""
    };

    const [formInputs, setFormInputs] = useState(initialFormState);

    const [errors, setErrors] = useState({
        serviceCategory: "",
        serviceId: "",
        hours: "",
        hourRate: "",
        totalServiceCost: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormInputs({
                serviceCategory: initialData.service_category_id,
                serviceId: initialData.service_id,
                hours: initialData.hours,
                hourRate: initialData.hourly_rate,
                totalServiceCost: initialData.total_service_cost
            });
        } else {
            setFormInputs(initialFormState);
        }
    }, [initialData]);

    useEffect(() => {
        if (formInputs.serviceCategory.length > 0) {
            dispatch(fetchAllServicesNamesBasedOnCategory(formInputs.serviceCategory));
        } else {
            dispatch(clearServiceList());
            resetForm();
        }
        dispatch(fetchAllServicesCategory());
    }, [dispatch, formInputs.serviceCategory]);

    const serviceCategories = allServicesCategory.map((option) => ({
        label: option.serviceCategoryName,
        value: option.id,
    }));

    const serviceNames = allServiceList.map((option) => ({
        label: option.serviceName,
        value: option.id,
        hourRate: option.hourRate,
        hours: option.hours
    }));

    const validateField = (name, value, relatedValues = {}) => {
        switch (name) {
            case "serviceCategory":
                if (!value) {
                    return "Service Category field is required";
                }
                break;
            case "serviceId":
                if (!value) {
                    return "Service Name field is required";
                }
                break;
            case "hours":
                if (isNaN(Number(value)) || Number(value) <= 0) {
                    return "Must be a valid positive number";
                }
                break;
            case "totalServiceCost":
                if (isNaN(Number(value)) || Number(value) < 0) {
                    return "Must be a valid positive number";
                }
                break;
            default:
                return "";
        }
        return "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormInputs((prev) => {
            const updatedInputs = {
                ...prev,
                [name]: value,
            };

            // Calculate related fields if needed
            if (name === "hours" || name === "hourRate") {
                const hours = parseFloat(updatedInputs.hours) || 0;
                const hourRate = parseFloat(updatedInputs.hourRate) || 0;
                updatedInputs.totalServiceCost = (hours * hourRate).toFixed(2);
            }

            if (name === "totalServiceCost") {
                const totalServiceCost = parseFloat(value) || 0;
                if (totalServiceCost >= 0) {
                    const hourRate = parseFloat(updatedInputs.hourRate) || 1;
                    updatedInputs.hours = (totalServiceCost / hourRate).toFixed(2);
                }
            }
            return updatedInputs;
        });

        // Validate the current field and update errors in realtime
        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, value)
        }));
    };

    const handleServiceSearch = (searchTerm, onComplete) => {
        if (formInputs.serviceCategory) {
            if (searchTerm && searchTerm.trim()) {
                dispatch(searchServicesNamesBasedOnCategory({ 
                    category: formInputs.serviceCategory, 
                    searchTerm: searchTerm 
                })).then(() => {    
                    if (onComplete) {
                        onComplete();
                    }
                });
            } else {
                dispatch(fetchAllServicesNamesBasedOnCategory(formInputs.serviceCategory)).then(() => {
                    if (onComplete) {
                        onComplete();
                    }
                });
            }
        } else {
            if (onComplete) {   
                onComplete();
            }
        }
    };

    const handleValidation = () => {
        let formErrors = {};
        let isValid = true;

        // Check all relevant fields
        Object.keys(formInputs).forEach((field) => {
            const errorMsg = validateField(field, formInputs[field]);
            if (errorMsg) {
                formErrors[field] = errorMsg;
                isValid = false;
            }
        });

        if (!isValid) {
            setErrors(formErrors);
        }

        return isValid;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const valid = handleValidation();
        if (!valid) return;

        setLoading(true);
        try {
            let dataToSend; 
            if (initialData) {
                dataToSend = {
                    quoteServiceId: initialData.id,
                    serviceId: formInputs.serviceId,
                    hours: formInputs.hours,
                    totalServiceCost: formInputs.totalServiceCost
                }
            } else {
                dataToSend = {
                    serviceId: formInputs.serviceId,
                    serviceCategory: formInputs.serviceCategory,
                    serviceId: formInputs.serviceId,
                }
            }
            const result = await onSubmitService(dataToSend);
            if (result?.id) {
                resetForm();
                onClickCancelModel();
            }
        
        } catch (error) {
            if (error?.errors?.length) {
                const apiErrors = {};
                error.errors.forEach((err) => {
                    if (err.includes("category")) {
                        apiErrors.serviceCategory = err;
                    } else if (err.includes("service")) {
                        apiErrors.serviceId = err;
                    } else if (err.includes("positive number")) {
                        apiErrors.totalServiceCost = err;
                    }
                });
    
                setErrors(apiErrors);
    
            } else {
                notification.error({
                    message: <h5>Failed to save data. Please try again.</h5>,
                    icon: <img src={Icons.error} alt="Error" />,
                    duration: 5,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormInputs(initialFormState);
        setErrors({
            serviceCategory: "",
            serviceId: "",
            hours: "",
            hourRate: "",
            totalServiceCost: ""
        });
    };

    const onClickCancel = () => {
        resetForm();
        dispatch(clearServiceList());
        onClickCancelModel();
    }

    return (
        <Modal
            open={visible}
            onCancel={() => {
                resetForm();
                dispatch(clearServiceList());
                onClickCancelModel();
            }}
            footer={null}
            centered
            width={860}
            title={<h3>{isEdit? "Edit" : "Add" } Service Details</h3>}
            className="add-modal quote job-spare-part-modal"
        >
            <div className="add-modal-section">
                <div className={`form-item form-item__full ${(isEditQuote && isEdit && initialData?.isExisting) ? "inactive-input" : ""}`}>
                    <FormMultipleSelect
                        key={visible ? "open" : "closed"} 
                        options={serviceCategories}
                        id="job-service-category"
                        placeholderText="Select a category(s) to filter"
                        className={errors["serviceCategory"] ? "invalid" : ""}
                        isValid={errors["serviceCategory"] ? "invalid" : ""}
                        required
                        value={formInputs.serviceCategory}
                        disabled={(isEdit && isEditQuote && initialData?.isExisting)}
                        onChange={(selectedValues) => {
                            setFormInputs((prev) => ({
                                ...prev,
                                serviceCategory: selectedValues,
                            }));
                            setErrors((prev) => ({
                                ...prev,
                                serviceCategory: "",
                            }));
                        }}
                    />
                    <label className="form-label" htmlFor="part-category">
                        <h4>Service Category</h4>
                    </label>
                    {errors.serviceCategory && (
                        <div className="field-error">
                            <img src={Icons.warning_circle} alt="Warning Icon" />
                            <h6>{errors.serviceCategory}</h6>
                        </div>
                    )}
                </div>

                <p className="note">
                    <strong>Note:</strong>
                    <span className="note-text"> Selecting a service category displays its service names.</span>
                </p>

                <div className="form-row add-service-row">
                    <div className={`form-item ${(isEditQuote && isEdit && initialData?.isExisting) ? "inactive-input" : ""}`}>
                        {(isEditQuote && isEdit && initialData?.isExisting) ? (
                            <input
                                type="text"
                                value={initialData?.service_name || ""}
                                disabled
                                className="form-control"
                            />
                        ) : (
                            <CustomSelectWithApiSearch
                                key={formInputs.serviceCategory}
                                options={serviceNames}
                                placeholderText="Select service name"
                                name="serviceId"
                                id="service-name"
                                required
                                isValid={errors.serviceId ? "invalid" : ""}
                                disabled={(isEdit && isEditQuote && initialData?.isExisting)}
                                value={formInputs.serviceId}
                                onSearch={handleServiceSearch}
                                onChange={(selectedService) => {
                                    setFormInputs((prev) => {
                                        const updatedInputs = {
                                            ...prev,
                                            serviceId: selectedService.value,
                                            hourRate: selectedService.hourRate,
                                            hours: selectedService.hours,
                                        };
                                
                                        const hours = parseFloat(updatedInputs.hours) || 0;
                                        updatedInputs.totalServiceCost = (hours * updatedInputs.hourRate).toFixed(2);
                                
                                        return updatedInputs;
                                    });
                                
                                    setErrors((prev) => ({
                                        ...prev,
                                        serviceId: "",
                                    }));
                                }}                            
                            />
                        )}
                        <label className="form-label" htmlFor="service-name">
                            <h4>Service Name</h4>
                        </label>
                        {errors.serviceId && (
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{errors.serviceId}</h6>
                            </div>
                        )}
                    </div>
                    <div className="form-item inactive-input">
                        <input
                            type="text"
                            name="hours"
                            id="hours"
                            value={formInputs.hours ?? ""}
                            onChange={(e) => handleChange(e)}
                            className={errors["hours"] ? "invalid" : ""}
                            disabled
                        />
                        <label className="form-label" htmlFor="hours">
                            <h4>Hours</h4>
                        </label>
                        {errors.hours && (
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{errors.hours}</h6>
                            </div>
                        )}
                    </div>
                </div>
                <div className="form-row add-service-row">
                    <div className="form-item inactive-input">
                        <input
                            type="text"
                            name="hourRate"
                            id="hourly-rate"
                            value={formInputs.hourRate ?? ""}
                            onChange={(e) => handleChange(e)}
                            disabled
                        />
                        <label className="form-label" htmlFor="hourly-rate">
                            <h4>Hourly Rate (Rs.)</h4>
                        </label>
                        {errors.hourRate && (
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{errors.hourRate}</h6>
                            </div>
                        )}
                    </div>
                    <div className={`form-item ${(isEditQuote && isEdit && initialData?.isExisting) ? "" : "inactive-input"}`}>
                        <input
                            type="text"
                            name="totalServiceCost"
                            id="total-service-cost"
                            value={formInputs.totalServiceCost ?? ""}
                            onChange={(e) => handleChange(e)}
                            disabled={!(isEditQuote && isEdit && initialData?.isExisting)}
                            autoComplete="off"
                        />
                        <label className="form-label" htmlFor="total-service-cost">
                            <h4>Total Service Cost (Rs.)</h4>
                        </label>
                        {errors.totalServiceCost && (
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{errors.totalServiceCost}</h6>
                            </div>
                        )}
                    </div>
                </div>
                <div className="footer add-modal-button">
                    <button className="pop-cancel-btn add-modal-cancel" id="cancel-add-service-modal-btn" onClick={onClickCancel}>
                        Cancel
                    </button>
                    <button className="button add-submit" id="submit-add-service-modal-btn" onClick={handleFormSubmit} disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddServiceModal;