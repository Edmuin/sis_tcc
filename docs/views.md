# Organizacao das Telas

As telas ficam em `src/views` e usam os assets publicos de `src/public`.

## Telas principais

- `index_new.html` e `Painel-principal.html`: painel inicial do sistema.
- `TCC.html`: area geral de trabalhos de conclusao de curso.
- `Agendar.html`: agendamento e acompanhamento de defesas.
- `Curso.html` e `Area-de-Formacao.html`: configuracoes academicas.
- `Config-utilizadores.html`: configuracao de utilizadores.
- `Meus-dados.html`: dados do utilizador.
- `auth/login.html` e `auth/register.html`: acesso e cadastro.

## Tela operacional reutilizavel

`Tela-operacional.html` serve como base para modulos como estudantes, professores, bancas, documentos, avaliacoes, aprovacoes e relatorios.

O conteudo desta tela e definido por `src/public/js/operational-page.js`, de acordo com a rota acessada.

## Proximo passo recomendado

Quando o projeto crescer, o menu, o cabecalho e o rodape podem virar componentes ou partials para evitar repeticao entre paginas.
