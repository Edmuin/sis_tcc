export const success = (res, data, status = 200) => res.status(status).json({ data });

export const failure = (res, error) => {
  console.error(error);
  res.status(500).json({ message: "Não foi possível processar o pedido." });
};

export const validationError = (res, message) => res.status(400).json({ message });
