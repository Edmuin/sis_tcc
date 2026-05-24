import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "estudante",
  colunas: {
    id_user: "id_user",
    numero_estudante: "numero_estudante",
    numero_processo: "numero_processo",
    turma: "turma",
    ano_lectivo: "ano_lectivo",
    id_curso: "id_curso"
  },
};

const estudanteRepo = Repository(tabela);

export const EstudanteModel = {
  async findAll() {
    return await estudanteRepo.findAll();
  },

  async findById(id) {
    return await estudanteRepo.findById(id);
  },

  async store(data) {
    return await estudanteRepo.store(data);
  },

  async deleteById(id) {
    return await estudanteRepo.deleteById(id);
  },
};