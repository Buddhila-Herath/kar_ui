import React, { useState } from "react";
import Icons from "../../utils/icons";
import { Tooltip } from "antd";

const NotificationCard = (props) => {
  const { notification, onClickRead, handleDeleteNotification } = props;

  const [isClicked, setIsClicked] = useState(false); // State to track if notification is clicked

  const handleClick = () => {
    setIsClicked(!isClicked); // Toggle the clicked state
  };

  const extractField = (key) => {
    return notification?.notificationHeadValuesDtoList?.find(
      (item) => item.heading.toLowerCase() === key.toLowerCase()
    )?.values;
  };

  const partName = extractField("PartName");
  const quantity = parseFloat(extractField("Quantity") || "0");
  const vendorName = extractField("VendorName");
  const partIdentifier = extractField("PartIdentifier");
  const rateCardName = extractField("RateCardName");
  const serviceName = extractField("UpdateServiceName");
  const serviceNameVendor =
    extractField("UpdateServiceNameVendor") || extractField("ServiceNameVendor");
  const deleteService = extractField("DeleteServiceName");
  const sparePartName = extractField("UpdatePartName");
  const deleteSparePart = extractField("DeletePartName");
  const productNameVendor =
    extractField("ProductNameVendor");

  const getStockStatus = () => {
    if (vendorName) return "inactiveVendor"; // highest priority
    if (serviceName) return "serviceUpdate";
    if (serviceNameVendor) return "serviceUpdate";
    if (deleteService) return "serviceDelete";
    if (rateCardName) return "rateCardUpdate";
    if (sparePartName) return "sparePartUpdate";
    if (productNameVendor) return "sparePartUpdate";
    if (deleteSparePart) return "sparePartDelete";
    if (!isNaN(quantity)) {
      if (quantity === 0) return "outOfStock";
      if (quantity > 0) return "lowStock";
    }
    return "none";
  };

  const stockStatus = getStockStatus();

  const getNotificationIcon = () => {
    if (stockStatus === "outOfStock") return Icons?.outOfStockIcon;
    if (stockStatus === "lowStock") return Icons?.lawOfstockIcon;
    if (stockStatus === "inactiveVendor") return Icons?.inActiveIcon;
    if (stockStatus === "serviceUpdate") return Icons?.edit_icon;
    if (stockStatus === "serviceDelete") return Icons?.deleteIcon;
    if (stockStatus === "rateCardUpdate") return Icons?.edit_icon;
    if (stockStatus === "sparePartDelete") return Icons?.deleteIcon;
    if (stockStatus === "sparePartUpdate") return Icons?.edit_icon;
  };

  const renderMessage = () => {
    const stockStatus = getStockStatus();

    if (stockStatus === "outOfStock") {
      return (
        <div>
          Spare part{" "}
          <span
            style={{ color: "#183571", fontWeight: "700", fontSize: "12px", wordBreak: "break-all" }}
          >
            {partIdentifier}
          </span>{" "}
          is out of stock.
        </div>
      );
    } else if (stockStatus === "lowStock") {
      return (
        <div>
          Spare part{" "}
          <span
            style={{ color: "#183571", fontWeight: "700", fontSize: "12px", wordBreak: "break-all" }}
          >
            {partName}
          </span>{" "}
          is low on stock:{" "}
          <span
            style={{ color: "#183571", fontWeight: "700", fontSize: "12px", wordBreak: "break-all" }}
          >
            {quantity}
          </span>{" "}
          left.
        </div>
      );
    } else if (stockStatus === "inactiveVendor") {
      return (
        <>
          Vendor{" "}
          <span
            style={{ color: "#183571", fontWeight: "700", fontSize: "12px",  wordBreak: "break-all" }}
          >
            {vendorName}
          </span>{" "}
          has been marked as Inactive.
        </>
      );
    } else if (rateCardName) {
      return (
        <>
          Rate card values of{' '}
          <span
            style={{ color: '#183571', fontWeight: '700', fontSize: '12px', wordBreak: "break-all" }}
          >
            {rateCardName}
          </span>{' '}
          have been updated by the admin.
        </>
      );
    } else if (serviceNameVendor) {
      return (
        <>
          Service{' '}
          <span
            style={{ color: '#183571', fontWeight: '700', fontSize: '12px', wordBreak: "break-all" }}
          >
            {serviceNameVendor}
          </span>{' '}
          has been modified .
        </>
      );
    } else if (serviceName) { 
      return (
        <>
          Service{' '}
          <span
            style={{ color: '#183571', fontWeight: '700', fontSize: '12px', wordBreak: "break-all" }}
          >
            {serviceName}
          </span>{' '}
          has been modified by the admin.
        </>
      );
    } else if (productNameVendor) {
      return (
        <>
          Spare part{' '}
          <span
            style={{ color: '#183571', fontWeight: '700', fontSize: '12px', wordBreak: "break-all" }}
          >
            {productNameVendor}
          </span>{' '}
          has been modified .
        </>
      );
    } else if (deleteService) { 
      return (
        <>
          Service{' '}
          <span
            style={{ color: '#183571', fontWeight: '700', fontSize: '12px', wordBreak: "break-all" }}
          >
            {deleteService}
          </span>{' '}
          has been deleted from the system by the admin.
        </>
      );
    } else if (sparePartName) {
      return (
        <>
          Spare part{' '}
          <span
            style={{ color: '#183571', fontWeight: '700', fontSize: '12px', wordBreak: "break-all" }}
          >
            {sparePartName}
          </span>{' '}
          has been modified by the admin.
        </>
      );
    } else if (deleteSparePart) {
      return (
        <>
          Spare part{' '}
          <span
            style={{ color: '#183571', fontWeight: '700', fontSize: '12px', wordBreak: "break-all" }}
          >
            {deleteSparePart}
          </span>{' '}
          has been deleted from the system by the admin.
        </>
      );
    } 
    return notification?.message;
  };

  // Rename this function to avoid conflict with the prop
  const onDeleteNotification = (id) => {
    if (handleDeleteNotification) {
      handleDeleteNotification(id);
    }
  };

  const onMarkSingleClickRead = (id) => {
    if (onClickRead) {
      onClickRead(id);
      console.log("Notification ID:", id);
    }
  };

  return (
    <div
      className={`notification-item ${notification.isRead ? "isRead" : ""}`}
      style={{
        background: notification?.isRead ? "#F8F8FF" : "#ECF1FF",
      }}
      // onClick={handleClick}
      onClick={() => {
        if(!notification.isRead) {
          onMarkSingleClickRead(notification.id);
        }
      }}
    >
      <div className="main-row-wrapper">
        <div className="notification-circle-wrapper">
          <img
            src={getNotificationIcon(notification?.status)}
            alt="Profile"
            className="filter-icon-style"
          />
        </div>

        <div className="notification-content">
          <p>{renderMessage()}</p>
          {/*  */}
        </div>
      </div>
      {/*  */}

      <div className="dot">
        {/* Only show unread dot if not read */}
        {!notification.isRead && <div className="unread-dot"></div>}
          <span className="notification-time-today">
            {notification?.createdDateTime}
          </span>
      </div>
      {/* </div> */}

      {/* Show hover action only if read */}
      <div
        className="hover-container"
        style={{
          background: notification?.isRead
            ? "linear-gradient(to bottom, rgba(248, 248, 255, 1), rgba(248, 248, 255, 0.3))"
            : "linear-gradient(to bottom, rgba(236, 241, 255, 1), rgba(236, 241, 255, 0.3))",
        }}
      >
        <div
          className="outborder-container envelope-wrapper"
          style={{
            background: notification?.isRead ? "#F8F8FF" : "#ECF1FF",
          }}
        >
          <Tooltip
            trigger={["hover"]}
            className="custom-tooltip service-name-tooltip"
            overlayClassName={
              notification?.isRead
                ? "custom-arrow-1 mark-as-unread-tooltip"
                : "custom-arrow-1 mark-as-read-tooltip"
            }
            color="#E0EBFF"
            title={
              <div className="tooltip-content notification-tooltip-div">
                <span className="badge">
                  {notification?.isRead ? "Mark as Unread" : "Mark as Read"}
                </span>
              </div>
            }
            placement="bottomRight"
            onClick={() => {
              if (notification?.isRead) {
                onMarkSingleClickRead(notification.id);
              } 
            }}
            style={{ cursor: notification.isRead ? "pointer" : "default" }}
          >
            <img
              src={
                notification?.isRead
                  ? Icons?.envelopeIcon
                  : Icons?.envelopeOpenIcon
              }
              alt="Envelope"
              className="action-icon"
            />
          </Tooltip>
        </div>

        <div 
          className="outborder-container"
          onClick={() => {
            onDeleteNotification(notification.id);
          }}
        >
          <Tooltip
            trigger={["hover"]}
            className="custom-tooltip service-name-tooltip"
            color="#E0EBFF"
            overlayClassName="custom-arrow-2"
            title={
              <div className="tooltip-content notification-tooltip-div">
                <span className="badge">Delete Notifications</span>
              </div>
            }
            placement="bottomRight"
          >
            <img src={Icons?.deleteIcon} alt="Delete" className="action-icon" />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
