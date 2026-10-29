import React, {useState} from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Form } from 'antd';
import MasterLayout from '../../MasterLayout';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import Icons from "../../../utils/icons";
import UploadComponent from '../../../shared/upload/UploadComponent';
import {  bulkServiceUpload } from '../../../slices/vendor/serviceSlice';
import { useDispatch, useSelector } from 'react-redux';
import { notification } from "antd";
import serviceTemplate from '../../../assets/templates/services.xlsx';

const ServiceBulkUpload = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [uploadError, setUploadError] = useState(null);
  const [uploadErrorDescription, setUploadErrorDescription] = useState('');
  const [file, setFile] = useState(null);
  const { responseData, uploadErrorMessage, uploading } = useSelector((state) => state.vendorServices);

  const onTemplateClick = async () => {
    const link = document.createElement("a");
    link.href = serviceTemplate;  
    link.setAttribute("download", "Service_Template.xlsx");
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploadError('');
    setUploadErrorDescription('');

    // Show processing toast immediately
    notification.info({
      message: (
        <h5>Processing your file. You'll get an email soon with the status.</h5>
      ),
      icon: <img src={Icons.spinner_gap} alt="Processing" />,
      duration: 5, // auto-dismiss after 5 seconds
      className: "custom-bulk-upload-processing-notification",
    });
    navigate("/app/service-management");

    const formData = new FormData();
    formData.append('file', file[0]);

    try {
      const result = await dispatch(bulkServiceUpload({formData,isAdmin:false})).unwrap(); 
       
      // if (result) {
      //   notification.success({
      //     message: <h5>Bulk upload completed successfully!</h5>,
      //     icon: <img src={Icons.check} alt="Success" />,
      //     duration: 5,
      //   });
      //   navigate("/app/service-management");
      // }
    } catch (error) {
      const errorDetails = error || "An unknown error occurred.";
  
      setUploadError('Upload failed');
      setUploadErrorDescription(errorDetails);

    }
  };  

  return (
    <MasterLayout>
      <TabTitle title="Service  Bulk Upload" />
      <Breadcrumb
        parent_menu="Service Management"
        parent_menu_url="/app/service-management"
        current_page="Bulk Upload"
      />
      <div className="form-container bluk-upload-container admin-service" id="service-bulk-upload-page">
        <div className="form-header">
          <div className="back">
            <Link to="/app/service-management/create" id="service-bulk-back">
              <img src={Icons.arrow_left} alt="Back Icon" />
            </Link>
            <h3>Bulk Upload</h3>
          </div>
        </div>
        <Form className="form bulk-upload-frm" layout="vertical">
          {!file && (
            <div className="form-instructions">
              <span>
                <ol>
                  <li>Download the service template file and fill it with valid data.</li>
                  <li>Once you have downloaded and filled the service template file, upload it below.</li>
                </ol>
              </span>
            </div>
          )}
         
          <div className="form-item form-item__full">
            <h4 className="form-label__primary">Download Excel Template</h4>
            <div className="download-warpper">
              <div className="download-item">
                <div className="download-item__info">
                  <img src={Icons.excel_icon} alt="Excel Icon" />
                  <h4>Service Template</h4>
                </div>
                <h6>Simplify services data entry with our ready-made, easy-to-use Excel template.</h6>
              </div>
              <div className="download-icon" id="service-template-download" onClick={() => onTemplateClick()}>
                <img src={Icons.download} alt="Download Icon" />
              </div>
            </div>
          </div>
          <div className="form-item form-item__full">
            <h4 className="form-label__primary">
              {file ? 'Uploaded Excel Document' : 'Upload Excel Template'}
            </h4>
            <UploadComponent
              linkText="Click to upload"
              text="or drag & drop your file here"
              mobileText="your file here"
              subText="xls and xlsx format"
              inputId="bulk-upload"
              required={false}
              multiple={false}
              maxFileSize="1GB"  //size validation removed
              fileFormat="xls, xlsx"
              allowedFileTypes={[
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              ]}
              disableSizeValidation={false}  //size validation disabled here
              allowedFileSize={1024 * 1024 * 1024} //size validation removed
              onFileChange={(files) => {
                setFile(files.length > 0 ? files : null);
              }}
              uploadError={uploadError}
              uploadErrorDescription={uploadErrorDescription}
              onCancelClick={() => navigate("/app/service-management/create")}
            />  
          </div>
          <div className="form-footer">
            <button
              type="submit"
              className="button button-submit"
              onClick={handleUpload}
              disabled={!file || uploading}
              id="service-bulk-import"
            >
              <h5>Import</h5>
            </button>
            <button
              type="button"
              className="button button-cancel"
              onClick={() =>navigate("/app/service-management")}
              id="service-bulk-cancel"
            >
              <h5>Cancel</h5>
            </button>
          </div>
        </Form>
      </div>
    </MasterLayout>
  );
};

export default ServiceBulkUpload;