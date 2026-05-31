import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "tcc",
  colunas: {
    tema: "tema",
    objectivo: "objectivo",
    estado: "estado",
    data_submissao: "data_submissao",
    id_estudante: "id_estudante",
    id_professor: "id_professor",
    relatorio_pdf: "relatorio_pdf"
  },
};

const tccRepo = Repository(tabela);

export const TccModel = {
  async findAll() {
    return await tccRepo.findAll();
  },

  async findById(id) {
    return await tccRepo.findById(id);
  },

  async store(data) {
    return await tccRepo.store(data);
  },

  async update(id, data) {
    return await tccRepo.update(id, data);
  },

  async deleteById(id) {
    return await tccRepo.deleteById(id);
  },
};
