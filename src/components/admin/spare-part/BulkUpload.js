import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form } from "antd";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import Icons from "../../../utils/icons";
import UploadComponent from "../../../shared/upload/UploadComponent";
import {
  downloadSparePartTemplate,
  uploadBulkSparePart,
} from "../../../slices/vendor/sparePartSlice";
import { useDispatch, useSelector } from "react-redux";
import { saveAs } from "file-saver";
import { notification } from "antd";

const BulkUpload = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [uploadError, setUploadError] = useState(null);
  const [uploadErrorDescription, setUploadErrorDescription] = useState("");
  const [file, setFile] = useState(null);
  const { responseData, uploadErrorMessage, uploading } = useSelector(
    (state) => state.vendorSpareparts
  );

  const onTemplateClick = async () => {
    try {
      const response = await dispatch(downloadSparePartTemplate()).unwrap();
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "Spare_Parts_Template.xlsx");
    } catch (error) {
      console.error("Error downloading the Excel file:", error);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploadError("");
    setUploadErrorDescription("");

    // Show processing toast immediately
    notification.info({
      message: (
        <h5>Processing your file. You'll get an email soon with the status.</h5>
      ),
      icon: <img src={Icons.spinner_gap} alt="Processing" />,
      duration: 5, // auto-dismiss after 5 seconds
      className: "custom-bulk-upload-processing-notification",
    });
    navigate("/admin/spare-part-management");

    const formData = new FormData();
    formData.append("file", file[0]);

    try {
      const result = await dispatch(uploadBulkSparePart(formData)).unwrap();

      // if (result) {
      //   notification.success({
      //     message: <h5>{result.message}</h5>,
      //     icon: <img src={Icons.check} alt="Success" />,
      //     duration: 5,
      //   });
      //   navigate("/admin/spare-part-management");
      // }
    } catch (error) {
      const errorDetails = error || "An unknown error occurred.";

      setUploadError("Upload failed");
      setUploadErrorDescription(errorDetails);

      // notification.error({
      //   message: <h5>Upload Failed</h5>,
      //   description: typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails),
      //   icon: <img src={Icons.spinner_gap} alt="Error" />,
      //   duration: 5,
      //   className: "custom-bulk-upload-error-notification",
      // });
    }
  };

  return (
    <MasterLayout>
      <TabTitle title="Spare Part Bulk Upload" />
      <Breadcrumb
        parent_menu="Spare Part Management"
        parent_menu_url="/admin/spare-part-management"
        current_page="Bulk Upload"
      />
      <div className="form-container bluk-upload-container admin-service">
        <div className="form-header">
          <div className="back">
            <Link to="/admin/spare-part-management/create">
              <img src={Icons.arrow_left} alt="Back Icon" />
            </Link>
            <h3>Bulk Upload</h3>
          </div>
        </div>
        <Form className="form bulk-upload-frm" layout="vertical">
          {!file && (
            <div className="form-instructions">
              <span>
                1. Download the spare part template file and fill it with valid
                data.
                <br></br>
                2. Once you have downloaded and filled the spare part file,
                upload it below.
              </span>
            </div>
          )}
          <div className="form-item form-item__full">
            <h4 className="form-label__primary">Download Excel Template</h4>
            <div className="download-warpper">
              <div className="download-item">
                <div className="download-item__info">
                  <img src={Icons.excel_icon} alt="Excel Icon" />
                  <h4>Spare Part Template</h4>
                </div>
                <h6>
                  Simplify spare parts data entry with our ready-made,
                  easy-to-use Excel template.
                </h6>
              </div>
              <div className="download-icon" onClick={() => onTemplateClick()}>
                <img src={Icons.download} alt="Download Icon" />
              </div>
            </div>
          </div>
          <div className="form-item form-item__full">
            <h4 className="form-label__primary">
              {file ? "Uploaded Excel Document" : "Upload Excel Template"}
            </h4>
            <UploadComponent
              linkText="Click to upload"
              text="or drag & drop your file here"
              mobileText="your file here"
              subText="xls and xlsx format"
              inputId="bulk-upload"
              required={false}
              multiple={false}
              maxFileSize="1GB" //size validation removed
              fileFormat="xls, xlsx"
              allowedFileTypes={[
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              ]}
              disableSizeValidation={true} //size validation disabled here
              allowedFileSize={1024 * 1024 * 1024} //size validation removed
              onFileChange={(files) => {
                setFile(files.length > 0 ? files : null);
              }}
              uploadError={uploadError}
              uploadErrorDescription={uploadErrorDescription}
              onCancelClick={() =>
                navigate("/admin/spare-part-management/create")
              }
            />
          </div>
          <div className="form-footer bulk-upload-footer">
            <button
              type="submit"
              className="button button-submit"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              <h5>Import</h5>
            </button>
            <button
              type="button"
              className="button button-cancel"
              onClick={() => navigate("/admin/spare-part-management")}
            >
              <h5>Cancel</h5>
            </button>
          </div>
        </Form>
      </div>
    </MasterLayout>
  );
};

export default BulkUpload;
