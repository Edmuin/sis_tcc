import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "area_formacao",
  colunas: {
    nome: "nome",
    descricao: "descricao"
  },
};

const area_formacaoRepo = Repository(tabela);

export const AreaFormacaoModel = {
  async findAll() {
    return await area_formacaoRepo.findAll();
  },

  async findById(id) {
    return await area_formacaoRepo.findById(id);
  },

  async store(data) {
    return await area_formacaoRepo.store(data);
  },

  async update(id, data) {
    return await area_formacaoRepo.update(id, data);
  },

  async deleteById(id) {
    return await area_formacaoRepo.deleteById(id);
  },
};
