import React from "react";
import { Route, Navigate, Routes } from "react-router-dom";
import { Tokens } from "./constants";
import { adminRoutes } from "./adminRoutes";
import { ProtectedAdminRoute } from "./shared/sharedMethod";
import TopProgressBar from "./shared/components/loaders/TopProgressBar";

function AdminApp(props) {
    const { previlage } = props;
    const token = localStorage.getItem(Tokens.ADMIN);

    const prepareRoutes = (previlage) => {
        const permissions = previlage;
        let filterRoutes = [];
        adminRoutes.forEach((route) => {
            if (
                (permissions && permissions.some(p => p.privilegeType === route.permission && p.status === true)) ||
                route.permission === ""
            ) {
                filterRoutes.push(route);
            }
        });
        return filterRoutes;
    };

    if (previlage.length === 0 && token !== null) {
        return <TopProgressBar />;
    }

    const routes = previlage && prepareRoutes(previlage);

    return (
        <Routes>
            {routes.map((routeItem, index) => (
                routeItem.ele ? (
                    <Route
                        key={index}
                        path={routeItem.path}
                        element={
                            token ? (
                                <ProtectedAdminRoute>
                                    {routeItem.ele}
                                </ProtectedAdminRoute>
                            ) : (
                                <Navigate replace to="/login" />
                            )
                        }
                    />
                ) : null
            ))}
            <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
    );
}

export default AdminApp;
