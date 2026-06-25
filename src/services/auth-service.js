import { UserModel } from "../models/user.model.js";

export const AuthService = {
  async login (dados) {
    if (!dados.name || !dados.email)
      throw new Error("Nome e email são obrigatórios.");

    const novo = await UserModel.store(dados);
    return novo;
  },

  async logout (id) {
    const user = await UserModel.findById(id);
    if (!user) throw new Error("Usuário não encontrado.");
    return user;
  },
};