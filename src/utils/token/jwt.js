import jwt from "jsonwebtoken";


const secretAndExpiresIn = {
    secret: process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? null : "development-only-change-me"),
    expiresIn: "24H" // 1 hora,
};

// Exemplo de payload do token com tempo de expiração de 30 minutos
export const generateToken = (credentials, expiresDate) => {
    if (!secretAndExpiresIn.secret) throw new Error("JWT_SECRET é obrigatório em produção.");
    const options = {
        subject: credentials.email,
        expiresIn: secretAndExpiresIn.expiresIn
    };
    const token = jwt.sign(
        { expiresDate, ...credentials },
        secretAndExpiresIn.secret, options
    );
    return token;
}

export const verifyToken = (token) => {
    try {
    if (!secretAndExpiresIn.secret) return false;
        const tokenDecoded = jwt.verify(token, secretAndExpiresIn.secret);
        if (!tokenDecoded) return false;
        return true;
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return false;
        }
    }
}

export const decodeToken = (token) => {
    try {
    if (!secretAndExpiresIn.secret) return null;
        const tokenDecoded = jwt.verify(token, secretAndExpiresIn.secret);
        if (!tokenDecoded) return null;
        return { ...tokenDecoded };
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return null;
        }
    }
}