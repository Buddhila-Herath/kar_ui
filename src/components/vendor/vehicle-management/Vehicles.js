import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import TabTitle from "../../../shared/tab-title/TabTitle";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllVehicles,
  fetchAllVehiclesSilent,
  downloadExcelReport,
} from "../../../slices/vendor/vehicleSlice";
import { saveUserCustomization } from "../../../slices/masterDataSlice";
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
import FieldSelectionDropdown from "../../../shared/components/FieldSelectionDropdown";
import { saveAs } from 'file-saver';

// Local cache key + display name -> field id map
const STORAGE_KEY_VEHICLE = 'USER_COLUMNS_VEHICLE_MANAGEMENT';
const VEHICLE_NAME_TO_ID = {
  'Vehicle ID': 'vehicleId',
  'Vehicle Registration Number': 'registrationNumber',
  'Vehicle Make': 'vehicleMake',
  'Vehicle Model': 'vehicleModel',
  'Year': 'year',
  'VIN': 'vin',
  'Color': 'color',
  'Insurance Renewal Date': 'insuranceRenewalDate',
  'Insurance Company': 'insuranceCompany',
  'License Renewal Date': 'licenseRenewalDate',
  'Owner': 'owner',
  'Created Date': 'createdDate',
  'Registered By': 'registeredBy',
};

const Vehicles = () => {
  const {
    isLoading,
    allVehicles,
    totalRecord,
    totalPages,
    isDownloadLoading,
    error,
  } = useSelector((state) => state.vendorVehicle);
  const [deleteModel, setDeleteModel] = useState(false);
  const [isDelete, setIsDelete] = useState(null);
  const [filter, setFilter] = useState({
    page: Filters.OBJ.page,
    size: Filters.OBJ.size,
    searchTerm: "",
    sortField: "",
    sortOrder: "",
    vehicleMake: [],
    vehicleModel: [],
  });
  const isFilterApplied =
    filter.searchTerm ||
    (filter.vehicleMake && filter.vehicleMake.length > 0) ||
    (filter.vehicleModel && filter.vehicleModel.length > 0);

  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(undefined); // undefined => auto-compute in dropdown
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const userChangedVisibilityRef = useRef(false);
  const saveSyncTimerRef = useRef(null);
  const [loadingColumns, setLoadingColumns] = useState({});

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

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Field selection definitions
  const allFields = [
    { id: "no", name: "No", visible: true },
    { id: "vehicleId", name: "Vehicle ID", visible: true },
    { id: "registrationNumber", name: "Vehicle Registration Number", visible: true },
    { id: "vehicleMake", name: "Vehicle Make", visible: true },
    { id: "vehicleModel", name: "Vehicle Model", visible: true },
    { id: "year", name: "Year", visible: true },
    { id: "vin", name: "VIN", visible: true },
    { id: "color", name: "Color", visible: true },
    { id: "insuranceRenewalDate", name: "Insurance Renewal Date", visible: true },
    { id: "insuranceCompany", name: "Insurance Company", visible: true },
    { id: "licenseRenewalDate", name: "License Renewal Date", visible: true },
    { id: "owner", name: "Owner", visible: true },
    { id: "createdDate", name: "Created Date", visible: true },
    { id: "registeredBy", name: "Registered By", visible: true },
  ];

  const initialVisibleFields = allFields.reduce((acc, field) => {
    acc[field.id] = field.visible;
    return acc;
  }, {});

  // Synchronous lazy init from localStorage to avoid first-render flash
  const [visibleFields, setVisibleFields] = useState(() => {
    try {
      const json = localStorage.getItem(STORAGE_KEY_VEHICLE);
      if (!json) return initialVisibleFields;
      const savedNames = JSON.parse(json); // ['Vehicle ID', 'Vehicle Make', ...]
      const next = { ...initialVisibleFields };
      Object.keys(next).forEach((k) => { if (k !== 'no') next[k] = false; });
      savedNames.forEach((name) => {
        const id = VEHICLE_NAME_TO_ID[name];
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

  // Helper: build the list of selected column display names for API (strings only)
  const getSelectedColumnNames = (visibility) => {
    const nameMap = {
      vehicleId: 'Vehicle ID',
      registrationNumber: 'Vehicle Registration Number',
      vehicleMake: 'Vehicle Make',
      vehicleModel: 'Vehicle Model',
      year: 'Year',
      vin: 'VIN',
      color: 'Color',
      insuranceRenewalDate: 'Insurance Renewal Date',
      insuranceCompany: 'Insurance Company',
      licenseRenewalDate: 'License Renewal Date',
      owner: 'Owner',
      createdDate: 'Created Date',
      registeredBy: 'Registered By',
    };
    return dropdownFields
      .filter((f) => visibility[f.id])
      .map((f) => nameMap[f.id] || (typeof f.name === 'string' ? f.name : ''))
      .filter(Boolean);
  };

  // Immediate persist + then silent refetch, ensuring save is applied first
  const persistAndRefetch = async (columnsName, toggledOnFieldIds = []) => {
    try {
      await dispatch(saveUserCustomization({ columnsName, moduleName: 'VEHICLE_MANAGEMENT' })).unwrap();
    } catch (_) {
    }
    // Local cache to survive refresh
    try {
      localStorage.setItem(STORAGE_KEY_VEHICLE, JSON.stringify(columnsName));
    } catch {}
    try {
      await dispatch(fetchAllVehiclesSilent(filter)).unwrap();
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

  useEffect(() => {
    dispatch(fetchAllVehicles(filter));
  }, [dispatch, filter]);

  const onClickDeleteModel = (isDelete = null) => {
    setDeleteModel(!deleteModel);
    setIsDelete(isDelete);
  };

  const onExcelClick = async () => {
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

      const fileName = `vehicle_${dateString}.xlsx`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error downloading the Excel file:", error);
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

  const customSort = (column, sortDirection) => {
    if (column) {
      setFilter((prevFilter) => ({
        ...prevFilter,
        sortField: column.sortField,
        sortOrder: sortDirection.toUpperCase(),
      }));
    }
  };

  const goToEditVehicleDetailPage = (item) => {
    const id = item.id;
    navigate(`/app/vehicle-management/edit/${id}`);
  };

  const goToVehicleDetailPage = (id) => {
    navigate(`/app/vehicle-management/detail/${id}`);
  };

  const itemsValue = Array.isArray(allVehicles)
    ? allVehicles.map((vehicle, index) => ({
        no: String((filter.page - 1) * filter.size + index + 1).padStart(2, "0"),
        id: vehicle.id,
        vehicleId: vehicle.vehicleId,
        registrationNumber: vehicle.vehicleRegNumber,
        vehicleMake: vehicle.vehicleMake,
        vehicleModel: vehicle.vehicleModel,
        year: vehicle.year,
        vin: vehicle.vin,
        color: vehicle.color,
        insuranceRenewalDate: vehicle.insuranceRenewalDate,
        insuranceCompany: vehicle.insuranceCompany,
        licenseRenewalDate: vehicle.licenseRenewalDate,
        owner: vehicle.owner,
        createdDate: vehicle.createdDate,
        registeredBy: vehicle.registeredBy,
        status: vehicle.status,
      }))
    : [];

  // Auto-hide/auto-show based on current page data
  useEffect(() => {
    if (!itemsValue || itemsValue.length === 0) return;
    if (userChangedVisibilityRef.current) return; 
    const fallbackLockedIds = ["registrationNumber", "vehicleMake", "vehicleModel"];
    setVisibleFields((prev) => {
      const next = { ...prev };
      let changed = false;
      dropdownFields.forEach((field) => {
        const anyHasValue = itemsValue.some((row) => {
          const v = row[field.id];
          if (v === null || v === undefined) return false;
          if (typeof v === "string") return v.trim().length > 0;
          return true; // numbers/objects treated as present
        });
        if (!anyHasValue && next[field.id] !== false) { next[field.id] = false; changed = true; }
        if (anyHasValue && next[field.id] === false) { next[field.id] = true; changed = true; }
      });
      if (next['no'] !== true) {
        next['no'] = true;
        changed = true;
      }
      // If auto-hide would result in no visible columns, enforce fallback locked columns
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
        const visibleCount = dropdownFields.reduce((acc, f) => acc + (next[f.id] ? 1 : 0), 0);
        if (visibleCount === dropdownFields.length) {
          setSelectAllChecked(true);
        } else if (visibleCount === 0) {
          setSelectAllChecked(false);
        } else {
          setSelectAllChecked(undefined);
        }
        return next; 
      }
      return prev; // no actual visibility change -> avoid state update
    });
  }, [itemsValue]);

  // Lock: registrationNumber, vehicleMake, VehiclesModel
  const toggleFieldVisibility = (fieldId) => {
    if (fieldId === 'no') return;
    const lockedFieldIds = ["registrationNumber", "vehicleMake", "vehicleModel"];
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
    // Force-include the toggled field label when turned ON to guarantee it's in the first save
    if (newVisibility[fieldId]) {
      const ensureLabelMap = {
        vehicleId: 'Vehicle ID',
        registrationNumber: 'Vehicle Registration Number',
        vehicleMake: 'Vehicle Make',
        vehicleModel: 'Vehicle Model',
        year: 'Year',
        vin: 'VIN',
        color: 'Color',
        insuranceRenewalDate: 'Insurance Renewal Date',
        insuranceCompany: 'Insurance Company',
        licenseRenewalDate: 'License Renewal Date',
        owner: 'Owner',
        createdDate: 'Created Date',
        registeredBy: 'Registered By',
      };
      const label = ensureLabelMap[fieldId] || fieldId;
      if (!columnsName.includes(label)) {
        columnsName = [...columnsName, label];
      }
    }
    // Track fields toggled from OFF to ON to show placeholders
    const toggledOnFieldIds = [];
    if (newVisibility[fieldId] && !visibleFields[fieldId]) {
      toggledOnFieldIds.push(fieldId);
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
    const lockedFieldIds = ["registrationNumber", "vehicleMake", "vehicleModel"];
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
    // Show placeholders for newly turned-on fields
    if (toggledOnFieldIds.length > 0) {
      setLoadingColumns((prev) => ({
        ...prev,
        ...Object.fromEntries(toggledOnFieldIds.map((id) => [id, true]))
      }));
    }
    // Persist user customization
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
      name: "Vehicle ID",
      selector: (row) => row.vehicleId,
      sortField: "VEHICLE_ID",
      sortable: true,
      maxWidth: "600px",
      minWidth: "130px",
      wrap: true,
      fieldId: "vehicleId",
    },
    {
      id: 3,
      name: (
        <div>
          Vehicle Registration Number
        </div>
      ),
      selector: (row) => row.registrationNumber,
      sortField: "VEHICLE_REG_NO",
      sortable: true,
      maxWidth: "500px",
      minWidth: "150px",
      wrap: true,
      grow: 1,
      fieldId: "registrationNumber",
    },
    {
      id: 4,
      name: "Vehicle Make",
      selector: (row) => {
        const vehicleMakes = [row.vehicleMake];
        const visibleMakes = vehicleMakes.slice(0, 2);
        const remainingMakes = vehicleMakes.slice(2);

        const maxVisibleLength = 25;

        return (
          <div className="business-type-badge-container  make-badge-container">
            {visibleMakes.map((make, index) => {
              const trimmedMake = (make || "").toString().trim();
              const isTruncated = trimmedMake.length > maxVisibleLength;
              const visibleText = isTruncated
                ? `${trimmedMake.slice(0, maxVisibleLength)}...`
                : trimmedMake;

              return isTruncated ? (
                <Tooltip
                  key={index}
                  className="custom-tooltip service-name-tooltip"
                  color="#E0EBFF"
                  title={
                    <div className="tooltip-content">
                      <span className="badge">{trimmedMake}</span>
                    </div>
                  }
                  placement="bottom"
                >
                  <span className="business-type-badge make-badge table-badge">
                    {visibleText}
                  </span>
                </Tooltip>
              ) : (
                <span key={index} className="business-type-badge make-badge ">
                  {visibleText}
                </span>
              );
            })}
            {remainingMakes.length > 0 && (
              <Tooltip
                className="custom-tooltip"
                color="#E0EBFF"
                title={
                  <div className="tooltip-content">
                    {remainingMakes.map((make, index) => {
                      const trimmedMake = (make || "").toString().trim();
                      const isTruncated =
                        trimmedMake.length > maxVisibleLength;
                      const visibleText = isTruncated
                        ? `${trimmedMake.slice(0, maxVisibleLength)}...`
                        : trimmedMake;

                      return isTruncated ? (
                        <Tooltip
                          key={index}
                          className="custom-tooltip service-name-tooltip"
                          color="#E0EBFF"
                          title={
                            <div className="tooltip-content">
                              <span className="badge">{trimmedMake}</span>
                            </div>
                          }
                          placement="bottom"
                        >
                          <span className="badge">{visibleText}</span>
                        </Tooltip>
                      ) : (
                        <span key={index} className="badge">
                          {visibleText}
                        </span>
                      );
                    })}
                  </div>
                }
              >
                <span className="business-type-badge more-badge">
                  +{remainingMakes.length}
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
      sortField: "VEHICLE_MAKE",
      sortable: true,
      grow: 3,
      maxWidth: "200px",
      minWidth: "273px",
      wrap: true,
      fieldId: "vehicleMake",
    },
    {
      id: 5,
      name: "Vehicle Model",
      selector: (row) => {
        if (!row.vehicleModel || typeof row.vehicleModel !== "string") {
          return row.vehicleModel || "";
        }

        const maxVisibleLength = 25;

        const vehicleModels = row.vehicleModel.split(",");
        const visibleModels = vehicleModels.slice(0, 2);
        const remainingModels = vehicleModels.slice(2);

        return (
          <div className="business-type-badge-container make-badge-container">
            {visibleModels.map((model, index) => {
              const trimmedModel = model.trim();
              const isTruncated = trimmedModel.length > maxVisibleLength;
              const visibleText = isTruncated
                ? `${trimmedModel.slice(0, maxVisibleLength)}...`
                : trimmedModel;

              return isTruncated ? (
                <Tooltip
                  key={index}
                  className="custom-tooltip service-name-tooltip"
                  color="#E0EBFF"
                  title={
                    <div className="tooltip-content">
                      <span className="badge">{trimmedModel}</span>
                    </div>
                  }
                  placement="bottom"
                >
                  <span className="business-type-badge make-badge table-badge">
                    {visibleText}
                  </span>
                </Tooltip>
              ) : (
                <span key={index} className="business-type-badge">
                  {visibleText}
                </span>
              );
            })}
            {remainingModels.length > 0 && (
              <Tooltip
                className="custom-tooltip"
                color="#E0EBFF"
                title={
                  <div className="tooltip-content">
                    {remainingModels.map((model, index) => {
                      const trimmedModel = model.trim();
                      const isTruncated = trimmedModel.length > maxVisibleLength;
                      const visibleText = isTruncated
                        ? `${trimmedModel.slice(0, maxVisibleLength)}...`
                        : trimmedModel;

                      return isTruncated ? (
                        <Tooltip
                          key={index}
                          className="custom-tooltip service-name-tooltip"
                          color="#E0EBFF"
                          title={
                            <div className="tooltip-content">
                              <span className="badge">{trimmedModel}</span>
                            </div>
                          }
                          placement="bottom"
                        >
                          <span className="badge">{visibleText}</span>
                        </Tooltip>
                      ) : (
                        <span key={index} className="badge">
                          {visibleText}
                        </span>
                      );
                    })}
                  </div>
                }
              >
                <span className="business-type-badge more-badge">
                  +{remainingModels.length}
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
      sortField: "VEHICLE_MODEL",
      sortable: true,
      grow: 3,
      maxWidth: "220px",
      minWidth: "273px",
      wrap: true,
      fieldId: "vehicleModel",
    },
    {
      id: 6,
      name: "Year",
      selector: (row) => row.year,
      sortField: "YEAR",
      sortable: true,
      grow: 3,
      maxWidth: "100px",
      minWidth: "100px",
      wrap: true,
      fieldId: "year",
    },
    {
      id: 7,
      name: "VIN",
      selector: (row) => row.vin,
      sortField: "VIN",
      sortable: true,
      grow: 1,
      maxWidth: "500px",
      minWidth: "200px",
      wrap: true,
      fieldId: "vin",
    },
    {
      id: 8,
      name: "Color",
      selector: (row) => {
        if (!row.color) return null;

        const maxVisibleLength = 40;
        const isTruncated = row.color.length > maxVisibleLength;
        const visibleText = isTruncated
          ? `${row.color.slice(0, maxVisibleLength)}...`
          : row.color;

        return isTruncated ? (
          <Tooltip
            className="custom-tooltip service-name-tooltip"
            color="#E0EBFF"
            title={
              <div className="tooltip-content">
                <span className="badge">{row.color}</span>
              </div>
            }
            placement="bottom"
          >
            <span>{visibleText}</span>
          </Tooltip>
        ) : (
          <span>{row.color}</span>
        );
      },
      sortField: "COLOR",
      sortable: true,
      grow: 3,
      maxWidth: "100px",
      minWidth: "183px",
      wrap: true,
      fieldId: "color",
    },
    {
      id: 9,
      name: "Insurance Renewal Date",
      selector: (row) => row.insuranceRenewalDate,
      sortField: "INSURANCE_RENEWAL_DATE",
      sortable: true,
      grow: 1,
      maxWidth: "550px",
      minWidth: "191px",
      wrap: true,
      fieldId: "insuranceRenewalDate",
    },
    {
      id: 10,
      name: "Insurance Company",
      selector: (row) => {
        if (!row.insuranceCompany) return null;

        const maxVisibleLength = 40;
        const isTruncated = row.insuranceCompany.length > maxVisibleLength;
        const visibleText = isTruncated
          ? `${row.insuranceCompany.slice(0, maxVisibleLength)}...`
          : row.insuranceCompany;

        return isTruncated ? (
          <Tooltip
            className="custom-tooltip service-name-tooltip"
            color="#E0EBFF"
            title={
              <div className="tooltip-content">
                <span className="badge">{row.insuranceCompany}</span>
              </div>
            }
            placement="bottom"
          >
            <span>{visibleText}</span>
          </Tooltip>
        ) : (
          <span>{row.insuranceCompany}</span>
        );
      },
      sortField: "INSURANCE_COMPANY",
      sortable: true,
      grow: 1,
      maxWidth: "550px",
      minWidth: "202px",
      wrap: true,
      fieldId: "insuranceCompany",
    },
    {
      id: 11,
      name: "License Renewal Date",
      selector: (row) => row.licenseRenewalDate,
      sortField: "LICENSE_RENEWAL_DATE",
      sortable: true,
      grow: 1,
      maxWidth: "550px",
      minWidth: "181px",
      wrap: true,
      fieldId: "licenseRenewalDate",
    },
    {
      id: 12,
      name: "Owner",
      selector: (row) => {
        if (!row.owner) return null;

        const maxVisibleLength = 40;
        const isTruncated = row.owner.length > maxVisibleLength;
        const visibleText = isTruncated
          ? `${row.owner.slice(0, maxVisibleLength)}...`
          : row.owner;

        return isTruncated ? (
          <Tooltip
            className="custom-tooltip service-name-tooltip"
            color="#E0EBFF"
            title={
              <div className="tooltip-content">
                <span className="badge">{row.owner}</span>
              </div>
            }
            placement="bottom"
          >
            <span>{visibleText}</span>
          </Tooltip>
        ) : (
          <span>{row.owner}</span>
        );
      },
      sortField: "OWNER",
      sortable: false,
      grow: 1,
      maxWidth: "500px",
      minWidth: "203px",
      wrap: true,
      fieldId: "owner",
    },
    {
      id: 14,
      name: "Created Date",
      selector: (row) => row.createdDate,
      sortField: "CREATED_DATE",
      sortable: true,
      grow: 1,
      maxWidth: "500px",
      minWidth: "150px",
      wrap: true,
      fieldId: "createdDate",
    },
    {
      id: 15,
      name: "Registered By",
      selector: (row) => {
        if (!row.registeredBy) return null;

        const maxVisibleLength = 40;
        const isTruncated = row.registeredBy.length > maxVisibleLength;
        const visibleText = isTruncated
          ? `${row.registeredBy.slice(0, maxVisibleLength)}...`
          : row.registeredBy;

        return isTruncated ? (
          <Tooltip
            className="custom-tooltip service-name-tooltip"
            color="#E0EBFF"
            title={
              <div className="tooltip-content">
                <span className="badge">{row.registeredBy}</span>
              </div>
            }
            placement="bottom"
          >
            <span>{visibleText}</span>
          </Tooltip>
        ) : (
          <span>{row.registeredBy}</span>
        );
      },
      sortField: "REGISTERED_BY",
      grow: 1,
      maxWidth: "550px",
      minWidth: "170px",
      wrap: true,
      fieldId: "registeredBy",
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
      id: 16,
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
          menuClassName="vehicle-field-dropdown-menu"
          lockWhenSelectAllUncheckedIds={["registrationNumber", "vehicleMake", "vehicleModel"]}
        />
      ) : null,
      selector: (row) => null,
      sortable: false,
      maxWidth: "100px",
      minWidth: "95px",
      fieldId: "actions",
      cell: (row) => (
        <div className="actions">
          <ActionButton
            isDownloadMode={false}
            isViewIcon={true}
            goToDetailScreen={goToVehicleDetailPage}
            item={row}
            goToEditData={goToEditVehicleDetailPage}
            isEditMode={true}
            onClickDeleteModel={onClickDeleteModel}
            isDeleteMode={false}
            isPrintMode={false}
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

  // Compose columns like Users: dynamically expand and include spacer conditionally
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
    return actionCol ? [...withSpacer, actionCol] : withSpacer;
  })();

  return (
    <MasterLayout>
      <Breadcrumb current_page="Vehicle Management" />
      <TopProgressBar isLoading={isLoading} />
      <TabTitle title="Vehicle Management" />
      <div className={`table-container ${isFilterApplied ? 'has-vendor-tags' : ''}`} style={{ position: 'relative' }}>
        <ReactDataTable
          key={Object.entries(visibleFields)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(",")}
          columns={columns}
          tableTitle="Vehicles"
          countTextSingular={getFormattedMessage(
            "globally.records.count.title.singular"
          )}
          countTextPlural={getFormattedMessage(
            "globally.records.count.title.plural"
          )}
          filterTitle="Filter Vehicle Details"
          vehicleMakeFilter
          vehicleModelFilter
          items={itemsValue}
          onChange={onChange}
          isLoading={isLoading}
          isShowFilterField
          isShowSearch={true}
          ButtonValue="Add New Vehicle"
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
          to="/app/vehicle-management/create"
          isDownloadLoading={isDownloadLoading}
          globalSetting={true}
          globalSettingOffMessage={""}
          noRecordsMessage={
            <span>Click "Add New Vehicle" to create a new entry</span>
          }
          isFilterApplied={isFilterApplied}
          noFilterMatchMessage={
            "No data available for the selected filters. Please adjust your filters to view relevant data."
          }
        />
      </div>
    </MasterLayout>
  );
};

export default Vehicles;