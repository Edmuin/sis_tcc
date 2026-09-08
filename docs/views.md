# Organizacao das Telas

As telas ficam em `src/views` e usam os assets publicos de `src/public`.

## Telas principais

- `index_new.html` e `Painel-principal.html`: painel inicial do sistema.
- `TCC/`: listagem, criação, detalhe e edição de trabalhos de conclusão de curso.
- `Agendar.html`: entrada legada; o fluxo atual de agendamento usa `Defesas`.
- `Curso.html` e `Area-de-Formacao.html`: configurações académicas.
- `Tela-operacional.html`: módulos administrativos reutilizáveis.
- `Meus-dados.html`: dados do utilizador, preenchidos via `/auth/me`.
- `auth/sign_in.html`, `auth/sign_up_aluno.html`, `auth/sign_up_professor.html` e `auth/sign_up_coordenador.html`: acesso e cadastro.

## Tela operacional reutilizavel

`Tela-operacional.html` serve como base para modulos como estudantes, professores, bancas e defesas.

O conteudo desta tela e definido por `src/public/js/operational-page.js`, de acordo com a rota acessada.

## Proximo passo recomendado

Quando o projeto crescer, o menu, o cabecalho e o rodape podem virar componentes ou partials para evitar repeticao entre paginas.
