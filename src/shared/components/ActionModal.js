import React from "react";
import { Modal } from "antd";
import Icons from "../../utils/icons";

const LOADING_TEXT = 'Please wait...';

const ActionModal = ({
  onClickConfirmModel,
  onClickCancelModel,
  title,
  subtext,
  yestBtnTxt,
  noBtnTxt,
  isConfirmDisabled = false,
  className = '',
  loading = false,
  isCancelLoading = false
}) => {
  const [isYesLoading, setIsYesLoading] = React.useState(false);
  const [isNoLoading, setIsNoLoading] = React.useState(false);
  const [noButtonText, setNoButtonText] = React.useState(noBtnTxt);

  const handleYesClick = async (e) => {
    if (isYesLoading) return;
    setIsYesLoading(true);
    try {
      await Promise.resolve(onClickConfirmModel(e));
    } finally {
      setIsYesLoading(false);
    }
  };

  const handleNoClick = async (e) => {
    if (isNoLoading) return;
    setIsNoLoading(true);
    setNoButtonText('Saving...');
    try {
      await Promise.resolve(onClickCancelModel(e));
    } finally {
      setIsNoLoading(false);
      setNoButtonText(noBtnTxt);
    }
  };

  return (
    <Modal
      centered
      open={true}
      onOk={handleYesClick}
      onCancel={handleNoClick}
      className={`password-reset-modal ${className}`.trim()}
      footer={[
        <button
          key="submit"
          onClick={handleYesClick}
          className={`modal-btn modal-btn__reset yes-btn ${
            (isConfirmDisabled || isYesLoading) ? "disabled-button " : ""
          }`}
          disabled={isConfirmDisabled || isYesLoading}
          id="action-modal-confirm-button"
        >
          {isYesLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {LOADING_TEXT}
            </div>
          ) : (
            <h5>{yestBtnTxt}</h5>
          )}
        </button>,
        <button 
          key="cancel" 
          onClick={handleNoClick} 
          className="modal-btn modal-btn__cancel"
          disabled={isNoLoading}
          style={isNoLoading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
          id="action-modal-cancel-button"
        >
          <h5>{isNoLoading ? noButtonText : noBtnTxt}</h5>
        </button>
      ]}
    >
      <div className="password-reset-modal__body">
        <img src={Icons.password_reset} alt="password-reset-icon" />
        <div className="password-reset-modal__message">
          <span className="cancel-title">{title}</span>
          <span>{subtext}</span>
        </div>
      </div>
    </Modal>
  );
}

export default ActionModal;
