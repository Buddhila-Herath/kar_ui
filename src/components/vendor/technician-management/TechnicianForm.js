import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, notification, Spin } from "antd";
import Icons from "../../../utils/icons";
import UploadComponent from "../../../shared/upload/UploadComponent";
import TelephoneInput from "../../../shared/phoneInput/TelephoneInput";
import CreateSuccessModal from "./CreateSuccessModal";
import GroupMultipleSelect from "../../../shared/select/GroupMultipleSelect";
import CancelModal from "../../../shared/components/CancelModal";
import {
  fetchAllTechnicanTypes,
} from "../../../slices/masterDataSlice";
import { dateFormat } from '../../../constants';
import { format, parse } from "date-fns";
import { Tokens } from "../../../constants/index";
import {
  generatePrimaryId,
  saveTechinicianData,
  updateTechinicianData,
  uploadImage
} from '../../../slices/vendor/technicianSlice';
import { MaskedInput, createDefaultMaskGenerator } from 'react-hook-mask';
const maskGenerator = createDefaultMaskGenerator('EC999999');
import { fetchImageByPath } from "../../../slices/masterDataSlice";

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

  const remainingLength = Math.floor(Math.random() * (20 - 6 + 1)) + 2; // Ensures total length is between 6-20

  password += Array.from({ length: remainingLength }, () =>
    allChars[Math.floor(Math.random() * allChars.length)]
  ).join('');

  return password.split('').sort(() => Math.random() - 0.5).join('');
};

const TechnicianForm = ({ technician = {}, isEdit = false, sId = 0 }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
  const {
    allTechnicanTypes,
  } = useSelector((state) => state.masterData);
  const { primaryId } = useSelector((state) => state.vendorTechnician);
  const [password, setPassword] = useState(generateStrongPassword());
  const [imgLoading, setImgLoading] = useState({
    technicianProfile: false,
    technicianFeNic: false,
    technicianBeNic: false,
  });
  const [editImgPreviews, setEditImgPreviews] = useState({
    feNic: null,
    beNic: null,
    technicianProfile: null,
  });
  const [file, setFile] = useState(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(false);
  const [technicianProfileBase64, setTechnicianProfileBase64] = useState(null);

  const handleEmploymentChange = (e) => {
    formInputs.employeeType = e.target.value;
    const { name, value } = e.target;
    setIsFormModified(true);

    setFormInputs((prev) => {
      let updatedInputs = { ...prev, [name]: value };

      if (value === "PERMANENT") {
        updatedInputs.hourlyRate = null;
        setErrors((prev) => ({
          ...prev,
          hourlyRate: "",
        }));
      } else if (value === "CONTRACT") {
        updatedInputs.monthlySalary = null;
        setErrors((prev) => ({
          ...prev,
          monthlySalary: "",
        }));
      }

      return updatedInputs;
    });
  };

  useEffect(() => {
    dispatch(generatePrimaryId());
    dispatch(fetchAllTechnicanTypes());
  }, [dispatch]);

  useEffect(() => {
    if (primaryId) {
      setFormInputs((prevState) => ({
        ...prevState,
        primaryIdentifier: primaryId,
      }));
    }
  }, [primaryId]);

  const technicianTypeOptions = allTechnicanTypes.map((option) => {
    if (option.technicianSubTypeDtoList.length > 0) {
      return {
        label: option.technicianTypeName,
        options: option.technicianSubTypeDtoList.map((subType) => ({
          label: subType.technicianSubType,
          value: subType.id,
        })),
      };
    } else {
      return {
        label: option.technicianTypeName,
        value: option.technicianTypeId,
      };
    }
  });

  const closePopup = () => {
    setShowPopup(false);
    setErrorIcon("");
    setErrorTitle("");
    setError("");
  };

  const [formInputs, setFormInputs] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    technicianEmail: "",
    technicianType: [],
    employeeType: "PERMANENT",
    monthlySalary: null,
    hourlyRate: null,
    expenseAccountCode: "",
    nic: "",
    feNicPath: "",
    beNicPath: "",
    profilePath: "",
    primaryIdentifier: technician.primaryIdentifier || primaryId || "",
    joinedDate: format(new Date(), dateFormat.API_NATIVE),
    registeredBy: email,
    status: true,
    userName: "",
    password: password,
  });

  useEffect(() => {
    if (isEdit && technician) {
      setFormInputs({
        id: sId,
        firstName: technician.firstName,
        lastName: technician.lastName,
        contactNumber: technician.contactNumber,
        technicianEmail: technician.email,
        technicianType: technician.technicianType,
        employeeType: technician.employeeType,
        monthlySalary: technician.monthlySalary || null,
        hourlyRate: technician.hourlyRate || null,
        expenseAccountCode: technician.expenseCode,
        nic: technician.nic,
        feNicPath: technician.feNicPath,
        beNicPath: technician.beNicPath,
        profilePath: technician.technicianProfilePath,
        primaryIdentifier: technician.technicianId || primaryId || "",
        joinedDate: technician.joinedDate,
        status: technician.status,
        userName: technician.userName,
        registeredBy: technician.registerBy
      });
      setEditImgPreviews({
        feNic: technician.feNic || null,
        beNic: technician.beNic || null,
        technicianProfile: technician.technicianProfile || null,
      });
    }
  }, [isEdit, technician]);

  useEffect(() => {
    if (isEdit && technician) {
      loadTechnicianImages();
    }
  }, [isEdit, technician, dispatch]);

  const loadTechnicianImages = async () => {
    if (!isEdit || !technician) return;

    const itemsToLoad = [
      { path: technician.technicianProfilePath, previewKey: 'technicianProfile', loadingKey: 'technicianProfile' },
      { path: technician.feNicPath, previewKey: 'feNic', loadingKey: 'technicianFeNic' },
      { path: technician.beNicPath, previewKey: 'beNic', loadingKey: 'technicianBeNic' }
    ];

    for (const item of itemsToLoad) {
      if (!item.path) continue;
      setImgLoading((prev) => ({ ...prev, [item.loadingKey]: true }));
      try {
        const res = await dispatch(fetchImageByPath(item.path)).unwrap();
        setEditImgPreviews((prev) => ({ ...prev, [item.previewKey]: res.url }));
        if (item.previewKey === 'technicianProfile') {
          setTechnicianProfileBase64(res.url);
        }
      } catch (error) {
        console.error(`Failed to load ${item.previewKey} image:`, error);
      } finally {
        setImgLoading((prev) => ({ ...prev, [item.loadingKey]: false }));
      }
    }
  };

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    technicianEmail: "",
    technicianType: "",
    employeeType: "",
    monthlySalary: "",
    hourlyRate: "",
    expenseAccountCode: "",
    nic: "",
    feNicPath: "",
    beNicPath: "",
    profilePath: "",
    primaryIdentifier: "",
    registeredBy: "",
    status: "",
    userName: "",
    password: "",
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

  const isValidSriLankaNIC = (nic) => {
    const oldNICPattern = /^[0-9]{9}[VXvx]$/;  // 9 digits + "V" or "X"
    const newNICPattern = /^[0-9]{12}$/;       // 12 digits only
    return oldNICPattern.test(nic) || newNICPattern.test(nic);
  };

  const handleValidation = () => {
    let formErrors = {};
    let isValid = true;

    if (!formInputs.firstName) {
      formErrors.firstName = "First Name field is required";
      isValid = false;
    } else if (!/^[A-Za-z]+$/.test(formInputs.firstName)) {
      formErrors.firstName = "First name must contain only letters";
      isValid = false;
    } else if (formInputs.firstName.length > 30) {
      formErrors.firstName = "Enter a value that doesn't exceed 30 characters";
      isValid = false;
    }

    if (!formInputs.lastName) {
      formErrors.lastName = "Last Name field is required";
      isValid = false;
    } else if (!/^[A-Za-z]+$/.test(formInputs.lastName)) {
      formErrors.lastName = "Last name must contain only letters";
      isValid = false;
    } else if (formInputs.lastName.length > 30) {
      formErrors.lastName = "Enter a value that doesn't exceed 30 characters";
      isValid = false;
    }

    const sriLankaPhoneRegex = /^\+94\s\d{2}\s\d{3}\s\d{4}$/;
    if (!formInputs.contactNumber || formInputs.contactNumber.length === 0) {
      formErrors.contactNumber = "Contact Number field is required";
      isValid = false;
    } else if (!sriLankaPhoneRegex.test(formInputs.contactNumber)) {
      formErrors.contactNumber = "Must be a valid Contact Number";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formInputs.technicianEmail) {
      formErrors.technicianEmail = "Email Address field is required";
      isValid = false;
    } else if (!emailRegex.test(formInputs.technicianEmail)) {
      formErrors.technicianEmail = "Enter a valid email address";
      isValid = false;
    } else if (formInputs.technicianEmail.length > 100) {
      formErrors.technicianEmail = "Enter a value that doesn't exceed 100 characters";
      isValid = false;
    }

    if (formInputs.employeeType === "PERMANENT" && !formInputs.monthlySalary) {
      formErrors.monthlySalary = "Monthly Salary (Rs.) field is required";
      isValid = false;
    } else if (formInputs.monthlySalary !== null && formInputs.monthlySalary !== "") {
      if (isNaN(Number(formInputs.monthlySalary))) {
        formErrors.monthlySalary = "Enter a valid numeric value";
        isValid = false;
      } else if (Number(formInputs.monthlySalary) < 0) {
        formErrors.monthlySalary = "Salary cannot be negative";
        isValid = false;
      } else if (String(formInputs.monthlySalary).length > 10) {
        formErrors.monthlySalary = "Enter a value that doesn't exceed 10 numeric characters";
        isValid = false;
      }
    }

    const usernameRegex = /^[a-zA-Z0-9]{1,30}$/;
    if (!formInputs.userName) {
      formErrors.userName = "Username field is required";
      isValid = false;
    } else if (!usernameRegex.test(formInputs.userName)) {
      formErrors.userName = "Username must be alphanumeric, max 30 characters, and contain no spaces or special characters";
      isValid = false;
    }

    if (!formInputs.technicianType || formInputs.technicianType.length === 0) {
      formErrors.technicianType = "Technician Type field is required";
      isValid = false;
    }

    if (!formInputs.employeeType) {
      formErrors.employeeType = "Employment Type field is required";
      isValid = false;
    }

    if (formInputs.employeeType === "CONTRACT" && !formInputs.hourlyRate) {
      formErrors.hourlyRate = "Hourly Rate field is required";
      isValid = false;
    } else if (formInputs.hourlyRate !== null && formInputs.hourlyRate !== "") {
      if (isNaN(Number(formInputs.hourlyRate))) {
        formErrors.hourlyRate = "Enter a valid numeric value";
        isValid = false;
      } else if (Number(formInputs.hourlyRate) < 0) {
        formErrors.hourlyRate = "Hourly Rate cannot be negative";
        isValid = false;
      } else if (String(formInputs.hourlyRate).length > 10) {
        formErrors.hourlyRate = "Enter a value that doesn't exceed 10 numeric characters";
        isValid = false;
      }
    }

    if (formInputs.hourlyRate !== null && formInputs.hourlyRate !== "") {
      if (isNaN(Number(formInputs.hourlyRate)) || Number(formInputs.hourlyRate) < 0) {
        formErrors.hourlyRate = "Enter a valid numeric value";
        isValid = false;
      } else if (String(formInputs.hourlyRate).length > 10) {
        formErrors.hourlyRate = "Enter a value that doesn't exceed 10 numeric characters";
        isValid = false;
      }
    }

    const expenseAccountCodeRegex = /^EC\d{6}$/;
    if (!formInputs.expenseAccountCode) {
      formErrors.expenseAccountCode = "Expense Account Code field is required";
      isValid = false;
    } else if (!expenseAccountCodeRegex.test(formInputs.expenseAccountCode)) {
      formErrors.expenseAccountCode = "Expense Account Code must start with 'EC' followed by 6 digits (e.g., EC000001)";
      isValid = false;
    }

    if (!formInputs.nic) {
      formErrors.nic = "NIC field is required";
      isValid = false;
    }
    else if (!isValidSriLankaNIC(formInputs.nic)) {
      formErrors.nic = "Invalid Sri Lankan NIC format";
      isValid = false;
    }

    if (!formInputs.feNicPath) {
      formErrors.feNicPath = "NIC Front Side is required";
      isValid = false;
    }

    if (!formInputs.beNicPath) {
      formErrors.beNicPath = "NIC Back Side is required";
      isValid = false;
    }

    if (!formInputs.primaryIdentifier) {
      formErrors.primaryIdentifier = "Technician ID field is required";
      isValid = false;
    }

    if (!formInputs.registeredBy) {
      formErrors.registeredBy = "Registered By field is required";
      isValid = false;
    }

    if (formInputs.status === undefined || formInputs.status === null) {
      formErrors.status = "Status field is required";
      isValid = false;
    }

    if (!isValid) {
      setErrors(formErrors);
      notification.error({
        message: <h5>Validation failed. Ensure all fields are correct.</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5
      });
    }

    return isValid;
  };

  const handlePhoneChange = (phone) => {
    setFormInputs((prev) => ({
      ...prev,
      contactNumber: phone,
    }));
    setErrors((prev) => ({
      ...prev,
      contactNumber: "",
    }));
  };

  const handleTechnicianImageUpload = async (selectedFile, type) => {
    if (!selectedFile) return;
    setUploadError('');
    setUploadErrorDescription('');

    setImgLoading((prev) => ({ ...prev, [type]: true }));

    const formData = new FormData();
    formData.append('files', selectedFile);

    try {
      const result = await dispatch(uploadImage({ formData, type, primaryId })).unwrap();
      if (result) {
        if (type === "technicianProfile") {
          setFormInputs((prevState) => ({
            ...prevState,
            profilePath: result,
          }));
          setErrors((prev) => ({
            ...prev,
            profilePath: "",
          }));
        } else if (type === "technicianFeNic") {
          setFormInputs((prevState) => ({
            ...prevState,
            feNicPath: result,
          }));
          setErrors((prev) => ({
            ...prev,
            feNicPath: "",
          }));
        } else {
          setFormInputs((prevState) => ({
            ...prevState,
            beNicPath: result,
          }));
          setErrors((prev) => ({
            ...prev,
            beNicPath: "",
          }));
        }
      }
    } catch (error) {
      const errorDetails =
        (error.errors && error.errors.join(', ')) || "An unknown error occurred.";

      setUploadError('Upload failed');
      setUploadErrorDescription(errorDetails);
    } finally {
      setImgLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleRemoveFilePreview = (fileType) => {
    setEditImgPreviews((prev) => ({
      ...prev,
      [fileType]: null,
    }));

    if (fileType === "feNic") {
      setFormInputs((prev) => ({
        ...prev,
        feNicPath: "",
      }));
    } else if (fileType === "beNic") {
      setFormInputs((prev) => ({
        ...prev,
        beNicPath: "",
      }));
    } else {
      setFormInputs((prev) => ({
        ...prev,
        profilePath: "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setIsFormModified(true);

    if (name === "firstName") {
      const errorMsg = !value ? "First Name field is required" :
        !/^[A-Za-z]+$/.test(value) ? "First name must contain only letters" :
          value.length > 30 ? "Enter a value that doesn't exceed 30 characters" : "";
      setErrors(prev => ({ ...prev, firstName: errorMsg }));
    }
    else if (name === "lastName") {
      const errorMsg = !value ? "Last Name field is required" :
        !/^[A-Za-z]+$/.test(value) ? "Last name must contain only letters" :
          value.length > 30 ? "Enter a value that doesn't exceed 30 characters" : "";
      setErrors(prev => ({ ...prev, lastName: errorMsg }));
    }
    else if (name === "monthlySalary") {
      const errorMsg = formInputs.employeeType === "PERMANENT" && !value ? "Monthly Salary (Rs.) field is required" :
        value && isNaN(Number(value)) ? "Enter a valid numeric value" :
          value && Number(value) < 0 ? "Salary cannot be negative" :
            value && String(value).length > 10 ? "Enter a value that doesn't exceed 10 numeric characters" : "";
      setErrors(prev => ({ ...prev, monthlySalary: errorMsg }));
    }
    else if (name === "hourlyRate") {
      const errorMsg =
        formInputs.employeeType === "CONTRACT" && !value
          ? "Hourly Rate field is required"
          : value && isNaN(Number(value))
            ? "Enter a valid numeric value"
            : value && Number(value) < 0
              ? "Hourly Rate cannot be negative"
              : value && String(value).length > 10
                ? "Enter a value that doesn't exceed 10 numeric characters"
                : "";
      setErrors(prev => ({ ...prev, hourlyRate: errorMsg }));
    }
    else if (name === "userName") {
      const usernameRegex = /^[a-zA-Z0-9]{1,30}$/;
      const errorMsg = !value ? "Username field is required" :
        !usernameRegex.test(value) ? "Username must be alphanumeric, max 30 characters, and contain no spaces or special characters" : "";
      setErrors(prev => ({ ...prev, userName: errorMsg }));
    }
    else if (name === "technicianEmail") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const errorMsg = !value ? "Email Address field is required" :
        !emailRegex.test(value) ? "Enter a valid email address" :
          value.length > 100 ? "Enter a value that doesn't exceed 100 characters" : "";
      setErrors(prev => ({ ...prev, technicianEmail: errorMsg }));
    }
    else if (name === "nic") {
      const oldNICPattern = /^[0-9]{9}[VXvx]$/;
      const newNICPattern = /^[0-9]{12}$/;
      const errorMsg = !value ? "NIC field is required" :
        !(oldNICPattern.test(value) || newNICPattern.test(value)) ?
          "Invalid Sri Lankan NIC format" : "";
      setErrors(prev => ({ ...prev, nic: errorMsg }));
    }
    else {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    setFormInputs((prev) => {
      let updatedInputs = {
        ...prev,
        [name]: type === "radio" ? value === "true" : value,
      };
      return updatedInputs;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    console.log(formInputs);
    const valid = handleValidation();
    if (valid) {
      setIsLoading(true);
      try {
        const resultAction = await dispatch(saveTechinicianData(formInputs));
        if (saveTechinicianData.fulfilled.match(resultAction)) {
          setIsSuccessModalVisible(true);
        } else if (resultAction.payload?.errors) {
          const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
            if (error.includes("First name")) {
              acc.firstName = error;
            }
            if (error.includes("Last name")) {
              acc.lastName = error;
            }
            if (error.includes("firstname")) {
              acc.firstName = error;
            }
            if (error.includes("contact number") || error.includes("Contact number") || error.includes("Contact Number") || error.includes("contactnumber") || error.includes("phone") || error.includes("Phone") || error.includes("mobile") || error.includes("Mobile")) {
              acc.contactNumber = error;
            }
            if (error.includes("email") || error.includes("Email")) {
              acc.technicianEmail = error;
            }
            if (error.includes("Expense Account Code")) {
              acc.expenseAccountCode = error;
            }
            if (error.includes("NIC") || error.includes("nic")) {
              acc.nic = error;
            }
            if (error.includes("Username")) {
              acc.userName = error;
            }
            if (error.includes("User name")) {
              acc.userName = error;
            }
            if (error.includes("username")) {
              acc.userName = error;
            }
            if (error.includes("Password")) {
              acc.password = error;
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

  const onUpdate = async (e) => {
    e.preventDefault();
    setErrors({});
    const valid = handleValidation();
    if (valid) {
      setIsLoading(true);
      try {
        const dataToSend = {
          id: formInputs.id,
          firstName: formInputs.firstName,
          lastName: formInputs.lastName,
          contactNumber: formInputs.contactNumber,
          technicianEmail: formInputs.technicianEmail,
          technicianType: formInputs.technicianType,
          employeeType: formInputs.employeeType,
          monthlySalary: formInputs.monthlySalary,
          hourlyRate: formInputs.hourlyRate,
          expenseAccountCode: formInputs.expenseAccountCode,
          nic: formInputs.nic,
          feNicPath: formInputs.feNicPath,
          beNicPath: formInputs.beNicPath,
          profilePath: formInputs.profilePath,
          status: formInputs.status,
        };

        const resultAction = await dispatch(updateTechinicianData(dataToSend));
        if (updateTechinicianData.fulfilled.match(resultAction)) {
          navigate("/app/technician-management");
          notification.success({
            message: <h5>Updated Successfully!</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5,
          });
        } else if (resultAction.payload?.errors) {
          const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
            if (error.includes("First name")) {
              acc.firstName = error;
            }
            if (error.includes("Last name")) {
              acc.lastName = error;
            }
            if (error.includes("firstname")) {
              acc.firstName = error;
            }
            if (error.includes("lastname")) {
              acc.lastName = error;
            }
            if (error.includes("contact number") || error.includes("Contact number") || error.includes("Contact Number") || error.includes("contactnumber") || error.includes("phone") || error.includes("Phone") || error.includes("mobile") || error.includes("Mobile")) {
              acc.contactNumber = error;
            }
            if (error.includes("email") || error.includes("Email")) {
              acc.technicianEmail = error;
            }
            if (error.includes("Expense Account Code")) {
              acc.expenseAccountCode = error;
            }
            if (error.includes("NIC") || error.includes("nic")) {
              acc.nic = error;
            }
            if (error.includes("Username")) {
              acc.userName = error;
            }
            if (error.includes("User name")) {
              acc.userName = error;
            }
            if (error.includes("username")) {
              acc.userName = error;
            }
            if (error.includes("Password")) {
              acc.password = error;
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

  return (
    <>
      <div className="form-container">
        <div className="form-header">
          <div className="back">
            <Link to="/app/technician-management">
              <img src={Icons.arrow_left} alt="Back Icon" />
            </Link>
            <h3>{isEdit ? "Edit Technician - " + technician.technicianId : "Add New Technician"}</h3>
          </div>
        </div>
        <Form className="form" layout="vertical">
          <div className="personal-info">
            <h3 className="info-header">
              Personal Information
            </h3>
            <div className="form-row">
              <div className="form-item">
                <input type="text" autoComplete="off" name="firstName" id="first-name" required value={formInputs.firstName} className={errors["firstName"] ? "invalid" : ""} onChange={(e) => handleChange(e)} />
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
                <input type="text" autoComplete="off" name="lastName" id="last-name" required value={formInputs.lastName} className={errors["lastName"] ? "invalid" : ""} onChange={(e) => handleChange(e)} />
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
                  <TelephoneInput inputName="contactNumber" onChange={handlePhoneChange} value={formInputs.contactNumber} />
                </div>
                <label className="form-label" htmlFor="contact-number">
                  <h4>Contact Number</h4>
                </label>
                {errors.contactNumber && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.contactNumber}</h6>
                  </div>
                )}
              </div>
              <div className="form-item">
                <input
                  type="email"
                  name="technicianEmail"
                  id="email"
                  value={formInputs.technicianEmail}
                  required
                  className={errors["technicianEmail"] ? "invalid" : ""}
                  onChange={(e) => handleChange(e)}
                  autoComplete="off"
                />
                <label className="form-label" htmlFor="email">
                  <h4>Email Address</h4>
                </label>
                {errors.technicianEmail && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.technicianEmail}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-item">
                <GroupMultipleSelect
                  groupedOptions={technicianTypeOptions}
                  placeholderText="Select technician type"
                  required={true}
                  className="required"
                  name="technicianType"
                  isValid={errors["technicianType"] ? "invalid" : ""}
                  value={
                    (formInputs.technicianType || []).map((id) => {
                      const option = technicianTypeOptions
                        .flatMap((group) => [group, ...(group.options || [])])
                        .find((item) => item.value === id);
                      return option || { value: id, label: id };
                    })
                  }
                  onChange={(selected) => {
                    const technicianTypeIds = Array.from(new Set(selected.map((item) => item.value)));

                    setFormInputs((prev) => ({
                      ...prev,
                      technicianType: technicianTypeIds.length > 0 ? technicianTypeIds : null, // Ensure null when empty
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      technicianType: "",
                    }));
                  }}
                />
                <label className="form-label" htmlFor="technician-type">
                  <h4>Technician Type</h4>
                </label>
                {errors.technicianType && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.technicianType}</h6>
                  </div>
                )}
              </div>
              <div className="form-item">
                <div className="input-wrapper input-wrapper__radio">
                  <div className="radio-wrapper">
                    <input
                      type="radio"
                      name="employeeType"
                      id="permanent"
                      value="PERMANENT"
                      required
                      checked={formInputs.employeeType === "PERMANENT"}
                      onChange={handleEmploymentChange}
                    />
                    <label className="radio-label" htmlFor="permanent">
                      Permanent
                    </label>
                  </div>
                  <div className="radio-wrapper">
                    <input
                      type="radio"
                      name="employeeType"
                      id="contract"
                      value="CONTRACT"
                      required
                      checked={formInputs.employeeType === "CONTRACT"}
                      onChange={handleEmploymentChange}
                    />
                    <label className="radio-label" htmlFor="contract">
                      Contract
                    </label>
                  </div>
                </div>
                <label className="form-label" htmlFor="employment-type">
                  <h4>Employment Type</h4>
                </label>
                {errors.employeeType && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.employeeType}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className={`form-item ${formInputs.employeeType === "CONTRACT" ? "inactive-input" : ""}`}>
                <input
                  type="text"
                  name="monthlySalary"
                  id="monthly-salary"
                  required
                  autoComplete="off"
                  className={errors["monthlySalary"] ? "invalid" : ""}
                  disabled={formInputs.employeeType === "CONTRACT"}
                  value={formInputs.monthlySalary ?? ""}
                  onChange={(e) => handleChange(e)}
                />
                <label className="form-label" htmlFor="monthly-salary">
                  <h4>Monthly Salary (Rs.)</h4>
                </label>
                {errors.monthlySalary && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.monthlySalary}</h6>
                  </div>
                )}
              </div>
              <div className={`form-item ${formInputs.employeeType === "PERMANENT" ? "inactive-input" : ""}`}>
                <input
                  type="text"
                  name="hourlyRate"
                  id="hourly-rate"
                  required
                  autoComplete="off"
                  className={errors["hourlyRate"] ? "invalid" : ""}
                  disabled={formInputs.employeeType === "PERMANENT"}
                  value={formInputs.hourlyRate ?? ""}
                  onChange={(e) => handleChange(e)}
                />
                <label className="form-label" htmlFor="hourly-rate">
                  <h4>Hourly Rate</h4>
                </label>
                {errors.hourlyRate && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.hourlyRate}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className={`form-item ${isEdit ? "disabled-form-item" : ""}`}>
                <MaskedInput
                  type="text"
                  name="expenseAccountCode"
                  id="expenseAccountCode"
                  value={formInputs.expenseAccountCode}
                  maskGenerator={maskGenerator}
                  keepMask
                  autoComplete="off"
                  className={errors["expenseAccountCode"] ? "invalid" : ""}
                  onChange={(value) => handleChange({ target: { name: "expenseAccountCode", value } })}
                  required
                  disabled={isEdit}
                />
                <label className="form-label" htmlFor="expense-account-code">
                  <h4>Expense Account Code</h4>
                </label>
                {errors.expenseAccountCode && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.expenseAccountCode}</h6>
                  </div>
                )}
              </div>
              <div className="form-item">
                <input type="text" autoComplete="off" name="nic" id="nic" required value={formInputs.nic} onChange={(e) => handleChange(e)} className={errors["nic"] ? "invalid" : ""} />
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
            <div className="form-row technician">
              <div className="form-item">
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
                  allowedFileTypes={[
                    'image/png',
                    'image/jpeg',
                    'image/jpg',
                  ]}
                  onFileChange={async (files) => {
                    if (files.length > 0) {
                      setFile(files);
                      await handleTechnicianImageUpload(files[0], "technicianFeNic");
                    } else {
                      setFile(null);
                    }
                  }}
                  uploadError={uploadError}
                  uploadErrorDescription={uploadErrorDescription}
                  onCancelClick={() => navigate("/app/technician-management")}
                  isLoading={imgLoading["technicianFeNic"]}
                  editImgPreview={editImgPreviews.feNic}
                  onRemoveFile={() => handleRemoveFilePreview("feNic")}
                  showCancelButton={false}
                />
                <label className="form-label required" htmlFor="nic-front">
                  <h4>Upload NIC</h4>
                </label>
                {errors.feNicPath && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.feNicPath}</h6>
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
                  allowedFileTypes={[
                    'image/png',
                    'image/jpeg',
                    'image/jpg',
                  ]}
                  onFileChange={async (files) => {
                    if (files.length > 0) {
                      setFile(files);
                      await handleTechnicianImageUpload(files[0], "technicianBeNic");
                    } else {
                      setFile(null);
                    }
                  }}
                  uploadError={uploadError}
                  uploadErrorDescription={uploadErrorDescription}
                  onCancelClick={() => navigate("/app/technician-management")}
                  isLoading={imgLoading["technicianBeNic"]}
                  editImgPreview={editImgPreviews.beNic}
                  onRemoveFile={() => handleRemoveFilePreview("beNic")}
                  showCancelButton={false}
                />
                <label className="form-label" htmlFor="nic-back" style={{ visibility: 'hidden' }}>
                  <h4>Upload NIC</h4>
                </label>
                {errors.beNicPath && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.beNicPath}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-item form-item__full">
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
                  allowedFileTypes={[
                    'image/png',
                    'image/jpeg',
                    'image/jpg',
                  ]}
                  onFileChange={async (files) => {
                    if (files.length > 0) {
                      setFile(files);
                      await handleTechnicianImageUpload(files[0], "technicianProfile");
                    } else {
                      setFile(null);
                    }
                  }}
                  uploadError={uploadError}
                  uploadErrorDescription={uploadErrorDescription}
                  onCancelClick={() => navigate("/app/technician-management")}
                  isLoading={imgLoading["technicianProfile"]}
                  editImgPreview={editImgPreviews.technicianProfile}
                  onRemoveFile={() => handleRemoveFilePreview("technicianProfile")}
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
          <div className="additional-info">
            <h3 className="info-header">
              Additional Information
            </h3>
            <div className="form-row">
              <div className="form-item disabled-form-item">
                <input type="text" name="primaryIdentifier" id="techinician-id" value={isEdit ? formInputs.primaryIdentifier : primaryId} disabled onChange={(e) => handleChange(e)} />
                <label className="form-label" htmlFor="techinician-id">
                  <h4>Technician ID</h4>
                </label>
                {errors.primaryIdentifier && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.primaryIdentifier}</h6>
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
              </div>
            </div>
            <div className="form-row">
              <div className="form-item disabled-form-item">
                <input type="text" name="registered-by" id="registered-by" value={isEdit ? formInputs.registeredBy : firstName + ' ' + lastName} disabled />
                <label className="form-label" htmlFor="registered-by">
                  <h4>Registered By</h4>
                </label>
              </div>
              <div className="form-item">
                <div className="input-wrapper input-wrapper__radio">
                  <div className="radio-wrapper">
                    <input type="radio" name="status" id="active" value="true" required checked={formInputs.status === true} onChange={(e) => handleChange(e)} />
                    <label className="radio-label" htmlFor="active">
                      Active
                    </label>
                  </div>
                  <div className="radio-wrapper">
                    <input type="radio" name="status" id="inactive" value="false" required checked={formInputs.status === false} onChange={(e) => handleChange(e)} />
                    <label className="radio-label" htmlFor="inactive">
                      Inactive
                    </label>
                  </div>
                </div>
                <label className="form-label" htmlFor="status">
                  <h4>Status</h4>
                </label>
                {errors.status && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.status}</h6>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="account-credentials">
            <h3 className="info-header">
              Account Credentials
            </h3>
            <div className="form-row">
              <div className={`form-item ${isEdit ? "disabled-form-item" : ""}`}>
                <input
                  type="text"
                  name="userName"
                  id="username"
                  value={formInputs.userName}
                  required
                  autoComplete="off"
                  onChange={(e) => handleChange(e)}
                  className={errors["userName"] ? "invalid" : ""}
                  disabled={isEdit}
                />
                <label className="form-label" htmlFor="username">
                  <h4>Username</h4>
                </label>
                {errors.userName && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.userName}</h6>
                  </div>
                )}
              </div>
              {!isEdit && (
                <div className="form-item">
                  <div className="password-wrapper">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      id="password"
                      value={password}
                      className={errors["password"] ? "invalid" : ""}
                      required
                    />
                    <span className="password-icon">
                      <img
                        src={passwordVisible ? Icons.eye_visible : Icons.eye_invisible}
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
              )}
            </div>
          </div>
          <div className="form-footer">
            <button
              type="submit"
              className="button button-submit"
              onClick={isEdit ? onUpdate : onSubmit}
              disabled={isLoading}
              id="technician-save-button"
            >
              <h5>{isLoading ? "Saving... Please wait." : isEdit ? "Update" : "Save"}</h5>
            </button>
            <button
              type="button"
              className="button button-cancel"
              onClick={handleCancelClick}
              id="technician-cancel-button"
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
      {showCancelPopup && (
        <CancelModal
          onClickConfirmModel={handleConfirmCancel}
          onClickCancelModel={handleCancelCancel}
        />
      )}
      <CreateSuccessModal
        visible={isSuccessModalVisible}
        setVisible={setIsSuccessModalVisible}
        email={formInputs.technicianEmail}
        password={formInputs.password}
      />
    </>
  );
};

export default TechnicianForm;