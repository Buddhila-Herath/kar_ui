import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { Button, Spin } from "antd";
import Icons from "../../utils/icons";
import Spinner from "../components/loaders/Spinner";

// Add CSS styles for responsive maxWidth
const styles = `
  .custom-select-value {
    max-width: 294px;
  }
  
  @media (max-width: 768px) {
    .custom-select-value {
      max-width: 245px !important;
    }
  }
`;

// Inject styles into head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

const CustomSelectWithApiSearch = ({ 
  options, 
  required, 
  placeholderText, 
  onChange, 
  defaultValue, 
  value, 
  isValid, 
  disabled, 
  loading = false,
  onSearch,
  searchDebounceMs = 300
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultValue || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
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
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (onSearch && newSearchQuery.length >= 3) {
      setSearchLoading(true);
      const timeout = setTimeout(() => {
        onSearch(newSearchQuery, () => {
          setSearchLoading(false);
        });
      }, searchDebounceMs);
      setSearchTimeout(timeout);
    } else if (onSearch && newSearchQuery.length === 0) {
      setSearchLoading(true);
      onSearch("", () => {
        setSearchLoading(false);
      });
    } else {
      setSearchLoading(false);
    }
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const displayOptions = options || [];

  const CustomOption = (props) => {
    const { data, isSelected, innerRef, innerProps } = props;
    return (
      <>
        <div
          ref={innerRef}
          {...innerProps}
          style={{
            padding: '8px',
            fontSize: '1rem',
            lineHeight: '1.5rem',
            fontWeight: 500,
            color: '#000',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            transition: 'all 0.1s ease-in-out',
            overflowWrap: 'anywhere',
            backgroundColor: isSelected ? '#e4eaf2' : 'transparent'
          }}
        >
          {data.label}
        </div>
        <div style={{ width: '100%', borderBottom: '1px solid #e4eaf2' }} />
      </>
    );
  };

  // Inline styles
  const dropdownStyles = {
    order: 2,
    position: 'relative'
  };

  const dropdownButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    fontSize: '1rem',
    fontWeight: 400,
    color: selectedOption ? '#000' : '#6b717d',
    backgroundColor: '#fff',
    borderRadius: '0.5rem',
    border: '1px solid #6B717D',
    outline: '1px solid transparent',
    height: 'auto',
    lineHeight: 'normal',
    boxShadow: 'none',
    cursor: selectedOption ? 'auto' : 'pointer'
  };

  const selectedValueStyles = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '294px'
  };

  const iconStyles = {
    width: '16px',
    height: '10px',
    transition: 'transform 0.3s ease-in-out',
    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
  };

  const dropdownMenuStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    height: 'fit-content',
    zIndex: 9,
    padding: '1rem',
    marginTop: '0.25rem',
    borderRadius: '0.5rem',
    border: '1px solid #6b717d',
    backgroundColor: '#fff',
    position: 'absolute',
  };

  const dropdownSearchStyles = {
    position: 'relative'
  };

  const searchInputStyles = {
    borderColor: '#C3DCF9',
    height: '40px',
    padding: '8px 12px',
    width: '100%',
    border: '1px solid #C3DCF9',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none'
  };

  const searchIconStyles = {
    position: 'absolute',
    width: '16px',
    height: '16px',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none'
  };

  const dropdownBlanketStyles = {
    position: 'relative',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1
  };

  const loadingStyles = {
    textAlign: 'center',
    padding: '2rem'
  };

  const searchLoadingStyles = {
    textAlign: 'center',
    padding: '1rem'
  };

  return (
    <div style={dropdownStyles} ref={dropdownRef}>
      <Button
        onClick={toggleOpen}
        icon={<img src={Icons.caret_black_down} alt="chevron-down" style={iconStyles} />}
        iconPosition="end"
        disabled={disabled || loading}
        style={dropdownButtonStyles}
      >
                 <span style={selectedValueStyles} className="custom-select-value">
          {loading ? (
            <span>
              <Spin size="small" style={{ marginRight: 8 }} />
              {placeholderText || "Loading..."}
            </span>
          ) : (
            selectedOption ? selectedOption.label : placeholderText || ' '
          )}
        </span>
      </Button>
      {isDropdownOpen && !loading && (
        <>
          <div style={dropdownMenuStyles}>
            <div style={dropdownSearchStyles}>
              <input
                type="text"
                placeholder="Search here..."
                value={searchQuery}
                onChange={handleSearch}
                disabled={loading}
                style={searchInputStyles}
              />
              <img src={Icons.magnifying_glass} alt="search" style={searchIconStyles} />
            </div>
            <Select
              components={{ Option: CustomOption }}
              options={searchLoading ? [] : displayOptions}
              value={selectedOption}
              onChange={onSelectChange}
              menuIsOpen={true}
              isSearchable={false}
              tabSelectsValue={false}
              hideSelectedOptions={false}
              controlShouldRenderValue={false}
              isDisabled={loading}
              noOptionsMessage={() => searchLoading ? null : "No options"}
              styles={{
                control: (provided) => ({
                  ...provided,
                  display: 'none'
                }),
                menu: (provided) => ({
                  ...provided,
                  margin: 0,
                  position: 'static',
                  borderRadius: 0,
                  backgroundColor: 'transparent',
                  boxShadow: 'none'
                }),
                menuList: (provided) => ({
                  ...provided,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  padding: 0,
                  maxHeight: '168px'
                })
              }}
            />
            {searchLoading && (
              <div style={searchLoadingStyles}>
                <Spinner />
              </div>
            )}
          </div>
          <div
            onClick={toggleOpen}
            style={dropdownBlanketStyles}
          />
        </>
      )}
      {isDropdownOpen && loading && (
        <div style={{ ...dropdownMenuStyles, ...loadingStyles }}>
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default CustomSelectWithApiSearch;
