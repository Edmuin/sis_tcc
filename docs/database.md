# Banco de Dados

O schema é mantido apenas por migrations versionadas. O servidor aplica migrations pendentes antes de aceitar pedidos; também pode executar `npm run migrate` manualmente.

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

As relações principais possuem chaves estrangeiras. Registos dependentes não podem ser apagados enquanto houver referências, evitando dados órfãos.

## Configuracao local

Copie `.env.example` para `.env`, ajuste as credenciais do MySQL e crie a base de dados indicada em `DB_NAME`. Nunca envie o `.env` para o repositório. Execute `npm start`.
