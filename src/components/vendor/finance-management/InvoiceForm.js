import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, notification } from "antd";
import Icons from "../../../utils/icons";
import CancelModal from "../../../shared/components/CancelModal";
import ActionButton from "../../../shared/action-buttons/ActionButton";
import TelephoneInput from "../../../shared/phoneInput/TelephoneInput";
import { Tokens } from "../../../constants/index";
import {
  updateFinanceSparePart,
  updatFinanceService,
  updateInvoice,
} from '../../../slices/vendor/financeSlice';
import RadioSelect from "../../../shared/select/RadioSelect";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import AddSparePartModal from "./AddSparePartModal";
import AddServiceModal from "./AddServiceModal";
import {
  fetchAllCities,
  fetchAllDistricts,
  fetchAllProvinces,
} from '../../../slices/locationDataSlice';
import { dateFormat } from '../../../constants';
import { format, parse } from "date-fns";
import ReactDatePicker from "../../../shared/datepicker/ReactDatePicker";
import CustomRadioSelect from "../../../shared/select/CustomRadioSelect";
import PaymentStatusSelect from "./PaymentStatusSelect";

const InvoiceForm = ({ invoice = {}, isEdit = false, sId = 0 }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allCities = [], allDistricts = [], allProvinces = [] } = useSelector((state) => state.locations || {});
  const [errorIcon, setErrorIcon] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const email = localStorage.getItem(Tokens.EMAIL);
  const [isFormModified, setIsFormModified] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [sparePartPopup, setSparePartPopup] = useState(false);
  const [servicePopup, setServicePopup] = useState(false);
  const [discountType, setDiscountType] = useState("Percent");
  const [spareParts, setSpareParts] = useState([]);
  const [services, setServices] = useState([]);
  const [deleteModel, setDeleteModel] = useState(false);
  const [isDelete, setIsDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingPartItem, setEditingPartItem] = useState(null);
  const [tempLinkedSpareParts, setTempLinkedSpareParts] = useState([]);
  const [excludedParts, setExcludedParts] = useState([]);
  const [updatePartsKey, setUpdatePartsKey] = useState(Math.random());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [tempSparePartChanges, setTempSparePartChanges] = useState([]);
  const [tempServiceChanges, setTempServiceChanges] = useState([]);

  useEffect(() => {
    dispatch(fetchAllCities());
    dispatch(fetchAllDistricts());
    dispatch(fetchAllProvinces());
  }, [dispatch]);

  const closePopup = () => {
    setShowPopup(false);
    setErrorIcon("");
    setErrorTitle("");
    setError("");
  };

  const [formInputs, setFormInputs] = useState({
    customerName: "",
    contactNumber: "",
    addressLine1: "",
    addressLine2: "",
    cityId: "",
    postalCode: "",
    districtId: "",
    provinceId: "",
    countryId: "",
    customerVatNumber: "",
    invoiceCreatedDate: "",
    invoiceDueDate: "",
    vatRegNumber: "",
    paymentStatus: "",
    amountPaid: "",
    remainingAmount: "",
    insuranceName: "",
    invoiceIsPercent: true,
    invoiceTotal: "",
    invoiceDiscount: "",
    invoiceTax: "",
    invoiceSubTotal: "",
  });

  useEffect(() => {
    if (isEdit && invoice) {
      setSpareParts([]);
      setServices([]);
      setFormInputs({
        id: sId,
        invoicePrimaryId: invoice.invoicePrimaryId,
        customerId: invoice.customerId,
        quoteType: invoice.quoteType,
        customerType: invoice.customerType,
        customerName: invoice.customerName,
        insuranceName: invoice.invoiceInsurance,
        vehicleRegNo: invoice.vegRegNum,
        insuranceId: invoice.insuranceName,
        quoteDueDate: invoice.quoteDueDate,
        addressLine1: invoice.addressLine1,
        addressLine2: invoice.addressLine2,
        cityId: invoice.cityId,
        postalCode: invoice.postalCode,
        districtId: invoice.districtId,
        provinceId: invoice.provinceId,
        customerVatNumber: invoice.customerVatNumber,
        vatRegNumber: invoice.vatRegNumber,
        notes: invoice.notes,
        comments: invoice.comments,
        invoiceIsPercent: invoice.invoiceIsPercent,
        invoiceTotal: invoice.invoiceTotal,
        invoiceDiscount: invoice.invoiceDiscount,
        invoiceTax: invoice.invoiceTax,
        invoiceSubTotal: invoice.subTotal,
        quotePartsIds: (invoice.partCategoryListDto || []).flatMap(category => 
          category.quotePartsDtoList?.map(part => part.id) || []
        ),
        quoteServiceIds: (invoice.serviceCategoryListDto || []).flatMap(category => 
          category.quoteServicesDtos?.map(service => service.id) || []
        ),
        paymentStatus: invoice.paymentStatus,
        isInvoiceCreated: invoice.isInvoiceCreated,
        invoiceDueDate: invoice.invoiceDueDate,
        invoiceCreatedDate: invoice.invoiceCreatedDate,
        invoiceId: invoice.invoiceId,
        isTaxInvoice: invoice.isTaxInvoice,
        amountPaid: invoice.amountPaid,
        remainingAmount: invoice.remainingAmount,
        contactNumber: invoice.customerContactNumber,
        countryId: invoice.countryId
      });

      setPrevFormInputs({
        customerName: invoice.customerName,
        vehicleRegNo: invoice.vegRegNum,
      });

      const allSpareParts = (invoice.partCategoryListDto || []).flatMap(
        category => category.quotePartsDtoList || []
      );
      
      setSpareParts(
        allSpareParts.map(part => ({
          ...part,
          isExisting: true
        }))
      );
  
      const allServices = (invoice.serviceCategoryListDto || []).flatMap(
        category => category.quoteServicesDtos || []
      );

      setServices(
        allServices.map(service => ({
          ...service,
          isExisting: true,
        }))
      );

      setDiscountType(invoice.invoiceIsPercent ? "Percent" : "Amount");
    }
  }, [isEdit, invoice]);

  const [prevFormInputs, setPrevFormInputs] = useState({
    vehicleRegNo: formInputs.vehicleRegNo,
    customerName: formInputs.customerName,
  });

  

  const [errors, setErrors] = useState({
    customerName: "",
    contactNumber: "",
    addressLine1: "",
    addressLine2: "",
    cityId: "",
    postalCode: "",
    districtId: "",
    provinceId: "",
    countryId: "",
    customerVatNumber: "",
    invoiceCreatedDate: "",
    invoiceDueDate: "",
    vatRegNumber: "",
    paymentStatus: "",
    amountPaid: "",
    remainingAmount: "",
    insuranceName: "",
    invoiceIsPercent: true,
    invoiceTotal: "",
    invoiceDiscount: "",
    invoiceTax: "",
    invoiceSubTotal: "",
  });

  const handleCancelClick = () => {
    if (isFormModified || tempLinkedSpareParts.length > 0) {
      setShowCancelPopup(true);
    } else {
      navigate(-1);
    }
  };

  const onClickDeleteModel = (isDelete = null) => {
    setDeleteModel(!deleteModel);
    setIsDelete(isDelete);
  };

  const handleConfirmCancel = () => {
    setTempLinkedSpareParts([]);
    setShowCancelPopup(false);
    navigate(-1);
  };

  const handleCancelCancel = () => {
    setShowCancelPopup(false);
  };

  const handleCancelSparePartModal = () => {
    setSparePartPopup(false);
    setEditingPartItem(null);
  }

  const handleCancelServiceModal = () => {
    setServicePopup(false);
    setEditingItem(null);
  }

  const handlePhoneChange = (phone) => {
    setFormInputs((prev) => ({
      ...prev,
      contactNumber: phone,
    }));
    setErrors((prev) => ({
      ...prev,
      contactNumber: "",
    }));
  };

  const calculateSubTotal = () => {
    const totalServiceCost = services.reduce(
      (sum, service) => sum + parseFloat(String(service.totalServiceCost || "0").replace(/,/g, "")),
      0
    );
    const totalPartCost = spareParts.reduce(
      (sum, part) => sum + parseFloat(String(part.totalPartCost || "0").replace(/,/g, "")),
      0
    );
    return (totalServiceCost + totalPartCost).toFixed(2);
  };

  useEffect(() => {
    const subTotal = calculateSubTotal();
    setFormInputs((prev) => ({
      ...prev,
      invoiceSubTotal: subTotal,
    }));
  }, [services, spareParts]);

  const calculateTotal = () => {
    const subTotal = parseFloat(formInputs.invoiceSubTotal || 0);
    const discount = parseFloat(formInputs.invoiceDiscount || 0);
    const invoiceTax = parseFloat(formInputs.invoiceTax || 0);

    let discountAmount = 0;

    // Calculate discount based on type (Percent or Amount)
    if (discountType === "Percent") {
      discountAmount = (subTotal * discount) / 100; // Discount as percentage of Sub Total
    } else {
      discountAmount = discount; // Direct discount amount
    }

    // Calculate tax as a percentage of Sub Total
    const taxAmount = (subTotal - discountAmount) * (invoiceTax / 100);

    // Calculate Total: (Sub Total - Discount) + Tax
    const total = (subTotal - discountAmount) + taxAmount;

    return total.toFixed(2); // Return total rounded to 2 decimal places
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "";
    
    // Convert to number if it's a string
    const numValue = typeof value === 'string' 
      ? parseFloat(value.replace(/,/g, '')) 
      : Number(value);
      
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  useEffect(() => {
    const total = calculateTotal();
    // const previousRemainingAmount = parseFloat(invoice.remainingAmount) || total;
    const totalPaidAmount = invoice.invoiceTotal - invoice.remainingAmount;
    const totalRemainingAmount = total - totalPaidAmount;
    setFormInputs(prev => ({
      ...prev,
      invoiceTotal: total,
    }));
    if (formInputs.paymentStatus === "Fully Paid") {
      setFormInputs(prev => ({
        ...prev,
        amountPaid: totalRemainingAmount.toFixed(2),
        remainingAmount: 0.00,
      }));
    } else if (formInputs.paymentStatus === "Unpaid") {
      setFormInputs(prev => ({
        ...prev,
        amountPaid: "0.00",
        remainingAmount: totalRemainingAmount.toFixed(2),
      }));
    }

  }, [
    formInputs.invoiceSubTotal,
    formInputs.invoiceDiscount,
    formInputs.invoiceTax,
    formInputs.paymentStatus,
    formInputs.amountPaid,
    discountType,
    services,
    spareParts
  ]);

const handleInputChange = (e) => {
  let value = e.target.value;

  // Allow only numbers
  value = value.replace(/[^0-9.]/g, "");

  if ((value.match(/\./g) || []).length > 1) {
    return;
  }

  // Prevent more than 10 characters for Amount
  if (discountType === "Amount" && value.length > 10) {
    value = value.slice(0, 10);
  }

  // Prevent percentage values >= 100
  if (discountType === "Percent" && parseFloat(value) > 100) {
    value = "100"; // Reset to max allowed percentage
  }

  // Prevent negative remaining amounts
  if (value) {
    const subTotal = parseFloat(formInputs.invoiceSubTotal || 0);
    const discount = parseFloat(value);
    const invoiceTax = parseFloat(formInputs.invoiceTax || 0);
    
    let discountAmount = discountType === "Percent" ? (subTotal * discount) / 100 : discount;
    const newTotal = (subTotal - discountAmount) + ((subTotal - discountAmount) * (invoiceTax / 100));
    const totalPaidSoFar = (invoice.invoiceTotal - invoice.remainingAmount) + parseFloat(formInputs.amountPaid || 0);
    
    if (newTotal < totalPaidSoFar) {
      setErrors(prev => ({ ...prev, invoiceDiscount: "Discount exceeds remaining amount" }));
      return;
    }
  }

  setFormInputs(prev => {
    const newFormInputs = { ...prev, invoiceDiscount: value };

    // Calculate new total based on discount
    const subTotal = parseFloat(prev.invoiceSubTotal || 0);
    const discount = parseFloat(value || 0);
    const invoiceTax = parseFloat(prev.invoiceTax || 0);

    let discountAmount = 0;
    if (discountType === "Percent") {
      discountAmount = (subTotal * discount) / 100;
    } else {
      discountAmount = discount;
    }

    const taxAmount = (subTotal - discountAmount) * (invoiceTax / 100);
    const total = (subTotal - discountAmount) + taxAmount;

    // Update total
    newFormInputs.invoiceTotal = total.toFixed(2);

    // Calculate remaining amount using the correct formula
     const previouslyPaidAmount = invoice.invoiceTotal - invoice.remainingAmount;
     const sessionPaidAmount = parseFloat(prev.amountPaid || 0);
     const totalPaidSoFar = previouslyPaidAmount + sessionPaidAmount;
     let newRemainingAmount = Math.max(0, total - totalPaidSoFar);

    // Update payment related fields based on payment status
    if (prev.paymentStatus === "Partially Paid") {
      newFormInputs.remainingAmount = newRemainingAmount.toFixed(2);
    } else if (prev.paymentStatus === "Unpaid") {
      newFormInputs.amountPaid = "0.00"; 
      newFormInputs.remainingAmount = Math.max(0, total - previouslyPaidAmount).toFixed(2);
    } else if (prev.paymentStatus === "Fully Paid") {
      newFormInputs.remainingAmount = "0.00"; 
    }

    return newFormInputs;
  });

  const error = validateField("invoiceDiscount", value);

  // Update the errors state
  setErrors((prev) => ({
    ...prev,
    invoiceDiscount: error,
  }));
};

const allCitiesOptions = (allCities || []).map((city) => ({
  label: city.cityName,
  value: city.id
}));

const allDistrictsOptions = (allDistricts || []).map((district) => ({
  label: district.name,
  value: district.id
}));

const allProvincesOptions = (allProvinces || []).map((province) => ({
  label: province.name,
  value: province.id
}));

const handleTaxInputChange = (e) => {
  let value = e.target.value;

  // Allow only numbers
  value = value.replace(/[^0-9.]/g, "");

  if ((value.match(/\./g) || []).length > 1) {
    return;
  }

  if (parseFloat(value) > 100) {
    value = "100";
  }

  setFormInputs({ ...formInputs, invoiceTax: value });
};

const validateField = (name, value) => {
  let error = "";

  switch (name) {
    case "customerName":
      if (!value) {
        error = "Customer Name field is required";
      } else if (value.length > 60) {
        error = "Enter a value that doesn't exceed 60 characters";
      } else if (!/^[A-Za-z\s]+$/.test(value)) {
        error = "Only alphabetic characters and spaces are allowed.";
      }
      break;

    case "contactNumber":
      if (!value) {
        error = "Contact Number field is required";
      }
      break;

    case "addressLine1":
      if (!value) {
        error = "Address Line 1 field is required";
      } else if (value.length > 60) {
        error = "Enter a value that doesn't exceed 60 characters";
      }
      break;

    case "addressLine2":
      if (value.length > 60) {
        error = "Enter a value that doesn't exceed 60 characters";
      }
      break;

    case "cityId":
      if (!value) {
        error = "City/Town field is required";
      }
      break;

    case "postalCode":
      if (!value) {
        error = "Postal Code field is required";
      }
      break;

    case "districtId":
      if (!value) {
        error = "District field is required";
      }
      break;

    case "provinceId":
      if (!value) {
        error = "Province field is required";
      }
      break;

    case "customerVatNumber":
      if (value.length > 20) {
        error = "Enter a value that doesn't exceed 20 characters";
      }
      break;

    case "vatRegNumber":
      if (value.length > 20) {
        error = "Enter a value that doesn't exceed 20 characters";
      }
      break;

    case "amountPaid":
      if (formInputs.paymentStatus === "Partially Paid") {
        const amount = parseFloat(value) || 0;
        const total = parseFloat(formInputs.invoiceTotal) || 0;
        
        if (!value || value.trim() === "") {
          error = "Amount paid is required for partial payments";
        } else if (isNaN(amount)) {
          error = "Please enter a valid number";
        } else if (amount < 0) {
          error = "Amount paid must be greater than 0";
        }
      }
      break;
    case "invoiceDiscount	":
      if (value) {
        const subTotal = parseFloat(formInputs.invoiceSubTotal || 0);
        const discount = parseFloat(value);

        if (discountType === "Percent") {
          const percentageValue = parseFloat(value);
          if (isNaN(percentageValue) || percentageValue > 100) {
            error = "Percentage must be a valid number less than 100";
          }
        } else if (discountType === "Amount") {
          if (!/^\d+(\.\d+)?$/.test(value)) {
            error = "Must be a valid numeric amount";
          } else if (value.length > 6) {
            error = "Value must not exceed 6 characters";
          } else if (discount > subTotal) {
            error = "Discount amount cannot exceed Sub Total";
          }
        }
      }
      break;

    default:
      break;
  }

  return error;
};

const handleChange = (e) => {
  const { name, value } = e.target;
  setIsFormModified(true);

  // Update form inputs
  setFormInputs(prev => ({ ...prev, [name]: value }));

  // Real-time validation - but don't show errors until blur or submit
  const error = validateField(name, value);
  setErrors(prev => ({ ...prev, [name]: error }));
};

const handleBlur = (e) => {
  const { name, value } = e.target;
  // Only show error after blur (user has finished typing)
  const error = validateField(name, value);
  setErrors(prev => ({ ...prev, [name]: error }));
};

const handleValidation = () => {
  let isValid = true;
  const newErrors = {};

  // Required fields validation
  const requiredFields = {
    customerName: "Customer Name",
    contactNumber: "Contact Number",
    addressLine1: "Address Line 1",
    cityId: "City/Town",
    postalCode: "Postal Code",
    districtId: "District",
    provinceId: "Province",
    invoiceDueDate: "Invoice Due Date",
    paymentStatus: "Payment Status"
  };

  // Add insurance name validation for INSURANCE_QUOTE
  if (formInputs.quoteType === "INSURANCE_QUOTE") {
    requiredFields.insuranceName = "Insurance Name";
  }

  // Check required fields
  Object.entries(requiredFields).forEach(([field, label]) => {
    if (!formInputs[field]) {
      newErrors[field] = `${label} is required`;
      isValid = false;
    }
  });

  const sriLankaPhoneRegex = /^\+94\s\d{2}\s\d{3}\s\d{4}$/;

  if (!sriLankaPhoneRegex.test(formInputs.contactNumber)) {
    newErrors.contactNumber = "Must be a valid Contact Number";
    isValid = false;
  }

  // Validate customer name format
  if (formInputs.customerName && !/^[A-Za-z\s]+$/.test(formInputs.customerName)) {
    newErrors.customerName = "Only alphabetic characters and spaces are allowed";
    isValid = false;
  }

  // Validate address line 1 length
  if (formInputs.addressLine1 && formInputs.addressLine1.length > 60) {
    newErrors.addressLine1 = "Address Line 1 cannot exceed 60 characters";
    isValid = false;
  }

  // Validate address line 2 length if provided
  if (formInputs.addressLine2 && formInputs.addressLine2.length > 60) {
    newErrors.addressLine2 = "Address Line 2 cannot exceed 60 characters";
    isValid = false;
  }

  // Validate customer VAT number length if provided
  if (formInputs.customerVatNumber && formInputs.customerVatNumber.length > 20) {
    newErrors.customerVatNumber = "Customer VAT Number cannot exceed 20 characters";
    isValid = false;
  }

  if (formInputs.vatRegNumber && formInputs.vatRegNumber.length > 20) {
    newErrors.vatRegNumber = "VAT Registration Number cannot exceed 20 characters";
    isValid = false;
  }

  if (formInputs.paymentStatus === "Partially Paid") {
    const amountPaid = parseFloat(formInputs.amountPaid) || 0;
    const totalAmount = parseFloat(formInputs.invoiceTotal) || 0;
    
    if (!formInputs.amountPaid || formInputs.amountPaid.trim() === "") {
      newErrors.amountPaid = "Amount paid is required for partial payments";
      isValid = false;
    } else if (isNaN(amountPaid)) {
      newErrors.amountPaid = "Please enter a valid number";
      isValid = false;
    } else if (amountPaid < 0) {
      newErrors.amountPaid = "Amount paid must be greater than 0";
      isValid = false;
    }
  }

  // Validate discount
  if (formInputs.invoiceDiscount) {
    const subTotal = parseFloat(formInputs.invoiceSubTotal || 0);
    const discount = parseFloat(formInputs.invoiceDiscount);

    if (discountType === "Percent") {
      if (isNaN(discount) || discount > 100) {
        newErrors.invoiceDiscount = "Percentage must be a valid number less than 100";
        isValid = false;
      }
    } else if (discountType === "Amount") {
      if (!/^\d+(\.\d+)?$/.test(formInputs.invoiceDiscount)) {
        newErrors.invoiceDiscount = "Must be a valid numeric amount";
        isValid = false;
      } else if (discount > subTotal) {
        newErrors.invoiceDiscount = "Discount amount cannot exceed Sub Total";
        isValid = false;
      }
    }
  }

  // Update errors state
  setErrors(newErrors);

  if (!isValid) {
    notification.error({
      message: <h5>Validation failed. Please check all fields.</h5>,
      icon: <img src={Icons.error} alt="Error" />,
      duration: 5,
    });
  }

  return isValid;
};

const handleEditSparePart = (item) => {
  setEditingPartItem(item);
  setSparePartPopup(true);
};

const handleSparePartSubmit = async (values) => {
  if (isEdit) {
    if (editingPartItem?.isExisting) {
      // Store changes temporarily instead of making API call
      const sparePartData = {
        quotePartsId: values.id,
        quantity: values.quantity,
        unitPrice: values.unitPrice,
        totalPartCost: values.totalPartCost,
      };
      setTempSparePartChanges(prev => [...prev, sparePartData]);
      
      // Update local state for immediate UI feedback
      const updatedParts = [...spareParts];
      const index = updatedParts.findIndex((part) => part.id === values.id);
      if (index !== -1) {
        updatedParts[index] = { 
          ...updatedParts[index], 
          quantity: values.quantity,
          unitCost: values.unitPrice,
          totalPartCost: values.totalPartCost
        };
      }
      setSpareParts(updatedParts);

      // Calculate new total based on updated spare parts
      const totalServiceCost = services.reduce(
        (sum, service) => sum + parseFloat(String(service.totalServiceCost || "0").replace(/,/g, "")),
        0
      );
      const totalPartCost = updatedParts.reduce(
        (sum, part) => sum + parseFloat(String(part.totalPartCost || "0").replace(/,/g, "")),
        0
      );
      const subTotal = (totalServiceCost + totalPartCost).toFixed(2);

      const discount = parseFloat(formInputs.invoiceDiscount || 0);
      const invoiceTax = parseFloat(formInputs.invoiceTax || 0);

      let discountAmount = 0;
      if (formInputs.invoiceIsPercent) {
        discountAmount = (subTotal * discount) / 100;
      } else {
        discountAmount = discount;
      }

      const taxAmount = (subTotal - discountAmount) * (invoiceTax / 100);
      const newTotal = (subTotal - discountAmount) + taxAmount;

      if (formInputs.paymentStatus === "Partially Paid") {
        const totalPaidAmount = invoice.invoiceTotal - invoice.remainingAmount;
        setFormInputs(prev => ({
          ...prev,
          invoiceSubTotal: subTotal,
          invoiceTotal: newTotal.toFixed(2),
          remainingAmount: (newTotal - totalPaidAmount).toFixed(2)
        }));
      }

      setIsFormModified(true);
      return values;
    }
  }
};

const handleEditService = (item) => {
  setEditingItem(item);
  setServicePopup(true);
};

const handleServiceSubmit = (values) => {
  if (isEdit) {
    if (editingItem?.isExisting) {
      // Store changes temporarily instead of making API call
      const serviceData = {
        quoteServiceId: values.quoteServiceId,
        hours: values.hours,
        totalServiceCost: values.totalServiceCost
      };
      setTempServiceChanges(prev => [...prev, serviceData]);
      
      // Update local state for immediate UI feedback
      const updatedServices = [...services];
      const index = updatedServices.findIndex((service) => service.id === values.quoteServiceId);
      if (index !== -1) {
        updatedServices[index] = { 
          ...updatedServices[index], 
          hours: values.hours,
          totalServiceCost: values.totalServiceCost
        };
      }
      setServices(updatedServices);

      // Calculate new total based on updated services
      const totalServiceCost = updatedServices.reduce(
        (sum, service) => sum + parseFloat(String(service.totalServiceCost || "0").replace(/,/g, "")),
        0
      );
      const totalPartCost = spareParts.reduce(
        (sum, part) => sum + parseFloat(String(part.totalPartCost || "0").replace(/,/g, "")),
        0
      );
      const subTotal = (totalServiceCost + totalPartCost).toFixed(2);

      const discount = parseFloat(formInputs.invoiceDiscount || 0);
      const invoiceTax = parseFloat(formInputs.invoiceTax || 0);

      let discountAmount = 0;
      if (formInputs.invoiceIsPercent) {
        discountAmount = (subTotal * discount) / 100;
      } else {
        discountAmount = discount;
      }

      const taxAmount = (subTotal - discountAmount) * (invoiceTax / 100);
      const newTotal = (subTotal - discountAmount) + taxAmount;

      if (formInputs.paymentStatus === "Partially Paid") {
        const totalPaidAmount = invoice.invoiceTotal - invoice.remainingAmount;
        setFormInputs(prev => ({
          ...prev,
          invoiceSubTotal: subTotal,
          invoiceTotal: newTotal.toFixed(2),
          remainingAmount: (newTotal - totalPaidAmount).toFixed(2)
        }));
      }

      setIsFormModified(true);
      setServicePopup(false);
      setEditingItem(null);
      return values;
    }
  }
};

const onUpdate = async (e) => {
  e.preventDefault();
  setErrors({});

  // Validate all required fields
  const isValid = handleValidation();
  if (!isValid) {
    return;
  }

  setIsLoading(true);
  try {
    // First update spare parts if there are any changes
    for (const sparePartChange of tempSparePartChanges) {
      await dispatch(updateFinanceSparePart(sparePartChange)).unwrap();
    }

    // Then update services if there are any changes
    for (const serviceChange of tempServiceChanges) {
      await dispatch(updatFinanceService(serviceChange)).unwrap();
    }

    // Finally update the invoice
    const dataToSend = {
      quoteId: formInputs.id,
      customerId: formInputs.customerId,
      invoicePrimaryId: formInputs.invoicePrimaryId,
      customerName: formInputs.customerName,
      contactNumber: formInputs.contactNumber,
      addressLine1: formInputs.addressLine1,
      addressLine2: formInputs.addressLine2,
      cityId: formInputs.cityId,
      postalCode: formInputs.postalCode,
      districtId: formInputs.districtId,
      provinceId: formInputs.provinceId,
      countryId: formInputs.countryId,
      customerVatNumber: formInputs.customerVatNumber || "",
      invoiceDueDate: formInputs.invoiceDueDate,
      vatRegNumber: formInputs.vatRegNumber || "",
      paymentStatus: formInputs.paymentStatus,
      amountPaid: formInputs.amountPaid || 0,
      remainingAmount: formInputs.remainingAmount || 0,
      invoiceSubTotal: parseFloat(formInputs.invoiceSubTotal) || 0,
      invoiceDiscount: parseFloat(formInputs.invoiceDiscount) || 0,
      invoiceIsPercent: formInputs.invoiceIsPercent,
      invoiceTax: parseFloat(formInputs.invoiceTax) || 0,
      invoiceTotal: parseFloat(formInputs.invoiceTotal) || 0,
    };

    const resultAction = await dispatch(updateInvoice(dataToSend));
    if (updateInvoice.fulfilled.match(resultAction)) {
      // Clear temporary changes after successful update
      setTempSparePartChanges([]);
      setTempServiceChanges([]);
      
      navigate("/app/finance-management");
      notification.success({
        message: <h5>Updated Successfully!</h5>,
        icon: <img src={Icons.check} alt="Success" />,
        duration: 5,
      });
    } else if (resultAction.payload?.errors) {
      const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
        if (error.includes("customer")) {
          acc.customerName = error;
        }
        if (error.includes("Customer VAT number")) {
          acc.customerVatNumber = error;
        }
        if (error.includes("insurance")) {
          acc.insuranceId = error;
        }
        if (error.includes("jobType")) {
          acc.jobTypeId = error;
        }
        if (error.includes("Sub total")) {
          acc.invoiceSubTotal = error;
        }
        if (error.includes("tax")) {
          acc.invoiceTax = error;
        }
        if (error.includes("discount")) {
          acc.invoiceDiscount = error;
        }
        if (error.includes("total cost")) {
          acc.invoiceTotal = error;
        }
        if (error.includes("Amount paid")) {
            acc.amountPaid = error;
        }
        if (error.includes("due date") || error.includes("Invoice due date must be in the future")) {
          acc.invoiceDueDate = error;
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
    }
  } catch (error) {
    notification.error({
      message: <h5>Failed to update data. Please try again.</h5>,
      icon: <img src={Icons.error} alt="Error" />,
      duration: 5,
    });
  } finally {
    setIsLoading(false);
  }
};

const categoryMap = {
  SPARE_PARTS: "Spare Parts",
  CONSUMABLES: "Consumables",
};

const formatCost = (cost) => {
  if (typeof cost === 'string') {
    return Number(cost.replace(/,/g, '')).toFixed(2);
  }
  return Number(cost || 0).toFixed(2);
};

const sparePartdata = spareParts.map((part) => ({
  id: part.id,
  part_category: categoryMap[part.category] || part.category,
  parts_id: part.partsId,
  part_name: part.partsName,
  part_number: part.quantity,
  unit_cost: formatCost(part.unitCost),
  total_part_cost: formatCost(part.totalPartCost),
  isExisting: part.isExisting,
  quote_id: isEdit ? sId : null
}));

const columns = [
  {
    id: 1,
    name: "Part Category",
    selector: (row) => row.part_category,
    sortField: "PART_CATEGORY",
    grow: 3,
    maxWidth: "100%",
    minWidth: "200px",
    wrap: true,
  },
  {
    id: 2,
    name: "Part Name",
    selector: (row) => row.part_name,
    sortField: "PART_NAME",
    maxWidth: "100%",
    minWidth: "200px",
    wrap: true,

  },
  {
    id: 3,
    name: "Quantity",
    selector: (row) => row.part_number,
    sortField: "PART_NUMBER",
    grow: 3,
    maxWidth: "100%",
    minWidth: "150px",
    wrap: true,
  },
  {
    id: 4,
    name: "Unit Cost (Rs.)",
    selector: (row) =>
      row.unit_cost
        ? parseFloat(row.unit_cost.toString().replace(/,/g, ""))
          .toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          .replace(/,/g, ", ")
        : "-",
    sortField: "UNIT_COST",
    grow: 3,
    maxWidth: "100%",
    minWidth: "200px",
    wrap: true,
  },
  {
    id: 5,
    name: "Total Cost (Rs.)",
    selector: (row) =>
      row.total_part_cost
        ? parseFloat(row.total_part_cost.toString().replace(/,/g, ""))
          .toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          .replace(/,/g, ", ")
        : "-",
    sortField: "UNIT_COST",
    grow: 3,
    maxWidth: "100%",
    minWidth: "200px",
    wrap: true,
  },
  {
    id: 6,
    name: "",
    selector: (row) => null,
    maxWidth: "50%",
    minWidth: "50px",
    // className: "custom-action-column",
    cell: (row) => (
      <div className="actions">
        <ActionButton
          isViewIcon={false}
          item={row}
          isEditMode={true}
          goToEditData={() => handleEditSparePart(row)}
          isDownloadMode={false}
          isDeleteMode={false}
          onClickDeleteModel={() => onClickDeleteModel({ id: row.id, name: row.part_name, type: "sparePart", isExisting: row.isExisting, quote_id: row.quote_id })}
        />
      </div>
    ),
  },
];

const serviceData = services.map((service) => ({
  id: service.id,
  service_category: service.serviceCategory,
  service_category_id: service.serviceCategoryId,
  service_id: service.serviceId,
  service_name: service.serviceName,
  hours: service.hours,
  hourly_rate: formatCost(service.hourlyRate),
  total_service_cost: formatCost(service.totalServiceCost),
  isExisting: service.isExisting,
  quote_id: isEdit ? sId : null,
}));

const serviceColumns = [

  {
    id: 1,
    name: "Service Category",
    selector: (row) => row.service_category,
    grow: 3,
    maxWidth: "100%",
    minWidth: "200px",
    wrap: true,
  },
  {
    id: 2,
    name: "Service Name",
    selector: (row) => row.service_name,
    minWidth: "200px",
    maxWidth: "100%",
    wrap: true,
  },
  {
    id: 3,
    name: "Hours",
    selector: (row) => row.hours,
    grow: 3,
    maxWidth: "100%",
    minWidth: "150px",
    wrap: true,
  },
  {
    id: 4,
    name: "Hourly Rate (Rs.)",
    selector: (row) =>
      row.hourly_rate
        ? parseFloat(row.hourly_rate.toString().replace(/,/g, ""))
          .toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          .replace(/,/g, ", ")
        : "-",
    grow: 3,
    maxWidth: "100%",
    minWidth: "150px",
    wrap: true,
  },
  {
    id: 5,
    name: (
      <div>
        Total Cost (Rs.)
      </div>
    ),
    selector: (row) =>
      row.total_service_cost
        ? parseFloat(row.total_service_cost.toString().replace(/,/g, ""))
          .toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          .replace(/,/g, ", ")
        : "-",
    grow: 3,
    maxWidth: "100%",
    minWidth: "180px",
    wrap: true,
  },
  {
    id: 6,
    name: "",
    selector: (row) => null,
    maxWidth: "50%",
    minWidth: "50px",
    // className: "custom-action-column",
    cell: (row) => (
      <div className="actions">
        <ActionButton
          isViewIcon={false}
          item={row}
          isEditMode={true}
          goToEditData={() => handleEditService(row)}
          isDownloadMode={false}
          isDeleteMode={false}
          onClickDeleteModel={() => onClickDeleteModel({ id: row.id, type: "service", isExisting: row.isExisting, quote_id: row.quote_id })}
        />
      </div>
    ),
  },
];

const discounts = [
  { label: "Percent", value: "Percent" },
  { label: "Amount", value: "Amount" },
];

const paymentStatus = [
  { label: "Fully Paid", value: "Fully Paid" },
  { label: "Partially Paid", value: "Partially Paid" },
  { label: "Unpaid", value: "Unpaid" },
];

const handlePaymentStatusChange = (selected) => {
  const totalAmount = parseFloat(formInputs.invoiceTotal) || 0;
  const totalPaidAmount = invoice.invoiceTotal - invoice.remainingAmount;
  const totalRemainingAmount = Math.max(0, totalAmount - totalPaidAmount);

  switch (selected.value) {
    case "Fully Paid":
      setFormInputs(prev => ({
        ...prev,
        paymentStatus: selected.value,
        amountPaid: totalRemainingAmount.toFixed(2),
        remainingAmount: "0.00"
      }));
      break;

    case "Partially Paid":
      setFormInputs(prev => ({
        ...prev,
        paymentStatus: selected.value,
        amountPaid: "0.00",
        remainingAmount: totalRemainingAmount.toFixed(2)
      }));
      break;

    case "Unpaid":
      setFormInputs(prev => ({
        ...prev,
        paymentStatus: selected.value,
        amountPaid: "0.00",
        remainingAmount: totalRemainingAmount.toFixed(2)
      }));
      break;

    default:
      setFormInputs(prev => ({
        ...prev,
        paymentStatus: selected.value
      }));
  }

  setErrors(prev => ({
    ...prev,
    paymentStatus: "",
    amountPaid: ""
  }));
};

const handleAmountPaidChange = (e) => {
  let value = e.target.value;
  value = value.replace(/[^0-9.]/g, "");

  if ((value.match(/\./g) || []).length > 1) {
    return;
  }

  const totalAmount = parseFloat(formInputs.invoiceTotal) || 0;
  const amountPaid = parseFloat(value) || 0;
  const totalPaidAmount = invoice.invoiceTotal - invoice.remainingAmount;
  const totalRemainingAmount = Math.max(0, totalAmount - totalPaidAmount);

  // For Partially Paid status, validate against remaining amount
  if (formInputs.paymentStatus === "Partially Paid") {
    if (amountPaid > totalRemainingAmount) {
      setErrors(prev => ({
        ...prev,
        amountPaid: "Amount paid cannot exceed remaining amount"
      }));
      return;
    }
  }

  // Check if amount paid equals total amount
  if (Math.abs(amountPaid - totalRemainingAmount) < 0.01) {
    setFormInputs(prev => ({
      ...prev,
      paymentStatus: "Fully Paid",
      amountPaid: totalAmount.toFixed(2),
      remainingAmount: "0.00"
    }));
  } else {
    const remainingAmount = Math.max(0, totalRemainingAmount - amountPaid);
    setFormInputs(prev => ({
      ...prev,
      amountPaid: value,
      remainingAmount: remainingAmount.toFixed(2)
    }));
  }

  setErrors(prev => ({
    ...prev,
    amountPaid: ""
  }));
};

return (
  <>
    <div id="invoice-form-container" className="form-container qoute finance-edit">
      <div className="form-header">
        <div className="back">
          <Link id="invoice-form-back-link" to="/app/finance-management">
            <img src={Icons.arrow_left} alt="Back Icon" />
          </Link>
          <h3 id="invoice-form-title">
            Edit Invoice - {invoice.invoiceId}
          </h3>
        </div>
      </div>
      <Form className="form " layout="vertical">
        {formInputs.isTaxInvoice == true && (
        <div className="account-credentials">
          <h3 className="info-header">Invoice to Details</h3>
          {invoice.quoteType === "INSURANCE_QUOTE" ? (
            <>
              <div className="form-row">
                <div className="form-item disabled-form-item">
                  <input
                    type="text"
                    name="insuranceName"
                    id="insurance-name"
                    required
                    disabled
                    className={errors["insuranceName"] ? "invalid" : ""}
                    value={formInputs.insuranceName ?? ""}
                    onChange={(e) => handleChange(e)}
                    autoComplete="off"
                  />
                  <label className="form-label" htmlFor="insurance-name">
                    <h4>Insurance Name</h4>
                  </label>
                  {errors.insuranceName && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.insuranceName}</h6>
                    </div>
                  )}
                </div>
                <div className="form-item disabled-form-item">
                  <input
                    type="text"
                    name="customerName"
                    id="customer-name"
                    required
                    onBlur={handleBlur}
                    className={errors["customerName"] ? "invalid" : ""}
                    value={formInputs.customerName ?? ""}
                    onChange={(e) => handleChange(e)}
                    autoComplete="off"
                    disabled
                  />
                  <label className="form-label" htmlFor="customer-name">
                    <h4>Customer Name</h4>
                  </label>
                  {errors.customerName && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.customerName}</h6>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-item disabled-form-item">
                  <div className="input-wrapper required">
                    <TelephoneInput inputName="contactNumber" disabledField={true} onChange={handlePhoneChange} value={formInputs.contactNumber} />
                  </div>
                  <label className="form-label" htmlFor="contact-number">
                    <h4>Contact Number</h4>
                  </label>
                  {errors.contactNumber && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.contactNumber}</h6>
                    </div>
                  )}
                </div>
                <div className="form-item disabled-form-item">
                  <input
                    type="text"
                    name="addressLine1"
                    id="address-line-1"
                    onBlur={handleBlur}
                    required
                    className={errors["addressLine1"] ? "invalid" : ""}
                    value={formInputs.addressLine1 ?? ""}
                    onChange={(e) => handleChange(e)}
                    autoComplete="off"
                    disabled
                  />
                  <label className="form-label" htmlFor="address-line-1">
                    <h4>Address Line 1</h4>
                  </label>
                  {errors.addressLine1 && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.addressLine1}</h6>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-item disabled-form-item"> 
                  <input
                    type="text"
                    name="addressLine2"
                    id="address-line-2"
                    onBlur={handleBlur}
                    className={errors["addressLine2"] ? "invalid" : ""}
                    value={formInputs.addressLine2 ?? ""}
                    onChange={(e) => handleChange(e)}
                    autoComplete="off"
                    disabled
                  />
                  <label className="form-label" htmlFor="address-line-2">
                    <h4>Address Line 2</h4>
                  </label>
                  {errors.addressLine2 && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.addressLine2}</h6>
                    </div>
                  )}
                </div>
                <div className="form-item disabled-form-item">
                  <CustomRadioSelect
                    options={allCitiesOptions}
                    placeholderText=""
                    required
                    name="cityId"
                    onBlur={handleBlur}
                    defaultValue={formInputs.cityId}
                    disabled
                    value={formInputs.cityId}
                    isValid={errors["cityId"] ? "invalid" : ""}
                    onChange={(selected) => {
                      const selectedCity = allCities.find(city => city.id === selected.value);
                      setFormInputs(prev => ({
                        ...prev,
                        cityId: selected.value,
                        postalCode: selectedCity?.postalCode || ""
                      }));
                      setErrors(prev => ({
                        ...prev,
                        cityId: "",
                        postalCode: ""
                      }));
                    }}
                  />
                  <label className="form-label" htmlFor="email">
                    <h4>City/Town</h4>
                  </label>
                  {errors.cityId && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.cityId}</h6>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-item disabled-form-item">
                  <input
                    type="text"
                    name="postalCode"
                    disabled
                    id="postal-code"
                    onBlur={handleBlur}
                    required
                    className={errors["postalCode"] ? "invalid" : ""}
                    value={formInputs.postalCode ?? ""}
                    onChange={(e) => handleChange(e)}
                    autoComplete="off"
                  />
                  <label className="form-label" htmlFor="postal-code">
                    <h4>Postal Code</h4>
                  </label>
                  {errors.postalCode && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.postalCode}</h6>
                    </div>
                  )}
                </div>
                <div className="form-item disabled-form-item">
                  <CustomRadioSelect
                    key={formInputs.districtId}
                    options={allDistrictsOptions}
                    placeholderText=""
                    required
                    name="districtId"
                    disabled
                    onBlur={handleBlur}
                    value={formInputs.districtId}
                    isValid={errors["districtId"] ? "invalid" : ""}
                    onChange={(selected) => {
                      setFormInputs(prev => ({
                        ...prev,
                        districtId: selected.value,
                      }));
                      setErrors(prev => ({
                        ...prev,
                        districtId: "",
                      }));
                    }}
                  />
                  <label className="form-label" htmlFor="district">
                    <h4>District</h4>
                  </label>
                  {errors.districtId && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.districtId}</h6>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-item disabled-form-item">
                  <CustomRadioSelect
                    options={allProvincesOptions}
                    placeholderText=""
                    required
                    disabled
                    name="provinceId"
                    onBlur={handleBlur}
                    defaultValue={formInputs.provinceId}
                    value={formInputs.provinceId}
                    isValid={errors["provinceId"] ? "invalid" : ""}
                    onChange={(selected) => {
                      setFormInputs(prev => ({
                        ...prev,
                        provinceId: selected.value,
                      }));
                      setErrors(prev => ({
                        ...prev,
                        provinceId: "",
                      }));
                    }}
                  />
                  <label className="form-label" htmlFor="email">
                    <h4>Province</h4>
                  </label>
                  {errors.provinceId && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.provinceId}</h6>
                    </div>
                  )}
                </div>
                <div className="form-item disabled-form-item">
                  <input
                    type="text"
                    name="countryId"
                    id="country"
                    onBlur={handleBlur}
                    disabled
                    required
                    className={errors["countryId"] ? "invalid" : ""}
                    value="Sri Lanka"
                    onChange={(e) => handleChange(e)}
                    autoComplete="off"
                  />
                  <label className="form-label" htmlFor="country">
                    <h4>Country</h4>
                  </label>
                  {errors.countryId && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.countryId}</h6>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-item single-form-item disabled-form-item">
                  <input
                    type="text"
                    name="customerVatNumber"
                    onBlur={handleBlur}
                    id="customer-vat"
                    className={errors["customerVatNumber"] ? "invalid" : ""}
                    value={formInputs.customerVatNumber ?? ""}
                    onChange={(e) => handleChange(e)}
                    autoComplete="off"
                    disabled
                  />
                  <label className="form-label" htmlFor="customer-vat">
                    <h4>Customer VAT Number</h4>
                  </label>
                  {errors.customerVatNumber && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.customerVatNumber}</h6>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-row">
                <div className="form-item disabled-form-item">
                  <input
                    type="text"
                    name="customerName"
                    id="customer-name"
                    required
                    disabled
                    onBlur={handleBlur}
                    className={errors["customerName"] ? "invalid" : ""}
                    value={formInputs.customerName ?? ""}
                    onChange={(e) => handleChange(e)}
                    autoComplete="off"
                  />
                  <label className="form-label" htmlFor="customer-name">
                    <h4>Customer Name</h4>
                  </label>
                  {errors.customerName && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.customerName}</h6>
                    </div>
                  )}
                </div>
                <div className="form-item disabled-form-item">
                  <div className="input-wrapper required">
                    <TelephoneInput inputName="contactNumber" disabledField={true} onChange={handlePhoneChange} value={formInputs.contactNumber} />
                  </div>
                  <label className="form-label" htmlFor="contact-number">
                    <h4>Contact Number</h4>
                  </label>
                  {errors.contactNumber && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.contactNumber}</h6>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-item disabled-form-item">
                  <input
                    type="text"
                    name="addressLine1"
                    id="address-line-1"
                    onBlur={handleBlur}
                    required
                    disabled
                    className={errors["addressLine1"] ? "invalid" : ""}
                    value={formInputs.addressLine1 ?? ""}
                    onChange={(e) => handleChange(e)}
                    autoComplete="off"
                  />
                  <label className="form-label" htmlFor="address-line-1">
                    <h4>Address Line 1</h4>
                  </label>
                  {errors.addressLine1 && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.addressLine1}</h6>
                    </div>
                  )}
                </div>
                <div className="form-item disabled-form-item">
                  <input
                    type="text"
                    name="addressLine2"
                    id="address-line-2"
                    onBlur={handleBlur}
                    disabled
                    className={errors["addressLine2"] ? "invalid" : ""}
                    value={formInputs.addressLine2 ?? ""}
                    onChange={(e) => handleChange(e)}
                    autoComplete="off"
                  />
                  <label className="form-label" htmlFor="address-line-2">
                    <h4>Address Line 2</h4>
                  </label>
                  {errors.addressLine2 && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.addressLine2}</h6>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-item disabled-form-item">
                  <CustomRadioSelect
                    options={allCitiesOptions}
                    key={formInputs.cityId}
                    placeholderText=""
                    required
                    disabled
                    name="cityId"
                    onBlur={handleBlur}
                    defaultValue={formInputs.cityId}
                    value={formInputs.cityId}
                    isValid={errors["cityId"] ? "invalid" : ""}
                    onChange={(selected) => {
                      const selectedCity = allCities.find(city => city.id === selected.value);
                      setFormInputs(prev => ({
                        ...prev,
                        cityId: selected.value,
                        postalCode: selectedCity?.postalCode || ""
                      }));
                      setErrors(prev => ({
                        ...prev,
                        cityId: "",
                        postalCode: ""
                      }));
                    }}
                  />
                  <label className="form-label" htmlFor="email">
                    <h4>City/Town</h4>
                  </label>
                  {errors.cityId && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.cityId}</h6>
                    </div>
                  )}
                </div>
                <div className="form-item disabled-form-item">
                  <input
                    type="text"
                    name="postalCode"
                    disabled
                    id="postal-code"
                    onBlur={handleBlur}
                    required
                    className={errors["postalCode"] ? "invalid" : ""}
                    value={formInputs.postalCode ?? ""}
                    onChange={(e) => handleChange(e)}
                    autoComplete="off"
                  />
                  <label className="form-label" htmlFor="postal-code">
                    <h4>Postal Code</h4>
                  </label>
                  {errors.postalCode && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.postalCode}</h6>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-item disabled-form-item">
                  <CustomRadioSelect
                    options={allDistrictsOptions}
                    placeholderText=""
                    required
                    disabled
                    name="districtId"
                    onBlur={handleBlur}
                    defaultValue={formInputs.districtId}
                    value={formInputs.districtId}
                    isValid={errors["districtId"] ? "invalid" : ""}
                    onChange={(selected) => {
                      setFormInputs(prev => ({
                        ...prev,
                        districtId: selected.value,
                      }));
                      setErrors(prev => ({
                        ...prev,
                        districtId: "",
                      }));
                    }}
                  />
                  <label className="form-label" htmlFor="district">
                    <h4>District</h4>
                  </label>
                  {errors.districtId && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.districtId}</h6>
                    </div>
                  )}
                </div>
                <div className="form-item disabled-form-item">
                  <CustomRadioSelect
                    options={allProvincesOptions}
                    placeholderText=""
                    required
                    disabled
                    name="provinceId"
                    onBlur={handleBlur}
                    defaultValue={formInputs.provinceId}
                    value={formInputs.provinceId}
                    isValid={errors["provinceId"] ? "invalid" : ""}
                    onChange={(selected) => {
                      setFormInputs(prev => ({
                        ...prev,
                        provinceId: selected.value,
                      }));
                      setErrors(prev => ({
                        ...prev,
                        provinceId: "",
                      }));
                    }}
                  />
                  <label className="form-label" htmlFor="email">
                    <h4>Province</h4>
                  </label>
                  {errors.provinceId && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.provinceId}</h6>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-item disabled-form-item">
                  <input
                    type="text"
                    name="countryId"
                    id="country"
                    onBlur={handleBlur}
                    disabled
                    required
                    className={errors["countryId"] ? "invalid" : ""}
                    value="Sri Lanka"
                    onChange={(e) => handleChange(e)}
                    autoComplete="off"
                  />
                  <label className="form-label" htmlFor="country">
                    <h4>Country</h4>
                  </label>
                  {errors.countryId && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.countryId}</h6>
                    </div>
                  )}
                </div>
                <div className="form-item disabled-form-item">
                  <input
                    type="text"
                    name="customerVatNumber"
                    onBlur={handleBlur}
                    id="customer-vat"
                    className={errors["customerVatNumber"] ? "invalid" : ""}
                    value={formInputs.customerVatNumber ?? ""}
                    onChange={(e) => handleChange(e)}
                    autoComplete="off"
                    disabled
                  />
                  <label className="form-label" htmlFor="customer-vat">
                    <h4>Customer VAT Number</h4>
                  </label>
                  {errors.customerVatNumber && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.customerVatNumber}</h6>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        )}
        <div className="account-credentials">
          <h3 className="info-header">Invoice  Details</h3>
          <div className="form-row">
            <div className="form-item disabled-form-item">
              <input
                type="text"
                name="invoiceId"
                onBlur={handleBlur}
                id="invoice-id"
                required
                value={isEdit ? formInputs.invoiceId : ""}
                disabled
              />
              <label className="form-label" htmlFor="invoice-id">
                <h4>Invoice ID</h4>
              </label>
              {errors.invoiceId && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.invoiceId}</h6>
                </div>
              )}
            </div>
            <div className="form-item disabled-form-item">
              <div className="position-relative datepicker p-0">
                <input
                  type="text"
                  name="invoiceCreatedDate"
                  id="invoice-created-date"
                  required
                  onBlur={handleBlur}
                  value={formInputs.invoiceCreatedDate}
                  disabled
                />
                <img
                  src={Icons.calendar}
                  alt="Calendar Icon"
                  className="input-icon"
                />
              </div>
              <label className="form-label" htmlFor="invoice-created-date">
                <h4>Invoice Created Date</h4>
              </label>
              {errors.invoiceCreatedDate && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.invoiceCreatedDate}</h6>
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-item">
              <div className="position-relative datepicker p-0 required">
                <ReactDatePicker
                  id="due-date"
                  minDate={tomorrow}
                  name="invoiceDueDate"
                  required
                  onBlur={handleBlur}
                  defaultDate={formInputs.invoiceDueDate ?? ""}
                  onChangeDate={(selectedDate) => {
                    if (!selectedDate || isNaN(new Date(selectedDate).getTime())) {
                      setFormInputs((prev) => ({
                        ...prev,
                        invoiceDueDate: null,
                      }));
                      return;
                    }

                    setFormInputs((prev) => ({
                      ...prev,
                      invoiceDueDate: format(selectedDate, dateFormat.API_NATIVE),
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      invoiceDueDate: "",
                    }));
                  }}
                />
                <img
                  src={Icons.calendar}
                  alt="Calendar Icon"
                  className="input-icon"
                />
              </div>
              <label className="form-label" htmlFor="due-date">
                <h4>Invoice Due Date</h4>
              </label>
              {errors.invoiceDueDate && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.invoiceDueDate}</h6>
                </div>
              )}
            </div>
            <div className="form-item">
              <input
                type="text"
                name="vatRegNumber"
                value={formInputs.vatRegNumber ?? ""}
                onChange={(e) => handleChange(e)}
                autoComplete="off"
                id="vat-registration-no"
              />
              <label className="form-label" htmlFor="vat-registration-no">
                <h4>VAT Registration Number</h4>
              </label>
              {errors.vatRegNumber && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.vatRegNumber}</h6>
                </div>
              )}
            </div>
          </div>
        </div>
        {sparePartdata && sparePartdata.length > 0 && (
        <div className="form-section mob-qoute-spare">
          <div className="form-header sub-header notes-header mob-qoute-spare">
            <h3>Spare Part Details</h3>
          </div>
          <ReactDataTable
            id="invoice-spare-parts-table"
            className="spare-parts-table finance-sparepart"
            columns={columns}
            totalRows={spareParts.length}
            items={sparePartdata}
            noRecordsMessage=""
          />
        </div>
        )}
        {serviceData && serviceData.length > 0 && (
        <div className="form-section service-table mob-qoute-spare">
          <div className="form-header sub-header notes-header">
            <h3>Service Details</h3>
          </div>
          <ReactDataTable
            className="spare-parts-table finance-sparepart"
            columns={serviceColumns}
            totalRows={services.length}
            items={serviceData}
            key={`${excludedParts}-${updatePartsKey}`}
            noRecordsMessage=""
          />
        </div>
        )}
        <div className="account-credentials">
          <h3 className="info-header">Payment Details</h3>
          <div className="form-row">
            <div className="form-item">
              <PaymentStatusSelect
                options={paymentStatus}
                placeholderText=""
                name="paymentStatus"
                id="quote-id"
                required
                value={formInputs.paymentStatus}
                onChange={handlePaymentStatusChange}
                currentValue={invoice.paymentStatus}
                />
              <label className="form-label" htmlFor="quote-id">
                <h4>Payment Status</h4>
              </label>
            </div>
            <div className={`form-item ${formInputs.paymentStatus !== "Partially Paid" ? "disabled-form-item" : ""}`}>
              <input
                type="text"
                name="amountPaid"
                id="amount-paid"
                className={errors.amountPaid ? "invalid" : ""}
                pattern="^\d*\.?\d*$"
                onChange={handleAmountPaidChange}
                value={formInputs.amountPaid}
                autoComplete="off"
                disabled={formInputs.paymentStatus !== "Partially Paid"}
              />
              <label className="form-label" htmlFor="amount-paid">
                <h4>Amount Paid</h4>
              </label>
              {errors.amountPaid && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.amountPaid}</h6>
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-item disabled-form-item single">
              <input
                type="text"
                name="remainingAmount"
                id="remaining-amount"
                value={
                  formInputs.remainingAmount !== undefined && formInputs.remainingAmount !== null
                    ? parseFloat(formInputs.remainingAmount)
                      .toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                      .replace(/,/g, ", ")
                    : "0.00"
                }
                disabled
              />
              <label className="form-label" htmlFor="remaining-amount">
                <h4>Remaining Amount</h4>
              </label>
            </div>
          </div>
        </div>
        <div className="account-credentials">
          <h3 className="info-header">Final Payment Details</h3>
          <div className="form-row">
            <div className="form-item disabled-form-item">
              <input
                type="text"
                name="invoiceSubTotal"
                id="sub-total"
                autoComplete="off"
                value={
                  spareParts.length === 0 && services.length === 0
                    ? ""
                    : parseFloat(formInputs.invoiceSubTotal || 0)
                      .toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                      .replace(/,/g, ", ")
                }
                disabled
              />
              <label className="form-label" htmlFor="sub-total">
                <h4>Sub Total (Rs.)</h4>
              </label>
              {errors.invoiceSubTotal && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.invoiceSubTotal}</h6>
                </div>
              )}
            </div>
            <div className="form-item">
              <div className="group-input-wrapper">
                <input
                  type="text"
                  placeholder="-"
                  name="invoiceDiscount"
                  id="invoice-discount"
                  className="tax-input"
                  pattern="^\d*\.?\d*$"
                  value={formInputs.invoiceDiscount}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
                <RadioSelect
                  options={discounts}
                  defaultValue={formInputs.invoiceIsPercent ? discounts[0] : discounts[1]}
                  name="invoiceIsPercent"
                  value={formInputs.invoiceIsPercent ? "Percent" : "Amount"}
                  onChange={(selectedValue) => {
                    setDiscountType(selectedValue.value);
                    setFormInputs(prev => {
                      const newFormInputs = {
                        ...prev,
                        invoiceIsPercent: selectedValue.value === "Percent",
                      };

                      // Calculate new total based on discount type change
                      const subTotal = parseFloat(prev.invoiceSubTotal || 0);
                      const discount = parseFloat(prev.invoiceDiscount || 0);
                      const invoiceTax = parseFloat(prev.invoiceTax || 0);

                      let discountAmount = 0;
                      if (selectedValue.value === "Percent") {
                        discountAmount = (subTotal * discount) / 100;
                      } else {
                        discountAmount = discount;
                      }

                      const taxAmount = (subTotal - discountAmount) * (invoiceTax / 100);
                      const total = (subTotal - discountAmount) + taxAmount;

                      // Update total
                      newFormInputs.invoiceTotal = total.toFixed(2);

                      // Calculate remaining amount using the correct formula
                      const totalPaidAmount = invoice.invoiceTotal - invoice.remainingAmount;
                      let totalRemainingAmount = total - totalPaidAmount;

                      // Ensure remaining amount is never negative
                      if (totalRemainingAmount < 0) {
                        totalRemainingAmount = 0;
                      }

                      // Update payment related fields based on payment status
                      if (prev.paymentStatus === "Fully Paid") {
                        newFormInputs.amountPaid = total.toFixed(2);
                        newFormInputs.remainingAmount = "0.00";
                      } else if (prev.paymentStatus === "Partially Paid") {
                        newFormInputs.remainingAmount = totalRemainingAmount.toFixed(2);
                      } else if (prev.paymentStatus === "Unpaid") {
                        newFormInputs.amountPaid = "0.00";
                        newFormInputs.remainingAmount = totalRemainingAmount.toFixed(2);
                      }

                      return newFormInputs;
                    });
                    setErrors((prev) => ({
                      ...prev,
                      invoiceIsPercent: "",
                    }));
                  }}
                  id="invoice-payment"
                />
              </div>
              <label className="form-label" htmlFor="invoice">
                <h4>Discount</h4>
              </label>
              {errors.invoiceDiscount && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.invoiceDiscount}</h6>
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-item disabled-form-item">
              <label className="form-label" htmlFor="invoice-tax">
                <h4>Tax</h4>
              </label>
              <div className="tax-input-wrapper ">
                <input
                  type="text"
                  placeholder="-"
                  name="invoiceTax"
                  id="invoice-tax"
                  className="tax-input"
                  pattern="[0-9]*"
                  onChange={handleTaxInputChange}
                  value={formInputs.invoiceTax}
                  autoComplete="off"
                  disabled
                />
                <span className="percentage-symbol">%</span>
              </div>
            </div>
            <div className="form-item disabled-form-item">
              <input
                type="text"
                name="invoiceTotal"
                id="total"
                autoComplete="off"
                value={
                  formInputs.invoiceTotal
                    ? parseFloat(formInputs.invoiceTotal)
                      .toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                      .replace(/,/g, ", ")
                    : ""
                }
                disabled
              />
              <label className="form-label" htmlFor="total">
                <h4>Total (Rs.) </h4>
              </label>
              {errors.invoiceTax && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.invoiceTax}</h6>
                </div>
              )}
              {errors.invoiceTotal && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.invoiceTotal}</h6>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="form-footer">
          <button
            id="invoice-update-button"
            type="submit"
            className="button button-submit"
            onClick={onUpdate}
            disabled={isLoading}
          >
            <h5>
              {isLoading
                ? "Saving... Please wait."
                :
                "Update"
              }
            </h5>
          </button>
          <button
            id="invoice-cancel-button"
            type="button"
            className="button button-cancel"
            onClick={handleCancelClick}
          >
            <h5>Cancel</h5>
          </button>
        </div>
      </Form>
      {showPopup && (
        <>
          <div className="overlay"></div>
          <div className="error-popup">
            <div className="error-popup-content">
              <span className="close-icon" onClick={closePopup} id="invoice-form-error-close-icon"></span>
              <img src={errorIcon} alt="error" className="error-icon" />
              <h2>{errorTitle}</h2>
              {errorTitle !== error ? <p>{error}</p> : <p></p>}
              <button onClick={closePopup} id="invoice-form-error-retry-button">Retry</button>
            </div>
          </div>
        </>
      )}
    </div>
    {showCancelPopup && (
      <CancelModal
        onClickConfirmModel={handleConfirmCancel}
        onClickCancelModel={handleCancelCancel}
      />
    )}

    <AddSparePartModal
      visible={sparePartPopup}
      onClickCancelModel={handleCancelSparePartModal}
      onSubmitSparePart={handleSparePartSubmit}
      isEdit={!!editingPartItem}
      initialPartData={editingPartItem}
      isEditQuote={isEdit}
    />

    <AddServiceModal
      visible={servicePopup}
      onClickCancelModel={handleCancelServiceModal}
      onSubmitService={handleServiceSubmit}
      isEdit={!!editingItem}
      initialData={editingItem}
      isEditQuote={isEdit}
    />
  </>
);
};

export default InvoiceForm;
