import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icons from "../../../utils/icons";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import {
  placeholderText,
} from "../../../shared/sharedMethod";
import { useDispatch, useSelector } from "react-redux";
import { fetchVendorDetails } from "../../../slices/vendorSlice";
import { useParams } from "react-router-dom";
import Spinner from "../../../shared/components/loaders/Spinner";
import ImageModel from "../../../shared/components/ImageModel";
import { fetchImageByPath } from "../../../slices/masterDataSlice";
import { Spin } from "antd";
import {downloadAttachment} from "../../../slices/masterDataSlice";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";

const VendorDetails = () => {
  const { vendorDetails, isVendorDetailsLoading, error } = useSelector(
    (state) => state.vendors
  );
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchVendorDetails({ id, type: 'view' }));
  }, [dispatch]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");

  const [isNicFrontLoading, setIsNicFrontLoading] = useState(false);
  const [isNicBackLoading, setIsNicBackLoading] = useState(false);
  const [isProfilePhotoLoading, setIsProfilePhotoLoading] = useState(false);
  const [isBusinessLogoLoading, setIsBusinessLogoLoading] = useState(false);
  const [nicFrontImg, setNicFrontImg] = useState(null);
  const [nicBackImg, setNicBackImg] = useState(null);
  const [profilePhotoImg, setProfilePhotoImg] = useState(null);
  const [businessLogoImg, setBusinessLogoImg] = useState(null);
  const [isDocDownloadLoading, setIsDocDownloadLoading] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      if (!vendorDetails) return;
      
      try {
        if (vendorDetails?.nicFrontPath) {
          setIsNicFrontLoading(true);
          const resFront = await dispatch(fetchImageByPath(vendorDetails.nicFrontPath)).unwrap();
          setNicFrontImg(resFront ? resFront.url : null);
          setIsNicFrontLoading(false);
        }

        if (vendorDetails?.nicBackPath) {
          setIsNicBackLoading(true);
          const resBack = await dispatch(fetchImageByPath(vendorDetails.nicBackPath)).unwrap();
          setNicBackImg(resBack ? resBack.url : null);
          setIsNicBackLoading(false);
        }

        if (vendorDetails?.profilePhotoPath) {
          setIsProfilePhotoLoading(true);
          const resProfile = await dispatch(fetchImageByPath(vendorDetails.profilePhotoPath)).unwrap();
          setProfilePhotoImg(resProfile ? resProfile.url : null);
          setIsProfilePhotoLoading(false);
        }

        if (vendorDetails?.businessLogoPath) {
          setIsBusinessLogoLoading(true);
          const resLogo = await dispatch(fetchImageByPath(vendorDetails.businessLogoPath)).unwrap();
          setBusinessLogoImg(resLogo ? resLogo.url : null);
          setIsBusinessLogoLoading(false);
        }
      } catch (error) {
        console.error("Error loading images:", error);
        // Reset all loading states in case of error
        setIsNicFrontLoading(false);
        setIsNicBackLoading(false);
        setIsProfilePhotoLoading(false);
        setIsBusinessLogoLoading(false);
      }
    };

    if (
      vendorDetails?.nicFrontPath ||
      vendorDetails?.nicBackPath ||
      vendorDetails?.profilePhotoPath ||
      vendorDetails?.businessLogoPath
    ) {
      fetchImages();
    }
  }, [
    vendorDetails?.nicFrontPath,
    vendorDetails?.nicBackPath,
    vendorDetails?.profilePhotoPath,
    vendorDetails?.businessLogoPath,
    dispatch,
  ]);

  const downloadAttachement = async (documentPath, fileName) => {
    setIsDocDownloadLoading(true);
    try {
      if (!documentPath) {
        console.error("Document path is not provided.");
        return;
      }

      const { data, headers } = await dispatch(
        downloadAttachment(documentPath)
      ).unwrap();

      const contentType = headers["content-type"] || "application/octet-stream";
      const blob = new Blob([data], { type: contentType });

      const downloadName = fileName || "file.pdf";
      saveAs(blob, downloadName);
    } catch (error) {
      console.error(
        "Error downloading the file:",
        error.message || "Unknown error occurred."
      );
    } finally {
      setIsDocDownloadLoading(false);
    }
  };

  const getFileNameFromPath = (path) => {
    if (!path) return "";
    const parts = path.split("/");
    return parts[parts.length - 1];
  };

  const onClickViewImageModal = (imagePath) => {
    setModalImage(imagePath);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <MasterLayout>
      <TabTitle title={placeholderText("vendor.create.view")} />
      <Breadcrumb
        parent_menu="Vendor Management"
        parent_menu_url="/admin/vendor-management"
        current_page="View Vendor  "
      />
      <TopProgressBar isLoading={isVendorDetailsLoading || isDocDownloadLoading} />
      {isVendorDetailsLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="view-spare-container">
            <div className="view-spare-header">
              <div className="back-page">
                <Link to="/admin/vendor-management">
                  <img src={Icons.arrow_left} alt="Back Icon" />
                </Link>
                <h3>View Vendor</h3>
              </div>
            </div>
            <div className="view-spare-part-content">
              <div className="spare-info">
                <h4 className="info-header tech-view-header">
                  Personal Information
                </h4>
                <div className="detail">
                  <div className="detail-image-container">
                    {isProfilePhotoLoading ? (
                      <div className="spin-container">
                        <Spin tip="Loading... Please wait." size="small" />
                      </div>
                    ) : profilePhotoImg ? (
                      <img
                        src={profilePhotoImg}
                        alt="Vendor Profile"
                        className="detail-image detail-image__avatar"
                        onClick={() =>
                          onClickViewImageModal(
                            profilePhotoImg
                          )
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = Icons.avatar;
                        }}
                      />
                    ) : (
                      <img
                        src={Icons.avatar}
                        alt="Vendor Profile"
                        className="detail-image detail-image__avatar"
                        onClick={() =>
                          onClickViewImageModal(Icons.avatar)
                        }
                      />
                    )}
                  </div>
                  <h4 className="detail-value fw-700">
                    {vendorDetails && vendorDetails.fullName
                      ? vendorDetails.fullName
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Contact Number</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.mobileNumber
                      ? vendorDetails.mobileNumber
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Email Address</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.emailAddress
                      ? <a href={`mailto:${vendorDetails.emailAddress}`} target="_blank">{vendorDetails.emailAddress}</a>
                      : "-"}
                  </h4>
                </div>

                <div className="detail">
                  <h5 className="detail-label">NIC</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.nic
                      ? vendorDetails.nic
                      : "-"}
                  </h4>
                </div>
                <div className="entity entity__colunm ">
                  <h5 className="entity-label fw-5">Uploaded NIC</h5>
                  <div className="entity-container">
                    {vendorDetails?.nicFrontPath && (
                      <div className="nic-container">
                        <div className="nic-header">
                          <h5>NIC Front Side</h5>
                        </div>
                        <div className="nic-image">
                          <figure>
                            {isNicFrontLoading || !nicFrontImg ? (
                              <div className="spin-container">
                                <Spinner/>
                              </div>
                            ) : (
                              <img
                                src={nicFrontImg}
                                alt="NIC Front"
                                onClick={() =>
                                  onClickViewImageModal(
                                    nicFrontImg
                                  )
                                }
                                className="nic-image__img"
                              />
                            )}
                          </figure>
                        </div>
                      </div>
                    )}
                    <div className="nic-container">
                      <div className="nic-header">
                        <h5>NIC Back Side</h5>
                      </div>
                      <div className="nic-image">
                        <figure>
                          {isNicBackLoading || !nicBackImg ? (
                            <div className="spin-container">
                              <Spinner/>
                            </div>
                          ) : (
                            <img
                              src={nicBackImg}
                              alt="NIC Back"
                              onClick={() =>
                                onClickViewImageModal(
                                  nicBackImg
                                )
                              }
                              className="nic-image__img"
                            />
                          )}
                        </figure>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="spare-info view-spare-part-content">
                <h4 className="info-header">Business Information</h4>
                <div className="detail">
                  <div className="detail-image-container">
                    <div className="detail-image-container">
                      {isBusinessLogoLoading ? (
                        <div className="spin-container">
                          <Spin tip="Loading... Please wait." size="small" />
                        </div>
                      ) : businessLogoImg ? (
                        <img
                          src={businessLogoImg}
                          alt="Vendor Profile"
                          className="detail-image detail-image__avatar"
                          onClick={() =>
                            onClickViewImageModal(
                              businessLogoImg
                            )
                          }
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = Icons.part_default_img;
                          }}
                        />
                      ) : (
                        <img
                          src={Icons.part_default_img}
                          alt="Vendor Profile"
                          className="detail-image detail-image__avatar"
                          onClick={() =>
                            onClickViewImageModal(Icons.part_default_img)
                          }
                        />
                      )}
                    </div>
                  </div>
                  <h4 className="detail-value fw-700">
                    {vendorDetails && vendorDetails.businessName
                      ? vendorDetails.businessName
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Business Address Line 1</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.businessAddressLine1
                      ? vendorDetails.businessAddressLine1
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Business Address Line 2</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.businessAddressLine2
                      ? vendorDetails.businessAddressLine2
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">City/Town</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.cityOrTown
                      ? vendorDetails.cityOrTown
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Postal Code</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.postalCode
                      ? vendorDetails.postalCode
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">District</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.district
                      ? vendorDetails.district
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Province</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.province
                      ? vendorDetails.province
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Country</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.country
                      ? vendorDetails.country
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Telephone No</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.businessTelephone
                      ? vendorDetails.businessTelephone
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Business Email Address</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.businessEmail
                      ? <a href={`mailto:${vendorDetails.businessEmail}`} target="_blank">{vendorDetails.businessEmail}</a>
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Business Type</h5>
                  <h4 className="detail-value">
                    {vendorDetails &&
                    vendorDetails.businessTypeSaveRequestDtoList &&
                    vendorDetails.businessTypeSaveRequestDtoList.length > 0
                      ? vendorDetails.businessTypeSaveRequestDtoList.map(
                          (type, index) => (
                            <span key={type.businessPrimaryRateTypeId}>
                              {type.businessRateTypeName}
                              {index <
                                vendorDetails.businessTypeSaveRequestDtoList
                                  .length -
                                  1 && " | "}
                            </span>
                          )
                        )
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Website URL</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.website
                      ? <a href={vendorDetails.website} target="_blank">{vendorDetails.website}</a>
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Registration No</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.registrationNumber
                      ? vendorDetails.registrationNumber
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Registration Document</h5>
                  <h4 className="detail-value">
                    <span style={{ marginLeft: "5px" }}>
                      {isDocDownloadLoading? (
                        <img src={Icons.spinner_blue} alt="Downloading..." className="download-icon spinner" />
                      ) : (
                      <>
                        <img
                          src={Icons.pdf_file}
                          className="download-img"
                          alt="PDF Icon"
                          style={{
                            cursor: "pointer",
                            marginRight: "5px",
                          }}
                        />
                        <span
                          style={{
                            cursor: "pointer",
                            color: "#0B1426",
                            textDecoration: "underline",
                            marginRight: "5px",
                            fontWeight: "600",
                          }}
                          onClick={() =>
                            vendorDetails &&
                            vendorDetails.docUploadPath &&
                            downloadAttachement(vendorDetails.docUploadPath, getFileNameFromPath(vendorDetails && vendorDetails.docUploadPath))
                          }
                        >
                          {getFileNameFromPath(
                            (vendorDetails && vendorDetails.docUploadPath) || "-"
                          )}
                        </span>
                      </>
                      )}
                    </span>
                  </h4>
                </div>
              </div>
              <div className="additional-info">
                <h4 className="info-header">Additional Information</h4>
                <div className="detail">
                  <h5 className="detail-label">Vendor ID</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.vendorId
                      ? vendorDetails.vendorId
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Joined Date</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.joinDate
                      ? vendorDetails.joinDate
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Registered By</h5>
                  <h4 className="detail-value">
                    {vendorDetails && vendorDetails.registeredBy
                      ? vendorDetails.registeredBy
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Status</h5>
                  <div
                    className={`detail-status ${
                      vendorDetails?.status === false
                        ? "detail-status__inactive"
                        : "detail-status__active"
                    }`}
                  >
                    <h4 className="detail-value">
                      {vendorDetails?.status === false ? "Inactive" : "Active"}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {isModalOpen && (
        <ImageModel imagePath={modalImage} onClose={closeModal} />
      )}
    </MasterLayout>
  );
};

export default VendorDetails;
