import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "professor_banca",
  colunas: {
    id_professor: "id_professor",
    id_banca: "id_banca"
  },
};

const prof_bancaRepo = Repository(tabela);

export const ProfessorBancaModel = {
  async findAll() {
    return await prof_bancaRepo.findAll();
  },

  async findById(id) {
    return await prof_bancaRepo.findById(id);
  },

  async store(data) {
    return await prof_bancaRepo.store(data);
  },

  async deleteById(id) {
    return await prof_bancaRepo.deleteById(id);
  },
};