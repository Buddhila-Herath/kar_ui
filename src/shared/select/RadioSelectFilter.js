import React, { useState } from "react";
import Select from "react-select";
import { Button } from "antd";
import Icons from "../../utils/icons";

// Custom Option with Radio Button
const CustomOption = (props) => {
  const { data, isSelected, innerRef, innerProps } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px",
        cursor: "pointer",
        backgroundColor: isSelected ? "#e6f7ff" : "white",
      }}
    >
      <input
        type="radio"
        checked={isSelected}
        readOnly
        style={{ marginRight: "10px" }}
      />
      {data.label}
    </div>
  );
};

const selectStyles = {
  control: (provided) => ({ ...provided, minWidth: 240, margin: 8 }),
  menu: () => ({ boxShadow: "inset 0 1px 0 rgba(0, 0, 0, 0.1)" }),
};

const RadioSelect = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(undefined);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const onSelectChange = (selectedValue) => {
    setValue(selectedValue);
    toggleOpen();
  };

  return (
    <div className="dropdown radio-filter-dropdown" style={{ position: "relative" }}>
      <Button
        onClick={toggleOpen}
        icon={<img src={Icons.caret_black_down} alt="chevron-down" />}
        iconPosition="end"
        className="dropdown-button"
        style={{
          boxShadow: "unset",
          borderColor: "unset",
        }}
      >
        {value ? `${value.label}` : " "}
      </Button>

      {isOpen && (
        <div
          style={{
            position: "relative",
            padding: "8px",
            zIndex: 2,
          }}
          className="dropdown-menu"
        >
          <Select
            components={{
              Option: CustomOption,
            }}
            controlShouldRenderValue={false}
            hideSelectedOptions={false}
            isClearable={false}
            menuIsOpen
            onChange={onSelectChange}
            options={options}
            placeholder="Select an option"
            styles={selectStyles}
            tabSelectsValue={false}
            value={value}
            className="dropdown-select"
            isSearchable={false}
          />
        </div>
      )}

      {isOpen && (
        <div
          onClick={toggleOpen}
          style={{
            bottom: 0,
            left: 0,
            top: 0,
            right: 0,
            position: "fixed",
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
};

export default RadioSelect;
