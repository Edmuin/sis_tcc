import jwt from "jsonwebtoken";


const secretAndExpiresIn = {
    secret: "A6vPuutAR5ihwYzR3iDUQXwab6sxAMML98uj9wfc8",
    expiresIn: "24H" // 1 hora,
};

// Exemplo de payload do token com tempo de expiração de 30 minutos
export const generateToken = (credentials, expiresDate) => {
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
        const tokenDecoded = jwt.verify(token, secretAndExpiresIn.secret);
        if (!tokenDecoded) return null;
        return { ...tokenDecoded };
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return null;
        }
    }
}