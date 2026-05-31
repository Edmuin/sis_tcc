import { pool } from "./mysql/db.js";

// ...existing code...
export const criarTabelaAprovacaoBanca = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS aprovacao_banca (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_banca INT NOT NULL,
      id_subdireccao INT NOT NULL,
      status INT NOT NULL,
      data VARCHAR(20),
      observacao VARCHAR(100),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.execute(query);
}

export const criarTabelaAprovacaoDefesa = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS aprovacao_defesa (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_tcc INT NOT NULL,
      id_subdireccao INT NOT NULL,
      status INT,
      observacao INT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.execute(query);
}

export const criarTabelaAprovacaoTcc = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS aprovacao_tcc (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_tcc INT NOT NULL,
      id_subdireccao INT NOT NULL,
      status INT NOT NULL DEFAULT 0,
      data_aprovacao VARCHAR(20),
      observacao VARCHAR(100),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.execute(query);
}

export const criarTabelaAvaliacao = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS avaliacao (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_tcc INT NOT NULL,
      observacao VARCHAR(100) NOT NULL,
      data_avaliacao VARCHAR(20) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
}

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

export const criarTabelaCurso = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS curso (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(50) NOT NULL,
      descricao VARCHAR(255),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
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

export const criarTabelaDocumento = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS documento (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_tcc INT NOT NULL,
      nome VARCHAR(50) NOT NULL,
      tipo VARCHAR(50) NOT NULL,
      caminho_arquivo VARCHAR(255) NOT NULL,
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

export const criarTabelaProfessorBanca = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS professor_banca (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_professor INT NOT NULL,
      id_banca INT NOT NULL,
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
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY (tema)
    )
  `;
  await pool.query(query);
}

export const criarTabelaUser = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_table (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      telefone VARCHAR(20),
      idade INT NOT NULL DEFAULT 17,
      genero VARCHAR(10),
      foto VARCHAR(255),
      role_id INT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
}

export const dadosDeRoles = async () => {
  const query = `
    INSERT IGNORE INTO role (nome, descricao) VALUES
      ('orientador', NULL),
      ('aluno', NULL),
      ('coordenador', NULL)
  `;
  await pool.query(query);
}

export const criarTodasTabelas = async () => {
  await criarTabelaRole();
  await dadosDeRoles();
  await criarTabelaUser();
  await criarTabelaCurso();
  await criarTabelaEstudante();
  await criarTabelaProfessor();
  await criarTabelaTcc();
  await criarTabelaDocumento();
  await criarTabelaBanca();
  await criarTabelaProfessorBanca();
  await criarTabelaAvaliacao();
  await criarTabelaDefesa();
  await criarTabelaAprovacaoBanca();
  await criarTabelaAprovacaoDefesa();
  await criarTabelaAprovacaoTcc();
  await criarTabelaSubdireccao();
  console.log("Todas as tabelas foram criadas ou já existiam.");
}