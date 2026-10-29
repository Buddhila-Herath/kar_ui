import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import TabTitle from "../../../shared/tab-title/TabTitle";
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllClient, downloadExcelReport, fetchAllClientSilent } from '../../../slices/vendor/clientSlice';
import { Tooltip } from 'antd';
import {
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import ActionButton from "../../../shared/action-buttons/ActionButton";
import { Filters } from "../../../constants";
import { renderSortIcons } from "../../../config/sortConfig";
import { saveAs } from 'file-saver';
import FieldSelectionDropdown from "../../../shared/components/FieldSelectionDropdown";
import { saveUserCustomization } from "../../../slices/masterDataSlice";

// Local cache key for column names
const STORAGE_KEY_CLIENT = 'USER_COLUMNS_CLIENT_MANAGEMENT';

// Display name -> field id map
const CLIENT_NAME_TO_ID = {
  'Client ID': 'client_id',
  'First Name': 'first_name',
  'Last Name': 'last_name',
  'Contact Number': 'contact_number',
  'Email Address': 'client_email',
  'Vehicle Registration Number': 'registration_number',
  'Status': 'client_status',
  'Joined Date': 'client_joined_date',
  'Registered By': 'registered_by',
};

const Clients = () => {
    const { isClientLoading, allClient, totalRecord, totalPages, isDownloadLoading } = useSelector((state) => state.vendorClients);
    const [deleteModel, setDeleteModel] = useState(false);
    const [filter, setFilter] = useState({
        page: Filters.OBJ.page,
        size: Filters.OBJ.size,
        searchTerm: Filters.OBJ.searchTerm,
        status: "",
        toDate: "",
        fromDate: "",
        sortField: "",
        sortOrder: Filters.OBJ.order,
    });
    const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
    const isFilterApplied = Boolean(filter.searchTerm || filter.clientType || filter.status);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [selectAllChecked, setSelectAllChecked] = useState(undefined); // undefined => auto-compute in dropdown
    const userChangedVisibilityRef = useRef(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [loadingColumns, setLoadingColumns] = useState({});

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Define all available fields for the dropdown (order aligned with columns below)
    const allFields = useMemo(() => ([
        { id: 'no', name: 'No', visible: true },
        { id: 'client_id', name: 'Client ID', visible: true },
        { id: 'first_name', name: 'First Name', visible: true },
        { id: 'last_name', name: 'Last Name', visible: true },
        { id: 'contact_number', name: 'Contact Number', visible: true },
        { id: 'client_email', name: 'Email Address', visible: true },
        { id: 'registration_number', name: 'Vehicle Registration Number', visible: true },
        { id: 'client_status', name: 'Status', visible: true },
        { id: 'client_joined_date', name: 'Joined Date', visible: true },
        { id: 'registered_by', name: 'Registered By', visible: true },
    ]), []);

    const initialVisibleFields = useMemo(() => {
        return allFields.reduce((acc, field) => {
            acc[field.id] = field.visible;
            return acc;
        }, {});
    }, [allFields]);

    // Exclude 'No' from the dropdown list; it must always be visible
    const dropdownFields = useMemo(() => allFields.filter(f => f.id !== 'no'), [allFields]);

    // Synchronous lazy init from localStorage to avoid first-render flash
    const [visibleFields, setVisibleFields] = useState(() => {
      try {
        const json = localStorage.getItem(STORAGE_KEY_CLIENT);
        if (!json) return initialVisibleFields;
        const savedNames = JSON.parse(json); // ['Client ID', 'First Name', ...]
        const next = { ...initialVisibleFields };
        Object.keys(next).forEach((k) => { if (k !== 'no') next[k] = false; });
        savedNames.forEach((name) => {
          const id = CLIENT_NAME_TO_ID[name];
          if (id) next[id] = true;
        });
        return next;
      } catch {
        return initialVisibleFields;
      }
    });

    // Let auto-hide/auto-show run on initial load; mark as changed only after user toggles fields
    useEffect(() => {
      userChangedVisibilityRef.current = false;
    }, []);

    const lockedFieldIds = ['first_name', 'registration_number'];

    useEffect(() => {
        dispatch(fetchAllClient(filter));
    }, [dispatch, filter]);

    // Immediate persist + then silent refetch; clear placeholders afterward
    const persistAndRefetch = async (columnsName, toggledOnFieldIds = []) => {
        try {
          await dispatch(saveUserCustomization({ columnsName, moduleName: 'CLIENT_MANAGEMENT' })).unwrap();
        } catch (_) {
          // ignore
        }
        // Local cache to survive refresh
        try {
          localStorage.setItem(STORAGE_KEY_CLIENT, JSON.stringify(columnsName));
        } catch {}
        try {
          await dispatch(fetchAllClientSilent(filter)).unwrap();
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
        if (fieldId === 'no') return; // 'No' should not be toggled
        const next = { ...visibleFields, [fieldId]: !visibleFields[fieldId] };
        const visibleCount = dropdownFields.reduce((acc, f) => acc + (next[f.id] ? 1 : 0), 0);
        if (visibleCount === 0) {
            // Enforce non-empty table: turn on locked fields and enter locked state
            lockedFieldIds.forEach(id => { next[id] = true; });
            next['no'] = true;
            setSelectAllChecked(false); // locked mode => locked ones disabled in dropdown
        } else {
            // Let dropdown recompute Select All visual state
            setSelectAllChecked(undefined);
        }
        setVisibleFields(next);
        userChangedVisibilityRef.current = true;

        // Persist to server then silent refresh
        let columnsName = getSelectedColumnNames(next);

        // Track newly toggled-on columns and enable placeholders
        const toggledOnFieldIds = [];
        if (next[fieldId] && !visibleFields[fieldId]) {
          toggledOnFieldIds.push(fieldId);
        }

        if (next[fieldId]) {
            const ensureLabelMap = {
                client_id: 'Client ID',
                first_name: 'First Name',
                last_name: 'Last Name',
                contact_number: 'Contact Number',
                client_email: 'Email Address',
                registration_number: 'Vehicle Registration Number',
                client_status: 'Status',
                client_joined_date: 'Joined Date',
                registered_by: 'Registered By',
            };
            const label = ensureLabelMap[fieldId] || fieldId;
            if (!columnsName.includes(label)) {
                columnsName = [...columnsName, label];
            }
        }

        // Set placeholders ON
        if (toggledOnFieldIds.length > 0) {
          setLoadingColumns((prev) => ({
            ...prev,
            ...Object.fromEntries(toggledOnFieldIds.map((id) => [id, true])),
          }));
        }

        // Persist and silent refetch, then clear placeholders
        persistAndRefetch(columnsName, toggledOnFieldIds);
    };

    const toggleSelectAll = (checked) => {
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
        dropdownFields.forEach((field) => {
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
            ...Object.fromEntries(toggledOnFieldIds.map((id) => [id, true])),
          }));
        }

        persistAndRefetch(getSelectedColumnNames(newVisibility), toggledOnFieldIds);
    };

    const onChange = (ClientFilters) => {
        setFilter((prevFilter) => {
            const newFilter = {
                ...prevFilter,
                ...ClientFilters,
            };
            if (JSON.stringify(prevFilter) !== JSON.stringify(newFilter)) {
                return newFilter;
            }
            return prevFilter;
        });
    };

    const onExcelClick = async () => {
        try {
            const response = await dispatch(downloadExcelReport(filter)).unwrap();
            const blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const dateString = `${year}${month}${day}`;
            
            const fileName = `client_${dateString}.xlsx`;
            
            saveAs(blob, fileName);
        } catch (error) {
            console.error("Error downloading the Excel file:", error);
        }
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

    const goToEditClient = (item) => {
        const id = item.id;
        navigate(`/app/client-management/edit/${id}`);
    };

    const goToClientDetailPage = (id) => {
        navigate(`/app/client-management/detail/${id}`);
    };

    const itemsValue = Array.isArray(allClient)
        ? allClient.map((client, index) => ({
            id: client.id,
            no: String((filter.page - 1) * filter.size + index + 1).padStart(2, '0'),
            client_id: client.clientId,
            first_name: client.firstName,
            last_name: client.lastName,
            contact_number: client.clientContactNo,
            client_email: client.clientEmail,
            registration_number: client.vehicleNumber,
            client_status: client.status,
            client_joined_date: client.joinedDate,
            registered_by: client.registerBy,
            client_postal_code: client.postalCode,
        }))
        : [];

    // Auto-hide/auto-show based on current page data (unless user changed manually)
    useEffect(() => {
        if (!itemsValue || itemsValue.length === 0) return;
        if (userChangedVisibilityRef.current) return; 
        const fallbackLockedIds = ['first_name', 'registration_number'];
        setVisibleFields((prev) => {
            const next = { ...prev };
            let changed = false;
            dropdownFields.forEach((field) => {
                const anyHasValue = itemsValue.some((row) => {
                    const v = row[field.id];
                    if (v === null || v === undefined) return false;
                    if (typeof v === 'string') return v.trim().length > 0;
                    if (Array.isArray(v)) return v.length > 0;
                    return true;
                });
                if (!anyHasValue && next[field.id] !== false) { next[field.id] = false; changed = true; }
                if (anyHasValue && next[field.id] === false) { next[field.id] = true; changed = true; }
            });
            if (next['no'] !== true) {
                next['no'] = true;
                changed = true;
            }
            const anyVisible = dropdownFields.some((f) => next[f.id]);
            if (!anyVisible) {
                fallbackLockedIds.forEach((id) => {
                    if (next[id] !== true) {
                        next[id] = true;
                        changed = true;
                    }
                });
            }
            if (changed) { setSelectAllChecked(undefined); return next; }
            return prev;
        });
    }, [itemsValue, dropdownFields]);

    const getSelectedColumnNames = (visibility) => {
        const nameMap = {
            client_id: 'Client ID',
            first_name: 'First Name',
            last_name: 'Last Name',
            contact_number: 'Contact Number',
            client_email: 'Email Address',
            registration_number: 'Vehicle Registration Number',
            client_status: 'Status',
            client_joined_date: 'Joined Date',
            registered_by: 'Registered By',
        };
        return dropdownFields
            .filter((f) => visibility[f.id])
            .map((f) => nameMap[f.id] || (typeof f.name === 'string' ? f.name : ''))
            .filter(Boolean);
    };

    // Define all columns (with fieldId for visibility control)
    const allColumns = [
        {
            id: 1,
            name: "No",
            selector: (row) => row.no,
            sortField: "no",
            sortable: false,
            maxWidth: '100px',
            minWidth: '70px',
            fieldId: 'no'
        },
        {
            id: 2,
            name: "Client ID",
            selector: (row) => row.client_id,
            sortField: "CLIENT_ID",
            sortable: true,
            maxWidth: "600px",
            minWidth: "130px",
            wrap: true,
            fieldId: 'client_id'
        },
        {
            id: 3,
            name: "First Name",
            selector: (row) => row.first_name,
            sortable: true,
            sortField: "FIRST_NAME",
            grow: selectAllChecked === false ? 10 : 2,
            maxWidth: selectAllChecked === false ? undefined : '600px',
            minWidth: '140px',
            wrap: true,
            fieldId: 'first_name'
        },
        {
            id: 4,
            name: "Last Name",
            selector: (row) => row.last_name,
            sortField: "LAST_NAME",
            sortable: true,
            grow: 2,
            maxWidth: "600px",
            minWidth: "140px",
            wrap: true,
            fieldId: 'last_name'
        },
        {
            id: 5,
            name: "Contact Number",
            selector: (row) => row.contact_number,
            sortField: "CONTACT_NUMBER",
            sortable: true,
            grow: 3,
            maxWidth: "500px",
            minWidth: "160px",
            wrap: true,
            fieldId: 'contact_number'
        },
        {
            id: 6,
            name: "Email Address",
            selector: (row) => {
                if (!row.client_email) return null;
        
                const maxVisibleLength = 40; 
                const isTruncated = row.client_email.length > maxVisibleLength;
                const visibleText = isTruncated 
                    ? `${row.client_email.slice(0, maxVisibleLength)}...` 
                    : row.client_email;
        
                return isTruncated ? (
                    <Tooltip
                        className="custom-tooltip service-name-tooltip"
                        color="#E0EBFF"
                        title={
                            <div className="tooltip-content">
                                <span className="badge">{row.client_email}</span>
                            </div>
                        }
                        placement="bottom"  
                    >
                        <span>{visibleText}</span>
                    </Tooltip>
                ) : (
                    <span>{row.client_email}</span>
                );
            },
            sortField: "EMAIL",
            sortable: true,
            grow: 2,
            maxWidth: "400px",
            minWidth: "202px",
            wrap: true,
            fieldId: 'client_email'
        },
        {
            id: 7,
            name: (
                <div>
                    Vehicle <br/>Registration No
                </div>
            ),
            selector: (row) => {
                if (!row.registration_number || !Array.isArray(row.registration_number)) {
                    return row.registration_number || '';
                }
                const registrationNumbers = row.registration_number;
                const visibleNumbers = registrationNumbers.slice(0, 2);
                const remainingNumbers = registrationNumbers.slice(2);
        
                return (
                    <div className="business-type-badge-container">
                        {visibleNumbers.map((number, index) => (
                            <span key={index} className="business-type-badge">
                                {number.trim()}
                            </span>
                        ))}
                        {remainingNumbers.length > 0 && (
                            <Tooltip
                                className="custom-tooltip"
                                color="#E0EBFF"
                                title={
                                    <div className="tooltip-content">
                                        {remainingNumbers.map((number, index) => (
                                            <span key={index} className="badge">
                                                {number.trim()}
                                            </span>
                                        ))}
                                    </div>
                                }
                            >
                                <span className="business-type-badge more-badge">
                                    +{remainingNumbers.length}
                                </span>
                            </Tooltip>
                        )}
                    </div>
                );
            },
            sortField: "VEHICLE_REG_NUMBER",
            sortable: true,
            maxWidth: selectAllChecked === false ? undefined : "200px",
            minWidth: "200px",
            wrap: true,
            grow: selectAllChecked === false ? 10 : 1,
            fieldId: 'registration_number'
        },
        {
            id: 8,
            name: "Status",
            selector: (row) => row.client_status,
            sortField: "STATUS",
            sortable: true,
            maxWidth: "600px",
            minWidth: "180px",
            wrap: true,
            grow: 1,
            fieldId: 'client_status',
            cell: (row) => {
                if (!row.client_status) return null;
                return (
                    <span
                        className={`status-badge ${row.client_status === "Active" ? "active" : "inactive"}`}
                    >
                        {row.client_status}
                    </span>
                );
            },
        },
        {
            id: 9,
            name: "Joined Date",
            selector: (row) => row.client_joined_date,
            sortField: "JOIN_DATE",
            sortable: true,
            grow: 3,
            maxWidth: "600px",
            minWidth: "140px",
            wrap: true,
            fieldId: 'client_joined_date'
        },
        {
            id: 10,
            name: "Registered By",
            selector: (row) => {
                if (!row.registered_by) return null;
        
                const maxVisibleLength = 40; 
                const isTruncated = row.registered_by.length > maxVisibleLength;
                const visibleText = isTruncated 
                    ? `${row.registered_by.slice(0, maxVisibleLength)}...` 
                    : row.registered_by;
        
                return isTruncated ? (
                    <Tooltip
                        className="custom-tooltip service-name-tooltip"
                        color="#E0EBFF"
                        title={
                            <div className="tooltip-content">
                                <span className="badge">{row.registered_by}</span>
                            </div>
                        }
                        placement="bottom"  
                    >
                        <span>{visibleText}</span>
                    </Tooltip>
                ) : (
                    <span>{row.registered_by}</span>
                );
            },
            sortField: "",
            sortable: false,
            grow: 3,
            maxWidth: "500px",
            minWidth: "180px",
            wrap: true,
            fieldId: 'registered_by'
        },
        {
            id: 15,
            name: "",
            selector: () => null,
            sortable: false,
            grow: 2,
            minWidth: "auto",
            fieldId: "spacer",
            cell: () => null,
            ignoreRowClick: true,
            allowOverflow: true,
          },
        {
            id: 11,
            name: !isClientLoading && itemsValue && itemsValue.length > 0 ? (
                <FieldSelectionDropdown
                    fields={dropdownFields}
                    visibleFields={visibleFields}
                    onFieldToggle={toggleFieldVisibility}
                    onSelectAll={toggleSelectAll}
                    selectAllChecked={selectAllChecked}
                    isOpen={isFieldDropdownOpen}
                    onOpenChange={setIsFieldDropdownOpen}
                    containerStyle={{ zIndex: 10 }}
                    menuClassName="client-field-dropdown-menu"
                    lockWhenSelectAllUncheckedIds={['first_name','registration_number']}
                />
            ) : null,
            selector: (row) => null,
            sortable: false,
            maxWidth: "100px",
            minWidth: "97px",
            fieldId: 'actions',
            cell: (row) => (
                <div className="actions">
                    <ActionButton
                        isDownloadMode={false}
                        isViewIcon={true}
                        goToDetailScreen={goToClientDetailPage}
                        item={row}
                        goToEditData={goToEditClient}
                        isEditMode={true}
                        isDeleteMode={false}
                    />
                </div>
            ),
        },
    ];

    // Wrap columns to show per-cell placeholders for any field currently loading
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
        // Mirror dynamic expansion behavior from Users.js
        const visibleCount = nonAction.length;
        const expanded = nonAction.map((col) => {
            if (col.fieldId === 'no') return col; // keep numbering compact
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

        // Include spacer only when many columns and very wide screens
        const spacerCol = allColumnsWithPlaceholders.find((c) => c.fieldId === 'spacer');
        const actionCol = allColumnsWithPlaceholders.find((c) => c.fieldId === 'actions');
        const includeSpacer = visibleCount > 6 && windowWidth > 1600;
        const withSpacer = includeSpacer && spacerCol ? [...expanded, spacerCol] : expanded;
        return actionCol ? [...withSpacer, actionCol] : withSpacer;
    })();
    return (
        <MasterLayout>
            <Breadcrumb
                current_page="Client Management"
            />
            <TopProgressBar isLoading={isClientLoading} />
            <TabTitle title={placeholderText("client.title")} />

            <div className="table-container" style={{ position: 'relative' }}>
                <ReactDataTable
                    key={Object.entries(visibleFields).filter(([,v]) => v).map(([k]) => k).join(',')}
                    columns={columns}
                    tableTitle={getFormattedMessage("client.table.title")}
                    countTextSingular={getFormattedMessage("globally.records.count.title.singular")}
                    countTextPlural={getFormattedMessage("globally.records.count.title.plural")}
                    filterTitle={getFormattedMessage("client.filter.title")}
                    isJoinedDateFilter
                    isStatusFilter
                    items={itemsValue}
                    onChange={onChange}
                    isLoading={isClientLoading}
                    isShowFilterField
                    isShowSearch={true}
                    ButtonValue={getFormattedMessage("client.create.button.title")}
                    totalRows={totalRecord}
                    totalPages={totalPages}
                    currentPage={filter.page}
                    pageSize={filter.size}
                    isExport={true}
                    onExcelClick={onExcelClick}
                    sortField={filter.sortField}
                    sortOrder={filter.sortOrder}
                    sortIcon={renderSortIcons()}
                    customSort={customSort}
                    to="/app/client-management/create"
                    isDownloadLoading={isDownloadLoading}
                    globalSetting={true}
                    globalSettingOffMessage={""}
                    noRecordsMessage={<span>Click "Add New Client" to create a new entry</span>}
                    isFilterApplied={isFilterApplied}   
                    noFilterMatchMessage={"No data available for the selected Filters. Please adjust your Filters to view relevant data."}
                    />
            </div>
        </MasterLayout>
    );
};

export default Clients;