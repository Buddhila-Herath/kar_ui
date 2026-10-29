import React, { useState } from "react";
import { Modal } from "antd";
import Icons from "../../utils/icons";
import UploadProfilePictureComponent from "../../shared/upload/UploadProfilePictureComponent";

const UploadProfilePicture = ({ handleModalOpen, handleModalClose }) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    }

    return (
        <Modal
            open={handleModalOpen}
            onCancel={handleModalClose}
            footer={null}
            centered
            width={600}
            className="upload-profile-picture-modal"
        >
            <div className="upload-profile-picture-content">
                <div className="upload-profile-picture-tab-header">
                    <div className={`tab-item ${activeTab === 0 ? 'active' : ''}`} onClick={() => handleTabClick(0)}>
                        <img src={Icons.view} alt="View" />
                        <h5>View</h5>
                    </div>
                    <div className={`tab-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => handleTabClick(1)}>
                        <img src={Icons.upload} alt="Upload" />
                        <h5>Upload Photo</h5>
                    </div>
                </div>
                {activeTab === 0 && (
                    <div className="profile-picture-view">
                        <figure>
                            <img src="" alt="Profile Photo" />
                        </figure>
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
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
}

export default UploadProfilePicture;