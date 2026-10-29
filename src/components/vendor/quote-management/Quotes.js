import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import TabTitle from "../../../shared/tab-title/TabTitle";
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchAllQuotes, 
    downloadExcelReport, 
    downloadPdfFile,
    fetchAllQuotesSilent,
} from '../../../slices/vendor/quoteSlice';
import { saveUserCustomization } from '../../../slices/masterDataSlice';
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

const STORAGE_KEY = 'USER_COLUMNS_QUOTE_MANAGEMENT';

const NAME_TO_ID = {
  'Quote ID': 'quoteId',
  'Quote Type': 'quoteType',
  'Customer Name': 'customerName',
  'Insurance Name': 'insuranceName',
  'Vehicle Registration Number': 'registrationNumber',
  'Due Date': 'dueDate',
  'Total': 'total',
  'Status': 'status',
};

const Quotes = () => {
    const { isQuotesLoading,  allQuotes, totalRecord, totalPages, error, isDownloadLoading } = useSelector((state) => state.vendorQuotes);
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [filter, setFilter] = useState({
        page: Filters.OBJ.page,
        size: Filters.OBJ.size,
        searchTerm: "",
        sortField: "",
        quoteStatus: ""
    });
    const [downloadingPdfId, setDownloadingPdfId] = useState(null);
    const isFilterApplied = Boolean(filter.searchTerm || filter.quoteStatus);
    const [selectAllChecked, setSelectAllChecked] = useState(undefined); // undefined => auto-compute in dropdown
    const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [pdfUrl, setPdfUrl] = useState(null);
    const iframeRef = useRef(null);
    const [isFileDownloadLoading, setIsFileDownloadLoading] = useState(false);
    const userChangedVisibilityRef = useRef(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [loadingColumns, setLoadingColumns] = useState({});

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const allFields = [
        { id: 'no', name: 'No', visible: true },
        { id: 'quoteId', name: 'Quote ID', visible: true },
        { id: 'quoteType', name: 'Quote Type', visible: true },
        { id: 'customerName', name: 'Customer Name', visible: true },
        { id: 'insuranceName', name: 'Insurance Name', visible: true },
        { id: 'registrationNumber', name: 'Vehicle Registration Number', visible: true },
        { id: 'dueDate', name: 'Due Date', visible: true },
        { id: 'total', name: 'Total ', visible: true },
        { id: 'status', name: 'Status', visible: true },
    ];

    const initialVisibleFields = allFields.reduce((acc, field) => {
        acc[field.id] = field.visible;
        return acc;
    }, {});
    const [visibleFields, setVisibleFields] = useState(() => {
        try {
            const json = localStorage.getItem(STORAGE_KEY);
            if (!json) return initialVisibleFields;
            const savedNames = JSON.parse(json);
            const next = { ...initialVisibleFields };
            Object.keys(next).forEach((k) => { if (k !== 'no') next[k] = false; });
            savedNames.forEach((name) => {
                const id = NAME_TO_ID[name];
                if (id) next[id] = true;
            });
            return next;
        } catch {
            localStorage.removeItem(STORAGE_KEY);
            return initialVisibleFields;
        }
    });
    
    const dropdownFields = allFields.filter(f => f.id !== 'no');
    useEffect(() => {
        userChangedVisibilityRef.current = false;
    }, []);

    const lockedFieldIds = ["registrationNumber", "customerName"];

    useEffect(() => {
        dispatch(fetchAllQuotes(filter));
    }, [dispatch, filter]);

    const getSelectedColumnNames = (visibility) => {
        const nameMap = {
            quoteId: 'Quote ID',
            quoteType: 'Quote Type',
            customerName: 'Customer Name',
            insuranceName: 'Insurance Name',
            registrationNumber: 'Vehicle Registration Number',
            dueDate: 'Due Date',
            total: 'Total',
            status: 'Status',
        };
        return dropdownFields
            .filter((f) => visibility[f.id])
            .map((f) => nameMap[f.id] || (typeof f.name === 'string' ? f.name : ''))
            .filter(Boolean);
    };

    const persistAndRefetch = async (columnsName, toggledOnFieldIds = []) => {
        try {
          await dispatch(saveUserCustomization({ columnsName, moduleName: 'QUOTE_MANAGEMENT' })).unwrap();
        } catch (_) {
          
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(columnsName));
        } catch {}
        try {
          await dispatch(fetchAllQuotesSilent(filter)).unwrap();
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

    // const onClickDeleteModel = (isDelete = null) => {
    //     setDeleteModel(!deleteModel);
    //     setIsDelete(isDelete);
    // };

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
                quoteId: 'Quote ID',
                quoteType: 'Quote Type',
                customerName: 'Customer Name',
                insuranceName: 'Insurance Name',
                registrationNumber: 'Vehicle Registration Number',
                dueDate: 'Due Date',
                total: 'Total',
                status: 'Status',
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
        } else {
            const toggledOnFieldIds = [];
            dropdownFields.forEach(field => {
                if (!newVisibility[field.id]) toggledOnFieldIds.push(field.id);
                newVisibility[field.id] = true;
            });
            newVisibility['no'] = true;
            setVisibleFields(newVisibility);
            setSelectAllChecked(true);
            // Show placeholders for newly turned-on fields
            if (toggledOnFieldIds.length > 0) {
              setLoadingColumns((prev) => ({
                ...prev,
                ...Object.fromEntries(toggledOnFieldIds.map((id) => [id, true]))
              }));
            }
            persistAndRefetch(getSelectedColumnNames(newVisibility), toggledOnFieldIds);
        }
        userChangedVisibilityRef.current = true;
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

const onPdfPrint = async (item) => {
    setIsFileDownloadLoading(true);
    try {
        const response = await dispatch(downloadPdfFile(item.id)).unwrap();
        let base64 = response && response.pdfBytes;
        if (!base64) throw new Error('Missing pdfBytes in response');
        base64 = String(base64)
            .replace(/^data:application\/(pdf|octet-stream);base64,/i, '')
            .replace(/\s/g, '')
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        // Pad to multiple of 4
        while (base64.length % 4 !== 0) base64 += '=';

        const byteChars = atob(base64);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
        const byteArray = new Uint8Array(byteNums);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const iframe = document.createElement('iframe');
        // Keep iframe in DOM and visible to the layout engine, but sized to 0
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = '0';
        iframe.setAttribute('aria-hidden', 'true');
        document.body.appendChild(iframe);

        const safeRevokeDelayMs = 120000; // 2 minutes to be safe across browsers
        const cleanup = () => {
            try { iframe.parentNode && iframe.parentNode.removeChild(iframe); } catch (_) {}
            // Revoke after a delay so print preview has time to finish rendering
            setTimeout(() => { try { URL.revokeObjectURL(url); } catch (_) {} }, safeRevokeDelayMs);
        };

        iframe.onload = () => {
            try {
                const win = iframe.contentWindow;
                if (!win) return;

                // Cleanup when printing finishes
                const afterPrint = () => {
                    try { win.removeEventListener('afterprint', afterPrint); } catch (_) {}
                    cleanup();
                };
                try { win.addEventListener('afterprint', afterPrint); } catch (_) {}

                // Fallback cleanup in case afterprint doesn't fire (some browsers)
                setTimeout(() => cleanup(), safeRevokeDelayMs);

                // Give the browser a moment to render before printing
                setTimeout(() => {
                    try {
                        win.focus();
                        win.print();
                    } catch (_) {}
                }, 200);
            } catch (_) {}
        };

        iframe.src = url;
    } catch (error) {
        console.error("Error fetching the PDF for printing:", error);
    } finally {
        setIsFileDownloadLoading(false);
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
            const fileName = `quote_${dateString}.xlsx`;
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

    const goToEditQuoteDetailPage = (item) => {
        const id = item.id;
        navigate(`/app/quote-management/edit/${id}`);
    };

    const goToQuoteDetailPage = (id) => {
        navigate(`/app/quote-management/detail/${id}`); 
    };
   
    const itemsValue = Array.isArray(allQuotes) 
        ? allQuotes.map((quote, index) => ({
            no: String((filter.page - 1) * filter.size + index + 1).padStart(2, '0'),
            id: quote.id,
            quoteId: quote.quoteId,
            quoteType: quote.quoteType,
            customerName: quote.customerName, 
            insuranceName: quote.insuranceName,
            registrationNumber: quote.registrationNumber,
            dueDate: quote.dueDate,
            total: quote.total,
            status: quote.status, 
            isInvoiceCreated: quote.isInvoiceCreated,
            isCompleted: quote.isCompleted,
        }))
        : [];

    useEffect(() => {
        if (!itemsValue || itemsValue.length === 0) return;
        if (userChangedVisibilityRef.current) return; 
        const fallbackLockedIds = ["registrationNumber", "customerName"];
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
                if (!anyHasValue && next[field.id] !== false) {
                    next[field.id] = false;
                    changed = true;
                }
                if (anyHasValue && next[field.id] === false) {
                    next[field.id] = true;
                    changed = true;
                }
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
            name: "Quote ID",
            selector: (row) => row.quoteId,
            sortField: "QUOTE_ID",
            sortable: true,
            maxWidth: "600px",
            minWidth: "130px",
            wrap: true,
            fieldId: 'quoteId'
        },
        {
            id: 4,
            name: "Quote Type",
            selector: (row) => row.quoteType,
            sortField: "QUOTE_TYPE",
            sortable: true,
            grow: 3,
            maxWidth: "180px",
            minWidth: "180px",
            wrap: true,
            fieldId: 'quoteType'
        },
        {
            id: 3,
            name: "Customer Name",
            selector: (row) => {
                if (!row.customerName) return null;
        
                const maxVisibleLength = 30; 
                const isTruncated = row.customerName.length > maxVisibleLength;
                const visibleText = isTruncated 
                    ? `${row.customerName.slice(0, maxVisibleLength)}...` 
                    : row.customerName;
        
                return isTruncated ? (
                    <Tooltip
                        className="custom-tooltip service-name-tooltip"
                        color="#E0EBFF"
                        title={
                            <div  className="tooltip-content">
                                <span className="badge">{row.customerName}</span>
                            </div>
                        }
                        placement="bottom"  
                    >
                        <span>{visibleText}</span>
                    </Tooltip>
                ) : (
                    <span>{row.customerName}</span>
                );
            },
            sortable: true,
            sortField: "CUSTOMER_NAME",
            grow: selectAllChecked === false ? 10 : 3,
            maxWidth: selectAllChecked === false ? undefined : '600px',
            minWidth: '160px',
            wrap: true,
            fieldId: 'customerName'
        },
        {
            id: 5,
            name: (
                <div>
                    Insurance <br /> Name
                </div>
            ),
            selector: (row) => row.insuranceName,
            sortField: "INSURANCE_NAME",
            sortable: true,
            maxWidth: "600px",
            minWidth: "170px",
            wrap: true,
            grow: 1,
            fieldId: 'insuranceName'
        },
        {
            id: 5,
            name: (
                <div>
                    Vehicle Registration <br /> Number
                </div>
            ),
            selector: (row) => row.registrationNumber,
            sortField: "REGISTRATION_NUMBER",
            sortable: true,
            grow: selectAllChecked === false ? 10 : 1,
            maxWidth: selectAllChecked === false ? undefined : "600px",
            minWidth: "180px",
            wrap: true,
            fieldId: 'registrationNumber'
        },
        {
            id: 4,
            name: "Due Date ",
            selector: (row) => row.dueDate,
            sortField: "DUE_DATE",
            sortable: true,
            grow: 1,
            maxWidth: "500px",
            minWidth: "130px",
            wrap: true,
            fieldId: 'dueDate'
        },
        {
            id: 4,
            name: "Total",
            selector: (row) => row.total,
            sortField: "TOTAL",
            sortable: true,
            grow: 3,
            maxWidth: "500px",
            minWidth: "110px",
            wrap: true,
            fieldId: 'total'
        },
        {
            id: 4,
            name: "Status",
            selector: (row) => row.status,
            sortField: "STATUS",
            sortable: true,
            grow: 3,
            maxWidth: "500px",
            minWidth: "130px",
            wrap: true,
            fieldId: 'status',
            cell: (row) => (
                <span
                className={`status-badge ${
                    row.status === "Accepted"
                        ? "accepted"
                        : row.status === "Pending"
                        ? "pending"
                        : row.status === "Rejected"
                        ? "rejected"
                        : "inactive"
                }`}
            >
                {row.status}
            </span>
            ),
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
            name: !isQuotesLoading && itemsValue && itemsValue.length > 0 ? (
                <FieldSelectionDropdown
                    fields={dropdownFields}
                    visibleFields={visibleFields}
                    onFieldToggle={toggleFieldVisibility}
                    onSelectAll={toggleSelectAll}
                    selectAllChecked={selectAllChecked}
                    isOpen={isFieldDropdownOpen}
                    onOpenChange={setIsFieldDropdownOpen}
                    containerStyle={{ zIndex: 10 }}
                    menuClassName="quote-field-dropdown-menu"
                    lockWhenSelectAllUncheckedIds={["registrationNumber", "customerName"]}
                />
            ) : null,
            selector: (row) => null,
            sortable: false,
            maxWidth: "160px",
            minWidth: "95px",
            fieldId: 'actions',
            cell: (row) => (
                <div className="actions" id={`quote-actions-${row.id}`}>
                    <ActionButton 
                        key={`${row.id}-${String(downloadingPdfId) === String(row.id) ? 'loading' : 'idle'}`}
                        isDownloadMode={false}
                        onDownloadItem={onPdfClick}
                        isViewIcon={true}
                        goToDetailScreen={goToQuoteDetailPage}
                        item={row}
                        goToEditData={goToEditQuoteDetailPage}
                        isEditMode={true}
                        // onClickDeleteModel={onClickDeleteModel}
                        isDeleteMode={false}
                        isPrintMode={false}
                        onClickPrint={onPdfPrint}
                        isInvoiceCreated={row.isInvoiceCreated} 
                        isCompleted={row.isCompleted}
                        isDownloadPdfLoading={String(downloadingPdfId) === String(row.id)}
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
                current_page="Quote Management"
            />
            <TopProgressBar isLoading={isQuotesLoading || isFileDownloadLoading} />
            <TabTitle title="Quote Management" />
            <div className={`table-container ${isFilterApplied ? 'has-vendor-tags' : ''}`} style={{ position: 'relative' }} id="quote-management-table-container">
                <ReactDataTable
                    key={`quote-table-${downloadingPdfId ? String(downloadingPdfId) : 'idle'}-${Object.entries(visibleFields).filter(([,v]) => v).map(([k]) => k).join(',')}`}
                    columns={columns}
                    tableTitle="Quote/Estimate"
                    countTextSingular={getFormattedMessage("globally.records.count.title.singular")}
                    countTextPlural={getFormattedMessage("globally.records.count.title.plural")}
                    filterTitle="Filter Quote/Estimate Details"
                    isQuoteStatusFilter
                    items={itemsValue}
                    onChange={onChange}
                    isLoading={isQuotesLoading}
                    isShowFilterField
                    isShowSearch={true}
                    ButtonValue="Create New Quote/Estimate"
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
                    to="/app/quote-management/create"
                    isDownloadLoading={isDownloadLoading}
                    globalSetting={true}
                    globalSettingOffMessage={""}
                    noRecordsMessage={<span>Click "Create New Quote/Estimate" to create a new entry</span>}
                    isFilterApplied={isFilterApplied}   
                    noFilterMatchMessage={"No data available for the selected filters. Please adjust your filters to view relevant data."}
                />
            </div>
            {pdfUrl && <iframe ref={iframeRef} src={pdfUrl} style={{ display: "none" }} />}
        </MasterLayout>
    );
};

export default Quotes;