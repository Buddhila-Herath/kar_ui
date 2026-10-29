import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import DeleteSparePart from "./DeleteSparePart";
import TabTitle from "../../../shared/tab-title/TabTitle";
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSpareParts, fetchAllSparePartsSilent, downloadExcelReport } from '../../../slices/vendor/sparePartSlice';
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
import { Tokens } from "../../../constants";
import FieldSelectionDropdown from "../../../shared/components/FieldSelectionDropdown";
import { saveUserCustomization } from "../../../slices/masterDataSlice";

const SpareParts = () => {
    const { isSparePartsLoading, allSpareParts, totalRecord, totalPages, error, isDownloadLoading } = useSelector((state) => state.vendorSpareparts);
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
    const [selectAllChecked, setSelectAllChecked] = useState(undefined); // undefined => auto-compute in dropdown
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const userChangedVisibilityRef = useRef(false);
    const [loadingColumns, setLoadingColumns] = useState({}); 

    const [filter, setFilter] = useState({
        page: Filters.OBJ.page,
        size: Filters.OBJ.size,
        searchTerm: "",
        variation: "",
        vehicleCategory: "",
        warranty: "",
        stockStatus: "",
        sortField: "",
        sortOrder: Filters.OBJ.order,
    });
    const isFilterApplied = filter.searchTerm || filter.variation || filter.vehicleCategory || filter.warranty || filter.stockStatus;
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const globalSparePart = localStorage.getItem(Tokens.GLOBAL_SPARE_PART);

    // Local cache key + display name -> field id map
    const STORAGE_KEY_SPAREPART = 'USER_COLUMNS_SPARE_PART_MANAGEMENT';
    const SPAREPART_NAME_TO_ID = {
        'SKU Code': 'spare_id',
        'Part Name': 'part_name',
        'Part Number': 'part_Number',
        'Part Category': 'part_Category',
        'Stock Status': 'status',
        'Variation': 'part_variation',
        'Unit and Quantity of Purchase': 'unit_Quantity_Purchase',
        'Unit and Quantity of Sale': 'unit_Quantity_Sale',
        'Warranty': 'Warrenty',
        'Vehicle Category': 'vehicle_Category',
        'Purchase Price (Rs.)': 'purchase_Price',
        'Sale Price MRP': 'sale_Price',
        'Spare Part Primary Identifier': 'spare_Parts_Primary_Identifier',
        'Spare Parts Added By': 'added_By',
    };

    // Define all available fields for the dropdown
    const allFields = [
        { id: 'no', name: 'No', visible: true },
        { id: 'spare_id', name: 'SKU Code', visible: true },
        { id: 'part_name', name: 'Part Name', visible: true },
        { id: 'part_Number', name: 'Part Number', visible: true },
        { id: 'part_Category', name: 'Part Category', visible: true },
        { id: 'status', name: 'Stock Status', visible: true },
        { id: 'part_variation', name: 'Variation', visible: true },
        { id: 'unit_Quantity_Purchase', name: 'Unit and Quantity of Purchase', visible: true },
        { id: 'unit_Quantity_Sale', name: 'Unit and Quantity of Sale', visible: true },
        { id: 'Warrenty', name: 'Warranty', visible: true },
        { id: 'vehicle_Category', name: 'Vehicle Category', visible: true },
        { id: 'purchase_Price', name: 'Purchase Price', visible: true },
        { id: 'sale_Price', name: 'Sale Price - MRP', visible: true },
        { id: 'spare_Parts_Primary_Identifier', name: 'Spare Parts Primary Identifier', visible: true },
        { id: 'added_By', name: 'Spare Parts Added By', visible: true },
    ];

    const initialVisibleFields = allFields.reduce((acc, field) => {
        acc[field.id] = field.visible;
        return acc;
    }, {});

    // Synchronous lazy init from localStorage to avoid first-render flash
    const savedColumnsJson = (() => { 
        try { return localStorage.getItem(STORAGE_KEY_SPAREPART); } catch { return null; }
    })();
    const [visibleFields, setVisibleFields] = useState(() => {
        try {
            if (!savedColumnsJson) return initialVisibleFields;
            const savedNames = JSON.parse(savedColumnsJson); // ['SKU Code', 'Part Name', ...]
            const next = { ...initialVisibleFields };
            Object.keys(next).forEach((k) => { if (k !== 'no') next[k] = false; });
            savedNames.forEach((name) => {
                const id = SPAREPART_NAME_TO_ID[name];
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

    // Helper: build the list of selected column display names exactly as backend expects
    const getSelectedColumnNames = (visibility) => {
        const nameMap = {
            spare_id: 'SKU Code',
            part_name: 'Part Name',
            part_Number: 'Part Number',
            part_Category: 'Part Category',
            status: 'Stock Status',
            part_variation: 'Variation',
            unit_Quantity_Purchase: 'Unit and Quantity of Purchase',
            unit_Quantity_Sale: 'Unit and Quantity of Sale',
            Warrenty: 'Warranty',
            vehicle_Category: 'Vehicle Category',
            purchase_Price: 'Purchase Price',
            sale_Price: 'Sale Price MRP',
            spare_Parts_Primary_Identifier: 'Spare Part Primary Identifier',
            added_By: 'Spare Parts Added By',
        };
        return dropdownFields
            .filter(f => visibility[f.id])
            .map(f => nameMap[f.id] || f.name)
            .filter(Boolean);
    };
    
    const persistAndRefetch = async (columnsName, toggledOnFieldIds = []) => {
        try {
            await dispatch(saveUserCustomization({ columnsName, moduleName: 'SPARE_PART_MANAGEMENT' })).unwrap();
        } catch (_) { /* ignore */ }
        try {
            localStorage.setItem(STORAGE_KEY_SPAREPART, JSON.stringify(columnsName));
        } catch { }
        try {
            await dispatch(fetchAllSparePartsSilent(filter)).unwrap();
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

    useEffect(() => {
        dispatch(fetchAllSpareParts(filter));
    }, [dispatch, filter]);


    // Window resize tracking to conditionally include spacer column similar to Vehicles
    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const toggleFieldVisibility = (fieldId) => {
        if (fieldId === 'no') return;
        const lockedFieldIds = ["part_name", "sale_Price"];
        // Compute new visibility first (avoid stale on first toggle after refresh)
        const newVisibility = { ...visibleFields, [fieldId]: !visibleFields[fieldId] };
        const visibleCount = dropdownFields.reduce((acc, f) => acc + (newVisibility[f.id] ? 1 : 0), 0);
        if (visibleCount === 0) {
            lockedFieldIds.forEach(id => { newVisibility[id] = true; });
            newVisibility['no'] = true;
            setSelectAllChecked(false); // locked mode
        } else {
            setSelectAllChecked(undefined);
        }
        setVisibleFields(newVisibility);
        userChangedVisibilityRef.current = true;
        // Persist and refetch with updated selection (force-include toggled field label when ON)
        let columnsName = getSelectedColumnNames(newVisibility);

        // Track which field(s) were toggled from OFF to ON to show placeholders
        const toggledOnFieldIds = [];
        if (newVisibility[fieldId] && !visibleFields[fieldId]) {
            toggledOnFieldIds.push(fieldId);
        }

        if (newVisibility[fieldId]) {
            const ensureLabelMap = {
                spare_id: 'SKU Code',
                part_name: 'Part Name',
                part_Number: 'Part Number',
                part_Category: 'Part Category',
                status: 'Stock Status',
                part_variation: 'Variation',
                unit_Quantity_Purchase: 'Unit and Quantity of Purchase',
                unit_Quantity_Sale: 'Unit and Quantity of Sale',
                Warrenty: 'Warranty',
                vehicle_Category: 'Vehicle Category',
                purchase_Price: 'Purchase Price (Rs.)',
                sale_Price: 'Sale Price MRP',
                spare_Parts_Primary_Identifier: 'Spare Part Primary Identifier',
                added_By: 'Spare Parts Added By',
            };
            const label = ensureLabelMap[fieldId] || fieldId;
            if (!columnsName.includes(label)) {
                columnsName = [...columnsName, label];
            }
        }

        // Set placeholders ON
        if (toggledOnFieldIds.length > 0) {
            setLoadingColumns((prev) => ({ ...prev, ...Object.fromEntries(toggledOnFieldIds.map(id => [id, true])) }));
        }
        // Await silent refetch, then clear placeholders
        persistAndRefetch(columnsName, toggledOnFieldIds);
    };
    
    const toggleSelectAll = (checked) => {
        const lockedFieldIds = ["part_name", "sale_Price"];
        if (checked === false) {
            const newVisibility = { ...visibleFields };
            dropdownFields.forEach(field => {
                newVisibility[field.id] = lockedFieldIds.includes(field.id);
            });
            newVisibility['no'] = true;
            setVisibleFields(newVisibility);
            setSelectAllChecked(false);
            userChangedVisibilityRef.current = true;
            // Persist and refetch
            persistAndRefetch(getSelectedColumnNames(newVisibility));
            return;
        }
        const newVisibility = { ...visibleFields };
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
      
            const fileName = `spare_parts_${dateString}.xlsx`;
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

    const goToEditSparePart = (item) => {
        const id = item.id;
        navigate(`/app/spare-parts-management/edit/${id}/${item.portal}`);
    };

    const goToSparePartDetailPage = (id) => {
        navigate(`/app/spare-parts-management/detail/${id}`);
    };

    const itemsValue =
    allSpareParts.length >= 0 &&
    allSpareParts.map((sparePart, index) => ({
        no: String((filter.page - 1) * filter.size + index + 1).padStart(2, '0'),
        id: sparePart.id,
        spare_id: sparePart.skuCode,
        part_name: sparePart.partName, 
        part_Number: sparePart.partNumber,
        part_Category: sparePart.partCategory,
        part_variation: sparePart.variation?.join(","),
        unit_Quantity_Purchase: sparePart.unitQuantityPurchase,
        unit_Quantity_Sale: sparePart.unitQuantitySale,
        Warrenty: sparePart.warranty,
        vehicle_Category: sparePart.vehicleCategory?.join(", "), 
        purchase_Price: sparePart.purchasePrice,
        sale_Price: sparePart.salePrice,
        spare_Parts_Primary_Identifier: sparePart.sparePartsPrimaryIdentifier,
        status: sparePart.stockStatus,
        added_By: sparePart.addedBy, 
        portal: sparePart.portal,
    }));

    // Auto-hide/auto-show based on current page data (only if user hasn't changed visibility yet)
    useEffect(() => {
        const items = Array.isArray(itemsValue) ? itemsValue : [];
        if (!items || items.length === 0) return;
        if (userChangedVisibilityRef.current) return;
        const fallbackLockedIds = ["part_name", "sale_Price"];
        setVisibleFields((prev) => {
            const next = { ...prev };
            let changed = false;
            dropdownFields.forEach((field) => {
                const anyHasValue = items.some((row) => {
                    const v = row[field.id];
                    if (v === null || v === undefined) return false;
                    if (typeof v === 'string') return v.trim().length > 0;
                    return true; // numbers/objects treated as present
                });
                // Hide columns with no data; show columns that do have data on initial load
                if (!anyHasValue && next[field.id] !== false) { next[field.id] = false; changed = true; }
                if (anyHasValue && next[field.id] === false) { next[field.id] = true; changed = true; }
            });
            if (next['no'] !== true) { next['no'] = true; changed = true; }
            const anyVisible = dropdownFields.some((f) => next[f.id]);
            if (!anyVisible) {
                fallbackLockedIds.forEach((id) => { if (next[id] !== true) { next[id] = true; changed = true; } });
            }
            if (changed) {
                setSelectAllChecked(undefined);
                return next;
            }
            return prev;
        });
    }, [itemsValue]);

    // Create filtered columns based on visible fields
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
            name: "SKU Code",
            selector: (row) => row.spare_id,
            sortField: "SKU_CODE",
            sortable: true,
            maxWidth: "600px",
            minWidth: "200px",
            wrap: true,
            grow: 3,
            fieldId: 'spare_id'
        },
        {
            id: 3,
            name: "Part Name",
            selector: (row) => {
                if (!row.part_name) return null;

                const maxVisibleLength = 30;
                const isTruncated = row.part_name.length > maxVisibleLength;
                const visibleText = isTruncated
                    ? `${row.part_name.slice(0, maxVisibleLength)}...`
                    : row.part_name;

                return isTruncated ? (
                    <Tooltip
                        className="custom-tooltip service-name-tooltip"
                        color="#E0EBFF"
                        title={
                            <div className="tooltip-content">
                                <span className="badge">{row.part_name}</span>
                            </div>
                        }
                        placement="bottom"
                    >
                        <span>{visibleText}</span>
                    </Tooltip>
                ) : (
                    <span>{row.part_name}</span>
                );
            },
            sortable: true,
            sortField: "PART_NAME",
            maxWidth: selectAllChecked === false ? undefined : '350px',
            minWidth: '230px',
            wrap: true,
            grow: selectAllChecked === false ? 10 : 3,
            fieldId: 'part_name'
        },
        {
            id: 4,
            name: 'Part Number',
            selector: (row) => row.part_Number,
            sortField: 'PART_NUMBER',
            sortable: true,
            grow: 2,
            maxWidth: '600px',
            minWidth: '180px',
            wrap: true,
            fieldId: 'part_Number'
        },
        {
            id: 5,
            name: 'Part Category',
            selector: (row) => row.part_Category,
            sortField: 'PART_CATEGORY',
            sortable: true,
            grow: 3,
            maxWidth: '600px',
            minWidth: '150px',
            wrap: true,
            fieldId: 'part_Category'
        },
        {
            id: 6,
            name: "Stock Status",
            selector: (row) => row.status,
            sortField: "STOCK_STATUS",
            sortable: true,
            maxWidth: "600px",
            minWidth: "140px",
            wrap: true,
            grow: 3,
            fieldId: 'status',
            cell: (row) => (
                row.status ? (
                    <span
                        className={`status-badge ${row.status === "Available" ? "available" : "not-available"
                            }`}
                    >
                        {row.status}
                    </span>
                ) : null
            ),
        },
        {
            id: 7,
            name: "Variation",
            selector: (row) => {
                const variations = (row.part_variation || "").toString().split(",").map(v => v.trim()).filter(Boolean);
                if (variations.length === 0) return null;
                const visibleVariations = variations.slice(0, 2);
                const remainingVariations = variations.slice(2);

                return (
                    <div className="business-type-badge-container">
                        {visibleVariations.map((variation, index) => (
                            <span key={index} className="business-type-badge">
                                {variation}
                            </span>
                        ))}
                        {remainingVariations.length > 0 && (
                            <Tooltip
                                className="custom-tooltip"
                                color="#E0EBFF"
                                title={
                                    <div className="tooltip-content">
                                        {remainingVariations.map((variation, index) => (
                                            <span key={index} className="badge">
                                                {variation}
                                            </span>
                                        ))}
                                    </div>
                                }
                            >
                                <span className="business-type-badge more-badge">
                                    +{remainingVariations.length}
                                </span>
                            </Tooltip>
                        )}
                    </div>
                );
            },
            sortable: false,
            wrap: true,
            maxWidth: '600px',
            minWidth: '250px',
            grow: 3,
            fieldId: 'part_variation'
        },
        {
            id: 8,
            name: (
                <div>
                    Unit and Quantity<br /> of Purchase
                </div>
            ),
             selector: (row) => {
                if (!row.unit_Quantity_Purchase) return null;
        
                const maxVisibleLength = 30; 
                const isTruncated = row.unit_Quantity_Purchase.length > maxVisibleLength;
                const visibleText = isTruncated 
                    ? `${row.unit_Quantity_Purchase.slice(0, maxVisibleLength)}...` 
                    : row.unit_Quantity_Purchase;
        
                return isTruncated ? (
                    <Tooltip
                        className="custom-tooltip service-name-tooltip"
                        color="#E0EBFF"
                        title={
                            <div  className="tooltip-content">
                                <span className="badge">{row.unit_Quantity_Purchase}</span>
                            </div>
                        }
                        placement="bottom"  
                    >
                        <span>{visibleText}</span>
                    </Tooltip>
                ) : (
                    <span>{row.unit_Quantity_Purchase}</span>
                );
            },
            sortField: "UNIT_QUANTITY_OF_PURCHASE",
            sortable: true,
            grow: 3,
            maxWidth: "600px",
            minWidth: "180px",
            wrap: true,
            fieldId: 'unit_Quantity_Purchase'
        },
        {
            id: 9,
            name: (
                <div>
                    Unit and <br /> Quantity of Sale
                </div>
            ),
             selector: (row) => {
                if (!row.unit_Quantity_Sale) return null;
        
                const maxVisibleLength = 30; 
                const isTruncated = row.unit_Quantity_Sale.length > maxVisibleLength;
                const visibleText = isTruncated 
                    ? `${row.unit_Quantity_Sale.slice(0, maxVisibleLength)}...` 
                    : row.unit_Quantity_Sale;
        
                return isTruncated ? (
                    <Tooltip
                        className="custom-tooltip service-name-tooltip"
                        color="#E0EBFF"
                        title={
                            <div  className="tooltip-content">
                                <span className="badge">{row.unit_Quantity_Sale}</span>
                            </div>
                        }
                        placement="bottom"  
                    >
                        <span>{visibleText}</span>
                    </Tooltip>
                ) : (
                    <span>{row.unit_Quantity_Sale}</span>
                );
            },
            sortField: "UNIT_QUANTITY_OF_SALE",
            sortable: true,
            grow: 3,
            maxWidth: "600px",
            minWidth: "180px",
            wrap: true,
            fieldId: 'unit_Quantity_Sale'
        },
        {
            id: 10,
            name: "Warranty",
            selector: (row) => row.Warrenty,
            sortField: "WARRANTY",
            sortable: true,
            maxWidth: "600px",
            minWidth: "140px",
            wrap: true,
            fieldId: 'Warrenty',
            cell: (row) => (
                <span className={`warrenty ${row.Warrenty === 'Applicable' ? 'applicable' : 'non-applicable'}`}>
                    {row.Warrenty}
                </span>
            ),
        },
        {
            id: 11,
            name: "Vehicle Category",
            selector: (row) => {
                const vehicleCategories = String(row.vehicle_Category || "").split(",").map(v => v.trim()).filter(Boolean);
                if (vehicleCategories.length === 0) return null;
                const visibleCategories = vehicleCategories.slice(0, 2);
                const remainingCategories = vehicleCategories.slice(2);

                return (
                    <div className="business-type-badge-container">
                        {visibleCategories.map((category, index) => (
                            <span key={index} className="business-type-badge">
                                {category}
                            </span>
                        ))}
                        {remainingCategories.length > 0 && (
                            <Tooltip
                                className="custom-tooltip"
                                color="#E0EBFF"
                                title={
                                    <div className="tooltip-content">
                                        {remainingCategories.map((category, index) => (
                                            <span key={index} className="badge">
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                }
                            >
                                <span className="business-type-badge more-badge">
                                    +{remainingCategories.length}
                                </span>
                            </Tooltip>
                        )}
                    </div>
                );
            },
            sortable: false,
            maxWidth: '600px',
            minWidth: '280px',
            wrap: true,
            grow: 1,
            fieldId: 'vehicle_Category'
        },
        {
            id: 12,
            name: (
                <div>
                    Purchase Price
                </div>
            ),
            selector: (row) => row.purchase_Price,
            sortField: "PURCHASE_PRICE",
            sortable: true,
            grow: 3,
            maxWidth: '600px',
            minWidth: '180px',
            wrap: true,
            fieldId: 'purchase_Price'
        },
        {
            id: 13,
            name: (
                <div>
                    Sale Price - MRP
                </div>
            ),
            selector: (row) => row.sale_Price,
            sortField: "SALE_PRICE",
            sortable: true,
            grow: selectAllChecked === false ? 10 : 3,
            maxWidth: selectAllChecked === false ? undefined : '300px',
            minWidth: '180px',
            wrap: true,
            fieldId: 'sale_Price'
        },
        {
            id: 14,
            name: (
                <div>
                    Spare Parts<br /> Primary Identifier
                </div>
            ),
            selector: (row) => row.spare_Parts_Primary_Identifier,
            sortField: "PRIMARY_IDENTIFIER",
            sortable: true,
            maxWidth: "200px",
            minWidth: "180px",
            wrap: true,
            fieldId: 'spare_Parts_Primary_Identifier'
        },
        {
            id: 15,
            name: (
                <div>
                    Spare Parts<br /> Added By
                </div>
            ),
            selector: (row) => {
                if (!row.added_By) return null;

                const maxVisibleLength = 40;
                const isTruncated = row.added_By.length > maxVisibleLength;
                const visibleText = isTruncated
                    ? `${row.added_By.slice(0, maxVisibleLength)}...`
                    : row.added_By;

                return isTruncated ? (
                    <Tooltip
                        className="custom-tooltip service-name-tooltip"
                        color="#E0EBFF"
                        title={
                            <div className="tooltip-content">
                                <span className="badge">{row.added_By}</span>
                            </div>
                        }
                        placement="bottom"
                    >
                        <span>{visibleText}</span>
                    </Tooltip>
                ) : (
                    <span>{row.added_By}</span>
                );
            },
            sortField: "ADDED_BY",
            sortable: true,
            wrap: true,
            maxWidth: "400px",
            minWidth: "180px",
            fieldId: 'added_By'
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
            id: 16,
            name: !isSparePartsLoading && itemsValue && itemsValue.length > 0 ? (
                <FieldSelectionDropdown
                    fields={dropdownFields}
                    visibleFields={visibleFields}
                    onFieldToggle={toggleFieldVisibility}
                    onSelectAll={toggleSelectAll}
                    selectAllChecked={selectAllChecked}
                    isOpen={isFieldDropdownOpen}
                    onOpenChange={setIsFieldDropdownOpen}
                    containerStyle={{ zIndex: 10 }}
                    lockWhenSelectAllUncheckedIds={['part_name', 'sale_Price']}
                />
            ) : null,
            selector: (row) => null,
            sortable: false,
             maxWidth: "600px",
             minWidth: "135px",
            fieldId: 'actions',
            cell: (row) => (
                <div className="actions">
                    <ActionButton
                        isViewIcon={true}
                        goToDetailScreen={goToSparePartDetailPage}
                        item={row}
                        goToEditData={goToEditSparePart}
                        isEditMode={true}
                        // editDisabled={row.portal === "Admin Portal"}
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
                current_page="Spare Part Management"
            />
            <TopProgressBar />
            <TabTitle title={placeholderText("spare-part.title")} />
            <div
                className={`table-container ${isFilterApplied ? 'has-vendor-tags' : ''}`}
                style={{ position: 'relative' }}
                id="spare-part-list-table"
            >

                <ReactDataTable
                    key={Object.entries(visibleFields).filter(([, v]) => v).map(([k]) => k).join(',')}
                    vendorGlobalEnabled={globalSparePart === "true"}
                    columns={columns}
                    tableTitle={getFormattedMessage("spare-part.table.title")}
                    countTextSingular={getFormattedMessage("globally.records.count.title.singular")}
                    countTextPlural={getFormattedMessage("globally.records.count.title.plural")}
                    filterTitle={getFormattedMessage("spare-part.filter.title")}
                    isVariationFilter
                    isVehicleCategoryFilter
                    isWarentyFilter
                    isStockFilter
                    items={itemsValue}
                    onChange={onChange}
                    isLoading={isSparePartsLoading}
                    isShowFilterField
                    isShowSearch={true}
                    ButtonValue={getFormattedMessage("spare-part.create.button.title")}
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
                    to="/app/spare-parts-management/create"
                    isDownloadLoading={isDownloadLoading}
                    conditionalRowStyles={[
                        {
                            when: row => row.portal === "Admin Portal",
                            style: { backgroundColor: "#E0F1F0" },
                            classNames: ['admin-row'],
                        },
                    ]}
                    globalSetting={globalSparePart}
                    globalSettingOffMessage={<span>
                        Enable the <span className="link">"Global Spare Parts"</span> option in the <Link to="/app/system-configurations">Global Settings</Link> to import the global spare parts data
                        <br />or<br />
                        Click <span>"Add New Spare Part"</span> to create a new entry
                    </span>}
                    noRecordsMessage={<span>Click "Add New Spare Part" to create a new entry</span>}
                    isFilterApplied={isFilterApplied}
                    noFilterMatchMessage={"No data available for the selected filters. Please adjust your filters to view relevant data."}
                />
            </div>

            <DeleteSparePart
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
                dataType="record"
            />
        </MasterLayout>
    );
};

export default SpareParts;