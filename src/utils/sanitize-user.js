export const sanitizeUser = (user) => {
  if (!user) return user;
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

export const sanitizeUsers = (users) => users.map(sanitizeUser);