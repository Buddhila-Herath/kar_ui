import React, { useState, useMemo, useEffect, useRef } from "react";
import Select, { components } from "react-select";
import Icons from "../../utils/icons";
import { Checkbox, Button, ConfigProvider } from "antd";

const CustomSelect = ({
  groupedOptions,
  dropdownPlaceholderText,
  modalDropdownPlaceholderText,
  selectOptions,
  onChange,
  onAddFormData,
  type,
  isValid,
  value = [],
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = useMemo(() => {
    return groupedOptions
      .map((group) => ({
        ...group,
        subOptions: group.subOptions
          ? group.subOptions.filter((sub) =>
              sub.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : [],
      }))
      .filter(
        (group) =>
          group.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (group.subOptions && group.subOptions.length > 0)
      );
  }, [searchQuery, groupedOptions]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleOpen = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleGroup = (label) => {
    setExpandedGroups((prev) =>
      Array.isArray(prev)
        ? prev.includes(label)
          ? prev.filter((group) => group !== label)
          : [...prev, label]
        : []
    );
  };

  const handleOptionChange = (selectedOptions) => {
    setSelectedOptions(selectedOptions);

    const selectedValues = selectedOptions? selectedOptions.map((option) => option.value):[];
    if (onChange) {
      onChange(selectedValues);
    }

    if (!selectedOptions || selectedOptions.length === 0) {
      setExpandedGroups([]);
      return;
    }    

    const group = groupedOptions.find((group) =>
      group.groupedOptions?.some(
        (item) =>
          item.value === selectedOptions[selectedOptions.length - 1].value
      )
    );
    if (group?.label && !expandedGroups.includes(group.label)) {
      setExpandedGroups((prev) => [...prev, group.label]);
    }
  };

  useEffect(() => {
    const updatedSelected = groupedOptions.filter(option => value.includes(option.value));
    setSelectedOptions(updatedSelected);
  }, [value, groupedOptions]);

  const handleRemoveOption = (optionToRemove) => {
    const updatedOptions = selectedOptions.filter(
      (opt) => opt.value !== optionToRemove.value
    );
    setSelectedOptions(updatedOptions);

    if (onChange) {
      onChange(updatedOptions.map((opt) => opt.value));
    }

  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
    setIsDropdownOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = (value) => {
    return onAddFormData(value);
  };

  const GroupedOptions = {
    Group: (props) => {
      const { data, children } = props;
      const isExpanded = expandedGroups.includes(data.label);

      return (
        <>
          <div className={`group ${isExpanded ? "expanded" : ""}`}>
            <div
              className={`group-title ${isExpanded ? "expanded" : ""}`}
              onClick={() => toggleGroup(data.label)}
            >
              <span>{data.label}</span>
              <img
                src={Icons.caret_black_down}
                alt="chevron-down"
                className={isExpanded ? "rotate" : ""}
              />
            </div>
            {isExpanded && (
              <div className="group-list">
                <components.Group {...props}>{children}</components.Group>
              </div>
            )}
          </div>
          <span className={`separator ${isExpanded ? "expanded" : ""}`} />
        </>
      );
    },
    Option: (props) => {
      return (
        <>
          <div
            className={`checkbox-option ${
              props.isSelected ? "checkbox-option__selected" : ""
            }`}
            onClick={() => props.selectOption(props.data)}
          >
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: "#183571",
                  colorBorder: "#183571",
                },
              }}
            >
              <Checkbox checked={props.isSelected}>{props.data.label}</Checkbox>
            </ConfigProvider>
          </div>
          <span className="separator" />
        </>
      );
    },
  };

  return (
    <div className="dropdown group-option-dropdown required-select custom-group-dropdown custom-select" ref={dropdownRef}>
      <Button
        onClick={toggleOpen}
        icon={
          <img
            src={Icons.caret_black_down}
            alt="chevron-down"
            className={isDropdownOpen ? "rotate" : ""}
          />
        }
        iconPosition="end"
        className={`dropdown-button ${isDropdownOpen ? "opened" : ""} ${
          selectedOptions.length ? "selected" : ""
        } ${isValid ? "invalid" : ""}`}
      >
        <div className="selected-options">
          {selectedOptions.length === 0
            ? dropdownPlaceholderText
            : selectedOptions.slice(0, 2).map((opt) => (
                <div key={opt.value} className="tag-container">
                  <span className="tag-label">{opt.label}</span>
                  <img
                    src={Icons.close_icon}
                    alt="remove"
                    className="tag-remove-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveOption(opt);
                      if (onChange) {
                        onChange(selectedOptions.filter(item => item.value !== opt.value).map(item => item.value));
                      }
                    }}
                  />
                </div>
              ))}
          {selectedOptions.length > 2 && (
            <div className="tag-container">
              <span className="tag-label">+{selectedOptions.length - 2}</span>
            </div>
          )}
        </div>
      </Button>
      {isDropdownOpen && (
        <>
          <div className="dropdown-menu">
            {/* <div className="dropdown-header">
              <button className="button add-option-button" onClick={handleModalOpen}>
                <img src={Icons.plus} alt="add" />
                <span>Add Vehicle Make</span>
              </button>
            </div> */}
            <div className="dropdown-search">
              <input
                type="text"
                placeholder="Search here..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <img src={Icons.magnifying_glass} alt="search" />
            </div>
            <Select
              components={{ ...GroupedOptions }}
              options={filteredOptions}
              value={selectedOptions}
              onChange={handleOptionChange}
              isMulti={true}
              menuIsOpen={true}
              isClearable={false}
              isSearchable={false}
              tabSelectsValue={false}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              backspaceRemovesValue={false}
              className="custom-options"
            />
          </div>
          <div onClick={toggleOpen} className="dropdown-blanket" />
        </>
      )}
    </div>
  );
};

export default CustomSelect;
