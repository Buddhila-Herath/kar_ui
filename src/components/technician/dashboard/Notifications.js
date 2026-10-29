import React, { useState } from "react";
import profile_avatar from "../../assets/images/empty-profile-picture.svg";
import Icons from "../../utils/icons";

const notifications = [
  {
    id: 1,
    message: "Vendor John Doe made changes to their...",
    time: "5min ago",
    unread: true,
  },
  {
    id: 2,
    message: "Vendor John Doe made changes to their...",
    time: "1hr 5min ago",
    unread: false,
  },
  {
    id: 3,
    message: "Vendor John Doe made changes to their...",
    time: "1hr 5min ago",
    unread: true,
  },
  {
    id: 4,
    message: "Vendor John Doe made changes to their...",
    time: "Oct 18, 2024 | 10:00 am",
    unread: true,
  },
  {
    id: 5,
    message: "Vendor John Doe made changes to their...",
    time: "Oct 18, 2024 | 15:00 pm",
    unread: true,
  },
];

const Notifications = () => {
  const [isVisible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="notifications-container" id="technician-notifications-container">
      <div className="notify-start" id="technician-notifications-header">
        <h2 className="notify-heading" id="technician-notifications-title">Notifications</h2>
        <img
          src={Icons.close_icon}
          className="close-button"
          id="technician-notifications-close"
          onClick={handleClose}
          alt="Close"
        />
      </div>
      <header className="notifications-header" id="technician-notifications-filter-header">
        <nav className="notifi-filter" id="technician-notifications-filter">
          <span className="active" id="technician-notifications-all">All</span>
          <span className="stroke" id="technician-notifications-separator">|</span>
          <span id="technician-notifications-unread">Unread (12)</span>
        </nav>
        <div className="mark-all-read" id="technician-notifications-mark-all-read">
          <a id="technician-notifications-mark-all-read-link">
            <img src={Icons.dubble_check} alt="Mark all read" id="technician-notifications-mark-all-read-icon" />
            Mark all as read
          </a>
        </div>
      </header>

      <div className="notifications-list" id="technician-notifications-list">
        <h3 id="technician-notifications-today-title">Today</h3>
        {notifications.slice(0, 3).map((notification) => (
          <div
            key={notification.id}
            id={`technician-notification-item-${notification.id}`}
            className={`notification-item ${
              notification.unread ? "unread" : ""
            }`}
          >
            <img src={profile_avatar} alt="Profile" id={`technician-notification-avatar-${notification.id}`} />
            <div className="notification-content" id={`technician-notification-content-${notification.id}`}>
              <p id={`technician-notification-message-${notification.id}`}>{notification.message}</p>
              <span className="notification-time" id={`technician-notification-time-${notification.id}`}>{notification.time}</span>
            </div>
            {notification.unread && <div className="unread-dot" id={`technician-notification-unread-dot-${notification.id}`}></div>}
          </div>
        ))}

        <h3 id="technician-notifications-yesterday-title">Yesterday</h3>
        {notifications.slice(3).map((notification) => (
          <div
            key={notification.id}
            id={`technician-notification-item-${notification.id}`}
            className={`notification-item ${
              notification.unread ? "unread" : ""
            }`}
          >
            <img src={profile_avatar} alt="Profile" id={`technician-notification-avatar-${notification.id}`} />
            <div className="notification-content" id={`technician-notification-content-${notification.id}`}>
              <p id={`technician-notification-message-${notification.id}`}>{notification.message}</p>
              <span className="notification-time" id={`technician-notification-time-${notification.id}`}>{notification.time}</span>
            </div>
            {notification.unread && <div className="unread-dot" id={`technician-notification-unread-dot-${notification.id}`}></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
