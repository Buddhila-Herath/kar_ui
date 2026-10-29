import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
  useCallback
} from "react";
import { Button, Checkbox } from "antd";
import { useDispatch, } from "react-redux";
import { getPauseReasonTypes, uploadPauseReasonImages, savePauseReasonFeedback } from "../../../../../slices/vendor/jobSlice";
import "./styles.css";

import CommentsInput from "../comments-input";
import Icons from "../../../../../utils/icons";
import ImageUploadComponent from "../ImageUploader";
import Base64ImageSlider from "../../../../../shared/slider/Base64ImageSlider";
import { getTempQuote } from '../../../../../utils/storage';

const PausedReasonDialogDropDown = forwardRef((props, ref) => {
  const { isValid, required, quoteId, onEditQuote, serviceId, onSaveSuccess, quoteLoading, jobId, serviceIds, isVendor } = props;
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState([]);
  const [transformedData, setTransformedData] = useState([]);
  const [comments, setComments] = useState({});
  const [imgUploadLoading, setImgUploadLoading] = useState(false);
  const [temporaryUploads, setTemporaryUploads] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const divRef = useRef(null);
  const [height, setHeight] = useState(340);

  useImperativeHandle(ref, () => ({
    toggleVisible() {
      setVisible(true);
    },
    toggleHide() {
      setVisible(false);
    },
    resetAllFields
  }));

  const handleSave = async () => {
    try {
      setLoading(true);
      setErrors({ formError: "" });
      const jobAlterationSelected = selected.some(item => 
        item.type === "comments-select" && !comments[item.id]?.trim()
      );
  
      /*if (jobAlterationSelected) {
        setErrors({
          formError: "Please add comments for Job Alteration"
        });
        return;
      }*/

      let tempQuote;
      if(serviceId) {
        tempQuote = getTempQuote(serviceId);
      } else {
        tempQuote = getTempQuote(jobId);
      }

      if (jobAlterationSelected && !tempQuote && isVendor) {
        setErrors({
          formError: "You have not edited quote, please edit or unselect Job Alteration"
        });
        return;
      }

      const imageSelectItems = selected.filter(item => item.type === "image-select");
      const missingImages = imageSelectItems.some(item => {
        const hasUploads = temporaryUploads.some(upload => upload.feedBackId === item.id);
        return !hasUploads;
      });
  
      if (missingImages) {
        setErrors({
          formError: "Please upload images for all selected image fields"
        });
        return;
      }
      
      // Combine temporary uploads with other feedback data
      const feedBackRequestDtos = selected.map(feedback => {
        // Find matching uploads
        const uploadData = temporaryUploads.find(
          upload => upload.feedBackId === feedback.id
        );
        
        return {
          feedBackId: feedback.id,
          uploadPaths: uploadData?.uploadPaths || [],
          comments: comments[feedback.id] || ""
        };
      });
  
      if(serviceId) {
        const payload = {
          quoteServiceId: serviceId,
          feedBackRequestDtos,
          isUniversalPaused: false
        };
    
        await dispatch(savePauseReasonFeedback(payload)).unwrap();
      } else if (serviceIds?.length > 0) {
        for (const quoteServiceId of serviceIds) {
          const payload = {
            quoteServiceId,
            feedBackRequestDtos,
            isUniversalPaused: true
          };
          await dispatch(savePauseReasonFeedback(payload)).unwrap();
        }
      } 
      else {
        throw new Error("No service IDs provided");
      }

      onSaveSuccess(true);
      setErrors({ formError: "" });
      setSuccessMessage("Feedback saved successfully!");
      
      setTimeout(() => {
        setSuccessMessage("");
        setVisible(false);
      }, 1000);
      
    } catch (error) {
      onSaveSuccess(false);
      setErrors({
        formError: error.errors ? error.errors[0] : "Something went wrong"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeedbackImages = async (item, images) => {
    setImgUploadLoading(true);
    try {
      const formData = new FormData();
      images.forEach((image) => {
        const fileToUpload = image.file ? image.file : image;
        formData.append('files', fileToUpload);
      });

      // First API call to upload images
      const uploadResponse = await dispatch(
        uploadPauseReasonImages({ feedbackType: item.feedbackType, returnPartType: item.returnPartType, formData })
      ).unwrap();

      if (!uploadResponse.folderPaths || !Array.isArray(uploadResponse.folderPaths)) {
        throw new Error('Invalid response format from image upload service');
      }

      // Helper to generate resized base64 previews (stable across rerenders)
      const MAX_DIMENSION = 600;
      const JPEG_QUALITY = 0.72;
      const generatePreviewDataUrl = async (file) => {
        try {
          if (typeof window.createImageBitmap === 'function') {
            const blobUrl = URL.createObjectURL(file);
            const probe = new Image();
            const dims = await new Promise((resolve, reject) => {
              probe.onload = () => resolve({ width: probe.naturalWidth, height: probe.naturalHeight });
              probe.onerror = reject;
              probe.src = blobUrl;
            });
            URL.revokeObjectURL(blobUrl);

            let targetWidth = dims.width;
            let targetHeight = dims.height;
            if (targetWidth > targetHeight && targetWidth > MAX_DIMENSION) {
              targetHeight = Math.round((targetHeight * MAX_DIMENSION) / targetWidth);
              targetWidth = MAX_DIMENSION;
            } else if (targetHeight >= targetWidth && targetHeight > MAX_DIMENSION) {
              targetWidth = Math.round((targetWidth * MAX_DIMENSION) / targetHeight);
              targetHeight = MAX_DIMENSION;
            }

            const bitmap = await createImageBitmap(file, { resizeWidth: targetWidth, resizeHeight: targetHeight, resizeQuality: 'high' });
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
            const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
            if (typeof bitmap.close === 'function') { try { bitmap.close(); } catch (_e) {} }
            return dataUrl;
          }
        } catch (_e) {}

        // Fallback path
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              let { width, height } = img;
              if (width > height && width > MAX_DIMENSION) {
                height = Math.round((height * MAX_DIMENSION) / width);
                width = MAX_DIMENSION;
              } else if (height >= width && height > MAX_DIMENSION) {
                width = Math.round((width * MAX_DIMENSION) / height);
                height = MAX_DIMENSION;
              }
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
            };
            img.onerror = reject;
            img.src = reader.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        return dataUrl;
      };

      // Create temporary previews as base64 (not object URLs)
      const tempPreviews = await Promise.all(
        images.filter(image => image.file).map(image => generatePreviewDataUrl(image.file))
      );

      // Store uploaded paths with feedback ID (limit to 3 images per reason)
      setTemporaryUploads(prev => {
        // Find existing uploads for this feedback ID
        const existingUpload = prev.find(u => u.feedBackId === item.value);
        const already = existingUpload?.previews?.length || 0;
        const remainingSlots = Math.max(0, 3 - already);
        const incomingPaths = uploadResponse.folderPaths.map(p => p.path).slice(0, remainingSlots);
        const incomingPreviews = tempPreviews.slice(0, remainingSlots);
        
        return [
          ...prev.filter(p => p.feedBackId !== item.value),
          {
            feedBackId: item.value,
            uploadPaths: (
              [
                ...(existingUpload?.uploadPaths || []),
                ...incomingPaths
              ].slice(0, 3)
            ),
            feedbackType: item.feedbackType,
            previews: (
              [
                ...(existingUpload?.previews || []),
                ...incomingPreviews
              ].slice(0, 3)
            ),
          }
        ];
      });

      // Clear upload-related errors after successful upload
      setErrors(prev => ({
        ...prev,
        formError: prev.formError?.includes("upload images") ? "" : prev.formError || ""
      }));
      
      return { success: true, paths: uploadResponse.folderPaths.map(p => p.path) };

    } catch (error) {
      setErrors({
        formError: error.errors ? error.errors[0] : "Something went wrong"
      });
      return { 
        success: false, 
        error: error.errors ? error.errors[0] : "Image upload failed" 
      };
    } finally {
      setImgUploadLoading(false);
    }
  };

  const handleCommentsChange = useCallback((feedbackId, comment) => {
    setComments(prev => ({
      ...prev,
      [feedbackId]: comment
    }));

    setErrors({ formError: "" });
  }, []);

  const hasPendingUploads = useCallback(() => {
    const imageSelectItems = selected.filter(item => item.type === "image-select");
    return imageSelectItems.some(item => {
      const hasUploads = temporaryUploads.some(upload => upload.feedBackId === item.id);
      return !hasUploads;
    });
  }, [selected, temporaryUploads]);

  const hasPendingUploadsForOtherItems = useCallback((currentItemId) => {
    const imageSelectItems = selected.filter(item => item.type === "image-select");
    
    // If no other items, this is the first one - should be enabled
    if (imageSelectItems.length === 0) {
      return false;
    }
    
    // Find the current item's position in the selection order
    const currentItemIndex = imageSelectItems.findIndex(item => item.id === currentItemId);
    
    // If this is the first item, it should always be enabled
    if (currentItemIndex === 0) {
      return false;
    }
    
    // Check if any previous items (before current item) don't have uploads yet
    const previousItems = imageSelectItems.slice(0, currentItemIndex);
    return previousItems.some(item => {
      const hasUploads = temporaryUploads.some(upload => upload.feedBackId === item.id);
      return !hasUploads;
    });
  }, [selected, temporaryUploads]);

  useEffect(() => {
    return () => {
      temporaryUploads.forEach(upload => {
        upload.previews.forEach(preview => {
          if (preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
          }
        });
      });
    };
  }, [temporaryUploads]);

  useEffect(() => {
    if (errors.formError && errors.formError.includes("Job Alteration")) {
      const jobAlterationSelected = selected.some(item => 
        item.type === "comments-select"
      );
      
      if (!jobAlterationSelected) {
        setErrors({ formError: "" });
      }
    }
  }, [selected, errors.formError]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await dispatch(getPauseReasonTypes()).unwrap();
        setFeedbackData(response);
        transformData(response);
      } catch (error) {
        console.error("Error fetching pause reasons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const transformData = (apiData) => {
    const newData = apiData.map(item => {
      const baseItem = {
        id: item.id,
        title: item.feedBack,
        items: []
      };

      // Part Return becomes multi-select with image-select children
      if (item.feedBack === "Part Return") {
        return {
          ...baseItem,
          type: "multi-select",
            items: item.feedBackSubDtos
            .sort((a, b) => {
              const order = {
                "Damaged Part": 1,
                "Wrong Part": 2
               
              };
              return (order[a.subFeedBack] || 99) - (order[b.subFeedBack] || 99);
            }).map(subItem => ({
            label: subItem.subFeedBack,
            value: subItem.id,
            type: "image-select",
            feedbackType: "returnPart",
            returnPartType: subItem.subFeedBack === "Damaged Part" ? "damage" : 
                            subItem.subFeedBack === "Wrong Part" ? "wrong" : ""
          }))
        };
      }
      // Order Part becomes image-select
      else if (item.feedBack === "Order Part") {
        return {
          ...baseItem,
          type: "image-select",
          feedbackType: "orderPart",
          items: []
        };
      }
      // Job Alteration becomes comments-select
      else if (item.feedBack === "Job Alteration") {
        return {
          ...baseItem,
          type: "comments-select",
          items: []
        };
      }
      // All others become single-select
      else {
        return {
          ...baseItem,
          type: "single-select",
          items: []
        };
      }
    });

    setTransformedData(newData);
  };

  const CustomOption = (props) => {
    const {
      label,
      selected,
      onChangeSelected,
      separator = true,
      items,
      type,
      id,
      feedbackType,
      onCommentsChange,
      onImagesUpload
    } = props;

    const memoizedCommentsInput = useMemo(() => (
      <CommentsInput
        quoteId={quoteId}
        onEditQuote={onEditQuote}
        value={comments[id] || ''}
        onChange={(value) => onCommentsChange(id, value)}
        quoteLoading={quoteLoading}
        isVendor={isVendor}
      />
    ), [quoteId, onEditQuote, comments[id], id, onCommentsChange]);

    return (
      <div className="paused-reason-dialog-down-option">
        {type === "multi-select" ? (
          <ChildSelect 
            items={items} 
            title={label} 
            feedbackId={id}
            onCommentsChange={onCommentsChange}
            onImagesUpload={onImagesUpload}
          />
        ) : type === "image-select" ? (
          <div>
            <CheckList
              selected={selected}
              onChangeSelected={onChangeSelected}
              label={label}
            />
            {(() => {
              const uploadedCount = (temporaryUploads.find(u => u.feedBackId === id)?.previews.length) || 0;
              const remainingSlots = Math.max(0, 3 - uploadedCount);
              return selected && remainingSlots > 0 ? (
              <>
           <ImageUploadComponent
                    totalImages={remainingSlots}
                  isUploading={imgUploadLoading}
                  feedbackId={id}
                  onUpload={(images) => handleSaveFeedbackImages({
                    value: id,
                    feedbackType: feedbackType,
                    returnPartType: ""
                  }, images)}
                  disabled={hasPendingUploadsForOtherItems(id)}
                />
                {hasPendingUploadsForOtherItems(id) && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>Upload the pending image before selecting this reason</h6>
                  </div>
                )}
            </>
              ) : null;
            })()}
            {temporaryUploads.find(u => u.feedBackId === id)?.uploadPaths.length > 0 && (
              <div className="img-preview-conainer">
                <Base64ImageSlider
                  key={id + temporaryUploads.find(u => u.feedBackId === id).previews.length} 
                  images={temporaryUploads.find(u => u.feedBackId === id).previews}
                  imgPreview={false}
                  desktopImagesPerPage={4}
                  isDataType={true}
                  isDots={false}
                />
              </div>
            )}
          </div>
        ) : type === "comments-select" ? (
          <div>
            <CheckList
              selected={selected}
              onChangeSelected={onChangeSelected}
              label={label}
            />
            {selected && memoizedCommentsInput}            
          </div>
        ) : (
          <CheckList
            selected={selected}
            onChangeSelected={onChangeSelected}
            label={label}
          />
        )}

        {separator && type !== "child" && (
          <div className="paused-reason-dialog-down-separator" />
        )}
      </div>
    );
  };

  const CheckList = (props) => {
    const { selected, onChangeSelected, label, style, separator } = props;

    return (
      <div>
        <div
          style={style}
          className="paused-reason-dialog-down-checkbox-container"
        >
          <Checkbox
            className={`checkbox-option ${
              selected ? "checkbox-option__selected" : ""
            }`}
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              onChangeSelected(e);
              if (!e.target.checked) {
                setErrors(prev => ({
                  ...prev,
                  formError: prev?.formError?.includes("upload images") ? "" : prev?.formError || ""
                }));
              }
            }}
          />
          <label className="paused-reason-dialog-down-label">{label}</label>
        {(separator || (label === "Wrong Part" && selected)) && (
          <div style={{ marginLeft: "30px" }} className="paused-reason-dialog-down-separator" />
        )}
        </div>
      </div>
    );
  };

  const ChildSelect = (props) => {
    const { items, title, feedbackId, onCommentsChange, onImagesUpload } = props;
    const [show, setShow] = useState(true);
    
    return (
      <div>
        <Button
          onClick={() => {
            setShow(!show);
          }}
          id="paused-reason-dialog-down-list-button"
          iconPosition="end"
          className={`paused-reason-dialog-down-list-button`}
          title="Select"
          icon={
            <img
              src={!show ? Icons.caret_down : Icons.caret_up_white}
              alt="chevron-down"
              className={show ? "rotate" : ""}
            />
          }
          style={{
            height: "40px",
            borderRadius: "5px",
            backgroundColor: "#30579D",
            alignItems: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#30579D";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#30579D";
          }}
        >
          <label className="paused-reason-dialog-down-list-title">
            {title}
          </label>
        </Button>
  
        {show && items.map((item) => (
          <div key={item.value}>
            <CheckList
              selected={selected.filter((opt) => opt.id === item.value).length > 0}
              separator={items.indexOf(item) !== items.length - 1}
              style={{
                paddingLeft: "30px",
                marginLeft:"0px",
                borderRadius: "4px",
                backgroundColor:
                  selected.filter((opt) => opt.id === item.value).length > 0
                    ? "#E4EAF2"
                    : "transparent",
              }}
              label={item.label}
              onChangeSelected={(e) => {
                                 if (e.target.checked) {
                   setSelected((prev) => [
                     ...prev,
                     {
                       type: item.type || "child", 
                       id: item.value,
                       title: item.label,
                       parentTitle: title,
                       items: items,
                     },
                   ]);
                 } else {
                  setSelected((prev) => prev.filter((opt) => opt.id !== item.value));
                }
              }}
            />
            
            {Array.isArray(selected) && selected.some(opt => opt.id === item.value && opt.type === "image-select") && (
               <div style={{  marginTop: "10px" }}>
                 {(() => {
                   const uploadedCount = (temporaryUploads.find(u => u.feedBackId === item.value)?.previews.length) || 0;
                   const remainingSlots = Math.max(0, 3 - uploadedCount);
                   return remainingSlots > 0 ? (
                 <ImageUploadComponent
                   key={`image-upload-${item.value}`} 
                       totalImages={remainingSlots}
                   isUploading={imgUploadLoading}
                   onUpload={(images) => handleSaveFeedbackImages(item, images)}
                   feedbackId={item.value}
                   disabled={hasPendingUploadsForOtherItems(item.value)}
                 />
                   ) : null;
                 })()}
                                   {hasPendingUploadsForOtherItems(item.value) && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>Upload the pending image before selecting this reason</h6>
                    </div>
                  )}
                 {temporaryUploads.find(u => u.feedBackId === item.value)?.uploadPaths.length > 0 && (
                   <div className="img-preview-conainer">
                     <Base64ImageSlider
                       key={item.value + temporaryUploads.find(u => u.feedBackId === item.value).previews.length} 
                       images={temporaryUploads.find(u => u.feedBackId === item.value).previews}
                       imgPreview={false}
                       desktopImagesPerPage={4}
                       isDataType={true}
                       isDots={false}
                     />
                   </div>
                 )}
               </div>
             )}

          {item.label === "Damaged Part" && 
           Array.isArray(selected) && selected.some(opt => opt.id === item.value) && (
              <div style={{ marginLeft: "55px" }} className="paused-reason-dialog-down-separator" />
          )}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    let newHeight = 340;
    

    if (selected.find((item) => item.type === "image-select")) {
      newHeight = 500;
    }

    if (selected.find((item) => item.type === "comments-select")) {
      newHeight = 400;
    }

    if (
      !selected.find((item) =>
        ["image-select", "comments-select"].includes(item.type)
      )
    ) {
      newHeight = 340;
    }

    if (
      selected.find((item) => item.type === "image-select") &&
      selected.find((item) => item.type === "comments-select")
    ) {
      newHeight = window.innerHeight - 400;
    }
    

    setHeight(newHeight);
  }, [selected]);

  const resetAllFields = () => {
    setSelected([]);
    setComments({});
    setTemporaryUploads([]);
    setErrors({});
    setSuccessMessage("");
  };

  return (
    <div className="dropdown custom-multi-dropdown">
      <Button
        onClick={() => {
          setVisible(!visible);
        }}
        iconPosition="end"
        className={`dropdown-button ${visible ? "opened" : ""} ${
          [].length ? "selected" : ""
        } ${required ? "required" : ""} ${isValid ? "invalid" : ""}`}
        icon={
          <img
            src={Icons.caret_black_down}
            alt="chevron-down"
            className={visible ? "rotate" : ""}
          />
        }
      >
        <div className="selected-options">
          {selected.length === 0
            ? ""
            : selected.slice(0, 2).map((opt) => (
                <div key={opt.title} className="tag-container">
                  <span className="tag-label">{opt.title}</span>
                  <img
                    src={Icons.close_icon}
                    alt="remove"
                    className="tag-remove-icon"
                    id={opt.title}
                    onClick={() => {
                      setSelected((prev) => prev.filter((i) => i !== opt));
                    }}
                  />
                </div>
              ))}
          {selected.length > 2 && (
            <div className="tag-container">
              <span className="tag-label">+{selected.length - 2}</span>
            </div>
          )}
        </div>
      </Button>

      {visible && (
        <div className="paused-reason-dialog-down-container">
          <div
            ref={divRef}
            style={{
              height: `${height}px`,
              overflowY: "auto",
              paddingRight: "8px",
              paddingBottom: "24px",
            }}
          >
            {transformedData.map((item, index) => (
              <CustomOption
                key={item.id}
                id={item.id}
                label={item.title}
                selected={selected.some(sel => sel.id === item.id)}
                items={item.items}
                type={item.type}
                feedbackType={item.feedbackType}
                separator={index !== transformedData.length - 1}
                onChangeSelected={() => {
                  if (item.type !== "image-select") {
                    //  setVisible(false);
                  }
                  if (selected.includes(item)) {
                    setSelected((prev) => prev.filter((i) => i !== item));
                                     } else {
                     setSelected((prev) => [...prev, item]);
                   }
                }}
                onCommentsChange={handleCommentsChange}
              />
            ))}
          </div>

          <div className="paused-reason-dialog-down-separator" />
            <div className="pr-footer">
              <div className="pr-footer-messages">
                {errors.formError && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.formError}</h6>
                  </div>
                )}

                {successMessage && ( 
                  <div className="field-success">
                    <img src={Icons.check} alt="Success Icon" />
                    <h6>{successMessage}</h6>
                  </div>
                )}
                
              </div>
              <div className="pr-footer-buttons">
                <button
                  className="pr-footer-cancel-btn"
                  onClick={() => {
                    resetAllFields();
                    setVisible(false);
                  }}
                  id="pause-job-dropdown-cancel-button"
                >
                  Cancel
                </button>

                <button 
                  className="pr-footer-save-btn"
                  onClick={handleSave}
                  disabled={selected.length === 0 || loading}
                  id="pause-job-dropdown-save-button"
                >
                  {loading ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
});

PausedReasonDialogDropDown.displayName = "PausedReasonDialogDropDown";

export default PausedReasonDialogDropDown;
