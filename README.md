# Gestor de TCC

Sistema web para gestão de trabalhos de conclusão de curso, orientações, bancas e defesas.

## Requisitos

- Node.js 20 ou superior
- MySQL 8 ou superior

## Instalação

1. Copie `.env.example` para `.env` e preencha credenciais e segredos fortes.
2. Crie a base de dados indicada em `DB_NAME`.
3. Instale dependências: `npm install`.
4. Inicie: `npm start` ou `npm run dev`. As migrations pendentes são aplicadas antes do servidor iniciar.

## Qualidade

Execute `npm test` antes de publicar alterações. O `.env` e documentos enviados não devem ser versionados.
