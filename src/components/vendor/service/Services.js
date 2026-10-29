import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import TabTitle from "../../../shared/tab-title/TabTitle";
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllServices, fetchAllServicesSilent, downloadExcelReport } from '../../../slices/vendor/serviceSlice';
import { Tooltip } from 'antd';
import {
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import ActionButton from "../../../shared/action-buttons/ActionButton";
import { Link } from "react-router-dom";
import { Filters } from "../../../constants";
import { renderSortIcons } from "../../../config/sortConfig";
import { saveAs } from 'file-saver';
import DeleteService from "./DeleteService";
import { Tokens } from "../../../constants";
import FieldSelectionDropdown from "../../../shared/components/FieldSelectionDropdown";
import { saveUserCustomization } from "../../../slices/masterDataSlice";

const Services = () => {
    const { isServicesLoading, allServices, totalRecord, totalPages, error, isDownloadLoading } = useSelector((state) => state.vendorServices);
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const userChangedVisibilityRef = useRef(false);
    const saveSyncTimerRef = useRef(null);
    const [filter, setFilter] = useState({
        page: Filters.OBJ.page,
        size: Filters.OBJ.size,
        searchTerm: "",
        serviceRateType: "",
        technicianType: "",
        servicesCategory: "",
        sortField: "",
        sortOrder: Filters.OBJ.order,
    });
    const isFilterApplied = filter.searchTerm || filter.serviceRateType || filter.technicianType || filter.servicesCategory;
    const [selectAllChecked, setSelectAllChecked] = useState(undefined); // undefined => auto-compute in dropdown
    const [initialAutoHideDone, setInitialAutoHideDone] = useState(false);
    const [loadingColumns, setLoadingColumns] = useState({});

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const globalService = localStorage.getItem(Tokens.GLOBAL_SERVICES);

    // Local cache key + display name -> field id map
    const STORAGE_KEY_SERVICE = 'USER_COLUMNS_SERVICE_MANAGEMENT';
    const SERVICE_NAME_TO_ID = {
        'Service ID': 'service_Id',
        'Service Name': 'service_name',
        'Service Category': 'service_category',
        'Part Required': 'service_part_requierd',
        'Technician Type': 'technicianType',
        'Hours': 'hours',
        'Service Rate Type': 'service_Rate_Type',
        'Total Service Cost': 'total_Cost',
        'Service Primary Identifier': 'service_Primary_Indenttifier',
        'Service Added By': 'service_Created_By',
    };

    // Define all available fields for the dropdown (order aligned with columns below)
    const allFields = [
        { id: 'no', name: 'No', visible: true },
        { id: 'service_Id', name: 'Service ID', visible: true },
        { id: 'service_name', name: 'Service Name', visible: true },
        { id: 'service_category', name: 'Service Category', visible: true },
        { id: 'service_part_requierd', name: 'Part Required', visible: true },
        { id: 'technicianType', name: 'Technician Type', visible: true },
        { id: 'hours', name: 'Hours', visible: true },
        { id: 'service_Rate_Type', name: 'Service Rate Type', visible: true },
        { id: 'total_Cost', name: 'Total Service Cost', visible: true },
        { id: 'service_Primary_Indenttifier', name: 'Service Primary Identifier', visible: true },
        { id: 'service_Created_By', name: 'Service Added By', visible: true },
    ];

    const initialVisibleFields = allFields.reduce((acc, field) => {
        acc[field.id] = field.visible;
        return acc;
    }, {});

    // Synchronous lazy init from localStorage to avoid first-render flash
    const [visibleFields, setVisibleFields] = useState(() => {
        try {
            const json = localStorage.getItem(STORAGE_KEY_SERVICE);
            if (!json) return initialVisibleFields;
            const savedNames = JSON.parse(json); // ['Service ID', 'Service Name', ...]
            const next = { ...initialVisibleFields };
            Object.keys(next).forEach((k) => { if (k !== 'no') next[k] = false; });
            savedNames.forEach((name) => {
                const id = SERVICE_NAME_TO_ID[name];
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

    // Exclude 'No' from the dropdown list; it must always be visible
    const dropdownFields = allFields.filter(f => f.id !== 'no');

    useEffect(() => {
        dispatch(fetchAllServices(filter));
    }, [dispatch, filter]);

    // Window resize listener (for responsive spacer handling)
    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (saveSyncTimerRef.current) clearTimeout(saveSyncTimerRef.current);
        };
    }, []);

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    // Helper: build the list of selected column display names for API (strings only)
    const getSelectedColumnNames = (visibility) => {
        const nameMap = {
            service_Id: 'Service ID',
            service_name: 'Service Name',
            service_category: 'Service Category',
            service_part_requierd: 'Part Required',
            technicianType: 'Technician Type',
            hours: 'Hours',
            service_Rate_Type: 'Service Rate Type',
            total_Cost: 'Total Service Cost',
            service_Primary_Indenttifier: 'Service Primary Identifier',
            service_Created_By: 'Service Added By',
        };
        return dropdownFields
            .filter((f) => visibility[f.id])
            .map((f) => nameMap[f.id] || (typeof f.name === 'string' ? f.name : ''))
            .filter(Boolean);
    };

    // Immediate persist + then silent refetch, ensuring save is applied first
    const persistAndRefetch = async (columnsName, toggledOnFieldIds = []) => {
        try {
            await dispatch(saveUserCustomization({ columnsName, moduleName: 'SERVICE_MANAGEMENT' })).unwrap();
        } catch (_) {
        }
        // Local cache to survive refresh
        try {
            localStorage.setItem(STORAGE_KEY_SERVICE, JSON.stringify(columnsName));
        } catch {}
        try {
            await dispatch(fetchAllServicesSilent(filter)).unwrap();
        } finally {
            // Clear per-column loading flags after silent fetch completes
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
        const lockedFieldIds = ['service_name', 'total_Cost'];
        // Compute new visibility first to avoid stale reads
        const newVisibility = { ...visibleFields, [fieldId]: !visibleFields[fieldId] };
        const visibleCount = dropdownFields.reduce((acc, f) => acc + (newVisibility[f.id] ? 1 : 0), 0);
        if (visibleCount === 0) {
            lockedFieldIds.forEach(id => { newVisibility[id] = true; });
            newVisibility['no'] = true;
            setSelectAllChecked(false); // locked mode
        } else {
            setSelectAllChecked(undefined); // let dropdown recompute select-all
        }
        setVisibleFields(newVisibility);
        userChangedVisibilityRef.current = true;
        // Build columnsName from the same newVisibility
        let columnsName = getSelectedColumnNames(newVisibility);

        // Track which field(s) were toggled from OFF to ON to show placeholders
        const toggledOnFieldIds = [];
        if (newVisibility[fieldId] && !visibleFields[fieldId]) {
            toggledOnFieldIds.push(fieldId);
        }

        // Force-include the toggled field label when turned ON to guarantee it's in the first save
        if (newVisibility[fieldId]) {
            const ensureLabelMap = {
                service_Id: 'Service ID',
                service_name: 'Service Name',
                service_category: 'Service Category',
                service_part_requierd: 'Part Required',
                technicianType: 'Technician Type',
                hours: 'Hours',
                service_Rate_Type: 'Service Rate Type',
                total_Cost: 'Total Service Cost',
                service_Primary_Indenttifier: 'Service Primary Identifier',
                service_Created_By: 'Service Added By',
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
        const lockedFieldIds = ['service_name', 'total_Cost'];
        let newVisibility = { ...visibleFields };
        if (checked === false) {
            dropdownFields.forEach(field => {
                newVisibility[field.id] = lockedFieldIds.includes(field.id);
            });
            newVisibility['no'] = true;
            setVisibleFields(newVisibility);
            setSelectAllChecked(false);
            userChangedVisibilityRef.current = true;
            // Persist user customization
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
        // Show placeholders for any newly turned-on fields
        if (toggledOnFieldIds.length > 0) {
            setLoadingColumns((prev) => ({
                ...prev,
                ...Object.fromEntries(toggledOnFieldIds.map((id) => [id, true])),
            }));
        }
        // Persist user customization
        persistAndRefetch(getSelectedColumnNames(newVisibility), toggledOnFieldIds);
    };

    // Build table rows once and reuse (needed for auto-hide and columns)
    const itemsValue = Array.isArray(allServices)
        ? allServices.map((services, index) => ({
            no: String((filter.page - 1) * filter.size + index + 1).padStart(2, '0'),
            id: services.servicePrimaryId,
            service_Id: services.serviceId ,
            service_name: services.serviceName, 
            service_category: services.serviceCategory,
            service_part_requierd: services.partsRequired,
            technicianType: (() => {
                const arr = [];
                const tn = services.technicianTypesDtos?.technicianName;
                const ts = services.technicianTypesDtos?.technicianSubTypeName;
                if (tn) arr.push(tn);
                if (ts) arr.push(ts);
                return arr.join(", ");
            })(),
            hours: services.hours,
            service_Rate_Type:services.serviceRateType,
            total_Cost: services.totalServiceCost,
            service_Primary_Indenttifier: services.servicePrimaryIdentifier,
            service_Created_By: services.serviceCreatedBy,
            spare_Parts_Primary_Identifier: services.sparePartsPrimaryIdentifier,
            status: services.stockStatus,
            added_By: services.addedBy,
            portal: services.portal	, 
        }))
        : [];

    // Auto-hide/auto-show based on current page data (unless user changed)
    useEffect(() => {
        if (!itemsValue || itemsValue.length === 0) {
            // No rows -> nothing to hide; mark done to allow render
            setInitialAutoHideDone(true);
            return;
        }
        if (userChangedVisibilityRef.current) {
            setInitialAutoHideDone(true);
            return;
        }
        const fallbackLockedIds = ['service_name', 'total_Cost'];
        setVisibleFields((prev) => {
            const next = { ...prev };
            let changed = false;
            dropdownFields.forEach((field) => {
                const anyHasValue = itemsValue.some((row) => {
                    const v = row[field.id];
                    if (v === null || v === undefined) return false;
                    if (typeof v === 'string') return v.trim().length > 0;
                    return true; // numbers/objects treated as present
                });
                // Hide columns with no data; show columns that do have data on initial load
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
            if (changed) {
                setSelectAllChecked(undefined);
                // Mark done after applying changes
                setTimeout(() => setInitialAutoHideDone(true), 0);
                return next;
            }
            // No change -> still mark done so we can render
            setTimeout(() => setInitialAutoHideDone(true), 0);
            return prev; // no actual visibility change
        });
    }, [itemsValue]);

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
    
    const onExcelClick = async () => {
        try {
            const response = await dispatch(downloadExcelReport(filter)).unwrap();
            const blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const day = String(today.getDate()).padStart(2, "0");
            const dateString = `${year}${month}${day}`;
            const fileName = `services_${dateString}.xlsx`;
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

    const goToEditService = (item) => {
        const id = item.id;
        navigate(`/app/service-management/edit/${id}/${item.portal}`);
    };

    const goToServiceDetailPage = (id) => {
        navigate(`/app/service-management/detail/${id}`); 
    };
   
    

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
            name: "Service ID",
            selector: (row) => {
                if (!row.service_Id) return null;
        
                const maxVisibleLength = 30; 
                const isTruncated = row.service_Id.length > maxVisibleLength;
                const visibleText = isTruncated 
                    ? `${row.service_Id.slice(0, maxVisibleLength)}...` 
                    : row.service_Id;
        
                return isTruncated ? (
                    <Tooltip
                        className="custom-tooltip service-name-tooltip"
                        color="#E0EBFF"
                        title={
                            <div  className="tooltip-content">
                                <span className="badge">{row.service_Id}</span>
                            </div>
                        }
                        placement="bottom"  
                    >
                        <span>{visibleText}</span>
                    </Tooltip>
                ) : (
                    <span>{row.service_Id}</span>
                );
            },
            sortField: "SERVICE_ID ",
            sortable: true,
            maxWidth: '600px',
            minWidth: '150px',
            wrap: true,
            grow: 1,
            fieldId: 'service_Id'
        },
        {
            id: 3,
            name: "Service Name",
            selector: (row) => {
                if (!row.service_name) return null;
        
                const maxVisibleLength = 40; 
                const isTruncated = row.service_name.length > maxVisibleLength;
                const visibleText = isTruncated 
                    ? `${row.service_name.slice(0, maxVisibleLength)}...` 
                    : row.service_name;
        
                return isTruncated ? (
                    <Tooltip
                        className="custom-tooltip service-name-tooltip"
                        color="#E0EBFF"
                        title={
                            <div  className="tooltip-content">
                                <span className="badge">{row.service_name}</span>
                            </div>
                        }
                        placement="bottom"  
                    >
                        <span>{visibleText}</span>
                    </Tooltip>
                ) : (
                    <span>{row.service_name}</span>
                );
            },
            sortField: "SERVICE_NAME",
            sortable: true,
            maxWidth: selectAllChecked === false ? undefined : '250px',
            minWidth: '180px',
            wrap: true,
            grow: selectAllChecked === false ? 10 : 3,
            fieldId: 'service_name'
        },
        {
            id: 4,
            name: "Service Category",
            selector: (row) => row.service_category,
            sortField: "",
            sortable: false,
            grow: 3,
            maxWidth: '250px',
            minWidth: '230px',
            wrap: true,
            fieldId: 'service_category'
        },
        {
            id: 5,
            name: "Part Required",
            selector: (row) => row.service_part_requierd,
            sortField: "PATHS_REQUIRED",
            sortable: true,
            maxWidth: '600px',
            minWidth: '150px',
            wrap: true,
            grow: 3,
            fieldId: 'service_part_requierd',
            cell: (row) => {
                const raw = row.service_part_requierd;
                const value = (raw ?? '').toString().trim();
                if (!value) return null; // no badge when there is no data
                const normalized = value.toLowerCase();
                return (
                    <span className={`part-required ${normalized === 'yes' ? 'yes' : 'no'}`}>
                        {value}
                    </span>
                );
            },
        },
        {
            id: 6,
            name: "Technician Type",
            selector: (row) => {
                if (!row.technicianType) {
                    return null;
                }
                const technicianNames = row.technicianType
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);
                if (technicianNames.length === 0) {
                    return null;
                }
                const visibleTechnicianNames = technicianNames.slice(0, 2);
                const remainingTechnicianNames = technicianNames.slice(2);
                return (
                    <div className="business-type-badge-container">
                        {visibleTechnicianNames.map((name, index) => (
                            <span key={index} className="business-type-badge tech-badge">
                                {name}
                            </span>
                        ))}
                        {remainingTechnicianNames.length > 0 && (
                            <Tooltip
                                className="custom-tooltip"
                                color="#E0EBFF"
                                title={
                                    <div className="tooltip-content">
                                        {remainingTechnicianNames.map((name, index) => (
                                            <span key={index} className="badge">
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                }
                            >
                                <span className="business-type-badge more-badge">
                                    +{remainingTechnicianNames.length}
                                </span>
                            </Tooltip>
                        )}
                    </div>
                );
            },
            sortable: false,
            maxWidth: '400px',
            minWidth: '300px',
            grow: 1,
            wrap: true,
            fieldId: 'technicianType'
        },
        {
            id: 7,
            name: "Hours",  
            selector: (row) => row.hours,
            sortField: "HOURS",
            sortable: true,
            grow: 3,
            maxWidth: '400px',
            minWidth: '100px',
            wrap: true,
            fieldId: 'hours'
        },
        {
            id: 8,
            name: (<div>
                Service  <br /> Rate Type
            </div>),
            selector: (row) => row.service_Rate_Type,
            sortField: "",
            sortable: false,
            grow: 3,
            maxWidth: '600px',
            minWidth: '150px',
            wrap: true,
            fieldId: 'service_Rate_Type'
        },
        {
            id: 9,
            name: ( <div>
                Total Service  <br /> Cost
            </div>),
            selector: (row) => {
            const formattedCost = row.total_Cost.toString().replace(/,/g, ', ');
            return formattedCost;
            },
            sortField: "TOTAL_SERVICE_COST",
            sortable: true,
            maxWidth: selectAllChecked === false ? undefined : '400px',
            minWidth: '150px',
            wrap: true,
            grow: selectAllChecked === false ? 10 : 3,
            fieldId: 'total_Cost'
        },
        {
            id: 10,
            name:( <div>
                Service Primary  <br /> Identifier
            </div>),
            selector: (row) => row.service_Primary_Indenttifier,
            sortField: "SERVICE_PRIMARY_IDENTIFIER",
            sortable: true,
            grow: 3,
            maxWidth: '600px',
            minWidth: '150px',
            wrap: true,
            fieldId: 'service_Primary_Indenttifier'
        },
        {
            id: 11,
            name: ( <div>
                Service   <br />  Added  By
            </div>),
            selector: (row) => {
                if (!row.service_Created_By) return null;
        
                const maxVisibleLength = 40; 
                const isTruncated = row.service_Created_By.length > maxVisibleLength;
                const visibleText = isTruncated 
                    ? `${row.service_Created_By.slice(0, maxVisibleLength)}...` 
                    : row.service_Created_By;
        
                return isTruncated ? (
                    <Tooltip
                        className="custom-tooltip service-name-tooltip"
                        color="#E0EBFF"
                        title={
                            <div className="tooltip-content">
                                <span className="badge">{row.service_Created_By}</span>
                            </div>
                        }
                        placement="bottom"  
                    >
                        <span>{visibleText}</span>
                    </Tooltip>
                ) : (
                    <span>{row.service_Created_By}</span>
                );
            },
            sortField: "SERVICE_CREATED_BY",
            sortable: true,
            grow: 3,
            maxWidth: '600px',
            minWidth: '150px',
            wrap: true,
            fieldId: 'service_Created_By'
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
            allowOverflow: true,
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
                    menuClassName="service-field-dropdown-menu"
                    lockWhenSelectAllUncheckedIds={['service_name','total_Cost']}
                />
            ) : null,
           selector: (row) => null,
            sortable: false,
            maxWidth: '400px',
            minWidth: '135px',
            fieldId: 'actions',
            cell: (row) => (
                <div className="actions" >
                    <ActionButton
                        isViewIcon={true}
                        goToDetailScreen={goToServiceDetailPage}
                        item={row}
                        goToEditData={goToEditService}
                        isEditMode={true}
                        // editDisabled={row.portal === "adminPortal"}
                        onClickDeleteModel={onClickDeleteModel}
                        isDownloadMode={false}
                        isDeleteMode={true}
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

    // Build columns like Finance/SpareParts: visible non-action columns, then spacer, then actions at the end
    const columns = (() => {
        const nonAction = allColumnsWithPlaceholders.filter(
            (c) => c.fieldId !== 'actions' && c.fieldId !== 'spacer' && visibleFields[c.fieldId]
        );

        // Dynamically expand visible columns to fill the table
        const visibleCount = nonAction.length;
        const expanded = nonAction.map((col) => {
            if (col.fieldId === 'no') return col; // keep numbering column compact
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
        // Include spacer only when there are many columns and very wide screens
        const spacerCol = allColumnsWithPlaceholders.find((c) => c.fieldId === 'spacer');
        const actionCol = allColumnsWithPlaceholders.find((c) => c.fieldId === 'actions');
        const includeSpacer = visibleCount > 6 && windowWidth > 1600;
        const withSpacer = includeSpacer && spacerCol ? [...expanded, spacerCol] : expanded;
        const withActions = actionCol ? [...withSpacer, { ...actionCol, maxWidth: '400px', minWidth: '135px' }] : withSpacer;
        return withActions;
    })();

    return (
        <MasterLayout>
            <Breadcrumb 
                current_page="Service Management"
            />
            <TopProgressBar isLoading={isServicesLoading} />
            <TabTitle title={placeholderText("services.title")} />
            <div
                className={`table-container ${isFilterApplied ? 'has-vendor-tags' : ''}`}
                style={{ position: 'relative' }}
                id="service-list-table"
            >
                {(!isServicesLoading && itemsValue && itemsValue.length > 0 && !initialAutoHideDone) ? null : (
                    <ReactDataTable
                        key={Object.entries(visibleFields).filter(([,v]) => v).map(([k]) => k).join(',')}
                        vendorGlobalEnabled={globalService === "true"}
                        columns={columns}
                        countTextSingular={getFormattedMessage("globally.records.count.title.singular")}
                        countTextPlural={getFormattedMessage("globally.records.count.title.plural")}
                        filterTitle={getFormattedMessage("services.filter.title")}
                        isServiceCategoryFilter
                        isTechnicianTypeFilter
                        isServiceRateFilter
                        items={itemsValue}
                        onChange={onChange}
                        isLoading={isServicesLoading}
                        isShowFilterField
                        isShowSearch={true}
                        ButtonValue={getFormattedMessage("services.create.button.title")}
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
                        searchTextLength={2}
                        to="/app/service-management/create"
                        isDownloadLoading={isDownloadLoading}
                        globalSetting={globalService}
                        globalSettingOffMessage={
                            <span>
                                Enable <span className="link">"Global Services"</span> option in the <Link to="/app/system-configurations">Global Settings</Link> to import the global services data
                                <br />or<br />
                                Click <span>"Add New Service"</span> to create a new entry
                            </span>
                        }
                        noRecordsMessage={<span>Click "Add New Service" to create a new entry</span>}
                        isFilterApplied={isFilterApplied}
                        noFilterMatchMessage={"No data available for the selected filters. Please adjust your filters to view relevant data."}
                        conditionalRowStyles={[
                            {
                                when: row => row.portal === "adminPortal",
                                style: { backgroundColor: "#E0F1F0" },
                                classNames: ['admin-row'],
                            },
                        ]}
                    />
                )}
            </div>

            <DeleteService
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
                dataType="record"
            />
        </MasterLayout>
    );
};

export default Services;