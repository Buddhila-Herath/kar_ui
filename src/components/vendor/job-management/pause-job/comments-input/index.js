import React, { useState, useRef, useEffect } from "react";
import { Input, notification, Spin } from "antd";
import "./styles.css";
import Icons from "../../../../../utils/icons";
const { TextArea } = Input;

const CommentsInput = ({ quoteId, onEditQuote, value, onChange, quoteLoading, isVendor }) => {
  const MAX_CHARACTERS = 1000;
  const [internalValue, setInternalValue] = useState(value || '');
  const textareaRef = useRef(null);
  const [showLimitError, setShowLimitError] = useState(false);
  const [charCount, setCharCount] = useState((value || '').length);

  // Initialize with prop value
  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setCharCount(newValue.length);
    
    if (newValue.length <= MAX_CHARACTERS) {
      setInternalValue(newValue);
      setShowLimitError(false);
    } else {
      setShowLimitError(true);
    }
  };

  const handleBlur = () => {
    if (onChange && internalValue !== value) {
      onChange(internalValue);
    }
  };

  const handleEditClick = async () => {
    try {
      await onEditQuote(quoteId);
    } catch (error) {
      notification.error({
        message: <h5>Failed to prepare quote editor</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    }
  };

  return (
    <div className="pr-comments-input-container">
      <div className="pr-comments-input-header">
        <p className="pr-comments-input-title">Comments</p>
        {isVendor && (
          <button 
            className="pr-comments-input-edit-button" 
            onClick={handleEditClick} 
            disabled={quoteLoading}
          >
            {quoteLoading ? (
              <Spin size="small" />
            ) : (
              <>
                <img
                  className="pr-comments-input-edit-icon"
                  src={Icons.pencil_simple_line}
                  alt="edit-quote"
                />
                <p className="pr-comments-input-edit-text">Edit Quote</p>
              </>
            )}
          </button>
        )}
      </div>

      <TextArea
        ref={textareaRef}
        className="pr-comments-input"
        rows={4}
        value={internalValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        style={{ resize: "none" }}
      />
      {showLimitError && (
        <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
          Enter a value that doesn't exceed 1000 characters
        </div>
      )}
    </div>
  );
};

export default CommentsInput;
