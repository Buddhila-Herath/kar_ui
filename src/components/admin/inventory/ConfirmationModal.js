import { Modal } from 'antd'
import React, { useState } from 'react'
import Icons from '../../../utils/icons'

export const ConfirmationModal = ({isProcessing,type,visible,onUpdateModalOk, onClose}) => {
    const handleClose=()=>{
        onClose()
    }
   const handleOk=()=>{
     onUpdateModalOk(type);
   }

  return (
       <Modal
            centered
            open={visible}
            onCancel={handleClose}
            onOk={handleOk}
            className="delete-modal"
            footer={[
                <button id='inventory_update_confirm_button' key="submit" className={`modal-btn modal-btn__delete modal-btn-${type}`} disabled={!!isProcessing} onClick={handleOk }>
                    <h5>{isProcessing ? "Please Wait..." : type=='accept'? "Yes, Accept":"Yes, Reject"}</h5>
                </button>,
                <button id='inventory_update_cancel-button' key="back" className={`modal-btn modal-btn__cancel ${isProcessing ? 'disabled-button' : ''}`} disabled={!!isProcessing} onClick={handleClose}>
                    <h5>Cancel</h5>
                </button>
            ]}
        >
            {type === "reject" ? (
              <div className="delete-modal__body">
                <img src={Icons.delete_warning} alt="delete-warning" />
                <h3>Reject Update!</h3>
                <div className="delete-modal__message inventory-confirmation-message">
                        <span>Are you sure you want to reject the Update?</span>
                        <p className='inventory-reject-text'>This action cannot be undone.</p>
                </div>
              </div>
            ) : ( 
              <div className="delete-modal__body">
                <img src={Icons.accept} alt="delete-warning" />
                <h3>Accept Update!</h3>
                <div className="delete-modal__message inventory-confirmation-message">
                        <span>Are you sure you want to accept the Update?</span>
                        <h6>This action cannot be undone.</h6>
                </div>
              </div>
            )}
        </Modal>
  )
}
