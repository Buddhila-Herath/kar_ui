import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { Button, Spin } from "antd";
import Icons from "../../utils/icons";

const CustomRadioSelect = ({ id = "", options, required, placeholderText, onChange, defaultValue, value, isValid, disabled, loading = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultValue || null);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const toggleOpen = () => {
    if (!loading && !disabled) setIsDropdownOpen((prev) => !prev);
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

 useEffect(() => {
    if (value && options && options.length > 0) {
      const selected = options.find((option) => option.value === value);
      if (selected) {
        setSelectedOption(selected);
      }
    }
  }, [value, options]);

  const onSelectChange = (selectedValue) => {
    setSelectedOption(selectedValue);
    if (onChange) {
      onChange(selectedValue);
    }
    toggleOpen();
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredOptions = (options || []).filter((option) =>
    option?.label?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CustomOption = (props) => {
    const { data, isSelected, innerRef, innerProps } = props;
    return (
      <>
        <div
          ref={innerRef}
          {...innerProps}
          className={`radio-option ${isSelected ? "radio-option__selected" : ""}`}
        >
          {data.label}
        </div>
        <div className="separator" />
      </>
    );
  };

  const getButtonContent = () => {
    if (loading) {
      return (
        <span>
          <Spin size="small" style={{ marginRight: 8 }} />
          {placeholderText || "Loading..."}
        </span>
      );
    }
    
    if (value && options && options.length > 0) {
      const selected = options.find((option) => option.value === value);
      if (selected) {
        return selected.label;
      }
    }
    
    if (selectedOption) {
      return selectedOption.label;
    }
    
    return placeholderText || ' ';
  };

  return (
    <div className="dropdown radio-option-dropdown" ref={dropdownRef}>
      <Button
        onClick={toggleOpen}
        icon={<img src={Icons.caret_black_down} alt="chevron-down" className={isDropdownOpen ? "rotate" : ""} />}
        iconPosition="end"
        id={id +`-btn`}
        disabled={disabled || loading}
        className={`dropdown-button ${isDropdownOpen ? "opened" : ""} ${selectedOption ? "selected" : ""} ${required ? "required" : ""}  ${isValid ? "invalid" : ""}`}
      >
        <span className="selected-value">
          {getButtonContent()}
        </span>
      </Button>
      {isDropdownOpen && !loading && (
        <>
          <div className="dropdown-menu custom-select custom-radio-select">
            <div className="dropdown-search">
              <input
                type="text"
                placeholder="Search here..."
                value={searchQuery}
                onChange={handleSearch}
                id={id +`-search`}
                disabled={loading}
              />
              <img src={Icons.magnifying_glass} alt="search" />
            </div>
            <Select
              components={{ Option: CustomOption }}
              options={filteredOptions}
              value={selectedOption}
              onChange={onSelectChange}
              menuIsOpen={true}
              isSearchable={false}
              tabSelectsValue={false}
              hideSelectedOptions={false}
              controlShouldRenderValue={false}
              isDisabled={loading}
              id={id}
            />
          </div>
          <div
            onClick={toggleOpen}
            className="dropdown-blanket"
          />
        </>
      )}
      {isDropdownOpen && loading && (
        <div className="dropdown-menu custom-select custom-radio-select" style={{ textAlign: "center", padding: "2rem" }}>
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default CustomRadioSelect;
