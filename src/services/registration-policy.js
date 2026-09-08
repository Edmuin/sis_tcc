export const PUBLIC_REGISTRATION_ROLES = new Set(["aluno", "tutor"]);

export const isPublicRegistrationRole = (role) => PUBLIC_REGISTRATION_ROLES.has(role);