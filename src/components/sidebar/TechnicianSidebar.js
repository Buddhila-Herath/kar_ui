import React, {useEffect, useState} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Menu, Tooltip } from "antd";
import karstationLogoWhite from '../../assets/images/karstation-logo-white.svg';
import Icons from "../../utils/icons"
import { logout } from '../../slices/authSlice';

const TechnicianSidebar = (props) => {
  const { collapsed, setCollapsed, toggleSider } = props;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [openKeys, setOpenKeys] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { allPrivilages } = useSelector((state) => state.permission);

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

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setCollapsed]);

  const handleCollapseClick = () => {
    if (isMobile) {
      setCollapsed(!collapsed);
      toggleSider();
    } else {
      setCollapsed(!collapsed);
    }
  };

  const getActiveKey = () => {
    if (location.pathname.includes('/app/dashboard') || location.pathname.includes('/app/details')) return 'dashboard';
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
        privilegetype: "technician_dashboard"
      },
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
      case "profile":
        navigate('/app/my-profile');
        break;
      default:
        break;
    }
  };

  const getBottomMenuItems = () => {
    const bottomMenuItems = [
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
        privilegetype: null
      },
    ];
  
    // Filter menu items based on privileges
    return bottomMenuItems.filter(item => {
      if (!item.privilegetype) return true;
      
      const privilege = allPrivilages?.find(p => p.privilegeType === item.privilegetype);
      return privilege?.status === true;
    });
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
      
      <div className="scrollable-content">
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
            items={getBottomMenuItems()}
          />
        </div>
      </div>
    </div>
  );
};

export default TechnicianSidebar;