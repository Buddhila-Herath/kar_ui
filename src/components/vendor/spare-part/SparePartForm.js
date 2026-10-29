import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, notification, Spin } from "antd";
import { dateFormat } from '../../../constants';
import { format, parseISO } from "date-fns";
import Icons from "../../../utils/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import RadioSelect from "../../../shared/select/RadioSelect";
import FormMultipleSelect from "../../../shared/select/FormMultipleSelect";
import CustomOptionsSelect from "../../../shared/select/CustomOptionsSelect";
import CustomMultipleSelect from "../../../shared/select/CustomMultipleSelect";
import CustomGroupSelect from "../../../shared/select/CustomGroupSelect";
import CustomSubGroupSelect from "../../../shared/select/CustomSubGroupSelect";
import UploadComponent from "../../../shared/upload/UploadComponent";
import { Tokens } from '../../../constants/index';
import { fetchImageByPath } from "../../../slices/masterDataSlice";
import { 
  generatePrimaryId, 
  saveSparePart, 
  uploadSparePartImage, 
  saveSparePartNote,
  uploadSparePartNoteFile ,
  deleteSparePartNote,
  updateSparePart,
  updateAdminSparePart,
  fetchPartPlacementCode
} from '../../../slices/vendor/sparePartSlice';
import { 
  fetchAllVariations, 
  fetchAllVehicleCategory, 
  fetchAllUnits,
  fetchAllVehicleMakesCategories,
  fetchAllVehicleMakes, 
  fetchAllVehicleModels,
  fetchAllVehicleMakeList,
  fetchAllFuelTypes,
  addUnit,
  addVehicleCategory,
  addModel,
  addMake
 } from '../../../slices/masterDataSlice';
import CancelModal from "../../../shared/components/CancelModal";
import CustomRadioSelect from "../../../shared/select/CustomRadioSelect";
import { fetchAllCountries } from "../../../slices/locationDataSlice";
import ReactDatePicker from "../../../shared/datepicker/ReactDatePicker";

const SparePartForm = ({ sparePart = {}, isEdit = false , sId = 0}) => {
  const { portal } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const firstName = localStorage.getItem(Tokens.FIRST_NAME);
  const lastName = localStorage.getItem(Tokens.LAST_NAME);
  const email = localStorage.getItem(Tokens.EMAIL);
  const { 
    allVariations, 
    allVehicleCategory, 
    allUnits, 
    allVehicleMakes, 
    allVehicleModels,
    allVehicleMakeCategory,
    allVehicleMakeList,
    vehicleModelLoading,
    allFuelTypes
  } = useSelector((state) => state.masterData);
  const { primaryId } = useSelector((state) => state.vendorSpareparts);
  const { allCountries } = useSelector((state) => state.locations);
  const [errorIcon, setErrorIcon] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(false);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadErrorDescription, setUploadErrorDescription] = useState('');
  const [file, setFile] = useState(null);
  const [notesFile, setNotesFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [editImgPreview, setEditImgPreview] = useState(null);
  const [hasActiveNote, setHasActiveNote] = useState(true);
  const [isFormModified, setIsFormModified] = useState(false);
  const [initialFormSnapshot, setInitialFormSnapshot] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [selectedVehicleMakeIds, setSelectedVehicleMakeIds] = useState([]);
  const [sparePartBase64, setSparePartBase64] = useState(null);
  const [expectedPartPlacementCode, setExpectedPartPlacementCode] = useState(null);

  useEffect(() => {
    dispatch(generatePrimaryId());
    dispatch(fetchAllVariations());
    dispatch(fetchAllVehicleCategory());
    dispatch(fetchAllUnits());
    dispatch(fetchAllVehicleMakesCategories());
    dispatch(fetchAllVehicleMakes());
    dispatch(fetchAllVehicleMakeList());
    dispatch(fetchAllFuelTypes());
    dispatch(fetchAllCountries());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit && sparePart.vehicleMake) {
        setSelectedVehicleMakeIds(sparePart.vehicleMake);
    }
  }, [isEdit, sparePart, dispatch]);

  useEffect(() => {
    if (selectedVehicleMakeIds.length > 0) {
      dispatch(fetchAllVehicleModels(selectedVehicleMakeIds));
    }
  }, [dispatch, selectedVehicleMakeIds]);

  useEffect(() => {
    if (primaryId) {
      setFormInputs((prevState) => ({
        ...prevState,
        sparePartsPrimaryIdentifier: primaryId,
      }));
    }
  }, [primaryId]);

  useEffect(() => {
    return () => {
      dispatch({ type: "vendorSpareparts/resetPrimaryId" });
    };
  }, []);

  useEffect(() => {
    if (isEdit && sparePart) {
      loadSparePartImage();
    }
  }, [isEdit, sparePart, dispatch]);

  const loadSparePartImage = async () => {
    if (isEdit && sparePart?.partImagePath) {
      setIsImgLoading(true);
      try {
          const res = await dispatch(
            fetchImageByPath(sparePart.partImagePath)
          ).unwrap();
          if (res && res.url) {
            setSparePartBase64(res.url);
          }
      } catch (error) {
        console.error("Failed to load spare part image:", error);
      } finally {
        setIsImgLoading(false);
      }
    }
  };

  const partCategoryOptions = [
    { label: "Spare Parts", value: "SPARE_PARTS" },
    { label: "Consumables", value: "CONSUMABLES" },
  ];

  const variationOptions = allVariations.map((option) => ({
    label: option.variantName,
    value: option.id,
  }));

  const fuelTypeOptions = (allFuelTypes || []).map((option) => ({
    label: option?.fuelTypeCode
      ? `${option.fuelType} (${option.fuelTypeCode})`
      : option?.code
      ? `${option.fuelType} (${option.code})`
      : option.fuelType,
    value: option.id,
  }));

  const unitOptions = allUnits.map((option) => ({
    label: option.unitName,
    value: option.id,
  }));
  
  const countryOptions = (allCountries || []).map((option) => ({
    label: option?.countryCode
      ? `${option.countryName || option.name} (${option.countryCode})`
      : option?.code,
    value: option.id,
  }));
    
  const allOption = { label: "ALL", value: "all" };
  const vehicleCategoryOptions = [
    allOption, 
    ...allVehicleCategory.map((option) => ({
      label: option.categoryCode ? `${option.vehicleCategory} (${option.categoryCode})` : option.vehicleCategory,
      value: option.id,
    }))
  ];

  const handleCategoryChange = (selectedValues) => {
    const isAllSelected = selectedValues.includes("all");
    const wasAllPreviouslySelected = formInputs.vehicleCategoryId.includes("all");
    const allOptionsExceptAll = vehicleCategoryOptions
      .map((opt) => opt.value)
      .filter((val) => val !== "all");
  
    if (isAllSelected && !wasAllPreviouslySelected) {
      setFormInputs((prev) => ({
        ...prev,
        vehicleCategoryId: vehicleCategoryOptions.map((opt) => opt.value),
      }));
    } else if (!isAllSelected && wasAllPreviouslySelected) {
      setFormInputs((prev) => ({
        ...prev,
        vehicleCategoryId: [],
      }));
    } else if (
      selectedValues.length === allOptionsExceptAll.length &&
      !isAllSelected
    ) {
      setFormInputs((prev) => ({
        ...prev,
        vehicleCategoryId: [allOption.value, ...selectedValues],
      }));
    } else {
      setFormInputs((prev) => ({
        ...prev,
        vehicleCategoryId: selectedValues.filter((val) => val !== "all"),
      }));
    }
  
    // Clear errors if any
    setErrors((prev) => ({
      ...prev,
      vehicleCategoryId: "",
    }));
    setIsFormModified(true);
  };  

  const vehicleMakeOptions = useMemo(() => allVehicleMakes.map((option) => ({
    label: option.vehicleMakeCategory,
    options: option.vehicleMake.map((make) => ({
      label: make.makeCode ? `${make.vehicleMakeName} (${make.makeCode})` : make.vehicleMakeName,
      value: make.vehicleMakeId,
    })),
  })), [allVehicleMakes]);

  const vehicleMakeCategoryLists = allVehicleMakeCategory.map((option) => ({
    label: option.makeCategory,
    value: option.id,
  }));

  const vehicleMakeLists = allVehicleMakeList.map((option) => ({
    label: option.makeName,
    value: option.id,
  }));

  const vehicleModelOptions = useMemo(() => allVehicleModels.map((option) => ({
    label: option.vehicleMakeCategory,
    options: option.vehicleMake.map((make) => ({
      label: make.vehicleMakeName,
      subOptions: make.vehicleModel.map((model) => ({
        label: (model.modelCode || model.code || model.vehicleModelCode)
          ? `${model.vehicleModelName} (${model.modelCode })` 
                   : model.vehicleModelName,
        value: model.vehicleModelId,
      })),
    })),
  })), [allVehicleModels]);

  const warrantyPeriodOptions = [
    { label: "Months", value: "MONTHS" },
    { label: "Years", value: "YEARS" },
  ];

  const handleAddUnitValue = async (value) => {
    try {
        const response = await dispatch(addUnit(value)).unwrap();
        await dispatch(fetchAllUnits());
        return response;
    } catch (error) {
        return error;
    }
  };

  const handleAddCategoryValue = async (value) => {
    try {
        const response = await dispatch(addVehicleCategory(value)).unwrap();
        await dispatch(fetchAllVehicleCategory());
        return response;
    } catch (error) {
        return error;
    }
  };

  const handleAddMakeValue = async (value, category) => {
    try {
        const response = await dispatch(addMake(value, category)).unwrap();
        await dispatch(fetchAllVehicleMakeList());
        await dispatch(fetchAllVehicleMakesCategories());
        await dispatch(fetchAllVehicleMakes());
        return response;
    } catch (error) {
        return error;
    }
  };

  const handleAddModelValue = async (value, category) => {
    try {
        const response = await dispatch(addModel(value, category)).unwrap();
        if (response) {
          dispatch(fetchAllVehicleModels(selectedVehicleMakeIds));
        }
        return response;
    } catch (error) {
        return error;
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); 
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
  
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const closePopup = () => {
    setShowPopup(false);
    setErrorIcon("");
    setErrorTitle("");
    setError("");
  };

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (["pdf"].includes(extension)) return "application/pdf";
    if (["png", "jpg", "jpeg"].includes(extension)) return "image";
    if (["doc", "docx"].includes(extension)) return "application/msword";
    if (["csv"].includes(extension)) return "text/csv";
    if (["txt"].includes(extension)) return "text/txt";
    return "unknown";
  };
  
  useEffect(() => {
    if (isEdit && sparePart) {
         const rawFuel = sparePart.fuelTypeId || sparePart.fuelType || [];
      const fuelTypeId = Array.isArray(rawFuel)
        ? rawFuel.map((v) => {
            if (v && typeof v === "object") return v.id ?? v.value ?? v;
            return v;
          }).map((v) => (typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v))
        : [];

        // Compute manufactured country id and label from sparePart and countries list
        const countryIdFromPart = sparePart.manufactureCountryId ?? sparePart.country ?? null;
        let computedCountryId = countryIdFromPart || "";
        let manufacturedCountryLabel = sparePart.manufacturedCountry || "";

        if ((!manufacturedCountryLabel || !computedCountryId) && Array.isArray(allCountries) && allCountries.length > 0) {
          const byId = countryIdFromPart ? allCountries.find((c) => c.id === countryIdFromPart) : null;
          if (byId) {
            manufacturedCountryLabel = byId.countryName || byId.name || byId.label || "";
            computedCountryId = byId.id;
          } else if (sparePart.manufacturedCountry) {
            const byName = allCountries.find((c) => (c.countryName || c.name) === sparePart.manufacturedCountry);
            if (byName) {
              manufacturedCountryLabel = byName.countryName || byName.name || byName.label || "";
              computedCountryId = byName.id;
            }
          }
        }

        const initialValues = {
            id: sId,
            skuCode: sparePart.skuCode,
            partCategory: sparePart.partCategory,
            partName: sparePart.partName,
            productNameCode: sparePart.productNameCode || sparePart.partNameCode,
            partPlacement: sparePart.partPlacement || null,
            partPlacementCode: sparePart.partPlacementCode || null,
            manufacturedCountry: manufacturedCountryLabel,
            manufacturedYear: sparePart.manufacturedYear || sparePart.manufactureYear || "",
            manufactureCountryId: computedCountryId,
            year: sparePart.manufacturedYear
              ? Number(sparePart.manufacturedYear)
              : (sparePart.manufactureYear ? Number(sparePart.manufactureYear) : null),
            fuelTypeId,
            partNumber: sparePart.partNumber,
            description: sparePart.description,
            variationId: sparePart.variation,
            material: sparePart.material,
            unitQuantityPurchase: sparePart.unitQuantityPurchase,
            unitQuantityPurchaseUnit: sparePart.unitQuantityPurchaseUnit,
            unitQuantitySalesUnit: sparePart.unitQuantitySaleUnit,
            unitQuantitySales: sparePart.unitQuantitySale,
            minOrderQtySupplier: sparePart.minOrderQuantitySupplier,
            reOrderQty: sparePart.reOrderLevel,
            warranty: sparePart.warranty,
            warrantyPeriod: sparePart.warrantyPeriod,
            warrantyPeriodValue: sparePart.warrantyPeriodValue,
            vehicleCategoryId: sparePart.vehicleCategory,
            vehicleMakeId: sparePart.vehicleMake,
            vehicleModelId: sparePart.vehicleModel,
            purchasePrice: sparePart.purchasePrice,
            salesPrice: sparePart.salePrice,
            sparePartsPrimaryIdentifier: sparePart.sparePartPrimaryIdentifier,
            addedByName: sparePart.addedBy,
            addedDate: sparePart.addedDate,
            stockStatus: sparePart.stockStatus || "IN_STOCK",
            uploadImgPath: sparePart.partImagePath,
            sparePartsNotesList: sparePart.notes || [],
        };
        setFormInputs(initialValues);
        setInitialFormSnapshot(initialValues);
        setEditImgPreview(sparePart.partImage || null);

        if (sparePart.notes && sparePart.notes.length > 0) {
          const newNotes = sparePart.notes.map((note) => {
            return {
              id: note.id,
              text: note.note,
              attachments: note.noteAttachments.length > 0
                ? note.noteAttachments.map((attachment) => {
                    const fileName = attachment.fileName.split('/').pop();  
                    return {
                      name: fileName,
                      path: attachment.attachmentPath,
                      type: getFileType(fileName),
                    };
                  })
                : [],
              addedDate: note.addedDate,
              addedTime: note.addedTime
            };
          });
    
          setSavedNotes(() => [
            ...newNotes,
          ]);

          setFormInputs((prevState) => ({
            ...prevState,
            sparePartsNotesList: newNotes.map(note => note.id),
          }));
        }
    }
  }, [isEdit, sparePart, allCountries]);

  const handleRemoveFilePreview = () => {
    setEditImgPreview(null);
    setSparePartBase64(null);
    setFormInputs((prev) => ({
      ...prev,
      uploadImgPath: null,
    }))
    setIsFormModified(true);
  };

  const [formInputs, setFormInputs] = useState({
    partCategory: "",
    partName: "",
    productNameCode: "",
    partNumber: "",
    description: "",
    variationId: [],
    fuelTypeId: [],
    material: "",
    unitQuantityPurchase: "",
    unitQuantityPurchaseUnit: unitOptions.length > 0 ? unitOptions[0].value : "",
    unitQuantitySalesUnit: unitOptions.length > 0 ? unitOptions[0].value : "",
    unitQuantitySales: "",
    minOrderQtySupplier: "",
    reOrderQty: "",
    warranty: "APPLICABLE",
    warrantyPeriod: "MONTHS",
    warrantyPeriodValue: "",
    vehicleCategoryId: [],
    vehicleMakeId: [],
    vehicleModelId: [],
    partPlacement: "",
    partPlacementCode: "",
    manufacturedCountry: "",
    manufactureCountryId: "",
    manufactureYear: "",
    purchasePrice: "",
    salesPrice: "",
    sparePartsNotesList: [],
    sparePartsPrimaryIdentifier: sparePart.sparePartsPrimaryIdentifier || primaryId || "",
    addedBy: email,
    stockStatus: "IN_STOCK",
    uploadImgPath: null,
    isAdmin: false,
    status: true,
    addedDate: format(new Date(), dateFormat.API_NATIVE),
  });

  useEffect(() => {
    if (unitOptions.length > 0 && !formInputs.unitQuantityPurchaseUnit) {
      setFormInputs((prev) => ({
        ...prev,
        unitQuantityPurchaseUnit: unitOptions[0].value,
      }));
    }
    if (unitOptions.length > 0 && !formInputs.unitQuantitySalesUnit) {
      setFormInputs((prev) => ({
        ...prev,
        unitQuantitySalesUnit: unitOptions[0].value,
      }));
    }
  }, [unitOptions]);

  const [errors, setErrors] = useState({
    partCategory: "",
    partName: "",
    partNumber: "",
    description: "",
    variationId: "",
    fuelTypeId: "",
    material: "",
    unitQuantityPurchase: "",
    unitQuantityPurchaseUnit: "",
    unitQuantitySalesUnit: "",
    unitQuantitySales: "",
    minOrderQtySupplier: "",
    reOrderQty: "",
    warranty: "",
    warrantyPeriod: "MONTHS",
    warrantyPeriodValue: "",
    vehicleCategoryId: "",
    vehicleMakeId: "",
    vehicleModelId: "",
    partNameCode: "",
    partPlacement: "",
    partPlacementCode: "",
    manufacturedCountry: "",
    manufactureYear: "",
    manufacturedCountry: "",
    purchasePrice: "",
    salesPrice: "",
    sparePartsPrimaryIdentifier: "",
    stockStatus: "",
    uploadImgPath: null,
    noteText: "",
    productNameCode: ""
  });

  const handleCancelClick = () => {
    if (isFormModified) {
      setShowCancelPopup(true);
    } else {
      navigate(-1);
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelPopup(false);
    navigate(-1);
  };
  
  const handleCancelCancel = () => {
    setShowCancelPopup(false);
  };

  const handleValidation = () => {
    let formErrors = {};
    let isValid = true;
    const priceRegex = /^\d+(\.\d{1,2})?$/; 
    const numberRegex = /^\d+$/; 

    if (!formInputs.partCategory) {
      formErrors.partCategory = "Part Category field is required";
      isValid = false;
    }
    
    // Vehicle Make/Model: required only for SPARE_PARTS
    if (formInputs.partCategory === "SPARE_PARTS") {
      if (!formInputs.vehicleMakeId || formInputs.vehicleMakeId.length === 0) {
        formErrors.vehicleMakeId = "Vehicle Make field is required";
        isValid = false;
      }
      if (!formInputs.vehicleModelId || formInputs.vehicleModelId.length === 0) {
        formErrors.vehicleModelId = "Vehicle Model field is required";
        isValid = false;
      }
    }
  
    const isPartNameEmpty = !formInputs.partName;
    const isProductNameCodeEmpty = !formInputs.productNameCode;
    if (isPartNameEmpty && isProductNameCodeEmpty) {
      formErrors.partName = "Part Name and Code fields are required";
      isValid = false;
    } else if (isPartNameEmpty) {
      formErrors.partName = "Part Name field is required";
      isValid = false;
    } else if (formInputs.partName.length > 100) {
      formErrors.partName = "Enter a value that doesn't exceed 100 characters";
      isValid = false;
    }
  
    if (!formInputs.partNumber) {
      formErrors.partNumber = "Part Number field is required";
      isValid = false;
    } else if (formInputs.partNumber.length > 30) {
      formErrors.partNumber = "Enter a value that doesn't exceed 30 characters";
      isValid = false;
    }
  
    if (formInputs.description && formInputs.description.length > 100) {
      formErrors.description = "Enter a value that doesn't exceed 100 characters";
      isValid = false;
    }

    const isPlacementEmpty = !formInputs.partPlacement;
    const isPlacementCodeEmpty = !formInputs.partPlacementCode;
    if (
      formInputs.partCategory === "SPARE_PARTS" &&
      isPlacementEmpty &&
      isPlacementCodeEmpty
    ) {
      formErrors.partPlacement = "Part Placement and Code fields are required";
      isValid = false;
    } else if (
      formInputs.partCategory === "SPARE_PARTS" &&
      isPlacementEmpty
    ) {
      formErrors.partPlacement = "Part Placement field is required";
      isValid = false;
    } else if (formInputs.partPlacement && formInputs.partPlacement.length > 100) {
      formErrors.partPlacement = "Enter a value that doesn't exceed 100 characters";
      isValid = false;
    }

    if (formInputs.variationId.length === 0) {
      formErrors.variationId = "Variation field is required";
      isValid = false;
    }

    // Product Name Code
    if (!isProductNameCodeEmpty) {
      if (formInputs.productNameCode.length !== 4) {
        formErrors.productNameCode = "Code must be exactly 4 characters";
        isValid = false;
      }
    } else if (!isPartNameEmpty) {
      // Only code empty
      formErrors.productNameCode = "Code field is required";
      isValid = false;
    }

    // Part Placement Code: required only for SPARE_PARTS; length check always when value present
    if (formInputs.partCategory === "SPARE_PARTS" && isPlacementCodeEmpty && !isPlacementEmpty) {
      formErrors.partPlacementCode = "Code field is required";
      isValid = false;
    }
    if (formInputs.partPlacementCode && formInputs.partPlacementCode.length !== 3) {
      formErrors.partPlacementCode = "Code must be exactly 3 characters";
      isValid = false;
    }

    // If API provided an expected code, enforce it on submit
    if (
      expectedPartPlacementCode &&
      formInputs.partPlacement &&
      formInputs.partPlacementCode &&
      expectedPartPlacementCode !== formInputs.partPlacementCode
    ) {
      formErrors.partPlacementCode = `Part Placement code is ${expectedPartPlacementCode}`;
      isValid = false;
    }

    // Fuel type required only for Spare Parts
    if (
      formInputs.partCategory === "SPARE_PARTS" &&
      (!formInputs.fuelTypeId || formInputs.fuelTypeId.length === 0)
    ) {
      formErrors.fuelTypeId = "Fuel Type field is required";
      isValid = false;
    }

    if (formInputs.material && formInputs.material.length > 50) {
      formErrors.material = "Enter a value that doesn't exceed 50 characters";
      isValid = false;
    }

    if (!formInputs.unitQuantityPurchase) {
      formErrors.unitQuantityPurchase = "Unit and Quantity of Purchase field is required";
      isValid = false;
    } else if (!priceRegex.test(formInputs.unitQuantityPurchase)) {
      formErrors.unitQuantityPurchase = "Enter a valid numeric value for quantity";
      isValid = false;
    } else if (Number(formInputs.unitQuantityPurchase) <= 0) {
      formErrors.unitQuantityPurchase = "Must be a valid positive number";
      isValid = false;
    }

    if (!formInputs.unitQuantitySales) {
      formErrors.unitQuantitySales = "Unit and Quantity of Sales field is required";
      isValid = false;
    } else if (!priceRegex.test(formInputs.unitQuantitySales)) {
      formErrors.unitQuantitySales = "Enter a valid numeric value for quantity";
      isValid = false;
    } else if (Number(formInputs.unitQuantitySales) <= 0) {
      formErrors.unitQuantitySales = "Must be a valid positive number";
      isValid = false;
    }

    if (formInputs.minOrderQtySupplier && !numberRegex.test(formInputs.minOrderQtySupplier)) {
      formErrors.minOrderQtySupplier = "Enter a valid numeric value";
      isValid = false;
    }

    if (!formInputs.reOrderQty) {
      formErrors.reOrderQty = "Reorder Level field is required";
      isValid = false;
    } else if (!numberRegex.test(formInputs.reOrderQty)) {
      formErrors.reOrderQty = "Enter a valid numeric value";
      isValid = false;
    } else if (Number(formInputs.reOrderQty) <= 0) {
      formErrors.reOrderQty = "Must be a valid positive number";
      isValid = false;
    }
    
    if (formInputs.warranty === "APPLICABLE") {
      if (!formInputs.warrantyPeriodValue) {
        formErrors.warrantyPeriodValue = "Warranty Period field is required";
        isValid = false;
      } else if (!numberRegex.test(formInputs.warrantyPeriodValue)) {
        formErrors.warrantyPeriodValue = "Enter a valid numeric value";
        isValid = false;
      }
    }
    
    if (formInputs.vehicleCategoryId.length === 0) {
      formErrors.vehicleCategoryId = "Vehicle Category field is required";
      isValid = false;
    }
    
    if (!formInputs.purchasePrice) {
      formErrors.purchasePrice = "Purchase Price (Rs.) field is required";
      isValid = false;
    } else if (!priceRegex.test(formInputs.purchasePrice)) {
      formErrors.purchasePrice = "Enter a valid numeric value";
      isValid = false;
    }
  
    if (!formInputs.salesPrice) {
      formErrors.salesPrice = "Sale Price - MRP (Rs.) field is required";
      isValid = false;
    } else if (!priceRegex.test(formInputs.salesPrice)) {
      formErrors.salesPrice = "Enter a valid numeric value";
      isValid = false;
    }

    // Manufactured Country (required)
    if (!formInputs.manufacturedCountry) {
      formErrors.manufacturedCountry = "Manufactured Country field is required";
      isValid = false;
    }

    // Manufactured Year (required)
    const providedYear = formInputs.year ?? formInputs.manufactureYear;
    if (providedYear === undefined || providedYear === null || providedYear === "") {
      formErrors.manufactureYear = "Manufactured Year field is required";
      isValid = false;
    } else {
      if (!numberRegex.test(String(providedYear))) {
        formErrors.manufactureYear = "Enter a valid year";
        isValid = false;
      } else {
        const y = Number(providedYear);
        const currentYear = new Date().getFullYear();
       
      }
    }

    if (!isValid) {
      setErrors(formErrors);
      notification.error({
        message: <h5>Validation failed. Ensure all fields are correct.</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5
      });
    }

    return isValid;
  };

  const [notes, setNotes] = useState([
    { id: Date.now(), content: "", attachments: [] },
  ]);
  const [savedNotes, setSavedNotes] = useState([]);

  const addNote = () => {
   /* if (hasActiveNote) return; 
    setNotes([
      ...notes,
      { id: Date.now(), content: "", attachments: [] },
    ]);
    setHasActiveNote(true);*/
    if (hasActiveNote) return; 

    const newNote = { id: crypto.randomUUID(), content: "", attachments: [] };
    setNotes([newNote]);
    setHasActiveNote(true);
    setNotesSaved(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      noteText: "",
      uploadImgPath: null,
    }));
    setIsFormModified(true);
  };

  const removeNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
    setNoteText('');
    setHasActiveNote(false);
    setNotesFile(null);
    setIsFormModified(true);
  };

  const handleChange = (e) => {
    const { name } = e.target;
    const rawValue = e.target.value;
    const isCodeField = name === "productNameCode" || name === "partPlacementCode";
    const sanitize = (v) => (v || "").replace(/[^A-Za-z0-9]/g, "");
    const value = isCodeField ? sanitize(rawValue).toUpperCase() : rawValue;
    setIsFormModified(true);
  
    // Build next state snapshot for cross-field validation
    const nextInputs = name === "partPlacement"
      ? { ...formInputs, [name]: value, partPlacementCode: null }
      : { ...formInputs, [name]: value };

    // Live validation: Part Name + Code combined
    let partNameError = "";
    let productNameCodeError = "";
    const isPartNameEmpty = !nextInputs.partName;
    const isProductNameCodeEmpty = !nextInputs.productNameCode;
    if (isPartNameEmpty && isProductNameCodeEmpty) {
      partNameError = "Part Name and Code fields are required";
    } else if (isPartNameEmpty) {
      partNameError = "Part Name field is required";
    } else if (!isProductNameCodeEmpty && nextInputs.productNameCode.length !== 4) {
      productNameCodeError = "Code must be exactly 4 characters";
    } else if (isProductNameCodeEmpty && !isPartNameEmpty) {
      productNameCodeError = "Code field is required";
    }

    // Real-time max length validation for Part Name
    if (!isPartNameEmpty && nextInputs.partName.length > 100) {
      partNameError = "Enter a value that doesn't exceed 100 characters";
    }

    // Live validation: Part Placement + Code combined (only for SPARE_PARTS)
    let partPlacementError = "";
    let partPlacementCodeError = "";
    const isSP = nextInputs.partCategory === "SPARE_PARTS";
    const isPlacementEmpty = !nextInputs.partPlacement;
    const isPlacementCodeEmpty = !nextInputs.partPlacementCode;
    if (isSP) {
      if (isPlacementEmpty && isPlacementCodeEmpty) {
        partPlacementError = "Part Placement and Code fields are required";
      } else if (isPlacementEmpty) {
        partPlacementError = "Part Placement field is required";
      } else if (!isPlacementCodeEmpty && nextInputs.partPlacementCode.length !== 3) {
        partPlacementCodeError = "Code must be exactly 3 characters";
      } else if (isPlacementCodeEmpty && !isPlacementEmpty) {
        partPlacementCodeError = "Code field is required";
      }
    } else if (!isPlacementCodeEmpty && nextInputs.partPlacementCode.length !== 3) {
      // For non SPARE_PARTS, only length rule applies if a value is present
      partPlacementCodeError = "Code must be exactly 3 characters";
    }

    // If we have an expected code from API and user provided a code, ensure they match
    if (
      !partPlacementCodeError &&
      expectedPartPlacementCode &&
      nextInputs.partPlacement &&
      nextInputs.partPlacementCode &&
      String(expectedPartPlacementCode).trim().toUpperCase() !== String(nextInputs.partPlacementCode).trim().toUpperCase()
    ) {
      partPlacementCodeError = `Part placement code is ${expectedPartPlacementCode}`;
    }

    setFormInputs((prev) => {
      let updatedInputs = { ...prev, [name]: value };
  
      if (name === "warranty" && value === "NOT_APPLICABLE") {
        updatedInputs.warrantyPeriod = null;
        updatedInputs.warrantyPeriodValue = "";
      }
      if (name === "warranty" && value === "APPLICABLE") {
        updatedInputs.warrantyPeriod = prev.warrantyPeriod || "MONTHS";
        updatedInputs.warrantyPeriodValue = prev.warrantyPeriodValue || "";
      }

      // If user edits Part Placement, clear any existing code so it doesn't mismatch
      if (name === "partPlacement") {
        updatedInputs.partPlacementCode = null;
      }
      // No auto-generation for code fields
  
      return updatedInputs;
    });

    // Reset expected code when placement changes so it re-fetches for the new value
    if (name === "partPlacement") {
      setExpectedPartPlacementCode(null);
    }

    setErrors((prev) => {
      const next = {
        ...prev,
        noteText: "",
      };

      // Only update Part Name/Code errors when editing those fields
      if (name === "partName" || name === "productNameCode") {
        next.partName = partNameError;
        next.productNameCode = productNameCodeError;
      }

      // Only update Part Placement/Code errors when editing those fields
      if (name === "partPlacement" || name === "partPlacementCode") {
        next.partPlacement = partPlacementError;
        next.partPlacementCode = partPlacementCodeError;
        // If user cleared the code and we have an expected code, do not show an inline validation message
        if (
          name === "partPlacementCode" &&
          String(value).trim().length === 0 &&
          expectedPartPlacementCode &&
          nextInputs.partPlacement
        ) {
          next.partPlacementCode = "";
        }
      }

      return next;
    });

    // If user just completed 3-char code, run async validation immediately
    if (name === "partPlacementCode" && String(value).trim().length === 3) {
      // Use the latest snapshot for placement name
      validatePartPlacementCode(nextInputs.partPlacement, value);
    }
  };  

  // Shared validator to ensure part placement code matches expected
  const validatePartPlacementCode = async (placementName, userCode) => {
    const nameTrim = (placementName || '').trim();
    const codeTrim = (userCode || '').trim().toUpperCase();
    if (!nameTrim && !codeTrim) {
      setErrors((prev) => ({ ...prev, partPlacementCode: "" }));
      return;
    }

    let expected = expectedPartPlacementCode;
    try {
      if (!expected) {
        const isVendor = portal !== 'Admin Portal';
        const res = await dispatch(fetchPartPlacementCode({ name: nameTrim, isVendor })).unwrap();
        if (typeof res === 'string') {
          expected = res;
        } else if (Array.isArray(res)) {
          expected = res[0]?.code || res[0]?.partPlacementCode || res[0]?.placementCode || null;
        } else if (res && typeof res === 'object') {
          expected = res.code || res.partPlacementCode || res.placementCode || res?.data?.code || res?.data?.partPlacementCode || null;
        }
        const normalized = String(expected || '').trim().toUpperCase();
        expected = normalized === 'N/A' || normalized === '' ? null : expected;
        setExpectedPartPlacementCode(expected || null);
      }
    } catch (err) {
      const apiMsg =
        (err && err.errors && err.errors[0]) ||
        (err && err.message) ||
        (typeof err === 'string' ? err : null) ||
        '';
      let inferred = null;
      if (typeof apiMsg === 'string') {
        const lower = apiMsg.toLowerCase();
        const key = 'correct code is';
        if (lower.includes(key)) {
          const after = apiMsg.slice(lower.indexOf(key) + key.length);
          inferred = after.replace(/[:\s]/, '').trim();
        }
      }
      if (inferred) {
        expected = inferred;
        setExpectedPartPlacementCode(inferred);
        setErrors((prev) => ({ ...prev, partPlacementCode: `Part placement code is ${inferred}` }));
      } else {
        expected = null;
      }
    }

    // Auto-fill the field with expected code instead of showing inline error
    if (expected) {
      const expUpper = String(expected).trim().toUpperCase();
      if (codeTrim.length === 0 || expUpper !== codeTrim) {
        setFormInputs((prev) => ({ ...prev, partPlacementCode: expected }));
      }
      setErrors((prev) => ({ ...prev, partPlacementCode: "" }));
      return;
    }
    // No expected code: keep/present required error for SPARE_PARTS when placement exists and code is empty
    if (
      formInputs.partCategory === "SPARE_PARTS" &&
      formInputs.partPlacement && 
      formInputs.partPlacement.trim().length > 0 &&
      (!formInputs.partPlacementCode || formInputs.partPlacementCode.trim().length === 0)
    ) {
      setErrors((prev) => ({ ...prev, partPlacementCode: "Code field is required" }));
    } else {
      setErrors((prev) => ({ ...prev, partPlacementCode: "" }));
    }
  };

  const handlePartPlacementBlur = async () => {
    const placementName = (formInputs.partPlacement || '').trim();
    if (!placementName) return;
    try {
      await validatePartPlacementCode(placementName, formInputs.partPlacementCode);
      const isVendor = portal !== 'Admin Portal';
      const res = await dispatch(fetchPartPlacementCode({ name: placementName, isVendor })).unwrap();
      let code = null;
      if (typeof res === 'string') {
        code = res;
      } else if (Array.isArray(res)) {
        code = res[0]?.code || res[0]?.partPlacementCode || res[0]?.placementCode || null;
      } else if (res && typeof res === 'object') {
        code = res.code || res.partPlacementCode || res.placementCode || res?.data?.code || res?.data?.partPlacementCode || null;
      }
      const normalized = (code || '').trim().toUpperCase();
      const effective = normalized === 'N/A' || normalized === '' ? null : code;
      setExpectedPartPlacementCode(effective);
      // Auto-fill the code field if we have an expected code
      if (effective) {
        const currentUpper = String(formInputs.partPlacementCode || '').trim().toUpperCase();
        const effUpper = String(effective).trim().toUpperCase();
        if (currentUpper !== effUpper) {
          setFormInputs((prev) => ({ ...prev, partPlacementCode: effective }));
        }
        setErrors((prev) => ({ ...prev, partPlacementCode: "" }));
      } else {
        // No effective expected: if Spare Parts and code empty, keep required error visible
        if (
          formInputs.partCategory === "SPARE_PARTS" &&
          formInputs.partPlacement && 
          formInputs.partPlacement.trim().length > 0 &&
          (!formInputs.partPlacementCode || formInputs.partPlacementCode.trim().length === 0)
        ) {
          setErrors((prev) => ({ ...prev, partPlacementCode: "Code field is required" }));
        } else {
          setErrors((prev) => ({ ...prev, partPlacementCode: "" }));
        }
      }
    } catch (err) {
      const apiMsg =
        (err && err.errors && err.errors[0]) ||
        (err && err.message) ||
        (typeof err === 'string' ? err : null) ||
        'Failed to fetch placement code';
      let inferred = null;
      if (typeof apiMsg === 'string') {
        const lower = apiMsg.toLowerCase();
        const key = 'correct code is';
        if (lower.includes(key)) {
          const after = apiMsg.slice(lower.indexOf(key) + key.length);
          inferred = after.replace(/[:\s]/, '').trim();
        }
      }
      if (inferred) {
        setExpectedPartPlacementCode(inferred);
        setFormInputs((prev) => ({ ...prev, partPlacementCode: inferred }));
        setErrors((prev) => ({ ...prev, partPlacementCode: "" }));
      }
      // If nothing inferred, avoid setting any raw server text to prevent flashing
    }
  };

  const handlePartPlacementCodeBlur = async () => {
    await validatePartPlacementCode(formInputs.partPlacement, formInputs.partPlacementCode);
  };

  const handleSparePartImageUpload = async (selectedFile) => {
    if (!selectedFile) return;
    setUploadError('');
    setUploadErrorDescription('');
    setIsImgLoading(true);

    const formData = new FormData();
    formData.append('files', selectedFile);

    try {
      const result = await dispatch(uploadSparePartImage({ formData, primaryId })).unwrap();
      if (result) {
        setFormInputs((prevState) => ({
          ...prevState,
          uploadImgPath: result,
        }));
        setIsFormModified(true);
      }
    } catch (error) {
      const errorDetails =
        (error.errors && error.errors.join(', ')) || "An unknown error occurred.";
  
      setUploadError('Upload failed');
      setUploadErrorDescription(errorDetails);
    } finally {
      setIsImgLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    setUploadError('');
    setUploadErrorDescription('');
    try {
        await dispatch(deleteSparePartNote(id)).unwrap();
        setSavedNotes((prevNotes) => prevNotes.filter(note => note.id !== id));
        setFormInputs((prevState) => ({
          ...prevState,
          sparePartsNotesList: prevState.sparePartsNotesList.filter(noteId => noteId !== id),
        }));
        setIsFormModified(true);
    } catch (error) {
        notification.error({
          message: <h5>{error}</h5>,
          icon: <img src={Icons.error} alt="Error" />,
          duration: 5,
        });
    }
  };

  const saveNotes = async () => {
    setIsNotesLoading(true);
    setUploadError('');
    setUploadErrorDescription('');

    let validationErrors = {};

    if (noteText.length > 500) {
      validationErrors.noteText = "Enter a value that doesn't exceed 500 characters";
      setErrors((prevErrors) => ({
        ...prevErrors,
        ...validationErrors,
      }));
      setIsNotesLoading(false);
      return;
    }

    if (!noteText.trim() && (!notesFile || notesFile.length === 0)) {
      validationErrors.uploadImgPath = "Please enter a note or upload an attachment.";
      setErrors((prevErrors) => ({
        ...prevErrors,
        ...validationErrors,
      }));
      setIsNotesLoading(false);
      return;
    }
  
    let uploadedFilePaths = [];
  
    try {
      if (notesFile && notesFile.length > 0) {
        const formData = new FormData();
        notesFile.forEach((f) => formData.append('files', f));
  
        const uploadResult = await dispatch(uploadSparePartNoteFile({ formData, primaryId })).unwrap();
  
        uploadedFilePaths = uploadResult;
      }
  
      const noteData = {
        note: noteText,
        serviceAttachments: uploadedFilePaths.map(path => ({ attachmentPath: path })),
      };
  
      const noteResponse = await dispatch(saveSparePartNote(noteData)).unwrap();
      setFormInputs((prevState) => ({
        ...prevState,
        sparePartsNotesList: [
          ...prevState.sparePartsNotesList,
          noteResponse.id
        ]
      }));

      setSavedNotes((prevNotes) => [
        ...prevNotes,
        {
          id: noteResponse.id,
          text: noteText,
          attachments: uploadedFilePaths.length > 0 
          ? uploadedFilePaths.map(path => {
              const fileName = path.split('/').pop();
              return {
                name: fileName,
                path, 
                type: getFileType(fileName) 
              };
            })
          : [],
          addedDate: format(new Date(), "yyyy-MM-dd"),
          addedTime: format(new Date(), "HH:mm:ss"),
        }
      ]);
      setNotesSaved(true);  
      setNotesFile(null);
      setNotes([]);
      setNoteText('');
      setHasActiveNote(false);
      setIsFormModified(true);
    } catch (error) {
        notification.error({
          message: <h5>{error}</h5>,
          icon: <img src={Icons.error} alt="Error" />,
          duration: 5,
        });
    } finally {
      setIsNotesLoading(false);
    }
  };  

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const filteredVehicleCategoryId = (formInputs.vehicleCategoryId || []).filter((val) => val !== "all");

    // Update formInputs with the filtered values (without "all")
    const updatedFormInputs = {
      ...formInputs,
      vehicleCategoryId: filteredVehicleCategoryId,
    };
  
    if ((noteText.trim() || (notesFile && notesFile.length > 0)) && notesSaved === false) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        uploadImgPath: "Please save the note before adding the spare part.",
      }));
  
      notification.error({
        message: <h5>Validation failed. Ensure all fields are correct.</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });

      return;
    }
    const valid = handleValidation();
    if (valid) {
      setIsLoading(true);
      try {
        const dataToSend = {
          ...updatedFormInputs,
          manufactureYear: formInputs.year || updatedFormInputs.manufactureYear,
          manufacturedCountry: updatedFormInputs.manufacturedCountry,
          manufactureCountryId: updatedFormInputs.manufactureCountryId,
        };
        dataToSend.partPlacement = (updatedFormInputs.partPlacement || "").trim() === "" ? null : updatedFormInputs.partPlacement;
        dataToSend.partPlacementCode = (updatedFormInputs.partPlacementCode || "").trim() === "" ? null : updatedFormInputs.partPlacementCode;
        dataToSend.description = (updatedFormInputs.description || "").trim() === "" ? null : updatedFormInputs.description;
        dataToSend.material = (updatedFormInputs.material || "").trim() === "" ? null : updatedFormInputs.material,
        delete dataToSend.year;
        const resultAction = await dispatch(saveSparePart(dataToSend));
        if (saveSparePart.fulfilled.match(resultAction)) {
          navigate("/app/spare-parts-management");
          notification.success({
            message: <h5>Spare Part added successfully!</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5
          });
        } else if (resultAction.payload?.errors) {
          const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
            if (error.includes("Part Number")) {
              acc.partNumber = error;
            }
            if (error.includes("Part Name")) {
              acc.partName = error;
            }
            if (error.includes("Part Category")) {
              acc.partCategory = error;
            }
            if (error.includes("Description")) {
              acc.description = error;
            }
            if (error.includes("Variation")) {
              acc.variationId = error;
            }
            if (error.includes("Material")) {
              acc.material = error;
            }
            if (error.includes("Unit Quantity Purchase")) {
              acc.unitQuantityPurchase = error;
            }
            if (error.includes("Purchase quantity")) {
              acc.unitQuantityPurchase = error;
            }
            if (error.includes("Purchase quantity unit ")) {
              acc.unitQuantityPurchaseUnit = error;
            }
            if (error.includes("Sales quantity unit")) {
              acc.unitQuantitySalesUnit = error;
            }
            if (error.includes("Unit Quantity Sales")) {
              acc.unitQuantitySales = error;
            }
            if (error.includes("Sales quantity")) {
              acc.unitQuantitySales = error;
            }
            if (error.includes("Min Order Qty Supplier")) {
              acc.minOrderQtySupplier = error;
            }
            if (error.includes("Re Order Qty")) {
              acc.reOrderQty = error;
            }
            if (error.includes("Warranty")) {
              acc.warranty = error;
            }
            if (error.includes("Warranty Period")) {
              acc.warrantyPeriod = error;
            }
            if (error.includes("Warranty Period Value")) {
              acc.warrantyPeriodValue = error;
            }
            if (error.includes("Warranty Period")) {
              acc.warrantyPeriod = error;
            }
            if (error.includes("vehicle make")) {
              acc.vehicleMakelId = error;
            }
            if (error.includes("One or more vehicle model(s) does not match with vehicle make")) {
              acc.vehicleModelId = error;
            }
            if (error.includes("Purchase Price")) {
              acc.purchasePrice = error;
            }
            if (error.includes("Sales Price")) {
              acc.salesPrice = error;
            }
            if (error.includes("Spare Parts Primary Identifier")) {
              acc.sparePartsPrimaryIdentifier = error;
            }
            if (error.includes("Spare parts note not saved")) {
              acc.notes = error;
            }
            if (error.toLowerCase().includes("manufactured country")) {
              acc.manufacturedCountry = error;
            }
            if (error.toLowerCase().includes("manufactured year")) {
              acc.manufactureYear = error;
            }
            return acc;
          }, {});
  
          setErrors((prevErrors) => ({
            ...prevErrors,
            ...apiErrors,
          }));
  
          notification.error({
            message: <h5>Validation failed. Ensure all fields are correct.</h5>,
            icon: <img src={Icons.error} alt="Error" />,
            duration: 5,
          });
        } else {
          setErrorIcon(Icons.error_email);
          setErrorTitle("Failed to update data.");
          setError(resultAction.payload);
          setShowPopup(true);
        }
      } catch (error) {
        setErrorIcon(Icons.error_email);
        setErrorTitle("Failed to update data.");
        setError(error.message);
        setShowPopup(true);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const onUpdate = async (e) => {
    e.preventDefault();
    setErrors({});
    if ((noteText.trim() || (notesFile && notesFile.length > 0)) && notesSaved === false) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        uploadImgPath: "Please save the note before adding the spare part.",
      }));
  
      notification.error({
        message: <h5>Validation failed. Ensure all fields are correct.</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });

      return;
    }
    const valid = handleValidation();
    if (valid) {
      setIsLoading(true);
      try {
        let dataToSend = {
          id: formInputs.id,
          partCategory: formInputs.partCategory,
          partName: formInputs.partName,
          productNameCode: formInputs.productNameCode,
          partPlacement: (formInputs.partPlacement || "").trim() === "" ? null : formInputs.partPlacement,
          partPlacementCode: (formInputs.partPlacementCode || "").trim() === "" ? null : formInputs.partPlacementCode,
          partNumber: formInputs.partNumber,
          description: (formInputs.description || "").trim() === "" ? null : formInputs.description,
          variationId: formInputs.variationId,
          material: (formInputs.material || "").trim() === "" ? null : formInputs.material,
          unitQuantityPurchase: formInputs.unitQuantityPurchase,
          unitQuantityPurchaseUnit: formInputs.unitQuantityPurchaseUnit,
          unitQuantitySalesUnit: formInputs.unitQuantitySalesUnit,
          unitQuantitySales: formInputs.unitQuantitySales,
          uploadImgPath: formInputs.uploadImgPath	,
          minOrderQtySupplier: formInputs.minOrderQtySupplier,
          reOrderQty: formInputs.reOrderQty,
          warranty: formInputs.warranty,
          warrantyPeriod: formInputs.warrantyPeriod,
          warrantyPeriodValue: formInputs.warrantyPeriodValue,
          vehicleCategoryId: formInputs.vehicleCategoryId.filter((val) => val !== "all"),
          vehicleMakeId: formInputs.vehicleMakeId,
          vehicleModelId: formInputs.vehicleModelId,
          manufacturedCountry: formInputs.manufacturedCountry,
          manufactureYear: formInputs.year || formInputs.manufactureYear,
          manufactureCountryId: formInputs.manufactureCountryId,
          fuelTypeId: formInputs.fuelTypeId,
          purchasePrice: formInputs.purchasePrice,
          salesPrice: formInputs.salesPrice,
          stockStatus: formInputs.stockStatus || "IN_STOCK",
          status: true,
          sparePartsNotesList: formInputs.sparePartsNotesList
        };
        if(portal!=='Admin Portal'){
        const resultAction = await dispatch(updateSparePart(dataToSend));
        if (updateSparePart.fulfilled.match(resultAction)) {
          navigate("/app/spare-parts-management");
          notification.success({
            message: <h5>Updated successfully!</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5,
          });}
          else if (resultAction.payload?.errors) {
            const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
              if (error.includes("SKU Code") || error.includes("SKU")) {
                acc.skuCode = error;
              }
              if (error.includes("Part Number")) {
                acc.partNumber = error;
              }
              if (error.includes("Part Name")) {
                acc.partName = error;
              }
              if (error.includes("Part Category")) {
                acc.partCategory = error;
              }
              if (error.includes("Description")) {
                acc.description = error;
              }
              if (error.includes("Variation")) {
                acc.variationId = error;
              }
              if (error.includes("Material")) {
                acc.material = error;
              }
              if (error.includes("Unit Quantity Purchase")) {
                acc.unitQuantityPurchase = error;
              }
              if (error.includes("Purchase quantity unit ")) {
                acc.unitQuantityPurchaseUnit = error;
              }
              if (error.includes("Sales quantity unit")) {
                acc.unitQuantitySalesUnit = error;
              }
              if (error.includes("Unit Quantity Sales")) {
                acc.unitQuantitySales = error;
              }
              if (error.includes("Min Order Qty Supplier")) {
                acc.minOrderQtySupplier = error;
              }
              if (error.includes("Re Order Qty")) {
                acc.reOrderQty = error;
              }
              if (error.includes("Warranty")) {
                acc.warranty = error;
              }
              if (error.includes("Warranty Period")) {
                acc.warrantyPeriod = error;
              }
              if (error.includes("Warranty Period Value")) {
                acc.warrantyPeriodValue = error;
              }
              if (error.includes("Warranty Period")) {
                acc.warrantyPeriod = error;
              }
              if (error.includes("One or more vehicle model(s) does not match with vehicle make")) {
                acc.vehicleModelId = error;
              }
              if (error.includes("Purchase Price")) {
                acc.purchasePrice = error;
              }
              if (error.includes("Sales Price")) {
                acc.salesPrice = error;
              }
              if (error.includes("Spare Parts Primary Identifier")) {
                acc.sparePartsPrimaryIdentifier = error;
              }
              return acc;
            }, {});
    
            setErrors((prevErrors) => ({
              ...prevErrors,
              ...apiErrors,
            }));
    
            notification.error({
              message: <h5>Validation failed. Ensure all fields are correct.</h5>,
              icon: <img src={Icons.error} alt="Error" />,
              duration: 5,
            });
          } else {
            setErrorIcon(Icons.error_email);
            setErrorTitle("Failed to update data.");
            setError(resultAction.payload);
            setShowPopup(true);
          }
        }else{
          const adminSparePartUpdateData={
            id: formInputs.id,
            description: (formInputs.description || "").trim() === "" ? null : formInputs.description,
            material: formInputs.material,
            unitQuantityPurchase: formInputs.unitQuantityPurchase,
            unitQuantitySales: formInputs.unitQuantitySales,
            variationId: formInputs.variationId,
            purchasePrice: formInputs.purchasePrice ,
            salesPrice: formInputs.salesPrice,
            minOrderQtySupplier: formInputs.minOrderQtySupplier,
          }
          const resultAction = await dispatch(updateAdminSparePart(adminSparePartUpdateData));
          if (updateAdminSparePart.fulfilled.match(resultAction)) {
            navigate("/app/spare-parts-management");
            notification.success({
              message: <h5>Updated successfully!</h5>,
              icon: <img src={Icons.check} alt="Success" />,
              duration: 5,
            });
          } else {
            setErrorIcon(Icons.error_email);
            setErrorTitle("Failed to update data.");
            setError(resultAction.payload);
            setShowPopup(true);
          }
        }
      } catch (error) {
        setErrorIcon(Icons.error_email);
        setErrorTitle("Failed to update data.");
        setError(error.message);
        setShowPopup(true);
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <>
    <div className="form-container vendor-spare-part-form">
      <div className="form-header">
        <div className="back">
          <Link to="/app/spare-parts-management" id="spare-part-details-back">
            <img src={Icons.arrow_left} alt="Back Icon" />
          </Link>
          <h3>{isEdit ? "Edit Spare Part" : "Add New Spare Part"}</h3>
        </div>
        <Link to="/app/spare-parts-management/bulk-upload">
          <button className="button form-button" id="sparepart-upload-bulk">
            <img src={Icons.upload} alt="Upload Icon" />
            <span>Upload Bulk</span>
          </button>
        </Link>
      </div>
      <Form className="form" layout="vertical">
        <div className="form-section">
          <h3 className="form-header admin-service">
            Spare Parts Details
          </h3>
          <div className="form-row">
            <div className="form-item">
              <RadioSelect
                options={partCategoryOptions}
                placeholderText="Select part category"
                name="partCategory"
                id="part-category"
                value={formInputs.partCategory} 
                isValid={errors["partCategory"] ? "invalid" : ""}
                disabled={portal==='Admin Portal'} 
                onChange={(selectedValue) => {
                  setFormInputs((prev) => ({
                    ...prev,
                    partCategory: selectedValue.value,
                  }));
                  setErrors((prev) => ({
                    ...prev,
                    partCategory: "",
                  }));
                  setIsFormModified(true);
                }}
              />
              <label className="form-label required" htmlFor="part-category">
                <h4>Part Category</h4>
              </label>
              {errors.partCategory && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.partCategory}</h6>
                </div>
              )}
            </div>
            <div className={`form-item ${portal==='Admin Portal'?'disabled-form-item':''}`}>
               <div className="group-input-wrapper partname-wrapper">
                <input type="text" name="partName" id="part-name" placeholder="Enter part name" disabled={portal==='Admin Portal'} value={formInputs.partName} onChange={(e) => handleChange(e)} autoComplete="off" className={`required ${errors["partName"] || (errors["partName"] && !formInputs.partName && !formInputs.productNameCode) ? "invalid" : ""}`} />
                  <input
                  disabled={portal==='Admin Portal'}
                      type="text"
                      name="productNameCode"
                      placeholder="Code"
                      id="part-name-code"
                      value={formInputs.productNameCode}
                      onChange={(e) => handleChange(e)}
                      autoComplete="off"
                      maxLength={4}
                      className={`${(errors["productNameCode"] || (errors["partName"] && !formInputs.partName && !formInputs.productNameCode)) ? "invalid" : ""}`}
                    />
                  </div>
              <label className="form-label" htmlFor="part-name">
                <h4>Part Name</h4>
              </label>
              {errors.partName && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.partName}</h6>
                </div>
              )}
              {errors.productNameCode && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.productNameCode}</h6>
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className={`form-item ${portal==='Admin Portal'?'disabled-form-item':''}`}>
                <div className="group-input-wrapper partname-wrapper">
                  <input
                    type="text"
                    name="partPlacement"
                    id="part-placement"
                    placeholder="Enter part placement"
                    disabled={portal==='Admin Portal'}
                    value={formInputs.partPlacement}
                    onChange={(e) => handleChange(e)}
                    onBlur={handlePartPlacementBlur}
                    autoComplete="off"
                    className={`${errors["partPlacement"] ? "invalid" : ""}`}
                  />
                  <input
                    type="text"
                    name="partPlacementCode"
                    disabled={portal==='Admin Portal'}
                    placeholder="Code"
                    id="part-placement-code"
                    value={formInputs.partPlacementCode || ""}
                    onChange={(e) => handleChange(e)}
                    onBlur={handlePartPlacementCodeBlur}
                    autoComplete="off"
                    maxLength={3}
                    className={`${(errors["partPlacementCode"] || (errors["partPlacement"] === "Part Placement and Code fields are required" && !formInputs.partPlacementCode && formInputs.partCategory === "SPARE_PARTS")) ? "invalid" : ""}`}
                  />
                </div>
                <label className={`form-label ${formInputs.partCategory === "SPARE_PARTS" ? "required" : ""}`} htmlFor="part-placement">
                  <h4>Part Placement</h4>
                </label>
                {errors.partPlacement && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.partPlacement}</h6>
                  </div>
                )}
                {errors.partPlacementCode && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.partPlacementCode}</h6>
                  </div>
                )}
              </div>
            <div className={`form-item ${portal==='Admin Portal'?'disabled-form-item':''}`}>
              <input type="text" name="partNumber" id="part-number" disabled={portal==='Admin Portal'} value={formInputs.partNumber} className={`required ${errors["partNumber"] ? "invalid" : ""}`} onChange={(e) => handleChange(e)} autoComplete="off" />
              <label className="form-label" htmlFor="part-number">
                <h4>Part Number</h4>
              </label>
              {errors.partNumber && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.partNumber}</h6>
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className={`form-item ${portal==='Admin Portal'?'disabled-form-item':''}`}>
              <CustomRadioSelect
                options={countryOptions}
                key={formInputs.manufactureCountryId}
                placeholderText="Select country"
                required
                id="manufacture-country"
                name="manufactureCountryId"
                value={formInputs.manufactureCountryId}
                disabled={portal==='Admin Portal'}
                isValid={errors["manufacturedCountry"] ? "invalid" : ""}
                onChange={(selected) => {
                  setFormInputs((prev) => ({
                    ...prev,
                    manufactureCountryId: selected?.value,
                    manufacturedCountry: selected?.label,
                  }));
                  setErrors((prev) => ({
                    ...prev,
                    manufacturedCountry: "",
                  }));
                  setIsFormModified(true);
                }}
              />
              <label className="form-label" htmlFor="manufactured-country">
                <h4>Manufactured Country</h4>
              </label>
              {errors.manufacturedCountry && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.manufacturedCountry}</h6>
                </div>
              )}
            </div>
            <div className={`form-item ${portal==='Admin Portal'?'disabled-form-item':''}`}>
              <div className="position-relative datepicker p-0 year-picker">
                  <ReactDatePicker
                    className="year-picker"
                    id="year"
                    disabled={portal==='Admin Portal'}
                    placeholderText="Select manufactured year"
                    required={true}
                    name="year"
                    defaultDate={
                      formInputs.year ? new Date(formInputs.year, 0, 1) : null
                    }
                    yearOnly={true}
                    maxDate={new Date()}
                    onChangeDate={(selectedDate) => {
                          if (
                            !selectedDate ||
                            isNaN(new Date(selectedDate).getTime())
                          ) {
                            setFormInputs((prev) => ({
                              ...prev,
                              year: null,
                            }));

                            setErrors((prev) => ({
                              ...prev,
                              year: "Year field is required",
                            }));
                            setIsFormModified(true);
                            return;
                          }

                          const selectedYear = new Date(
                            selectedDate
                          ).getFullYear();
                          setFormInputs((prev) => ({
                            ...prev,
                            year: selectedYear,
                            manufactureYear: String(selectedYear),
                          }));

                          setErrors((prev) => ({
                            ...prev,
                            manufactureYear: "",
                          }));
                          setIsFormModified(true);
                        }}
                  />
                  <img
                    src={Icons.calendar}
                    alt="Calendar Icon"
                    className="input-icon"
                  />
                </div>
              <label className="form-label required" htmlFor="year">
                <h4>Manufactured Year</h4>
              </label>
              {errors.manufactureYear && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.manufactureYear}</h6>
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-item form-item__full">
              <textarea name="description" id="description" onChange={(e) => handleChange(e)} value={formInputs.description}  />
              <label className="form-label" htmlFor="description">
                <h4>Description</h4>
              </label>
              {errors.description && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.description}</h6>
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-item">
            <FormMultipleSelect
              options={variationOptions}
              placeholderText="Select a variation"
              required={true}
              id="variation"
              value={formInputs.variationId}
              isValid={errors["variationId"] ? "invalid" : ""}
              onChange={(selectedValues) => {
                const isNASelected = selectedValues.some((val) =>
                  variationOptions.find((opt) => opt.value === val)?.label === "N/A"
                );
                const wasNASelectedPreviously = formInputs.variationId.some((val) =>
                  variationOptions.find((opt) => opt.value === val)?.label === "N/A"
                );

                if (isNASelected && !wasNASelectedPreviously) {
                  
                  setFormInputs((prev) => ({
                    ...prev,
                    variationId: variationOptions
                      .filter((opt) => opt.label === "N/A")
                      .map((opt) => opt.value),
                  }));
                } else if (!isNASelected && wasNASelectedPreviously) {
                  
                  setFormInputs((prev) => ({
                    ...prev,
                    variationId: selectedValues.filter((val) =>
                      variationOptions.find((opt) => opt.value === val)?.label !== "N/A"
                    ),
                  }));
                } else {
                  
                  setFormInputs((prev) => ({
                    ...prev,
                    variationId: selectedValues.filter((val) =>
                      variationOptions.find((opt) => opt.value === val)?.label !== "N/A"
                    ),
                  }));
                }

                setErrors((prev) => ({
                  ...prev,
                  variationId: "",
                }));
                setIsFormModified(true);
              }}
              />
              <label className="form-label" htmlFor="variation">
                <h4>Variation</h4>
              </label>
              {errors.variationId && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.variationId}</h6>
                </div>
              )}
            </div>
            <div className="form-item">
              <input type="text" name="material" id="material" value={formInputs.material} onChange={(e) => handleChange(e)} autoComplete="off" />
              <label className="form-label" htmlFor="material">
                <h4>Material</h4>
              </label>
              {errors.material && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.material}</h6>
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-item">
              <div className="group-input-wrapper">
                <input type="text" name="unitQuantityPurchase" value={formInputs.unitQuantityPurchase} id="purchase-quanity" className={`required ${errors["unitQuantityPurchase"] ? "invalid" : ""}`} onChange={(e) => handleChange(e)} autoComplete="off" />
                <CustomOptionsSelect
                  options={unitOptions}
                  modalTitle="Add Unit of Purchase"
                  formFieldLabel="Add Unit of Purchase"
                  formPlaceholderText="Enter unit of purchase"
                  buttonText="Add Unit"
                  listTitle="Unit"
                  disabled={portal==='Admin Portal'} 
                  defaultValue={unitOptions[0]}
                  id="purchase-unit-option"
                  value={
                    unitOptions.find(option => option.value === formInputs.unitQuantityPurchaseUnit) || unitOptions[0]
                  }
                  onAddFormData={handleAddUnitValue} 
                  onChange={(selected) => {
                    setFormInputs((prev) => ({
                      ...prev,
                      unitQuantityPurchaseUnit: selected.value,
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      unitQuantityPurchase: "",
                    }));
                    setIsFormModified(true);
                  }}
                  addModalMaxLength={10}
                  addModalMaxLengthErrorMessage="Add Unit of Purchase"
                />
              </div>
              <label className="form-label" htmlFor="unit-purchase">
                <h4>Unit and Quantity of Purchase</h4>
              </label>
              {errors.unitQuantityPurchase && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.unitQuantityPurchase}</h6>
                </div>
              )}
              {errors.unitQuantityPurchaseUnit && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.unitQuantityPurchaseUnit}</h6>
                </div>
              )}
            </div>
            <div className="form-item">
              <div className="group-input-wrapper">
                <input type="text" name="unitQuantitySales" value={formInputs.unitQuantitySales} id="sales-quanity" className={`required ${errors["unitQuantitySales"] ? "invalid" : ""}`} onChange={(e) => handleChange(e)} autoComplete="off" />
                <CustomOptionsSelect
                  options={unitOptions}
                  modalTitle="Add Unit of Sales"
                  formFieldLabel="Add Unit of Sales"
                  formPlaceholderText="Enter unit of sales"
                  buttonText="Add Unit"
                  listTitle="Unit"
                  id="sales-unit-option"
                  defaultValue={unitOptions[0]}
                  value={
                    unitOptions.find(option => option.value === formInputs.unitQuantitySalesUnit) || unitOptions[0]
                  }
                  onAddFormData={handleAddUnitValue} 
                  disabled={portal==='Admin Portal'} 
                  onChange={(selected) => {
                    setFormInputs((prev) => ({
                      ...prev,
                      unitQuantitySalesUnit: selected.value,
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      unitQuantitySales: "",
                    }));
                    setIsFormModified(true);
                  }}
                />
              </div>
              <label className="form-label" htmlFor="unit">
                <h4>Unit and Quantity of Sales</h4>
              </label>
              {errors.unitQuantitySales && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.unitQuantitySales}</h6>
                </div>
              )}
              {errors.unitQuantitySalesUnit && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.unitQuantitySalesUnit}</h6>
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-item">
              <input type="text" name="minOrderQtySupplier" value={formInputs.minOrderQtySupplier} id="min-order-quantity" onChange={(e) => handleChange(e)} autoComplete="off" />
              <label className="form-label" htmlFor="min-order-quantity">
                <h4>Minimum Order Quantity - Supplier</h4>
              </label>
              {errors.minOrderQtySupplier && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.minOrderQtySupplier}</h6>
                </div>
              )}
            </div>
            <div className={`form-item ${portal==='Admin Portal'?'disabled-form-item':''}`}>
              <input type="text" name="reOrderQty" id="reorder-level" disabled={portal==='Admin Portal'} value={formInputs.reOrderQty} className={`required ${errors["reOrderQty"] ? "invalid" : ""}`} onChange={(e) => handleChange(e)} autoComplete="off" />
              <label className="form-label" htmlFor="reorder-level">
                <h4>Reorder Level</h4>
              </label>
              {errors.reOrderQty && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.reOrderQty}</h6>
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className={`form-item ${portal==='Admin Portal'?'disabled-form-item':''}`}>
              <div className="radio-input-wrapper">
                <div className="radio-wrapper">
                  <input type="radio" name="warranty" id="applicable" disabled={portal==='Admin Portal'} value="APPLICABLE" checked={formInputs.warranty === "APPLICABLE"} className={`required ${errors["warranty"] ? "invalid" : ""}`} onChange={(e) => handleChange(e)} />
                  <label className="radio-label" htmlFor="applicable">
                    Applicable
                  </label>
                </div>
                <div className="radio-wrapper">
                  <input type="radio" name="warranty" id="not-applicable" disabled={portal==='Admin Portal'} value="NOT_APPLICABLE" checked={formInputs.warranty === "NOT_APPLICABLE"} onChange={(e) => handleChange(e)} />
                  <label className="radio-label" htmlFor="not-applicable">
                    Not Applicable
                  </label>
                </div>
              </div>
              <label className="form-label" htmlFor="applicable">
                <h4>Warranty</h4>
              </label>
              {errors.warranty && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.warranty}</h6>
                </div>
              )}
            </div>
            {formInputs.warranty === "APPLICABLE" && (
            <div className={`form-item ${portal==='Admin Portal'?'disabled-form-item':''}`}>
              <div className="group-input-wrapper">
                <input type="text" name="warrantyPeriodValue" disabled={portal==='Admin Portal'} value={formInputs.warrantyPeriodValue} id="warranty-period" className={`required ${errors["warrantyPeriodValue"] ? "invalid" : ""}`} onChange={(e) => handleChange(e)} autoComplete="off" />
                <RadioSelect
                  options={warrantyPeriodOptions}
                  defaultValue={warrantyPeriodOptions[0]}
                  value={formInputs.warrantyPeriod}
                  disabled={portal==='Admin Portal'}
                  id="warranty-period-option"
                  onChange={(selected) =>
                    setFormInputs((prev) => ({
                      ...prev,
                      warrantyPeriod: selected.value ,
                    }))
                  }
                />
              </div>
              <label className="form-label" htmlFor="warranty-period">
                <h4>Warranty Period</h4>
              </label>
              {errors.warrantyPeriodValue && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.warrantyPeriodValue}</h6>
                </div>
              )}
            </div>
             )}
          </div>
          <div className="form-row">
            <div className={`form-item ${portal==='Admin Portal'?'disabled-form-item':''}`}>
              <CustomMultipleSelect
                options={vehicleCategoryOptions}
                className="required"
                id="vehicle-category-options"
                placeholderText="Select vehicle category"
                modalTitle="Add Vehicle Category"
                formFieldLabel="Add Vehicle Category"
                formPlaceholderText="Enter vehicle category"
                buttonText="Add Vehicle Category"
                listTitle="Vehicle Categories"
                extraFieldEnabled={true}
                extraFieldLabel="Add Vehicle Category Code"
                extraFieldPlaceholder="Enter vehicle category code"
                value={formInputs.vehicleCategoryId}
                isValid={errors["vehicleCategoryId"] ? "invalid" : ""}
                onAddFormData={handleAddCategoryValue} 
                onChange={handleCategoryChange}
                disabled={portal==='Admin Portal'} 
              />
              <label className="form-label required" htmlFor="vehicle-category">
                <h4>Vehicle Category</h4>
              </label>
              {errors.vehicleCategoryId && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.vehicleCategoryId}</h6>
                </div>
              )}
            </div>
            <div className={`form-item ${portal==='Admin Portal'?'disabled-form-item':''}`}>
              <CustomGroupSelect
                groupedOptions={vehicleMakeOptions}
                dropdownPlaceholderText="Select vehicle make"
                id="vehicle-make-options"
                modalDropdownPlaceholderText="Select make category"
                selectOptions={vehicleMakeCategoryLists}
                value={formInputs.vehicleMakeId}
                extraFieldEnabled={true}
                extraFieldLabel="Vehicle Make Code"
                extraFieldPlaceholder="Enter vehicle make code"
                onChange={(selectedValues) => {
                  setFormInputs((prev) => ({
                    ...prev,
                    vehicleMakeId: selectedValues || [],
                    vehicleModelId: (prev.vehicleModelId || []).filter((modelId) =>
                      allVehicleModels.some((option) =>
                        option.vehicleMake.some((make) =>
                          selectedValues.includes(make.vehicleMakeId) &&
                          make.vehicleModel.some((model) => model.vehicleModelId === modelId)
                        )
                      )
                    ),
                  }));
                  setSelectedVehicleMakeIds(selectedValues || []);
                  setIsFormModified(true);
                }}
                onAddFormData={handleAddMakeValue}
                type="make"
                disabled={portal==='Admin Portal'}
              />
              <label className={`form-label ${formInputs.partCategory === "SPARE_PARTS" ? "required" : ""}`} htmlFor="vehicle-make">
                <h4>Vehicle Make</h4>
              </label>
              {errors.vehicleMakeId && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.vehicleMakeId}</h6>
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className={`form-item ${!formInputs.vehicleMakeId || formInputs.vehicleMakeId.length === 0 ? "disabled-form-item" : ""}`}>
              <CustomSubGroupSelect
                options={vehicleModelOptions}
                id="vehicle-model-options"
                placeholderText={vehicleModelLoading ? "Loading..." : "Select model"}
                selectOptions={vehicleMakeLists}
                value={formInputs.vehicleModelId}
                disabled={!formInputs.vehicleMakeId || formInputs.vehicleMakeId.length === 0 || portal==='Admin Portal'}
                extraFieldEnabled={true}
                extraFieldLabel="Vehicle Model Code"
                extraFieldPlaceholder="Enter vehicle model code"
                onChange={(selectedValues) => {
                  setFormInputs((prev) => ({
                    ...prev,
                    vehicleModelId: selectedValues || [],
                  }));
                  setErrors((prev) => ({
                    ...prev,
                    vehicleModelId: "",
                  }));
                  setIsFormModified(true);
                }}
                onAddFormData={handleAddModelValue} 
                type="model"
              />
              <label className={`form-label ${formInputs.partCategory === "SPARE_PARTS" ? "required" : ""}`} htmlFor="vehicle-model">
                <h4>Vehicle Model</h4>
              </label>
              {errors.vehicleModelId && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.vehicleModelId}</h6>
                </div>
              )}
            </div>
            <div className={`form-item ${portal==='Admin Portal'?'disabled-form-item':''}`}>
                <FormMultipleSelect
                options={fuelTypeOptions}
                id="fuel-type"
                placeholderText="Select fuel type"
                disabled={portal==='Admin Portal'}
                required={formInputs.partCategory === "SPARE_PARTS"}
                value={formInputs.fuelTypeId}
                isValid={errors["fuelTypeId"] ? "invalid" : ""}
                onChange={(selectedValues) => {
                  setFormInputs((prev) => ({
                    ...prev,
                    fuelTypeId: selectedValues || [],
                  }));
                  setErrors((prev) => ({
                    ...prev,
                    fuelTypeId: "",
                  }));
                  setIsFormModified(true);
                }}
              />
              <label className="form-label" htmlFor="vehicle-model">
                <h4>Fuel Type</h4>
              </label>
              {errors.fuelTypeId && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.fuelTypeId}</h6>
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
             <div className="form-item">
              <input type="text" name="purchasePrice" id="purchase-price" value={formInputs.purchasePrice} className={`required ${errors["purchasePrice"] ? "invalid" : ""}`} onChange={(e) => handleChange(e)} autoComplete="off" />
              <label className="form-label" htmlFor="purchase-price">
                <h4>Purchase Price (Rs.)</h4>
              </label>
              {errors.purchasePrice && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.purchasePrice}</h6>
                </div>
              )}
            </div>
            <div className="form-item single">
              <input type="text" name="salesPrice" id="sale-price" value={formInputs.salesPrice} className={`required ${errors["salesPrice"] ? "invalid" : ""}`} onChange={(e) => handleChange(e)} autoComplete="off" />
              <label className="form-label" htmlFor="sale-price">
                <h4>Sale Price - MRP (Rs.)</h4>
              </label>
              {errors.salesPrice && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.salesPrice}</h6>
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className={`form-item form-item__full ${portal==='Admin Portal'?'disabled-form-item':''}`}>
              <UploadComponent
                linkText="Click to upload"
                text="or drag & drop your image here"
                mobileText="your image here"
                subText="PNG, JPG and JPEG, up to 3MB"
                inputId="part-image"
                required={false}
                multiple={false}
                maxFileSize="3MB"
                allowedFileSize={3 * 1024 * 1024}
                fileFormat="png, jpg, jpeg"
                allowedFileTypes={[
                  'image/png',
                  'image/jpeg',
                  'image/jpg', 
                ]}
                onFileChange={async (files) => {
                  if (portal==='Admin Portal') return;
                  if (files.length > 0) {
                    setFile(files);
                    await handleSparePartImageUpload(files[0]); 
                  } else {
                    setFile(null);
                  }
                }}
                uploadError={uploadError}
                uploadErrorDescription={uploadErrorDescription}
                onCancelClick={() => navigate("/app/spare-parts-management")}
                isLoading={isImgLoading}
                editImgPreview={sparePartBase64}
                isDataType={true}
                onRemoveFile={handleRemoveFilePreview}
                showCancelButton={false}
                disabled={portal==='Admin Portal'}
              />
              <label className="form-label" htmlFor="part-image">
                <h4>Part Image</h4>
              </label>
            </div>
          </div>
        </div>
        <div className={`form-section ${portal==='Admin Portal'&&savedNotes.length==0?'hidden-notes':''}`}>
        {portal!=='Admin Portal'&&
          <div className="form-header admin-service sub-header notes-header">
            <h3>Add Notes</h3>
            <button
              type="button"
              onClick={addNote}
              className={`button form-button ${hasActiveNote ? 'disabled-button' : ''}`}
              disabled={hasActiveNote}
              id='spare-part-add-notes-button'
            >
              <img src={Icons.plus} alt="Edit Icon" />
              <span>Add New Notes</span>
            </button>
          </div>
        }
          {savedNotes.map((note, index) => (
          <div className="form-row">
              <div className={`form-item form-item__full note-preview ${portal==='Admin Portal'?'disabled-form-item':''}`} key={note.id }>
                <div className="note-container">
                  <div className="note-header">
                    <h4>{note.text ? note.text : "-" }</h4>
                    {portal!=='Admin Portal'&&
                    <img
                      src={Icons.trash}
                      alt="Delete Icon"
                      onClick={() => handleDeleteNote(note.id)} />
                    }
                  </div>
                  {note.attachments && note.attachments.length > 0 && (
                    note.attachments.map((attachment, idx) => {
                      let fileIcon = Icons.default_file;
          
                      if (attachment.type === "application/pdf") {
                        fileIcon = Icons.pdf_file;
                      } else if (["image"].includes(attachment.type)) {
                        fileIcon = Icons.image;
                      } else if (attachment.type === "application/msword") {
                        fileIcon = Icons.doc_file;
                      } else if (attachment.type === "text/csv") {
                        fileIcon = Icons.csv_icon;
                      } else if (attachment.type === "text/txt") {
                        fileIcon = Icons.txt_icon;
                      }
                      return (
                        <div className="note-item" key={idx}>
                          <img src={fileIcon} alt="File Icon" />
                          <h4>{attachment.name}</h4>
                        </div>
                      );
                    })
                  )}
                  <div className="note-footer">
                    <h6>
                        Notes by: {firstName + ' ' + lastName} on{' '} {note.addedDate} {note.addedTime}
                    </h6>
                  </div>
                </div>

                <label className="form-label">
                  <h4>Note {index + 1}</h4>
                </label>
              </div>
          </div>
          ))}
          {
            portal!=='Admin Portal'&&
          <div className="form-item form-item__full notes-list">
            {notes.map((note, index) => (
              <div className="add-note" key={note.id}>
                <div className="form-row">
                  <div className="form-item form-item__full">
                    <textarea
                      name={`note-${note.id}`}
                      id={`note-${note.id}`}
                      value={noteText}
                      disabled={portal==='Admin Portal'}
                      onChange={(e) => { setNoteText(e.target.value); setIsFormModified(true); }}
                    />
                    <label className="form-label" htmlFor={`note-${note.id}`}>
                      <h4>Note {savedNotes.length + index + 1}</h4>
                    </label>
                    {errors.noteText && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.noteText}</h6>
                      </div>
                    )}
                  </div>
                </div>
                {!note.isSaved && (
                <div className="form-row">
                    <div className={`form-item form-item__full ${portal==='Admin Portal'?'disabled-form-item':''}`}>
                    <UploadComponent
                      linkText="Click to upload"
                      text="or drag & drop your file here"
                      mobileText="your file here"
                      subText="PDF, CSV, TXT, PNG, JPG and JPEG format, up to 15MB"
                      inputId="note-attachments"
                      required={false}
                      multiple={true}
                      maxFileSize="15MB"
                      allowedFileSize={15 * 1024 * 1024}
                      fileFormat="png, jpg, jpeg, pdf, csv, txt"
                      allowedFileTypes={[
                        'image/png',
                        'image/jpeg',
                        'image/jpg',
                        'application/pdf',
                        'text/csv',
                        'text/plain',
                      ]}
                      onFileChange={(notesFile) => {
                        if (notesFile.length > 0) {
                          setNotesFile(notesFile);
                        } else {
                          setNotesFile(null);
                        }
                        setIsFormModified(true);
                      }}
                      uploadError={uploadError}
                      uploadErrorDescription={uploadErrorDescription}
                      onCancelClick={() => navigate("/app/spare-parts-management")}
                      showCancelButton={false}
                      disabled={portal==='Admin Portal'}
                    />
                    <label
                      className="form-label"
                      inputId="note-attachments"
                    >
                      <h4>Attachments</h4>
                    </label>
                    {errors.uploadImgPath && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.uploadImgPath}</h6>
                      </div>
                    )}
                    {errors.notes && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.notes}</h6>
                      </div>
                    )}
                  </div>
                </div>                                                                                                                                                                                                                                                                                                        
                )}

                {portal!=='Admin Portal'&&
                <div className="form-row form-footer notes">
                  {savedNotes.length > 0 ? (
                    <>
                      <button
                        type="button"
                        className="button button-submit col-50"
                        onClick={saveNotes}
                        disabled={isNotesLoading}
                        id="save-button-spare-part-notes"
                      >
                        <h5>{isNotesLoading ? "Saving... Please wait." : "Save Note"}</h5>
                      </button>
                      <button
                        type="button"
                        className="button button-cancel col-50"
                        onClick={() => removeNote(note.id)}
                         id="cancel-button-spare-part-notes"
                      >
                        <h5>Cancel</h5>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="button"
                      onClick={saveNotes}
                      disabled={isNotesLoading || portal==='Admin Portal'}
                       id="save-button-spare-part-notes-admin"
                    >
                      <h5>{isNotesLoading ? "Saving... Please wait." : "Save Note"}</h5>
                    </button>
                  )}
                </div>
                }
              </div>
            ))}
          </div>
        }
        </div>
        <div className="form-section">
          <h3 className="info-header">
            Additional Information
          </h3>
          <div className="form-row">
            <div className="form-item disabled-form-item">
              <input type="text" name="sparePartsPrimaryIdentifier" id="spare-parts-primary-identifier" value={isEdit ? formInputs.sparePartsPrimaryIdentifier : primaryId} disabled onChange={(e) => handleChange(e)} />
              <label className="form-label" htmlFor="spare-parts-primary-identifier">
                <h4>Spare Parts Primary Identifier</h4>
              </label>
              {errors.sparePartsPrimaryIdentifier && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.sparePartsPrimaryIdentifier}</h6>
                </div>
              )}
            </div>
            <div className="form-item disabled-form-item">
              <div className="position-relative datepicker p-0">
                <input 
                  type="text" 
                  value={formInputs.addedDate} 
                  name="addedDate" id="spare-parts-added-date" 
                  disabled />
                <img src={Icons.calendar} alt="Calendar Icon" className="input-icon" />
              </div>
              <label className="form-label" htmlFor="spare-parts-added-date">
                <h4>Spare Parts Added Date</h4>
              </label>
            </div>
          </div>
          <div className="form-row">
            <div className="form-item disabled-form-item">
              <input type="text" name="addedBy" id="spare-parts-added-by" value={isEdit ? formInputs.addedByName : firstName + ' ' + lastName } disabled />
              <label className="form-label" htmlFor="spare-parts-added-by">
                <h4>Spare Parts Added By</h4>
              </label>
            </div>
            <div className={`form-item ${portal==='Admin Portal'?'disabled-form-item':''}`}>
              <div className="radio-input-wrapper">
                <div className="radio-wrapper">
                  <input type="radio" name="stockStatus" disabled={portal==='Admin Portal'} checked={formInputs.stockStatus === "IN_STOCK"} id="available" value="IN_STOCK" onChange={(e) => handleChange(e)} />
                  <label className="radio-label" htmlFor="available">
                    Available
                  </label>
                </div>
                <div className="radio-wrapper">
                  <input type="radio" name="stockStatus" disabled={portal==='Admin Portal'} checked={formInputs.stockStatus === "OUT_OF_STOCK"} id="out-of-stock" value="OUT_OF_STOCK" onChange={(e) => handleChange(e)} />
                  <label className="radio-label" htmlFor="out-of-stock">
                    Out of Stock
                  </label>
                </div>
              </div>
              <label className="form-label required" htmlFor="stock-status">
                <h4>Stock Status</h4>
              </label>
              {errors.stockStatus && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.stockStatus}</h6>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="form-footer">
          <button
            type="submit"
            className={`button button-submit ${isEdit && !isFormModified ? 'disabled-button' : ''}`}
            onClick={isEdit ? onUpdate : onSubmit}
            disabled={isLoading || (isEdit && !isFormModified)}
             id="save-button-spare-part-main"
          >
            <h5>{isLoading ? "Saving... Please wait." : isEdit ? "Update" : "Save"}</h5>
          </button>
          <button
            type="button"
            className="button button-cancel"
            onClick={handleCancelClick}
             id="cancel-button-spare-part-main"
          >
            <h5>Cancel</h5>
          </button>
        </div>
      </Form >
      {showPopup && (
        <>
          <div className="overlay"></div>
          <div className="error-popup">
            <div className="error-popup-content">
              <span className="close-icon" onClick={closePopup}></span>
              <img src={errorIcon} alt="error" className="error-icon" />
              <h2>{errorTitle}</h2>
              {errorTitle !== error ? <p>{error}</p> : <p></p>}
              <button  id="sparepart-button-retry" onClick={closePopup}>Retry</button>
            </div>
          </div>
        </>
      )}
    </div >
    {showCancelPopup && (
      <CancelModal 
        onClickConfirmModel={handleConfirmCancel}
        onClickCancelModel={handleCancelCancel}
      />
    )}
    </>
  );
};

export default SparePartForm;
