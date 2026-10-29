import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Spin } from 'antd';
import { getJobPauseReason } from "../../slices/vendor/jobSlice";
import Base64ImageSlider from '../../shared/slider/Base64ImageSlider';

const PausedReasonModal = ({ visible, onClose, service }) => {
  const dispatch = useDispatch();
  const { pauseReason, isPauseReasonLoading, pauseReasonError } = useSelector((state) => state.vendorJobs);

  useEffect(() => {
    if (visible && service?.serviceId) {
      dispatch(getJobPauseReason(service?.serviceId));
    }
  }, [visible, service?.serviceId, dispatch]);

  if (isPauseReasonLoading) {
    return (
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        width={796}
        id="technician-paused-reason-modal-loading"
      >
        <div style={{ textAlign: 'center', padding: '24px' }} id="technician-paused-reason-modal-loading-spinner">
          <Spin size="large" />
        </div>
      </Modal>
    );
  }

  if (pauseReasonError) {
    return (
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        width={796}
        id="technician-paused-reason-modal-error"
      >
        <div style={{ color: '#fff', backgroundColor: '#A20000', margin: '20px', padding: '8px 16px' }} id="technician-paused-reason-modal-error-message">
          Failed to load pause reasons: {pauseReasonError.message || 'Unknown error'}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={`${service?.serviceCategory || ''} - ${service?.serviceName || ''}`}
      open={visible}
      onCancel={onClose}
      className="paused-job"
      id="technician-paused-reason-modal"
      footer={[
        <button
          key="cancel"
          id="technician-paused-reason-modal-cancel"
          onClick={onClose}
          className="pop-cancel-btn add-modal-cancel"
        >
          Cancel
        </button>
      ]}
      width={796}
    >
      <div className="paused" id="technician-paused-reason-content">
        {pauseReason?.feedbackViewDtoList?.map((feedback, index) => (
          <React.Fragment key={feedback.feedBackId}>
            <div className={feedback.feedback === "Job Alteration" ? "alert" : ""} id={`technician-paused-reason-feedback-${index}`}>
              <ul className="view-img" style={{ listStyleType: 'disc', paddingLeft: '20px', color: '#0B1426' }} id={`technician-paused-reason-feedback-list-${index}`}>
                <li className="images" id={`technician-paused-reason-feedback-item-${index}`}>
                  {feedback.feedback}
                </li>
              </ul>
              {feedback.feedback === "Job Alteration" && (
                <p className="alert-para" id={`technician-paused-reason-feedback-comments-${index}`}>
                  {feedback.comments}
                </p>
              )}
            </div>

            {feedback.images?.length > 0 && (
              <div className="img-preview-conainer" id={`technician-paused-reason-images-${index}`}>
                <Base64ImageSlider 
                  key={feedback.id}
                  images={feedback.images}
                  isDots={false}
                  imgPreview={true}
                  id={`technician-paused-reason-image-slider-${index}`}
                />
              </div>
            )}

            {index < pauseReason.feedbackViewDtoList.length - 1 && (
              <div className="seperator" id={`technician-paused-reason-separator-${index}`} style={{ 
                height: '1px',
                backgroundColor: '#e8e8e8',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </Modal>
  );
};

export default PausedReasonModal;