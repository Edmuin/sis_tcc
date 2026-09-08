import { failure, success, validationError } from "./response.js";
import { missingFields } from "./validation.js";
import { decorateRows, matchesFilters, resources, sanitize, validateResourceData } from "./registry.js";
import { ProfessorModel } from "../../models/professor.model.js";
import { TccModel } from "../../models/tcc.model.js";
import { EstudanteModel } from "../../models/estudante.model.js";

const canAccessResource = async (req, resourceName, row) => {
  if (req.user?.role === "coordenador") return true;
  if (resourceName !== "tccs") return req.method === "GET";

  if (req.user?.role === "aluno") {
    const student = (await EstudanteModel.findAll()).find((item) => String(item.id_user) === String(req.user.id));
    return Boolean(student && String(student.id) === String(row.id_estudante));
  }
  if (req.user?.role === "tutor") {
    const professor = (await ProfessorModel.findAll()).find((item) => String(item.id_user) === String(req.user.id));
    return Boolean(professor && String(professor.id) === String(row.id_professor));
  }
  return false;
};

export const listResource = async (req, res) => {
  try {
    const resourceName = req.params.resource;
    const resource = resources[resourceName];
    if (!resource) return res.status(404).json({ message: "Recurso não encontrado." });

    const rows = await resource.model.findAll();
    let scopedRows = rows;
    if (req.user?.role === "tutor" && resourceName === "estudantes") {
      const professor = await ProfessorModel.findAll();
      const currentProfessor = professor.find((row) => String(row.id_user) === String(req.user.id));
      const tccs = currentProfessor ? await TccModel.findAll() : [];
      const studentIds = new Set(tccs
        .filter((row) => String(row.id_professor) === String(currentProfessor?.id))
        .map((row) => String(row.id_estudante)));
      scopedRows = rows.filter((row) => studentIds.has(String(row.id)));
    }
    const filteredRows = scopedRows.filter((row) => matchesFilters(row, req.query));
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100);
    const start = (page - 1) * limit;
    const pagedRows = filteredRows.slice(start, start + limit);
    const decoratedRows = await decorateRows(resourceName, pagedRows);

    success(res, sanitize(resource, decoratedRows), 200, {
      page,
      limit,
      total: filteredRows.length,
      totalPages: Math.ceil(filteredRows.length / limit),
    });
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
    if (!(await canAccessResource(req, req.params.resource, row))) return res.status(403).json({ message: "Não tem permissão para este registo." });

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
    if (resourceName === "tccs" && req.user?.role !== "coordenador") {
      const reference = { id_estudante: req.body.id_estudante, id_professor: req.body.id_professor };
      if (req.user?.role === "aluno") {
        const student = (await EstudanteModel.findAll()).find((item) => String(item.id_user) === String(req.user.id));
        if (!student) return res.status(403).json({ message: "Perfil de aluno não encontrado." });
        reference.id_estudante = student.id;
        req.body.id_estudante = student.id;
      }
      if (req.user?.role === "tutor") {
        const professor = (await ProfessorModel.findAll()).find((item) => String(item.id_user) === String(req.user.id));
        if (!professor) return res.status(403).json({ message: "Perfil de tutor não encontrado." });
        reference.id_professor = professor.id;
        req.body.id_professor = professor.id;
      }
      if (!(await canAccessResource(req, resourceName, reference))) return res.status(403).json({ message: "Não tem permissão para criar este TCC." });
    }

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
    const current = await resource.model.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Registo não encontrado." });
    if (!(await canAccessResource(req, resourceName, current))) return res.status(403).json({ message: "Não tem permissão para alterar este registo." });

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
    const current = await resource.model.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Registo não encontrado." });
    if (!(await canAccessResource(req, req.params.resource, current))) return res.status(403).json({ message: "Não tem permissão para eliminar este registo." });

    const result = await resource.model.deleteById(req.params.id);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Registo não encontrado." });
    }

    success(res, { id: req.params.id });
  } catch (error) {
    failure(res, error);
  }
};
