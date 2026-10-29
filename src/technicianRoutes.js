import Dashboard from "./components/technician/dashboard/Dashboard";
import JobDetails from "./components/technician/JobDetails";
import Profile from "./components/technician/profile/Profile";
import BasicDetails from "./components/technician/profile/BasicDetails";
import ProfileEdit from "./components/technician/profile/ProfileEdit";
import ResetPassword from "./components/technician/profile/ResetPassword";
import { Permissions } from "./constants";

export const technicianRoutes = [
    {
        path: "/dashboard",
        ele: <Dashboard />,
        permission: Permissions.MANAGE_TECNICIAN_DASHBOARD,
    },
    {
        path: "/my-profile",
        ele: <Profile />,
        permission: Permissions.MANAGE_PROFILE,
    },
    {
        path: "/my-profile/basic-details",
        ele: <BasicDetails />,
        permission: Permissions.MANAGE_PROFILE,
    },
    {
        path: "/my-profile/basic-details/edit-profile",
        ele: <ProfileEdit />,
        permission: Permissions.MANAGE_PROFILE,
    },
    {
        path: "/my-profile/reset-password",
        ele: <ResetPassword />,
        permission: Permissions.MANAGE_PROFILE,
    },
    {
        path: "/details/:id",
        ele: <JobDetails />,
        permission: Permissions.MANAGE_TECNICIAN_DASHBOARD,
    },
];