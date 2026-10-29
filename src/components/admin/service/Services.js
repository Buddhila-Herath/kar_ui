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
import { Filters, Tokens } from "../../../constants";
import { renderSortIcons } from "../../../config/sortConfig";
import { saveAs } from 'file-saver';
import DeleteService from "./DeleteService";
import FieldSelectionDropdown from "../../../shared/components/FieldSelectionDropdown";
import { saveUserCustomization } from "../../../slices/masterDataSlice";

const Services = () => {
    const { isServicesLoading, allServices, totalRecord, totalPages, error, isDownloadLoading } = useSelector((state) => state.vendorServices);
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
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
    const isFilterApplied = (filter.searchTerm || filter.serviceRateType || filter.technicianType || filter.servicesCategory)?true:false;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const globalService = localStorage.getItem(Tokens.GLOBAL_SERVICES);

    // Field selection dropdown + layout state
    const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
    const [selectAllChecked, setSelectAllChecked] = useState(undefined); // undefined => auto-compute in dropdown
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const userChangedVisibilityRef = useRef(false);
    const [loadingColumns, setLoadingColumns] = useState({});

    useEffect(() => {
        dispatch(fetchAllServices(filter));
    }, [dispatch, filter]);

    // Window resize listener (for responsive spacer handling)
    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
        
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
        navigate(`/admin/service-management/edit/${id}`);
    };

    const goToServiceDetailPage = (id) => {
        navigate(`/admin/service-management/detail/${id}`); 
    };
   
    const itemsValue =
        allServices.length >= 0 &&
        allServices.map((services, index) => ({
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
        }));

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

    // Field list for dropdown (ids must match fieldId in columns)
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
    const initialVisibleFields = allFields.reduce((acc, f) => { acc[f.id] = f.visible; return acc; }, {});
    const [visibleFields, setVisibleFields] = useState(() => {
        try {
            const json = localStorage.getItem(STORAGE_KEY_SERVICE);
            if (!json) return initialVisibleFields;
            const savedNames = JSON.parse(json);
            const next = { ...initialVisibleFields };
            Object.keys(next).forEach((k) => { next[k] = false; });
            savedNames.forEach((name) => {
                const id = SERVICE_NAME_TO_ID[name];
                if (id) next[id] = true;
            });
            // Ensure 'No' stays visible even after applying saved preferences
            next['no'] = true;
            return next;
        } catch {
            return initialVisibleFields;
        }
    });

    // Fields available in dropdown (exclude 'No')
    const dropdownFields = allFields.filter(f => f.id !== 'no');

    // Let auto-hide run on initial load; mark as changed only after user toggles fields
    useEffect(() => {
        userChangedVisibilityRef.current = false;
    }, []);

    // Helper to build selected column display names for API
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

    // Persist selection + silent refetch
    const persistAndRefetch = async (columnsName, toggledOnFieldIds = []) => {
        try {
            await dispatch(saveUserCustomization({ columnsName, moduleName: 'SERVICE_MANAGEMENT' })).unwrap();
        } catch (_) { }
        try {
            localStorage.setItem(STORAGE_KEY_SERVICE, JSON.stringify(columnsName));
        } catch { }
        try {
            await dispatch(fetchAllServicesSilent(filter)).unwrap();
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

    // Lock: Service Name + Total Cost
    const toggleFieldVisibility = (fieldId) => {
        if (fieldId === 'no') return;
        const lockedFieldIds = ['service_name', 'total_Cost'];
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
        let columnsName = getSelectedColumnNames(newVisibility);
        const toggledOnFieldIds = [];
        if (newVisibility[fieldId] && !visibleFields[fieldId]) {
            toggledOnFieldIds.push(fieldId);
        }
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
        if (toggledOnFieldIds.length > 0) {
            setLoadingColumns((prev) => ({ ...prev, ...Object.fromEntries(toggledOnFieldIds.map(id => [id, true])) }));
        }
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

    // Auto-hide columns that have no data across the current page (unless user changed)
    useEffect(() => {
        const items = Array.isArray(itemsValue) ? itemsValue : [];
        if (!items || items.length === 0) return;
        if (userChangedVisibilityRef.current) return;
        const fallbackLockedIds = ['service_name', 'total_Cost'];
        setVisibleFields((prev) => {
            const next = { ...prev };
            let changed = false;
            dropdownFields.forEach((field) => {
                const anyHasValue = items.some((row) => {
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

    // Columns with fieldId; spacer + actions at end with dropdown header
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
                            <div className="tooltip-content">
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
            fieldId: 'service_Id',
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
                            <div className="tooltip-content">
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
            maxWidth: '255px',
            minWidth: '185px',
            wrap: true,
            grow: 3,
            fieldId: 'service_name',
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
            fieldId: 'service_category',
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
                const partRequired = (row.service_part_requierd || '').trim().toLowerCase();
                return (
                    <span className={`part-required ${partRequired === 'yes' ? 'yes' : 'no'}`}>
                        {row.service_part_requierd}
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
            minWidth: '280px',
            grow: 1,
            wrap: true,
            fieldId: 'technicianType',
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
            fieldId: 'hours',
        },
        {
            id: 8,
            name: (<div>
                Service <br /> Rate Type
            </div>),
            selector: (row) => row.service_Rate_Type,
            sortField: "",
            sortable: false,
            grow: 3,
            maxWidth: '400px',
            minWidth: '120px',
            wrap: true,
            fieldId: 'service_Rate_Type',
        },
        {
            id: 9,
            name: (<div>
                Total Service <br /> Cost
            </div>),
            selector: (row) => {
                const formattedCost = row.total_Cost.toString().replace(/,/g, ', ');
                return formattedCost;
            },
            sortField: "TOTAL_SERVICE_COST",
            sortable: true,
            maxWidth: '400px',
            minWidth: '150px',
            wrap: true,
            grow: 3,
            fieldId: 'total_Cost',
        },
        {
            id: 10,
            name: (<div>
                Service Primary <br /> Identifier
            </div>),
            selector: (row) => row.service_Primary_Indenttifier,
            sortField: "SERVICE_PRIMARY_IDENTIFIER",
            sortable: true,
            grow: 3,
            maxWidth: '600px',
            minWidth: '150px',
            wrap: true,
            fieldId: 'service_Primary_Indenttifier',
        },
        {
            id: 11,
            name: (<div>
                Service <br /> Added By
            </div>),
            selector: (row) => row.service_Created_By,
            sortField: "SERVICE_CREATED_BY",
            sortable: true,
            grow: 3,
            maxWidth: '600px',
            minWidth: '150px',
            wrap: true,
            fieldId: 'service_Created_By',
        },
        {
            id: 999,
            name: "",
            selector: () => null,
            sortable: false,
            grow: 2,
            minWidth: 'auto',
            fieldId: 'spacer',
            cell: () => null,
            ignoreRowClick: true,
            allowoverflow: true,
        },
        {
            id: 18,
            name: itemsValue && itemsValue.length > 0 ? (
                <FieldSelectionDropdown
                    fields={allFields.filter(f => f.id !== 'no')}
                    visibleFields={visibleFields}
                    onFieldToggle={toggleFieldVisibility}
                    onSelectAll={toggleSelectAll}
                    selectAllChecked={selectAllChecked}
                    isOpen={isFieldDropdownOpen}
                    onOpenChange={setIsFieldDropdownOpen}
                    containerStyle={{ zIndex: 10 }}
                    lockWhenSelectAllUncheckedIds={['service_name', 'total_Cost']}
                    menuClassName={'service-selection-dropdown-menu'}
                />
            ) : null,
            selector: (row) => null,
            sortable: false,
            maxWidth: '400px',
            minWidth: '130px',
            fieldId: 'actions',
            cell: (row) => (
                <div className="actions">
                    <ActionButton
                        isViewIcon={true}
                        goToDetailScreen={goToServiceDetailPage}
                        item={row}
                        goToEditData={goToEditService}
                        isEditMode={true}
                        onClickDeleteModel={onClickDeleteModel}
                        isDownloadMode={false}
                        isDeleteMode={true}
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
                current_page="Service Management"
            />
            <TopProgressBar isLoading={isServicesLoading} />
            <TabTitle title={placeholderText("services.title")} />
                <ReactDataTable
                    key={Object.entries(visibleFields)
                        .filter(([, v]) => v)
                        .map(([k]) => k)
                        .join(",")}
                    columns={columns}
                    tableTitle={getFormattedMessage("services.table.title")}
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
                    to="/admin/service-management/create"
                    isDownloadLoading={isDownloadLoading}
                    globalSetting={globalService}
                    globalSettingOffMessage={<span>
                        Enable <span className="link">"Global Services"</span> option in the <Link to="/app/system-configurations">Global Settings</Link> to import the global services data
                        <br />or<br />
                        Click <span>"Add New Service"</span> to create a new entry
                    </span>}
                    noRecordsMessage={<span>Click "Add New Service" to create a new entry</span>}
                    isFilterApplied={isFilterApplied}
                    noFilterMatchMessage={"No data available for the selected filters. Please adjust your filters to view relevant data."}
                />
            
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