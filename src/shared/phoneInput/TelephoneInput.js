import React, { useState, useEffect } from "react";
import { Select } from "antd";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input/input';
import Flags from 'country-flag-icons/react/3x2';

const { Option } = Select;

// Import country labels
import en from 'react-phone-number-input/locale/en.json';
import Icons from "../../utils/icons";

const formatSriLankanNumber = (number) => {
    if (!number) return "";

    // Remove all non-numeric characters except '+'
    let cleaned = number.replace(/[^\d+]/g, "");

    // Ensure it starts with +94
    if (!cleaned?.startsWith("+94")) return number;

    let nationalNumber = cleaned.replace("+94", "").trim();

    // Mobile number (07X XXX XXXX)
    if (/^7[0-8]\d{7}$/.test(nationalNumber)) {
        return `+94 ${nationalNumber.slice(0, 2)} ${nationalNumber.slice(2, 5)} ${nationalNumber.slice(5)}`;
    }

    // Landline number (0XX XXX XXXX) with correct area code spacing
    if (/^[1-9]\d{8}$/.test(nationalNumber)) {
        return `+94 ${nationalNumber.slice(0, 2)} ${nationalNumber.slice(2, 5)} ${nationalNumber.slice(5)}`;
    }

    return number; // Return as is if no match
};

const CustomCountrySelect = ({ value, onChange, disabled = false, disabledField = false }) => {
  const countries = getCountries();

  return (
    <Select
      value={value}
      onChange={onChange}
      className="custom-country-select"
      style={{ 
        width: 80,
        border: 'none',
        backgroundColor: 'transparent',
        paddingRight: 12,
      }}
      dropdownStyle={{
        width: '300px',
        borderRadius: '0',
      }}
      optionLabelProp="label"
      showSearch={false}
      suffixIcon={<img src={Icons.caret_down} alt="down arrow" style={{ width: 16, height: 16,  }} />}
      disabled={disabled}
    >
      {countries.map((country) => {
        const FlagComponent = Flags[country];
        return (
          <Option 
            key={country} 
            value={country}
            label={
              <div style={{ width: 24 }}>
                <FlagComponent style={{ width: '100%', height: '100%', }} />
              </div>
            }
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 24, marginRight: 8 }}>
                <FlagComponent style={{ width: '100%', height: '100%' }} />
              </div>
              <span style={{ marginRight: 4 }}>{en[country]}</span>
              <span>+{getCountryCallingCode(country)}</span>
            </div>
          </Option>
        );
      })}
    </Select>
  );
};

const TelephoneInput = ({ onChange, inputName, value, disabled = true, disabledField = false }) => {
  const [phone, setPhone] = useState(value || "");

  const handlePhoneChange = (input) => {
    const formattedPhone = input ? formatSriLankanNumber(input) : "";
    setPhone(formattedPhone);
    onChange(formattedPhone);
  };

  useEffect(() => {
    if (value) {
      setPhone(formatSriLankanNumber(value));
    } else {
      setPhone("");
    }
  }, [value]);

  return (
    <div className={`custom-phone-input ${disabled ? 'disabled' : ''}`}>
      <PhoneInput
        defaultCountry="LK"
        international
        disabled={disabledField}
        countryCallingCodeEditable={false}
        value={phone}
        onChange={handlePhoneChange}
        name={inputName}
        id={inputName}
        autoComplete="off"
        className="custom-phone-input-field"
        countrySelectComponent={(props) => <CustomCountrySelect {...props} disabled={disabled} />}
      />
    </div>
  );
};

export default TelephoneInput;