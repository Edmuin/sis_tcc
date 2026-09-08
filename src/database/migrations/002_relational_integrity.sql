ALTER TABLE curso ADD CONSTRAINT fk_curso_area_formacao FOREIGN KEY (area_formacao_id) REFERENCES area_formacao(id);
ALTER TABLE estudante ADD CONSTRAINT fk_estudante_user FOREIGN KEY (id_user) REFERENCES user(id);
ALTER TABLE estudante ADD CONSTRAINT fk_estudante_curso FOREIGN KEY (id_curso) REFERENCES curso(id);
ALTER TABLE professor ADD CONSTRAINT fk_professor_user FOREIGN KEY (id_user) REFERENCES user(id);
ALTER TABLE tcc ADD CONSTRAINT fk_tcc_estudante FOREIGN KEY (id_estudante) REFERENCES estudante(id);
ALTER TABLE tcc ADD CONSTRAINT fk_tcc_professor FOREIGN KEY (id_professor) REFERENCES professor(id);
ALTER TABLE defesa ADD CONSTRAINT fk_defesa_tcc FOREIGN KEY (id_tcc) REFERENCES tcc(id);
ALTER TABLE defesa ADD CONSTRAINT fk_defesa_banca FOREIGN KEY (id_banca) REFERENCES banca(id);
