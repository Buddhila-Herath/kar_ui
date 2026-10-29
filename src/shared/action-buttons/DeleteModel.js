import React, { useCallback, useEffect, useState } from 'react';
import { getFormattedMessage } from '../sharedMethod';
import { Modal } from "antd";
import Icons from "../../utils/icons";

const DeleteModel = (props) => {
    const { onClickDeleteModel, deleteUserClick, dataType, id, isProcessing } = props;
    const [visible, setVisible] = useState(true);    
    const escFunction = useCallback((event) => {
        if (event.keyCode === 27) {
            // User for Close the model on Escape
            onClickDeleteModel(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', escFunction, false);
        return () => {
            document.removeEventListener('keydown', escFunction, false);
        };
    }, []);

    return (
        <Modal
            centered
            open={visible}
            onOk={isProcessing ? undefined : deleteUserClick}
            onCancel={isProcessing ? undefined : onClickDeleteModel}
            className="delete-modal"
            footer={[
                <button id='confirm-delete-button' key="submit" onClick={isProcessing ? undefined : deleteUserClick} className="modal-btn modal-btn__delete" disabled={!!isProcessing}>
                    <h5>{isProcessing ? "Please Wait..." : getFormattedMessage('delete-modal.yes-btn')}</h5>
                </button>,
                <button id='cancel-delete-button' key="back" onClick={isProcessing ? undefined : onClickDeleteModel} className={`modal-btn modal-btn__cancel ${isProcessing ? 'disabled-button' : ''}`} disabled={!!isProcessing}>
                    <h5>{getFormattedMessage('delete-modal.no-btn')}</h5>
                </button>
            ]}
        >
            {dataType === "record" ? (
                <div className="delete-modal__body">
                    <img src={Icons.delete_warning} alt="delete-warning" />
                    <h3>Delete Record!</h3>
                    <div className="delete-modal__message">
                        <span>Are you sure you want to delete this record?</span>
                        <p>{getFormattedMessage('delete-modal.undone-msg')}</p>
                    </div>
                </div>
            ) : ( 
                <div className="delete-modal__body">
                    <img src={Icons.delete_warning} alt="delete-warning" />
                    <h3>{getFormattedMessage('delete-modal.title')}</h3>
                    <div className="delete-modal__message">
                        <span>{getFormattedMessage('delete-modal.msg')}</span>
                        <h6>{getFormattedMessage('delete-modal.undone-msg')}</h6>
                    </div>
                </div>
            )}
        </Modal>
    )
};
export default DeleteModel;
