import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { notification, Modal } from "antd";
import { format } from "date-fns";
import Icons from "../../utils/icons";
import MasterLayout from ".././MasterLayout";
import TabTitle from "../../shared/tab-title/TabTitle";
import Breadcrumb from "../../shared/breadcrumb/Breadcrumb";
import ServiceDataTable from "./ServiceDataTable";
import CurrentWorkStartPicturePopUp from "../vendor/job-management/CurrentWorkStartPicturePopUp";
import CurrentWorkStartPictureUploadPopUp from "../vendor/job-management/CurrentWorkStartPictureUploadPopUp";
import BaseJob64ImageSlider from "../../shared/slider/BaseJob64ImageSlider";
import {
  fetchJobDetails,
  updateVehicleArrivalDate,
  updateLocalArrivalDate,
  clearVendorJobDetails,
} from "../../slices/technician/jobSlice";
import {
  uploadJobImages,
  saveCurrentWorkImages,
  saveCompletionWorkImages,
  AssignTechnicianToJob,
  saveMileage,
} from "../../slices/vendor/jobSlice";
import { uploadPostCompletionImage } from "../../slices/masterDataSlice";
import RadioSelect from "../../shared/select/RadioSelect";  
import PausedReasonDialog from "../vendor/job-management/pause-job/index";
import ImageUploadComponent from "./ImageUploader";
import ConfirmationModal from "./ConfirmationModal";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import Spinner from "../../shared/components/loaders/Spinner";
import {formatCount} from "../../utils/helperUtils.js";
import  {Tokens} from "../../constants";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import VehicleArrivalDatePicker from "./VehicleArrivalDatePicker";
import VehicleArrivalTimePicker from "../vendor/job-management/VehicleArrivalTimePicker.js";

const JobDetails = () => {
  const { isLoading, isUploading, isUpdateLoading, isSaveJobTechnicianListAddLoading, isTotalIdleTimeLoading } =
    useSelector((state) => state.vendorJobs);

  const { jobDetails, isjobDetailsLoading, isVehicleUpdateLoading } =
    useSelector((state) => state.technicianJobs);

  const { state: locationState } = useLocation();
  const status = locationState?.status;
  const tabIndex = locationState?.tabIndex || 0;
  const [postImgUploadLoading, setPostImgUploadLoading] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const [activeTab, setActiveTab] = useState('open');
  const technicianId = localStorage.getItem(Tokens.TECHNICIAN_ID);

  const { id } = useParams();
  const dispatch = useDispatch();
  const [openImagePreview, setOpenImagePreview] = useState(false);
  const [openPostCompletionPreview, setOpenPostCompletionPreview] = useState(false);
  const [openUploadPopup, setOpenUploadPopup] = useState(false);
  const [openPostCompletionUploadPopup, setOpenPostCompletionUploadPopup] = useState(false);
  const [isJobPauseReasonModalOpen, setJobPauseReasonModalOpen] =
    useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [vehicleArrivalDate, setVehicleArrivalDate] = useState(null);
  const [quoteServiceId, setQuoteServiceId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showMileage, setShowMileage] = useState(false);
  const [isDisabled, setisDisabled] = useState(true);
  const [vehicleArrivalTime, setVehicleArrivalTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showIdleTimeModal, setShowIdleTimeModal] = useState(false);
  const [canEditArrivalTime, setCanEditArrivalTime] = useState(false);
  const [isInitialArrivalTimeSet, setIsInitialArrivalTimeSet] = useState(false);

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
      dispatch(fetchJobDetails(id));
      setVehicleArrivalTime(null);
      setIsInitialArrivalTimeSet(false);
    }
  }, [dispatch, id]);
   useEffect(()=>{
     return()=> {dispatch(clearVendorJobDetails())};  },[dispatch])
  useEffect(() => {
    if(jobDetails?.vehicleArrivalDate && !jobDetails?.jobStartDate){
      setisDisabled(false);
    } else {
      setisDisabled(true);
    }
  }, [jobDetails]);

  useEffect(() => {
    if (jobDetails) {
      const currentDate = jobDetails.vehicleArrivalDate;
      setVehicleArrivalDate(currentDate || null);
      
      if (currentDate) {
        localStorage.setItem(`technicianVehicleArrivalDate-${jobDetails.jobId}`, currentDate);
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
            await dispatch(saveMileage(payload)).unwrap();
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
      dispatch(fetchJobDetails(id));
      setRefreshTrigger(false);
    }
  }, [refreshTrigger]);

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
    } catch (_) {}
    return dateValue;
  };

  useEffect(() => {
      if (refreshTrigger) {
        dispatch(fetchJobDetails(id));
        setRefreshTrigger(false);
      }
  }, [refreshTrigger]);

  const shouldShowCurrentWorkSection = (jobDetails) => {
    if (!jobDetails?.technicianJobServiceViewDetails) return false;
    
    const hasYourActiveService = jobDetails.technicianJobServiceViewDetails.some(service => 
      (service.mainTechnicianName)
    );

    const hasImages = jobDetails.jobCurrentWorkPicturesList?.length > 0;
    
    return hasYourActiveService && jobDetails.vehicleArrivalDate || hasImages;
  };

  const areAllServicesCompleted = (jobDetails) => {
    if (!jobDetails?.technicianJobServiceViewDetails) return false;
    
    return jobDetails.technicianJobServiceViewDetails.every(
      service => service.jobStatus === "Completed"
    );
  };

  const handleSaveCurrentWorkImages = async (images) => {
    try {
      // Create FormData and append all images
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('files', image);
      });

      // First API call to upload images
      const uploadResponse = await dispatch(
        uploadJobImages({ type: 'current', formData })
      ).unwrap();

      if (!uploadResponse.folderPaths || !Array.isArray(uploadResponse.folderPaths)) {
        throw new Error('Invalid response format from image upload service');
      }

      // Prepare data for second API call
      const imageDtoList = uploadResponse.folderPaths.map((item, index) => ({
        image: item.path,
        order: index + 1
      }));

      const saveImagesPayload = {
        jobId: jobDetails.jobId,
        imageDtoList
      };

      // Second API call to save image metadata
      await dispatch(saveCurrentWorkImages(saveImagesPayload)).unwrap();

      notification.success({
        message: <h5>Images uploaded successfully!</h5>,
        icon: <img src={Icons.check} alt="Success" />,
        duration: 5,
      });
    } catch (error) {
      notification.error({
        message: <h5>{error.message || 'Failed to upload images'}</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    }
  };

  const handleSavePostCompleteWorkImages = async (images) => {
    setPostImgUploadLoading(true);
    try {
      // Create FormData and append all images
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('files', image);
      });

      // First API call to upload images
      const uploadResponse = await dispatch(
        uploadJobImages({ type: 'post', formData })
      ).unwrap();

      if (!uploadResponse.folderPaths || !Array.isArray(uploadResponse.folderPaths)) {
        throw new Error('Invalid response format from image upload service');
      }

      // Prepare data for second API call
      const imageDtoList = uploadResponse.folderPaths.map((item, index) => ({
        image: item.path,
        order: index + 1
      }));

      const saveImagesPayload = {
        jobId: jobDetails.jobId,
        imageDtoList
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
        message: <h5>{error.message || 'Failed to upload images'}</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    } finally {
      setPostImgUploadLoading(false);
    }
  };

  const sortedCurrentImagePaths = useMemo(() => {
    if (!jobDetails || !Array.isArray(jobDetails.jobCurrentWorkPicturesList)) return [];
    return [...jobDetails.jobCurrentWorkPicturesList]
      .sort((a, b) => a.order - b.order)
      .map((item) => item.path);
  }, [jobDetails]);

  const sortedCompletedImagePaths = useMemo(() => {
    if (!jobDetails || !Array.isArray(jobDetails.postCompletionPictures)) return [];
    return [...jobDetails.postCompletionPictures]
      .sort((a, b) => a.order - b.order)
      .map((item) => item.path);
  }, [jobDetails]);

  useEffect(() => {
    if (refreshTrigger) {
      dispatch(fetchJobDetails(id));
      setRefreshTrigger(false);
    }
  }, [refreshTrigger]);

  const quoteServiceIds = jobDetails?.jobServiceViewDetailsList?.map(
    (service) => service.quoteServiceId
  ) || [];

  const getQuoteServiceId = (quoteServicesId) => {
    setQuoteServiceId(quoteServicesId);
  }

  const onOpenImagePreview = () => {
    setOpenImagePreview(true);
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

  const handleClaimChange = (record) => {
    console.log("Opening modal for record:", record);
    setSelectedRecord(record); 
    setConfirmationModalOpen(true); 
  };

  const handleServiceClaim = async () => {
    try {
      await dispatch(AssignTechnicianToJob({
        quoteServiceId: selectedRecord.id,
        mainTechnicianId:technicianId,
       
      })).unwrap();

      notification.success({
        message: <h5>Claimed successfully!</h5>,
        icon: <img src={Icons.check} alt="Success" />,
        duration: 5,
      });
      dispatch(fetchJobDetails(id));
      setConfirmationModalOpen(false);
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

  const handleCancelConfirmation = () => {
    setPendingStatusUpdate(null);
    setConfirmationModalOpen(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
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
              <h5>Vehicle arrival time can't be later than the current time.</h5>
            ),
            icon: <img src={Icons.error} alt="Error" />,
            duration: 5,
          });
          return;
        }
      }

      // At this point the date change is allowed; update local state
      setVehicleArrivalDate(formattedDate);
      localStorage.setItem(`technicianVehicleArrivalDate-${jobDetails.jobId}`, formattedDate);

      // If no time is set yet (first time updating date), send '00:00:00'
      let autoNowForApi = null;
      if (!effectiveTime) {
        autoNowForApi = "00:00:00";
      }

      let dataToSend = {
        jobId: jobDetails.jobId,
        vehicleArrivalDate: formattedDate,
        vehicleArrivalTime: (() => {
          if (autoNowForApi) {
            return autoNowForApi;
          }

          if (!effectiveTime || typeof effectiveTime !== "string") {
            return effectiveTime;
          }

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
        setCanEditArrivalTime(true);
        notification.success({
          message: <h5>Vehicle arrival date updated successfully</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 5,
        });
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
        parent_menu={status === "Available Jobs" ? "Available Jobs" : "My Jobs"}
        parent_menu_url="/app/dashboard"
        parent_menu_state={{ tabIndex: status === "Available Jobs" ? 0 : 1 }}
        {...(status !== "Available Jobs" && {
          second_level_page: status,
          second_level_page_url: "/app/dashboard",
          second_level_page_state: { tabIndex: 1 }
        })}
        current_page="Job Overview"
      />
      <TopProgressBar isLoading={isLoading || isUpdateLoading || isjobDetailsLoading || isVehicleUpdateLoading || isSaveJobTechnicianListAddLoading} />
      {isLoading || isjobDetailsLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="view-spare-container job-detail-container tech-job-cotainer tech-job-detail" id="technician-job-details-container">
            <div className="view-spare-header" id="technician-job-details-header">
              <div className="back-page" id="technician-job-details-back">
                <Link to="/app/dashboard" id="technician-job-details-back-link">
                  <img src={Icons.arrow_left} alt="Back Icon" id="technician-job-details-back-icon" />
                </Link>
                <h3 id="technician-job-details-title">
                  Job Overview - {" "}
                  {jobDetails && jobDetails.jobCardNumber
                    ? jobDetails.jobCardNumber
                    : ""}
                </h3>
              </div>
            </div>
            {status === "Available Jobs" && (
            <div className="service-box" id="technician-job-details-service-box">
              <div className="status-dot" id="technician-job-details-status-dot"></div>
              <span id="technician-job-details-service-count">
                {jobDetails && formatCount(jobDetails.openServiceCount)} of {jobDetails && formatCount(jobDetails.openServiceCount + jobDetails.claimServiceCount)} services are available.
              </span>
            </div>
            )}
            <div className="view-spare-part-content" id="technician-job-details-content">

              <div className="spare-info jobs-info" id="technician-job-details-info">
                <div className="job-name" id="technician-job-details-name-header">
                  <h4 className="info-header" id="technician-job-details-name-title">Job Details</h4>
                  <img src={Icons.briefcase} alt="Back Icon" id="technician-job-details-name-icon" />
                </div>

                <div className="detail" id="technician-job-details-card-number">
                  <h5 className="detail-label" id="technician-job-details-card-number-label">Job Card Number</h5>
                  <h4 className="detail-value" id="technician-job-details-card-number-value">
                    {jobDetails && jobDetails.jobCardNumber
                      ? jobDetails.jobCardNumber
                      : "-"}
                  </h4>
                </div>
                <div className="detail" id="technician-job-details-vehicle-reg">
                  <h5 className="detail-label" id="technician-job-details-vehicle-reg-label">Vehicle Reg Number</h5>
                  <h4 className="detail-value" id="technician-job-details-vehicle-reg-value">
                    {jobDetails && jobDetails.vehicleRegNumber
                      ? jobDetails.vehicleRegNumber
                      : "-"}
                  </h4>
                </div>
                <div className="detail" id="technician-job-details-vehicle-make-model">
                  <h5 className="detail-label" id="technician-job-details-vehicle-make-model-label">Vehicle Make and Model</h5>
                  <h4 className="detail-value" id="technician-job-details-vehicle-make-model-value"> 
                    {jobDetails && jobDetails.vehicleMake
                      ? jobDetails.vehicleMake
                      : "-"}{" "}
                    -{" "}
                    {jobDetails && jobDetails.vehicleModel
                      ? jobDetails.vehicleModel
                      : "-"}
                  </h4>
                </div>
                <div className="detail" id="technician-job-details-created-date">
                  <h5 className="detail-label" id="technician-job-details-created-date-label">Job Created Date</h5>
                  <h4 className="detail-value" id="technician-job-details-created-date-value">
                    {jobDetails && jobDetails.jobCreatedDate
                      ? jobDetails.jobCreatedDate
                      : "-"}
                  </h4>
                </div>
                <div className="detail" id="technician-job-details-estimated-duration">
                  <h5 className="detail-label" id="technician-job-details-estimated-duration-label">Estimated Job Duration</h5>
                  <h4 className="detail-value" id="technician-job-details-estimated-duration-value">
                    {jobDetails && jobDetails.estimatedJobDuration
                      ? jobDetails.estimatedJobDuration
                      : "-"}
                  </h4>
                </div>
                <div className="detail" id="technician-job-details-due-date">
                  <h5 className="detail-label" id="technician-job-details-due-date-label">Due Date</h5>
                  <h4 className="detail-value" id="technician-job-details-due-date-value">
                    {jobDetails && jobDetails.dueDate
                      ? jobDetails.dueDate
                      : "-"}
                  </h4>
                </div>
                <div className="detail" id="technician-job-details-notes">
                  <h5 className="detail-label" id="technician-job-details-notes-label">Notes</h5>
                  <h4 className="detail-value" id="technician-job-details-notes-value">
                    {jobDetails && jobDetails.notes
                      ? jobDetails.notes
                      : "-"}
                  </h4>
                </div>
                <div className="detail" id="technician-job-details-arrival-date">
                  <h5 className="detail-label" id="technician-job-details-arrival-date-label">Vehicle Arrival Date</h5>
                  <div className="vehicle-arival-dte" id="technician-job-details-arrival-date-container">
                    <div className="date-container" id="technician-job-details-arrival-date-picker-container">
                      <span
                        id="technician-job-details-arrival-date-text"
                        className={`${
                          vehicleArrivalDate !== null && vehicleArrivalDate !== undefined
                            ? "selected-date"
                            : "date-text"
                        }`}
                      >
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
                            id="technician-job-details-arrival-date-icon"
                            src={Icons.CalendarX}
                            alt="Calendar"
                            style={{
                              cursor: enabled ? "pointer" : "not-allowed",
                              opacity: enabled ? 1 : 0.5,
                            }}
                            onClick={() => {
                              if (!enabled) return;
                              setShowDatePicker(!showDatePicker);
                            }}
                          />
                        );
                      })()}
                    </div>
                    {showDatePicker && (
                      <div className="date-picker-popup" id="technician-job-details-arrival-date-popup">
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
                <div className="detail" id="technician-job-details-arrival-time">
                  <h5 className="detail-label" id="technician-job-details-arrival-time-label">Vehicle Arrival Time</h5>
                  <div className="vehicle-arival-dte" id="technician-job-details-arrival-time-container">
                    <div className="date-container" id="technician-job-details-arrival-time-picker-container">
                      <span
                        id="technician-job-details-arrival-time-text"
                        className={`${
                          vehicleArrivalTime !== null && vehicleArrivalTime !== undefined
                            ? "selected-date"
                            : "date-text"
                        }`}
                      >
                        {vehicleArrivalTime !== null &&
                        vehicleArrivalTime !== undefined
                          ? vehicleArrivalTime
                          : jobDetails?.vehicleArrivalTime || "Select Vehicle Arrival Time"}
                      </span>
                      {(() => {
                        const enabled = canEditArrivalTime && !jobDetails?.jobStartDate;
                        return (
                          <img
                            className="calendar-img clock-image"
                            id="technician-job-details-arrival-time-icon"
                            src={Icons.clock}
                            alt="Clock"
                            style={{
                              cursor: enabled ? "pointer" : "not-allowed",
                              opacity: enabled ? 1 : 0.5,
                            }}
                            onClick={() => {
                              if (!enabled) return;
                              setShowTimePicker(!showTimePicker);
                            }}
                          />
                        );
                      })()}
                    </div>
                    {showTimePicker && (
                      <div
                        className="time-picker-overlay"
                        id="technician-job-details-arrival-time-overlay"
                        onClick={() => setShowTimePicker(false)}
                      >
                        <div
                          className="date-picker-popup time-picker-popup"
                          id="technician-job-details-arrival-time-popup"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <VehicleArrivalTimePicker
                            inline={true}
                            id="technician-job-details-arrival-time-picker"
                            onClose={() => setShowTimePicker(false)}
                            onSubmit={handleUpdateVehicleArrivalTime}
                            onChangeTime={handleTimeChange}
                            defaultTime={(() => {
                              const rawDate =
                                vehicleArrivalDate || jobDetails?.vehicleArrivalDate || null;
                              const existingTime =
                                vehicleArrivalTime || jobDetails?.vehicleArrivalTime || null;

                              if (existingTime) {
                                return existingTime;
                              }

                              if (!rawDate) {
                                return existingTime;
                              }

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
                <div className="detail" id="technician-job-details-mileage">
                  <h5 className="detail-label" id="technician-job-details-mileage-label">Mileage</h5>
                  <div className="vehicle-arival-dte" id="technician-job-details-mileage-container">
                    <div className="date-container" id="technician-job-details-mileage-display-container">
                      <span className="date-text" id="technician-job-details-mileage-value">
                        {jobDetails?.mileage || "-"}
                      </span>
                      {!jobDetails?.jobStartDate &&(
                      <img
                        src={Icons.pencil_simple_line}
                        alt="Edit Mileage"
                        id="technician-job-details-mileage-edit-icon"
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
                      <div className="date-picker-popup mileage-model" id="technician-job-details-mileage-popup">
                        <div className="position-relative vehicle-date datepicker mileage-popup p-0" id="technician-job-details-mileage-form">
                          <div className="group-input-wrapper gap-2 d-flex" id="technician-job-details-mileage-inputs">
                            <div className="form-row" id="technician-job-details-mileage-form-row">
                              <div className="form-item" id="technician-job-details-mileage-input-field">
                                <input
                                  type="text"
                                  name="mileage"
                                  required
                                  autoComplete="off"
                                  id="technician-job-details-mileage-input"
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
                                  htmlFor="technician-job-details-mileage-input"
                                  id="technician-job-details-mileage-input-label"
                                >
                                  <h4>Mileage</h4>
                                </label>
                                {errors.mileage && (
                                  <></>
                                )}
                              </div>
                              <div className="form-item mileage-radio" id="technician-job-details-mileage-unit-field">
                                <RadioSelect
                                  required
                                  name="mileageUnit"
                                  placeholderText="Unit"
                                  id="technician-job-details-mileage-unit-select"
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
                              <div className="field-error full-width-error" id="technician-job-details-mileage-error">
                                <img
                                  src={Icons.warning_circle}
                                  alt="Warning Icon"
                                  id="technician-job-details-mileage-error-icon"
                                />
                                {errors.mileage && <h6 id="technician-job-details-mileage-error-text">{errors.mileage}</h6>}
                                {errors.mileageUnit && <h6 id="technician-job-details-mileage-unit-error-text">{errors.mileageUnit}</h6>}
                              </div>
                            )}
                          </div>
                          <div className="mt-5" id="technician-job-details-mileage-actions">
                            <div className="d-flex justify-content-end date-buttons" id="technician-job-details-mileage-buttons">
                              <button
                                className="btn btn-sm btn-outline-secondary me-3 date-cancel"
                                id="technician-job-details-mileage-cancel"
                                onClick={onClickCancel}
                              >
                                Cancel
                              </button>
                              <button className="btn btn-sm btn-primary date-save"
                                id="technician-job-details-mileage-save"
                                onClick={handleSaveMileage}
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
                  <div className="detail" id="technician-job-details-start-date">
                    <h5 className="detail-label" id="technician-job-details-start-date-label">Job Start Date</h5>
                    <h4 className="detail-value" id="technician-job-details-start-date-value">
                      {jobDetails && jobDetails.jobStartDate
                        ? jobDetails.jobStartDate
                        : "-"}
                    </h4>
                  </div>
                )}
                {jobDetails && jobDetails.jobCompletionDate && (
                  <div className="detail" id="technician-job-details-completion-date">
                    <h5 className="detail-label" id="technician-job-details-completion-date-label">Job Completion Date</h5>
                    <h4 className="detail-value" id="technician-job-details-completion-date-value">{jobDetails && jobDetails.jobCompletionDate ? jobDetails.jobCompletionDate : "-"}</h4>
                  </div>
                )}
                {jobDetails && shouldShowCurrentWorkSection(jobDetails) && (
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
                                id="technician-job-details-current-work-images-download-icon"
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
                                      window.dispatchEvent(new CustomEvent('openCurrentWorkStartPicture', { detail: { index: meta?.index ?? 0 } }));
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
                {jobDetails && areAllServicesCompleted(jobDetails) && (
                  <>
                    <div className="detail image-upload-job view-image-job">
                      <div className="images-preview upload-images">
                        <h5 className="detail-label image-detail-label">
                          Post Completion Picture
                        </h5>

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
                              onClick={() => {
                                onOpenPostCompletionPreview();
                              }}
                               id='post-completion-picture-download'
                            >
                              Download
                              <img
                                className="arrow-right"
                                src={Icons.arrow_right}
                                alt="download"
                                id="technician-job-details-post-completion-images-download-icon"
                              />
                            </h4>
                          )}
                      </div>
                      {jobDetails &&
                        jobDetails.postCompletionPictures &&
                        jobDetails.postCompletionPictures.length > 0 && (
                          <div className="form-row form-footer job-imagess">
                            <div className="upload-containers">
                              <div className="SwiperSlideComponent">
                                <BaseJob64ImageSlider
                                  paths={sortedCompletedImagePaths}
                                  desktopImagesPerPage={4}
                                  onImageClick={(url, meta) => {
                                    try {
                                      window.dispatchEvent(new CustomEvent('openCurrentWorkStartPicture', { detail: { index: meta?.index ?? 0 } }));
                                    } catch (_) {}
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
              <div className="additional-info jobs-info" id="technician-job-details-services">
                <div className="detail no-bottom-border" id="technician-job-details-services-header">
                  <div className="job-name" id="technician-job-details-services-name">
                    <h4 className="info-header" id="technician-job-details-services-title">Services</h4>
                    <img src={Icons.car_cog} alt="Services Icon" id="technician-job-details-services-icon" />
                  </div>
                </div>
                <div className="service-tables-job" id="technician-job-details-service-tables">
                {status === "Available Jobs" && (
                  <div className="services-tab" id="technician-job-details-services-tab">
                    <div
                      id="technician-job-details-open-services-tab"
                      className={`tab-item ${activeTab === 'open' ? 'active' : ''}`}
                      onClick={() => setActiveTab('open')}
                    >
                      <span id="technician-job-details-open-services-text">Open Services</span>
                      <span className="count" id="technician-job-details-open-services-count">{jobDetails && formatCount(jobDetails.openServiceCount)} </span>
                    </div>

                    <div className="divider" id="technician-job-details-services-divider" />

                    <div
                      id="technician-job-details-claimed-services-tab"
                      className={`tab-item ${activeTab === 'claimed' ? 'active' : ''}`}
                      onClick={() => setActiveTab('claimed')}
                    >
                      <span id="technician-job-details-claimed-services-text">Claimed Services</span>
                      <span className="count" id="technician-job-details-claimed-services-count">{jobDetails && formatCount(jobDetails.claimServiceCount)} </span>
                    </div>
                  </div>
                )}

                <ServiceDataTable
                  className="job-service-table"
                  id="technician-job-details-service-table"
                  pagination={false}
                  rowKey="quoteServiceId"
                  onClickPauseReasonModelOpen={onClickPauseReasonModelOpen}
                  jobId={jobDetails && jobDetails?.jobId}
                  serviceData={
                    (jobDetails && jobDetails?.technicianJobServiceViewDetails) || []
                  }
                  handleQuoteServiceId={getQuoteServiceId}
                  activeTab={activeTab}
                  jobType={status}
                  handleClaimChange={handleClaimChange}
                />
              </div>
              </div>
            </div>
          </div>
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
          <PausedReasonDialog
            open={isJobPauseReasonModalOpen}
            onCancel={onClickPauseReasonModelClose}
            quoteId={jobDetails?.quoteId}
            serviceId={currentServiceId}
            jobId={jobDetails?.jobId}
            serviceIds={quoteServiceIds}
            isVendor={false}
            id="technician-job-details-paused-reason-dialog"
          />
          <ConfirmationModal
            isOpen={confirmationModalOpen}
            onClickConfirmModel={handleServiceClaim}
            onClickCancelModel={handleCancelConfirmation}
            yesText="Yes, Claim"
            noText="No"
            title="Claim Service!"
            subTitle="Are you sure to claim this service?"
            isLoading={isSaveJobTechnicianListAddLoading}
            id="technician-job-details-claim-service-modal"
          />
        </>
      )}
    </MasterLayout>
  );
};

export default JobDetails;
