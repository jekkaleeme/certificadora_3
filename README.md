# 📅 Sistema de Gerenciamento de Eventos - Meninas Digitais

> Uma plataforma completa para gestão acadêmica e corporativa de eventos, desenvolvida com tecnologias modernas para garantir eficiência e escalabilidade.

---

## 👥 Equipe de Desenvolvimento

| Desenvolvedor | Função | 
| ----- | ----- | 
| **Matheus** |  Frontend & UX/UI | 
| **Rafael** | Backend Specialist | 
| **Jessica** | Frontend & UX/UI | 
| **Leonardo** | Database| 

---

## 🎯 Objetivo do Sistema

Este sistema foi projetado para **centralizar e simplificar a gestão de eventos acadêmicos e corporativos** (como oficinas, palestras e reuniões). Ele cobre todo o ciclo de vida de um evento, oferecendo ferramentas para:

* **Organizadores:** Criar eventos, gerenciar inscrições e analisar dados.
* **Participantes:** Inscrever-se facilmente, acompanhar sua agenda e emitir feedback.
* **Administradores:** Ter controle total sobre usuários e conteúdo da plataforma.

---

## ✨ Funcionalidades Principais

### 🔓 Área Pública & Participante
* **Catálogo Interativo:** Navegue por eventos com filtros dinâmicos (Tipo, Data, Vagas).
* **Autenticação JWT:** Login seguro e cadastro rápido para novos usuários.
* **Meu Painel:** Área exclusiva para o participante gerenciar suas inscrições e ver histórico.
* **Sistema de Avaliação:** Feedback pós-evento com notas (estrelas) e comentários.

### 🛡️ Área Administrativa (Admin)
* **CRUD de Eventos:** Criação completa com definição de vagas, local, horários e materiais.
* **Gestão de Usuários:** Controle de acesso, edição de perfis e elevação de privilégios.
* **Monitoramento de Inscrições:** Visualização em tempo real de quem vai participar.
* **Dashboard Estatístico:** Gráficos intuitivos sobre adesão, tipos de eventos mais procurados e satisfação.
* **Relatórios Exportáveis:** Geração de dados em CSV/TXT para análise externa.

---

## 🛠️ Tecnologias & Ferramentas

### Stack Principal
* **Frontend:** [React](https://react.dev/) (Vite), [Tailwind CSS](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/), Axios.
* **Backend:** [Python 3.12+](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/), SQLAlchemy (Async), Pydantic.
* **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/).

### Ferramentas de Desenvolvimento
* **Editor:** [VS Code](https://code.visualstudio.com/)
* **Versionamento:** [Git](https://git-scm.com/)
* **Gerenciador de Banco:** [pgAdmin 4](https://www.pgadmin.org/)

---

## 🧪 Roteiro de Testes (Passo a Passo)

Para validar todas as funcionalidades do sistema, sugerimos o seguinte fluxo:

1. **Cadastro Inicial:**
   * Acesse a tela de login e clique em "Cadastrar". Crie um usuário comum.

2. **Exploração:**
   * Navegue pela *Home* e veja os eventos disponíveis. Entre nos detalhes de um evento.

3. **Inscrição:**
   * Inscreva-se em um evento e vá para o menu *"Meu Painel"* para confirmar sua presença.

4. **Acesso Administrativo:**
   * *Nota:* O usuário criado inicialmente não tem permissão de Admin. Siga o guia abaixo ("Contas de Acesso") para liberar esse acesso.

5. **Gestão Completa (Como Admin):**
   * Crie um novo evento na aba *"Criar Evento"*.
   * Verifique os gráficos na aba *"Estatísticas"*.
   * Gerencie outros usuários na aba *"Usuários"*.

---

## 🔑 Contas de Acesso & Configuração Inicial

Como o banco de dados é iniciado vazio, **não existem contas padrão**. Você deve criar o primeiro Administrador manualmente:

1. **Cadastre-se** no sistema normalmente (ex: `admin@teste.com`).

2. Acesse seu banco de dados **PostgreSQL** (via pgAdmin ou terminal).

3. Execute a query para promover seu usuário:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@teste.com';

## ⚙️ Compilação e Execução
O projeto é dividido em dois módulos principais. Para rodar o sistema completo, você precisará de dois terminais abertos.

1. Backend (API Python)
Toda a lógica de negócios e conexão com o banco. 📄 Guia Detalhado: Como configurar e rodar o Backend <a href="https://github.com/jekkaleeme/certificadora_3"/backend/HOWTO>

2. Frontend (Interface React)
A interface visual onde os usuários interagem. 📄 Guia Detalhado: Como instalar e rodar o Frontend

🗄️ Configuração Rápida do Banco de Dados
Instale o PostgreSQL e garanta que o serviço está ativo.

Crie um banco de dados chamado certificadora.

No arquivo .env do backend, configure sua string de conexão: DATABASE_URL=postgresql+asyncpg://seu_usuario:sua_senha@localhost:5432/certificadora

Ao iniciar o backend, as tabelas serão criadas automaticamente.
