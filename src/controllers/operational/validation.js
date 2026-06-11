export const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";

export const missingFields = (data, fields) => fields.filter((field) => !hasValue(data[field]));

export const positiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

export const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));

export const validDate = (value) => {
  if (!hasValue(value)) return true;
  return !Number.isNaN(Date.parse(value));
};
