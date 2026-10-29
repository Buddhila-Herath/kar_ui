import React from "react";
import { Modal } from "antd";
import Icons from "../../utils/icons";

const UploadFileError = ({ 
    openModal, 
    closeErrorModal, 
    closeParentModal,
    modalText, 
    modalSubText, 
    submitButtonText, 
    cancelButtonText,
    showCancelButton = true
}) => {
    return (
        <Modal
            open={openModal}
            onCancel={closeErrorModal}
            centered
            className="danger-modal"
            footer={[
                <button key="submit" onClick={closeErrorModal} className="modal-btn modal-btn__delete" id="upload-file-error-submit-button">
                    <h5>{submitButtonText}</h5>
                </button>,
                showCancelButton && (
                    <button
                        key="cancel"
                        onClick={closeParentModal}
                        className="modal-btn modal-btn__cancel"
                        style={{ color: "#A20000", borderColor: "#A20000" }}
                        id="upload-file-error-cancel-button">
                        <h5>{cancelButtonText}</h5>
                    </button>
                )
            ]}
        >
            <div className="danger-modal__body">
                <img src={Icons.error_email} alt="Error" />
                <h3 style={{ marginBottom: "0.5rem" }}>{modalText}</h3>
                <div className="danger-modal__message">
                    <span>{modalSubText}</span>
                </div>
            </div>
        </Modal>
    )
};

export default UploadFileError;