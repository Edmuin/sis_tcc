import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "curso",
  colunas: {
    nome: "nome",
    descricao: "descricao",
    area_formacao_id: "area_formacao_id"
  },
};

const cursoRepo = Repository(tabela);

export const CursoModel = {
  async findAll() {
    return await cursoRepo.findAll();
  },

  async findById(id) {
    return await cursoRepo.findById(id);
  },

  async store(data) {
    return await cursoRepo.store(data);
  },

  async update(id, data) {
    return await cursoRepo.update(id, data);
  },

  async deleteById(id) {
    return await cursoRepo.deleteById(id);
  },
};
