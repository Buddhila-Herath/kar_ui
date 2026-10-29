import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Modal } from "antd";
import CurrentWorkStartPicturePopUp from "../job-management/CurrentWorkStartPicturePopUp";
import { Link, useNavigate } from "react-router-dom";
import Icons from "../../../utils/icons";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import Spinner from "../../../shared/components/loaders/Spinner";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import {
  getFormattedMessage,
  placeholderText,
} from "../../../shared/sharedMethod";
import { useDispatch, useSelector } from "react-redux";
import { fetchVehicleDetails } from "../../../slices/vendor/vehicleSlice";
import { useParams } from "react-router-dom";
import ImageModel from "../../../shared/components/ImageModel";
import ViewClientModal from "./ViewClientModal";
import BaseJob64ImageSlider from "../../../shared/slider/BaseJob64ImageSlider";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

const vehicleDetails = () => {
  const { vehicleDetails, isLoading, isVehicleDetailsLoading, error } =
    useSelector((state) => state.vendorVehicle);

  const { id } = useParams();
  const dispatch = useDispatch();
  const [modalImage, setModalImage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [servicePopup, setServicePopup] = useState(false);
  const [currentImagePreview, setCurrentImagePreview] = useState(false);

  useEffect(() => {
    dispatch(fetchVehicleDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    const handleImagePreview = (event) => {
      const { index, images } = event.detail || {};
      if (typeof index === 'number' && images) {
        setCurrentImagePreview(true);
      }
    };

    window.addEventListener('openCurrentWorkStartPicture', handleImagePreview);
    
    return () => {
      window.removeEventListener('openCurrentWorkStartPicture', handleImagePreview);
    };
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddClientClick = () => {
    setServicePopup(true);
  };

  const handleCancelClientModal = () => {
    setServicePopup(false);
  };

  const getClientId = () => {
    return vehicleDetails?.ownerId;
  };

  const sortedImagePaths = useMemo(() => {
    if (!vehicleDetails?.initialRegistrationPhotos?.length) return [];
    return [...vehicleDetails.initialRegistrationPhotos]
      .sort((a, b) => (a.imageOrder || 0) - (b.imageOrder || 0))
      .map((item) => item.path);
  }, [vehicleDetails]);

  return (
    <MasterLayout>
      <TabTitle title={placeholderText("View Vehicles")} />
      <Breadcrumb
        parent_menu="Vehicle Management"
        parent_menu_url="/app/vehicle-management"
        current_page="View Vehicle"
      />
      <TopProgressBar isLoading={isLoading || isVehicleDetailsLoading} />
      {isLoading || isVehicleDetailsLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="container-quotes tax-invoice pb-8">
            <div className="view-spare-header">
              <div className="back-page">
                <Link to="/app/vehicle-management">
                  <img src={Icons.arrow_left} alt="Back Icon" />
                </Link>
                <h3>
                  View Vehicle -{" "}
                  {vehicleDetails && vehicleDetails.vehicleId
                    ? vehicleDetails.vehicleId
                    : ""}
                </h3>
              </div>
              <div className="tech-edit-btn-container quote-mane">
                <div className="tech-view-edit-btn-container">
                  <Link to={`/app/vehicle-management/edit/${id}`}>
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
                <h4 className="info-header">Vehicle Information</h4>

                <div className="detail">
                  <h5 className="detail-label">Vehicle Make</h5>
                  <h4 className="detail-value">
                    {vehicleDetails && vehicleDetails.vehicleMake
                      ? vehicleDetails.vehicleMake
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Vehicle Model</h5>
                  <h4 className="detail-value">
                    {vehicleDetails && vehicleDetails.vehicleModel
                      ? vehicleDetails.vehicleModel
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Year</h5>
                  <h4 className="detail-value">
                    {vehicleDetails && vehicleDetails.year
                      ? vehicleDetails.year
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">VIN</h5>
                  <h4 className="detail-value">
                    {vehicleDetails && vehicleDetails.vin
                      ? vehicleDetails.vin
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Color</h5>
                  <h4 className="detail-value">
                    {vehicleDetails && vehicleDetails.color
                      ? vehicleDetails.color
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Vehicle Registration No</h5>
                  <h4 className="detail-value">
                    {vehicleDetails && vehicleDetails.vehicleRegistrationNo
                      ? vehicleDetails.vehicleRegistrationNo
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Insurance Renewal Date</h5>
                  <h4 className="detail-value">
                    {vehicleDetails && vehicleDetails.insuranceRenewalDate
                      ? vehicleDetails.insuranceRenewalDate
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Insurance Company</h5>
                  <h4 className="detail-value">
                    {vehicleDetails && vehicleDetails.insuranceCompany
                      ? vehicleDetails.insuranceCompany
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">License Renewal Date</h5>
                  <h4 className="detail-value">
                    {vehicleDetails && vehicleDetails.licenseRenewalDate
                      ? vehicleDetails.licenseRenewalDate
                      : "-"}
                  </h4>
                </div>

                {vehicleDetails &&
                  vehicleDetails.initialRegistrationPhotos &&
                  vehicleDetails.initialRegistrationPhotos.length > 0 && (
                    <div className="detail image-upload-job vehicle-registration-images">
                      <div className="form-row form-footer job-imagess">
                       <div className="images-preview">
                      <h5 className="detail-label initial-registration" style={{alignContent:"center"}}>Initial Registration Photo</h5>
                       <h4
                          className="detail-value download"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setCurrentImagePreview(true)}
                        >
                          Download
                          <img
                            className="arrow-right"
                            src={Icons.arrow_right}
                            alt="download"
                          />
                        </h4>
                        </div>
                        <div className="upload-containers view-vehicle-image">
                          <div className="SwiperSlideComponent completed-job-image-slider view-job-images-container vehicle-management-image">
                            <BaseJob64ImageSlider
                              paths={sortedImagePaths}
                              desktopImagesPerPage={4}
                              id="initial-registration-photo-slider"
                              onImageClick={(url, meta) => {
                                try {
                                  const imagePaths = vehicleDetails.initialRegistrationPhotos?.map(img => 
                                    typeof img === 'string' ? img : (img?.path || img)
                                  ) || [];
                                  
                                  window.dispatchEvent(new CustomEvent('openCurrentWorkStartPicture', {
                                    detail: {
                                      index: meta.index,
                                      images: imagePaths
                                    }
                                  }));
                                } catch (error) {
                                  console.error('Error handling image click:', error);
                                }
                              }}
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
                  <h4
                    className={`detail-value ${
                      vehicleDetails?.ownerId ? "more-info" : ""
                    }`}
                    onClick={
                      vehicleDetails?.ownerId ? handleAddClientClick : undefined
                    }
                    style={{
                      cursor: vehicleDetails?.ownerId ? "pointer" : "default",
                    }}
                  >
                    {vehicleDetails && vehicleDetails.owner
                      ? vehicleDetails.owner
                      : "-"}
                  </h4>
                </div>
              </div>

              <div className="additional-info">
                <h4 className="info-header">Additional Information</h4>
                <div className="detail">
                  <h5 className="detail-label">Vehicle ID</h5>
                  <h4 className="detail-value">
                    {vehicleDetails && vehicleDetails.vehicleId
                      ? vehicleDetails.vehicleId
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Created Date</h5>
                  <h4 className="detail-value">
                    {vehicleDetails && vehicleDetails.createdDate
                      ? vehicleDetails.createdDate
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Registered By</h5>
                  <h4 className="detail-value">
                    {vehicleDetails && vehicleDetails.registeredBy
                      ? vehicleDetails.registeredBy
                      : "-"}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <CurrentWorkStartPicturePopUp
        visible={currentImagePreview}
        setVisible={setCurrentImagePreview}
        imagePaths={sortedImagePaths}
        title="Initial Registration Photos"
      />
      {isModalOpen && (
        <ImageModel imagePath={modalImage} onClose={closeModal} />
      )}

      {servicePopup && (
        <ViewClientModal
          visible={servicePopup}
          onClickCancelModel={handleCancelClientModal}
          clientId={getClientId()}
        />
      )}
    </MasterLayout>
  );
};

export default vehicleDetails;
