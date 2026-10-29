import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, notification } from "antd";
import Icons from "../../../utils/icons";
import UploadComponent from "../../../shared/upload/UploadComponent";
import TelephoneInput from "../../../shared/phoneInput/TelephoneInput";
import CustomMultipleSelect from "../../../shared/select/CustomMultipleSelect";
import CustomRadioSelect from "../../../shared/select/CustomRadioSelect";
import { dateFormat } from "../../../constants";
import { format } from "date-fns";
import { apiBaseURL, Tokens } from "../../../constants/index";
import { setClientId, resetClientId } from "../../../slices/vendor/clientSlice";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getConfig } from "../../../config/service";
import {
  uploadClientImage,
  addClientDetails,
  fetchAllVehicleRegistrationNo,
} from "../../../slices/vendor/clientSlice";
import { fetchAllCustomerList } from "../../../slices/vendor/quoteSlice";
import { fetchAllCityList } from "../../../slices/locationDataSlice";

const AddOwnerModal = ({ onSubmit, handleModalClose, isModalOpen }) => {
  const dispatch = useDispatch();

  const { allCity } = useSelector((state) => state.locations);
  const { allVehicleRegistrationNo } = useSelector(
    (state) => state.vendorClients
  );
  const { allCustomerList } = useSelector((state) => state.vendorQuotes);
  const [clientProfileBase64, setClientProfileBase64] = useState(null);
  const stompClientRef = useRef(null);
  const config = getConfig();
  const { clientId, isClientIdLoading } = useSelector(
    (state) => state.vendorClients
  );
  const apacheServer = config.apiUrl + "api/v1/";
  const getUserId = localStorage.getItem(Tokens.USER_ID);
  const [errorIcon, setErrorIcon] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(false);
  const [districtName, setDistrictName] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const firstName = localStorage.getItem(Tokens.FIRST_NAME);
  const lastName = localStorage.getItem(Tokens.LAST_NAME);
  const email = localStorage.getItem(Tokens.EMAIL);
  const [showPopup, setShowPopup] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadErrorDescription, setUploadErrorDescription] = useState("");
  const [imgLoading, setImgLoading] = useState({
    clientProfile: false,
  });
  const [editImgPreviews, setEditImgPreviews] = useState({
    clientProfile: null,
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    // Always generate new owner ID for add functionality
    const socketUrl = `${apacheServer}${apiBaseURL?.GET_CUSTOMERVEHICLE_LIST}`;
    const socket = new SockJS(socketUrl);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: {
        userId: getUserId,
      },
      debug: (str) => console.log("[STOMP DEBUG]", str),
      onConnect: () => {
        stompClient.subscribe("/topic/clientId", (message) => {
          try {
            const receivedClientId = message.body.replace(/"/g, "");
            dispatch(setClientId(receivedClientId));
          } catch (error) {
            console.error("Error processing clientId:", error);
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
      dispatch(resetClientId());
    };
  }, [apacheServer, dispatch]);

  // Update formInputs when clientId is received
  useEffect(() => {
    if (clientId) {
      setFormInputs((prev) => ({
        ...prev,
        clientId: clientId,
      }));
    }
  }, [clientId]);

  const closePopup = () => {
    setShowPopup(false);
    setErrorIcon("");
    setErrorTitle("");
    setError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  useEffect(() => {
    dispatch(fetchAllCityList());
    dispatch(fetchAllVehicleRegistrationNo());
    dispatch(fetchAllCustomerList());
  }, [dispatch]);

  const vehicleOptions = useMemo(() => {
    const availableVehicles = (allVehicleRegistrationNo || []).map(
      (option) => ({
        label: option.vehicleRegNum,
        value: option.id,
      })
    );

    return availableVehicles;
  }, [allVehicleRegistrationNo]);

  const ownerOptions = useMemo(() => {
    const availableOwners = (allCustomerList || []).map((customer) => ({
      label: `${customer.firstName} ${customer.lastName}`,
      value: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.contactNumber,
    }));

    return availableOwners;
  }, [allCustomerList]);

  const [formInputs, setFormInputs] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    addressLine1: "",
    addressLine2: null,
    cityId: "",
    countryId: "22ac3753-b877-11ef-af09-0e26aba8ece7",
    companyName: null,
    companyAddress: null,
    customerVatNumber: null,
    profilePhoto: null,
    joinedDate: format(new Date(), dateFormat.API_NATIVE),
    registeredBy: email,
    username: "",
    vehicleIdList: [],
    clientId: clientId,
    status: true,
  });

  const allCitiesOptions = allCity.map((city) => ({
    label: city.cityName,
    value: city.id,
  }));

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    cityId: "",
    postalCode: "",
    districtId: "",
    province: "",
    countryId: "",
    companyName: "",
    companyAddress: "",
    customerVatNumber: "",
    profilePhoto: "",
    clientId: "",
    joinedDate: "",
    registeredBy: "",
    username: "",
    vehicleIdList: "",
  });

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
    if (!formInputs.addressLine1) {
      formErrors.addressLine1 = "Address Line 1 field is required";
      isValid = false;
    } else if (formInputs.addressLine1.length > 60) {
      formErrors.addressLine1 = "Must not exceed 60 characters";
      isValid = false;
    }
    if (formInputs.addressLine2 && formInputs.addressLine2.length > 60) {
      formErrors.addressLine2 = "Must not exceed 60 characters";
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
    if (!formInputs.cityId) {
      formErrors.cityId = "City field is required";
      isValid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formInputs.email) {
      formErrors.email = "Email Address field is required";
      isValid = false;
    } else if (!emailRegex.test(formInputs.email)) {
      formErrors.email = "Must be a valid Email address";
      isValid = false;
    } else if (formInputs.email.length > 100) {
      formErrors.email = "Enter a value that doesn't exceed 100 characters";
      isValid = false;
    }
    const usernameRegex = /^[a-zA-Z0-9]{1,30}$/;
    if (!formInputs.username) {
      formErrors.username = "Username field is required";
      isValid = false;
    } else if (!usernameRegex.test(formInputs.username)) {
      formErrors.username =
        "Username must be alphanumeric, max 30 characters, and contain no spaces or special characters";
      isValid = false;
    }
    if (!formInputs.clientId) {
      formErrors.clientId = "Client ID field is required";
      isValid = false;
    }
    if (!formInputs.registeredBy) {
      formErrors.registeredBy = "Registered By field is required";
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

  const handlePhoneChange = (phone) => {
    const sriLankaPhoneRegex = /^\+94\s\d{2}\s\d{3}\s\d{4}$/;
    const errorMsg = !phone
      ? "Contact Number field is required"
      : !sriLankaPhoneRegex.test(phone)
      ? "Must be a valid Contact Number"
      : "";

    setFormInputs((prev) => ({
      ...prev,
      contactNumber: phone,
    }));

    setErrors((prev) => ({
      ...prev,
      contactNumber: errorMsg,
    }));
  };

  const handleClientImageUpload = async (selectedFile) => {
    if (!selectedFile) return;
    setUploadError("");
    setUploadErrorDescription("");
    setImgLoading(true);
    setIsImgLoading(true);

    const formData = new FormData();
    formData.append("files", selectedFile);

    try {
      const result = await dispatch(
        uploadClientImage({ formData, clientId })
      ).unwrap();
      if (result) {
        setFormInputs((prevState) => ({
          ...prevState,
          profilePhoto: result,
        }));
        setErrors((prev) => ({
          ...prev,
          profilePhoto: "",
        }));
      }
    } catch (error) {
      const errorDetails =
        (error.errors && error.errors.join(", ")) ||
        "An unknown error occurred.";

      setUploadError("Upload failed");
      setUploadErrorDescription(errorDetails);
    } finally {
      setIsImgLoading(false);
    }
    return null;
  };

  const handleRemoveFilePreview = (fileType) => {
    setEditImgPreviews((prev) => ({
      ...prev,
      [fileType]: null,
    }));
    setFormInputs((prev) => ({
      ...prev,
      profilePhoto: null,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (name === "firstName") {
      const errorMsg = !value
        ? "First Name field is required"
        : !/^[A-Za-z]+$/.test(value)
        ? "First name must contain only letters"
        : value.length > 30
        ? "Enter a value that doesn't exceed 30 characters"
        : "";
      setErrors((prev) => ({ ...prev, firstName: errorMsg }));
    } else if (name === "lastName") {
      const errorMsg = !value
        ? "Last Name field is required"
        : !/^[A-Za-z]+$/.test(value)
        ? "Last name must contain only letters"
        : value.length > 30
        ? "Enter a value that doesn't exceed 30 characters"
        : "";
      setErrors((prev) => ({ ...prev, lastName: errorMsg }));
    } else if (name === "addressLine1") {
      const errorMsg = !value
        ? "Address Line 1 field is required"
        : value.length > 60
        ? "Must not exceed 60 characters"
        : "";
      setErrors((prev) => ({ ...prev, addressLine1: errorMsg }));
    } else if (name === "addressLine2") {
      const errorMsg =
        value && value.length > 60 ? "Must not exceed 60 characters" : "";
      setErrors((prev) => ({ ...prev, addressLine2: errorMsg }));
    } else if (name === "companyName") {
      const errorMsg = value
        ? !/^[A-Za-z\s]+$/.test(value)
          ? "Company name must contain only letters"
          : value.length > 30
          ? "Enter a value that doesn't exceed 30 characters"
          : ""
        : "";
      setErrors((prev) => ({ ...prev, companyName: errorMsg }));
    } else if (name === "companyAddress") {
      const errorMsg =
        value && value.length > 60 ? "Must not exceed 60 characters" : "";
      setErrors((prev) => ({ ...prev, companyAddress: errorMsg }));
    } else if (name === "customerVatNumber") {
      const errorMsg =
        value && value.length > 20 ? "Must not exceed 20 characters" : "";
      setErrors((prev) => ({ ...prev, customerVatNumber: errorMsg }));
    } else if (name === "username") {
      const usernameRegex = /^[a-zA-Z0-9]{1,30}$/;
      const errorMsg = !value
        ? "Username field is required"
        : !usernameRegex.test(value)
        ? "Username must be alphanumeric, max 30 characters, and contain no spaces or special characters"
        : "";
      setErrors((prev) => ({ ...prev, username: errorMsg }));
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const errorMsg = !value
        ? "Email Address field is required"
        : !emailRegex.test(value)
        ? "Must be a valid Email address"
        : value.length > 100
        ? "Enter a value that doesn't exceed 100 characters"
        : "";
      setErrors((prev) => ({ ...prev, email: errorMsg }));
    } else if (name === "contactNumber") {
      const sriLankaPhoneRegex = /^\+94\s\d{2}\s\d{3}\s\d{4}$/;
      const errorMsg = !value
        ? "Contact Number field is required"
        : !sriLankaPhoneRegex.test(value)
        ? "Must be a valid Contact Number"
        : "";
      setErrors((prev) => ({ ...prev, contactNumber: errorMsg }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setFormInputs((prev) => {
      let updatedInputs = {
        ...prev,
        [name]: type === "radio" ? value === "true" : value,
      };
      return updatedInputs;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const valid = handleValidation();
    if (valid) {
      setIsLoading(true);
      try {
        // Add clientId to formInputs before sending to API
        const dataToSend = {
          ...formInputs,
          clientId: clientId,
        };
        const resultAction = await dispatch(addClientDetails(dataToSend));
        if (addClientDetails.fulfilled.match(resultAction)) {
          notification.success({
            message: <h5>Owner added successfully!</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5,
          });

          const ownerData = {
            name: `${formInputs.firstName} ${formInputs.lastName}`,
            firstName: formInputs.firstName,
            lastName: formInputs.lastName,
            email: formInputs.email,
            phone: formInputs.contactNumber,
            vehicleIdList: formInputs.vehicleIdList || [],
            clientId: formInputs.clientId
          };
          onSubmit(ownerData);
          handleModalClose();
        } else if (resultAction.payload?.errors) {
          const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
            const lower = error.toLowerCase();

            if (error.includes("First name")) {
              acc.firstName = error;
            }
            if (error.includes("Last name")) {
              acc.lastName = error;
            }
            if (error.includes("contact number")) {
              acc.contactNumber = error;
            }
            if (lower.includes("email")) {
              acc.email = error;
            }
            if (error.includes("Address Line 1")) {
              acc.addressLine1 = error;
            }
            if (error.includes("Address Line 2")) {
              acc.addressLine2 = error;
            }
            if (lower.includes("profile")) {
              acc.profilePhoto = error;
            }
            if (lower.includes("city")) {
              acc.cityId = error;
            }
            if (lower.includes("Company Name")) {
              acc.companyName = error;
            }
            if (lower.includes("Company Address")) {
              acc.companyAddress = error;
            }
            if (
              lower.includes(
                "client with provided customer vat number already exists."
              ) ||
              lower.includes("customer vat number")
            ) {
              acc.customerVatNumber = error;
            }
            if (
              lower.includes("vehicle with id") &&
              lower.includes("already assigned")
            ) {
              acc.vehicleIdList = error;
            }
            if (error.includes("username")) {
              acc.username = error;
            }
            if (error.includes("User name")) {
              acc.username = error;
            }
            if (
              lower.includes(
                "client with provided client id number already exists"
              ) ||
              lower.includes("client id number")
            ) {
              acc.clientId = error;
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
          setErrorTitle("Failed to add owner.");
          setError(resultAction.payload);
          setShowPopup(true);
        }
      } catch (error) {
        setErrorIcon(Icons.error_email);
        setErrorTitle("Failed to add owner.");
        setError(error.message);
        setShowPopup(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        if (!value) {
          return "First Name field is required";
        } else if (!/^[A-Za-z]+$/.test(value)) {
          return "First name must contain only letters";
        } else if (value.length > 30) {
          return "Enter a value that doesn't exceed 30 characters";
        }
        break;
      case "lastName":
        if (!value) {
          return "Last Name field is required";
        } else if (!/^[A-Za-z]+$/.test(value)) {
          return "Last name must contain only letters";
        } else if (value.length > 30) {
          return "Enter a value that doesn't exceed 30 characters";
        }
        break;
      case "addressLine1":
        if (!value) {
          return "Address Line 1 field is required";
        } else if (value.length > 60) {
          return "Must not exceed 60 characters";
        }
        break;
      case "cityId":
        if (!value) {
          return "City field is required";
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          return "Email Address field is required";
        } else if (!emailRegex.test(value)) {
          return "Must be a valid Email address";
        } else if (value.length > 100) {
          return "Enter a value that doesn't exceed 100 characters";
        }
        break;
      case "username":
        const usernameRegex = /^[a-zA-Z0-9]{1,30}$/;
        if (!value) {
          return "Username field is required";
        } else if (!usernameRegex.test(value)) {
          return "Username must be alphanumeric, max 30 characters, and contain no spaces or special characters";
        }
        break;
      default:
        return "";
    }
    return "";
  };

  return (
    <Modal
      open={isModalOpen}
      onCancel={handleModalClose}
      footer={null}
      centered
      width={860}
      title={<h3>Add New Owner</h3>}
      className="add-modal quote owner-add"
    >
      <div className="add-modal-section owner-add-section">
        <div className="personal-info">
          <h3 className="info-header">Owner Information</h3>
          <div className="form-row">
            <div className="form-item">
              <input
                type="text"
                autoComplete="off"
                name="firstName"
                id="first-name"
                required
                value={formInputs.firstName}
                className={errors["firstName"] ? "invalid" : ""}
                onChange={(e) => handleChange(e)}
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
                autoComplete="off"
                name="lastName"
                id="last-name"
                required
                value={formInputs.lastName}
                className={errors["lastName"] ? "invalid" : ""}
                onChange={(e) => handleChange(e)}
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
                  onChange={(val) => handlePhoneChange(val, "contactNumber")}
                  value={formInputs.contactNumber}
                  required
                  className={errors["contactNumber"] ? "invalid" : ""}
                />
              </div>
              <label className="form-label" htmlFor="contactNumber">
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
                name="email"
                id="email"
                value={formInputs.email}
                required
                className={errors["email"] ? "invalid" : ""}
                onChange={(e) => handleChange(e)}
                autoComplete="off"
              />
              <label className="form-label" htmlFor="email">
                <h4>Email Address</h4>
              </label>
              {errors.email && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.email}</h6>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-item">
              <input
                type="text"
                name="addressLine1"
                id="addressLine1"
                value={formInputs.addressLine1}
                required
                className={errors["addressLine1"] ? "invalid" : ""}
                onChange={(e) => handleChange(e)}
                autoComplete="off"
              />
              <label className="form-label" htmlFor="addressLine1">
                <h4>Address Line 1</h4>
              </label>
              {errors.addressLine1 && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.addressLine1}</h6>
                </div>
              )}
            </div>

            <div className="form-item">
              <input
                type="text"
                name="addressLine2"
                id="addressLine2"
                value={formInputs.addressLine2}
                className={errors["addressLine2"] ? "invalid" : ""}
                onChange={(e) => handleChange(e)}
                autoComplete="off"
              />
              <label className="form-label" htmlFor="addressLine2">
                <h4>Address Line 2</h4>
              </label>
              {errors.addressLine2 && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.addressLine2}</h6>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-item">
              <CustomRadioSelect
                options={allCitiesOptions}
                key={formInputs.cityId}
                placeholderText="Select"
                required
                name="city"
                onBlur={handleBlur}
                defaultValue={formInputs.cityId}
                value={formInputs.cityId}
                isValid={errors["cityId"] ? "invalid" : ""}
                onChange={(selected) => {
                  const selectedCity = allCity.find(
                    (city) => city.id === selected.value
                  );
                  setFormInputs((prev) => ({
                    ...prev,
                    cityId: selected.value,
                    postalCode: selectedCity?.postalCode || "",
                    district: selectedCity?.districtName || "",
                    province: selectedCity?.provinceName || "",
                  }));
                  setDistrictName(selectedCity?.districtName || "");
                  setProvinceName(selectedCity?.provinceName || "");
                  setPostalCode(selectedCity?.postalCode || "");
                  setErrors((prev) => ({
                    ...prev,
                    cityId: "",
                    postalCode: "",
                    districtName: "",
                    provinceName: "",
                  }));
                }}
              />
              <label className="form-label" htmlFor="cityId">
                <h4>City/Town</h4>
              </label>
              {errors.cityId && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.cityId}</h6>
                </div>
              )}
            </div>

            <div className="form-item disabled-form-item">
              <input
                type="text"
                name="postal-code"
                id="postal-code"
                disabled
                className={errors["postalCode"] ? "invalid" : ""}
                value={formInputs.postalCode || postalCode}
                onChange={(e) => handleChange(e)}
              />
              <label className="form-label service-cost" htmlFor="postal-code">
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
                disabled
                className={errors["districtName"] ? "invalid" : ""}
                value={formInputs.district || districtName}
                onChange={(e) => handleChange(e)}
              />

              <label className="form-label service-cost" htmlFor="districtName">
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
                id="provinceName"
                disabled
                value={formInputs.province || provinceName}
                className={errors["provinceName"] ? "invalid" : ""}
                onChange={(e) => handleChange(e)}
              />

              <label className="form-label service-cost" htmlFor="provinceName">
                <h4>Province</h4>
              </label>
              {errors.province && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.province}</h6>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-item disabled-form-item">
              <input
                type="text"
                name="country"
                id="country"
                value="Sri Lanka"
                disabled
                className={errors["countryId"] ? "invalid" : ""}
                onChange={(e) => handleChange(e)}
                autoComplete="off"
              />
              <label className="form-label service-cost" htmlFor="country">
                <h4>Country</h4>
              </label>
              {errors.countryId && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.countryId}</h6>
                </div>
              )}
            </div>

            <div className="form-item">
              <input
                type="text"
                name="companyName"
                id="companyName"
                value={formInputs.companyName}
                className={errors["companyName"] ? "invalid" : ""}
                onChange={(e) => handleChange(e)}
                autoComplete="off"
              />
              <label className="form-label" htmlFor="companyName">
                <h4>Company Name</h4>
              </label>
              {errors.companyName && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.companyName}</h6>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-item">
              <input
                type="text"
                name="companyAddress"
                id="companyAddress"
                value={formInputs.companyAddress}
                className={errors["companyAddress"] ? "invalid" : ""}
                onChange={(e) => handleChange(e)}
                autoComplete="off"
              />
              <label className="form-label" htmlFor="companyAddress">
                <h4>Company Address</h4>
              </label>
              {errors.companyAddress && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.companyAddress}</h6>
                </div>
              )}
            </div>

            <div className="form-item">
              <input
                type="text"
                name="customerVatNumber"
                id="customerVatNumber"
                value={formInputs.customerVatNumber}
                className={errors["customerVatNumber"] ? "invalid" : ""}
                onChange={(e) => handleChange(e)}
                autoComplete="off"
              />
              <label className="form-label" htmlFor="customerVatNumber">
                <h4>Customer VAT Number</h4>
              </label>
              {errors.customerVatNumber && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.customerVatNumber}</h6>
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
                allowedFileTypes={["image/png", "image/jpeg", "image/jpg"]}
                onFileChange={async (files) => {
                  if (files.length > 0) {
                    setFile(files);
                    await handleClientImageUpload(files[0], "clientProfile");
                  } else {
                    setFile(null);
                  }
                }}
                uploadError={uploadError}
                uploadErrorDescription={uploadErrorDescription}
                onCancelClick={() => handleModalClose()}
                isLoading={imgLoading["clientProfile"] || isImgLoading}
                editImgPreview={clientProfileBase64}
                onRemoveFile={() => {
                  handleRemoveFilePreview("clientProfile");
                  setClientProfileBase64(null);
                  setEditImgPreviews((prev) => ({
                    ...prev,
                    clientProfile: null,
                  }));
                }}
                showCancelButton={false}
              />
              <label className="form-label" htmlFor="profile-photo">
                <h4>Profile Photo</h4>
              </label>
              {errors.profilePhoto && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.profilePhoto}</h6>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="additional-info">
          <h3 className="info-header">Vehicle Information</h3>
          <div className="form-row">
            <div className="form-item">
              <CustomMultipleSelect
                options={vehicleOptions}
                value={formInputs.vehicleIdList || []}
                onChange={(selectedValues) => {
                  setFormInputs((prev) => ({
                    ...prev,
                    vehicleIdList: selectedValues,
                  }));
                  setErrors((prev) => ({
                    ...prev,
                    vehicleIdList: "",
                  }));
                }}
                onAddFormData={(newVehicle) => {
                  console.log("Add new vehicle:", newVehicle);
                  return Promise.resolve();
                }}
                isValid={errors.vehicleIdList ? "invalid" : ""}
                required={false}
                showAddButton={false}
              />
              <label className="form-label" htmlFor="registrationNumber">
                <h4>Vehicle Registration No</h4>
              </label>
              {errors.vehicleIdList && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.vehicleIdList}</h6>
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
                name="clientId"
                id="clientId"
                value={clientId}
                disabled
                onChange={(e) => handleChange(e)}
              />
              <label className="form-label" htmlFor="clientId">
                <h4>Client ID</h4>
              </label>
              {errors.clientId && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.clientId}</h6>
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
                  disabled
                />
                <img
                  src={Icons.calendar}
                  alt="Calendar Icon"
                  className="input-icon"
                />
              </div>
              <label className="form-label" htmlFor="joined-date">
                <h4>Joined Date</h4>
              </label>
            </div>
          </div>
          <div className="form-row">
            <div className="form-item disabled-form-item">
              <input
                type="text"
                name="registered-by"
                id="registered-by"
                value={`${firstName} ${lastName}`}
                disabled
              />
              <label className="form-label" htmlFor="registered-by">
                <h4>Registered By</h4>
              </label>
            </div>
          </div>
        </div>
        <div className="account-credentials">
          <h3 className="info-header">Account Credentials</h3>
          <div className="form-row">
            <div className="form-item single">
              <input
                type="text"
                name="username"
                id="username"
                value={formInputs.username}
                required
                autoComplete="off"
                onChange={(e) => handleChange(e)}
                className={errors["username"] ? "invalid" : ""}
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
        </div>
        <div className="footer custom-footer owner-add-modal add-modal-button">
          <button
            type="submit"
            className="button button-submit"
            onClick={handleSubmit}
            disabled={isLoading}
            id="submit-add-owner-modal-btn"
          >
            <h5>{isLoading ? "Saving... Please wait." : "Save"}</h5>
          </button>
          <button
            type="button"
            className="pop-cancel-btn add-modal-cancel"
            onClick={handleModalClose}
            id="cancel-add-owner-modal-btn"
          >
            <h5>Cancel</h5>
          </button>
        </div>
      </div>
      {showPopup && (
        <>
          <div className="overlay"></div>
          <div className="error-popup">
            <div className="error-popup-content">
              <span className="close-icon" onClick={closePopup}></span>
              <img src={errorIcon} alt="error" className="error-icon" />
              <h2>{errorTitle}</h2>
              {errorTitle !== error ? <p>{error}</p> : <p></p>}
              <button onClick={closePopup} id="retry-add-owner-modal-btn">Retry</button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};

export default AddOwnerModal;
