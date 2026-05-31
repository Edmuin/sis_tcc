import { verifyToken } from "../utils/token/jwt";


export const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header){
        return res.status(400).send({message: "Token de autenticação ausente, Erro de autorização."});
    }

    const token = header.split(" ")[1];

    try {
        const is_logged = verifyToken(token);

        if (is_logged !== true) {
            return res.status(401).send({message: "Acesso não autorizado, Erro de autorização."});
        }

        next();
    } catch (error) {
        return res.status(500).send({message: "Ocorreu algum erro no servidor"});
    }
};
