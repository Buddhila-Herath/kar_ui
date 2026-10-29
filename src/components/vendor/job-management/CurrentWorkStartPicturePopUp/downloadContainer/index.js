import React, { useRef } from "react";
import "./styles.scss";
import Icons from "../../../../../utils/icons";

const DownloadContainer = (props) => {
  const { downloadImageSrc, href, downloadFileName } = props;

  const downloadRef = useRef(null);

  const handleDownload = () => {
    if (downloadRef.current) {
      downloadRef.current.click();
    }
  };

  return (
    <div className="download-image">
      {/* Clickable Download Icon */}
      <img
        src={downloadImageSrc}
        alt="Download"
        onClick={handleDownload}
        className="download-icon"
      />

      {/* Hidden anchor for triggering download */}
      <a
        ref={downloadRef}
        href={href}
        download={downloadFileName}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default DownloadContainer;
