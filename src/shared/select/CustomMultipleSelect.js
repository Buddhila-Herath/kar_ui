import React, { useState, useEffect, useRef, useMemo } from 'react';
import Select from 'react-select';
import { Button, Checkbox, ConfigProvider } from 'antd';
import Icons from '../../utils/icons';
import AddModalInput from './AddModalInput';

const CustomMultipleSelect = ({ 
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
  isValid,
  value = [],
  showAddButton = true,
  extraFieldEnabled = false,
  extraFieldLabel = "",
  extraFieldPlaceholder = "",
  disabled = false,
  id=""
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleOptionChange = (selected) => {
    setSelectedOptions(selected || []);
    
    const selectedValues = selected ? selected.map(option => option.value) : [];
    if (onChange) {
      onChange(selectedValues);
    }
  };

  const filteredOptions = useMemo(() => {
    return (Array.isArray(options) ? options : []).filter(option => 
        option?.label && option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
}, [searchQuery, options]);

  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
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

  const CustomOption = (props) => {
    const { data, isSelected, innerRef, innerProps } = props;
    return (
      <>
        <div
          ref={innerRef}
          {...innerProps}
          className={`checkbox-option ${isSelected ? 'checkbox-option__selected' : ''}`}
        >
          <ConfigProvider
              theme={{
              token: {
                  colorPrimary: '#183571',
                  colorBorder: '#183571',
              },
              }}
          >
            <Checkbox
              type="checkbox"
              checked={isSelected}
            ></Checkbox>
          </ConfigProvider>
          <label>{data.label}</label>
        </div>
        <div className="separator" />
      </>
    );
  };

  return (
    <div className="dropdown custom-multi-dropdown make-drop custom-group-dropdown" ref={dropdownRef}>
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
            : selectedOptions
            .filter(opt => opt.value !== "all")
            .slice(0, 2)
            .map((opt) => (
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
          {selectedOptions.filter(opt => opt.value !== "all").length > 2 && (
            <div className="tag-container">
              <span className="tag-label">
                +{selectedOptions.filter(opt => opt.value !== "all").length - 2}
              </span>
            </div>
          )}
        </div>
      </Button>
      {isDropdownOpen && (
        <>
          <div className="dropdown-menu">
            {showAddButton && (
            <div className="dropdown-header">
              <button
                className="button add-option-button"
                onClick={handleModalOpen}
              >
                <img src={Icons.plus} alt="add" />
                <span>Add Category</span>
              </button>
            </div>
          )}
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
              value={selectedOptions}
              onChange={handleOptionChange}
              isMulti={true}
              menuIsOpen={true}
              isClearable={false}
              isSearchable={true}
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
                extraFieldEnabled={extraFieldEnabled}
                extraFieldLabel={extraFieldLabel}
                extraFieldPlaceholder={extraFieldPlaceholder}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomMultipleSelect;
