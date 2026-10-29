import React, { useState, useEffect } from "react";
import { Modal, notification } from "antd";
import Icons from "../../../utils/icons";
import FormMultipleSelect from "../../../shared/select/FormMultipleSelect";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllPartNamesBasedOnCategory,
    clearPartNameList
} from "../../../slices/masterDataSlice";
import CustomRadioSelect from "../../../shared/select/CustomRadioSelect";

const AddSparePartModal = ({
    visible,
    onClickCancelModel,
    onSubmitSparePart,
    isEdit, 
    initialPartData,
    isEditQuote
}) => {

    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const {
        allPartNameList,
        partNamesLoading,
    } = useSelector((state) => state.masterData);

    const partCategoryOptions = [
        { label: "Spare Parts", value: "SPARE_PARTS" },
        { label: "Consumables", value: "CONSUMABLES" },
    ];

    const initialFormState = {
        category: "",
        partsId: "",
        quantity: "",
        unitCost: "",
        totalPartCost: "",
    };

    const [formInputs, setFormInputs] = useState(initialFormState);

    const [errors, setErrors] = useState({
        category: "",
        partsId: "",
        quantity: "",
        unitCost: "",
        totalPartCost: ""
    });

    useEffect(() => {
        if (initialPartData) {
            const selectedCategory = partCategoryOptions.find(
                option => option.label === initialPartData.part_category
            );
            setFormInputs({
                category: selectedCategory ? selectedCategory.value : "",
                partsId: initialPartData.parts_id,
                quantity: initialPartData.part_number,
                unitCost: initialPartData.unit_cost,
                totalPartCost: initialPartData.total_part_cost,
                partName: initialPartData.part_name
            });
        } else {
            setFormInputs(initialFormState);
        }
    }, [initialPartData]);

    useEffect(() => {
        if (formInputs.category.length > 0) {
            dispatch(fetchAllPartNamesBasedOnCategory(formInputs.category));
        } else {
            dispatch(clearPartNameList());
            resetForm();
        }

    }, [dispatch, formInputs.category]);

    const partNames = allPartNameList.map((option) => ({
        label: option.productName,
        value: option.id,
        unitCost: option.unitCost
    }));

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        setFormInputs((prev) => {
            const updatedInputs = { ...prev, [name]: value };
    
            if (name === "quantity" || name === "unitCost") {
                const quantity = parseFloat(updatedInputs.quantity) || 0;
                const unitCost = parseFloat(updatedInputs.unitCost) || 0;
    
                updatedInputs.totalPartCost = (quantity * unitCost).toFixed(2);
            }
    
            return updatedInputs;
        });
    
        // Validate fields on change
        setErrors((prev) => {
            const updatedErrors = { ...prev };

            if (name === "quantity") {
                const quantity = value;
                if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
                    updatedErrors.quantity = "Must be a valid positive number";
                } else if (!Number.isInteger(Number(quantity))) {
                    updatedErrors.quantity = "Must be a valid positive number";
                } else if (String(quantity).length > 10) {
                    updatedErrors.quantity = "Enter a value that doesn't exceed 10 numeric characters";
                } else {
                    delete updatedErrors.quantity;
                }
            }
    
            if (name === "unitCost") {
                const unitCost = value;
                if (unitCost <= 0 || isNaN(unitCost)) {
                    updatedErrors.unitCost = "Unit cost must be a valid positive number.";
                } else {
                    updatedErrors.unitCost = "";
                }
            }
    
            return updatedErrors;
        });
    };    

    const handleValidation = () => {
        let formErrors = {};
        let isValid = true;

        if (!formInputs.category) {
            formErrors.category = "Part Category field is required";
            isValid = false;
        }

        if (!formInputs.partsId) {
            formErrors.partsId = "Part Name field is required";
            isValid = false;
        }

        if (!formInputs.quantity) {
            formErrors.quantity = "Quantity field is required";
            isValid = false;
        } else if (isNaN(Number(formInputs.quantity)) || Number(formInputs.quantity) < 0) {
            formErrors.quantity = "Must be a valid positive number";
            isValid = false;
        } else if (String(formInputs.quantity).length > 10) {
            formErrors.quantity = "Enter a value that doesn't exceed 10 numeric characters";
            isValid = false;
        }

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
            if (initialPartData) {
                dataToSend = {
                    id: initialPartData.id,
                    partsId: formInputs.partsId,
                    quantity: formInputs.quantity,
                    unitPrice: formInputs.unitCost,
                    totalPartCost: formInputs.totalPartCost,
                }
            } else {
                dataToSend = {
                    partsId: formInputs.partsId,
                    quantity: formInputs.quantity,
                }
            }
            const result = await onSubmitSparePart(dataToSend);
            if (result?.id) {
                resetForm();
                onClickCancelModel();
            }
        
        } catch (error) {
            console.log(error);
            if (error?.errors?.length) {
                const apiErrors = {};
                error.errors.forEach((err) => {
                    if (err.includes("category")) {
                        apiErrors.category = err;
                    } else if (err.includes("parts")) {
                        apiErrors.partsId = err;
                    } else if (err.includes("Available quantity is")) {
                        apiErrors.quantity = err;
                    } else if (err.includes("quantity")) {
                        apiErrors.quantity = err;
                    } else if (err.includes("positive number")) {
                        apiErrors.quantity = err;
                    } else if (err.includes("unitCost")) {
                        apiErrors.unitCost = err;
                    } else if (err.includes("Quantity")) {
                        apiErrors.quantity = err;
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
        setFormInputs({ ...initialFormState });
        setErrors({
            category: "",
            partsId: "",
            quantity: "",
            unitCost: "",
            totalPartCost: ""
        });
    };

    const onClickCancel = () => {
        resetForm();
        dispatch(clearPartNameList());
        onClickCancelModel();
    }

    return (
        <Modal
            open={visible}
            onCancel={() => {
                resetForm();
                dispatch(clearPartNameList());
                onClickCancelModel();
            }}
            footer={null}
            centered
            width={796}
            height={516}
            title={<h3>{isEdit? "Edit" : "Add" } Spare Part Details</h3>}
            className="add-modal quote"
        >
            <div className="add-modal-section finance-spare-modal">
               <div className="finance-add-modal">
                <div className=" finance-add-part">
                    <div className={`form-item form-item__full ${(isEditQuote && isEdit && initialPartData?.isExisting) ? "inactive-input" : ""}`}>
                        <FormMultipleSelect
                            key={visible ? "open" : "closed"} 
                            id="finance-part-category"
                            options={partCategoryOptions}
                            placeholderText="Select a category(s) to filter"
                            className={errors["category"] ? "invalid" : ""}
                            isValid={errors["category"] ? "invalid" : ""}
                            required
                            value={formInputs.category}
                            disabled={(isEditQuote && isEdit && initialPartData?.isExisting)}
                            onChange={(selectedValues) => {
                                setFormInputs((prev) => ({
                                    ...prev,
                                    category: selectedValues,
                                }));
                                setErrors((prev) => ({
                                    ...prev,
                                    category: "",
                                }));
                            }}
                        />
                        <label className="form-label" htmlFor="part-category">
                            <h4>Part Category</h4>
                        </label>
                        {errors.category && (
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{errors.category}</h6>
                            </div>
                        )}
                    </div>

                    <p className="note">
                        <strong>Note:</strong>
                        <span className="note-text"> Selecting a part category displays its part names.</span>
                    </p>
                </div>
                <div className="form-row add-service-row">
                    <div className={`form-item ${(isEditQuote && isEdit && initialPartData?.isExisting) ? "inactive-input" : ""}`}>
                        <CustomRadioSelect
                            key={formInputs.category}
                            options={ partNames || [] }
                            placeholderText="Select part name"
                            name="partsId"
                            id="finance-part-name"
                            required
                            value={formInputs.partsId}
                            isValid={errors.partsId ? "invalid" : ""}
                            disabled={(isEditQuote && isEdit && initialPartData?.isExisting)}
                            onChange={(selectedPartId) => {
                                setFormInputs((prev) => {
                                    const updatedInputs = {
                                        ...prev,
                                        partsId: selectedPartId.value,
                                        unitCost: selectedPartId.unitCost, 
                                    };
                            
                                    const quantity = parseFloat(updatedInputs.quantity) || 0;
                                    updatedInputs.totalPartCost = (quantity * updatedInputs.unitCost).toFixed(2);

                                    return updatedInputs;
                                });

                                setErrors((prev) => ({
                                    ...prev,
                                    partsId: "",
                                    quantity: "",
                                }));
                            }}
                        />
                        <label className="form-label" htmlFor="part-name">
                            <h4>Part Name</h4>
                        </label>
                        {errors.partsId && (
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{errors.partsId}</h6>
                            </div>
                        )}
                    </div>
                    <div className="form-item">
                        <input
                            type="text"
                            name="quantity"
                            id="finance-quantity"
                            required
                            value={formInputs.quantity ?? ""}
                            className={errors["quantity"] ? "invalid" : ""}
                            onChange={(e) => handleChange(e)}
                            autoComplete="off"
                        />
                        <label className="form-label" htmlFor="quantity">
                            <h4>Quantity</h4>
                        </label>
                        {errors.quantity && (
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{errors.quantity}</h6>
                            </div>
                        )}
                    </div>
                </div>
                <div className="form-row add-service-row">
                    <div className={`form-item ${(isEditQuote && isEdit && initialPartData?.isExisting) ? "" : "inactive-input"}`}>
                        <input
                            type="text"
                            name="unitCost"
                            id="finance-unit-cost"
                            value={formInputs.unitCost ?? ""}
                            onChange={(e) => handleChange(e)}
                            disabled={!(isEditQuote && isEdit && initialPartData?.isExisting)}
                        />
                        <label className="form-label" htmlFor="unit-cost">
                            <h4>Unit Cost - MRP (Rs.)</h4>
                        </label>
                        {errors.unitCost && (
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{errors.unitCost}</h6>
                            </div>
                        )}
                    </div>
                    <div className="form-item inactive-input">
                        <input
                            type="text"
                            name="totalPartCost"
                            id="finance-total-part-cost"
                            value={formInputs.totalPartCost ?? ""}
                            onChange={(e) => handleChange(e)}
                            disabled
                        />
                        <label className="form-label" htmlFor="total-part-cost">
                            <h4>Total Part Cost (Rs.)</h4>
                        </label>
                        {errors.totalPartCost && (
                            <div className="field-error">
                                <img src={Icons.warning_circle} alt="Warning Icon" />
                                <h6>{errors.totalPartCost}</h6>
                            </div>
                        )}
                    </div>
                </div>
                </div>
                <div className="footer add-modal-button">
                    <button className="pop-cancel-btn add-modal-cancel" id="finance-cancel-add-spare-part-modal-btn" onClick={onClickCancel}>
                        Cancel
                    </button>
                    <button className="button add-submit" id="finance-save-spare-part-modal-btn" onClick={handleFormSubmit} disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddSparePartModal;