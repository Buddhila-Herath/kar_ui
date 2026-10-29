import React, { useState, useRef, useEffect } from "react";
import { Modal, notification } from "antd";
import { useDispatch } from "react-redux";
import "./styles.css";
import PausedReasonDialogDropDown from "./dropdown";
import Icons from "../../../../utils/icons";
import {
  updateJobStatus,
  fetchJobDetails as fetchVendorJobDetails,
  removeNewlyAddedPartService,
  removeUpdatedPartService,
  updateUniversalJobStatus
} from "../../../../slices/vendor/jobSlice";
import {
  fetchJobDetails as fetchTechnicianJobDetails,
} from "../../../../slices/technician/jobSlice";
import { updateQuote } from '../../../../slices/vendor/quoteSlice';
import {
  getTempQuote,
  clearTempQuote,
  getTempSpareParts,
  clearTempSpareParts,
  getTempServiceIds,
  clearTempServiceIds,
  getTempEditedSpareParts,
  clearTempEditedSpareParts,
  getTempEditedServices,
  clearTempEditedServices
} from '../../../../utils/storage';
import CancelModal from "../../../../shared/components/CancelModal";

const PausedReasonDialog = (props) => {
  const { open, onCancel, quoteId, onEditQuote, serviceId, jobId, quoteLoading, serviceIds, isVendor = true, onRefetchServiceDetails } = props;
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isFeedbackSaved, setIsFeedbackSaved] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const dropdownRef = useRef();
  const dispatch = useDispatch();

  const handleSaveSuccess = (success) => {
    setIsFeedbackSaved(success);
    if (success) {
      setSaveError('');
    }
  };

  const handleUpdateJobStatus = async () => {
    if (!isFeedbackSaved) {
      setSaveError('Please save your feedback before pausing the job.');
      return;
    }

    setLoading(true);
    try {
      let tempQuote;
      if(serviceId) {
        tempQuote = getTempQuote(serviceId);
      } else {
        tempQuote = getTempQuote(jobId);
      }

      // Update quote if temp quote exists
      if (tempQuote) {
        const resultAction = await dispatch(updateQuote(tempQuote));
        if (!updateQuote.fulfilled.match(resultAction)) {
          const errorMessage = resultAction.payload?.errors
            ? "Validation failed. Ensure all fields are correct."
            : "Failed to update data.";
          throw new Error(errorMessage);
        }
      }

      let response;
      if(serviceId) {
        // Update service job status
        response = await dispatch(updateJobStatus({
          jobId: jobId,
          quoteServiceId: serviceId,
          status: "Paused"
        })).unwrap();
      } else {
        // Update universal job status
        let dataToSend = {
          jobId: jobId,
          universalJobStatus: "PAUSED",
        };
  
        response = await dispatch(
          updateUniversalJobStatus(dataToSend)
        ).unwrap();
      }

      // Reset feedback fields after successful save
      if (dropdownRef.current) {
        dropdownRef.current.resetAllFields();
      }
      setIsFeedbackSaved(false);
      setSaveError('');

      onCancel();
      notification.success({
        message: <h5>Updated successfully!</h5>,
        icon: <img src={Icons.check} alt="Success" />,
        duration: 5
      });

      clearTempQuote(serviceId);
      clearTempSpareParts(quoteId);
      clearTempServiceIds(quoteId);
      clearTempEditedSpareParts(quoteId);
      clearTempEditedServices(quoteId);

      // Use callback to refetch service details if provided, otherwise fall back to full job details
      if (onRefetchServiceDetails) {
        await onRefetchServiceDetails();
      } else {
        const fetchJob = isVendor ? fetchVendorJobDetails : fetchTechnicianJobDetails;
        dispatch(fetchJob(jobId));
      }

      return response;

    } catch (error) {
      notification.error({
        message: <h5>{error.message || "Something went wrong"}</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverQuote = async () => {
    try {
      const tempQuote = getTempQuote(serviceId);

      if (tempQuote) {
        const tempSparePartIds = getTempSpareParts(quoteId);
        const tempServiceIds = getTempServiceIds(quoteId);

        const removalData = {
          quotePartsIds: tempSparePartIds || [],
          quoteServiceIds: tempServiceIds || []
        };

        if (removalData.quotePartsIds.length > 0 || removalData.quoteServiceIds.length > 0) {
          await dispatch(removeNewlyAddedPartService(removalData)).unwrap();
        }

        const tempEditedSparePartIds = getTempEditedSpareParts(quoteId);
        const tempEditedServiceIds = getTempEditedServices(quoteId);

        const removalEditedData = {
          quotePartsIds: tempEditedSparePartIds || [],
          quoteServiceIds: tempEditedServiceIds || []
        };

        if (removalEditedData.quotePartsIds.length > 0 || removalEditedData.quoteServiceIds.length > 0) {
          await dispatch(removeUpdatedPartService(removalEditedData)).unwrap();
        }
        
        clearTempSpareParts(quoteId);
        clearTempServiceIds(quoteId);
        clearTempEditedSpareParts(quoteId);
        clearTempEditedServices(quoteId);
        clearTempQuote(serviceId);
      }
    } catch (error) {
      notification.error({
        message: <h5>Failed to update data</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    } finally {
      setSaveError("");
      onCancel();
    }
  };

  const handleClose = async () => {
    if (isFeedbackSaved) {
      setShowCancelPopup(true);
    } else {
      await handleRecoverQuote();
      if (dropdownRef.current) {
        dropdownRef.current.resetAllFields();
      }
    }
  };

  const handleConfirmCancel = async () => {
    try {
      await handleRecoverQuote();
      setShowCancelPopup(false);
      if (dropdownRef.current) {
        dropdownRef.current.resetAllFields();
      }
    } catch (error) {
      setShowCancelPopup(false);
    }
  };

  const handleCancelCancel = () => {
    setShowCancelPopup(false);
  };

  // Reset feedback fields when modal opens
  useEffect(() => {
    if (open && dropdownRef.current) {
      dropdownRef.current.resetAllFields();
      setIsFeedbackSaved(false);
      setSaveError('');
    }
  }, [open]);

  return (
    <>
      <Modal
        title={<h3>Paused Reason</h3>}
        open={open}
        onCancel={handleClose}
        footer={null}
        width={796}
        height={516}
        className="add-modal quote pause-modal"
        maskClosable={false}
      >
        <div className="add-modal-section">
          <div className="form-row">
            <div className="form-item form-item__full">
              <PausedReasonDialogDropDown
                onSaveSuccess={handleSaveSuccess}
                quoteId={quoteId}
                onEditQuote={() => onEditQuote(quoteId)}
                serviceId={serviceId}
                quoteLoading={quoteLoading}
                jobId={jobId}
                serviceIds={serviceIds}
                ref={dropdownRef}
                isVendor={isVendor}
              />
              <label className="form-label required" htmlFor="description">
                <h4>Select Feedback</h4>
              </label>
            </div>
          </div>
          <div className="footer add-modal-button">
            <div className="pause-footer">
              <div className="pr-footer-messages">
                {saveError && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning" />
                    <h6>{saveError}</h6>
                  </div>
                )}
              </div>
              <div className="pr-footer-buttons">
                <button className="pr-footer-cancel-btn" id="cancel-pause-job-modal-btn" onClick={handleClose}>Cancel</button>
                <button className="pr-footer-save-btn" id="submit-pause-job-modal-btn" disabled={loading} onClick={handleUpdateJobStatus}>
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {showCancelPopup && (
        <CancelModal
          onClickConfirmModel={handleConfirmCancel}
          onClickCancelModel={handleCancelCancel}
        />
      )}
    </>
  );
};

export default PausedReasonDialog;
