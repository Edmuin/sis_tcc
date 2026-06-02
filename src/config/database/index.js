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
  await pool.query(`
    INSERT INTO tcc_historico (id_tcc, estado_novo, acao, responsavel, observacao, created_at)
    SELECT
      tcc.id,
      COALESCE(tcc.estado, 'rascunho'),
      'Histórico inicial',
      'Sistema',
      'Registo importado a partir dos dados existentes.',
      COALESCE(tcc.created_at, CURRENT_TIMESTAMP)
    FROM tcc
    WHERE NOT EXISTS (
      SELECT 1
      FROM tcc_historico
      WHERE tcc_historico.id_tcc = tcc.id
    )
  `);
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
      tipo VARCHAR(20) NOT NULL DEFAULT 'individual',
      estado VARCHAR(30) NOT NULL DEFAULT 'rascunho',
      observacao TEXT,
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
  await garantirColunaTcc("tipo", "VARCHAR(20) NOT NULL DEFAULT 'individual'");
  await garantirColunaTcc("observacao", "TEXT");
  await garantirDefinicaoColunaTcc("estado", "VARCHAR(30) NOT NULL DEFAULT 'rascunho'");
  await normalizarEstadosTcc();
  await garantirColunaTcc("relatorio_pdf", "VARCHAR(255)");
}

const garantirColunaTcc = async (coluna, definicao) => {
  const [rows] = await pool.query(`SHOW COLUMNS FROM tcc LIKE ?`, [coluna]);
  if (rows.length > 0) return;

  await pool.query(`ALTER TABLE tcc ADD COLUMN ${coluna} ${definicao}`);
}

const garantirDefinicaoColunaTcc = async (coluna, definicao) => {
  const [rows] = await pool.query(`SHOW COLUMNS FROM tcc LIKE ?`, [coluna]);
  if (rows.length === 0) {
    await pool.query(`ALTER TABLE tcc ADD COLUMN ${coluna} ${definicao}`);
    return;
  }

  if (rows[0].Type !== "varchar(30)") {
    await pool.query(`ALTER TABLE tcc MODIFY COLUMN ${coluna} ${definicao}`);
  }
}

const normalizarEstadosTcc = async () => {
  await pool.query(`
    UPDATE tcc
    SET estado = CASE
      WHEN estado IN ('0', '0.0', '') OR estado IS NULL THEN 'rascunho'
      WHEN estado IN ('1', '1.0') THEN 'submetido'
      WHEN estado IN ('2', '2.0') THEN 'aprovado'
      WHEN estado IN ('3', '3.0') THEN 'rejeitado'
      ELSE estado
    END
  `);
}

export const criarTabelaTccEstudante = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS tcc_estudante (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_tcc INT NOT NULL,
      id_estudante INT NOT NULL,
      papel VARCHAR(20) NOT NULL DEFAULT 'autor',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_tcc_estudante (id_tcc, id_estudante),
      CONSTRAINT fk_tcc_estudante_tcc FOREIGN KEY (id_tcc) REFERENCES tcc(id) ON DELETE CASCADE,
      CONSTRAINT fk_tcc_estudante_estudante FOREIGN KEY (id_estudante) REFERENCES estudante(id)
    )
  `;
  await pool.query(query);
  await pool.query(`
    INSERT IGNORE INTO tcc_estudante (id_tcc, id_estudante, papel)
    SELECT id, id_estudante, 'principal'
    FROM tcc
    WHERE id_estudante IS NOT NULL
  `);
}

export const criarTabelaTccHistorico = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS tcc_historico (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_tcc INT NOT NULL,
      estado_anterior VARCHAR(30),
      estado_novo VARCHAR(30) NOT NULL,
      acao VARCHAR(50) NOT NULL,
      responsavel VARCHAR(100),
      observacao TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_tcc_historico_tcc FOREIGN KEY (id_tcc) REFERENCES tcc(id) ON DELETE CASCADE
    )
  `;
  await pool.query(query);
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
  await garantirColunaUser("fullname", "VARCHAR(255) NOT NULL DEFAULT ''");
  await garantirColunaUser("telefone", "VARCHAR(20)");
  await garantirColunaUser("idade", "INT NOT NULL DEFAULT 17");
  await garantirColunaUser("genero", "VARCHAR(10)");
  await garantirColunaUser("role_id", "INT");
  await garantirColunaUser("n_processo", "VARCHAR(50) NULL");
  await garantirColunaUser("curso", "VARCHAR(50) NULL");
  await garantirColunaUser("area_formacao", "VARCHAR(50) NULL");
  await garantirColunaUser("n_mecanografico", "VARCHAR(50) NULL");
  await garantirColunaUser("password", "VARCHAR(255) NOT NULL DEFAULT ''");
  await preencherFullnameUser();
}

const garantirColunaUser = async (coluna, definicao) => {
  const [rows] = await pool.query(`SHOW COLUMNS FROM user LIKE ?`, [coluna]);
  if (rows.length > 0) return;

  await pool.query(`ALTER TABLE user ADD COLUMN ${coluna} ${definicao}`);
}

const preencherFullnameUser = async () => {
  const [nomeRows] = await pool.query(`SHOW COLUMNS FROM user LIKE 'nome'`);
  if (nomeRows.length === 0) return;

  await pool.query(`
    UPDATE user
    SET fullname = nome
    WHERE (fullname IS NULL OR fullname = '') AND nome IS NOT NULL
  `);
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
  await criarTabelaTccEstudante();
  await criarTabelaTccHistorico();
  await criarTabelaBanca();
  await criarTabelaDefesa();
  await criarTabelaSubdireccao();
  console.log("Todas as tabelas foram criadas ou já existiam.");
}
