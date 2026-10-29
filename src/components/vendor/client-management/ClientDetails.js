import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Image } from "antd";
import Icons from "../../../utils/icons";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import Spinner from "../../../shared/components/loaders/Spinner";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import ViewVehicleModal from "./ViewVehicleModal";
import { placeholderText } from "../../../shared/sharedMethod";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import ImageModel from "../../../shared/components/ImageModel";
import { fetchClientDetails , fetchClientImageByPath } from "../../../slices/vendor/clientSlice";

const ClientDetails = () => {
  const { clientDetail, isClientDetailLoading, error } =
    useSelector((state) => state.vendorClients);
  const { id } = useParams();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [vehiclePopup, setVehiclePopup] = useState(false);
  const [clientImage, setClientImage] = useState(null);
  const [isProfilePhotoLoading, setIsProfilePhotoLoading] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  useEffect(() => {
    dispatch(fetchClientDetails(id));
  }, [dispatch, id]);

  const onClickViewImageModal = (imagePath) => {
    setModalImage(imagePath);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleViewVehicleClick = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setVehiclePopup(true);
  };

  const handleCancelVehicleModal = () => {
    setVehiclePopup(false);
  };

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
    };

    fetchClientImage();
  }, [clientDetail, dispatch]);

  return (
    <MasterLayout>
      <TabTitle title={placeholderText("View Clients")} />
      <Breadcrumb
        parent_menu="Client Management"
        parent_menu_url="/app/client-management"
        current_page="View Client"
      />
      <TopProgressBar isLoading={isClientDetailLoading} />
      {isClientDetailLoading ? (
        <Spinner />
      ) : clientDetail ? (
        <>
          <div className="container-quotes tax-invoice">
            <div className="view-spare-header">
              <div className="back-page">
                <Link to="/app/client-management">
                  <img src={Icons.arrow_left} alt="Back Icon" />
                </Link>
                <h3>
                  View Client - {clientDetail.clientGenerateId || "-"}
                </h3>
              </div>
              <div className="tech-edit-btn-container quote-mane">
                <div className="tech-view-edit-btn-container">
                  <Link to={`/app/client-management/edit/${id}`}>
                    <button className="button quote-button tech-view-edit-btn form-button quote-detail-btn">
                      <img src={Icons.pencil_simple_line} alt="Edit Details" />
                      <span>Edit Details</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
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
                        onClick={() =>
                          onClickViewImageModal(clientImage)
                        }
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
                  <h4 className="detail-value fw-700">
                    {clientDetail?.clientFirstName || "-"} {" "}
                    {clientDetail?.clientLastName || "-"}
                  </h4>
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
                  <h4 className="detail-value">
                    {clientDetail?.city || "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Postal Code</h5>
                  <h4 className="detail-value">
                    {clientDetail?.postalCode || "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">District</h5>
                  <h4 className="detail-value">
                    {clientDetail?.district || "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Province</h5>
                  <h4 className="detail-value">
                    {clientDetail?.province || "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Country</h5>
                  <h4 className="detail-value">
                    {clientDetail?.country || "-"}
                  </h4>
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
                  <h5 className="detail-label">Customer VAT Number</h5>
                  <h4 className="detail-value">
                    {clientDetail?.companyVatNumber || "-"}
                  </h4>
                </div>

              </div>
              <div className="note-info">
                <h4 className="info-header">Vehicle Information</h4>
                <div className="detail">
                  <h5 className="detail-label">Vehicle Registration Number</h5>
                  <h4
                    className={`detail-value ${
                      clientDetail?.vehicles && clientDetail.vehicles.length > 0 ? "info-value" : ""
                    }`}
                  >
                  {clientDetail?.vehicles && clientDetail.vehicles.length > 0
                    ? clientDetail.vehicles.map((vehicle, index) => (
                        <React.Fragment key={vehicle.id}>
                          <span 
                            className="value clickable-vehicle"
                            onClick={() => handleViewVehicleClick(vehicle.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            {vehicle.vehicleRegNum}
                          </span>
                          {index < clientDetail.vehicles.length - 1 && (
                            <>
                              <span>,</span>
                              <span> </span>
                            </>
                          )}
                        </React.Fragment>
                      ))
                    : "-"}
                  </h4>
                </div>
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
            </div>
          </div>
        </>
      ) : null}
      {isModalOpen && (
        <ImageModel imagePath={modalImage} onClose={closeModal} className={'usermanagement-view-image'}/>
      )}
      {vehiclePopup && (
        <ViewVehicleModal
          visible={vehiclePopup}
          onClickCancelModel={handleCancelVehicleModal}
          vehicleId={selectedVehicleId}
        />
      )}
    </MasterLayout>
  );
};

export default ClientDetails;
