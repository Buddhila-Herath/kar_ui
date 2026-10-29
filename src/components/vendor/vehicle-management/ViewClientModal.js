import React, { useState, useEffect } from "react";
import { Modal, Image } from "antd";
import Icons from "../../../utils/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchClientDetails } from "../../../slices/vendor/clientSlice";
import { fetchClientImageByPath } from "../../../slices/vendor/clientSlice";
import ImageModel from "../../../shared/components/ImageModel";
import Spinner from "../../../shared/components/loaders/Spinner";

const ViewClientModal = ({ visible, onClickCancelModel, clientId }) => {
  const [clientImage, setClientImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const dispatch = useDispatch();
  const { clientDetail, isClientDetailLoading } = useSelector(
    (state) => state.vendorClients
  );
  const [isProfilePhotoLoading, setIsProfilePhotoLoading] = useState(false);

  useEffect(() => {
    if (visible && clientId) {
      dispatch(fetchClientDetails(clientId));
    }
  }, [dispatch, visible, clientId]);


  useEffect(() => {
    const fetchClientImage = async () => {
      if (clientDetail?.imagePath && clientDetail.imagePath !== "-") {
        try {
          setIsProfilePhotoLoading(true);
          const res = await dispatch(
            fetchClientImageByPath(clientDetail.imagePath)
          ).unwrap();

          let imageData = res.imageRes || res.data || res.image || res;

          if (imageData && typeof imageData === "string") {
            if (!imageData.startsWith("data:image/")) {
              imageData = `data:image/jpeg;base64,${imageData}`;
            }
            setClientImage(imageData);
          } else {
            setClientImage(null);
          }
          setIsProfilePhotoLoading(false);
        } catch (error) {
          setClientImage(null);
          setIsProfilePhotoLoading(false);
        }
      } else {
        setClientImage(null);
      }
      setIsProfilePhotoLoading(false);
    };

    fetchClientImage();
  }, [clientDetail, dispatch]);

  const onClickCancel = () => {
    onClickCancelModel();
  };

  const onClickViewImageModal = (imagePath) => {
    setModalImage(imagePath);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getFullName = () => {
    if (clientDetail?.clientFirstName && clientDetail?.clientLastName) {
      return `${clientDetail.clientFirstName} ${clientDetail.clientLastName}`;
    } else if (clientDetail?.clientFirstName) {
      return clientDetail.clientFirstName;
    } else if (clientDetail?.clientLastName) {
      return clientDetail.clientLastName;
    }
    return "-";
  };

  const modalTitle = isClientDetailLoading
    ? "View Client"
    : `View Client - ${clientDetail?.clientGenerateId || "N/A"}`;

  return (
    <Modal
      open={visible}
      onCancel={onClickCancel}
      footer={null}
      centered
      width={860}
      title={<h3>{modalTitle}</h3>}
      className="add-modal quote view-quote "
    >
      <div className="add-modal-section">
        {isClientDetailLoading ? (
          <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
            <Spinner />
          </div>
        ) : (
          <div className="view-spare-part-content">
            <div className="spare-info">
              <h4 className="info-header">Client Information</h4>
              <div className="detail">
                <div className="detail-image-container">
                  {isProfilePhotoLoading ? (
                    <div className="detail-image detail-image__avatar loading-container">
                      <Spinner />
                    </div>
                  ) : clientImage ? (
                    <Image
                      src={clientImage}
                      alt="Client Profile"
                      className="detail-image detail-image__avatar"
                      onClick={() => onClickViewImageModal(clientImage)}
                      preview={false}
                    />
                  ) : (
                    <img
                      src={Icons.part_default_img}
                      alt="Client Profile"
                      className="detail-image detail-image__avatar"
                      onClick={() =>
                        onClickViewImageModal(Icons.part_default_img)
                      }
                    />
                  )}
                </div>
                <h4 className="detail-value fw-700">{getFullName()}</h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Contact Number</h5>
                <h4 className="detail-value">
                  {clientDetail?.contactNumber || "-"}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Email Address</h5>
                <h4 className="detail-value">
                  {clientDetail?.emailAddress || "-"}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Address Line 1</h5>
                <h4 className="detail-value">
                  {clientDetail?.addressLine1 || "-"}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Address Line 2</h5>
                <h4 className="detail-value">
                  {clientDetail?.addressLine2 || "-"}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">City/Town</h5>
                <h4 className="detail-value">{clientDetail?.city || "-"}</h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Postal Code</h5>
                <h4 className="detail-value">
                  {clientDetail?.postalCode || "-"}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">District</h5>
                <h4 className="detail-value">{clientDetail?.district || "-"}</h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Province</h5>
                <h4 className="detail-value">{clientDetail?.province || "-"}</h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Country</h5>
                <h4 className="detail-value">{clientDetail?.country || "-"}</h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Company Name</h5>
                <h4 className="detail-value">
                  {clientDetail?.companyName || "-"}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Company Address</h5>
                <h4 className="detail-value">
                  {clientDetail?.companyAddress || "-"}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Company VAT Number</h5>
                <h4 className="detail-value">
                  {clientDetail?.companyVatNumber || "-"}
                </h4>
              </div>
            </div>
            <div className="note-info">
              <h4 className="info-header">Vehicle Information</h4>
              {clientDetail?.vehicles && clientDetail.vehicles.length > 0 ? (
                <div className="detail">
                  <h5 className="detail-label">Vehicle Registration Number</h5>
                  <h4 className="detail-value">
                    {clientDetail.vehicles
                      .map((vehicle) => vehicle.vehicleRegNum || "-")
                      .filter((regNum) => regNum !== "-")
                      .join(", ")}
                  </h4>
                </div>
              ) : (
                "-"
              )}
            </div>
            <div className="additional-info">
              <h4 className="info-header">Additional Information</h4>
              <div className="detail">
                <h5 className="detail-label">Client ID</h5>
                <h4 className="detail-value">
                  {clientDetail?.clientGenerateId || "-"}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Joined Date</h5>
                <h4 className="detail-value">
                  {clientDetail?.joinedDate || "-"}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Registered By</h5>
                <h4 className="detail-value">
                  {clientDetail?.registeredBy || "-"}
                </h4>
              </div>

              <div className="detail">
                <h5 className="detail-label">Status</h5>
                <div
                  className={`detail-status ${clientDetail?.status === "Active"
                    ? 'detail-status__active'
                    : clientDetail?.status === "Inactive"
                      ? 'detail-status__inactive'
                      : ''
                    }`}
                >
                  <h4 className="detail-value">{clientDetail?.status === "Active" ? "Active" : "Inactive"}</h4>
                </div>
              </div>
            </div>
            <div className="add-modal-button">
              <button className="pop-cancel-btn" id="close-view-client-modal-btn" onClick={onClickCancel}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      {isModalOpen && (
        <ImageModel imagePath={modalImage} onClose={closeModal} />
      )}
    </Modal>
  );
};

export default ViewClientModal;
