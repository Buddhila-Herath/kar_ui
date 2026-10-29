import React, { useState, useEffect, useCallback, useRef } from 'react';

import { Carousel, Image, ConfigProvider, Spin } from 'antd';
import { useDispatch } from 'react-redux';
import './Base64ImageSlider.css';
import { fetchImageByPath } from "../../slices/masterDataSlice";
import { imageCache } from "../../utils/imageCache";
import Icons from "../../utils/icons";

const BaseJob64ImageSlider = ({ 
  paths,
  desktopImagesPerPage = 4,
  imgPreview = false,
  isDataType = false,
  isDots = true,
  onImageClick,
  selectedIndices = [],
  showSelectionOverlay = false,
  previewIndex = -1,
  downloadButtonId
}) => {

  const dispatch = useDispatch();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [loadedImages, setLoadedImages] = useState({});

  const fetchImage = useCallback(async (path, index) => {
    const actualPath = typeof path === 'string' ? path : path.path;
    
    if (!actualPath) {
      setImageLoadingStates(prev => ({ ...prev, [index]: false }));
      return;
    }
    try {
      const cachedImage = await imageCache.get(actualPath);
      if (cachedImage) {
        // If cached data is a Blob, create an object URL; otherwise ignore old string caches
        if (cachedImage instanceof Blob) {
          const objectUrl = URL.createObjectURL(cachedImage);
          setLoadedImages(prev => ({ ...prev, [index]: objectUrl }));
          setImageLoadingStates(prev => ({ ...prev, [index]: false }));
          return;
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    setImageLoadingStates(prev => ({ ...prev, [index]: true }));
    try {
      const res = await dispatch(fetchImageByPath(actualPath)).unwrap();
      const signedUrl = res.url;
      // Fetch the binary and cache the Blob so signed URL expiry doesn't matter
      const response = await fetch(signedUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to fetch image blob: ${response.status}`);
      const blob = await response.blob();
      imageCache.set(actualPath, blob).catch(error => {
        console.warn('Failed to cache image:', error);
      });
      const objectUrl = URL.createObjectURL(blob);
      setLoadedImages(prev => ({ ...prev, [index]: objectUrl }));
      setImageLoadingStates(prev => ({ ...prev, [index]: false }));
    } catch (error) {
      console.error(`Error loading image ${index}:`, error);
      setImageLoadingStates(prev => ({ ...prev, [index]: false }));
    }
  }, [dispatch]);

  useEffect(() => {
    const loadImages = async () => {
      const initialLoadingStates = {};
      paths.forEach((path, index) => {
        const actualPath = typeof path === 'string' ? path : path.path;
        if (actualPath) {
          initialLoadingStates[index] = true;
        }
      });
      setImageLoadingStates(initialLoadingStates);

      const batchSize = 3; // Load 3 images at a time to avoid overwhelming the browser
      
      for (let i = 0; i < paths.length; i += batchSize) {
        const batch = paths.slice(i, i + batchSize);
        const batchPromises = batch.map((path, batchIndex) => {
          const globalIndex = i + batchIndex;
          const actualPath = typeof path === 'string' ? path : path.path;
          return fetchImage(actualPath, globalIndex);
        });
        
        await Promise.all(batchPromises);
      }
    };

    if (paths.length > 0) {
      loadImages();
    }
  }, [paths, fetchImage]);

  // Keep the latest loaded image URLs in a ref so cleanup does not run on every state change
  const loadedImagesRef = useRef(loadedImages);
  useEffect(() => {
    loadedImagesRef.current = loadedImages;
  }, [loadedImages]);

  // Cleanup created object URLs only on unmount to avoid breaking previews
  useEffect(() => {
    return () => {
      Object.values(loadedImagesRef.current).forEach((url) => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          try { URL.revokeObjectURL(url); } catch (_) {}
        }
      });
    };
  }, []);

  const carouselToken = {
    arrowSize: 24,
    arrowOffset: 30,
    dotWidth: 20,
    dotHeight: 4,
    dotGap: 2,
    dotActiveWidth: 26
  };  

  const handleSlideChange = (current) => {
    setCurrentSlide(current);
  };

  const allImagesLoaded = Object.keys(imageLoadingStates).length > 0 && 
    Object.values(imageLoadingStates).every(loading => !loading);

  // Desktop View 
  const desktopView = (
    <ConfigProvider theme={{ components: { Carousel: carouselToken } }}>
      <div className="desktop-slider">
        <Carousel dots={isDots ? { className: "custom-dots" } : false} arrows={true} infinite={false}>
          {[...Array(Math.ceil(paths.length / desktopImagesPerPage))].map((_, i) => {
            const group = paths.slice(i * desktopImagesPerPage, (i + 1) * desktopImagesPerPage);
            return (
              <div key={`desktop-${i}`} className="desktop-slide">
                {group.map((path, j) => {
                  const imageIndex = i * desktopImagesPerPage + j;
                  const actualPath = typeof path === 'string' ? path : path.path;
                  const isImageLoading = imageLoadingStates[imageIndex];
                  const loadedImage = loadedImages[imageIndex];
                  
                  const isSelected = selectedIndices.includes(imageIndex);
                  const isPreview = previewIndex === imageIndex;
                  return (
                    <React.Fragment key={`desktop-img-${j}`}>
                      <div className={`desktop-image-container${isSelected ? ' selected' : ''}${isPreview ? ' previewed' : ''}`}>
                        {isImageLoading ? (
                          <div className="image-loading-container">
                            <Spin size="small" />
                            <span className="loading-text">Loading...</span>
                          </div>
                        ) : loadedImage ? (
                          <Image
                            src={loadedImage}
                            alt={`Image ${imageIndex + 1}`}
                            className="desktop-image"
                            preview={imgPreview}
                            loading="lazy"
                            id={`image-slider-${downloadButtonId}-${loadedImage}`}
                            onClick={() => onImageClick && onImageClick(loadedImage, { index: imageIndex, path: actualPath })}
                            placeholder={
                              <div className="image-loading-container">
                                <Spin size="small" />
                                <span className="loading-text">Loading...</span>
                              </div>
                            }
                          />
                        ) : (
                          <div className="image-error-container">
                            <span className="error-text">Failed to load</span>
                          </div>
                        )}
                        {(showSelectionOverlay && isSelected) && (
                          <div className="thumb-overlay is-selected"></div>
                        )}
                        {(!showSelectionOverlay && isPreview) && (
                          <div className="thumb-overlay is-preview"></div>
                        )}
                        {showSelectionOverlay && isSelected && (
                          <img
                            className="selection-checkmark"
                            src={Icons.check_box}
                            id={`image-slider-view-${downloadButtonId}-${loadedImage}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onImageClick && onImageClick(loadedImage, { index: imageIndex, path: actualPath });
                            }}
                            alt="selected"
                          />
                        )}
                      </div>
                      {(j < group.length - 1) && (
                        <div className="image-separator"></div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })}
        </Carousel>
      </div>
    </ConfigProvider>
  );

  // Mobile View
  const mobileView = (
    <ConfigProvider theme={{ components: { Carousel: carouselToken } }}>
      <div className="mobile-slider-container">
        <div className="mobile-slider">
          <Carousel 
            dots={false}
            arrows={true}
            infinite={false}
            afterChange={handleSlideChange}
          >
            {paths.map((path, i) => {
              const actualPath = typeof path === 'string' ? path : path.path;
              const isImageLoading = imageLoadingStates[i];
              const loadedImage = loadedImages[i];
              
              const isSelected = selectedIndices.includes(i);
              const isPreview = previewIndex === i;
              return (
                <div key={`mobile-${i}`} className="mobile-slide">
                  <div className={`mobile-image-wrapper${isSelected ? ' selected' : ''}${isPreview ? ' previewed' : ''}`}>
                    {isImageLoading ? (
                      <div className="image-loading-container">
                        <Spin size="small" />
                        <span className="loading-text">Loading...</span>
                      </div>
                    ) : loadedImage ? (
                      <Image
                        src={isDataType ? loadedImage : loadedImage}
                        alt={`Image ${i + 1}`}
                        className="mobile-image"
                        preview={imgPreview}
                        loading="lazy"
                        onClick={() => onImageClick && onImageClick(loadedImage, { index: i, path: actualPath })}
                        placeholder={
                          <div className="image-loading-container">
                            <Spin size="small" />
                            <span className="loading-text">Loading...</span>
                          </div>
                        }
                      />
                    ) : (
                      <div className="image-error-container">
                        <span className="error-text">Failed to load</span>
                      </div>
                    )}
                    {(showSelectionOverlay && isSelected) && (
                      <div className="thumb-overlay is-selected"></div>
                    )}
                    {(!showSelectionOverlay && isPreview) && (
                      <div className="thumb-overlay is-preview"></div>
                    )}
                    {showSelectionOverlay && isSelected && (
                      <img
                        className="selection-checkmark"
                        src={Icons.check_box}
                        onClick={(e) => {
                          e.stopPropagation();
                          onImageClick && onImageClick(loadedImage, { index: i, path: actualPath });
                        }}
                        alt="selected"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </Carousel>
          { isDots && (
            <div className="mobile-pagination">
              {`${(currentSlide + 1).toString().padStart(2, '0')} of ${paths.length.toString().padStart(2, '0')}`}
            </div>
          )}
        </div>
      </div>
    </ConfigProvider>
  ); 

  return (
    <>
      <div className="desktop-view">{desktopView}</div> 
      <div className="mobile-view">{mobileView}</div>
    </>
  );
};

export default BaseJob64ImageSlider;