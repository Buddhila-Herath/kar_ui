import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { notification, Modal } from "antd";
import { format } from "date-fns";
import Icons from "../../../utils/icons";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import ServiceDataTable from "./ServiceDataTable";
import StatusDropDown from "../../../shared/select/StatusDropDown";
import AssignTechnician from "./AssignTechnician";
import CurrentWorkStartPicturePopUp from "./CurrentWorkStartPicturePopUp";
import CurrentWorkStartPictureUploadPopUp from "./CurrentWorkStartPictureUploadPopUp";
import { CacheManager } from "../../../utils/cacheManager";
import {
  fetchJobDetails,
  fetchJobServiceDetails,
  updateUniversalJobStatus,
  updateVehicleArrivalDate,
  updateLocalArrivalDate,
  uploadJobImages,
  saveCurrentWorkImages,
  saveCompletionWorkImages,
  AssignTechnicianToJob,
  saveMileage,
  getTotalIdleTime,
  clearJobDetails,
} from "../../../slices/vendor/jobSlice";
import { fetchQuoteDetails } from "../../../slices/vendor/quoteSlice";
import { createInvoice } from "../../../slices/vendor/financeSlice";
import PausedReasonDialog from "./pause-job/index";
import ImageUploadComponent from "./ImageUploader";
import ConfirmationModal from "./ConfirmationModal";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import Spinner from "../../../shared/components/loaders/Spinner";
import BaseJob64ImageSlider from "../../../shared/slider/BaseJob64ImageSlider";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import VehicleArrivalDatePicker from "./VehicleArrivalDatePicker";
import EditQuoteModal from "./EditQuoteModal";
import RadioSelect from "../../../shared/select/RadioSelect";
import VehicleArrivalTimePicker from "./VehicleArrivalTimePicker";
import CarPopupDialog from "./image-preview/Index";

const JobDetails = () => {
  const {
    jobDetails,
    jobServiceDetails,
    isLoading,
    isServiceDetailsLoading,
    isUploading,
    isUpdateLoading,
    isInvoiceLoading,
    isTotalIdleTimeLoading,
  } = useSelector((state) => state.vendorJobs);
  const navigate = useNavigate();
  const jobId = jobDetails?.jobId;
  const { state: locationState } = useLocation();
  const status = locationState?.status || "Unassigned";
  const tabIndex = locationState?.tabIndex || 0;
  const [editQuoteModalVisible, setEditQuoteModalVisible] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [postImgUploadLoading, setPostImgUploadLoading] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { id } = useParams();
  // const totalRecord = useSelector((state) => state.vendorJobs);
  const dispatch = useDispatch();
  const [isAssignTechnicianModalOpen, setAssignTechnicianModalOpen] =
    useState(false);
  const [openImagePreview, setOpenImagePreview] = useState(false);
  const [openPostCompletionPreview, setOpenPostCompletionPreview] =
    useState(false);
  const [openImageTemplate, setOpenImageTemplate] = useState(false);
  const [openUploadPopup, setOpenUploadPopup] = useState(false);
  const [openPostCompletionUploadPopup, setOpenPostCompletionUploadPopup] = useState(false);
  const [isJobPauseReasonModalOpen, setJobPauseReasonModalOpen] =
    useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [
    skipCompletionPicconfirmationModalOpen,
    setSkipCompletionPicConfirmationModalOpen,
  ] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMileage, setShowMileage] = useState(false);
  const [showIdleTimeModal, setShowIdleTimeModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [vehicleArrivalDate, setVehicleArrivalDate] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [techniciansForCategory, setTechniciansForCategory] = useState([]);
  const [quoteServiceId, setQuoteServiceId] = useState(null);
  const [getJobDetailsData, setGetJobDetailsData] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(
    jobDetails?.universalStatus
  );
  const [isDisabled, setisDisabled] = useState(true);
  const [vehicleArrivalTime, setVehicleArrivalTime] = useState(null);
  const [canEditArrivalTime, setCanEditArrivalTime] = useState(false);
  const [isInitialArrivalTimeSet, setIsInitialArrivalTimeSet] = useState(false);
  const uploadSectionRef = useRef(null);
  const [idleTimeData, setIdleTimeData] = useState(null);
  const handleTimeChange = (time) => {
    setVehicleArrivalTime(time);
  };
  
  const handleUpdateVehicleArrivalTime = async (time) => {
    try {
      if (jobDetails?.jobStartDate) {
        return;
      }

      const effectiveTime = time || vehicleArrivalTime;

      // If there is no time selected, do nothing
      if (!effectiveTime) {
        return;
      }

      // Use the already selected date or the one from jobDetails
      const rawDate =
        vehicleArrivalDate || jobDetails?.vehicleArrivalDate || null;

      // If no date is selected, do nothing silently
      if (!rawDate) {
        return;
      }

      // Normalize date string to 'yyyy-MM-dd' format for API
      let currentDate = rawDate;
      if (typeof rawDate === "string") {
        const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!isoPattern.test(rawDate)) {
          try {
            const parsed = new Date(rawDate);
            if (!isNaN(parsed.getTime())) {
              currentDate = format(parsed, "yyyy-MM-dd");
            }
          } catch (_) {
            // If parsing fails, fall back to rawDate
            currentDate = rawDate;
          }
        }
      }
      let formattedTime = effectiveTime;

      if (typeof effectiveTime === "string") {
        // Accept both '2:00 PM' and '2.00 PM' formats
        const timeMatch = effectiveTime.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const period = timeMatch[3]?.toUpperCase() || null;

          if (period === "PM" && hours < 12) {
            hours += 12;
          } else if (period === "AM" && hours === 12) {
            hours = 0;
          }

          const hh = hours.toString().padStart(2, "0");
          const mm = minutes.toString().padStart(2, "0");
          formattedTime = `${hh}:${mm}:00`;
        }
      }

      const dataToSend = {
        jobId: jobDetails.jobId,
        vehicleArrivalDate: currentDate,
        vehicleArrivalTime: formattedTime,
      };

      const response = await dispatch(
        updateVehicleArrivalDate(dataToSend)
      ).unwrap();

      if (response) {
        if (response.vehicleArrivalTime) {
          setVehicleArrivalTime(response.vehicleArrivalTime);
        }
        notification.success({
          message: <h5>Vehicle arrival time updated successfully.</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 5,
        });
      }
    } catch (error) {
      notification.error({
        message: (
          <h5>{error.errors ? error.errors[0] : "Something went wrong"}</h5>
        ),
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    }
  };

  useEffect(() => {
    if (id) {
      resetForm(); 
      dispatch(fetchJobDetails(id));
      dispatch(fetchJobServiceDetails(id));
      setVehicleArrivalTime(null);
      setIsInitialArrivalTimeSet(false);
    }
  }, [dispatch, id]);

  const fetchIdleTimeData = async () => {
    if (!jobId) return;
    
    try {
      const res = await dispatch(getTotalIdleTime(jobId)).unwrap();
      setIdleTimeData(res);
    } catch (error) {
      notification.error({
        message: <h5>{error.errors ? error.errors[0] : "Failed to load idle time data"}</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    }
  };

  const handleViewIdleTime = () => {
    fetchIdleTimeData();
    setShowIdleTimeModal(true);
  };

  useEffect(() => {
    if (jobDetails?.vehicleArrivalDate && !jobDetails?.jobStartDate) {
      setisDisabled(false);
    } else {
      setisDisabled(true);
    }
  }, [jobDetails]);
  useEffect(()=>{
   return()=> {dispatch(clearJobDetails())};  },[dispatch])

  const refetchServiceDetails = useCallback(async () => {
    if (jobId) {
      await dispatch(fetchJobServiceDetails(jobId));
    }
  }, [dispatch, jobId]);
  useEffect(() => {
    if (jobDetails) {
      const currentDate = jobDetails.vehicleArrivalDate;
      setVehicleArrivalDate(currentDate || null);

      if (currentDate) {
        localStorage.setItem(
          `technicianVehicleArrivalDate-${jobDetails.jobId}`,
          currentDate
        );
        setCanEditArrivalTime(true);
      }
      if (!isInitialArrivalTimeSet && jobDetails.vehicleArrivalTime) {
        setVehicleArrivalTime(jobDetails.vehicleArrivalTime);
        setIsInitialArrivalTimeSet(true);
      }
      if(jobDetails.mileageUnit){
        const cleanedMileage = String(jobDetails.mileage || '').replace(/,/g, '');
        setFormInputs(prev => ({
          ...prev,
          mileage: String(parseFloat(cleanedMileage) || ""),
          mileageUnit: jobDetails.mileageUnit
        }));
      }
    }
  }, [jobDetails]);

  const handleEditQuote = async (quoteId) => {
    setQuoteLoading(true);
    try {
      const result = await dispatch(
        fetchQuoteDetails({
          id: quoteId,
          type: "edit",
        })
      ).unwrap();

      if (!result) {
        throw new Error("No quote data received");
      }

      setCurrentQuote(result);
      setEditQuoteModalVisible(true);
    } catch (error) {
      notification.error({
        message: error.message || "Failed to load quote details",
      });
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleGenerateInvoice = () => {
    if (jobDetails.postCompletionPictures.length > 0) {
      handleCreateInvoice();
    } else {
      setSkipCompletionPicConfirmationModalOpen(true);
    }
  };

  const handleCancelCreateInvoiceConfirmation = () => {
    setSkipCompletionPicConfirmationModalOpen(false);
    if (uploadSectionRef.current) {
      uploadSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleCreateInvoice = async () => {
    setSkipCompletionPicConfirmationModalOpen(false);
    try {
      let dataToSend = {
        quoteId: jobDetails.quoteId,
      };
      const response = await dispatch(createInvoice(dataToSend)).unwrap();

      if (response?.id) {
        notification.success({
          message: <h5>Created successfully!</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 5,
        });
        dispatch(fetchJobDetails(id));
      }
      return response;
    } catch (error) {
      notification.error({
        message: (
          <h5>{error.errors ? error.errors[0] : "Something went wrong"}</h5>
        ),
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    }
  };

  const handleSaveCurrentWorkImages = async (images) => {
    try {
      // Create FormData and append all images
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append("files", image);
      });

      // First API call to upload images
      const uploadResponse = await dispatch(
        uploadJobImages({ type: "current", formData })
      ).unwrap();

      if (
        !uploadResponse.folderPaths ||
        !Array.isArray(uploadResponse.folderPaths)
      ) {
        throw new Error("Invalid response format from image upload service");
      }

      // Prepare data for second API call
      const imageDtoList = uploadResponse.folderPaths.map((item, index) => ({
        image: item.path,
        order: index + 1,
      }));

      const saveImagesPayload = {
        jobId: jobDetails.jobId,
        imageDtoList,
      };

      // Second API call to save image metadata
      await dispatch(saveCurrentWorkImages(saveImagesPayload)).unwrap();
      await CacheManager.clearJobImages(jobDetails);

      notification.success({
        message: <h5>Images uploaded successfully!</h5>,
        icon: <img src={Icons.check} alt="Success" />,
        duration: 5,
      });
    } catch (error) {
      notification.error({
        message: <h5>{error.message || "Failed to upload images"}</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    }
  };

  const sortedCurrentImagePaths = useMemo(() => {
    if (!jobDetails || !Array.isArray(jobDetails.jobCurrentWorkPicturesList))
      return [];
    return [...jobDetails.jobCurrentWorkPicturesList]
      .sort((a, b) => a.order - b.order)
      .map((item) => item.path);
  }, [jobDetails]);

  const sortedCompletedImagePaths = useMemo(() => {
    if (!jobDetails || !Array.isArray(jobDetails.postCompletionPictures))
      return [];
    return [...jobDetails.postCompletionPictures]
      .sort((a, b) => a.order - b.order)
      .map((item) => item.path);
  }, [jobDetails]);

  const handleSavePostCompleteWorkImages = async (images) => {
    setPostImgUploadLoading(true);
    try {
      // Create FormData and append all images
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append("files", image);
      });

      // First API call to upload images
      const uploadResponse = await dispatch(
        uploadJobImages({ type: "post", formData })
      ).unwrap();

      if (
        !uploadResponse.folderPaths ||
        !Array.isArray(uploadResponse.folderPaths)
      ) {
        throw new Error("Invalid response format from image upload service");
      }

      // Prepare data for second API call
      const imageDtoList = uploadResponse.folderPaths.map((item, index) => ({
        image: item.path,
        order: index + 1,
      }));

      const saveImagesPayload = {
        jobId: jobDetails.jobId,
        imageDtoList,
      };

      // Second API call to save image metadata
      await dispatch(saveCompletionWorkImages(saveImagesPayload)).unwrap();

      notification.success({
        message: <h5>Images uploaded successfully!</h5>,
        icon: <img src={Icons.check} alt="Success" />,
        duration: 5,
      });
    } catch (error) {
      notification.error({
        message: <h5>{error.message || "Failed to upload images"}</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    } finally {
      setPostImgUploadLoading(false);
    }
  };

  const handleAssignTechnicianClick = (serviceCategoryId) => {
    setTechniciansForCategory(serviceCategoryId);
    setSelectedCategoryId(serviceCategoryId);
    setAssignTechnicianModalOpen(true);
  };

  const handleGetJobDetailsData = (data) => {
    setGetJobDetailsData(data);
  };
  const initialFormState = {
    mileage: "",
    mileageUnit: "",
  };

  const [formInputs, setFormInputs] = useState(initialFormState);

  const [errors, setErrors] = useState({
    mileage: "",
    mileageUnit: "",
  });
  const validateField = (name, value, relatedValues = {}) => {
    switch (name) {
      case "mileage":
        if (!value) {
          return "Mileage field is required";
        }
        break;
      case "mileageUnit":
        if (!value) {
          return "Unit is required";
        }
        break;
      default:
        return "";
    }
    return "";
  };
  const handleValidation = () => {
    let formErrors = {};
    let isValid = true;
    if (!formInputs.mileage || formInputs.mileage.trim() === "") {
        formErrors.mileage = "Mileage field is required";
        isValid = false;
    } else if (parseFloat(formInputs.mileage) <= 0) {
        formErrors.mileage = "Mileage must be greater than 0";
        isValid = false;
      }
    
    if (isValid && (!formInputs.mileageUnit || formInputs.mileageUnit.trim() === "")) {
        formErrors.mileageUnit = "Unit field is required";
        isValid = false;
    }
    setErrors(formErrors);
    return isValid;
};
  const resetForm = () => {
    setFormInputs(initialFormState);
    setErrors({
      mileage: "",
      mileageUnit: "",
    });
  };

  const onClickCancel = () => {
    resetForm();
    setShowMileage(false);
  };

 const handleSaveMileage = async () => {
    if (handleValidation()) {
        const payload = {
            jobId: jobDetails.jobId,
            mileage: formInputs.mileage.toString(),
            mileageUnit: typeof formInputs.mileageUnit === 'object' 
                ? formInputs.mileageUnit.value 
                : formInputs.mileageUnit
        };
        try {
            const response = await dispatch(saveMileage(payload)).unwrap();
            notification.success({
                message: <h5>Mileage saved successfully!</h5>,
                icon: <img src={Icons.check} alt="Success" />,
                duration: 5,
            });
            setShowMileage(false);
            resetForm();
        } catch (error) {
            let errorMessage = "Failed to save mileage.";
            if (error.payload?.errors?.[0]) {
              errorMessage = error.payload.errors[0];
            } else if (error.errors?.[0]) {
              errorMessage = error.errors[0];
            } else if (error.payload?.message && error.payload.message !== "Bad Request") {
              errorMessage = error.payload.message;
            } else if (error.message && error.message !== "Bad Request") {
              errorMessage = error.message;
            }
      
            notification.error({
                message: <h5>{errorMessage}</h5>,
                icon: <img src={Icons.error} alt="Error" />,
                duration: 5,
            });
        }
    }
  };

  useEffect(() => {
    if (refreshTrigger) {
      refetchServiceDetails();
      setRefreshTrigger(false);
    }
  }, [refreshTrigger, refetchServiceDetails]);
 
  const handleAssignTechnician = async (payload) => {
    try {
      const response = await dispatch(AssignTechnicianToJob(payload)).unwrap();
      // Refetch service details after technician assignment
      if (response) {
        await refetchServiceDetails();
      }
      return response;
    } catch (error) {
      return {
        error: true,
        message: error.message,
        errors: error.errors || [error.message],
      };
    }
  };

  const quoteServiceIds =
  jobServiceDetails?.jobServiceViewDetailsList?.reduce((acc, service) => {
    if (service.jobStatus !== "Paused") {
      acc.push(service.quoteServiceId);
    }
    return acc;
  }, []) || [];

  const getQuoteServiceId = (quoteServicesId) => {
    setQuoteServiceId(quoteServicesId);
  };

  const onClickAssignTechnicianCloseModel = () => {
    setAssignTechnicianModalOpen(false);
  };

  const onOpenImagePreview = () => {
    setOpenImagePreview(true);
  };

  const onOpenImageTemplate = () => {
    setOpenImageTemplate(true);
  };

  const onOpenPostCompletionPreview = () => {
    setOpenPostCompletionPreview(true);
  };

  const onClickPauseReasonModelOpen = (serviceId) => {
    setJobPauseReasonModalOpen(true);
    setCurrentServiceId(serviceId);
  };

  const onClickPauseReasonModelClose = () => {
    setJobPauseReasonModalOpen(false);
  };

  const handleStatusChange = (value) => {
    const upperValue = value.toUpperCase();
    setPendingStatusUpdate(upperValue);
    if (value === currentStatus) {
      return;
    }
    setConfirmationModalOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (pendingStatusUpdate) {
      if (pendingStatusUpdate === "PAUSED") {
        onClickPauseReasonModelOpen();
      } else {
        await handleUpdateUniversalJobStatus(pendingStatusUpdate);
      }
      setConfirmationModalOpen(false);
    }
  };

  const handleCancelConfirmation = () => {
    setPendingStatusUpdate(null);
    setConfirmationModalOpen(false);
  };

  const handleUpdateUniversalJobStatus = async (JobStatus) => {
    try {
      let dataToSend = {
        jobId: jobDetails.jobId,
        universalJobStatus: JobStatus,
      };
      const response = await dispatch(
        updateUniversalJobStatus(dataToSend)
      ).unwrap();

      if (response) {
        //setCurrentStatus(JobStatus);
        notification.success({
          message: <h5>Updated successfully!</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 5,
        });
        // Only refetch service details, not full job details
        await refetchServiceDetails();
      }
      return response;
    } catch (error) {
      setCurrentStatus(currentStatus);
      notification.error({
        message: (
          <h5>{error.errors ? error.errors[0] : "Something went wrong"}</h5>
        ),
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
const handleChange = (e) => {
  const { name, value } = e.target;
  const numericValue = value.replace(/,/g, "");
  if (!/^\d*\.?\d{0,2}$/.test(numericValue)) return;
  setFormInputs((prev) => ({ ...prev, [name]: numericValue }));
  if (value && errors[name]) {
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }
};

const handleUnitChange = (value) => {
    const unitValue = value.value || value;
    setFormInputs((prev) => ({ 
        ...prev, 
        mileageUnit: unitValue 
    }));
    
    if (unitValue && errors.mileageUnit) {
        setErrors((prev) => ({ 
            ...prev, 
            mileageUnit: "" 
        }));
    }
};
useEffect(() => {
  if (jobDetails?.mileageUnit && !formInputs.mileageUnit) {
    setFormInputs(prev => ({
      ...prev,
      mileageUnit: jobDetails.mileageUnit
    }));
  }
}, [jobDetails?.mileageUnit, formInputs.mileageUnit]);

const formatNumber = (val) => {
  if (!val) return "";
  const valAsString = String(val);
  const [intPart, decimalPart] = valAsString.split(".");
  const formattedInt = intPart ? Number(intPart).toLocaleString('en-US') : '0';
  return decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt;
};


const formatDisplayDate = (dateValue) => {
  if (!dateValue) return null;
  try {
    const d = new Date(dateValue);
    if (!isNaN(d.getTime())) {
      return format(d, "dd MMM yyyy");
    }
  } catch (_) {
    // fall through to raw value
  }
  return dateValue;
};
  const handleUpdateVehicleArrivalDate = async (date) => {
    try {
      if (jobDetails?.jobStartDate) {
        return;
      }

      const formattedDate = format(date, "yyyy-MM-dd");

      // Determine the effective time: use current state or value from jobDetails
      let effectiveTime =
        vehicleArrivalTime || jobDetails?.vehicleArrivalTime || null;

      // If user is changing to today and there is an existing time in the future,
      // block the change and ask them to adjust the time first.
      const todayStr = format(new Date(), "yyyy-MM-dd");
      if (formattedDate === todayStr && effectiveTime) {
        const parseToMinutes = (timeStr) => {
          if (!timeStr || typeof timeStr !== "string") return null;

          // Try 12-hour with AM/PM, e.g. "2:00 PM" or "2.00 PM"
          const match12 = timeStr.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)/i);
          if (match12) {
            let h = parseInt(match12[1], 10);
            const m = parseInt(match12[2], 10);
            const p = match12[3].toUpperCase();
            if (p === "PM" && h < 12) h += 12;
            if (p === "AM" && h === 12) h = 0;
            return h * 60 + m;
          }

          // Try 24-hour, e.g. "14:00" or "14:00:00"
          const match24 = timeStr.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
          if (match24) {
            const h = parseInt(match24[1], 10);
            const m = parseInt(match24[2], 10);
            return h * 60 + m;
          }

          return null;
        };

        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const selectedMinutes = parseToMinutes(effectiveTime);

        if (selectedMinutes !== null && selectedMinutes > nowMinutes) {
          notification.error({
            message: (
              <h5>Vehicle arrival time can't be later than the current time</h5>
            ),
            icon: <img src={Icons.error} alt="Error" />,
            duration: 5,
          });
          return;
        }
      }

      // At this point the date change is allowed; update local state
      setVehicleArrivalDate(formattedDate);
      localStorage.setItem(
        `technicianVehicleArrivalDate-${jobDetails.jobId}`,
        formattedDate
      );

      // If no time is set yet (first time updating date), send '00:00:00'
      let autoNowForApi = null;
      if (!effectiveTime) {
        autoNowForApi = "00:00:00";
      }

      let dataToSend = {
        jobId: jobDetails.jobId,
        vehicleArrivalDate: formattedDate,
        vehicleArrivalTime: (() => {
          // If we computed a current-time default for today with no time selected
          if (autoNowForApi) {
            return autoNowForApi;
          }

          if (!effectiveTime || typeof effectiveTime !== "string") {
            return effectiveTime;
          }

          // Accept both '2:00 PM' and '2.00 PM' formats
          const timeMatch = effectiveTime.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
          if (!timeMatch) {
            return effectiveTime;
          }

          let hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const period = timeMatch[3]?.toUpperCase() || null;

          if (period === "PM" && hours < 12) {
            hours += 12;
          } else if (period === "AM" && hours === 12) {
            hours = 0;
          }

          const hh = hours.toString().padStart(2, "0");
          const mm = minutes.toString().padStart(2, "0");
          return `${hh}:${mm}:00`;
        })(),
      };

      dispatch(updateLocalArrivalDate(formattedDate));

      const response = await dispatch(
        updateVehicleArrivalDate(dataToSend)
      ).unwrap();

      if (response) {
        notification.success({
          message: <h5>Vehicle arrival date updated successfully.</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 5,
        });

        // Enable editing of Vehicle Arrival Time only after date is saved
        setCanEditArrivalTime(true);
      }
    } catch (error) {
      if (jobDetails?.vehicleArrivalDate) {
        dispatch(updateLocalArrivalDate(jobDetails.vehicleArrivalDate));
      }
      notification.error({
        message: (
          <h5>{error.errors ? error.errors[0] : "Something went wrong"}</h5>
        ),
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    }
  };

  return (
    <MasterLayout>
      <TabTitle title={"View Job Details"} />
      <Breadcrumb
        parent_menu="Job Management"
        parent_menu_url="/app/job-management"
        second_level_page={
          status === "inque" ? "In Queue Jobs" : `${status} Jobs`
        }
        second_level_page_url="/app/job-management"
        second_level_page_state={{ tabIndex }}
        current_page="View Job"
      />
      <TopProgressBar isLoading={isLoading || isUpdateLoading} />
      {isLoading || isInvoiceLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="view-spare-container job-detail-container">
            <div className="view-spare-header">
              <div className="back-page">
                <Link to="/app/job-management" id="job-details-back-link">
                  <img src={Icons.arrow_left} alt="Back Icon" />
                </Link>
                <h3 id="job-details-title">
                  View{" "}
                  {jobDetails && jobDetails.jobCardNumber
                    ? jobDetails.jobCardNumber
                    : "-"}
                </h3>
              </div>

              {jobDetails && jobDetails.isProformaCreated === false && (
                <button
                  disabled={!jobDetails.jobCompletionDate || isInvoiceLoading}
                  className={`button create-btn form-button ${
                    !jobDetails.jobCompletionDate ? "disabled-button" : ""
                  }`}
                  type="button"
                  onClick={() => handleGenerateInvoice()}
                  id="job-create-invoice-button"
                >
                  <span>Create Invoice</span>
                </button>
              )}
            </div>

            {jobDetails && jobDetails.isView === false && (
              <div className="pending-noti-box">
                <div className="status-dot"></div>
                <span>
                  Changes are currently restricted, pending quote approval.
                </span>
              </div>
            )}

            <div className="view-spare-part-content">
              <div className="spare-info jobs-info">
                <div className="job-name">
                  <h4 className="info-header">Job Progress</h4>
                </div>
                <div className="progress-container">
                  <div className="progress-step completed">
                    <div className="icon-containers firstcontain">
                      {jobDetails?.jobCreatedDateFormat ? (
                        <>
                          <img
                            src={Icons.visual_indicator}
                            alt="Checked Icon"
                          />
                          <div
                            className={`progress-line ${
                              jobDetails.vehicleArrivalDate
                                ? "completed"
                                : "dubblecolor"
                            }`}
                          ></div>
                        </>
                      ) : (
                        <>
                          <img
                            src={Icons.indicator_completed}
                            alt="Checked Icon"
                          />
                          <div className="progress-line pending"></div>
                        </>
                      )}
                    </div>
                    <div className="contant">
                      <p className="step-label">
                        Quote <br></br> Approved
                      </p>
                      <p className="step-date">
                        {jobDetails && jobDetails.jobCreatedDateFormat
                          ? jobDetails.jobCreatedDateFormat
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="progress-step completed">
                    <div className="icon-containers">
                      {jobDetails?.vehicleArrivalDate ? (
                        <>
                          <img
                            src={Icons.visual_indicator}
                            alt="Checked Icon"
                          />
                          <div
                            className={`progress-line ${
                              jobDetails.jobStartDateFormat
                                ? "completed"
                                : "dubblecolor"
                            }`}
                          ></div>
                        </>
                      ) : (
                        <>
                          <img
                            src={Icons.indicator_completed}
                            alt="Checked Icon"
                          />
                          <div className="progress-line pending"></div>
                        </>
                      )}
                    </div>
                    <div className="contant">
                      <p className="step-label">
                        Vehicle <br></br> Arrived
                      </p>
                      <p className="step-date">
                        {jobDetails && jobDetails.vehicleArrivalDate
                          ? jobDetails.vehicleArrivalDate
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="progress-step completed">
                    <div className="icon-containers">
                      {jobDetails?.preWorkCapturedDateFormat ? (
                        <>
                          <img
                            src={Icons.visual_indicator}
                            alt="Checked Icon"
                          />
                          <div
                            className={`progress-line ${
                              jobDetails.jobStartDateFormat
                                ? "completed"
                                : "dubblecolor"
                            }`}
                          ></div>
                        </>
                      ) : (
                        <>
                          <img
                            src={Icons.indicator_completed}
                            alt="Checked Icon"
                          />
                          <div className="progress-line pending"></div>
                        </>
                      )}
                    </div>
                    <div className="contant">
                      <p className="step-label">
                        Pre-Work<br></br> Images Captured
                      </p>
                      <p className="step-date">
                        {jobDetails && jobDetails.preWorkCapturedDateFormat
                          ? jobDetails.preWorkCapturedDateFormat
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="progress-step completed">
                    <div className="icon-containers">
                      {jobDetails?.jobStartDateFormat ? (
                        <>
                          <img
                            src={Icons.visual_indicator}
                            alt="Checked Icon"
                          />
                          <div
                            className={`progress-line ${
                              jobDetails.jobCompletionDateFormat
                                ? "completed"
                                : "dubblecolor"
                            }`}
                          ></div>
                        </>
                      ) : (
                        <>
                          <img
                            src={Icons.indicator_completed}
                            alt="Checked Icon"
                          />
                          <div className="progress-line pending"></div>
                        </>
                      )}
                    </div>
                    <div className="contant">
                      <p className="step-label">
                        Job <br></br>Started
                      </p>
                      <p className="step-date">
                        {jobDetails && jobDetails.jobStartDateFormat
                          ? jobDetails.jobStartDateFormat
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="progress-step completed">
                    <div className="icon-containers">
                      {jobDetails?.jobCompletionDateFormat ? (
                        <>
                          <img
                            src={Icons.visual_indicator}
                            alt="Checked Icon"
                          />
                          <div
                            className={`progress-line ${
                              jobDetails.postWorkImagesCapturedDateFormat
                                ? "completed"
                                : "dubblecolor"
                            }`}
                          ></div>
                        </>
                      ) : (
                        <>
                          <img
                            src={Icons.indicator_completed}
                            alt="Checked Icon"
                          />
                          <div className="progress-line pending"></div>
                        </>
                      )}
                    </div>
                    <div className="contant">
                      <p className="step-label">
                        Job <br></br>Completed
                      </p>
                      <p className="step-date">
                        {jobDetails && jobDetails.jobCompletionDateFormat
                          ? jobDetails.jobCompletionDateFormat
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="progress-step pending">
                    <div className="icon-containers ">
                      {jobDetails?.postWorkImagesCapturedDateFormat ? (
                        <>
                          <img
                            src={Icons.visual_indicator}
                            alt="Checked Icon"
                          />
                          <div
                            className={`progress-line ${
                              jobDetails.postWorkImagesCapturedDateFormat
                                ? "completed"
                                : "dubblecolor"
                            }`}
                          ></div>
                        </>
                      ) : (
                        <>
                          <img
                            src={Icons.indicator_completed}
                            alt="Checked Icon"
                          />
                          <div className="progress-line pending"></div>
                        </>
                      )}
                    </div>
                    <div className="contant">
                      <p className="step-label">
                        Post-Work <br></br> Images Captured
                      </p>
                      <p className="step-date">
                        {jobDetails &&
                        jobDetails.postWorkImagesCapturedDateFormat
                          ? jobDetails.postWorkImagesCapturedDateFormat
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="progress-step pending">
                    <div className="icon-containers">
                      {jobDetails?.proformaCreatedDateFormat ? (
                        <>
                          <img
                            src={Icons.visual_indicator}
                            alt="Checked Icon"
                          />
                        </>
                      ) : (
                        <>
                          <img
                            src={Icons.indicator_completed}
                            alt="Checked Icon"
                          />
                        </>
                      )}
                    </div>
                    <div className="contant">
                      <p className="step-label">
                        Proforma <br></br> Invoice Created
                      </p>
                      <p className="step-date">
                        {jobDetails && jobDetails.proformaCreatedDateFormat
                          ? jobDetails.proformaCreatedDateFormat
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mobile-progress">
                  <div className="mobile-progress-steps">
                    <div
                      className={`mobile-progress-step ${
                        jobDetails?.jobCreatedDateFormat
                          ? "completed"
                          : "pending"
                      } ${
                        jobDetails?.jobCreatedDateFormat &&
                        !jobDetails?.vehicleArrivalDate
                          ? "dubblecolor-next"
                          : ""
                      }`}
                    >
                      <div className="mobile-progress-step-icon">
                        <img
                          src={
                            jobDetails?.jobCreatedDateFormat
                              ? Icons.visual_indicator
                              : Icons.indicator_completed
                          }
                          alt="Status Icon"
                        />
                      </div>
                      <div className="mobile-progress-step-content">
                        <span className="mobile-progress-step-label">
                          Quote Approved
                        </span>
                        <span className="mobile-progress-step-date">
                          {jobDetails?.jobCreatedDateFormat || "-"}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`mobile-progress-step ${
                        jobDetails?.vehicleArrivalDate
                          ? "completed"
                          : "pending"
                      } ${
                        jobDetails?.vehicleArrivalDate &&
                        !jobDetails?.preWorkCapturedDateFormat
                          ? "dubblecolor-next"
                          : ""
                      }`}
                    >
                      <div className="mobile-progress-step-icon">
                        <img
                          src={
                            jobDetails?.vehicleArrivalDate
                              ? Icons.visual_indicator
                              : Icons.indicator_completed
                          }
                          alt="Status Icon"
                        />
                      </div>
                      <div className="mobile-progress-step-content">
                        <span className="mobile-progress-step-label">
                          Vehicle Arrived
                        </span>
                        <span className="mobile-progress-step-date">
                          {jobDetails?.vehicleArrivalDate || "-"}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`mobile-progress-step ${
                        jobDetails?.preWorkCapturedDateFormat
                          ? "completed"
                          : "pending"
                      } ${
                        jobDetails?.preWorkCapturedDateFormat &&
                        !jobDetails?.jobStartDateFormat
                          ? "dubblecolor-next"
                          : ""
                      }`}
                    >
                      <div className="mobile-progress-step-icon">
                        <img
                          src={
                            jobDetails?.preWorkCapturedDateFormat
                              ? Icons.visual_indicator
                              : Icons.indicator_completed
                          }
                          alt="Status Icon"
                        />
                      </div>
                      <div className="mobile-progress-step-content">
                        <span className="mobile-progress-step-label">
                          Pre-Work Images Captured
                        </span>
                        <span className="mobile-progress-step-date">
                          {jobDetails?.preWorkCapturedDateFormat || "-"}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`mobile-progress-step ${
                        jobDetails?.jobStartDateFormat ? "completed" : "pending"
                      } ${
                        jobDetails?.jobStartDateFormat &&
                        !jobDetails?.jobCompletionDateFormat
                          ? "dubblecolor-next"
                          : ""
                      }`}
                    >
                      <div className="mobile-progress-step-icon">
                        <img
                          src={
                            jobDetails?.jobStartDateFormat
                              ? Icons.visual_indicator
                              : Icons.indicator_completed
                          }
                          alt="Status Icon"
                        />
                      </div>
                      <div className="mobile-progress-step-content">
                        <span className="mobile-progress-step-label">
                          Job Started
                        </span>
                        <span className="mobile-progress-step-date">
                          {jobDetails?.jobStartDateFormat || "-"}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`mobile-progress-step ${
                        jobDetails?.jobCompletionDateFormat
                          ? "completed"
                          : "pending"
                      } ${
                        jobDetails?.jobCompletionDateFormat &&
                        !jobDetails?.postWorkImagesCapturedDateFormat
                          ? "dubblecolor-next"
                          : ""
                      }`}
                    >
                      <div className="mobile-progress-step-icon">
                        <img
                          src={
                            jobDetails?.jobCompletionDateFormat
                              ? Icons.visual_indicator
                              : Icons.indicator_completed
                          }
                          alt="Status Icon"
                        />
                      </div>
                      <div className="mobile-progress-step-content">
                        <span className="mobile-progress-step-label">
                          Job Completed
                        </span>
                        <span className="mobile-progress-step-date">
                          {jobDetails?.jobCompletionDateFormat || "-"}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`mobile-progress-step ${
                        jobDetails?.postWorkImagesCapturedDateFormat
                          ? "completed"
                          : "pending"
                      }`}
                    >
                      <div className="mobile-progress-step-icon">
                        <img
                          src={
                            jobDetails?.postWorkImagesCapturedDateFormat
                              ? Icons.visual_indicator
                              : Icons.indicator_completed
                          }
                          alt="Status Icon"
                        />
                      </div>
                      <div className="mobile-progress-step-content">
                        <span className="mobile-progress-step-label">
                          Post-Work Images Captured
                        </span>
                        <span className="mobile-progress-step-date">
                          {jobDetails?.postWorkImagesCapturedDateFormat || "-"}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`mobile-progress-step ${
                        jobDetails?.proformaCreatedDateFormat
                          ? "completed"
                          : "pending"
                      }`}
                    >
                      <div className="mobile-progress-step-icon">
                        <img
                          src={
                            jobDetails?.proformaCreatedDateFormat
                              ? Icons.visual_indicator
                              : Icons.indicator_completed
                          }
                          alt="Status Icon"
                        />
                      </div>
                      <div className="mobile-progress-step-content">
                        <span className="mobile-progress-step-label">
                          Proforma Invoice Created
                        </span>
                        <span className="mobile-progress-step-date">
                          {jobDetails && jobDetails.proformaCreatedDateFormat
                            ? jobDetails.proformaCreatedDateFormat
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="spare-info jobs-info">
                <div className="job-name">
                  <h4 className="info-header">Job Details</h4>
                  <img src={Icons.briefcase} alt="Back Icon" />
                </div>

                <div className="detail">
                  <h5 className="detail-label">Job Card Number</h5>
                  <h4 className="detail-value">
                    {jobDetails && jobDetails.jobCardNumber
                      ? jobDetails.jobCardNumber
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Vehicle Reg Number</h5>
                  <h4 className="detail-value">
                    {jobDetails && jobDetails.vehicleRegNumber
                      ? jobDetails.vehicleRegNumber
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Vehicle Make and Model</h5>
                  <h4 className="detail-value">
                    {jobDetails && jobDetails.vehicleMake
                      ? jobDetails.vehicleMake
                      : "-"}{" "}
                    -{" "}
                    {jobDetails && jobDetails.vehicleModel
                      ? jobDetails.vehicleModel
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Job Created Date</h5>
                  <h4 className="detail-value">
                    {jobDetails && jobDetails.jobCreatedDate
                      ? jobDetails.jobCreatedDate
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Estimated Job Duration</h5>
                  <h4 className="detail-value">
                    {jobDetails && jobDetails.estimatedJobDuration
                      ? jobDetails.estimatedJobDuration
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Due Date</h5>
                  <h4 className="detail-value">
                    {jobDetails && jobDetails.dueDate
                      ? jobDetails.dueDate
                      : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Notes</h5>
                  <h4 className="detail-value">
                    {jobDetails && jobDetails.notes ? jobDetails.notes : "-"}
                  </h4>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Vehicle Arrival Date</h5>
                  <div className="vehicle-arival-dte">
                    <div className="date-container">
                      <span className={`${vehicleArrivalDate !== null &&
                        vehicleArrivalDate !== undefined
                          ?"selected-date" : "date-text"}`}>
                        {(() => {
                          const raw =
                            (vehicleArrivalDate !== null &&
                              vehicleArrivalDate !== undefined
                              ? vehicleArrivalDate
                              : jobDetails?.vehicleArrivalDate) || null;

                          const display = formatDisplayDate(raw);
                          return display || "Select Vehicle Arrival Date";
                        })()}
                      </span>
                      {(() => {
                        const enabled = !jobDetails?.jobStartDate;
                        return (
                          <img
                            className="calendar-img"
                            src={Icons.CalendarX}
                            alt="Calendar"
                            style={{
                              cursor: enabled ? "pointer" : "not-allowed",
                              opacity: enabled ? 1 : 0.5,
                            }}
                            onClick={() => {
                              if (!enabled) {
                                return;
                              }
                              setShowDatePicker(!showDatePicker);
                            }}
                            id="vehicle-arrival-date"
                          />
                        );
                      })()}
                    </div>
                    {showDatePicker && (
                      <div className="date-picker-popup">
                        <VehicleArrivalDatePicker
                          inline={true}
                          onClose={() => setShowDatePicker(false)}
                          onSubmit={handleUpdateVehicleArrivalDate}
                          onChangeDate={handleDateChange}
                          defaultDate={
                            jobDetails?.vehicleArrivalDate
                              ? new Date(jobDetails.vehicleArrivalDate)
                              : new Date()
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Vehicle Arrival Time</h5>
                  <div className="vehicle-arival-dte">
                    <div className="date-container">
                      <span className={`${vehicleArrivalTime !== null &&
                        vehicleArrivalTime !== undefined
                        ? "selected-date" : "date-text"}`}>
                        {vehicleArrivalTime&&vehicleArrivalTime !== null &&
                          vehicleArrivalTime !== undefined
                          ? vehicleArrivalTime
                          : jobDetails?.vehicleArrivalTime || "Select Vehicle Arrival Time"}
                      </span>
                      {(() => {
                        const enabled = canEditArrivalTime && !jobDetails?.jobStartDate;
                        return (
                          <img
                            className="calendar-img clock-image"
                            src={Icons.clock}
                            alt="Clock"
                            style={{
                              cursor: enabled ? "pointer" : "not-allowed",
                              opacity: enabled ? 1 : 0.5,
                            }}
                            id="vehicle-arrival-time"
                            onClick={() => {
                              if (!enabled) {
                                return;
                              }
                              setShowTimePicker(!showTimePicker);
                            }}
                          />
                        );
                      })()}
                    </div>
                    {showTimePicker && (
                      <div
                        className="time-picker-overlay"
                        onClick={() => setShowTimePicker(false)}
                      >
                        <div
                          className="date-picker-popup time-picker-popup"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <VehicleArrivalTimePicker
                            inline={true}
                            onClose={() => setShowTimePicker(false)}
                            onSubmit={handleUpdateVehicleArrivalTime}
                            onChangeTime={handleTimeChange}
                            defaultTime={(() => {
                            const rawDate =
                              vehicleArrivalDate || jobDetails?.vehicleArrivalDate || null;
                            const existingTime =
                              vehicleArrivalTime || jobDetails?.vehicleArrivalTime || null;

                            // If we already have a time (from state or backend), use it
                            if (existingTime) {
                              return existingTime;
                            }

                            // If no date is selected, nothing to show
                            if (!rawDate) {
                              return existingTime;
                            }

                            // Normalize selected date to 'yyyy-MM-dd'
                            let normalized = rawDate;
                            if (typeof rawDate === "string") {
                              try {
                                const parsed = new Date(rawDate);
                                if (!isNaN(parsed.getTime())) {
                                  normalized = format(parsed, "yyyy-MM-dd");
                                }
                              } catch (_) {}
                            }

                            const todayStr = format(new Date(), "yyyy-MM-dd");

                            // If the selected date is today and no time is set, show current time in picker
                            if (normalized === todayStr) {
                              const now = new Date();
                              let hours = now.getHours();
                              const minutes = now.getMinutes();
                              const period = hours >= 12 ? "PM" : "AM";
                              let displayHours = hours % 12;
                              if (displayHours === 0) {
                                displayHours = 12;
                              }
                              return `${displayHours}:${minutes
                                .toString()
                                .padStart(2, "0")} ${period}`;
                            }

                            // For non-today dates with no time, keep it empty
                            return existingTime;
                          })()}
                            isToday={(() => {
                              const rawDate =
                                vehicleArrivalDate || jobDetails?.vehicleArrivalDate || null;
                              if (!rawDate) return false;

                              let normalized = rawDate;
                              if (typeof rawDate === "string") {
                                try {
                                  const parsed = new Date(rawDate);
                                  if (!isNaN(parsed.getTime())) {
                                    normalized = format(parsed, "yyyy-MM-dd");
                                  }
                                } catch (_) {}
                              }

                              const todayStr = format(new Date(), "yyyy-MM-dd");
                              return normalized === todayStr;
                            })()}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="detail">
                  <h5 className="detail-label">Mileage</h5>
                  <div className="vehicle-arival-dte">
                    <div className="date-container">
                      <span className="date-text">
                        {jobDetails?.mileage || "-"}
                      </span>
                      {!jobDetails?.jobStartDate &&(
                      <img
                        src={Icons.pencil_simple_line}
                        alt="Edit Mileage"
                        id='mileage-button'
                        onClick={(e) => {
                          if (isDisabled) return;
                          e.stopPropagation();
                          if (jobDetails?.mileage || jobDetails?.mileageUnit) {
                          const cleanedMileage = String(jobDetails.mileage || '').replace(/,/g, '');
                          setFormInputs({
                            mileage: String(parseFloat(cleanedMileage) || ""),
                            mileageUnit: jobDetails.mileageUnit || ""
                          });
                           
                        } else {
                          resetForm();
                        }
                          setShowMileage(!showMileage);
                        }}
                        className="calendar-img"
                        style={{
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled ? 0.5 : 1,
                        }}
                      />
                      )}
                    </div>
                    {showMileage && !jobDetails?.jobStartDate && (
                      <div className="date-picker-popup mileage-model">
                        <div className="position-relative vehicle-date datepicker mileage-popup p-0">
                          <div className="group-input-wrapper gap-2 d-flex">
                            <div className="form-row">
                              <div className="form-item">
                                <input
                                  type="text"
                                  name="mileage"
                                  required
                                  autoComplete="off"
                                  id="mileage-quanity"
                                  className={
                                    errors["mileage"]
                                      ? "invalid mileage-input"
                                      : "mileage-input"
                                  }
                                   value={
                                    formInputs.mileage
                                      ? formatNumber(formInputs.mileage)
                                      : ""
                                  }
                                  onChange={(e)=>handleChange(e)}
                                />
                                <label
                                  className="form-label"
                                  htmlFor="mileage-quanity"
                                >
                                  <h4>Mileage</h4>
                                </label>
                                {errors.mileage && (
                                  <></>
                                )}
                              </div>
                              <div className="form-item mileage-radio">
                                <RadioSelect
                                  required
                                  name="mileageUnit"
                                  placeholderText="Unit"
                                  value={formInputs.mileageUnit}
                                  onChange={handleUnitChange}
                                  isValid={!!errors.mileageUnit}
                                  disabled={!!jobDetails.mileageUnit}
                                  options={
                                    jobDetails.mileageUnit
                                      ? 
                                        [{ label: jobDetails.mileageUnit, value: jobDetails.mileageUnit }]
                                      : 
                                        [
                                    { label: "Km", value: "Km" },
                                    { label: "Miles", value: "Miles" },
                                  ]}          
                                />
                              </div>
                            </div>
                            {(errors.mileage || errors.mileageUnit) && (
                              <div className="field-error full-width-error">
                                <img
                                  src={Icons.warning_circle}
                                  alt="Warning Icon"
                                />
                                {errors.mileage && <h6>{errors.mileage}</h6>}
                                {errors.mileageUnit && <h6>{errors.mileageUnit}</h6>}
                              </div>
                            )}
                          </div>
                          <div className="mt-5">
                            <div className="d-flex justify-content-end date-buttons">
                              <button
                                className="btn btn-sm btn-outline-secondary me-3 date-cancel"
                                onClick={onClickCancel}
                                id='mileage-button-cancel'
                              >
                                Cancel
                              </button>
                              <button className="btn btn-sm btn-primary date-save"
                                onClick={handleSaveMileage}
                                 id='mileage-button-save'
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {jobDetails && jobDetails.jobStartDate && (
                  <div className="detail">
                    <h5 className="detail-label">Job Start Date</h5>
                    <h4 className="detail-value">
                      {jobDetails && jobDetails.jobStartDate
                        ? jobDetails.jobStartDate
                        : "-"}
                    </h4>
                  </div>
                )}
                {jobDetails && jobDetails.vehicleArrivalDate && (
                  <>
                    <div className="detail image-upload-job view-image-job">
                      <div className="images-preview upload-images">
                        <h5 className="detail-label image-detail-label">
                          Current Work Start Picture
                        </h5>

                      {(!sortedCurrentImagePaths || sortedCurrentImagePaths.length === 0) && (
                        <h4
                          className="detail-value download" 
                          onClick={() => setOpenUploadPopup(true)}
                          style={{ cursor: 'pointer' }}
                        >
                          Upload Images
                          <img
                                  className="arrow-right"
                                  src={Icons.arrow_right}
                                  alt="download"
                                />
                        </h4>
                      )}
                        {sortedCurrentImagePaths &&
                          sortedCurrentImagePaths.length > 0 && (
                            <h4
                              className="detail-value download"
                              onClick={() => {
                                onOpenImagePreview();
                              }}
                               id='current-image-download-button'
                            >
                              Download
                              <img
                                className="arrow-right"
                                src={Icons.arrow_right}
                                alt="download"
                              />
                            </h4>
                          )}
                      </div>
                      {jobDetails &&
                        jobDetails.jobCurrentWorkPicturesList &&
                        jobDetails.jobCurrentWorkPicturesList.length > 0 && (
                          <div className="form-row form-footer job-imagess">
                            <div className="upload-containers">
                              <div className="SwiperSlideComponent">
                                <BaseJob64ImageSlider
                                  paths={sortedCurrentImagePaths}
                                  desktopImagesPerPage={4}
                                  onImageClick={(url, meta) => {
                                    try {
                                      window.dispatchEvent(new CustomEvent('openCurrentWorkStartPicture', { 
                                        detail: { 
                                          index: meta?.index ?? 0,
                                          images: sortedCurrentImagePaths
                                        } 
                                      }));
                                    } catch (_) {}
                                    onOpenImagePreview();
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      <div className="job-images"></div>
                    </div>
                  </>
                )}
                {jobDetails && jobDetails.jobCompletionDate && (
                  <div className="detail">
                    <h5 className="detail-label">Job Completion Date</h5>
                    <h4 className="detail-value">
                      {jobDetails && jobDetails.jobCompletionDate
                        ? jobDetails.jobCompletionDate
                        : "-"}
                    </h4>
                  </div>
                )}
                {jobDetails && jobDetails.universalStatus && jobDetails.universalStatus === "Completed" && (
                  <div className="detail image-upload-job">
                    <div className="images-preview mobile-idle-time" id='total-idle-time-view' onClick={handleViewIdleTime}>
                      <h5 className="detail-label">Total Idle Time</h5>
                      <h4 className="detail-value download">
                        View<img className="arrow-right" src={Icons.arrow_right} alt="view" />
                      </h4>
                    </div>
                  </div>
                )}
                {jobDetails && jobDetails.jobCompletionDateFormat && (
                  <>
                    <div
                      className="detail image-upload-job view-image-job"
                      ref={uploadSectionRef}
                    >
                      <div className="images-preview upload-images">
                        <h5 className="detail-label">Post Completion Picture</h5>

                        {(!sortedCompletedImagePaths || sortedCompletedImagePaths.length === 0) && (
                          <h4
                            className="detail-value download" 
                            onClick={() => setOpenPostCompletionUploadPopup(true)}
                            style={{ cursor: 'pointer' }}
                          >
                            Upload Images
                            <img
                              className="arrow-right"
                              src={Icons.arrow_right}
                              alt="download"
                            />
                          </h4>
                        )}
                        {sortedCompletedImagePaths &&
                          sortedCompletedImagePaths.length > 0 && (
                            <h4
                              className="detail-value download"
                              onClick={onOpenPostCompletionPreview}
                              id='post-completion-picture-download'
                            >
                              Download
                              <img
                                className="arrow-right"
                                src={Icons.arrow_right}
                                alt="download"
                              />
                            </h4>
                          )}
                      </div>
                      {jobDetails &&
                        jobDetails.postCompletionPictures &&
                        jobDetails.postCompletionPictures.length > 0 && (
                          <div className="form-row form-footer">
                            <div className="upload-containers">
                              <div className="SwiperSlideComponent">
                                <BaseJob64ImageSlider
                                  paths={sortedCompletedImagePaths?.map(img => 
                                    typeof img === 'string' ? img : (img?.path || img)
                                  ) || []}
                                  imgPreview={false}
                                  desktopImagesPerPage={4}
                                  onImageClick={(url, meta) => {
                                    try {
                                      // Get the actual image paths array
                                      const imagePaths = sortedCompletedImagePaths?.map(img => 
                                        typeof img === 'string' ? img : (img?.path || img)
                                      ) || [];
                                      
                                      window.dispatchEvent(
                                        new CustomEvent("openCurrentWorkStartPicture", {
                                          detail: { 
                                            index: meta?.index ?? 0,
                                            images: imagePaths
                                          }
                                        })
                                      );
                                    } catch (error) {
                                      console.error('Error dispatching image preview event:', error);
                                    }
                                    onOpenPostCompletionPreview();
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      <div className="job-images"></div>
                    </div>
                  </>
                )}
              </div>
              <div className="additional-info jobs-info">
                <div className="detail no-bottom-border">
                  <div className="job-name">
                    <h4 className="info-header">Services</h4>
                    <img src={Icons.car_cog} alt="Back Icon" />
                  </div>
                  <div className="job-name universal">
                    <h4 className="detail-value universal-text">
                      Universal Job Status:
                    </h4>
                    {jobServiceDetails?.universalStatus === "Completed" ? (
                      <span className="job-completd-status">Completed</span>
                    ) : (
                      <StatusDropDown
                        className="universal-status"
                        defaultStatus={jobServiceDetails?.universalStatus}
                        currentStatus={jobServiceDetails?.universalStatus}
                        disabled={isUploading || postImgUploadLoading}
                        onChange={handleStatusChange}
                        disabledOptions={(() => {
                          // Check if all services are paused
                          const services = jobServiceDetails?.jobServiceViewDetailsList || [];
                          if (services.length === 0) return [];
                          
                          const allServicesPaused = services.every(
                            service => service.jobStatus === "Paused"
                          );
                          
                          // If all services are paused, disable the "Paused" option
                          return allServicesPaused ? ["Paused"] : [];
                        })()}
                      ></StatusDropDown>
                    )}
                  </div>
                </div>
                <ServiceDataTable
                  className="job-service-table"
                  pagination={false}
                  onAssignTechnicianClick={handleAssignTechnicianClick}
                  onClickPauseReasonModelOpen={onClickPauseReasonModelOpen}
                  jobId={jobDetails && jobDetails?.jobId}
                  serviceData={
                    (jobServiceDetails?.jobServiceViewDetailsList) || 
                    (jobDetails && jobDetails?.jobServiceViewDetailsList) || []
                  }
                  handleJobDetailsData={handleGetJobDetailsData}
                  handleQuoteServiceId={getQuoteServiceId}
                  universalJobStatus={jobServiceDetails?.universalStatus}
                  isDisabled={isUploading || postImgUploadLoading}
                  onRefetchServiceDetails={refetchServiceDetails}
                />
              </div>
            </div>
          </div>
          <AssignTechnician
            isModalOpen={isAssignTechnicianModalOpen}
            handleModalClose={onClickAssignTechnicianCloseModel}
            modalTitle="Assign Technicians"
            technicians={techniciansForCategory}
            categoryId={selectedCategoryId}
            quoteServiceId={quoteServiceId}
            getAssignedTechnicianData={getJobDetailsData}
            onSubmit={handleAssignTechnician}
            onSuccess={() => setRefreshTrigger(true)}
          />
          <CurrentWorkStartPicturePopUp
            visible={openImagePreview}
            setVisible={setOpenImagePreview}
            imagePaths={sortedCurrentImagePaths}
            title="Current Work Start Picture"
            downloadButtonId="current-work-start-picture-download-button"
          />
          <CurrentWorkStartPicturePopUp
            visible={openPostCompletionPreview}
            setVisible={setOpenPostCompletionPreview}
            imagePaths={sortedCompletedImagePaths}
            title="Post Completion Picture"
          />
          <CurrentWorkStartPictureUploadPopUp
            visible={openUploadPopup}
            setVisible={setOpenUploadPopup}
            title="Current Work Start Picture"
            jobId={jobDetails?.jobId}
            jobCardNumber={jobDetails?.jobCardNumber}
            onSave={async (data) => {
              if (data && data.file) {
                // Refresh job details after save
                await dispatch(fetchJobDetails(id));
              }
            }}
          />
          <CurrentWorkStartPictureUploadPopUp
            visible={openPostCompletionUploadPopup}
            setVisible={setOpenPostCompletionUploadPopup}
            title="Post Completion Picture"
            jobId={jobDetails?.jobId}
            jobCardNumber={jobDetails?.jobCardNumber}
            onSave={async (data) => {
              // Refresh job details after save
              await dispatch(fetchJobDetails(id));
            }}
          />
          <EditQuoteModal
            visible={editQuoteModalVisible}
            quote={currentQuote}
            sId={jobDetails?.quoteId}
            serviceId={currentServiceId}
            onClose={() => {
              setEditQuoteModalVisible(false);
              setCurrentQuote(null);
            }}
            jobId={jobDetails?.jobId}
          />
          <PausedReasonDialog
            open={isJobPauseReasonModalOpen}
            onCancel={onClickPauseReasonModelClose}
            quoteId={jobDetails?.quoteId}
            serviceId={currentServiceId}
            onEditQuote={handleEditQuote}
            quoteLoading={quoteLoading}
            jobId={jobDetails?.jobId}
            serviceIds={quoteServiceIds}
            onRefetchServiceDetails={refetchServiceDetails}
          />
          <ConfirmationModal
            isOpen={confirmationModalOpen}
            onClickConfirmModel={handleConfirmStatusUpdate}
            onClickCancelModel={handleCancelConfirmation}
            yesText="Yes, Update"
            noText="No"
            title="Update the Job Status?"
            subTitle="Are you sure you want to change the overall job status?"
            confirmButtonId="job-status-update-confirm-button"
            cancelButtonId="job-status-update-cancel-button"
          />
          {/* Total Idle Time Modal (dummy) */}
          <Modal
            title="Total Idle Time"
            open={showIdleTimeModal}
            onCancel={() => setShowIdleTimeModal(false)}
            footer={null}
            centered
            className="idletime"
            width={796}
          >
            <div className="idle-time-modal">
            {isTotalIdleTimeLoading ? (
              <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
                <Spinner />
              </div>
            ) : (
              <>
              <div className="idle-row first-row" style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #E6EAF2'}}>
                <span className="info">Vehicle Arrival to Job Start</span>
               <span className="value">{idleTimeData?.startIdleTimeDisplay || "-"}</span>
              </div>
              <div className="idle-row" style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #E6EAF2'}}>
                <span className="info">Pause to Job Start</span>
                <span className="value">{idleTimeData?.pauseTotalDisplay || "-"}</span>
              </div>
              <div className="idle-row" style={{display:'flex', justifyContent:'space-between', padding:'12px 0 0 0'}}>
                <span className="info">Total Idle Time</span>
                <span className="value">{idleTimeData?.totalIdleTimeDisplay || "-"}</span>
              </div>
              </>
            )}
            </div>
          </Modal>
          <ConfirmationModal
            isOpen={skipCompletionPicconfirmationModalOpen}
            onClickConfirmModel={handleCreateInvoice}
            onClickCancelModel={() =>
              setSkipCompletionPicConfirmationModalOpen(false)
            }
            onClickSkip={handleCancelCreateInvoiceConfirmation}
            yesText="Yes, Skip"
            noText="Upload Picture"
            title="Skip Job Completion Picture?"
            subTitle="Do you wish to proceed without the post completion pictures?"
          />
          <CarPopupDialog
            visible={openImageTemplate}
            setVisible={setOpenImageTemplate}
          />
        </>
      )}
    </MasterLayout>
  );
};

export default JobDetails;
