import React from "react";
import Icons from "../../../utils/icons";

const CustomNumberInput = ({
  value,
  onChange,
  placeholder = "",
  name,
  id,
  error,
}) => {
  const handleInputChange = (e) => {
    let val = e.target.value;
    onChange(val);
  };

  const handleArrowClick = (direction) => {
    let val = value === "" ? 0 : Number(value);
    if (direction === "up") val++;
    if (direction === "down") val--;
    onChange(val);
  };

  return (
    <div className={`custom-number-input ${error ? "invalid" : ""}`}>
      <input
        type="number"
        name={name}
        id={id}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        autoComplete="off"
        required
      />
      <div className="custom-arrows">
        <img
          src={Icons.caret_down}
          alt="Increase"
          className="arrowUp"
          tabIndex={0}
          onClick={() => handleArrowClick("up")}
          role="button"
        />
        <img
          src={Icons.caret_down}
          alt="Decrease"
          className="customarrowdown"
          tabIndex={0}
          onClick={() => handleArrowClick("down")}
          role="button"
        />
      </div>
    </div>
  );
};

export default CustomNumberInput;