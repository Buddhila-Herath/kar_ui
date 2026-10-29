import React, { useState, useEffect, useRef } from "react";
import Select from 'react-select';
import { Button } from 'antd';
import Icons from '../../utils/icons';
import AddOwnerModal from "../../components/vendor/vehicle-management/AddOwnerModal";

const OwnerSelect = ({ 
  options, 
  placeholderText, 
  onAddFormData,
  onChange,
  value 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(value || null);
  const [searchQuery, setSearchQuery] = useState("");
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
    // The AddOwnerModal returns form data with name, email, phone
    // We need to transform it to match the expected format
    const ownerData = {
      name: value.name,
      email: value.email,
      phone: value.phone
    };
    return onAddFormData(ownerData);
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
          className={`single-option ${isSelected ? 'single-option__selected' : ''}`}
        >
          {data.label}
        </div>
        <div className="separator" />
      </>
    );
  };

  return (
    <div className="dropdown custom-option-dropdown custom-group-dropdown " ref={dropdownRef}>
      <Button
        onClick={toggleOpen}
        icon={<img src={Icons.caret_black_down} alt="chevron-down" className={isDropdownOpen ? 'rotate' : ''} />}
        iconPosition="end"
        className={`dropdown-button ${isDropdownOpen ? 'opened' : ''} ${selectedOption ? 'selected' : ''}`}
      >
        {selectedOption ? `${selectedOption.label}` : placeholderText || ' '}
      </Button>
      {isDropdownOpen && (
        <>
          <div className="dropdown-menu">
            <div className="dropdown-header">
              <button className="button add-option-button" onClick={handleModalOpen}>
                <img src={Icons.plus} alt="add" />
                <span> Add New Owner</span>
              </button>
            </div>
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
              components={{ Option: CustomOption }}
              options={filteredOptions}
              value={selectedOption}
              onChange={onSelectChange}
              menuIsOpen={true}
              isClearable={false}
              isSearchable={false}
              tabSelectsValue={false}
              hideSelectedOptions={false}
              backspaceRemovesValue={false}
              controlShouldRenderValue={false}
              className="dropdown-select"
            />
          </div>
          <div
            onClick={toggleOpen}
            className="dropdown-blanket"
          />
          {isModalOpen && (
            <AddOwnerModal
              isModalOpen={isModalOpen}
              handleModalClose={handleModalClose}
              onSubmit={handleModalSubmit}
            />
          )}
        </>
      )}
    </div>
  );
};

export default OwnerSelect;
