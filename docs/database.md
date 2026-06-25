# Banco de Dados

O sistema cria as tabelas automaticamente no arranque da aplicacao, a partir de `src/config/database/index.js`.

## Tabelas principais

- `role`: perfis de acesso do sistema, como aluno, orientador e coordenador.
- `user`: dados base dos utilizadores.
- `curso`: cursos disponiveis.
- `estudante`: dados academicos ligados a um utilizador.
- `professor`: dados dos orientadores e docentes.
- `tcc`: trabalhos de conclusao de curso, com estudante e orientador.
- `banca`: bancas de defesa, com data e sala.
- `defesa`: dados da defesa de um TCC.
- `subdireccao`: dados da area responsavel pelo acompanhamento administrativo.

## Observacao

Atualmente as relacoes sao guardadas por campos `id_*`, mas ainda nao existem chaves estrangeiras definidas no SQL.
