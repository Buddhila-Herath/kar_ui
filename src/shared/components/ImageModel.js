import React from "react";
import { Modal } from "antd";

const ImageModel = ({ imagePath, onClose, className, imgClassName }) => {
    
  return (
    <Modal
        open={true}
        onCancel={onClose}
        footer={null}
        centered
        styles={{ margin: "20px" }}
        className={className}
    >
        <img
            src={imagePath}
            alt="Image Preview"
            style={{
            width: "100%",
            height: "auto",
            borderRadius: "8px",
            }}
            className={imgClassName}
        />
    </Modal>
  );
};

export default ImageModel;
