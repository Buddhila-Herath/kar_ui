import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, notification } from "antd";
import Icons from "../../../utils/icons";
import TelephoneInput from "../../../shared/phoneInput/TelephoneInput";
import CustomRadioSelect from "../../../shared/select/CustomRadioSelect";
import FormMultipleSelect from "../../../shared/select/FormMultipleSelect";
import UploadComponent from "../../../shared/upload/UploadComponent";
import CreateSuccessModal from "./CreateSuccessModal";
import CancelModal from "../../../shared/components/CancelModal";
import {
  fetchAllBusinessTypes,
} from "../../../slices/masterDataSlice";
import { fetchAllCity } from "../../../slices/locationDataSlice";
import { Tokens } from "../../../constants";
import {
  addVendorDetails,
  uploadImage,
  generatePrimaryId,
  updateVendorDetails,
  deleteVendorDocument
} from "../../../slices/vendorSlice";
import { dateFormat } from '../../../constants';
import { format, parse } from "date-fns";
import { loadImageForDisplay } from "../../../utils/imageUtils";

const VendorForm = ({ vendor = {}, isEdit = false, sId = 0 }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allBusinessTypes } = useSelector(
    (state) => state.masterData
  );
  const { allCityList } = useSelector(
    (state) => state.locations);

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    emailAddress: "",
    nic: "",
    uploadNicFrontPath: "",
    uploadNicBackPath: "",
    profilePath: "",
    registeredBy: "",
    status: "",
    userName: "",
    password: "",
    personalContactNumber: "",
    businessName: "",
    businessEmailAddress: "",
    businessAddressLine1: "",
    businessAddressLine2: "",
    registrationNumber: "",
    businessContactNumber: "",
    docUploadPath: "",
    username: "",
    vendorId: "",
    city: "",
    postalCode: "",
    districtName: "",
    provinceName: "",
    website: "",
    businessLogo: "",
    businessTypes: "",
  });

  const generateStrongPassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*()_+";
    const allChars = uppercase + lowercase + numbers + specialChars;

    let password =
      uppercase[Math.floor(Math.random() * uppercase.length)] +
      lowercase[Math.floor(Math.random() * lowercase.length)] +
      numbers[Math.floor(Math.random() * numbers.length)] +
      specialChars[Math.floor(Math.random() * specialChars.length)];

    const remainingLength = Math.floor(Math.random() * 15) + 2;

    password += Array.from(
      { length: remainingLength },
      () => allChars[Math.floor(Math.random() * allChars.length)]
    ).join("");

    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const [password, setPassword] = useState(generateStrongPassword());
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorIcon, setErrorIcon] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const firstName = localStorage.getItem(Tokens.FIRST_NAME);
  const lastName = localStorage.getItem(Tokens.LAST_NAME);
  const email = localStorage.getItem(Tokens.EMAIL);
  const [isFormModified, setIsFormModified] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadErrorDescription, setUploadErrorDescription] = useState("");
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const { primaryId } = useSelector((state) => state.vendors);

  const [imgLoading, setImgLoading] = useState({
    vendorFeNic: false,
    vendorBeNic: false,
    vendorProfile: false,
    businessLogo: false,
  });
  const [editImgPreviews, setEditImgPreviews] = useState({
    feNic: null,
    beNic: null,
    vendorProfile: null,
    businessLogo: null,
    docUploadPath: null
  });
  const [file, setFile] = useState(null);
  const [isImgLoading, setIsImgLoading] = useState({
    businessLogo: false,
    vendorAttachment: false,
  });
  const [districtName, setDistrictName] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    dispatch(fetchAllCity());
    dispatch(fetchAllBusinessTypes());
  }, [dispatch]);


  const [formInputs, setFormInputs] = useState({
    firstName: "",
    lastName: "",
    personalContactNumber: "",
    emailAddress: "",
    nic: "",
    uploadNicFrontPath: "",
    uploadNicBackPath: "",
    profilePhotoPath: null,
    docUploadPath: null,
    businessLogoPath: null,
    businessName: "",
    businessContactNumber: "",
    businessAddressLine1: "",
    businessAddressLine2: null,
    city: "",
    country: "22ac3753-b877-11ef-af09-0e26aba8ece7",
    registrationNumber: "",
    businessEmailAddress: "",
    website: null,
    businessTypes: [],
    joinedDate: format(new Date(), dateFormat.API_NATIVE),
    status: true,
    registeredBy: email,
    username: "",
    password: password,
  });


  useEffect(() => {
    if (isEdit && vendor) {
      setFormInputs({
        id: sId,
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        personalContactNumber: vendor.mobileNumber,
        emailAddress: vendor.emailAddress,
        nic: vendor.nic,
        uploadNicFrontPath: vendor.nicFrontPath || null,
        uploadNicBackPath: vendor.nicBackPath || null,
        profilePhotoPath: vendor.profilePhotoPath || null,
        docUploadPath: vendor.docUploadPath || null,
        businessLogoPath: vendor.businessLogoPath || null,
        businessName: vendor.businessName,
        businessContactNumber: vendor.businessTelephone,
        businessAddressLine1: vendor.businessAddressLine1,
        businessAddressLine2: vendor.businessAddressLine2 || null,
        city: vendor.cityOrTownId,
        district: vendor.district,
        postalCode: vendor.postalCode,
        province: vendor.province,
        country: "22ac3753-b877-11ef-af09-0e26aba8ece7",
        registrationNumber: vendor.registrationNumber,
        businessEmailAddress: vendor.businessEmail,
        website: vendor.website || null,
        businessTypes: vendor.businessRateTypeId || [],
        joinedDate: vendor.joinDate,
        status: vendor.status,
        registeredBy: vendor.registeredBy,
        username: vendor.userName,
        vendorId: vendor.vendorId || primaryId || "",
      });

      const loadEditImages = async () => {
      const previews = {
        feNic: null,
        beNic: null,
        vendorProfile: null,
        businessLogo: null
      };

      if (vendor.nicFrontPath) {
        const url = await loadImageForDisplay(vendor.nicFrontPath, dispatch, (url) => {
          previews.feNic = url;
        });
        previews.feNic = url;
      }

      if (vendor.nicBackPath) {
        const url = await loadImageForDisplay(vendor.nicBackPath, dispatch, (url) => {
          previews.beNic = url;
        });
        previews.beNic = url;
      }

      if (vendor.profilePhotoPath) {
        const url = await loadImageForDisplay(vendor.profilePhotoPath, dispatch, (url) => {
          previews.vendorProfile = url;
        });
        previews.vendorProfile = url;
      }

      if (vendor.businessLogoPath) {
        const url = await loadImageForDisplay(vendor.businessLogoPath, dispatch, (url) => {
          previews.businessLogo = url;
        });
        previews.businessLogo = url;
      }

      setEditImgPreviews(previews);
    };

    loadEditImages();
  }
}, [isEdit, vendor, dispatch]);

  const allCitiesOptions = allCityList.map((city) => ({
    label: city.cityName,
    value: city.id,
  }));

  const bisinessTypeOptions = allBusinessTypes.map((type) => ({
    label: type.businessName,
    value: type.id,
  }));

  useEffect(() => {
    dispatch(generatePrimaryId());
  }, [dispatch]);

  const isValidSriLankaNIC = (nic) => {
    const oldNICPattern = /^[0-9]{9}[VXvx]$/; // 9 digits + "V" or "X"
    const newNICPattern = /^[0-9]{12}$/; // 12 digits only
    return oldNICPattern.test(nic) || newNICPattern.test(nic);
  };

  const validateField = (name, value) => {
    const sriLankaPhoneRegex = /^\+94\s\d{2}\s\d{3}\s\d{4}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (name) {
      case "firstName":
        if (!value) return "First Name field is required";
        if (!/^[A-Za-z]+$/.test(value)) return "First name must contain only letters";
        if (value.length > 30) return "Enter a value that doesn't exceed 30 characters";
        return "";

      case "lastName":
        if (!value) return "Last Name field is required";
        if (!/^[A-Za-z]+$/.test(value)) return "Last name must contain only letters";
        if (value.length > 30) return "Enter a value that doesn't exceed 30 characters";
        return "";

      case "personalContactNumber":
        if (!value) return "Contact Number field is required";
        if (!sriLankaPhoneRegex.test(value)) return "Must be a valid Contact Number";
        return "";

      case "businessContactNumber":
        if (!value) return "Contact Number field is required";
        if (!sriLankaPhoneRegex.test(value)) return "Must be a valid Contact Number";
        return "";

      case "emailAddress":
        if (!value) return "Email Address field is required";
        if (!emailRegex.test(value)) return "Enter a valid email address";
        if (value.length > 100) return "Enter a value that doesn't exceed 100 characters";
        return "";

      case "businessEmailAddress":
        if (!value) return "Business Email Address field is required";
        if (!emailRegex.test(value)) return "Enter a valid email address";
        if (value.length > 100) return "Enter a value that doesn't exceed 100 characters";
        return "";

      case "nic":
        if (!value) return "NIC field is required";
        if (!isValidSriLankaNIC(value)) return "Invalid Sri Lankan NIC format";
        return "";

      case "businessName":
        if (!value) return "Business Name field is required";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Business Name must contain only letters";
        if (value.length > 30) return "Business Name must not exceed 30 characters";
        return "";

      case "businessAddressLine1":
        if (!value) return "Business Address Line 1 is required";
        if (value.length > 60) return "Business Address Line 1 must not exceed 60 characters";
        return "";

      case "businessAddressLine2":
        if (value.length > 60) return "Business Address Line 2 must not exceed 60 characters";
        return "";

      case "username":
        if (!value) return "Username field is required";
        if (!/^[a-zA-Z0-9]+$/.test(value)) return "Username must contain only letters and numbers";
        if (value.length > 30) return "Username must not exceed 30 characters";
        return "";

      case "registrationNumber":
        if (!value) return "Registration Number field is required";
        if (value.length > 20) return "Registration Number must not exceed 20 characters";
        return "";

      case "website":
        if (value && !/^https?:\/\/.+/.test(value)) {
          return "Website URL must start with http:// or https://";
        }
        if (value && value.length > 300) {
          return "Website URL must not exceed 300 characters";
        }
        return "";

      case "docUploadPath":
        if (!value) {
          return "Registration Document field is required";
        }
        return "";

      case "businessTypes":
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return "Business Type field is required";
        }
        return "";

      default:
        return "";
    }
  };

  const handleValidation = () => {
    let formErrors = {};
    let isValid = true;

    // Validate all required fields
    const fieldsToValidate = [
      "firstName",
      "lastName",
      "personalContactNumber",
      "businessContactNumber",
      "emailAddress",
      "businessEmailAddress",
      "nic",
      "businessName",
      "businessAddressLine1",
      "username",
      "registrationNumber",
      "city",
      "postalCode",
      "districtName",
      "provinceName",
      "businessTypes",
      "docUploadPath"
    ];

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formInputs[field]);
      if (error) {
        formErrors[field] = error;
        isValid = false;
      }
    });

    // Validate file uploads
    if (!formInputs.uploadNicFrontPath) {
      formErrors.uploadNicFrontPath = "NIC Front Side is required";
      isValid = false;
    }

    if (!formInputs.uploadNicBackPath) {
      formErrors.uploadNicBackPath = "NIC Back Side is required";
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

 const previewToStateKey = {
  feNic: "uploadNicFrontPath",
  beNic: "uploadNicBackPath",
  vendorProfile: "profilePhotoPath",
  businessLogo: "businessLogoPath",
  docUploadPath: "docUploadPath"
};

const handleRemoveFilePreview = (previewKey) => {
  setEditImgPreviews((prev) => ({
    ...prev,
    [previewKey]: null,
  }));
  const stateKey = previewToStateKey[previewKey];
  if (stateKey) {
    setFormInputs((prev) => ({
      ...prev,
      [stateKey]: null,
    }));
  }
};

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };

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

  const onUpdate = async (e) => {
    e.preventDefault();
    setErrors({});

    const valid = handleValidation();
    if (valid) {
      setIsLoading(true);
      try {
         const fileFields = [
        { key: "uploadNicFrontPath", apiType: "feNic" },
        { key: "uploadNicBackPath", apiType: "beNic" },
        { key: "profilePhotoPath", apiType: "profile" },
        { key: "businessLogoPath", apiType: "businessLogo" },
        { key: "docUploadPath", apiType: "document" }
          ];

        for (const { key, apiType } of fileFields) {
        if (vendor[key] && !formInputs[key]) {
            console.log(
            "Triggering deleteVendorDocument for:",
            key,
            "API type:",
            apiType,
            "vendor value:",
            vendor[key],
            "formInputs value:",
            formInputs[key]
          );
          await dispatch(deleteVendorDocument({ vendorId: formInputs.vendorId, type: apiType }));
        }
      }
        const dataToSend = {
          id: formInputs.id,
          firstName: formInputs.firstName,
          lastName: formInputs.lastName,
          emailAddress: formInputs.emailAddress,
          mobileNumber: formInputs.personalContactNumber,
          nic: formInputs.nic,
          uploadNicFrontPath: formInputs.uploadNicFrontPath,
          uploadNicBackPath: formInputs.uploadNicBackPath,
          profilePhotoPath: formInputs.profilePhotoPath,
          uploadDocumentPath: formInputs.docUploadPath||null,
          businessLogoPath: formInputs.businessLogoPath,
          businessName: formInputs.businessName,
          telephoneNumber: formInputs.businessContactNumber,
          businessAddressLine1: formInputs.businessAddressLine1,
          businessAddressLine2: formInputs.businessAddressLine2,
          city: formInputs.city,
          country: formInputs.country,
          registrationNumber: formInputs.registrationNumber,
          businessEmail: formInputs.businessEmailAddress,
          website: formInputs.website,
          businessTypes: formInputs.businessTypes,
          joinedDate: formInputs.joinedDate,
          status: formInputs.status,
          username: formInputs.username,
        };
        const resultAction = await dispatch(updateVendorDetails(dataToSend));

        if (updateVendorDetails.fulfilled.match(resultAction)) {
          notification.success({
            message: <h5>Updated Successfully!</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5,
          });
          navigate("/admin/vendor-management");
        } else if (resultAction.payload?.errors) {
          const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
            const lower = error.toLowerCase();

            if (lower.includes("First name") || lower.includes("firstname")) acc.firstName = error;
            if (lower.includes("Last name") || lower.includes("lastname")) acc.lastName = error;
            if (lower.includes("personal contact") || lower.includes("contact number") || lower.includes("contactnumber") || lower.includes("phone") || lower.includes("mobile") || (lower.includes("personal") && lower.includes("contact"))) acc.personalContactNumber = error;
            if (lower.includes("email")) acc.emailAddress = error;
            if (lower.includes("NIC") || lower.includes("nic already exists") || lower.includes("nic")) acc.nic = error;
            if (lower.includes("front")) acc.uploadNicFrontPath = error;
            if (lower.includes("back")) acc.uploadNicBackPath = error;
            if (lower.includes("profile")) acc.profilePath = error;
            if (lower.includes("doc")) acc.docUploadPath = error;
            if (lower.includes("logo")) acc.businessLogoPath = error;
            if (lower.includes("business name")) acc.businessName = error;
            if (lower.includes("business contact") || (lower.includes("business") && (lower.includes("contact") || lower.includes("phone") || lower.includes("mobile")))) acc.businessContactNumber = error;
            if (lower.includes("Address line 1")) acc.businessAddressLine1 = error;
            if (lower.includes("Address line 2")) acc.businessAddressLine2 = error;
            if (lower.includes("city")) acc.city = error;
            if (lower.includes("country")) acc.country = error;
            if (lower.includes("registration number")) acc.registrationNumber = error;
            if (lower.includes("business email")) acc.businessEmailAddress = error;
            if (lower.includes("website")) acc.website = error;
            if (lower.includes("business type")) acc.businessTypes = error;
            if (lower.includes("status")) acc.status = error;
            if (lower.includes("registered by")) acc.registeredBy = error;
            if (lower.includes("username") || lower.includes("user name")) acc.username = error;
            if (lower.includes("Password")) acc.password = error;
            if (lower.includes("district")) acc.districtName = error;
            if (lower.includes("province")) acc.provinceName = error;
            if (lower.includes("Joined Data")) acc.provinceName = error;
            if (lower.includes("User name")) acc.username = error;

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
          setErrorTitle("Failed to save vendor.");
          setError(resultAction.payload);
          setShowPopup(true);
        }

      } catch (error) {
        setErrorIcon(Icons.error_email);
        setErrorTitle("Failed to save vendor.");
        setError(error.message);
        setShowPopup(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const valid = handleValidation();
    if (valid) {
      setIsLoading(true);
      try {
        const resultAction = await dispatch(addVendorDetails(formInputs));

        if (addVendorDetails.fulfilled.match(resultAction)) {
          setIsSuccessModalVisible(true);
        } else if (resultAction.payload?.errors) {
          const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
            const lower = error.toLowerCase();

            if (lower.includes("First name") || lower.includes("firstname")) acc.firstName = error;
            if (lower.includes("Last name") || lower.includes("lastname")) acc.lastName = error;
            if (lower.includes("personal contact") || lower.includes("contact number") || lower.includes("contactnumber") || lower.includes("phone") || lower.includes("mobile") || (lower.includes("personal") && lower.includes("contact"))) acc.personalContactNumber = error;
            if (lower.includes("email")) acc.emailAddress = error;
            if (lower.includes("NIC") || lower.includes("nic already exists") || lower.includes("nic")) acc.nic = error;
            if (lower.includes("front")) acc.uploadNicFrontPath = error;
            if (lower.includes("back")) acc.uploadNicBackPath = error;
            if (lower.includes("profile")) acc.profilePath = error;
            if (lower.includes("doc")) acc.docUploadPath = error;
            if (lower.includes("logo")) acc.businessLogoPath = error;
            if (lower.includes("business name")) acc.businessName = error;
            if (lower.includes("business contact") || (lower.includes("business") && (lower.includes("contact") || lower.includes("phone") || lower.includes("mobile")))) acc.businessContactNumber = error;
            if (lower.includes("Address line 1")) acc.businessAddressLine1 = error;
            if (lower.includes("Address line 2")) acc.businessAddressLine2 = error;
            if (lower.includes("city")) acc.city = error;
            if (lower.includes("country")) acc.country = error;
            if (lower.includes("registration number")) acc.registrationNumber = error;
            if (lower.includes("business email")) acc.businessEmailAddress = error;
            if (lower.includes("website")) acc.website = error;
            if (lower.includes("business type")) acc.businessTypes = error;
            if (lower.includes("status")) acc.status = error;
            if (lower.includes("registered by")) acc.registeredBy = error;
            if (lower.includes("username") || lower.includes("user name")) acc.username = error;
            if (lower.includes("Password")) acc.password = error;
            if (lower.includes("district")) acc.districtName = error;
            if (lower.includes("province")) acc.provinceName = error;
            if (lower.includes("Joined Data")) acc.provinceName = error;
            if (lower.includes("User name")) acc.username = error;

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
          setErrorTitle("Failed to save vendor.");
          setError(resultAction.payload);
          setShowPopup(true);
        }

      } catch (error) {
        setErrorIcon(Icons.error_email);
        setErrorTitle("Failed to save vendor.");
        setError(error.message);
        setShowPopup(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTechnicianImageUpload = async (selectedFile, type) => {
    if (!selectedFile) return;
    
    setUploadError("");
    setUploadErrorDescription("");

    setImgLoading((prev) => ({ ...prev, [type]: true }));

    setIsImgLoading((prev) => ({ ...prev, [type]: true }))

    const formData = new FormData();
    formData.append("files", selectedFile);
    const vendorId = isEdit ? formInputs.vendorId : primaryId;

    try {
      const result = await dispatch(
        uploadImage({ formData, vendorId, type })
      ).unwrap();
      if (result) {
        if (type === "vendorProfile") {
          setFormInputs((prevState) => ({
            ...prevState,
            profilePhotoPath: result,
          }));
          setErrors((prev) => ({
            ...prev,
            profilePhotoPath: "",
          }));
        } else if (type === "vendorFeNic") {
          setFormInputs((prevState) => ({
            ...prevState,
            uploadNicFrontPath: result,
          }));
          setErrors((prev) => ({
            ...prev,
            uploadNicFrontPath: "",
          }));
        } else if (type === "vendorBeNic") {
          setFormInputs((prevState) => ({
            ...prevState,
            uploadNicBackPath: result,
          }));
          setErrors((prev) => ({
            ...prev,
            uploadNicBackPath: "",
          }));
        } else if (type === "businessLogo") {
          setFormInputs((prevState) => ({
            ...prevState,
            businessLogoPath: result,
          }));
          setErrors((prev) => ({
            ...prev,
            businessLogoPath: "",
          }));
        } else if (type === "vendorAttachment") {
          setFormInputs((prevState) => ({
            ...prevState,
            docUploadPath: result,
          }));
          setErrors((prev) => ({
            ...prev,
            docUploadPath: "",
          }));
        }
        return result;
      }
    } catch (error) {
      const errorDetails =
        (error.errors && error.errors.join(", ")) ||
        "An unknown error occurred.";

      setUploadError("Upload failed");
      setUploadErrorDescription(errorDetails);
    } finally {
      setImgLoading((prev) => ({ ...prev, [type]: false }));
      // 
      setIsImgLoading((prev) => ({ ...prev, [type]: false }))
    }
    return null;
  };

  const handleRemoveExistingChecklistFile = (fileId) => {
    setFormInputs((prevState) => ({
      ...prevState,
      serviceChecklistDtos: prevState.serviceChecklistDtos.filter(
        (file) => file.serviceCheckListId !== fileId
      ),
    }));

    setUploadedFiles((prevFiles) =>
      prevFiles.filter((file) => file.serviceCheckListId !== fileId)
    );
  };

  const handleStartDateCallback = (date) => {
    setStartDate((previousState) => {
      return { ...previousState, start_date: date };
    });
  };

  // Modify the handleChange function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsFormModified(true);
    setFormInputs((prev) => ({
      ...prev,
      [name]: (name === 'website' || name === 'businessAddressLine2') && value === '' ? null : value,
    }));

    // Real-time validation for all fields
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };

  // Modify handlePhoneChange for telephone inputs
  const handlePhoneChange = (value, field) => {
    setFormInputs((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Real-time validation for phone numbers
    const error = validateField(field, value);
    setErrors((prev) => ({
      ...prev,
      [field]: error
    }));
  };

  // Modify handleStatusChange for status radio
  const handleStatusChange = (e) => {
    const value = e.target.value === "true";
    setFormInputs((prev) => ({
      ...prev,
      status: value,
    }));

    // Clear status error if selection is made
    setErrors((prev) => ({
      ...prev,
      status: ""
    }));
  };

  // Add this function to remove a file path from formInputs
  const handleRemoveFileFromState = (field) => {
    setFormInputs((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  return (
    <>
      <div className="form-container admin-vendor-form">
        <div className="form-header">
          <div className="back">
            <Link to="/admin/vendor-management">
              <img src={Icons.arrow_left} alt="Back Icon" />
            </Link>
            <h3>{isEdit ? "Edit Vendor" : "Add New Vendor"}</h3>
          </div>
        </div>
        <Form className="form" layout="vertical" onSubmit={onSubmit}>
          <div className="personal-info">
            <h3 className="info-header">Personal Information</h3>
            <div className="form-row">
              <div className="form-item">
                <input
                  type="text"
                  name="firstName"
                  id="first-name"
                  required
                  value={formInputs.firstName}
                  onChange={handleChange}
                  autoComplete="off"
                  className={errors["firstName"] ? "invalid" : ""}
                />
                <label className="form-label" htmlFor="first-name">
                  <h4>First Name</h4>
                </label>
                {errors.firstName && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.firstName}</h6>
                  </div>
                )}
              </div>
              <div className="form-item">
                <input
                  type="text"
                  name="lastName"
                  id="last-name"
                  required
                  autoComplete="off"
                  value={formInputs.lastName}
                  onChange={handleChange}
                  className={errors["lastName"] ? "invalid" : ""}
                />
                <label className="form-label" htmlFor="last-name">
                  <h4>Last Name</h4>
                </label>
                {errors.lastName && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.lastName}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-item">
                <div className="input-wrapper required">
                  <TelephoneInput
                    inputName="personalContactNumber"
                    value={formInputs.personalContactNumber}
                    autoComplete="off"
                    onChange={(val) =>
                      handlePhoneChange(val, "personalContactNumber")
                    }
                    required
                    className={errors["personalContactNumber"] ? "invalid" : ""}
                  />
                </div>
                <label className="form-label" htmlFor="mobile-number">
                  <h4>Contact Number</h4>
                </label>
                {errors.personalContactNumber && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.personalContactNumber}</h6>
                  </div>
                )}
              </div>
              <div className="form-item">
                <input
                  type="email"
                  name="emailAddress"
                  id="email"
                  required
                  autoComplete="off"
                  value={formInputs.emailAddress}
                  className={errors["emailAddress"] ? "invalid" : ""}
                  onChange={handleChange}
                />
                <label className="form-label" htmlFor="email">
                  <h4>Email Address</h4>
                </label>
                {errors.emailAddress && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.emailAddress}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row ">
              <div className="form-item">
                <input
                  type="text"
                  name="nic"
                  id="nic"
                  required
                  autoComplete="off"
                  value={formInputs.nic}
                  className={errors["nic"] ? "invalid" : ""}
                  onChange={handleChange}
                />
                <label className="form-label" htmlFor="nic">
                  <h4>NIC</h4>
                </label>
                {errors.nic && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.nic}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className=" ">
              <div className="vendor-item">
                <div className="form-item vendor-row">
                  <UploadComponent
                    title="NIC Front Side"
                    linkText="Click to upload"
                    text="or drag & drop"
                    textTwo="your image here"
                    mobileText="your image here"
                    subText="PNG, JPG and JPEG, up to 15MB"
                    buttonText="Upload"
                    inputId="nic-front"
                    required={true}
                    multiple={false}
                    maxFileSize="15MB"
                    allowedFileSize={15 * 1024 * 1024}
                    fileFormat="png, jpg, jpeg"
                    allowedFileTypes={["image/png", "image/jpeg", "image/jpg"]}
                    onFileChange={async (files) => {
                      if (files.length > 0) {
                        setFile(files);
                        await handleTechnicianImageUpload(
                          files[0],
                          "vendorFeNic"
                        );
                      } else {
                        setFile(null);
                      }
                    }}
                    uploadError={uploadError}
                    uploadErrorDescription={uploadErrorDescription}
                    onCancelClick={() => navigate("/admin/vendor-management")}
                    isLoading={imgLoading.vendorFeNic}
                    editImgPreview={editImgPreviews.feNic}
                    onRemoveFile={() => {
                      handleRemoveFilePreview("feNic");
                      setEditImgPreviews((prev) => ({
                        ...prev,
                        feNic: null,
                      }));
                    }}
                    showCancelButton={false}
                  />
                  <label className="form-label required" htmlFor="nic-front">
                    <h4>Upload NIC</h4>
                  </label>
                  {errors.uploadNicFrontPath && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.uploadNicFrontPath}</h6>
                    </div>
                  )}
                </div>
                <div className="form-item technician">
                  <UploadComponent
                    linkText="Click to upload"
                    text="or drag & drop"
                    textTwo="your image here"
                    mobileText="your image here"
                    title="NIC Back Side"
                    subText="PNG, JPG and JPEG, up to 15MB"
                    buttonText="Upload"
                    inputId="nic-back"
                    required={true}
                    multiple={false}
                    maxFileSize="15MB"
                    allowedFileSize={15 * 1024 * 1024}
                    fileFormat="png, jpg, jpeg"
                    allowedFileTypes={["image/png", "image/jpeg", "image/jpg"]}
                    onFileChange={async (files) => {
                      if (files.length > 0) {
                        setFile(files);
                        await handleTechnicianImageUpload(
                          files[0],
                          "vendorBeNic"
                        );
                      } else {
                        setFile(null);
                      }
                    }}
                    uploadError={uploadError}
                    uploadErrorDescription={uploadErrorDescription}
                    onCancelClick={() => navigate("/admin/vendor-management")}
                    isLoading={imgLoading.uploadNicBackPath}
                    editImgPreview={editImgPreviews.beNic}
                    onRemoveFile={() => {
                      handleRemoveFilePreview("beNic");
                      setEditImgPreviews((prev) => ({
                        ...prev,
                        beNic: null,
                      }));
                    }}
                    showCancelButton={false}
                  />
                  <label
                    className="form-label"
                    htmlFor="nic-back"
                    style={{ visibility: "hidden" }}
                  >
                    <h4>Upload NIC</h4>
                  </label>
                  {errors.uploadNicBackPath && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.uploadNicBackPath}</h6>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-item form-item__full profile-photo">
                <UploadComponent
                  linkText="Click to upload"
                  text="or drag & drop your image here"
                  mobileText="your image here"
                  subText="PNG, JPG and JPEG, up to 3MB"
                  buttonText="Upload Profile Photo"
                  inputId="technician-profile-photo"
                  required={false}
                  multiple={false}
                  maxFileSize="3MB"
                  allowedFileSize={3 * 1024 * 1024}
                  fileFormat="png, jpg, jpeg"
                  allowedFileTypes={["image/png", "image/jpeg", "image/jpg"]}
                  onFileChange={async (files) => {
                    if (files.length > 0) {
                      setFile(files);
                      await handleTechnicianImageUpload(
                        files[0],
                        "vendorProfile"
                      );
                    } else {
                      setFile(null);
                    }
                  }}
                  uploadError={uploadError}
                  uploadErrorDescription={uploadErrorDescription}
                  onCancelClick={() => navigate("/admin/vendor-management")}
                  isLoading={imgLoading["profilePhotoPath"]}
                  editImgPreview={editImgPreviews.vendorProfile}
                  onRemoveFile={() => {
                    handleRemoveFilePreview("vendorProfile");
                    setEditImgPreviews((prev) => ({
                      ...prev,
                      vendorProfile: null,
                    }));
                  }}
                  showCancelButton={false}
                />
                <label className="form-label" htmlFor="profile-photo">
                  <h4>Profile Photo</h4>
                </label>
                {errors.profilePath && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.profilePath}</h6>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="business-info">
            <h3 className="info-header">Business Information</h3>
            <div className="form-row">
              <div className="form-item">
                <input
                  type="text"
                  name="businessName"
                  id="business-name"
                  required
                  autoComplete="off"
                  value={formInputs.businessName}
                  className={errors["businessName"] ? "invalid" : ""}
                  onChange={handleChange}
                />
                <label className="form-label" htmlFor="business-name">
                  <h4>Business Name</h4>
                </label>
                {errors.businessName && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.businessName}</h6>
                  </div>
                )}
              </div>
              <div className="form-item">
                <div className="input-wrapper required">
                  <TelephoneInput
                    inputName="businessContactNumber"
                    value={formInputs.businessContactNumber}
                    className={errors["businessContactNumber"] ? "invalid" : ""}
                    onChange={(val) =>
                      handlePhoneChange(val, "businessContactNumber")
                    }
                    required
                  />
                </div>
                <label className="form-label" htmlFor="telephone-number">
                  <h4>Contact Number</h4>
                </label>
                {errors.businessContactNumber && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.businessContactNumber}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-item">
                <input
                  type="text"
                  name="businessAddressLine1"
                  id="address-line-1"
                  required
                  autoComplete="off"
                  value={formInputs.businessAddressLine1}
                  className={errors["businessAddressLine1"] ? "invalid" : ""}
                  onChange={handleChange}
                />
                <label className="form-label" htmlFor="address-line-1">
                  <h4>Business Address Line 1</h4>
                </label>
                {errors.businessAddressLine1 && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.businessAddressLine1}</h6>
                  </div>
                )}
              </div>
              <div className="form-item">
                <input
                  type="text"
                  autoComplete="off"
                  name="businessAddressLine2"
                  id="address-line-2"
                  value={formInputs.businessAddressLine2}
                  className={errors["businessAddressLine2"] ? "invalid" : ""}
                  onChange={handleChange}
                />
                <label className="form-label" htmlFor="address-line-2">
                  <h4>Business Address Line 2</h4>
                </label>
                {errors.businessAddressLine2 && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.businessAddressLine2}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-item ">
                <CustomRadioSelect
                  id="vendor-city-town-dropdown"
                  options={allCitiesOptions}
                  key={formInputs.city}
                  placeholderText=""
                  required
                  name="city"
                  onBlur={handleBlur}
                  defaultValue={formInputs.city}
                  value={formInputs.city}
                  isValid={errors["city"] ? "invalid" : ""}
                  onChange={(selected) => {
                    const selectedCity = allCityList.find(
                      (city) => city.id === selected.value
                    );
                    setFormInputs((prev) => ({
                      ...prev,
                      city: selected.value,
                      postalCode: selectedCity?.postalCode || "",
                      district: selectedCity?.districtName || "",
                      province: selectedCity?.provinceName || ""
                    }));
                    setDistrictName(selectedCity?.districtName || "");
                    setProvinceName(selectedCity?.provinceName || "");
                    setPostalCode(selectedCity?.postalCode || "");
                    setErrors((prev) => ({
                      ...prev,
                      city: "",
                      postalCode: "",
                      districtName: "",
                      provinceName: "",
                    }));
                  }}
                />

                <label className="form-label" htmlFor="email">
                  <h4>City/Town</h4>
                </label>
                {errors.city && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.city}</h6>
                  </div>
                )}
              </div>
              <div className="form-item disabled-form-item">
                <input
                  type="text"
                  name="postal-code"
                  id="postal-code"
                  required
                  className={errors["postalCode"] ? "invalid" : ""}
                  value={formInputs.postalCode || postalCode}
                  onChange={(e) => handleChange(e)}
                  disabled
                />
                <label className="form-label" htmlFor="postal-code">
                  <h4>Postal Code</h4>
                </label>
                {errors.postalCode && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.postalCode}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-item disabled-form-item">
                <input
                  type="text"
                  name="districtName"
                  id="districtName"
                  value={formInputs.district || districtName}
                  disabled
                  required
                />
                <label className="form-label " htmlFor="district">
                  <h4>District</h4>
                </label>
                {errors.districtName && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.districtName}</h6>
                  </div>
                )}
              </div>
              <div className="form-item disabled-form-item">
                <input
                  type="text"
                  name="provinceName"
                  id="province"
                  value={formInputs.province || provinceName}
                  disabled
                  required
                />
                <label className="form-label" htmlFor="province">
                  <h4>Province</h4>
                </label>
                {errors.provinceName && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.provinceName}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row ">
              <div className="form-item disabled-form-item">
                <input
                  type="text"
                  name="countryId"
                  id="country"
                  onBlur={handleBlur}
                  disabled
                  required
                  className={errors["countryId"] ? "invalid" : ""}
                  value="Sri Lanka"
                  onChange={(e) => handleChange(e)}
                  autoComplete="off"
                />
                <label
                  className="form-label disabled-form-item"
                  htmlFor="country"
                >
                  <h4>Country</h4>
                </label>

              </div>
              <div className="form-item">
                <input
                  type="text"
                  required
                  className={errors["registrationNumber"] ? "invalid" : ""}
                  name="registrationNumber"
                  autoComplete="off"
                  id="registrationNumber"
                  value={formInputs.registrationNumber}
                  onChange={handleChange}
                />
                <label className="form-label" htmlFor="registration-no">
                  <h4>Registration No</h4>
                </label>
                {errors.registrationNumber && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.registrationNumber}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div
                className="form-item form-item__full profile-photo">
                {!formInputs.docUploadPath && (
                  <UploadComponent
                    linkText="Click to upload"
                    text="or drag & drop your file here"
                    mobileText="your file here"
                    subText="PDF format, up to 20MB"
                    multiple={false}
                    maxFileSize="20MB"
                    allowedFileSize={20 * 1024 * 1024}
                    fileFormat="pdf"
                    allowedFileTypes={[
                      "application/pdf",
                    ]}
                    buttonText="Upload Registration Document"
                    inputId="registration-document"
                    onFileChange={async (files) => {
                      if (files.length > 0) {
                        setFile(files);
                        await handleTechnicianImageUpload(
                          files[0],
                          "vendorAttachment"
                        );
                      } else {
                        setFile(null);
                        setErrors((prev) => ({
                          ...prev,
                          docUploadPath: "Registration Document field is required"
                        }));
                      }
                    }}
                    uploadError={uploadError}
                    uploadErrorDescription={uploadErrorDescription}
                    onCancelClick={() => navigate("/admin/vendor-management")}
                    isLoading={isImgLoading.vendorAttachment}
                    onRemoveExistingFile={handleRemoveExistingChecklistFile}
                    showCancelButton={false}
                    onRemoveFile={() => {
                      handleRemoveFilePreview("docUploadPath");
                      setEditImgPreviews((prev) => ({
                        ...prev,
                        docUploadPath: null,
                      }));
                    }}
                    required={true}
                  />
                )}
                <label className="form-label required" htmlFor="registration-document">
                  <h4>Upload Registration Document</h4>
                </label>
                {errors.docUploadPath && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.docUploadPath}</h6>
                  </div>
                )}
              </div>
            </div>
            {formInputs.docUploadPath && (
              <div className="uploaded-file-preview" style={{}}>
                <div className="file-preview" id="vendor-edit-invoice-view">
                  <img
                    src={Icons.pdf_file}
                    alt="PDF"
                    className="attachment-icon"
                  />
                  <a
                    href={formInputs.docUploadPath}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {formInputs.docUploadPath.split("/").pop()}
                  </a>
                </div>
                <span
                  id="delete-doc-btn"
                  style={{ cursor: "pointer", marginLeft: 12 }}
                  onClick={() =>
                    setFormInputs((prev) => ({
                      ...prev,
                      docUploadPath: "",
                    }))
                  }
                >
                  <img className="dete" src={Icons.trash_red} alt="Delete" />
                </span>
              </div>
            )}
            <div className="form-row">
              <div className="form-item">
                <input
                  type="email"
                  name="businessEmailAddress"
                  id="business-email"
                  required
                  autoComplete="off"
                  value={formInputs.businessEmailAddress}
                  className={errors["businessEmailAddress"] ? "invalid" : ""}
                  onChange={handleChange}
                />
                <label className="form-label" htmlFor="business-email">
                  <h4>Business Email Address</h4>
                </label>
                {errors.businessEmailAddress && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.businessEmailAddress}</h6>
                  </div>
                )}
              </div>
              <div className="form-item">
                <FormMultipleSelect
                  id="vendor-bussiness-type"
                  options={bisinessTypeOptions}
                  placeholderText="Select Business Type"
                  className={errors["businessTypes"] ? "invalid" : ""}
                  isValid={errors["businessTypes"] ? "invalid" : ""}
                  required
                  value={formInputs.businessTypes.map(bt => bt.businessRateTypeId)}
                  onChange={(selectedValues) => {
                    const newBusinessTypes = selectedValues.map(value => ({
                      businessRateTypeId: value
                    }));
                    setFormInputs((prev) => ({
                      ...prev,
                      businessTypes: newBusinessTypes
                    }));
                    // Validate business type on change
                    const error = validateField("businessTypes", selectedValues);
                    setErrors((prev) => ({
                      ...prev,
                      businessTypes: error
                    }));
                  }}
                  onBlur={() => {
                    const error = validateField("businessTypes", formInputs.businessTypes);
                    setErrors((prev) => ({
                      ...prev,
                      businessTypes: error
                    }));
                  }}
                />
                <label className="form-label" htmlFor="business-type">
                  <h4>Business Type</h4>
                </label>
                {errors.businessTypes && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.businessTypes}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-item">
                <input
                  type="text"
                  name="website"
                  id="website-url"
                  autoComplete="off"
                  value={formInputs.website}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors["website"] ? "invalid" : ""}
                />
                <label className="form-label" htmlFor="website-url">
                  <h4>Website URL</h4>
                </label>
                {errors.website && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.website}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-item form-item__full profile-photo">
                <UploadComponent
                  linkText="Click to upload"
                  text=" or drag & drop your image here"
                  subText="PNG, JPG and JPEG, up to 5MB"
                  buttonText="Upload Profile Photo"
                  inputId="profile-photo"
                  multiple={false}
                  maxFileSize="5MB"
                  fileFormat="png, jpg, jpeg"
                  required={false}
                  onFileChange={async (files) => {
                    if (files.length > 0) {
                      setFile(files);
                      await handleTechnicianImageUpload(
                        files[0],
                        "businessLogo"
                      );
                    } else {
                      setFile(null);
                    }
                  }}
                  allowedFileTypes={["image/png", "image/jpeg", "image/jpg"]}
                  editImgPreview={editImgPreviews.businessLogo}
                  uploadError={uploadError}
                  uploadErrorDescription={uploadErrorDescription}
                  onCancelClick={() => navigate("/admin/vendor-management")}
                  isLoading={isImgLoading?.businessLogo}
                  onRemoveFile={() => {
                    handleRemoveFilePreview("businessLogo");
                    setEditImgPreviews((prev) => ({
                      ...prev,
                      businessLogo: null,
                    }));
                  }}
                  showCancelButton={false}
                  allowedFileSize={5 * 1024 * 1024}
                />
                <label className="form-label" htmlFor="business-logo">
                  <h4>Business Logo</h4>
                </label>
                {errors.businessLogo && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.businessLogo}</h6>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="additional-info">
            <h3 className="info-header">Additional Information</h3>
            <div className="form-row">
              <div className="form-item disabled-form-item">
                <input
                  type="text"
                  name="vendorId"
                  id="vendor-id"
                  value={isEdit ? formInputs.vendorId : primaryId}
                  disabled
                  onChange={handleChange}
                />
                <label className="form-label" htmlFor="vendor-id">
                  <h4>Vendor ID</h4>
                </label>
                {errors.vendorId && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.vendorId}</h6>
                  </div>
                )}
              </div>
              <div className="form-item disabled-form-item">
                <div className="position-relative datepicker p-0">
                  <input
                    type="text"
                    value={formInputs.joinedDate}
                    name="joinedDate" id="joined-date"
                    disabled />
                  <img src={Icons.calendar} alt="Calendar Icon" className="input-icon" />
                </div>
                <label className="form-label" htmlFor="joined-date">
                  <h4>Joined Date</h4>
                </label>
                {errors.joinedDate && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.joinedDate}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-item disabled-form-item">
                <input
                  type="text"
                  name="registeredBy"
                  id="registered-by"
                  value={`${firstName} ${lastName}`}
                  disabled
                />

                <label className="form-label" htmlFor="registered-by">
                  <h4>Registered By</h4>
                </label>
              </div>
              <div className="form-item">
                <div className="input-wrapper input-wrapper__radio">
                  <div className="radio-wrapper">
                    <input
                      type="radio"
                      required
                      name="status"
                      id="active"
                      value={true}
                      checked={formInputs.status === true}
                      onChange={handleStatusChange}
                    />
                    <label className="radio-label" htmlFor="active">
                      Active
                    </label>
                  </div>
                  <div className="radio-wrapper">
                    <input
                      type="radio"
                      name="status"
                      id="inactive"
                      value={false}
                      checked={formInputs.status === false}
                      onChange={handleStatusChange}
                    />
                    <label className="radio-label" htmlFor="inactive">
                      Inactive
                    </label>
                  </div>
                </div>
                <label className="form-label" htmlFor="status">
                  <h4>Status</h4>
                </label>
              </div>
            </div>
          </div>
          <div className="vendor-last-part">
          <div className="account-credentials">
            <h3 className="info-header">Account Credentials</h3>
            <div className="form-row">
              <div className="form-item">
                <input
                  type="text"
                  name="username"
                  id="username"
                  autoComplete="off"
                  required
                  className={errors["username"] ? "invalid" : ""}
                  value={formInputs.username}
                  onChange={handleChange}
                />
                <label className="form-label" htmlFor="username">
                  <h4>Username</h4>
                </label>
                {errors.username && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.username}</h6>
                  </div>
                )}
              </div>
            </div>
            {!isEdit && 
              <div className="form-row">
                <div className="form-item  disabled-form-item">
                  <div className="password-wrapper">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      id="password"
                      value={formInputs.password}
                      onChange={handleChange}
                      placeholder=". . . . . . . ."
                      disabled
                    />
                    <span className="password-icon">
                      <img
                        src={
                          passwordVisible
                            ? Icons.eye_visible
                            : Icons.eye_invisible
                        }
                        alt="Toggle password visibility"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      />
                    </span>
                  </div>
                  <label className="form-label" htmlFor="password">
                    <h4>Password</h4>
                  </label>
                  {errors.password && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.password}</h6>
                    </div>
                  )}
                </div>
              </div>
            }
          </div>
          <div className="form-footer">
            <button
              type="submit"
              className="button button-submit"
              id="vendorform-vendor-save"
              onClick={isEdit ? onUpdate : onSubmit}
              disabled={isLoading}
            >
              <h5>{isLoading ? "Saving... Please wait." : isEdit ? "Update" : "Save"}</h5>
            </button>
            <button
              type="button"
              className="button button-cancel"
              id="vendorform-vendor-cancel"
              onClick={handleCancelClick}
            >
              <h5>Cancel</h5>
            </button>
            </div>
          </div>
        </Form>
      </div>
      {showCancelPopup && (
        <CancelModal
          onClickConfirmModel={handleConfirmCancel}
          onClickCancelModel={handleCancelCancel}
        />
      )}
      <CreateSuccessModal
        visible={isSuccessModalVisible}
        setVisible={setIsSuccessModalVisible}
        email={formInputs.emailAddress}
        password={formInputs.password}
      />
    </>
  );
};

export default VendorForm;
