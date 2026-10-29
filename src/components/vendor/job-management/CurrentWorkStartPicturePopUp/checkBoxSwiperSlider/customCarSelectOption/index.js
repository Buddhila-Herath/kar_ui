import React from "react";
import { Image } from "antd";
import "./styles.scss";

const CustomCarSelectOption = (props) => {
  const { imageSrc, alt } = props;
  return (
    <>
      <div className="check-box-car-image-container">
        <Image
          src={imageSrc}
          alt={alt}
          preview={false}
          width={124}
          height={60}
          style={{ objectFit: "cover" }}
          className="car-image"
        />
      </div>
    </>
  );
};

export default CustomCarSelectOption;
