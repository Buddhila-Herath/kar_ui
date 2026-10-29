import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Icons from "../../../utils/icons";
import MasterLayout from '../../MasterLayout';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import { placeholderText } from '../../../shared/sharedMethod';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServiceDetails, downloadNoteAttachment } from '../../../slices/vendor/serviceSlice';
import { useParams } from "react-router-dom";
import Spinner from "../../../shared/components/loaders/Spinner";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { saveAs } from 'file-saver';

const ServiceDetails = () => {
  const { serviceDetails, isServiceDetailsLoading, isDownloadLoading, error } = useSelector((state) => state.vendorServices);
  const { id } = useParams();
  const dispatch = useDispatch();
  const [downloadingFileId, setdownloadingFileId] = useState(null);

  useEffect(() => {
    dispatch(fetchServiceDetails({ id, type: 'view' }));
  }, [dispatch]);

  const downloadAttachement = async (serviceCheckListPath, fileName) => {
    try {
      setdownloadingFileId(String(serviceCheckListPath));
      if (!serviceCheckListPath) {
        console.error("Attachment path is not provided.");
        return;
      }

      const { data, headers } = await dispatch(downloadNoteAttachment(serviceCheckListPath)).unwrap();

      const contentType = headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([data], { type: contentType });

      const downloadName = fileName || 'file.pdf';
      saveAs(blob, downloadName);
    } catch (error) {
      console.error("Error downloading the file:", error.message || "Unknown error occurred.");
    } finally {
      setdownloadingFileId(null);
    }
  };

  return (
    <MasterLayout>
      <TabTitle title={placeholderText("services.create.view")} />
      <Breadcrumb
        second_level_page="Service Management"
        second_level_page_url="/admin/service-management"
        current_page="View Services"
      />
      <TopProgressBar isLoading={isServiceDetailsLoading || isDownloadLoading} />
      {isServiceDetailsLoading ? <Spinner /> : <>
        <div className="view-spare-container">
          <div className="view-spare-header">
            <div className="back-page">
              <Link to="/admin/service-management">
                <img src={Icons.arrow_left} alt="Back Icon" />
              </Link>
              <h3>
                View Service - {serviceDetails && serviceDetails.serviceId ? serviceDetails.serviceId : '-'}
              </h3>
            </div>
          </div>
          <div className="view-spare-part-content">
            <div className="spare-info">
              <h4 className="info-header">Service Details</h4>
              <div className="detail">
                <h5 className="detail-label">Service ID</h5>
                <h4 className="detail-value">{serviceDetails && serviceDetails.serviceId ? serviceDetails.serviceId : '-'}</h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Service Name</h5>
                <h4 className="detail-value fw-700">{serviceDetails && serviceDetails.serviceName ? serviceDetails.serviceName : '-'}</h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Description</h5>
                <h4 className="detail-value">{serviceDetails && serviceDetails.description ? serviceDetails.description : '-'}</h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Service Category</h5>
                <h4 className="detail-value">{serviceDetails && serviceDetails.serviceCategory ? serviceDetails.serviceCategory : '-'}</h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Spare Parts Required</h5>
                <h4 className="detail-value">{serviceDetails && serviceDetails.pathsRequired ? serviceDetails.pathsRequired : '-'}</h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Required Spare Parts</h5>
                <h4 className="detail-value">
                  {serviceDetails && serviceDetails.partsDtoList && serviceDetails.partsDtoList.length > 0
                    ? serviceDetails.partsDtoList.join(", ")
                    : '-'}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Variation</h5>
                <h4 className="detail-value">
                  {serviceDetails && serviceDetails.variationRequestDtos && serviceDetails.variationRequestDtos.length > 0
                    ? serviceDetails.variationRequestDtos.join(", ")
                    : '-'}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Service Checklist</h5>
                <h4 className="detail-value" id="service-checklist-value">
                  {serviceDetails && serviceDetails.serviceChecklistDtos && serviceDetails.serviceChecklistDtos.length > 0
                    ? serviceDetails.serviceChecklistDtos.map((checklist, index) => {
                      const fileName = checklist.serviceCheckListPath
                        ? checklist.serviceCheckListPath.split("/").pop()
                        : `checklist${index + 1}.pdf`;

                      const fileExtension = fileName.split('.').pop().toLowerCase();
                      const fileIcon = fileExtension === "pdf"
                        ? Icons.pdf_file
                        : fileExtension === "xls" || fileExtension === "xlsx"
                          ? Icons.exls_icon
                          : Icons.pdf_file;
                      return (
                        <span
                          key={checklist.serviceCheckListId}
                          style={{ marginLeft: "5px" }}
                        >
                          {downloadingFileId === checklist.serviceCheckListPath ? (
                            <img src={Icons.spinner_blue} alt="Downloading..." className="download-icon spinner" />
                          ) : (
                            <>
                              <img
                                src={fileIcon}
                                className="download-img"
                                alt={`${fileExtension.toUpperCase()} Icon`}
                                style={{
                                  cursor: "pointer",
                                  marginRight: "5px",
                                }}
                              />
                              <span
                                onClick={() =>
                                  downloadAttachement(checklist.serviceCheckListPath, fileName)
                                }
                                style={{
                                  cursor: "pointer",
                                  color: "#0B1426",
                                  textDecoration: "underline",
                                  marginRight: index < serviceDetails.serviceChecklistDtos.length - 1 ? "5px" : "0",
                                }}
                              >
                                {fileName}
                              </span>
                            </>
                            )}
                            {index < serviceDetails.serviceChecklistDtos.length - 1 && " | "}
                        </span>
                      );
                    })
                    : "-"}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Service Type</h5>
                <h4 className="detail-value">{serviceDetails && serviceDetails.serviceType ? serviceDetails.serviceType : '-'}</h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Technician Type</h5>
                <h4 className="detail-value">
                  {serviceDetails &&
                    serviceDetails.technicianTypesDtos &&
                    (serviceDetails.technicianTypesDtos.technicianName.length > 0 ||
                      serviceDetails.technicianTypesDtos.technicianSubTypeName.length > 0)
                    ? `${serviceDetails.technicianTypesDtos.technicianName?.join(', ')} ${serviceDetails.technicianTypesDtos.technicianSubTypeName?.join(', ')
                    }`
                    : '-'}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Hours</h5>
                <h4 className="detail-value">{serviceDetails && serviceDetails.hours ? serviceDetails.hours : '-'}</h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Service Rate Type</h5>
                <h4 className="detail-value">
                  {serviceDetails && serviceDetails.serviceRateType ? serviceDetails.serviceRateType : '-'}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Additional Cost (Rs.)</h5>
                <h4 className="detail-value">
                  {serviceDetails && serviceDetails.additionalCost ? serviceDetails.additionalCost : '-'}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Total Service Cost (Rs.)</h5>
                <h4 className="detail-value">
                  {serviceDetails && serviceDetails.totalServiceCost ? serviceDetails.totalServiceCost : '-'}
                </h4>
              </div>
            </div>
            <div className="note-info">
              <h4 className="info-header">Notes</h4>
              <div className="detail detail__colunm">
                {serviceDetails && serviceDetails.serviceNotesDtos && serviceDetails.serviceNotesDtos.length > 0 ? (
                  serviceDetails.serviceNotesDtos.map((note, index) => (
                    <div key={index} className="detail-container">
                      <h4 className="detail-value note-title">Note {index + 1}</h4>
                      <div className="img-download">
                        <h4 className="detail-note">{note.notes}</h4>
                        {note.serviceAttachmentsDtoList &&
                          note.serviceAttachmentsDtoList.map((attachment, attachIndex) => {
                            const fileName = attachment.attachmentPath
                              ? attachment.attachmentPath.split("/").pop()
                              : "unknown-file";

                            const isImage = fileName.endsWith(".jpg") || fileName.endsWith(".png") || fileName.endsWith(".jpeg");
                            const isPdf = fileName.endsWith(".pdf");
                            const isCsv = fileName.endsWith(".csv");
                            const isText = fileName.endsWith(".txt");

                            return (
                              <div key={attachIndex} className="spare-doc-container">
                                <div className="spare-doc__left">
                                  {isImage ? (
                                    <img src={Icons.image} alt="Image Icon" />
                                  ) : isPdf ? (
                                    <img src={Icons.pdf_file} alt="PDF Icon" />
                                  ) : isCsv ? (
                                    <img src={Icons.csv_icon} alt="CSV Icon" />
                                  ) : (
                                    <img src={Icons.txt_icon} alt="Text Icon" />
                                  )}
                                  <div className="spare-doc-info">
                                    <span>{fileName}</span>
                                  </div>
                                </div>
                                <div className="spare-doc__right">
                                  {downloadingFileId === attachment.attachmentPath ? (
                                    <img src={Icons.spinner_blue} alt="Downloading..." className="download-icon spinner" />
                                  ) : (
                                    <img
                                      src={Icons.download}
                                      alt="Download Icon"
                                      onClick={() => downloadAttachement(attachment.attachmentPath, fileName)}
                                      style={{ cursor: "pointer" }}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        <div className="detail-value notes-by">
                          Notes by: {note.notesBy} on {note.dateTime}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <h4 className="detail-value">-</h4>
                )}
              </div>
            </div>
            <div className="section-container">
              <h4 className="section-header">Additional Details</h4>
              <div className="detail">
                <h5 className="detail-label">Service Primary Identifier</h5>
                <h4 className="detail-value">
                  {serviceDetails && serviceDetails.servicePrimaryIdentifier
                    ? serviceDetails.servicePrimaryIdentifier
                    : '-'}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Service Added Date</h5>
                <h4 className="detail-value">
                  {serviceDetails && serviceDetails.serviceCreatedDate ? serviceDetails.serviceCreatedDate : '-'}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Last Updated</h5>
                <h4 className="detail-value">
                  {serviceDetails && serviceDetails.lastUpdatedDate ? serviceDetails.lastUpdatedDate : '-'}
                </h4>
              </div>
              <div className="detail">
                <h5 className="detail-label">Service Added By</h5>
                <h4 className="detail-value">
                  {serviceDetails && serviceDetails.serviceCreatedBy ? serviceDetails.serviceCreatedBy : '-'}
                </h4>
              </div>
            </div>
          </div>
        </div>

      </>
      }
    </MasterLayout>
  )
}

export default ServiceDetails;