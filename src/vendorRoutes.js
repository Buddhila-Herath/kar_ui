import Dashboard from "./components/vendor/dashboard/VendorDashboard.js";
import SpareParts from "./components/vendor/spare-part/SpareParts";
import BulkUpload from "./components/vendor/spare-part/BulkUpload";
import CreateSparePart from "./components/vendor/spare-part/CreateSparePart";
import SystemConfigurations from "./components/vendor/system-configurations/SystemConfigurations";
import AccountManagement from "./components/vendor/account-management/AccountManagement";
import Profile from "./components/vendor/profile/Profile";
import BasicDetails from "./components/vendor/profile/BasicDetails";
import ProfileEdit from "./components/vendor/profile/ProfileEdit";
import ResetPassword from "./components/vendor/profile/ResetPassword";
import SparePartDetails from "./components/vendor/spare-part/SparePartDetails";
import ServicesDetails from "./components/vendor/service/ServiceDetails";
import CreateService from "./components/vendor/service/CreateService";
import Services from "./components/vendor/service/Services";
import ServiceBulkUpload from "./components/vendor/service/BulkUpload";
import EditSparePart from "./components/vendor/spare-part/EditSparePart";
import EditService from "./components/vendor/service/EditService";
import Technicians from "./components/vendor/technician-management/Technician.js";
import TechniciansDetails from "./components/vendor/technician-management/TechnicianDetails";
import CreateTechnician from "./components/vendor/technician-management/CreateTechnician";
import EditTechnician from "./components/vendor/technician-management/EditTechnician";
import Quotes from "./components/vendor/quote-management/Quotes.js";
import QuoteDetails from "./components/vendor/quote-management/QuoteDetails.js";
import CreateQuote from "./components/vendor/quote-management/CreateQuote.js";
import EditQuote from "./components/vendor/quote-management/EditQuote.js";
import Jobs from "./components/vendor/job-management/Jobs";
import JobDetails from "./components/vendor/job-management/JobDetails";
import Finance from "./components/vendor/finance-management/Finance";
import InvoiceDetails from "./components/vendor/finance-management/InvoiceDetails";
import EditInvoice from "./components/vendor/finance-management/EditInvoice.js";
import Vehicles from "./components/vendor/vehicle-management/Vehicles.js";
import VehicleDetails from "./components/vendor/vehicle-management/VehicleDetails.js";
import CreateVehicle from "./components/vendor/vehicle-management/CreateVehicle.js";
import EditVehicle from "./components/vendor/vehicle-management/EditVehicle.js";
import Clients from "./components/vendor/client-management/Clients.js";
import ClientDetails from "./components/vendor/client-management/ClientDetails.js";
import CreateClient from "./components/vendor/client-management/CreateClient.js";
import EditClient from "./components/vendor/client-management/EditClient.js";
import Users from "./components/vendor/user-management/Users.js";
import UserDetails from "./components/vendor/user-management/UserDetails.js";
import CreateUser from "./components/vendor/user-management/CreateUser.js";
import EditUser from "./components/vendor/user-management/EditUser.js";

import { Permissions } from "./constants";

export const vendorRoutes = [
    {
        path: "/dashboard",
        ele: <Dashboard />,
        permission: Permissions.MANAGE_VENDOR_DASHBOARD,
    },
    {
        path: "/spare-parts-management",
        ele: <SpareParts />,
        permission: Permissions.MANAGE_SPARE_PARTS,
    },
    {
        path: "/spare-parts-management/create",
        ele: <CreateSparePart />,
        permission: Permissions.MANAGE_SPARE_PARTS,
    },
    {
        path: "/spare-parts-management/bulk-upload",
        ele: <BulkUpload />,
        permission: Permissions.MANAGE_SPARE_PARTS,
    },
    {
        path: "/spare-parts-management/detail/:id",
        ele: <SparePartDetails/>,
        permission: Permissions.MANAGE_SPARE_PARTS,
    },
    {
        path: "/spare-parts-management/edit/:id/:portal",
        ele: <EditSparePart/>,
        permission: Permissions.MANAGE_SPARE_PARTS,
    },
    {
        path: "/service-management",
        ele: <Services />,
        permission: Permissions.MANAGE_SERVICES,
    },
    {
        path: "/service-management/create",
        ele: <CreateService />,
        permission: Permissions.MANAGE_SERVICES,
    },
    {
        path: "/service-management/bulk-upload",
        ele: <ServiceBulkUpload />,
        permission: Permissions.MANAGE_SERVICES,
    },
    {
        path: "/service-management/detail/:id",
        ele: <ServicesDetails/>,
        permission: Permissions.MANAGE_SERVICES,
    },
    {
        path: "/service-management/edit/:id/:portal",
        ele: <EditService/>,
        permission: Permissions.MANAGE_SERVICES,
    },
    {
        path: "/technician-management",
        ele: < Technicians/>,
        permission: Permissions.MANAGE_TECHNICIANS,
    },
    {
        path: "/technician-management/detail/:id",
        ele: <TechniciansDetails/>,
        permission: Permissions.MANAGE_TECHNICIANS,
    },
    {
        path: "/technician-management/create",
        ele: <CreateTechnician />,
        permission: Permissions.MANAGE_TECHNICIANS,
    },
    {
        path: "/technician-management/edit/:id",
        ele: <EditTechnician/>,
        permission: Permissions.MANAGE_TECHNICIANS,
    },
    {
        path: "/quote-management",
        ele: <Quotes />,
        permission: Permissions.MANAGE_QUOTES,
    },
    {
        path: "/quote-management/detail/:id",
        ele: <QuoteDetails />,
        permission: Permissions.MANAGE_QUOTES,
    },
    {
        path: "/quote-management/create",
        ele: <CreateQuote />,
        permission: Permissions.MANAGE_QUOTES,
    },
    {
        path: "/quote-management/edit/:id",
        ele: <EditQuote/>,
        permission: Permissions.MANAGE_QUOTES,
    },
    {
        path: "/system-configurations",
        ele: <SystemConfigurations />,
        permission: Permissions.MANAGE_SYSTEM_CONFIG,
    },
    {
        path: "/account-management",
        ele: <AccountManagement />,
        permission: Permissions.MANAGE_ACCOUNT,
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
        path: "/job-management",
        ele: <Jobs />,
        permission: Permissions.MANAGE_JOBS,
    },
    {
        path: "/job-management/detail/:id",
        ele: <JobDetails />,
        permission: Permissions.MANAGE_JOBS,
    },
    {
        path: "/finance-management",
        ele: <Finance />,
        permission: Permissions.MANAGE_FINANCE,
    },
    {
        path: "/finance-management/detail/:id",
        ele: <InvoiceDetails />,
        permission: Permissions.MANAGE_FINANCE,
    },
    {
        path: "/finance-management/edit/:id",
        ele: <EditInvoice/>,
        permission: Permissions.MANAGE_FINANCE,
    },
    {
        path: "/vehicle-management",
        ele: <Vehicles/>,
        permission: Permissions.MANAGE_VEHICLES,
    },
     {
        path: "/vehicle-management/detail/:id",
        ele: <VehicleDetails />,
        permission: Permissions.MANAGE_VEHICLES,
    },
    {
        path: "/vehicle-management/create",
        ele: <CreateVehicle />,
        permission: Permissions.MANAGE_VEHICLES,
    },
    {
        path: "/vehicle-management/edit/:id",
        ele: <EditVehicle />,
        permission: Permissions.MANAGE_VEHICLES,
    },
    {
        path: "/client-management",
        ele: <Clients/>,
        permission: Permissions.MANAGE_CLIENT,
    },
     {
        path: "/client-management/detail/:id",
        ele: <ClientDetails />,
        permission: Permissions.MANAGE_CLIENT,
    },
    {
        path: "/client-management/create",
        ele: <CreateClient />,
        permission: Permissions.MANAGE_CLIENT,
    },
    {
        path: "/client-management/edit/:id",
        ele: <EditClient />,
        permission: Permissions.MANAGE_CLIENT,
    },
    {
        path: "/user-management",
        ele: <Users/>,
        permission: Permissions.MANAGE_USERS,
    },
     {
        path: "/user-management/detail/:id",
        ele: <UserDetails />,
        permission: Permissions.MANAGE_USERS,
    },
    {
        path: "/user-management/create",
        ele: <CreateUser />,
        permission: Permissions.MANAGE_USERS,
    },
    {
        path: "/user-management/edit/:id",
        ele: <EditUser />,
        permission: Permissions.MANAGE_USERS,
    },
    
];
