import React, { useEffect } from 'react'
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

export const InventoryTab = ({ onTabChange, totalItemsForTabs }) => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState(0);
  const handleMainTabClick = (tab) => {
    setActiveMainTab(tab);
    onTabChange && onTabChange(tab);
    if (tab === 0) {
      navigate('/admin/inventory-updates/services', { replace: false });
    } else {
      navigate('/admin/inventory-updates/spareparts', { replace: false });
    }
  };
  useEffect(() => {
    if (tab === 'spareparts') {
      setActiveMainTab(1);
      onTabChange && onTabChange(1);
    } else {
      setActiveMainTab(0);
      onTabChange && onTabChange(0);
    }
  }, [tab])
  return (
    <div className="inventory-tab">
      <div className="job-container tech-jobs">
        <div className="job-tab-header">
          <div
            id='inventory_update_service_tab_button'
            className={`tab-item main-tab ${activeMainTab === 0 ? "active" : ""}`}
            onClick={() => handleMainTabClick(0)}
          >
            <h4>Services</h4>
            <h4 className="tab-count">{totalItemsForTabs?.services || 0}</h4>
          </div>
          <div
            id='inventory_update_spare_parts_tab_button'
            className={`tab-item main-tab ${activeMainTab === 1 ? "active" : ""}`}
            onClick={() => handleMainTabClick(1)}
          >
            <h4>Spare Parts</h4>
            <h4 className="tab-count">{totalItemsForTabs?.spareParts || 0}</h4>
          </div>
        </div>
      </div>
      <div className="content-separator"></div>
    </div>
  )
}

