import React, { useState, useEffect, useRef } from "react";
import Select from 'react-select';
import { Button } from 'antd';
import Icons from '../../utils/icons';
import AddModalInput from "./AddModalInput";

const CustomOptionsSelect = ({ 
  options, 
  placeholderText, 
  modalTitle, 
  formFieldLabel, 
  formPlaceholderText, 
  buttonText, 
  defaultValue, 
  listTitle,
  onAddFormData,
  onChange,
  isValid,
  value,
  disabled = false,
  id = ""
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(value  || null);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);
  
  useEffect(() => {
    setSelectedOption(value || null);
  }, [value]);

  const toggleOpen = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (
      isModalOpen ||
      (dropdownRef.current && dropdownRef.current.contains(event.target)) ||
      (modalRef.current && modalRef.current.contains(event.target))
    ) {
      return;
    }
    
    setIsDropdownOpen(false);
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
  }, [isDropdownOpen, isModalOpen]);

  const onSelectChange = (selectedValue) => {
    setSelectedOption(selectedValue);
    if (onChange) {
      onChange(selectedValue);
    }
    toggleOpen();
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
    setIsDropdownOpen(true);
  }

  const handleModalClose = () => {
    setIsModalOpen(false);
  }

  const handleModalSubmit = (value) => {
    return onAddFormData(value);
  };

  const CustomOption = (props) => {
    const { data, isSelected, innerRef, innerProps } = props;
    return (
      <>
        <div
          ref={innerRef}
          {...innerProps}
          className={`single-option ${isSelected ? 'single-option__selected' : ''}`}
        >
          {data.label}
        </div>
        <div className="separator" />
      </>
    );
  };

  return (
    <div className="dropdown custom-option-dropdown" ref={dropdownRef}>
      <Button
        onClick={toggleOpen}
        icon={<img src={Icons.caret_black_down} alt="chevron-down" className={isDropdownOpen ? 'rotate' : ''} />}
        iconPosition="end"
        disabled={disabled}
        id={id +`-btn`}
        className={`dropdown-button ${isDropdownOpen ? 'opened' : ''} ${selectedOption ? 'selected' : ''}`}
      >
        {selectedOption ? `${selectedOption.label}` : placeholderText || ' '}
      </Button>
      {isDropdownOpen && (
        <>
          <div className="dropdown-menu">
            <div className="dropdown-header">
              <button className="button add-option-button" id="add-unit-buttton" onClick={handleModalOpen}>
                <img src={Icons.plus} alt="add" />
                <span>Add Unit</span>
              </button>
            </div>
            <Select
              components={{ Option: CustomOption }}
              options={options}
              value={selectedOption}
              onChange={onSelectChange}
              menuIsOpen={true}
              isClearable={false}
              isSearchable={true}
              tabSelectsValue={false}
              hideSelectedOptions={false}
              backspaceRemovesValue={false}
              controlShouldRenderValue={false}
              className="dropdown-select"
              id={id}
            />
          </div>
          <div
            onClick={toggleOpen}
            className="dropdown-blanket"
          />
          {isModalOpen && (
            <div ref={modalRef}>
              <AddModalInput
                isModalOpen={isModalOpen}
                handleModalClose={handleModalClose}
                options={options}
                modalTitle={modalTitle}
                formFieldLabel={formFieldLabel}
                formPlaceholderText={formPlaceholderText}
                buttonText={buttonText}
                listTitle={listTitle}
                onSubmit={handleModalSubmit}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomOptionsSelect;
