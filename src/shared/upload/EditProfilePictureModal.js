import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Modal } from "antd";
import Icons from "../../utils/icons";
import UploadProfilePictureComponent from "./UploadProfilePictureComponent";
import { getFormattedMessage } from "../sharedMethod";
import { Tokens } from "../../constants/index";
import { deleteProfilePicture } from "../../slices/profileSlice";

const EditProfilePictureModal = ({ handleModalOpen, handleModalClose }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const profileImage = localStorage.getItem(Tokens.IMAGE);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleRemoveProfilePicture = () => {
    setLoading(true);
    dispatch(deleteProfilePicture())
      .then(() => {
        localStorage.removeItem(Tokens.IMAGE);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      open={handleModalOpen}
      onCancel={handleModalClose}
      footer={null}
      centered
      className="upload-profile-picture-modal"
    >
      <div className="upload-profile-picture-content">
        <div className="upload-profile-picture-tab-header">
          <div
            className={`tab-item ${activeTab === 0 ? "active" : ""}`}
            onClick={() => handleTabClick(0)}
            id="edit-profile-picture-view-tab"
          >
            <img src={Icons.view} alt="View" />
            <h5>View</h5>
          </div>
          <div
            className={`tab-item ${activeTab === 1 ? "active" : ""}`}
            onClick={() => handleTabClick(1)}
            id="edit-profile-picture-upload-tab"
          >
            <img src={Icons.upload} alt="Upload" />
            <h5>Upload Photo</h5>
          </div>
        </div>
        {activeTab === 0 && (
          <div className="profile-picture-view">
            <figure>
              {profileImage && profileImage !== "undefined" ? (
                <img
                  src={profileImage}
                  alt="profile photo 1"
                  className="profile-photo"
                />
              ) : (
                <img
                  src={Icons.empty_profile_picture}
                  alt="profile photo 2"
                  className="profile-photo"
                />
              )}
            </figure>
            {profileImage && profileImage !== "undefined" && (
              <div
                className="action-button-remove"
                onClick={handleRemoveProfilePicture}
                id="edit-profile-picture-delete-button"
              >
                {loading ? (
                  <h5>{getFormattedMessage("globally.loading.label")}</h5>
                ) : (
                  <>
                    <img src={Icons.trash_red} alt="Remove" />
                    <h5>Delete</h5>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        {activeTab === 1 && (
          <div className="profile-picture-upload">
            <UploadProfilePictureComponent
              title="Profile Image"
              text="Choose a file or drag it here"
              subText1="Max image size : 3MB"
              subText2="Supports: JPG, JPEG, PNG"
              inputId="profile-photo"
              required={true}
              onCloseParentModal={handleModalClose}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EditProfilePictureModal;
