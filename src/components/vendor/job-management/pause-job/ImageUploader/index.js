import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./styles.scss";
import Icons from "../../../../../utils/icons";
import { Button, Spin } from "antd";
import UploadFileError from '../../../../../shared/upload/UploadFileError';

// Module-scoped map as a lightweight fallback cache (non-window)
const persistentImagesMap = new Map();

const ImageUploadComponent = ({
  totalImages,
  onUpload,
  isUploading,
  feedbackId,
  disabled = false,
  allowedFileTypes = ["image/png", "image/jpg", "image/jpeg"],
  allowedFileSize = 15 * 1024 * 1024, // 15MB
  maxFileSize = "15MB",
  fileFormat = "PNG, JPG, JPEG",
}) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 768);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileTypeError, setFileTypeError] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  const fileInputRef = React.useRef(null);

  // Removed sessionStorage persistence for previews to reduce memory pressure

  useEffect(() => {
    // Clear any previous state when feedbackId changes to prevent cross-contamination
    setUploadedImages([]);
    setUploadStatus(null);
    setUploadError(null);
    
    const currentImages = persistentImagesMap.get(feedbackId) || [];
    setUploadedImages(currentImages);
  }, [feedbackId]); // Run when feedbackId changes

  useEffect(() => {
    // Save images for the current feedbackId to module-scoped map
    persistentImagesMap.set(feedbackId, uploadedImages);
  }, [uploadedImages, feedbackId]);

  const handleImageUpload = async () => {
    try {
      setUploadError(null);
      const result = await onUpload(uploadedImages);
      if (result?.success) {
        setUploadStatus('success');
        // Clear local selections and cache after successful upload
        setUploadedImages([]);
        persistentImagesMap.delete(feedbackId);
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      setUploadError("An unexpected error occurred");
    }
  };

  const handleCancel = () => {
    setUploadedImages([]);
    setUploadStatus(null);
    setUploadError(null);
    persistentImagesMap.delete(feedbackId);
  };

  const handleLabelClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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

  // Generate resized base64 preview using createImageBitmap when available
  const generatePreviewDataUrl = async (file) => {
    const MAX_DIMENSION = 600; // smaller preview for stability with large inputs
    const JPEG_QUALITY = 0.72;

    try {
      // Prefer createImageBitmap for efficient decoding and resizing
      if (typeof window.createImageBitmap === 'function') {
        // Obtain original dimensions first
        const blobUrl = URL.createObjectURL(file);
        const probe = new Image();
        const originalDims = await new Promise((resolve, reject) => {
          probe.onload = () => resolve({ width: probe.naturalWidth, height: probe.naturalHeight });
          probe.onerror = reject;
          probe.src = blobUrl;
        });
        URL.revokeObjectURL(blobUrl);

        let targetWidth = originalDims.width;
        let targetHeight = originalDims.height;
        if (targetWidth > targetHeight && targetWidth > MAX_DIMENSION) {
          targetHeight = Math.round((targetHeight * MAX_DIMENSION) / targetWidth);
          targetWidth = MAX_DIMENSION;
        } else if (targetHeight >= targetWidth && targetHeight > MAX_DIMENSION) {
          targetWidth = Math.round((targetWidth * MAX_DIMENSION) / targetHeight);
          targetHeight = MAX_DIMENSION;
        }

        const bitmap = await createImageBitmap(file, {
          resizeWidth: targetWidth,
          resizeHeight: targetHeight,
          resizeQuality: 'high',
        });

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        // bitmap.close is available in some environments
        if (typeof bitmap.close === 'function') {
          try { bitmap.close(); } catch (_e) {}
        }
        return dataUrl;
      }
    } catch (_e) {
      // Fallback to FileReader path below
    }

    // Fallback: decode via FileReader and draw to canvas
    const createImageFromFile = () => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const image = await createImageFromFile();
    let { width, height } = image;
    if (width > height && width > MAX_DIMENSION) {
      height = Math.round((height * MAX_DIMENSION) / width);
      width = MAX_DIMENSION;
    } else if (height >= width && height > MAX_DIMENSION) {
      width = Math.round((width * MAX_DIMENSION) / height);
      height = MAX_DIMENSION;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files).slice(0, totalImages - uploadedImages.length);
    const validFiles = files.filter(
      (file) => validateFileType(file) && validateFileSize(file)
    );

    if (validFiles.length > 0) {
      const previews = await Promise.all(validFiles.map((file) => generatePreviewDataUrl(file)));
      const newImages = validFiles.map((file, idx) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${idx}`,
        file,
        preview: previews[idx],
      }));
      setUploadedImages((prevImages) => [...prevImages, ...newImages].slice(0, totalImages));
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

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files).slice(0, totalImages - uploadedImages.length);
    const validFiles = files.filter(
      (file) => validateFileType(file) && validateFileSize(file)
    );

    if (validFiles.length > 0) {
      const previews = await Promise.all(validFiles.map((file) => generatePreviewDataUrl(file)));
      const newImages = validFiles.map((file, idx) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${idx}`,
        file,
        preview: previews[idx],
      }));
      setUploadedImages((prevImages) => [...prevImages, ...newImages].slice(0, totalImages));
    }
  };

  const closeErrorModal = () => {
    setFileTypeError(false);
    setFileSizeError(false);
  };

  const removeImage = (indexToRemove) => {
    setUploadedImages((prevImages) =>
      prevImages.filter((_, i) => i !== indexToRemove)
    );
  };
  const handleImageError = async (index) => {
    const imageItem = uploadedImages[index];
    if (!imageItem) return;
    if (imageItem.file) {
      try {
        const regenerated = await generatePreviewDataUrl(imageItem.file);
        setUploadedImages((prevImages) =>
          prevImages.map((img, i) => (i === index ? { ...img, preview: regenerated } : img))
        );
      } catch (_e) {}
    }
  };
  

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
          showCancelButton={false}
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
          showCancelButton={false}
        />
      )}
      
      <div
        className={`custom-upload-container ${
          uploadedImages.length > 0 ? "with-border" : ""
        } ${disabled ? "upload-disabled" : ""}`}
      >
          <>
            <div 
              className={`custom-upload-container-center ${disabled ? "upload-disabled" : ""}`}
              onDragOver={disabled ? undefined : handleDragOver}
              onDragLeave={disabled ? undefined : handleDragLeave}
              onDrop={disabled ? undefined : handleDrop}
              key={feedbackId}
            >
              <input
                type="file"
                multiple
                accept={allowedFileTypes.join(',')}
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={disabled}
              />
              <label
                className={`flex flex-col items-center ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                onClick={disabled ? undefined : handleLabelClick}
              >
                <div className="custom-text-center">
                  <div className="custom-icon-container">
                    <img src={Icons.cloud_arrow_up} alt="Upload Icon" />
                  </div>
                  <p className="custom-upload-text-primary">
                    <span
                      style={{
                        textDecoration: "underline",
                        color: "#183571",
                        cursor: "pointer",
                      }}
                    >
                      Click to upload
                    </span>
                    {isLargeScreen ? (
                      <span style={{ color: "#0B1426" }}>
                        {" "}
                        or drag & drop your image here
                      </span>
                    ) : (
                      <span style={{ color: "#0B1426" }}>
                        {" "}
                        your <br></br>image here
                      </span>
                    )}
                  </p>

                  <p className="custome-upload-text-secondary">
                    {fileFormat}, up to {maxFileSize}
                  </p>
                  {uploadedImages.length > 0 && (
                    <p className="upload-text-secondary">
                      {uploadedImages.length} of {totalImages}
                    </p>
                  )}
                </div>
              </label>
            </div>

            {uploadedImages.length > 0 && (
              <div className="thumbnails-container custome-container">
                <Swiper
                  navigation={true}
                  modules={[Navigation]}
                  className="app-swiper"
                  breakpoints={{
                    0: {
                      slidesPerView: 2,
                    },
                    768: {
                      slidesPerView: 3,
                    },
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: -3,
                    },
                  }}
                  style={{
                    "--swiper-navigation-size": "12px",
                    "--swiper-navigation-color": "#183571",
                    "--swiper-pagination-color": "#183571",
                    "--swiper-navigation-sides-offset": "-2px",
                  }}
                >
                  {uploadedImages.map((image, index) => (
                    <SwiperSlide className="scroller" key={image.id || index}>
                      <div className="thumbnail-item" style={{ position: "relative" }}>
                        <img
                          src={image.preview}
                          alt={`Upload ${index + 1}`}
                          className="thumbnail-image"
                          onError={() => handleImageError(index)}
                        />
                        <Button
                          onClick={() => removeImage(index)}
                          style={{
                            position: "absolute",
                            top: -15,
                            right: -16,
                            borderRadius: "50%",
                            height: "26px",
                            width: "26px",
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
                              className="thumbnail-remove-icon"
                            />
                          }
                          className="thumbnail-remove-button"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </>
      </div>

      {uploadError && (
        <div className="field-error">
          <img src={Icons.warning_circle} alt="Warning Icon" />
          <h6>{uploadError}</h6>
        </div>
      )}
      {(uploadedImages.length > 0) && (
        <div className="job-img-save button-job pause-reason-img-btn">
            <button
              type="button"
              className="button button-cancel col-50 pause-reason-cancel "
              onClick={handleCancel} 
              disabled={isUploading || disabled}
              id="pause-job-image-uploader-cancel-button"
            >
              <h5>Cancel</h5>
            </button>
            <button
              type="button"
              className="button button-submit col-50 pause-reason-submit"       
              onClick={handleImageUpload}
              disabled={isUploading || uploadStatus === 'success' || disabled}
              id="pause-job-image-uploader-upload-button"
            >
              <h5>{isUploading ? `Please wait...` : `Upload Images`}</h5>
            </button>
        </div>
      )}
    </>
  );
};

export default ImageUploadComponent;