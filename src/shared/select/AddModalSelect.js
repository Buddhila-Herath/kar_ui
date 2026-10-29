import React, { useState } from "react";
import { Modal } from "antd";
import Icons from "../../utils/icons";
import CustomRadioSelect from "./CustomRadioSelect";
import { useDispatch } from "react-redux";
import {
    fetchAllVehicleModels,
} from '../../slices/masterDataSlice';

const AddModalSelect = ({
    isModalOpen,
    handleModalClose,
    modalTitle,
    selectFieldLabel,
    selectPlaceholderText,
    formFieldLabel,
    formPlaceholderText,
    buttonText,
    noDataHeading,
    nodataText,
    selectOptions,
    groupedOptions,
    type,
    onSubmit,
    extraFieldEnabled = false,
    extraFieldLabel = "",
    extraFieldPlaceholder = ""
}) => {

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [formValue, setFormValue] = useState("");
    const [formCode, setFormCode] = useState("");
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const fetchModels = async (makeId) => {
        try {
            const response = await dispatch(fetchAllVehicleModels(makeId)).unwrap();

            const vehicleModelsData = response?.[0]?.vehicleMake?.find(
                (make) => make.vehicleMakeId === makeId
            )?.vehicleModel || [];

            setFilteredOptions(vehicleModelsData);
        } catch (error) {
            console.error("Error fetching vehicle models:", error);
            setFilteredOptions([]);
        }
    };

    const handleRadioSelectChange = (data) => {
        setSelectedCategory(data.label);
        setSelectedCategoryId(data.value);
        setErrors({});
        setFormValue("");
        setErrors((prevErrors) => ({
            ...prevErrors,
            selectedCategory: null,
        }));

        if (type === "make") {
            // Find the make based on selected brand
            const selectedGroup = groupedOptions.find(
                (group) => group.label === data.label
            );

            if (selectedGroup && selectedGroup.options) {
                setFilteredOptions(selectedGroup.options);
            } else {
                setFilteredOptions([]);
            }
        } else {
            fetchModels(data.value);
            let selectedGroup = null;

            if (!selectedGroup) {
                console.error("No group found for the selected category:", data.label);
                setFilteredOptions([]);
                return;
            }

            if (selectedGroup.matchedOption && selectedGroup.matchedOption.subOptions) {
                const subOptions = selectedGroup.matchedOption.subOptions;
                setFilteredOptions(subOptions);
            } else {
                console.error("No subOptions available for the selected category.");
                setFilteredOptions([]);
            }
        }
    };

    const searchOptions =
        type === "make"
            ? filteredOptions.filter(
                (option) => option?.label && option.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
            : filteredOptions
                .map((model) => ({
                    label: model.vehicleModelName,
                    value: model.vehicleModelId,
                }))
                .filter((option) =>
                    option.label.toLowerCase().includes(searchQuery.toLowerCase())
                )

    const handleFormSubmit = async () => {
        let hasErrors = false;

        if (!selectedCategory) {
            hasErrors = true;
            setErrors((prevErrors) => ({
                ...prevErrors,
                selectedCategory: "Please select a category.",
            }));
        }

        if (!formValue.trim()) {
            hasErrors = true;
            setErrors((prevErrors) => ({
                ...prevErrors,
                formValue: "This field is required.",
            }));
        }

        if (extraFieldEnabled && !formCode.trim()) {
            hasErrors = true;
            setErrors((prevErrors) => ({
                ...prevErrors,
                formCode: "This field is required.",
            }));
        }

        if (extraFieldEnabled && formCode.trim()) {
            const len = formCode.trim().length;
            const min = 3;
            const max = type === 'make' ? 4 : 6;
            if (len < min || len > max) {
                hasErrors = true;
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    formCode: `Code must be ${min}–${max} characters`,
                }));
            }
        }

        if (hasErrors) return;

        try {
            setLoading(true);
            setErrors((prevErrors) => ({
                ...prevErrors,
                formValue: null,
            }));

            const response = await onSubmit({ value: formValue, category: selectedCategoryId, code: formCode });

            if (response && response.response) {
                setSuccessMessage(response.response);
                setErrors({});
                const newOption =
                type === "make"
                    ? { label: formValue, value: formValue.toLowerCase().replace(/\s+/g, "-") }
                    : {
                          label: formValue, // For displaying in the list
                          value: formValue.toLowerCase().replace(/\s+/g, "-"), // Unique identifier
                          vehicleModelName: formValue, // Maintain consistency with API data
                          vehicleModelId: formValue.toLowerCase().replace(/\s+/g, "-")
                      };
            
                setFilteredOptions((prevOptions) => [...prevOptions, newOption]);
            
                setFormValue("");
                if (extraFieldEnabled) setFormCode("");
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            } else {
                const msg = typeof response === 'string' ? response : (response?.message || "Unknown error occurred");
                const lower = (msg || "").toLowerCase();
                if (extraFieldEnabled && (lower.includes('code') || lower.includes('make code'))) {
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
            height={520}
            title={<h3>{modalTitle}</h3>}
            className="add-modal"
            style={{
                overflow: 'auto',
            }}
        >
            <div className="add-modal-section">
                <div className="form-item form-item__full">
                    <CustomRadioSelect
                        options={selectOptions}
                        required={false}
                        placeholderText={selectPlaceholderText}
                        onChange={handleRadioSelectChange}
                    />
                    <label className="form-label" htmlFor="vehicle-make">
                        <h4>{selectFieldLabel}</h4>
                    </label>
                    {errors.selectedCategory && (
                        <div className="field-error">
                            <img src={Icons.warning_circle} alt="Warning Icon" />
                            <h6>{errors.selectedCategory?.message || errors.selectedCategory || ''}</h6>
                        </div>
                    )}
                </div>
                <div className="form-item form-item__full">
                    <label className="form-label" htmlFor="vehicle-model">
                        <h4>{formFieldLabel}</h4>
                    </label>
                    <input
                        type="text"
                        name="vehicle-model"
                        id="vehicle-model"
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
                    />
                    {errors.formValue && (
                        <div className="field-error">
                            <img src={Icons.warning_circle} alt="Warning Icon" />
                            <h6>{errors.formValue?.message || errors.formValue || ''}</h6>
                        </div>
                    )}
                </div>
                {extraFieldEnabled && (
                    <div className="form-item form-item__full">
                        <label className="form-label" htmlFor="vehicle-make-code">
                            <h4>{extraFieldLabel}</h4>
                        </label>
                        <input
                            type="text"
                            name="vehicle-make-code"
                            id="vehicle-make-code"
                            placeholder={extraFieldPlaceholder}
                            onChange={(e) => {
                                const max = type === 'make' ? 4 : 6;
                                const next = (e.target.value || '').slice(0, max);
                                setFormCode(next);
                                const min = 3;
                                setErrors((prevErrors) => ({
                                    ...prevErrors,
                                    formCode: next.length === 0 || (next.length >= min && next.length <= max) ? null : `Code must be ${min}–${max} characters`,
                                }));
                                setSuccessMessage("");
                            }}
                            value={formCode}
                            maxLength={type === 'make' ? 4 : 6}
                        />
                        {errors.formCode && (
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{errors.formCode?.message || errors.formCode || ''}</h6>
                            </div>
                        )}
                    </div>
                )}
                {successMessage && (
                    <div className="field-success">
                        <img src={Icons.check} alt="Success Icon" />
                        <h6>{successMessage?.message || successMessage || ''}</h6>
                    </div>
                )}
                <div className="add-modal-button">
                    <button className="button" id="submit-add-modal-btn" onClick={handleFormSubmit} disabled={loading}>{buttonText}</button>
                </div>
            </div>

            <div className="separator" />
            <div className="add-modal-section add-modal-section__list">
                {filteredOptions.length > 0 ? (
                    <div className="add-modal-list-container">
                        <div className="add-modal-list-heading">
                            <h4>{selectedCategory}</h4>
                            <div className="add-modal-list-count">
                                <h6>{`${filteredOptions.length} Records`}</h6>
                            </div>
                        </div>
                        <div className="add-modal-search-container">
                            <input
                                type="text"
                                name="vehicle-model"
                                id="vehicle-model"
                                placeholder="Search here..."
                                className="add-modal-search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoComplete="off"
                            />
                            <img src={Icons.magnifying_glass} alt="search" className="add-modal-search-icon" />
                        </div>
                        <div className="add-modal-list" style={{ overflowY: 'auto', paddingRight: '10px' }}>
                            {searchOptions.map((option, index) => (
                                <React.Fragment key={option.value}>
                                    <div className="add-modal-list-item">
                                        <span>{option.label}</span>
                                    </div>
                                    <div className="separator" />
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="add-modal-no-data-container">
                        <img src={Icons.car_profile} alt="car" />
                        <div className="no-data-message">
                            <h2>{noDataHeading}</h2>
                            <span>{nodataText}</span>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AddModalSelect;