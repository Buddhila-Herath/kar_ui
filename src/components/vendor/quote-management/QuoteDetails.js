import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Icons from "../../../utils/icons";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import { Form, notification, Tooltip } from "antd";
import Spinner from "../../../shared/components/loaders/Spinner";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchQuoteDetails,
  updateQuoteStatus,
  downloadPdfFile,
  clearQuoteDetails,
} from "../../../slices/vendor/quoteSlice";
import {
  createInvoice
} from "../../../slices/vendor/financeSlice";
import { createJob } from "../../../slices/vendor/jobSlice";
import { shareQuoteInvoice } from "../../../slices/masterDataSlice";
import RadioSelect from "../../../shared/select/RadioSelect";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import ActionModal from "../../../shared/components/ActionModal";

const QuoteDetails = () => {
  const { quoteDetails, isQuoteDetailsLoading, isQuoteStatusUpdating, isInvoiceLoading, error  } =
    useSelector((state) => state.vendorQuotes);
  const { id } = useParams();
  const [isJobCreateLoading, setJobCreateLoading] = useState(false);
  const dispatch = useDispatch();

  const [status, setStatus] = useState("");
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [showRejectedQuotePopup, setShowRejectedQuotePopup] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(null);
  const [printingPdf, setPrintingPdf] = useState(null);
  const [currentQuoteId, setCurrentQuoteId] = useState(null);
  const [localSharedCount, setLocalSharedCount] = useState(0);
  const [isRevertLoading, setIsRevertLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const result = await dispatch(fetchQuoteDetails({ id, type: "view" }));
      if (result?.payload?.sharedCounts !== undefined) {
        setLocalSharedCount(result.payload.sharedCounts);
      }
    };
    fetchData();
  }, [dispatch, id]);

  useEffect(() => {    
    if (quoteDetails?.status && quoteDetails?.id) {
      setStatus(quoteDetails.status);
      
        if (currentQuoteId !== quoteDetails.id) {
          setCurrentQuoteId(quoteDetails.id);
          
          if (quoteDetails?.status === "Rejected") {
            setShowRejectedQuotePopup(true);
          }
        }
    }
  }, [quoteDetails, currentQuoteId]);
  useEffect(()=>{
    return ()=>{
      dispatch(clearQuoteDetails());
    }
  }, [dispatch]);

  const hasOnlySpareParts = (quoteDetails) => {
    const hasParts = quoteDetails?.partCategoryListDto?.some(
      category => category?.quotePartsDtoList?.length > 0
    ) || false;
    
    const hasServices = quoteDetails?.serviceCategoryListDto?.some(
      category => category?.quoteServicesDtos?.length > 0
    ) || false;
    
    return hasParts && !hasServices;
  };

  const handleCreateInvoice = async (quoteId) => {
    try {
      let dataToSend = {
        quoteId: quoteId
      };
      const response = await dispatch(createInvoice(dataToSend)).unwrap();

      if (response?.id) {
        notification.success({
          message: <h5>Created successfully!</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 5
        });
        dispatch(fetchQuoteDetails({ id, type: "view" }));
      }
      return response;
    } catch (error) {
      notification.error({
        message: <h5>{error.errors ? error.errors[0] : "Something went wrong"}</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    }
  };

  const handleCreateJob = async (quoteId, JobStatus) => {
    setJobCreateLoading(true)
    try {
      let dataToSend = {
        quoteId: quoteId,
        isUpdate: JobStatus
      };
      const response = await dispatch(createJob(dataToSend)).unwrap();

      if (response?.id) {
        notification.success({
          message: <h5>{`Job ${JobStatus ? 'updated' : 'created'} successfully!`}</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 5
        });
      }
      return response;
    } catch (error) {
      notification.error({
        message: <h5>{error.errors ? error.errors[0] : "Something went wrong"}</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    } finally {
      setJobCreateLoading(false)
    }
  };

  const handleStatusChange = async (selectedOption) => {
    const previousStatus = status;
    const statusValue = selectedOption?.value || "";

    // Don't update status state yet, wait for successful API response
    try {
      await dispatch(
        updateQuoteStatus({ id: quoteDetails.id, status: statusValue })
      ).unwrap();

      // Only update the status state and show popup if API call is successful
      setStatus(statusValue);
      
      // Show rollback popup only after successful status update to "Rejected"
      if (statusValue === "Rejected") {
        setShowRejectedQuotePopup(true);
      }

      notification.success({
        message: <h5>{"Updated successfully!"}</h5>,
        icon: <img src={Icons.check} alt="Success" />,
        duration: 5,
      });
    } catch (error) {
      setStatus(previousStatus);
      // Hide popup if status update failed
      if (statusValue === "Rejected") {
        setShowRejectedQuotePopup(false);
      }

      const errorMessage =
        error?.errors?.[0] || error?.message || "Failed to update status.";

      notification.error({
        message: <h5>{errorMessage}</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    }
  };

  const getSubtotal = (quoteDetails) => {
    if (!quoteDetails) return 0;
    
    // Calculate parts total - handle both new and old data structures
    let partsTotal = 0;
    if (quoteDetails?.partCategoryListDto?.length > 0) {
      partsTotal = quoteDetails.partCategoryListDto
        .flatMap(item => item.quotePartsDtoList || [])
        .reduce((sum, item) => sum + parseFloat(item.totalPartCost?.replace(/,/g, "") || 0), 0);
    } else if (quoteDetails?.quotePartsDtoList?.length > 0) {
      partsTotal = quoteDetails.quotePartsDtoList.reduce(
        (sum, item) => sum + parseFloat(item.totalPartCost?.replace(/,/g, "") || 0),
        0
      );
    }

    // Calculate services total - handle both new and old data structures
    let servicesTotal = 0;
    if (quoteDetails?.serviceCategoryListDto?.length > 0) {
      servicesTotal = quoteDetails.serviceCategoryListDto
        .flatMap(item => item.quoteServicesDtos || [])
        .reduce((sum, item) => sum + parseFloat(item.totalServiceCost?.replace(/,/g, "") || 0), 0);
    } else if (quoteDetails?.quoteServicesDtos?.length > 0) {
      servicesTotal = quoteDetails.quoteServicesDtos.reduce(
        (sum, item) => sum + parseFloat(item.totalServiceCost?.replace(/,/g, "") || 0),
        0
      );
    }
    
    return partsTotal + servicesTotal;
  };

  const subtotal = getSubtotal(quoteDetails);

  const Tax = quoteDetails?.tax
    ? ` ${(
      (subtotal -
        (quoteDetails?.ispercent
          ? (quoteDetails?.discount / 100) * subtotal
          : quoteDetails?.discount || 0)) *
      (quoteDetails.tax / 100)
    ).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
    : "-";

  const calculateFinalAmount = (quoteDetails, subtotal) => {
    const discountAmount = quoteDetails?.ispercent
      ? (quoteDetails?.discount / 100) * subtotal
      : quoteDetails?.discount || 0;

    const subtotalAfterDiscount = subtotal - discountAmount;

    const taxAmount = quoteDetails?.tax
      ? (quoteDetails?.tax / 100) * subtotalAfterDiscount
      : 0;

    const finalAmount = subtotalAfterDiscount + taxAmount;
    return finalAmount;
  };

  const finalAmount = calculateFinalAmount(quoteDetails, subtotal);

  const categoryMap = {
    SPARE_PARTS: "Spare Parts",
    CONSUMABLES: "Consumables",
    // Service categories will use their actual names from the API
  };

  const Status = [
    ...(status !== "Accepted" ? [{ label: "Pending", value: "Pending" }] : []),
    { label: "Rejected", value: "Rejected" },
    { label: "Accepted", value: "Accepted" },
  ];

  const formatPhoneNumber = (number) => {
    const cleaned = number.replace(/\D/g, "");
    if (cleaned?.startsWith("94")) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(
        4,
        7
      )} ${cleaned.slice(7)}`;
    } else if (cleaned?.startsWith("0")) {
      return `+94 ${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
        6
      )}`;
    } else {
      return number;
    }
  };

  const handleConfirmShare = async () => {
    if (isShareLoading) {
      return;
    }
    
    setIsShareLoading(true);
    
    try {
      // Make the API call
      const response = await dispatch(shareQuoteInvoice({ id, type: "quote" })).unwrap();
      
      // Only update the count if the API call was successful
      if (response) {
        setLocalSharedCount(prevCount => (prevCount || 0) + 1);
        
        notification.success({
          message: <h5>{"Quote shared successfully!"}</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 5,
        });
      }
    } catch (error) {
      const errorMessage =
        error?.errors?.[0] || error?.message || "Failed to share quote.";
      notification.error({
        message: <h5>{errorMessage}</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    } finally {
      setIsShareLoading(false);
      setShowSharePopup(false);
    }
  };

  const handleShareCancel = () => {
    setShowSharePopup(false);
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

  const onPdfPrint = async () => {
    setPrintingPdf(true);
    try {
        const response = await dispatch(downloadPdfFile(id)).unwrap();
        let base64 = response && response.pdfBytes;
        if (!base64) throw new Error('Missing pdfBytes in response');
        base64 = String(base64)
            .replace(/^data:application\/(pdf|octet-stream);base64,/i, '')
            .replace(/\s/g, '')
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        // Pad to multiple of 4
        while (base64.length % 4 !== 0) base64 += '=';

        const byteChars = atob(base64);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
        const byteArray = new Uint8Array(byteNums);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const iframe = document.createElement('iframe');
        // Keep iframe in DOM and visible to the layout engine, but sized to 0
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = '0';
        iframe.setAttribute('aria-hidden', 'true');
        document.body.appendChild(iframe);

        const safeRevokeDelayMs = 120000; // 2 minutes to be safe across browsers
        const cleanup = () => {
            try { iframe.parentNode && iframe.parentNode.removeChild(iframe); } catch (_) {}
            // Revoke after a delay so print preview has time to finish rendering
            setTimeout(() => { try { URL.revokeObjectURL(url); } catch (_) {} }, safeRevokeDelayMs);
        };

        iframe.onload = () => {
            try {
                const win = iframe.contentWindow;
                if (!win) return;

                // Cleanup when printing finishes
                const afterPrint = () => {
                    try { win.removeEventListener('afterprint', afterPrint); } catch (_) {}
                    cleanup();
                };
                try { win.addEventListener('afterprint', afterPrint); } catch (_) {}

                // Fallback cleanup in case afterprint doesn't fire (some browsers)
                setTimeout(() => cleanup(), safeRevokeDelayMs);

                // Give the browser a moment to render before printing
                setTimeout(() => {
                    try {
                        win.focus();
                        win.print();
                    } catch (_) {}
                }, 200);
            } catch (_) {}
        };

        iframe.src = url;
    } catch (error) {
        console.error("Error fetching the PDF for printing:", error);
    } finally {
      setPrintingPdf(false);
    }
  };

  const handleConfirmRevertQuote = async () => {
    if (isRevertLoading) return;
    
    setIsRevertLoading(true);
    try {
      await handleStatusChange({ value: "Rollback" });
      setShowRejectedQuotePopup(false);
      
      // Refresh quote details to get updated status from API
      const result = await dispatch(fetchQuoteDetails({ id, type: "view" }));
      
      // Update status to Accepted if rollback was successful
      if (result?.payload?.status) {
        setStatus(result.payload.status);
      } else {
        // Fallback: set to Accepted if API doesn't return status
        setStatus("Accepted");
      }
    } catch (error) {
      // Error handling is already done in handleStatusChange
      console.error("Error during rollback:", error);
    } finally {
      setIsRevertLoading(false);
    }
  };

  const handleRevertQuoteCancel = () => {
    setShowRejectedQuotePopup(false);
  };

  return (
    <MasterLayout>
      <TabTitle title="View Quote" />
      <Breadcrumb
        parent_menu="Quote Management"
        parent_menu_url="/app/quote-management"
        current_page="View Quote/Estimate"
      />
      <TopProgressBar isLoading={isQuoteDetailsLoading || isJobCreateLoading} />
      {isQuoteDetailsLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="container-quotes">
            <div className="view-spare-header">
              <div className="back-page">
                <Link to="/app/quote-management" id="quote-details-back-link">
                  <img src={Icons.arrow_left} alt="Back Icon" />
                </Link>
                <h3 id="quote-details-title">
                  View Quote -{" "}
                  {quoteDetails && quoteDetails.quoteId
                    ? quoteDetails.quoteId
                    : "-"}
                </h3>
              </div>
              <div className="tech-edit-btn-container quote-mane ">
                <div className="loading-border share-quote">
                  <Tooltip  placement="bottom" className="custom-tooltip"
                   color="#E0EBFF"
            title={
              <div className="tooltip-content">
                <span className="badge badge-borderless">Share</span>
              </div>
            }>
                <img
                  className="header-icons"
                  src={Icons.share}
                  alt="share Icon"
                  onClick={() => setShowSharePopup(true)}
                  id="quote-share-button"
                />
                  </Tooltip>
                  {((typeof localSharedCount === "number" && localSharedCount > 0) || (typeof quoteDetails?.sharedCounts === "number" && quoteDetails.sharedCounts > 0)) && (
                    <div className="count">
                      {localSharedCount || quoteDetails?.sharedCounts}
                    </div>
                  )}
                </div>
                 <Tooltip  placement="bottom" className="custom-tooltip"
                   color="#E0EBFF"
            title={
              <div className="tooltip-content">
                <span className="badge badge-borderless">Print</span>
              </div>
            }>
                <div className="loading-border">
                { printingPdf ? (
                  
                <img
                    src={Icons.spinner_blue} 
                    alt="pls wait..." 
                    className="header-icons spinner"
                    />
                  ) : (
                <img className="header-icons" src={Icons.print_bordered}  onClick={() => onPdfPrint()} alt="print Icon" id="quote-print-button" />
                )}
                </div>
            </Tooltip>
                 <Tooltip  placement="bottomRight" className="custom-tooltip"
                   color="#E0EBFF"
            title={
              <div className="tooltip-content">
                <span className="badge badge-borderless">Download PDF</span>
              </div>
            }>

                <div className="loading-border">
                { downloadingPdf ? (
                <img
                    src={Icons.spinner_blue} 
                    alt="Downloading..." 
                    className="header-icons spinner"
                    />
                  ) : (
                <img className="header-icons" src={Icons.download_bordered} onClick={() => onPdfClick()} disabled={downloadingPdf} alt="download Icon" id="quote-download-button" />
                )}
                                    </div>
            </Tooltip>

                <div className="tech-view-edit-btn-container ">
                  <Link>
                    {hasOnlySpareParts(quoteDetails) && quoteDetails?.isInvoiceCreated !== true && (
                      <button
                          className={`button quote-button tech-view-edit-btn form-button quote-detail-btn ${
                            status === "Rejected" || status === "Pending" ? "disabled-button" : ""
                          }`}
                          disabled={status === "Rejected" || status === "Pending" || isInvoiceLoading}
                          onClick={() => handleCreateInvoice(quoteDetails.id)}
                          id="quote-create-invoice-button"
                        >
                        <img src={Icons.plus} alt="Create Invoice" />
                        <span>Create Invoice</span>
                      </button>
                    )}
                    {!hasOnlySpareParts(quoteDetails) && quoteDetails && (
                      quoteDetails.isJobCreated ? (
                      <button
                        className={`button quote-button tech-view-edit-btn form-button quote-detail-btn ${status === "Rejected" || status === "Pending"
                            ? "disabled-button"
                            : ""
                          }`}
                        disabled={status === "Rejected" || status === "Pending" || isJobCreateLoading}
                        onClick={() => handleCreateJob(quoteDetails.id, true)}
                        id="quote-update-job-button"
                      >
                        <img src={Icons.plus} alt="Create Job" />
                        <span>Update Job</span>
                      </button>
                    ) : (
                      <button
                        className={`button quote-button tech-view-edit-btn form-button quote-detail-btn ${status === "Rejected" || status === "Pending"
                            ? "disabled-button"
                            : ""
                          }`}
                        disabled={status === "Rejected" || status === "Pending" || isJobCreateLoading}
                        onClick={() => handleCreateJob(quoteDetails.id, false)}
                        id="quote-create-job-button"
                      >
                        <img src={Icons.plus} alt="Create Job" />
                        <span>Create Job</span>
                      </button>
                      )
                    )}
                  </Link>
                </div>
              </div>
            </div>
            <div className="quote-detail">
              <div className="header">
                <div className="logo-container">
                  {quoteDetails && quoteDetails.vendorLogo ? (
                    <img
                      src={"data:image/png;base64," + quoteDetails.vendorLogo}
                      alt="Spare Part"
                      className="company-logo"
                    />
                  ) : (
                    <img
                      src={Icons.part_default_img}
                      alt="Spare Part"
                      className="company-logo"
                    />
                  )}
                </div>
                <div className="company-info">
                  <p className="quote-title-header">
                    {quoteDetails && quoteDetails.quoteType === "INSURANCE_QUOTE" ? "INSURANCE QUOTE" : "CUSTOMER QUOTE"}
                  </p>
                  <div className="company-details">
                   {
                    quoteDetails && quoteDetails?.vendorBusinessName&&quoteDetails?.vendorBusinessName?.toLowerCase()!=='n/a'&&
                    <p className="strong">
                      {
                         quoteDetails.vendorBusinessName
                       }
                    </p>
                   }
                   {quoteDetails && quoteDetails?.vendorAddress&&quoteDetails?.vendorAddress?.toLowerCase()!=='n/a'&&
                    <p>
                      {
                         quoteDetails.vendorAddress
                        }
                    </p>
                   }
                   {quoteDetails && quoteDetails?.vendorBusinessEmail&&quoteDetails?.vendorBusinessEmail?.toLowerCase()!=='n/a'&&
                    <p>
                      
                    <a href={`tel:${quoteDetails.vendorContactNumber}`}>
                      {formatPhoneNumber(quoteDetails.vendorContactNumber)}
                    </a>
                  
                 </p>
                  
                   }
                   {
                    quoteDetails&&quoteDetails?.vendorContactNumber&&quoteDetails?.vendorContactNumber?.toLowerCase()!=='n/a'&&
                    <p>
                      {
                         quoteDetails.vendorBusinessEmail
                        }
                    </p>
                   }
                   {
                    quoteDetails&&quoteDetails?.vendorBusinessWebsite&&quoteDetails?.vendorBusinessWebsite?.toLowerCase()!=='n/a'&&
                    <p className="breakable-url">
  
                        <a
                          href={
                            quoteDetails.vendorBusinessWebsite.startsWith("http")
                              ? quoteDetails.vendorBusinessWebsite
                              : `https://${quoteDetails.vendorBusinessWebsite}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {quoteDetails.vendorBusinessWebsite}
                        </a>
                      
                    </p>
                   }
                    {quoteDetails?.vendorVatNumber && quoteDetails?.vendorVatNumber?.toLowerCase()!=='n/a'&&(
                      <p>VAT Reg Number: {quoteDetails.vendorVatNumber}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="quote-main-section">
                <div className="quote-left-section">
                  <div className="quote-to-section">
                    <p className="section-label">Quote To</p>
                    {quoteDetails?.quoteType === "INSURANCE_QUOTE" && quoteDetails?.insuranceName && quoteDetails?.insuranceName?.toLowerCase()!=='n/a'&&(
                      <p>{quoteDetails.insuranceName}</p>
                    )}
                    { quoteDetails?.quoteType !== "INSURANCE_QUOTE"&&
                      <>
                      {
                        quoteDetails && quoteDetails.customerName&&quoteDetails.customerName?.toLowerCase()!=='n/a'&&
                      <p>
                      {
                         quoteDetails.customerName
                        }
                    </p>
                      }
                      {
                        quoteDetails && quoteDetails?.customerAddress&&quoteDetails?.customerAddress?.toLowerCase()!=='n/a'&&
                    <p>
                      {
                        quoteDetails.customerAddress
                        }
                    </p>
                      }{
                        quoteDetails && quoteDetails?.customerContactNumber&&quoteDetails?.customerContactNumber?.toLowerCase()!=='n/a'&&
                    <p>
                      {
                         quoteDetails.customerContactNumber
                        }
                    </p>
                      }
                      {quoteDetails?.customerVatNumber 
                        && quoteDetails.customerVatNumber.toLowerCase() !== 'n/a'
                        && quoteDetails.customerVatNumber.trim() !== '-'
                        && (
                        <p>CX VAT Number : {quoteDetails.customerVatNumber}</p>
                      )}
                      </>
                    }
                  
                  </div>
                  <div className="quote-divider"></div>
                  {quoteDetails?.quoteType === "INSURANCE_QUOTE" &&
                    <>
                  <div className="quote-to-section">
                    <p className="section-label">CC</p>
                    {
                      quoteDetails && quoteDetails.customerName&&quoteDetails.customerName?.toLowerCase()!=='n/a'&&
                    <p>
                      {
                       quoteDetails.customerName
                        }
                    </p>
                    }
                    {
                      quoteDetails && quoteDetails.customerAddress&&quoteDetails.customerAddress?.toLowerCase()!=='n/a'&&
                    <p>
                      {
                         quoteDetails.customerAddress
                        }
                    </p>
                    }
                    {
                      quoteDetails && quoteDetails?.customerContactNumber&&quoteDetails?.customerContactNumber?.toLowerCase()!=='n/a'&&
                    <p>
                      {quoteDetails.customerContactNumber
                       }
                    </p>
                    }
                      {quoteDetails?.customerVatNumber 
                        && quoteDetails.customerVatNumber.toLowerCase() !== 'n/a'
                        && quoteDetails.customerVatNumber.trim() !== '-'
                        && (
                        <p>CX VAT Number : {quoteDetails.customerVatNumber}</p>
                      )}
                  </div>
                  <div className="quote-divider"></div>
                    </>
                  }
                  <div className="vehicle-details-section">
                    <p className="section-label">Vehicle Details</p>
                    <div className="vehicle-detail-row">
                      <span className="vehicle-label">Vehicle</span>
                      <span className="vehicle-separator">:</span>
                      <span className="vehicle-value">
                        {quoteDetails && quoteDetails.vehicleMakeModel
                          ? quoteDetails.vehicleMakeModel
                          : "-"}
                      </span>
                    </div>
                    <div className="vehicle-detail-row">
                      <span className="vehicle-label">Reg No</span>
                      <span className="vehicle-separator">:</span>
                      <span className="vehicle-value">
                        {quoteDetails && quoteDetails.vegRegNum
                          ? quoteDetails.vegRegNum
                          : "-"}
                      </span>
                    </div>
                    <div className="vehicle-detail-row">
                      <span className="vehicle-label">Job Type</span>
                      <span className="vehicle-separator">:</span>
                      <span className="vehicle-value">
                        {quoteDetails && quoteDetails.jobType
                          ? quoteDetails.jobType
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="quote-right-section">
                  <div className="quote-details-right">
                    <div className="quote-detail-row">
                      <div className="quote-detail-label-main">
                      <span className="quote-detail-label">Quote ID</span>
                      <span className="quote-detail-separator">:</span>
                      </div>
                      <span className="quote-detail-value">
                        {quoteDetails && quoteDetails.quoteId
                          ? quoteDetails.quoteId
                          : "-"}
                      </span>
                    </div>
                    <div className="quote-detail-row">
                      <div className="quote-detail-label-main">
                      <span className="quote-detail-label">Created Date</span>
                      <span className="quote-detail-separator">:</span>
                      </div>
                      <span className="quote-detail-value">
                        {quoteDetails && quoteDetails.quoteCreatedDate
                          ? quoteDetails.quoteCreatedDate
                          : "-"}
                      </span>
                    </div>
                    <div className="quote-detail-row">
                      <div className="quote-detail-label-main">
                      <span className="quote-detail-label">Due Date</span>
                      <span className="quote-detail-separator">:</span>
                      </div>
                      <span className="quote-detail-value">
                        {quoteDetails && quoteDetails.quoteDueDate && quoteDetails.quoteDueDate !== "null"
                        && quoteDetails.quoteDueDate?.toLowerCase()!=='n/a'
                          ? quoteDetails.quoteDueDate
                          : "-"}
                      </span>
                    </div>
                    <div className="quote-detail-row">
                      <div className="quote-detail-label-main">
                      <span className="quote-detail-label">Created By</span>
                      <span className="quote-detail-separator">:</span>
                      </div>
                      <span className="quote-detail-value">
                        {quoteDetails && quoteDetails.quoteCreatedBy
                          ? quoteDetails.quoteCreatedBy
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="quote-items-section">
                <table className="quote-items-table">
                  <thead>
                    <tr className="quote-table-header">
                      <th className="quote-table-col-no">NO</th>
                      <th className="quote-table-col-desc">DESCRIPTION</th>
                      <th className="quote-table-col-qty">L HUR/QTY</th>
                      <th className="quote-table-col-price">UNIT PRICE (Rs.)</th>
                      <th className="quote-table-col-total">TOTAL (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody className="quote-table-body">
                    {(() => {
                      const categoryGroups = {};
                      let itemCounter = 0;
                      let categoryCounter = 0;
                      const categoryLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                      
                      // First pass: collect all items and assign category letters
                      const allItems = [];
                      
                      // Collect parts
                      if (quoteDetails?.partCategoryListDto?.length > 0) {
                        quoteDetails.partCategoryListDto.flatMap(item => item.quotePartsDtoList || []).forEach((item) => {
                          const category = item.category || 'OTHER';
                          if (!categoryGroups[category]) {
                            categoryGroups[category] = {
                              letter: categoryLetters[categoryCounter++],
                              items: []
                            };
                          }
                          allItems.push({
                            ...item,
                            category: category,
                            type: 'part'
                          });
                        });
                      } else if (quoteDetails?.quotePartsDtoList?.length > 0) {
                        // Fallback to original structure
                        quoteDetails.quotePartsDtoList.forEach((item) => {
                          const category = item.category || 'OTHER';
                          if (!categoryGroups[category]) {
                            categoryGroups[category] = {
                              letter: categoryLetters[categoryCounter++],
                              items: []
                            };
                          }
                          allItems.push({
                            ...item,
                            category: category,
                            type: 'part'
                          });
                        });
                      }
                      
                      // Collect services
                      if (quoteDetails?.serviceCategoryListDto?.length > 0) {
                        quoteDetails.serviceCategoryListDto.flatMap(item => item.quoteServicesDtos || []).forEach((item) => {
                          const category = item.serviceCategory || 'OTHER';
                          if (!categoryGroups[category]) {
                            categoryGroups[category] = {
                              letter: categoryLetters[categoryCounter++],
                              items: []
                            };
                          }
                          allItems.push({
                            ...item,
                            category: category,
                            type: 'service'
                          });
                        });
                      } else if (quoteDetails?.quoteServicesDtos?.length > 0) {
                        // Fallback to original structure
                        quoteDetails.quoteServicesDtos.forEach((item) => {
                          const category = item.serviceCategory || 'OTHER';
                          if (!categoryGroups[category]) {
                            categoryGroups[category] = {
                              letter: categoryLetters[categoryCounter++],
                              items: []
                            };
                          }
                          allItems.push({
                            ...item,
                            category: category,
                            type: 'service'
                          });
                        });
                      }
                      
                      // Second pass: assign sequential item numbers and group by category
                      allItems.forEach((item) => {
                        itemCounter++;
                        const itemWithNumber = {
                          ...item,
                          itemNumber: String(itemCounter).padStart(2, '0')
                        };
                        categoryGroups[item.category].items.push(itemWithNumber);
                      });
                      
                      return Object.entries(categoryGroups).map(([category, group]) => (
                        <React.Fragment key={category}>
                          <tr className="quote-category-header">
                            <td className="quote-category-letter" colSpan="1">{group.letter}</td>
                            <td className="quote-category-name" colSpan="4">
                              {categoryMap[category] || (group.items[0]?.type === 'service' ? group.items[0]?.serviceCategory : category)}
                            </td>
                          </tr>
                          {group.items.map((item) => (
                            <tr key={item.id} className="quote-table-row">
                              <td className="quote-table-col-no">{item.itemNumber}</td>
                              <td className="quote-table-col-desc">
                                {item.type === 'part' ? (item?.variants?(item?.variants+' ')+item?.partsName:item?.partsName) : item?.variants?(item?.variants+' ')+item?.serviceName:item?.serviceName}
                              </td>
                              <td className="quote-table-col-qty">
                                {item.type === 'part' ? item.quantity : item.hours}
                              </td>
                              <td className="quote-table-col-price">
                                {item.type === 'part' 
                                  ? (item.unitCost
                                      ? parseFloat(item.unitCost.replace(/,/g, "")).toLocaleString("en-US", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : "-")
                                  : (item.hourlyRate
                                      ? parseFloat(item.hourlyRate.replace(/,/g, "")).toLocaleString("en-US", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : "-")
                                }
                              </td>
                              <td className="quote-table-col-total">
                                {item.type === 'part'
                                  ? (item.totalPartCost
                                      ? parseFloat(item.totalPartCost.replace(/,/g, "")).toLocaleString("en-US", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : "-")
                                  : (item.totalServiceCost
                                      ? parseFloat(item.totalServiceCost.replace(/,/g, "")).toLocaleString("en-US", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : "-")
                                }
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>

              <div className="quote-summary-section">
                <div className="quote-thanks-section">
                  <p className="quote-thanks-title">THANKS FOR YOUR BUSINESS!</p>
                  <p className="quote-thanks-message">
                    Thank you for trusting us with your vehicle's parts and services. We appreciate your business and look forward to serving you again!
                  </p>
                </div>
                <div className="quote-summary-box">
                  <div className="quote-summary-row">
                    <span className="quote-summary-label">SUBTOTAL (Rs.)</span>
                    <span className="quote-summary-value">
                      {subtotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="quote-summary-row">
                    <span className="quote-summary-label">
                      DISCOUNT
                      {quoteDetails?.ispercent && (
                        <span className="quote-summary-percent"> ({quoteDetails?.discount || 0}%)</span>
                      )}
                    </span>
                    <span className="quote-summary-value">
                      {quoteDetails?.ispercent
                        ? `- ${(
                            ((parseFloat(quoteDetails?.discount) || 0) / 100) *
                            (subtotal || 0)
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : `- ${(parseFloat(quoteDetails?.discount) || 0).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="quote-summary-row">
                    <span className="quote-summary-label">
                      TAX
                      <span className="quote-summary-percent"> ({quoteDetails?.tax || 0}%)</span>
                    </span>
                    <span className="quote-summary-value">
                      {Tax !== "-" ? `+ ${Tax.trim()}` : Tax}
                    </span>
                  </div>
                  <div className="quote-summary-row quote-summary-final">
                    <span className="quote-summary-label-final">FINAL TOTAL (Rs.)</span>
                    <span className="quote-summary-value-final">
                      {finalAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {quoteDetails && quoteDetails.comments&&<div className="quote-comments-section">
                <p className="quote-section-title">COMMENTS</p>
                <p className="quote-section-content">
                  {quoteDetails && quoteDetails.comments
                    ? quoteDetails.comments
                    : "-"}
                </p>
              </div>}

              {
                quoteDetails && quoteDetails.notes&&<div className="quote-notes-section">
                <p className="quote-section-title">NOTES</p>
                <p className="quote-section-content">
                  {quoteDetails && quoteDetails.notes
                    ? quoteDetails.notes
                    : "-"}
                </p>
                {quoteDetails?.notesAddedDate && (
                  <p className="quote-notes-by">
                    Notes by: {quoteDetails?.quoteCreatedBy || "-"} on {quoteDetails.notesAddedDate}{" "}
                    {quoteDetails.notesAddedTime || ""}
                  </p>
                )}
              </div>}

              <div className="quote-status-section">
                <Form className="form" layout="vertical">
                  <div className="form-item quote-detail">
                    <label className="form-label required" htmlFor="quote-status">
                      <h4>Status</h4>
                    </label>
                    <RadioSelect
                      options={Status}
                      value={status}
                      onChange={handleStatusChange}
                      placeholderText="Select status"
                      name="priority"
                      id="quote-status-select"
                      disabled={status === "Rejected" || status === "Accepted"}
                    />
                  </div>
                </Form>
              </div>

              <div className="footer">
                <p className="copy-right">
                  Copyrights&copy;
                  {quoteDetails && quoteDetails.quoteCreatedDate
                    ? new Date(quoteDetails.quoteCreatedDate).getFullYear()
                    : new Date().getFullYear()}{" "}
                  KARSTATION.COM All Rights Reserved
                </p>
              </div>
            </div>
          </div>

          {showSharePopup && (
            <ActionModal
              onClickConfirmModel={handleConfirmShare}
              onClickCancelModel={handleShareCancel}
              title="Share Quote with Client"
              subtext={<>Do you want to send this quote <br /> to the client?</>}
              yestBtnTxt="Yes, Send Now"
              noBtnTxt="No"
              loading={isShareLoading}
              isConfirmDisabled={isShareLoading}
              className="share-invoice-modal"
            />
          )}

          {showRejectedQuotePopup && (
            <ActionModal
              onClickConfirmModel={handleConfirmRevertQuote}
              onClickCancelModel={handleRevertQuoteCancel}
              title="The updated quote has been rejected"
              subtext={<>Do you want to continue with the previously <br /> approved version?</>}
              yestBtnTxt="Yes"
              noBtnTxt="No"
              loading={isRevertLoading}
              isConfirmDisabled={isRevertLoading}
              className="share-invoice-modal"
            />
          )}
        </>
      )}
    </MasterLayout>
  );
};

export default QuoteDetails;
