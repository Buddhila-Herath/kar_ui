import React, { useState, useEffect, useRef } from "react";
import Select, { components } from "react-select";
import Icons from "../../utils/icons";
import AddModalSelect from "./AddModalSelect";
import { Checkbox, Button, ConfigProvider, Spin } from "antd";

const CustomSubGroupSelect = ({
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
  extraFieldEnabled = false,
  extraFieldLabel = "",
  extraFieldPlaceholder = "",
  id = ""
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [expandedSubGroups, setExpandedSubGroups] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(value || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isDropdownButtonHovered, setIsDropdownButtonHovered] = useState(false);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (value && Array.isArray(value)) {
      setSelectedOptions(
        value.map((v) => {
          if (typeof v === "string") {
            const matchedOption = options
              .flatMap((group) => group.options)
              .flatMap((make) => make.subOptions)
              .find((model) => model.value === v);
            return matchedOption
              ? { label: matchedOption.label, value: v }
              : { label: v, value: v }; // Fallback in case not found
          }
          return v;
        })
      );
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
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isModalOpen]);

  const filteredOptions = options.filter(
    (group) =>
      group.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.subOptions &&
        group.subOptions.some((sub) =>
          sub.label.toLowerCase().includes(searchQuery.toLowerCase())
        ))
  );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleOpen = () => {
    if (!loading && !disabled) setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isDropdownOpen) {
      const expandedGroups = [];
      const expandedSubGroups = [];
      selectedOptions.forEach(opt => {
        options.forEach(group => {
          group.options?.forEach(subGroup => {  
            if (subGroup.subOptions?.some(item => item.value === opt.value)) {
              if (!expandedGroups.includes(group.label)) {
                expandedGroups.push(group.label);
              }
              if (!expandedSubGroups.includes(subGroup.label)){
                expandedSubGroups.push(subGroup.label);
              }
            }
          });
        });
      });
      setExpandedGroups(expandedGroups);
      setExpandedSubGroups(expandedSubGroups);
    }
  }, [isDropdownOpen, selectedOptions, options]);
  
  useEffect(() => {
    if (!isDropdownOpen) {
      setExpandedGroups([]); 
      setExpandedSubGroups([]);
    }
  }, [isDropdownOpen]);
  
  const handleOptionChange = (selectedOptions) => {
    if (!selectedOptions) {
      setSelectedOptions([]);
      return;
    }

    setSelectedOptions(selectedOptions);
    if (onChange) {
      onChange(selectedOptions);
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

  const handleRemoveOption = (optionToRemove) => {
    const updatedOptions = selectedOptions.filter(
      (opt) => opt.value !== optionToRemove.value
    );
    setSelectedOptions(updatedOptions);

    if (onChange) {
      onChange(updatedOptions.map((opt) => opt.value));
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

  const GroupedOptions = {
    Group: (props) => {
      const { data, children } = props;
      const isExpanded = expandedGroups.includes(data.label);

      return (
        <>
          <div 
            className={`group ${isExpanded ? 'expanded' : ''}`}
            style={{
              cursor: isExpanded ? 'auto' : 'pointer',
              padding: isExpanded ? 'unset' : '8px',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              transition: 'background-color 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              if (!isExpanded) {
                e.currentTarget.style.backgroundColor = '#e4eaf2';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div
              className={`group-title ${isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleGroup(data.label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'margin-bottom 0.3s ease-in-out',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                ...(isExpanded && {
                  marginBottom: '0.5rem',
                  padding: '8px',
                  borderRadius: '0.25rem',
                  backgroundColor: '#30579d'
                })
              }}
            >
              <span style={{
                fontSize: '1rem',
                fontWeight: '500',
                lineHeight: '1.5rem',
                color: isExpanded ? '#fff' : '#0B1426',
                padding: '0px',
                marginBottom: '0'
              }}>{data.label}</span>
              <img
                src={Icons.caret_black_down}
                alt="chevron-down"
                className={isExpanded ? 'rotate' : ''}
                style={{
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
                <components.Group {...props}>{children}</components.Group>
              </div>
            )}
          </div>
          <span 
            className={`separator ${isExpanded ? 'expanded' : ''}`}
            style={{
              width: '100%',
              borderBottom: '1px solid #e4eaf2',
              maxWidth: '100%',
              display: isExpanded ? 'none' : 'block',
              height: '1px',
              margin: ' 0'
            }}
          />
        </>
      );
    },

    Option: (props) => {
      const isSubExpanded = expandedSubGroups.includes(props.data.label);

      const handleCheckboxChange = (subOption) => {
      
        setSelectedOptions((prevSelected) => {
          const isSelected = prevSelected.some(
            (option) => option.value === subOption.value
          );
      
          const updatedSelection = isSelected
            ? prevSelected.filter((option) => option.value !== subOption.value)
            : [...prevSelected, subOption];
      
      
          if (onChange) {
            const selectedValues = updatedSelection.map((option) => option.value);
            onChange(selectedValues);
          }
      
          return updatedSelection;
        });
      
      };

      const renderSubOptions = (subOptions) => (
        <div 
          className="sub-options"
          style={{
            padding: '0',
            margin: '0'
          }}
        >
          {subOptions.map((subOption) => {
            const isSelected = selectedOptions.some(
              (selected) => selected.value === subOption.value
            );

            return (
              <React.Fragment key={subOption.value}>
                <div
                  className={`checkbox-option ${isSelected ? 'checkbox-option__selected' : ''}`}
                  onClick={() => handleCheckboxChange(subOption)}
                  style={{
                    color: '#0B1426',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease-in-out',
                    overflowWrap: 'anywhere',
                    backgroundColor: isSelected ? '#E4EAF2' : 'transparent',
                    marginBottom: '0px',
                    fontWeight: '500',
                  
                    ...(isSelected && {
                      borderRadius: '4px'
                    })
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e4eaf2';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
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
                      checked={isSelected}
                      style={{
                        marginBottom: '0px'
                      }}
                    >
                      <span style={{
                        fontWeight: '400'
                      }}>
                        {subOption.label}
                      </span>
                    </Checkbox>
                  </ConfigProvider>
                </div>
                <span 
                  className="separator"
                  style={{
                    width: '100%',
                    borderBottom: '1px solid #e4eaf2',
                    maxWidth: '100%',
                    display: 'block',
                    height: '1px',
                    margin: '8px 0'
                  }}
                />
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
              cursor: isSubExpanded ? 'auto' : 'pointer',
              padding: isSubExpanded ? 'unset' : '8px',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              transition: 'background-color 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              if (!isSubExpanded) {
                e.currentTarget.style.backgroundColor = '#e4eaf2';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
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
                color:  '#183571',
                 
                 ...(isSubExpanded && {
                   marginBottom: '0.5rem',
                   padding: '8px',
                   borderRadius: '0.25rem',
                   
                 })
               }}
                               onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'unset';
                  e.currentTarget.style.setProperty('background-color', 'unset', 'important');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'unset';
                  e.currentTarget.style.setProperty('background-color', 'unset', 'important');
                }}
             >
                             <span style={{
                 fontSize: '1rem',
                 fontWeight: '500',
                 lineHeight: '1.5rem',
                 
                 padding: '0px',
                 marginBottom: '0'
               }}>{props.data.label}</span>
              <img
                src={Icons.caret_black_down}
                alt="chevron-down"
                className={isSubExpanded ? 'rotate' : ''}
                style={{
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
        order: '2',
        position: 'relative',
        width: '100%',
        fontFamily: 'Poppins, sans-serif',
        borderRadius: '4px'
      }}
    >
              <Button
          onClick={toggleOpen}
          onMouseEnter={() => setIsDropdownButtonHovered(true)}
          onMouseLeave={() => setIsDropdownButtonHovered(false)}
          disabled={disabled || loading}
          id={id +`-btn`}
          icon={
            <img
              src={Icons.caret_black_down}
              alt="chevron-down"
              className={isDropdownOpen ? "rotate" : ""}
              style={{
                width: '16px',
                height: '10px',
                transition: 'transform 0.3s ease-in-out',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                filter: 'brightness(0) saturate(100%) invert(7%) sepia(38%) saturate(1013%) hue-rotate(182deg) brightness(99%) contrast(99%)'
              }}
            />
          }
          iconPosition="end"
          className={`dropdown-button ${isDropdownOpen ? "opened" : ""} ${
            selectedOptions.length ? "selected" : ""
          }`}
          style={{
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
            color: '#6b717d',
            border: isDropdownButtonHovered ? '1px solid #6B717D' : '1px solid #6B717D',
            outline: isDropdownButtonHovered ? 'none' : '1px solid transparent'
          }}
        >
                  <span 
            className="selected-value"
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: '1'
            }}
          >
            {loading ? (
              <span style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <Spin size="small" style={{ marginRight: 8 }} />
                {placeholderText || "Loading..."}
              </span>
            ) : selectOptions ? (
              selectOptions.label
            ) : (
              placeholderText || " "
            )}
          </span>
        <div 
          className="selected-options"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            alignItems: 'center'
          }}
        >
          {loading
            ? null
            : selectedOptions.length === 0
            ? placeholderText
            : selectedOptions.slice(0, 2).map((opt) => (
                                 <div 
                   key={opt.value} 
                   className="tag-container"
                  
                 >
                   <span 
                     className="tag-label"
                     style={{
                       color: '#0B1426',
                       fontSize: '12px'
                     }}
                   >
                     {opt.label}
                   </span>
                   <img
                     src={Icons.close_icon}
                     alt="remove"
                     className="tag-remove-icon"
                     
                     onClick={(e) => {
                       e.stopPropagation();
                       handleRemoveOption(opt);
                       if (onChange) {
                         onChange(
                           selectedOptions
                             .filter((item) => item.value !== opt.value)
                             .map((item) => item.value)
                         );
                       }
                     }}
                   />
                 </div>
              ))}
          {!loading && selectedOptions.length > 2 && (
                         <div 
               className="tag-container"
              
             >
               <span 
                 className="tag-label"
                 style={{
                   color: '#0B1426',
                   fontSize: '12px',
                   padding: '0px',
                   marginBottom: '0'
                 }}
               >
                 +{selectedOptions.length - 2}
               </span>
             </div>
          )}
        </div>
      </Button>
      {isDropdownOpen && !loading && (
        <>
          <div 
            className="dropdown-menu"
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
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <button
                className="button add-option-button"
                onClick={handleModalOpen}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                style={{
                  gap: '0.25rem',
                  width: 'fit-content',
                  height: '1.5rem',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '0.25rem',
                  backgroundColor: isButtonHovered ? '#183571' : '#FFFFFF',
                  border: '0.5px solid #183571',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  lineHeight: '1.25rem',
                  color: isButtonHovered ? '#FFFFFF' : '#183571',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
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
                disabled={loading}
                style={{
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
                  borderColor: isSearchFocused ? '#3B82F6' : '#D1D5DB',
                  boxShadow: isSearchFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
                }}
              />
              <img 
                src={Icons.magnifying_glass} 
                alt="search"
                style={{
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
                value={selectedOptions}
                onChange={handleOptionChange}
                isMulti={true}
                menuIsOpen={true}
                isClearable={false}
                isSearchable={false}
                tabSelectsValue={false}
                hideSelectedOptions={false}
                backspaceRemovesValue={false}
                isDisabled={loading}
                styles={{
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
                options={selectedOptions}
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

export default CustomSubGroupSelect;
