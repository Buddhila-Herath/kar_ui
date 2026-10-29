import React, { useState, useEffect } from "react";
import { Modal, notification } from "antd";
import { useDispatch } from 'react-redux';
import Icons from "../../../utils/icons";
import { updateRateCard } from '../../../slices/rateCardSlice';
import { placeholderText, getFormattedMessage } from '../../../shared/sharedMethod';

const EditRateCard = ({ rateCard, onClose }) => {
  const dispatch = useDispatch();
  const rateCardTitle = rateCard && rateCard.rateTypeName ? rateCard.rateTypeName : "Untitled";
  
  const formatInitialValue = (value) => {
    if (value === null || value === undefined) return "0.00";
    return parseFloat(value).toFixed(2);
  };

  const [baseRate, setBaseRate] = useState(
    rateCard && rateCard.baseRatePerHour 
      ? formatInitialValue(rateCard.baseRatePerHour) 
      : "0.00"
  );
  const [additionalCharges, setAdditionalCharges] = useState(
    rateCard && rateCard.additionalCharges 
      ? formatInitialValue(rateCard.additionalCharges) 
      : "0.00"
  );
  const [discount, setDiscount] = useState(
    rateCard && rateCard.discount 
      ? formatInitialValue(rateCard.discount) 
      : "0.00"
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [totalRate, setTotalRate] = useState(0);

  const formatNumber = (value) => {
    // Remove any non-numeric characters except decimal point
    let formatted = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = formatted.split('.');
    if (parts.length > 2) {
      formatted = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      formatted = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // Limit total length to 10 characters
    if (formatted.length > 10) {
      formatted = formatted.substring(0, 10);
    }

    // Ensure value is not negative
    if (formatted.startsWith('-')) {
      formatted = formatted.substring(1);
    }
    
    return formatted;
  };

  const formatDisplayValue = (value) => {
    if (value === "" || value === null || value === undefined) return "";
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toFixed(2);
  };

  const validateField = (name, value) => {
    switch (name) {
      case "baseRate":
        if (value === "") return "Base Rate/Hour field is required";
        if (isNaN(value)) return "Base Rate/Hour field must be a valid number";
        // if (parseFloat(value) <= 0) return "Base Rate/Hour field must be greater than 0";
        if (value.split('.')[1]?.length > 2) return "Base Rate/Hour field can have maximum 2 decimal places";
        if (value.length > 10) return "Base Rate/Hour field cannot exceed 10 characters";
        return "";

      case "additionalCharges":
        if (value !== "") {
          if (isNaN(value)) return "Additional Charges/Hour field must be a valid number";
          // if (parseFloat(value) <= 0) return "Additional Charges/Hour field must be greater than 0";
          if (value.split('.')[1]?.length > 2) return "Additional Charges/Hour field can have maximum 2 decimal places";
          if (value.length > 10) return "Additional Charges/Hour field cannot exceed 10 characters";
        }
        return "";

      case "discount":
        if (value !== "") {
          if (isNaN(value)) return "Discount/Hour field must be a valid number";
          // if (parseFloat(value) <= 0) return "Discount/Hour field must be greater than 0";
          if (parseFloat(value) > 100) return "Discount/Hour field must be less than or equal to 100";
          if (value.split('.')[1]?.length > 2) return "Discount/Hour field can have maximum 2 decimal places";
          if (value.length > 10) return "Discount/Hour field cannot exceed 10 characters";
        }
        return "";

      default:
        return "";
    }
  };

  const handleBaseRateChange = (e) => {
    const value = formatNumber(e.target.value);
    setBaseRate(value);
    
    const error = validateField("baseRate", value);
    setErrors(prev => ({
      ...prev,
      baseRate: error
    }));
  };

  const handleBaseRateBlur = () => {
    if (baseRate !== "") {
      setBaseRate(formatDisplayValue(baseRate));
    }
  };

  const handleAdditionalChargesChange = (e) => {
    const value = formatNumber(e.target.value);
    setAdditionalCharges(value);
    
    const error = validateField("additionalCharges", value);
    setErrors(prev => ({
      ...prev,
      additionalCharges: error
    }));
  };

  const handleAdditionalChargesBlur = () => {
    if (additionalCharges !== "") {
      setAdditionalCharges(formatDisplayValue(additionalCharges));
    }
  };

  const handleDiscountChange = (e) => {
    const value = formatNumber(e.target.value);
    setDiscount(value);
    
    const error = validateField("discount", value);
    setErrors(prev => ({
      ...prev,
      discount: error
    }));
  };

  const handleDiscountBlur = () => {
    if (discount !== "") {
      setDiscount(formatDisplayValue(discount));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = {};

    // Validate all fields
    const baseRateError = validateField("baseRate", baseRate);
    const additionalChargesError = validateField("additionalCharges", additionalCharges);
    const discountError = validateField("discount", discount);

    if (baseRateError) formErrors.baseRate = baseRateError;
    if (additionalChargesError) formErrors.additionalCharges = additionalChargesError;
    if (discountError) formErrors.discount = discountError;

    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      setLoading(true);
      try {
        await dispatch(updateRateCard({
          id: rateCard?.id,
          rateTypeId: rateCard?.rateTypeId,
          baseRatePerHour: parseFloat(baseRate),
          additionalCharges: parseFloat(additionalCharges),
          discount: parseFloat(discount),
        })).unwrap();

        notification.success({
          message: <h5>Updated Successfully!</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 5,
        });

        onClose();
      } catch (error) {
        notification.error({
          message: <h5>Update Failed</h5>,
          icon: <img src={Icons.warning_circle} alt="Error" />,
          duration: 5,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const base = parseFloat(baseRate) || 0;
    const additional = parseFloat(additionalCharges) || 0;
    const disc = parseFloat(discount) || 0;
    const total = base + additional - (base + additional) * (disc / 100);
    setTotalRate(total.toFixed(2));
  }, [baseRate, additionalCharges, discount]);

  return (
    <Modal
      open={true}
      onCancel={onClose}
      title={rateCardTitle}
      className="ratecard-modal rate-card-configuration-edit-modal"
      centered
      footer={[
        <button
          key="cancel"
          onClick={onClose}
          className="cancel-btn"
          id="ratecard-cancel-button"
        >
          Cancel
        </button>,
        <button
          key="save"
          type="primary"
          onClick={handleSubmit}
          disabled={loading}
          className="save-btn"
          id="ratecard-update-button"
        >
          {loading ? getFormattedMessage("globally.loading.label") : "Update"}
        </button>,
      ]}
      closeIcon={
        <img
          className="custom-close-btn"
          src={Icons.close_icon}
          onClick={onClose}
        />
      }
    >
       <div className="modal-cover-div">
      <div className="rate-edit-form">
        <div className="form-group">
          <label className="form-label">
            Base Rate/Hour
            <img src={Icons.asterisk} className="required" />
          </label>
          <input
            value={baseRate}
            onChange={handleBaseRateChange}
            onBlur={handleBaseRateBlur}
            className={`custom-input ${errors.baseRate ? "custom-input-error" : ""}`}
            id="rate-card-Base-Rate"
            placeholder="0.00"
            maxLength={10}
            min="0.01"
          />
          {errors.baseRate && (
            <div className="error-message">
              <img src={Icons.warning_circle} alt="Warning Icon" />
              <span>{errors.baseRate}</span>
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">
            Additional Charges/Hour
          </label>
          <input
            value={additionalCharges}
            onChange={handleAdditionalChargesChange}
            onBlur={handleAdditionalChargesBlur}
            className={`custom-input ${errors.additionalCharges ? "custom-input-error" : ""}`}
            id="rate-card-Additional Charges"
            placeholder="0.00"
            maxLength={10}
            min="0.01"
          />
          {errors.additionalCharges && (
            <div className="error-message">
              <img src={Icons.warning_circle} alt="Warning Icon" />
              <span>{errors.additionalCharges}</span>
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">
            Discount/Hour
          </label>
          <div className="input-wrapper">
            <input
              value={discount}
              onChange={handleDiscountChange}
              onBlur={handleDiscountBlur}
              className={`custom-input discount ${errors.discount ? "custom-input-error" : ""}`}
              id="rate-card-Discount"
              placeholder="0.00"
              maxLength={10}
              min="0.01"
            />
            <div className="icon-container">
              <img
                src={Icons.percentage}
                className="percentage-icon"
                alt="percentage"
              />
            </div>
          </div>
          {errors.discount && (
            <div className="error-message">
              <img src={Icons.warning_circle} alt="Warning Icon" />
              <span>{errors.discount}</span>
            </div>
          )}
        </div>
        <div className="form-group disabled-form-item">
          <label className="form-label">
            Total Rate Per Hour
          </label>
          <input
            value={formatDisplayValue(totalRate)}
            disabled={true}
            className="custom-input"  
          />
        </div>
      </div>
      </div>
    </Modal>
  );
};

export default EditRateCard;
