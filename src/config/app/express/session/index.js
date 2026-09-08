import session from "express-session";
import { MySqlSessionStore } from "./mysql-session-store.js";

export const configSession = (app) => {
    const secret = process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? null : "development-only-change-me");
    if (!secret) throw new Error("SESSION_SECRET é obrigatório em produção.");
    if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
    app.use(session({
        name: process.env.SESSION_COOKIE_NAME || "sis_tcc.sid",
        secret,
        store: new MySqlSessionStore(),
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" }
    }));
};
