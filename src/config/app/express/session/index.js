import session from "express-session";

export const configSession = (app) => {
    app.use(session({
        secret: 'A6vPuutAR5ihwYzR3iDUQXwab6sxAMML98uj9wfc8',
        resave: false,
        saveUninitialized: true
    }));
};
