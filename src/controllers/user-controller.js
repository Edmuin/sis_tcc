import path from "path";

import { UserService } from "../services/user-service.js";
import { RoleService } from "../services/role-service.js";
import { generateToken } from "../utils/token/jwt.js";
import { generateDateWith30s } from "../utils/date.js";
import axios from "axios";

export const index = async (req, res) => {
    // const users = await UserService.listar();
    res.sendFile(path.join(process.cwd(), "src/views/users/index.html"));
};

export const all = async (req, res) => {
    console.log("Listando usuários...");
    const users = await UserService.listar();
    res.json(users);
};

export const show = async (req, res) => {
    try {
        const user = await UserService.buscarPorId(req.params.id);
        res.sendFile(path.join(process.cwd(), "src/views/users/show.html"));
    } catch (err) {
        res.status(404).send(err.message);
    }
};

export const create = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/users/create.html"));
};

export const store = async (req, res) => {
    try {
      
        const { role, fullname, email, telefone, idade, genero, n_processo, n_mecanografico, curso, area_formacao } = req.body;

        const role_id = await RoleService.getRoleByName(role);
        const password = Math.random().toString(36).slice(-8); // Gerar uma senha aleatória de 8 caracteres
        const user = await UserService.gravar({ fullname, email, telefone, idade, genero, role_id: role_id.id, n_processo, curso, area_formacao, n_mecanografico, password });

        const message = `Caro(a) ${user.fullname}, a sua conta foi criada com sucesso! A sua senha é: ${password}`;
        const dateScheduled= generateDateWith30s();
          
        const data = {
            "message": message,
            "from": "Umbillical",
            "to": user.telefone,
            "schedule": dateScheduled
        };
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Token be4829cc-f4d8-4a06-bf58-3e9dcc09c364"
            }
        };

        try {
            const responseSendedMessage = await axios.post(
                "https://api.useombala.ao/v1/messages",
                data,
                config
            );
        }catch (error) {
            console.error("Erro ao enviar mensagem:", error.response ? error.response.data : error.message);
        }

        res.redirect("/users/create");
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export const edit = async (req, res) => {
    console.log("Editando usuário com ID:", req.params.id);
    req.session.userId = req.params.id;
    res.sendFile(path.join(process.cwd(), "src/views/users/edit.html"));
};

export const findById = async (req, res) => {
    const id = req.session.userId;
    console.log("Buscando usuário com ID:", id);
    const user = await UserService.buscarPorId(id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: "Usuário não encontrado" });
    }
};

export const update = async (req, res) => {
    try {
        const { name, email } = req.body;
        const avatar = req.file ? req.file.filename : null;
        await UserService.gravar({ name, email, avatar });
        res.redirect("/users");
    } catch (err) {
        res.status(400).send(err.message);
    }
};

export const destroy = async (req, res) => {
    try {
        await UserService.EliminarPorId(req.params.id);
        res.redirect("/users");
    }catch (err) {
        res.status(400).send(err.message);
    }
};
