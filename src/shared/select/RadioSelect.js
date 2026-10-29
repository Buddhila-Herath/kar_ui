import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { Button } from "antd";
import Icons from "../../utils/icons";

const RadioSelect = ({ id = "", options, required, placeholderText, onChange, defaultValue, value, isValid, disabled = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultValue || null);
  const dropdownRef = useRef(null);

  const toggleOpen = () => {
    if (disabled) return;
    setIsDropdownOpen((prev) => !prev);
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
    if (value) {
      const selected = options.find((option) => option.value === value);
      setSelectedOption(selected);
    }
  }, [value, options]);

  const onSelectChange = (selectedValue) => {
    if (disabled) return;
    setSelectedOption(selectedValue);
    if (onChange) {
      onChange(selectedValue);
    }
    toggleOpen();
  };

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

  return (
    <div className="dropdown radio-option-dropdown" ref={dropdownRef}>
      <Button
        onClick={toggleOpen}
        icon={<img src={Icons.caret_black_down} alt="chevron-down" className={isDropdownOpen ? "rotate" : ""} style={{ opacity: disabled ? 0.5 : 1 }}/>}
        iconPosition="end"
        className={`dropdown-button ${isDropdownOpen ? "opened" : ""} ${selectedOption ? "selected" : ""} ${required ? "required" : ""}  ${isValid ? "invalid" : ""}`}
        disabled={disabled}
        id={id +`-btn`}
      >
        {selectedOption ? `${selectedOption.label}` : placeholderText || ' '}
      </Button>
      {isDropdownOpen && !disabled && (
        <>
          <div className="dropdown-menu">
            <Select
              components={{ Option: CustomOption }}
              options={options}
              value={selectedOption}
              onChange={onSelectChange}
              menuIsOpen={true}
              isSearchable={false}
              tabSelectsValue={false}
              hideSelectedOptions={false}
              controlShouldRenderValue={false}
              id={id}
            />
          </div>
          <div
            onClick={toggleOpen}
            className="dropdown-blanket"
          />
        </>
      )}
    </div>
  );
};

export default RadioSelect;
