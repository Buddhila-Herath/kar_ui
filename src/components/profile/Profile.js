import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import MasterLayout from "../MasterLayout";
import TabTitle from '../../shared/tab-title/TabTitle';
import Breadcrumb from "../../shared/breadcrumb/Breadcrumb";
import { placeholderText } from '../../shared/sharedMethod';
import Icons from "../../utils/icons";

const Profile = () => {
  const dispatch = useDispatch();

  return (
    <MasterLayout>
      <TabTitle title={placeholderText('profile.title')} />
      <Breadcrumb
        current_page="Profile Settings"
      />
      <div className="profile-settings-container">
        <div className="profile-header">
          <div className="back">
            <Link to="/admin/dashboard">
              <img src={Icons.arrow_left} alt="back" />
            </Link>
            <h3>Profile Settings</h3>
          </div>
        </div>
        <div className="profile-settings-content">
          <Link to="/admin/my-profile/basic-details">
            <div className="profile-settings-card">
              <div className="profile-settings-card-content">
                <div className="profile-settings-card-details">
                  <h4>Basic Details</h4>
                  <span>You can view user’s basic information here</span>
                </div>
                <div className="profile-settings-card-button">
                  <img src={Icons.arrow_left} alt="back" />
                </div>
              </div>
            </div>
          </Link>
          <Link to="/admin/my-profile/reset-password">
            <div className="profile-settings-card">
              <div className="profile-settings-card-content">
                <div className="profile-settings-card-details">
                  <h4>Reset Password</h4>
                  <span>You can reset the account password here</span>
                </div>
                <div className="profile-settings-card-button" >
                  <img src={Icons.arrow_left} alt="back" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </MasterLayout>
  );
};

export default Profile;