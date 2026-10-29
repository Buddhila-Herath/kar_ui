//API Base URL
export const apiBaseURL = {
    USERS: "/users",
    USER_LOGIN: "identity-service/auth/login",
    USER_PRIVILAGE: "user-management-service/role-privilege",
    REFRESH_TOKEN: "identity-service/auth/refresh-token",
    CHANGE_PASSWORD: "change-password",
    ADMIN_FORGOT_PASSWORD: "identity-service/send-reset-password-link",
    ADMIN_RESET_PASSWORD: "identity-service/reset-password",
    RESET_PASSWORD: "user-management-service/reset-password",
    VALIDATE_TOKEN: "identity-service/token-verification",
    CHECK_TERMS_AGREEMENT_APPROVAL: "user-management-service/get-user-by-email",
    UPDATE_TERMS_AGREEMENT_APPROVAL: "user-management-service/term-condition-update",
    JOB_STATUS_COUNT: "job-management-service/get-status-count",
    AVAILABLE_JOBS: "job-management-service/get-dashboard-details",
    MY_JOBS: "job-management-service/by-technician-id",
    JOB_OVERVIEW: "job-management-service/by-job-id",
    //TECHNICIAN_ID: "user-management-service/get-user-by-email/",
    VENDOR_PROFILE: "vendor-management-service/vendor/basic-details-by-user-id",
    CLAIM_JOB: "job-management-service/save-technician-job",
    UPDATE_JOB_STATUS: "job-management-service/update-technician-job-status",
    CHECKLIST_BY_SERVICE: "service-management-service/get-check-list/by-service-id",
    ALL_VENDORS: "vendor-management-service/vendor",
    ADD_VENDOR_DETAILS: "vendor-management-service/vendor",
    GENERATE_VENDOR_ID: "vendor-management-service/vendor/generate-id",
    VENDOR_DETAILS_BY_ID: "vendor-management-service/vendor/details",
    UPDATE_VENDOR_DETAILS_BY_ID: "vendor-management-service/vendor",
    DELETE_VENDOR_DETAILS_BY_ID: "vendor-management-service/delete-vendor",
    VENDOR_BUSINESS_ACCOUNT_DETAILS: "vendor-management-service/vendor-account-details",
    UPLOAD_VENDOR_IMAGE: "metadata-service/image/upload-vendor-details",
    DOWNLOAD_NIC_IMAGE: "metadata-service/image/view-images",
    VIEW_IMAGES: "metadata-service/get-details",
    DOWNLOAD_VENDOR_EXCEL_REPORT: "report-management-service/download-vendor",
    GET_ALL_COUNTRIES: "metadata-service/country",
    GET_ALL_PROVINCE_LIST: "cache-management-service/get-all-province-list",
    GET_ALL_DISTRICT_LIST: "cache-management-service/get-all-district-list",
    GET_ALL_CITY_LIST: "cache-management-service/get-all-city-list",
    GET_ALL_BUSINESS_TYPES_LIST: "metadata-service/business-type",
    GET_ALL_MOBILE_CODES: "metadata-service/get-all-mobile-code-list",
    ADD_SERVICE_DETAILS: "service-management-service/service",
    GET_SERVICE_DETAILS_BY_ID: "service-management-service/service/view?serviceId",
    ALL_SERVICES: "service-management-service/get-all-services-list",
    DOWNLOAD_SERVICE_EXCEL_REPORT: "report-management-service/download-services",
    GET_ALL_SERVICE_TYPES: "service-management-service/service-type",
    GET_ALL_SERVICE_CATEGORY: "service-management-service/service-category",
    GET_ALL_TECHNICAN_TYPES: "service-management-service/technician-type",
    GET_ALL_SERVICE_RATE_TYPES: "metadata-service/rate-type",
    UPDATE_RATE_CARD_VENDOR: "service-management-service/global-rate-card/vendor",
    ALL_SPARE_PARTS: "spare-parts-management-service/product",
    REQUIRED_SPARE_PARTS:"inventory-management-service/product/name-list",
    GET_ALL_FUEL_TYPES:"metadata-service/fuel-type",

    EDIT_PROFILE: "edit-profile",
    UPDATE_PROFILE: "vendor-management-service/vendor/update-basic-details",
    USER_RESET_PASSWORD: "user-management-service/user-validated-password-update",
    UPLOAD_PROFILE_PICTURE: "metadata-service/image/upload-vendor-details/vendorProfile",
    UPDATE_PROFILE_PICTURE_PATH: "vendor-management-service/vendor/profile-path-update",
    DELETE_PROFILE_PICTURE: "vendor-management-service/vendor/delete-profile",

    BASIC_BUSINESS_ACCOUNT_DETAILS: "vendor-management-service/vendor/basic-business-details",

    GET_SYSTEM_CONFIGURATION: "vendor-management-service/system-configuration",
    UPDATE_SYSTEM_CONFIGURATION: "vendor-management-service/system-configuration",
    GET_ALL_GLOBAL_RATE_CARDS: "service-management-service/global-rate-card",
    UPDATE_GLOBAL_RATE_CARD: "service-management-service/global-rate-card",
    GET_GLOBAL_RATE_CARD_BY_ID: "service-management-service/global-rate-card/by-id",

    VENDOR_ALL_SPARE_PARTS: "inventory-management-service/product",
    SPARE_PART_DETAILS_BY_ID: "inventory-management-service/product/view/view",
    SPARE_PART_DETAILS_BY_ID_FOR_EDIT: "inventory-management-service/product/view/edit",
    DELETE_SPARE_PART: "inventory-management-service/product/delete",
    DOWNLOAD_SPARE_PART_EXCEL_REPORT: "report-management-service/download-spare-parts-details",
    UPDATE_SPARE_PART: "inventory-management-service/product",
    PART_PLACEMENT_CODE: "inventory-management-service/product/part-placement-code",

    GET_ALL_VARIATIONS: "metadata-service/variants",
    GET_ALL_VEHICLE_CATEGORY: "metadata-service/vehicle/categories",
    GET_ALL_UNITS: "metadata-service/unit",
    GET_ALL_VEHICLE_MAKES: "metadata-service/vehicle/make",
    GET_ALL_VEHICLE_MAKES_CATEGORIES: "metadata-service/vehicle/make-category",
    GET_ALL_VEHICLE_MAKES_GROUP: "metadata-service/vehicle/makes-grouped",
    GET_ALL_VEHICLE_MODELS: "metadata-service/vehicle/models",
    GET_ALL_VEHICLE_MODELS_GROUP: "metadata-service/vehicle/models-grouped",
    GET_VEHICLE_MAKE_CATEGORY_BY_MAKE_ID: "metadata-service/vehicle/make-category-make-id",
    VEHICLE_EDIT_VIEW_BY_ID: "customervehicle-management-service/vehicle/edit",
    UPDATE_VEHICLE_DETAILS: "customervehicle-management-service/vehicle/update",

    ADD_VEHICLE_CATEGORY: "metadata-service/vehicle/categories",
    ADD_VEHICLE_MAKE: "metadata-service/vehicle/make",
    ADD_VEHICLE_MODEL: "metadata-service/vehicle/model",
    ADD_UNIT: "metadata-service/unit",

    DELETE_UNIT: "metadata-service/delete-unit",
    DELETE_VEHICLE_CATEGORY: "metadata-service/delete-vehicle-category",
    DELETE_VEHICLE_MODEL: "metadata-service/delete-vehicle-model",
    DELETE_VEHICLE_MAKE: "metadata-service/delete-vehicle-make",

    GENERATE_SPARE_PART_ID: "inventory-management-service/product/generate-primary-id",
    UPLOAD_SPARE_PART_IMAGE: "inventory-management-service/image/upload/sparepart",
    SAVE_SPARE_PART: "inventory-management-service/product",

    UPLOAD_SPARE_PART_NOTE_FILES: "inventory-management-service/image/upload/sparepart-attachment",
    SAVE_SPARE_PART_NOTE: "inventory-management-service/product/note",
    DELETE_SPARE_PART_NOTE: "inventory-management-service/product/delete-note",
    SPARE_PART_NOTE_ATTACHMENT_DOWNLOAD: "inventory-management-service/image/download",

    DOWNLOAD_SPARE_PART_TEMPLETE: "report-management-service/download-spare-parts-bulk-upload-template",
    UPLOAD_BULK_SPARE_PARTS: "inventory-management-service/product/bulk-list",
    UPDATE_ADMIN_SPARE_PART:"inventory-management-service/product/admin-update",

    VENDOR_ALL_SERVICES: "service-management-service/service",
    SERVICE_BY_ID:"service-management-service/service/view",
    DELETE_SERVICES: "service-management-service/service/delete",
    SERVICE_DOWNLOAD:"metadata-service/image",
    UPLOAD_SERVICE_CHECKLIST: "metadata-service/image/upload-service-details/serviceCheckList",
    UPLOAD_SERVICE_ATTACHMENT: "metadata-service/image/upload-service-details/serviceAttachment",
    UPLOAD_BULK_SERVICES: "service-management-service/service/bulk-list",
    CALCULATE_TOTALSERVICE_COST: "service-management-service/service/calculate-total-cost",
    GENERATE_SERVICE_PRIMARY_ID: "service-management-service/service/generate-primary-id",
    UPDATE_SERVICE: "service-management-service/service",
    UPDATE_ADMIN_SERVICES:"service-management-service/service/admin-update",

    VENDOR_ALL_TECHNICIANS: "user-management-service/technician",
    TECHNICIAN_DETAILS_BY_ID: "user-management-service/technician/by-id",
    TECHNICIAN_DOWNLOAD_EXCEL_REPORT: "report-management-service/technician/download-services",
    DOWNLOAD_TECHINCIAN_DETAILS: "report-management-service/technician/download-details",
    GENERATE_TECHINCIAN_PRIMARY_ID: "user-management-service/technician/generate-primary-id",
    SAVE_TECHINCIAN_DATA: "user-management-service/technician",
    UPLOAD_TECHINCIAN_IMAGE: "metadata-service/image/upload-single",

    VENDOR_ALL_QUOTES: "job-management-service/quote",
    DOWNLOAD_QUOTES_REPORT: "report-management-service/quote/download",
    QUOTES_BY_ID: "job-management-service/quote",
    QUOTES_STATUS_UPDATE: "job-management-service/quote/change-status",

    GET_INSURANCE_COMPANY_LIST: "metadata-service/insurance",
    ADD_NEW_INSURANCE_COMPANY: "metadata-service/insurance",
    GET_JOB_TYPE_LIST: "metadata-service/job-type",
    GET_PRIORITY_LIST: "metadata-service/priority",

    GET_ALL_CUSTOMER_LIST: "customervehicle-management-service/client/names",
    GET_VEHICLE_REGISTRATION_NO_LIST: "customervehicle-management-service/vehicle/registration-numbers",

    GET_CUSTOMERVEHICLE_LIST: "customervehicle-management-service/ws",
    VENDOR_ALL_CLIENTS: "customervehicle-management-service/client",
    CLIENT_DETAILS_BY_ID: "customervehicle-management-service/client/view",
    UPLOAD_CLIENT_IMAGE: "customervehicle-management-service/image/single-upload/profile",
    VIEW_CLIENT_IMAGE_BY_PATH: "customervehicle-management-service/image/view",
    DOWNLOAD_CLIENT_REPORT: "report-management-service/client/download",
    GET_ALL_CITY: "metadata-service/country/city",
    CLIENTS_EDIT_VIEW_BY_ID: "customervehicle-management-service/client/edit",
    UPDATE_CLIENT_DETAILS: "customervehicle-management-service/client/update",

    GET_SERVICE_NAMES_BASED_ON_CATEGORY: "service-management-service/service/by-category-id",
    GET_PART_NAME_BASED_ON_CATEGORY: "inventory-management-service/product/category-based",
    SAVE_SPARE_PART_COST: "job-management-service/quote/by-product-id",
    SAVE_SERVICE_COST: "job-management-service/quote/by-service-id",
    SPARE_PART_VALIDATION: "inventory-management-service/product/available",

    GENERATE_QUOTE_PRIMARY_ID: "job-management-service/quote/generate-primary-id",
    SAVE_NEW_CUSTOMER_NAME_AND_VEHICLE_NO: "customervehicle-management-service/customer",
    ASSIGN_SPARE_PART_TO_SERVICE: "job-management-service/quote/assign-part",
    SAVE_QUOTE: "job-management-service/quote",
    DELETE_PART_SERVICE: "job-management-service/quote/delete-parts-service",

    UPDATE_CUSTOMER_NAME_AND_VEHICLE_NO: "customervehicle-management-service/customer/update-guest",
    UPDATE_QUOTE: "job-management-service/quote/update",
    UPDATE_QUOTE_SPARE_PART: "job-management-service/quote/update-spare-part",
    UPDATE_QUOTE_SERVICE: "job-management-service/quote/update-service",
    DELETE_SPARE_PART_FROM_EXISTING_QUOTE: "job-management-service/quote/delete-spare-part",
    DELETE_SERVICE_FROM_EXISTING_QUOTE: "job-management-service/quote/delete-service",
    GET_JOBS: "job-management-service/job/dashboard-details",
    CREATE_JOB: "job-management-service/job",
    UPDATE_VEHICLE_ARRIVAL_DATE: "job-management-service/job/vehicle-arrival-date",
    VIEW_JOB: "job-management-service/job",
    UPDATE_JOB_STATUS: "job-management-service/job/service-status",
    UPDATE_UNIVERSAL_JOB_STATUS: "job-management-service/job/universal-status",
    SAVE_GET_PAUSE_REASON: "job-management-service/feed-back", // for post and get method
    VIEW_PAUSE_REASON_BY_SERVICE_ID: "job-management-service/feed-back/by-id",
    UPLOAD_JOB_IMAGES: "metadata-service/image/job-upload", // metadata-service/job-upload/current/J06 (orderPart, returnPart, post, current, feedBack)
    SAVE_CURRENT_WORK_IMAGES: "job-management-service/job/current-images",
    SAVE_POST_COMPLETION_IMAGES: "job-management-service/job/post-images",
    ASSIGN_UNIVERSAL_TECHNICIAN: "job-management-service/job/universal-technician",
    GET_TECHNICIAN_NAME_LIST: "user-management-service/technician/names",
    ASSIGN_TECHNICIAN_TO_JOB: "job-management-service/job/technicians",
    REMOVE_NEWLY_ADDED_PARTS_SERVICE: "job-management-service/job/delete-unused",
    REMOVE_UPDATED_PARTS_SERVICE: "job-management-service/quote/cancel",
    ADD_JOB_MILAGE: "job-management-service/job/mileage",

    GET_TOTAL_JOB_COUNT: "job-management-service/job/total-count",
    GET_TOTAL_PENDING_JOB_COUNT: "job-management-service/job/pending-count",
    GET_TOTAL_ON_HOLD_JOB_COUNT: "job-management-service/job/on-hold-count",
    GET_TOTAL_IN_PROGRESS_JOB_COUNT: "job-management-service/job/inprogress-count",
    GET_TOTAL_COMPLETED_JOB_COUNT: "job-management-service/job/completed-count",
    JOBS_COUNT: "job-management-service/job/counts",
    GET_TOTAL_IDLE_TIME:"job-management-service/job/total-idle-time",

    VIEW_IMAGE_BY_PATH: "metadata-service/image/s3-upload-view",

    ADMIN_PROFILE: "user-management-service/get-user-by-dashboard-details",     
    UPDATE_ADMIN_PROFILE: "user-management-service/update-user-profile",
    UPDATE_ADMIN_PROFILE_PICTURE_PATH: "user-management-service/profile-path-update",
    DELETE_ADMIN_PROFILE_PICTURE: "user-management-service/profile/delete",
    UPLOAD_ADMIN_PROFILE_PICTURE: "user-management-service/profile/upload/adminProfile",
    ADMIN_DASHBOARD_RESOURCES_COUNT: "cache-management-service/super-admin-counts",

    TECHNICIAN_PROFILE: "user-management-service/technician/get-technician-basic-details-by-user-id",
    UPDATE_TECHNICAN_PROFILE: "user-management-service/technician/basic-details",
    UPDATE_TECHNICAN_PROFILE_PICTURE_PATH: "user-management-service/technician/profile-path-update",
    DELETE_TECHNICAN_PROFILE_PICTURE: "user-management-service/technician/delete-profile",
    UPLOAD_TECHINCIAN_PROFILE_PICTURE: "metadata-service/image/upload-single/technicianProfile",

    GET_TECHNICIAN_OPEN_JOB_COUNT: "job-management-service/technician-job/open-count",
    GET_TECHNICIAN_UNDER_TAKEN_JOB_COUNT: "job-management-service/technician-job/under-taken-count",
    GET_TECHNICIAN_COMPLETED_JOB_COUNT: "job-management-service/technician-job/completed-count",
    GET_TECHNICIAN_JOB_COUNT: "job-management-service/technician-job/available-my-jobs-count",
    GET_TECHNICIAN_JOBS:"job-management-service/technician-job/dashboard-details",
    GET_TECHNICIAN_JOB_BY_ID: "job-management-service/technician-job/view-technician-job",

    GET_ALL_VEHICLES: "customervehicle-management-service/vehicle",
    GET_VEHICLE_DETAILS_BY_ID: "customervehicle-management-service/vehicle/view",
    VEHICLE_DOWNLOAD_EXCEL_REPORT: "report-management-service/vehicle/download",
    SAVE_VEHICLE: "customervehicle-management-service/vehicle",
    UPLOAD_VEHICLE_REGISTRATION_IMAGES: "customervehicle-management-service/image/upload/vehicleRegistration",

    CREATE_VIEW_INVOICE: "finance-management-service/finance",
    GET_ALL_INVOICES: "finance-management-service/finance/all",
    DOWNLOAD_INVOICES_REPORT: "report-management-service/invoice",
    UPDATE_PART: "job-management-service/finance/update-part",
    UPDATE_FINANCE_SERVICE: "job-management-service/finance/update-service",
    UPDATE_INVOICE: "finance-management-service/finance",
    INVOICE_MATRICS: "job-management-service/finance/metrics",
    GET_INVOICE_BY_ID: "finance-management-service/finance/view",
    SAVE_USER_CUSTOMIZATION: "user-management-service/user-customize",

    VENDOR_EMAIL_UPDATE_NOTIFICATION: "vendor-management-service/ws",

    SAVE_VENDOR_USER: "user-management-service/vendor-user",
    UPLOAD_VENDOR_USER_FILE: "user-management-service/profile/upload",
    VIEW_USER_DETAILS_BY_ID: "user-management-service/vendor-user",
    GET_ALL_VENDOR_USERS: "user-management-service/vendor-user",
    DOWNLOAD_VENDOR_USER_EXCEL_REPORT: "report-management-service/vendor-user",
    UPDATE_USER_DETAILS_BY_ID: "job-management-service/vendor-user",
    SHARE_QUOTE_INVOICE: "report-management-service/quote/share",

    // Admin
    RECENT_VENDOR_LIST: "vendor-management-service/vendor/recently-joined",
    GET_NOTIFICATION_LIST_COUNT: "user-management-service/user-notification/count",
    GET_NOTIFICATION_LIST: "user-management-service/ws",
    GET_NOTIFICATION_ALERT: "job-management-service/ws",
    MARK_SINGLE_NOTIFICATION_READ_STATUS: "user-management-service/user-notification/read",
    MARK_ALL_NOTIFICATION_READ_STATUS: "user-management-service/user-notification/read-all", 
    DELETE_NOTIFICATION: "user-management-service/user-notification/delete",
    SPARE_PART_ZERO_STOCK_COUNT: "inventory-management-service/product/quantity-available",
    INVENTORY_SERVICE_UPDATE: "service-management-service/admin-service",
    VIEW_SINGLE_SPARE_PART_INVENTORY_UPDATE: "inventory-management-service/admin-product/recent-modifications",
    GET_MODIFIED_BY: "user-management-service/all-vendors",
    VIEW_SINGLE_INVENTORY_UPDATE:"service-management-service/admin-service/recent-modifications",
    UPDATE_INVENTORY_STATUS:"service-management-service/admin-service/approve-or-reject",
    UPDATE_INVENTORY_SPARE_PART_STATUS:"inventory-management-service/admin-product/approve-or-reject",

    TOTAL_INVOICE_COUNT_METRICS: "finance-management-service/invoice/total",
    TOTAL_JOBS_COUNT_METRICS: "job-management-service/job/total",
    TOTAL_QUOTES_COUNT_METRICS: "job-management-service/quote/total",

    JOB_COMPLETION_RATE_PIE: "job-management-service/job/completion-rate",
    RECENT_VENDOR_ACTIVITIES: "job-management-service/activities",
    ESTIMATES_STATUS_CHART: "job-management-service/quote/quote-by-status",
    SALES_OVERVIEW_CHART: "finance-management-service/sales",
    COMPARISON_CHART: "finance-management-service/invoice/tax-proforma-invoice",

    INVENTORY_UPDATES_SPARE_PARTS: "inventory-management-service/admin-product",
    INVENTORY_UPDATES_COUNTS: "service-management-service/admin-service/counts",

    ORDER_UPLOAD_IMAGE: "/order-images",
    UPLOAD_POST_COMPLETION_IMAGE: "job-management-service/job/upload/post",
    DELETE_UPLOADED_IMAGE: "job-management-service/job/delete",
    UPLOAD_VEHICLE_IMAGE: "customervehicle-management-service/image/upload/vehicleRegistration",
};

export const authActionType = {
    LOGIN_USER: "LOGIN_USER",
    LOGOUT_USER: "LOGOUT_USER",
    CHANGE_PASSWORD: "CHANGE_PASSWORD",
    ADMIN_FORGOT_PASSWORD: "ADMIN_FORGOT_PASSWORD",
    ADMIN_RESET_PASSWORD: "ADMIN_RESET_PASSWORD",
    REFRESH_TOKEN: "REFRESH_TOKEN"
};

export const userActionType = {
    TECHNICIAN_PROFILE: "TECHNICIAN_PROFILE",
    FETCH_USERS: "FETCH_USERS",
    FETCH_USER: "FETCH_USER",
    ADD_USER: "ADD_USER",
    EDIT_USER: "EDIT_USER",
    DELETE_USER: "DELETE_USER",
};

export const profileActionType = {
    FETCH_PROFILE: "FETCH_PROFILE",
    UPDATE_PROFILE: "UPDATE_PROFILE",
};

export const configActionType = {
    FETCH_CONFIG: "FETCH_CONFIG",
    FETCH_ALL_CONFIG: "FETCH_ALL_CONFIG",
};

export const dateLabelSelector = {
    CLEAN: "clean",
    TODAY: "today",
    THIS_WEEK: "this_week",
    LAST_WEEK: "last_week",
    THIS_MONTH: "this_month",
    LAST_MONTH: "last_month",
    CUSTOM: "custom",
};

export const Filters = {
    PAGE: 1,
    OBJ: {
        page: 1,
        size: 10,
        searchTerm: "",
        order: "DESC"
    },
};

export const constants = {
    SET_TOTAL_OPEN_JOBS_RECORD: "SET_TOTAL_OPEN_JOBS_RECORD",
    UPDATE_TOTAL_OPEN_JOBS_RECORD_AFTER_CLAIM: "UPDATE_TOTAL_OPEN_JOBS_RECORD_AFTER_CLAIM",
    UPDATE_TOTAL_OPEN_JOB_RECORD_AFTER_ADD: "UPDATE_TOTAL_OPEN_JOB_RECORD_AFTER_ADD",
    SET_TOTAL_MY_JOBS_RECORD: "SET_TOTAL_MY_JOBS_RECORD",
    UPDATE_TOTAL_MY_JOBS_RECORD_AFTER_DELETE: "UPDATE_TOTAL_MY_JOBS_RECORD_AFTER_DELETE",
    UPDATE_TOTAL_MY_RECORD_AFTER_ADD: "UPDATE_TOTAL_MY_JOBS_RECORD_AFTER_ADD",
    IS_LOADING: "IS_LOADING",
    SET_LANGUAGE: "SET_LANGUAGE",
    DATE_ACTION: "DATE_ACTION",
    SET_DATE_FORMAT: "SET_DATE_FORMAT",
    SET_SAVING: "SET_SAVING",
};

export const dateFormat = {
    DEFAULT_MOMENT: "YYYY-MM-DD hh:mm:ss",
    NATIVE: "dd-MM-yyyy",
    API_NATIVE: "yyyy-MM-dd",
    CHART_DATE: "YYYY/MM/DD",
    CHART_CUSTOM_DATE: "MMM_YYYY",
    DISPLAY_DATE: "dd MMM YYYY"
};

export const toastType = {
    ADD_TOAST: "ADD_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST",
    ERROR: "error",
};

export const Tokens = {
    ADMIN: "auth_token",
    VENDOR: "vendor_token",
    TECHNICIAN: "technician_token",
    REFRESH: "refresh_token",
    USER: "user",
    USER_ID: "user_id",
    TERMS_ACCEPTED: "termsAccepted",
    FIRST_NAME: "first_name",
    LAST_NAME: "last_name",
    TECHNICIAN_ID: "technician_id",
    EMAIL: "email_id",
    IMAGE: "image",
    IMAGE_PATH: "image_path",
    BUSINESS_LOGO: "business_logo",
    BUSINESS_LOGO_PATH: "business_logo_path",
    VENDOR_ID: "vendor_id",
    VENDOR_USER_ID: "vendor_user_id",
    ADMIN_ID: "admin_id",
    TECHNICIAN_ID: "technician_id",
    USER_IMAGE_URL: "user_image_url",
    UPDATED_EMAIL: "updated_email",
    UPDATED_FIRST_NAME: "updated_first_name",
    UPDATED_LAST_NAME: "updated_last_name",
    LANGUAGE: "language",
    UPDATED_LANGUAGE: "updated_language",
    GLOBAL_SPARE_PART: "global_spare_part",
    GLOBAL_SERVICES: "global_services",
    GLOBAL_RATE_CARD: "global_rate_card"
};

export const Permissions = {
    MANAGE_VENDOR_DASHBOARD: "vendor_dashboard",
    MANAGE_ADMIN_DASHBOARD: "admin_dashboard",
    MANAGE_TECNICIAN_DASHBOARD: "technician_dashboard",
    MANAGE_SPARE_PARTS: "spare_part_management",
    MANAGE_SERVICES: "service_management",
    MANAGE_VENDORS: "vendor_management",
    MANAGE_QUOTES: "quote_management",
    MANAGE_JOBS: "job_management",
    MANAGE_TECHNICIANS: "technician_management",
    MANAGE_FINANCE: "finance_management",
    MANAGE_VEHICLES: "vehicel_management",
    MANAGE_CLIENT: "client_management",
    MANAGE_RATE_CARDS: "rate_card_configuration_admin",
    MANAGE_SYSTEM_CONFIG: "system_configuration",
    MANAGE_ACCOUNT: "account_management",
    MANAGE_PROFILE: "profile_settings",
    MANAGE_USERS: "user_management",
};

export const jobStatusCountActionType = {
    JOB_STATUS_COUNT: "JOB_STATUS_COUNT",
};

export const jobsActionType = {
    FETCH_AVAILABLE_JOBS: "FETCH_AVAILABLE_JOBS",
    VIEW_JOB: "VIEW_JOB",
    MY_JOBS: "MY_JOBS",
    CLAIM_JOB: "CLAIM_JOB",
    UPDATE_JOB_STATUS: "UPDATE_JOB_STATUS",
    CHECKLIST_BY_SERVICE: "CHECKLIST_BY_SERVICE"
};

export const errorMessage = {
    TOKEN_NOT_PROVIDED: "Token not provided",
    TOKEN_EXPIRED: "Token has expired",
    TOKEN_INVALID:
        "Could not decode token: Error while decoding to JSON: Syntax error",
    TOKEN_INVALID_SIGNATURE: "Token Signature could not be verified.",
};

export const settingsKey = {
    LANGUAGE: "language",
    DEFAULT_LOCALE: "en",
    LOCAL_GERMAN: "gr",
};

export const languageOptions = [
    {
        id: "en",
        name: "settings.select.language.english.label",
        display_name: "English",
    },
];

export const languageFileOptions = [
    { id: 1, name: "language.json" },
    { id: 2, name: "messages.php" },
    { id: 3, name: "Error Messages" },
    { id: 4, name: "Success Messages" },
    { id: 5, name: "Pdf Messages" },
];

export const JobImageTemplate = {
    POPUP_TITLE: 'Image Template',
    RIGHT_SIDE_OF_VEHICLE: 'Right Side of Vehicle',
    FRONT_RIGHT_SIDE_OF_VEHICLE: 'Front Right Side of Vehicle',
    FRONT_SIDE_OF_VEHICLE: 'Front Side of Vehicle',
    FRONT_LEFT_SIDE_OF_VEHICLE: 'Front Left Side of Vehicle',
    LEFT_SIDE_OF_VEHICLE: 'Left Side of Vehicle',
    REAR_LEFT_SIDE_OF_VEHICLE: 'Rear Left Side of Vehicle',
    REAR_SIDE_OF_VEHICLE: 'Rear Side of Vehicle',
    REAR_RIGHT_SIDE_OF_VEHICLE: 'Rear Right Side of Vehicle',
    INSTRUMENT_CLUSTER_OF_VEHICLE: 'Instrument Cluster of Vehicle',
    DASHBOARD_OF_VEHICLE: 'Dashboard of Vehicle',
    ENGINE_COMPARTMENT_OF_VEHICLE: 'Engine Compartment of Vehicle',
}
