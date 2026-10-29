import React, { useState, useMemo, useEffect, useRef } from 'react';
import Select, { components } from 'react-select';
import Icons from '../../utils/icons';
import AddModalSelect from './AddModalSelect';
import { Checkbox, Button, ConfigProvider } from 'antd';

const CustomGroupSelect = ({ 
  groupedOptions, 
  dropdownPlaceholderText, 
  modalDropdownPlaceholderText, 
  selectOptions,
  onChange,
  onAddFormData,
  type,
  value,
  addNewOption = true,
  extraFieldEnabled = false,
  extraFieldLabel = "",
  extraFieldPlaceholder = "",
  disabled = false,
  id = ""
}) => {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isDropdownButtonHovered, setIsDropdownButtonHovered] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {  
    if (value && Array.isArray(value)) {
      const mappedOptions = value.map(val => {
        for (const group of groupedOptions) {
          const option = group.options?.find(opt => opt.value === val);
          if (option) return option;
        }
        return null;
      }).filter(opt => opt !== null);
  
      setSelectedOptions(mappedOptions);  
    } else {
      setSelectedOptions([]); 
    }
  }, [value, groupedOptions]);

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
    
  const filteredOptions = useMemo(() => {
    return groupedOptions.map(group => ({
      ...group,
      subOptions: group.subOptions
        ? group.subOptions.filter(sub => sub.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : [],
    })).filter(group =>
      group.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.subOptions && group.subOptions.length > 0)
    );
  }, [searchQuery, groupedOptions]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const toggleOpen = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isDropdownOpen) {
      const expanded = [];
      selectedOptions.forEach(opt => {
        groupedOptions.forEach(group => {
          if (group.options?.some(item => item.value === opt.value)) {
            if (!expanded.includes(group.label)) {
              expanded.push(group.label);
            }
          }
        });
      });
      setExpandedGroups(expanded);
    }
  }, [isDropdownOpen, selectedOptions, groupedOptions]);
  
  useEffect(() => {
    if (!isDropdownOpen) {
      setExpandedGroups([]); 
    }
  }, [isDropdownOpen]);
  
  const toggleGroup = (label) => {
    setExpandedGroups((prev) =>
      Array.isArray(prev)
        ? prev.includes(label)
          ? prev.filter((group) => group !== label)
          : [...prev, label]
        : []
    );
  };

  const handleOptionChange = (selectedOptions) => {
    setSelectedOptions(selectedOptions);

    const selectedValues = selectedOptions.map(option => option.value);
    if (onChange) {
      onChange(selectedValues);
    }

    if (!selectedOptions || selectedOptions.length === 0) {
      setExpandedGroups([]);
      return;
    }

    const group = groupedOptions.find((group) =>
      group.subOptions?.some((item) => item.value === selectedOptions[selectedOptions.length - 1].value)
    );
    if (group?.label && !expandedGroups.includes(group.label)) {
      setExpandedGroups((prev) => [...prev, group.label]);
    }
  };

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
                padding: 'unset'
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
              id={`${id || "custom-group-select"}-group-${data.label.replace(/\s+/g, '-').toLowerCase()}`}
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
                 fontWeight: '500px',
                 lineHeight: '1.5rem',
                 color: isExpanded ? '#fff' : '#0B1426',
                 padding: '0px',
                 marginBottom: '0'
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
                style={{
                  padding: '0',
                  margin: '0'
                }}
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
      return (
        <>
          <div
            className={`checkbox-option ${props.isSelected ? 'checkbox-option__selected' : ''}`}
            onClick={() => props.selectOption(props.data)}
            style={{
              color: '#0B1426',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              transition: 'all 0.1s ease-in-out',
              overflowWrap: 'anywhere',
              backgroundColor: 'transparent',
              marginBottom: '0px',
             
              fontWeight: '500',
              ...(props.isSelected && {
                backgroundColor: '#E4EAF2',
                borderRadius: '4px'
              })
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e4eaf2';
            }}
            onMouseLeave={(e) => {
              if (!props.isSelected) {
                e.currentTarget.style.backgroundColor = 'transparent';
              } else {
                e.currentTarget.style.backgroundColor = '#E4EAF2';
              }
            }}
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
                     checked={props.isSelected}
                     id={`${id || "custom-group-select"}-option-${props.data.value}`}
                     style={{
                       marginBottom: '0px',
                       paddingLeft: '32px ',
                     }}
                 >
                     <span style={{
                       fontWeight: '400'
                     }}>
                       {props.data.label}
                     </span>
                 </Checkbox>
             </ConfigProvider>
          </div>
          {!props.isLast && (
            <span 
              className="separator"
              style={{
                // SASS styles for .separator
                width: '100%',
                borderBottom: '1px solid #e4eaf2',
                maxWidth: '100%',
                display: 'block',
                height: '1px',
                margin: '8px 0',
                fontWeight: '400 !important',
              }}
            />
          )}
        </>
      )
    },
  };

  return (
    <div 
      className="dropdown group-option-dropdown make-drop custom-group-dropdown" 
      ref={dropdownRef}
      id={id || "custom-group-select"}
      style={{
        // SASS styles from _react-select.scss and _form.scss
        order: '2',
        position: 'relative',
        width: '100%',
        fontFamily: 'Poppins, sans-serif',
        
        // make-drop styles
        borderRadius: '4px'
      }}
    >
              <Button
          onClick={toggleOpen}
          disabled={disabled}
          onMouseEnter={() => setIsDropdownButtonHovered(true)}
          onMouseLeave={() => setIsDropdownButtonHovered(false)}
          id={id +`-btn`}
          icon={
          <img 
            src={Icons.caret_black_down} 
            alt="chevron-down" 
            className={isDropdownOpen ? 'rotate' : ''} 
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
        className={`dropdown-button ${isDropdownOpen ? 'opened' : ''} ${selectedOptions.length ? 'selected' : ''}`}
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
          
          // States handled by className and CSS
          color: '#6b717d',
          border: isDropdownButtonHovered ? '1px solid #6B717D' : '1px solid #6B717D',
          outline: isDropdownButtonHovered ? 'none' : '1px solid transparent'
        }}
      >
        <div 
          className="selected-options"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            alignItems: 'center'
          }}
        >
          {selectedOptions.length === 0
            ? dropdownPlaceholderText
            : selectedOptions.slice(0, 2).map((opt) => (
              <div key={opt.value} className="tag-container" >
                <span className="tag-label" style={{
                 
                }}>{opt.label}</span>
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
            <div className="tag-container" style={{
             
            }}>
              <span className="tag-label" style={{
                
              }}>+{selectedOptions.length - 2}</span>
            </div>
          )}
        </div>
      </Button>
      {isDropdownOpen && (
        <>
          <div 
            className="dropdown-menu"
            id={`${id || "custom-group-select"}-dropdown-menu`}
            style={{
              
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
                  className="button add-option-button" 
                  onClick={handleModalOpen}
                  onMouseEnter={() => setIsButtonHovered(true)}
                  onMouseLeave={() => setIsButtonHovered(false)}
                  id={`${id || "custom-group-select"}-add-option-button`}
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
                    
                    // Hover state - handled by onMouseEnter/onMouseLeave
                    backgroundColor: isButtonHovered ? '#183571' : '#FFFFFF',
                    color: isButtonHovered ? '#FFFFFF' : '#183571'
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
                  <span>Add Vehicle Make</span>
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
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  id={`${id || "custom-group-select"}-search-input`}
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
                    
                    // Focus state - handled by onFocus/onBlur
                    borderColor: isSearchFocused ? '#3B82F6' : '#D1D5DB',
                    boxShadow: isSearchFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
                  }}
                                     // Add placeholder styles
                   onInput={(e) => {
                     e.target.style.setProperty('--placeholder-color', '#9CA3AF');
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
            <div 
              id={`${id || "custom-group-select"}-options-container`}
              style={{
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
                components={{ ...GroupedOptions }}
                options={filteredOptions}
                value={selectedOptions}
                onChange={handleOptionChange}
                isMulti={true}
                menuIsOpen={true}
                isClearable={false}
                isSearchable={false}
                tabSelectsValue={false}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                backspaceRemovesValue={false}
                inputId={`${id || "custom-group-select"}-select-input`}
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
                    backgroundColor: state.isSelected ? '#E4EAF2' : 'transparent'
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
                    backgroundColor: 'transparent'
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
            <div ref={modalRef} id={`${id || "custom-group-select"}-modal-container`}>
              <AddModalSelect
                isModalOpen={isModalOpen}
                handleModalClose={handleModalClose}
                modalTitle="Add a Vehicle Make"
                selectFieldLabel="Vehicle Make Category"
                selectPlaceholderText={modalDropdownPlaceholderText}
                formFieldLabel="Vehicle Make"
                formPlaceholderText="Enter vehicle make"
                buttonText="Add Vehicle Make"
                noDataHeading="No Vehicle Make Category!"
                nodataText="Please choose a vehicle make category to view its corresponding vehicle make."
                selectOptions={selectOptions}
                groupedOptions={groupedOptions}
                type={type}
                onSubmit={handleModalSubmit}
                extraFieldEnabled={extraFieldEnabled}
                extraFieldLabel={extraFieldLabel}
                extraFieldPlaceholder={extraFieldPlaceholder}
                id={`${id || "custom-group-select"}-add-modal`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomGroupSelect;
