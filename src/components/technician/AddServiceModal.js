import React, { useState, useEffect } from "react";
import { Modal, notification } from "antd";
import Icons from "../../utils/icons";
import FormMultipleSelect from "../.././shared/select/FormMultipleSelect";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllServicesCategory,
    fetchAllServicesNamesBasedOnCategory,
    clearServiceList
} from "../../slices/masterDataSlice";
import CustomRadioSelect from "../../shared/select/CustomRadioSelect";

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
            title={<h3 id="technician-add-service-modal-title">{isEdit? "Edit" : "Add" } Service Details</h3>}
            className="add-modal quote job-spare-part-modal"
            id="technician-add-service-modal"
        >
            <div className="add-modal-section" id="technician-add-service-form">
                <div className={`form-item form-item__full ${(isEditQuote && isEdit && initialData?.isExisting) ? "inactive-input" : ""}`} id="technician-add-service-category-field">
                    <FormMultipleSelect
                        key={visible ? "open" : "closed"} 
                        options={serviceCategories}
                        placeholderText="Select a category(s) to filter"
                        id="technician-add-service-category-select"
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
                    <label className="form-label" htmlFor="technician-add-service-category-select" id="technician-add-service-category-label">
                        <h4>Service Category</h4>
                    </label>
                    {errors.serviceCategory && (
                        <div className="field-error" id="technician-add-service-category-error">
                            <img src={Icons.warning_circle} alt="Warning Icon" />
                            <h6>{errors.serviceCategory}</h6>
                        </div>
                    )}
                </div>

                <p className="note" id="technician-add-service-note">
                    <strong>Note:</strong>
                    <span className="note-text" id="technician-add-service-note-text"> Selecting a service category displays its service names.</span>
                </p>

                <div className="form-row add-service-row" id="technician-add-service-row-1">
                    <div className={`form-item ${(isEditQuote && isEdit && initialData?.isExisting) ? "inactive-input" : ""}`} id="technician-add-service-name-field">
                        <CustomRadioSelect
                            key={formInputs.serviceCategory}
                            options={serviceNames}
                            placeholderText="Select service name"
                            name="serviceId"
                            id="technician-add-service-name-select"
                            required
                            isValid={errors.serviceId ? "invalid" : ""}
                            disabled={(isEdit && isEditQuote && initialData?.isExisting)}
                            value={formInputs.serviceId}
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
                        <label className="form-label" htmlFor="technician-add-service-name-select" id="technician-add-service-name-label">
                            <h4>Service Name</h4>
                        </label>
                        {errors.serviceId && (
                            <div className="field-error" id="technician-add-service-name-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{errors.serviceId}</h6>
                            </div>
                        )}
                    </div>
                    <div className="form-item inactive-input" id="technician-add-service-hours-field">
                        <input
                            type="text"
                            name="hours"
                            id="technician-add-service-hours-input"
                            value={formInputs.hours ?? ""}
                            onChange={(e) => handleChange(e)}
                            className={errors["hours"] ? "invalid" : ""}
                            disabled
                        />
                        <label className="form-label" htmlFor="technician-add-service-hours-input" id="technician-add-service-hours-label">
                            <h4>Hours</h4>
                        </label>
                        {errors.hours && (
                            <div className="field-error" id="technician-add-service-hours-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{errors.hours}</h6>
                            </div>
                        )}
                    </div>
                </div>
                <div className="form-row add-service-row" id="technician-add-service-row-2">
                    <div className="form-item inactive-input" id="technician-add-service-hourly-rate-field">
                        <input
                            type="text"
                            name="hourRate"
                            id="technician-add-service-hourly-rate-input"
                            value={formInputs.hourRate ?? ""}
                            onChange={(e) => handleChange(e)}
                            disabled
                        />
                        <label className="form-label" htmlFor="technician-add-service-hourly-rate-input" id="technician-add-service-hourly-rate-label">
                            <h4>Hourly Rate (Rs.)</h4>
                        </label>
                        {errors.hourRate && (
                            <div className="field-error" id="technician-add-service-hourly-rate-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{errors.hourRate}</h6>
                            </div>
                        )}
                    </div>
                    <div className={`form-item ${(isEditQuote && isEdit && initialData?.isExisting) ? "" : "inactive-input"}`} id="technician-add-service-total-cost-field">
                        <input
                            type="text"
                            name="totalServiceCost"
                            id="technician-add-service-total-cost-input"
                            value={formInputs.totalServiceCost ?? ""}
                            onChange={(e) => handleChange(e)}
                            disabled={!(isEditQuote && isEdit && initialData?.isExisting)}
                            autoComplete="off"
                        />
                        <label className="form-label" htmlFor="technician-add-service-total-cost-input" id="technician-add-service-total-cost-label">
                            <h4>Total Service Cost (Rs.)</h4>
                        </label>
                        {errors.totalServiceCost && (
                            <div className="field-error" id="technician-add-service-total-cost-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{errors.totalServiceCost}</h6>
                            </div>
                        )}
                    </div>
                </div>
                <div className="footer add-modal-button" id="technician-add-service-actions">
                    <button className="pop-cancel-btn add-modal-cancel" id="technician-add-service-cancel" onClick={onClickCancel}>
                        Cancel
                    </button>
                    <button className="button add-submit" id="technician-add-service-save" onClick={handleFormSubmit} disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddServiceModal;