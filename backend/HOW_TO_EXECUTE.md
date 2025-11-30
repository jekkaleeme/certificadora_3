# Backend - API de Gerenciamento de Eventos

Este diretório contém o código-fonte da API backend para o projeto da Certificadora 3, desenvolvido em Python com FastAPI e PostgreSQL.

## 1. Tecnologias Utilizadas

* **Linguagem:** [Python 3.12](https://www.python.org/downloads/)
* **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
* **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/download/) (v16+)
* **Servidor:** Uvicorn
* **ORM:** SQLAlchemy (Assíncrono)
* **Validação:** Pydantic
* **Autenticação:** JWT (Tokens) e Passlib (Hashing Bcrypt)

## 2. Roteiro de Instalação e Execução

Siga estes passos para configurar e executar o ambiente de desenvolvimento local.

### Passo 1: Instalação das Ferramentas Principais

Antes de configurar o projeto, garanta que você tenha as seguintes ferramentas instaladas:

1.  **Python 3.12:** Faça o download e instale o Python 3.12.
    * **Link:** [https://www.python.org/downloads/](https://www.python.org/downloads/)
    * **Importante (Windows):** Marque a opção "Add python.exe to PATH" durante a instalação.
2.  **PostgreSQL:** Faça o download e instale o servidor de banco de dados.
    * **Link:** [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
3.  **pgAdmin (Recomendado):** Uma ferramenta gráfica para gerenciar seu banco de dados.
    * **Link:** [https://www.pgadmin.org/download/](https://www.pgadmin.org/download/)

### Passo 2: Configuração do Banco de Dados

1.  **Abra o pgAdmin** e use a "Query Tool" para executar os seguintes comandos SQL. Eles criarão um banco de dados dedicado e um usuário seguro para a API:

    ```sql
    -- 1. Cria o banco de dados
    CREATE DATABASE eventos_db;
    
    -- 2. Cria um usuário (login) para a API (use uma senha forte)
    CREATE USER eventos_app_user WITH PASSWORD 'sua-senha-forte-aqui';
    
    -- 3. Dá permissão para o usuário conectar ao banco
    GRANT ALL PRIVILEGES ON DATABASE eventos_db TO eventos_app_user;
    ```
2.  **Importante:** Conecte-se ao banco `eventos_db` (clique com o botão direito nele > "Query Tool") e execute o próximo comando para dar permissão ao usuário para criar tabelas:
    ```sql
    -- 4. Dá ao usuário a "propriedade" do esquema padrão 'public'
    ALTER SCHEMA public OWNER TO eventos_app_user;
    ```
3.  O banco está pronto. As tabelas (`users`, `events`, etc.) serão criadas automaticamente pela API no primeiro boot.

### Passo 3: Configuração do Ambiente Local (Python)

1.  **Abra um terminal** dentro desta pasta (`/backend`).
2.  **Crie um ambiente virtual** (venv) usando a versão 3.12 do Python:
    ```bash
    py -3.12 -m venv venv
    ```
3.  **Ative o ambiente virtual:**
    ```bash
    # Windows (PowerShell/CMD)
    .\venv\Scripts\activate
    
    # macOS/Linux
    source venv/bin/activate
    ```
4.  **Instale as dependências:**
    (Certifique-se de que o arquivo `requirements.txt` está nesta pasta).
    ```bash
    pip install -r requirements.txt
    ```

### Passo 4: Configuração das Variáveis de Ambiente (.env)

1.  **Crie um arquivo** chamado `.env` *dentro* desta pasta (`/backend`).
2.  Este arquivo **NÃO DEVE** ser enviado para o GitHub (ele já está no `.gitignore`).
3.  Copie o conteúdo abaixo e cole no seu arquivo `.env`, **substituindo** os valores de `DATABASE_URL` (com a senha que você criou) e `SECRET_KEY` (com uma chave aleatória).

    **Template do `.env`:**
    ```ini
    # URL de conexão com o banco de dados (use a senha do Passo 2)
    DATABASE_URL="postgresql+asyncpg://eventos_app_user:sua-senha-forte-aqui@localhost:5432/eventos_db"
    
    # Chave secreta para assinar os tokens JWT (gere uma chave aleatória)
    SECRET_KEY="secret-aleatorio"
    
    # Configurações do Token
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    ALGORITHM="HS256"
    ```

### Passo 5: Executar o Servidor

1.  Com o `venv` ativo e o `.env` criado, execute o servidor Uvicorn:
    ```bash
    # (Estando na pasta /backend)
    uvicorn app.main:app --reload
    ```
2.  O servidor estará rodando e acessível em `http://127.0.0.1:8000`.

### Passo 6: Criar o Primeiro Administrador (Bootstrapping)

Por padrão, qualquer usuário que se cadastrar pelo Frontend será criado com o perfil `participant` (sem poderes administrativos).

Para acessar o painel administrativo e gerenciar o sistema, você precisa criar o **primeiro** usuário Administrador manualmente.

**Opção A: Via Swagger (Recomendado)**
O endpoint de cadastro da API (`POST /users`) permite definir o campo `role`, diferente do formulário do site.

1.  Acesse a documentação interativa: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
2.  Vá até o endpoint **`POST /users`**.
3.  Clique em **Try it out** e use o seguinte JSON:
    ```json
    {
      "name": "Super Admin",
      "email": "admin@sistema.com",
      "password": "senhaforte123",
      "role": "admin", 
      "phone": "11999999999"
    }
    ```
4.  Clique em **Execute**.
5.  Agora você pode fazer login com este email e senha no Frontend e terá acesso total.

**Opção B: Via Banco de Dados (pgAdmin)**
Se você já criou um usuário pelo site (ex: "Fulano") e ele ficou como participante, você pode promovê-lo diretamente no banco de dados.

1.  Abra o **pgAdmin 4** e conecte-se ao banco `eventos_db`.
2.  Clique com o botão direito no banco e selecione **Query Tool**.
3.  Execute o seguinte comando SQL (substituindo pelo email do usuário):
    ```sql
    UPDATE users SET role = 'admin' WHERE email = 'seu_email_aqui@exemplo.com';
    ```

## 3. Como Testar a API

A forma mais fácil de testar todos os endpoints é usando a documentação interativa (Swagger UI) gerada automaticamente.

1.  Acesse: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**
2.  **Crie um Usuário (Admin):**
    * Siga o passo 6 acima para criar seu usuário admin.
3.  **Faça Login (Obtenha um Token):**
    * Clique no botão verde **"Authorize"** no topo da página.
    * Preencha os campos `username` ("admin@sistema.com") e `password` ("senhaforte123").
    * Clique em "Authorize" e "Close". O cadeado estará fechado.
4.  **Teste um Endpoint Protegido (Ex: Criar Evento):**
    * Agora que está logado, vá em `POST /events`.
    * Clique "Try it out" e use o JSON abaixo para criar um evento de teste:
        ```json
        {
          "title": "Oficina de FastAPI",
          "description": "Aprendendo a construir APIs rápidas e modernas.",
          "event_type": "oficina",
          "start_time": "2025-11-20T14:00:00Z",
          "end_time": "2025-11-20T18:00:00Z",
          "location": "Sala C-101",
          "host": "Prof. Admin",
          "max_vacancies": 50,
          "is_public": true,
          "materials": [
            {
              "title": "Slides da Oficina",
              "url_or_filename": "[http://link.para.os.slides/slides.pdf](http://link.para.os.slides/slides.pdf)"
            }
          ]
        }
        ```
    * Execute. Você deve receber um `Code 201`.