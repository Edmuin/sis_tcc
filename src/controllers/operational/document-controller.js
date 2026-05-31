import { DocumentoModel } from "../../models/documento.model.js";
import { failure, success, validationError } from "./response.js";
import { missingFields } from "./validation.js";
import { resources, validateResourceData } from "./registry.js";

export const uploadDocument = async (req, res) => {
  try {
    if (req.fileValidationError) return validationError(res, req.fileValidationError);
    if (!req.file) return validationError(res, "Ficheiro obrigatório em falta.");

    const data = {
      id_tcc: req.body.id_tcc,
      nome: req.body.nome || req.file.originalname,
      tipo: req.body.tipo || req.file.mimetype,
      caminho_arquivo: `/uploads/${req.file.filename}`,
    };

    const missing = missingFields(data, resources.documentos.required);
    if (missing.length > 0) {
      return validationError(res, `Campos obrigatórios em falta: ${missing.join(", ")}.`);
    }

    const validationErrors = await validateResourceData("documentos", data);
    if (validationErrors.length > 0) {
      return validationError(res, validationErrors.join("; "));
    }

    const row = await DocumentoModel.store(data);
    success(res, row, 201);
  } catch (error) {
    failure(res, error);
  }
};
