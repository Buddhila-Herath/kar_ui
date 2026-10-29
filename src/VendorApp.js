import React from "react";
import { Route, Navigate, Routes } from "react-router-dom";
import { Tokens } from "./constants";
import { vendorRoutes } from "./vendorRoutes";
import { ProtectedVendorRoute } from "./shared/sharedMethod";
import TopProgressBar from "./shared/components/loaders/TopProgressBar";

function VendorApp(props) {
    const { previlage } = props;
    const token = localStorage.getItem(Tokens.VENDOR);


    const prepareRoutes = (previlage) => {
        const permissions = previlage;
        let filterRoutes = [];
        vendorRoutes.forEach((route) => {
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
                                <ProtectedVendorRoute>
                                    {routeItem.ele}
                                </ProtectedVendorRoute>
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

export default VendorApp;
