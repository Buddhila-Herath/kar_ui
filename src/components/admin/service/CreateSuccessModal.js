import React from "react";
import { Modal } from "antd";
import Icons from "../../../utils/icons";
import success_icon from "../../../assets/images/success-icon.svg";
import copy_to_clipboard from "../../../assets/images/copy-to-clipboard.svg";

const CreateSuccessModal = ({ visible, setVisible }) => {
  return (
    <Modal
      centered
      open={visible}
      onOk={() => setVisible(false)}
      onCancel={() => setVisible(false)}
      className="success-modal"
      footer={[
        <button key="submit" onClick={() => setVisible(false)} className="modal-btn modal-btn__success">
          <h5>Back to Dashboard</h5>
        </button>
      ]}
    >
      <div className="success-modal__body">
        <img src={success_icon} alt="success-icon" />
        <h3>Vendor Account Successfully Created !</h3>
        <div className="success-modal__vendor_info">
          <div className="success-modal__vendor_info__content">
            <span>Vendor Portal: <a href="https://karstationvendor.com" target="_blank" rel="noreferrer">https://karstationvendor.com</a></span>
            <span>Username: johndoe</span>
            <span>Password:	Ab1@no</span>
          </div>
          <div className="success-modal__vendor_info__icon">
            <img src={copy_to_clipboard} alt="copy-to-clipboard" />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default CreateSuccessModal;