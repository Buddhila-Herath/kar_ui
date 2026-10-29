import { useEffect, useMemo, useState } from "react";
import Icons from "../../utils/icons";
import NotificationCard from "./notificationCard";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDeleteNotificationList,
  fetchMarkAllReadNotification,
  fetchMarkSingleNotificationRead,
  selectGetNotificationList,
  selectGetNotificationListLoading,
  selectMarkAllReadNotification,
  selectMarkSingleNotificationRead,
  selectNotificationDelete,
} from "../../slices/admin/adminDashBoardDataSlice";
import Spinner from "../../shared/components/loaders/Spinner";
import { notification } from "antd";

const Notifications = () => {
  const dispath = useDispatch();
  const userGetAllNotifications = useSelector(selectGetNotificationList);

  const getAllNotificationLoading = useSelector(
    selectGetNotificationListLoading
  );

  // Mark Single Notification Read success
  const { markSingleNotificationReadSuccess } = useSelector(
    (state) => state.adminDashBoardData
  );
  const markSingleNotificationReadData = useSelector(selectMarkSingleNotificationRead);

  // Mark All Read Notification success
  const { markAllReadNotificationSuccess } = useSelector(
    (state) => state.adminDashBoardData
  );
  const markAllReadNotificationData = useSelector(selectMarkAllReadNotification);
  
  const { deleteNotificationSuccess } = useSelector(
    (state) => state.adminDashBoardData
  );
  const deleteNotification = useSelector(selectNotificationDelete);  

  // const { notifications } = useSelector((state) => state.adminDashBoardData);
  const [isVisible, setVisible] = useState(true);
  const [selectTab, setSelectTab] = useState("all");
  const [notificationsState, setNotificationsState] = useState(
    userGetAllNotifications
  );  

  // Changes in notification state
  useEffect(() => {
    setNotificationsState(userGetAllNotifications);
  }, [userGetAllNotifications]);

  // Filter notifications based on the selected tab
  const filteredNotifications = useMemo(() => {
    if (selectTab === "all") {
      return notificationsState;
    }
    if (selectTab === "unread") {
      // Filter each group's notifications for unread
      return notificationsState
        .map((group) => ({
          ...group,
          latestNotificationDtoList: (
            group.latestNotificationDtoList || []
          ).filter((n) => !n.isRead),
        }))
        .filter((group) => group.latestNotificationDtoList.length > 0); // Remove empty groups
    }
    return notificationsState;
  }, [selectTab, notificationsState]);
  // ------

  // Today -----
  const todayNotifications = useMemo(() => {
    return filteredNotifications.filter(
      (n) => (n.day || "").toLowerCase() === "today"
    );
  }, [filteredNotifications]);

  const getTodayNotificationFilter = useMemo(() => {
    return todayNotifications.flatMap(
      (group) => group.latestNotificationDtoList || []
    );
  }, [todayNotifications]);
  // --------

  // Yesterday -----
  const yesterdayNotifications = useMemo(() => {
    return filteredNotifications.filter(
      (n) => (n.day || "").toLowerCase() === "yesterday"
    );
  }, [filteredNotifications]);

  const getYesterdayNotificationFilter = useMemo(() => {
    return yesterdayNotifications.flatMap(
      (group) => group.latestNotificationDtoList || []
    );
  }, [yesterdayNotifications]);
  // ------

  // Earlier -----
  const earlierNotifications = useMemo(() => {
    return filteredNotifications.filter((n) => {
      const day = (n.day || "").toLowerCase();
      return day !== "today" && day !== "yesterday";
    });
  }, [filteredNotifications]);

  const getEarlierNotificationFilter = useMemo(() => {
    return earlierNotifications.flatMap(
      (group) => group.latestNotificationDtoList || []
    );
  }, [earlierNotifications]);
  // ------

  const handleTabClick = (tab) => {
    setSelectTab(tab);
    // Optional: trigger filtering here
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleMarkAllRead = () => {
    dispath(fetchMarkAllReadNotification());
  };

  const isEmpty =
    getTodayNotificationFilter.length === 0 &&
    getYesterdayNotificationFilter.length === 0 &&
    getEarlierNotificationFilter.length === 0;

  // Display success notification Mark Single Notification Read
  // useEffect(() => {
  //   if (markSingleNotificationReadSuccess) {
  //     notification.success({
  //       message: `${markSingleNotificationReadData?.message}`,
  //       icon: <img src={Icons.check} alt="Success" />,
  //       duration: 5,
  //     });
  //   }
  // }, [markSingleNotificationReadSuccess, markSingleNotificationReadData?.message]);

  // Display success notification Mark All Read Notification
  // useEffect(() => {
  //   if (markAllReadNotificationSuccess) {
  //     notification.success({
  //       message: `${markAllReadNotificationData?.message}`,
  //       icon: <img src={Icons.check} alt="Success" />,
  //       duration: 5,
  //     });
  //   }
  // }, [markAllReadNotificationSuccess, markAllReadNotificationData?.message]);

  // Display success notification Delete Notification
  // useEffect(() => {
  //   if (deleteNotificationSuccess) {
  //     notification.success({
  //       message: `${deleteNotification?.message}`,
  //       icon: <img src={Icons.check} alt="Success" />,
  //       duration: 5,
  //     });
  //   }
  // }, [deleteNotificationSuccess, deleteNotification?.message]);

  if (!isVisible) return null;

  return (
    // <div className="notifications-popup">
    <div className="notifications-container notification-wrapper">
      {/*  */}
      <div className="notify-start">
        <h2 className="notify-heading">Notifications</h2>
        <div className="close-button-container">
          <img
            src={Icons.close_icon}
            className="close-button"
            onClick={handleClose}
            alt="Close-button"
          />
        </div>
      </div>
      {/*  */}
      <div className="notifications-header">
        <div className="notifi-filter">
          <span
            className={`all-tab ${selectTab === "all" ? "active" : ""}`}
            onClick={() => handleTabClick("all")}
          >
            {" "}
            All{" "}
          </span>
          <span className="stroke">|</span>
          <span
            className={`unread-tab ${selectTab === "unread" ? "active" : ""}`}
            onClick={() => handleTabClick("unread")}
          >
            Unread
          </span>
        </div>
        {/*  */}
        <div className="mark-all-read" onClick={handleMarkAllRead}>
          {(getTodayNotificationFilter.length > 0 ||
            getYesterdayNotificationFilter.length > 0 ||
            getEarlierNotificationFilter.length > 0 ) && (
              <a>
                <img src={Icons.dubble_check} alt="Mark all read" />
                Mark all as read
              </a>
            )}
        </div>
      </div>

      <div className="notifications-list">
        {/* Loading */}
        {getAllNotificationLoading ? (
          <div className="loading-spinner">
            <Spinner />
          </div>
        ) : isEmpty ? (
          <div className="empty-notification-wrapper">
            <div className="empty-notification-text-wrapper">
              <div className="empty-notification-icon-wrapper">
                <img
                  src={Icons.emptyNotificationIcon}
                  alt="No notifications"
                  className="empty-notification-icon"
                />
              </div>
              <span className="empty-notification-text-heading">
                No notifications available
              </span>
              <span className="empty-notification-text">
                Notifications will appear here as soon as there’s something new.
              </span>
            </div>
          </div>
        ) : (
          <>
            {getTodayNotificationFilter.length > 0 && (
              <>
                <div className="list-header-row-wrapper">
                  <h3 className="title-heading">Today</h3>
                  <div className="horizontal-line" />
                </div>
                <div className="notification-list-box-data">
                  {getTodayNotificationFilter.map((notification) => (
                    <NotificationCard
                      notification={notification}
                      key={notification.id}
                      onClickRead={(id) => {
                        dispath(fetchMarkSingleNotificationRead(id));
                        console.log("Mark Single Notification ID:", id);
                      }}
                      handleDeleteNotification={(id) => {
                        dispath(fetchDeleteNotificationList(id));
                        console.log("Delete Notification ID:", id);
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {getYesterdayNotificationFilter.length > 0 && (
              <>
                <div className="list-header-row-wrapper">
                  <h3 className="title-heading">Yesterday</h3>
                  <div className="horizontal-line" />
                </div>
                <div className="notification-list-box-data">
                  {getYesterdayNotificationFilter.map((notification) => (
                    <NotificationCard
                      notification={notification}
                      key={notification.id}
                      onClickRead={(id) => {
                        dispath(fetchMarkSingleNotificationRead(id));
                        console.log("Mark Single Notification ID:", id);
                      }}
                      handleDeleteNotification={(id) => {
                        dispath(fetchDeleteNotificationList(id));
                        console.log("Delete Notification ID:", id);
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {getEarlierNotificationFilter.length > 0 && (
              <>
                <div className="list-header-row-wrapper">
                  <h3 className="title-heading">Earlier</h3>
                  <div className="horizontal-line" />
                </div>
                <div className="notification-list-box-data">
                  {getEarlierNotificationFilter?.map((notification) => (
                    <NotificationCard
                      notification={notification}
                      key={notification.id}
                      onClickRead={(id) => {
                        dispath(fetchMarkSingleNotificationRead(id));
                        console.log("Mark Single Notification ID:", id);
                      }}
                      handleDeleteNotification={(id) => {
                        dispath(fetchDeleteNotificationList(id));
                        console.log("Delete Notification ID:", id);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
    // </div>
  );
};

export default Notifications;
