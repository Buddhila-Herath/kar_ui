import React from "react";
import { Modal, Spin } from "antd";
import Icons from "../../utils/icons";

const ConfirmationModal = ({
  isOpen, 
  onClickConfirmModel, 
  onClickCancelModel, 
  yesText, 
  noText, 
  title, 
  subTitle,
  isLoading
}) => {

  return (
    <Modal
      centered
      open={isOpen}
      onOk={onClickConfirmModel}
      onCancel={onClickCancelModel}
      className="password-reset-modal job-confirmation-modal"
      id="technician-confirmation-modal"
      footer={[
        <button key="submit" id="technician-confirmation-modal-confirm" disabled={isLoading} onClick={onClickConfirmModel} className="modal-btn modal-btn__reset">
          <h5 id="technician-confirmation-modal-confirm-text">{yesText}</h5>
        </button>,
        <button key="submit" id="technician-confirmation-modal-cancel" onClick={onClickCancelModel} className="modal-btn modal-btn__cancel">
          <h5 id="technician-confirmation-modal-cancel-text">{noText}</h5>
        </button>
      ]}
    >
      <div className="password-reset-modal__body" id="technician-confirmation-modal-body">
        <img src={Icons.password_reset} alt="password-reset-icon" id="technician-confirmation-modal-icon" />
        <div className="password-reset-modal__message" id="technician-confirmation-modal-message">
          <h3 id="technician-confirmation-modal-title">{title}</h3>
          <span id="technician-confirmation-modal-subtitle">{subTitle}</span>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmationModal;
