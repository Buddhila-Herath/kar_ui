import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import Icons from "../../utils/icons";

const AddModalInput = ({ 
    isModalOpen, 
    handleModalClose, 
    options, 
    modalTitle, 
    formFieldLabel, 
    formPlaceholderText, 
    buttonText, 
    listTitle,
    onSubmit,
    extraFieldEnabled = false,
    extraFieldLabel = "",
    extraFieldPlaceholder = "",
    maxLength,
    maxLengthErrorMessage,
    id = ""
}) => {

    const [searchQuery, setSearchQuery] = useState("");
    const [formValue, setFormValue] = useState("");
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [formCode, setFormCode] = useState("");

    const filteredOptions = options.filter(
        (option) => option?.label && option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFormSubmit = async () => {
        const isUnitModal = (
            formFieldLabel === "Add Unit of Purchase" || modalTitle === "Add Unit of Purchase" ||
            formFieldLabel === "Add Unit of Sales" || modalTitle === "Add Unit of Sales"
        );

        // For Unit modals, only validate: required and max 10 characters
        if (isUnitModal) {
            if (!formValue.trim()) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    formValue: "This field is required",
                }));
                return;
            }
            if (formValue.trim().length > 10) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    formValue: "Unit Name must not exceed 10 characters",
                }));
                return;
            }
            // Proceed to submit with only the above validations
            try {
                setLoading(true);
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    formValue: null,
                }));
                const response = await onSubmit({ value: formValue, code: formCode });
                if (response && response.response) {
                    setSuccessMessage(response.response);
                    setErrors({});
                    setFormValue("");
                    if (extraFieldEnabled) {
                        setFormCode("");
                    }
                    setTimeout(() => {
                        setSuccessMessage("");
                    }, 3000);
                } else {
                    const msg = typeof response === 'string' ? response : (response?.message || "Unknown error occurred");
                    setErrors((prev) => ({ ...prev, formValue: msg, formCode: null }));
                }
            } catch (error) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    formValue: "Failed to save data. Please try again.",
                }));
            } finally {
                setLoading(false);
            }
            return;
        }

        // Non-Unit modals: keep existing validations
        if (!formValue.trim()) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                formValue: "This field is required",
            }));
            return;
        }

        if (errors.formValue) {
            return;
        }

        if (typeof maxLength === 'number' && formValue.trim().length > maxLength) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                formValue: maxLengthErrorMessage || `Maximum ${maxLength} characters allowed`,
            }));
            return;
        }

        if (extraFieldEnabled && !formCode.trim()) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                formCode: "This field is required",
            }));
            return;
        }

        if (extraFieldEnabled && formCode.trim().length !== 3) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                formCode: "Code must be exactly 3 characters",
            }));
            return;
        }
    
        try {
            setLoading(true);
            setErrors((prevErrors) => ({
                ...prevErrors,
                formValue: null,
            }));
    
            const response = await onSubmit({ value: formValue, code: formCode });

            if (response && response.response) {
                setSuccessMessage(response.response);
                setErrors({});
                setFormValue("");
                if (extraFieldEnabled) {
                    setFormCode("");
                }
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            } else {
                const msg = typeof response === 'string' ? response : (response?.message || "Unknown error occurred");
                const lower = (msg || "").toLowerCase();
                if (extraFieldEnabled && (lower.includes('code') || lower.includes('category code'))) {
                    setErrors((prev) => ({ ...prev, formCode: msg, formValue: null }));
                } else {
                    setErrors((prev) => ({ ...prev, formValue: msg, formCode: null }));
                }
            }
        } catch (error) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                formValue: "Failed to save data. Please try again.",
            }));
        } finally {
            setLoading(false);
        }
    };    
    
    return (
        <Modal
            open={isModalOpen}
            onCancel={handleModalClose}
            footer={null}
            centered
            width={860}
            title={<h3>{modalTitle}</h3>}
            className="add-modal"
        >
            <div className="add-modal-section">
                <div className="form-item form-item__full">
                    <label className="form-label" htmlFor="add-new-data">
                        <h4>{formFieldLabel}</h4>
                    </label>
                    <input 
                        type="text" 
                        name="form-value" 
                        id="add-new-data" 
                        placeholder={formPlaceholderText}
                        onChange={(e) => {
                            const next = e.target.value;
                            setFormValue(next);
                            // Real-time validation for Unit modals: show error when > 10 chars
                            const isUnitModal = (
                                formFieldLabel === "Add Unit of Purchase" || modalTitle === "Add Unit of Purchase" ||
                                formFieldLabel === "Add Unit of Sales" || modalTitle === "Add Unit of Sales"
                            );
                            const nextFormValueError = isUnitModal && next.trim().length > 10
                              ? "Unit Name must not exceed 10 characters"
                              : null;
                            setErrors((prevErrors) => ({
                                ...prevErrors,
                                formValue: nextFormValueError,
                            }));
                            setSuccessMessage("");
                        }}
                        value={formValue} 
                        autoComplete="off"
                        {...(((formFieldLabel === "Add Unit of Purchase" || modalTitle === "Add Unit of Purchase" || formFieldLabel === "Add Unit of Sales" || modalTitle === "Add Unit of Sales")
                          ? {} // no hard cap; allow typing beyond 10
                          : (typeof maxLength === 'number' ? { maxLength } : {})))}
                    />
                    {errors.formValue && (
                        <div className="field-error">
                            <img src={Icons.warning_circle} alt="Warning Icon" />
                            <h6>{errors.formValue}</h6>
                        </div>
                    )}
                </div>
                {extraFieldEnabled && (
                    <div className="form-item form-item__full">
                        <label className="form-label" htmlFor="add-new-data-code">
                            <h4>{extraFieldLabel}</h4>
                        </label>
                        <input
                            type="text"
                            name="form-code"
                            id="add-new-data-code"
                            placeholder={extraFieldPlaceholder}
                            onChange={(e) => {
                                const next = (e.target.value || "").slice(0, 3);
                                setFormCode(next);
                                setErrors((prevErrors) => ({
                                    ...prevErrors,
                                    formCode: next.length === 0 || next.length === 3 ? null : "Code must be exactly 3 characters",
                                }));
                                setSuccessMessage("");
                            }}
                            value={formCode}
                            autoComplete="off"
                            maxLength={3}
                        />
                        {errors.formCode && (
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{errors.formCode}</h6>
                            </div>
                        )}
                    </div>
                )}
                {successMessage && (
                    <div className="field-success">
                        <img src={Icons.check} alt="Success Icon" />
                        <h6>{successMessage}</h6>
                    </div>
                )}
                <div className="add-modal-button">
                    <button className="button" id="submit-add-modal-btn" onClick={handleFormSubmit} disabled={loading || Boolean(errors.formValue)}>{buttonText}</button>
                </div>
            </div>
            <div className="separator" />
            <div className="add-modal-section add-modal-section__list">
                {options.length > 0 && (
                    <div className="add-modal-list-container">
                        <div className="add-modal-list-heading">
                            <h4>{listTitle}</h4>
                            <div className="add-modal-list-count">
                                <h6>{options.length} Records</h6>
                            </div>
                        </div>
                        <div className="add-modal-search-container">
                            <input
                                type="text"
                                name="search"
                                id="search"
                                placeholder="Search here..."
                                className="add-modal-search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoComplete="off"
                            />
                            <img src={Icons.magnifying_glass} alt="search" className="add-modal-search-icon" />
                        </div>
                        <div className="add-modal-list add-modal-list__input" style={{ overflowY: 'auto', paddingRight: '10px' }}>
                            {filteredOptions.map((option, index) => (
                                <React.Fragment key={index}>
                                    <div key={index} className="add-modal-list-item"  id={`dropdown-item-btn-${index}`}>
                                        <span>{option.label}</span>
                                    </div>
                                    <div className="separator" />
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AddModalInput;