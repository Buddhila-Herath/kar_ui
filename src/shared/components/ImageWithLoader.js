import React, { useState } from "react";
import Spinner from "./loaders/Spinner";

const ImageWithLoader = ({ 
  src, 
  alt, 
  className = "", 
  style = {},
  onLoad, 
  onError,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (onError) onError();
  };

  return (
    <div 
      className={`image-container ${className}`} 
      style={{ 
        ...style,
        position: 'relative',
        lineHeight: 0
      }}
    >
      {isLoading && (
        <div 
          className="image-loading-spinner" 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1
          }}
        >
          <Spinner />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'loading' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
        {...props}
      />
    </div>
  );
};

export default ImageWithLoader;
