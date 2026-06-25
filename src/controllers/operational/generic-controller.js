import { failure, success, validationError } from "./response.js";
import { missingFields } from "./validation.js";
import { decorateRows, matchesFilters, resources, sanitize, validateResourceData } from "./registry.js";

export const listResource = async (req, res) => {
  try {
    const resourceName = req.params.resource;
    const resource = resources[resourceName];
    if (!resource) return res.status(404).json({ message: "Recurso não encontrado." });

    const rows = await resource.model.findAll();
    const filteredRows = rows.filter((row) => matchesFilters(row, req.query));
    const decoratedRows = await decorateRows(resourceName, filteredRows);

    success(res, sanitize(resource, decoratedRows));
  } catch (error) {
    failure(res, error);
  }
};

export const getResource = async (req, res) => {
  try {
    const resource = resources[req.params.resource];
    if (!resource) return res.status(404).json({ message: "Recurso não encontrado." });

    const row = await resource.model.findById(req.params.id);
    if (!row) return res.status(404).json({ message: "Registo não encontrado." });

    success(res, sanitize(resource, row));
  } catch (error) {
    failure(res, error);
  }
};

export const createResource = async (req, res) => {
  try {
    const resourceName = req.params.resource;
    const resource = resources[resourceName];
    if (!resource) return res.status(404).json({ message: "Recurso não encontrado." });

    const missing = missingFields(req.body, resource.required);
    if (missing.length > 0) {
      return validationError(res, `Campos obrigatórios em falta: ${missing.join(", ")}.`);
    }

    const validationErrors = await validateResourceData(resourceName, req.body);
    if (validationErrors.length > 0) {
      return validationError(res, validationErrors.join("; "));
    }

    const row = await resource.model.store(req.body);
    success(res, sanitize(resource, row), 201);
  } catch (error) {
    failure(res, error);
  }
};

export const updateResource = async (req, res) => {
  try {
    const resourceName = req.params.resource;
    const resource = resources[resourceName];
    if (!resource) return res.status(404).json({ message: "Recurso não encontrado." });

    const validationErrors = await validateResourceData(resourceName, req.body);
    if (validationErrors.length > 0) {
      return validationError(res, validationErrors.join("; "));
    }

    const result = await resource.model.update(req.params.id, req.body);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Registo não encontrado ou sem alterações." });
    }

    success(res, sanitize(resource, { id: req.params.id, ...req.body }));
  } catch (error) {
    failure(res, error);
  }
};

export const deleteResource = async (req, res) => {
  try {
    const resource = resources[req.params.resource];
    if (!resource) return res.status(404).json({ message: "Recurso não encontrado." });

    const result = await resource.model.deleteById(req.params.id);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Registo não encontrado." });
    }

    success(res, { id: req.params.id });
  } catch (error) {
    failure(res, error);
  }
};
