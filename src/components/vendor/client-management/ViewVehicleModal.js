import React, { useEffect, useMemo } from "react";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchVehicleDetails } from "../../../slices/vendor/vehicleSlice";
import BaseJob64ImageSlider from "../../../shared/slider/BaseJob64ImageSlider";
import Spinner from "../../../shared/components/loaders/Spinner";

const ViewVehicleModal = ({ visible, onClickCancelModel, vehicleId }) => {
  const dispatch = useDispatch();
  
  const { vehicleDetails, isVehicleDetailsLoading } = useSelector(
    (state) => {
      if (state.vendorVehicle) {
        return state.vendorVehicle;
      }
      return { vehicleDetails: null, isVehicleDetailsLoading: false };
    }
  );

  useEffect(() => {
    if (visible && vehicleId) {
      dispatch(fetchVehicleDetails(vehicleId));
    }
  }, [dispatch, visible, vehicleId]);

  const onClickCancel = () => {
    onClickCancelModel();
  };

  const sortedImagePaths = useMemo(() => {
    if (!vehicleDetails?.initialRegistrationPhotos?.length) return [];
    return [...vehicleDetails.initialRegistrationPhotos]
      .sort((a, b) => (a.imageOrder || 0) - (b.imageOrder || 0))
      .map((item) => item.path);
  }, [vehicleDetails]);

  const modalTitle = isVehicleDetailsLoading 
    ? "View Vehicle" 
    : `View Vehicle - ${vehicleDetails?.vehicleId || "N/A"}`;

  return (
    <Modal
      open={visible}
      onCancel={() => {
        onClickCancelModel();
      }}
      footer={null}
      centered
      width={860}
      title={<h3>{modalTitle}</h3>}
      className="add-modal quote view-quote"
    >
      <div className="add-modal-section">
        {isVehicleDetailsLoading ? (
          <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
            <Spinner />
          </div>
        ) : (
          <div className="view-spare-part-content">
            <div className="spare-info">
              <h4 className="info-header">Vehicle Information</h4>

              <div className="detail">
                <h5 className="detail-label">Vehicle Make</h5>
                <h4 className="detail-value">
                  {vehicleDetails?.vehicleMake || "-"}
                </h4>
              </div>

              <div className="detail">
                <h5 className="detail-label">Vehicle Model</h5>
                <h4 className="detail-value">
                  {vehicleDetails?.vehicleModel || "-"}
                </h4>
              </div>

              <div className="detail">
                <h5 className="detail-label">Year</h5>
                <h4 className="detail-value">
                  {vehicleDetails?.year || "-"}
                </h4>
              </div>

              <div className="detail">
                <h5 className="detail-label">VIN</h5>
                <h4 className="detail-value">
                  {vehicleDetails?.vin || "-"}
                </h4>
              </div>

              <div className="detail">
                <h5 className="detail-label">Color</h5>
                <h4 className="detail-value">
                  {vehicleDetails?.color || "-"}
                </h4>
              </div>
              
              <div className="detail">
                <h5 className="detail-label">Vehicle Registration Number</h5>
                <h4 className="detail-value">
                  {vehicleDetails?.vehicleRegistrationNo || "-"}
                </h4>
              </div>

              <div className="detail">
                <h5 className="detail-label">Insurance Renewal Date</h5>
                <h4 className="detail-value">
                  {vehicleDetails?.insuranceRenewalDate || "-"}
                </h4>
              </div>

              <div className="detail">
                <h5 className="detail-label">Insurance Company</h5>
                <h4 className="detail-value">
                  {vehicleDetails?.insuranceCompany || "-"}
                </h4>
              </div>

              <div className="detail">
                <h5 className="detail-label">License Renewal Date</h5>
                <h4 className="detail-value">
                  {vehicleDetails?.licenseRenewalDate || "-"}
                </h4>
              </div>

              {vehicleDetails &&
                vehicleDetails.initialRegistrationPhotos &&
                vehicleDetails.initialRegistrationPhotos.length > 0 && (
                  <div className="detail image-upload-job vehicle-registration-images client-vehicle-images">
                    <div className="form-row form-footer job-imagess">
                    <h5 className="detail-label">Initial Registration Photo</h5>
                      <div className="upload-containers">
                        <div className="SwiperSlideComponent">
                          <BaseJob64ImageSlider
                            paths={sortedImagePaths}
                            imgPreview={true}
                            desktopImagesPerPage={4}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            <div className="note-info">
              <h4 className="info-header">Vehicle Owner</h4>
              <div className="detail">
                <h5 className="detail-label">Owner</h5>
                <h4 className="detail-value">
                  {vehicleDetails?.owner || "-"}
                </h4>
              </div>
            </div>

            <div className="additional-info">
              <h4 className="info-header">Additional Information</h4>
              <div className="detail">
                <h5 className="detail-label">Vehicle ID</h5>
                <h4 className="detail-value">
                  {vehicleDetails?.vehicleId || "-"}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Created Date</h5>
                <h4 className="detail-value">
                  {vehicleDetails?.createdDate || "-"}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Registered By</h5>
                <h4 className="detail-value">
                  {vehicleDetails?.registeredBy || "-"}
                </h4>
              </div>
            </div>

            <div className="add-modal-button">
              <button
                className="pop-cancel-btn add-modal-cancel"
                onClick={onClickCancel}
                id="close-vehicle-btn"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ViewVehicleModal;
