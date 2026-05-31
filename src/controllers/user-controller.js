import path from "path";

import { UserService } from "../services/user-service.js";

export const index = async (req, res) => {
  // const users = await UserService.listar();
  res.sendFile(path.join(process.cwd(), "src/views/users/index_new.html"));
};

export const show = async (req, res) => {
  try {
    const user = await UserService.buscarPorId(req.params.id);
    res.render("users/show", { user });
  } catch (err) {
    res.status(404).send(err.message);
  }
};

export const createForm = async (req, res) => {
  res.render("users/create");
};

export const store = async (req, res) => {
  try {
    const { name, email } = req.body;
    const avatar = req.file ? req.file.filename : null;
    await UserService.gravar({ name, email, avatar });
    res.redirect("/users");
  } catch (err) {
    res.status(400).send(err.message);
  }
}
