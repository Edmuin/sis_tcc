import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "banca",
  colunas: {
    data: "data",
    sala: "sala"
  },
};

const bancaRepo = Repository(tabela);

export const BancaModel = {
  async findAll() {
    return await cursoRepo.findAll();
  },

  async findById(id) {
    return await cursoRepo.findById(id);
  },

  async store(data) {
    return await cursoRepo.store(data);
  },

  async deleteById(id) {
    return await cursoRepo.deleteById(id);
  },
};