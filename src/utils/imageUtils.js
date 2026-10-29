import { fetchImageByPath } from "../slices/masterDataSlice";

const imageCache = new Map();

/**
 * Loads a single image by path and returns the URL
 * @param {string} imagePath - The path to the image
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} setImageState - State setter function for the image URL
 * @param {Function} setLoadingState - Optional state setter function for loading state (deprecated - use ImageWithLoader instead)
 * @returns {Promise<string|null>} - The image URL or null if failed
 */
export const loadSingleImage = async (imagePath, dispatch, setImageState, setLoadingState = null) => {
  if (!imagePath) {
    setImageState(null);
    if (setLoadingState) setLoadingState(false);
    return null;
  }

  // Check cache first
  if (imageCache.has(imagePath)) {
    const cachedImage = imageCache.get(imagePath);
    setImageState(cachedImage.url);
    if (setLoadingState) setLoadingState(false);
    return cachedImage.url;
  }

  try {
    if (setLoadingState) setLoadingState(true);
    
    const res = await dispatch(fetchImageByPath(imagePath)).unwrap();
    
    if (res && res.url) {
      // Cache the result
      imageCache.set(imagePath, res);
      setImageState(res.url);
      if (setLoadingState) setLoadingState(false);
      return res.url;
    } else {
      setImageState(null);
      if (setLoadingState) setLoadingState(false);
      return null;
    }
  } catch (error) {
    console.error("Failed to load image:", error);
    setImageState(null);
    if (setLoadingState) setLoadingState(false);
    return null;
  }
};

/**
 * Loads a single image by path and returns the URL (recommended for use with ImageWithLoader)
 * This version doesn't manage loading states - let ImageWithLoader handle that
 * @param {string} imagePath - The path to the image
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} setImageState - State setter function for the image URL
 * @returns {Promise<string|null>} - The image URL or null if failed
 */
export const loadImageForDisplay = async (imagePath, dispatch, setImageState) => {
  if (!imagePath) {
    setImageState(null);
    return null;
  }

  // Check cache first
  if (imageCache.has(imagePath)) {
    const cachedImage = imageCache.get(imagePath);
    setImageState(cachedImage.url);
    return cachedImage.url;
  }

  try {
    const res = await dispatch(fetchImageByPath(imagePath)).unwrap();
    
    if (res && res.url) {
      // Cache the result
      imageCache.set(imagePath, res);
      setImageState(res.url);
      return res.url;
    } else {
      setImageState(null);
      return null;
    }
  } catch (error) {
    console.error("Failed to load image:", error);
    setImageState(null);
    return null;
  }
};

/**
 * Loads multiple images by their paths
 * @param {Object} imageConfigs - Object with image paths and their corresponding state setters
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} loadingStates - Optional object with loading state setters
 * @returns {Promise<Object>} - Object with loaded image URLs
 */
export const loadMultipleImages = async (imageConfigs, dispatch, loadingStates = {}) => {
  const results = {};
  
  try {
    const imagePromises = Object.entries(imageConfigs).map(async ([key, config]) => {
      const { path, setter } = config;
      const setLoading = loadingStates[key];
      
      if (!path) {
        setter(null);
        if (setLoading) setLoading(false);
        return { key, url: null };
      }

      try {
        const url = await loadSingleImage(path, dispatch, setter, setLoading);
        return { key, url };
      } catch (error) {
        console.error(`Failed to load ${key} image:`, error);
        setter(null);
        if (setLoading) setLoading(false);
        return { key, url: null };
      }
    });

    const imageResults = await Promise.all(imagePromises);
    
    // Convert array to object
    imageResults.forEach(({ key, url }) => {
      results[key] = url;
    });
    
    return results;
  } catch (error) {
    console.error('Error in loadMultipleImages:', error);
    return results;
  }
};

export const fetchImagesForPreview = async (paths, dispatch) => {
  if (!paths || paths.length === 0) return [];
  
  try {
    const imagePromises = paths.map(async path => {
      if (imageCache.has(path)) {
        return imageCache.get(path);
      }
      
      try {
        const imageData = await dispatch(fetchImageByPath(path)).unwrap();
        imageCache.set(path, imageData);
        return imageData;
      } catch (error) {
        console.error('Error fetching image:', error);
        return null;
      }
    });
    
    const images = await Promise.all(imagePromises);
    return images.filter(img => img !== null);
  } catch (error) {
    console.error('Error in fetchImagesForPreview:', error);
    return [];
  }
};

/**
 * Cleans up object URLs to prevent memory leaks
 * @param {Array<{url: string}>} images - Array of image objects with URLs
 */
export const cleanupImageUrls = (images) => {
  if (!images || !Array.isArray(images)) return;
  
  images.forEach(img => {
    if (img && img.url) {
      try {
        // Only revoke object URLs (those starting with blob:)
        if (img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      } catch (error) {
        console.error('Error revoking object URL:', error);
      }
    }
  });
};