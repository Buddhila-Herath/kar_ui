import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import MasterLayout from "../../MasterLayout";
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import { placeholderText } from '../../../shared/sharedMethod';
import Spinner from "../../../shared/components/loaders/Spinner";
import Icons from "../../../utils/icons";
import { fetchMyProfile } from '../../../slices/profileSlice';
import { loadSingleImage } from "../../../utils/imageUtils";

const BasicDetails = () => {
  const dispatch = useDispatch();
  const { myProfile, isProfileLoading } = useSelector((state) => state.profile);
  const [profilePhotoImg, setProfilePhotoImg] = useState(null);
  const [isProfilePhotoLoading, setIsProfilePhotoLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  useEffect(() => {
    const loadProfilePhoto = async () => {
        await loadSingleImage(
          myProfile.profilePhotoPath,
          dispatch,
          setProfilePhotoImg,
          setIsProfilePhotoLoading
        )
    };

    if (myProfile) {
      loadProfilePhoto();
    }
  }, [myProfile]);

  return (
    <MasterLayout>
      <TabTitle title={placeholderText('profile.title')} />
      <Breadcrumb
        parent_menu="Profile Settings"
        parent_menu_url="/app/my-profile"
        current_page="Basic Details"
      />
      {isProfileLoading ? <Spinner /> :
        <div className="profile-settings-container basic-details-container" id="technician-basic-details-container">
          <div className="profile-header" id="technician-basic-details-header">
            <div className="back" id="technician-basic-details-back">
              <Link to="/app/my-profile" id="technician-basic-details-back-link">
                <img src={Icons.arrow_left} alt="back" id="technician-basic-details-back-icon" />
              </Link>
              <h3 id="technician-basic-details-title">Basic Details</h3>
            </div>
          </div>
          <div className="profile-card" id="technician-basic-details-card">
            <div className="profile-avatar" id="technician-basic-details-avatar">
              <div className="profile-photo" id="technician-basic-details-photo">
                {myProfile && myProfile.profilePhotoPath && profilePhotoImg ? (
                  <img
                    src={profilePhotoImg}
                    alt="Profile Photo"
                    id="technician-basic-details-photo-img"
                  />
                ) : (
                  <img src={Icons.avatar} alt="Profile Photo" id="technician-basic-details-photo-default" />
                )}
              </div>
              <Link to="/app/my-profile/basic-details/edit-profile" className="edit-details-link" id="technician-basic-details-edit-link">
                <button className="button edit-details-button" id="technician-basic-details-edit-button">
                  <h5 id="technician-basic-details-edit-button-text">Edit Details</h5>
                </button>
              </Link>
            </div>
            <div className="profile-details" id="technician-basic-details-details">
              <div className="profile-item" id="technician-basic-details-first-name">
                <h5 id="technician-basic-details-first-name-label">First Name</h5>
                <h4 id="technician-basic-details-first-name-value">{myProfile && myProfile.firstName ? myProfile.firstName : '-'}</h4>
              </div>
              <div className="profile-item" id="technician-basic-details-last-name">
                <h5 id="technician-basic-details-last-name-label">Last Name</h5>
                <h4 id="technician-basic-details-last-name-value">{myProfile && myProfile.lastName ? myProfile.lastName : '-'}</h4>
              </div>
              <div className="profile-item" id="technician-basic-details-email">
                <h5 id="technician-basic-details-email-label">Email Address</h5>
                <h4 id="technician-basic-details-email-value">{myProfile && myProfile.email ? myProfile.email : '-'}</h4>
              </div>
              <div className="profile-item" id="technician-basic-details-contact">
                <h5 id="technician-basic-details-contact-label">Contact Number</h5>
                <h4 id="technician-basic-details-contact-value">{myProfile && myProfile.contactNumber ? myProfile.contactNumber : '-'}</h4>
              </div>
            </div>
          </div>
        </div>
      }
    </MasterLayout>
  );
};

export default BasicDetails;