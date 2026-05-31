import { UserModel } from "../models/user.model.js";

export const UserService = {
  async listar() {
    return await UserModel.findAll();
  },

  async gravar(dados) {
    if (!dados.name || !dados.email)
      throw new Error("Nome e email são obrigatórios.");

    const novo = await UserModel.store(dados);
    return novo;
  },

  async buscarPorId(id) {
    const user = await UserModel.findById(id);
    if (!user) throw new Error("Usuário não encontrado.");
    return user;
  },

  async EliminarPorId(id) {
    const user = await UserModel.deleteById(id);
    if (!user) throw new Error("Usuário não encontrado.");
    return user;
  }
};
