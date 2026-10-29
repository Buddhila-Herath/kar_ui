import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import Icons from "../../utils/icons";

const AddModalSingleInput = ({
    isModalOpen,
    handleModalClose,
    options,
    modalTitle,
    formFieldLabel,
    formPlaceholderText,
    buttonText,
    onSubmit
}) => {

    const [searchQuery, setSearchQuery] = useState("");
    const [formValue, setFormValue] = useState("");
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const filteredOptions = options.filter(
        (option) => option?.label && option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFormSubmit = async () => {
       
        if (!formValue.trim()) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                formValue: "This field is required",
            }));
            return;
        }

        if (formValue.length > 60) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                formValue: "Enter a value that doesn't exceed 60 characters",
            }));
            return;
        }

        try {
            setLoading(true);
            setErrors((prevErrors) => ({
                ...prevErrors,
                formValue: null,
            }));

            const result = await onSubmit({ value: formValue });

            if (result.id) {
                setFormValue("");
                handleModalClose();
            } else {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    formValue: result?.errors?.join(", ") || result?.message || (typeof result === "string" ? result : "Unknown error occurred"),
                }));
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
            width={382}
            title={<h3>{modalTitle}</h3>}
            className="add-modal single-input quote"
        >
            <div className="add-modal-section">
                <div className="form-item form-item__full">
                    <input
                        type="text"
                        name="form-value"
                        id="add-new-data"
                        placeholder={formPlaceholderText}
                        onChange={(e) => {
                            setFormValue(e.target.value);
                            setErrors((prevErrors) => ({
                                ...prevErrors,
                                formValue: null,
                            }));
                            setSuccessMessage("");
                        }}
                        value={formValue}
                        autoComplete="off"
                    />
                    {errors.formValue && (
                        <div className="field-error">
                            <img src={Icons.warning_circle} alt="Warning Icon" />
                            <h6>{errors.formValue}</h6>
                        </div>
                    )}
                    {successMessage && (
                        <div className="field-success">
                            <img src={Icons.check} alt="Success Icon" />
                            <h6>{successMessage}</h6>
                        </div>
                    )}
                    <label className="form-label" htmlFor="add-new-data">
                        <h4>{formFieldLabel}</h4>
                    </label>
                </div>

                <div className="add-modal-button">
                    <button className='pop-cancel-btn add-modal-cancel' id="cancel-add-modal-btn" onClick={handleModalClose}>
                        Cancel
                    </button>
                    <button className="button add-submit" id="submit-add-modal-btn" onClick={handleFormSubmit} disabled={loading}>
                        {loading ? "Saving..." : buttonText}
                    </button>
                </div>
            </div>

        </Modal>
    );
};

export default AddModalSingleInput;