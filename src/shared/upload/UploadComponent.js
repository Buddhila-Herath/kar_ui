import React, { useState, useRef, useEffect } from "react";
import Icons from "../../utils/icons";
import pdf_icon from "../../assets/images/pdf-icon.svg";
import UploadFileError from "./UploadFileError";
import { Spin } from "antd";
import ImageWithLoader from "../components/ImageWithLoader";

const UploadComponent = ({
  title,
  text,
  textTwo,
  mobileText,
  linkText,
  highlightedText,
  subText,
  buttonText,
  inputId,
  required,
  allowedFileTypes,
  allowedFileSize,
  onFileChange,
  uploadError,
  uploadErrorDescription,
  onCancelClick,
  maxFileSize,
  fileFormat,
  multiple,
  isLoading,
  onRemoveFile,
  uploadedFiles,
  onRemoveExistingFile,
  editImgPreview = null,
  showCancelButton = true,
  disableSizeValidation = false,
  disabled
}) => {
  const [files, setFile] = useState([]);
  const [previewFile, setPreviewFile] = useState([]);
  const inputFileRef = useRef(null);
  const [fileTypeError, setFileTypeError] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [maxFileLimitError, setMaxFileLimitError] = useState(false);
  const [isUploadError, setIsUploadError] = useState(uploadError || false);

  useEffect(() => {
    if (uploadError) {
      setIsUploadError(uploadError);
    }
  }, [uploadError]);

  const handleRemoveFile = () => {
    setFile([]);
    onFileChange([]);
    if (onRemoveFile) {
      onRemoveFile();
    }
  };

  const handleRemoveSingleFile = (file) => {
    const updatedFiles = files.filter((f) => f.name !== file.name);
    const updatedPreviewFiles = previewFile.filter((f) => f.id !== file.name);
    setFile(updatedFiles);
    onFileChange(updatedFiles);
    if (onRemoveFile) {
      onRemoveFile(file.name);
    }
  };

  const handlePreview = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const uniqueId = `${file.lastModified}-${Math.random()
        .toString(36)
        .substr(2, 5)}`;
      const previewObj = { src: reader.result, id: uniqueId };

      setPreviewFile((prev) => {
        if (multiple) {
          // Append for multiple uploads
          return [...prev, previewObj];
        } else {
          // Replace for single uploads
          return [previewObj];
        }
      });
    };
  };

  const handleFiles = () => {
    const selectedFiles = Array.from(inputFileRef.current.files);

    // For note attachments, check total number of files
    if (
      inputId === "note-attachments" &&
      files.length + selectedFiles.length > 3
    ) {
      setMaxFileLimitError(true);
      return;
    }

    const validFiles = selectedFiles.filter(
      (file) => validateFileType(file) && validateFileSize(file)
    );

    if (validFiles.length) {
      validFiles.forEach(handlePreview);
      setFile((prev) => {
        if (inputId === "service-checklist") {
          const updatedFiles = [...validFiles];
          onFileChange(updatedFiles);
          return updatedFiles;
        } else {
          const updatedFiles = [...prev, ...validFiles];
          onFileChange(updatedFiles);
          return updatedFiles;
        }
      });
    }

    inputFileRef.current.value = null;
  };

  const handleFilesDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const droppedFiles = Array.from(event.dataTransfer.files);

    // For note attachments, check total number of files
    if (
      inputId === "note-attachments" &&
      files.length + droppedFiles.length > 3
    ) {
      setMaxFileLimitError(true);
      return;
    }

    const validFiles = droppedFiles.filter(
      (file) => validateFileType(file) && validateFileSize(file)
    );

    if (validFiles.length) {
      validFiles.forEach(handlePreview);
      setFile((prev) => {
        if (inputId === "service-checklist") {
          const updatedFiles = [...validFiles];
          onFileChange(updatedFiles);
          return updatedFiles;
        } else {
          const updatedFiles = [...prev, ...validFiles];
          onFileChange(updatedFiles);
          return updatedFiles;
        }
      });
    }
  };

  const getPreviewClass = () => {
    if (["nic-front", "nic-back"].includes(inputId)) return "nic";
    if (
      [
        "profile-photo",
        "business-logo",
        "part-image",
        "technician-profile-photo",
      ].includes(inputId)
    )
      return "square";
    return "";
  };

  const renderPreviewFiles = () => {
    if (multiple) {
      return previewFile.map((file) => (
        <figure key={file.id} className={getPreviewClass()}>
          <img src={file.src} alt="Preview" />
        </figure>
      ));
    } else {
      if (editImgPreview) {
        return (
          <figure className={getPreviewClass()}>
            <ImageWithLoader
              src={editImgPreview}
              alt="Preview"
            />
          </figure>
        );
      }
      return (
        previewFile.length > 0 && (
          <figure className={getPreviewClass()}>
            <ImageWithLoader
              src={previewFile[0].src}
              alt="Preview"
            />
          </figure>
        )
      );
    }
  };

  const renderFileInfo = () => {
    if (inputId === "bulk-upload") {
      return (
        <div key={files[0].name}>
          <h4>{files[0].name}</h4>
          <span>{formatFileSize(files[0].size)}</span>
        </div>
      );
    } else {
      return files.map((file) => (
        <div key={file.name}>
          <h4>{file.name}</h4>
          <span>{formatFileSize(file.size)}</span>
        </div>
      ));
    }
  };

  function formatFileSize(size) {
    if (size < 1024) {
      return `${size} bytes`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  }
  const sendDragOverFeedback = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const validateFileType = (file) => {
    const allowedTypes = allowedFileTypes;

    if (!allowedTypes.includes(file.type)) {
      setFileTypeError(true);
      return false;
    }

    setFileTypeError(false);
    return true;
  };

  const validateFileSize = (file) => {
    if (disableSizeValidation) {
      setFileSizeError(false);
      return true;
    }
    // For note attachments, check individual file size (5MB) and total size (15MB)
    if (inputId === "note-attachments") {
      const maxIndividualSize = 5 * 1024 * 1024; // 5MB
      const maxTotalSize = 15 * 1024 * 1024; // 15MB

      // Check individual file size
      if (file.size > maxIndividualSize) {
        setFileSizeError(true);
        return false;
      }

      // Calculate total size including new file
      const currentTotalSize = files.reduce((total, f) => total + f.size, 0);
      if (currentTotalSize + file.size > maxTotalSize) {
        setFileSizeError(true);
        return false;
      }
    } else {
      // For other file types, use the provided allowedFileSize
      if (file.size > allowedFileSize) {
        setFileSizeError(true);
        return false;
      }
    }
    setFileSizeError(false);
    return true;
  };

  const closeErrorModal = () => {
    setFileTypeError(false);
    setFileSizeError(false);
    setMaxFileLimitError(false);
    setIsUploadError(null);
  };

  return (
    <>
      {fileTypeError && (
      <UploadFileError
        openModal={fileTypeError}
        closeErrorModal={closeErrorModal}
        closeParentModal={onCancelClick}
        modalText="The Selected File Type is Unsupported"
        modalSubText={`Please upload a valid file format ${fileFormat}`}
        submitButtonText="Try Another File"
        cancelButtonText="Cancel"
        showCancelButton={showCancelButton}
      />
    )}
    {maxFileLimitError && (
      <UploadFileError
        openModal={maxFileLimitError}
        closeErrorModal={closeErrorModal}
        closeParentModal={onCancelClick}
        modalText="Maximum File Limit Exceeded"
        modalSubText="You can upload a maximum of 3 files"
        submitButtonText="Try Another File"
        cancelButtonText="Cancel"
        showCancelButton={showCancelButton}
      />
    )}
    {fileSizeError && (
      <UploadFileError
        openModal={fileSizeError}
        closeErrorModal={closeErrorModal}
        closeParentModal={onCancelClick}
        modalText="File Size Exceeded"
        modalSubText={inputId === "note-attachments" ? 
          "Each file must be less than 5MB and total size should not exceed 15MB" : 
          `File size exceeds ${maxFileSize}`}
        submitButtonText="Try Another File"
        cancelButtonText="Cancel"
        showCancelButton={showCancelButton}
      />
    )}
    {isUploadError && (
      <UploadFileError
        openModal={isUploadError}
        closeErrorModal={closeErrorModal}
        closeParentModal={onCancelClick}
        modalText="Upload Failed"
        modalSubText={ uploadErrorDescription || "An error occurred while uploading your file. Please try again." }
        submitButtonText="Try Again"
        cancelButtonText="Cancel"
        showCancelButton={!["part-image", "note-attachment", "technician-profile-photo"].includes(inputId)}
      />
    )}
      <div
        className={`upload-container
      ${files.length > 0 ? "upload-container__active" : ""}
      ${inputId === "bulk-upload" ? "upload-container__bulk-upload" : ""}
      ${inputId === "note-attachments" ? "notes-upload" : ""}
      ${inputId === "nic-front" ? "nic-img-upload" : ""}
      ${inputId === "nic-back" ? "nic-img-upload" : ""}
      ${inputId === "service-checklist" ? "checklist-upload" : ""}
      ${disabled}`
    }
        onDragOver={sendDragOverFeedback}
        onDragEnter={sendDragOverFeedback}
        onDrop={handleFilesDrop}
      >
        {isLoading ? (
          <div className="spin-container">
            <Spin tip="Uploading... Please wait." size="large">
              {" "}
            </Spin>
          </div>
        ) : (files.length > 0 && multiple === false) || editImgPreview ? (
          <>
            {title && (
              <div className="upload-header">
                <h5 className="title">{title}</h5>
                <img
                  src={Icons.close_icon}
                  alt="Close"
                  onClick={handleRemoveFile}
                  className="close-icon"
                  id="upload-component-close-button"
                />
              </div>
            )}
            {[
              "nic-front",
              "nic-back",
              "profile-photo",
              "business-logo",
              "part-image",
              "technician-profile-photo",
            ].includes(inputId) && (
              <>
                <div className="upload-content__image">
                  {disabled || inputId !== "nic-front" && inputId !== "nic-back" && (
                    <img
                      src={Icons.close_icon}
                      alt="Remove"
                      onClick={handleRemoveFile}
                      className="close-icon"
                      id="upload-component-remove-image-button"
                    />
                  )}
                  {renderPreviewFiles()}
                </div>
                {inputId !== "part-image" ||
                  inputId !== "technician-profile-photo" ||
                  inputId !== "nic-front" ||
                  (inputId == "nic-back" && (
                    <div className="upload-content__image-info">
                      {renderFileInfo()}
                    </div>
                  ))}
              </>
            )}
            {["reg-doc", "bulk-upload"].includes(inputId) && (
              <div className="upload-content__file">
                <div className="upload-content__file-right">
                  <img
                    src={inputId === "reg-doc" ? pdf_icon : Icons.excel_icon}
                    alt={inputId === "reg-doc" ? "PDF" : "Excel"}
                    className={
                      inputId === "reg-doc" ? "pdf-icon" : "excel-icon"
                    }
                  />
                  <div className="upload-content__file-info">
                    {renderFileInfo()}
                  </div>
                </div>
                <div className="delete-icon">
                  <img
                    src={Icons.trash}
                    alt="Delete"
                    onClick={handleRemoveFile}
                    id="upload-component-delete-file-button"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {title && (
              <div className="upload-header">
                <h5>{title}</h5>
              </div>
            )}
            <div className="upload-body">
              <img src={Icons.cloud_arrow_up} alt="Upload Icon" />
              <h4 className="desktop-text">
                <span className="link-text">{linkText}</span> {text}{" "}
                <span className="line-two">{textTwo}</span>
                <span className="highlighted-text">{highlightedText}</span>
              </h4>
              <h4 className="mobile-text">
                <span className="link-text">{linkText}</span> {mobileText}
              </h4>
              <span>{subText}</span>
              {/* <button className="button"><h5>{buttonText}</h5></button> */}
            </div>
            <input
              type="file"
              disabled={disabled}
              id={inputId}
              required={required}
              ref={inputFileRef}
              multiple={
                inputId === "note-attachments" ||
                inputId === "service-checklist"
              }
              onChange={handleFiles}
              style={{ display: "none" }}
            />
            <label htmlFor={inputId} className={`upload-label ${disabled && 'upload-label-disabled'}`}></label>
          </>
        )}
      </div>
      {inputId === "note-attachments" &&
        files.map((file) => (
          <div
            className="form-item form-item__full note-preview checklist-preview"
            key={file.name}
          >
            <div className="note-container">
              <div className="note-item">
                <img
                  src={
                    file.type === "application/pdf"
                      ? Icons.pdf_file
                      : file.type === "image/png" ||
                        file.type === "image/jpg" ||
                        file.type === "image/jpeg"
                      ? Icons.image
                      : file.type ===
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      ? Icons.doc_file
                      : file.type ===
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      ? Icons.excel_icon
                      : file.type === "text/plain"
                      ? Icons.txt_icon
                      : file.type === "text/csv"
                      ? Icons.csv_icon
                      : ""
                  }
                  alt="File"
                />
                <h4>{file.name}</h4>
              
                <img
                  className="del-img"
                  src={Icons.trash}
                  alt="Remove"
                  onClick={() => handleRemoveSingleFile(file)}
                  id={`upload-component-remove-note-file-button-${file.name}`}
                />
                
              </div>
            </div>
          </div>
        ))}
      {inputId === "service-checklist" &&
        uploadedFiles &&
        uploadedFiles.length > 0 &&
        uploadedFiles.map((file) => (
          <div
            className="form-item form-item__full note-preview checklist-preview"
            key={file.serviceCheckListId}
          >
            <div className="note-container">
              <div className="note-item">
                <img
                  src={
                    file.serviceCheckListPath.endsWith(".pdf")
                      ? Icons.pdf_file
                      : file.serviceCheckListPath.endsWith(".xls") ||
                        file.serviceCheckListPath.endsWith(".xlsx")
                      ? Icons.exls
                      : ""
                  }
                  alt="File"
                />
                <h4>{file.serviceCheckListPath.split("/").pop()}</h4>
                {
                  !disabled&&
                <img
                  className="del-img"
                  src={Icons.trash}
                  alt="Remove"
                  onClick={() => onRemoveExistingFile(file.serviceCheckListId)}
                  id={`upload-component-remove-checklist-file-button-${file.serviceCheckListId}`}
                />
                }
              </div>
            </div>
          </div>
        ))}
    </>
  );
};

export default UploadComponent;
