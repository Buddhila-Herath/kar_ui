import React from "react";
import { Modal } from "antd";
import Icons from "../../../utils/icons";

const ConfirmationModal = ({
  isOpen,
  onClickConfirmModel,
  onClickSkip,
  onClickCancelModel,
  yesText,
  noText,
  title,
  subTitle,
  confirmButtonId,
  cancelButtonId,
}) => {

  return (
    <Modal
      centered
      open={isOpen}
      onOk={onClickConfirmModel}
      onCancel={onClickCancelModel}
      className="password-reset-modal job-confirmation-modal"
      footer={[
        <button
          key="submit"
          onClick={onClickConfirmModel}
          className="modal-btn modal-btn__reset"
          id={confirmButtonId}
        >
          <h5>{yesText}</h5>
        </button>,
        <button
          key="cancel"
          onClick={onClickSkip ?? onClickCancelModel}
          className="modal-btn modal-btn__cancel"
          id={cancelButtonId}
        >
          <h5>{noText}</h5>
        </button>
      ]}
    >
      <div className="password-reset-modal__body">
        <img src={Icons.confirmation} alt="password-reset-icon" />
        <div className="password-reset-modal__message">
          <h3>{title}</h3>
          <span>{subTitle}</span>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmationModal;
