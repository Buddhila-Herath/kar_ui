import React, { useState , useEffect, useRef } from 'react';
import Select from 'react-select';
import { Button, Checkbox } from 'antd';
import Icons from '../../utils/icons';

const FormMultipleSelect = ({ id = "", options, required, placeholderText, onChange , value = [], isValid, disabled }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const dropdownRef = useRef(null);

  const toggleOpen = () => {
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

  const handleOptionChange = (selected) => {
    const selectedValues = selected ? selected.map(option => option.value) : [];
    setSelectedOptions(selected || []);
    
    if (onChange) {
      onChange(selectedValues);
    }
  };
  
  useEffect(() => {
    const updatedSelected = options.filter(option => value.includes(option.value));
    setSelectedOptions(updatedSelected);
  }, [value, options]);

  const handleRemoveOption = (optionToRemove) => {
    const updatedOptions = selectedOptions.filter((opt) => opt.value !== optionToRemove.value);
    setSelectedOptions(updatedOptions);

    if (onChange) {
      onChange(updatedOptions.map((opt) => opt.value));
    }
    
  };

  const CustomOption = (props) => {
    const { data, isSelected, innerRef, innerProps } = props;
    return (
      <>
        <div
          ref={innerRef}
          {...innerProps}
          className={`checkbox-option ${isSelected ? 'checkbox-option__selected' : ''}`}
        >
          <Checkbox
            type="checkbox"
            checked={isSelected}
          ></Checkbox>
          <label>{data.label}</label>
        </div>
        <div className="separator" />
      </>
    );
  };

  return (
    <div className="dropdown custom-multi-dropdown" ref={dropdownRef}>
      <Button
        onClick={toggleOpen}
        icon={<img src={Icons.caret_black_down} alt="chevron-down" className={isDropdownOpen ? 'rotate' : ''} />}
        iconPosition="end"
        disabled={disabled}
        id={id +`-btn`}
        className={`dropdown-button ${isDropdownOpen ? 'opened' : ''} ${selectedOptions.length ? 'selected' : ''} ${required ? 'required' : ''} ${isValid ? "invalid" : ""}`}
      >
        <div className="selected-options">
          {selectedOptions.length === 0
            ? placeholderText
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
            <Select
              components={{ Option: CustomOption }}
              options={options}
              value={selectedOptions}
              onChange={handleOptionChange}
              isMulti={true}
              menuIsOpen={true}
              isClearable={false}
              isSearchable={false}
              tabSelectsValue={false}
              hideSelectedOptions={false}
              backspaceRemovesValue={false}
              closeMenuOnSelect={false}
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

export default FormMultipleSelect;
