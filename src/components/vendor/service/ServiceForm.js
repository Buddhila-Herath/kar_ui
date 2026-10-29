import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, notification, Spin } from "antd";
import Icons from "../../../utils/icons";
import RadioSelect from "../../../shared/select/RadioSelect";
import GroupSelect from "../../../shared/select/GroupSelect";
import GroupMultipleSelect from "../../../shared/select/GroupMultipleSelect";
import UploadComponent from "../../../shared/upload/UploadComponent";
import { Tokens } from "../../../constants/index";
import { dateFormat } from '../../../constants';
import { format, parse } from "date-fns";
import {
  fetchAllServiceRateTypes,
  fetchAllServicesCategory,
  fetchAllVariations,
  fetchServiceTypesByCategory,
  fetchAllTechnicanTypes,
  fetchAllTechnicanTypesBasedOnServiceType,
  fetchAllRequiredSpareParts,
  searchRequiredSpareParts,
} from "../../../slices/masterDataSlice";
import {
  generatePrimaryId,
  getTotalCost,
  saveServices,
  uploadServiceChecklist,
  uploadServiceNoteFile,
  updateServices,
  updateAdminServices
} from "../../../slices/vendor/serviceSlice";
import FormMultipleSelect from "../../../shared/select/FormMultipleSelect";
import CustomMultiSelectWithApiSearch from "../../../shared/select/CustomMultiSelectWithApiSearch";
import moment from "moment";
import CancelModal from "../../../shared/components/CancelModal";

const ServiceForm = ({ service = {}, isEdit = false, sId = 0 }) => {
  const { portal } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const firstName = localStorage.getItem(Tokens.FIRST_NAME);
  const lastName = localStorage.getItem(Tokens.LAST_NAME);
  const email = localStorage.getItem(Tokens.EMAIL);
  const {
    allServicesCategory,
    allServiceRateTypes,
    allVariations,  
    allServicesTypes,
    allTechnicanTypes,
    technicianTypesByService,
    allRequiredSpareParts,
    requiredSparePartsLoading,
  } = useSelector((state) => state.masterData);
  const { primaryId } = useSelector((state) => state.vendorServices);
  const [disabledFormItem, setDisabledFormItem] = useState(true);
  const [errorIcon, setErrorIcon] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(false);
  const [isCostLoading, setIsCostLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadErrorDescription, setUploadErrorDescription] = useState("");
  const [files, setFiles] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [notesFile, setNotesFile] = useState(null);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [hasActiveNote, setHasActiveNote] = useState(true);
  const [isFormModified, setIsFormModified] = useState(false);
  const [initialFormSnapshot, setInitialFormSnapshot] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [rateSelectKey, setRateSelectKey] = useState(0);
  const [techSelectKey, setTechSelectKey] = useState(0);
  const [hasAppliedEditType, setHasAppliedEditType] = useState(false);

  useEffect(() => {
    dispatch(fetchAllServicesCategory());
    dispatch(fetchAllServiceRateTypes());
    dispatch(fetchAllVariations());
    dispatch(fetchAllTechnicanTypes());
    dispatch(fetchAllRequiredSpareParts());
    dispatch(generatePrimaryId());    
  }, [dispatch]);

  const [formInputs, setFormInputs] = useState({
    serviceId: "",
    serviceName: "",
    description: "",
    serviceCategory: "",
    pathsRequired: "YES",
    partsDtoList: [],
    variationRequestDtos: [],
    serviceChecklistDtos: [],
    serviceType: "",
    serviceSubType: "",
    technicianTypesListDto: {
      technicianType: [],
      technicianSubType: [],
    },
    hours: "",
    serviceRateType: "",
    serviceNotesList: [],
    servicePrimaryIdentifier: service.servicePrimaryIdentifier || primaryId || "",  // Handles both cases
    serviceCreatedBy: email,
    additionalCost: "",
    serviceCreatedDate: format(new Date(), dateFormat.API_NATIVE),
    lastUpdatedDate: format(new Date(), dateFormat.API_NATIVE),
    isAdmin: false,
  });

  useEffect(() => {
    if (formInputs.serviceCategory) {
      dispatch(fetchServiceTypesByCategory(formInputs.serviceCategory));
    }
  }, [dispatch, formInputs.serviceCategory]);

  useEffect(() => {
    if (primaryId && isEdit === false) {
      setFormInputs((prevState) => ({
        ...prevState,
        servicePrimaryIdentifier: primaryId,
      }));
    }
  }, [primaryId]);

  useEffect(() => {
    return () => {
      dispatch({ type: "vendorSpareparts/resetPrimaryId" });
    };
  }, []);

  const serviceCategoryOptions = allServicesCategory.map((option) => ({
    label: option.serviceCategoryName,
    value: option.id,
  }));

  const variationOptions = allVariations.map((option) => ({
    label: option.variantName,
    value: option.id,
  }));

  const servicesTypeOptions = useMemo(() => {
    if (!formInputs.serviceCategory) return [];
    return allServicesTypes.map((option) => {
      if (
        option.serviceSubTypeDtoList &&
        option.serviceSubTypeDtoList.length > 0
      ) {
        return {
          label: option.serviceTypeName,
          value: option.serviceTypeId,
          options: option.serviceSubTypeDtoList.map((subType) => ({
            label: subType.serviceSubType,
            value: subType.id,
          })),
        };
      } else {
        return {
          label: option.serviceTypeName,
          value: option.serviceTypeId,
        };
      }
    });
  }, [allServicesTypes, formInputs.serviceCategory]); // Only recalculate when `allServicesTypes` changes

  const serviceRateTypeOptions = useMemo(() => {
    let serviceTypeId = null;
    if (formInputs.serviceSubType) {
      const parent = servicesTypeOptions.find((g) => g.options?.some((s) => s.value === formInputs.serviceSubType));
      serviceTypeId = parent?.value || null;
    } else if (formInputs.serviceType) {
      serviceTypeId = formInputs.serviceType;
    }

    if (!serviceTypeId) return [];

    const list = Array.isArray(technicianTypesByService)
      ? technicianTypesByService
      : technicianTypesByService
      ? [technicianTypesByService]
      : [];

    if (list.length === 0) return [];

    const allowedRateTypeIds = new Set(
      list
        .map((t) => t.serviceRateTypeId || t.serviceRateType?.id)
        .filter(Boolean)
    );

    return allServiceRateTypes
      .map((option) => ({ label: option.rateType, value: option.rateTypeId }))
      .filter((opt) => allowedRateTypeIds.has(opt.value));
  }, [allServiceRateTypes, technicianTypesByService, servicesTypeOptions, formInputs.serviceType, formInputs.serviceSubType]);

  const technicianTypeOptions = useMemo(() => {
    let serviceTypeId = null;
    if (formInputs.serviceSubType) {
      const parent = servicesTypeOptions.find((g) => g.options?.some((s) => s.value === formInputs.serviceSubType));
      serviceTypeId = parent?.value || null;
    } else if (formInputs.serviceType) {
      serviceTypeId = formInputs.serviceType;
    }

    if (!serviceTypeId) return [];

    const list = Array.isArray(technicianTypesByService)
      ? technicianTypesByService
      : technicianTypesByService
      ? [technicianTypesByService]
      : [];

    if (list.length === 0) return [];

    const allowedTypeIds = new Set(list.map((t) => t.technicianTypeId || t.technicianType?.id).filter(Boolean));
    const allowedSubTypeIds = new Set(list.map((t) => t.technicianSubTypeId || t.technicianSubType?.id).filter(Boolean));

    return allTechnicanTypes
      .map((option) => {
        const hasSubs = option.technicianSubTypeDtoList && option.technicianSubTypeDtoList.length > 0;
        if (hasSubs) {
          const filteredSubs = option.technicianSubTypeDtoList
            .filter((sub) => allowedSubTypeIds.has(sub.id))
            .map((subType) => ({ label: subType.technicianSubType, value: subType.id }));
          if (filteredSubs.length > 0) {
            return { label: option.technicianTypeName, options: filteredSubs };
          }
          return null;
        } else {
          if (allowedTypeIds.has(option.technicianTypeId)) {
            return { label: option.technicianTypeName, value: option.technicianTypeId };
          }
          return null;
        }
      })
      .filter(Boolean);
  }, [allTechnicanTypes, technicianTypesByService, servicesTypeOptions, formInputs.serviceType, formInputs.serviceSubType]);

  useEffect(() => {
    let serviceTypeId = null;
    let serviceSubTypeId = null;

    if (formInputs.serviceSubType) {
      const parent = servicesTypeOptions.find((g) => g.options?.some((s) => s.value === formInputs.serviceSubType));
      serviceTypeId = parent?.value || null;
      serviceSubTypeId = formInputs.serviceSubType;
    } else if (formInputs.serviceType) {
      serviceTypeId = formInputs.serviceType;
      serviceSubTypeId = null; 
    }

    if (!serviceTypeId) return;

    dispatch(fetchAllTechnicanTypesBasedOnServiceType({ serviceTypeId, serviceSubTypeId }));
  }, [dispatch, formInputs.serviceType, formInputs.serviceSubType, servicesTypeOptions]);

  useEffect(() => {
    const hasServiceSelected = !!(formInputs.serviceType || formInputs.serviceSubType);
    if (!hasServiceSelected) return;

    const currentTypeIds = formInputs.technicianTypesListDto?.technicianType || [];
    const currentSubTypeIds = formInputs.technicianTypesListDto?.technicianSubType || [];
    const currentSelectedIds = [...currentTypeIds, ...currentSubTypeIds].map(String);

    const availableIds = (technicianTypeOptions || [])
      .flatMap((g) => [g, ...(g.options || [])])
      .map((o) => String(o.value));

    const hasValidSelection = currentSelectedIds.some((id) => availableIds.includes(id));
    if (hasValidSelection) return;

    if (technicianTypeOptions && technicianTypeOptions.length > 0) {
      const simple = technicianTypeOptions.find((o) => Object.prototype.hasOwnProperty.call(o, 'value'));
      if (simple && simple.value) {
        setFormInputs((prev) => ({
          ...prev,
          technicianTypesListDto: { technicianType: [simple.value], technicianSubType: [] },
        }));
        setErrors((prev) => ({ ...prev, technicianTypesListDto: "" }));
        return;
      }
      const group = technicianTypeOptions.find((o) => Array.isArray(o.options) && o.options.length > 0);
      if (group && group.options[0]) {
        setFormInputs((prev) => ({
          ...prev,
          technicianTypesListDto: { technicianType: [], technicianSubType: [group.options[0].value] },
        }));
        setErrors((prev) => ({ ...prev, technicianTypesListDto: "" }));
      }
    }
  }, [technicianTypeOptions, formInputs.serviceType, formInputs.serviceSubType, formInputs.technicianTypesListDto]);

  useEffect(() => {
    const hasServiceSelected = !!(formInputs.serviceType || formInputs.serviceSubType);
    if (!hasServiceSelected) return;
    setTechSelectKey((k) => k + 1);
  }, [technicianTypeOptions]);

  useEffect(() => {
    const hasServiceSelected = !!(formInputs.serviceType || formInputs.serviceSubType);
    if (!hasServiceSelected) return;

    const availableRateIds = (serviceRateTypeOptions || []).map((o) => String(o.value));
    const currentRateId = formInputs.serviceRateType ? String(formInputs.serviceRateType) : null;
    const currentRateValid = currentRateId ? availableRateIds.includes(currentRateId) : false;

    if (!currentRateValid && serviceRateTypeOptions && serviceRateTypeOptions.length > 0) {
      setFormInputs((prev) => ({ ...prev, serviceRateType: serviceRateTypeOptions[0].value }));
      setErrors((prev) => ({ ...prev, serviceRateType: "" }));
    }
  }, [serviceRateTypeOptions, formInputs.serviceType, formInputs.serviceSubType, formInputs.serviceRateType]);

  useEffect(() => {
    const hasServiceSelected = !!(formInputs.serviceType || formInputs.serviceSubType);
    if (!hasServiceSelected) return;
    setRateSelectKey((k) => k + 1);
  }, [serviceRateTypeOptions]);

  const RequiredSparePartsOption = allRequiredSpareParts.map((option) => ({
    label: option.productName,
    value: option.productId,
  }));

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


  const [errors, setErrors] = useState({
    serviceId: "",
    serviceName: "",
    description: "",
    serviceCategory: "",
    pathsRequired: "",
    partsDtoList: "",
    variationRequestDtos: "",
    serviceChecklistDtos: "",
    serviceType: "",
    serviceSubType: "",
    technicianTypesListDto: "",
    hours: "",
    serviceRateType: "",
    serviceNotesList: "",
    servicePrimaryIdentifier: "",
    additionalCost: "",
    serviceCreatedDate: "",
    lastUpdatedDate: "",
    noteText: ""
  });
  
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (["pdf"].includes(extension)) return "application/pdf";
    if (["png", "jpg", "jpeg"].includes(extension)) return "image";
    if (["doc", "docx"].includes(extension)) return "application/msword";
    if (["csv"].includes(extension)) return "text/csv";
    if (["txt"].includes(extension)) return "text/txt";
    return "unknown";
  };
  const uniqueId = crypto.randomUUID();

  const [savedNotes, setSavedNotes] = useState([]);
  
  const [notes, setNotes] = useState([
    { id: uniqueId, content: "", attachments: [] },
  ]);

  const addNote = () => {
    /*if (hasActiveNote) return; 
    setNotes([
      ...notes,
      { id: uniqueId, content: "", attachments: [] },
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
    uploadImgPath: "",
  }));
  };

  const removeNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
    setHasActiveNote(false);
    setNoteText('');
    setNotesFile(null);
  };

  const removeNdote = (id) => {
    setSavedNotes((prevNotes) => {
      const updatedNotes = prevNotes.filter((note) => note.serviceNotesId !== id);
      return updatedNotes;
    });
  
    // If no saved notes are left, reset the notes state to show the input section
    if (savedNotes.length === 1) {
      setNotes([{ id: uniqueId, content: "", attachments: [] }]);
      setHasActiveNote(false); // Allow adding a new note
    }
  };

  const handlePartSearch = (searchTerm, onComplete) => {
      if (searchTerm && searchTerm.trim()) {
          dispatch(searchRequiredSpareParts({ 
              searchTerm: searchTerm 
          })).then(() => {
              if (onComplete) {
                  onComplete();
              }
          });
      } else {
          dispatch(fetchAllRequiredSpareParts()).then(() => {
              if (onComplete) {
                  onComplete();
              }
          });
      }
  };


  useEffect(() => {
    if (isEdit && service) {
        const initialValues = {
            id: sId,
            serviceId: service.serviceId,
            serviceName: service.serviceName,
            description: service.description ?? "",
            serviceCategory: service.serviceCategory,
            pathsRequired: service.pathsRequired,
            partsDtoList: service.partsDtoList,
            variationRequestDtos: service.variationRequestDtos,
            serviceChecklistDtos: service.serviceChecklistDtos || [],
            serviceType: service.serviceType,
            serviceSubType: service.serviceType,
            technicianTypesListDto: {
              technicianType: Array.from(new Set(service.technicianTypesDtos?.technicianName || [])),
              technicianSubType: Array.from(new Set(service.technicianTypesDtos?.technicianSubTypeName || [])),
            },
            hours: service.hours,
            serviceRateType: service.serviceRateType,
            serviceNotesList: service.serviceNotesDtos,
            servicePrimaryIdentifier: service.servicePrimaryIdentifier,
            serviceCreatedBy: service.serviceCreatedBy,
            additionalCost: service.additionalCost,
            totalServiceCost: service.totalServiceCost,
            serviceCreatedDate: service.serviceCreatedDate,
            lastUpdatedDate: service.lastUpdatedDate,
        };
        setFormInputs(initialValues);
        setInitialFormSnapshot(initialValues);

        setUploadedFiles(service.serviceChecklistDtos || []);

        if (service.serviceNotesDtos && service.serviceNotesDtos.length > 0) {
          const existingNotes = service.serviceNotesDtos.map((note) => {
            return {
              serviceNotesId: note.serviceNotesId,
              text: note.notes,
              attachments: note.serviceAttachmentsDtoList.length > 0
                ? note.serviceAttachmentsDtoList.map((attachment) => {
                    const fileName = attachment.attachmentPath.split('/').pop();
                    return {
                      name: fileName,         
                      path: attachment.attachmentPath, 
                      type: getFileType(fileName),
                    };
                  })
                : [],
              notesBy: note.notesBy,
              dateTime: note.dateTime,
              createdDate: note.dateTime,
              time: note.time
            };
          });
    
          setSavedNotes(() => [
            ...existingNotes,
          ]);
        }
    }
  }, [isEdit, service]);

  useEffect(() => {
    if (!isEdit || !service || hasAppliedEditType) return;
      const parentService = servicesTypeOptions.find((group) =>
        group.options?.some((sub) => sub.value === service.serviceType)
      );
      if (!parentService && !servicesTypeOptions.length) return; 
      if (parentService) {
        setFormInputs((prev) => ({
          ...prev,
          serviceType: null,
          serviceSubType: service.serviceType,
        }));
      } else {
        setFormInputs((prev) => ({
          ...prev,
          serviceType: service.serviceType,
          serviceSubType: null,
        }));
      }
    setHasAppliedEditType(true);
  }, [isEdit, service, servicesTypeOptions, hasAppliedEditType]);

  useEffect(() => {
    if (formInputs.hours && formInputs.serviceRateType) {
      setIsCostLoading(true);
  
      dispatch(
        getTotalCost({
          hours: formInputs.hours,
          serviceRateTypeId: formInputs.serviceRateType,
          additionalCost: formInputs.additionalCost || 0, 
        }))
        .unwrap()
        .then((result) => { 
          setFormInputs((prevState) => ({
            ...prevState,
            totalServiceCost: result || 0,
          }));
          setIsCostLoading(false);
        })
        .catch(() => {
          setIsCostLoading(false);
        });
    }
  }, [formInputs.hours, formInputs.serviceRateType, formInputs.additionalCost, dispatch]);
  
  const handleRemoveFileFromState = (fileName) => {
    setFormInputs((prevState) => ({
      ...prevState,
      serviceChecklistDtos: prevState.serviceChecklistDtos.filter(
        (file) => !file.serviceCheckListPath.endsWith(fileName)
      ),
    }));
  };

  const handleRemoveExistingChecklistFile = (fileId) => {
    setFormInputs((prevState) => ({
      ...prevState,
      serviceChecklistDtos: prevState.serviceChecklistDtos.filter(
        (file) => file.serviceCheckListId !== fileId
      ),
    }));

    setUploadedFiles((prevFiles) =>
      prevFiles.filter((file) => file.serviceCheckListId !== fileId)
    );
  };
  
  const handleServiceChecklistUpload = async (selectedFile) => {
    if (!selectedFile) return;
    setUploadError('');
    setUploadErrorDescription('');
    setIsImgLoading(true);

      // Collect uploaded file paths (name + size)
    const uploadedFileNames = uploadedFiles.map((file) => `${file.serviceCheckListPath}-${file.size}`);

    // Filter out files that are already uploaded by checking both name and size
    const newFiles = selectedFile.filter(
      (file) => !uploadedFileNames.includes(`${file.name}-${file.size}`)
    );
 

    if (newFiles.length === 0) {
      setIsImgLoading(false);
      return;
    }

    const formData = new FormData();
    newFiles.forEach((f) => formData.append('files', f));

    let uploadedFilePaths = [];

    try {
      const result = await dispatch(uploadServiceChecklist({ formData, primaryId })).unwrap();
      uploadedFilePaths = result;

      // const serviceAttachments = uploadedFilePaths.map(path => ({ serviceCheckListPath: path }));

      if (result) {
        setFormInputs((prevState) => ({
          ...prevState,
          serviceChecklistDtos: [
            ...prevState.serviceChecklistDtos,
            ...uploadedFilePaths.map((path) => ({
              serviceCheckListId: crypto.randomUUID(),
              serviceCheckListPath: path
            }))
          ]
        }));

        // Update the list of uploaded files
        // setUploadedFiles((prev) => [...prev, ...newFiles.map((file) => file.name)]);
        setUploadedFiles((prev) => [
          ...prev,
          ...newFiles.map((file) => ({
            serviceCheckListId: crypto.randomUUID(),
            serviceCheckListPath: file.name
          }))
        ]);
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
        setSavedNotes((prevNotes) => {
          const updatedNotes = prevNotes.filter(note => note.serviceNotesId !== id);
          return updatedNotes;
        });
    
        setFormInputs((prevState) => {
          const updatedServiceNotesList = prevState.serviceNotesList.filter(note => note.serviceNotesId !== id);
          return {
            ...prevState,
            serviceNotesList: updatedServiceNotesList,
          };
        });
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
  
        const uploadResult = await dispatch(uploadServiceNoteFile({ formData, primaryId })).unwrap();
  
        uploadedFilePaths = uploadResult;
      }

      const updatedTime = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
  
      const noteData = {
        serviceNotesId: uniqueId,
        notes: noteText,
        createdDate: format(new Date(), dateFormat.API_NATIVE),
        time: updatedTime,
        serviceAttachmentsDtoList: uploadedFilePaths.map(path => ({ attachmentPath: path })),
      };
  
      // Update formInputs with the new note
      setFormInputs((prev) => ({
        ...prev,
        serviceNotesList: [
          ...prev.serviceNotesList,
          noteData, // Append the new note
        ],
      }));

      const getFileType = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        if (["pdf"].includes(extension)) return "application/pdf";
        if (["png", "jpg", "jpeg"].includes(extension)) return "image";
        if (["doc", "docx"].includes(extension)) return "application/msword";
        if (["csv"].includes(extension)) return "text/csv";
        if (["txt"].includes(extension)) return "text/txt";
        return "unknown";
      };

      // Update savedNotes state for UI
      setSavedNotes((prevNotes) => [
        ...prevNotes,
        {
          serviceNotesId: uniqueId,
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
          notesBy: firstName + ' ' + lastName,
          createdDate: format(new Date(), dateFormat.API_NATIVE),
          createdTime: updatedTime,
          time: updatedTime
        }
      ]);
  
      setNotesSaved(true);  
      setNotesFile(null);
      setNotes([]);
      setNoteText('');
      setHasActiveNote(false);
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

    if (!formInputs.serviceId) {
      formErrors.serviceId = "Service ID field is required";
      isValid = false;
    }

    if (!formInputs.serviceName) {
      formErrors.serviceName = "Service Name field is required";
      isValid = false;
    }
    
    const serviceNameMax = (portal === 'adminPortal') ? 103 : 100;
    if (formInputs.serviceName.length > serviceNameMax) {
      formErrors.serviceName = `Enter a value that doesn't exceed ${serviceNameMax} characters`;
      isValid = false;
    }

    if (formInputs.description.length > 100) {
      formErrors.description = "Enter a value that doesn't exceed 100 characters";
      isValid = false;
    }

    if (!formInputs.serviceCategory) {
      formErrors.serviceCategory = "Service Category field is required";
      isValid = false;
    }

    if (!formInputs.pathsRequired) {
      formErrors.pathsRequired = "Spare Parts Required";
      isValid = false;
    }

    if (formInputs.pathsRequired === "YES" && formInputs.partsDtoList.length === 0) {
      formErrors.partsDtoList = "Required Spare Parts field is required";
      isValid = false;
    }

    if (formInputs.variationRequestDtos.length === 0) {
      formErrors.variationRequestDtos = "Variation field is required";
      isValid = false;
    }

    if (!formInputs.serviceType && !formInputs.serviceSubType) {
      formErrors.serviceType = "Service Type field is required";
      isValid = false;
    }

    if (
      (!formInputs.technicianTypesListDto.technicianType || formInputs.technicianTypesListDto.technicianType.length === 0) &&
      (!formInputs.technicianTypesListDto.technicianSubType || formInputs.technicianTypesListDto.technicianSubType.length === 0)
    ) {
      formErrors.technicianTypesListDto = "Technician Type field is required";
      isValid = false;
    }

    if (!formInputs.hours) {
      formErrors.hours = "Hours field is required";
      isValid = false;
    } else if (isNaN(Number(formInputs.hours)) || Number(formInputs.hours) < 0) {
      formErrors.hours = "Enter a valid numeric value";
      isValid = false;
    }

    if (!formInputs.serviceRateType) {
      formErrors.serviceRateType = "Service Rate Type field is required";
      isValid = false;
    }

    if (formInputs.additionalCost && (isNaN(Number(formInputs.additionalCost)) || Number(formInputs.additionalCost) < 0)) {
      formErrors.additionalCost = "Enter a valid numeric value";
      isValid = false;
    }

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
    const { name, value } = e.target;
    setIsFormModified(true);
  
    setFormInputs((prev) => {
      let updatedInputs = { ...prev, [name]: value };
      if (name === "pathsRequired" && value === "NO") {
        const { partsDtoList, ...rest } = updatedInputs;
        updatedInputs = rest;
      } else if (name === "pathsRequired" && value === "YES") {
        updatedInputs.partsDtoList = prev.partsDtoList || [];
      }
  
      return updatedInputs;
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      noteText: "",
    }));
  }; 

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if ((noteText.trim() || (notesFile && notesFile.length > 0)) && notesSaved === false) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        uploadImgPath: "Please save the note before adding the service.",
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

        const transformedServiceNotesList = formInputs.serviceNotesList.map((note) => ({
          notes: note.notes,
          serviceNotesCreatedDate: note.createdDate,
          serviceNotesCreatedTime: note.time ?? note.dateTime,
          serviceAttachmentsDtoList: note.serviceAttachmentsDtoList.map((attachment) => ({
            attachmentPath: attachment.attachmentPath,
          })),
        }));

        const dataToSend = {
          serviceId: formInputs.serviceId,
          serviceName: formInputs.serviceName,
          description: formInputs.description.trim() === "" ? null : formInputs.description,
          serviceCategory: formInputs.serviceCategory,
          pathsRequired: formInputs.pathsRequired,
          partsDtoList: formInputs.pathsRequired === "YES" ? formInputs.partsDtoList.map(id => ({ partsId: id })) : null,
          variationRequestDtos: formInputs.variationRequestDtos.map((id) => ({
            variationId: id,
          })),
          serviceChecklistDtos: formInputs.serviceChecklistDtos,
          serviceType: formInputs.serviceType,
          serviceSubType: formInputs.serviceSubType,
          technicianTypesListDto: {
            technicianType: Array.isArray(formInputs.technicianTypesListDto?.technicianType) && formInputs.technicianTypesListDto.technicianType.length > 0
              ? formInputs.technicianTypesListDto.technicianType
              : null,
            technicianSubType: Array.isArray(formInputs.technicianTypesListDto?.technicianSubType) && formInputs.technicianTypesListDto.technicianSubType.length > 0
              ? formInputs.technicianTypesListDto.technicianSubType
              : null,
          },
          hours: formInputs.hours,
          serviceRateType: formInputs.serviceRateType,
          serviceNotesList: transformedServiceNotesList,
          servicePrimaryIdentifier: formInputs.servicePrimaryIdentifier,
          serviceCreatedBy: formInputs.serviceCreatedBy,
          additionalCost: formInputs.additionalCost || 0,
          serviceCreatedDate: formInputs.serviceCreatedDate,
          lastUpdatedDate: formInputs.lastUpdatedDate,
          isAdmin: formInputs.isAdmin,
        };
        const resultAction = await dispatch(saveServices(dataToSend));
        if (saveServices.fulfilled.match(resultAction)) {
          navigate("/app/service-management");
          notification.success({
            message: <h5>Service Added Successfully!</h5>,
            icon: <img src={Icons.check} alt="Success" />,
            duration: 5,
          });
        } else if (resultAction.payload?.errors) {
          const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
            if (error.includes("Service ID")) {
              acc.serviceId = error;
            }
            if (error.includes("Service Id")) {
              acc.serviceId = error;
            }
            if (error.includes("Service Name")) {
              acc.serviceName = error;
            }
            if (error.includes("Service Category")) {
              acc.serviceCategory = error;
            }
            if (error.includes("Spare Parts Required")) {
              acc.pathsRequired = error;
            }
            if (error.includes("Required Spare Parts")) {
              acc.partsDtoList = error;
            }
            if (error.includes("Variation")) {
              acc.variationRequestDtos = error;
            }
            if (formInputs.serviceType && error.includes("Service Type")) {
              acc.serviceType = error;
            }
            if (error.includes("serviceType")) {
              acc.serviceType = error;
            }
            if (error.includes("Invalid ServiceType ID")) {
              acc.serviceType = error;
            }
            if (error.includes("TechnicianType")) {
              acc.technicianTypesListDto = error;
            }
            if (error.includes("Technician Type")) {
              acc.technicianTypesListDto = error;
            }
            if (error.includes("Hours")) {
              acc.hours = error;
            }
            if (error.includes("Service Rate Type")) {
              acc.serviceRateType = error;
            }
            if (error.includes("Additional Cost")) {
              acc.additionalCost = error;
            }
            if (error.includes("Total Service Cost (Rs.)")) {
              acc.totalServiceCost = error;
            }
            if (error.includes("Service Created date")) {
              acc.serviceCreatedDate = error;
            }
            if (error.includes("last updated date")) {
              acc.lastUpdatedDate = error;
            }
             if (error.includes("Description")) {
              acc.description = error;
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
        uploadImgPath: "Please save the note before adding the service.",
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
        const transformedServiceNotesList = formInputs.serviceNotesList.map((note) => ({
          notes: note.notes,
          serviceNotesCreatedDate: note.dateTime ? note.dateTime : note.createdDate,
          serviceNotesCreatedTime: note.time,
          serviceAttachmentsDtoList: note.serviceAttachmentsDtoList.map((attachment) => ({
            attachmentPath: attachment.attachmentPath,
          })),
        }));

        const dataToSend = {
          id: formInputs.id,
          serviceId: formInputs.serviceId,
          serviceName: formInputs.serviceName,
          description: formInputs.description.trim() === "" ? null : formInputs.description,
          serviceCategory: formInputs.serviceCategory,
          pathsRequired: formInputs.pathsRequired,
          partsDtoList: formInputs.pathsRequired === "YES" ? formInputs.partsDtoList.map(id => ({ partsId: id })) : null,
          variationRequestDtos: formInputs.variationRequestDtos.map((id) => ({
            variationId: id,
          })),
          serviceChecklistDtos: formInputs.serviceChecklistDtos.map((item) => ({
            serviceCheckListPath: item.serviceCheckListPath,
          })),
          serviceType: formInputs.serviceType,
          serviceSubType: formInputs.serviceSubType,
          technicianTypesListDto: {
            technicianType: Array.isArray(formInputs.technicianTypesListDto?.technicianType) && formInputs.technicianTypesListDto.technicianType.length > 0
              ? formInputs.technicianTypesListDto.technicianType
              : null,
            technicianSubType: Array.isArray(formInputs.technicianTypesListDto?.technicianSubType) && formInputs.technicianTypesListDto.technicianSubType.length > 0
              ? formInputs.technicianTypesListDto.technicianSubType
              : null,
          },
          hours: formInputs.hours,
          serviceRateType: formInputs.serviceRateType,
          serviceNotesList: transformedServiceNotesList,
          additionalCost: formInputs.additionalCost || 0,
        };
        if(portal!=='adminPortal'){
          const resultAction = await dispatch(updateServices(dataToSend));
          if (updateServices.fulfilled.match(resultAction)) {
            navigate("/app/service-management");
            notification.success({
              message: <h5>Updated Successfully!</h5>,
              icon: <img src={Icons.check} alt="Success" />,
              duration: 5,
            });
          } else if (resultAction.payload?.errors) {
            const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
              if (error.includes("Service ID")) {
                acc.serviceId = error;
              }
              if (error.includes("Service Id")) {
                acc.serviceId = error;
              }
              if (error.includes("Service Name")) {
                acc.serviceName = error;
              }
              if (error.includes("Service Category")) {
                acc.serviceCategory = error;
              }
              if (error.includes("Spare Parts Required")) {
                acc.pathsRequired = error;
              }
              if (error.includes("Required Spare Parts")) {
                acc.partsDtoList = error;
              }
              if (error.includes("Invalid Parts ID")) {
                acc.partsDtoList = error;
              }
              if (error.includes("Variation")) {
                acc.variationRequestDtos = error;
              }
              if (formInputs.serviceType && error.includes("Service Type")) {
                acc.serviceType = error;
              }
              if (error.includes("serviceType")) {
                acc.serviceType = error;
              }
              if (error.includes("Invalid ServiceType ID")) {
                acc.serviceType = error;
              }
              if (error.includes("TechnicianType")) {
                acc.technicianTypesListDto = error;
              }
              if (error.includes("Technician Type")) {
                acc.technicianTypesListDto = error;
              }
              if (error.includes("Hours")) {
                acc.hours = error;
              }
              if (error.includes("Service Rate Type")) {
                acc.serviceRateType = error;
              }
              if (error.includes("Additional Cost")) {
                acc.additionalCost = error;
              }
              if (error.includes("Total Service Cost (Rs.)")) {
                acc.totalServiceCost = error;
              }
              if (error.includes("Service Created date")) {
                acc.serviceCreatedDate = error;
              }
              if (error.includes("last updated date")) {
                acc.lastUpdatedDate = error;
              }
              if (error.includes("Description")) {
                acc.description = error;
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
          const adminServiceUpdateData={
            id: formInputs.id,
            description: formInputs.description.trim() === "" ? null : formInputs.description,
            variationRequestDtos: formInputs.variationRequestDtos.map((id) => ({
                variationId: id,
              })),
             hours: formInputs.hours,
             additionalCost: formInputs.additionalCost || 0,
          }
          const resultAction = await dispatch(updateAdminServices(adminServiceUpdateData));
          if (updateAdminServices.fulfilled.match(resultAction)) {
            navigate("/app/service-management");
            notification.success({
              message: <h5>Updated Successfully!</h5>,
              icon: <img src={Icons.check} alt="Success" />,
              duration: 5,
            });
          } else if (resultAction.payload?.errors) {
            const apiErrors = resultAction.payload.errors.reduce((acc, error) => {
              if (error.includes("Variation")) {
                acc.variationRequestDtos = error;
              }
              if (error.includes("Hours")) {
                acc.hours = error;
              }
              if (error.includes("Additional Cost")) {
                acc.additionalCost = error;
              }
              if (error.includes("Description")) {
                acc.description = error;
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

  return (
    <>
      <div className="form-container">
        <div className="form-header">
          <div className="back">
            <Link to="/app/service-management" id="service-details-back">
              <img src={Icons.arrow_left} alt="Back Icon" />
            </Link>
            <h3>{isEdit ? "Edit Service - " + service.serviceId : "Add New Service"}</h3>
          </div>
          {portal!=='adminPortal'&&
          <Link to="/app/service-management/bulk-upload">
            <button className="button form-button" id="service-upload-bulk">
              <img src={Icons.upload} alt="Upload Icon" />
              <span>Upload Bulk</span>
            </button>
          </Link>
          }
        </div>
        <Form className="form" layout="vertical">
          <div className="service-details">
            <h3 className="form-header  admin-service">Services Details</h3>
            <div className="form-row">
              <div className={`form-item ${portal==='adminPortal'?'disabled-form-item':''}`}>
                <input
                  type="text"
                  name="serviceId"
                  id="service-id"
                  autoComplete="off"
                  value={formInputs.serviceId}
                  onChange={(e) => handleChange(e)}
                  className={`required ${errors["serviceId"] ? "invalid" : ""}`}
                  disabled={portal==='adminPortal'}
                />
                <label className="form-label" htmlFor="service-id">
                  <h4>Service ID</h4>
                </label>
                {errors.serviceId && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.serviceId}</h6>
                  </div>
                )}
              </div>
              <div className={`form-item ${portal==='adminPortal'?'disabled-form-item':''}`}>
                <input
                  type="text"
                  name="serviceName"
                  id="service-name"
                  autoComplete="off"
                  value={formInputs.serviceName || ''}
                  disabled={portal==='adminPortal'}
                  onChange={(e) => {
                    const value = e.target.value;
                    setIsFormModified(true);
                    setFormInputs(prev => ({
                      ...prev,
                      serviceName: value
                    }));
                  }}
                  className={errors["serviceName"] ? "invalid" : ""}
                  required
                />
                <label className="form-label" htmlFor="service-name">
                  <h4>Service Name</h4>
                </label>
                {errors.serviceName && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.serviceName}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-item service-form-item form-item__full">
                <textarea
                  name="description"
                  id="description"
                  className={errors["description"] ? "invalid" : ""}
                  onChange={(e) => handleChange(e)}
                  value={formInputs.description || ""}
                />
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
              <div className={`form-item ${portal==='adminPortal'?'disabled-form-item':''}`}>
                <RadioSelect
                  id="service-category"
                  options={serviceCategoryOptions}
                  placeholderText="Select service category"
                  required
                  name="serviceCategory"
                  value={formInputs.serviceCategory}
                  disabled={portal==='adminPortal'}
                  isValid={errors["serviceCategory"] ? "invalid" : ""}
                  onChange={(selected) => {
                    setFormInputs((prev) => ({
                      ...prev,
                      serviceCategory: selected.value,
                      serviceType: null,
                      serviceSubType: null,
                      technicianTypesListDto: { technicianType: [], technicianSubType: [] },
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      serviceCategory: "",
                      serviceType: "",
                      technicianTypesListDto: "",
                    }));
                    setTechSelectKey((k) => k + 1);
                    setIsFormModified(true);
                  }}
                />
                <label
                  className="form-label"
                  htmlFor="service-category required"
                >
                  <h4>Service Category</h4>
                </label>
                {errors.serviceCategory && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.serviceCategory}</h6>
                  </div>
                )}
              </div>
              <div className={`form-item ${portal==='adminPortal'?'disabled-form-item':''}`}>
                <div className="input-wrapper input-wrapper__radio required">
                  <div className="radio-wrapper">
                    <input
                      type="radio"
                      name="pathsRequired"
                      id="yes"
                      value="YES"
                      checked={formInputs.pathsRequired === "YES"}
                      onChange={handleChange}
                      disabled={portal==='adminPortal'}
                    />
                    <label className="radio-label" htmlFor="yes">
                      Yes
                    </label>
                  </div>
                  <div className="radio-wrapper">
                    <input
                      type="radio"
                      name="pathsRequired"
                      id="no"
                      value="NO"
                      checked={formInputs.pathsRequired === "NO"}
                      onChange={handleChange}
                      disabled={portal==='adminPortal'}
                    />
                    <label className="radio-label" htmlFor="no">
                      No
                    </label>
                  </div>
                </div>
                <label className="form-label">
                  <h4>Spare Parts Required</h4>
                </label>
                {errors.pathsRequired && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.pathsRequired}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
                {formInputs.pathsRequired === "YES" && (
                  <div className={`form-item ${portal==='adminPortal'?'disabled-form-item':''}`}>
                    <CustomMultiSelectWithApiSearch
                      id="services-required-sparepart"
                      groupedOptions={RequiredSparePartsOption}
                      dropdownPlaceholderText="Select required spare part"
                      required
                      name="partsId"
                      isValid={errors["partsDtoList"] ? "invalid" : ""}
                      value={formInputs.partsDtoList}
                      disabled={portal==='adminPortal'}
                      loading={requiredSparePartsLoading}
                      onSearch={handlePartSearch}
                      onChange={(selectedValues) => {
                        setFormInputs((prev) => ({
                          ...prev,
                          partsDtoList: selectedValues, // Array of IDs
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          partsDtoList: "",
                        }));
                      }}
                    />
                    <label className="form-label required" htmlFor="service-category">
                      <h4>Required Spare Parts</h4>
                    </label>
                    {errors.partsDtoList && (
                      <div className="field-error">
                        <img src={Icons.warning_circle} alt="Warning Icon" />
                        <h6>{errors.partsDtoList}</h6>
                      </div>
                    )}
                  </div>
                )}
                <div className="form-item">
                  <FormMultipleSelect
                    id="service-variation"
                    options={variationOptions}
                    placeholderText="Select a variation"
                    required={true}
                    className={errors["variationRequestDtos"] ? "invalid" : ""}
                    isValid={errors["variationRequestDtos"] ? "invalid" : ""}
                    value={formInputs.variationRequestDtos}
                    onChange={(selectedValues) => {
                      const isNASelected = selectedValues.some((val) =>
                        variationOptions.find((opt) => opt.value === val)?.label === "N/A"
                      );
                      const wasNASelectedPreviously = formInputs.variationRequestDtos.some((val) =>
                        variationOptions.find((opt) => opt.value === val)?.label === "N/A"
                      );
                    
                      if (isNASelected && !wasNASelectedPreviously) {
                        setFormInputs((prev) => ({
                          ...prev,
                          variationRequestDtos: variationOptions
                            .filter((opt) => opt.label === "N/A")
                            .map((opt) => opt.value),
                        }));
                      } else if (!isNASelected && wasNASelectedPreviously) {
                        setFormInputs((prev) => ({
                          ...prev,
                          variationRequestDtos: selectedValues.filter((val) =>
                            variationOptions.find((opt) => opt.value === val)?.label !== "N/A"
                          ),
                        }));
                      } else {
                        setFormInputs((prev) => ({
                          ...prev,
                          variationRequestDtos: selectedValues.filter((val) =>
                            variationOptions.find((opt) => opt.value === val)?.label !== "N/A"
                          ),
                        }));
                      }
                    
                      setErrors((prev) => ({
                        ...prev,
                        variationRequestDtos: "",
                      }));
                      setIsFormModified(true);
                    }}                
                  />
                  <label className="form-label" htmlFor="service-category">
                    <h4>Variation</h4>
                  </label>
                  {errors.variationRequestDtos && (
                    <div className="field-error">
                      <img src={Icons.warning_circle} alt="Warning Icon" />
                      <h6>{errors.variationRequestDtos}</h6>
                    </div>
                  )}
                </div>
            </div>
            <div className="form-row">
              <div className={`form-item form-item__full checklist-upload-container ${portal==='adminPortal'?'disabled-form-item':''}`}>
                <UploadComponent
                  linkText="Click to upload"
                  text="or drag & drop your file here"
                  mobileText="your file here"
                  subText="PDF, XLS and XLSX, up to 20MB"
                  required={false}
                  multiple={true}
                  maxFileSize="20MB"
                  allowedFileSize={20 * 1024 * 1024}
                  fileFormat="pdf, xls, xlsx"
                  allowedFileTypes={[
                    'application/pdf',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  ]}
                  buttonText="Upload Document"
                  inputId="service-checklist"
                  onFileChange={async (files) => {
                    if (portal==='adminPortal') return;
                    if (files.length > 0) {
                      await handleServiceChecklistUpload(files); 
                      setIsFormModified(true);
                    }
                  }}
                  uploadError={uploadError}
                  uploadErrorDescription={uploadErrorDescription}
                  onCancelClick={() => navigate("/app/service-management")}
                  isLoading={isImgLoading}
                  onRemoveFile={(fileName) => { handleRemoveFileFromState(fileName); setIsFormModified(true); }}
                  uploadedFiles={formInputs?.serviceChecklistDtos || []}
                  onRemoveExistingFile={(fileId) => { handleRemoveExistingChecklistFile(fileId); setIsFormModified(true); }} 
                  showCancelButton={false}
                  disabled={portal==='adminPortal'}
                />
                <label className="form-label" htmlFor="service-checklist">
                  <h4>Service Checklist</h4>
                </label>
              </div>
            </div>
            <div className="form-row">
              <div className={`form-item ${portal==='adminPortal'?'disabled-form-item':''}`}>
                <GroupSelect
                  id="service-service-type"
                  groupedOptions={servicesTypeOptions}
                  placeholderText="Select service type"
                  required={true}
                  className={`required ${errors["serviceType"] ? "invalid" : ""}`}
                  value={formInputs.serviceSubType || formInputs.serviceType}
                  disabled={portal==='adminPortal'}
                  name="serviceType"
                  isValid={errors["serviceType"] ? "invalid" : ""}
                  onChange={(selected) => {
                    // Find the parent service type if the selected option is a subType
                    const parentService = servicesTypeOptions.find((group) =>
                      group.options?.some((sub) => sub.value === selected.value)
                    );
                  
                    if (parentService) {
                      // When a subType is selected
                      setFormInputs((prev) => ({
                        ...prev,
                        serviceType: null, // Set the parent serviceTypeId
                        serviceSubType: selected.value,   // Set the selected subTypeId
                        technicianTypesListDto: { technicianType: [], technicianSubType: [] },
                        serviceRateType: "",
                      }));
                    } else {
                      // When a main serviceType is selected
                      setFormInputs((prev) => ({
                        ...prev,
                        serviceType: selected.value,  // Set the main serviceTypeId
                        serviceSubType: null,         // Clear any selected subType
                        technicianTypesListDto: { technicianType: [], technicianSubType: [] },
                        serviceRateType: "",
                      }));
                    }
                    setRateSelectKey((k) => k + 1);
                    setTechSelectKey((k) => k + 1);
                    setErrors((prev) => ({
                      ...prev,
                      serviceType: "",
                      technicianTypesListDto: "",
                      serviceRateType: "",
                    }));
                    setIsFormModified(true);
                  }}                  
                />
                <label className="form-label" htmlFor="service-type">
                  <h4>Service Type</h4>
                </label>
                {errors.serviceType && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.serviceType}</h6>
                  </div>
                )}
              </div>
              <div className={`form-item tech-type ${portal==='adminPortal'?'disabled-form-item':''}`}>
                <GroupMultipleSelect
                  key={techSelectKey}
                  groupedOptions={technicianTypeOptions}
                  placeholderText="Select technician type"
                  required={true}
                  className={`required ${errors["technicianTypesListDto"] ? "invalid" : ""}`}
                  name="technicianTypesListDto"
                  disabled={portal==='adminPortal'}
                  isValid={errors["technicianTypesListDto"] ? "invalid" : ""}
                  value={
                    formInputs.technicianTypesListDto?.technicianType
                      ?.concat(formInputs.technicianTypesListDto?.technicianSubType || [])
                      .map((id) => {
                        const option = technicianTypeOptions
                          .flatMap((group) => [group, ...(group.options || [])])
                          .find((item) => String(item.value) === String(id));
                        return option || null;
                      })
                      .filter(Boolean)
                  }
                  onChange={(selected) => {
                    const technicianTypeIds = [];
                    const technicianSubTypeIds = [];
                  
                    // Use a Set to ensure unique values
                    const uniqueSelected = Array.from(new Set(selected.map(item => item.value)));
                  
                    uniqueSelected.forEach((value) => {
                      // Check if the selected item is a subtype (i.e., it belongs to a group with options)
                      const parentTechnician = technicianTypeOptions.find((group) =>
                        group.options?.some((sub) => sub.value === value)
                      );
                  
                      if (parentTechnician) {
                        // If it's a subtype, add it to technicianSubTypeIds
                        technicianSubTypeIds.push(value);
                      } else {
                        // If it's not a subtype, it's a main technician type, so add it to technicianTypeIds
                        technicianTypeIds.push(value);
                      }
                    });
                  
                    // Update form inputs
                    setFormInputs((prev) => ({
                      ...prev,
                      technicianTypesListDto: {
                        technicianType: technicianTypeIds.length > 0 ? technicianTypeIds : null,
                        technicianSubType: technicianSubTypeIds.length > 0 ? technicianSubTypeIds : null,
                      },
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      technicianTypesListDto: "",
                    }));
                    setIsFormModified(true);
                  }}
                />
                <label className="form-label" htmlFor="technician-type">
                  <h4>Technician Type</h4>
                </label>
                {errors.technicianTypesListDto && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.technicianTypesListDto}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-item">
                <input
                  type="text"
                  name="hours"
                  id="hours"
                  autoComplete="off"
                  required
                  value={formInputs.hours}
                  onChange={handleChange}
                  className={errors["hours"] ? "invalid" : ""}
                  placeholder="Ex: 1 hour 30 minutes = 1.5"
                />
                <label className="form-label" htmlFor="hours">
                  <h4>Hours</h4>
                </label>
                {errors.hours && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.hours}</h6>
                  </div>
                )}
              </div>
              <div className={`form-item ${portal==='adminPortal'?'disabled-form-item':''}`}>
                <RadioSelect
                  id="service-rate-type"
                  key={rateSelectKey}
                  options={serviceRateTypeOptions}
                  placeholderText="Select service rate"
                  required
                  name="serviceRateType"
                  value={formInputs.serviceRateType}
                  disabled={portal==='adminPortal'}
                  isValid={errors["serviceRateType"] ? "invalid" : ""}
                  onChange={(selected) => {
                    setFormInputs((prev) => ({
                      ...prev,
                      serviceRateType: selected.value,
                    }))
                    setErrors((prev) => ({
                      ...prev,
                      serviceRateType: "",
                    }));
                    setIsFormModified(true);
                  }}
                />
                <label className="form-label" htmlFor="service-rate-type">
                  <h4>Service Rate Type</h4>
                </label>
                {errors.serviceRateType && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.serviceRateType}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-item">
                <input
                  type="text"
                  name="additionalCost"
                  id="additional-cost"
                  autoComplete="off"
                  value={formInputs.additionalCost}
                  className={errors["additionalCost"] ? "invalid" : ""}
                  onChange={handleChange}
                />
                <label className="form-label" htmlFor="additional-cost">
                  <h4>Additional Cost</h4>
                </label>
                {errors.additionalCost && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.additionalCost}</h6>
                  </div>
                )}
              </div>
              <div className="form-item input-loading-container">
                <input
                  type="text"
                  name="totalServiceCost"
                  id="total-service-cost"
                  autoComplete="off"
                  value={formInputs.totalServiceCost}
                  disabled
                  className={`loading-input ${isCostLoading ? "loading" : ""}`}
                />
                <label
                  className="form-label service-cost required"
                  htmlFor="total-service-cost"
                >
                  {isCostLoading && <div className="loading-bar"></div>}
                  <h4 className="disabled-form-item">
                    Total Service Cost (Rs.)
                  </h4>
                </label>
              </div>
            </div>
          </div>
          <div className={`form-section ${portal==='adminPortal'&&savedNotes.length==0?'hidden-notes':''}`}>
            {portal!=='adminPortal'&&
            <div className="form-header sub-header notes-header admin-service">
              <h3>Add Notes</h3>
              <button
                type="button"
                onClick={addNote}
                className={`button form-button ${hasActiveNote ? 'disabled-button' : ''}`}
                id="service-add-new-notes-button"
                disabled={hasActiveNote}
              >
                <img src={Icons.plus} alt="Edit Icon" />
                <span>Add New Notes</span>
              </button>
            </div>
              }
            {savedNotes.map((note, index) => (
            <div className="form-row">
                <div className={`form-item form-item__full note-preview ${portal==='adminPortal'?'disabled-form-item':''}`}
                  key={note.serviceNotesId || index}>
                  <div className="note-container">
                    <div className="note-header">
                      <h4>{note.text ? note.text : "-" }</h4>
                      {
                        portal!=='adminPortal'&&
                      <img
                        src={Icons.trash}
                        alt="Delete Icon"
                        onClick={() => handleDeleteNote(note.serviceNotesId)} 
                      />
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
                        {isEdit ? (
                          <>
                            Notes by: {note.notesBy} on {note.createdDate} {note.time}
                          </>
                        ) : (
                          <>
                            Notes by: {firstName + ' ' + lastName} on {note.createdDate} {note.createdTime}
                          </>
                        )}
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
              portal!=='adminPortal'&&
            <div className='form-item form-item__full notes-list'>
              {notes.map((note, index) => (
                <div className="add-note" key={note.id}>
                  <div className="form-row">
                    <div className="form-item form-item__full">
                      <textarea
                        name={`note-${note.id}`}
                        id={`note-${note.id}`}
                        value={noteText}
                        disabled={portal==='adminPortal'}
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
                    <div className={`form-item form-item__full ${portal==='adminPortal'?'disabled-form-item':''}`}>
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
                        onCancelClick={() => navigate("/app/service-management")}
                        showCancelButton={false}
                        disabled={portal==='adminPortal'}
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
                    </div>
                  </div>                                                                                                                                                                                                                                                                                                        
                  )}
                  {
                    portal!=='adminPortal'&&
                  <div className="form-row form-footer notes">
                    {savedNotes.length > 0 ? (
                      <>
                        <button
                          type="button"
                          className="button button-submit col-50"
                          onClick={saveNotes}
                          disabled={isNotesLoading}
                          id="save-button-service-notes"
                        >
                          <h5>{isNotesLoading ? "Saving... Please wait." : "Save Note"}</h5>
                        </button>
                        <button
                          type="button"
                          className="button button-cancel col-50"
                          onClick={() => { removeNote(note.id); setIsFormModified(true); }}
                          id="cancel-button-service-notes"
                        >
                          <h5>Cancel</h5>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="button"
                        onClick={saveNotes}
                        disabled={isNotesLoading ||portal==='adminPortal'}
                        id="save-button-service-notes-admin"
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
          <div className="additional-info service-info">
            <h3 className="info-header">Additional Information</h3>
            <div className="form-row">
              <div className="form-item disabled-form-item">
                <input
                  type="text"
                  name="service-primary-identifier"
                  id="service-primary-identifier"
                  value={formInputs.servicePrimaryIdentifier} 
                  disabled
                  onChange={(e) => handleChange(e)}
                />  
                <label
                  className="form-label"
                  htmlFor="service-primary-identifier"
                >
                  <h4>Service Primary Identifier</h4>
                </label>
              </div>
              <div className="form-item disabled-form-item">
                <div className="position-relative datepicker p-0">
                  <input 
                    type="text" 
                    value={formInputs.serviceCreatedDate} 
                    name="serviceCreatedDate" id="spare-parts-added-date" 
                    disabled />
                  <img src={Icons.calendar} alt="Calendar Icon" className="input-icon" />
                </div>
                <label className="form-label" htmlFor="spare-parts-added-date">
                  <h4>Service Created Date</h4>
                </label>
                {errors.serviceCreatedDate	 && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.serviceCreatedDate	}</h6>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-item disabled-form-item">
                <div className="position-relative datepicker p-0">
                  <input 
                    type="text" 
                    value={formInputs.lastUpdatedDate} 
                    name="serviceUpdatedDate" id="spare-parts-added-date" 
                    disabled />
                  <img src={Icons.calendar} alt="Calendar Icon" className="input-icon" />
                </div>
                <label className="form-label" htmlFor="last-updated-date">
                  <h4>Last Updated</h4>
                </label>
                {errors.lastUpdatedDate	 && (
                  <div className="field-error">
                    <img src={Icons.warning_circle} alt="Warning Icon" />
                    <h6>{errors.lastUpdatedDate	}</h6>
                  </div>
                )}
              </div>
              <div className="form-item disabled-form-item">
                <input
                  type="text"
                  name="spare-parts-added-by"
                  id="spare-parts-added-by"
                  value={isEdit ? formInputs.serviceCreatedBy : firstName + ' ' + lastName } 
                  disabled
                />
                <label className="form-label" htmlFor="spare-parts-added-by">
                  <h4>Service Created By</h4>
                </label>
              </div>
            </div>
          </div>
          <div className="form-footer">
            <button
              type="submit"
              className={`button button-submit ${isEdit && !isFormModified ? 'disabled-button' : ''}`}
              onClick={isEdit ? onUpdate : onSubmit}
              disabled={isLoading || isNotesLoading || (isEdit && !isFormModified)}
              id="save-button-service-main"
            >
              <h5>{isLoading ? "Saving... Please wait." : isEdit ? "Update" : "Save"}</h5>
            </button>
            <button
              type="button"
              className="button button-cancel"
              onClick={handleCancelClick}
              id="cancel-button-service-main"
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
              <button id="service-button-retry" onClick={closePopup}>Retry</button>
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
    </>
  );
};

export default ServiceForm;
