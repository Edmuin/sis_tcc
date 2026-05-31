import path from "path";
import dotenv from "dotenv";
dotenv.config();

const ROOT = process.cwd();

export const PATHS = {
  root: ROOT,
  public: path.join(ROOT, process.env.PUBLIC_PATH || "src/public"),
  views: path.join(ROOT, process.env.VIEWS_PATH || "src/views"),
  uploads: path.join(ROOT, process.env.UPLOADS_PATH || "uploads"),
};
