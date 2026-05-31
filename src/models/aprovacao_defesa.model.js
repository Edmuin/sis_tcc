import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "aprovacao_defesa",
  colunas: {
    id_tcc: "id_tcc",
    id_subdireccao: "id_subdireccao",
    status: "status",
    observacao: "observacao"
  },
  // colunas: "(id_defesa, id_subdireccao, status, data, observacao)",
  // querys: "(?, ?, ?, ?, ?)",
};

const apro_defesaRepo = Repository(tabela);

export const AprovacaoDefesaModel = {
  async findAll() {
    return await apro_defesaRepo.findAll();
  },

  async findById(id) {
    return await apro_defesaRepo.findById(id);
  },

  async store(data) {
    return await apro_defesaRepo.store(data);
  },

  async update(id, data) {
    return await apro_defesaRepo.update(id, data);
  },

  async deleteById(id) {
    return await apro_defesaRepo.deleteById(id);
  },
};
