import React from "react";
import { Modal } from "antd";
import Icons from "../../utils/icons";

const CancelModal = ({
  onClickConfirmModel, 
  onClickCancelModel,
  title = "Cancel the Process?",
  subTitle = "Are you sure you want to cancel?",
  yesText = "Yes, Cancel",
  noText = "No",
  isOpen = true
}) => {

  return (
    <Modal
      centered
      open={isOpen}
      onOk={onClickConfirmModel}
      onCancel={onClickCancelModel}
      className="password-reset-modal"
      zIndex={2000}
      footer={[
        <button key="submit" onClick={onClickConfirmModel} className="modal-btn modal-btn__reset" id="cancel-modal-confirm-button">
          <h5>{yesText}</h5>
        </button>,
        <button key="cancel" onClick={onClickCancelModel} className="modal-btn modal-btn__cancel" id="cancel-modal-cancel-button">
          <h5>{noText}</h5>
        </button>
      ]}
    >
      <div className="password-reset-modal__body">
        <img src={Icons.password_reset} alt="password-reset-icon" />
        <div className="password-reset-modal__message">
          <span className="cancel-title">{title}</span>
          <span>{subTitle}</span>
        </div>
      </div>
    </Modal>
  );
}

export default CancelModal;
