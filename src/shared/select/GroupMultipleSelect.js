import React, { useState, useEffect, useRef } from 'react';
import Select, { components } from 'react-select';
import Icons from '../../utils/icons';
import { Checkbox, Button, ConfigProvider } from 'antd';

const GroupMultipleSelect = ({ id = "", groupedOptions, placeholderText, value, onChange, required, isValid,disabled }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(value || []);
  const dropdownRef = useRef(null);

  const toggleOpen = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      !event.target.closest(".pop-filter-btn")
    ) {
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
    if (onChange) {
      onChange(selectedOptions);
    }

    if (!selectedOptions || selectedOptions.length === 0) {
      setExpandedGroups([]);
      return;
    }

    const group = groupedOptions.find((group) =>
      group.options?.some((item) => item.value === selectedOptions[selectedOptions.length - 1].value)
    );
    if (group?.label && !expandedGroups.includes(group.label)) {
      setExpandedGroups((prev) => [...prev, group.label]);
    }
  };

  useEffect(() => {
    if (value && value !== selectedOptions) {
      setSelectedOptions(value);
    }
  }, [value]);

  useEffect(() => {
    const flatOptions = (groupedOptions || []).flatMap((group) => [group, ...(group.options || [])]);
    if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) return;

    const reconciled = selectedOptions
      .map((opt) => flatOptions.find((o) => String(o.value) === String(opt.value)))
      .filter(Boolean);

    if (reconciled.length !== selectedOptions.length ||
        JSON.stringify(reconciled.map((o) => o.value)) !== JSON.stringify(selectedOptions.map((o) => o.value))) {
      setSelectedOptions(reconciled);
    }
  }, [groupedOptions]);

  const handleRemoveOption = (optionToRemove) => {
    const updatedOptions = selectedOptions.filter((opt) => opt.value !== optionToRemove.value);
    setSelectedOptions(updatedOptions);
    if (onChange) {
      onChange(updatedOptions);
    }
  };

  const GroupedOptions = {
    Group: (props) => {
      const { data, children } = props;
      const isExpanded = expandedGroups.includes(data.label);

      return (
        <div className={`group ${isExpanded ? 'expanded' : ''}`}>
          <div
            className={`group-title ${isExpanded ? 'expanded' : ''}`}
            onClick={() => toggleGroup(data.label)}
          >
            <span>{data.label}</span>
            <img
              src={Icons.caret_black_down}
              alt="chevron-down"
              className={isExpanded ? 'rotate' : ''}
            />
          </div>
          {isExpanded && (
            <div className="group-list">
              <components.Group {...props}>{children}</components.Group>
            </div>
          )}
        </div>
      );
    },
    Option: (props) => {
      return (
        <div className="multi-checkbox-opts" id={`group-multi-select-${props?.data?.label?.replaceAll(" ", "-")}`}>
          <div className="checkbox-option"  id={`group-multi-select-value-${props?.data?.label?.replaceAll(" ", "-")}`} onClick={() => props.selectOption(props.data)}>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#183571',
                  colorBorder: '#183571',
                },
              }}
            >
              <Checkbox
                key={props.data.value}
                checked={props.isSelected}
                id={`group-multi-select-checkbox-${props?.data?.label?.replaceAll(" ", "-")}`}
              >
                {props.data.label}
              </Checkbox>
            </ConfigProvider>
          </div>
          <span className="separator" />
        </div>

      );
    },
  };

  return (
    <div className="multi-group dropdown group-option-dropdown custom-group-dropdown group-multiple-dropdown " ref={dropdownRef}>
      <Button
        onClick={toggleOpen}
        disabled={disabled}
        icon={<img src={Icons.caret_black_down} alt="chevron-down" className={isDropdownOpen ? 'rotate' : ''} />}
        iconPosition="end"
        id={`form-multi-select-${placeholderText?.replaceAll(' ','-')}`}
        className={`dropdown-button ${isDropdownOpen ? 'opened' : ''} ${selectedOptions.length ? 'selected' : ''} ${required ? "required" : ""} ${isValid ? "invalid" : ""}`}
      >
        <div className="selected-options">
          {selectedOptions.length === 0
            ? placeholderText
            : selectedOptions.slice(0, 2).map((opt) => (
              <div key={opt.value} className=" tag-container">
                <span className="tag-label">{opt.label}</span>
                <img
                  src={Icons.close_icon}
                  alt="remove"
                  className="tag-remove-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveOption(opt);
                  }}
                   id={`group-multi-select-value-close-${opt?.label?.replaceAll(" ", "-")}`}
                />
              </div>
            ))}
          {selectedOptions.length > 2 && (
            <div className="tag-container">
              <span className="tag-label">+{selectedOptions.length - 2}</span>
            </div>
          )}
        </div>
      </Button>
      {isDropdownOpen && (
        <>
          <div className="dropdown-menu">
            <Select
              components={{ ...GroupedOptions }}
              options={groupedOptions}
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
              id={id}
            />
          </div>
          <div
            onClick={toggleOpen}
            className="dropdown-blanket"
          />
        </>
      )}
    </div>
  );
};

export default GroupMultipleSelect;
