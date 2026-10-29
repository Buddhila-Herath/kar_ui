import React, { useState } from "react";
import { Button, Spin, notification } from "antd";
import Icons from "../../utils/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import UploadFileError from '../../shared/upload/UploadFileError';

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const ImageUploader = ({
  totalImages,
  onSave,
  showActionButtons,
  isUploading,
  allowedFileTypes = ["image/png", "image/jpg", "image/jpeg"],
  allowedFileSize = 5 * 1024 * 1024, // 5MB
  maxFileSize = "5MB",
  fileFormat = "PNG, JPG, JPEG",
  showCancelButton = false
}) => {
  const [images, setImages] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileTypeError, setFileTypeError] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);

  const handleSave = () => {
    if (images.length !== totalImages) {
      notification.error({
        message: <h5>Please upload exactly {totalImages} images</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
      return;
    }
    onSave(images);
  };

  const validateFileType = (file) => {
    if (!allowedFileTypes.includes(file.type)) {
      setFileTypeError(true);
      return false;
    }
    setFileTypeError(false);
    return true;
  };

  const validateFileSize = (file) => {
    if (file.size > allowedFileSize) {
      setFileSizeError(true);
      return false;
    }
    setFileSizeError(false);
    return true;
  };

  const handleFileSelect = (event) => {
    const newFiles = Array.from(event.target.files).slice(0, totalImages);
    const validFiles = newFiles.filter(
      (file) => validateFileType(file) && validateFileSize(file)
    );

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles].slice(0, totalImages));
    }

    event.target.value = null;
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const newFiles = Array.from(event.dataTransfer.files).slice(0, totalImages);
    const validFiles = newFiles.filter(
      (file) => validateFileType(file) && validateFileSize(file)
    );

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles].slice(0, totalImages));
    }
  };

  const closeErrorModal = () => {
    setFileTypeError(false);
    setFileSizeError(false);
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <>
      {fileTypeError && (
        <UploadFileError
          openModal={fileTypeError}
          closeErrorModal={closeErrorModal}
          modalText="The Selected File Type is Unsupported"
          modalSubText={`Please upload a valid file format ${fileFormat}`}
          submitButtonText="Try Another File"
          cancelButtonText="Cancel"
          showCancelButton={showCancelButton}
        />
      )}
      {fileSizeError && (
        <UploadFileError
          openModal={fileSizeError}
          closeErrorModal={closeErrorModal}
          modalText="File Size Exceeded"
          modalSubText={`File size exceeds ${maxFileSize}`}
          submitButtonText="Try Another File"
          cancelButtonText="Cancel"
          showCancelButton={showCancelButton}
        />
      )}
        <div 
          className="image-uploader-container"
          id="technician-image-uploader-container"
          style={images.length > 0 ? {
            border: "1px solid #183571",
            padding: "16px",
            borderRadius: "12px"
          } : {}}
        >
        {isUploading ? (
          <div className="spin-container" id="technician-image-uploader-spinner">
            <Spin tip="Uploading... Please wait." size="large"> </Spin>
          </div>
        ) : (
          <>
            <div
              id="technician-image-uploader-area"
              className={`upload-area ${isDragOver ? "upload-area-drag-over" : "upload-area-default"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept={allowedFileTypes.join(',')}
                className="hidden"
                id="technician-file-upload"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <label htmlFor="technician-file-upload" className="cursor-pointer flex flex-col items-center" id="technician-image-uploader-label">
                <div className="text-center" id="technician-image-uploader-label-content">
                  <div className="upload-icon-container" id="technician-image-uploader-icon-container">
                    <img src={Icons.cloud_arrow_up} alt="Upload Icon" id="technician-image-uploader-icon" />
                  </div>
                  <p className="upload-text-primary" id="technician-image-uploader-primary-text">
                    <span style={{ textDecoration: "underline", color: "#183571", cursor: "pointer" }} id="technician-image-uploader-click-text">
                      Click to upload
                    </span>{" "}
                    or drag & drop your image here
                  </p>
                  <p className="upload-text-secondary" id="technician-image-uploader-secondary-text">
                    {fileFormat}, up to {maxFileSize} each
                  </p>
                </div>
              </label>
              {images.length > 0 && (
                <p className="upload-text-secondary" id="technician-image-uploader-count">{images.length} of {totalImages}</p>
              )}

            </div>

            {/* Image Preview Slider */}
            {images.length > 0 && (
              <div className="thumbnails-container" id="technician-image-uploader-thumbnails">
                <Swiper
                  navigation={true}
                  modules={[Navigation, Pagination]}
                  className="app-swiper"
                  id="technician-image-uploader-swiper"
                  breakpoints={{
                    0: {
                      slidesPerView: 2,
                    },
                    768: {
                      slidesPerView: 3,
                    },
                    1024: {
                      slidesPerView: 6,
                     
                    },
                  }}
                  style={{
                    "--swiper-navigation-size": "14px",
                    "--swiper-navigation-color": "#183571",
                    "--swiper-pagination-color": "#183571",
                    "--swiper-navigation-sides-offset": "-5px",
                  }}
                >
                  {images.map((image, index) => (
                    <SwiperSlide key={index} id={`technician-image-uploader-slide-${index}`}>
                      <div className="thumbnail-item thumbnail-image-wrapper" id={`technician-image-uploader-thumbnail-${index}`}>
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="uploaded-image thumbnail-image thump-img"
                          id={`technician-image-uploader-thumbnail-image-${index}`}
                        />
                        <Button
                          id={`technician-image-uploader-remove-${index}`}
                          onClick={() => removeImage(index)}
                          style={{
                            position: "absolute",
                            top: "-12px",
                            right:" -10px",
                            borderradius: "51%",
                          
                            height: "24px",
                            width: "24px",
                            backgroundColor: "white",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          icon={
                            <img
                              src={Icons.rounded_close}
                              alt="Remove"
                              className="remove-icon"
                              id={`technician-image-uploader-remove-icon-${index}`}
                            />
                          }
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </>
        )}
      </div>

      {showActionButtons && images.length > 0 && (
        <div className="job-img-save button-job" id="technician-image-uploader-actions">
          <button
            type="button"
            id="technician-image-uploader-cancel"
            className="button button-cancel col-50"
            onClick={() => setImages([])}
          >
            <h5 id="technician-image-uploader-cancel-text">Cancel</h5>
          </button>
          <button
            type="button"
            id="technician-image-uploader-save"
            className="button button-submit col-50"
            onClick={handleSave}
            disabled={isUploading}
          >
            <h5 id="technician-image-uploader-save-text">{isUploading ? `Please wait...` : `Save Image`}</h5>
          </button>
        </div>
      )}
    </>
  );
};

export default ImageUploader;
