import React, {useEffect, useState, useRef} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Menu, Tooltip } from "antd";
import garageLogo from '../../assets/images/garage.png';
import poweredBy from '../../assets/images/powered-by.svg'
import Icons from "../../utils/icons"
import { logout } from '../../slices/authSlice';
import { Tokens } from '../../constants';
import { useConfig } from '../../config/service';
import ImageWithLoader from "../../shared/components/ImageWithLoader";

const VendorSidebar = (props) => {
  const { collapsed, setCollapsed, toggleSider } = props;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [openKeys, setOpenKeys] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { allPrivilages } = useSelector((state) => state.permission);
  const { config } = useConfig();
  const scrollContainerRef = useRef(null);
  const [businessLogo, setBusinessLogo] = useState(localStorage.getItem(Tokens.BUSINESS_LOGO) || '');

  const handleResize = () => {
    if (window.innerWidth <= 1024) {
      setCollapsed(true);
    }
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    const onStorage = (e) => {
      if (e.key === Tokens.BUSINESS_LOGO) {
        setBusinessLogo(e.newValue || '');
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener('storage', onStorage);
    };
  }, [setCollapsed]);

  // Refresh business logo from localStorage on route change (in case it was updated)
  useEffect(() => {
    setBusinessLogo(localStorage.getItem(Tokens.BUSINESS_LOGO) || '');
  }, [location.pathname]);

  const handleCollapseClick = () => {
    if (isMobile) {
      setCollapsed(!collapsed);
      toggleSider();
    } else {
      setCollapsed(!collapsed);
    }
  };

  // Persist and restore sidebar scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      try {
        sessionStorage.setItem("vendorSidebarScrollTop", String(container.scrollTop));
      } catch (_) {}
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Restore after route change
    const container = scrollContainerRef.current;
    if (!container) return;
    try {
      const saved = sessionStorage.getItem("vendorSidebarScrollTop");
      if (saved) {
        container.scrollTop = parseInt(saved, 10) || 0;
      }
    } catch (_) {}
  }, [location.pathname]);

  const getActiveKey = () => {
    if (location.pathname.includes('/app/dashboard')) return 'dashboard';
    if (location.pathname.includes('/app/spare-parts-management')) return 'spare-parts-management';
    if (location.pathname.includes('/app/service-management')) return 'service-management';
    if (location.pathname.includes('/app/quote-management')) return 'quote-management';
    if (location.pathname.includes('/app/job-management')) return 'job-management';
    if (location.pathname.includes('/app/technician-management')) return 'technician-management';
    if (location.pathname.includes('/app/finance-management')) return 'finance-management';
    if (location.pathname.includes('/app/vehicle-management')) return 'vehicle-management';
    if (location.pathname.includes('/app/client-management')) return 'client-management';
    if (location.pathname.includes('/app/user-management')) return 'user-management';
    if (location.pathname.includes('/app/system-configurations')) return 'system-configurations';
    if (location.pathname.includes('/app/account-management')) return 'account-management';
    if (location.pathname.includes('/app/my-profile')) return 'profile';
    return '';
  };

  const onLogOut = () => {
    dispatch(logout());
    navigate('/login');
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
        privilegetype: "vendor_dashboard"
      },
      {
        key: "spare-parts-management",
        id: "spare-parts-management-btn",
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
        key: "quote-management",
        id: "quote-management-btn",
        icon: (
          <CustomTooltip title="Quote Management">
            <img
              src={Icons.quote_management}
              alt="Quote Management Icon"
            />
          </CustomTooltip>
        ),
        label: "Quote Management",
        privilegetype: "quote_management"
      },
      {
        key: "job-management",
        id: "job-management-btn",
        icon: (
          <CustomTooltip title="Job Management">
            <img
              src={Icons.job_management}
              alt="Job Management Icon"
            />
          </CustomTooltip>
        ),
        label: "Job Management",
        privilegetype: "job_management"
      },
      {
        key: "technician-management",
        id: "technician-management-btn",
        icon: (
          <CustomTooltip title="Technician Management">
            <img
              src={Icons.users_three}
              alt="Technician Management Icon"
            />
          </CustomTooltip>
        ),
        label: "Technician Management",
        privilegetype: "technician_management"
      },
      {
        key: "finance-management",
        id: "finance-management-btn",
        icon: (
          <CustomTooltip title="Finance Management">
            <img
              src={Icons.line_chart}
              alt="Finance Icon"
            />
          </CustomTooltip>
        ),
        label: "Finance Management",
        privilegetype: "finance_management"
      },
      {
        key: "vehicle-management",
        id: "vehicle-management-btn",
        icon: (
          <CustomTooltip title="Vehicle Management">
            <img
              src={Icons.police_car}
              alt="Vehicle Icon"
            />
          </CustomTooltip>
        ),
        label: "Vehicle Management",
        privilegetype: "vehicel_management"
      },
      {
        key: "client-management",
        id: "client-management-btn",
        icon: (
          <CustomTooltip title="Client Management">
            <img
              src={Icons.users}
              alt="client Icon"
            />
          </CustomTooltip>
        ),
        label: "Client Management",
        privilegetype: "client_management"
      },
      {
        key: "user-management",
        id: "user-management-btn",
        icon: (
          <CustomTooltip title="User Management">
            <img
              src={Icons.user_management}
              alt="User Icon"
            />
          </CustomTooltip>
        ),
        label: "User Management",
        privilegetype: "user_management"
      },
      {
        key: "system-configurations",
        id: "system-configurations-btn",
        icon: (
          <CustomTooltip title="System Configurations">
            <img
              src={Icons.system}
              alt="System Configurations Icon"
            />
          </CustomTooltip>
        ),
        label: "System Configurations",
        privilegetype: "system_configuration"
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
        navigate('/app/dashboard');
        break;
      case "spare-parts-management":
        navigate('/app/spare-parts-management');
        break;
      case "service-management":
        navigate('/app/service-management');
        break;
      case "quote-management":
        navigate('/app/quote-management');
        break;
      case "job-management":
        navigate('/app/job-management');
        break;
      case "technician-management":
        navigate('/app/technician-management');
        break;
      case "finance-management":
        navigate('/app/finance-management');
        break;
      case "vehicle-management":
        navigate('/app/vehicle-management');
        break;
      case "client-management":
        navigate('/app/client-management');
        break;
      case "user-management":
        navigate('/app/user-management');
        break;
      case "system-configurations":
        navigate('/app/system-configurations');
        break;
      case "account-management":
        navigate('/app/account-management');
        break;
      case "profile":
        navigate('/app/my-profile');
        break;
      default:
        break;
    }
  };

  return (
    <div className="sidebar vendor-sidebar">
      <div className={`logo-container ${collapsed ? 'collapsed-logo-container' : ''}`}>
        {!collapsed ? <div className="logo-container-inner"><ImageWithLoader src={businessLogo || garageLogo} alt='business logo' className='logo' /> </div> : null}
        <div className='collapse-icon collapse-span-icon' onClick={handleCollapseClick}>
          {collapsed && <ImageWithLoader src={businessLogo || garageLogo} alt='business logo' className='col-logo' />}
          <img src={collapsed ? Icons.menu_unfold : Icons.menu_fold} className="collapsed-icon"alt='collapse icon' />
        </div>
      </div>
      
      <div className="scrollable-content" ref={scrollContainerRef}>
        <div className="powerd-by">
          <span>Powered by</span>
          <img src={poweredBy} alt='karstation logo' className='logo' />
        </div>
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
                key: "account-management",
                id: "account-management-btn",
                icon: (
                  <CustomTooltip title="Account Management">
                    <img
                      src={Icons.account_management}
                      alt="Account Management Icon"
                    />
                  </CustomTooltip>
                ),
                label: 'Account Management',
                privilegetype: "account_management"
              },
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

export default VendorSidebar;