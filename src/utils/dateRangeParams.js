export const formatDateForAPI = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
};

export const getQuarter = (date) => Math.floor(new Date(date).getMonth() / 3) + 1;

export const buildDashboardParams = (selectedFrequency, selectedRange) => {
  if (!selectedRange || !selectedRange.start || !selectedRange.end) return null;

  const startDate = selectedRange.start;
  const endDate = selectedRange.end;
  const freq = (selectedFrequency || '').toLowerCase();

  let scaleVal, rangeName, rangeValue, additionalParams = {};

  switch (freq) {
    case 'daily':
      scaleVal = 'DAILY';
      rangeName = 'startDate';
      rangeValue = formatDateForAPI(startDate);
      break;

    case 'weekly':
      scaleVal = 'WEEKLY';
      rangeName = 'startDate';
      rangeValue = formatDateForAPI(startDate);
      additionalParams = { endDate: formatDateForAPI(endDate) };
      break;

    case 'monthly':
      scaleVal = 'MONTHLY';
      rangeName = 'month';
      rangeValue = (new Date(startDate).getMonth() + 1).toString();
      additionalParams = { year: new Date(startDate).getFullYear().toString() };
      break;

    case 'quarterly':
      scaleVal = 'QUARTERLY';
      rangeName = 'quarter';
      rangeValue = getQuarter(startDate).toString();
      additionalParams = { year: new Date(startDate).getFullYear().toString() };
      break;

    case 'yearly':
      scaleVal = 'YEARLY';
      rangeName = 'year';
      rangeValue = new Date(startDate).getFullYear().toString();
      break;

    default:
      scaleVal = 'DAILY';
      rangeName = 'startDate';
      rangeValue = formatDateForAPI(startDate);
  }

  return { scaleVal, rangeName, rangeValue, additionalParams };
};


