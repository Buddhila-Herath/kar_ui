import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { notification } from "antd";
import MasterLayout from "../../MasterLayout";
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import EditProfilePictureModal from "../../../shared/upload/EditProfilePictureModal";
import { placeholderText, getFormattedMessage } from '../../../shared/sharedMethod';
import Spinner from "../../../shared/components/loaders/Spinner";
import Icons from "../../../utils/icons"
import update_image from "../../../assets/images/image.svg";
import { fetchMyProfile, updateProfile } from '../../../slices/profileSlice';
import { MaskedInput, createDefaultMaskGenerator } from 'react-hook-mask';
import { loadImageForDisplay } from "../../../utils/imageUtils";

const maskGenerator = createDefaultMaskGenerator('+99 99 999 9999');

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
  const [profileImg, setProfileImg] = useState(null);
  const [profileEditInputs, setProfileEditInputs] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: ""
  });

  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: ""
  });

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (myProfile) {
      setProfileEditInputs({
        first_name: myProfile.firstName,
        last_name: myProfile.lastName,
        email: myProfile.email,
        contact_number: myProfile.contactNumber
      });
      loadProfileImage();
    }
  }, [myProfile]);

  const loadProfileImage = async () => {
    await loadImageForDisplay(
      myProfile?.profilePhotoPath,
      dispatch,
      setProfileImg
    );
  };

  const handleValidation = () => {
    let errorss = {};
    let isValid = true;

    if (!profileEditInputs["first_name"]) {
      errorss["first_name"] = getFormattedMessage(
        "profile.input.first-name.validate.label"
      );
      isValid = false;
    } else if (!/^[A-Za-z]+$/.test(profileEditInputs["first_name"])) {
      errorss["first_name"] = "First name must contain only letters";
      isValid = false;
    }

    if (!profileEditInputs["last_name"]) {
      errorss["last_name"] = getFormattedMessage(
        "profile.input.last-name.validate.label"
      );
      isValid = false;
    } else if (!/^[A-Za-z]+$/.test(profileEditInputs["last_name"])) {
      errorss["last_name"] = "Last name must contain only letters";
      isValid = false;
    }

    if (!profileEditInputs["email"]) {
      errorss["email"] = getFormattedMessage(
        "profile.input.email.validate.label"
      );
      isValid = false;
    }

    if (!profileEditInputs["contact_number"]) {
      errorss["contact_number"] = getFormattedMessage(
        "profile.input.contact-number.validate.label"
      );
      isValid = false;
    } else {
      const contactNumberRegex = /^\+\d{2} \d{2} \d{3} \d{4}$/;
      if (!contactNumberRegex.test(profileEditInputs["contact_number"])) {
        errorss["contact_number"] = (
          <>
            Must be a valid contact number.
            <br />
            Format: +94 27 835 1289
          </>
        );
        isValid = false;
      }
    }

    setErrors(errorss);
    return isValid;
  };

  const prepareFormData = () => {
    const formData = new FormData();
    formData.append("firstName", profileEditInputs.first_name);
    formData.append("lastName", profileEditInputs.last_name);
    formData.append("contactNumber", profileEditInputs.contact_number);
    return formData;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileEditInputs((inputs) => ({
      ...inputs,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const valid = handleValidation();
    if (valid) {
      setIsProfileUpdating(true);
      try {
        const resultAction = await dispatch(updateProfile(prepareFormData(profileEditInputs)));
        if (updateProfile.fulfilled.match(resultAction)) {
          setProfileEditInputs({
            first_name: "",
            last_name: "",
            email: "",
            contact_number: ""
          });
          navigate("/app/my-profile/basic-details");
          notification.success({
            message: <h5>Your changes have been saved.</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5
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
  }

  return (
    <MasterLayout>
      <TabTitle title={placeholderText('profile.title')} />
      <Breadcrumb
        parent_menu="Profile Settings"
        parent_menu_url="/app/my-profile"
        second_level_page="Basic Details"
        second_level_page_url="/app/my-profile/basic-details"
        current_page="Edit Basic Details"
      />
      {isProfileLoading ? <Spinner /> :
        <div className="profile-edit-container" id="technician-profile-edit-container">
          <div className="profile-header" id="technician-profile-edit-header">
            <div className="back" id="technician-profile-edit-back">
              <Link to="/app/my-profile/basic-details" id="technician-profile-edit-back-link">
                <img src={Icons.arrow_left} alt="back" id="technician-profile-edit-back-icon" />
              </Link>
              <h3 id="technician-profile-edit-title">Edit Basic Details</h3>
            </div>
          </div>
          <div className="profile-card" id="technician-profile-edit-card">
            <div className="profile-edit-avatar" id="technician-profile-edit-avatar">
              {myProfile && myProfile.profilePhotoPath && profileImg ? (
                <img
                  src={profileImg}
                  alt="Profile Photo"
                  id="technician-profile-edit-photo-img"
                />
              ) : (
                <img
                  src={Icons.avatar}
                  alt="Profile Photo"
                  id="technician-profile-edit-photo-default"
                />
              )}
              <div className="edit-update-photo" id="technician-profile-edit-update-photo" onClick={() => setIsModalOpen(true)}>
                <img src={update_image} alt="Profile Photo" id="technician-profile-edit-update-photo-icon" />
                <h5 id="technician-profile-edit-update-photo-text">Update Photo</h5>
              </div>
            </div>
            <div className="profile-edit-details-form" id="technician-profile-edit-form">
              <div className="form-row" id="technician-profile-edit-form-row-1">
                <div className="form-item" id="technician-profile-edit-first-name-item">
                  <input
                    type="text"
                    name="first_name"
                    id="technician-profile-edit-first-name-input"
                    defaultValue={myProfile && myProfile.firstName ? myProfile.firstName : ""}
                    onChange={(e) => handleChange(e)}
                  />
                  <label className="form-label" htmlFor="technician-profile-edit-first-name-input" id="technician-profile-edit-first-name-label">
                    <h4>First Name</h4>
                  </label>
                  {errors["first_name"] && (
                    <div className="field-error" id="technician-profile-edit-first-name-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors["first_name"]}</h6>
                    </div>
                  )}
                </div>
                <div className="form-item" id="technician-profile-edit-last-name-item">
                  <input
                    type="text"
                    name="last_name"
                    id="technician-profile-edit-last-name-input"
                    defaultValue={myProfile && myProfile.lastName ? myProfile.lastName : ""}
                    onChange={(e) => handleChange(e)}
                  />
                  <label className="form-label" htmlFor="technician-profile-edit-last-name-input" id="technician-profile-edit-last-name-label">
                    <h4>Last Name</h4>
                  </label>
                  {errors["last_name"] && (
                    <div className="field-error" id="technician-profile-edit-last-name-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors["last_name"]}</h6>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row" id="technician-profile-edit-form-row-2">
                <div className="form-item disabled-form-item" id="technician-profile-edit-email-item">
                  <input
                    type="text"
                    name="email"
                    id="technician-profile-edit-email-input"
                    disabled
                    defaultValue={myProfile && myProfile.email ? myProfile.email : ""}
                    onChange={(e) => handleChange(e)}
                  />
                  <label className="form-label" htmlFor="technician-profile-edit-email-input" id="technician-profile-edit-email-label">
                    <h4>Email</h4>
                  </label>
                  {errors["email"] && (
                    <div className="field-error" id="technician-profile-edit-email-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors["email"]}</h6>
                    </div>
                  )}
                </div>
                <div className="form-item" id="technician-profile-edit-contact-item">
                  <MaskedInput
                    type="text"
                    name="contact_number"
                    id="technician-profile-edit-contact-input"
                    value={myProfile?.contactNumber || ""}
                    maskGenerator={maskGenerator}
                    keepMask
                    onChange={(value) => handleChange({ target: { name: "contact_number", value } })}
                  />
                  <label className="form-label" htmlFor="technician-profile-edit-contact-input" id="technician-profile-edit-contact-label">
                    <h4>Contact Number</h4>
                  </label>
                  {errors["contact_number"] && (
                    <div className="field-error" id="technician-profile-edit-contact-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors["contact_number"]}</h6>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button className="button save-details-button" id="technician-profile-edit-save-button" onClick={onSubmit} disabled={isProfileUpdating}>
              <h5 id="technician-profile-edit-save-button-text">{isProfileUpdating ? getFormattedMessage("globally.loading.label") : "Save Details"}</h5>
            </button>
          </div>
        </div>
      }
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
      {isModalOpen &&
        <EditProfilePictureModal
          handleModalOpen={isModalOpen}
          handleModalClose={handleModalClose}
        />
      }
    </MasterLayout>
  );
};

export default ProfileEdit;