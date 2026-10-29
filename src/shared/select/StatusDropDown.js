import React, { useState, useEffect } from "react";
import { Dropdown, Menu } from "antd";
import Icons from "../../utils/icons";

const statusOptions = [
  { label: "Started", value: "Started" },
  { label: "Paused", value: "Paused" },
  { label: "Completed", value: "Completed" },
];

const statusStyles = {
  Started: {
    backgroundColor: "#1D4FD6",
    textColor: "#FFFFFF"  
  },
  Paused: {
    backgroundColor: "#E08302",
    textColor: "#FFFFFF"  
  },
  Completed: {
    backgroundColor: "#287956",
    textColor: "#FFFFFF"  
  },
  default: {
    backgroundColor: "#F1F4F8",
    textColor: "#4E5569"  
  }
};

const StatusDropDown = ({ defaultStatus, onChange, className, disabled, currentStatus, disabledOptions = [] }) => {
  const [selectedStatus, setSelectedStatus] = useState(defaultStatus?.value || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isCompleted = selectedStatus === "Completed";
  const isDisabled = disabled || isCompleted;
  const hasNoStatus = !currentStatus;

  const handleMenuClick = async (e) => {
    if (hasNoStatus && e.key !== "Started") return;
    if (disabledOptions.includes(e.key)) return;
    
    const newStatus = e.key;
    // setSelectedStatus(newStatus);
    setIsDropdownOpen(false);
    
    try {
      await onChange?.(newStatus);
    } catch (error) {
      setSelectedStatus(currentStatus || defaultStatus?.value || "");
    }
  };

  useEffect(() => {
    setSelectedStatus(currentStatus || defaultStatus?.value || "");
  }, [currentStatus, defaultStatus]);

  const handleDropdownOpen = (open) => {
    setIsDropdownOpen(open);
  
    setTimeout(() => {
      const targetElement = document.querySelector(".ant-table-content");
      if (targetElement) {
        targetElement.style.setProperty("overflow-x", open ? "hidden" : "", "important");
      }
    }, 0);
  };

  const menu = (
    <Menu 
      onClick={handleMenuClick}
      className="job-status-dropdown-menu"
      style={{
        width: 200,
        padding: "1rem",
        borderRadius: "0.5rem",
        border: "1px solid #6b717d",
        backgroundColor: "#fff"
      }}
    >
      {statusOptions.map((option) => {
        const isOptionDisabled = hasNoStatus && option.value !== "Started" || disabledOptions.includes(option.value);
        
        return (
          <Menu.Item 
          id={`option-value-${option?.value}`}
            key={option.value}
            disabled={isOptionDisabled}
            style={{
              padding: "0.5rem",
              borderRadius: "0.25rem",
              color: isOptionDisabled ? "#B8BCC4" : "#4E5569",
              fontSize: "14px",
              fontWeight: 400,
              margin: 0,
              cursor: isOptionDisabled ? "not-allowed" : "pointer",
              backgroundColor: "transparent",
              ...(isOptionDisabled ? {} : {
                '&:hover': {
                  backgroundColor: "#F1F4F8"
                }
              })
            }}
          >
          <div 
            style={{
              color: isOptionDisabled ? "#B8BCC4" : "#4E5569",
              cursor: isOptionDisabled ? "not-allowed" : "pointer",
            }}
          >
            {option.label}
          </div>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  // Safely get the current style
  const currentStyle = selectedStatus 
    ? statusStyles[selectedStatus] || statusStyles.default
    : statusStyles.default;

    if (isCompleted) {
      return (
        <button className="status-button"
        id='status-dropdown-button'
          style={{
            backgroundColor: currentStyle.backgroundColor,
            color: currentStyle.textColor,
            height: "28px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            gap: "2px",
            Width: "100px !important",
            padding: "4px 8px",
            border: "none",
            cursor: "default",
            fontSize: "12px",
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          <span style={{  textAlign: "center" }}>Completed</span>
          <img
            src={Icons.caret_black_down}
            alt=""
            style={{
              width: "12px",
              height: "12px",
              marginLeft: "8px",
              filter: "brightness(0) invert(1)",
            }}
          />
        </button>
      );
    }
  return (
    <div className={`status-dropdown-container ${className}`} style={{ display: "flex", alignItems: "center" }}>
      <Dropdown
        overlay={menu}
        trigger={["click"]}
        onOpenChange={handleDropdownOpen}
        open={isDropdownOpen}
        disabled={isDisabled}
        placement="bottomRight"
        dropdownRender={(menu) => (
          <div className="table-dropdown status-drop-down" onClick={(e) => e.stopPropagation()}>
            {menu}
          </div>
        )}
      >
        <button
        className="status-dropdown-button"
        id='status-dropdown-button-1'
          style={{
            backgroundColor: currentStyle.backgroundColor,
            color: currentStyle.textColor,
            height: "28px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "right",
            Width: "100px !important",
            padding: "0 12px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontSize: "12px",
            fontWeight: 500
          }}
        >
          <span style={{  textAlign: "center" }}>
            {selectedStatus || " "}
          </span>
          <img
            src={Icons.caret_black_down}
            alt="chevron-down"
            style={{
              width: "12px",
              height: "12px",
              marginLeft: "20px",
              transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              filter: selectedStatus ? "brightness(0) invert(1)" : "none" 
            }}
          />
        </button>
      </Dropdown>
    </div>
  );
};

export default StatusDropDown;