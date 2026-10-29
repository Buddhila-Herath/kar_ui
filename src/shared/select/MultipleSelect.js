import React, { useState, useEffect, useRef } from 'react';
import { Checkbox, Tag, ConfigProvider } from 'antd';
import Icons from "../../utils/icons";

const MultipleSelect = ({
    isRequired,
    placeholder,
    listStyle,
    maxTagsToShow,
    value = [],
    defaultValue = [],
    onChange,
    errors = "",
    options,
    id
}) => {

    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState(value);
    const dropdownRef = useRef(null);  
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const toggleCheckboxes = () => {
        setShowCheckboxes(!showCheckboxes);
    };

    const handleRemove = (id) => {
        const updatedOptions = selectedOptions.filter((typeId) => typeId !== id);
        setSelectedOptions(updatedOptions);
        if (onChange) {
            onChange(updatedOptions);
        }
    };

    const handleSelect = (id) => {
        if (!selectedOptions.includes(id)) {
            const updatedOptions = [...selectedOptions, id];
            setSelectedOptions(updatedOptions);
            if (onChange) {
                onChange(updatedOptions);
            }
        }
    };

    useEffect(() => {
        const initiallySelected = options.filter(option => option.checked).map(option => option.id);
        setSelectedOptions(initiallySelected);
    }, [options]);

    useEffect(() => {
        if (value && value !== selectedOptions) {
            setSelectedOptions(value);
        }
    }, [value]);

    useEffect(() => {
        if (selectedOptions.length === 0) {
            setShowCheckboxes(false);
        }
    }, [selectedOptions]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
    
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="multiple-select">
            <div className="selected-business-box" id={`multiple-select-container-${id}`} onClick={toggleCheckboxes} ref={dropdownRef}>
                {selectedOptions.length === 0 && (
                    <span style={{ color: '#999' }}>
                        {placeholder}
                    </span>
                )}

                {selectedOptions.slice(0, isMobile ? 1 : maxTagsToShow).map((id) => (

                    <Tag
                        key={id}
                        closable
                        id={`multiple-select-tag-${id}`}
                        onClose={() => handleRemove(id)}
                        style={{
                            borderRadius: '12px',
                            padding: '4px 8px',
                            lineHeight: 'inherit',
                            height: '28px',
                            border: '1px solid #E4EAF2'
                        }}
                    >
                        {options.find((option) => option.id === id)?.name}
                    </Tag>
                ))}

                {selectedOptions.length > (isMobile ? 1 : maxTagsToShow) && (
                    <Tag style={{ height: '28px', borderRadius: '12px', width: '33px', padding: '4px 8px' }}>
                        +{selectedOptions.length - (isMobile ? 1 : maxTagsToShow)}
                    </Tag>
                )}

                <img
                    src={showCheckboxes ? Icons.caret_up : Icons.caret_black_down}
                    alt="Toggle Checkbox"
                    style={{
                        cursor: 'pointer',
                        position: 'absolute',
                        right: '11px'
                    }}
                />
            </div>

            {showCheckboxes && (
                <div className="business-checkbox-list" style={listStyle}>
                    {options.map((option) => (
                        <div key={option.id} id={`multiple-select-checkbox-${option?.id?.replaceAll(" ", "-")}`}>
                            <ConfigProvider
                                theme={{
                                token: {
                                    colorPrimary: '#183571',
                                    colorBorder: '#183571',
                                },
                                }}
                            >
                                <Checkbox
                                    key={option.id}
                                    id={`multiple-select-checkbox-${option?.id?.replaceAll(" ", "-")}`}
                                    onChange={(e) =>
                                        e.target.checked ? handleSelect(option.id) : handleRemove(option.id)
                                    }
                                    checked={selectedOptions.includes(option.id)}
                                >
                                    {option.name}
                                </Checkbox>
                            </ConfigProvider>
                            <div className="separator" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultipleSelect;