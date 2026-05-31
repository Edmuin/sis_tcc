import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "professor",
  colunas: {
    id_user: "id_user",
    especializacao: "especializacao",
    categoria: "categoria"
  },
};

const professorRepo = Repository(tabela);

export const ProfessorModel = {
  async findAll() {
    return await professorRepo.findAll();
  },

  async findById(id) {
    return await professorRepo.findById(id);
  },

  async store(data) {
    return await professorRepo.store(data);
  },

  async deleteById(id) {
    return await professorRepo.deleteById(id);
  },
};