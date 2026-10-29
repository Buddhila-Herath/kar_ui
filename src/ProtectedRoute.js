import React from "react";
import { Tokens } from "./constants";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem(Tokens.AUTH);
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>; 
};

export default ProtectedRoute;
