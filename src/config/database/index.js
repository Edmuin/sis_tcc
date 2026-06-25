import { pool } from "./mysql/db.js";

export const criarTabelaBanca = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS banca (
      id INT AUTO_INCREMENT PRIMARY KEY,
      data VARCHAR(20),
      sala INT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
}

export const criarTabelaAreaFormacao = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS area_formacao (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(50) NOT NULL,
      descricao VARCHAR(255),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
}

export const criarTabelaCurso = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS curso (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(50) NOT NULL,
      descricao VARCHAR(255),
      area_formacao_id INT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
  await garantirColunaCurso("area_formacao_id", "INT NOT NULL DEFAULT 1");
}

const garantirColunaCurso = async (coluna, definicao) => {
  const [rows] = await pool.query(`SHOW COLUMNS FROM curso LIKE ?`, [coluna]);
  if (rows.length > 0) return;

  try {
    await pool.query(`ALTER TABLE curso ADD COLUMN ${coluna} ${definicao}`);
  } catch (error) {
    if (error?.code === "ER_DUP_FIELDNAME") return;
    throw error;
  }
}

export const criarTabelaDefesa = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS defesa (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_tcc INT NOT NULL,
      id_banca INT NOT NULL,
      data_defesa VARCHAR(50) NOT NULL,
      resultado VARCHAR(20) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
}

export const criarTabelaEstudante = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS estudante (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_user INT,
      numero_estudante INT NOT NULL,
      numero_processo VARCHAR(50),
      turma VARCHAR(15),
      ano_lectivo VARCHAR(15),
      id_curso INT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
}

export const criarTabelaProfessor = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS professor (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_user INT NOT NULL,
      especializacao VARCHAR(50),
      categoria VARCHAR(50),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
}

export const criarTabelaRole = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS role (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      descricao VARCHAR(255),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY (nome)
    )
  `;
  await pool.query(query);
}

export const criarTabelaSubdireccao = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS subdireccao (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_user INT,
      cargo VARCHAR(255),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
}

export const criarTabelaTcc = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS tcc (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tema VARCHAR(255),
      objectivo VARCHAR(255),
      estado DOUBLE NOT NULL DEFAULT 0,
      data_submissao TIMESTAMP NULL DEFAULT NULL,
      id_estudante INT NOT NULL,
      id_professor INT NOT NULL,
      relatorio_pdf VARCHAR(255),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY (tema)
    )
  `;
  await pool.query(query);
  await garantirColunaTcc("relatorio_pdf", "VARCHAR(255)");
}

const garantirColunaTcc = async (coluna, definicao) => {
  const [rows] = await pool.query(`SHOW COLUMNS FROM tcc LIKE ?`, [coluna]);
  if (rows.length > 0) return;

  await pool.query(`ALTER TABLE tcc ADD COLUMN ${coluna} ${definicao}`);
}

export const criarTabelaUser = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fullname VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      telefone VARCHAR(20),
      idade INT NOT NULL DEFAULT 17,
      genero VARCHAR(10),
      role_id INT,
      n_processo VARCHAR(50) NULL,
      curso VARCHAR(50) NULL,
      area_formacao VARCHAR(50) NULL,
      n_mecanografico VARCHAR(50) NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
}

export const dadosDeRoles = async () => {
  const query = `
    INSERT IGNORE INTO role (nome, descricao) VALUES
      ('tutor', NULL),
      ('aluno', NULL),
      ('coordenador', NULL)
  `;
  await pool.query(query);
}

export const criarTodasTabelas = async () => {
  await criarTabelaRole();
  await dadosDeRoles();
  await criarTabelaUser();
  await criarTabelaAreaFormacao();
  await criarTabelaCurso();
  await criarTabelaEstudante();
  await criarTabelaProfessor();
  await criarTabelaTcc();
  await criarTabelaBanca();
  await criarTabelaDefesa();
  await criarTabelaSubdireccao();
  console.log("Todas as tabelas foram criadas ou já existiam.");
}
