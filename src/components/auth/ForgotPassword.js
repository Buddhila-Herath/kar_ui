import React, { useEffect, useState } from 'react'
import TabTitle from '../../shared/tab-title/TabTitle';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as EmailValidator from 'email-validator';
import { getFormattedMessage, placeholderText } from '../../shared/sharedMethod';
import AuthHeader from '../header/AuthHeader';
import white_logo from '../../assets/images/karstation-logo-white.svg';
import { userForgotPassword } from '../../slices/authSlice';
import Icons from "../../utils/icons"

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [disable, setDisable] = useState(true);
  const dispatch = useDispatch();
  const [forgotValue, setForgotValue] = useState({ email: '' });
  const [errors, setErrors] = useState({ email: '' });
  const [loading, setLoading] = useState(false);
  const [errorIcon, setErrorIcon] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleChange = (e) => {
    e.persist();
    setForgotValue(inputs => ({ ...inputs, [e.target.name]: e.target.value }));
    setDisable(false);
    setErrors('');
  };

  const closePopup = () => {
    setShowPopup(false);
    setShowSuccessPopup(false);
    setError("");
  };

  const prepareFormData = () => {
    const formData = new FormData();
    formData.append('email', forgotValue.email);
    return formData;
  };

  const handleValidation = () => {
    let errorss = {};
    let isValid = false;
    if (!EmailValidator.validate(forgotValue['email'])) {
      if (!forgotValue['email']) {
        errorss['email'] = getFormattedMessage('globally.input.email.validate.label');
      } else {
        errorss['email'] = getFormattedMessage('globally.input.email.valid.validate.label');
      }
    } else {
      isValid = true;
    }
    setErrors(errorss);
    return isValid;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const valid = handleValidation();
    !valid && setLoading(false);
    if (valid) {
      setLoading(true);
      try {
        const resultAction = await dispatch(userForgotPassword(forgotValue.email));
        if (userForgotPassword.rejected.match(resultAction)) {
            setErrorIcon(Icons.error_email);
            setErrorTitle("Invalid Email Address");
            setError(resultAction.payload || "The email you entered is incorrect");
            setShowPopup(true);
        } else {
          setShowSuccessPopup(true);
          setForgotValue({ email: '' });
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

  return (
    <>
      <div className="container">
        <TabTitle title='Forgot Password' />
        <AuthHeader isLoginPage={false} />
        <div className="right-side">
          <img
            src={white_logo}
            alt="KarStation"
            className="logo hide-desktop"
          />
          <div className="form-container forgot-password">
            <img
              src={Icons.lock_key_icon}
              alt="KarStation"
              className="login-icon"
            />
            <h1>
              {getFormattedMessage('forgot-password-form.title')}
            </h1>
            <p>
              Provide your account email for which you want to reset your password
            </p>
            <form className="auth">
              <div className="mb-sm-7 mb-8">
                <div className="d-flex justify-content-between mt-n5">
                  <div className="d-flex justify-content-between w-100">
                    <label className="form-label">
                      {getFormattedMessage(
                        "globally.input.email.label"
                      )}{" "}
                    </label>
                  </div>
                </div>
                <input
                  placeholder={placeholderText(
                    "forgot-password.input.email.placeholder.label"
                  )}
                  required
                  value={forgotValue.email}
                  type='text'
                  name='email'
                  autoComplete='on'
                  onChange={(e) => handleChange(e)}
                  className={errors["email"] ? "invalid" : ""}
                />
                {errors["email"] ?
                    <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors["email"]}</h6>
                    </div> 
                : "" }
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  onClick={(e) => onSubmit(e)}
                >
                  {loading ? (
                    <span className="d-block">
                      {getFormattedMessage(
                        "globally.loading.label"
                      )}
                    </span>
                  ) : (
                    <span>
                      {getFormattedMessage('forgot-password-form.reset-link-btn.label')}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
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
              <img src={Icons.success_email} alt="error" className="error-icon" />
              <h2>Email Sent Successfully!</h2>
              <p>Password reset link has been sent to your email.<br/> Please follow the link in the email to <br/>
              reset the password.</p>
              <button onClick={closePopup}>Ok</button>
            </div>
          </div>
        </>
      )}
    </>
  )
};

export default ForgotPassword;

