import React, { useState, useRef } from 'react';
import Icons from "../../../utils/icons";
import pdf_icon from "../../../assets/images/pdf-icon.svg";

const ImageUpload = ({ title, text, highlightedText, subText, buttonText, inputId, required }) => {
  const [files, setFiles] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const dropAreaRef = useRef(null);
  const inputFileRef = useRef(null);

  const handleRemoveFile = () => {
    setFiles([]);
    setPreviewFiles([]);
  };

  // Unchanged code
  const handlePreview = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const uniqueId = `${file.lastModified}-${Math.random().toString(36).substr(2, 5)}`;
      const previewObj = { src: reader.result, id: uniqueId };
      setPreviewFiles((prev) => [...prev, previewObj]);
    };
  };

  // Unchanged code
  const handleFilesDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    removeDragOverFeedback();

    const droppedFiles = Array.from(event.dataTransfer.files);
    droppedFiles.forEach((file) => {
      handlePreview(file);
      setFiles((prev) => [...prev, file]);
    });
  };

  // Unchanged code
  const handleFiles = () => {
    const selectedFiles = Array.from(inputFileRef.current.files);
    selectedFiles.forEach((file) => {
      handlePreview(file);
      setFiles((prev) => [...prev, file]);
    });
  };

  // Unchanged code
  const sendDragOverFeedback = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const dropArea = dropAreaRef.current;
    dropArea.style.background = 'rgba(232, 67, 147, 0.2)';
    dropArea.style.borderRadius = '.3rem 3rem';
    dropArea.style.border = '.5px solid rgba(232, 67, 147, 0.8)';
    dropArea.style.boxShadow = '0 0px 1px rgba(0, 0, 0, 0.16), 0 3px 3px rgba(0, 0, 0, 0.1)';
  };

  // Unchanged code
  const removeDragOverFeedback = () => {
    const dropArea = dropAreaRef.current;
    dropArea.style.background = '#F0F3F4';
    dropArea.style.borderRadius = '.3rem';
    dropArea.style.border = 'none';
    dropArea.style.boxShadow = 'none';
  };

  return (
    <div
      className={`upload-container ${files.length > 0 ? 'upload-container__active' : ''} ${inputId === 'registration-document' ? 'registration-document' : ''}`}
      ref={dropAreaRef}
      onDragOver={sendDragOverFeedback}
      onDragEnter={sendDragOverFeedback}
      onDragLeave={removeDragOverFeedback}
      onDrop={handleFilesDrop}
    >
      {files.length > 0 ? (
        <>
          {inputId !== 'registration-document' && (
            <div className="upload-header">
              <h5>{title}</h5>
              <img src={Icons.close_icon} alt="Close Icon" onClick={handleRemoveFile} />
            </div>
          )}
          <div className="upload-content">
            {previewFiles.map((file) => (
              <figure key={file.id} id={file.id} className={inputId === 'nic-front' || inputId === 'nic-back' ? 'nic' : inputId === 'profile-photo' ? 'profile-photo' : inputId === 'registration-document' ? 'registration-document' : ''}>
                {inputId === 'registration-document' ? (
                  <img src={pdf_icon} alt="PDF Icon" />
                ) : (
                  <img src={file.src} alt="Preview" />
                )}
              </figure>
            ))}
          </div>
          {/* <div className="upload-info">
            {files.map((file) => (
              <div key={file.name}>
                <h4>{file.name}</h4>
                <span>{(file.size / 1024 / 1024).toFixed(2)}MB</span>
              </div>
            ))}
          </div> */}
        </>
      ) : (
        <>
          <div className="upload-header upload-nic-head">
            <h5>{title}</h5>
          </div>
          <div className="upload-body nic-body">
            <img src={Icons.cloud_arrow_up} alt="Upload Icon" />
            <div className="upload-text">
            <h4 className='nic-img-txt'><span>{highlightedText}</span>{text}</h4>
            <span>{subText}</span>
            </div>
            {/* <button className="button"><h5>{buttonText}</h5></button> */}
          </div>
          <input
            type="file"
            id={inputId}
            required={required}
            ref={inputFileRef}
            onChange={handleFiles}
            style={{ display: 'none' }}
          />
          <label htmlFor={inputId} className="upload-label"></label>
        </>
      )}
    </div>
  );
};

export default ImageUpload;
