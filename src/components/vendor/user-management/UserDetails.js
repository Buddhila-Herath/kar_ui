import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icons from "../../../utils/icons";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails } from "../../../slices/vendor/userSlice";
import { useParams } from "react-router-dom";
import Spinner from "../../../shared/components/loaders/Spinner";
import ImageModel from "../../../shared/components/ImageModel";
import { fetchImageByPath } from "../../../slices/masterDataSlice";
import { Spin } from "antd";
import {downloadAttachment} from "../../../slices/masterDataSlice";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import ImageWithLoader from "../../../shared/components/ImageWithLoader";

const UserDetails = () => {
  const { userDetails, isUserDetailsLoading, error } = useSelector(
    (state) => state.users
  );
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserDetails({ id, type: 'view' }));
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
  const [downloadingFileId, setdownloadingFileId] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!userDetails) return;
      
      try {
        if (userDetails?.nicFePath) {
          setIsNicFrontLoading(true);
          const resFront = await dispatch(fetchImageByPath(userDetails.nicFePath)).unwrap();
          setNicFrontImg(resFront ? resFront.url : null);
          setIsNicFrontLoading(false);
        }

        if (userDetails?.nicBePath) {
          setIsNicBackLoading(true);
          const resBack = await dispatch(fetchImageByPath(userDetails.nicBePath)).unwrap();
          setNicBackImg(resBack ? resBack.url : null);
          setIsNicBackLoading(false);
        }

        if (userDetails?.profilePhotoPath) {
          setIsProfilePhotoLoading(true);
          const resProfile = await dispatch(fetchImageByPath(userDetails.profilePhotoPath)).unwrap();
          setProfilePhotoImg(resProfile ? resProfile.url : null);
          setIsProfilePhotoLoading(false);
        }

        if (userDetails?.businessLogoPath) {
          setIsBusinessLogoLoading(true);
          const resLogo = await dispatch(fetchImageByPath(userDetails.businessLogoPath)).unwrap();
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
      userDetails?.nicFePath ||
      userDetails?.nicBePath ||
      userDetails?.profilePhotoPath ||
      userDetails?.businessLogoPath
    ) {
      fetchImages();
    }
  }, [
    userDetails?.nicFePath,
    userDetails?.nicBePath,
    userDetails?.profilePhotoPath,
    userDetails?.businessLogoPath,
    dispatch,
  ]);

  const getFullName = (userDetails) => {
    if (!userDetails) return "-";
    
    const firstName = userDetails.firstName || "";
    const lastName = userDetails.lastName || "";
    
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    return fullName || "-";
  };

  const downloadAttachement = async (documentPath, fileName) => {
    setIsDocDownloadLoading(true);
    try {
      setdownloadingFileId(String(documentPath));
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
      setdownloadingFileId(null);
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
      <TabTitle title="View Vendor User" />
      <Breadcrumb
        parent_menu="User Management"
        parent_menu_url="/app/user-management"
        current_page="View User"
      />
      <TopProgressBar isLoading={isUserDetailsLoading || isDocDownloadLoading} />
      {isUserDetailsLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="view-spare-container">
            <div className="view-spare-header">
              <div className="back-page">
                <Link to="/app/user-management">
                  <img src={Icons.arrow_left} alt="Back Icon" />
                </Link>
                <h3>View User</h3>
              </div>
            </div>
            <div className="view-spare-part-content">
              <div className="spare-info">
                <h4 className="info-header tech-view-header">
                  Personal Information
                </h4>
                <div className="detail">
                  <div className="detail-image-container">
                    {profilePhotoImg ? (
                      <ImageWithLoader
                        src={profilePhotoImg}
                        alt="Vendor User Profile"
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
                      <ImageWithLoader
                        src={Icons.avatar}
                        alt="User Profile"
                        className="detail-image detail-image__avatar"
                        onClick={() =>
                          onClickViewImageModal(Icons.avatar)
                        }
                      />
                    )}
                  </div>
                  <h4 className="detail-value fw-700">
                    {getFullName(userDetails)}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Contact Number</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.contactNumber
                      ? userDetails.contactNumber
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Email Address</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.emailAddress
                      ? <a href={`mailto:${userDetails.emailAddress}`} target="_blank">{userDetails.emailAddress}</a>
                      : "-"}
                  </h4>
                </div>

                <div className="detail">
                  <h5 className="detail-label">NIC</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.nic
                      ? userDetails.nic
                      : "-"}
                  </h4>
                </div>
                <div className="entity entity__colunm ">
                  <h5 className="entity-label fw-5">Uploaded NIC</h5>
                  <div className="entity-container">
                    {userDetails?.nicFePath && (
                      <div className="nic-container">
                        <div className="nic-header">
                          <h5>NIC Front Side</h5>
                        </div>
                        <div className="nic-image">
                          <figure>
                              <ImageWithLoader
                                src={nicFrontImg}
                                alt="NIC Front"
                                onClick={() =>
                                  onClickViewImageModal(
                                    nicFrontImg
                                  )
                                }
                                className="nic-image__img"
                              />
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
                            <ImageWithLoader
                              src={nicBackImg}
                              alt="NIC Back"
                              onClick={() =>
                                onClickViewImageModal(
                                  nicBackImg
                                )
                              }
                              className="nic-image__img"
                            />
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
                      {isBusinessLogoLoading ? (
                        <div className="spin-container">
                          <Spin size="small" />
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
                  <h4 className="detail-value fw-700">
                    {userDetails && userDetails.businessName
                      ? userDetails.businessName
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Business Address Line 1</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.businessAddressLine1
                      ? userDetails.businessAddressLine1
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Business Address Line 2</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.businessAddressLine2
                      ? userDetails.businessAddressLine2
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">City/Town</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.cityOrTown
                      ? userDetails.cityOrTown
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Postal Code</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.postalCode
                      ? userDetails.postalCode
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">District</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.district
                      ? userDetails.district
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Province</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.province
                      ? userDetails.province
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Country</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.country
                      ? userDetails.country
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Telephone No</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.telephoneNumber
                      ? userDetails.telephoneNumber
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Business Email Address</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.businessEmail
                      ? <a href={`mailto:${userDetails.businessEmail}`} target="_blank">{userDetails.businessEmail}</a>
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Business Type</h5>
                  <h4 className="detail-value">
                    {userDetails &&
                    userDetails.businessTypeSaveRequestDtoList &&
                    userDetails.businessTypeSaveRequestDtoList.length > 0
                      ? userDetails.businessTypeSaveRequestDtoList.map(
                          (type, index) => (
                            <span key={type.businessPrimaryRateTypeId}>
                              {type.businessRateTypeName}
                              {index <
                                userDetails.businessTypeSaveRequestDtoList
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
                    {userDetails && userDetails.website
                      ? <a href={userDetails.website} target="_blank">{userDetails.website}</a>
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Registration No</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.registrationNumber
                      ? userDetails.registrationNumber
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
                          className="download-img download-img-user"
                          alt="PDF Icon"
                        />
                        <span
                          className="user-download-label"
                          onClick={() =>
                            userDetails &&
                            userDetails.documentPath &&
                            downloadAttachement(userDetails.documentPath, getFileNameFromPath(userDetails && userDetails.documentPath))
                          }
                        >
                          {getFileNameFromPath(
                            (userDetails && userDetails.documentPath) || "-"
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
                  <h5 className="detail-label">User ID</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.userId
                      ? userDetails.userId
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Joined Date</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.joinedDate
                      ? userDetails.joinedDate
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Registered By</h5>
                  <h4 className="detail-value">
                    {userDetails && userDetails.registerBy
                      ? userDetails.registerBy
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Status</h5>
                  <div
                    className={`detail-status ${
                      userDetails?.status === false
                        ? "detail-status__inactive"
                        : "detail-status__active"
                    }`}
                  >
                    <h4 className="detail-value">
                      {userDetails?.status === false ? "Inactive" : "Active"}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {isModalOpen && (
        <ImageModel imagePath={modalImage} onClose={closeModal} className={'usermanagement-view-image'}/>
      )}
    </MasterLayout>
  );
};

export default UserDetails;
