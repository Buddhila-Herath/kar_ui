import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import { placeholderText } from "../../../shared/sharedMethod";
import Spinner from "../../../shared/components/loaders/Spinner";
import Icons from "../../../utils/icons";
import { fetchMyProfile } from "../../../slices/profileSlice";
import { loadImageForDisplay } from "../../../utils/imageUtils";

const BasicDetails = () => {
  const dispatch = useDispatch();
  const { myProfile, isProfileLoading } = useSelector((state) => state.profile);
  const [profilePhotoImg, setProfilePhotoImg] = useState(null);

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  useEffect(() => {
    const loadProfilePhoto = async () => {
        await loadImageForDisplay(
          myProfile.profilePhotoPath,
          dispatch,
          setProfilePhotoImg
        );
    };

    if (myProfile) {
      loadProfilePhoto();
    }
  }, [myProfile]);

  return (
    <MasterLayout>
      <TabTitle title={placeholderText("profile.title")} />
      <Breadcrumb
        parent_menu="Profile Settings"
        parent_menu_url="/admin/my-profile"
        current_page="Basic Details"
      />
      {isProfileLoading ? (
        <Spinner />
      ) : (
        <div className="profile-settings-container basic-details-container">
          <div className="profile-header">
            <div className="back">
              <Link to="/admin/my-profile">
                <img src={Icons.arrow_left} alt="back" />
              </Link>
              <h3>Basic Details</h3>
            </div>
          </div>
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="profile-photo">
                {profilePhotoImg ? (
                  <img
                    src={profilePhotoImg}
                    alt="Profile Photo"
                  />
                ) : (
                  <img src={Icons.avatar} alt="Profile Photo" />
                )}
              </div>
              <Link
                to="/admin/my-profile/basic-details/edit-profile"
                className="edit-details-link"
              >
                <button className="button edit-details-button" id="edit-details-button">
                  <h5>Edit Details</h5>
                </button>
              </Link>
            </div>
            <div className="profile-details">
              <div className="profile-item">
                <h5>First Name</h5>
                <h4>
                  {myProfile && myProfile.firstName ? myProfile.firstName : "-"}
                </h4>
              </div>
              <div className="profile-item">
                <h5>Last Name</h5>
                <h4>
                  {myProfile && myProfile.lastName ? myProfile.lastName : "-"}
                </h4>
              </div>
              <div className="profile-item">
                <h5>Email Address</h5>
                <h4>{myProfile && myProfile.email ? myProfile.email : "-"}</h4>
              </div>
              <div className="profile-item">
                <h5>Contact Number</h5>
                <h4>
                  {myProfile && myProfile.mobileNumber
                    ? myProfile.mobileNumber
                    : "-"}
                </h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </MasterLayout>
  );
};

export default BasicDetails;
