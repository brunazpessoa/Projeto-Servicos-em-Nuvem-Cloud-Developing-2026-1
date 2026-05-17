# Projeto Integrador – Cloud Developing 2026/1

> CRUD simples + API Gateway + Lambda /report + RDS + Front

**Grupo**:
1. 10417079 - Bruna Zakaib Pessoa- Backend/API: desenvolver a API REST em Spring Boot com operações CRUD, regras de negócio e integração com o banco PostgreSQL.
1. RA - nome - Banco de Dados/RDS: criar a modelagem SQL, configurar o PostgreSQL no Amazon RDS e garantir a conexão com o backend.
1. RA - nome - Front-end: adaptar o HTML/CSS/JS do projeto para consumir as rotas da API Gateway e implementar as telas do CRUD.
1. RA - nome - AWS/Docker: containerizar frontend e backend com Docker e realizar o deploy no ECS Fargate, configurando também o API Gateway.
1. RA - nome - Lambda/Documentação: desenvolver a lambda, produzir README, PDF técnico, vídeo demonstrativo e organizar as evidências do projeto.

## 1. Visão geral
<!-- Descreva rapidamente o domínio escolhido, por que foi selecionado e o que o CRUD faz. -->

## 2. Arquitetura

![Diagrama](docs/arquitetura.png)

| Camada | Serviço | Descrição |
|--------|---------|-----------|
| Back-end | ECS Fargate (ou EC2 + Docker) | API REST Node/Spring/… |
| Front-end | ECS Fargate (ou EC2 + Docker) | Node/Spring/… |
| Banco   | Amazon RDS              | PostgreSQL / MySQL em subnet privada |
| Gateway | Amazon API Gateway      | Rotas CRUD → ECS · `/report` → Lambda |
| Função  | AWS Lambda              | Consome a API, gera estatísticas JSON |


## 3. Como rodar localmente

```bash
cp .env.example .env         # configure variáveis
docker compose up --build
# API em http://localhost:3000
