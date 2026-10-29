import React, { useEffect, useState } from "react";
import { Route, Navigate, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Toasts from "./shared/toast/Toasts";
import { IntlProvider } from "react-intl";
import { settingsKey, Tokens } from "./constants";
import Login from "./components/auth/Login";
import ResetPassword from "./components/auth/ResetPassword";
import ForgotPassword from "./components/auth/ForgotPassword";
import VendorApp from "./VendorApp";
import AdminApp from "./AdminApp";
import "./assets/css/style.css";
import { getFiles } from "./locales/index";
import ProfileEdit from "./components/profile/ProfileEdit";
import TechnicianApp from "./TechnicianApp";
import { fetchPrivilages } from './slices/permissionSlice';
import { isAdminPortal, isTechnicianPortal } from './utils/portalUtils';
import { fetchMyProfile } from './slices/profileSlice';

function App() {
    const dispatch = useDispatch();
    const updateLanguage = useSelector((state) => state.language?.updateLanguage);
    const selectedLanguage = useSelector((state) => state.language?.selectedLanguage);
    const language = useSelector((state) => state.language?.language);
    const { allPrivilages, isLoading } = useSelector((state) => state.permission);

    const updatedLanguage = localStorage.getItem(Tokens.UPDATED_LANGUAGE);
    const [allLocales, setAllLocales] = useState({});
    const [messages, setMessages] = useState({});
    const [userEditedMessage, setUserEditedMessage] = useState({});

    const updateLanguageData = allLocales[updatedLanguage ? updatedLanguage : selectedLanguage];
    const [languageData, setLanguageData] = useState([]);

    const ignoreDefaulMessageError = (error) => {
        if (typeof error.message === "string") {
          return;
        }
    };

    useEffect(() => {
        // Only fetch privileges if user is logged in and privileges haven't been loaded yet
        const token = localStorage.getItem(Tokens.ADMIN) || localStorage.getItem(Tokens.VENDOR) || localStorage.getItem(Tokens.TECHNICIAN);
        const currentPath = window.location.pathname;
        
        // Don't fetch privileges if we're on the login page
        if (token && (!allPrivilages || allPrivilages.length === 0) && !currentPath.includes('/login')) {
            dispatch(fetchPrivilages());
        }
    }, [dispatch, allPrivilages]);

    // Ensure profile image (signed URL) is fetched and auto-refresh is scheduled from slice
    useEffect(() => {
        const token = localStorage.getItem(Tokens.ADMIN) || localStorage.getItem(Tokens.VENDOR) || localStorage.getItem(Tokens.TECHNICIAN);
        const onLoginPage = window.location.pathname.includes('/login');
        if (token && !onLoginPage) {
            dispatch(fetchMyProfile());
        }
    }, [dispatch]);

    useEffect(() => {
        const getData = getFiles();
        setAllLocales(getData);
    }, [language, updateLanguage?.lang_json_array]);

    useEffect(() => {
        if (updateLanguage?.iso_code === updatedLanguage && languageData) {
            setUserEditedMessage(updateLanguage?.lang_json_array);
        }
    }, [language, languageData, updateLanguage, updatedLanguage]);

    // updated language hendling
    useEffect(() => {
        if (Object.values(userEditedMessage).length !== 0) {
            setMessages(userEditedMessage);
        } else {
            if (updateLanguage?.iso_code === updatedLanguage) {
                const updateLanguages = updateLanguage?.lang_json_array;
                setMessages(updateLanguages);
            } else {
                if (
                    updateLanguage === undefined ||
                    updateLanguage === null ||
                    updateLanguage === ""
                ) {
                    const defaultUpdateLanguage = allLocales["en"];
                    setMessages(defaultUpdateLanguage);
                } else {
                    if (updateLanguage === undefined || updateLanguage === null) {
                        const defaultUpdateLanguage = allLocales["en"];
                        setMessages(defaultUpdateLanguage);
                    } else {
                        setMessages(updateLanguage);
                    }
                }
            }
        }
    }, [allLocales, updateLanguage?.lang_json_array]);

    return (
        <div className="d-flex flex-root">
        <IntlProvider
            locale={settingsKey.DEFAULT_LOCALE}
            messages={messages}
            onError={ignoreDefaulMessageError}
        >
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="reset-password/:token/:email"
                        element={<ResetPassword />}
                    />
                    <Route
                        path="forgot-password"
                        element={<ForgotPassword />}
                    />
                    {isAdminPortal() ? (
                        <Route path="admin/*" element={<AdminApp previlage={allPrivilages} />} />
                    ) : isTechnicianPortal() ? (
                        <Route path="app/*" element={<TechnicianApp previlage={allPrivilages} />} />
                    ) : (
                        <Route path="app/*" element={<VendorApp previlage={allPrivilages} />} />
                    )}
                    <Route path="app/edit-profile" element={<ProfileEdit />} />
                    {/* <Route
                        path="/"
                        element={
                            <Navigate
                                replace
                                to={token ? redirectTo : "/login"}
                            />
                        }
                    /> */}
                    <Route path="*" element={<Navigate replace to={"/login"} />} />
                </Routes>
                <Toasts
                    language={
                        updatedLanguage ? updatedLanguage : selectedLanguage
                    }
                />
            </IntlProvider>
        </div>
    );
}

export default App;
