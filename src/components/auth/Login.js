import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as EmailValidator from "email-validator";
import TabTitle from "../../shared/tab-title/TabTitle";
import AuthHeader from '../header/AuthHeader';
import white_logo from '../../assets/images/karstation-logo-white.svg';
import { userLogin } from '../../slices/authSlice';
import { updateTermsApproval } from "../../slices/profileSlice";
import Icons from "../../utils/icons"
import TermsPopup from "./TermsPopup";
import { logout } from '../../slices/authSlice';
import { Tokens } from "../../constants";
import { fetchPrivilages } from '../../slices/permissionSlice';
import { isAdminPortal, isVendorPortal, isTechnicianPortal, getGrantType, getCurrentPortal } from '../../utils/portalUtils';
import { getConfig } from '../../config/service';

import {
    getFormattedMessage,
    placeholderText,
} from "../../shared/sharedMethod";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errorIcon, setErrorIcon] = useState("");
    const [errorTitle, setErrorTitle] = useState("");
    const [error, setError] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showTermsPopup, setShowTermsPopup] = useState(false);

    const [loginInputs, setLoginInputs] = useState({
        username: "",
        password: "",
        grantType: "VENDOR" // Default value
    });

    // Set grant type after component mounts
    useEffect(() => {
        const initializeGrantType = async () => {
            try {
                const config = await getConfig();
                if (config && config.portal) {
                    const grantType = config.portal === 'ADMIN' ? 'SUPERADMIN' : 
                                    config.portal === 'TECHNICIAN' ? 'TECHNICIAN' : 
                                    'VENDOR';
                    setLoginInputs(prev => ({
                        ...prev,
                        grantType
                    }));
                }
            } catch (error) {
                console.error('Error getting config:', error);
            }
        };

        initializeGrantType();
    }, []);

    const [errors, setErrors] = useState({
        username: "",
        password: "",
    });

    const handleAcceptTerms = () => {
        dispatch(updateTermsApproval({ isAccepted: true }))
            .unwrap()
            .then(() => {
                setShowTermsPopup(false);
                navigate("/app/dashboard");
            })
            .catch((error) => {
                console.error("Error updating terms approval:", error);
            });
    };

    const handleDeclineTerms = async () => {
        setShowTermsPopup(false);
        dispatch(logout());
        navigate('/login');
        window.location.reload();
    };

    const handleValidation = () => {
        let errorss = {};
        let isValid = true;
    
        // Validate email
        if (!loginInputs["username"]) {
            errorss["username"] = getFormattedMessage(
                "globally.require-input.validate.label"
            );
            isValid = false;
        } 
        // else if (!EmailValidator.validate(loginInputs["username"])) {
        //     errorss["username"] = getFormattedMessage(
        //         "globally.input.email.valid.validate.label"
        //     );
        //     isValid = false;
        // }
    
        // Validate password
        if (!loginInputs["password"]) {
            errorss["password"] = getFormattedMessage(
                "user.input.password.validate.label"
            );
            isValid = false;
        }
    
        setErrors(errorss);
        setLoading(false);
        return isValid;
    };    
    function formatSriLankaNumber(value) {
    if (!value) return "";
    let digits = value?.replace(/\s+/g, "")

    if (digits.includes("+94")) {
        digits = digits.slice(3);
    }else if(digits.startsWith("94")){
        digits = digits.slice(2);
    }else if(digits.startsWith("0")){
        digits = digits.slice(1);
    }    
    return digits.replace(/(\d{2})(\d{3})(\d{4})/, "$1 $2 $3");
    }

    const onLogin = async (e) => {
        let phoneCode = null
        if(!loginInputs['username'].includes('@')){
           phoneCode='+94'
        }
        
        e.preventDefault();
        const valid = handleValidation();
        if (valid) {
            setLoading(true);
            try {
                const resultAction = await dispatch(userLogin({
                    username: phoneCode? (phoneCode+' '+formatSriLankaNumber(loginInputs['username'])):loginInputs['username'],
                    password:loginInputs['password'],
                    grantType:loginInputs['grantType']
                }));
                if (userLogin.fulfilled.match(resultAction)) {
                    if (rememberMe) {
                        localStorage.setItem('email', loginInputs.username);
                    } else {
                        sessionStorage.setItem('email', loginInputs.username);
                    }
    
                    setLoginInputs({ username: "", password: "" }); 

                    // Fetch privileges before navigation
                    await dispatch(fetchPrivilages());

                    if(isVendorPortal()) {
                        try {
                            const isTermAccepted = localStorage.getItem(Tokens.TERMS_ACCEPTED)
                            if (isTermAccepted === "false") {
                                setShowTermsPopup(true);
                            } else {
                                navigate('/app/dashboard');
                            }
                        } catch (error) {
                            setErrorIcon(Icons.error_terms);
                            setErrorTitle("Error Checking Terms");
                            setError("Failed to check terms approval. Please try again.");
                            setShowPopup(true);
                        }
                    } else if (isTechnicianPortal()) {
                        navigate('/app/dashboard');                    
                    } else {
                        navigate('/admin/dashboard');
                    }
                } else if (userLogin.rejected.match(resultAction)) {
                    setErrorIcon(Icons.error_email);
                    setErrorTitle("Invalid Login Credentials");
                    getCurrentPortal()==='ADMIN'?
                    setError('Login failed. Check your email and password' || "Invalid credentials. Please try again."):
                    setError(resultAction.payload || "Invalid credentials. Please try again.");
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
        setError("");
    };

    const handleChange = (e) => {
        e.persist();
        setLoginInputs((inputs) => ({
            ...inputs,
            [e.target.name]: e.target.value,
        }));
        setErrors("");
    };

    return (
        <>
            <div className="container">
                <TabTitle
                    title={placeholderText("login-form.login-btn.label")}
                />
                <AuthHeader isLoginPage={true} />
                <div className="right-side">
                   {getCurrentPortal()!=='TECHNICIAN'&& <img
                        src={white_logo}
                        alt="KarStation"
                        className="logo hide-desktop"
                    />}
                    <div className={`form-container ${getCurrentPortal()==='TECHNICIAN'?'technician-form-container':''}`}>
                        <img
                            src={Icons.login_icon}
                            alt="KarStation"
                            className="login-icon"
                        />
                        <h1>
                            {getFormattedMessage("login-form.title")}
                        </h1>
                        <form className="auth">
                            <div className="mb-4">
                                <div className="d-flex justify-content-between">
                                    {getCurrentPortal()!=='ADMIN'?(<label className="form-label">
                                        {getFormattedMessage(
                                            "globally.input.email.phone.label"
                                        )}{" "}
                                    </label>):(
                                        <label className="form-label">
                                        {getFormattedMessage(
                                            "globally.input.email.phone.label.admin"
                                        )}{" "}
                                    </label>
                                    )}
                                </div>
                                <input
                                    placeholder={getCurrentPortal()!=='ADMIN'?placeholderText(
                                        "globally.input.email.phone.placeholder"
                                    ):placeholderText(
                                        "globally.input.email.phone.placeholder.admin"
                                    )}
                                    required
                                    value={loginInputs.username}
                                    type="email"
                                    name="username"
                                    autoComplete="off"
                                    onChange={(e) => handleChange(e)}
                                    className={errors["username"] ? "invalid" : ""}
                                />
                                {errors["username"] ?
                                    <div className="field-error">
                                        <img src={Icons.warning_circle} alt="Warning Icon" />
                                        <h6>{errors["username"]}</h6>
                                    </div> 
                                : "" }
                            </div>

                            <div className="mb-3">
                                <div className="d-flex justify-content-between mt-n5">
                                    <div className="d-flex justify-content-between w-100">
                                        <label className="form-label">
                                            {getFormattedMessage(
                                                "user.input.password.label"
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div className="password-input-container">
                                    <input
                                        type={passwordVisible ? "text" : "password"}
                                        name="password"
                                        placeholder={placeholderText(
                                            "user.input.password.placeholder.label"
                                        )}
                                        autoComplete="off"
                                        required
                                        value={loginInputs.password}
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
                            <div className="mb-sm-7 mb-8">
                                <div className="d-flex justify-content-between mt-n5 align-items-center">
                                    <label className="custom-checkbox remember-me-label mb-0" htmlFor="rememberMe">
                                        <input
                                            type="checkbox"
                                            id="rememberMe"
                                            name="rememberMe"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <span className="checkmark"></span>
                                        {getFormattedMessage("login-form.remember-me.label")}
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="forgot-password-link-info text-decoration-none"
                                    >
                                        {getFormattedMessage("login-form.forgot-password.label")}
                                    </Link>
                                </div>
                            </div>
                            <div className="text-center">
                                <button
                                    type="submit"
                                    onClick={(e) => onLogin(e)}
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
                                                "login-form.login-btn.label"
                                            )}
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

            {showTermsPopup && (
                <TermsPopup
                    onAccept={handleAcceptTerms}
                    onDecline={handleDeclineTerms}
                />
            )}
        </>
    );
};

export default Login;
