import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icons from "../../../utils/icons";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import Spinner from "../../../shared/components/loaders/Spinner";
import {
  getFormattedMessage,
  placeholderText,
} from "../../../shared/sharedMethod";
import { useDispatch, useSelector } from "react-redux";
import { fetchTechnicianDetails, downloadPdfFile } from "../../../slices/vendor/technicianSlice";
import { useParams } from "react-router-dom";
import ImageModel from "../../../shared/components/ImageModel";
import { fetchImageByPath } from "../../../slices/masterDataSlice";
import { saveAs } from "file-saver";

const technicianDetails = () => {
  const { technicianDetails, isTechnicianDetailLoading, isDownloadLoading } = useSelector((state) => state.vendorTechnician);
  const { id } = useParams();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [imageUrls, setImageUrls] = useState({ profile: null, feNic: null, beNic: null });
  const [imageLoading, setImageLoading] = useState({ profile: false, feNic: false, beNic: false });
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    dispatch(fetchTechnicianDetails({ id, type: 'view' }));
  }, [dispatch]);

  useEffect(() => {
    const loadImage = async (path, key) => {
      if (!path) return;
      setImageLoading(prev => ({ ...prev, [key]: true }));
      try {
        const res = await dispatch(fetchImageByPath(path)).unwrap();
        setImageUrls(prev => ({ ...prev, [key]: res.url }));
      } catch (error) {
        console.warn(`Failed to fetch ${key} image by path`, error);
      } finally {
        setImageLoading(prev => ({ ...prev, [key]: false }));
      }
    };

    if (technicianDetails) {
      loadImage(technicianDetails.technicianProfilePath, 'profile');
      loadImage(technicianDetails.feNicPath, 'feNic');
      loadImage(technicianDetails.beNicPath, 'beNic');
    }
  }, [technicianDetails, dispatch]);

  const onClickViewImageModal = (imagePath) => {
    setModalImage(imagePath);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onPdfClick = async () => {
    try {
      setDownloadingPdf(String(id));
      const response = await dispatch(downloadPdfFile(id)).unwrap();
      
      // Extract the filename from the response
      const fileName = response.fileName;
      
      // Convert base64 pdfBytes to blob
      const byteCharacters = atob(response.pdfBytes);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error downloading the PDF file:", error);
    } finally {
      setDownloadingPdf(null);
    }
  };

  return (
    <MasterLayout>
      <TabTitle title={placeholderText("technician.create.view")} />
      <Breadcrumb
        parent_menu="Technician Management"
        parent_menu_url="/app/technician-management"
        current_page="View Technician"
      />
      {isTechnicianDetailLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="view-spare-container">
            <div className="view-spare-header">
              <div className="back-page">
                <Link to="/app/technician-management">
                  <img src={Icons.arrow_left} alt="Back Icon" />
                </Link>
                <h3>View Technician - {technicianDetails && technicianDetails.technicianId ? technicianDetails.technicianId : '-'}</h3>
              </div>
              <div className="tech-view-edit-btn-container">
                <Link to={`/app/technician-management/edit/${id}`} className="button tech-view-edit-btn form-button">
                    <img src={Icons.pencil_simple_line} />
                    <span>Edit Details</span>
                </Link>

                { downloadingPdf ? (
                  <button className='pop-cancel-btn tech-view-download-btn' disabled={isDownloadLoading}>
                    <img
                        src={Icons.spinner_blue} 
                        alt="Downloading..." 
                        className="spinner"
                    />
                  </button>
                ) : (
                  <button className='pop-cancel-btn tech-view-download-btn' onClick={() => onPdfClick()} disabled={isDownloadLoading}>
                    <img src={Icons.download} alt="Upload Icon" />
                  </button>
                )}
              </div>
            </div>
            <div className="view-spare-part-content">
              <div className="spare-info">
                <h4 className="info-header tech-view-header">Personal Information</h4>
                <div className="detail">
                  <div className="detail-image-container">
                    {technicianDetails && technicianDetails.technicianProfile ? (
                      <img
                        src={"data:image/png;base64," + technicianDetails.technicianProfile}
                        alt="Technician Profile"
                        className="detail-image detail-image__avatar"
                        onClick={() =>
                          onClickViewImageModal("data:image/png;base64," + technicianDetails.technicianProfile)
                        }
                      />
                    ) :
                      <img
                        src={Icons.part_default_img}
                        alt="Technician Profile"
                        className="detail-image detail-image__avatar"
                        onClick={() =>
                          onClickViewImageModal(Icons.part_default_img)
                        }
                      />
                    }
                  </div>
                  <h4 className="detail-value fw-700">{technicianDetails && technicianDetails.fullName ? technicianDetails.fullName : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">NIC</h5>
                  <h4 className="detail-value">{technicianDetails && technicianDetails.nic ? technicianDetails.nic : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Contact Number</h5>
                  <h4 className="detail-value">{technicianDetails && technicianDetails.contactNumber ? technicianDetails.contactNumber : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Email Address</h5>
                  <h4 className="detail-value">{technicianDetails && technicianDetails.email ? technicianDetails.email : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Technician Type</h5>
                  <h4 className="detail-value">
                    {technicianDetails && technicianDetails.technicianType && technicianDetails.technicianType.length > 0
                    ? technicianDetails.technicianType.join(", ")
                    : '-'}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Employment Type</h5>
                  <h4 className="detail-value">
                    {technicianDetails && technicianDetails.employeeType ? technicianDetails.employeeType : '-'}
                  </h4>
                </div>
                {technicianDetails?.monthlySalary && (
                <div className="detail">
                  <h5 className="detail-label">Monthly Salary (Rs.)</h5>
                  <h4 className="detail-value">
                    {technicianDetails && technicianDetails.monthlySalary ? technicianDetails.monthlySalary : '-'}
                  </h4>
                </div>
                )}
                {technicianDetails?.hourlyRate && (
                <div className="detail">
                  <h5 className="detail-label">Hourly Rate</h5>
                  <h4 className="detail-value">
                    {technicianDetails && technicianDetails.hourlyRate ? technicianDetails.hourlyRate : '-'}
                  </h4>
                </div>
                )}
                <div className="detail">
                  <h5 className="detail-label">Expense Account Code</h5>
                  <h4 className="detail-value">
                    {technicianDetails && technicianDetails.expenseCode ? technicianDetails.expenseCode : '-'}
                  </h4>
                </div>
                <div className="entity entity__colunm">
                  <h5 className="entity-label">Uploaded NIC</h5>
                  <div className='entity-container'>
                  {technicianDetails?.feNic && (
                    <div className='nic-container'>
                      <div className="nic-header">
                        <h5>NIC Front Side</h5>
                      </div>
                      <div className="nic-image">
                       <figure>
                          <img 
                            src={"data:image/png;base64," + technicianDetails.feNic} 
                            alt="NIC Front" 
                            onClick={() =>
                              onClickViewImageModal("data:image/png;base64," + technicianDetails.feNic)
                            }
                          />
                        </figure>
                      </div>
                    </div>
                  )}
                  {technicianDetails?.beNic && (
                    <div className='nic-container'>
                      <div className="nic-header">
                        <h5>NIC Back Side</h5>
                      </div>
                      <div className="nic-image">
                        <figure>
                          <img 
                            src={"data:image/png;base64," + technicianDetails.beNic} 
                            alt="NIC Back" 
                            onClick={() =>
                              onClickViewImageModal("data:image/png;base64," + technicianDetails.beNic)
                            } 
                          />
                        </figure>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </div>
              <div className="additional-info">
                <h4 className="info-header">Additional Information</h4>
                <div className="detail">
                  <h5 className="detail-label">
                    Technician ID
                  </h5>
                  <h4 className="detail-value">{technicianDetails && technicianDetails.technicianId ? technicianDetails.technicianId : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Joined Date</h5>
                  <h4 className="detail-value">{technicianDetails && technicianDetails.joinedDate ? technicianDetails.joinedDate : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Registered By</h5>
                  <h4 className="detail-value">{technicianDetails && technicianDetails.registerBy ? technicianDetails.registerBy : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Status</h5>
                  <div
                    className={`detail-status ${technicianDetails?.status === true
                        ? 'detail-status__active'
                        : technicianDetails?.status === false
                          ? 'detail-status__inactive'
                          : ''
                      }`}
                  >
                    <h4 className="detail-value">{technicianDetails?.status === true ? "Active" : "Inactive"}</h4>
                  </div>
                 </div>
              </div>
              <div className="additional-info">
                <h4 className="info-header">Account Information</h4>
                <div className="detail">
                  <h5 className="detail-label">
                    Username
                  </h5>
                  <h4 className="detail-value">{technicianDetails && technicianDetails.userName ? technicianDetails.userName : '-'}</h4>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {isModalOpen && (
        <ImageModel
          imagePath={modalImage}
          onClose={closeModal}
          className={'usermanagement-view-image'}
        />
      )}
    </MasterLayout>
  );
};

export default technicianDetails;
