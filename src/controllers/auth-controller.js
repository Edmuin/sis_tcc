import path from "path";

import { CursoModel } from "../models/curso.model.js";
import { EstudanteModel } from "../models/estudante.model.js";
import { ProfessorModel } from "../models/professor.model.js";
import { UserModel } from "../models/user.model.js";
import { AuthService } from "../services/auth-service.js";
import { UserService } from "../services/user-service.js";
import { RoleService } from "../services/role-service.js";
import { generateToken } from "../utils/token/jwt.js";
import { hasValue, isValidEmail, isValidPhone, normalizeRole, normalizeText } from "../utils/validation.js";
import axios from "axios";
import { generateDateWith30s } from "../utils/date.js";

const redirectByRole = {
    aluno: "/tcc",
    professor: "/tcc",
    tutor: "/tcc",
    coordenador: "/PainelPrincipal",
    subdirecao: "/PainelPrincipal",
    subdireção: "/PainelPrincipal",
};

const allowedRoles = ["aluno", "tutor", "professor", "coordenador", "subdirecao"];
const allowedGenero = ["masculino", "feminino"];

const validationError = (res, message) => res.status(400).send({ message });

const resolveCursoId = async (value) => {
    if (!hasValue(value)) return null;

    const numericId = Number(value);
    if (Number.isInteger(numericId) && numericId > 0) {
        const curso = await CursoModel.findById(numericId);
        if (curso) return numericId;
    }

    const cursos = await CursoModel.findAll();
    const curso = cursos.find((item) => normalizeRole(item.nome) === normalizeRole(value));
    return curso?.id || null;
};

const createAcademicProfile = async (user, payload, role) => {
    const normalizedRole = normalizeRole(role);

    if (normalizedRole === "aluno") {
        const idCurso = await resolveCursoId(payload.curso);
        if (!idCurso) return;

        await EstudanteModel.store({
            id_user: user.id,
            numero_estudante: Number(payload.n_processo) || user.id,
            numero_processo: payload.n_processo,
            turma: null,
            ano_lectivo: String(new Date().getFullYear()),
            id_curso: idCurso,
        });
    }

    if (["professor", "tutor"].includes(normalizedRole)) {
        await ProfessorModel.store({
            id_user: user.id,
            especializacao: payload.curso || null,
            categoria: "Tutor",
        });
    }
};

const normalizeUserPayload = (body) => ({
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

const validateUserPayload = (data, role) => {
    const errors = [];
    const normalizedRole = normalizeRole(role);

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

    if (!allowedRoles.includes(normalizedRole)) errors.push("tipo de utilizador inválido");

    if (normalizedRole === "aluno") {
        if (!hasValue(data.n_processo)) errors.push("nº de processo é obrigatório para aluno");
        if (!hasValue(data.curso)) errors.push("curso é obrigatório para aluno");
    }

    if (["professor", "tutor"].includes(normalizedRole) && !hasValue(data.n_mecanografico)) {
        errors.push("nº mecanográfico é obrigatório para professor");
    }

    if (["coordenador", "subdirecao"].includes(normalizedRole)) {
        if (!hasValue(data.n_mecanografico)) errors.push("nº mecanográfico é obrigatório para Subdireção");
        if (!hasValue(data.area_formacao)) errors.push("área de formação é obrigatória para Subdireção");
    }

    return errors;
};

export const signin = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/auth/sign_in.html"));
};

export const login = async (req, res) => {
    try {
        const email = normalizeText(req.body.email).toLowerCase();
        const password = String(req.body.password || "");
        if (!hasValue(email) || !hasValue(password)) {
            return validationError(res, "Email e palavra-passe são obrigatórios.");
        }
        if (!isValidEmail(email)) {
            return validationError(res, "Email inválido.");
        }

        const user = await UserService.buscarPorEmail(email);
        if (!user) {
            return res.status(404).send({message: "Credenciais inválidas"});
        }
        if (user.password !== password) {
            return res.status(404).send({message: "Credenciais inválidas"});
        }
        const role = user.role_id ? await RoleService.getRoleById(user.role_id) : null;
        const roleName = role?.nome || "";
        const redirectTo = redirectByRole[roleName] || "/PainelPrincipal";
        const expiresDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expira em 24 horas
        const token = generateToken({name: user.fullname, email: user.email, role: roleName}, expiresDate); // Gerar um token de autenticação aleatório
        const authenticatedUser = { ...user, role: roleName };
        req.session.user = authenticatedUser;
        console.log("Token gerado:", { user: authenticatedUser, token });
        return res.json({ user: authenticatedUser, token, redirectTo });
    } catch (err) {
        res.status(404).json({ message: err.message || "Credenciais inválidas" });
    }
};

export const signup = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/auth/register.html"));
};

export const userType = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/auth/user_type.html"));
};

export const selectType = async (req, res) => {
    try {
        const role = normalizeRole(req.body.role);
        if (!allowedRoles.includes(role)) {
            return res.status(400).send("Tipo de utilizador inválido");
        }

        const storedRole = role === "professor" ? "tutor" : role;
        req.session.role = { role: storedRole };
        switch (role) {
            case "aluno":
                res.redirect("/auth/sign-up/aluno");
                break;
            case "tutor":
            case "professor":
                res.redirect("/auth/sign-up/professor");
                break;
            case "coordenador":
            case "subdirecao":
            case "subdireção":
                res.redirect("/auth/sign-up/coordenador");
                break;
            default:
                res.status(400).send("Tipo de utilizador inválido");
        }
    } catch (err) {
        res.status(400).send(err.message);
    }
};

export const signup_aluno = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/auth/sign_up_aluno.html"));
};

export const signup_professor = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/auth/sign_up_professor.html"));
};

export const signup_coordenador = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/auth/sign_up_coordenador.html"));
};

export const register = async (req, res) => {
    try {
        const role = normalizeRole(req.session.role?.role || req.body.role);
        const normalizedRole = normalizeRole(role);
        const payload = normalizeUserPayload(req.body);
        const errors = validateUserPayload(payload, normalizedRole);
        if (errors.length > 0) return res.status(400).send(errors.join("; "));

        const role_id = await RoleService.getRoleByName(role);
        if (!role_id) return res.status(400).send("Tipo de utilizador inválido");

        const existingUser = await UserModel.findByEmail(payload.email);
        if (existingUser) return res.status(400).send("Já existe um utilizador com este email.");

        const password = Math.random().toString(36).slice(-8); // Gerar uma senha aleatória de 8 caracteres
        const user = await UserService.gravar({ ...payload, role_id: role_id.id, password });
        await createAcademicProfile(user, payload, role);

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

        res.redirect("/auth/sign-in");
    } catch (err) {
        if (err?.code === "ER_DUP_ENTRY") return res.status(400).send("Já existe um utilizador com este email.");
        res.status(400).send(err.message);
    }
};

export const logout = async (req, res) => {
    req.session.destroy();
    res.redirect("/auth/sign-in");
};
