import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { notification } from "antd";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import EditProfilePictureModal from "../../../shared/upload/EditProfilePictureModal";
import {
  placeholderText,
  getFormattedMessage,
} from "../../../shared/sharedMethod";
import Spinner from "../../../shared/components/loaders/Spinner";
import Icons from "../../../utils/icons";
import update_image from "../../../assets/images/image.svg";
import { fetchMyProfile, updateProfile } from "../../../slices/profileSlice";
import { MaskedInput, createDefaultMaskGenerator } from "react-hook-mask";
import { loadImageForDisplay } from "../../../utils/imageUtils";

const maskGenerator = createDefaultMaskGenerator("+94 999 999 999");

// validation function
const isValidSriLankaPhoneNumber = (phone) => {
  const sriLankaPhoneRegex = /^\+94\s\d{3}\s\d{3}\s\d{3}$/;
  return sriLankaPhoneRegex.test(phone);
};

const ProfileEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myProfile, isProfileLoading } = useSelector((state) => state.profile);
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [errorIcon, setErrorIcon] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePhotoImg, setProfilePhotoImg] = useState(null);
  const [isProfilePhotoLoading, setIsProfilePhotoLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [profileEditInputs, setProfileEditInputs] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
  });

  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
  });

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (myProfile && !initialLoadDone) {
      setProfileEditInputs({
        first_name: myProfile.firstName,
        last_name: myProfile.lastName,
        email: myProfile.email,
        contact_number: myProfile.mobileNumber,
      });
      loadProfileImage();
      setInitialLoadDone(true);
    }
  }, [myProfile, initialLoadDone]);

  const loadProfileImage = async () => {
    await loadImageForDisplay(
      myProfile?.profilePhotoPath,
      dispatch,
      setProfilePhotoImg
    );
  };

  const handleValidation = () => {
    let errorss = {};
    let isValid = true;
    
    if (!profileEditInputs.first_name) {
        errorss.first_name = getFormattedMessage(
            "profile.input.first-name.validate.label"
        );
        isValid = false;
    } else if (!/^[A-Za-z]+$/.test(profileEditInputs.first_name)) {
        errorss.first_name = "First name must contain only letters";
        isValid = false;
    } else if (profileEditInputs.first_name.length > 30) {
        errorss.first_name = getFormattedMessage(
            "profile.input.length.validate.label"
        );
        isValid = false;
    }

    if (!profileEditInputs.last_name) {
        errorss.last_name = getFormattedMessage(
            "profile.input.last-name.validate.label"
        );
        isValid = false;
    } else if (!/^[A-Za-z]+$/.test(profileEditInputs.last_name)) {
        errorss.last_name = "Last name must contain only letters";
        isValid = false;
    } else if(profileEditInputs.last_name.length > 30) {
        errorss.last_name = getFormattedMessage(
            "profile.input.length.validate.label"
        );
        isValid = false;
    }

    if (!profileEditInputs.email) {
        errorss.email = getFormattedMessage("profile.input.email.validate.label");
        isValid = false;
    }

    if (!profileEditInputs.contact_number) {
    errorss.contact_number = getFormattedMessage(
        "profile.input.contact-number.validate.label"
    );
    isValid = false;
    } else if (!isValidSriLankaPhoneNumber(profileEditInputs.contact_number)) {
        errorss.contact_number = (
            <>
                Must be a valid contact number.
                <br />
                Format: +94 278 351 289
            </>
        );
        isValid = false;
    }
    
        setErrors(errorss);
        return isValid;
    };

  const prepareFormData = () => {
    const formData = new FormData();
    formData.append("firstName", profileEditInputs.first_name);
    formData.append("lastName", profileEditInputs.last_name);
    formData.append("mobileNumber", profileEditInputs.contact_number);
    return formData;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "first_name") {
      const errorMsg = !value
        ? getFormattedMessage("profile.input.first-name.validate.label")
        : !/^[A-Za-z]+$/.test(value)
        ? "First name must contain only letters"
        : value.length > 30
        ? getFormattedMessage("profile.input.length.validate.label")
        : "";
      setErrors((prev) => ({
        ...prev,
        [name]: errorMsg,
      }));
    } else if (name === "last_name") {
      const errorMsg = !value
        ? getFormattedMessage("profile.input.last-name.validate.label")
        : !/^[A-Za-z]+$/.test(value)
        ? "Last name must contain only letters"
        : value.length > 30
        ? getFormattedMessage("profile.input.length.validate.label")
        : "";
      setErrors((prev) => ({
        ...prev,
        [name]: errorMsg,
      }));
    } else if (name === "contact_number") {
    const errorMsg = !value
    ? getFormattedMessage("profile.input.contact-number.validate.label")
    : !isValidSriLankaPhoneNumber(value)
    ? (
        <>
          Must be a valid contact number.
          <br />
          Format: +94 278 351 289
        </>
      )
    : "";
      setErrors((prev) => ({
        ...prev,
        [name]: errorMsg,
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    setProfileEditInputs((inputs) => ({
      ...inputs,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const valid = handleValidation();
    if (valid) {
      setIsProfileUpdating(true);
      try {
        const resultAction = await dispatch(
          updateProfile(prepareFormData(profileEditInputs))
        );
        if (updateProfile.fulfilled.match(resultAction)) {
          navigate("/admin/my-profile/basic-details");
          notification.success({
            message: <h5>Your changes have been saved.</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5,
          });
        } else {
          setErrorIcon(Icons.delete_warning);
          setErrorTitle("Failed to update profile.");
          setError(resultAction.payload);
          setShowPopup(true);
        }
      } catch (error) {
        setErrorIcon(Icons.delete_warning);
        setErrorTitle("Failed to update profile.");
        setError(error.message);
        setShowPopup(true);
      } finally {
        setIsProfileUpdating(false);
      }
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setErrorIcon("");
    setErrorTitle("");
    setError("");
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    dispatch(fetchMyProfile());
  };

  return (
    <MasterLayout>
      <TabTitle title={placeholderText("profile.title")} />
      <Breadcrumb
        parent_menu="Profile Settings"
        parent_menu_url="/admin/my-profile"
        second_level_page="Basic Details"
        second_level_page_url="/admin/my-profile/basic-details"
        current_page="Edit Basic Details"
      />
      {isProfileLoading ? (
        <Spinner />
      ) : (
        <div className="profile-edit-container">
          <div className="profile-header">
            <div className="back">
              <Link to="/admin/my-profile/basic-details">
                <img src={Icons.arrow_left} alt="back" />
              </Link>
              <h3>Edit Basic Details</h3>
            </div>
          </div>
          <div className="profile-card">
            <div className="profile-edit-avatar">
              {isProfilePhotoLoading ? (
                  <div>
                    <Spinner/>
                  </div>
              ) : profilePhotoImg ? (
                <img
                  src={profilePhotoImg}
                  alt="Profile Photo"
                />
              ) : (
                <img src={Icons.avatar} alt="Profile Photo" />
              )}
              <div
                className="edit-update-photo"
                id="edit-photo-update"
                onClick={() => setIsModalOpen(true)}
              >
                <img src={update_image} alt="Profile Photo" />
                <h5>Update Photo</h5>
              </div>
            </div>
            <div className="profile-edit-details-form">
              <div className="form-row">
                <div className="form-item">
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    autoComplete="off"
                    value={profileEditInputs.first_name}
                    onChange={(e) => handleChange(e)}
                  />
                  <label className="form-label" htmlFor="first-name">
                    <h4>First Name</h4>
                  </label>
                  {errors["first_name"] && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors["first_name"]}</h6>
                    </div>
                  )}
                </div>
                <div className="form-item">
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    autoComplete="off"
                    value={profileEditInputs.last_name}
                    onChange={(e) => handleChange(e)}
                  />
                  <label className="form-label" htmlFor="last-name">
                    <h4>Last Name</h4>
                  </label>
                  {errors["last_name"] && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors["last_name"]}</h6>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-item disabled-form-item">
                  <input
                    type="text"
                    name="email"
                    id="email"
                    disabled
                    autoComplete="off"
                    value={profileEditInputs.email}
                    onChange={(e) => handleChange(e)}
                  />
                  <label className="form-label" htmlFor="email">
                    <h4>Email</h4>
                  </label>
                  {errors["email"] && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors["email"]}</h6>
                    </div>
                  )}
                </div>
                <div className="form-item">
                  <MaskedInput
                    type="text"
                    name="contact_number"
                    id="contact_number"
                    autoComplete="off"
                    value={profileEditInputs.contact_number}
                    maskGenerator={maskGenerator}
                    keepMask
                    onChange={(value) =>
                      handleChange({
                        target: { name: "contact_number", value },
                      })
                    }
                    className={errors["contact_number"] ? "invalid" : ""}
                  />
                  <label className="form-label" htmlFor="contact-number">
                    <h4>Contact Number</h4>
                  </label>
                  {errors["contact_number"] && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors["contact_number"]}</h6>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              className="button save-details-button"
              id="save-details-button"
              onClick={onSubmit}
              disabled={isProfileUpdating}
            >
              <h5>
                {isProfileUpdating
                  ? getFormattedMessage("globally.loading.label")
                  : "Save Details"}
              </h5>
            </button>
          </div>
        </div>
      )}
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
      {isModalOpen && (
        <EditProfilePictureModal
          handleModalOpen={isModalOpen}
          handleModalClose={handleModalClose}
        />
      )}
    </MasterLayout>
  );
};

export default ProfileEdit;