import session from "express-session";

export const configSession = (app) => {
    const secret = process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? null : "development-only-change-me");
    if (!secret) throw new Error("SESSION_SECRET é obrigatório em produção.");
    app.use(session({
        secret,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" }
    }));
};
