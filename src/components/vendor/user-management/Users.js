import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import TabTitle from "../../../shared/tab-title/TabTitle";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import MasterLayout from "../../MasterLayout";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import { fetchAllUsers, fetchAllUsersSilent, downloadExcelReport } from '../../../slices/vendor/userSlice';
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
import { Tooltip } from 'antd';
const Users = () => {
    const { isUsersLoading, allUsers, totalRecord, totalPages, error, isDownloadLoading } = useSelector((state) => state.users);
    const [filter, setFilter] = useState({
        page: Filters.OBJ.page,
        size: Filters.OBJ.size,
        searchTerm: Filters.OBJ.searchTerm,
        status: "",
        toDate: "",
        fromDate: "",
        sortField: "",
        sortOrder: "",
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isFilterApplied = Boolean(filter.searchTerm || filter.status || filter.fromDate || filter.toDate);
    const [selectAllChecked, setSelectAllChecked] = useState(undefined);
    const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const userChangedVisibilityRef = useRef(false);
    const saveSyncTimerRef = useRef(null);
    const [loadingColumns, setLoadingColumns] = useState({});

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        return () => {
            if (saveSyncTimerRef.current) clearTimeout(saveSyncTimerRef.current);
        };
    }, []);
    // Field selection definitions (align order with columns below)
    const STORAGE_KEY_USER = 'USER_COLUMNS_USER_MANAGEMENT';
    const USER_NAME_TO_ID = {
        'User ID': 'user_id',
        'First Name': 'first_name',
        'Last Name': 'last_name',
        'Contact Number': 'contact_number',
        'Email Address': 'email',
        'Status': 'status',
        'NIC': 'nic',
        'Joined Date': 'joined_date',
    };
    const allFields = [
        { id: 'no', name: 'No', visible: true },
        { id: 'user_id', name: 'User ID', visible: true },
        { id: 'first_name', name: 'First Name', visible: true },
        { id: 'last_name', name: 'Last Name', visible: true },
        { id: 'contact_number', name: 'Contact Number', visible: true },
        { id: 'email', name: 'Email Address', visible: true },
        { id: 'status', name: 'Status', visible: true },
        { id: 'nic', name: 'NIC', visible: true },
        { id: 'joined_date', name: 'Joined Date', visible: true },
    ];
    const initialVisibleFields = allFields.reduce((acc, field) => {
        acc[field.id] = field.visible;
        return acc;
    }, {});
    
    const [visibleFields, setVisibleFields] = useState(() => {
        try {
            const json = localStorage.getItem(STORAGE_KEY_USER);
            if (!json) return initialVisibleFields;
            const savedNames = JSON.parse(json);
            const next = { ...initialVisibleFields };
            Object.keys(next).forEach((k) => { if (k !== 'no') next[k] = false; });
            savedNames.forEach((name) => {
                const id = USER_NAME_TO_ID[name];
                if (id) next[id] = true;
            });
            return next;
        } catch {
            return initialVisibleFields;
        }
    });
    useEffect(() => {
        // Allow first-load auto-hide/auto-show; mark only after user toggles fields
        userChangedVisibilityRef.current = false;
    }, []);

    const dropdownFields = allFields.filter(f => f.id !== 'no');
    // Columns that should remain visible when Select All is unchecked (locked mode)
    const lockedFieldIds = ['first_name', 'contact_number'];

    useEffect(() => {
        dispatch(fetchAllUsers(filter));
    }, [dispatch, filter]);

    const getSelectedColumnNames = (visibility) => {
        const nameMap = {
            user_id: 'User ID',
            first_name: 'First Name',
            last_name: 'Last Name',
            contact_number: 'Contact Number',
            email: 'Email Address',
            status: 'Status',
            nic: 'NIC',
            joined_date: 'Joined Date',
        };
        return dropdownFields
            .filter((f) => visibility[f.id])
            .map((f) => nameMap[f.id] || (typeof f.name === 'string' ? f.name : ''))
            .filter(Boolean);
    };

    const persistAndRefetch = async (columnsName, toggledOnFieldIds = []) => {
        try {
            await dispatch(saveUserCustomization({ columnsName, moduleName: 'USER_MANAGEMENT' })).unwrap();
        } catch (_) {}
        try {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(columnsName));
        } catch {}
        try {
            await dispatch(fetchAllUsersSilent(filter)).unwrap();
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

    const toggleFieldVisibility = (fieldId) => {
        if (fieldId === 'no') return;
        setVisibleFields(prev => {
            const next = { ...prev, [fieldId]: !prev[fieldId] };
            const visibleCount = dropdownFields.reduce((acc, f) => acc + (next[f.id] ? 1 : 0), 0);
            if (visibleCount === 0) {
                lockedFieldIds.forEach(id => { next[id] = true; });
                next['no'] = true;
                setSelectAllChecked(false);
            } else {
                setSelectAllChecked(undefined);
            }
            userChangedVisibilityRef.current = true;
            let columnsName = getSelectedColumnNames(next);
            const ensureLabelMap = {
                user_id: 'User ID',
                first_name: 'First Name',
                last_name: 'Last Name',
                contact_number: 'Contact Number',
                email: 'Email Address',
                status: 'Status',
                nic: 'NIC',
                joined_date: 'Joined Date',
            };
            if (next[fieldId]) {
                const label = ensureLabelMap[fieldId] || fieldId;
                if (!columnsName.includes(label)) {
                    columnsName = [...columnsName, label];
                }
            }
            // Track fields toggled from OFF to ON to show placeholders
            const toggledOnFieldIds = [];
            if (next[fieldId] && !prev[fieldId]) {
                toggledOnFieldIds.push(fieldId);
            }
            // Set placeholders ON
            if (toggledOnFieldIds.length > 0) {
                setLoadingColumns((prevLC) => ({
                    ...prevLC,
                    ...Object.fromEntries(toggledOnFieldIds.map((id) => [id, true]))
                }));
            }
            // Persist and silent refetch, then clear placeholders
            persistAndRefetch(columnsName, toggledOnFieldIds);
            return next;
        });
    };

    const toggleSelectAll = (checked) => {
        const newVisibility = { ...visibleFields };
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
        // Show placeholders for newly turned-on fields
        if (toggledOnFieldIds.length > 0) {
            setLoadingColumns((prev) => ({
                ...prev,
                ...Object.fromEntries(toggledOnFieldIds.map((id) => [id, true]))
            }));
        }
        persistAndRefetch(getSelectedColumnNames(newVisibility), toggledOnFieldIds);
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

    const goToEditUser = (item) => {
        const id = item.id;
        navigate(`/app/user-management/edit/${id}`);
    };

    const goToUserDetailPage = (id) => {
        navigate(`/app/user-management/detail/${id}`);
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

            const fileName = `users_${dateString}.xlsx`;
            saveAs(blob, fileName);
        } catch (error) {
            console.error("Error downloading the Excel file:", error);
        }
    };

    const itemsValue =
        allUsers.length >= 0 &&
        allUsers.map((user, index) => ({
            id: user.id,
            no: String((filter.page - 1) * filter.size + index + 1).padStart(2, '0'),
            user_id: user.userId,
            first_name: user.firstName,
            last_name: user.lastName,
            contact_number: user.contactNumber,
            email: user.emailAddress,
            nic: user.nic,
            joined_date: user.joinedDate,
            status: user.status ?? 'Active',
        }));

    // Auto-hide/auto-show based on current page data until user customizes
    useEffect(() => {
        if (!itemsValue || itemsValue.length === 0) return;
        if (userChangedVisibilityRef.current) return;
        const fallbackLockedIds = lockedFieldIds;
        setVisibleFields((prev) => {
            const next = { ...prev };
            let changed = false;
            dropdownFields.forEach((field) => {
                const anyHasValue = itemsValue.some((row) => {
                    const v = row[field.id];
                    if (v === null || v === undefined) return false;
                    if (typeof v === 'string') return v.trim().length > 0;
                    return true;
                });
                // Hide columns with no data; show columns that do have data on initial load
                if (!anyHasValue && next[field.id] !== false) { next[field.id] = false; changed = true; }
                if (anyHasValue && next[field.id] === false) { next[field.id] = true; changed = true; }
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

    // Columns with fieldId for visibility control
    const allColumns = [
        {
            id: 1,
            name: "No",
            selector: (row) => row.no,
            sortField: "no",
            sortable: false,
            fieldId: 'no',
        },
        {
            id: 2,
            name: "User ID",
            selector: (row) => row.user_id,
            sortField: "USER_ID",
            sortable: true,
            maxWidth: '600px',
            minWidth: '150px',
            wrap: true,
            fieldId: 'user_id',
        },
        {
            id: 3,
            name: "First Name",
            selector: (row) => row.first_name,
            sortField: "FIRST_NAME",
            sortable: true,
            grow: selectAllChecked === false ? 10 : 3,
            maxWidth: selectAllChecked === false ? undefined : '600px',
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
            minWidth: '160px',
            wrap: true,
            fieldId: 'last_name',
        },
        {
            id: 5,
            name: "Contact Number",
            selector: (row) => row.contact_number,
            sortField: "CONTACT_NUMBER",
            sortable: false,
            maxWidth: selectAllChecked === false ? undefined : '600px',
            minWidth: '170px',
            wrap: true,
            grow: selectAllChecked === false ? 10 : 3,
            fieldId: 'contact_number',
        },
        {
            id: 6,
            name: "Email Address",
            selector: (row) => {
                if (!row.email) return null;
        
                const maxVisibleLength = 25; 
                const isTruncated = row.email.length > maxVisibleLength;
                const visibleText = isTruncated 
                    ? `${row.email.slice(0, maxVisibleLength)}...` 
                    : row.email;
        
                return isTruncated ? (
                    <Tooltip
                        className="custom-tooltip service-name-tooltip"
                        color="#E0EBFF"
                        title={
                            <div  className="tooltip-content">
                                <span className="badge">{row.email}</span>
                            </div>
                        }
                        placement="bottom"  
                    >
                        <span>{visibleText}</span>
                    </Tooltip>
                ) : (
                    <span>{row.email}</span>
                );
            },
            sortField: "EMAIL",
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
            minWidth: '130px',
            sortable: true,
            fieldId: 'status',
            cell: (row) => (
                <span className={`status-badge vendor-badge ${row.status.toLowerCase()}`}>
                    {row.status}
                </span>
            ),
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
            id: 15,
            name: "",
            selector: () => null,
            sortable: false,
            grow: 5,
            minWidth: "auto",
            fieldId: "spacer",
            cell: () => null,
            ignoreRowClick: true,
            allowOverflow: true,
        },
        {
            id: 18,
            name: !isUsersLoading && itemsValue && itemsValue.length > 0 ? (
                <FieldSelectionDropdown
                    fields={dropdownFields}
                    visibleFields={visibleFields}
                    onFieldToggle={toggleFieldVisibility}
                    onSelectAll={toggleSelectAll}
                    selectAllChecked={selectAllChecked}
                    isOpen={isFieldDropdownOpen}
                    onOpenChange={setIsFieldDropdownOpen}
                    containerStyle={{ zIndex: 10 }}
                    menuClassName="user-field-dropdown-menu"
                    lockWhenSelectAllUncheckedIds={['first_name', 'contact_number']}
                />
            ) : null,
            selector: (row) => null,
            sortable: false,
            maxWidth: '400px',
            minWidth: '95px',
            fieldId: 'actions',
            cell: (row) => (
                <div className="actions" >
                    <ActionButton
                        isViewIcon={true}
                        goToDetailScreen={goToUserDetailPage}
                        item={row}
                        goToEditData={goToEditUser}
                        isEditMode={true}
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

    // Compose columns based on visibility and screen width
    const columns = (() => {
        const nonAction = allColumnsWithPlaceholders.filter(
            (c) => c.fieldId !== 'actions' && c.fieldId !== 'spacer' && visibleFields[c.fieldId]
        );

        // 2) Dynamically expand visible columns to fill the table
        //    - If only a few columns are visible, remove restrictive maxWidth and increase grow
        //    - Keep the "No" column compact
        const visibleCount = nonAction.length;
        const expanded = nonAction.map((col) => {
            if (col.fieldId === 'no') return col; // keep numbering column compact
            // Clone to avoid mutating base definitions
            const next = { ...col };
            if (visibleCount <= 3) {
                next.grow = 12;        // expand aggressively when very few columns
                next.maxWidth = undefined;
            } else if (visibleCount <= 5) {
                next.grow = Math.max(col.grow || 3, 8);
                next.maxWidth = undefined;
            } else {
                // For many columns, still let them flex, but respect existing grow
                next.grow = Math.max(col.grow || 3, 3);
                // keep original maxWidth if any
            }
            return next;
        });

        // 3) Include spacer only when there are many columns and large screens
        const spacerCol = allColumnsWithPlaceholders.find((c) => c.fieldId === 'spacer');
        const actionCol = allColumnsWithPlaceholders.find((c) => c.fieldId === 'actions');
        const includeSpacer = visibleCount > 6 && windowWidth > 1600;
        const withSpacer = includeSpacer && spacerCol ? [...expanded, spacerCol] : expanded;
        return actionCol ? [...withSpacer, actionCol] : withSpacer;
    })();

    return (
        <MasterLayout>
            <Breadcrumb
                current_page="User Management"
            />
            <TopProgressBar isLoading={isUsersLoading} />
            <TabTitle title={placeholderText("users.title")} />
            
            <div className={`table-container ${isFilterApplied ? 'has-vendor-tags' : ''} user-management-table`} style={{ position: 'relative' }}>
                <ReactDataTable
                    key={Object.entries(visibleFields).filter(([, v]) => v).map(([k]) => k).join(',')}
                    columns={columns}
                    tableTitle={getFormattedMessage("users.title")}
                    countTextSingular={getFormattedMessage("users.count.title.singular")}
                    countTextPlural={getFormattedMessage("users.count.title.plural")}
                    filterTitle={getFormattedMessage("users.filter.title")}
                    items={itemsValue}
                    onChange={onChange}
                    currentPage={filter.page}
                    pageSize={filter.size}
                    isLoading={isUsersLoading}
                    isShowFilterField
                    isShowSearch={true}
                    isJoinedDateFilter
                    isStatusFilter
                    ButtonValue={getFormattedMessage("users.create.button.title")}
                    totalRows={totalRecord}
                    totalPages={totalPages}
                    noDataText={getFormattedMessage("users.no-record-found.text")}
                    isExport={true}
                    onExcelClick={onExcelClick}
                    sortField={filter.sortField}
                    sortOrder={filter.sortOrder}
                    sortIcon={renderSortIcons()}
                    customSort={customSort}
                    defaultSortFieldId={15}
                    noRecordsMessage={<span>No users available yet. Click 'Add New User' to add a new user.</span>}
                    isFilterApplied={isFilterApplied}
                    noFilterMatchMessage={"No data available for the selected filters. Please adjust your filters to view relevant data."}
                    to="/app/user-management/create"
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
            </div>
        </MasterLayout>
    );
};

export default Users;