import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Icons from "../../../utils/icons";
import profile_avatar from "../../../assets/images/empty-profile-picture.svg";
import Spinner from "../../../shared/components/loaders/Spinner";
import ImageWithLoader from "../../../shared/components/ImageWithLoader";

const RecentActivities = () => {
  const dispatch = useDispatch();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [visibleAvatarCount, setVisibleAvatarCount] = useState(6);
  const mobileAvatarsRef = useRef(null);
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Dispatch custom event to notify parent component
    window.dispatchEvent(new CustomEvent('sidebarToggle'));
  };
  const { activities = {}, isLoading, error } = useSelector(
    (state) => state.vendorRecentActivities
  );

  const toView = (item) => ({
    id: item.id,
    name: `Technician ${item.technicianName}`,
    serviceLabel: "Service:",
    serviceValue: item.serviceName,
    jobLabel: "Job Card:",
    jobValue: item.jobCardNumber,
    status: item.status,
    timestamp: item.dateTime,
    avatar: item.profilePhoto,
  });

  const getStatusClass = (status) => {
    const statusClasses = {
      Started: "status-started",
      Paused: "status-paused",
      Completed: "status-completed",
    };
    return statusClasses[status] || "status-default";
  };

  const getAvatarSrc = (avatar) => {
    return avatar ? avatar : profile_avatar;
  };

  const parseActivityName = (name) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return {
        userType: parts[0],
        userName: parts.slice(1).join(" "),
      };
    }
    return {
      userType: "",
      userName: name,
    };
  };

  const parseServiceInfo = (service) => service;

  const parseJobCardInfo = (jobCard) => jobCard;

  const isLongName = (userName) => {
    return userName && userName.length > 25;
  };

  const todayActivities = useMemo(() => {
    return Array.isArray(activities.Today)
      ? activities.Today.map(toView)
      : [];
  }, [activities]);

  const yesterdayActivities = useMemo(() => {
    return Array.isArray(activities.Yesterday)
      ? activities.Yesterday.map(toView)
      : [];
  }, [activities]);

  const earlierActivities = useMemo(() => {
    return Array.isArray(activities.Earlier)
      ? activities.Earlier.map(toView)
      : [];
  }, [activities]);

  const calculateVisibleAvatars = () => {
    if (!mobileAvatarsRef.current) return;

    const AVATAR_SIZE = 52;
    const OVERLAP_PX = 8;
    const INDICATOR_SIZE = 52;

    const containerWidth = mobileAvatarsRef.current.getBoundingClientRect().width;
    const effectiveAvatarWidth = AVATAR_SIZE - OVERLAP_PX;

    const maxVisibleWithIndicator = Math.max(
      1,
      Math.floor((containerWidth - INDICATOR_SIZE + OVERLAP_PX) / effectiveAvatarWidth)
    );

    const maxVisibleWithoutIndicator = Math.max(
      1,
      Math.floor((containerWidth + OVERLAP_PX) / effectiveAvatarWidth)
    );

    const totalActivities = (
      todayActivities.length +
      yesterdayActivities.length +
      earlierActivities.length
    );

    const needIndicator = maxVisibleWithoutIndicator < totalActivities;
    const visibleCount = needIndicator
      ? Math.max(1, Math.min(totalActivities, maxVisibleWithIndicator))
      : totalActivities;

    setVisibleAvatarCount(visibleCount);
  };

  // Calculate visible avatars on mount and resize
  useEffect(() => {
    if (isCollapsed) {
      calculateVisibleAvatars();

      const handleResize = () => calculateVisibleAvatars();
      window.addEventListener('resize', handleResize);

      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isCollapsed, todayActivities, yesterdayActivities, earlierActivities]);

  return (
    <div
      className={`recent-activities-sidebar ${
        isCollapsed ? "collapsed" : "expanded"
      }`}
    >
      <div className="sidebar-header">
        <h3>Recent Activities</h3>

        <div
          className="toggle-btn"
          onClick={toggleSidebar}
          title={
            isCollapsed
              ? "Expand Recent Activities"
              : "Collapse Recent Activities"
          }
        >
          <div className="toggle-icon">
            <img src={Icons.sidebar_toggle} alt="toggle icon" />
          </div>
        </div>
      </div>
      <div className="seperator"></div>
      <div className="sidebar-content">
        {isLoading ? (
          <Spinner />
        ) : (todayActivities.length + yesterdayActivities.length + earlierActivities.length) > 0 ? 
         (
          <>
            {isCollapsed ? (
              <div className="collapsed-avatars">
                {/* Web version */}
                <div className="web-avatars">
                  {[
                    ...todayActivities,
                    ...yesterdayActivities,
                    ...earlierActivities,
                  ]
                    .slice(0, 9)
                    .map((activity, index) => {
                      const statusClass = getStatusClass(activity.status);
                      return (
                        <React.Fragment key={activity.id}>
                          <div
                            className={`avatar-item ${statusClass}`}
                            title={activity.name}
                          >
                            <ImageWithLoader
                              src={getAvatarSrc(activity.avatar)}
                              alt={activity.name}
                              className="avatar-img"
                            />
                            <div className={`status-dot ${statusClass}`}></div>
                          </div>
                          {index < 8 && (<div className="avatar-separator"></div>)}
                        </React.Fragment>
                      );
                    })}
                </div>

                {/* Mobile version */}
                <div className="mobile-avatars" ref={mobileAvatarsRef}>
                  {[
                    ...todayActivities,
                    ...yesterdayActivities,
                    ...earlierActivities,
                  ]
                    .slice(0, visibleAvatarCount)
                    .map((activity) => {
                      const statusClass = getStatusClass(activity.status);
                      return (
                        <div
                          key={activity.id}
                          className={`avatar-item ${statusClass}`}
                          title={activity.name}
                        >
                          <ImageWithLoader
                            src={getAvatarSrc(activity.avatar)}
                            alt={activity.name}
                            className="avatar-img"
                          />
                          <div className={`status-dot ${statusClass}`}></div>
                        </div>
                      );
                    })}
                  {[
                    ...todayActivities,
                    ...yesterdayActivities,
                    ...earlierActivities,
                  ].length > visibleAvatarCount && (
                    <div className="more-activities-indicator">
                      <div className="empty-avatar">
                        +
                        {[
                          ...todayActivities,
                          ...yesterdayActivities,
                          ...earlierActivities,
                        ].length - visibleAvatarCount}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="activities-content">
                {todayActivities.length > 0 && (
                  <div className="activity-section">
                    <h4>Today</h4>
                    {todayActivities.map((activity) => (
                      <React.Fragment key={activity.id}>
                        <div className="activity-item">
                          <div className="activity-avatar">
                            <ImageWithLoader
                              src={getAvatarSrc(activity.avatar)}
                              alt={activity.name}
                            />
                          </div>
                          <div className="activity-details">
                            <div className="activity-name">
                              <span className="user-type">
                                {parseActivityName(activity.name).userType}
                              </span>
                              <span className="user-name">
                                {parseActivityName(activity.name).userName}
                              </span>
                            </div>
                            <div className="activity-service">
                              <span className="service-bullet">•</span>
                              <span className="service-label">{activity.serviceLabel}</span>
                              <span className="service-value">{activity.serviceValue}</span>
                            </div>
                            <div className="activity-job">
                              <span className="job-bullet">•</span>
                              <span className="job-label">{activity.jobLabel}</span>
                              <span className="job-value">{activity.jobValue}</span>
                            </div>
                        <div className="activity-time">{activity.timestamp}</div>
                          </div>
                          <div className={`activity-status ${isLongName(parseActivityName(activity.name).userName) ? 'long-name' : ''}`}>
                            <span
                              className={`status-badge ${getStatusClass(
                                activity.status
                              )}`}
                            >
                              {activity.status}
                            </span>
                          </div>
                        </div>
                        <div className="activity-separator"></div>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {yesterdayActivities.length > 0 && (
                  <div className="activity-section">
                    <h4>Yesterday</h4>
                    {yesterdayActivities.map((activity) => (
                      <React.Fragment key={activity.id}>
                        <div className="activity-item">
                          <div className="activity-avatar">
                            <ImageWithLoader
                              src={getAvatarSrc(activity.avatar)}
                              alt={activity.name}
                            />
                          </div>
                          <div className="activity-details">
                            <div className="activity-name">
                              <span className="user-type">
                                {parseActivityName(activity.name).userType}
                              </span>
                              <span className="user-name">
                                {parseActivityName(activity.name).userName}
                              </span>
                            </div>
                            <div className="activity-service">
                              <span className="service-bullet">•</span>
                              <span className="service-label">{activity.serviceLabel}</span>
                              <span className="service-value">{activity.serviceValue}</span>
                            </div>
                            <div className="activity-job">
                              <span className="job-bullet">•</span>
                              <span className="job-label">{activity.jobLabel}</span>
                              <span className="job-value">{activity.jobValue}</span>
                            </div>
                        <div className="activity-time">{activity.timestamp}</div>
                          </div>
                          <div className={`activity-status ${isLongName(parseActivityName(activity.name).userName) ? 'long-name' : ''}`}>
                            <span
                              className={`status-badge ${getStatusClass(
                                activity.status
                              )}`}
                            >
                              {activity.status}
                            </span>
                          </div>
                        </div>
                        <div className="activity-separator"></div>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {earlierActivities.length > 0 && (
                  <div className="activity-section">
                    <h4>Earlier</h4>
                    {earlierActivities.map((activity) => (
                      <React.Fragment key={activity.id}>
                        <div className="activity-item">
                          <div className="activity-avatar">
                            <ImageWithLoader
                              src={getAvatarSrc(activity.avatar)}
                              alt={activity.name}
                            />
                          </div>
                          <div className="activity-details">
                            <div className="activity-name">
                              <span className="user-type">
                                {parseActivityName(activity.name).userType}
                              </span>
                              <span className="user-name">
                                {parseActivityName(activity.name).userName}
                              </span>
                            </div>
                            <div className="activity-service">
                              <span className="service-bullet">•</span>
                              <span className="service-label">{activity.serviceLabel}</span>
                              <span className="service-value">{activity.serviceValue}</span>
                            </div>
                            <div className="activity-job">
                              <span className="job-bullet">•</span>
                              <span className="job-label">{activity.jobLabel}</span>
                              <span className="job-value">{activity.jobValue}</span>
                            </div>
                        <div className="activity-time">{activity.timestamp}</div>
                          </div>
                          <div className={`activity-status ${isLongName(parseActivityName(activity.name).userName) ? 'long-name' : ''}`}>
                            <span
                              className={`status-badge ${getStatusClass(
                                activity.status
                              )}`}
                            >
                              {activity.status}
                            </span>
                          </div>
                        </div>
                        <div className="activity-separator"></div>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <img src={Icons.warning_octagon} alt="No activities" />
            </div>
            <div className="empty-title">No recent activities to show</div>
            <div className="empty-description">Activities will appear here as soon as there's something new.</div>
          </div>
        )
      }
      </div>
    </div>
  );
};

export default RecentActivities;
