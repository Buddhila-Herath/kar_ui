import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Spin } from 'antd';
import { getJobPauseReason } from "../../../slices/vendor/jobSlice";
import Base64ImageSlider from '../../../shared/slider/Base64ImageSlider';

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
      >
        <div style={{ textAlign: 'center', padding: '24px' }}>
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
      >
        <div style={{ color: '#fff', backgroundColor: '#A20000', margin: '20px', padding: '8px 16px' }}>
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
      footer={[
        <button
          key="cancel"
          onClick={onClose}
          className="pop-cancel-btn add-modal-cancel"
          id="paused-reason-modal-cancel-button"
        >
          Cancel
        </button>
      ]}
      width={796}
    >
      <div className="paused">
        {pauseReason?.feedbackViewDtoList?.map((feedback, index) => (
          <React.Fragment key={feedback.feedBackId}>
            <div className={feedback.feedback === "Job Alteration" ? "alert" : ""}>
              <ul className="view-img" style={{ listStyleType: 'disc', paddingLeft: '20px', color: '#0B1426' }}>
                <li className="images">
                  {feedback.feedback}
                </li>
              </ul>
              {feedback.feedback === "Job Alteration" && (
                <p className="alert-para">
                  {feedback.comments}
                </p>
              )}
            </div>

            {feedback.images?.length > 0 && (
              <div className="img-preview-conainer">
                <Base64ImageSlider 
                  key={feedback.id}
                  images={feedback.images}
                  isDots={false}
                  imgPreview={true}
                />
              </div>
            )}

            {index < pauseReason.feedbackViewDtoList.length - 1 && (
              <div className="seperator" style={{ 
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