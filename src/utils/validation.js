export const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";

export const normalizeText = (value) => {
  if (!hasValue(value)) return "";
  return String(value).trim().replace(/\s+/g, " ");
};

export const normalizeOptionalText = (value) => {
  const text = normalizeText(value);
  return text || null;
};

export const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

export const isValidDate = (value) => {
  if (!hasValue(value)) return true;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

export const isValidPhone = (value) => {
  if (!hasValue(value)) return false;
  const digits = String(value).replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

export const normalizeRole = (role = "") => normalizeText(role).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const validationError = (res, message) => res.status(400).json({ message });
