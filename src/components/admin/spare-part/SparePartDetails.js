import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icons from "../../../utils/icons";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import Spinner from "../../../shared/components/loaders/Spinner";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import {
  placeholderText,
} from "../../../shared/sharedMethod";
import { useDispatch, useSelector } from "react-redux";
import { fetchSparePartsDetails, downloadNoteAttachment } from "../../../slices/vendor/sparePartSlice";
import { useParams } from "react-router-dom";
import ImageModel from "../../../shared/components/ImageModel";

const sparePartDetails = () => {
  const { sparePartDetails, isSparePartsLoading, isDownloadLoading, error } = useSelector((state) => state.vendorSpareparts);
  const { id } = useParams();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [downloadingFileId, setdownloadingFileId] = useState(null);

  useEffect(() => {             
    dispatch(fetchSparePartsDetails(id));
  }, [dispatch]);

  const onClickViewImageModal = (imagePath) => {
    setModalImage(imagePath);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onNoteAttachementClick = async (attachmentPath, fileName) => {
    try {
        setdownloadingFileId(String(attachmentPath));
        if (!attachmentPath) {
            console.error("Attachment path is not provided.");
            return;
        }

        const { data, headers } = await dispatch(downloadNoteAttachment(attachmentPath)).unwrap();

        const contentType = headers['content-type'] || 'application/octet-stream'; 
        const blob = new Blob([data], { type: contentType });

        saveAs(blob, fileName);
    } catch (error) {
        if (error.response) {
            console.error("Error downloading the file:", error.response?.data || "Unknown error occurred.");
        } else if (error.request) {
            console.error("No response received from the server:", error.request);
        } else {
            console.error("Error in making the request:", error.message);
        }
    } finally {
      setdownloadingFileId(null);
    }
  };
  
  return (
    <MasterLayout>
      <TabTitle title={placeholderText("spare-part.create.view")} />
      <Breadcrumb
        parent_menu="Spare Part Management"
        parent_menu_url="/admin/spare-part-management"
        current_page="View Spare Parts"
      />
      <TopProgressBar isLoading={isSparePartsLoading || isDownloadLoading} />
      {isSparePartsLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="view-spare-container">
            <div className="view-spare-header">
              <div className="back-page">
                <Link to="/admin/spare-part-management/">
                  <img src={Icons.arrow_left} alt="Back Icon" />
                </Link>
                <h3>View Spare Part - {sparePartDetails && sparePartDetails.partName ? sparePartDetails.partName : '-'}</h3>
              </div>
            </div>
            <div className="view-spare-part-content">
              <div className="spare-info">
                <h4 className="info-header">Part Details</h4>
                <div className="detail">
                  <div className="detail-image-container">
                  {sparePartDetails && sparePartDetails.partImagePath	? ( 
                        <img
                          src={"data:image/png;base64," + sparePartDetails.partImagePath}
                          alt="Spare Part"
                          className="detail-image detail-image__avatar"
                          onClick={() =>
                            onClickViewImageModal("data:image/png;base64," + sparePartDetails.partImagePath)
                          }
                        />
                  ) :
                    <img
                      src={Icons.part_default_img}
                      alt="Spare Part"
                      className="detail-image detail-image__avatar"
                      onClick={() =>
                        onClickViewImageModal(Icons.part_default_img)
                      }
                    />
                  }
                  </div>
                  <h4 className="detail-value fw-700">{sparePartDetails && sparePartDetails.partName	? sparePartDetails.partName : '-'} ( {sparePartDetails && sparePartDetails.partNameCode ? sparePartDetails.partNameCode.toUpperCase() : '-'} )</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Part Category</h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.partCategory	? sparePartDetails.partCategory : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Part Placement</h5>
                  <h4 className="detail-value">
                      {sparePartDetails?.partPlacement && sparePartDetails?.partPlacementCode 
                        ? `${sparePartDetails.partPlacement} - ${sparePartDetails.partPlacementCode.toUpperCase()}`
                        : sparePartDetails?.partPlacement || sparePartDetails?.partPlacementCode?.toUpperCase() || '-'
                      }
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Part Number</h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.partNumber ? sparePartDetails.partNumber : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Manufactured Country</h5>
                  <h4 className="detail-value">
                    {sparePartDetails?.manufacturedCountry && sparePartDetails?.manufacturedCountryCode 
                      ? `${sparePartDetails.manufacturedCountry} - ${sparePartDetails.manufacturedCountryCode}`
                      : sparePartDetails?.manufacturedCountry || sparePartDetails?.manufacturedCountryCode || '-'
                    }
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Manufactured Year</h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.manufacturedYear ? sparePartDetails.manufacturedYear : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Description</h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.description ? sparePartDetails.description : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Variation</h5>
                  <h4 className="detail-value">
                    {sparePartDetails && sparePartDetails.variation && sparePartDetails.variation.length > 0
                      ? sparePartDetails.variation.join(", ")
                      : '-'}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Material</h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.material	? sparePartDetails.material : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Unit and Quantity of Purchase</h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.unitQuantityPurchase	? sparePartDetails.unitQuantityPurchase : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Unit and Quantity of Sales</h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.unitQuantitySale	? sparePartDetails.unitQuantitySale : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">
                    Min Order Quantity - Supplier
                  </h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.minOrderQuantitySupplier	? sparePartDetails.minOrderQuantitySupplier : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Reorder Level</h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.reOrderLevel	? sparePartDetails.reOrderLevel : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Warranty</h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.warranty	? sparePartDetails.warranty : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Warranty Period</h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.warrantyPeriod	? sparePartDetails.warrantyPeriod : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Vehicle Category</h5>
                  <h4 className="detail-value">
                    {sparePartDetails && sparePartDetails.vehicleCategory && sparePartDetails.vehicleCategory.length > 0
                      ? sparePartDetails.vehicleCategory.join(", ")
                      : '-'}
                    </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Vehicle Make</h5>
                  <h4 className="detail-value">
                    {sparePartDetails && sparePartDetails.vehicleMake && sparePartDetails.vehicleMake.length > 0
                      ? sparePartDetails.vehicleMake.join(", ")
                      : '-'}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Vehicle Model</h5>
                  <h4 className="detail-value">
                    {sparePartDetails && sparePartDetails.vehicleModel && sparePartDetails.vehicleModel.length > 0
                      ? sparePartDetails.vehicleModel.join(", ")
                      : '-'}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Fuel Type</h5>
                  <h4 className="detail-value">
                  {sparePartDetails && sparePartDetails.fuelType && sparePartDetails.fuelType.length > 0 
                    ? sparePartDetails.fuelType.join(', ')
                    : '-'}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Purchase Price (Rs.)</h5>
                  <h4 className="detail-value">
                    {sparePartDetails && sparePartDetails.purchasePrice 
                      ? parseFloat(sparePartDetails.purchasePrice).toLocaleString('en-US', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        }).replace(/,/g, ', ')
                      : '*'}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Sale Price - MRP (Rs.)</h5>
                  <h4 className="detail-value">
                    {sparePartDetails && sparePartDetails.salePrice 
                      ? parseFloat(sparePartDetails.salePrice).toLocaleString('en-US', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        }).replace(/,/g, ', ')
                      : '-'}
                    </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Version</h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.version	? sparePartDetails.version : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">SKU Code </h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.skuCode	? sparePartDetails.skuCode : '-'}</h4>
                </div>
              </div>
              <div className="note-info">
                <h4 className="info-header">Notes</h4>
                <div className="detail detail__colunm">
                  {sparePartDetails && sparePartDetails.notes && sparePartDetails.notes.length > 0 ? (
                    sparePartDetails.notes.map((note, index) => (
                      <div key={index} className="detail-container">
                         <h4 className="detail-value note-title">Note {index + 1}</h4>
                        <div className="img-download">
                         <h4 className="detail-note">{note.note}</h4>
                        {note.noteAttachments &&
                          note.noteAttachments.map((attachment, attachIndex) => {
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
                                      onClick={() => onNoteAttachementClick(attachment.attachmentPath, attachment.fileName)}
                                      disabled={isDownloadLoading}
                                      style={{ cursor: "pointer" }}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          <div className="detail-value notes-by">
                            Notes by: {note.addedBy} on {note.addedDate} {note.addedTime}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <h4 className="detail-value">-</h4>
                  )}
                </div>
              </div>
              <div className="additional-info">
                <h4 className="info-header">Additional Details</h4>
                <div className="detail">
                  <h5 className="detail-label">
                    Spare Parts Primary Identifier
                  </h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.sparePartPrimaryIdentifier	? sparePartDetails.sparePartPrimaryIdentifier : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Spare Parts Added Date</h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.addedDate ? sparePartDetails.addedDate : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Spare Parts Added By</h5>
                  <h4 className="detail-value">{sparePartDetails && sparePartDetails.addedBy ? sparePartDetails.addedBy : '-'}</h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Stock Status</h5>
                  <div
                      className={`detail-status ${
                        sparePartDetails?.stockStatus === 'Available'
                          ? 'detail-status__active'
                          : 'detail-status__inactive'
                      }`}
                    >
                    <h4 className="detail-value">{sparePartDetails && sparePartDetails.stockStatus ? sparePartDetails.stockStatus : '-'}</h4>
                  </div>
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
        />
      )}
    </MasterLayout>
  );
};

export default sparePartDetails;
