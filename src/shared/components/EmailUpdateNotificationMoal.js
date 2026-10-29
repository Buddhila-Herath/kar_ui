import React from "react";
import { Modal } from "antd";
import Icons from "../../utils/icons";

const EmailUpdateNotificationMoal = ({onClickOkModel}) => {

  return (
    <Modal
      centered
      open={true}
      onOk={onClickOkModel}
      onCancel={onClickOkModel}
      className="email-update-notification-modal"
      footer={[
        <button key="submit" onClick={onClickOkModel} className="modal-btn modal-btn__update-email-success" id="email-update-notification-ok-button">
          <h5>OK</h5>
        </button>
      ]}
    >
      <div className="email-update-notification-modal__body">
        <img src={Icons.success_icon} alt="password-reset-icon" />
        <div className="email-update-notification-modal__message">
          <span className="cancel-title">Your email address has been updated</span>
          <span>Please check your email for the updated email address</span>
        </div>
      </div>
    </Modal>
  );
}

export default EmailUpdateNotificationMoal;
