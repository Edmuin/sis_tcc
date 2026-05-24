import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "role",
  colunas: {
    nome: "nome",
    descricao: "descricao"
  },
};

const roleRepo = Repository(tabela);

export const RoleModel = {
  async findAll() {
    return await roleRepo.findAll();
  },

  async findById(id) {
    return await roleRepo.findById(id);
  },

  async store(data) {
    return await roleRepo.store(data);
  },

  async deleteById(id) {
    return await roleRepo.deleteById(id);
  },
};