import path from "path";

import { UserService } from "../services/user-service.js";
import { RoleService } from "../services/role-service.js";
import { generateToken } from "../utils/token/jwt.js";
import { generateDateWith30s } from "../utils/date.js";
import { hasValue, isValidEmail, isValidPhone, normalizeRole, normalizeText } from "../utils/validation.js";
import axios from "axios";

const allowedGenero = ["masculino", "feminino"];

const normalizeUserPayload = (body) => ({
    role: normalizeRole(body.role),
    fullname: normalizeText(body.fullname),
    email: normalizeText(body.email).toLowerCase(),
    telefone: normalizeText(body.telefone),
    idade: body.idade,
    genero: normalizeText(body.genero),
    n_processo: normalizeText(body.n_processo),
    n_mecanografico: normalizeText(body.n_mecanografico),
    curso: normalizeText(body.curso),
    area_formacao: normalizeText(body.area_formacao),
});

const validateUserPayload = async (data) => {
    const errors = [];

    if (!hasValue(data.role)) errors.push("tipo de utilizador é obrigatório");
    else if (!(await RoleService.getRoleByName(data.role))) errors.push("tipo de utilizador inválido");

    if (!hasValue(data.fullname)) errors.push("nome completo é obrigatório");
    else if (data.fullname.length < 3) errors.push("nome completo deve ter pelo menos 3 caracteres");

    if (!hasValue(data.email)) errors.push("email é obrigatório");
    else if (!isValidEmail(data.email)) errors.push("email inválido");

    if (!hasValue(data.telefone)) errors.push("telefone é obrigatório");
    else if (!isValidPhone(data.telefone)) errors.push("telefone inválido");

    if (!hasValue(data.idade)) errors.push("idade é obrigatória");
    else {
        const idade = Number(data.idade);
        if (!Number.isInteger(idade) || idade < 15 || idade > 100) errors.push("idade deve estar entre 15 e 100 anos");
    }

    if (!hasValue(data.genero)) errors.push("género é obrigatório");
    else if (!allowedGenero.includes(normalizeRole(data.genero))) errors.push("género inválido");

    if (data.role === "aluno") {
        if (!hasValue(data.n_processo)) errors.push("nº de processo é obrigatório para aluno");
        if (!hasValue(data.curso)) errors.push("curso é obrigatório para aluno");
    }

    if (["professor", "tutor"].includes(data.role) && !hasValue(data.n_mecanografico)) {
        errors.push("nº mecanográfico é obrigatório para professor");
    }

    if (["coordenador", "subdirecao"].includes(data.role)) {
        if (!hasValue(data.n_mecanografico)) errors.push("nº mecanográfico é obrigatório para Subdireção");
        if (!hasValue(data.area_formacao)) errors.push("área de formação é obrigatória para Subdireção");
    }

    return errors;
};

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
        const payload = normalizeUserPayload(req.body);
        const errors = await validateUserPayload(payload);
        if (errors.length > 0) return res.status(400).send(errors.join("; "));

        const role_id = await RoleService.getRoleByName(payload.role);
        const password = Math.random().toString(36).slice(-8); // Gerar uma senha aleatória de 8 caracteres
        const { role, ...userData } = payload;
        const user = await UserService.gravar({ ...userData, role_id: role_id.id, password });

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
        if (err?.code === "ER_DUP_ENTRY") return res.status(400).send("Já existe um utilizador com este email.");
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
