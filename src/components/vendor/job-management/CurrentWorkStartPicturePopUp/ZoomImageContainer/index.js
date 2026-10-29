import React, { useState, useRef, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Checkbox } from "antd";
import "./styles.scss";
import Icons from "../../../../../utils/icons";

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const TRACK_WIDTH = 160;
const THUMB_WIDTH = 20;

const ZoomImageComponent = (props) => {
  const { 
    zoomImages, 
    visible, 
    setVisible, 
    embed = false, 
    onSelectImages,
    selectionMode = false,
    isAllSelected = false,
    onSelectAllChange,
    onCancelSelection,
    downloadButtonId
  } = props;

  const [scale, setScale] = useState(1);
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const wrapperRef = useRef(null);
  const imgRef = useRef(null);
  const setTransformRef = useRef(null);

  const getPositionFromScale = (scale) => {
    const progress = (scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE);
    return progress * (TRACK_WIDTH - THUMB_WIDTH);
  };

  const getScaleFromPosition = (position) => {
    const progress = position / (TRACK_WIDTH - THUMB_WIDTH);
    return progress * (MAX_SCALE - MIN_SCALE) + MIN_SCALE;
  };

  const updateThumbPosition = (position) => {
    const clamped = Math.max(0, Math.min(TRACK_WIDTH - THUMB_WIDTH, position));
    const newScale = getScaleFromPosition(clamped);
    setScale(newScale);
    return newScale;
  };

  const applyZoom = (newScale, setTransform) => {
    const ref = wrapperRef.current;
    if (ref) {
      const wrapper = ref.instance?.wrapperComponent || ref.wrapperComponent;
      const rect = wrapper && wrapper.getBoundingClientRect ? wrapper.getBoundingClientRect() : null;
      // Prefer anchoring to wrapper center if zoomTo is available
      if (typeof ref.zoomTo === 'function' && rect) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        try { ref.zoomTo(newScale, centerX, centerY); return; } catch (_) {}
      }
      // Fallback to zoomToElement on the image
      if (typeof ref.zoomToElement === 'function' && imgRef.current) {
        try { ref.zoomToElement(imgRef.current, newScale); return; } catch (_) {}
      }
    }
    // Last resort
    setTransform(0, 0, newScale);
  };

  const handleMouseMove = (e, setTransform) => {
    if (isDragging && trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const position = Math.max(
        0,
        Math.min(
          e.clientX - rect.left - THUMB_WIDTH / 2,
          TRACK_WIDTH - THUMB_WIDTH
        )
      );
      const newScale = updateThumbPosition(position);
      applyZoom(newScale, setTransform);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Reset zoom when image changes
  useEffect(() => {
    setScale(1);
    if (setTransformRef.current) {
      setTransformRef.current(0, 0, 1);
    }
    // Also reset using wrapper ref if available
    if (wrapperRef.current) {
      const ref = wrapperRef.current;
      if (typeof ref.resetTransform === 'function') {
        try {
          ref.resetTransform();
        } catch (_) {}
      }
    }
  }, [zoomImages]);

  // Only render nothing when visible is explicitly false
  if (visible === false) return null;

  return (
    <div className={embed ? "zoom-image-embed" : "zoom-image-modal-overlay"}>
      <div className={embed ? "zoom-image-embed-content" : "zoom-image-modal-content"}>
        {!embed && (
          <button className="zoom-image-modal-close" id={`zoom-image-modal-close-${downloadButtonId}`} onClick={() => setVisible && setVisible(false)}>
            ✕
          </button>
        )}
        <TransformWrapper
          ref={wrapperRef}
          key={zoomImages}
          initialScale={1}
          minScale={MIN_SCALE}
          maxScale={MAX_SCALE}
          onZoomStop={(ref) => setScale(ref.state.scale)}
        >
          {({ setTransform }) => {
            setTransformRef.current = setTransform;
            return (
            <>
              <TransformComponent>
                <img ref={imgRef} src={zoomImages} alt="Work Start" className="zoom-image" />
              </TransformComponent>

              <div className="download-zoom-row-container">
                {!selectionMode ? (
                  <div className="select-images-trigger" id={`zoom-image-modal-select-image-button-${downloadButtonId}`}  onClick={() => onSelectImages && onSelectImages()}>
                    <img src={Icons.image} alt="select" />
                    <span>Select Images</span>
                  </div>
                ) : (
                  <div className="select-mode-controls">
                    <div className="select-all-control">
                      <Checkbox checked={isAllSelected} onChange={onSelectAllChange} id={`zoom-image-modal-select-all-image-button-${downloadButtonId}`} />
                      <span className="check-box-label">Select All</span>
                    </div>
                    <div className="cancel-select-container">
                      <img id={`zoom-image-modal-cancel-icon-${downloadButtonId}`} src={Icons.close_icon} onClick={onCancelSelection} alt="select" />
                    <button className="cancel-select" onClick={onCancelSelection} id={`zoom-image-modal-cancel-button-${downloadButtonId}`}>Cancel</button>
                    </div>
                  </div>
                )}
                <div
                  className="zoom-controls"
                  onMouseMove={(e) => handleMouseMove(e, setTransform)}
                >
                  <button
                    className="zoom-btn"
                    id={`zoom-image-modal-select-prev-button-${downloadButtonId}`}
                    onClick={() => {
                      const newScale = Math.max(scale - 0.1, MIN_SCALE);
                      setScale(newScale);
                      applyZoom(newScale, setTransform);
                    }}
                  >
                    –
                  </button>

                  <div
                    className="zoom-track"
                    ref={trackRef}
                    onClick={(e) => {
                      const rect = trackRef.current.getBoundingClientRect();
                      const clickX = Math.max(
                        0,
                        Math.min(
                          e.clientX - rect.left - THUMB_WIDTH / 2,
                          TRACK_WIDTH - THUMB_WIDTH
                        )
                      );
                      const newScale = updateThumbPosition(clickX);
                      applyZoom(newScale, setTransform);
                    }}
                    id={`zoom-image-modal-track-image-${downloadButtonId}`}
                  >
                    <div
                      className="zoom-filled"
                      style={{
                        width: `${getPositionFromScale(scale) + THUMB_WIDTH / 2}px`,
                      }}
                    />
                    <div
                      className="zoom-thumb"
                      style={{
                        left: `${getPositionFromScale(scale)}px`,
                      }}
                      onMouseDown={() => setIsDragging(true)}
                      id={`zoom-image-drag-thumb-${downloadButtonId}`}
                    />
                  </div>

                  <button
                    className="zoom-btn"
                    id={`zoom-image-modal-select-image-next-${downloadButtonId}`}
                    onClick={() => {
                      const newScale = Math.min(scale + 0.1, MAX_SCALE);
                      setScale(newScale);
                      applyZoom(newScale, setTransform);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </>
            );
          }}
        </TransformWrapper>
      </div>
    </div>
  );
};

export default ZoomImageComponent;

