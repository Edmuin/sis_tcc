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
      password_expires_at DATETIME NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
  await garantirColunaUser("password_expires_at", "DATETIME NULL");
}

const garantirColunaUser = async (coluna, definicao) => {
  const [rows] = await pool.query(`SHOW COLUMNS FROM user LIKE ?`, [coluna]);
  if (rows.length > 0) return;

  await pool.query(`ALTER TABLE user ADD COLUMN ${coluna} ${definicao}`);
};

export const criarTabelaSessao = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_session (
      id VARCHAR(255) PRIMARY KEY,
      data MEDIUMTEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      INDEX idx_app_session_expires_at (expires_at)
    )
  `);
};

export const dadosDeRoles = async () => {
  const query = `
    INSERT IGNORE INTO role (nome, descricao) VALUES
      ('tutor', NULL),
      ('aluno', NULL),
      ('coordenador', NULL),
      ('juri', NULL),
      ('administrador', NULL)
  `;
  await pool.query(query);
}

  const sincronizarPerfisDeUtilizadores = async () => {
    const [users] = await pool.query(`
      SELECT u.id, u.n_processo, u.curso, r.nome AS role_nome
      FROM user u
      JOIN role r ON r.id = u.role_id
      WHERE r.nome IN ('aluno', 'tutor')
    `);
    const [courses] = await pool.query("SELECT id FROM curso ORDER BY id LIMIT 1");

    for (const user of users) {
      if (user.role_nome === "aluno") {
        const [existing] = await pool.query("SELECT id FROM estudante WHERE id_user = ? LIMIT 1", [user.id]);
        if (existing.length > 0 || courses.length === 0) continue;
        const requestedCourse = Number(user.curso);
        const courseId = Number.isInteger(requestedCourse) && requestedCourse > 0 ? requestedCourse : courses[0].id;
        const [courseExists] = await pool.query("SELECT id FROM curso WHERE id = ? LIMIT 1", [courseId]);
        await pool.query(
          `INSERT INTO estudante (id_user, numero_estudante, numero_processo, id_curso) VALUES (?, ?, ?, ?)`,
          [user.id, user.id, user.n_processo || null, courseExists.length > 0 ? courseId : courses[0].id]
        );
      }

      if (user.role_nome === "tutor") {
        const [existing] = await pool.query("SELECT id FROM professor WHERE id_user = ? LIMIT 1", [user.id]);
        if (existing.length === 0) {
          await pool.query("INSERT INTO professor (id_user) VALUES (?)", [user.id]);
        }
      }
    }
  };

const garantirIndices = async () => {
  const indices = [
    ["user", "idx_user_role_id", "role_id"],
    ["estudante", "idx_estudante_id_user", "id_user"],
    ["estudante", "idx_estudante_id_curso", "id_curso"],
    ["professor", "idx_professor_id_user", "id_user"],
    ["tcc", "idx_tcc_id_estudante", "id_estudante"],
    ["tcc", "idx_tcc_id_professor", "id_professor"],
    ["defesa", "idx_defesa_id_tcc", "id_tcc"],
    ["defesa", "idx_defesa_id_banca", "id_banca"],
  ];

  for (const [table, index, column] of indices) {
    const [existing] = await pool.query(
      `SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ? LIMIT 1`,
      [table, index]
    );
    if (existing.length === 0) await pool.query(`ALTER TABLE ${table} ADD INDEX ${index} (${column})`);
  }
};

const criarTabelasWorkflow = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tcc_proposta (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_tcc INT NOT NULL,
      titulo VARCHAR(255) NOT NULL,
      area_investigacao VARCHAR(255),
      descricao TEXT,
      estado VARCHAR(40) NOT NULL DEFAULT 'pendente',
      parecer TEXT,
      id_autor INT NOT NULL,
      id_revisor INT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_proposta_tcc (id_tcc),
      INDEX idx_proposta_estado (estado)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tcc_etapa (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_tcc INT NOT NULL,
      nome VARCHAR(120) NOT NULL,
      prazo DATE,
      estado VARCHAR(40) NOT NULL DEFAULT 'pendente',
      ordem INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_etapa_tcc (id_tcc),
      INDEX idx_etapa_prazo (prazo)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tcc_submissao (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_tcc INT NOT NULL,
      id_etapa INT,
      titulo VARCHAR(255) NOT NULL,
      documento VARCHAR(255),
      estado VARCHAR(40) NOT NULL DEFAULT 'aguardando_revisao',
      comentario TEXT,
      id_autor INT NOT NULL,
      id_revisor INT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_submissao_tcc (id_tcc),
      INDEX idx_submissao_estado (estado)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tcc_comentario (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_submissao INT NOT NULL,
      id_autor INT NOT NULL,
      comentario TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_comentario_submissao (id_submissao)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tcc_notificacao (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_user INT NOT NULL,
      titulo VARCHAR(160) NOT NULL,
      mensagem TEXT NOT NULL,
      lida BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_notificacao_user (id_user),
      INDEX idx_notificacao_lida (lida)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tcc_avaliacao_juri (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_tcc INT NOT NULL,
      id_juri INT NOT NULL,
      nota_trabalho DECIMAL(5,2),
      nota_apresentacao DECIMAL(5,2),
      nota_defesa DECIMAL(5,2),
      nota_final DECIMAL(5,2),
      resultado VARCHAR(40) NOT NULL DEFAULT 'pendente',
      observacoes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_avaliacao_tcc (id_tcc),
      INDEX idx_avaliacao_juri (id_juri)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tcc_orientacao (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_tcc INT NOT NULL,
      data_sessao DATETIME NOT NULL,
      assunto VARCHAR(255) NOT NULL,
      estado VARCHAR(40) NOT NULL DEFAULT 'solicitada',
      presenca BOOLEAN,
      observacoes TEXT,
      id_autor INT NOT NULL,
      id_revisor INT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_orientacao_tcc (id_tcc),
      INDEX idx_orientacao_data (data_sessao)
    )
  `);
};

export const criarTodasTabelas = async () => {
  await criarTabelaRole();
  await dadosDeRoles();
  await criarTabelaUser();
  await criarTabelaSessao();
  await criarTabelaAreaFormacao();
  await criarTabelaCurso();
  await criarTabelaEstudante();
  await criarTabelaProfessor();
  await criarTabelaTcc();
  await criarTabelaBanca();
  await criarTabelaDefesa();
  await criarTabelaSubdireccao();
  await sincronizarPerfisDeUtilizadores();
  await garantirIndices();
  await criarTabelasWorkflow();
  console.log("Todas as tabelas foram criadas ou já existiam.");
}
