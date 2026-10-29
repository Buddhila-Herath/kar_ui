import React, { useState, useEffect, useRef } from 'react';
import Select, { components } from 'react-select';
import { Button } from 'antd';
import Icons from '../../utils/icons';

// Custom Option with separator for all options (before every option)
const Option = (props) => (
  <>
    <span className="separator" />
    <components.Option {...props} />
  </>
);

const GroupSelect = ({ id = "", groupedOptions, placeholderText, onChange, required, value, isValid,disabled }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (value) {
      let selected = null;
      selected = groupedOptions.find(option => option.value === value);
      if (!selected) {
        groupedOptions.forEach(group => {
          const subType = group.options?.find(sub => sub.value === value);
          if (subType) selected = subType;
        });
      }
      setSelectedOption(selected);
    } else {
      setSelectedOption(null);
    }
  }, [value, groupedOptions]);

  const toggleOpen = () => {
    setIsDropdownOpen(prev => !prev);
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

  const toggleGroup = (label) => {
    setExpandedGroup(prev => (prev === label ? null : label));
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    const group = groupedOptions.find(group =>
      group.options?.some(item => item.value === option.value)
    );
    setExpandedGroup(group?.label || null);
    toggleOpen();
    if (onChange) {
      onChange(option);
    }
  };

  const Group = (props) => {
    const { data, isExpanded, toggleGroup, children } = props;
    const isSelectedGroup =
      selectedOption &&
      data.options?.some(option => option.value === selectedOption.value);

    return (
      <div className={`group ${isExpanded ? 'expanded select-expand' : ''} ${isSelectedGroup ? 'selected-group' : ''}`}>
        <div
          className={`group-title ${isExpanded ? 'expanded select-expand' : ''} ${isSelectedGroup ? 'selected-group' : ''}`}
          onClick={() => toggleGroup(data.label)}
        >
          <span>{data.label}</span>
          <img
            src={Icons.caret_black_down}
            alt="chevron-down"
            className={isExpanded ? "rotate" : ""}
          />
        </div>
        {isExpanded && (
          <div className="group-list">
            <components.Group {...props}>{children}</components.Group>
          </div>
        )}
      </div>
    );
  };

  const customComponents = {
    Group: (props) => (
      <Group
        {...props}
        isExpanded={expandedGroup === props.data.label}
        toggleGroup={toggleGroup}
      />
    ),
    Option,
  };

  return (
    <div className="dropdown group-option-dropdown group-selection-drop-down" ref={dropdownRef}>
      <Button
        onClick={toggleOpen}
        disabled={disabled}
        icon={<img src={Icons.caret_black_down} alt="chevron-down" className={isDropdownOpen ? 'rotate' : ''} />}
        iconPosition="end"
        id={id +`-btn`}
        className={`dropdown-button ${isDropdownOpen ? 'opened' : ''} ${selectedOption ? 'selected' : ''} ${required ? 'required' : ''} ${isValid ? 'invalid' : ''}`}
      >
        {selectedOption ? `${selectedOption.label}` : placeholderText || ' '}
      </Button>

      {isDropdownOpen && (
        <>
          <div className="dropdown-menu">
            <Select
              components={customComponents}
              options={groupedOptions}
              value={selectedOption}
              onChange={handleOptionChange}
              menuIsOpen={true}
              isSearchable={false}
              tabSelectsValue={false}
              hideSelectedOptions={false}
              controlShouldRenderValue={false}
              id={id}
            />
          </div>
          <div onClick={toggleOpen} className="dropdown-blanket" />
        </>
      )}
    </div>
  );
};

export default GroupSelect;