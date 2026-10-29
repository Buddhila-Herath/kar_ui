import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import Icons from "../../utils/icons";
import { getDashboardResourcesCount } from '../../slices/adminCountSlice';
import { Tokens } from '../../constants/index';
import Spinner from "../../shared/components/loaders/Spinner";
import { notification } from "antd";
import { useNavigate } from "react-router";
import { isAdminPortal } from "../../utils/portalUtils";

const Widget = (props) => {
  const [greeting, setGreeting] = useState('');
  const firstName = localStorage.getItem(Tokens.FIRST_NAME);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { counts = {}, isLoading, error } = useSelector((state) => state.adminDashboard);

   const handleVendorClick = () => {
        navigate("/admin/vendor-management");
    };
   const handleSparePartClick = () => {
        navigate("/admin/spare-part-management");
    };
   const handleProductClick = () => {
        navigate("/admin/service-management");
    };

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good Morning');
    } else if (currentHour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  useEffect(() => {
    if(isAdminPortal()) {
      dispatch(getDashboardResourcesCount());
      // console.log(counts, "counts");
    }
  }, [isAdminPortal,dispatch]);

  useEffect(() => {
    if (error) {
      notification.error({
        message: 'Error',
        description: error,
      });
    }
  }, [error]);

  return (
    <div className="dashboard-widget admin-portal-dashboard-widget">
      <div className="card no-border first-content">
        <div className="greeting admin-greeting">
          <h1 className="greeting-time">{greeting},&nbsp;</h1>
          <h1 className="greeting-name">{firstName} 👋</h1>
        </div>
        <p className="message">
          All in One Glance: Current Count of Core Resources
        </p>
      </div>

      <div className="card widget-card-container admin-widget-card-container">
        <div className="card widget-card admin-widget-card"
          style={{ backgroundImage: `url(${Icons.white_blue_bg_frame})` }}>
          <div className="card-content">
            <div className="left-content">
              <h1 className="widget-count">{isLoading ? '...' : counts.vendorCount}</h1>
              <div className="row-container-title-arrow">
                <h3 className="widget-title">Vendors</h3>
                <div className="arrow-wrapper" onClick={handleVendorClick} style={{cursor:"pointer"}} >
                  <img src={Icons?.arrowRightadmin} alt="arrow-icon" className="arrow-icon-style" />
                </div>
              </div>
            </div>
            <div className="right-content">
              <img src={Icons.users_icon} alt="Icon" className="widget-icon" />
            </div>
          </div>
        </div>

        <div className="separator" />

        <div className="card widget-card"
          style={{ backgroundImage: `url(${Icons.light_blue_bg_frame})` }}
        >
          <div className="card-content">
            {/*  */}
            <div className="left-content">
              <h1 className="widget-count">{isLoading ? '...' : counts.productsCount}</h1>
              <div className="row-container-title-arrow">
                <h3 className="widget-title">Spare Parts</h3>
                <div className="arrow-wrapper" onClick={handleSparePartClick} style={{cursor:"pointer"}}>
                  <img src={Icons?.arrowRightadmin} alt="arrow-icon" className="arrow-icon-style" />
                </div>
              </div>
            </div>
            {/*  */}
            <div className="right-content">
              <img src={Icons.part_icon} alt="Icon" className="widget-icon" />
            </div>
          </div>
        </div>

        <div className="separator" />

        <div className="card widget-card"
          style={{ backgroundImage: `url(${Icons.blue_bg_frame})` }}>
          <div className="card-content">
            {/*  */}
            <div className="left-content">
              <h1 className="widget-count">{isLoading ? '...' : counts.servicesCount}</h1>
              <div className="row-container-title-arrow">
                <h3 className="widget-title">Services</h3>
                <div className="arrow-wrapper" onClick={handleProductClick} style={{cursor:"pointer"}}>
                  <img src={Icons?.arrowRightAdminService} alt="arrow-icon" className="arrow-icon-style" />
                </div>
              </div>
            </div>
            {/*  */}
            <div className="right-content">
              <img src={Icons.service_icon} alt="Icon" className="widget-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Widget;