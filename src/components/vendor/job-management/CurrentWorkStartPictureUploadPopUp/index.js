import React, { useState, useRef, useEffect } from "react";
import { Modal, notification } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Icons from "../../../../utils/icons";
import { uploadOrderImage, uploadPostCompletionImage, deleteUploadedImage } from "../../../../slices/masterDataSlice";
import { saveCurrentWorkImages, saveCompletionWorkImages, uploadJobImages } from "../../../../slices/vendor/jobSlice";
import { uploadVehicleRegistrationImages } from "../../../../slices/vendor/vehicleSlice";
import CancelModal from "../../../../shared/components/CancelModal";
import "./styles.scss";
import RightSide from "../../../../assets/images/car-template-images/Rightside.png";
import FrontRightSide from "../../../../assets/images/car-template-images/FrontRightside.png";
import FrontSide from "../../../../assets/images/car-template-images/Frontside.png";
import FrontLeftSide from "../../../../assets/images/car-template-images/Frontleftside.png";
import LeftSide from "../../../../assets/images/car-template-images/Leftside.png";
import RearLeftSide from "../../../../assets/images/car-template-images/Rearleftside.png";
import RearSide from "../../../../assets/images/car-template-images/Rearside.png";
import RearRightSide from "../../../../assets/images/car-template-images/Rearrightside.png";
import InstrumentCluster from "../../../../assets/images/car-template-images/Instrumentclustor.png";
import Dashboard from "../../../../assets/images/car-template-images/dashboard.png";
import EngineCompartment from "../../../../assets/images/car-template-images/Engincompartment.png";

// Large preview images for each angle
import ImageOne from "../../../../assets/images/car-template-images/Image-1.png";
import ImageTwo from "../../../../assets/images/car-template-images/image -2.png";
import ImageThree from "../../../../assets/images/car-template-images/image-3.png";
import ImageFour from "../../../../assets/images/car-template-images/imaged-4.png";
import ImageFive from "../../../../assets/images/car-template-images/imaged-5.png";
import ImageSix from "../../../../assets/images/car-template-images/image-6.png";
import ImageSeven from "../../../../assets/images/car-template-images/image-7.png";
import ImageEight from "../../../../assets/images/car-template-images/image-8.png";
import ImageNine from "../../../../assets/images/car-template-images/image-9.png";
import ImageTen from "../../../../assets/images/car-template-images/image-10.png";
import ImageEleven from "../../../../assets/images/car-template-images/image-11.png";

const CurrentWorkStartPictureUploadPopUp = ({ visible, setVisible, onSave, jobId, jobCardNumber, title, vehicleId }) => {
  const dispatch = useDispatch();
  const [selectedAngle, setSelectedAngle] = useState(0);
  const [uploadedImages, setUploadedImages] = useState({}); // Store images for all angles: { angleId: { file, preview, view?, filename? } }
  const [orderResponse, setOrderResponse] = useState(null); // Store order API response for bulk uploads
  const [postCompletionUploadResponse, setPostCompletionUploadResponse] = useState(null); // Store uploadPostCompletionImage response for bulk uploads
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const swiperRef = useRef(null);
  const imagePathMapRef = useRef(new Map());
  // Track latest response paths by view name (angle name)
  const latestResponsePathsRef = useRef(new Map()); // Map<viewName, path>

  // Fallback job ID and job card number from store if props are not passed
  const vendorJobDetails = useSelector((state) => state.vendorJobs?.jobDetails);
  const technicianJobDetails = useSelector((state) => state.technicianJobs?.jobDetails);
  const effectiveJobId =
    jobId ||
    vendorJobDetails?.jobId ||
    technicianJobDetails?.jobId ||
    null;
  const effectiveJobCardNumber =
    jobCardNumber ||
    vendorJobDetails?.jobCardNumber ||
    technicianJobDetails?.jobCardNumber ||
    null;
  
  // Check if this is vehicle management mode (Initial Registration Photo)
  const isVehicleManagement = title === "Initial Registration Photo";

  const angles = [
    {
      id: 0,
      name: "Right Side",
      thumbnail: RightSide,
      preview: ImageOne,
    },
    { id: 1, name: "Front Right Side", thumbnail: FrontRightSide, preview: ImageTwo },
    { id: 2, name: "Front Side", thumbnail: FrontSide, preview: ImageThree },
    { id: 3, name: "Front Left Side", thumbnail: FrontLeftSide, preview: ImageFour },
    { id: 4, name: "Left Side", thumbnail: LeftSide, preview: ImageFive },
    { id: 5, name: "Rear Left Side", thumbnail: RearLeftSide, preview: ImageSix },
    { id: 6, name: "Rear Side", thumbnail: RearSide, preview: ImageSeven },
    { id: 7, name: "Rear Right Side", thumbnail: RearRightSide, preview: ImageEight },
    { id: 8, name: "Instrument Cluster", thumbnail: InstrumentCluster, preview: ImageNine },
    { id: 9, name: "Dashboard", thumbnail: Dashboard, preview: ImageTen },
    { id: 10, name: "Engine Compartment", thumbnail: EngineCompartment, preview: ImageEleven },
  ];

  // Group angles in 4-4-3 pattern
  const firstCarSet = {
    imageFirstRow: [
      angles[0].thumbnail,
      angles[1].thumbnail,
      angles[2].thumbnail,
      angles[3].thumbnail,
    ],
    imageSecondRow: [
      angles[4].thumbnail,
      angles[5].thumbnail,
      angles[6].thumbnail,
      angles[7].thumbnail,
    ],
    imageThirdRow: [
      angles[8].thumbnail,
      angles[9].thumbnail,
      angles[10].thumbnail,
    ],
  };

  const handleClose = () => {
    setVisible(false);
    setSelectedAngle(0);
    setUploadedImages({});
    setIsDragOver(false);
    setShowCancelConfirm(false);
    setOrderResponse(null);
    setPostCompletionUploadResponse(null);
    imagePathMapRef.current = new Map();
    latestResponsePathsRef.current = new Map();
  };

  const validateFile = (file) => {
    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        message: "Please upload PNG, JPG, or JPEG files only.",
      };
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return {
        valid: false,
        message: `File size is ${fileSizeInMB}MB. Each image must be up to 5MB.`,
      };
    }

    return { valid: true };
  };

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    let hasError = false;
    let errorMessage = "";

    // If multiple files, try to upload all at once
    if (fileArray.length > 1) {
      // Validate all files first
      for (let i = 0; i < fileArray.length && i < angles.length; i++) {
        const validation = validateFile(fileArray[i]);
        if (!validation.valid) {
          hasError = true;
          errorMessage = validation.message;
          break;
        }
      }

      if (hasError) {
        notification.error({
          message: <h5>Invalid file</h5>,
          description: errorMessage,
          icon: <img src={Icons.error} alt="Error" />,
          duration: 5,
        });
        return;
      }

      // Create FormData and upload images via API
      const totalFiles = Math.min(fileArray.length, angles.length);
      const filesToUpload = fileArray.slice(0, totalFiles);
      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append("files", file);
      });

      setIsUploading(true);
      try {
        // Determine if this is for "Post Completion Picture"
        const isPostCompletion = title === "Post Completion Picture";

        // Call uploadOrderImage API
        const response = await dispatch(uploadOrderImage(formData)).unwrap();

        // Create a map of filename to file for easy lookup
        const fileMap = new Map();
        filesToUpload.forEach((file) => {
          fileMap.set(file.name, file);
        });

        // Create a map of view name to angle index
        const viewToAngleMap = new Map();
        angles.forEach((angle, index) => {
          viewToAngleMap.set(angle.name, index);
        });

        // Store order response for later use when saving
        setOrderResponse(response);

        // Process ordered images from API response (store with view and filename from order API)
        if (response.ordered_images && Array.isArray(response.ordered_images) && response.ordered_images.length > 0) {
          // If Post Completion Picture or Vehicle Management, upload accepted images immediately
          if (isPostCompletion || isVehicleManagement) {
            try {
              // Create a map of view name to angle index
              const viewToAngleMap = new Map();
              angles.forEach((angle, index) => {
                viewToAngleMap.set(angle.name, index);
              });

              // Collect old paths that will be replaced
              const pathsToDelete = [];
              response.ordered_images.forEach((orderedImage) => {
                const { view } = orderedImage;
                const angleIndex = viewToAngleMap.get(view);
                if (angleIndex !== undefined && uploadedImages[angleIndex]?.path) {
                  pathsToDelete.push(uploadedImages[angleIndex].path);
                }
              });

              // Delete old images from server if they exist
              if (pathsToDelete.length > 0) {
                await Promise.all(
                  pathsToDelete.map((path) =>
                    dispatch(deleteUploadedImage({ path })).catch((err) => {
                      console.warn('Failed to delete old image:', err);
                      return null; // Continue even if deletion fails
                    })
                  )
                );
              }

              const uploadFormData = new FormData();
              response.ordered_images.forEach((orderedImage) => {
                const { view, filename } = orderedImage;
                const file = fileMap.get(filename);
                if (file) {
                  uploadFormData.append("files", file);
                  uploadFormData.append("sides", view);
                  uploadFormData.append("fileNames", filename);
                }
              });

              // Call upload API - use vehicle API for vehicle management, otherwise use post completion
              const uploadResponse = await dispatch(
                isVehicleManagement && vehicleId
                  ? uploadVehicleRegistrationImages({ vehicleId, formData: uploadFormData })
                  : uploadPostCompletionImage({ jobId: effectiveJobCardNumber, formData: uploadFormData })
              ).unwrap();
              
              // Update postCompletionUploadResponse - remove old paths and add new ones
              setPostCompletionUploadResponse((prev) => {
                if (prev && prev.folderPaths && pathsToDelete.length > 0) {
                  // Remove old paths that were replaced
                  const updatedFolderPaths = prev.folderPaths.filter((item) => {
                    const path = item.path || item.image || item.url || item;
                    return !pathsToDelete.includes(path);
                  });
                  // Add new paths
                  return {
                    ...prev,
                    folderPaths: [...updatedFolderPaths, ...(uploadResponse.folderPaths || [])],
                  };
                }
                return uploadResponse;
              });
              
              // Store latest response paths by view name
              if (uploadResponse?.folderPaths && Array.isArray(uploadResponse.folderPaths)) {
                response.ordered_images.forEach((orderedImage, index) => {
                  if (uploadResponse.folderPaths[index]) {
                    const path = uploadResponse.folderPaths[index].path || 
                                 uploadResponse.folderPaths[index].image || 
                                 uploadResponse.folderPaths[index].url || 
                                 uploadResponse.folderPaths[index];
                    // Store path by view name (angle name) for later use in save API
                    latestResponsePathsRef.current.set(orderedImage.view, path);
                  }
                });
              }
            } catch (uploadError) {
              notification.error({
                message: <h5>Failed to upload post completion images</h5>,
                description: uploadError.message || "Error uploading images to server",
                icon: <img src={Icons.error} alt="Error" />,
                duration: 5,
              });
              setIsUploading(false);
              return;
            }
          }

          const imagePromises = response.ordered_images.map((orderedImage) => {
            return new Promise((resolve) => {
              const { view, filename } = orderedImage;
              const angleIndex = viewToAngleMap.get(view);
              
              if (angleIndex !== undefined) {
                const file = fileMap.get(filename);
                if (file) {
                  // Get path from upload response if available (for post completion)
                  const imagePath = imagePathMapRef.current.get(filename) || null;
                  
                  // Process file for preview
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    resolve({
                      angleIndex,
                      data: {
                        file,
                        preview: reader.result,
                        view, // Store view (side) from order API response
                        filename, // Store filename from order API response
                        path: imagePath, // Store uploaded image path for deletion
                      },
                    });
                  };
                  reader.readAsDataURL(file);
                } else {
                  resolve(null);
                }
              } else {
                resolve(null);
              }
            });
          });

          // Wait for all images to be processed, then update state
          Promise.all(imagePromises).then((results) => {
            let firstOrderedAngle = null;
            const updatedImages = { ...uploadedImages };

            results.forEach((result) => {
              if (result) {
                updatedImages[result.angleIndex] = result.data;
                if (firstOrderedAngle === null) {
                  firstOrderedAngle = result.angleIndex;
                }
              }
            });

            setUploadedImages(updatedImages);
            
            // Set first ordered angle as selected
            if (firstOrderedAngle !== null) {
              setSelectedAngle(firstOrderedAngle);
            }
          });
        }

        // Show notifications for rejected images
        if (response.rejected_images && Array.isArray(response.rejected_images) && response.rejected_images.length > 0) {
          const rejectedNames = response.rejected_images.map(img => img.filename).join(", ");
          notification.warning({
            message: <h5>Some images were rejected</h5>,
            description: `${response.rejected_count} image(s) rejected: ${rejectedNames}. These images were not uploaded.`,
            icon: <img src={Icons.error} alt="Warning" />,
            duration: 5,
          });
        }

      } catch (error) {
        notification.error({
          message: <h5>{error.message || "Failed to upload images"}</h5>,
          icon: <img src={Icons.error} alt="Error" />,
          duration: 5,
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      // Single file upload for selected angle
      const file = fileArray[0];
      const validation = validateFile(file);
      
      if (!validation.valid) {
        notification.error({
          message: <h5>Invalid file</h5>,
          description: validation.message,
          icon: <img src={Icons.error} alt="Error" />,
          duration: 5,
        });
        return;
      }

      // Determine if this is for "Post Completion Picture"
      const isPostCompletion = title === "Post Completion Picture";

      setIsUploading(true);

      // If Post Completion Picture or Vehicle Management, upload immediately (before processing preview)
      if (isPostCompletion || isVehicleManagement) {
        try {
          // Check if there's already an image for this angle (replacement scenario)
          const existingImageData = uploadedImages[selectedAngle];
          const oldPath = existingImageData?.path;

          // If replacing an existing image, delete the old one from server
          if (oldPath) {
            try {
              await dispatch(deleteUploadedImage({ path: oldPath })).unwrap();
            } catch (deleteError) {
              // Log but continue - we'll still upload the new image
              console.warn('Failed to delete old image:', deleteError);
            }
          }

          const uploadFormData = new FormData();
          uploadFormData.append("files", file);
          uploadFormData.append("sides", angles[selectedAngle].name);
          uploadFormData.append("fileNames", file.name);

          // Call upload API - use vehicle API for vehicle management, otherwise use post completion
          const uploadResponse = await dispatch(
            isVehicleManagement && vehicleId
              ? uploadVehicleRegistrationImages({ vehicleId, formData: uploadFormData })
              : uploadPostCompletionImage({ jobId: effectiveJobCardNumber, formData: uploadFormData })
          ).unwrap();

          // Extract image path from response and store it
          const imagePath = uploadResponse?.folderPaths?.[0]?.path || uploadResponse?.folderPaths?.[0]?.image || uploadResponse?.folderPaths?.[0]?.url || uploadResponse?.folderPaths?.[0];
          
          // Store latest response path by view name (angle name)
          const viewName = angles[selectedAngle].name;
          latestResponsePathsRef.current.set(viewName, imagePath);

          // Update postCompletionUploadResponse - replace old path if exists, otherwise add new
          setPostCompletionUploadResponse((prev) => {
            if (prev && prev.folderPaths) {
              // Remove old path if replacing
              const updatedFolderPaths = oldPath 
                ? prev.folderPaths.filter((item) => {
                    const path = item.path || item.image || item.url || item;
                    return path !== oldPath;
                  })
                : prev.folderPaths;
              
              // Add new path
              return {
                ...prev,
                folderPaths: [...updatedFolderPaths, ...(uploadResponse.folderPaths || [])],
              };
            }
            return uploadResponse;
          });
          
          // Process single file for preview (store with angle name as side and path)
          const reader = new FileReader();
          reader.onloadend = () => {
            const imageData = {
              file,
              preview: reader.result,
              view: angles[selectedAngle].name, // Store angle name as side for single upload
              filename: file.name, // Store filename for single upload
              path: imagePath, // Store uploaded image path for deletion
            };

            setUploadedImages({
              ...uploadedImages,
              [selectedAngle]: imageData,
            });
            setIsUploading(false);
          };
          reader.onerror = () => {
            setIsUploading(false);
            notification.error({
              message: <h5>Failed to process image</h5>,
              icon: <img src={Icons.error} alt="Error" />,
              duration: 5,
            });
          };
          reader.readAsDataURL(file);
        } catch (uploadError) {
          notification.error({
            message: <h5>Failed to upload image</h5>,
            description: uploadError.message || "Error uploading image to server",
            icon: <img src={Icons.error} alt="Error" />,
            duration: 5,
          });
          setIsUploading(false);
          return;
        }
      } else {
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageData = {
            file,
            preview: reader.result,
            view: angles[selectedAngle].name, 
            filename: file.name, 
          };

          setUploadedImages({
            ...uploadedImages,
            [selectedAngle]: imageData,
          });
          setIsUploading(false);
        };
        reader.onerror = () => {
          setIsUploading(false);
          notification.error({
            message: <h5>Failed to process image</h5>,
            icon: <img src={Icons.error} alt="Error" />,
            duration: 5,
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
    e.target.value = null;
  };

  // Helper function to get slide index based on angle ID
  const getSlideIndex = (angleId) => {
    // On mobile, each angle is its own slide
    if (isMobile) {
      return angleId;
    }

    // On tablet/desktop, keep existing 4-4-3 grouping
    if (angleId >= 0 && angleId <= 3) return 0; // First row
    if (angleId >= 4 && angleId <= 7) return 1; // Second row
    if (angleId >= 8 && angleId <= 10) return 2; // Third row
    return 0;
  };

  // Auto-scroll to correct slide when selectedAngle changes
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper && visible) {
      const slideIndex = getSlideIndex(selectedAngle);
      swiperRef.current.swiper.slideTo(slideIndex);
    }
  }, [selectedAngle, visible]);

  // Detect mobile & tablet viewport
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        setIsMobileOrTablet(width <= 991);
        setIsMobile(width <= 767);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleAngleClick = (angleId) => {
    setSelectedAngle(angleId);
    // Auto-scroll to the correct slide
    if (swiperRef.current && swiperRef.current.swiper) {
      const slideIndex = getSlideIndex(angleId);
      swiperRef.current.swiper.slideTo(slideIndex);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handlePrevious = () => {
    if (selectedAngle > 0) {
      const newAngle = selectedAngle - 1;
      setSelectedAngle(newAngle);
      // Auto-scroll to the correct slide
      if (swiperRef.current && swiperRef.current.swiper) {
        const slideIndex = getSlideIndex(newAngle);
        swiperRef.current.swiper.slideTo(slideIndex);
      }
    }
  };

  const handleNext = () => {
    if (selectedAngle < angles.length - 1) {
      const newAngle = selectedAngle + 1;
      setSelectedAngle(newAngle);
      // Auto-scroll to the correct slide
      if (swiperRef.current && swiperRef.current.swiper) {
        const slideIndex = getSlideIndex(newAngle);
        swiperRef.current.swiper.slideTo(slideIndex);
      }
    }
  };


  const handleSave = async () => {
    // Validate that all 11 images are uploaded
    const uploadedCount = Object.keys(uploadedImages).length;
    if (uploadedCount !== angles.length) {
      notification.warning({
        message: <h5>Incomplete Upload</h5>,
        description: `Please upload all ${angles.length} images before saving. Currently ${uploadedCount} of ${angles.length} images uploaded.`,
        icon: <img src={Icons.error} alt="Warning" />,
        duration: 5,
      });
      return;
    }


    try {
      // Determine if this is for "Current Work Start Picture" or "Post Completion Picture"
      const isPostCompletion = title === "Post Completion Picture";
      
      let uploadResponse;
      
      // Check if images were already uploaded (either via bulk upload or single uploads)
      const wasBulkUpload = orderResponse && orderResponse.ordered_images && orderResponse.ordered_images.length > 0;
      const hasStoredUploadResponse = postCompletionUploadResponse !== null;
      
      // For vehicle management, use stored response if available, otherwise skip upload (images already uploaded)
      if (isVehicleManagement && hasStoredUploadResponse) {
        // Vehicle management: images are already uploaded, use stored response
        uploadResponse = postCompletionUploadResponse;
      } else if (isPostCompletion && hasStoredUploadResponse) {
        // Post Completion Picture: images are already uploaded (either bulk or single uploads)
        // Use the stored upload response
        uploadResponse = postCompletionUploadResponse;
      } else if (isPostCompletion && !hasStoredUploadResponse) {
        // Post Completion Picture: upload remaining images that weren't uploaded yet
        // This should rarely happen, but handle it as a fallback
        const uploadFormData = new FormData();
        Object.keys(uploadedImages).forEach((angleId) => {
          const imageData = uploadedImages[angleId];
          const side = imageData.view || angles[parseInt(angleId)].name;
          const filename = imageData.filename || imageData.file.name;

          uploadFormData.append("files", imageData.file);
          uploadFormData.append("sides", side);
          uploadFormData.append("fileNames", filename);
        });

        uploadResponse = await dispatch(
          isVehicleManagement && vehicleId
            ? uploadVehicleRegistrationImages({ vehicleId, formData: uploadFormData })
            : uploadPostCompletionImage({ jobId: effectiveJobCardNumber, formData: uploadFormData })
        ).unwrap();
        
        // Store paths from this upload response
        if (uploadResponse?.folderPaths && Array.isArray(uploadResponse.folderPaths)) {
          Object.keys(uploadedImages).forEach((angleId, index) => {
            const imageData = uploadedImages[angleId];
            const viewName = imageData.view || angles[parseInt(angleId)].name;
            if (uploadResponse.folderPaths[index]) {
              const path = uploadResponse.folderPaths[index].path || 
                           uploadResponse.folderPaths[index].image || 
                           uploadResponse.folderPaths[index].url || 
                           uploadResponse.folderPaths[index];
              latestResponsePathsRef.current.set(viewName, path);
            }
          });
        }
      } else if (isVehicleManagement && !hasStoredUploadResponse) {
        // Vehicle management: upload remaining images if not already uploaded
        const uploadFormData = new FormData();
        Object.keys(uploadedImages).forEach((angleId) => {
          const imageData = uploadedImages[angleId];
          const side = imageData.view || angles[parseInt(angleId)].name;
          const filename = imageData.filename || imageData.file.name;

          uploadFormData.append("files", imageData.file);
          uploadFormData.append("sides", side);
          uploadFormData.append("fileNames", filename);
        });

        uploadResponse = await dispatch(
          uploadVehicleRegistrationImages({ vehicleId, formData: uploadFormData })
        ).unwrap();
        
        // Store paths from this upload response
        if (uploadResponse?.folderPaths && Array.isArray(uploadResponse.folderPaths)) {
          Object.keys(uploadedImages).forEach((angleId, index) => {
            const imageData = uploadedImages[angleId];
            const viewName = imageData.view || angles[parseInt(angleId)].name;
            if (uploadResponse.folderPaths[index]) {
              const path = uploadResponse.folderPaths[index].path || 
                           uploadResponse.folderPaths[index].image || 
                           uploadResponse.folderPaths[index].url || 
                           uploadResponse.folderPaths[index];
              latestResponsePathsRef.current.set(viewName, path);
            }
          });
        }
      } else {
        // Current Work Start Picture: use uploadJobImages API (only for job management)
        const uploadFormData = new FormData();
        Object.keys(uploadedImages).forEach((angleId) => {
          const imageData = uploadedImages[angleId];
          uploadFormData.append("files", imageData.file);
        });

        uploadResponse = await dispatch(
          uploadJobImages({ type: "current", formData: uploadFormData })
        ).unwrap();
      }

      // Build imageDtoList from latest response paths (not from state)
      // Collect paths from latestResponsePathsRef based on view names in uploadedImages
      const imageDtoList = [];
      
      // Iterate through angles in order (0-10) to maintain correct ordering
      for (let angleId = 0; angleId < angles.length; angleId++) {
        const imageData = uploadedImages[angleId];
        if (imageData) {
          // Get view name (angle name) from imageData or angles array
          const viewName = imageData.view || angles[angleId].name;
          
          // Get latest path from response paths ref (by view name)
          const pathFromResponse = latestResponsePathsRef.current.get(viewName);
          
          if (pathFromResponse) {
            // Use path from latest response
            imageDtoList.push({
              image: pathFromResponse,
              order: angleId + 1,
            });
          } else if (isPostCompletion && uploadResponse?.folderPaths) {
            // Fallback: if not in ref, try to get from current uploadResponse
            // This handles the case where we just uploaded in this save call
            const responsePath = uploadResponse.folderPaths.find((item, idx) => {
              // Try to match by index if available
              return idx === angleId;
            });
            if (responsePath) {
              const path = responsePath.path || responsePath.image || responsePath.url || responsePath;
              imageDtoList.push({
                image: path,
                order: angleId + 1,
              });
            }
          } else if (!isPostCompletion && uploadResponse?.folderPaths?.[angleId]) {
            // For current work start, use direct index mapping
            const item = uploadResponse.folderPaths[angleId];
            imageDtoList.push({
              image: item.path || item.image || item.url || item,
              order: angleId + 1,
            });
          }
        }
      }

      console.log('📁 Latest Response Paths (by view):', Array.from(latestResponsePathsRef.current.entries()));
      console.log('📁 Upload Response folderPaths:', uploadResponse?.folderPaths);
      console.log('📸 Current uploadedImages:', Object.keys(uploadedImages).map(id => ({
        angleId: id,
        view: uploadedImages[id]?.view,
        filename: uploadedImages[id]?.filename
      })));
      console.log('💾 File paths being sent to save API:', imageDtoList);
      console.log('📋 Save API payload:', {
        jobId: effectiveJobId,
        imageDtoList,
        isPostCompletion
      });

      // Only proceed if we have paths to save
      if (imageDtoList.length > 0) {

        // For vehicle management, collect paths and pass to onSave (no API call needed)
        if (isVehicleManagement) {
          // Extract paths from imageDtoList
          const imagePaths = imageDtoList.map(item => item.image);
          
          // Call onSave callback with paths for vehicle management
          if (onSave) {
            onSave(imagePaths, uploadResponse);
          }
          
          handleClose();
          return;
        }

        // For job management, save to database
        try {
          if (!effectiveJobId) {
            throw new Error(`Job ID is required to save ${isPostCompletion ? 'post completion' : 'current work'} images`);
          }
          
          if (isPostCompletion) {
            // Save post completion images
            await dispatch(
              saveCompletionWorkImages({
                jobId: effectiveJobId, // use parent-provided jobId (actual job ID, not job card number)
                imageDtoList,
              })
            ).unwrap();
          } else {
            // Save current work images
            await dispatch(
              saveCurrentWorkImages({
                jobId: effectiveJobId, // use parent-provided jobId (actual job ID, not job card number)
                imageDtoList,
              })
            ).unwrap();
          }
        } catch (saveError) {
          const errorMessage = isPostCompletion ? 'Failed to save post completion images' : 'Failed to save current work images';
          notification.error({
            message: <h5>{errorMessage}</h5>,
            description: saveError.message || "Error saving image metadata",
            icon: <img src={Icons.error} alt="Error" />,
            duration: 5,
          });
          throw saveError;
        }
      }

      notification.success({
        message: <h5>Images uploaded successfully!</h5>,
        description: `All ${angles.length} images have been uploaded.`,
        icon: <img src={Icons.check} alt="Success" />,
        duration: 5,
      });

      // Call onSave callback if provided
      if (onSave) {
        const imagesData = Object.keys(uploadedImages).map((angleId) => ({
          angle: angles[parseInt(angleId)],
          file: uploadedImages[angleId].file,
          image: uploadedImages[angleId].preview,
        }));
        onSave(imagesData, uploadResponse);
      }

      handleClose();
    } catch (error) {
      notification.error({
        message: <h5>Failed to upload images</h5>,
        description: error.message || "Error uploading images to server",
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    }
  };

  const handleCancel = () => {
    // Always show confirmation popup when cancel is clicked
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    handleClose();
  };

  const handleContinueUploading = () => {
    setShowCancelConfirm(false);
  };

  const handleRemoveImage = async (angleId, e) => {
    e.stopPropagation();
    const imageData = uploadedImages[angleId];
    
    if (imageData?.path) {
      try {
        await dispatch(deleteUploadedImage({ path: imageData.path })).unwrap();
      } catch (error) {
        notification.error({
          message: <h5>Failed to delete image</h5>,
          description: error.message || "Error deleting image from server",
          icon: <img src={Icons.error} alt="Error" />,
          duration: 5,
        });
      
      }
    }
    

    const updatedImages = { ...uploadedImages };
    delete updatedImages[angleId];
    setUploadedImages(updatedImages);
    
   
    const viewName = imageData?.view || angles[angleId]?.name;
    if (viewName) {
      latestResponsePathsRef.current.delete(viewName);
    }
   
    if (postCompletionUploadResponse?.folderPaths) {
      const updatedFolderPaths = postCompletionUploadResponse.folderPaths.filter(
        (item) => {
          const path = item.path || item.image || item.url || item;
          return path !== imageData.path;
        }
      );
      setPostCompletionUploadResponse({
        ...postCompletionUploadResponse,
        folderPaths: updatedFolderPaths,
      });
    }
  };

  const renderPreview = () => (
    <div className="upload-popup-left">
      <div className="vehicle-image-container">
        <div className="vehicle-placeholder">
          <img
            src={angles[selectedAngle].preview}
            alt={angles[selectedAngle].name}
            className="placeholder-image"
          />
        </div>
      </div>
    </div>
  );

  const renderUploadRight = () => (
    <div className="upload-popup-right">
      <div className="upload-section">
        <div className="special-note">
          <span className="note-label">Special Note:</span> Please ensure
          the image matches the highlighted angle
        </div>

        <div
          className={`upload-dropzone ${isDragOver ? "drag-over" : ""} ${
            uploadedImages[selectedAngle] ? "has-image" : ""
          } ${isUploading ? "uploading" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploadedImages[selectedAngle] && !isUploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileInputChange}
            multiple
            style={{ display: "none" }}
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="uploading-state">
              <div className="uploading-spinner">
                <img 
                  src={Icons.spinner_blue} 
                  alt="Uploading..." 
                  className="spinner" 
                  width="26" 
                  height="26"
                />
              </div>
              <p className="uploading-text">Uploading...</p>
            </div>
          ) : uploadedImages[selectedAngle] ? (
            <div className="uploaded-image-wrapper">
              <img
                src={uploadedImages[selectedAngle].preview}
                alt="Uploaded vehicle"
                className="uploaded-vehicle-image"
              />
              <button
                className="remove-image-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(selectedAngle, e);
                }}
                type="button"
              >
                <img className="remove-icon" src={Icons.rounded_close || Icons.x} alt="Remove" />
              </button>
            </div>
          ) : (
            <>
              <div className="upload-icon">
                <img
                  src={Icons.cloud_arrow_up}
                  alt="Upload"
                  className="upload-icon-img"
                />
              </div>
              <p className="upload-text">
                <span
                  className="upload-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Click to upload
                </span>{" "}
                or drag & drop your image here
              </p>
              <p className="upload-formats">
                PNG, JPG and JPEG, up to 5MB
              </p>
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="upload-navigation">
          <button
            className="nav-button prev-button"
            onClick={handlePrevious}
            disabled={selectedAngle === 0}
          >
            Previous
          </button>
          <button
            className="nav-button next-button nav-next"
            onClick={handleNext}
            disabled={selectedAngle === angles.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  const renderCarousel = () => (
    <div className="upload-popup-carousel">
      <Swiper
        ref={swiperRef}
        style={{
          "--swiper-navigation-color": "#000",
          "--swiper-pagination-color": "#183571",
        }}
        speed={600}
        pagination={
          isMobile
            ? false
            : {
                clickable: true,
              }
        }
        navigation={true}
        modules={[Navigation, Pagination]}
        className="upload-popup-swiper"
      >
        {isMobile ? (
          angles.map((angle, index) => {
            const hasUploadedImage = uploadedImages[index];
            const isActive = selectedAngle === index;
            return (
              <SwiperSlide className="scroller" key={angle.id}>
                <div
                  className={`first-swiper-slider-container ${
                    isActive ? "active" : ""
                  } ${hasUploadedImage ? "uploaded" : ""}`}
                  onClick={() => handleAngleClick(index)}
                >
                  <div className="car-image-container">
                    <img
                      src={angle.thumbnail}
                      alt={angle.name}
                      className="car-image"
                    />
                  </div>
                  <div className="car-image-label">
                    {index + 1}. {angle.name}
                  </div>
                </div>
              </SwiperSlide>
            );
          })
        ) : (
          <>
            <SwiperSlide className="scroller">
              {firstCarSet?.imageFirstRow?.map((carUrl, index) => {
                const globalIndex = index;
                const hasUploadedImage = uploadedImages[globalIndex];
                const isActive = selectedAngle === globalIndex;
                return (
                  <div
                    key={index}
                    className={`first-swiper-slider-container ${
                      isActive ? "active" : ""
                    } ${hasUploadedImage ? "uploaded" : ""}`}
                    onClick={() => handleAngleClick(globalIndex)}
                  >
                    <div className="car-image-container">
                      <img
                        src={carUrl}
                        alt={angles[globalIndex].name}
                        className="car-image"
                      />
                    </div>
                    <div className="car-image-label">
                      {globalIndex + 1}. {angles[globalIndex].name}
                    </div>
                  </div>
                );
              })}
            </SwiperSlide>

            <SwiperSlide className="scroller">
              {firstCarSet?.imageSecondRow?.map((carUrl, index) => {
                const globalIndex = index + 4;
                const hasUploadedImage = uploadedImages[globalIndex];
                const isActive = selectedAngle === globalIndex;
                return (
                  <div
                    key={index}
                    className={`first-swiper-slider-container ${
                      isActive ? "active" : ""
                    } ${hasUploadedImage ? "uploaded" : ""}`}
                    onClick={() => handleAngleClick(globalIndex)}
                  >
                    <div className="car-image-container">
                      <img
                        src={carUrl}
                        alt={angles[globalIndex].name}
                        className="car-image"
                      />
                    </div>
                    <div className="car-image-label">
                      {globalIndex + 1}. {angles[globalIndex].name}
                    </div>
                  </div>
                );
              })}
            </SwiperSlide>

            <SwiperSlide className="scroller">
              {firstCarSet?.imageThirdRow?.map((carUrl, index) => {
                const globalIndex = index + 8;
                const hasUploadedImage = uploadedImages[globalIndex];
                const isActive = selectedAngle === globalIndex;
                return (
                  <div
                    key={index}
                    className={`first-swiper-slider-container ${
                      isActive ? "active" : ""
                    } ${hasUploadedImage ? "uploaded" : ""}`}
                    onClick={() => handleAngleClick(globalIndex)}
                  >
                    <div className="car-image-container">
                      <img
                        src={carUrl}
                        alt={angles[globalIndex].name}
                        className="car-image"
                      />
                    </div>
                    <div className="car-image-label">
                      {globalIndex + 1}. {angles[globalIndex].name}
                    </div>
                  </div>
                );
              })}
            </SwiperSlide>
          </>
        )}
      </Swiper>
    </div>
  );

  const renderFooter = () => (
    <div className="upload-popup-footer">
      <div className="footer-left">
      </div>
      <div className="footer-right">
        <button className="action-button cancel-button" onClick={handleCancel}>
          Cancel
        </button>
        <button
          className="action-button save-button"
          onClick={handleSave}
          disabled={Object.keys(uploadedImages).length !== angles.length}
        >
          Save
        </button>
      </div>
    </div>
  );

  return (
    <>
    <Modal
      centered
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={796}
      className="current-work-upload-modal"
      closable={true}
    >
      <div className="upload-popup-container">
        {/* Header */}
        <div className="upload-popup-header">
          <h3 className="upload-popup-title">
            {isVehicleManagement 
              ? "Initial Registration Photo" 
              : (title || "Current Work Start Picture")
            }
          </h3>
          <button className="upload-popup-close" onClick={handleCancel} type="button">
            <img src={Icons.close_icon || Icons.x} alt="Close" />
          </button>
        </div>

        {/* Layout: mobile/tablet vs desktop */}
        {isMobileOrTablet ? (
          <>
            {/* Preview */}
            {renderPreview()}
            {/* Slider */}
            {renderCarousel()}
            {/* Special note, upload & prev/next */}
            {renderUploadRight()}
            {/* Footer */}
            {renderFooter()}
          </>
        ) : (
          <>
            {/* Main Content */}
            <div className="upload-popup-content">
              {/* Left Side - Vehicle Image */}
              {renderPreview()}
              {/* Right Side - Upload Area */}
              {renderUploadRight()}
            </div>
            {/* Bottom Carousel Slider */}
            {renderCarousel()}
            {/* Footer Actions */}
            {renderFooter()}
          </>
        )}
      </div>
    </Modal>

    {/* Cancel Confirmation Modal */}
    <CancelModal
      isOpen={showCancelConfirm}
      onClickConfirmModel={handleConfirmCancel}
      onClickCancelModel={handleContinueUploading}
      title="Incomplete Upload"
      subTitle="You haven't uploaded all 11 vehicle images yet. If you cancel now, your progress will be lost. Do you still want to cancel?"
      yesText="Yes, Cancel"
      noText="No, Continue Uploading"
    />
    </>
  );
};

export default CurrentWorkStartPictureUploadPopUp;

