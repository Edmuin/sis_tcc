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
    return await bancaRepo.findAll();
  },

  async findAllOrdered() {
    const rows = await bancaRepo.findAll();
    return rows.sort((a, b) => Number(b.id) - Number(a.id));
  },

  async findById(id) {
    return await bancaRepo.findById(id);
  },

  async store(data) {
    return await bancaRepo.store(data);
  },

  async update(id, data) {
    return await bancaRepo.update(id, data);
  },

  async deleteById(id) {
    return await bancaRepo.deleteById(id);
  },
};
