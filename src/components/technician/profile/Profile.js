import React from "react";
import { Link } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import { placeholderText } from '../../../shared/sharedMethod';
import Icons from "../../../utils/icons";

const Profile = () => {

  return (
    <MasterLayout>
      <TabTitle title={placeholderText('profile.title')} />
      <Breadcrumb
        current_page="Profile Settings"
      />
      <div className="profile-settings-container" id="technician-profile-container">
        <div className="profile-header" id="technician-profile-header">
          <div className="back" id="technician-profile-back">
            <Link to="/app/dashboard" id="technician-profile-back-link">
              <img src={Icons.arrow_left} alt="back" id="technician-profile-back-icon" />
            </Link>
            <h3 id="technician-profile-title">Profile Settings</h3>
          </div>
        </div>
        <div className="profile-settings-content" id="technician-profile-content">
          <Link to="/app/my-profile/basic-details" id="technician-profile-basic-details-link">
            <div className="profile-settings-card" id="technician-profile-basic-details-card">
              <div className="profile-settings-card-content" id="technician-profile-basic-details-content">
                <div className="profile-settings-card-details" id="technician-profile-basic-details-details">
                  <h4 id="technician-profile-basic-details-title">Basic Details</h4>
                  <span id="technician-profile-basic-details-description">You can view user's basic information here</span>
                </div>
                <div className="profile-settings-card-button" id="technician-profile-basic-details-button">
                  <img src={Icons.arrow_left} alt="back" id="technician-profile-basic-details-button-icon" />
                </div>
              </div>
            </div>
          </Link>
          <Link to="/app/my-profile/reset-password" id="technician-profile-reset-password-link">
            <div className="profile-settings-card" id="technician-profile-reset-password-card">
              <div className="profile-settings-card-content" id="technician-profile-reset-password-content">
                <div className="profile-settings-card-details" id="technician-profile-reset-password-details">
                  <h4 id="technician-profile-reset-password-title">Reset Password</h4>
                  <span id="technician-profile-reset-password-description">You can reset the account password here</span>
                </div>
                <div className="profile-settings-card-button" id="technician-profile-reset-password-button">
                  <img src={Icons.arrow_left} alt="back" id="technician-profile-reset-password-button-icon" />
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