import path from "path";

import { UserService } from "../services/user-service.js";
import { RoleService } from "../services/role-service.js";
import { generateToken } from "../utils/token/jwt.js";
import { generateDateWith30s } from "../utils/date.js";
import axios from "axios";
import bcrypt from "bcryptjs";
import { EstudanteModel } from "../models/estudante.model.js";
import { ProfessorModel } from "../models/professor.model.js";

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
        const normalizedNMechanographic = role === "aluno" ? null : n_mecanografico;

        const role_id = await RoleService.getRoleByName(role);
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await UserService.gravar({ fullname, email, telefone, idade, genero, role_id: role_id.id, n_processo, curso, area_formacao, n_mecanografico: normalizedNMechanographic, password: hashedPassword });
        if (role === "aluno") {
            await EstudanteModel.store({ id_user: user.id, numero_estudante: Number(n_processo) > 0 ? Number(n_processo) : user.id, numero_processo: n_processo || null, turma: null, ano_lectivo: null, id_curso: Number(curso) });
        } else if (role === "tutor") {
            await ProfessorModel.store({ id_user: user.id, especializacao: null, categoria: null });
        }

        const message = `Caro(a) ${user.fullname}, a sua conta foi criada com sucesso! A sua senha é: ${password}`;
        const dateScheduled= generateDateWith30s();
          
        const data = {
            "message": message,
            "from": "Umbillical",
            "to": user.telefone,
            "schedule": dateScheduled
        };
        const smsToken = process.env.UMBALA_API_TOKEN;
        if (!smsToken) return res.redirect("/users/create");
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${smsToken}`
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
    const id = req.params.id || req.session.userId;
    console.log("Buscando usuário com ID:", id);
    const user = await UserService.buscarPorId(id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: "Usuário não encontrado" });
    }
};

export const findByIdParam = async (req, res) => {
    try {
        const user = await UserService.buscarPorId(req.params.id);
        const { password: _password, ...safeUser } = user;
        return res.json(safeUser);
    } catch (error) {
        return res.status(404).json({ error: "Usuário não encontrado" });
    }
};

export const update = async (req, res) => {
    try {
    const userId = req.params.id || req.session.userId;
    if (!userId) return res.status(400).send("Utilizador não identificado.");
        const allowedFields = ["fullname", "email", "telefone", "idade", "genero", "n_processo", "curso", "area_formacao", "n_mecanografico"];
        const data = Object.fromEntries(Object.entries(req.body).filter(([field]) => allowedFields.includes(field)));
        if (!data.fullname || !data.email) return res.status(400).send("Nome completo e email são obrigatórios.");
        await UserService.atualizar(userId, data);
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
