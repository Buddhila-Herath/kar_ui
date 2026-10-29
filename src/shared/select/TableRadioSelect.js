import React, { useState, useMemo } from "react";
import { Dropdown, Menu, Input } from "antd";
import Icons from "../../utils/icons";

const TableRadioSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "",
  disabled,
  id
}) => {
  const [selectedValue, setSelectedValue] = useState(value || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleMenuClick = (e) => {
    const newValue = e.key;
    setSelectedValue(newValue);
    setIsDropdownOpen(false);
    setSearchText("");
    onChange?.(newValue);
  };

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, options]);

  const handleDropdownOpen = (open) => {
    setIsDropdownOpen(open);
    setTimeout(() => {
      const targetElement = document.querySelector(".ant-table-content");
      if (targetElement) {
        if (open) {
          targetElement.style.setProperty("overflow-x", "hidden", "important");
        } else {
          targetElement.style.setProperty("overflow-x", "", "important");
        }
      }
    }, 0);
  };

  const menu = (
    <div
      className="custom-table-radio-select-menu"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "242px",

        padding: "16px",
        borderRadius: "0.5rem",
        border: "1px solid #6b717d",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Input
        placeholder="Search here..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
        style={{ marginBottom: "0.5rem" }}
        className="dropdown-search"
        id={id}
        suffix={
          <img
            src={Icons.magnifying_glass}
            alt="Search"
            style={{ width: "16px", height: "16px" }}
          />
        } 
      />

      <Menu onClick={handleMenuClick}>
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <Menu.Item
              key={option.value}
              id={`menu-item-${id}`}
              style={{
                padding: "0.5rem",
                borderRadius: "0.25rem",
                color: "#4E5569",
                fontSize: "14px",
                fontWeight: 400,
              }}
            >
              {option.label}
            </Menu.Item>
          ))
        ) : (
          <div style={{ padding: "0.5rem", color: "#999" }}>
            No results found
          </div>
        )}
      </Menu>
    </div>
  );

  const selectedLabel =
    options.find((opt) => opt.value === selectedValue)?.label || placeholder;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Dropdown
        overlay={menu}
        trigger={["click"]}
        onVisibleChange={setIsDropdownOpen}
        onOpenChange={handleDropdownOpen}
        open={isDropdownOpen}
        placement="bottomRight"
        className="table-radio-dropdown"
        disabled={disabled}
        dropdownRender={(menu) => (
          <div
            className="job-table-select"
            onClick={(e) => e.stopPropagation()}
          >
            {menu}
          </div>
        )}
      >
        <button
        id={`dropdown-id-${id}`}
          style={{
            backgroundColor: "#F1F4F8",
            color: "#4E5569",
            height: "28px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minWidth: "100px",
            padding: "0 12px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          <span
          style={{
            flexGrow: 1,
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100px"
          }}
          
          >
            {selectedLabel}
          </span>
          <img
            src={Icons.caret_black_down}
            alt="chevron-down"
            style={{
              width: "12px",
              height: "12px",
              marginLeft: "8px",
              transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </button>
      </Dropdown>
    </div>
  );
};

export default TableRadioSelect;
