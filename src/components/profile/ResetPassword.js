import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import TabTitle from '../../shared/tab-title/TabTitle';
import { getFormattedMessage, placeholderText } from '../../shared/sharedMethod';
import white_logo from '../../assets/images/karstation-logo-white.svg';
import AuthHeader from '../header/AuthHeader';
import Icons from "../../utils/icons"
import { resetPassword } from '../../slices/profileSlice';
import { logout } from '../../slices/authSlice';
import { Tokens } from '../../constants';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorIcon, setErrorIcon] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [resetValue, setResetValue] = useState({
    email: localStorage.getItem(Tokens.EMAIL),
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleValidation = () => {
    let errorss = {};
    let isValid = true;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{6,20}$/;

    if (!resetValue['current_password']) {
      errorss['current_password'] = 'Current Password field is required';
      isValid = false;
    } 
  
    if (!resetValue['new_password']) {
      errorss['new_password'] = 'New Password field is required';
      isValid = false;
    } else if (!passwordRegex.test(resetValue['new_password'])) {
      errorss['new_password'] = 'Password must be 6-20 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character.';
      isValid = false;
    }
  
    if (!resetValue['confirm_password']) {
      errorss['confirm_password'] = 'Confirm Password field is required';
      isValid = false;
    } else if (resetValue['new_password'] !== resetValue['confirm_password']) {
      errorss['confirm_password'] = 'The confirm password and new password must match';
      isValid = false;
    }

    setErrors(errorss);
    return isValid;
  };

  const prepareFormData = () => {
    const formData = new FormData();
    formData.append("email", resetValue.email);
    formData.append("currentPassword", resetValue.current_password);
    formData.append("newPassword", resetValue.new_password);
    formData.append("confirmPassword", resetValue.confirm_password);
    return formData;
  };

  const handleChange = (e) => {
    e.persist();
    setResetValue(inputs => ({
      ...inputs,
      [e.target.name]: e.target.value
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [e.target.name]: ''
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const Valid = handleValidation();
    if (Valid) {
      setLoading(true);
      try {
        const resultAction = await dispatch(resetPassword(prepareFormData(resetValue)));
        if (resetPassword.fulfilled.match(resultAction)) {
          setShowSuccessPopup(true);
          setResetValue({
            email: '',
            current_password: '',
            new_password: '',
            confirm_password: '',
          });
          setTimeout(() => {
            dispatch(logout());
          }, 3000);
        } else if (resetPassword.rejected.match(resultAction)) {
          setErrorIcon(Icons.error_email);
          setErrorTitle("Current Password is Incorrect");
          setError(resultAction.payload || "Something went wrong. Please try again.");
          setShowPopup(true);
        }
      } catch (error) {
        setErrorIcon(Icons.error_password);
        setErrorTitle("Unexpected Error");
        setError("An unexpected error occurred. Please try again.");
        setShowPopup(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setShowSuccessPopup(false);
    setErrorIcon("");
    setErrorTitle("");
    setError("");
    setResetValue({
      email: localStorage.getItem(Tokens.EMAIL),
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
  };

  const cancelPopup = () => {
    navigate("/app/my-profile");
  };

  return (
    <>
      <div className="container profile-reset-password">
        <TabTitle title='Reset Password' />
        <AuthHeader isLoginPage={false} />
        <div className="right-side">
          <div className="logo-container">
            <img
              src={white_logo}
              alt="KarStation"
              className="logo hide-desktop"
            />
          </div>
          <div className="profile-header">
            <div className="back">
              <Link to="/admin/my-profile">
                <img src={Icons.arrow_left} alt="back" />
              </Link>
              <h3>Back</h3>
            </div>
          </div>
          <div className="form-container reset-password">
            <img
              src={Icons.reset_password_icon}
              alt="KarStation"
              className="login-icon"
            />
            <h1>
              {getFormattedMessage("reset-password.title")}
            </h1>
            <p>
              Set your new password
            </p>
            <form>
              <div className="mb-sm-7 mb-6">
                <div className="d-flex justify-content-between mt-n5">
                  <div className="d-flex justify-content-between w-100">
                    <label className="form-label">
                      Current Password
                    </label>
                  </div>
                </div>
                <div className="password-input-container">
                  <input
                    type={currentPasswordVisible ? "text" : "password"}
                    name="current_password"
                    placeholder="Enter your current password"
                    autoComplete="off"
                    required
                    value={resetValue.current_password}
                    onChange={(e) => handleChange(e)}
                  />
                  <img
                    src={currentPasswordVisible ? Icons.eye_closed : Icons.eye_closed}
                    alt="Toggle password visibility"
                    className="toggle-password-icon"
                    onClick={() => setCurrentPasswordVisible(!currentPasswordVisible)}
                  />
                </div>
                {errors["current_password"] ?
                  <div className="field-error mt-2">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors["current_password"]}</h6>
                  </div>
                  : ""}
              </div>
              <div className="mb-sm-7 mb-6">
                <div className="d-flex justify-content-between mt-n5">
                  <div className="d-flex justify-content-between w-100">
                    <label className="form-label">
                      {getFormattedMessage(
                        "change-password.input.new.label"
                      )}
                    </label>
                  </div>
                </div>
                <div className="password-input-container">
                  <input
                    type={newPasswordVisible ? "text" : "password"}
                    name="new_password"
                    placeholder={placeholderText(
                      "change-password.input.new.placeholder.label"
                    )}
                    autoComplete="off"
                    required
                    value={resetValue.new_password}
                    onChange={(e) => handleChange(e)}
                  />
                  <img
                    src={newPasswordVisible ? Icons.eye_closed : Icons.eye_closed}
                    alt="Toggle password visibility"
                    className="toggle-password-icon"
                    onClick={() => setNewPasswordVisible(!newPasswordVisible)}
                  />
                </div>
                {errors["new_password"] ?
                  <div className="field-error mt-2">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors["new_password"]}</h6>
                  </div>
                  : ""}
              </div>
              <div className="mb-sm-7 mb-8">
                <div className="d-flex justify-content-between mt-n5">
                  <div className="d-flex justify-content-between w-100">
                    <label className="form-label">
                      {getFormattedMessage(
                        "change-password.input.confirm.label"
                      )}
                    </label>
                  </div>
                </div>
                <div className="password-input-container">
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    name="confirm_password"
                    placeholder={placeholderText(
                      "change-password.input.confirm.placeholder.label"
                    )}
                    autoComplete="off"
                    required
                    value={resetValue.confirm_password}
                    onChange={(e) => handleChange(e)}
                  />
                  <img
                    src={confirmPasswordVisible ? Icons.eye_closed : Icons.eye_closed}
                    alt="Toggle password visibility"
                    className="toggle-password-icon"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  />
                </div>
                {errors["confirm_password"] ?
                  <div className="field-error mt-2">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors["confirm_password"]}</h6>
                  </div>
                  : ""}
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  onClick={(e) => onSubmit(e)}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="d-block">
                      {getFormattedMessage(
                        "globally.loading.label"
                      )}
                    </span>
                  ) : (
                    <span>
                      {getFormattedMessage(
                        "globally.submit-btn"
                      )}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
          <span className="hide-desktop" style={{ lineHeight: '1.5', color: '#fff', visibility: 'hidden' }}>
            KarStation
          </span>
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
              <p>{error}</p>
              <button onClick={closePopup}>Retry</button>
              <button className="close-msg-btn" onClick={cancelPopup}>Cancel</button>
            </div>
          </div>
        </>
      )}
      {showSuccessPopup && (
        <>
          <div className="overlay"></div>
          <div className="success-msg-popup">
            <div className="success-msg-popup-content">
              <span className="close-icon" onClick={closePopup}></span>
              <img src={Icons.success_password} alt="error" className="error-icon" />
              <h2>Password Reset Successful!</h2>
              <p>Your password has been updated successfully.<br />Please use your new password to log in and<br />access your account.</p>
              <button onClick={closePopup}>Login</button>
            </div>
          </div>
        </>
      )}
    </>
  )
};

export default ResetPassword;
