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
);

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
);

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
);

CREATE TABLE IF NOT EXISTS tcc_comentario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_submissao INT NOT NULL,
  id_autor INT NOT NULL,
  comentario TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_comentario_submissao (id_submissao)
);

CREATE TABLE IF NOT EXISTS tcc_notificacao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NOT NULL,
  titulo VARCHAR(160) NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notificacao_user (id_user),
  INDEX idx_notificacao_lida (lida)
);

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
);

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
);
