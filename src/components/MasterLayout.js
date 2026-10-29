import React, { useState, useEffect, useRef } from "react";
import { Layout } from "antd";
import Sidebar from "./sidebar/Sidebar";
import VendorSidebar from "./sidebar/VendorSidebar";
import TechnicianSidebar from "./sidebar/TechnicianSidebar";
import MainHeader from "./header/MainHeader";
import EmailUpdateNotificationMoal from "../shared/components/EmailUpdateNotificationMoal";
import { Tokens, apiBaseURL } from '../constants/index';
import { isAdminPortal, isTechnicianPortal } from '../utils/portalUtils';
import { getConfig } from '../config/service';
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const { Sider, Content } = Layout;

const MasterLayout = (props) => {
  const { children } = props;

  // Cookie helpers
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  };
  const setCookie = (name, value, days = 30) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  };

  const [collapsed, setCollapsed] = useState(() => {
    const saved = typeof document !== 'undefined' ? getCookie('sidebarCollapsed') : null;
    return saved === 'true';
  });
  const [isSiderVisible, setIsSiderVisible] = useState(true); 
  const [showEmailUpdateModal, setShowEmailUpdateModal] = useState(false);
  const clientsRef = useRef([]);
  const reconnectingRef = useRef(false);
  
  const firstName = localStorage.getItem(Tokens.FIRST_NAME);
  const lastName = localStorage.getItem(Tokens.LAST_NAME);
  const getUserId = localStorage.getItem(Tokens.USER_ID);
  const config = getConfig();
  const apacheServer = config.apiUrl + "api/v1/";

  const toggleSider = () => {
    // If the sidebar is collapsed, open it fully
    if (collapsed) {
      setCollapsed(false);
    }
    setIsSiderVisible(!isSiderVisible);
  };

  // Persist collapsed state to cookie
  useEffect(() => {
    setCookie('sidebarCollapsed', String(collapsed));
  }, [collapsed]);

  // Attempt to reconnect a specific client cleanly
  const tryReconnect = (client) => {
    if (reconnectingRef.current || !client) return;
    reconnectingRef.current = true;
    client.deactivate().then(() => {
      client.activate();
      reconnectingRef.current = false;
    });
  };

  // WebSocket connections for email update notifications (connect to multiple endpoints)
  useEffect(() => {
    if (!getUserId) return;

    const endpoints = [
      `${apacheServer}${apiBaseURL?.GET_NOTIFICATION_LIST}`,
      `${apacheServer}${apiBaseURL?.VENDOR_EMAIL_UPDATE_NOTIFICATION}`,
    ];

    const clients = [];

    endpoints.forEach((url) => {
      const socket = new SockJS(url);
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 0,
        connectHeaders: { userId: getUserId },
        onConnect: () => {
          client.subscribe("/user/topic/logout", (response) => {
            try {
              const rawText = response.body;
              if (rawText && rawText.includes("Your email address has been updated")) {
                setShowEmailUpdateModal(true);
              } else {
                try {
                  const parsedPayload = JSON.parse(rawText);
                  if (parsedPayload.userId === getUserId && parsedPayload.type === "EMAIL_UPDATE") {
                    setShowEmailUpdateModal(true);
                  }
                } catch {
                  // Ignore if not JSON
                }
              }
            } catch (err) {
              console.error("❌ Error handling email update WebSocket message:", err);
            }
          });
        },
        onStompError: (frame) => {
          console.error("❌ Email Update STOMP error:", frame.headers["message"]);
          console.error("📄 Details:", frame.body);
        },
        onWebSocketClose: () => {
          tryReconnect(client);
        },
        onWebSocketError: (err) => {
          console.error("❌ Email Update WebSocket error:", err);
        },
      });

      client.activate();
      clients.push(client);
    });

    clientsRef.current = clients;

    return () => {
      clientsRef.current.forEach((c) => {
        if (c?.connected) {
          c.deactivate();
        }
      });
      clientsRef.current = [];
    };
  }, [getUserId, apacheServer]);

  const handleEmailUpdateModalClose = () => {
    setShowEmailUpdateModal(false);
  };

  return (
    <Layout>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed} 
        width={320}
        className={`sider ${!isSiderVisible ? "sider-visible" : ""}`}
      >
        { 
          isAdminPortal() ? (
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} toggleSider={toggleSider} />
          ) : isTechnicianPortal() ? (
            <TechnicianSidebar collapsed={collapsed} setCollapsed={setCollapsed} toggleSider={toggleSider} />
          ) : (
            <VendorSidebar collapsed={collapsed} setCollapsed={setCollapsed} toggleSider={toggleSider} />
          )
        }
      </Sider>
      <Layout>
        <MainHeader toggleSider={toggleSider} firstName={firstName} lastName={lastName} />
        <Content className="main-content">
          {children}
        </Content>
      </Layout>
      {showEmailUpdateModal && (
        <EmailUpdateNotificationMoal onClickOkModel={handleEmailUpdateModalClose} />
      )}
    </Layout>
  );
};

export default MasterLayout;
