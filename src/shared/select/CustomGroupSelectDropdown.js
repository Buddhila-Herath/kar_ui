import React, { useState, useMemo, useEffect, useRef } from 'react';
import Select, { components } from 'react-select';
import Icons from '../../utils/icons';
import AddModalSelect from './AddModalSelect';

const CustomGroupSelectDropdown = ({ 
  groupedOptions, 
  dropdownPlaceholderText, 
  modalDropdownPlaceholderText, 
  selectOptions,
  onChange,
  onAddFormData,
  type,
  value,
  disabled,
  addNewOption = true,
  isMulti = false,
  loading = false,
  id = "",
}) => {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {  
    if (value) {
      if (isMulti && Array.isArray(value)) {
        const mappedOptions = value.map(val => {
          for (const group of groupedOptions) {
            const option = group.options?.find(opt => opt.value === val);
            if (option) return option;
          }
          return null;
        }).filter(opt => opt !== null);
    
        setSelectedOption(mappedOptions);
      } else if (!isMulti) {
        for (const group of groupedOptions) {
          const option = group.options?.find(opt => opt.value === value);
          if (option) {
            setSelectedOption(option);
            break;
          }
        }
      }
    } else {
      setSelectedOption(isMulti ? [] : null);
    }
  }, [value, groupedOptions, isMulti]);

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
    if (!disabled) {
      setSearchQuery(e.target.value);
    }
  };
  
 
  const toggleOpen = () => {
    if (!disabled) setIsDropdownOpen((prev) => !prev);
  };

  const toggleGroup = (label) => {
    if (!disabled) {
      setExpandedGroups((prev) =>
        Array.isArray(prev)
          ? prev.includes(label)
            ? prev.filter((group) => group !== label)
            : [...prev, label]
          : []
      );
    }
  };

  const handleOptionChange = (selectedOption) => {
    setSelectedOption(selectedOption);

    if (onChange) {
      if (isMulti) {
        const selectedValues = selectedOption ? selectedOption.map(option => option.value) : [];
        onChange(selectedValues);
      } else {
        onChange(selectedOption ? selectedOption.value : null);
        // Close dropdown for single-select after selection
        setIsDropdownOpen(false);
      }
    }

    if (!selectedOption || (isMulti && selectedOption.length === 0)) {
      setExpandedGroups([]);
      return;
    }

    if (isMulti) {
      const group = groupedOptions.find((group) =>
        group.subOptions?.some((item) => item.value === selectedOption[selectedOption.length - 1].value)
      );
      if (group?.label && !expandedGroups.includes(group.label)) {
        setExpandedGroups((prev) => [...prev, group.label]);
      }
    } else {
      const group = groupedOptions.find((group) =>
        group.subOptions?.some((item) => item.value === selectedOption.value)
      );
      if (group?.label && !expandedGroups.includes(group.label)) {
        setExpandedGroups((prev) => [...prev, group.label]);
      }
    }
  };

  const handleRemoveOption = (optionToRemove) => {
    if (isMulti) {
      const updatedOptions = selectedOption.filter((opt) => opt.value !== optionToRemove.value);
      setSelectedOption(updatedOptions);

      if (onChange) {
        onChange(updatedOptions.map((opt) => opt.value));
      }
    }
  };

  const handleModalOpen = () => {
    if (!disabled) {
      setIsModalOpen(true);
      setIsDropdownOpen(true);
    }
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
              
              // Hover state
              '&:hover': {
                backgroundColor: isExpanded ? 'unset' : '#e4eaf2'
              },
              
              // Expanded state specific styles
              ...(isExpanded && {
                padding: 'unset',
                '@media (max-width: 768px)': {
                  paddingRight: '10px'
                }
              })
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
                
                // Expanded state specific styles
                ...(isExpanded && {
                  marginBottom: '0.5rem',
                  padding: '8px',
                  borderRadius: '0.25rem',
                  backgroundColor: '#30579d'
                })
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
            className={`select-option ${props.isSelected ? 'select-option__selected' : ''}`}
            onClick={() => props.selectOption(props.data)}
            style={{
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
              backgroundColor: props.isSelected ? '#E4EAF2' : 'transparent',
              borderRadius: props.isSelected ? '4px' : '0.25rem',
              '&:hover': {
                backgroundColor: '#e4eaf2'
              }
            }}
          >
            <span className="option-label">{props.data.label}</span>
            
          </div>
          {/* Only show separator if not the last option */}
          {!props.isLast && (
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
          )}
        </>
      )
    },
  };

  const getDisplayText = () => {
    if (!selectedOption || (isMulti && selectedOption.length === 0)) {
      return dropdownPlaceholderText;
    }
    
    if (isMulti) {
      if (selectedOption.length === 1) {
        return selectedOption[0].label;
      } else if (selectedOption.length === 2) {
        return `${selectedOption[0].label}, ${selectedOption[1].label}`;
      } else {
        return `${selectedOption[0].label}, ${selectedOption[1].label} +${selectedOption.length - 2}`;
      }
    } else {
      return selectedOption.label;
    }
  };

  return (
         <div 
           className={`dropdown group-option-dropdown make-drop custom-group-dropdown ${disabled ? 'disabled' : ''}`} 
           style={{
             // SASS styles from _react-select.scss and _form.scss
             order: '2',
             position: 'relative',
             width: '100%',
             fontFamily: 'Poppins, sans-serif',
             // make-drop styles
             borderRadius: '4px',
             // disabled state
             opacity: disabled ? '0.6' : '1',
             pointerEvents: disabled ? 'none' : 'auto'
           }}
           ref={dropdownRef}
         >
       <button
         onClick={toggleOpen}
         disabled={disabled || loading}
         id={id +`-btn`}
         className={`dropdown-button ${isDropdownOpen ? 'opened' : ''} ${selectedOption ? 'selected' : ''}`}
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
           className="selected-text"
           style={{
             // SASS styles from _react-select.scss
             overflow: 'hidden',
             textOverflow: 'ellipsis',
             whiteSpace: 'nowrap',
             maxWidth: '214px',
             color: selectedOption ? '#0B1426' : '#6b717d',
             fontWeight: selectedOption ? '500' : '400',
             flex: '1',
             textAlign: 'left',
           }}
         >
           {getDisplayText()}
         </span>
         <img 
           src={Icons.caret_black_down} 
           alt="chevron-down" 
           className={`dropdown-arrow ${isDropdownOpen ? 'rotate' : ''}`} 
           style={{
             // SASS styles from _react-select.scss
             width: '16px',
             height: '10px',
             transition: 'transform 0.3s ease-in-out',
             transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
             filter: 'brightness(0) saturate(100%) invert(7%) sepia(38%) saturate(1013%) hue-rotate(182deg) brightness(99%) contrast(99%)'
           }}
         />
       </button>
       
       {isDropdownOpen && (
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
                   id={id +`-add-option-btn`}
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
                  disabled={disabled}
                  id={id +`-search`}
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
                 id={id +`-select`}
                 components={{ ...GroupedOptions }}
                 options={filteredOptions}
                 value={selectedOption}
                 onChange={handleOptionChange}
                 isMulti={isMulti}
                 menuIsOpen={true}
                 isClearable={false}
                 isSearchable={false}
                 tabSelectsValue={false}
                 closeMenuOnSelect={!isMulti}
                 hideSelectedOptions={false}
                 backspaceRemovesValue={false}
                 isDisabled={disabled}
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
             id={id +`-blanket`}
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
             <div ref={modalRef} id={id +`-modal`}>
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
               />
             </div>
           )}
         </>
       )}
     </div>
   );
};

export default CustomGroupSelectDropdown;
