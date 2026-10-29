import React from "react";
import { Modal } from "antd";
import password_reset_icon from "../../../assets/images/password-reset-icon.svg";

const PasswordResetModal = ({ visible, setVisible }) => {
  return (
    <Modal
      centered
      open={visible}
      onOk={() => setVisible(false)}
      onCancel={() => setVisible(false)}
      className="password-reset-modal"
      footer={[
        <button key="submit" onClick={() => setVisible(false)} className="modal-btn modal-btn__reset">
          <h5>Send</h5>
        </button>,
        <button key="submit" onClick={() => setVisible(false)} className="modal-btn modal-btn__cancel">
          <h5>Cancel</h5>
        </button>
      ]}
    >
      <div className="password-reset-modal__body">
        <img src={password_reset_icon} alt="password-reset-icon" />
        <h3>Send Reset Password to Vendor?</h3>
        <div className="password-reset-modal__message">
          <span>Are you sure you want to send a password reset link to the vendor at [info@islandauto.lk]?</span>
        </div>
      </div>
    </Modal>
  );
}

export default PasswordResetModal;
