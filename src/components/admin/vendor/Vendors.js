import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip } from 'antd';
import TabTitle from "../../../shared/tab-title/TabTitle";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import MasterLayout from "../../MasterLayout";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import DeleteVendor from "./DeleteVendor";
import { fetchAllVendors, fetchAllVendorsSilent, downloadExcelReport } from '../../../slices/vendorSlice';
import { Filters } from "../../../constants";
import { renderSortIcons } from "../../../config/sortConfig";
import {
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import ActionButton from "../../../shared/action-buttons/ActionButton";
import { saveAs } from 'file-saver';
import FieldSelectionDropdown from "../../../shared/components/FieldSelectionDropdown";
import { saveUserCustomization } from "../../../slices/masterDataSlice";

const Vendors = () => {
    const { isVendorsLoading, allVendors, totalRecord, totalPages, error, isDownloadLoading } = useSelector((state) => state.vendors);
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [filter, setFilter] = useState({
        page: Filters.OBJ.page,
        size: Filters.OBJ.size,
        searchTerm: Filters.OBJ.searchTerm,
        status: "",
        businessType: "",
        toDate: "",
        fromDate: "",
        sortField: "",
        sortOrder: Filters.OBJ.order,
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isFilterApplied = (filter.searchTerm || filter.businessType || filter.status || filter.fromDate || filter.toDate)?true:false;

    // Field selection dropdown UI state
    const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
    const [selectAllChecked, setSelectAllChecked] = useState(undefined); // undefined => auto-compute in dropdown
    const userChangedVisibilityRef = useRef(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [loadingColumns, setLoadingColumns] = useState({});

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        dispatch(fetchAllVendors(filter));
    }, [dispatch, filter]);

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const onChange = (filters) => {
        setFilter((prevFilter) => {
            const newFilter = {
                ...prevFilter,
                ...filters,
            };
            if (JSON.stringify(prevFilter) !== JSON.stringify(newFilter)) {
                return newFilter;
            }
            return prevFilter;
        });
    };

    const customSort = (column, sortDirection) => {
        if (column) {
            setFilter((prevFilter) => ({
                ...prevFilter,
                sortField: column.sortField,
                sortOrder: sortDirection.toUpperCase(),
            }));
        }
    };

    const goToEditVendor = (item) => {
        const id = item.id;
        navigate(`/admin/vendor-management/edit/${id}`);
    };

    const goToVendorDetailPage = (id) => {
        navigate(`/admin/vendor-management/detail/${id}`);
    };

    const onExcelClick = async () => {
        try {
            const excelFilter = {
                ...filter,
                page: 1,
                size: totalRecord
            };
            const response = await dispatch(downloadExcelReport(excelFilter)).unwrap();
            const blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const day = String(today.getDate()).padStart(2, "0");
            const dateString = `${year}${month}${day}`;

            const fileName = `vendors_${dateString}.xlsx`;
            saveAs(blob, fileName);
        } catch (error) {
            console.error("Error downloading the Excel file:", error);
        }
    };

    const itemsValue =
        allVendors.length >= 0 &&
        allVendors.map((vendor, index) => ({
            id: vendor.vendorPrimaryId,
            no: String((filter.page - 1) * filter.size + index + 1).padStart(2, '0'),
            vendor_id: vendor.vendorId,
            first_name: vendor.firstName,
            last_name: vendor.lastName,
            contact_number: vendor.mobileNumber,
            email: vendor.emailAddress,
            nic: vendor.nic,
            business_name: vendor.businessName,
            business_address_line1: vendor.businessAddressLine1,
            district: vendor.district,
            province: vendor.province,
            telephone: vendor.businessTelephone,
            business_email: vendor.businessEmail,
            business_type: vendor.businessTypeNames || [],
            joined_date: vendor.joinDate,
            status: vendor.status === true ? "Active" : (vendor.status === false ? "Inactive" : ""),
            registered_by: vendor.registeredBy
        }));

  
    const STORAGE_KEY_VENDOR = 'USER_COLUMNS_VENDOR_MANAGEMENT';
    const VENDOR_NAME_TO_ID = {
        'Vendor ID': 'vendor_id',
        'First Name': 'first_name',
        'Last Name': 'last_name',
        'Contact Number': 'contact_number',
        'Email Address': 'email',
        'Status': 'status',
        'NIC': 'nic',
        'Business Name': 'business_name',
        'Business Address 1': 'business_address_line1',
        'District': 'district',
        'Province': 'province',
        'Telephone': 'telephone',
        'Business Email': 'business_email',
        'Business Type': 'business_type',
        'Joined Date': 'joined_date',
        'Registered By': 'registered_by',
    };


    // Define field list for selection dropdown (ids must match column fieldId)
    const allFields = [
        { id: 'no', name: 'No', visible: true },
        { id: 'vendor_id', name: 'Vendor ID', visible: true },
        { id: 'first_name', name: 'First Name', visible: true },
        { id: 'last_name', name: 'Last Name', visible: true },
        { id: 'contact_number', name: 'Contact Number', visible: true },
        { id: 'email', name: 'Email Address', visible: true },
        { id: 'status', name: 'Status', visible: true },
        { id: 'nic', name: 'NIC', visible: true },
        { id: 'business_name', name: 'Business Name', visible: true },
        { id: 'business_address_line1', name: 'Business Address 1', visible: true },
        { id: 'district', name: 'District', visible: true },
        { id: 'province', name: 'Province', visible: true },
        { id: 'telephone', name: 'Telephone', visible: true },
        { id: 'business_email', name: 'Business Email', visible: true },
        { id: 'business_type', name: 'Business Type', visible: true },
        { id: 'joined_date', name: 'Joined Date', visible: true },
        { id: 'registered_by', name: 'Registered By', visible: true },
    ];

    const initialVisibleFields = allFields.reduce((acc, f) => {
        acc[f.id] = f.visible;
        return acc;
    }, {});

    const [visibleFields, setVisibleFields] = useState(() => {
        try {
            const json = localStorage.getItem(STORAGE_KEY_VENDOR);
            if (!json) return initialVisibleFields;
            const savedNames = JSON.parse(json);
            const next = { ...initialVisibleFields };
            Object.keys(next).forEach((k) => { if (k !== 'no') next[k] = false; });
            savedNames.forEach((name) => {
                const id = VENDOR_NAME_TO_ID[name];
                if (id) next[id] = true;
            });
            return next;
        } catch {
            return initialVisibleFields;
        }
    });

    // Let auto-hide run on initial load; mark as changed only after user toggles fields
    useEffect(() => {
        userChangedVisibilityRef.current = false;
    }, []);

    // Auto-hide/auto-show based on current page data (runs only before user changes in this session)
    useEffect(() => {
        const items = Array.isArray(itemsValue) ? itemsValue : [];
        if (!items || items.length === 0) return;
        if (userChangedVisibilityRef.current) return;
        const fallbackLockedIds = ['business_name', 'telephone'];
        setVisibleFields((prev) => {
            const next = { ...prev };
            let changed = false;
            dropdownFields.forEach((field) => {
                const anyHasValue = items.some((row) => {
                    const v = row[field.id];
                    if (v === null || v === undefined) return false;
                    if (Array.isArray(v)) return v.length > 0;
                    if (typeof v === 'string') return v.trim().length > 0;
                    if (typeof v === 'number' || typeof v === 'boolean') return true;
                    return false;
                });
                // Hide columns with no data; show columns that do have data on initial load
                if (!anyHasValue && next[field.id] !== false) {
                    next[field.id] = false;
                    changed = true;
                }
            });
            if (next['no'] !== true) { next['no'] = true; changed = true; }
            const anyVisible = dropdownFields.some((f) => next[f.id]);
            if (!anyVisible) {
                fallbackLockedIds.forEach((id) => {
                    if (next[id] !== true) { next[id] = true; changed = true; }
                });
            }
            if (changed) {
                setSelectAllChecked(undefined);
                return next;
            }
            return prev;
        });
    }, [itemsValue]);

    const dropdownFields = allFields.filter(f => f.id !== 'no');

    // Helper: build the list of selected column display names for API (strings only)
    const getSelectedColumnNames = (visibility) => {
        const nameMap = {
            vendor_id: 'Vendor ID',
            first_name: 'First Name',
            last_name: 'Last Name',
            contact_number: 'Contact Number',
            email: 'Email Address',
            status: 'Status',
            nic: 'NIC',
            business_name: 'Business Name',
            business_address_line1: 'Business Address 1',
            district: 'District',
            province: 'Province',
            telephone: 'Telephone',
            business_email: 'Business Email',
            business_type: 'Business Type',
            joined_date: 'Joined Date',
            registered_by: 'Registered By',
        };
        return dropdownFields
            .filter((f) => visibility[f.id])
            .map((f) => nameMap[f.id] || (typeof f.name === 'string' ? f.name : ''))
            .filter(Boolean);
    };

    // Immediate persist + then silent refetch, ensuring save is applied first
    const persistAndRefetch = async (columnsName, toggledOnFieldIds = []) => {
        try {
            await dispatch(saveUserCustomization({ columnsName, moduleName: 'VENDOR_MANAGEMENT' })).unwrap();
        } catch (_) {}
        try {
            localStorage.setItem(STORAGE_KEY_VENDOR, JSON.stringify(columnsName));
        } catch {}
        try {
            await dispatch(fetchAllVendorsSilent(filter)).unwrap();
        } finally {
            if (Array.isArray(toggledOnFieldIds) && toggledOnFieldIds.length > 0) {
                setLoadingColumns((prev) => {
                    const next = { ...prev };
                    toggledOnFieldIds.forEach((id) => { next[id] = false; });
                    return next;
                });
            }
        }
    };

    // Lock Business Name and Telephone; ensure at least these stay when Select All is unchecked
    const toggleFieldVisibility = (fieldId) => {
        if (fieldId === 'no') return;
        const lockedFieldIds = ['business_name', 'telephone'];
        const newVisibility = { ...visibleFields, [fieldId]: !visibleFields[fieldId] };
        const visibleCount = dropdownFields.reduce((acc, f) => acc + (newVisibility[f.id] ? 1 : 0), 0);
        if (visibleCount === 0) {
            lockedFieldIds.forEach(id => { newVisibility[id] = true; });
            newVisibility['no'] = true;
            setSelectAllChecked(false);
        } else {
            setSelectAllChecked(undefined);
        }
        setVisibleFields(newVisibility);
        userChangedVisibilityRef.current = true;
        // Persist user customization
        let columnsName = getSelectedColumnNames(newVisibility);
        const toggledOnFieldIds = [];
        if (newVisibility[fieldId] && !visibleFields[fieldId]) {
            toggledOnFieldIds.push(fieldId);
        }
        if (newVisibility[fieldId]) {
            const ensureLabelMap = {
                vendor_id: 'Vendor ID',
                first_name: 'First Name',
                last_name: 'Last Name',
                contact_number: 'Contact Number',
                email: 'Email Address',
                status: 'Status',
                nic: 'NIC',
                business_name: 'Business Name',
                business_address_line1: 'Business Address 1',
                district: 'District',
                province: 'Province',
                telephone: 'Telephone',
                business_email: 'Business Email',
                business_type: 'Business Type',
                joined_date: 'Joined Date',
                registered_by: 'Registered By',
            };
            const label = ensureLabelMap[fieldId] || fieldId;
            if (!columnsName.includes(label)) {
                columnsName = [...columnsName, label];
            }
        }
        if (toggledOnFieldIds.length > 0) {
            setLoadingColumns((prev) => ({ ...prev, ...Object.fromEntries(toggledOnFieldIds.map(id => [id, true])) }));
        }
        persistAndRefetch(columnsName, toggledOnFieldIds);
    };

    const toggleSelectAll = (checked) => {
        const lockedFieldIds = ['business_name', 'telephone'];
        let newVisibility = { ...visibleFields };
        if (checked === false) {
            dropdownFields.forEach(field => {
                newVisibility[field.id] = lockedFieldIds.includes(field.id);
            });
            newVisibility['no'] = true;
            setVisibleFields(newVisibility);
            setSelectAllChecked(false);
            userChangedVisibilityRef.current = true;
            persistAndRefetch(getSelectedColumnNames(newVisibility));
            return;
        }
        const toggledOnFieldIds = [];
        dropdownFields.forEach(field => {
            if (!newVisibility[field.id]) toggledOnFieldIds.push(field.id);
            newVisibility[field.id] = true;
        });
        newVisibility['no'] = true;
        setVisibleFields(newVisibility);
        setSelectAllChecked(true);
        userChangedVisibilityRef.current = true;
        if (toggledOnFieldIds.length > 0) {
            setLoadingColumns((prev) => ({ ...prev, ...Object.fromEntries(toggledOnFieldIds.map(id => [id, true])) }));
        }
        persistAndRefetch(getSelectedColumnNames(newVisibility), toggledOnFieldIds);
    };


    // Build all columns with fieldId; spacer + actions at the end (actions header hosts the dropdown)
    const allColumns = [
        {
            id: 1,
            name: "No",
            selector: (row) => row.no,
            sortField: "no",
            sortable: false,
            maxWidth: '100px',
            minWidth: '70px',
            fieldId: 'no',
        },
        {
            id: 2,
            name: "Vendor ID",
            selector: (row) => row.vendor_id,
            sortField: "VENDOR_ID",
            sortable: true,
            maxWidth: '600px',
            minWidth: '150px',
            wrap: true,
            fieldId: 'vendor_id',
        },
        {
            id: 3,
            name: "First Name",
            selector: (row) => row.first_name,
            sortField: "FIRST_NAME",
            sortable: true,
            grow: 3,
            maxWidth: '600px',
            minWidth: '150px',
            wrap: true,
            fieldId: 'first_name',
        },
        {
            id: 4,
            name: "Last Name",
            selector: (row) => row.last_name,
            sortField: "LAST_NAME",
            sortable: true,
            grow: 3,
            maxWidth: '600px',
            minWidth: '150px',
            wrap: true,
            fieldId: 'last_name',
        },
        {
            id: 5,
            name: "Contact Number",
            selector: (row) => row.contact_number,
            sortField: "contact_number",
            sortable: false,
            maxWidth: '600px',
            minWidth: '170px',
            wrap: true,
            grow: 3,
            fieldId: 'contact_number',
        },
        {
            id: 6,
            name: "Email Address",
            selector: (row) => row.email,
            sortField: "EMAIL_ADDRESS",
            sortable: true,
            wrap: true,
            maxWidth: '600px',
            minWidth: '220px',
            grow: 3,
            fieldId: 'email',
        },
        {
            id: 16,
            name: "Status",
            selector: (row) => row.status,
            sortField: "STATUS",
            grow: 3,
            wrap: true,
            maxWidth: '200px',
            minWidth: '120px',
            sortable: true,
            cell: (row) => (
                <span className={`status-badge vendor-badge ${row.status.toLowerCase()}`}>
                    {row.status}
                </span>
            ),
            fieldId: 'status',
        },
        {
            id: 7,
            name: "NIC",
            selector: (row) => row.nic,
            sortField: "NIC",
            sortable: true,
            grow: 3,
            maxWidth: '600px',
            minWidth: '150px',
            wrap: true,
            fieldId: 'nic',
        },
        {
            id: 8,
            name: "Business Name",
            selector: (row) => row.business_name,
            sortField: "BUSINESS_NAME",
            sortable: true,
            grow: 3,
            maxWidth: '600px',
            minWidth: '180px',
            wrap: true,
            fieldId: 'business_name',
        },
        {
            id: 9,
            name: (
                <div>
                    Business Address 1
                </div>
            ),
            selector: (row) => row.business_address_line1,
            sortField: "BUSINESS_ADDRESS_LINE1",
            sortable: false,
            maxWidth: '600px',
            minWidth: '200px',
            wrap: true,
            grow: 3,
            fieldId: 'business_address_line1',
        },
        {
            id: 10,
            name: "District",
            selector: (row) => row.district,
            sortField: "district",
            sortable: false,
            grow: 3,
            maxWidth: '600px',
            minWidth: '120px',
            fieldId: 'district',
        },
        {
            id: 11,
            name: "Province",
            selector: (row) => row.province,
            sortField: "province",
            sortable: false,
            grow: 3,
            maxWidth: '600px',
            minWidth: '150px',
            wrap: true,
            fieldId: 'province',
        },
        {
            id: 12,
            name: "Telephone",
            selector: (row) => row.telephone,
            sortField: "telephone",
            sortable: false,
            grow: 3,
            maxWidth: '600px',
            minWidth: '200px',
            wrap: true,
            fieldId: 'telephone',
        },
        {
            id: 13,
            name: "Business Email",
            selector: (row) => row.business_email,
            selector: (row) => {
                if (!row.business_email) return null;
        
                const maxVisibleLength = 30; 
                const isTruncated = row.business_email.length > maxVisibleLength;
                const visibleText = isTruncated 
                    ? `${row.business_email.slice(0, maxVisibleLength)}...` 
                    : row.business_email;
        
                return isTruncated ? (
                    <Tooltip
                        className="custom-tooltip service-name-tooltip"
                        color="#E0EBFF"
                        title={
                            <div  className="tooltip-content">
                                <span className="badge">{row.business_email}</span>
                            </div>
                        }
                        placement="bottom"  
                    >
                        <span>{visibleText}</span>
                    </Tooltip>
                ) : (
                    <span>{row.business_email}</span>
                );
            },
            sortField: "BUSINESS_EMAIL",
            sortable: true,
            grow: 3,
            maxWidth: '600px',
            minWidth: '200px',
            wrap: true,
            fieldId: 'business_email',
        },
        {
            id: 14,
            name: "Business Type",
            selector: (row) => {
                const businessTypes = row.business_type || [];
                const visibleTypes = businessTypes.slice(0, 2);
                const remainingTypes = businessTypes.slice(2);

                return (
                    <div className="business-type-badge-container vendor-bus-badge-cont">
                        {visibleTypes.map((type, index) => (
                            <span key={index} className="business-type-badge">
                                {type}
                            </span>
                        ))}
                        {remainingTypes.length > 0 && (
                            <Tooltip
                                className="custom-tooltip"
                                color="#E0EBFF"
                                title={
                                    <div className="tooltip-content vendor-tooltip-content">
                                        {remainingTypes.map((type, index) => (
                                            <span key={index} className="badge">
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                }
                            >
                                <span className="business-type-badge more-badge">
                                    +{remainingTypes.length}
                                </span>
                            </Tooltip>
                        )}
                    </div>
                );
            },
            sortable: true,
            sortField: "BUSINESS_TYPE",
            grow: 11,
            wrap: true,
            fieldId: 'business_type',
        },
        {
            id: 15,
            name: "Joined Date",
            selector: (row) => row.joined_date,
            wrap: true,
            sortField: "JOINED_DATE",
            sortable: true,
            maxWidth: '300px',
            minWidth: '150px',
            fieldId: 'joined_date',
        },
        {
            id: 17,
            name: "Registered By",
            selector: (row) => row.registered_by,
            sortField: "REGISTERED_BY",
            sortable: true,
            wrap: true,
            maxWidth: '400px',
            minWidth: '180px',
            fieldId: 'registered_by',
        },
        {
            id: 999,
            name: "",
            selector: () => null,
            sortable: false,
            grow: 2,
            minWidth: "auto",
            fieldId: 'spacer',
            cell: () => null,
            ignoreRowClick: true,
            allowoverflow: true,
        },
        {
            id: 18,
            name: itemsValue && itemsValue.length > 0 ? (
                <FieldSelectionDropdown
                    fields={dropdownFields}
                    visibleFields={visibleFields}
                    onFieldToggle={toggleFieldVisibility}
                    onSelectAll={toggleSelectAll}
                    selectAllChecked={selectAllChecked}
                    isOpen={isFieldDropdownOpen}
                    onOpenChange={setIsFieldDropdownOpen}
                    containerStyle={{ zIndex: 10 }}
                    lockWhenSelectAllUncheckedIds={['business_name', 'telephone']}
                    menuClassName={'vendor-selection-dropdown'}
                />
            ) : null,
            selector: (row) => null,
            sortable: false,
            maxWidth: '200px',
            minWidth: '100px',
            fieldId: 'actions',
            cell: (row) => (
                <div className="actions" >
                    <ActionButton
                        isViewIcon={true}
                        goToDetailScreen={goToVendorDetailPage}
                        item={row}
                        goToEditData={goToEditVendor}
                        isEditMode={true}
                        onClickDeleteModel={onClickDeleteModel}
                        isDeleteMode={false}
                        isDownloadMode={false}
                    />
                </div>
            ),
        },
    ];

    const allColumnsWithPlaceholders = allColumns.map((c) => {
        if (!c.fieldId || !loadingColumns[c.fieldId]) return c;
        if (c.fieldId === 'actions' || c.fieldId === 'spacer') return c;
        const placeholder = () => (<span className="cell-loading-placeholder">Loading...</span>);
        return { ...c, selector: placeholder, cell: c.cell ? placeholder : c.cell };
    });

    const columns = (() => {
        const nonAction = allColumnsWithPlaceholders.filter(
            (c) => c.fieldId !== 'actions' && c.fieldId !== 'spacer' && visibleFields[c.fieldId]
        );
        const visibleCount = nonAction.length;
        const expanded = nonAction.map((col) => {
            if (col.fieldId === 'no') return col;
            const next = { ...col };
            if (visibleCount <= 3) {
                next.grow = 12;
                next.maxWidth = undefined;
            } else if (visibleCount <= 5) {
                next.grow = Math.max(col.grow || 3, 8);
                next.maxWidth = undefined;
            } else {
                next.grow = Math.max(col.grow || 3, 3);
            }
            return next;
        });
        const spacerCol = allColumnsWithPlaceholders.find((c) => c.fieldId === 'spacer');
        const actionCol = allColumnsWithPlaceholders.find((c) => c.fieldId === 'actions');
        const includeSpacer = visibleCount > 6 && windowWidth > 1600;
        const withSpacer = includeSpacer && spacerCol ? [...expanded, spacerCol] : expanded;
        return actionCol ? [...withSpacer, actionCol] : withSpacer;
    })();

    return (
        <MasterLayout>
            <Breadcrumb
                current_page="Vendor Management"
            />
            <TopProgressBar isLoading={isVendorsLoading} />
            <TabTitle title={placeholderText("vendors.title")} />
            <ReactDataTable
                key={Object.entries(visibleFields)
                    .filter(([, v]) => v)
                    .map(([k]) => k)
                    .join(",")}
                columns={columns}
                tableTitle={getFormattedMessage("vendors.title")}
                countTextSingular={getFormattedMessage("vendors.count.title.singular")}
                countTextPlural={getFormattedMessage("vendors.count.title.plural")}
                filterTitle={getFormattedMessage("vendors.filter.title")}
                items={itemsValue}
                onChange={onChange}
                currentPage={filter.page}
                pageSize={filter.size}
                isLoading={isVendorsLoading}
                isShowFilterField
                isShowSearch={true}
                isJoinedDateFilter
                isStatusFilter
                isBusinessTypeFilter
                ButtonValue={getFormattedMessage("vendors.create.button.title")}
                totalRows={totalRecord}
                totalPages={totalPages}
                noDataText={getFormattedMessage("vendors.no-record-found.text")}
                isExport={true}
                onExcelClick={onExcelClick}
                sortField={filter.sortField}
                sortOrder={filter.sortOrder}
                sortIcon={renderSortIcons()}
                customSort={customSort}
                defaultSortFieldId={15}
                isFilterApplied={isFilterApplied}
                noFilterMatchMessage={"No data available for the selected filters. Please adjust your filters to view relevant data."}
                to="/admin/vendor-management/create"
                isDownloadLoading={isDownloadLoading}
                conditionalRowStyles={[
                    {
                        when: row => row.status === "Inactive",
                        style: {
                            backgroundColor: "#E4EAF2",
                        },
                        classNames: ['inactive-row'], 
                    },
                ]}
            />
            <DeleteVendor
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
            />
        </MasterLayout>
    );
};

export default Vendors;