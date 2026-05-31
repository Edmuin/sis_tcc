// ...existing code...
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const {
  DATABASE_URL,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT
} = process.env;

function buildConnectionUri() {
  const params = new URLSearchParams({
    connectionLimit: '30',
    waitForConnections: 'true',
    queueLimit: '0'
  }).toString();

  if (DATABASE_URL) {
    // evita duplicar ? se já houver query string
    return DATABASE_URL.includes('?') ? `${DATABASE_URL}&${params}` : `${DATABASE_URL}?${params}`;
  }

  const user = encodeURIComponent(DB_USER || 'root');
  const pass = encodeURIComponent(DB_PASSWORD || '');
  const host = DB_HOST || 'localhost';
  const port = DB_PORT || '3306';
  const db = DB_NAME || '';

  return `mysql://${user}:${pass}@${host}:${port}/${db}?${params}`;
}

const connectionUri = buildConnectionUri();

export const pool = mysql.createPool(connectionUri);
export const strCon = connectionUri;
// ...existing code...
// { changed code }



// import mysql from "mysql2/promise";
// import dotenv from "dotenv";

// dotenv.config();

// export const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   waitForConnections: true,
  
//   connectionLimit: 10,
//   queueLimit: 0
// });