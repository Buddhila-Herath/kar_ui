import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Layout } from "antd";
import Icons from "../../utils/icons";
import NotificationsPopup from "../dashboard/Notifications";
import { apiBaseURL, Tokens } from "../../constants/index";
import { useDispatch, useSelector } from "react-redux";
import {
  selectGetNotificationList,
  setallNotifications,
  setAllNotificationsLoading,
} from "../../slices/admin/adminDashBoardDataSlice";
import { getConfig } from "../../config/service";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { fetchImageByPath } from "../../slices/masterDataSlice";
import ImageWithLoader from "../../shared/components/ImageWithLoader";
import NotificationSound from "../../assets/audio/notification.wav";
import { isTechnicianPortal, isVendorPortal } from "../../utils/portalUtils";
const { Header } = Layout;

const MainHeader = (props) => {
  const dispatch = useDispatch();
  const userGetAllNotifications = useSelector(selectGetNotificationList);

  const [messages, setMessages] = useState([]);
  const stompClientRef = useRef(null);
  const reconnectingRef = useRef(false);

  const config = getConfig();
  const apacheServer = config.apiUrl + "api/v1/";

  const getUserId = localStorage.getItem(Tokens.USER_ID);
  const getTechnicianId = localStorage.getItem(Tokens.TECHNICIAN_ID);

  const { toggleSider, firstName, lastName } = props;

  const [day, setDay] = useState("");
  const [weekday, setWeekday] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [time, setTime] = useState("");
  const [period, setPeriod] = useState("");
  const [isPopupVisible, setPopupVisible] = useState(false);
  const storedImage = localStorage.getItem(Tokens.IMAGE);
  const [profileImageUrl, setProfileImageUrl] = useState(
    storedImage && storedImage.trim() !== "" ? storedImage : Icons.avatar
  );

  // Keep header image in sync if another part of the app refreshes the signed URL
  useEffect(() => {
    const interval = setInterval(() => {
      const latest = localStorage.getItem(Tokens.IMAGE);
      if (latest && latest !== profileImageUrl) {
        setProfileImageUrl(latest);
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [profileImageUrl]);

  // If the signed URL expires and the image fails, fetch a fresh URL from the stored path
  const handleProfileImgError = async () => {
    try {
      const path = localStorage.getItem(Tokens.IMAGE_PATH);
      if (!path) {
        setProfileImageUrl(Icons.avatar);
        return;
      }
      const result = await dispatch(fetchImageByPath(path));
      const freshUrl = result?.payload?.url;
      if (freshUrl) {
        localStorage.setItem(Tokens.IMAGE, freshUrl);
        setProfileImageUrl(freshUrl);
      } else {
        setProfileImageUrl(Icons.avatar);
      }
    } catch (_) {
      setProfileImageUrl(Icons.avatar);
    }
  };

  const getCurrentDateAndTime = useCallback(() => {
    const date = new Date();

    const day = date.getDate().toString().padStart(2, "0");
    const weekday = date.toLocaleString("en-us", { weekday: "long" });
    const month = date
      .toLocaleString("en-us", { month: "short" })
      .toUpperCase();
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "pm" : "am";

    hours = hours % 12 || 12;
    const formattedHours = hours.toString().padStart(2, "0");

    const time = `${formattedHours}:${minutes}`;

    setDay(day);
    setWeekday(weekday);
    setMonth(month);
    setYear(year);
    setTime(time);
    setPeriod(period);
  }, []);

  useEffect(() => {
    getCurrentDateAndTime();
    const interval = setInterval(getCurrentDateAndTime, 1000);
    return () => clearInterval(interval);
  }, [getCurrentDateAndTime]);

  const togglePopup = () => {
    setPopupVisible(!isPopupVisible);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".notifications-popup") &&
        !event.target.closest(".notification-icon")
      ) {
        setPopupVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Attempt to reconnect cleanly
  const tryReconnect = () => {
    if (reconnectingRef.current || !stompClientRef.current) return;
    reconnectingRef.current = true;

    stompClientRef.current.deactivate().then(() => {
      stompClientRef.current.activate();
      reconnectingRef.current = false;
    });
  };

  // WebSocket connection and subscription
  useEffect(() => {
    const socketUrl = `${apacheServer}${apiBaseURL?.GET_NOTIFICATION_LIST}`;
    let reconnectTimeout = null;

    const socket = new SockJS(socketUrl);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 0, // no internal retry delay
      connectHeaders: {
        userId: getUserId, // Add header if required
      },
      onConnect: () => {
        dispatch(setAllNotificationsLoading(true)); // <-- Set loading true before subscribing
        stompClient.subscribe("/user/topic/notification", (response) => {
          // Step 1: Check body type
          const rawText = response.body;
          try {
            const parsedPayload = JSON.parse(rawText);
            
            // If the payload is already an array (as shown in your latest screenshot)
            // Filter by userID and flatten notifications
            const userNotifications = Array.isArray(parsedPayload)
              ? parsedPayload
                  .filter((item) => item.userID === getUserId)
                  .flatMap((item) => item || [])
              : [];

            dispatch(setallNotifications(userNotifications));

            setMessages((prev) => [...userNotifications, ...prev]);
            // Set loading to false after 1 second
            setTimeout(() => {
              dispatch(setAllNotificationsLoading(false));
            }, 2000);
          } catch (err) {
            console.error("❌ Error parsing WebSocket message:", err);
          }
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP error:", frame.headers["message"]);
        console.error("📄 Details:", frame.body);
      },
      onWebSocketClose: () => {
        tryReconnect();
      },
      onWebSocketError: (err) => {
        console.error("❌ WebSocket error:", err);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.deactivate();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [getUserId, apacheServer, dispatch]);

  useEffect(() => {
    if (!isTechnicianPortal()) {
      return; 
    }
    const socketUrl2 = `${apacheServer}${apiBaseURL?.GET_NOTIFICATION_ALERT}`;
    let reconnectTimeout = null;

    const playSound = () => {
      const audio = new Audio(NotificationSound);
      audio.play().catch((e) => console.error("Error playing sound:", e));
    };

    const socket = new SockJS(socketUrl2);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 0,
      connectHeaders: { userId: getTechnicianId },
      onConnect: () => {
        stompClient.subscribe("/user/topic/assign", (message) => {
          console.log("Technician assignment notification received:", message.body);
          playSound();
        });
      },
    });
    stompClient.activate();
    return () => {
      if (stompClient.connected) {
        stompClient.deactivate();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [getTechnicianId, apacheServer]);
  
  useEffect(() => {
    if (!isVendorPortal()) {
      return;
    }
    const socketUrl3 = `${apacheServer}${apiBaseURL?.GET_NOTIFICATION_ALERT}`;
    let reconnectTimeout = null;

    const playSound = () => {
      const audio = new Audio(NotificationSound);
      audio.play().catch((e) => console.error("Error playing sound:", e));
    };

    const socket = new SockJS(socketUrl3);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 0,
      connectHeaders: { userId: getUserId },
      onConnect: () => {
        stompClient.subscribe("/user/topic/complete", (message) => {
          console.log("Job completed notification received Vendor:", message.body);
          playSound();
        });
      },
    });
    stompClient.activate();
    return () => {
      if (stompClient.connected) {
        stompClient.deactivate();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [getUserId, apacheServer]);
  // ------

  // Memoized count of read notifications
  // In here we calculate the count of unread notifications
  const readNotificationCount = useMemo(() => {
    if (!Array.isArray(userGetAllNotifications)) return 0;

    return userGetAllNotifications.reduce((count, group) => {
      const readInGroup = (group.latestNotificationDtoList || []).filter(
        (notification) => notification.isRead === false
      ).length;
      return count + readInGroup;
    }, 0);
  }, [userGetAllNotifications]);

  return (
    <Header className="header-container">
      <div className="left-container">
        <img src={Icons.drawer} alt="drawer" onClick={toggleSider} />
        <div className="date-and-time-container">
          <img src={Icons.logo_icon} alt="logo icon" className="logo-icon" />
          <div className="date-container">
            <div className="date-sub-container">
              <span className="day">{day}</span>
              <span className="weekday">{weekday}</span>
            </div>
            <div className="date-sub-container">
              <span className="month">{month}</span>
              <span className="year">{year}</span>
            </div>
          </div>
          <div className="time-container">
            <span className="time">{time}</span>
            <span className="period">{period}</span>
          </div>
        </div>
      </div>
      <div className="profile-container">
        <div className="notification-icon" style={{ position: "relative" }}>
          <div
            style={{
              position: "relative",
              display: "inline-block",
            }}
            onClick={togglePopup}
          >
            {readNotificationCount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "-6px",
                  background: "#4A90E2",
                  color: "white",
                  width: "21px",
                  height: "21px",
                  borderRadius: "50%",
                  fontSize: "10px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 999,
                  cursor: "pointer",
                }}
              >
                {readNotificationCount > 5 ? "5+" : readNotificationCount}
              </div>
            )}
            <img src={Icons.bell_new} alt="notification icon" />
          </div>
          {isPopupVisible && (
            <div className="notifications-popup">
              <NotificationsPopup />
            </div>
          )}
        </div>
        <div className="profile-photo-container">
          <ImageWithLoader src={profileImageUrl} className="profile-photo" onError={handleProfileImgError} />
          <div className="profile-info-container">
            <span className="profile-name">{firstName + " " + lastName}</span>
          </div>
        </div>
      </div>
    </Header>
  );
};

export default MainHeader;
