export const saveTempQuote = (quoteData, id) => {
  try {
    localStorage.setItem(`tempQuote_${id}`, JSON.stringify(quoteData));
    return true;
  } catch (error) {
    console.error('Error saving temp quote:', error);
    return false;
  }
};

export const getTempQuote = (serviceId) => {
  try {
    const quote = localStorage.getItem(`tempQuote_${serviceId}`);
    return quote ? JSON.parse(quote) : null;
  } catch (error) {
    console.error('Error getting temp quote:', error);
    return null;
  }
};

export const clearTempQuote = (serviceId) => {
  localStorage.removeItem(`tempQuote_${serviceId}`);
};

export const saveTempSpareParts = (quoteId, spareParts) => {
  try {
    localStorage.setItem(`tempSpareParts_${quoteId}`, JSON.stringify(spareParts));
    return true;
  } catch (error) {
    console.error('Error saving temp spare parts:', error);
    return false;
  }
};

export const getTempSpareParts = (quoteId) => {
  try {
    const spareParts = localStorage.getItem(`tempSpareParts_${quoteId}`);
    return spareParts ? JSON.parse(spareParts) : null;
  } catch (error) {
    console.error('Error getting temp spare parts:', error);
    return null;
  }
};

export const clearTempSpareParts = (quoteId) => {
  localStorage.removeItem(`tempSpareParts_${quoteId}`);
};

export const saveTempServiceIds = (quoteId, serviceIds) => {
  try {
    localStorage.setItem(`tempServiceIds_${quoteId}`, JSON.stringify(serviceIds));
    return true;
  } catch (error) {
    console.error('Error saving temp service IDs:', error);
    return false;
  }
};

export const getTempServiceIds = (quoteId) => {
  try {
    const serviceIds = localStorage.getItem(`tempServiceIds_${quoteId}`);
    return serviceIds ? JSON.parse(serviceIds) : [];
  } catch (error) {
    console.error('Error getting temp service IDs:', error);
    return [];
  }
};

export const clearTempServiceIds = (quoteId) => {
  localStorage.removeItem(`tempServiceIds_${quoteId}`);
};

// For tracking edited spare parts
export const saveTempEditedSpareParts = (quoteId, editedParts) => {
  try {
    localStorage.setItem(`tempEditedSpareParts_${quoteId}`, JSON.stringify(editedParts));
    return true;
  } catch (error) {
    console.error('Error saving edited spare parts:', error);
    return false;
  }
};

export const getTempEditedSpareParts = (quoteId) => {
  try {
    const editedParts = localStorage.getItem(`tempEditedSpareParts_${quoteId}`);
    return editedParts ? JSON.parse(editedParts) : [];
  } catch (error) {
    console.error('Error getting edited spare parts:', error);
    return [];
  }
};

export const clearTempEditedSpareParts = (quoteId) => {
  localStorage.removeItem(`tempEditedSpareParts_${quoteId}`);
};

// For tracking edited services
export const saveTempEditedServices = (quoteId, editedServices) => {
  try {
    localStorage.setItem(`tempEditedServices_${quoteId}`, JSON.stringify(editedServices));
    return true;
  } catch (error) {
    console.error('Error saving edited services:', error);
    return false;
  }
};

export const getTempEditedServices = (quoteId) => {
  try {
    const editedServices = localStorage.getItem(`tempEditedServices_${quoteId}`);
    return editedServices ? JSON.parse(editedServices) : [];
  } catch (error) {
    console.error('Error getting edited services:', error);
    return [];
  }
};

export const clearTempEditedServices  = (quoteId) => {
  localStorage.removeItem(`tempEditedServices_${quoteId}`);
};

// For tracking edited spare parts - quote management
export const saveTempEditedQuoteSpareParts = (editedParts) => {
  try {
    localStorage.setItem(`tempEditedQuoteSpareParts`, JSON.stringify(editedParts));
    return true;
  } catch (error) {
    console.error('Error saving edited spare parts:', error);
    return false;
  }
};

export const getTempEditedQuoteSpareParts = () => {
  try {
    const editedParts = localStorage.getItem(`tempEditedQuoteSpareParts`);
    return editedParts ? JSON.parse(editedParts) : [];
  } catch (error) {
    console.error('Error getting edited spare parts:', error);
    return [];
  }
};

export const clearTempEditedQuoteSpareParts = () => {
  localStorage.removeItem(`tempEditedQuoteSpareParts`);
};

// For tracking edited services
export const saveTempEditedQuoteServices = (editedServices) => {
  try {
    localStorage.setItem(`tempEditedQuoteServices`, JSON.stringify(editedServices));
    return true;
  } catch (error) {
    console.error('Error saving edited services:', error);
    return false;
  }
};

export const getTempEditedQuoteServices = () => {
  try {
    const editedServices = localStorage.getItem(`tempEditedQuoteServices`);
    return editedServices ? JSON.parse(editedServices) : [];
  } catch (error) {
    console.error('Error getting edited services:', error);
    return [];
  }
};

export const clearTempEditedQuoteServices  = (quoteId) => {
  localStorage.removeItem(`tempEditedQuoteServices`);
};