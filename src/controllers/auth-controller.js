import path from "path";

import { AuthService } from "../services/auth-service.js";
import { UserService } from "../services/user-service.js";
import { RoleService } from "../services/role-service.js";
import { generateToken } from "../utils/token/jwt.js";
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

export const signin = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/auth/sign_in.html"));
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
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
        const { role } = req.body;
        req.session.role = { role };
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
        const { fullname, email, telefone, idade, genero, n_processo, n_mecanografico, curso, area_formacao } = req.body;
        const { role } = req.session.role;
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

        res.redirect("/auth/sign-in");
    } catch (err) {
        res.status(400).send(err.message);
    }
};

export const logout = async (req, res) => {
    req.session.destroy();
    res.redirect("/auth/sign-in");
};
