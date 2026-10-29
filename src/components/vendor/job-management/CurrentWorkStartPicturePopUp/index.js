import { Modal } from "antd";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { ModalHeader } from "reactstrap";
import "./styles.scss";
import ZoomImageComponent from "./ZoomImageContainer";
import { fetchImageByPath } from "../../../../slices/masterDataSlice";
import BaseJob64ImageSlider from "../../../../shared/slider/BaseJob64ImageSlider";
import { saveAs } from "file-saver";
import Icons from "../../../../utils/icons";

 
const CurrentWorkStartPicturePopUp = (props) => {
  const {
    visible,
    setVisible,
    imagePaths = [],
    title = "Initial Registration Photos",
    downloadButtonId,
  } = props;
  const dispatch = useDispatch();
  const [resolvedPaths, setResolvedPaths] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedName, setSelectedName] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentImagePreview, setCurrentImagePreview] = useState(false);
  const pendingIndexRef = useRef(null);

  // Helper to extract clean image paths from various data structures
  const getCleanImagePaths = useMemo(() => {
    if (!Array.isArray(imagePaths)) return [];
    
    return imagePaths.map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        return item.path || item.url || item.imagePath || item.src || '';
      }
      return '';
    }).filter(Boolean);
  }, [imagePaths]);

  const extractName = (input) => {
    if (!input) return "";
    const str = typeof input === "string" ? input : (input?.path || "");
    const withoutQuery = str.split("?")[0];
    const parts = withoutQuery.split(/[\\/]/);
    const last = parts[parts.length - 1] || "";
    return last;
  };

  useEffect(() => {
    let isMounted = true;
    const resolvePaths = async () => {
      const cleanPaths = getCleanImagePaths;
      
      if (cleanPaths.length === 0) {
        if (isMounted) {
          setResolvedPaths([]);
          setSelectedImage(null);
          setSelectedName("");
          setSelectedIndex(null);
        }
        return;
      }
      try {
        const urls = await Promise.all(
          cleanPaths.map(async (p) => {
            try {
              const res = await dispatch(fetchImageByPath(p)).unwrap();
              return res?.url || p;
            } catch (_) {
              return p;
            }
          })
        );
        if (isMounted) {
          setResolvedPaths(urls);
          // Set initial selection
          const initialIndex = pendingIndexRef.current !== null ? pendingIndexRef.current : 0;
          const initialImage = urls[initialIndex] || urls[0] || null;
          setSelectedImage(initialImage);
          setSelectedIndex(initialIndex);
          
          const nameFromOriginal = extractName(cleanPaths[initialIndex]);
          const nameFromUrl = extractName(initialImage);
          setSelectedName(nameFromOriginal || nameFromUrl || "");
        }
      } catch (_err) {
        if (isMounted) {
          setResolvedPaths(cleanPaths);
          const initialIndex = pendingIndexRef.current !== null ? pendingIndexRef.current : 0;
          const initialImage = cleanPaths[initialIndex] || cleanPaths[0] || null;
          setSelectedImage(initialImage);
          setSelectedIndex(initialIndex);
          const nameFromOriginal = extractName(cleanPaths[initialIndex]);
          setSelectedName(nameFromOriginal || "");
        }
      }
    };
    
    if (visible) {
      resolvePaths();
    }
    
    return () => {
      isMounted = false;
    };
  }, [getCleanImagePaths, dispatch, visible]);

  // Handle external image selection events
  useEffect(() => {
    const onOpenAtIndex = (e) => {
      const { index, images } = e.detail || {};
      if (typeof index === 'number') {
        pendingIndexRef.current = index;
        setSelectedIndex(index);
        
        // Use provided images array or fall back to the component's imagePaths prop
        const imagesToUse = Array.isArray(images) ? images : getCleanImagePaths;
        const cleanPaths = imagesToUse.map(item => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            return item.path || item.url || item.imagePath || item.src || '';
          }
          return '';
        }).filter(Boolean);
        
        if (cleanPaths[index] !== undefined && cleanPaths[index] !== null) {
          // Try to resolve the image immediately
          dispatch(fetchImageByPath(cleanPaths[index]))
            .unwrap()
            .then(res => {
              setSelectedImage(res?.url || cleanPaths[index]);
            })
            .catch(() => {
              setSelectedImage(cleanPaths[index]);
            });
          
          const displayName = extractName(cleanPaths[index]);
          setSelectedName(displayName);
        }
        
        setSelectionMode(false);
        setSelectedIndices([]);
        setCurrentImagePreview(true);
      }
    };
    
    window.addEventListener('openCurrentWorkStartPicture', onOpenAtIndex);
    return () => window.removeEventListener('openCurrentWorkStartPicture', onOpenAtIndex);
  }, [dispatch, getCleanImagePaths]);

  // Reset when modal closes
  useEffect(() => {
    if (!visible) {
      pendingIndexRef.current = null;
      setSelectionMode(false);
      setSelectedIndices([]);
    }
  }, [visible]);

  const allCarImages = useMemo(() => {
    return resolvedPaths.length > 0 ? resolvedPaths : getCleanImagePaths;
  }, [resolvedPaths, getCleanImagePaths]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const ensureJSZip = async () => {
    // Check if already loaded
    if (window.JSZip) {
      return window.JSZip;
    }

    // Try to load from multiple CDNs with fallbacks
    const cdnUrls = [
      'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
      'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
      'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js'
    ];

    let lastError = null;
    
    for (const url of cdnUrls) {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = url;
          script.async = true;
          script.onload = () => {
            if (window.JSZip) {
              resolve();
            } else {
              reject(new Error('JSZip not available after loading'));
            }
          };
          script.onerror = () => reject(new Error(`Failed to load JSZip from ${url}`));
          
          // Set a timeout to handle cases where the script hangs
          const timeoutId = setTimeout(() => {
            document.body.removeChild(script);
            reject(new Error(`Timeout loading JSZip from ${url}`));
          }, 10000); // 10 second timeout
          
          script.onload = () => {
            clearTimeout(timeoutId);
            if (window.JSZip) {
              resolve();
            } else {
              reject(new Error('JSZip not available after loading'));
            }
          };
          
          document.body.appendChild(script);
        });
        
        // If we get here, JSZip is loaded successfully
        return window.JSZip;
      } catch (error) {
        lastError = error;
        console.warn(`Failed to load JSZip: ${error.message}`);
        // Continue to the next CDN URL
      }
    }
    
    // If all CDN attempts failed, try to use a local fallback or show a user-friendly message
    throw new Error(
      'Failed to load JSZip library. Please check your internet connection and try again. ' +
      'If the problem persists, contact support.'
    );
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const toDownloadIndices = selectedIndices.length > 0 ? selectedIndices : [selectedIndex !== null ? [selectedIndex] : [0]];

      if (toDownloadIndices.length > 1) {
        const JSZip = await ensureJSZip();
        const zip = new JSZip();
        const baseList = allCarImages;

        const fetchWithRetry = async (url, tries = 3) => {
          let lastErr;
          for (let t = 0; t < tries; t++) {
            try {
              const res = await fetch(url, { cache: 'no-store' });
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return await res.blob();
            } catch (err) {
              lastErr = err;
            }
          }
          throw lastErr;
        };

        const inferExt = (blob, url, fallback = 'png') => {
          if (blob?.type) {
            const m = blob.type.match(/image\/(\w+)/i);
            if (m && m[1]) return m[1].toLowerCase();
          }
          const fromUrl = (url || '').split('?')[0].split('.').pop();
          if (fromUrl && /^[a-z0-9]{3,4}$/i.test(fromUrl)) return fromUrl.toLowerCase();
          return fallback;
        };

        const sorted = [...toDownloadIndices].sort((a, b) => a - b);
        const CONCURRENCY = 4;
        let cursor = 0;
        let imageNumber = 1;

        const runBatch = async () => {
          const tasks = [];
          while (tasks.length < CONCURRENCY && cursor < sorted.length) {
            const idxThisTask = cursor++;
            const imgIdx = sorted[idxThisTask];
            const url = baseList[imgIdx];
            if (!url) continue;

            const thisNumber = imageNumber++;
            tasks.push((async () => {
              try {
                const blob = await fetchWithRetry(url, 3);
                const ext = inferExt(blob, url);
                const safeExt = ext.replace(/[^a-z0-9]/gi, '') || 'png';
                const filename = `Image ${thisNumber}.${safeExt}`;
                zip.file(filename, blob);
              } catch (_) {
                // Skip on failure
              }
            })());
          }
          if (tasks.length) {
            await Promise.all(tasks);
            await runBatch();
          }
        };

        await runBatch();
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, 'images.zip');
        return;
      }

      const imgSrc = selectedImage || allCarImages[0];
      if (!imgSrc) return;
      
      const computedName = selectedName || extractName(imgSrc) || 'image.png';
      try {
        const res = await fetch(imgSrc, { cache: 'no-store' });
        const blob = await res.blob();
        saveAs(blob, computedName);
      } catch (_) {
        const link = document.createElement("a");
        link.href = imgSrc;
        link.download = computedName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEnterSelectionMode = () => {
    setSelectionMode(true);
    const initialIndex = typeof selectedIndex === "number" ? selectedIndex : (allCarImages.length > 0 ? 0 : null);
    setSelectedIndices(initialIndex != null ? [initialIndex] : []);
  };

  const handleToggleIndex = (index) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    if (checked) {
      setSelectedIndices(allCarImages.map((_, i) => i));
    } else {
      setSelectedIndices([]);
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedIndices([]);
  };

  const handleClose = () => {
    setVisible(false);
    setSelectionMode(false);
    setSelectedIndices([]);
    setSelectedIndex(null);
    setSelectedImage(null);
    setSelectedName("");
  };

  return (
    <Modal
      centered
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={764}
      className="current-work-modal"
    >
      <div className="current-work-modal__header">
        <ModalHeader>{title}</ModalHeader>
      </div>

      <div className="current-work-first-container">
        <ZoomImageComponent 
          embed
          visible
          zoomImages={selectedImage || allCarImages[0]}
          onSelectImages={handleEnterSelectionMode}
          selectionMode={selectionMode}
          isAllSelected={selectedIndices.length === allCarImages.length && allCarImages.length > 0}
          onSelectAllChange={handleSelectAll}
          onCancelSelection={handleCancelSelection}
          downloadButtonId
        />
      </div>

      <div className="current-work-second-container">
        <BaseJob64ImageSlider 
          paths={getCleanImagePaths}
          desktopImagesPerPage={4}
          imgPreview={false}
          isDots={true}
          selectedIndices={selectionMode ? selectedIndices : []}
          showSelectionOverlay={selectionMode}
          previewIndex={typeof selectedIndex === 'number' ? selectedIndex : -1}
          onImageClick={(url, meta) => {
            if (selectionMode) {
              handleToggleIndex(meta.index);
            } else {
              setSelectedImage(url);
              setSelectedIndex(meta?.index ?? null);
              const displayName = extractName(meta?.path) || extractName(url);
              setSelectedName(displayName);
            }
          }}
          downloadButtonId
        />
      </div>

      <div className="current-work-footer">
        <div className="current-work-footer__checkbox">
          <img src={Icons.selectImg} alt="check-box" />
          <div className="current-file-name">
            {selectionMode
              ? (
                  selectedIndices.length === allCarImages.length && allCarImages.length > 0
                    ? "All Images Selected"
                    : (selectedIndices.length === 0
                        ? "Nothing selected"
                        : `${selectedIndices.length} ${selectedIndices.length === 1 ? "image" : "images"} selected`)
                )
              : (selectedName || "-")}
          </div>
        </div>
       
        <button
          className="download-btn"
          onClick={handleDownload}
          id={downloadButtonId}
        >
          {isDownloading ? (
            <>
              <img src={Icons.spinner_blue} alt="Downloading..." className="spinner" />
            </>
          ) : (
            "Download"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default CurrentWorkStartPicturePopUp;