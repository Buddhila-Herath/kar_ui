import React, { useState, useEffect } from "react";
import { Dropdown, Menu, Checkbox, Tooltip } from "antd";
import Icons from "../../utils/icons";

const CustomDropDown = ({ option, onChange, linkedSpareParts = [], assignedSpareParts = [], isEdit, id = "" }) => {
  const baseId = id || "custom-dropdown";
  const [selectedValues, setSelectedValues] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (linkedSpareParts.length > 0) {
      setSelectedValues(linkedSpareParts.map((part) => part.sparePartName));
    } else if (isEdit) {
      setSelectedValues([]);
    }
  }, [linkedSpareParts, isEdit]);

  const availableOptions = option.filter(
    (item) => !assignedSpareParts.includes(item.id) || selectedValues.includes(item.part_name)
  );

  const handleCheckboxChange = (checked, item) => {
    setSelectedValues((prev) =>
      checked
        ? [...prev, item.part_name]
        : prev.filter((name) => name !== item.part_name)
    );
 
    if (onChange) {
      onChange(item, checked);
    }
  };

  const handleDropdownOpen = (open) => {
    setIsDropdownOpen(open);

    setTimeout(() => {
      const targetElement = document.querySelector(".service-table .spare-parts-table");

      if (targetElement) {
        if (open) {
          targetElement.style.setProperty("overflow-x", "hidden", "important");
        } else {
          
          targetElement.style.setProperty("overflow-x", "", "important");
        }
      }
    }, 0);
  };

  const handleRemoveOption = (valueToRemove) => {
    const itemToRemove = option.find((item) => item.part_name === valueToRemove);
    if (itemToRemove) {
      setSelectedValues((prev) => prev.filter((value) => value !== valueToRemove));
  
      if (onChange) {
        onChange(itemToRemove, false);
      }
    }
  };

  const menu = (
    <Menu onClick={(e) => e.domEvent.stopPropagation()} id={`${baseId}-menu-list`}> 
      {availableOptions.length > 0 ? (
        availableOptions.map((item) => (
          <Menu.Item key={item.id.toString()} id={`${baseId}-menu-item-${item.id}`}>
            <div
              onClick={(e) => e.stopPropagation()} 
              style={{ display: "flex", alignItems: "center" }}
            >
              <Checkbox
                checked={selectedValues.includes(item.part_name)}
                id={`${baseId}-checkbox-${item.id}`}
                onChange={(e) => {
                  e.stopPropagation(); 
                  handleCheckboxChange(e.target.checked, item);
                }}
              >
                {item.part_name}
              </Checkbox>
            </div>
          </Menu.Item>
        ))
      ) : (
        <Menu.Item disabled id={`${baseId}-no-options-item`}>No spare parts available</Menu.Item>
      )}
    </Menu>
  );

  return (
    <div className="custome-drop" id={baseId}>
      <Dropdown
        overlay={menu}
        trigger={["click"]}
        open={isDropdownOpen}
        onOpenChange={handleDropdownOpen}
        className="table-dropdown"
        placement="bottomRight"
        getPopupContainer={() => document.querySelector(".form-container")}
        dropdownRender={(menu) => (
          <div
            className="table-dropdown"
            onClick={(e) => e.stopPropagation()}
            id={`${baseId}-menu`}
          >
            {menu}
          </div>
        )}
      >
        <span
          className="drop-down"
          style={{ display: "flex", alignItems: "center" }}
          id={`${baseId}-trigger`}
        >
          <span className="selected-value" style={{ marginRight: 8 }} id={`${baseId}-selected-value`}>
            {selectedValues.length > 0 ? (
              <div className="business-type-badge-container">
                {selectedValues.slice(0, 2).map((value, index) => (
                  <span
                    key={index}
                    className="business-type-badge linked-spare-type"
                    id={`${baseId}-badge-${index}`}
                  >
                    <span className="tag-label">{value}</span>
                    <img
                      src={Icons.rounded_close}
                      alt="remove"
                      className="tag-remove-icon"
                      id={`${baseId}-remove-${index}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(value);
                      }}
                    />
                  </span>
                ))}
                {selectedValues.length > 2 && (
                  <Tooltip
                    className="custom-tooltip"
                    color="#E0EBFF"
                    title={
                      <div className="tooltip-content" id={`${baseId}-tooltip-content`}>
                        {selectedValues.slice(2).map((value, index) => (
                          <span key={index} className="badge" id={`${baseId}-tooltip-badge-${index + 2}`}>
                            {value}
                            <img
                              src={Icons.rounded_close}
                              alt="remove"
                              className="tag-remove-icon tool-tag"
                              id={`${baseId}-tooltip-remove-${index + 2}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveOption(value);
                              }}
                            />
                          </span>
                        ))}
                      </div>
                    }
                  >
                    <span className="business-type-badge more-badge" id={`${baseId}-more-badge`}>
                      +{selectedValues.length - 2}
                    </span>
                  </Tooltip>
                )}
              </div>
            ) : (
              "Select Parts"
            )}
          </span>

          <img
            src={Icons.caret_black_down}
            alt="Dropdown Icon"
            id={`${baseId}-caret-icon`}
            style={{
              transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </span>
      </Dropdown>
    </div>
  );
};

export default CustomDropDown;