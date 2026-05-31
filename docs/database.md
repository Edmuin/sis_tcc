# Banco de Dados

O sistema cria as tabelas automaticamente no arranque da aplicacao, a partir de `src/config/database/index.js`.

## Tabelas principais

- `role`: perfis de acesso do sistema, como aluno, orientador e coordenador.
- `user`: dados base dos utilizadores.
- `curso`: cursos disponiveis.
- `estudante`: dados academicos ligados a um utilizador.
- `professor`: dados dos orientadores e docentes.
- `tcc`: trabalhos de conclusao de curso, com estudante e orientador.
- `documento`: ficheiros e documentos associados a um TCC.
- `banca`: bancas de defesa, com data e sala.
- `professor_banca`: associacao entre professores e bancas.
- `avaliacao`: observacoes e pareceres sobre TCCs.
- `defesa`: dados da defesa de um TCC.
- `aprovacao_tcc`: aprovacao de temas ou trabalhos.
- `aprovacao_banca`: aprovacao de bancas.
- `aprovacao_defesa`: aprovacao de defesas.
- `subdireccao`: dados da area responsavel por aprovacoes.

## Observacao

Atualmente as relacoes sao guardadas por campos `id_*`, mas ainda nao existem chaves estrangeiras definidas no SQL.
