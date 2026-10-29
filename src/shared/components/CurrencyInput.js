import React, { useState, useRef, useEffect } from 'react';

const CurrencyInput = ({ value, onChange, disabled, ...props }) => {
  const [displayValue, setDisplayValue] = useState('');
  const [cursorPos, setCursorPos] = useState(null);
  const inputRef = useRef(null);

  // Format the value for display
  const formatValue = (val) => {
    if (val === '' || val === null || val === undefined) return '';
    const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : Number(val);
    return isNaN(num) ? '' : num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Parse the display value back to a number string
  const parseValue = (displayVal) => {
    return displayVal.replace(/,/g, '');
  };

  useEffect(() => {
    setDisplayValue(formatValue(value));
  }, [value]);

  const handleChange = (e) => {
    const inputVal = e.target.value;
    
    // Allow only numbers and decimal point
    const cleanedVal = inputVal.replace(/[^0-9.]/g, '');
    
    // Format the cleaned value
    const formattedVal = formatValue(cleanedVal);
    setDisplayValue(formattedVal);
    
    // Get the cursor position before setting the value
    const cursor = e.target.selectionStart;
    setCursorPos(cursor);
    
    // Send the raw value to parent
    onChange({ target: { value: parseValue(cleanedVal) } });
  };

  useEffect(() => {
    if (cursorPos !== null && inputRef.current) {
      inputRef.current.selectionStart = cursorPos;
      inputRef.current.selectionEnd = cursorPos;
    }
  }, [displayValue, cursorPos]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={displayValue}
      onChange={handleChange}
      disabled={disabled}
      {...props}
    />
  );
};

export default CurrencyInput;
