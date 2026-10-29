import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, notification, Button } from "antd";
import Icons from "../../../utils/icons";
import CancelModal from "../../../shared/components/CancelModal";
import ActionButton from "../../../shared/action-buttons/ActionButton";
import ReactDatePicker from "../../../shared/datepicker/ReactDatePicker";
import {
  fetchAllInsuranceCompanyList,
  fetchAllJobTypes,
  fetchAllPriorityList,
  addInsuranceCompany
} from "../../../slices/masterDataSlice";
import { dateFormat } from '../../../constants';
import { format, parse, isValid } from "date-fns";
import { Tokens } from "../../../constants/index";
import ActionModal from "../../../shared/components/ActionModal";
import {
  generatePrimaryId,
  fetchAllCustomerList,
  fetchAllVehicleRegistrationList,
  saveQuoteService,
  saveQuoteSparePart,
  updateQuoteSparePart,
  updateQuoteService,
  assignSparePartToService,
  saveQuoteCustomerNameWithVehicleNo,
  editQuoteCustomerNameWithVehicleNo,
  saveQuote,
  updateQuote,
  clearVehicleList,
  clearClientList
} from '../../../slices/vendor/quoteSlice';
import RadioSelect from "../../../shared/select/RadioSelect";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import CustomRadioSelect from "../../../shared/select/CustomRadioSelect";
import GroupRadioSelect from "../../../shared/select/GroupRadioSelect";
import CustomDropDown from "../../../shared/select/CustomDropDown";
import AddSparePartModal from "./AddSparePartModal";
import AddServiceModal from "./AddServiceModal";
import DeleteSparePartService from "./DeleteSparePartService";
import {
  removeUpdatedPartService,
} from "../../../slices/vendor/jobSlice";
import {
  getTempEditedQuoteSpareParts,
  getTempEditedQuoteServices,
  saveTempEditedQuoteSpareParts,
  saveTempEditedQuoteServices,
  clearTempEditedQuoteSpareParts,
  clearTempEditedQuoteServices
} from '../../../utils/storage';

const QuoteForm = ({ quote = {}, isEdit = false, sId = 0 }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    totalRecord,
    allCustomerList,
    allVehicleRegistrationList,
    primaryId,
    customerListLoading,
    vehicleListLoading
  } = useSelector((state) => state.vendorQuotes);
  const [errorIcon, setErrorIcon] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const firstName = localStorage.getItem(Tokens.FIRST_NAME);
  const lastName = localStorage.getItem(Tokens.LAST_NAME);
  const email = localStorage.getItem(Tokens.EMAIL);
  const [isFormModified, setIsFormModified] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [sparePartPopup, setSparePartPopup] = useState(false);
  const [servicePopup, setServicePopup] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedVehicleRegistrationId, setSelectedVehicleRegistrationId] = useState(null);
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
  const [showShareConfirmation, setShowShareConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dataToSend, setDataToSend] = useState(null);

  const saveData = useCallback(async (shareWithClient = false) => {
    if (!dataToSend) return;
    
    setIsSaving(true);
    try {
      // Remove isShareQuote from data body as it will be sent as query parameter
      const { isShareQuote, ...dataWithoutShareStatus } = dataToSend;
      const requestPayload = {
        data: dataWithoutShareStatus,
        isShareQuote: shareWithClient
      };

      let resultAction;
      if (isEdit) {
        resultAction = await dispatch(updateQuote(requestPayload));
      } else {
        resultAction = await dispatch(saveQuote(requestPayload));
      }

      if (saveQuote.fulfilled.match(resultAction) || updateQuote.fulfilled.match(resultAction)) {
        const successMessage = isEdit ? 'Quote updated successfully' : 'Quote created successfully';
        notification.success({
          message: <h5>{successMessage}</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 3,
        });
        navigate('/app/quote-management');
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      notification.error({
        message: <h5>Failed to save quote. Please try again.</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    } finally {
      setIsSaving(false);
    }
  }, [dataToSend, dispatch, isEdit, sId, navigate]);
  const {
    allInsuranceCompanyList,
    allJobTypes,
    allPriorityList,
  } = useSelector((state) => state.masterData);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate());

  const handleQuoteTypeChange = (e) => {
    formInputs.quoteType = e.target.value;
    const { name, value } = e.target;
    setIsFormModified(true);

    setFormInputs((prev) => {
      let updatedInputs = { ...prev, [name]: value };

      if (value === "CUSTOMER_QUOTE") {
        if (!isEdit) {
          updatedInputs.insuranceId = null;
        }
        setErrors((prev) => ({
          ...prev,
          insuranceId: "",
        }));
      }

      return updatedInputs;
    });
  };

  const handleCustomerTypeChange = (e) => {
    formInputs.customerType = e.target.value;
    const { name, value } = e.target;
    setIsFormModified(true);

    setFormInputs((prev) => {
      let updatedInputs = { ...prev, [name]: value };

      return updatedInputs;
    });
  };

  useEffect(() => {
      dispatch(generatePrimaryId());
      dispatch(fetchAllInsuranceCompanyList());
      dispatch(fetchAllJobTypes());
      dispatch(fetchAllPriorityList());
      
        dispatch(fetchAllCustomerList());
        dispatch(fetchAllVehicleRegistrationList());
  },  [dispatch, isEdit]); 

  useEffect(() => {
  const fetchVehicleData = async () => {
    if (selectedCustomerId) {
      try {
        await dispatch(fetchAllVehicleRegistrationList(selectedCustomerId)).unwrap();
      } catch (error) {
        const errorMessage = error?.errors?.[0] || error?.message;
        notification.error({
          message: <h5>{errorMessage}</h5>,
          icon: <img src={Icons.error} alt="Error" />,
          duration: 5,
        });
      }
    }
  };
  fetchVehicleData();
  }, [selectedCustomerId, dispatch]);

  useEffect(() => {
  const fetchCustomerData = async () => {
    if (selectedVehicleRegistrationId) {
      try {
        await dispatch(fetchAllCustomerList(selectedVehicleRegistrationId)).unwrap();
      } catch (error) {
        const errorMessage = error?.errors?.[0] || error?.message;
        notification.error({
          message: <h5>{errorMessage}</h5>,
          icon: <img src={Icons.error} alt="Error" />,
          duration: 5,
        });
      }
    }
  };
  fetchCustomerData();
  }, [selectedVehicleRegistrationId, dispatch]);

  useEffect(() => {
    if (primaryId) {
      setFormInputs((prevState) => ({
        ...prevState,
        primaryIdentifier: primaryId,
      }));
    }
  }, [primaryId]);

  const closePopup = () => {
    setShowPopup(false);
    setErrorIcon("");
    setErrorTitle("");
    setError("");
  };

  const [formInputs, setFormInputs] = useState({
    quoteType: "INSURANCE_QUOTE",
    customerType: "REGISTERED_CUSTOMER",
    customerId: "",
    customerName: "",
    vehicleId: "",
    vehicleRegNo: "",
    insuranceId: "",
    jobTypeId: "",
    quoteDueDate: "",
    priorityId: "",
    notes: "",
    comments: "",
    isPercent: true,
    quoteTotal: "",
    quoteDiscount: "",
    quoteTax: "",
    quoteSubTotal: "",
    quotePartsIds: [],
    quoteServiceIds: [],
    primaryIdentifier: quote.primaryIdentifier || primaryId || "",
    createdDate: format(new Date(), dateFormat.API_NATIVE),
    registeredBy: email,
  });

  useEffect(() => {
    if (isEdit && quote) {
      setSpareParts([]);
      setServices([]);
      setFormInputs({
        id: sId,
        quoteType: quote.quoteType,
        customerType: quote.customerType,
        customerId: quote.customerId,
        customerName: quote.customerName,
        vehicleId: quote.vegRegId,
        vehicleRegNo: quote.vegRegNum,
        insuranceId: quote.insuranceName,
        jobTypeId: quote.jobTypeId,
        quoteDueDate: quote.quoteDueDate,
        priorityId: quote?.priority,
        notes: quote?.notes,
        comments: quote?.comments,
        isPercent: quote.ispercent,
        quoteTotal: quote.finalAmount,
        quoteDiscount: quote.discount,
        quoteTax: quote.tax,
        quoteSubTotal: quote.subTotal,
        quotePartsIds: quote?.partCategoryListDto?.flatMap(item => item.quotePartsDtoList)?.map(part => part.id),
        quoteServiceIds: quote?.serviceCategoryListDto?.flatMap(item => item.quoteServicesDtos)?.map(service => service.id),
        primaryIdentifier: quote.quoteId || primaryId || "",
        createdDate: quote.quoteCreatedDate	,
        registeredBy: quote.quoteCreatedBy
      });

      setPrevFormInputs({
        customerName: quote.customerName,
        vehicleRegNo: quote.vegRegNum,
      });
      setSpareParts(
        quote?.partCategoryListDto?.flatMap(item => item.quotePartsDtoList)?.map(part => ({
          ...part,
          isExisting: true
        }))
      );
      setServices(
        quote?.serviceCategoryListDto?.flatMap(item => item.quoteServicesDtos)?.map(service => ({
          ...service,
          isExisting: true,
          linkedSpareParts: service.linkedSpareParts || [], 
        }))
      );

      setDiscountType(quote.ispercent ? "Percent" : "Amount");
    }
  }, [isEdit, quote]);

  const [prevFormInputs, setPrevFormInputs] = useState({
    vehicleRegNo: formInputs.vehicleRegNo,
    customerName: formInputs.customerName,
  });

  const [errors, setErrors] = useState({
    quoteType: "",
    customerType: "",
    customerId: "",
    customerName: "",
    vehicleId: "",
    vehicleRegNo: "",
    insuranceId: "",
    jobTypeId: "",
    quoteDueDate: "",
    priorityId: "",
    notes: "",
    comments: "",
    isPercent: "",
    quoteTotal: "",
    quoteDiscount: "",
    quoteTax: "",
    quoteSubTotal: "",
    quotePartsIds: [],
    quoteServiceIds: [],
    primaryIdentifier: "",
    createdDate: format(new Date(), dateFormat.API_NATIVE),
    registeredBy: email,
  });

  const handleAddSparePartClick = () => {
    setSparePartPopup(true);
  };

  const handleAddServiceClick = () => {
    setServicePopup(true);
  };

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

  const handleConfirmCancel = async () => {
    setTempLinkedSpareParts([]);
    setShowCancelPopup(false);
    
    const tempEditedSparePartIds = getTempEditedQuoteSpareParts();
    const tempEditedServiceIds = getTempEditedQuoteServices();

    const removalEditedData = {
      quotePartsIds: tempEditedSparePartIds || [],
      quoteServiceIds: tempEditedServiceIds || []
    };

    if (removalEditedData.quotePartsIds.length > 0 || removalEditedData.quoteServiceIds.length > 0) {
      await dispatch(removeUpdatedPartService(removalEditedData)).unwrap();

      clearTempEditedQuoteSpareParts();
      clearTempEditedQuoteServices();
    }

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

  const calculateSubTotal = () => {
    const totalServiceCost = services?.reduce(
      (sum, service) => sum + parseFloat(String(service.totalServiceCost || "0").replace(/,/g, "")),
      0
    );
    const totalPartCost = spareParts?.reduce(
      (sum, part) => sum + parseFloat(String(part.totalPartCost || "0").replace(/,/g, "")),
      0
    );
    return (totalServiceCost + totalPartCost).toFixed(2);
  };

  useEffect(() => {
    const subTotal = calculateSubTotal();
    setFormInputs((prev) => ({
      ...prev,
      quoteSubTotal: subTotal,
    }));
  }, [services, spareParts]);

  const calculateTotal = () => {
    const subTotal = parseFloat(formInputs.quoteSubTotal || 0);
    const discount = parseFloat(formInputs.quoteDiscount || 0);
    const tax = parseFloat(formInputs.quoteTax || 0);
  
    let discountAmount = 0;
  
    // Calculate discount based on type (Percent or Amount)
    if (discountType === "Percent") {
      discountAmount = (subTotal * discount) / 100; // Discount as percentage of Sub Total
    } else {
      discountAmount = discount; // Direct discount amount
    }
  
    // Calculate tax as a percentage of Sub Total
    const taxAmount = (subTotal - discountAmount) * (tax / 100);
  
    // Calculate Total: (Sub Total - Discount) + Tax
    const total = (subTotal - discountAmount) + taxAmount;
  
    return total.toFixed(2); // Return total rounded to 2 decimal places
  };

  useEffect(() => {
    const total = calculateTotal();
    setFormInputs((prev) => ({
      ...prev,
      quoteTotal: total,
    }));
  }, [formInputs.quoteSubTotal, formInputs.quoteDiscount, formInputs.quoteTax, discountType]);

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

    setFormInputs({ ...formInputs, quoteDiscount: value });

    const error = validateField("quoteDiscount", value);

    // Update the errors state
    setErrors((prev) => ({
      ...prev,
        quoteDiscount: error,
    }));
  };

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

    setFormInputs({ ...formInputs, quoteTax: value });
  };

  const handleAddInsuranceCompany = async (data) => {
      try {
          const response = await dispatch(addInsuranceCompany(data.value)).unwrap();
          await dispatch(fetchAllInsuranceCompanyList());
          notification.success({
            message: <h5>Insurance company added successfully!</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5
          });
          return response;
      } catch (error) {
          console.error("Error:", error);
          return error;
      }
  };

  const validateField = (name, value) => {
    let error = "";
  
    switch (name) {
      case "customerId":
        if (formInputs.customerType === "REGISTERED_CUSTOMER" && !value) {
          error = "Customer Name field is required";
        }
        break;
  
      case "customerName":
        if (formInputs.customerType === "GUEST_CUSTOMER") {
          if (!value) {
            error = "Customer Name field is required";
          } else if (value.length > 60) {
            error = "Enter a value that doesn't exceed 60 characters";
          } else if (!/^[A-Za-z\s]+$/.test(value)) {
            error = "Only alphabetic characters and spaces are allowed.";
          }
        }
        break;
  
      case "vehicleId":
        if (formInputs.customerType === "REGISTERED_CUSTOMER" && !value) {
          error = "Vehicle Registration Number field is required";
        }
        break;
  
      case "vehicleRegNo":
        if (formInputs.customerType === "GUEST_CUSTOMER") {
          if (!value) {
            error = "Vehicle Registration Number field is required";
          } else if (value.length < 5 || value.length > 12) {
            error = "Length should be between 5 to 12 characters.";
          } else if (!/^[A-Za-z0-9-]+$/.test(value)) {
            error = "Only alphanumeric characters and '-' are allowed.";
          } else if (!value.includes("-")) {
            error = "Vehicle Registration Number must contain a '-' symbol.";
          }
        }
        break;
  
      case "insuranceId":
        if (formInputs.quoteType === "INSURANCE_QUOTE" && !value) {
          error = "Insurance Name field is required";
        }
        break;
  
      case "jobTypeId":
        if (!value) {
          error = "Job Type field is required";
        }
        break;
  
      case "notes":
        if (value?.length > 500) {
          error = "Enter a value that doesn't exceed 500 characters";
        }
        break;
  
      case "comments":
        if (value?.length > 500) {
          error = "Enter a value that doesn't exceed 500 characters";
        }
        break;
  
      case "quoteDiscount":
        if (value) {
          const subTotal = parseFloat(formInputs.quoteSubTotal || 0);
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

  const handleValidation = () => {
    let formErrors = {};
    let isValid = true;
  
    // Validate all fields
    Object.keys(formInputs).forEach((fieldName) => {
      const error = validateField(fieldName, formInputs[fieldName]);
      if (error) {
        formErrors[fieldName] = error;
        isValid = false;
      }
    });
  
    if (!isValid) {
      setErrors(formErrors);
      notification.error({
        message: <h5>Validation failed. Ensure all fields are correct.</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    }
  
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setIsFormModified(true);

    // Update the form inputs
    setFormInputs((prev) => ({
      ...prev,
      [name]: type === "radio" ? value === "true" : value,
    }));

    // Validate the field in real-time
    const error = validateField(name, value);

    // Update the errors state
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleEditSparePart = (item) => {
    console.log(item)
    setEditingPartItem(item);
    setSparePartPopup(true);
  };

  const handleSparePartSubmit = (values) => {
    // isEdit -> is edit quote
    // editingPartItem -> edit spare part (create quote + edit quote)
    if (isEdit) {
      if (editingPartItem?.isExisting) {
        return handleSparePartUpdate(values);
      } else {
        return handleSparePartSave(values);
      }
    } else {
        return handleSparePartSave(values);
    }
  };

  const handleSparePartSave = async (inputs) => {
    try {
        let isDuplicate;
        if (editingPartItem) {
          isDuplicate = spareParts.some((part) => 
              part.partsId.toLowerCase() === inputs.partsId.toLowerCase() &&
              part.quantity === inputs.quantity
          );
        } else {
            isDuplicate = spareParts.some((part) => 
                part.partsId.toLowerCase() === inputs.partsId.toLowerCase()
            );
        }
    
        if (isDuplicate) {
          notification.error({
            message: <h5>The spare part has already been added to the quote.</h5>,
            icon: <img src={Icons.error} alt="Error" />,
            duration: 5,
          });
          return;
        }

        const response = await dispatch(saveQuoteSparePart(inputs)).unwrap();

        if (response?.id) {
          notification.success({
            message: <h5>Spare Part {editingPartItem ? "updated" : "added"} successfully!</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5
          });

          if (editingPartItem) {
              setSpareParts((prevParts) => {
                const index = prevParts.findIndex((part) => part.id === response.id);
      
                if (index !== -1) {
                  const updatedParts = [...prevParts];
                  updatedParts[index] = { ...updatedParts[index], ...response, partsId: inputs.partsId };
                  return updatedParts;
                }
                return prevParts;
              });
          } else {
              setFormInputs((prev) => ({
                ...prev,
                quotePartsIds: [...prev.quotePartsIds, response.id],
              }));
              setSpareParts((prevParts) => [
                ...prevParts,
                { ...response, partsId: inputs.partsId, isExisting: false },
              ]);
              /*if (tempLinkedSpareParts.some((change) => change.sparePartId === response.id)) {
                setAssignedSpareParts((prev) => [...prev, response.id]);
              }*/
          }
          setIsFormModified(true);
        }
        return response;
      } catch (error) {
        throw error;
      }
  };

  const handleSparePartUpdate = async (inputs) => {
    try {
        const dataToSend = {
          quotePartsId: inputs.id,
          quantity: inputs.quantity,
          unitPrice: inputs.unitPrice,
          totalPartCost: inputs.totalPartCost,
        };

        const response = await dispatch(updateQuoteSparePart(dataToSend)).unwrap();

        if (response?.id) {

          const currentIds = Array.isArray(getTempEditedQuoteSpareParts())
          ? getTempEditedQuoteSpareParts()
          : [];
          const newIds = [...currentIds, inputs.id];
          saveTempEditedQuoteSpareParts(newIds);

          notification.success({
            message: <h5>Spare Part updated successfully!</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5
          });


          setSpareParts((prevParts) => {
            const index = prevParts.findIndex((part) => part.id === response.id);
  
            if (index !== -1) {
              const updatedParts = [...prevParts];
              updatedParts[index] = { ...updatedParts[index], ...response };
              return updatedParts;
            }
            return prevParts;
          });

          setServices((prevServices) =>
            prevServices.map((service) => ({
              ...service,
              linkedSpareParts: service.linkedSpareParts.map((part) =>
                part.id === response.id
                  ? { ...part, sparePartName: response.partsName }
                  : part
              ),
            }))
          );

          setIsFormModified(true);
        }
        return response;
      } catch (error) {
        throw error;
      }
  };

  const handleEditService = (item) => {
    setEditingItem(item);
    setServicePopup(true);
  };

  const handleServiceSubmit = (values) => {
    // isEdit -> is edit quote
    // editingItem -> edit service (create quote + edit quote)
    if (isEdit) {
      if (editingItem?.isExisting) {
        return handleServiceUpdate(values);
      } else {
        return handleServiceSave(values);
      }
    } else {
        return handleServiceSave(values);
    }
  };

  const handleServiceSave = async (inputs) => {
    try {
        const isDuplicate = services.some((service) => {
          return service.serviceId.toLowerCase() === inputs.serviceId.toLowerCase();
        });
    
        if (isDuplicate) {
          notification.error({
            message: <h5>The service has already been added to the quote.</h5>,
            icon: <img src={Icons.error} alt="Error" />,
            duration: 5,
          });
          return;
        }

        let dataToSend = {
          serviceId: inputs.serviceId,
        };
        
        if (editingItem) {
          dataToSend = {
            id: inputs.quoteServiceId,
            serviceId: inputs.serviceId,
          };
        }
        
        const response = await dispatch(saveQuoteService(dataToSend)).unwrap();

        if (response?.id) {
          notification.success({
            message: <h5>Service {editingItem ? "updated" : "added"} successfully!</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5
          });

          if (editingItem) {
            setServices((prevServices) => {
              const index = prevServices.findIndex((service) => service.id === response.id);
    
              if (index !== -1) {
                const updatedServices = [...prevServices];
                updatedServices[index] = { ...updatedServices[index], ...response };
                return updatedServices;
              }
              return prevServices;
            });
          } else {
              setFormInputs((prev) => ({
                ...prev,
                quoteServiceIds: [...prev.quoteServiceIds, response.id],
              }));
              setServices((prevServices) => [
                ...prevServices,
                { ...response, serviceId: inputs.serviceId, serviceCategoryId: inputs.serviceCategory, isExisting: false, linkedSpareParts: [] },
              ]);
          }
          setIsFormModified(true);
        }
        return response;
      } catch (error) {
          throw error;
      }
  };

  const handleServiceUpdate = async (inputs) => {
    try {
        const dataToSend = {
          quoteServiceId: inputs.quoteServiceId,
          hours: inputs.hours,
          totalServiceCost: inputs.totalServiceCost
        }
        const response = await dispatch(updateQuoteService(dataToSend)).unwrap();

        if (response?.id) {

          const currentIds = Array.isArray(getTempEditedQuoteServices()) 
          ? getTempEditedQuoteServices() 
          : [];
          const newIds = [...currentIds, inputs.quoteServiceId];
          saveTempEditedQuoteServices(newIds);

          notification.success({
            message: <h5>Service updated successfully!</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5
          });
    
          setServices((prevServices) => {
            const index = prevServices.findIndex((service) => service.id === response.id);
  
            if (index !== -1) {
              const updatedServices = [...prevServices];
              updatedServices[index] = { ...updatedServices[index], ...response };
              return updatedServices;
            }
            return prevServices;
          });
          setIsFormModified(true);
        }
        return response;
      } catch (error) {
          throw error;
      }
  };

  const handleDeleteSuccess = (deletedId) => {
    if (isDelete?.type === "sparePart") {
        setSpareParts((prevParts) => prevParts.filter(part => part.id !== deletedId));
        setFormInputs((prev) => ({
          ...prev,
          quotePartsIds: prev.quotePartsIds.filter(id => id !== deletedId),
        }));
         // Remove any temporary linked spare parts for the deleted spare part
        setTempLinkedSpareParts((prev) =>
          prev.filter((change) => change.sparePartId !== deletedId)
        );

        setServices((prevServices) =>
          prevServices.map((service) => ({
            ...service,
            linkedSpareParts: service.linkedSpareParts.filter(
              (part) => part.id !== deletedId
            ),
          }))
        );
        setUpdatePartsKey(Math.random());
    } else if (isDelete?.type === "service") {
        setServices((prevServices) => prevServices.filter(service => service.id !== deletedId));
        setFormInputs((prev) => ({
          ...prev,
          quoteServiceIds: prev.quoteServiceIds.filter(id => id !== deletedId),
        }));

        setTempLinkedSpareParts((prev) =>
          prev.filter((change) => change.serviceId !== deletedId)
        );
    }
  };

  const processLinkedSpareParts = async () => {
    const validChanges = tempLinkedSpareParts.filter((change) =>
      spareParts.some((part) => part.id === change.sparePartId)
    );
    
    if (validChanges.length === 0) {
      console.log("No real changes to process.");
      return; // No unnecessary API calls
    }

    let hasError = false;
  
    for (const change of validChanges) {
      const partDetails = {
        quoteServiceId: change.serviceId,
        isDeleted: !change.isLinked,
        quotePartsId: [change.sparePartId],
      };
  
      try {
        await dispatch(assignSparePartToService(partDetails)).unwrap();
      } catch (error) {
        console.error("Error linking/unlinking spare part:", error);
        hasError = true; 
        const errorMessage =
        error?.errors?.[0] || error?.message || "Failed to update status.";
        
        notification.error({
          message: <h5>{errorMessage}</h5>,
          icon: <img src={Icons.error} alt="Error" />,
          duration: 5,
        });
      }
      if (!hasError) {
        // Clear temp changes only if all API calls were successful
        setTempLinkedSpareParts([]);
      } else {
        throw new Error("Spare part update failed."); // Prevent further execution
      }
    }
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (spareParts.length === 0 && services.length === 0) {
      notification.error({
        message: <h5>At least one spare part or service must be added to create a quote.</h5>,
        icon: <img src={Icons.error} alt="Success" />,
        duration: 5
      });
      return;
    }
    const valid = handleValidation();
    if (valid) {
      setIsLoading(true);
      let customerId = formInputs.customerId;
      let vehicleId = formInputs.vehicleId;

      // If the customer type is GUEST_CUSTOMER, save the customer name and vehicle registration number first
        if (formInputs.customerType === "GUEST_CUSTOMER") {
          try {
              const guestCustomerData = {
                name: formInputs.customerName,
                customerType: "GUEST_CUSTOMER",
                vehicle: [
                  {
                    vehicleRegNumber: formInputs.vehicleRegNo,
                  },
                ],
              };

              // Call the API to save guest customer details
              const guestCustomerResponse = await dispatch(
                saveQuoteCustomerNameWithVehicleNo(guestCustomerData)
              ).unwrap();


              // Update formInputs with the returned customerId and vehicleId
            customerId = guestCustomerResponse.id;
            vehicleId = guestCustomerResponse.vehicleRequestDtoList[0].vehicleId;

          } catch (error) {
              setErrors((prevErrors) => ({
                ...prevErrors,
                vehicleRegNo: error.errors.join(", "), 
              }));

              notification.error({
                message: <h5>Validation failed. Ensure all fields are correct.</h5>,
                icon: <img src={Icons.error} alt="Error" />,
                duration: 5,
              });
          }
      }

      try {
        if (tempLinkedSpareParts.length > 0) {
          await processLinkedSpareParts();
        }

        const dataToSend = {
          quoteType: formInputs.quoteType,
          customerId: customerId,
          vehicleId: vehicleId,
          insuranceId: formInputs.insuranceId,
          jobTypeId: formInputs.jobTypeId,
          quoteDueDate: formInputs.quoteDueDate,
          priorityId: formInputs.priorityId || null,
          notes: formInputs.notes,
          comments: formInputs.comments,
          isPercent: formInputs.isPercent,
          quoteTotal: parseFloat(formInputs.quoteTotal) || 0,
          quoteDiscount: parseFloat(formInputs.quoteDiscount) || 0,
          quoteTax: parseFloat(formInputs.quoteTax) || 0,
          quoteSubTotal: parseFloat(formInputs.quoteSubTotal) || 0,
          quotePartsIds: formInputs.quotePartsIds,
          quoteServiceIds: formInputs.quoteServiceIds
        }
        
        // Store the data to be used after confirmation
        setDataToSend(dataToSend);
        setShowShareConfirmation(true);
        return;
        
        if (saveQuote.fulfilled.match(resultAction)) {
          // Moved to saveData function
        } else if (resultAction.payload?.errors) {
          const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
            if (error.includes("Quote type")) {
              acc.quoteType = error;
            }
            if (error.includes("customer")) {
              acc.customerId = error;
            }
            if (error.includes("customer")) {
              acc.customerName = error;
            }
            if (error.includes("vehicle")) {
              acc.vehicleId = error;
            }
            if (error.includes("Vehicle registration number")) {
              acc.vehicleId = error;
            }
            if (error.includes("insurance")) {
              acc.insuranceId = error;
            }
            if (error.includes("jobType")) {
              acc.jobTypeId = error;
            }
            if (error.includes("priority")) {
              acc.priorityId = error;
            }
            if (error.includes("notes")) {
              acc.notes = error;
            }
            if (error.includes("comments")) {
              acc.comments = error;
            }
            if (error.includes("Sub total")) {
              acc.quoteSubTotal = error;
            }
            if (error.includes("tax")) {
              acc.quoteTax = error;
            }
            if (error.includes("discount")) {
              acc.quoteDiscount = error;
            }
            if (error.includes("total cost")) {
              acc.quoteTotal = error;
            }
            if (error.includes("due date")) {
              acc.quoteDueDate = error;
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
  
  const handleSparePartLink = (service, selectedPart, isChecked) => {
    if (!selectedPart) return;
  
    // Find the full spare part details from the spareParts list
    const sparePartDetails = spareParts.find((part) => part.id === selectedPart.id);
  
    if (!sparePartDetails) {
      console.error("Spare part details not found for ID:", selectedPart.id);
      return;
    }
  
    // Only check original linkage in edit mode
    const wasOriginallyLinked = isEdit
      ? service.linkedSpareParts?.some((part) => part.id === selectedPart.id)
      : false;

    setTempLinkedSpareParts((prev) => {
      // Remove from temp if the change cancels out (i.e., no real change)
      const existingChange = prev.find(
        (change) => change.serviceId === service.id && change.sparePartId === selectedPart.id
      );

      if (existingChange) {
        // User toggled the checkbox back to the original state → Remove from temp
        if (existingChange.isLinked !== isChecked) {
          return prev.filter(
            (change) =>
              !(change.serviceId === service.id && change.sparePartId === selectedPart.id)
          );
        }
      }

      // If it's an actual change, update the temp list
      if (wasOriginallyLinked !== isChecked) {
        return [
          ...prev.filter(
            (change) =>
              !(change.serviceId === service.id && change.sparePartId === selectedPart.id)
          ),
          { serviceId: service.id, sparePartId: selectedPart.id, isLinked: isChecked },
        ];
      }

      return prev; // No change, return as is
    });

    // Update excluded parts
    setExcludedParts((prevExcluded) => {
      if (isChecked) {
        return [...prevExcluded, selectedPart.id];
      } else {
        return prevExcluded.filter((id) => id !== selectedPart.id);
      }
    });
    
    // Update the UI state for the dropdown
    setServices((prevServices) =>
      prevServices.map((s) => {
        if (s.id === service.id) {
          return {
            ...s,
            linkedSpareParts: isChecked
              ? [...(s.linkedSpareParts || []), { 
                  id: selectedPart.id, 
                  sparePartName: sparePartDetails.partsName 
                }]
              : (s.linkedSpareParts || []).filter((part) => part.id !== selectedPart.id),
          };
        }
        return s;
      })
    );

    setUpdatePartsKey(Math.random());
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    setErrors({});
    if (spareParts.length === 0 && services.length === 0) {
      notification.error({
        message: <h5>At least one spare part or service must be added to edit a quote.</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5
      });
      return;
    }
    const valid = handleValidation();
    if (valid) {
      setIsLoading(true);
      let customerId = formInputs.customerId;
      let vehicleId = formInputs.vehicleId;
        if (formInputs.customerType === "GUEST_CUSTOMER") {
          const isVehicleRegNoUpdated = formInputs.vehicleRegNo.trim() !== prevFormInputs.vehicleRegNo.trim();
          const isCustomerNameUpdated = formInputs.customerName.trim() !== prevFormInputs.customerName.trim();

          if (isVehicleRegNoUpdated || isCustomerNameUpdated) {
            try {
                const guestCustomerData = {
                  vehicleId: formInputs.vehicleId,
                  vehicleRegNumber: formInputs.vehicleRegNo,
                  customerId: formInputs.customerId,
                  customerName: formInputs.customerName,
                };

                const guestCustomerResponse = await dispatch(
                  editQuoteCustomerNameWithVehicleNo(guestCustomerData)
                ).unwrap();

                customerId = guestCustomerResponse.customerId;
                vehicleId = guestCustomerResponse.vehicleId;

                setPrevFormInputs({
                  vehicleRegNo: formInputs.vehicleRegNo,
                  customerName: formInputs.customerName,
                });

            } catch (error) {
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  vehicleRegNo: error.errors.join(", "), 
                }));

                notification.error({
                  message: <h5>Validation failed. Ensure all fields are correct.</h5>,
                  icon: <img src={Icons.error} alt="Error" />,
                  duration: 5,
                });
                return;
            }
          }
      }
      try {
        if (tempLinkedSpareParts.length > 0) {
          await processLinkedSpareParts();
        }
  
        const dataToSend = {
          id: formInputs?.id,
          quoteType: formInputs?.quoteType,
          customerId: customerId,
          vehicleId: vehicleId,
          insuranceId: formInputs?.insuranceId,
          jobTypeId: formInputs?.jobTypeId,
          quoteDueDate: formInputs?.quoteDueDate,
          priorityId: formInputs?.priorityId || null,
          notes: formInputs?.notes,
          comments: formInputs?.comments,
          isPercent: formInputs?.isPercent,
          quoteTotal: parseFloat(formInputs.quoteTotal) || 0,
          quoteDiscount: parseFloat(formInputs.quoteDiscount) || 0,
          quoteTax: parseFloat(formInputs.quoteTax) || 0,
          quoteSubTotal: parseFloat(formInputs.quoteSubTotal) || 0,
          quotePartsIds: formInputs?.quotePartsIds,
          quoteServiceIds: formInputs?.quoteServiceIds
        };
        if (formInputs.quoteType === "CUSTOMER_QUOTE") {
          dataToSend.customerName = formInputs?.customerName;
          dataToSend.vehicleRegNo = formInputs?.vehicleRegNo;
          dataToSend.insuranceId = null;
        }

        const resultAction = await dispatch(updateQuote(dataToSend));
        if (updateQuote.fulfilled.match(resultAction)) {
          setSpareParts([]);
          setServices([]);
          navigate("/app/quote-management");
          notification.success({
            message: <h5>Updated Successfully!</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5,
          });
        } else if (resultAction.payload?.errors) {
          
            const jobCompletedError = resultAction.payload.errors.find(error => 
              error.includes("update quote")
            );
            
            if (jobCompletedError) {
              notification.error({
                message: <h5>{jobCompletedError}</h5>,
                icon: <img src={Icons.error} alt="Error" />,
                duration: 5,
              });
            }
          } else {
          const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
            if (error.includes("Quote type")) {
              acc.quoteType = error;
            }
            if (error.includes("customer")) {
              acc.customerId = error;
            }
            if (error.includes("customer")) {
              acc.customerName = error;
            }
            if (error.includes("vehicle")) {
              acc.vehicleId = error;
            }
            if (error.includes("insurance")) {
              acc.insuranceId = error;
            }
            if (error.includes("jobType")) {
              acc.jobTypeId = error;
            }
            if (error.includes("priority")) {
              acc.priorityId = error;
            }
            if (error.includes("notes")) {
              acc.notes = error;
            }
            if (error.includes("comments")) {
              acc.comments = error;
            }
            if (error.includes("Sub total")) {
              acc.quoteSubTotal = error;
            }
            if (error.includes("tax")) {
              acc.quoteTax = error;
            }
            if (error.includes("discount")) {
              acc.quoteDiscount = error;
            }
            if (error.includes("total cost")) {
              acc.quoteTotal = error;
            }
            if (error.includes("due date")) {
              acc.quoteDueDate = error;
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

  const sparePartdata = spareParts?.map((part) => ({
    id: part?.id,
    part_category: categoryMap[part.category] || part.category,
    parts_id: part?.partsId,
    part_name: part?.partsName,
    part_number: part?.quantity,
    unit_cost: formatCost(part.unitCost),
    total_part_cost: formatCost(part.totalPartCost),
    isExisting: part?.isExisting,
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
      name: "Unit Cost - MRP (Rs.)",
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
      name: "Total Part Cost (Rs.)",
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
      maxWidth: "100%",
      minWidth: "100px",
      cell: (row) => (
        <div className="actions">
          <ActionButton
            isViewIcon={false}
            item={row}
            isEditMode={true}
            goToEditData={() => handleEditSparePart(row)} 
            isDownloadMode={false}
            isDeleteMode={true}
            onClickDeleteModel={() => onClickDeleteModel({ id: row.id, name: row.part_name, type: "sparePart", isExisting: row.isExisting, quote_id: row.quote_id })}
          />
        </div>
      ),
    },
  ];

  const assignedSpareParts = services?.flatMap(service => 
    service.linkedSpareParts?.map(part => part.id)
  );

  const sparePartDropdownOptions = spareParts?.filter((part) => !excludedParts?.includes(part.id))?.map((part) => ({
    id: part.id?.toString() || "",
    part_name: part.partsName || "Unknown",
  }));

  const serviceData = services?.map((service) => ({
    id: service?.id,
    service_category: service?.serviceCategory,
    service_category_id: service?.serviceCategoryId,
    service_id: service?.serviceId,
    service_name: service?.serviceName,
    hours: service?.hours,
    hourly_rate: formatCost(service?.hourlyRate),
    total_service_cost: formatCost(service.totalServiceCost),
    isExisting: service.isExisting,
    quote_id: isEdit ? sId : null,
    linkedSpareParts: service?.linkedSpareParts,
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
          Total Service <br /> Cost (Rs.)
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
      id: 5,
      name: "Linked Spare Part",
      grow: 3,
      maxWidth: "100%",
      minWidth: "420px",
      wrap: true,
      cell: (row) => {
        const availableSpareParts = spareParts?.filter((part) => 
          !excludedParts?.includes(part.id) || row?.linkedSpareParts?.some(linkedPart => linkedPart.id === part.id)
        )
        .map((part) => ({
          id: part.id?.toString() || "",
          part_name: part.partsName || "Unknown",
        }));
        return <CustomDropDown
          option={availableSpareParts}
          linkedSpareParts={row.linkedSpareParts}
          assignedSpareParts={assignedSpareParts}
          isEdit={isEdit}
          onChange={(selectedPart, isChecked) =>
            handleSparePartLink(row, selectedPart, isChecked)
          }
        />;
      },
    },
    {
      id: 6,
      name: "",
      selector: (row) => null,
      maxWidth: "100%",
      minWidth: "100px",
      cell: (row) => (
        <div className="actions">
          <ActionButton
            isViewIcon={false}
            item={row}
            isEditMode={true}
            goToEditData={() => handleEditService(row)}
            isDownloadMode={false}
            isDeleteMode={true}
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

  const customerNames = allCustomerList?.map((option) => ({
    label: option.clientName,
    value: option.id,
  }));

  const registrationNumbers = allVehicleRegistrationList?.map((option) => ({
    label: option.vehicleRegNum,
    value: option.id,
  }));

  useEffect(() => {
    if (formInputs.quoteType === "INSURANCE_QUOTE") {
      const accidentalRepair = allJobTypes?.find(
        (job) => job.jobType === "Accident Repair"
      );
      
      // if (accidentalRepair) {
      //   setFormInputs((prev) => ({
      //     ...prev,
      //     jobTypeId: accidentalRepair.id,
      //   }));
      // }
    }
  }, [formInputs.quoteType, allJobTypes]);

  const jobTypes = allJobTypes
  .filter(option => 
    formInputs.quoteType === "INSURANCE_QUOTE" 
      ? option.jobType === "Accident Repair"
      : true
  )
  .map((option) => ({
    label: option.jobType,
    value: option.id,
  }));

  const insuranceNames = allInsuranceCompanyList?.map((option) => ({
    label: option.insuranceName,
    value: option.id,
  }));

  const priority = allPriorityList?.map((option) => ({
    label: option.priority,
    value: option.id,
  }));

  return (
    <>
      <div className="form-container qoute">
        <div className="form-header">
          <div className="back">
            <Link to="/app/quote-management">
              <img src={Icons.arrow_left} alt="Back Icon" />
            </Link>
            <h3>
              {isEdit
                ? "Edit Quote/Estimate - " + quote.quoteId
                : "Create New Quote/Estimate"}
            </h3>
          </div>
        </div>
        <Form className="form " layout="vertical">
          <div className="account-credentials">
            <h3 className="info-header">Quote/Estimate Details</h3>
            <div className="form-row">
              <div className="form-item qoute-mobile form-item__full">
                <label className="form-label">
                  <h4>Quote Type</h4>
                </label>

                <div className="input-wrapper input-wrapper__radio ">
                  <div className="radio-wrapper">
                    <input
                      type="radio"
                      id="insurancequote"
                      name="quoteType"
                      value="INSURANCE_QUOTE"
                      checked={formInputs.quoteType === "INSURANCE_QUOTE"}
                      required
                      onChange={handleQuoteTypeChange}
                    />
                    <label className="radio-label" htmlFor="insurancequote">
                      Insurance Quote
                    </label>  
                  </div>
                  <div className="radio-wrapper">
                    <input
                      type="radio"
                      name="quoteType"
                      id="quote-type"
                      value="CUSTOMER_QUOTE"
                      required
                      checked={formInputs.quoteType === "CUSTOMER_QUOTE"}
                      onChange={handleQuoteTypeChange}
                    />
                    <label className="radio-label" htmlFor="quote-type">
                      Customer Quote
                    </label>
                  </div>
                </div>

                {errors.quoteType && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.quoteType}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className={`form-item ${formInputs.customerType === "GUEST_CUSTOMER" ? "d-none" : ""}${isEdit ? " disabled-form-item" : ""}`}>
                <CustomRadioSelect
                  options={customerNames}
                  required
                  className="required"
                  placeholderText={customerListLoading ? "Loading..." : "Select customer name"}
                  loading={customerListLoading}
                  name="customerId"
                  id="customer-name"
                  isValid={errors.customerId ? "invalid" : ""}
                  value={formInputs.customerId}
                  disabled={isEdit}
                  onChange={(selectedValue) => {
                    setSelectedCustomerId(selectedValue.value);
                    setSelectedVehicleRegistrationId(null);
                    setFormInputs((prev) => ({
                      ...prev,
                      customerId: selectedValue.value || "",
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      customerId: "",
                    }));
                  }}
                />
                <label className="form-label  required" htmlFor="customerName">
                  <h4>Customer Name</h4>
                </label>
                {errors.customerId && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.customerId}</h6>
                  </div>
                )}
              </div>
              <div className={`form-item ${formInputs.customerType === "REGISTERED_CUSTOMER" ? "d-none" : ""}`}>
                <input
                  type="text"
                  name="customerName"
                  id="customer-name"
                  required
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
              <div className={`form-item ${formInputs.customerType === "GUEST_CUSTOMER" ? "d-none" : ""}${isEdit ? " disabled-form-item" : ""}`}>
                <CustomRadioSelect
                  options={registrationNumbers}
                  required
                  placeholderText={vehicleListLoading ? "Loading..." : "Select registration number"}
                  loading={vehicleListLoading}
                  className="required"
                  name="vehicleId"
                  isValid={errors.vehicleId ? "invalid" : ""}
                  value={formInputs.vehicleId}
                  disabled={isEdit}
                  onChange={(selectedValue) => {
                    setSelectedVehicleRegistrationId(selectedValue.value);
                    setSelectedCustomerId(null);
                    setFormInputs((prev) => ({
                      ...prev,
                      vehicleId: selectedValue.value || "",
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      vehicleId: "",
                    })); 
                  }}
                /> 
                <label className="form-label required" htmlFor="registrationNumber">
                  <h4>Vehicle Registration Number</h4>
                </label>
                {errors.vehicleId && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.vehicleId}</h6>
                  </div>
                )}
              </div>
              <div className={`form-item ${formInputs.customerType === "REGISTERED_CUSTOMER" ? "d-none" : ""}`}>
                <input
                  type="text"
                  name="vehicleRegNo"
                  id="registration-no"
                  required
                  className={errors["vehicleRegNo"] ? "invalid" : ""}
                  value={formInputs.vehicleRegNo ?? ""}
                  onChange={(e) => handleChange(e)}
                  autoComplete="off"
                />
                <label className="form-label" htmlFor="registration-no">
                  <h4>Vehicle Registration Number</h4>
                </label>
                {errors.vehicleRegNo && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.vehicleRegNo}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className={`form-item ${formInputs.quoteType === "CUSTOMER_QUOTE" ? "inactive-input" : ""}`}>
                {formInputs.quoteType === "CUSTOMER_QUOTE" ? (
                  <>
                    <label className="form-label" htmlFor="insuranceName">
                      <h4>Insurance Name</h4>
                    </label>
                    <div className="dropdown radio-option-dropdown">
                      <Button
                        icon={<img src={Icons.caret_black_down} alt="chevron-down" />}
                        iconPosition="end"
                        className="dropdown-button disabled-select"
                      >
                        Select insurance name
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <GroupRadioSelect
                      options={insuranceNames}
                      placeholderText="Select insurance name"
                      modalTitle="Add a Insurance Company"
                      formFieldLabel="Insurance Company"
                      formPlaceholderText="Enter insurance company"
                      buttonText="Add Insurance Company"
                      disabled={formInputs.quoteType === "CUSTOMER_QUOTE"}
                      name="insuranceId"
                      value={formInputs.insuranceId}
                      isValid={errors["insuranceId"] ? "invalid" : ""}
                      required
                      onAddFormData={handleAddInsuranceCompany} 
                      onChange={(selectedValue) => {
                        setFormInputs((prev) => ({
                          ...prev,
                          insuranceId: selectedValue.value || "",
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          insuranceId: "",
                        }));
                      }}
                    />
                    <label className="form-label" htmlFor="insuranceName">
                      <h4>Insurance Name</h4>
                    </label>
                    {errors.insuranceId && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.insuranceId}</h6>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="form-item ">
                <RadioSelect
                  options={jobTypes}
                  placeholderText="Select job type"
                  required
                  name="jobTypeId"
                  defaultValue={formInputs.jobTypeId}
                  value={formInputs.jobTypeId}
                  isValid={errors["jobTypeId"] ? "invalid" : ""}
                  onChange={(selected) => {
                    setFormInputs((prev) => ({
                      ...prev,
                      jobTypeId: selected.value,
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      jobTypeId: "",
                    }));
                  }}
                />
                <label className="form-label" htmlFor="email">
                  <h4>Job Type</h4>
                </label>
                {errors.jobTypeId && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.jobTypeId}</h6>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="form-section mob-qoute-spare">
            <div className="form-header sub-header notes-header mob-qoute-spare">
              <h3>Spare Part Details</h3>
              <button
                type="button"
                className="button form-button"
                onClick={handleAddSparePartClick}
                id="quote-add-spare-part-button"
              >
                <img src={Icons.plus} alt="Edit Icon" /><span>Add Details</span></button>
            </div>
            <ReactDataTable
              className="spare-parts-table"
              columns={columns}
              totalRows={spareParts?.length}
              items={sparePartdata}
              noRecordsMessage={<span>Click "Add Details" to create a new entry</span>}
            />
          </div>
          <div className="form-section service-table mob-qoute-spare">
            <div className="form-header sub-header notes-header">
              <h3>Service Details</h3>
              <button
                type="button"
                className="button form-button"
                onClick={handleAddServiceClick}
                id="quote-add-service-button"
              >  <img src={Icons.plus} alt="Edit Icon" /><span>Add Details</span></button>
            </div>
            <ReactDataTable
              className="spare-parts-table"
              columns={serviceColumns}
              totalRows={services?.length}
              items={serviceData}
              key={`${excludedParts}-${sparePartDropdownOptions}-${updatePartsKey}`}
              noRecordsMessage={<span>Click "Add Details" to create a new entry</span>}
            />
          </div>
          <div className="account-credentials">
            <h3 className="info-header">Quote/Estimate Details</h3>
            <div className="form-row">
              <div className="form-item disabled-form-item single">
                <input
                  type="text"
                  name="primaryIdentifier"
                  id="quote-id"
                  value={isEdit ? formInputs.primaryIdentifier : primaryId}
                  disabled
                />
                <label className="form-label" htmlFor="quote-id">
                  <h4>Quote ID</h4>
                </label>
                {errors.primaryIdentifier && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.primaryIdentifier}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-item disabled-form-item">
                <div className="position-relative datepicker p-0">
                  <input
                    type="text"
                    name="createdDate"
                    id="added-date"
                    value={formInputs.createdDate}
                    disabled
                  />
                  <img
                    src={Icons.calendar}
                    alt="Calendar Icon"
                    className="input-icon"
                  />
                </div>
                <label className="form-label" htmlFor="added-date">
                  <h4>Quote Created Date</h4>
                </label>
              </div>
              <div className="form-item disabled-form-item">
                <input
                  type="text"
                  name="registeredBy"
                  id="registered-by"
                  disabled
                  value={isEdit ? formInputs.registeredBy : firstName + ' ' + lastName}
                />
                <label className="form-label" htmlFor="registered-by">
                  <h4>Quote Created By</h4>
                </label>
              </div>
            </div>
            <div className="form-row">
              <div className="form-item ">
                <div className="position-relative datepicker p-0">
                  <ReactDatePicker
                    id="due-date"
                    minDate={tomorrow}
                    name="quoteDueDate"
                    defaultDate={
                      formInputs.quoteDueDate && isValid(new Date(formInputs.quoteDueDate))
                        ? new Date(formInputs.quoteDueDate)
                        : null
                    }
                    onChangeDate={(selectedDate) => {
                      if (!selectedDate || isNaN(new Date(selectedDate).getTime())) {
                        setFormInputs((prev) => ({
                          ...prev,
                          quoteDueDate: null,
                        }));
                        return;
                      }

                      setFormInputs((prev) => ({
                        ...prev,
                        quoteDueDate: format(selectedDate, dateFormat.API_NATIVE),
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        quoteDueDate: "",
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
                  <h4>Due Date</h4>
                </label>
                {errors.quoteDueDate && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.quoteDueDate}</h6>
                  </div>
                )}
              </div>
              <div className="form-item ">
                <RadioSelect
                  options={priority}
                  placeholderText="Select priority"
                  name="priorityId"
                  id="quote-id"
                  value={formInputs.priorityId}
                  onChange={(selected) => {
                    setFormInputs((prev) => ({
                      ...prev,
                      priorityId: selected.value,
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      priorityId: "",
                    }));
                  }}
                />
                <label className="form-label" htmlFor="quote-id">
                  <h4>Priority</h4>
                </label>
              </div>
            </div>
          </div>
          <div className="form-section account-credentials">
            <div className="form-header sub-header notes-header">
              <h3>Add Notes</h3>
            </div>
            <div className="form-item form-item__full">
              <textarea
                name="notes"
                id="notes"
                onChange={(e) => handleChange(e)}
                value={formInputs.notes}
              />
              {errors.notes && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.notes}</h6>
                </div>
              )}
            </div>
            <div className="form-header sub-header notes-header" htmlFor="comments">
              <h3>Add Comment</h3>
            </div>
            <div className="form-item form-item__full">
              <textarea
                name="comments"
                id="comments"
                onChange={(e) => handleChange(e)}
                value={formInputs.comments}
              />
              {errors.comments && (
                <div className="field-error">
                  <img src={Icons.warning_circle} alt="Warning Icon" />
                  <h6>{errors.comments}</h6>
                </div>
              )}
            </div>
          </div>
          <div className="account-credentials">
            <h3 className="info-header">Final Cost Details</h3>
            <div className="form-row">
              <div className="form-item disabled-form-item">
                <input 
                  type="text" 
                  name="subTotal"
                  id="sub-total"
                  autoComplete="off" 
                  value={
                    spareParts?.length === 0 && services?.length === 0 
                      ? "" 
                      : parseFloat(formInputs.quoteSubTotal || 0)
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
                {errors.quoteSubTotal && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.quoteSubTotal}</h6>
                  </div>
                )}
              </div>
              <div className="form-item">
                <div className="group-input-wrapper">
                  <input
                    type="text"
                    placeholder="-"
                    name="quoteDiscount"
                    id="quote-discount"
                    className="tax-input"
                    pattern="^\d*\.?\d*$"
                    value={formInputs.quoteDiscount}
                    onChange={handleInputChange}
                    autoComplete="off"
                  />
                  <RadioSelect
                    options={discounts}
                    defaultValue={formInputs.isPercent ? discounts[0] : discounts[1]}
                    name="isPercent"
                    value={formInputs.isPercent ? "Percent" : "Amount"}
                    onChange={(selectedValue) => {
                      setDiscountType(selectedValue.value);
                      setFormInputs((prev) => ({
                        ...prev,
                        isPercent: selectedValue.value === "Percent",
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        isPercent: "",
                      }));
                    }}
                  />
                </div>
                <label className="form-label" htmlFor="discount">
                  <h4>Discount</h4>
                </label>
                {errors.quoteDiscount && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.quoteDiscount}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-item">
                <label className="form-label" htmlFor="quote-tax">
                  <h4>Tax</h4>
                </label>
                <div className="tax-input-wrapper ">
                  <input
                    type="text"
                    placeholder="-"
                    name="quoteTax"
                    id="quote-tax"
                    className="tax-input"
                    pattern="[0-9]*"
                    onChange={handleTaxInputChange}
                    value={formInputs.quoteTax}
                    autoComplete="off"
                  />
                  <span className="percentage-symbol">%</span>
                </div>
              </div>
              <div className="form-item disabled-form-item">
                <input 
                  type="text" 
                  name="Total" 
                  id="total" 
                  autoComplete="off" 
                  value={
                    formInputs.quoteTotal 
                      ? parseFloat(formInputs.quoteTotal)
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
                {errors.quoteTax && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.quoteTax}</h6>
                  </div>
                )}
                {errors.quoteTotal && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.quoteTotal}</h6>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="form-footer">
            <button
              type="submit"
              className="button button-submit"
              onClick={isEdit ? onUpdate : onSubmit}
              disabled={isLoading}
              id={isEdit ? "quote-update-button" : "quote-submit-button"}
            >
              <h5>
                {isLoading
                  ? "Saving... Please wait."
                  : isEdit
                    ? "Update"
                    : "Create Quote/Estimate"}
              </h5>
            </button>
            <button
              type="button"
              className="button button-cancel"
              onClick={handleCancelClick}
              id="quote-cancel-button"
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
                <span className="close-icon" onClick={closePopup}></span>
                <img src={errorIcon} alt="error" className="error-icon" />
                <h2>{errorTitle}</h2>
                {errorTitle !== error ? <p>{error}</p> : <p></p>}
                <button onClick={closePopup}>Retry</button>
              </div>
            </div>
          </>
        )}
        
        {showShareConfirmation && (
          <ActionModal
            onClickConfirmModel={async () => {
              // Save and share with client
              await saveData(true);
            }}
            onClickCancelModel={async () => {
              // Save without sharing
              await saveData(false);
            }}
            title="Share Quote with Client"
            subtext={<>Do you want to send this quote <br /> to the client?</>}
            yestBtnTxt="Yes, Send Now"
            noBtnTxt="No"
            isConfirmDisabled={isSaving}
            loading={isSaving}
            className="share-invoice-modal"
            id="quote-form-share-modal"
          />
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

      <DeleteSparePartService
          onClickDeleteModel={onClickDeleteModel}
          deleteModel={deleteModel}
          onDelete={isDelete}
          dataType="record"
          onDeleteSuccess={handleDeleteSuccess}
          tempLinkedSpareParts={tempLinkedSpareParts}
          processLinkedSpareParts={processLinkedSpareParts} 
      />
    </>
  );
};

export default QuoteForm;
