import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { Button } from "antd";
import Icons from "../../utils/icons";
import AddModalSingleInput from "./AddModalSingleInput";

const GroupRadioSelect = ({ 
  options, 
  required, 
  placeholderText, 
  modalTitle, 
  formFieldLabel, 
  formPlaceholderText, 
  buttonText, 
  listTitle,
  onAddFormData,
  onChange,
  defaultValue,
  value,
  isValid,
  id = ""
}) => {
  const baseId = id || "group-radio-select";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultValue || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

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

  useEffect(() => {
    if (value) {
      const selected = options.find((option) => option.value === value);
      setSelectedOption(selected);
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

  const handleModalOpen = () => {
    setIsModalOpen(true);
    setIsDropdownOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = (newOption) => {
    if (onAddFormData) {
      return onAddFormData(newOption);
    }
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CustomOption = (props) => {
    const { data, isSelected, innerRef, innerProps } = props;
    return (
      <>
        <div
          ref={innerRef}
          {...innerProps}
          className={`radio-option ${isSelected ? "radio-option__selected" : ""}`}
          id={`${baseId}-option-${data.value}`}
        >
          {data.label}
        </div>
        <div className="separator" id={`${baseId}-separator-${data.value}`} />
      </>
    );
  };

  return (
    <div className="dropdown radio-option-dropdown" ref={dropdownRef} id={baseId}>
      <Button
        onClick={toggleOpen}
        icon={<img src={Icons.caret_black_down} alt="chevron-down" className={isDropdownOpen ? "rotate" : ""} id={`${baseId}-caret-icon`} />}
        iconPosition="end"
        className={`dropdown-button ${isDropdownOpen ? "opened" : ""} ${selectedOption ? "selected" : ""} ${required ? "required" : ""}  ${isValid ? "invalid" : ""}`}
        id={`${baseId}-btn`}
      >
        {selectedOption ? `${selectedOption.label}` : placeholderText || " "}
      </Button>
      {isDropdownOpen && (
        <>
          <div className="dropdown-menu custom-select custom-radio-select" id={`${baseId}-dropdown-menu`}>
            <div className="dropdown-header" id={`${baseId}-dropdown-header`}>
              <button type="button" className="button add-option-button" onClick={handleModalOpen} id={`${baseId}-add-option-button`}>
                <img src={Icons.plus} alt="add" id={`${baseId}-add-icon`} />
                <span>Add Insurance Company</span>
              </button>
            </div>

            <div className="dropdown-search" id={`${baseId}-search-container`}>
              <input
                type="text"
                placeholder="Search here..."
                value={searchQuery}
                onChange={handleSearch}
                id={`${baseId}-search`}
              />
              <img src={Icons.magnifying_glass} alt="search" id={`${baseId}-search-icon`} />
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
              inputId={`${baseId}-select-input`}
              id={`${baseId}-select`}
            />
          </div>

          <div onClick={toggleOpen} className="dropdown-blanket" id={`${baseId}-blanket`} />

          {isModalOpen && (
            <div ref={modalRef} id={`${baseId}-modal-container`}>
              <AddModalSingleInput
                isModalOpen={isModalOpen}
                handleModalClose={handleModalClose}
                options={options}
                modalTitle={modalTitle }
                formFieldLabel={formFieldLabel }
                formPlaceholderText={formPlaceholderText }
                buttonText={buttonText }
                listTitle={listTitle }
                onSubmit={handleModalSubmit}
                id={`${baseId}-add-modal`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GroupRadioSelect;
