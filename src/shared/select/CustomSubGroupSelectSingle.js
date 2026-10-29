import React, { useState, useEffect, useRef } from "react";
import Select, { components } from "react-select";
import Icons from "../../utils/icons";
import AddModalSelect from "./AddModalSelect";
import { Button, Spin } from "antd";

const CustomSubGroupSelectSingle = ({
  options,
  placeholderText,
  selectOptions,
  onChange,
  onAddFormData,
  type,
  value,
  loading = false,
  disabled,
  addNewOption = true,
  id = "",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [expandedSubGroups, setExpandedSubGroups] = useState([]);
  const [selectedOption, setSelectedOption] = useState(value || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (value) {
      const matchedOption = options
        .flatMap((group) => group.options || [])
        .flatMap((make) => make.subOptions || [])
        .find((model) => model.value === value);

      setSelectedOption(
        matchedOption || { label: value, value }
      );
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

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
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isModalOpen]);

  // Fixed filteredOptions to properly traverse the nested structure
  const filteredOptions = options.filter(
    (group) =>
      group.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.options &&
        group.options.some((make) =>
          make.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (make.subOptions &&
            make.subOptions.some((model) =>
              model.label.toLowerCase().includes(searchQuery.toLowerCase())
            ))
        ))
  );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleOpen = () => {
    if (!loading && !disabled) setIsDropdownOpen((prev) => !prev);
  };

  const handleOptionChange = (selectedOption) => {
    // Single selection - only one can be selected
    setSelectedOption(selectedOption);
    if (onChange) {
      onChange(selectedOption ? selectedOption.value : null);
    }
  };

  const toggleGroup = (label) => {
    setExpandedGroups((prev) =>
      prev.includes(label)
        ? prev.filter((group) => group !== label)
        : [...prev, label]
    );
  };

  const toggleSubGroup = (label) => {
    setExpandedSubGroups((prev) =>
      prev.includes(label)
        ? prev.filter((group) => group !== label)
        : [...prev, label]
    );
  };

  const handleRemoveOption = () => {
    setSelectedOption(null);
    if (onChange) {
      onChange(null);
    }
  };

  const handleModalSubmit = (value) => {
    return onAddFormData(value);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
    setIsDropdownOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Custom components for single-select behavior
  const GroupedOptions = {
    Group: (props) => {
      const { data, children } = props;
      const isExpanded = expandedGroups.includes(data.label);

      return (
        <>
                     <div 
             className={`group ${isExpanded ? 'expanded' : ''}`}
             style={{
               // SASS styles for .group and .group.expanded
               cursor: isExpanded ? 'auto' : 'pointer',
               padding: isExpanded ? 'unset' : '8px',
               borderRadius: '4px',
               backgroundColor: 'transparent',
               transition: 'background-color 0.2s ease-in-out',
               
               // Expanded state specific styles
               ...(isExpanded && {
                 padding: 'unset',
                 '@media (max-width: 768px)': {
                   paddingRight: '10px'
                 }
               })
             }}
             onMouseEnter={(e) => {
               if (!isExpanded) {
                 e.currentTarget.style.backgroundColor = '#e4eaf2';
               }
             }}
             onMouseLeave={(e) => {
               if (!isExpanded) {
                 e.currentTarget.style.backgroundColor = 'transparent';
               }
             }}
           >
                         <div
               className={`group-title ${isExpanded ? 'expanded' : ''}`}
               onClick={() => toggleGroup(data.label)}
               style={{
                 // SASS styles for .group-title and .group-title.expanded
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 transition: 'margin-bottom 0.3s ease-in-out',
                 cursor: 'pointer',
                 backgroundColor: 'transparent',
                 
                 // Expanded state specific styles
                 ...(isExpanded && {
                   marginBottom: '0.5rem',
                   padding: '8px',
                   borderRadius: '0.25rem',
                   backgroundColor: '#30579d'
                 })
               }}
               onMouseEnter={(e) => {
                 if (!isExpanded) {
                   e.currentTarget.style.backgroundColor = 'transparent';
                 }
               }}
               onMouseLeave={(e) => {
                 if (!isExpanded) {
                   e.currentTarget.style.backgroundColor = 'transparent';
                 }
               }}
             >
              <span style={{
                // SASS styles for .group-title span
                fontSize: '1rem',
                fontWeight: '500',
                lineHeight: '1.5rem',
                color: isExpanded ? '#fff' : '#0B1426'
              }}>
                {data.label}
              </span>
              <img
                src={Icons.caret_black_down}
                alt="chevron-down"
                className={isExpanded ? 'rotate' : ''}
                style={{
                  // SASS styles for .group-title img
                  width: '16px',
                  height: '10px',
                  filter: isExpanded 
                    ? 'brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(0%) hue-rotate(255deg) brightness(103%) contrast(102%)'
                    : 'brightness(0) saturate(100%) invert(7%) sepia(38%) saturate(1013%) hue-rotate(182deg) brightness(99%) contrast(99%)',
                  transition: 'transform 0.3s ease-in-out',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </div>
            {isExpanded && (
              <div 
                className="group-list"
               
              >
                <components.Group {...props}>
                  {React.Children.map(children, (child, index) => {
                    if (React.isValidElement(child)) {
                      return React.cloneElement(child, {
                        ...child.props,
                        isLast: index === React.Children.count(children) - 1
                      });
                    }
                    return child;
                  })}
                </components.Group>
              </div>
            )}
          </div>
          <span 
            className={`separator ${isExpanded ? 'expanded' : ''}`}
            style={{
              // SASS styles for .separator
              width: '100%',
              borderBottom: '1px solid #e4eaf2',
              maxWidth: '100%',
              display: isExpanded ? 'none' : 'block',
              height: '1px',
              margin: '0'
            }}
          />
        </>
      );
    },

    Option: (props) => {
      const isSubExpanded = expandedSubGroups.includes(props.data.label);

      const handleOptionSelect = (subOption) => {
        // Single selection - only one can be selected
        setSelectedOption(subOption);
        if (onChange) {
          onChange(subOption.value);
        }
        setIsDropdownOpen(false);
      };

      const renderSubOptions = (subOptions) => (
        <div className="sub-options" >
          {subOptions.map((subOption, index) => {
            const isSelected = selectedOption && selectedOption.value === subOption.value;
            const isLast = index === subOptions.length - 1;

            return (
              <React.Fragment key={subOption.value}>
                <div
                  className={`select-option ${isSelected ? 'select-option__selected' : ''}`}
                  onClick={() => handleOptionSelect(subOption)}
                  style={{
                    // SASS styles for .select-option and .select-option__selected
                    padding: '8px',
                    paddingLeft: '32px',
                    fontSize: '1rem',
                    lineHeight: '1.5rem',
                    fontWeight: '500',
                    color: '#0B1426',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease-in-out',
                    overflowWrap: 'anywhere',
                   
                    
                    // Selected state
                    backgroundColor: isSelected ? '#E4EAF2' : 'transparent',
                    borderRadius: isSelected ? '4px' : '0.25rem',
                    
                    // Hover state
                    '&:hover': {
                      backgroundColor: '#e4eaf2'
                    }
                  }}
                >
                  <span className="option-label">{subOption.label}</span>
                  
                </div>
                {/* Only show separator if not the last option */}
                {!isLast && (
                  <span 
                    className="separator"
                    style={{
                      // SASS styles for .separator
                      width: '100%',
                      borderBottom: '1px solid #e4eaf2',
                      maxWidth: '100%',
                      display: 'block',
                      height: '1px',
                      margin: '8px 0'
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      );

      return (
        <>
                     <div 
             className={`sub-group ${isSubExpanded ? 'expanded' : ''}`}
             style={{
               // SASS styles for .sub-group and .sub-group.expanded
               cursor: isSubExpanded ? 'auto' : 'pointer',
               padding: isSubExpanded ? 'unset' : '8px',
               borderRadius: '4px',
               backgroundColor: 'transparent',
               transition: 'background-color 0.2s ease-in-out',
               
               // Hover state
               '&:hover': {
                 backgroundColor: isSubExpanded ? 'none' : '#e4eaf2'
               }
             }}
             onMouseEnter={(e) => {
               if (!isSubExpanded) {
                 e.currentTarget.style.backgroundColor = '#e4eaf2';
               }
             }}
             onMouseLeave={(e) => {
               if (!isSubExpanded) {
                 e.currentTarget.style.backgroundColor = 'transparent';
               }
             }}
           >
                         <div
               className={`sub-group-title ${isSubExpanded ? 'expanded' : ''}`}
               onClick={() => toggleSubGroup(props.data.label)}
               style={{
                
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 transition: 'margin-bottom 0.3s ease-in-out',
                 cursor: 'pointer',
                 backgroundColor: 'transparent',
                 color: '#183571',
                 
                 ...(isSubExpanded && {
                   marginBottom: '0.5rem',
                   padding: '8px',
                   borderRadius: '0.25rem',
                 })
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.backgroundColor = 'transparent';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.backgroundColor = 'transparent';
               }}
             >
              <span style={{
                fontSize: '1rem',
                fontWeight: '500',
                lineHeight: '1.5rem',
               
              }}>
                {props.data.label}
              </span>
              <img
                src={Icons.caret_black_down}
                alt="chevron-down"
                className={isSubExpanded ? 'rotate' : ''}
                style={{
                  // SASS styles for .sub-group-title img
                  width: '16px',
                  height: '10px',
                  transition: 'transform 0.3s ease-in-out',
                  transform: isSubExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </div>
            {isSubExpanded && renderSubOptions(props.data.subOptions)}
          </div>
          <span 
            className={`separator ${isSubExpanded ? 'expanded' : ''}`}
            style={{
              // SASS styles for .separator
              width: '100%',
              borderBottom: '1px solid #e4eaf2',
              maxWidth: '100%',
              display: isSubExpanded ? 'none' : 'block',
              height: '1px',
              margin: '8px 0'
            }}
          />
        </>
      );
    },
  };

  return (
    <div
      className="dropdown group-option-dropdown make-drop custom-group-dropdown sub-group-dropdown"
      ref={dropdownRef}
      style={{
        // SASS styles from _react-select.scss and _form.scss
        order: '2',
        position: 'relative',
        width: '100%',
        fontFamily: 'Poppins, sans-serif',
        
        // make-drop styles
        borderRadius: '4px',
        
        // disabled state
        opacity: (disabled || loading) ? '0.6' : '1',
        pointerEvents: (disabled || loading) ? 'none' : 'auto'
      }}
    >
      <Button
        onClick={toggleOpen}
        id={id +`-btn`}
        icon={
          <img
            src={Icons.caret_black_down}
            alt="chevron-down"
            className={isDropdownOpen ? "rotate" : ""}
            style={{
              // SASS styles for dropdown arrow
              width: '16px',
              height: '10px',
              transition: 'transform 0.3s ease-in-out',
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              filter: 'brightness(0) saturate(100%) invert(7%) sepia(38%) saturate(1013%) hue-rotate(182deg) brightness(99%) contrast(99%)'
            }}
          />
        }
        iconPosition="end"
        disabled={disabled || loading}
        className={`dropdown-button ${isDropdownOpen ? "opened" : ""} ${
          selectedOption ? "selected" : ""
        }`}
        style={{
          // SASS styles from _react-select.scss
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          fontSize: '1rem',
          fontWeight: '400',
          color: '#6b717d',
          backgroundColor: '#FFFFFF',
          borderRadius: '0.5rem',
          border: '1px solid #6B717D',
          outline: '1px solid transparent',
          width: '100%',
          cursor: 'pointer',
          transition: 'all 0.15s ease-in-out',
          
          // Hover state
          '&:hover': {
            color: '#6b717d',
            border: '1px solid #6B717D',
            outline: 'none'
          },
          
          // Opened state
          '&.opened': {
            border: '1px solid #6B717D',
            outline: 'none'
          },
          
          // Selected state
          '&.selected': {
            border: '1px solid #6B717D',
            outline: 'none'
          }
        }}
      >
        <span 
          className="selected-value"
          style={{
            // SASS styles from _react-select.scss
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '214px',
            color: selectedOption ? '#0B1426' : '#6b717d',
            fontWeight: selectedOption ? '500' : '400',
            flex: '1',
            textAlign: 'left'
          }}
        >
          {loading ? (
            <span>
              <Spin size="small" style={{ marginRight: 8 }} />
              {placeholderText || "Loading..."}
            </span>
          ) : selectedOption ? (
            selectedOption.label
          ) : (
            placeholderText || " "
          )}
        </span>
      </Button>
      {isDropdownOpen && !loading && (
        <>
          <div 
            className="dropdown-menu"
            style={{
              // SASS styles from _react-select.scss
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              width: '100%',
              height: 'fit-content',
              zIndex: '9',
              padding: '1rem',
              marginTop: '0.25rem',
              borderRadius: '0.5rem',
              border: '1px solid #6b717d',
              backgroundColor: '#FFFFFF',
              top: '100%',
              left: '0',
              right: '0'
            }}
          >
            {addNewOption && (
              <div 
                className="dropdown-header"
                style={{
                  // SASS styles from _react-select.scss
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
              >
                <button
                  className="button add-option-button add-option-button-light"
                  onClick={handleModalOpen}
                  style={{
                    // SASS styles from _react-select.scss
                    gap: '0.25rem',
                    width: 'fit-content',
                    height: '1.5rem',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem',
                    backgroundColor: '#FFFFFF',
                    border: '0.5px solid #183571',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    lineHeight: '1.25rem',
                    color: '#183571',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    
                    // Hover state
                    '&:hover': {
                      backgroundColor: '#183571',
                      color: '#FFFFFF'
                    }
                  }}
                >
                  <img 
                    src={Icons.plus} 
                    alt="add" 
                    style={{
                      width: '16px',
                      height: '16px',
                     
                    }}
                  />
                  <span>Add Vehicle Model</span>
                </button>
              </div>
            )}
            <div 
              className="dropdown-search"
              style={{
                // SASS styles from _react-select.scss
                position: 'relative'
              }}
            >
              <input
                type="text"
                placeholder="Search here..."
                value={searchQuery}
                onChange={handleSearch}
                disabled={loading}
                style={{
                  // SASS styles from _react-select.scss
                  height: '40px',
                  paddingRight: '40px',
                  width: '100%',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  backgroundColor: '#FFFFFF',
                  color: '#111827',
                  paddingLeft: '12px',
                  
                  // Focus state
                  '&:focus': {
                    borderColor: '#3B82F6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  },
                  
                  // Disabled state
                  '&:disabled': {
                    backgroundColor: '#F9FAFB',
                    color: '#9CA3AF',
                    cursor: 'not-allowed'
                  },
                  
                  // Placeholder
                  '&::placeholder': {
                    color: '#9CA3AF'
                  }
                }}
              />
              <img 
                src={Icons.magnifying_glass} 
                alt="search" 
                style={{
                  // SASS styles from _react-select.scss
                  position: 'absolute',
                  width: '16px',
                  height: '16px',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  filter: 'brightness(0) saturate(100%) invert(45%) sepia(16%) saturate(279%) hue-rotate(182deg) brightness(93%) contrast(89%)'
                }}
              />
            </div>
            <div style={{
              // SASS styles from _react-select.scss
              maxHeight: '500px',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              padding: '0'
            }}>
              <Select
                components={GroupedOptions}
                options={filteredOptions}
                value={selectedOption}
                onChange={handleOptionChange}
                isMulti={false}
                menuIsOpen={true}
                isClearable={false}
                id={id +`-select`}
                isSearchable={false}
                tabSelectsValue={false}
                hideSelectedOptions={false}
                backspaceRemovesValue={false}
                isDisabled={loading}
                styles={{
                  // SASS styles from _react-select.scss
                  control: (provided) => ({
                    ...provided,
                    display: 'none'
                  }),
                  menu: (provided) => ({
                    ...provided,
                    margin: 'unset',
                    position: 'unset',
                    borderRadius: 'unset',
                    backgroundColor: 'unset',
                    boxShadow: 'unset'
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    padding: 'unset',
                    maxHeight: '500px'
                  }),
                  group: (provided) => ({
                    ...provided,
                    padding: '0',
                    margin: '0'
                  }),
                  groupHeading: (provided) => ({
                    ...provided,
                    display: 'none'
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    padding: '8px',
                    fontSize: '1rem',
                    lineHeight: '1.5rem',
                    fontWeight: '500',
                    color: '#0B1426',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease-in-out',
                    overflowWrap: 'anywhere',
                    backgroundColor: state.isSelected ? '#E4EAF2' : 'transparent',
                    
                    // Hover state
                    '&:hover': {
                      backgroundColor: '#e4eaf2'
                    }
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: '#0B1426',
                    fontSize: '1rem'
                  }),
                  multiValue: (provided) => ({
                    ...provided,
                    backgroundColor: '#E4EAF2',
                    borderRadius: '4px',
                    margin: '2px'
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    color: '#0B1426',
                    fontSize: '12px',
                    padding: '2px 6px'
                  }),
                  multiValueRemove: (provided) => ({
                    ...provided,
                    color: '#6B717D',
                    padding: '2px',
                    
                    // Hover state
                    '&:hover': {
                      backgroundColor: '#D1D5DB',
                      color: '#374151'
                    }
                  })
                }}
              />
            </div>
          </div>
          <div 
            onClick={toggleOpen} 
            className="dropdown-blanket"
            style={{
              // SASS styles from _react-select.scss
              position: 'relative',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              zIndex: '1'
            }}
          />
          {isModalOpen && (
            <div ref={modalRef}>
              <AddModalSelect
                isModalOpen={isModalOpen}
                handleModalClose={handleModalClose}
                options={selectedOption ? [selectedOption] : []}
                modalTitle="Add a Vehicle Model"
                selectFieldLabel="Vehicle Make"
                selectPlaceholderText="Select vehicle make"
                formFieldLabel="Vehicle Model"
                formPlaceholderText="Enter vehicle model"
                buttonText="Add Vehicle Model"
                noDataHeading="No Vehicle Model Found!"
                nodataText="Please choose a vehicle make to view its corresponding models."
                selectOptions={selectOptions}
                groupedOptions={options}
                type={type}
                onSubmit={handleModalSubmit}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomSubGroupSelectSingle;
