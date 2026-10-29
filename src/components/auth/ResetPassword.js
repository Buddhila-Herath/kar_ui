import React, {useEffect, useState} from 'react'
import { useDispatch } from "react-redux";
import {useNavigate, useParams} from 'react-router-dom';
import TabTitle from '../../shared/tab-title/TabTitle';
import {getFormattedMessage, placeholderText} from '../../shared/sharedMethod';
import white_logo from '../../assets/images/karstation-logo-white.svg';
import AuthHeader from '../header/AuthHeader';
import Icons from "../../utils/icons"
import { resetPassword, validateResetToken } from '../../slices/authSlice';
import { addToast } from '../../slices/toastSlice';

const ResetPassword = (props) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {token, email} = useParams();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorIcon, setErrorIcon] = useState("");
    const [errorTitle, setErrorTitle] = useState("");
    const [error, setError] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            const resultAction = await dispatch(validateResetToken({ token, email }));
            if (validateResetToken.rejected.match(resultAction)) {
                navigate('/login');
                dispatch(
                    addToast({
                        text: "Link Expired",
                        type: "error",
                    })
                );
            }
        };
        checkToken();
    }, [dispatch, token, email, navigate, error]);

    const [resetValue, setResetValue] = useState({
        password: '',
        confirm_password: '',
        email: email,
        verificationToken: token
    });

    const closePopup = () => {
        setShowPopup(false);
        setShowSuccessPopup(false);
        setError("");
    };

    const [errors, setErrors] = useState({
        password: '',
        confirm_password: '',
    });

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
    
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_()+\-=[\]{};':"\\|,.<>\/])[A-Za-z\d@$!%*?&_()+\-=[\]{};':"\\|,.<>\/]{6,20}$/;
    
        if (!resetValue['password']) {
            errorss['password'] = getFormattedMessage('user.input.password.validate.label');
        } else if (!passwordRegex.test(resetValue['password'])) {
            errorss['password'] = 'Password must be 6-20 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character.';
        } else if (!resetValue['confirm_password']) {
            errorss['confirm_password'] = getFormattedMessage('user.input.confirm-password.validate.label');
        } else if (resetValue['password'] !== resetValue['confirm_password']) {
            errorss['confirm_password'] = 'Please ensure both password fields are identical';
        } else {
            isValid = true;
        }
    
        setErrors(errorss);
        return isValid;
    };

    const prepareFormData = (resetValue) => {
        const formData = new FormData();
        formData.append("email", resetValue.email);
        formData.append("password", resetValue.password);
        formData.append("confirmPassword", resetValue.confirm_password);
        formData.append("token", resetValue.verificationToken);

        return formData;
    };

    const handleChange = (e) => {
        e.persist();
        setResetValue(inputs => ({...inputs, [e.target.name]: e.target.value}));
        setErrors({});
    };

    const onLogIn = () => {
        navigate('/login');
    };
    
    const onSubmit = async (e) => {
        e.preventDefault();
        const Valid = handleValidation();
        if (Valid) {
            setLoading(true);
            try {
                const resultAction = await dispatch(resetPassword(prepareFormData(resetValue)));
                if (resetPassword.fulfilled.match(resultAction)) {
                    setShowPopup(false);
                    setShowSuccessPopup(true);
                    setResetValue({ email: '', password: '', confirm_password: '' });
                } else if (resetPassword.rejected.match(resultAction)) {
                    const errorPayload = resultAction.payload;
                
                    let errorMessage = "Something went wrong. Please try again.";
                    
                    if (errorPayload && errorPayload.errors && Array.isArray(errorPayload.errors)) {
                        errorMessage = errorPayload.errors.join('\n');
                    } else if (errorPayload?.data?.errors && Array.isArray(errorPayload.data.errors)) {
                        errorMessage = errorPayload.data.errors.join('\n');
                    } else if (errorPayload?.data?.message) {
                        errorMessage = errorPayload.data.message;
                    } else if (typeof errorPayload === 'string') {
                        errorMessage = errorPayload;
                    }
                    
                    setErrorIcon(Icons.error_email);
                    setErrorTitle("Error");
                    setError(errorMessage);
                    setShowSuccessPopup(false);
                    setShowPopup(true);
                }
            } catch (error) {
                setErrorIcon(Icons.error_password);  
                setErrorTitle("Unexpected Error");  
                setError("An unexpected error occurred. Please try again.");
                setShowSuccessPopup(false);
                setShowPopup(true);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
        <div className="container">
            <TabTitle title='Reset Password'/>
            <AuthHeader isLoginPage={false} />
            <div className="right-side"> 
                <div className="logo-container">
                    <img
                        src={white_logo}
                        alt="KarStation"
                        className="logo hide-desktop"
                    />
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
                    <form className="auth">
                        <div className="mb-sm-7 mb-4">
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
                                    type={passwordVisible ? "text" : "password"}
                                    name="password"
                                    placeholder={placeholderText(
                                        "change-password.input.new.placeholder.label"
                                    )}
                                    autoComplete="off"
                                    required
                                    value={resetValue.password}
                                    onChange={(e) => handleChange(e)}
                                    className={errors["password"] ? "invalid" : ""}
                                />
                                <img
                                    src={passwordVisible ? Icons.eye_closed : Icons.eye_closed}
                                    alt="Toggle password visibility"
                                    className="toggle-password-icon"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                />
                            </div>
                            {errors["password"] ?
                                <div className="field-error">
                                    <img src={Icons.warning_circle} alt="Warning Icon" />
                                    <h6>{errors["password"]}</h6>
                                </div> 
                            : "" }
                        </div>
                        <div className="mb-sm-7 mb-4">
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
                                    className={errors["confirm_password"] ? "invalid" : ""}
                                />
                                <img
                                    src={confirmPasswordVisible ? Icons.eye_closed : Icons.eye_closed}
                                    alt="Toggle password visibility"
                                    className="toggle-password-icon"
                                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                />
                            </div>
                            {errors["confirm_password"] ?
                                <div className="field-error">
                                    <img src={Icons.warning_circle} alt="Warning Icon" />
                                    <h6>{errors["confirm_password"]}</h6>
                                </div> 
                            : "" }
                        </div>
                        <div className="text-center">
                            <button
                                type="submit"
                                onClick={(e) => onSubmit(e)}
                            >
                            {
                                <span>{getFormattedMessage('globally.submit-btn')}</span>
                            }
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
                        <span className="close-icon" onClick={onLogIn}></span>
                        <img src={Icons.success_password} alt="error" className="error-icon" />
                        <h2>Password Reset Successful!</h2>
                        <p>Confirmation email sent. Click on Login to sign in with your new password</p>
                        <button onClick={onLogIn}>Login</button>
                    </div>
                </div>
            </>
        )}
        </>
    )
};

export default ResetPassword;
