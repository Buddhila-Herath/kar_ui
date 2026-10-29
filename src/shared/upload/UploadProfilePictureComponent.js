import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import UploadFileError from './UploadFileError';
import Icons from "../../utils/icons";
import { getFormattedMessage } from '../../shared/sharedMethod';
import { uploadProfilePicture } from '../../slices/profileSlice';
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { isAdminPortal } from '../../utils/portalUtils';

const UploadProfilePictureComponent = ({ title, text, subText1, subText2, inputId, required, onCloseParentModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewFile, setPreviewFile] = useState([]);
  const [fileTypeError, setFileTypeError] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const dropAreaRef = useRef(null);
  const inputFileRef = useRef(null);

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewFile([]);
    if (inputFileRef.current) {
      inputFileRef.current.value = null;
    }
  };

  const handlePreview = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const uniqueId = `${file.lastModified}-${Math.random().toString(36).substr(2, 5)}`;
      const previewObj = { src: reader.result, id: uniqueId };
      setPreviewFile([previewObj]);
    };
  };

  const validateFileType = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setFileTypeError(true);
      return false;
    }
    setFileTypeError(false);
    return true;
  };

  const validateFileSize = (file) => {
    if (file.size > 3145728) {
      setFileSizeError(true);
      return false;
    }
    setFileSizeError(false);
    return true;
  };

  const handleFilesDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const droppedFiles = Array.from(event.dataTransfer.files);
    droppedFiles.forEach((file) => {
      if (validateFileType(file) && validateFileSize(file)) {
        handlePreview(file);
        setFile(file);
      }
    });
  };

  const handleFiles = () => {
    const selectedFiles = Array.from(inputFileRef.current.files);
    selectedFiles.forEach((file) => {
      if (validateFileType(file) && validateFileSize(file)) {
        handlePreview(file);
        setFile(file);
      }
    });
    inputFileRef.current.value = null;
  };

  const sendDragOverFeedback = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const closeErrorModal = () => {
    setFileTypeError(false);
    setFileSizeError(false);
    setUploadError('');
  };

  const closeErrorModalAndUploadModal = () => {
    closeErrorModal();
    handleRemoveFile();
    onCloseParentModal();
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('files', file);

    try {
      await dispatch(uploadProfilePicture(formData)).unwrap();
      handleRemoveFile();
    } catch (error) {
      setUploadError(error);
    } finally {
      setUploading(false);

      if (isAdminPortal()) {
        navigate("/admin/my-profile/basic-details");
      } else {
        navigate("/app/my-profile/basic-details");
      }

      notification.success({
        message: <h5>Your changes have been saved.</h5>,
        icon: <img src={Icons.check} alt="Success" />,
        duration: 5
      });
    }
  };

  return (
    <>
      {fileTypeError && (
        <UploadFileError
          openModal={fileTypeError}
          closeErrorModal={closeErrorModal}
          closeParentModal={closeErrorModalAndUploadModal}
          modalText="The Selected File Type is Unsupported"
          modalSubText="Please upload a valid file format - jpg, png, jpeg"
          submitButtonText="Try Another Image"
          cancelButtonText="Cancel"
        />
      )}
      {fileSizeError && (
        <UploadFileError
          openModal={fileSizeError}
          closeErrorModal={closeErrorModal}
          closeParentModal={closeErrorModalAndUploadModal}
          modalText="Image Size Exceeded"
          modalSubText="Image size exceeds 3MB"
          submitButtonText="Try Another Image"
          cancelButtonText="Cancel"
        />
      )}
      {uploadError && (
        <UploadFileError
          openModal={uploadError}
          closeErrorModal={closeErrorModal}
          closeParentModal={closeErrorModalAndUploadModal}
          modalText="Upload Failed"
          modalSubText="An error occurred while uploading your profile picture. Please try again."
          submitButtonText="Try Again"
          cancelButtonText="Cancel"
        />
      )}
      {file ? (
        <div className="upload-profile-picture-container--active" >
          <div className="upload-profile-picture-preview">
            <figure>
              {previewFile.length > 0 && (
                <img src={previewFile[0].src} alt="Profile Photo" />
              )}
            </figure>
          </div>
          <div className="action-button-reupload" onClick={handleRemoveFile} id="upload-profile-picture-reupload-button">
            <img src={Icons.repeat} alt="Reupload" />
            <h5>Reupload</h5>
          </div>
          <div className="upload-profile-picture-footer">
            <button
              className="button button--cancel"
              onClick={handleRemoveFile}
              disabled={uploading}
              id="upload-profile-picture-cancel-button"
            >
              <h5>Cancel</h5>
            </button>
            <button
              className="button button--save"
              onClick={handleUpload}
              disabled={uploading}
              id="upload-profile-picture-save-button"
            >
              <h5>{uploading ? getFormattedMessage("globally.loading.label") : 'Save'}</h5>
            </button>
          </div>
        </div >
      ) : (
        <div
          className="upload-profile-picture-container"
          ref={dropAreaRef}
          onDragOver={sendDragOverFeedback}
          onDragEnter={sendDragOverFeedback}
          onDrop={handleFilesDrop}
        >
          <h5>{title}</h5>
          <img src={Icons.upload} alt="Upload" />
          <h6>{text}</h6>
          <span>{subText1}</span>
          <span>{subText2}</span>
          <input
            type="file"
            id={inputId}
            required={required}
            ref={inputFileRef}
            onChange={handleFiles}
            style={{ display: 'none' }}
          />
          <label htmlFor={inputId} className="upload-label"></label>
        </div>
      )}
    </>
  );
};

export default UploadProfilePictureComponent;
