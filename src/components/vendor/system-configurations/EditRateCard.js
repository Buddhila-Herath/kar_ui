import React, { useState, useEffect } from "react";
import { Modal, notification } from "antd";
import { useDispatch } from 'react-redux';
import Icons from "../../../utils/icons";
import { updateRateCard } from '../../../slices/vendor/systemConfigurationSlice';
import { placeholderText, getFormattedMessage } from '../../../shared/sharedMethod';

const EditRateCard = ({ rateCard, onClose }) => {
  const dispatch = useDispatch();
  const rateCardTitle = rateCard && rateCard.rateTypeName ? rateCard.rateTypeName : "Untitled";
  const [baseRate, setBaseRate] = useState(rateCard && rateCard.baseRatePerHour ? rateCard.baseRatePerHour : "0.00");
  const [additionalCharges, setAdditionalCharges] = useState(
    rateCard && rateCard.additionalCharges ? rateCard.additionalCharges : "0.00"
  );
  const [discount, setDiscount] = useState(rateCard && rateCard.discount ? rateCard.discount : "0");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [totalRate, setTotalRate] = useState(0);

  const handleDiscountChange = (e) => {
    const value = e.target.value;
    setDiscount(value);
  
    // Clear discount error if the new value is valid
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
      setErrors(prevErrors => {
        const newErrors = {...prevErrors};
        delete newErrors.discount;
        return newErrors;
      });
    }
  };

  const handleAdditionalChargesChange = (e) => {
    const value = e.target.value;
    setAdditionalCharges(value);
  
    // Clear error if the input becomes valid
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.additionalCharges;
        return newErrors;
      });
    }
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = {};

    if (baseRate === "") {
      formErrors.baseRate = "Base Rate/Hour field is required";
    } else if (isNaN(baseRate)) {
      formErrors.baseRate = "Base Rate/Hour field must be a valid number";
    } else if (parseFloat(baseRate) <= 0) {
      formErrors.baseRate = "Base Rate/Hour field must be greater than 0";
    }
    
    if (additionalCharges !== "") {
      if (isNaN(parseFloat(additionalCharges))) {
        formErrors.additionalCharges = "Additional Charges/Hour field must be a valid number";
      } else if (parseFloat(additionalCharges) < 0) {
        formErrors.additionalCharges = "Additional Charges/Hour field cannot be less than 0";
      }
    }
    
    if (discount !== "") {
      if (isNaN(discount)) {
        formErrors.discount = "Discount/Hour field must be a valid number";
      } else if (parseFloat(discount) < 0 || parseFloat(discount) > 100) {
        formErrors.discount = "Discount/Hour field must be between 0 and 100";
      }
    }

    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      setLoading(true);
      try {
        await dispatch(updateRateCard({
          id: rateCard?.id,
          rateTypeId:rateCard?.rateTypeId,
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
        >
          Cancel
        </button>,
        <button
          key="save"
          type="primary"
          onClick={handleSubmit}
          disabled={loading}
          className="save-btn"
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
      <div className="rate-edit-form">
        <div className="form-group">
          <label className="form-label">
            Base Rate/Hour
            <img src={Icons.asterisk} className="required" />
          </label>
          <input
            defaultValue={(parseFloat(baseRate) || 0).toFixed(2)}
            onChange={(e) => setBaseRate(e.target.value)}
            className={`custom-input ${errors.baseRate ? "custom-input-error" : ""}`}
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
            defaultValue={additionalCharges}
            onChange={handleAdditionalChargesChange}
            className={`custom-input ${errors.additionalCharges ? "custom-input-error" : ""}`}
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
              defaultValue={discount}
              onChange={handleDiscountChange}
              className={`custom-input discount ${errors.discount ? "custom-input-error" : ""}`}
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
            value={totalRate}
            disabled={true}
            className="custom-input"  
          />
        </div>
      </div>
    </Modal>
  );
};

export default EditRateCard;
