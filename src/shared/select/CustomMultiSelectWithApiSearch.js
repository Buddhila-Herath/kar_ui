import React, { useState, useMemo, useEffect, useRef } from "react";
import Select, { components } from "react-select";
import Icons from "../../utils/icons";
import { Checkbox, Button, ConfigProvider } from "antd";
import Spinner from "../components/loaders/Spinner";

const CustomMultiSelectWithApiSearch = ({
  groupedOptions,
  dropdownPlaceholderText,
  modalDropdownPlaceholderText,
  selectOptions,
  onChange,
  onAddFormData,
  type,
  isValid,
  onSearch,
  searchDebounceMs = 300,
  value = [],
  className = "",
  clearSignal = 0,
  id = "",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const dropdownRef = useRef(null);
  const [renderOptions, setRenderOptions] = useState(groupedOptions || []);
  const initialOptionsRef = useRef(groupedOptions || []);
  const optionCacheRef = useRef(new Map());

  // Client-side filtered view of the currently rendered options
  const clientFilteredOptions = useMemo(() => {
    const q = (searchQuery || "").toLowerCase();
    if (!q) return renderOptions || [];
    return (renderOptions || []).filter(opt =>
      String(opt.label || "").toLowerCase().includes(q)
    );
  }, [searchQuery, renderOptions]);

  // Respond to parent clear signals (e.g., Clear All or tag removal)
  useEffect(() => {
    if (clearSignal > 0) {
      setSearchQuery("");
      // Do NOT trigger API refresh here; restore to initial options snapshot
      setSearchLoading(false);
      setRenderOptions(initialOptionsRef.current || renderOptions || []);
    }
  }, [clearSignal, onSearch]);


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

  // Snapshot initial options, and MERGE new API results into existing options (no replacement on search)
  useEffect(() => {
    if (groupedOptions && groupedOptions.length) {
      if (!initialOptionsRef.current || initialOptionsRef.current.length === 0) {
        initialOptionsRef.current = groupedOptions;
      }
      const map = new Map();
      (renderOptions || []).forEach((o) => {
        if (o && typeof o.value !== 'undefined') map.set(String(o.value), o);
      });
      (groupedOptions || []).forEach((o) => {
        if (o && typeof o.value !== 'undefined') map.set(String(o.value), o);
      });
      setRenderOptions(Array.from(map.values()));
    }
  }, [groupedOptions]);

  // Update option cache whenever we have new options to display
  useEffect(() => {
    (renderOptions || []).forEach(opt => {
      if (opt && typeof opt.value !== 'undefined') {
        optionCacheRef.current.set(String(opt.value), opt);
      }
    });
  }, [renderOptions]);

  const toggleOpen = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleGroup = (label) => {
    setExpandedGroups((prev) =>
      Array.isArray(prev)
        ? prev.includes(label)
          ? prev.filter((group) => group !== label)
          : [...prev, label]
        : []
    );
  };

  const handleOptionChange = (nextSelected, actionMeta) => {
    const byVal = (arr = []) => arr.map(o => String(o.value));
    const hasVal = (arr, v) => arr.some(o => String(o.value) === String(v));

    let merged = selectedOptions ? [...selectedOptions] : [];

    switch (actionMeta?.action) {
      case 'select-option': {
        const opt = actionMeta.option;
        if (opt && !hasVal(merged, opt.value)) {
          merged = [...merged, opt];
        }
        break;
      }
      case 'deselect-option':
      case 'remove-value': {
        const opt = actionMeta.option;
        if (opt) {
          merged = merged.filter(o => String(o.value) !== String(opt.value));
        }
        break;
      }
      case 'clear': {
        merged = [];
        break;
      }
      case 'pop-value': {
        // Backspace tag remove
        const removed = actionMeta.removedValue;
        if (removed) {
          merged = merged.filter(o => String(o.value) !== String(removed.value));
        }
        break;
      }
      default: {
        // Fallback: trust nextSelected if provided, but merge in any previously selected
        if (Array.isArray(nextSelected)) {
          const map = new Map();
          merged.forEach(o => map.set(String(o.value), o));
          nextSelected.forEach(o => map.set(String(o.value), o));
          merged = Array.from(map.values());
        }
      }
    }

    setSelectedOptions(merged);

    const selectedValues = merged.map((option) => option.value);
    if (onChange) {
      onChange(selectedValues);
    }

    if (!merged || merged.length === 0) {
      setExpandedGroups([]);
      return;
    }

    const last = merged[merged.length - 1];
    const group = groupedOptions.find((group) =>
      group.groupedOptions?.some((item) => String(item.value) === String(last.value))
    );
    if (group?.label && !expandedGroups.includes(group.label)) {
      setExpandedGroups((prev) => [...prev, group.label]);
    }
  };

  const handleSearch = (e) => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // No API refresh on typing/clearing; search is purely client-side now
    if (newSearchQuery.length === 0) {
      setRenderOptions(initialOptionsRef.current || renderOptions || []);
    }
    setSearchLoading(false);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Rebuild selected options when value changes using cache to persist across searches
  useEffect(() => {
    const cache = optionCacheRef.current;
    const updatedSelected = (value || [])
      .map((v) => cache.get(String(v)) || (selectedOptions || []).find((o) => String(o.value) === String(v)))
      .filter(Boolean);
    setSelectedOptions(updatedSelected);
  }, [value]);

  const handleRemoveOption = (optionToRemove) => {
    const updatedOptions = selectedOptions.filter(
      (opt) => opt.value !== optionToRemove.value
    );
    setSelectedOptions(updatedOptions);

    if (onChange) {
      onChange(updatedOptions.map((opt) => opt.value));
    }

  };
  const displayOptions = groupedOptions || [];

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

  const isApiSearchVariant = (className || "").includes("api-search-option");

  const GroupedOptions = {
    Group: (props) => {
      const { data, children } = props;
      const isExpanded = expandedGroups.includes(data.label);

      return (
        <>
          <div className={`group ${isExpanded ? "expanded" : ""}`}>
            <div
              className={`group-title ${isExpanded ? "expanded" : ""}`}
              onClick={() => toggleGroup(data.label)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "margin-bottom 0.3s ease-in-out",
                marginBottom: isExpanded ? "0.5rem" : undefined,
                padding: isExpanded ? 8 : undefined,
                borderRadius: isExpanded ? 4 : undefined,
                backgroundColor: isExpanded ? "#30579d" : undefined,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "1rem", fontWeight: 500, lineHeight: "1.5rem", color: isExpanded ? "#fff" : "#0B1426" }}>{data.label}</span>
              <img
                src={Icons.caret_black_down}
                alt="chevron-down"
                className={isExpanded ? "rotate" : ""}
                style={{
                  width: 16,
                  height: 10,
                  transition: "transform 0.3s ease-in-out",
                  filter: isExpanded
                    ? "brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(0%) hue-rotate(255deg) brightness(103%) contrast(102%)"
                    : "brightness(0) saturate(100%) invert(7%) sepia(38%) saturate(1013%) hue-rotate(182deg) brightness(99%) contrast(99%)",
                }}
              />
            </div>
            {isExpanded && (
              <div className="group-list" style={{ paddingInlineStart: "1rem" }}>
                <components.Group {...props}>{children}</components.Group>
              </div>
            )}
          </div>
          <span
            className={`separator ${isExpanded ? "expanded" : ""}`}
            style={{
              width: "100%",
              borderBottom: "1px solid #e4eaf2",
              display: isExpanded ? "none" : undefined,
            }}
          />
        </>
      );
    },
    Option: (props) => {
      return (
        <>
          <div
            className={`checkbox-option ${
              props.isSelected ? "checkbox-option__selected" : ""
            }`}        
            id={id +`-btn`}
            onClick={() => props.selectOption(props.data)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              borderRadius: 4,
              backgroundColor: props.isSelected ? "#E4EAF2" : undefined,
              padding: 8,
              cursor: "pointer",
            }}
          >
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: "#183571",
                  colorBorder: "#183571",
                },
              }}
            >
              <Checkbox
                checked={props.isSelected}
                id={`multi-select-with-api-search-check-box-${id}`}
                style={{
                  marginBottom: 0,
                  paddingTop: isApiSearchVariant ? 0 : undefined,
                  paddingBottom: isApiSearchVariant ? 0 : undefined,
                  paddingLeft: isApiSearchVariant ? 0 : undefined,
                }}
              >
                <span style={{ fontSize: "1rem", fontWeight: 500, lineHeight: "1.5rem", color: "#0B1426" }}>
                  {props.data.label}
                </span>
              </Checkbox>
            </ConfigProvider>
          </div>
          <span className="separator" style={{ width: "100%", borderBottom: "1px solid #e4eaf2", display:"inline-block" }} />
        </>
      );
    },
  };

  return (
    <div className={`dropdown group-option-dropdown required-select custom-group-dropdown custom-select ${className}`} ref={dropdownRef}>
      <Button
        onClick={toggleOpen}
        icon={
          <img
            src={Icons.caret_black_down}
            alt="chevron-down"
            className={isDropdownOpen ? "rotate" : ""}
          />
        }
        id={`multi-select-with-api-search-${id}`}
        iconPosition="end"
        className={`dropdown-button ${isDropdownOpen ? "opened" : ""} ${
          selectedOptions.length ? "selected" : ""
        } ${isValid ? "invalid" : ""}`}
      >
        <div className="selected-options">
          {selectedOptions.length === 0
            ? dropdownPlaceholderText
            : selectedOptions.slice(0, 2).map((opt) => (
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
            {/* <div className="dropdown-header">
              <button className="button add-option-button" onClick={handleModalOpen}>
                <img src={Icons.plus} alt="add" />
                <span>Add Vehicle Make</span>
              </button>
            </div> */}
            <div className="dropdown-search">
              <input
                type="text"
                placeholder="Search here..."
                value={searchQuery}
                onChange={handleSearch}
                id={`multi-select-search-input-${id}`}
              />
              <img src={Icons.magnifying_glass} alt="search" />
            </div>
            <Select
              components={{ ...GroupedOptions }}
              options={clientFilteredOptions}
              value={selectedOptions}
              onChange={handleOptionChange}
              getOptionValue={(opt) => String(opt.value)}
              getOptionLabel={(opt) => opt.label}
              isOptionSelected={(opt) => (selectedOptions || []).some(o => String(o.value) === String(opt.value))}
              isMulti={true}
              menuIsOpen={true}
              isClearable={false}
              isSearchable={false}
              tabSelectsValue={false}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              backspaceRemovesValue={false}
              isLoading={searchLoading}
              noOptionsMessage={() => searchLoading ? null : "No options"}
              className="custom-options"
              id={id}
            />
            {searchLoading && (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <Spinner />
              </div>
            )}
          </div>
          <div onClick={toggleOpen} className="dropdown-blanket" />
        </>
      )}
    </div>
  );
};

export default CustomMultiSelectWithApiSearch;
