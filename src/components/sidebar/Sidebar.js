import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Tooltip } from "antd";
import karstationLogoWhite from '../../assets/images/karstation-logo-white.svg';
import Icons from "../../utils/icons"
import { logout } from '../../slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';

const Sidebar = (props) => {
  const { collapsed, setCollapsed, toggleSider } = props;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [openKeys, setOpenKeys] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { allPrivilages } = useSelector((state) => state.permission);
  const scrollContainerRef = useRef(null);

  const handleCollapseClick = () => {
    if (isMobile) {
      setCollapsed(!collapsed);
      toggleSider();
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleResize = () => {
    if (window.innerWidth <= 1024) {
      setCollapsed(true);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setCollapsed]);

  // Persist and restore sidebar scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      try {
        sessionStorage.setItem("adminSidebarScrollTop", String(container.scrollTop));
      } catch (_) {}
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    try {
      const saved = sessionStorage.getItem("adminSidebarScrollTop");
      if (saved) {
        container.scrollTop = parseInt(saved, 10) || 0;
      }
    } catch (_) {}
  }, [location.pathname]);

  const getActiveKey = () => {
    if (location.pathname.includes('/admin/dashboard')) return 'dashboard';
    if (location.pathname.includes('/admin/my-profile')) return 'profile';
    if (location.pathname.includes('/admin/vendor-management')) return 'vendor-management';
    if (location.pathname.includes('/admin/spare-part-management')) return 'spare-part-management';
    if (location.pathname.includes('/admin/service-management')) return 'service-management';
    if (location.pathname.includes('/admin/rate-card-configuration')) return 'rate-card-configuration';
    if (location.pathname.includes('/admin/inventory-updates')) return 'inventory-updates';
    return '';
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const CustomTooltip = ({ title, children }) => (
    <Tooltip
      title={collapsed ? <span>{title}</span> : null}
      overlayClassName="custom-tooltip"
      placement="right"
    >
      {children}
    </Tooltip>
  );

  const onLogOut = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getMenuItems = () => {
    const menuItems = [
      {
        key: "dashboard",
        id: "dashboard-btn",
        icon: (
          <CustomTooltip title="Dashboard">
            <img
              src={Icons.dashboard_icon}
              alt="Dashboard Icon"
            />
          </CustomTooltip>
        ),
        label: "Dashboard",
        privilegetype: "admin_dashboard"
      },
      {
        key: "vendor-management",
        id: "vendor-management-btn",
        icon: (
          <CustomTooltip title="Vendor Management">
            <img
              src={Icons.users_three}
              alt="Vendor Icon"
            />
          </CustomTooltip>
        ),
        label: "Vendor Management",
        privilegetype: "vendor_management"
      },
      {
        key: "spare-part-management",
        id: "spare-part-management-btn",
        icon: (
          <CustomTooltip title="Spare Part Management">
            <img
              src={Icons.progress_wrench}
              alt="Vendor Icon"
            />
          </CustomTooltip>
        ),
        label: "Spare Part Management",
        privilegetype: "spare_part_management"
      },
      {
        key: "service-management",
        id: "service-management-btn",
        icon: (
          <CustomTooltip title="Service Management">
            <img
              src={Icons.scooter}
              alt="Service Management Icon"
            />
          </CustomTooltip>
        ),
        label: "Service Management",
        privilegetype: "service_management"
      },
      {
        key: "rate-card-configuration",
        id: "rate-card-configuration-btn",
        icon: (
          <CustomTooltip title="Rate Card Configuration">
            <img
              src={Icons.wallet}
              alt="Rate Card Icon"
            />
          </CustomTooltip>
        ),
        label: "Rate Card Configuration",
        privilegetype: "rate_card_configuration_admin"
      },
      {
        key: "inventory-updates",
        id: "inventory-updates-btn",
        icon: (
          <CustomTooltip title="Inventory Updates">
            <img
              src={Icons.inventory}
              alt="Inventory Updates Icon"
            />
          </CustomTooltip>
        ),
        label: "Inventory Updates",
        privilegetype: "admin_dashboard"
      }
    ];

    // Filter menu items based on privileges
    return menuItems.filter(item => {
      const privilege = allPrivilages?.find(p => p.privilegeType === item.privilegetype);
      return privilege?.status === true;
    });
  };

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "dashboard":
        navigate('/admin/dashboard');
        break;
      case "vendor-management":
        navigate('/admin/vendor-management');
        break;
      case "spare-part-management":
        navigate('/admin/spare-part-management');
        break;
      case "service-management":
        navigate('/admin/service-management');
        break;
      case "rate-card-configuration":
        navigate('/admin/rate-card-configuration');
        break;
      case "inventory-updates":
        navigate('/admin/inventory-updates/service');
        break;
      case "profile":
        navigate('/admin/my-profile');
        break;
      default:
        break;
    }
  };

  return (
    <div className="sidebar">
      <div className={`logo-container ${collapsed ? 'collapsed-logo-container' : ''}`}>
        {!collapsed ? <img src={karstationLogoWhite} alt='karstation logo' className='logo' /> : null}
        <div className='collapse-icon collapse-span-icon' onClick={handleCollapseClick}>
          {collapsed && <img src={Icons.logo_icon} alt='karstation logo' className='col-logo' />}
          <img src={collapsed ? Icons.menu_unfold : Icons.menu_fold} alt='collapse icon' />
        </div>
      </div>
      
      <div className="scrollable-content" ref={scrollContainerRef}>
        <div className={`menu-container top-menu ${collapsed ? 'collapsed-menu' : ''}`}>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[getActiveKey()]}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            onClick={handleMenuClick}
            items={getMenuItems()}
          />
        </div>
        <div className={`menu-container bottom-menu ${collapsed ? 'collapsed-menu' : ''}`}>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[getActiveKey()]}
            onClick={handleMenuClick}
            items={[
              {
                key: "profile",
                id: "profile-btn",
                icon: (
                  <CustomTooltip title="Profile Settings">
                    <img
                      src={Icons.profile_icon}
                      alt="Profile Settings Icon"
                    />
                  </CustomTooltip>
                ),
                label: 'Profile Settings',
                privilegetype: "profile_settings"
              },
              {
                key: "logout",
                onClick: onLogOut,
                id: "logout-btn",
                icon: (
                  <CustomTooltip title="Logout">
                    <img
                      src={Icons.signout_icon}
                      alt="Signout Icon"
                    />
                  </CustomTooltip>
                ),
                label: "Logout",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;