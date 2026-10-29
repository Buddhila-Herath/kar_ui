import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, notification } from "antd";
import { dateFormat } from "../../../constants";
import { format } from "date-fns";
import Icons from "../../../utils/icons";
import GroupRadioSelect from "../../../shared/select/GroupRadioSelect";
import ReactDatePicker from "../../../shared/datepicker/ReactDatePicker";
import CustomGroupSelectDropdown from "../../../shared/select/CustomGroupSelectDropdown";
import CustomSubGroupSelectSingle from "../../../shared/select/CustomSubGroupSelectSingle";
import OwnerSelect from "../../../shared/select/OwnerSelect";
import ImageUploadComponent from "../job-management/ImageUploader";
import BaseJob64ImageSlider from "../../../shared/slider/BaseJob64ImageSlider";
import CarPopupDialog from "../job-management/image-preview/Index";
import CurrentWorkStartPicturePopUp from "../job-management/CurrentWorkStartPicturePopUp";
import CurrentWorkStartPictureUploadPopUp from "../job-management/CurrentWorkStartPictureUploadPopUp";
import {
  setVehicleId,
  resetVehicleId,
} from "../../../slices/vendor/vehicleSlice";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getConfig } from "../../../config/service";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import Spinner from "../../../shared/components/loaders/Spinner";
import { apiBaseURL, Tokens } from "../../../constants/index";
import {
  fetchAllInsuranceCompanyList,
  fetchAllVehicleMakes,
  fetchAllVehicleModels,
  fetchAllVehicleMakeList,
  fetchAllVehicleMakesCategories,
  addModel,
  addMake,
  addInsuranceCompany,
} from "../../../slices/masterDataSlice";

import {
  saveVehicleData,
  uploadVehicleRegistrationImages,
  updateVehicleDetails,
  fetchAllOwnerName
} from "../../../slices/vendor/vehicleSlice";
import CancelModal from "../../../shared/components/CancelModal";
import ConfirmationModal from "./ConfirmationModal";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "../../../assets/css/style.css";

const vehicleForm = ({ vehicle = {}, isEdit = false, sId = 0 }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const firstName = localStorage.getItem(Tokens.FIRST_NAME);
  const lastName = localStorage.getItem(Tokens.LAST_NAME);
  const email = localStorage.getItem(Tokens.EMAIL);

  const stompClientRef = useRef(null);
  const config = getConfig();
  const { vehicleId, isVehicleIdLoading } = useSelector(
    (state) => state.vendorVehicle
  );

  const apacheServer = config.apiUrl + "api/v1/";
  const getUserId = localStorage.getItem(Tokens.USER_ID);

  const {
    allVehicleMakes,
    allVehicleModels,
    allVehicleMakeCategory,
    allVehicleMakeList,
  } = useSelector((state) => state.masterData);

  const { allInsuranceCompanyList } = useSelector((state) => state.masterData);
  const { allCustomerList } = useSelector((state) => state.vendorVehicle);

  const [errorIcon, setErrorIcon] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [openImagePreview, setOpenImagePreview] = useState(false);
  const [isFormModified, setIsFormModified] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedVehicleMakeIds, setSelectedVehicleMakeIds] = useState([]);
  const [ownershipChangeModalOpen, setOwnershipChangeModalOpen] =
    useState(false);
  const [pendingOwnerChange, setPendingOwnerChange] = useState(null);
  const [currentImagePreview, setCurrentImagePreview] = useState(false);
  const [openUploadPopup, setOpenUploadPopup] = useState(false);
 

  const [formInputs, setFormInputs] = useState({
    vin: "",
    color: "",
    vehicleRegNumber: "",
    year: null,
    insuranceRenewalDate: null,
    insuranceId: "",
    licenseRenewalDate: null,
    initialRegPhotos: [],
    vehicleMakeId: null,
    vehicleModelId: null,
    ownerId: null,
    registeredBy: "",
    status: true,
    addedDate: format(new Date(), dateFormat.API_NATIVE),
    vehicleId: "",
  });

  useEffect(() => {
    dispatch(fetchAllInsuranceCompanyList());
    dispatch(fetchAllVehicleMakesCategories());
    dispatch(fetchAllVehicleMakes());
    dispatch(fetchAllVehicleMakeList());
    dispatch(fetchAllOwnerName());
  }, [dispatch]);

  useEffect(() => {
    if (selectedVehicleMakeIds && selectedVehicleMakeIds.length > 0) {
      dispatch(fetchAllVehicleModels(selectedVehicleMakeIds));
    }
  }, [dispatch, selectedVehicleMakeIds]);

  useEffect(() => {
    const socketUrl = `${apacheServer}${apiBaseURL?.GET_CUSTOMERVEHICLE_LIST}`;
    const socket = new SockJS(socketUrl);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: {
        userId: getUserId,
      },
      onConnect: () => {
        stompClient.subscribe("/topic/vehicleId", (message) => {
          try {
            const receivedVehicleId = message.body.replace(/"/g, "");
            dispatch(setVehicleId(receivedVehicleId));
          } catch (error) {
            console.error("Error processing vehicleId:", error);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
      onWebSocketClose: () => {
        console.warn("WebSocket connection closed");
      },
      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.deactivate();
      }
      dispatch(resetVehicleId());
    };
  }, [apacheServer, dispatch]);

  useEffect(() => {
    if (!isEdit && vehicleId) {
      setFormInputs((prevInputs) => ({
        ...prevInputs,
        vehicleId: vehicleId,
      }));
    }
  }, [vehicleId, isEdit]);

  // Add this useEffect in VehicleForm.js, with other useEffects
useEffect(() => {
  const handleImagePreview = (event) => {
    const { index, images } = event.detail || {};
    if (typeof index === 'number' && images) {
      setCurrentImagePreview(true);
    }
  };

  window.addEventListener('openCurrentWorkStartPicture', handleImagePreview);
  
  return () => {
    window.removeEventListener('openCurrentWorkStartPicture', handleImagePreview);
  };
}, []);

  useEffect(() => {
    if (isEdit && vehicle) {
      setFormInputs((prevInputs) => ({
        ...prevInputs,
        id: sId,
        vin: vehicle.vin || "",
        color: vehicle.color || "",
        vehicleRegNumber: vehicle.vehicleRegistrationNo || "",
        year: vehicle.year || null,
        insuranceRenewalDate: vehicle.insuranceRenewalDate || null,
        insuranceId: vehicle.insuranceCompany || "",
        licenseRenewalDate: vehicle.licenseRenewalDate || null,
        initialRegPhotos:
          vehicle.initialRegistrationPhotos ||
          vehicle.vehicleRegistrationPhotos ||
          [],
        vehicleMakeId: vehicle.vehicleMake || null,
        vehicleModelId: vehicle.vehicleModel || null,
        ownerId: vehicle.ownerId || null,
        registeredBy: vehicle.registeredBy || vehicle.createdBy || vehicle.addedBy || vehicle.userId || vehicle.createdByUser || email,
        addedDate:
          vehicle.createdDate || format(new Date(), dateFormat.API_NATIVE),
        status: vehicle.status !== undefined ? vehicle.status : true,
        vehicleId: vehicle.vehicleId || "",
      }));

      if (vehicle.vehicleMakeId) {
        setSelectedVehicleMakeIds([vehicle.vehicleMakeId]);
      }
    }
  }, [isEdit, vehicle, sId, email]);

  const onOpenImagePreview = () => {
    setCurrentImagePreview(true);
  };

  const handleRemoveImages = () => {
    setFormInputs((prev) => ({
      ...prev,
      initialRegPhotos: [],
    }));
    setErrors((prev) => ({
      ...prev,
      initialRegPhotos: "",
    }));
    setIsFormModified(true);
  };

  const handleSaveCurrentWorkImages = async (uploadedImages) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      uploadedImages.forEach((file, index) => {
        formData.append("files", file);
      });

      const uploadResponse = await dispatch(
        uploadVehicleRegistrationImages({
          formData,
          vehicleId: formInputs.vehicleId || vehicleId,
        })
      ).unwrap();

      let imagePaths = [];
      if (Array.isArray(uploadResponse)) {
        imagePaths = uploadResponse;
      } else if (uploadResponse && Array.isArray(uploadResponse.folderPaths)) {
        imagePaths = uploadResponse.folderPaths.map((item) => item.path);
      } else if (uploadResponse && uploadResponse.path) {
        imagePaths = [uploadResponse.path];
      } else {
        throw new Error("Invalid response format from image upload service");
      }

      setFormInputs((prev) => ({
        ...prev,
        initialRegPhotos: imagePaths,
      }));

      setErrors((prev) => ({
        ...prev,
        initialRegPhotos: "",
      }));

      setIsFormModified(true);

      notification.success({
        message: <h5>Images uploaded successfully!</h5>,
        icon: <img src={Icons.check} alt="Success" />,
        duration: 5,
      });

      return { success: true };
    } catch (error) {
      console.error("Image upload error:", error);
      notification.error({
        message: <h5>{error.message || "Failed to upload images"}</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });

      return { success: false, error: error.message };
    } finally {
      setIsUploading(false);
    }
  };

  const vehicleMakeOptions = useMemo(
    () =>
      allVehicleMakes.map((option) => ({
        label: option.vehicleMakeCategory,
        options: option.vehicleMake.map((make) => ({
          label: make.vehicleMakeName,
          value: make.vehicleMakeId,
        })),
      })),
    [allVehicleMakes]
  );

  const vehicleMakeCategoryLists = allVehicleMakeCategory.map((option) => ({
    label: option.makeCategory,
    value: option.id,
  }));

  const vehicleMakeLists = allVehicleMakeList.map((option) => ({
    label: option.makeName,
    value: option.id,
  }));

  const insuranceNames = allInsuranceCompanyList.map((option) => ({
    label: option.insuranceName,
    value: option.id,
  }));

  const customerNames = allCustomerList.map((option) => ({
    label: option.clientName,
    value: option.id,
  }));

  const selectedOwner = useMemo(() => {
    // Always prioritize the current form selection
    if (formInputs.ownerId && allCustomerList.length > 0) {
      return allCustomerList.find(
        (customer) => customer.id === formInputs.ownerId
      );
    }
    return null;
  }, [formInputs.ownerId, allCustomerList]);

  const sortedImagePaths = useMemo(() => {
    if (!formInputs.initialRegPhotos?.length) return [];
    return [...formInputs.initialRegPhotos]
      .sort((a, b) => (a.imageOrder || 0) - (b.imageOrder || 0))
      .map((item) => item.path);
  }, [formInputs.initialRegPhotos]);

  const vehicleModelOptions = useMemo(
    () =>
      allVehicleModels.map((option) => ({
        label: option.vehicleMakeCategory,
        options: option.vehicleMake.map((make) => ({
          label: make.vehicleMakeName,
          subOptions: make.vehicleModel.map((model) => ({
            label: model.vehicleModelName,
            value: model.vehicleModelId,
          })),
        })),
      })),
    [allVehicleModels]
  );

  const handleAddMakeValue = async (value, category) => {
    try {
      const response = await dispatch(addMake(value, category)).unwrap();
      dispatch(fetchAllVehicleMakeList());
      dispatch(fetchAllVehicleMakesCategories());
      dispatch(fetchAllVehicleMakes());
      return response;
    } catch (error) {
      return error;
    }
  };

  const handleAddModelValue = async (value, category) => {
    try {
      const response = await dispatch(addModel(value, category)).unwrap();
      if (response) {
        await dispatch(fetchAllVehicleModels(selectedVehicleMakeIds));
      }
      return response;
    } catch (error) {
      return error;
    }
  };

  const handleAddInsuranceCompany = async (data) => {
    try {
      const response = await dispatch(addInsuranceCompany(data.value)).unwrap();
      if (response) {
        await dispatch(fetchAllInsuranceCompanyList());
        notification.success({
          message: <h5>Insurance company added successfully!</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 5,
        });
      }
      return response;
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: <h5>Failed to add insurance company</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
      return error;
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setErrorIcon("");
    setErrorTitle("");
    setError("");
  };

  const [errors, setErrors] = useState({
    vin: "",
    color: "",
    vehicleRegNumber: "",
    year: "",
    insuranceRenewalDate: "",
    insuranceId: "",
    licenseRenewalDate: "",
    vehicleMakeId: "",
    vehicleModelId: "",
   
    vehicleId: "",
  });

  const handleCancelClick = () => {
    if (isFormModified) {
      setShowCancelPopup(true);
    } else {
      navigate(-1);
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelPopup(false);
    navigate(-1);
  };

  const handleCancelCancel = () => {
    setShowCancelPopup(false);
  };

  const handleValidation = () => {
    let formErrors = {};
    let isValid = true;

    if (!formInputs.vin) {
      formErrors.vin = "VIN field is required";
      isValid = false;
    } else if (formInputs.vin.length > 17) {
      formErrors.vin = "VIN must not exceed 17 characters";
      isValid = false;
    } else {
      const vinRegex = /^[0-9A-HJ-NPR-Z]+$/;
      if (!vinRegex.test(formInputs.vin)) {
        formErrors.vin =
          "VIN must contain only digits (0-9) and uppercase letters (A-Z) except I, O, and Q";
        isValid = false;
      }
    }

    if (!formInputs.color) {
      formErrors.color = "Color field is required";
      isValid = false;
    } else if (formInputs.color.length > 50) {
      formErrors.color = "Color must not exceed 50 characters";
      isValid = false;
    }

    if (!formInputs.vehicleRegNumber) {
      formErrors.vehicleRegNumber = "Vehicle Registration No field is required";
      isValid = false;
    } else if (formInputs.vehicleRegNumber.length < 5) {
      formErrors.vehicleRegNumber =
        "Vehicle Registration No must be at least 5 characters";
      isValid = false;
    } else if (formInputs.vehicleRegNumber.length > 12) {
      formErrors.vehicleRegNumber =
        "Vehicle Registration No must not exceed 12 characters";
      isValid = false;
    }

    if (!formInputs.year) {
      formErrors.year = "Year field is required";
      isValid = false;
    } else {
      const currentYear = new Date().getFullYear();
      if (formInputs.year > currentYear) {
        formErrors.year = `Year must be a past year. Future years are not allowed.`;
        isValid = false;
      }
    }

    if (!formInputs.insuranceRenewalDate) {
      formErrors.insuranceRenewalDate =
        "Insurance Renewal Date field is required";
      isValid = false;
    }

    if (!formInputs.insuranceId) {
      formErrors.insuranceId = "Insurance Company field is required";
      isValid = false;
    }

    if (!formInputs.licenseRenewalDate) {
      formErrors.licenseRenewalDate = "License Renewal Date field is required";
      isValid = false;
    }

    if (!formInputs.vehicleMakeId) {
      formErrors.vehicleMakeId = "Vehicle Make field is required";
      isValid = false;
    }

    if (!formInputs.vehicleModelId) {
      formErrors.vehicleModelId = "Vehicle Model field is required";
      isValid = false;
    }

    if (!formInputs.vehicleId) {
      formErrors.vehicleId = "Vehicle ID field is required";
      isValid = false;
    }

    if (!isValid) {
      setErrors(formErrors);
      notification.error({
        message: <h5>Validation failed. Ensure all fields are correct.</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    }

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsFormModified(true);

    let errorMsg = "";

    if (name === "vin") {
      if (!value) {
        errorMsg = "VIN field is required";
      } else if (value.length > 17) {
        errorMsg = "VIN must not exceed 17 characters";
      } else {
        const vinRegex = /^[0-9A-HJ-NPR-Z]+$/;
        if (!vinRegex.test(value)) {
          errorMsg =
            "VIN must contain only digits (0-9) and uppercase letters (A-Z) except I, O, and Q";
        }
      }
    } else if (name === "color") {
      if (!value) {
        errorMsg = "Color field is required";
      } else if (value.length > 50) {
        errorMsg = "Color must not exceed 50 characters";
      }
    } else if (name === "vehicleRegNumber") {
      if (!value) {
        errorMsg = "Vehicle Registration No field is required";
      } else if (value.length < 5) {
        errorMsg = "Vehicle Registration No must be at least 5 characters";
      } else if (value.length > 12) {
        errorMsg = "Vehicle Registration No must not exceed 12 characters";
      }
    } else if (name === "vehicleMakeId") {
      if (!value) {
        errorMsg = "Vehicle Make field is required";
      }
    } else if (name === "vehicleModelId") {
      if (!value) {
        errorMsg = "Vehicle Model field is required";
      }
    } else if (name === "insuranceId") {
      if (!value) {
        errorMsg = "Insurance Company field is required";
      }
    } else if (name === "vehicleId") {
      if (!value) {
        errorMsg = "Vehicle ID field is required";
      }
    } else if (name === "year") {
      if (!value) {
        errorMsg = "Year field is required";
      } else {
        const currentYear = new Date().getFullYear();
        if (value > currentYear) {
          errorMsg = `Year must be a past year. Future years are not allowed.`;
        }
      }
    } else if (name === "insuranceRenewalDate") {
      if (!value) {
        errorMsg = "Insurance Renewal Date field is required";
      }
    } else if (name === "licenseRenewalDate") {
      if (!value) {
        errorMsg = "License Renewal Date field is required";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg,
    }));

    setFormInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const valid = handleValidation();
    if (valid) {
      setIsLoading(true);
      try {
        const resultAction = await dispatch(saveVehicleData(formInputs));
        if (saveVehicleData.fulfilled.match(resultAction)) {
          navigate("/app/vehicle-management");
          notification.success({
            message: <h5>Vehicle added successfully!</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5,
          });
        } else if (resultAction.payload?.errors) {
          const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
            const errorLower = error.toLowerCase();
            
            if (errorLower.includes("vin")) {
              acc.vin = error;
            }
            
            else if (errorLower.includes("color")) {
              acc.color = error;
            }
         
            else if (errorLower.includes("vehicle registration") ) {
              acc.vehicleRegNumber = error;
            }
           
            else if (errorLower.includes("year")) {
              acc.year = error;
            }
            
            else if (errorLower.includes("insurance renewal") ) {
              acc.insuranceRenewalDate = error;
            }

             else if (errorLower.includes("insurance company") ) {
              acc.insuranceId = error;
            }
           
            else if (errorLower.includes("license renewal") ) {
              acc.licenseRenewalDate = error;
            }
           
            else if (errorLower.includes("vehicle make") ) {
              acc.vehicleMakeId = error;
            }
            
            else if (errorLower.includes("vehicle model")) {
              acc.vehicleModelId = error;
            }
           
            else if (errorLower.includes("initial registration photos") ) {
              acc.initialRegPhotos = error;
            }
         
            else if (errorLower.includes("vehicle id") ) {
              acc.vehicleId = error;
            }
            return acc;
          }, {});

          setErrors((prevErrors) => ({
            ...prevErrors,
            ...apiErrors,
          }));

          notification.error({
            message: <h5>Validation failed. Ensure all fields are correct.</h5>,
            icon: <img src={Icons.error} alt="Error" />,
            duration: 5,
          });
        } else {
          setErrorIcon(Icons.error_email);
          setErrorTitle("Failed to save data.");
          setError(resultAction.payload);
          setShowPopup(true);
        }
      } catch (error) {
        setErrorIcon(Icons.error_email);
        setErrorTitle("Failed to save data.");
        setError(error.message);
        setShowPopup(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    setErrors({});

    const valid = handleValidation();
    if (valid) {
      setIsLoading(true);
      try {
        const dataToSend = {
          id: formInputs.id,
          vin: formInputs.vin,
          color: formInputs.color,
          vehicleRegNumber: formInputs.vehicleRegNumber,
          year: formInputs.year,
          insuranceRenewalDate: formInputs.insuranceRenewalDate,
          insuranceId: formInputs.insuranceId,
          licenseRenewalDate: formInputs.licenseRenewalDate,
          initialRegPhotos: formInputs.initialRegPhotos,
          vehicleMakeId: formInputs.vehicleMakeId,
          vehicleModelId: formInputs.vehicleModelId,
          ownerName: formInputs.ownerName || null,
          ownerId: formInputs.ownerId || null,
          status: formInputs.status,
          vehicleId: formInputs.vehicleId,
          registeredBy: formInputs.registeredBy,
        };

        const resultAction = await dispatch(updateVehicleDetails(dataToSend));
        if (updateVehicleDetails.fulfilled.match(resultAction)) {
          navigate("/app/vehicle-management");
          notification.success({
            message: <h5>Vehicle updated successfully!</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5,
          });
        } else if (resultAction.payload?.errors) {
          const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
            const errorLower = error.toLowerCase();
            
            if (errorLower.includes("vin")) {
              acc.vin = error;
            }
            else if (errorLower.includes("color")) {
              acc.color = error;
            }
            else if (errorLower.includes("vehicle registration") ) {
              acc.vehicleRegNumber = error;
            }
            else if (errorLower.includes("year")) {
              acc.year = error;
            }
            // Insurance Renewal Date errors
            else if (errorLower.includes("insurance renewal") ) {
              acc.insuranceRenewalDate = error;
            }
            // Insurance Company errors
            else if (errorLower.includes("insurance company")) {
              acc.insuranceId = error;
            }
            // License Renewal Date errors
            else if (errorLower.includes("license renewal") ) {
              acc.licenseRenewalDate = error;
            }
            // Vehicle Make errors
            else if (errorLower.includes("vehicle make") ) {
              acc.vehicleMakeId = error;
            }
            // Vehicle Model errors
            else if (errorLower.includes("vehicle model") ) {
              acc.vehicleModelId = error;
            }
            // Initial Registration Photos errors
            else if (errorLower.includes("initial registration photos") ) {
              acc.initialRegPhotos = error;
            }
            // Vehicle ID errors
            else if (errorLower.includes("vehicle id") ) {
              acc.vehicleId = error;
            }
            // Owner ID errors
            else if (errorLower.includes("owner id") ) {
              acc.ownerId = error;
            }
            return acc;
          }, {});

          setErrors((prevErrors) => ({
            ...prevErrors,
            ...apiErrors,
          }));

          notification.error({
            message: <h5>Validation failed. Ensure all fields are correct.</h5>,
            icon: <img src={Icons.error} alt="Error" />,
            duration: 5,
          });
        } else {
          setErrorIcon(Icons.error_email);
          setErrorTitle("Failed to update data.");
          setError(resultAction.payload);
          setShowPopup(true);
        }
      } catch (error) {
        setErrorIcon(Icons.error_email);
        setErrorTitle("Failed to update data.");
        setError(error.message);
        setShowPopup(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOwnerChange = (selectedOwner) => {
    if (selectedOwner?.value) {
      
      if (formInputs.ownerId && formInputs.ownerId !== selectedOwner.value) {
        setPendingOwnerChange(selectedOwner);
        setOwnershipChangeModalOpen(true);
      } else {
     
        setFormInputs((prev) => ({
          ...prev,
          ownerId: selectedOwner?.value || "",
          ownerName: selectedOwner?.label || "",
        }));
        setIsFormModified(true);
      }
    }
  };


  const handleConfirmOwnershipChange = () => {
    if (pendingOwnerChange) {
      setFormInputs((prev) => ({
        ...prev,
        ownerId: pendingOwnerChange?.value || "",
        ownerName: pendingOwnerChange?.label || "",
      }));
      setIsFormModified(true);
      setPendingOwnerChange(null);
      setOwnershipChangeModalOpen(false);
    }
  };

  const handleCancelOwnershipChange = () => {
    setPendingOwnerChange(null);
    setOwnershipChangeModalOpen(false);
  };

    const handleAddNewOwner = async (newOwnerData) => {
    try {
      // Just refresh the customer list to include the new owner
      // No auto-selection - user must manually choose if they want to change
      setIsFormModified(true);
      
      await dispatch(fetchAllOwnerName());
      
      return { success: true };
    } catch (error) {
      notification.error({
        message: <h5>Failed to add new owner</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
      return { success: false, error: error.message };
    }
  };
    
  return (
    <>
      <TopProgressBar isLoading={isVehicleIdLoading || isLoading} />
      {isVehicleIdLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="form-container">
            <div className="form-header">
              <div className="back">
                <Link to="/app/vehicle-management" id="back-vehicle-btn">
                  <img src={Icons.arrow_left} alt="Back Icon" />
                </Link>
                <h3>
                  {isEdit
                    ? "Edit Vehicle  - " + (vehicle?.vehicleId || "")
                    : "Add New Vehicle"}
                </h3>
              </div>
            </div>
            <Form className="form vehicle-form" layout="vertical">
              <div className="form-section">
                <h3 className="form-header">Vehicle Information</h3>

                <div className="form-row">
                  <div
                    className={`form-item ${
                      isEdit ? "disabled-form-item" : ""
                    }`}
                  >
                    <CustomGroupSelectDropdown
                      groupedOptions={vehicleMakeOptions}
                      modalDropdownPlaceholderText="Select make category"
                      selectOptions={vehicleMakeCategoryLists}
                      value={formInputs.vehicleMakeId}
                      id="vehicle-make"
                      required={true}
                      disabled={isEdit}
                      onChange={(selectedValue) => {
                        if (isEdit) return;
                        setFormInputs((prev) => ({
                          ...prev,
                          vehicleMakeId: selectedValue || null,
                          vehicleModelId: null,
                        }));
                        setSelectedVehicleMakeIds(
                          selectedValue ? [selectedValue] : []
                        );

                        if (!selectedValue) {
                          setErrors((prev) => ({
                            ...prev,
                            vehicleMakeId: "Vehicle Make field is required",
                            vehicleModelId: "Vehicle Model field is required",
                          }));
                        } else {
                          setErrors((prev) => ({
                            ...prev,
                            vehicleMakeId: "",
                            vehicleModelId: "",
                          }));
                        }
                      }}
                      onAddFormData={handleAddMakeValue}
                      type="make"
                      isMulti={false}
                    />
                    <label
                      className="form-label required"
                      htmlFor="vehicle-make"
                    >
                      <h4>
                        Vehicle Make <span className="text-danger"></span>
                      </h4>
                    </label>
                    {errors.vehicleMakeId && (
                      <div className=" field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.vehicleMakeId}</h6>
                      </div>
                    )}
                  </div>
                  <div
                    className={`form-item required ${
                    (!formInputs.vehicleMakeId || formInputs.vehicleMakeId.length === 0 ||  isEdit)
                    ? "disabled-form-item" : ""
                    }`}
                  >
                    <CustomSubGroupSelectSingle
                      options={vehicleModelOptions}
                      id="vehicle-model"
                      className={`required ${
                        errors["partName"] ? "invalid" : ""
                      }`}
                      selectOptions={vehicleMakeLists}
                      value={formInputs.vehicleModelId}
                      disabled={isEdit || !formInputs.vehicleMakeId || formInputs.vehicleMakeId.length === 0}
                      onChange={(selectedValue) => {
                        if (isEdit) return;
                        setFormInputs((prev) => ({
                          ...prev,
                          vehicleModelId: selectedValue || null,
                        }));

                        if (!selectedValue) {
                          setErrors((prev) => ({
                            ...prev,
                            vehicleModelId: "Vehicle Model field is required",
                          }));
                        } else {
                          setErrors((prev) => ({
                            ...prev,
                            vehicleModelId: "",
                          }));
                        }
                      }}
                      onAddFormData={handleAddModelValue}
                      type="model"
                    />
                    <label
                      className="form-label required"
                      htmlFor="vehicle-model"
                    >
                      <h4>Vehicle Model</h4>
                    </label>
                    {errors.vehicleModelId && (
                      <div className=" field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.vehicleModelId}</h6>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-item">
                    <input
                      type="text"
                      name="vin"
                      id="vin"
                      value={formInputs.vin}
                      onChange={(e) => handleChange(e)}
                      onInput={(e) => {
                        e.target.value = e.target.value.toUpperCase();
                      }}
                      autoComplete="off"
                      className={`required ${errors["vin"] ? "invalid" : ""}`}
                    />
                    <label className="form-label required" htmlFor="vin">
                      <h4>VIN</h4>
                    </label>
                    {errors.vin && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.vin}</h6>
                      </div>
                    )}
                  </div>
                  <div className="form-item">
                    <div className="position-relative datepicker p-0 year-picker">
                      <ReactDatePicker
                        className="year-picker"
                        id="year"
                        name="year"
                        defaultDate={
                          formInputs.year ? new Date(formInputs.year, 0, 1) : ""
                        }
                        yearOnly={true}
                        maxDate={new Date()}
                        onChangeDate={(selectedDate) => {
                          if (
                            !selectedDate ||
                            isNaN(new Date(selectedDate).getTime())
                          ) {
                            setFormInputs((prev) => ({
                              ...prev,
                              year: null,
                            }));

                            setErrors((prev) => ({
                              ...prev,
                              year: "Year field is required",
                            }));
                            return;
                          }

                          const selectedYear = new Date(
                            selectedDate
                          ).getFullYear();
                          setFormInputs((prev) => ({
                            ...prev,
                            year: selectedYear,
                          }));

                          setErrors((prev) => ({
                            ...prev,
                            year: "",
                          }));
                        }}
                      />
                      <img
                        src={Icons.calendar}
                        alt="Calendar Icon"
                        className="input-icon"
                      />
                    </div>

                    <label className="form-label required" htmlFor="year">
                      <h4>Year</h4>
                    </label>
                    {errors.year && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.year}</h6>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-item">
                    <input
                      type="text"
                      name="color"
                      id="color"
                      value={formInputs.color}
                      onChange={(e) => handleChange(e)}
                      autoComplete="off"
                      className={`required ${errors["color"] ? "invalid" : ""}`}
                    />
                    <label className="form-label required" htmlFor="color">
                      <h4>Color</h4>
                    </label>
                    {errors.color && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.color}</h6>
                      </div>
                    )}
                  </div>
                  <div className="form-item">
                    <input
                      type="text"
                      name="vehicleRegNumber"
                      id="vehicle-reg-number"
                      value={formInputs.vehicleRegNumber}
                      onChange={(e) => handleChange(e)}
                      autoComplete="off"
                      className={`required ${
                        errors["vehicleRegNumber"] ? "invalid" : ""
                      }`}
                    />
                    <label
                      className="form-label required"
                      htmlFor="vehicle-reg-number"
                    >
                      <h4>Vehicle Registration No</h4>
                    </label>
                    {errors.vehicleRegNumber && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.vehicleRegNumber}</h6>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-item ">
                    <div className="position-relative datepicker p-0">
                      <ReactDatePicker
                        id="insurance-renewal-date"
                        name="insuranceRenewalDate"
                        defaultDate={formInputs.insuranceRenewalDate ?? ""}
                        minDate={new Date()}
                        onChangeDate={(selectedDate) => {
                          if (
                            !selectedDate ||
                            isNaN(new Date(selectedDate).getTime())
                          ) {
                            setFormInputs((prev) => ({
                              ...prev,
                              insuranceRenewalDate: null,
                            }));
                            setErrors((prev) => ({
                              ...prev,
                              insuranceRenewalDate:
                                "Insurance Renewal Date field is required",
                            }));
                            return;
                          }

                          setFormInputs((prev) => ({
                            ...prev,
                            insuranceRenewalDate: format(
                              selectedDate,
                              dateFormat.API_NATIVE
                            ),
                          }));

                          setErrors((prev) => ({
                            ...prev,
                            insuranceRenewalDate: "",
                          }));
                        }}
                      />
                      <img
                        src={Icons.calendar}
                        alt="Calendar Icon"
                        className="input-icon"
                      />
                    </div>
                    <label
                      className="form-label required "
                      htmlFor="insurance-renewal-date"
                    >
                      <h4>Insurance Renewal Date</h4>
                    </label>
                    {errors.insuranceRenewalDate && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.insuranceRenewalDate}</h6>
                      </div>
                    )}
                  </div>
                  <div className={`form-item`}>
                    <GroupRadioSelect
                      options={insuranceNames}
                      modalTitle="Add a Insurance Company"
                      formFieldLabel="Insurance Company"
                      formPlaceholderText="Enter insurance company"
                      buttonText="Add Insurance Company"
                      name="insuranceId"
                      value={formInputs.insuranceId}
                      isValid={errors["insuranceId"] ? "invalid" : ""}
                      required
                      id="insurance-company"
                      onAddFormData={handleAddInsuranceCompany}
                      onChange={(selectedValue) => {
                        setFormInputs((prev) => ({
                          ...prev,
                          insuranceId: selectedValue.value || "",
                        }));

                        if (!selectedValue.value) {
                          setErrors((prev) => ({
                            ...prev,
                            insuranceId: "Insurance Company field is required",
                          }));
                        } else {
                          setErrors((prev) => ({
                            ...prev,
                            insuranceId: "",
                          }));
                        }
                      }}
                    />
                    <label className="form-label" htmlFor="insuranceName">
                      <h4>Insurance Company</h4>
                    </label>
                    {errors.insuranceId && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.insuranceId}</h6>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-item single">
                    <div className="position-relative datepicker p-0">
                      <ReactDatePicker
                        id="license-renewal-date"
                        name="licenseRenewalDate"
                        defaultDate={formInputs.licenseRenewalDate ?? ""}
                        minDate={new Date()}
                        onChangeDate={(selectedDate) => {
                          if (
                            !selectedDate ||
                            isNaN(new Date(selectedDate).getTime())
                          ) {
                            setFormInputs((prev) => ({
                              ...prev,
                              licenseRenewalDate: null,
                            }));

                            setErrors((prev) => ({
                              ...prev,
                              licenseRenewalDate:
                                "License Renewal Date field is required",
                            }));
                            return;
                          }

                          setFormInputs((prev) => ({
                            ...prev,
                            licenseRenewalDate: format(
                              selectedDate,
                              dateFormat.API_NATIVE
                            ),
                          }));

                          setErrors((prev) => ({
                            ...prev,
                            licenseRenewalDate: "",
                          }));
                        }}
                      />
                      <img
                        src={Icons.calendar}
                        alt="Calendar Icon"
                        className="input-icon"
                      />
                    </div>
                    <label
                      className="form-label required"
                      htmlFor="license-renewal-date"
                    >
                      <h4>License Renewal Date</h4>
                    </label>
                    {errors.licenseRenewalDate && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.licenseRenewalDate}</h6>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-section">
               
                <div className="form-row">
                  <div className="form-item full-width">
                    <div className="job-detail-container">
                      <div className="spare-info">
                        <div className="image-upload-job vehicle-management-image view-image-job" id="initial-registration-photo-field">
                          <div className="images-preview vehicle-management-images">
                            <h5 className="detail-label image-detail-label">
                              Initial Registration Photo
                            </h5>

                            {(!formInputs.initialRegPhotos || formInputs.initialRegPhotos.length === 0) && (
                              <h4
                                className="detail-value download" 
                                onClick={() => setOpenUploadPopup(true)}
                                style={{ cursor: 'pointer', marginBottom: '0px' }}
                              >
                                Upload Images
                                <img
                                  className="arrow-right"
                                  src={Icons.arrow_right}
                                  alt="download"
                                />
                              </h4>
                            )}
                            
                          </div>
                          {formInputs.initialRegPhotos &&
                            formInputs.initialRegPhotos.length > 0 && (
                              <div className="form-row form-footer my-0 vehicle-image-upload view-job-images-container" id="initial-registration-photo-upload">
                                <div className="upload-containers"style={{marginTop:"8px"}}>
                                  <div className="SwiperSlideComponent" >
                                  <BaseJob64ImageSlider
                                    paths={formInputs.initialRegPhotos?.map(img => 
                                      typeof img === 'string' ? img : (img?.path || img)
                                    ) || []}
                                    desktopImagesPerPage={4}
                                    id="initial-registration-photo-slider"
                                    onImageClick={(url, meta) => {
                                      try {
                                        // Get the actual image paths array
                                        const imagePaths = formInputs.initialRegPhotos?.map(img => 
                                          typeof img === 'string' ? img : (img?.path || img)
                                        ) || [];
                                        
                                        window.dispatchEvent(new CustomEvent('openCurrentWorkStartPicture', { 
                                          detail: { 
                                            index: meta?.index ?? 0,
                                            images: imagePaths
                                          } 
                                        }));
                                      } catch (error) {
                                        console.error('Error dispatching image preview event:', error);
                                      }
                                      setCurrentImagePreview(true);
                                    }}
                                  />
                                  </div>
                                </div>
                              </div>
                            )}
                          {errors.initialRegPhotos && (
                            <div className="field-error">
                              <img
                                src={Icons.warning_circle}
                                alt="Warning Icon"
                              />
                              <h6>{errors.initialRegPhotos}</h6>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isEdit && (
                <div className="form-section">
                  <h3 className="form-header admin-service">
                    Vehicle Owner Information
                  </h3>
                  <div className="form-row">
                    <div className="form-item">
                      <label className="form-label" htmlFor="owner-name">
                        <h4>Owner Name</h4>
                      </label>
                      <OwnerSelect
                        options={customerNames}
                        placeholderText="Select owner"
                        value={
                          selectedOwner
                            ? {
                                label: selectedOwner.clientName,
                                value: selectedOwner.id,
                              }
                            : null
                        }
                        onChange={handleOwnerChange}
                        onAddFormData={handleAddNewOwner}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-section">
                <h3 className="info-header">Additional Information</h3>
                <div className="form-row">
                  <div className="form-item disabled-form-item">
                    <input
                      type="text"
                      name="vehicleId"
                      id="vehicleId"
                      value={isEdit ? formInputs.vehicleId : vehicleId}
                      disabled
                      onChange={(e) => handleChange(e)}
                    />
                    <label className="form-label" htmlFor="vehicleId">
                      <h4>Vehicle ID</h4>
                    </label>
                    {errors.vehicleId && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.vehicleId}</h6>
                      </div>
                    )}
                  </div>
                  <div className="form-item disabled-form-item">
                    <input
                      type="text"
                      name="createdDate"
                      id="vehicle-added-date"
                      value={formInputs.addedDate}
                      disabled
                    />
                    <label className="form-label" htmlFor="vehicle-added-date">
                      <h4>Created Date</h4>
                    </label>
                    {errors.createdDate && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.createdDate}</h6>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-item disabled-form-item single">
                    <input
                      type="text"
                      name="addedBy"
                      id="vehicle-added-by"
                      value={formInputs.registeredBy || `${firstName} ${lastName}`}
                      disabled
                    />
                    <label className="form-label" htmlFor="vehicle-added-by">
                      <h4>Registered By</h4>
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-footer">
                <button
                  type="submit"
                  className="button button-submit"
                  onClick={isEdit ? onUpdate : onSubmit}
                  disabled={isLoading}
                  id='save-vehicle-btn'
                >
                  <h5>
                    {isLoading
                      ? "Saving... Please wait."
                      : isEdit
                      ? "Update"
                      : "Save"}
                  </h5>
                </button>
                <button
                  type="button"
                  className="button button-cancel"
                  onClick={handleCancelClick}
                  id='cancel-vehicle-btn'
                >
                  <h5>Cancel</h5>
                </button>
              </div>
            </Form>
            {showPopup && (
              <>
                <div className="overlay"></div>
                <div className="error-popup">
                  <div className="error-popup-content">
                    <span className="close-icon" onClick={closePopup}></span>
                    <img src={errorIcon} alt="error" className="error-icon" />
                    <h2>{errorTitle}</h2>
                    {errorTitle !== error ? <p>{error}</p> : <p></p>}
                    <button onClick={closePopup}>Retry</button>
                  </div>
                </div>
              </>
            )}
          </div>
          <CarPopupDialog
            visible={openImagePreview}
            setVisible={setOpenImagePreview}
          />
<CurrentWorkStartPicturePopUp
  visible={currentImagePreview}
  setVisible={setCurrentImagePreview}
  imagePaths={formInputs.initialRegPhotos || []}
  title="Initial Registration Photos"
/>
<CurrentWorkStartPictureUploadPopUp
  visible={openUploadPopup}
  setVisible={setOpenUploadPopup}
  title="Initial Registration Photo"
  vehicleId={formInputs.vehicleId || vehicleId}
  onSave={async (imagePaths) => {
    if (imagePaths && Array.isArray(imagePaths) && imagePaths.length > 0) {
      // For vehicle management, imagePaths is an array of paths directly
      setFormInputs((prev) => ({
        ...prev,
        initialRegPhotos: imagePaths,
      }));

      setErrors((prev) => ({
        ...prev,
        initialRegPhotos: "",
      }));

      setIsFormModified(true);
    }
  }}
/>
          {showCancelPopup && (
            <CancelModal
              onClickConfirmModel={handleConfirmCancel}
              onClickCancelModel={handleCancelCancel}
            />
          )}
          <ConfirmationModal
            isOpen={ownershipChangeModalOpen}
            onClickConfirmModel={handleConfirmOwnershipChange}
            onClickCancelModel={handleCancelOwnershipChange}
            yesText="Yes, Change"
            noText="No"
            title="Confirm Ownership Change"
            subTitle="Are you sure you want to change the vehicle owner?"
          />
        </>
      )}
    </>
  );
};

export default vehicleForm;
