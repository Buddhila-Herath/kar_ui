import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveAs } from "file-saver";
import MasterLayout from "../../MasterLayout";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
  fetchAllInvoices,
  fetchAllInvoicesSilent,
  downloadExcelReport,
  downloadPdfFile
} from "../../../slices/vendor/financeSlice";
import { Tooltip } from "antd";
import {
  getFormattedMessage,
  placeholderText,
} from "../../../shared/sharedMethod";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import ActionButton from "../../../shared/action-buttons/ActionButton";
import { Filters } from "../../../constants";
import { renderSortIcons } from "../../../config/sortConfig";
import Stats from "./Stats";
import FieldSelectionDropdown from "../../../shared/components/FieldSelectionDropdown";
import { saveUserCustomization } from "../../../slices/masterDataSlice";

// Local cache key + display name -> field id map
const STORAGE_KEY_FINANCE = 'USER_COLUMNS_FINANCE_MANAGEMENT';
const FINANCE_NAME_TO_ID = {
  'Invoice Number': 'invoice_Id',
  'Customer Name': 'customer_Name',
  'Job Type': 'job_Type',
  'Invoice Date': 'invoice_Created_Date',
  'Due Date': 'invoice_Due_Date',
  'Payment Status': 'payment_Status',
  'Total Amount (Rs.)': 'total_Amount',
};

const Finance = () => {
  const {
    isInvoicesLoading,
    allInvoices,
    totalRecord,
    totalPages,
    error,
    isDownloadLoading,
  } = useSelector((state) => state.vendorFinance);
  const [deleteModel, setDeleteModel] = useState(false);
  const [isDelete, setIsDelete] = useState(null);
  const [isFileDownloadLoading, setIsFileDownloadLoading] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);
  const [filter, setFilter] = useState({
    page: Filters.OBJ.page,
    size: Filters.OBJ.size,
    searchTerm: "",
    paymentStatus: "",
    fromDate: "",
    toDate: "",
    jobType: "",
    sortField: "",
    status: "",
  });

  const isFilterApplied =
    filter.searchTerm || filter.paymentStatus || filter.jobType || filter.fromDate || filter.toDate;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(undefined);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const userChangedVisibilityRef = useRef(false);
  const [loadingColumns, setLoadingColumns] = useState({});

  const allFields = [
    { id: "no", name: "No", visible: true },
    { id: "invoice_Id", name: "Invoice Number", visible: true },
    { id: "customer_Name", name: "Customer Name", visible: true },
    { id: "job_Type", name: "Job Type", visible: true },
    { id: "invoice_Created_Date", name: "Invoice Date", visible: true },
    { id: "invoice_Due_Date", name: "Due Date", visible: true },
    { id: "payment_Status", name: "Payment Status", visible: true },
    { id: "total_Amount", name: "Total Amount (Rs.)", visible: true },
  ];

  const initialVisibleFields = allFields.reduce((acc, field) => {
    acc[field.id] = field.visible;
    return acc;
  }, {});

  // Restore from localStorage synchronously to avoid flash
  const [visibleFields, setVisibleFields] = useState(() => {
    try {
      const json = localStorage.getItem(STORAGE_KEY_FINANCE);
      if (!json) return initialVisibleFields;
      const savedNames = JSON.parse(json); // ["Invoice Number", "Payment Status", ...]
      const next = { ...initialVisibleFields };
      Object.keys(next).forEach((k) => { if (k !== 'no') next[k] = false; });
      savedNames.forEach((name) => {
        const id = FINANCE_NAME_TO_ID[name];
        if (id) next[id] = true;
      });
      return next;
    } catch {
      return initialVisibleFields;
    }
  });
const dropdownFields = allFields.filter(f => f.id !== 'no');
useEffect(() => {
  userChangedVisibilityRef.current = false;
}, []);

useEffect(() => {
  const onResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);

  useEffect(() => {
    dispatch(fetchAllInvoices(filter));
  }, [dispatch, filter]);

  const getSelectedColumnNames = (visibility) => {
    const nameMap = {
      invoice_Id: 'Invoice Number',
      customer_Name: 'Customer Name',
      job_Type: 'Job Type',
      invoice_Created_Date: 'Invoice Date',
      invoice_Due_Date: 'Due Date',
      payment_Status: 'Payment Status',
      total_Amount: 'Total Amount (Rs.)',
    };
    return dropdownFields
      .filter((f) => visibility[f.id])
      .map((f) => nameMap[f.id] || (typeof f.name === 'string' ? f.name : ''))
      .filter(Boolean);
  };

  // Persist and await silent refetch; then clear per-field placeholders
  const persistAndRefetch = async (columnsName, toggledOnFieldIds = []) => {
    try {
      await dispatch(saveUserCustomization({ columnsName, moduleName: 'FINANCE_MANAGEMENT' })).unwrap();
    } catch (_) {}
    try {
      localStorage.setItem(STORAGE_KEY_FINANCE, JSON.stringify(columnsName));
    } catch {}
    try {
      await dispatch(fetchAllInvoicesSilent(filter)).unwrap();
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
    setIsFileDownloadLoading(true);
    try {
      const response = await dispatch(downloadExcelReport(filter)).unwrap();
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const dateString = `${year}${month}${day}`;

      const fileName = `invoice_${dateString}.xlsx`;
      saveAs(blob, fileName); 
    } catch (error) {
      console.error("Error downloading the Excel file:", error);
    } finally {
      setIsFileDownloadLoading(false);
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

  const goToEditInvoice = (item) => {
    if (item.isTaxInvoice) {
      navigate(`/app/finance-management`);
    }
    const id = item.id;
    navigate(`/app/finance-management/edit/${id}`);
  };

  const goToInvoiceDetailPage = (id) => {
    navigate(`/app/finance-management/detail/${id}`);
  };

  const itemsValue = allInvoices.map((invoice, index) => ({
    no: String((filter.page - 1) * filter.size + index + 1).padStart(2, "0"),
    id: invoice.quoteId,
    finance_id: invoice.id,
    invoice_Id: invoice.invoiceId,
    customer_Name: invoice.customerName,
    job_Type: invoice.jobType,
    invoice_Created_Date: invoice.invoiceCreatedDate,
    invoice_Due_Date: invoice.invoiceDueDate,
    payment_Status: invoice.paymentStatus,
    total_Amount: invoice.totalAmount,
    isTaxInvoice: invoice.isTaxInvoice,
  })) || [];

  // Auto-hide/auto-show based on current page data (once, unless user changes)
  useEffect(() => {
    if (!itemsValue || itemsValue.length === 0) return;
    if (userChangedVisibilityRef.current) return;
    const fallbackLockedIds = ["invoice_Id", "payment_Status"];
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
        if (!anyHasValue && next[field.id] !== false) { next[field.id] = false; changed = true; }
        if (anyHasValue && next[field.id] === false) { next[field.id] = true; changed = true; }
      });
      if (next['no'] !== true) { next['no'] = true; changed = true; }
      const anyVisible = dropdownFields.some((f) => next[f.id]);
      if (!anyVisible) {
        fallbackLockedIds.forEach((id) => { if (next[id] !== true) { next[id] = true; changed = true; } });
      }
      if (changed) { setSelectAllChecked(undefined); return next; }
      return prev;
    });
  }, [itemsValue]);

  const toggleFieldVisibility = (fieldId) => {
    if (fieldId === 'no') return;
    const lockedFieldIds = ["invoice_Id", "payment_Status"];
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
    // Build columnsName and ensure toggled-on field label is included first time
    let columnsName = getSelectedColumnNames(newVisibility);

    // Track fields toggled from OFF to ON to show placeholders
    const toggledOnFieldIds = [];
    if (newVisibility[fieldId] && !visibleFields[fieldId]) {
      toggledOnFieldIds.push(fieldId);
    }

    if (newVisibility[fieldId]) {
      const ensureLabelMap = {
        invoice_Id: 'Invoice Number',
        customer_Name: 'Customer Name',
        job_Type: 'Job Type',
        invoice_Created_Date: 'Invoice Date',
        invoice_Due_Date: 'Due Date',
        payment_Status: 'Payment Status',
        total_Amount: 'Total Amount (Rs.)',
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
    const lockedFieldIds = ["invoice_Id", "payment_Status"];
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
    // Show placeholders for newly turned-on fields
    if (toggledOnFieldIds.length > 0) {
      setLoadingColumns((prev) => ({
        ...prev,
        ...Object.fromEntries(toggledOnFieldIds.map((id) => [id, true])),
      }));
    }
    persistAndRefetch(getSelectedColumnNames(newVisibility), toggledOnFieldIds);
};

  const allColumns = [
    {
      id: 1,
      name: "No",
      selector: (row) => row.no,
      sortField: "no", 
      sortable: false,
      maxWidth: "100px",
      minWidth: "70px",
      fieldId: "no",
    },
    {
      id: 2,
      name: "Invoice Number",
      selector: (row) => row.invoice_Id,
      sortField: "INVOICE_NUMBER",
      sortable: true,
      maxWidth: selectAllChecked === false ? undefined : "600px",
      minWidth: "150px",
      wrap: true,
      grow: selectAllChecked === false ? 10 : undefined,
      fieldId: "invoice_Id",
    },
    {
      id: 3,
      name: "Customer Name",
      selector: (row) => {
        if (!row.customer_Name) return null;

        const maxVisibleLength = 35;
        const isTruncated = (row.customer_Name || "").length > maxVisibleLength;
        const visibleText = isTruncated
          ? `${row.customer_Name.slice(0, maxVisibleLength)}...`
          : row.customer_Name;

        return isTruncated ? (
          <Tooltip
            className="custom-tooltip service-name-tooltip"
            color="#E0EBFF"
            title={
              <div className="tooltip-content">
                <span className="badge">{row.customer_Name}</span>
              </div>
            }
            placement="bottom"
          >
            <span>{visibleText}</span>
          </Tooltip>
        ) : (
          <span>{row.customer_Name}</span>
        );
      },
      sortable: true,
      sortField: "CUSTOMER_NAME",
      grow: 3,
      maxWidth: "600px",
      minWidth: "160px",
      wrap: true,
      fieldId: "customer_Name",
    },
    {
      id: 4,
      name: "Job Type",
      selector: (row) => row.job_Type,
      sortField: "JOB_TYPE",
      sortable: true,
      grow: 2,
      maxWidth: "600px",
      minWidth: "170px",
      wrap: true,
      fieldId: "job_Type",
    },
    {
      id: 6,
      name: "Invoice Date",
      selector: (row) => row.invoice_Created_Date,
      sortField: "INVOICE_DATE",
      sortable: true,
      maxWidth: "600px",
      minWidth: "170px",
      grow: 1,
      wrap: true,
      fieldId: "invoice_Created_Date",
    },
    {
      id: 5,
      name: "Due Date",
      selector: (row) => row.invoice_Due_Date,
      sortField: "INVOICE_DUE_DATE",
      sortable: true,
      maxWidth: "600px",
      minWidth: "140px",
      wrap: true,
      grow: 1,
      fieldId: "invoice_Due_Date",
    },
    {
      id: 7,
      name: "Payment Status",
      selector: (row) => row.payment_Status,
      sortField: "PAYMENT_STATUS",
      sortable: true,
      grow: selectAllChecked === false ? 10 : 3,
      maxWidth: selectAllChecked === false ? undefined : "500px",
      minWidth: "180px",
      wrap: true,
      fieldId: "payment_Status",
    },
    {
      id: 8,
      name: "Total Amount (Rs.)",
      selector: (row) => row.total_Amount,
      sortField: "TOTALAMOUNT",
      sortable: true,
      grow: 2,
      maxWidth: "500px",
      minWidth: "180px",
      wrap: true,
      fieldId: "total_Amount",
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
      name:  itemsValue && itemsValue.length > 0 ? (
        <FieldSelectionDropdown
            fields={dropdownFields}
            visibleFields={visibleFields}
            onFieldToggle={toggleFieldVisibility}
            onSelectAll={toggleSelectAll}
            selectAllChecked={selectAllChecked}
            isOpen={isFieldDropdownOpen}
            onOpenChange={setIsFieldDropdownOpen}
            containerStyle={{ zIndex: 10 }}
            menuClassName="finance-field-dropdown-menu"
            lockWhenSelectAllUncheckedIds={["invoice_Id", "payment_Status"]}
        />
    ) : null,
      selector: (row) => null,
      sortable: false,
      maxWidth: "160px",
      minWidth: "95px",
      fieldId: "actions",
      cell: (row) => (
        <div className="actions">
          <ActionButton
            key={`${row.id}-${String(downloadingPdfId) === String(row.id) ? 'loading' : 'idle'}`}
            isDownloadPdfLoading={String(downloadingPdfId) === String(row.id)}
            isDownloadMode={false}
            onDownloadItem={onPdfClick}
            isViewIcon={true}
            goToDetailScreen={goToInvoiceDetailPage}
            item={row}
            goToEditData={goToEditInvoice}
            isEditMode={true}
            onClickDeleteModel={onClickDeleteModel}
            isDeleteMode={false}
            isTaxInvoice={row.isTaxInvoice} 
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
      (c) => c.fieldId !== "actions" && c.fieldId !== "spacer" && visibleFields[c.fieldId]
    );

    // Dynamically expand visible columns to fill the table (mirrors Users.js)
    const visibleCount = nonAction.length;
    const expanded = nonAction.map((col) => {
      if (col.fieldId === "no") return col; // keep numbering column compact
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

    const spacerCol = allColumnsWithPlaceholders.find((c) => c.fieldId === "spacer");
    const actionCol = allColumnsWithPlaceholders.find((c) => c.fieldId === "actions");
    const includeSpacer = visibleCount > 6 && windowWidth > 1600;
    const withSpacer = includeSpacer && spacerCol ? [...expanded, spacerCol] : expanded;
    return actionCol ? [...withSpacer, actionCol] : withSpacer;
  })();

  return (
    <MasterLayout>
      <Breadcrumb current_page="Finance Management" />
      <TopProgressBar isLoading={isInvoicesLoading || isFileDownloadLoading} />
      <TabTitle title={placeholderText("finance.title")} />
      <div id="finance-management-container" className="job-managements finance-management">
        <Stats />

        <div id="finance-table-container" className="table-container" style={{ position: "relative" }}>         

          <ReactDataTable
            key={`finance-table-${downloadingPdfId ? String(downloadingPdfId) : 'idle'}-${Object.entries(visibleFields).filter(([,v]) => v).map(([k]) => k).join(',')}`}
            columns={columns}
            tableTitle={getFormattedMessage("finance.table.title")}
            countTextSingular={getFormattedMessage(
              "globally.records.count.title.singular"
            )}
            countTextPlural={getFormattedMessage(
              "globally.records.count.title.plural"
            )}
            filterTitle={getFormattedMessage("finance.filter.title")}
            isDueDateFilter
            isFinanceStatusFiter
            isJobTypeFilter
            items={itemsValue}
            onChange={onChange}
            isLoading={isInvoicesLoading}
            isShowFilterField
            isShowSearch={true}
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
            to="/app/finance-management/create"
            isDownloadLoading={isDownloadLoading}
            globalSetting={true}
            globalSettingOffMessage={""}
            noRecordsMessage={
              <span>Jobs must be completed to display invoice data</span>
            }
            isFilterApplied={isFilterApplied}
            noFilterMatchMessage={
              "No data available for the selected filters. Please adjust your filters to view relevant data."
            }
          />
        </div>
      </div>
    </MasterLayout>
  );
};

export default Finance;