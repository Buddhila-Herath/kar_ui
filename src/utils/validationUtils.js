export const validateField = (name, value, rules) => {
    let error = "";
  
    // Required field validation
    if (rules.required && (!value || value.toString().trim() === "")) {
      error = `${name} is required`;
    }

    // String max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      error = `Enter a value that doesn't exceed ${rules.maxLength} characters`;
    }
  
    // String min length validation
    if (rules.minLength && value.length < rules.minLength) {
      error = `${name} must be at least ${rules.minLength} characters`;
    }
  
    // Number should be at least minValue
    if (rules.minValue !== undefined && value < rules.minValue) {
      error = `${name} must be at least ${rules.minValue}`;
    }
  
    // Number should not exceed maxValue
    if (rules.maxValue !== undefined && value > rules.maxValue) {
      error = `${name} cannot be greater than ${rules.maxValue}`;
    }
  
    // Positive number validation (greater than zero)
    if (rules.positive && value <= 0) {
      error = `${name} must be a positive value`;
    }
  
    // Non-negative number validation (zero or greater)
    if (rules.nonNegative && value < 0) {
      error = `${name} must be a non-negative value`;
    }
  
    // Email validation
    if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = `Invalid email format`;
    }
  
    // Number validation
    if (rules.isNumber && isNaN(value)) {
      error = `${name} must be a number`;
    }
  
    // Regex pattern validation (custom rule)
    if (rules.pattern && !rules.pattern.test(value)) {
      error = `Invalid format for ${name}`;
    }
  
    return error;
  };
  
  export const validateForm = (formInputs, validationRules) => {
    let formErrors = {};
    let isValid = true;
  
    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field, formInputs[field], validationRules[field]);
      if (error) {
        formErrors[field] = error;
        isValid = false;
      }
    });
  
    return { isValid, formErrors };
  };
  
  

  /*

  import { validateForm } from "../../../utils/validationUtils";

const validationRules = {
  serviceName: { required: true, maxLength: 100 },
  additionalCost: { required: true, nonNegative: true },
  hours: { required: true, positive: true },
  serviceId: { required: true },
  serviceCategory: { required: true },
  serviceType: { required: true },
};

const handleValidation = () => {
  const { isValid, formErrors } = validateForm(formInputs, validationRules);

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



  */