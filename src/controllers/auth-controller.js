import path from "path";

import { AuthService } from "../services/auth-service.js";
import { UserService } from "../services/user-service.js";
import { RoleService } from "../services/role-service.js";
import { generateToken } from "../utils/token/jwt.js";
import axios from "axios";
import { generateDateWith30s } from "../utils/date.js";
import { CursoModel } from "../models/curso.model.js";
import { AreaFormacaoModel } from "../models/area_formacao.model.js";
import { RoleModel } from "../models/role.model.js";
import { EstudanteModel } from "../models/estudante.model.js";
import { ProfessorModel } from "../models/professor.model.js";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { isPublicRegistrationRole } from "../services/registration-policy.js";

export const signin = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/auth/sign_in.html"));
};

export const forgotPasswordPage = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/auth/forgot_password.html"));
};

export const forgotPasswordResult = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/auth/forgot_password_result.html"));
};

export const forgotPassword = async (req, res) => {
    try {
        let user;
        try {
            user = await UserService.buscarPorEmail(req.body.email);
        } catch (error) {
            if (error.message === "Usuário não encontrado.") {
                return res.redirect("/auth/forgot-password/result?status=sent");
            }
            throw error;
        }
        const smsToken = process.env.UMBALA_API_TOKEN;
        if (!smsToken) return res.redirect("/auth/forgot-password/result?status=config");

        const temporaryPassword = randomBytes(6).toString("base64url").slice(0, 8);
        const smsUrl = process.env.UMBALA_API_URL || "https://api.useombala.ao/v1/messages";
        const smsFrom = process.env.UMBALA_SMS_FROM || "Gestor TCC";
        await axios.post(smsUrl, {
            message: `A sua palavra-passe temporária do Gestor TCC é: ${temporaryPassword}`,
            from: smsFrom,
            to: user.telefone,
            schedule: generateDateWith30s(),
        }, {
            headers: { "Content-Type": "application/json", Authorization: `Token ${smsToken}` },
        });
        await UserService.atualizar(user.id, {
            password: await bcrypt.hash(temporaryPassword, 12),
            password_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        return res.redirect("/auth/forgot-password/result?status=sent");
    } catch (error) {
        console.error("Erro na recuperação da palavra-passe:", error.message);
        return res.redirect("/auth/forgot-password/result?status=error");
    }
};

export const registrationOptions = async (req, res) => {
    try {
        const [cursos, areas] = await Promise.all([
            CursoModel.findAllWithArea(),
            AreaFormacaoModel.findAll(),
        ]);
        res.json({ cursos, areas });
    } catch (error) {
        console.error("Erro ao carregar opções de registo:", error);
        res.status(500).json({ message: "Não foi possível carregar cursos e áreas." });
    }
};

export const registrationCourses = async (req, res) => {
    try {
        res.json({ data: await CursoModel.findAllWithArea() });
    } catch (error) {
        console.error("Erro ao carregar cursos para registo:", error);
        res.status(500).json({ message: "Não foi possível carregar os cursos." });
    }
};

export const registrationAreas = async (req, res) => {
    try {
        res.json({ data: await AreaFormacaoModel.findAll() });
    } catch (error) {
        console.error("Erro ao carregar áreas para registo:", error);
        res.status(500).json({ message: "Não foi possível carregar as áreas." });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Informe o email e a palavra-passe." });
        }

        const user = await UserService.buscarPorEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }
        const passwordMatches = user.password?.startsWith("$2")
            ? await bcrypt.compare(password, user.password)
            : user.password === password;
        if (!passwordMatches) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }
        if (user.password_expires_at && new Date(user.password_expires_at) <= new Date()) {
            return res.status(401).json({ message: "A palavra-passe temporária expirou. Solicite uma nova recuperação." });
        }
        if (!user.password?.startsWith("$2")) {
            await UserService.atualizar(user.id, { password: await bcrypt.hash(password, 12) });
        }
        const expiresDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expira em 24 horas
        const roleName = (await RoleModel.findById(user.role_id))?.nome;
        const token = generateToken({id: user.id, name: user.fullname, email: user.email, role_id: user.role_id, role: roleName}, expiresDate);
        const { password: _password, ...safeUser } = user;
        safeUser.role = roleName;
        req.session.user = { id: user.id, name: user.fullname, email: user.email, role_id: user.role_id, role: roleName };
        return res.json({ user: safeUser, token });
    } catch (err) {
        if (err.message === "Usuário não encontrado.") {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }
        console.error("Erro ao iniciar sessão:", err);
        return res.status(500).json({ message: "Não foi possível iniciar sessão." });
    }
};

export const currentUser = (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Não autenticado." });
    UserService.buscarPorEmail(req.user.email)
        .then((user) => {
            const { password: _password, ...safeUser } = user;
            safeUser.role = req.user.role;
            res.json({ data: safeUser });
        })
        .catch(() => res.status(404).json({ message: "Utilizador não encontrado." }));
};

export const updateCurrentUser = async (req, res) => {
    try {
        const current = await UserService.buscarPorEmail(req.user.email);
        const allowedFields = ["fullname", "telefone", "idade", "genero"];
        const data = Object.fromEntries(Object.entries(req.body).filter(([field]) => allowedFields.includes(field)));

        if (req.body.newPassword) {
            const currentPasswordMatches = current.password?.startsWith("$2")
                ? await bcrypt.compare(req.body.currentPassword || "", current.password)
                : current.password === req.body.currentPassword;
            if (!req.body.currentPassword || !currentPasswordMatches) {
                return res.status(400).json({ message: "A palavra-passe atual é inválida." });
            }
            data.password = await bcrypt.hash(req.body.newPassword, 12);
        }

        const updated = await UserService.atualizar(current.id, data);
        const { password: _password, ...safeUser } = updated;
        return res.json({ data: safeUser });
    } catch (error) {
        return res.status(400).json({ message: error.message });
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
        const { role } = req.body;
        if (!isPublicRegistrationRole(role)) {
            return res.status(400).send("Tipo de utilizador inválido para cadastro público.");
        }
        req.session.role = { role };
        switch (role) {
            case "aluno":
                res.redirect("/auth/sign-up/aluno");
                break;
            case "tutor":
                res.redirect("/auth/sign-up/professor");
                break;
            case "coordenador":
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
        const { fullname, email, telefone, idade, genero, n_processo, n_mecanografico, curso, area_formacao } = req.body;
        const role = req.session.role?.role;
        if (!role) return res.status(400).send("Seleccione primeiro o tipo de utilizador.");
        if (!isPublicRegistrationRole(role)) {
            return res.status(403).send("Este perfil só pode ser criado pela administração do sistema.");
        }

        if (["aluno", "tutor"].includes(role)) {
            if (!curso || !(await CursoModel.findById(curso))) {
                return res.status(400).send("Seleccione um curso válido.");
            }
        }

        const normalizedNMechanographic = role === "aluno" ? null : n_mecanografico;
        const role_id = await RoleService.getRoleByName(role);
        if (!role_id) return res.status(400).send("Tipo de utilizador inválido.");
        const password = randomBytes(12).toString("base64url");
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await UserService.gravar({ fullname, email, telefone, idade, genero, role_id: role_id.id, n_processo, curso, area_formacao, n_mecanografico: normalizedNMechanographic, password: hashedPassword, password_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) });

        if (role === "aluno") {
            await EstudanteModel.store({
                id_user: user.id,
                numero_estudante: Number(n_processo) > 0 ? Number(n_processo) : user.id,
                numero_processo: n_processo || null,
                turma: null,
                ano_lectivo: null,
                id_curso: Number(curso),
            });
        } else if (role === "tutor") {
            await ProfessorModel.store({ id_user: user.id, especializacao: null, categoria: null });
        }

        const message = `Caro(a) ${user.fullname}, a sua conta foi criada com sucesso! A sua senha é: ${password}`;
        const dateScheduled = generateDateWith30s();
        
        const data = {
            "message": message,
            "from": process.env.UMBALA_SMS_FROM || "Gestor TCC",
            "to": user.telefone,
            "schedule": dateScheduled
        };
        const smsToken = process.env.UMBALA_API_TOKEN;
        if (!smsToken) {
            console.error("Cadastro concluído, mas UMBALA_API_TOKEN não está configurado.");
        } else {
            try {
                await axios.post(
                    process.env.UMBALA_API_URL || "https://api.useombala.ao/v1/messages",
                    data,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Token ${smsToken}`
                        }
                    }
                );
            } catch (error) {
                console.error("Erro ao enviar mensagem:", error.response?.data || error.message);
            }
        }

        res.redirect("/auth/sign-in");
    } catch (err) {
        res.status(400).send(err.message);
    }
};

export const logout = async (req, res) => {
    req.session.destroy(() => res.redirect("/auth/sign-in"));
};
