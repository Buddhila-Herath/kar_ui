import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveAs } from "file-saver";
import Icons from "../../../utils/icons";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import Spinner from "../../../shared/components/loaders/Spinner";
import paid_stamp from "../../../assets/images/paid-stamp.svg";
import { fetchInvoiceDetails, downloadPdfFile } from "../../../slices/vendor/financeSlice";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import ActionModal from "../../../shared/components/ActionModal";
import { shareQuoteInvoice } from "../../../slices/masterDataSlice";
import { Tooltip, notification } from "antd";

const InvoiceDetails = () => {
  const { invoiceDetails, isInvoiceDetailsLoading, error } = useSelector(
    (state) => state.vendorFinance
  );
  const { id } = useParams();
  const [isJobCreateLoading] = useState(false);
  const dispatch = useDispatch();

  const [showSharePopup, setShowSharePopup] = useState(false);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [invoiceSharedCount, setInvoiceSharedCount] = useState(0);
  const [printingPdf, setPrintingPdf] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(null);
  
  useEffect(() => {
    dispatch(fetchInvoiceDetails({ id, type: "view" }));
  }, [dispatch, id]);

  useEffect(() => {
    if (typeof invoiceDetails?.invoiceSharedCounts === "number") {
      setInvoiceSharedCount(invoiceDetails.invoiceSharedCounts);
    }
  }, [invoiceDetails?.invoiceSharedCounts]);

  const getSubtotal = (invoiceDetails) => {
    if (!invoiceDetails) return 0;
    const partsTotal =
      invoiceDetails?.partCategoryListDto?.flatMap((category) => category.quotePartsDtoList || [])?.reduce(
        (sum, item) => sum + parseFloat(item.totalPartCost.replace(/,/g, "")),
        0
      ) || 0;

    const servicesTotal =
      invoiceDetails?.serviceCategoryListDto?.flatMap((category) => category.quoteServicesDtos || [])?.reduce(
        (sum, item) =>
          sum + parseFloat(item.totalServiceCost.replace(/,/g, "")),
        0
      ) || 0;
    return partsTotal + servicesTotal;
  };

  const subtotal = getSubtotal(invoiceDetails);

  const Tax = invoiceDetails?.invoiceTax
    ? ` ${(
        (subtotal -
          (invoiceDetails?.invoiceIsPercent
            ? (parseFloat(invoiceDetails?.invoiceDiscount) / 100) * subtotal
            : parseFloat(invoiceDetails?.invoiceDiscount) || 0)) *
        (parseFloat(invoiceDetails.invoiceTax) / 100)
      ).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "-";

  const calculateFinalAmount = (invoiceDetails, subtotal) => {
    const discountAmount = invoiceDetails?.invoiceIsPercent
      ? (invoiceDetails?.invoiceDiscount / 100) * subtotal
      : invoiceDetails?.invoiceDiscount || 0;

    const subtotalAfterDiscount = subtotal - discountAmount;

    const taxAmount = invoiceDetails?.invoiceTax
      ? (invoiceDetails?.invoiceTax / 100) * subtotalAfterDiscount
      : 0;

    const finalAmount = subtotalAfterDiscount + taxAmount;
    return finalAmount;
  };

  const finalAmount = calculateFinalAmount(invoiceDetails, subtotal);

  const categoryMap = {
    SPARE_PARTS: "Spare Parts",
    CONSUMABLES: "Consumables",
    // Service categories will use their actual names from the API
  };

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
      const response = await dispatch(shareQuoteInvoice({ id, type: "invoice" })).unwrap();
      
      // Only update the count if the API call was successful
      if (response) {
        setInvoiceSharedCount(prev => (typeof prev === "number" ? prev + 1 : 1));
        
        notification.success({
          message: <h5>{"Invoice shared successfully!"}</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 5,
        });
      }
    } catch (error) {
      const errorMessage =
        error?.errors?.[0] || error?.message || "Failed to share invoice.";
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

  return (
    <MasterLayout>
     <TabTitle title={invoiceDetails?.isTaxInvoice ? "View Invoice" : "View Proforma Invoice"} />
      <Breadcrumb
        parent_menu="Finance Management"
        parent_menu_url="/app/finance-management"
        current_page={invoiceDetails?.isTaxInvoice ? "View Invoice" : "View Proforma Invoice"}
      />
      <TopProgressBar isLoading={isInvoiceDetailsLoading || isJobCreateLoading} />
      {isInvoiceDetailsLoading ? (
        <Spinner />
      ) : (
        <>
          <div id="invoice-details-container" className="container-quotes tax-invoice">
            <div className="view-spare-header">
              <div className="back-page">
                <Link id="invoice-details-back-link" to="/app/finance-management">
                  <img src={Icons.arrow_left} alt="Back Icon" />
                </Link>
                <h3 id="invoice-details-title">
                  View Invoice -{" "}
                  {invoiceDetails && invoiceDetails.invoiceId
                    ? invoiceDetails.invoiceId
                    : "-"}
                </h3>
              </div>
              <div className="tech-edit-btn-container quote-mane">
                <Tooltip  placement="bottom" className="custom-tooltip"
                   color="#E0EBFF"
                  title={
                    <div className="tooltip-content">
                      <span className="badge badge-borderless">Share</span>
                    </div>
                  }>
                <div className="loading-border share-quote">
                <img id="invoice-share-button" className="header-icons" src={Icons.share} alt="share Icon" onClick={() => setShowSharePopup(true)} />
                {invoiceSharedCount > 0 && (
                  <div className="count">{invoiceSharedCount}</div>
                )}
                </div>
                </Tooltip>
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
                  <img id="invoice-print-button" className="header-icons" src={Icons.print_bordered}  onClick={() => onPdfPrint()} alt="print Icon" />
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
                    <img id="invoice-download-pdf-button" className="header-icons" src={Icons.download_bordered} onClick={() => onPdfClick()} disabled={downloadingPdf} alt="download Icon" />
                )}
                </div>
                  </Tooltip>
                {invoiceDetails?.isTaxInvoice === false && (
                  <div className="tech-view-edit-btn-container">
                    <Link to={`/app/finance-management/edit/${id}`}>
                      <button id="invoice-edit-button" className="button quote-button tech-view-edit-btn form-button quote-detail-btn">
                        <img src={Icons.pencil_simple_line} alt="Edit Invoice" />
                        <span>Edit Invoice</span>
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="quote-detail">
              <div className="header">
                <div className="logo-container">
                  {invoiceDetails && invoiceDetails.vendorLogo ? (
                    <img
                      src={"data:image/png;base64," + invoiceDetails.vendorLogo}
                      alt="logo"
                      className="company-logo"
                    />
                  ) : (
                    <img
                      src={Icons.part_default_img}
                      alt="logo"
                      className="company-logo"
                    />
                  )}
                </div>
                <div className="company-info">
                  <p className="quote-title-header">
                    {invoiceDetails?.isTaxInvoice ? "INVOICE" : "PROFORMA INVOICE"}
                  </p>
                  <div className="company-details">
                    {invoiceDetails && invoiceDetails.vendorBusinessName&&
                    invoiceDetails.vendorBusinessName?.toLowerCase()!=='n/a'&&
                    <p className="strong">
                      {invoiceDetails && invoiceDetails.vendorBusinessName
                        ? invoiceDetails.vendorBusinessName
                        : "-"}
                    </p>
                    }
                    {
                      invoiceDetails && invoiceDetails.vendorAddress&&
                      invoiceDetails.vendorAddress?.toLowerCase()!=='n/a'&&
                    <p>
                      {invoiceDetails && invoiceDetails.vendorAddress
                        ? invoiceDetails.vendorAddress
                        : "-"}
                    </p>
                    }
                    {
                      invoiceDetails&&invoiceDetails?.vendorContactNumber&&
                      invoiceDetails?.vendorContactNumber?.toLowerCase()!=='n/a'&&
                    <p>
                      {invoiceDetails?.vendorContactNumber ? (
                        <a href={`tel:${invoiceDetails.vendorContactNumber}`}>
                          {formatPhoneNumber(invoiceDetails.vendorContactNumber)}
                        </a>
                      ) : (
                        "-"
                      )}
                    </p>
                    }
                    {
                      invoiceDetails && invoiceDetails.vendorBusinessEmail&&
                      invoiceDetails.vendorBusinessEmail?.toLowerCase()!=='n/a'&&
                    <p>
                      {invoiceDetails && invoiceDetails.vendorBusinessEmail
                        ? invoiceDetails.vendorBusinessEmail
                        : "-"}
                    </p>
                    }
                    
                    {
                      invoiceDetails&&invoiceDetails?.vendorBusinessWebsite&&
                      invoiceDetails?.vendorBusinessWebsite?.toLowerCase()!=='n/a'&&
                    <p className="breakable-url">
                      {invoiceDetails?.vendorBusinessWebsite ? (
                        <a
                          href={
                            invoiceDetails.vendorBusinessWebsite.startsWith("http")
                              ? invoiceDetails.vendorBusinessWebsite
                              : `https://${invoiceDetails.vendorBusinessWebsite}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {invoiceDetails.vendorBusinessWebsite}
                        </a>
                      ) : (
                        "-"
                      )}
                    </p>
                    }
                    {invoiceDetails&&invoiceDetails?.vatRegNumber &&invoiceDetails?.vatRegNumber?.toLowerCase()!=='n/a'&& (
                      <p>VAT Reg Number: {invoiceDetails.vatRegNumber}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="quote-main-section">
                <div className="quote-left-section">
                  <div className="quote-to-section">
                    <p className="section-label">Invoice To</p>
                    {
                      invoiceDetails?.quoteType==='INSURANCE_QUOTE'&&
                       <p>
                      {invoiceDetails && invoiceDetails.insuranceName
                        ? invoiceDetails.insuranceName
                        : "-"}
                    </p>
                    }
                    {
                      invoiceDetails?.quoteType !== 'INSURANCE_QUOTE' &&
                    <>
                   {invoiceDetails && invoiceDetails?.customerName&&invoiceDetails?.customerName?.toLowerCase()!=='n/a'&& <p>
                      {invoiceDetails && invoiceDetails.customerName
                        ? invoiceDetails.customerName
                        : "-"}
                    </p>}
                   {invoiceDetails && invoiceDetails?.customerAddress&&
                   invoiceDetails?.customerAddress?.toLowerCase()!=='n/a'&& <p>
                      {invoiceDetails && invoiceDetails.customerAddress
                        ? invoiceDetails.customerAddress
                        : "-"}
                    </p>}
                  { invoiceDetails && invoiceDetails?.customerContactNumber&&
                  invoiceDetails?.customerContactNumber?.toLowerCase()!=='n/a'&&
                   <p>
                      {invoiceDetails && invoiceDetails.customerContactNumber
                        ? invoiceDetails.customerContactNumber
                        : "-"}
                    </p>}
                
                      {invoiceDetails?.customerVatNumber
                        && invoiceDetails.customerVatNumber.toLowerCase() !== 'n/a'
                        && invoiceDetails.customerVatNumber.trim() !== '-'
                        && (
                          <p>CX VAT Number : {invoiceDetails.customerVatNumber}</p>
                        )
                      }
                    </>
                    }
                  </div>
                  <div className="quote-divider"></div>
                  
                  { invoiceDetails.quoteType==='INSURANCE_QUOTE'&&
                    <>
                      <div className="quote-to-section">
                    <p className="section-label">CC</p>
                   {invoiceDetails && invoiceDetails?.customerName&& <p>
                      {invoiceDetails && invoiceDetails.customerName
                        ? invoiceDetails.customerName
                        : "-"}
                    </p>}
                   {invoiceDetails && invoiceDetails?.customerAddress&& <p>
                      {invoiceDetails && invoiceDetails.customerAddress
                        ? invoiceDetails.customerAddress
                        : "-"}
                    </p>}
                    {invoiceDetails && invoiceDetails.customerContactNumber&&<p>
                      {invoiceDetails && invoiceDetails.customerContactNumber
                        ? invoiceDetails.customerContactNumber
                        : "-"}
                    </p>}
                    {invoiceDetails?.customerVatNumber
                      && invoiceDetails.customerVatNumber.toLowerCase() !== 'n/a'
                      && invoiceDetails.customerVatNumber.trim() !== '-'
                      && (
                        <p>CX VAT Number : {invoiceDetails.customerVatNumber}</p>
                      )
                    }
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
                        {invoiceDetails && invoiceDetails.vehicleMakeModel
                          ? invoiceDetails.vehicleMakeModel
                          : "-"}
                      </span>
                    </div>
                    <div className="vehicle-detail-row">
                      <span className="vehicle-label">Reg No</span>
                      <span className="vehicle-separator">:</span>
                      <span className="vehicle-value">
                        {invoiceDetails && invoiceDetails.vegRegNum
                          ? invoiceDetails.vegRegNum
                          : "-"}
                      </span>
                    </div>
                    {
                     invoiceDetails&&invoiceDetails?.serviceCategoryListDto&& invoiceDetails?.serviceCategoryListDto?.length > 0&&
                    <div className="vehicle-detail-row">
                      <span className="vehicle-label">Mileage</span>
                      <span className="vehicle-separator">:</span>
                      <span className="vehicle-value">
                        {invoiceDetails && invoiceDetails.mileageUnit
                          ? invoiceDetails.mileageUnit
                          : "-"}
                      </span>
                    </div>
                    }
                  </div>
                </div>
                <div className="quote-right-section">
                  <div className="quote-details-right">
                    <div className="quote-detail-row">
                      <div className="quote-detail-label-main">
                        <span className="quote-detail-label">Invoice ID</span>
                        <span className="quote-detail-separator">:</span>
                      </div>
                      <span className="quote-detail-value">
                        {invoiceDetails && invoiceDetails.invoiceId
                          ? invoiceDetails.invoiceId
                          : "-"}
                      </span>
                    </div>
                    <div className="quote-detail-row">
                      <div className="quote-detail-label-main">
                        <span className="quote-detail-label">Created Date</span>
                        <span className="quote-detail-separator">:</span>
                      </div>
                      <span className="quote-detail-value">
                        {invoiceDetails && invoiceDetails.invoiceCreatedDate
                          ? invoiceDetails.invoiceCreatedDate
                          : "-"}
                      </span>
                    </div>
                    <div className="quote-detail-row">
                      <div className="quote-detail-label-main">
                        <span className="quote-detail-label">Due Date</span>
                        <span className="quote-detail-separator">:</span>
                      </div>
                      <span className="quote-detail-value">
                        {invoiceDetails &&
                        invoiceDetails.invoiceDueDate &&
                        invoiceDetails.invoiceDueDate !== "null"
                          ? invoiceDetails.invoiceDueDate
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {invoiceDetails?.isTaxInvoice && (
                <div className="watermark">
                  <img src={paid_stamp} alt="Paid Watermark" />
                </div>
              )}
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
                      
                      const allItems = [];
                      
                      // Collect parts
                      if (invoiceDetails?.partCategoryListDto?.length > 0) {
                        invoiceDetails?.partCategoryListDto?.flatMap(category => category.quotePartsDtoList|| []).forEach((item) => {
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
                      if (invoiceDetails?.serviceCategoryListDto?.length > 0) {
                        invoiceDetails.serviceCategoryListDto.flatMap(category => category.quoteServicesDtos || []).forEach((item) => {
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
                      
                      // Assign sequential item numbers and group by category
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
                                {item.type === 'part' ? (item?.variants?(item?.variants+' ')+item.partsName:item?.partsName) : (item?.variants?(item?.variants+' ')+item?.serviceName:item?.serviceName)}
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

              <div className="invoice-summary-section">
                <div className="invoice-thanks-section">
                  <div className="invoice-thanks-content">
                    <p className="invoice-thanks-title">THANKS FOR YOUR BUSINESS!</p>
                    <p className="invoice-thanks-message">
                      Thank you for trusting us with your vehicle's parts and services. We appreciate your business and look forward to serving you again!
                    </p>
                  </div>
                  <div className="invoice-signature-section">
                    <div className="invoice-signature-line"></div>
                    <p className="invoice-signature-label">Signature</p>
                  </div>
                </div>
                <div className="invoice-summary-right">
                  <div className="invoice-summary-box">
                    <div className="invoice-summary-row">
                      <span className="invoice-summary-label">SUBTOTAL (Rs.)</span>
                      <span className="invoice-summary-value">
                        {subtotal.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="invoice-summary-row">
                      <span className="invoice-summary-label">
                        DISCOUNT
                        {invoiceDetails?.invoiceIsPercent && (
                          <span className="invoice-summary-percent"> ({invoiceDetails?.invoiceDiscount || 0}%)</span>
                        )}
                      </span>
                      <span className="invoice-summary-value">
                        {invoiceDetails?.invoiceIsPercent
                          ? `- ${(
                              ((parseFloat(invoiceDetails?.invoiceDiscount) || 0) / 100) *
                              (subtotal || 0)
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : `- ${(parseFloat(invoiceDetails?.invoiceDiscount) || 0).toFixed(2)}`}
                      </span>
                    </div>
                    <div className="invoice-summary-row">
                      <span className="invoice-summary-label">
                        TAX
                        <span className="invoice-summary-percent"> ({invoiceDetails?.invoiceTax || 0}%)</span>
                      </span>
                      <span className="invoice-summary-value">
                        {Tax !== "-" ? `+ ${Tax.trim()}` : Tax}
                      </span>
                    </div>
                    <div className="invoice-summary-row invoice-summary-final">
                      <span className="invoice-summary-label-final">FINAL TOTAL (Rs.)</span>
                      <span className="invoice-summary-value-final">
                        {finalAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                  {invoiceDetails && invoiceDetails.isTaxInvoice === false && (
                    <div className="invoice-summary-box invoice-summary-box-payment">
                      <div className="invoice-summary-row">
                        <span className="invoice-summary-label">AMOUNT PAID (Rs.)</span>
                        <span className="invoice-summary-value">
                          {invoiceDetails?.amountPaid || "0.00"}
                        </span>
                      </div>
                      <div className="invoice-summary-row invoice-summary-final">
                        <span className="invoice-summary-label-final">REMAINING AMOUNT (Rs.)</span>
                        <span className="invoice-summary-value-final">
                          {invoiceDetails?.remainingAmount || "0.00"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="footer">
                <p className="copy-right">
                  Copyrights&copy;
                  {invoiceDetails && invoiceDetails.invoiceCreatedDate
                    ? new Date(invoiceDetails.invoiceCreatedDate).getFullYear()
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
              title="Share Invoice with Client"
              subtext={<>Do you want to send this invoice <br /> to the client?</>}
              yestBtnTxt="Yes, Send Now"
              noBtnTxt="No"
              loading={isShareLoading}
              isConfirmDisabled={isShareLoading}
              className="share-invoice-modal"
            />
          )}
        </>
      )}
    </MasterLayout>
  );
};

export default InvoiceDetails;
