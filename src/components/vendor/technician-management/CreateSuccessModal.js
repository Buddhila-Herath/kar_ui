import React, { useState } from "react";
import { Modal, Tooltip } from "antd";
import {useNavigate} from 'react-router-dom';
import Icons from "../../../utils/icons";
import success_icon from "../../../assets/images/success-icon.svg";
import {technician_app} from '../../../config/environment';

const CreateSuccessModal = ({ visible, setVisible, email, password }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const navigate = useNavigate();


  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show the tooltip
        setIsTooltipVisible(true);
        // Hide the tooltip after 2 seconds
        setTimeout(() => setIsTooltipVisible(false), 2000);
      })
      .catch(() => {
        // Handle error if needed (optional)
        console.error("Failed to copy to clipboard.");
      });
  };

  return (
    <Modal
      centered
      maxWidth={420}
      open={visible}
      onOk={() => setVisible(false)}
      onCancel={() => navigate("/app/technician-management")}
      className="success-modal technician"
      footer={[
        <button key="submit" onClick={() => navigate("/app/dashboard")} className="modal-btn modal-btn__success">
          <h5>Back to Dashboard</h5>
        </button>
      ]}
    >
      <div className="success-modal__body">
        <img src={success_icon} alt="success-icon" />
        <h3>Technician Account Created <br></br>Successfully!</h3>
        <div className="success-modal__vendor_info">
          <div className="success-modal__vendor_info__content">
            <span>Technician Portal: <a href={technician_app.URL} target="_blank" rel="noreferrer">{technician_app.URL}</a></span>
            <span>Email: {email}</span>
            <span>Password: {password}</span>
          </div>
          <div className="success-modal__vendor_info__icon" onClick={() => copyToClipboard(`Technician Portal: ${technician_app.URL}\nEmail: ${email}\nPassword: ${password}`)}>
            <Tooltip title="Copied!" open={isTooltipVisible}>
              <img
                src={Icons.copy_to_clipboard}
                alt="copy-to-clipboard"
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default CreateSuccessModal;