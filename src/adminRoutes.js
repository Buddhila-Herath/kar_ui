import AdminDashboard from "./components/dashboard/AdminDashboard";
import Profile from "./components/admin/profile/Profile";
import ProfileEdit from "./components/admin/profile/ProfileEdit";
import CreateVendor from "./components/admin/vendor/CreateVendor";
import Vendors from "./components/admin/vendor/Vendors";
import EditVendor from "./components/admin/vendor/EditVendor";
import VendorDetails from "./components/admin/vendor/VendorDetails";
import SpareParts from "./components/admin/spare-part/SpareParts";
import CreateSparePart from "./components/admin/spare-part/CreateSparePart";
import RateCards from "./components/admin/rate-card/RateCards";
import EditRateCard from "./components/admin/rate-card/EditRateCard";
import Services from "./components/admin/service/Services";
import CreateService from "./components/admin/service/CreateService";
import BasicDetails from "./components/admin/profile/BasicDetails";
import ResetPassword from "./components/admin/profile/ResetPassword";
import { Permissions } from "./constants";
import SpartsDetail from "./components/admin/spare-part/SparePartDetails";
import BulkUpload from "./components/admin/spare-part/BulkUpload";
import EditSparePart from "./components/admin/spare-part/EditSparePart";
import ServiceDetail from "./components/admin/service/ServiceDetails";
import EditService from "./components/admin/service/EditService";
import ServiceBulkUpload from "./components/admin/service/BulkUpload";
import { Inventory } from "./components/admin/inventory/inventory";

export const adminRoutes = [
    {
        path: "/dashboard",
        ele: <AdminDashboard />,
        permission: Permissions.MANAGE_ADMIN_DASHBOARD,
    },
    {
        path: "/vendor-management",
        ele: <Vendors />,
        permission: Permissions.MANAGE_VENDORS,
    },
    {
        path: "vendor-management/create",
        ele: <CreateVendor />,
        permission: Permissions.MANAGE_VENDORS,
    },
    {
        path: "vendor-management/edit/:id",
        ele: <EditVendor />,
        permission: Permissions.MANAGE_VENDORS,
    },
    {
        path: "vendor-management/detail/:id",
        ele: <VendorDetails />,
        permission: Permissions.MANAGE_VENDORS,
    },
    {
        path: "/service-management",
        ele: <Services />,
        permission: Permissions.MANAGE_SERVICES,
    },
    {
        path: "service-management/create",
        ele: <CreateService />,
        permission: Permissions.MANAGE_SERVICES,
    },
    {
        path: "service-management/detail/:id",
        ele: <ServiceDetail />,
        permission: Permissions.MANAGE_SERVICES,
    },
    {
        path: "service-management/edit/:id",
        ele: <EditService />,
        permission: Permissions.MANAGE_SERVICES,
    },
     {
        path: "service-management/bulk-upload",
        ele: <ServiceBulkUpload />,
        permission: Permissions.MANAGE_SPARE_PARTS,
    },
    {
        path: "/spare-part-management",
        ele: <SpareParts />,
        permission: Permissions.MANAGE_SPARE_PARTS,
    },
    {
        path: "spare-part-management/create",
        ele: <CreateSparePart />,
        permission: Permissions.MANAGE_SPARE_PARTS,
    },
    {
        path: "spare-part-management/edit/:id",
        ele: <EditSparePart />,
        permission: Permissions.MANAGE_SPARE_PARTS,
    },
     {
        path: "spare-part-management/detail/:id",
        ele: <SpartsDetail />,
        permission: Permissions.MANAGE_SPARE_PARTS,
    },
    {
        path: "/spare-parts-management/bulk-upload",
        ele: <BulkUpload />,
        permission: Permissions.MANAGE_SPARE_PARTS,
    },
    {
        path: "rate-card-configuration",
        ele: <RateCards />,
        permission: Permissions.MANAGE_RATE_CARDS,
    },
    {
        path: "inventory-updates/:tab",
        ele: <Inventory />,
        permission: Permissions.MANAGE_RATE_CARDS,
    },
    {
        path: "rate-card-configuration/edit/:id",
        ele: <EditRateCard />,
        permission: Permissions.MANAGE_RATE_CARDS,
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
        path: "/edit-profile",
        ele: <ProfileEdit />,
        permission: Permissions.MANAGE_PROFILE,
    },
    {
        path: "/my-profile/reset-password",
        ele: <ResetPassword />,
        permission: Permissions.MANAGE_PROFILE,
    },
];
