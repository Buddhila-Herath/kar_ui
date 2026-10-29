import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, notification } from "antd";
import Icons from "../../../utils/icons";
import TelephoneInput from "../../../shared/phoneInput/TelephoneInput";
import UploadComponent from "../../../shared/upload/UploadComponent";
import CreateSuccessModal from "./CreateSuccessModal";
import CancelModal from "../../../shared/components/CancelModal";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import Spinner from "../../../shared/components/loaders/Spinner";
import { Tokens, apiBaseURL, dateFormat } from "../../../constants";
import { format, parse } from "date-fns";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getConfig } from "../../../config/service";
import {
  addUserDetails,
  uploadImage,
  updateUserDetails,
  deleteUserDocument,
  setUserId,
  resetUserId
} from "../../../slices/vendor/userSlice";
import { fetchImageByPath } from "../../../slices/masterDataSlice";

const UserForm = ({ user = {}, isEdit = false, sId = 0 }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const firstName = localStorage.getItem(Tokens.FIRST_NAME);
  const lastName = localStorage.getItem(Tokens.LAST_NAME);

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
  const email = localStorage.getItem(Tokens.EMAIL);
  const [isFormModified, setIsFormModified] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadErrorDescription, setUploadErrorDescription] = useState("");
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const userId = useSelector((state) => state.users.userId || {});
  const isUserIdLoading = useSelector((state) => state.users.isUserIdLoading);

  const stompClientRef = useRef(null);
  const config = getConfig();
  const getUserId = localStorage.getItem(Tokens.USER_ID);
  const apacheServer = config.apiUrl + "api/v1/";

  const [imgLoading, setImgLoading] = useState({
    vendorUserFeNic: false,
    vendorUserBeNic: false,
    vendorUserProfile: false,
  });
  const [editImgPreviews, setEditImgPreviews] = useState({
    vendorUserFeNic: null,
    vendorUserBeNic: null,
    vendorUserProfile: null,
  });
  const [file, setFile] = useState(null);

  const [formInputs, setFormInputs] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    emailAddress: "",
    uploadNicFrontPath: "",
    uploadNicBackPath: "",
    profilePhotoPath: null,
    status: true,
    userName: "",
    password: password,
    vendorUserId: userId || null,
    joinedDate: format(new Date(), dateFormat.API_NATIVE),
    registerBy: `${firstName} ${lastName}`,
    nic: ""
  });

  useEffect(() => {
    if (isEdit && user && Object.keys(user).length > 0) {
      const formattedUser = {
        id: sId,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        contactNumber: user.contactNumber || "",
        emailAddress: user.emailAddress || "",
        nic: user.nic || "",
        uploadNicFrontPath: user.nicFePath || "",
        uploadNicBackPath: user.nicBePath || "",
        profilePhotoPath: user.profilePhotoPath || "",
        status: user.status ?? true, // Use nullish coalescing
        userName: user.userName || "",
        vendorUserId: user.userId || "",
        joinedDate: user.joinedDate || format(new Date(), dateFormat.API_NATIVE),
        registerBy: user.registerBy || `${firstName} ${lastName}`
      };
      
      setFormInputs(formattedUser);
      
      setEditImgPreviews({
        vendorUserFeNic: user.nicFePath || null,
        vendorUserBeNic: user.nicBePath || null,
        vendorUserProfile: user.profilePhotoPath || null,
      });
    }
  }, [isEdit, user, sId, email]);

  useEffect(() => {
    if (isEdit && user) {
      loadUserImages();
    }
  }, [isEdit, user, dispatch]);

  const loadUserImages = async () => {
    if (!isEdit || !user) return;

    const itemsToLoad = [
      { path: user.profilePhotoPath, previewKey: 'vendorUserProfile', loadingKey: 'vendorUserProfile' },
      { path: user.nicFePath, previewKey: 'vendorUserFeNic', loadingKey: 'vendorUserFeNic' },
      { path: user.nicBePath, previewKey: 'vendorUserBeNic', loadingKey: 'vendorUserBeNic' }
    ];

    for (const item of itemsToLoad) {
      if (!item.path) continue;
      setImgLoading((prev) => ({ ...prev, [item.loadingKey]: true }));
      try {
        const res = await dispatch(fetchImageByPath(item.path)).unwrap();
        setEditImgPreviews((prev) => ({ ...prev, [item.previewKey]: res.url }));
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
    emailAddress: "",
    nic: "",
    uploadNicFrontPath: "",
    uploadNicBackPath: "",
    profilePhotoPath: "",
    status: "",
    userName: "",
    password: "",
    vendorUserId: "",
  });

  useEffect(() => {
    if (!isEdit && userId) {
      setFormInputs((prevInputs) => ({
        ...prevInputs,
        vendorUserId: userId,
      }));
    }
  }, [userId, isEdit]);

  useEffect(() => {
    if (isEdit === false) {
      const socketUrl = `${apacheServer}${apiBaseURL?.GET_NOTIFICATION_LIST}`;
      const socket = new SockJS(socketUrl);

      const stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        connectHeaders: {
          userId: getUserId,
        },
        onConnect: () => {
          stompClient.subscribe("/topic/vendorUserId", (message) => {
            try {
              const receivedUserId = message.body.replace(/"/g, "");
              dispatch(setUserId(receivedUserId));
            } catch (error) {
              console.error("Error processing user id:", error);
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
        dispatch(resetUserId());
      };
    }
  }, [apacheServer, dispatch, isEdit]);

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

      case "contactNumber":
        if (!value) return "Contact Number field is required";
        if (!sriLankaPhoneRegex.test(value)) return "Must be a valid Contact Number";
        return "";

      case "emailAddress":
        if (!value) return "Email Address field is required";
        if (!emailRegex.test(value)) return "Enter a valid email address";
        if (value.length > 100) return "Enter a value that doesn't exceed 100 characters";
        return "";

      case "nic":
        if (!value) return "NIC field is required";
        if (!isValidSriLankaNIC(value)) return "Invalid Sri Lankan NIC format";
        return "";

      case "userName":
        if (!value) return "Username field is required";
        if (!/^[a-zA-Z0-9]+$/.test(value)) return "Username must contain only letters and numbers";
        if (value.length > 30) return "Username must not exceed 30 characters";
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
      "contactNumber",
      "emailAddress",
      "nic",
      "userName",
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

  const handleRemoveFilePreview = (fileType) => {
    setEditImgPreviews((prev) => ({
      ...prev,
      [fileType]: null,
    }));
    if (fileType === "vendorUserFeNic") {
      setFormInputs((prev) => ({
        ...prev,
        uploadNicFrontPath: "",
      }));
    } else if (fileType === "vendorUserBeNic") {
      setFormInputs((prev) => ({
        ...prev,
        uploadNicBackPath: "",
      }));
    } else {
      setFormInputs((prev) => ({
        ...prev,
        profilePhotoPath: "",
      }));
    }
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
        const dataToSend = {
          id: formInputs.id,
          firstName: formInputs.firstName,
          lastName: formInputs.lastName,
          contactNumber: formInputs.contactNumber,
          emailAddress: formInputs.emailAddress,
          nic: formInputs.nic,
          uploadNicFrontPath: formInputs.uploadNicFrontPath,
          uploadNicBackPath: formInputs.uploadNicBackPath,
          profilePhotoPath: formInputs.profilePhotoPath,
          status: formInputs.status,
          userName: formInputs.userName,
        };
        const resultAction = await dispatch(updateUserDetails(dataToSend));

        if (updateUserDetails.fulfilled.match(resultAction)) {
          notification.success({
            message: <h5>Updated Successfully!</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5,
          });
          navigate("/app/user-management");
        } else if (resultAction.payload?.errors) {
          const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
            const lower = error.toLowerCase();

            if (lower.includes("First name")) acc.firstName = error;
            if (lower.includes("Last name")) acc.lastName = error;
            if (lower.includes("contact number")) acc.contactNumber = error;
            if (lower.includes("email")) acc.emailAddress = error;
            if (lower.includes("NIC") || lower.includes("nic already exists")) acc.nic = error;
            if (lower.includes("NIC") || lower.includes("already exist nic")) acc.nic = error;
            if (lower.includes("front")) acc.uploadNicFrontPath = error;
            if (lower.includes("back")) acc.uploadNicBackPath = error;
            if (lower.includes("profile")) acc.profilePath = error;
            if (lower.includes("status")) acc.status = error;
            if (lower.includes("username") || lower.includes("user name")) acc.username = error;
            if (lower.includes("Password")) acc.password = error;
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
          setErrorTitle("Failed to save user.");
          setError(resultAction.payload);
          setShowPopup(true);
        }

      } catch (error) {
        setErrorIcon(Icons.error_email);
        setErrorTitle("Failed to save user.");
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
        const resultAction = await dispatch(addUserDetails(formInputs));

        if (addUserDetails.fulfilled.match(resultAction)) {
          setIsSuccessModalVisible(true);
        } else if (resultAction.payload?.errors) {
          const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
            const lower = error.toLowerCase();

            if (lower.includes("First name")) acc.firstName = error;
            if (lower.includes("Last name")) acc.lastName = error;
            if (lower.includes("contact number")) acc.contactNumber = error;
            if (lower.includes("email")) acc.emailAddress = error;
            if (lower.includes("NIC") || lower.includes("nic already exists")) acc.nic = error;
            if (lower.includes("NIC") || lower.includes("already exist nic")) acc.nic = error;
            if (lower.includes("front")) acc.uploadNicFrontPath = error;
            if (lower.includes("back")) acc.uploadNicBackPath = error;
            if (lower.includes("profile")) acc.profilePath = error;
            if (lower.includes("status")) acc.status = error;
            if (lower.includes("username") || lower.includes("user name")) acc.userName = error;
            if (lower.includes("Password")) acc.password = error;

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
          setErrorTitle("Failed to save user.");
          setError(resultAction.payload);
          setShowPopup(true);
        }

      } catch (error) {
        setErrorIcon(Icons.error_email);
        setErrorTitle("Failed to save user.");
        setError(error.message);
        setShowPopup(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUserImageUpload = async (selectedFile, type) => {
    if (!selectedFile) return;

    setUploadError("");
    setUploadErrorDescription("");

    const userId = formInputs.vendorUserId;

    if (!userId) {
      setUploadError("User ID not available");
      setUploadErrorDescription("Please wait for the user ID to be generated before uploading images.");
      return;
    }

    setImgLoading((prev) => ({ ...prev, [type]: true }))

    const formData = new FormData();
    formData.append("files", selectedFile);

    try {
      const result = await dispatch(
        uploadImage({ formData, userId, type })
      ).unwrap();
      if (result) {
        if (type === "vendorUserProfile") {
          setFormInputs((prevState) => ({
            ...prevState,
            profilePhotoPath: result,
          }));
          setErrors((prev) => ({
            ...prev,
            profilePhotoPath: "",
          }));
        } else if (type === "vendorUserFeNic") {
          setFormInputs((prevState) => ({
            ...prevState,
            uploadNicFrontPath: result,
          }));
          setErrors((prev) => ({
            ...prev,
            uploadNicFrontPath: "",
          }));
        } else if (type === "vendorUserBeNic") {
          setFormInputs((prevState) => ({
            ...prevState,
            uploadNicBackPath: result,
          }));
          setErrors((prev) => ({
            ...prev,
            uploadNicBackPath: "",
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
    }
    return null;
  };

  // Modify the handleChange function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsFormModified(true);
    setFormInputs((prev) => ({
      ...prev,
      [name]: value,
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
      <TopProgressBar isLoading={(isEdit === false ? isUserIdLoading : false) || isLoading} />
      {!isEdit && isUserIdLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="form-container admin-vendor-form">
            <div className="form-header">
              <div className="back">
                <Link to="/app/user-management" id="back-user-btn">
                  <img src={Icons.arrow_left} alt="Back Icon" />
                </Link>
                <h3>{isEdit ? "Edit User" : "Add New User"}</h3>
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
                        inputName="contactNumber"
                        value={formInputs.contactNumber || ""}
                        autoComplete="off"
                        onChange={(val) =>
                          handlePhoneChange(val, "contactNumber")
                        }
                        required
                        className={errors["contactNumber"] ? "invalid" : ""}
                      />
                    </div>
                    <label className="form-label" htmlFor="mobile-number">
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
                  <div className="form-item single">
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
                        mobileText="or drag & drop your image here"
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
                            await handleUserImageUpload(
                              files[0],
                              "vendorUserFeNic"
                            );
                          } else {
                            setFile(null);
                          }
                        }}
                        uploadError={uploadError}
                        uploadErrorDescription={uploadErrorDescription}
                        onCancelClick={() => navigate("/app/user-management")}
                        isLoading={imgLoading.vendorUserFeNic}
                        editImgPreview={editImgPreviews.vendorUserFeNic}
                        onRemoveFile={() => {
                          handleRemoveFilePreview("vendorUserFeNic");
                          setEditImgPreviews((prev) => ({
                            ...prev,
                            vendorUserFeNic: null,
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
                        mobileText="or drag & drop your image here"
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
                            await handleUserImageUpload(
                              files[0],
                              "vendorUserBeNic"
                            );
                          } else {
                            setFile(null);
                          }
                        }}
                        uploadError={uploadError}
                        uploadErrorDescription={uploadErrorDescription}
                        onCancelClick={() => navigate("/app/user-management")}
                        isLoading={imgLoading.vendorUserBeNic}
                        editImgPreview={editImgPreviews.vendorUserBeNic}
                        onRemoveFile={() => {
                          handleRemoveFilePreview("vendorUserBeNic");
                          setEditImgPreviews((prev) => ({
                            ...prev,
                            vendorUserBeNic: null,
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
                      mobileText="or drag & drop your image here"
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
                          await handleUserImageUpload(
                            files[0],
                            "vendorUserProfile"
                          );
                        } else {
                          setFile(null);
                        }
                      }}
                      uploadError={uploadError}
                      uploadErrorDescription={uploadErrorDescription}
                      onCancelClick={() => navigate("/app/user-management")}
                      isLoading={imgLoading.vendorUserProfile}
                      editImgPreview={editImgPreviews.vendorUserProfile}
                      onRemoveFile={() => {
                        handleRemoveFilePreview("vendorUserProfile");
                        setEditImgPreviews((prev) => ({
                          ...prev,
                          vendorUserProfile: null,
                        }));
                      }}
                      showCancelButton={false}
                    />
                    <label className="form-label" htmlFor="profile-photo">
                      <h4>Profile Photo</h4>
                    </label>
                    {errors.profilePhotoPath && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.profilePhotoPath}</h6>
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
                      name="vendorUserId"
                      id="user-id"
                      value={formInputs.vendorUserId || userId || ""}
                      disabled
                      onChange={handleChange}
                    />
                    <label className="form-label" htmlFor="user-id">
                      <h4>User ID</h4>
                    </label>
                    {errors.vendorUserId && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.vendorUserId}</h6>
                      </div>
                    )}
                  </div>
                  <div className="form-item disabled-form-item">
                    <div className="position-relative datepicker p-0">
                      <input
                        type="text"
                        value={formInputs.joinedDate}
                        name="joinedDate" 
                        id="joined-date"
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
                    <input type="text" name="registered-by" id="registered-by" value={ isEdit ? formInputs.registerBy : firstName + ' ' + lastName} disabled />
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
                        name="userName"
                        id="username"
                        autoComplete="off"
                        required
                        className={errors["userName"] ? "invalid" : ""}
                        value={formInputs.userName}
                        onChange={handleChange}
                      />
                      <label className="form-label" htmlFor="userName">
                        <h4>Username</h4>
                      </label>
                      {errors.userName && (
                        <div className="field-error">
                          <img src={Icons.warning_circle} alt="Warning Icon" />
                          <h6>{errors.userName}</h6>
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
                    onClick={isEdit ? onUpdate : onSubmit}
                    disabled={isLoading || Object.values(imgLoading).some(loading => loading)}
                  >
                    <h5>
                    {isLoading 
                      ? "Saving... Please wait." 
                      : Object.values(imgLoading).some(loading => loading)
                        ? "Uploading images... Please wait."
                        : isEdit ? "Update" : "Save"
                    }
                    </h5>
                  </button>
                  <button
                    type="button"
                    className="button button-cancel"
                    onClick={handleCancelClick}
                  >
                    <h5>Cancel</h5>
                  </button>
                </div>
              </div>
            </Form>
          </div>
        </>
      )}
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

export default UserForm;
