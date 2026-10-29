import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { Button } from "antd";
import Icons from "../../../utils/icons";

const PaymentStatusSelect = ({ options, onChange, defaultValue, currentValue, value, required, placeholderText, isValid }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultValue || null);
  const dropdownRef = useRef(null);

  const toggleOpen = () => setIsDropdownOpen(prev => !prev);

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
      const selected = options.find(opt => opt.value === value);
      setSelectedOption(selected);
    }
  }, [value]);

  const onSelectChange = (selectedValue) => {
    setSelectedOption(selectedValue);
    if (onChange) onChange(selectedValue);
    toggleOpen();
  };

  const filteredOptions = options.map(opt => ({
    ...opt,
    isDisabled:
      (currentValue === "Partially Paid" && opt.value === "Unpaid")
  }));

  const CustomOption = (props) => {
    const { data, isSelected, innerRef, innerProps, isDisabled } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className={`radio-option ${isSelected ? "radio-option__selected" : ""} ${isDisabled ? "disabled" : ""}`}
        style={{ cursor: isDisabled ? "not-allowed" : "pointer", opacity: isDisabled ? 0.5 : 1 }}
      >
        {data.label}
        <div className="separator" />
      </div>
    );
  };

  return (
    <div id="payment-status-select-container" className="dropdown radio-option-dropdown" ref={dropdownRef}>
      <Button
        id="payment-status-select-button"
        onClick={toggleOpen}
        icon={<img src={Icons.caret_black_down} alt="chevron-down" className={isDropdownOpen ? "rotate" : ""} />}
        iconPosition="end"
        className={`dropdown-button ${isDropdownOpen ? "opened" : ""} ${selectedOption ? "selected" : ""} ${required ? "required" : ""} ${isValid ? "invalid" : ""}`}
      >
        {selectedOption ? selectedOption.label : placeholderText || ' '}
      </Button>
      {isDropdownOpen && (
        <>
          <div className="dropdown-menu">
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
            />
          </div>
          <div className="dropdown-blanket" onClick={toggleOpen} />
        </>
      )}
    </div>
  );
};

export default PaymentStatusSelect;
