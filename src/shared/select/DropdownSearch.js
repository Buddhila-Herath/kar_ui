import React, { useState } from "react";
import Select from 'react-select';
import { Button } from 'antd'
import Icons from '../../utils/icons';

const options = [
  { value: '1', label: 'Item 1' },
  { value: '2', label: 'Item 2' },
  { value: '3', label: 'Item 3' },
  { value: '4', label: 'Item 4' },
  { value: '5', label: 'Item 5' },
  { value: '6', label: 'Item 6' },
  { value: '7', label: 'Item 7' },
];

const DropdownSearch = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const toggleOpen = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const onSelectChange = (selectedValue) => {
    setSelectedOption(selectedValue);
    toggleOpen();
  };

  const DropdownIndicator = () => (
    <img src={Icons.magnifying_glass} alt="magnifying-glass" />
  );

  return (
    <div className="dropdown dropdown-select">
      <Button
        onClick={toggleOpen}
        icon={<img src={Icons.caret_black_down} alt="chevron-down" className={isDropdownOpen ? 'rotate' : ''} />}
        iconPosition="end"
        className={`dropdown-button ${isDropdownOpen ? 'opened' : ''} ${selectedOption ? 'selected' : ''}`}
      >
        {selectedOption ? `${selectedOption.label}` : 'Select an item'}
      </Button>
      {isDropdownOpen && (
        <>
          <div className="dropdown-menu">
            <Select
              components={{ DropdownIndicator, IndicatorSeparator: null }}
              options={options}
              value={selectedOption}
              onChange={onSelectChange}
              menuIsOpen={true}
              isClearable={false}
              tabSelectsValue={false}
              hideSelectedOptions={false}
              backspaceRemovesValue={false}
              controlShouldRenderValue={false}
              placeholder="Search here..."
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

export default DropdownSearch;
