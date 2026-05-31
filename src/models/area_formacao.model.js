import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "area_formacao",
  colunas: {
    id_area: "id_area",
    nome: "nome",
    descricao: "descricao"
  },
  // colunas: "(id_area, nome, descricao)",
  // querys: "(?, ?, ?)",

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

  async deleteById(id) {
    return await area_formacaoRepo.deleteById(id);
  },
};