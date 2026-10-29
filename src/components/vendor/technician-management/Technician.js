import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import TabTitle from "../../../shared/tab-title/TabTitle";
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllTechnician, fetchAllTechnicianSilent, downloadExcelReport, downloadPdfFile } from '../../../slices/vendor/technicianSlice';
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

const STORAGE_KEY_TECHNICIAN = 'USER_COLUMNS_TECHNICIAN_MANAGEMENT';
const TECHNICIAN_NAME_TO_ID = {
    'Technician ID': 'technician_id',
    'First Name': 'first_name',
    'Last Name': 'last_name',
    'Technician Type': 'technician_type',
    'Status': 'technician_Status',
    'Joined Date': 'technician_joined_Date',
    'Contact Number': 'contact_number',
    'Email Address': 'technician_email',
    'NIC': 'technician_nic',
    'Username': 'technician_username',
};

const Technicians = () => {
    const { isTechnicianLoading, allTechnician, totalRecord, totalPages, error, isDownloadLoading } = useSelector((state) => state.vendorTechnician);
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [downloadingPdfId, setDownloadingPdfId] = useState(null);
    const [filter, setFilter] = useState({
        page: Filters.OBJ.page,
        size: Filters.OBJ.size,
        searchTerm: "",
        technicianType: "",
        sortField: "",
        status: "",
    });
    
    const isFilterApplied = filter.searchTerm || filter.technicianType || filter.status;
    const [selectAllChecked, setSelectAllChecked] = useState(undefined); // undefined => auto-compute in dropdown
    const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
    const userChangedVisibilityRef = useRef(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loadingColumns, setLoadingColumns] = useState({});
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const allFields = [
        { id: 'no', name: 'No', visible: true },
        { id: 'technician_id', name: 'Technician ID', visible: true },
        { id: 'first_name', name: 'First Name', visible: true },
        { id: 'last_name', name: 'Last Name', visible: true },
        { id: 'technician_type', name: 'Technician Type', visible: true },
        { id: 'technician_Status', name: 'Status', visible: true },
        { id: 'technician_joined_Date', name: 'Joined Date', visible: true },
        { id: 'contact_number', name: 'Contact Number', visible: true },
        { id: 'technician_email', name: 'Email Address', visible: true },
        { id: 'technician_nic', name: 'NIC', visible: true },
        { id: 'technician_username', name: 'Username', visible: true },
    ];

    const initialVisibleFields = allFields.reduce((acc, field) => {
        acc[field.id] = field.visible;
        return acc;
    }, {});

    const [visibleFields, setVisibleFields] = useState(() => {
        try {
            const json = localStorage.getItem(STORAGE_KEY_TECHNICIAN);
            if (!json) return initialVisibleFields;
            const savedNames = JSON.parse(json);
            const next = { ...initialVisibleFields };
            Object.keys(next).forEach((k) => { if (k !== 'no') next[k] = false; });
            savedNames.forEach((name) => {
                const id = TECHNICIAN_NAME_TO_ID[name];
                if (id) next[id] = true;
            });
            return next;
        } catch {
            return initialVisibleFields;
        }
    });

    const dropdownFields = allFields.filter(f => f.id !== 'no');

    const lockedFieldIds = ["first_name", "technician_type"];

    useEffect(() => {
        // Allow auto-hide/auto-show to run on initial load; mark only after user changes in this session
        userChangedVisibilityRef.current = false;
    }, []);

    useEffect(() => {
        dispatch(fetchAllTechnician(filter));
    }, [dispatch, filter]);

    const getSelectedColumnNames = (visibility) => {
        const nameMap = {
            technician_id: 'Technician ID',
            first_name: 'First Name',
            last_name: 'Last Name',
            technician_type: 'Technician Type',
            technician_Status: 'Status',
            technician_joined_Date: 'Joined Date',
            contact_number: 'Contact Number',
            technician_email: 'Email Address',
            technician_nic: 'NIC',
            technician_username: 'Username',
        };
        return dropdownFields
            .filter((f) => visibility[f.id])
            .map((f) => nameMap[f.id] || (typeof f.name === 'string' ? f.name : ''))
            .filter(Boolean);
    };

    const persistAndRefetch = async (columnsName, toggledOnFieldIds = []) => {
        try {
            await dispatch(saveUserCustomization({ columnsName, moduleName: 'TECHNICIAN_MANAGEMENT' })).unwrap();
        } catch (_) {}
        try {
            localStorage.setItem(STORAGE_KEY_TECHNICIAN, JSON.stringify(columnsName));
        } catch {}
        try {
            await dispatch(fetchAllTechnicianSilent(filter)).unwrap();
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

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const onPdfClick = async (item) => {
        const id = item.id;
        try {
          setDownloadingPdfId(String(id));
          const response = await dispatch(downloadPdfFile(id)).unwrap();
          
          // Extract the filename from the response
          const fileName = response.fileName;
          
          // Convert base64 pdfBytes to blob
          const byteCharacters = atob(response.pdfBytes);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/pdf" });
          
          saveAs(blob, fileName);
        } catch (error) {
          console.error("Error downloading the PDF file:", error);
        } finally {
          setDownloadingPdfId(null);
        }
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
            const fileName = `technician_${dateString}.xlsx`;
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

    const goToEditTechnician = (item) => {
        const id = item.id;
        navigate(`/app/technician-management/edit/${id}`);
    };

    const goToTechnicianDetailPage = (id) => {
        navigate(`/app/technician-management/detail/${id}`);
    };

    const itemsValue =
        allTechnician.length >= 0 &&
        allTechnician.map((technician, index) => ({
            no: String((filter.page - 1) * filter.size + index + 1).padStart(2, '0'),
            id: technician.id,
            technician_id: technician.technicianId,
            first_name: technician.firstName,
            last_name: technician.lastName,
            technician_type: technician.technicianType?.join(", "),
            technician_Status: technician.status,
            technician_joined_Date: technician.joinedDate,
            contact_number: technician.contactNumber,
            technician_email: technician.email,
            technician_nic: technician.nic,
            technician_username: technician.userName,
        }));

    const toggleFieldVisibility = (fieldId) => {
        if (fieldId === 'no') return;
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
        // Track fields toggled from OFF to ON to show placeholders
        const toggledOnFieldIds = [];
        if (newVisibility[fieldId] && !visibleFields[fieldId]) {
            toggledOnFieldIds.push(fieldId);
        }
        if (newVisibility[fieldId]) {
            const ensureLabelMap = {
                technician_id: 'Technician ID',
                first_name: 'First Name',
                last_name: 'Last Name',
                technician_type: 'Technician Type',
                technician_Status: 'Status',
                technician_joined_Date: 'Joined Date',
                contact_number: 'Contact Number',
                technician_email: 'Email Address',
                technician_nic: 'NIC',
                technician_username: 'Username',
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
                ...Object.fromEntries(toggledOnFieldIds.map((id) => [id, true]))
            }));
        }
        // Persist and silent refetch, then clear placeholders
        persistAndRefetch(columnsName, toggledOnFieldIds);
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

    useEffect(() => {
        const items = Array.isArray(itemsValue) ? itemsValue : [];
        if (!items || items.length === 0) return;
        if (userChangedVisibilityRef.current) return;
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
                ["first_name", "technician_type"].forEach((id) => {
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
            name: "Technician ID",
            selector: (row) => row.technician_id,
            sortField: "TECHNICIAN_ID",
            sortable: true,
            maxWidth: "600px",
            minWidth: "150px",
            wrap: true,
            fieldId: 'technician_id'
        },
        {
            id: 3,
            name: "First Name",
            selector: (row) => {
                if (!row.first_name) return null;

                const maxVisibleLength = 25;
                const isTruncated = row.first_name.length > maxVisibleLength;
                const visibleText = isTruncated
                    ? `${row.first_name.slice(0, maxVisibleLength)}...`
                    : row.first_name;

                return isTruncated ? (
                    <Tooltip
                        className="custom-tooltip service-name-tooltip"
                        color="#E0EBFF"
                        title={
                            <div className="tooltip-content">
                                <span className="badge">{row.first_name}</span>
                            </div>
                        }
                        placement="bottom"
                    >
                        <span>{visibleText}</span>
                    </Tooltip>
                ) : (
                    <span>{row.first_name}</span>
                );
            },
            sortable: true,
            sortField: "FIRST_NAME",
            grow: selectAllChecked === false ? 10 : 2,
            maxWidth: selectAllChecked === false ? undefined : '600px',
            minWidth: '150px',
            wrap: true,
            fieldId: 'first_name'
        },
        {
            id: 4,
            name: "Last Name",
            selector: (row) => {
                if (!row.last_name) return null;

                const maxVisibleLength = 25;
                const isTruncated = row.last_name.length > maxVisibleLength;
                const visibleText = isTruncated
                    ? `${row.last_name.slice(0, maxVisibleLength)}...`
                    : row.last_name;

                return isTruncated ? (
                    <Tooltip
                        className="custom-tooltip service-name-tooltip"
                        color="#E0EBFF"
                        title={
                            <div className="tooltip-content">
                                <span className="badge">{row.last_name}</span>
                            </div>
                        }
                        placement="bottom"
                    >
                        <span>{visibleText}</span>
                    </Tooltip>
                ) : (
                    <span>{row.last_name}</span>
                );
            },
            sortField: "LAST_NAME",
            sortable: true,
            grow: 2,
            maxWidth: "600px",
            minWidth: "150px",
            wrap: true,
            fieldId: 'last_name'
        },
        {
            id: 6,
            name: "Technician Type",
            selector: (row) => {
                if (!row.technician_type) {
                    return null;
                }
                const technicianNames = row.technician_type.split(",");
                const visibleTechnicianNames = technicianNames.slice(0, 2);
                const remainingTechnicianNames = technicianNames.slice(2);
                return (
                    <div className="business-type-badge-container">
                        {visibleTechnicianNames.map((name, index) => (
                            <span key={index} className="business-type-badge">
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
            grow: selectAllChecked === false ? 10 : 1,
            maxWidth: selectAllChecked === false ? undefined : '300px',
            minWidth: '280px',
            wrap: true,
            fieldId: 'technician_type'
        },
        {
            id: 5,
            name: "Status",
            selector: (row) => row.technician_Status,
            sortField: "STATUS",
            sortable: true,
            maxWidth: "600px",
            minWidth: "140px",
            wrap: true,
            grow: 1,
            fieldId: 'technician_Status',
            cell: (row) => {
                const status = row.technician_Status;
                if (status === "Active" || status === "Inactive") {
                    return (
                        <span className={`status-badge ${status === "Active" ? "active" : "inactive"}`}>
                            {status}
                        </span>
                    );
                }
                return <span>{status ?? ''}</span>;
            },
        },
        {
            id: 4,
            name: "Joined Date",
            selector: (row) => row.technician_joined_Date,
            sortField: "JOINED_DATE",
            grow: 3,
            maxWidth: "600px",
            minWidth: "140px",
            wrap: true,
            fieldId: 'technician_joined_Date'
        },
        {
            id: 4,
            name: "Contact Number",
            selector: (row) => row.contact_number,
            sortField: "CONTACT_NUMBER",
            sortable: true,
            grow: 3,
            maxWidth: "500px",
            minWidth: "180px",
            wrap: true,
            fieldId: 'contact_number'
        },
        {
            id: 4,
            name: "Email Address",
            selector: (row) => row.technician_email,
            sortField: "TECHNICIAN_EMAIL",
            sortable: true,
            grow: 2,
            maxWidth: "500px",
            minWidth: "280px",
            wrap: true,
            fieldId: 'technician_email'
        },
        {
            id: 4,
            name: "NIC",
            selector: (row) => row.technician_nic,
            sortField: "NIC",
            sortable: true,
            grow: 3,
            maxWidth: "500px",
            minWidth: "160px",
            wrap: true,
            fieldId: 'technician_nic'
        },
        {
            id: 4,
            name: "Username",
            selector: (row) => row.technician_username,
            sortField: "USER_NAME",
            sortable: true,
            grow: 3,
            maxWidth: "500px",
            minWidth: "140px",
            wrap: true,
            fieldId: 'technician_username'
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
            id: 16,
            name: !isTechnicianLoading && itemsValue && itemsValue.length > 0 ? (
                <FieldSelectionDropdown
                    fields={dropdownFields}
                    visibleFields={visibleFields}
                    onFieldToggle={toggleFieldVisibility}
                    onSelectAll={toggleSelectAll}
                    selectAllChecked={selectAllChecked}
                    isOpen={isFieldDropdownOpen}
                    onOpenChange={setIsFieldDropdownOpen}
                    containerStyle={{ zIndex: 10 }}
                    menuClassName="technician-field-dropdown-menu"
                    lockWhenSelectAllUncheckedIds={["first_name", "technician_type"]}
                />
            ) : null,
            selector: (row) => null,
            sortable: false,
            maxWidth: "160px",
            minWidth: "130px",
            fieldId: 'actions',
            cell: (row) => (
                <div className="actions">
                    <ActionButton
                        key={`${row.id}-${String(downloadingPdfId) === String(row.id) ? 'loading' : 'idle'}`}
                        isDownloadMode={true}
                        isDownloadPdfLoading={String(downloadingPdfId) === String(row.id)}
                        onDownloadItem={onPdfClick}
                        isViewIcon={true}
                        goToDetailScreen={goToTechnicianDetailPage}
                        item={row}
                        goToEditData={goToEditTechnician}
                        isEditMode={true}
                        onClickDeleteModel={onClickDeleteModel}
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
                current_page="Technician Management"
            />
            <TopProgressBar isLoading={Boolean(downloadingPdfId)} />
            <TabTitle title={placeholderText("technician.title")} />

            <div className={`table-container ${isFilterApplied ? 'has-vendor-tags' : ''}`} style={{ position: 'relative' }}>
               
                <ReactDataTable
                    key={`tech-table-${downloadingPdfId ? String(downloadingPdfId) : 'idle'}-${Object.entries(visibleFields).filter(([,v]) => v).map(([k]) => k).join(',')}`}
                    columns={columns}
                    tableTitle={getFormattedMessage("technician.table.title")}
                    countTextSingular={getFormattedMessage("globally.records.count.title.singular")}
                    countTextPlural={getFormattedMessage("globally.records.count.title.plural")}
                    filterTitle={getFormattedMessage("technician.filter.title")}
                    isTechnicianTypeFilter
                    items={itemsValue}
                    onChange={onChange}
                    isLoading={isTechnicianLoading}
                    isShowFilterField
                    isShowSearch={true}
                    ButtonValue={getFormattedMessage("technician.create.button.title")}
                    totalRows={totalRecord}
                    totalPages={totalPages}
                    currentPage={filter.page}
                    pageSize={filter.size}
                    isExport={true}
                    onExcelClick={onExcelClick}
                    sortField={filter.sortField}
                    sortOrder={filter.sortOrder}
                    sortIcon={renderSortIcons()}
                    isStatusFilter={true}
                    customSort={customSort}
                    to="/app/technician-management/create"
                    isDownloadLoading={isDownloadLoading}
                    globalSetting={true}
                    globalSettingOffMessage={""}
                    noRecordsMessage={<span>Click "Add New Technician" to create a new entry</span>}
                    isFilterApplied={isFilterApplied}   
                    noFilterMatchMessage={"No data available for the selected filters. Please adjust your filters to view relevant data."}
                />
            </div>
        </MasterLayout>
    );
};

export default Technicians;