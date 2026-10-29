import React, { useState, useEffect } from "react";
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Icons from "../../../utils/icons";
import MasterLayout from '../../MasterLayout';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import Spinner from "../../../shared/components/loaders/Spinner";
import { getFormattedMessage, placeholderText } from '../../../shared/sharedMethod';
import { fetchAccountDetails } from '../../../slices/accountSlice';
import ImageModel from "../../../shared/components/ImageModel";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import {downloadAttachment} from "../../../slices/masterDataSlice";
import { loadMultipleImages } from "../../../utils/imageUtils";
import ImageWithLoader from "../../../shared/components/ImageWithLoader";

const AccountManagement = () => {
  const { accountDetails, isAccountDetailsLoading, error } = useSelector((state) => state.account);
  const { id } = useParams();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [isDocDownloadLoading, setIsDocDownloadLoading] = useState(false);
  const [isNicFrontLoading, setIsNicFrontLoading] = useState(false);
  const [isNicBackLoading, setIsNicBackLoading] = useState(false);
  const [isProfilePhotoLoading, setIsProfilePhotoLoading] = useState(false);
  const [isBusinessLogoLoading, setIsBusinessLogoLoading] = useState(false);
  const [nicFrontImg, setNicFrontImg] = useState(null);
  const [nicBackImg, setNicBackImg] = useState(null);
  const [profilePhotoImg, setProfilePhotoImg] = useState(null);
  const [businessLogoImg, setBusinessLogoImg] = useState(null);
  const [downloadingFileId, setdownloadingFileId] = useState(null);

  useEffect(() => {
    dispatch(fetchAccountDetails(id));
  }, [dispatch]);

  const onClickViewImageModal = (imagePath) => {
    setModalImage(imagePath);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getFileNameFromPath = (path) => {
    if (!path) return "";
    const parts = path.split("/");
    return parts[parts.length - 1];
  };

  useEffect(() => {
    const fetchImages = async () => {
      if (!accountDetails) return;
      
      const imageConfigs = {
        nicFront: { path: accountDetails.nicFront, setter: setNicFrontImg },
        nicBack: { path: accountDetails.nicBack, setter: setNicBackImg },
        profilePhoto: { path: accountDetails.profilePhoto, setter: setProfilePhotoImg },
        businessLogo: { path: accountDetails.businessLogo, setter: setBusinessLogoImg }
      };

      const loadingStates = {
        nicFront: setIsNicFrontLoading,
        nicBack: setIsNicBackLoading,
        profilePhoto: setIsProfilePhotoLoading,
        businessLogo: setIsBusinessLogoLoading
      };

      await loadMultipleImages(imageConfigs, dispatch, loadingStates);
    };

    if (
      accountDetails?.nicFront ||
      accountDetails?.nicBack ||
      accountDetails?.profilePhoto ||
      accountDetails?.businessLogo
    ) {
      fetchImages();
    }
  }, [
    accountDetails?.nicFront,
    accountDetails?.nicBack,
    accountDetails?.profilePhoto,
    accountDetails?.businessLogo,
    dispatch,
  ]);

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

  return (
    <MasterLayout>
      <TabTitle title={placeholderText("account-management.title")} />
      <Breadcrumb
        current_page="Account Management"
      />
      <TopProgressBar isLoading={isAccountDetailsLoading || isDocDownloadLoading} />
      {isAccountDetailsLoading ? <Spinner /> : <>
        <div className="details-container account-management-container">
          <div className="details-container-header">
            <div className="back">
              <Link to="/app/dashboard">
                <img src={Icons.arrow_left} alt="Back Icon" />
              </Link>
              <h3>Account Management</h3>
            </div>
          </div>
          <div className="details-content">
            <h4 className="section-header">
              Personal Details
            </h4>
            <div className="entity entity-header">
              <div className="entity-image-container">
                  {profilePhotoImg ? (
                    <ImageWithLoader
                      src={profilePhotoImg}
                      alt="Vendor Profile"
                      className='entity-image entity-image__avatar'
                      onClick={() =>
                        onClickViewImageModal(profilePhotoImg)
                      }
                    />
                  ) : (
                    <ImageWithLoader
                      src={Icons.avatar}
                      alt="Vendor Profile"
                      className='entity-image entity-image__avatar'
                      onClick={() =>
                        onClickViewImageModal(Icons.avatar)
                      }
                    />
                  )}
              </div>
              <h4 className="entity-value">
                {accountDetails && accountDetails.fullName ? accountDetails.fullName : '-'}
              </h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">Contact Number</h5>
              <h4 className="entity-value">{accountDetails && accountDetails.contactNumber ? <a href={`tel:${accountDetails.contactNumber}`} target="_blank"> {accountDetails.contactNumber} </a> : '-'}</h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">Email Address</h5>
              <h4 className="entity-value">{accountDetails && accountDetails.emailAddress ? <a href={`mailto:${accountDetails.emailAddress}`} target="_blank"> {accountDetails.emailAddress} </a> : '-'}</h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">NIC</h5>
              <h4 className="entity-value">{accountDetails && accountDetails.nic ? accountDetails.nic : '-'}</h4>
            </div>
            {accountDetails?.nicFront && accountDetails?.nicBack && (
            <div className="entity entity__colunm">
              <h5 className="entity-label">Uploaded NIC</h5>
              <div className='entity-container'>
                {accountDetails?.nicFront && (
                <div className='nic-container'>
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
                <div className='nic-container'>
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
            )}
          </div>
          <div className="details-content">
            <h4 className="section-header">
              Business Details
            </h4>
            <div className="entity entity-header">
             <div className="entity-image-container">
                {accountDetails?.businessLogo ? (
                    <ImageWithLoader
                      src={businessLogoImg}
                      alt="business Logo"
                      className='entity-image'
                      onClick={() =>
                        onClickViewImageModal(
                          businessLogoImg
                        )
                      }
                    />
                    ) : (
                      <ImageWithLoader
                        src={Icons.part_default_img}
                        alt="business Logo"
                        className='entity-image entity-image__avatar'
                        onClick={() =>
                          onClickViewImageModal(Icons.part_default_img)
                        }
                      />
                    )}
              </div>
              <h4 className="entity-value">{accountDetails && accountDetails.businessName ? accountDetails.businessName : '-'}</h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">Business Address Line 1</h5>
              <h4 className="entity-value">{accountDetails && accountDetails.businessAddressLine1 ? accountDetails.businessAddressLine1 : '-'}</h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">Business Address Line 2</h5>
              <h4 className="entity-value">{accountDetails && accountDetails.businessAddressLine2 ? accountDetails.businessAddressLine2 : '-'}</h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">City/Town</h5>
              <h4 className="entity-value">{accountDetails && accountDetails.cityOrTown ? accountDetails.cityOrTown : '-'}</h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">Postal Code</h5>
              <h4 className="entity-value">{accountDetails && accountDetails.postalCode ? accountDetails.postalCode : '-'}</h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">District</h5>
              <h4 className="entity-value">{accountDetails && accountDetails.district ? accountDetails.district : '-'}</h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">Province</h5>
              <h4 className="entity-value">{accountDetails && accountDetails.province ? accountDetails.province : '-'}</h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">Registration Number</h5>
              <h4 className="entity-value">{accountDetails && accountDetails.registrationNumber ? accountDetails.registrationNumber : '-'}</h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">Registration Document</h5>
                {accountDetails && accountDetails.documentPath ? (
                  <>
                  {downloadingFileId === accountDetails.documentPath ? (
                    <img src={Icons.spinner_blue} alt="Downloading..." className="download-icon spinner" />
                  ) : (
                  <div className="entity-download"
                    onClick={() =>
                      accountDetails &&
                      accountDetails.documentPath &&
                      downloadAttachement(accountDetails.documentPath, getFileNameFromPath(accountDetails && accountDetails.documentPath))
                    }
                  >
                    <>
                      <img src={Icons.pdf_file} alt="PDF File" />
                      <h4 className="entity-value">{accountDetails.documentPath.split('/').pop()}</h4>
                    </>
                  </div>
                  )}
                  </>
                ) : (
                  <h4 className="entity-value">-</h4>
                )}
            </div>
            <div className="entity">
              <h5 className="entity-label">Business Email Address</h5>
              <h4 className="entity-value">{accountDetails && accountDetails.businessEmail ? <a href={`mailto:${accountDetails.businessEmail}`} target="_blank"> {accountDetails.businessEmail} </a> : '-'}</h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">Business Type</h5>
              <h4 className="entity-value">
                {accountDetails && accountDetails.businessTypeSaveRequestDtoList && accountDetails.businessTypeSaveRequestDtoList.length > 0
                  ? accountDetails.businessTypeSaveRequestDtoList.map((type, index) => (
                    <span key={type.businessPrimaryRateTypeId}>
                      {type.businessRateTypeName}
                      {index < accountDetails.businessTypeSaveRequestDtoList.length - 1 && " | "}
                    </span>
                  ))
                  : '-'}
              </h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">Website URL</h5>
              <h4 className="entity-value breakable-url">
                {accountDetails?.website ? (<a href={accountDetails.website} target="_blank" rel="noopener noreferrer" >
                    {accountDetails.website}</a>) : ( '-' )}</h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">Country</h5>
              <h4 className="entity-value">{accountDetails && accountDetails.country ? accountDetails.country : '-'}</h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">Telephone Number</h5>
              <h4 className="entity-value">{accountDetails && accountDetails.telephoneNumber ? <a href={`tel:${accountDetails.telephoneNumber}`} target="_blank"> {accountDetails.telephoneNumber} </a> : '-'}</h4>
            </div>
          </div>
        </div>
      </>
      }
      {isModalOpen && (
        <ImageModel
          imagePath={modalImage}
          onClose={closeModal}
          className={'usermanagement-view-image'}
        />
      )}
    </MasterLayout>
  )
}

export default AccountManagement;