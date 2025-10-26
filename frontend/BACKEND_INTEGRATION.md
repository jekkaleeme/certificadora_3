# Guia de Integração com Backend

Este documento descreve a estrutura preparada para integração com o backend.

## Estrutura de API

O arquivo `src/services/api.ts` contém toda a estrutura de APIs preparada para integração com o backend.

### Interfaces TypeScript

Todas as interfaces estão definidas e prontas para uso:

- **Event**: Representa eventos (oficinas, palestras, reuniões)
- **User**: Representa usuários e administradores
- **Enrollment**: Representa inscrições em eventos
- **Rating**: Representa avaliações de eventos

### APIs Disponíveis

#### 1. Event API (`eventAPI`)
```typescript
// Buscar todos os eventos
eventAPI.getAll(): Promise<Event[]>

// Buscar evento por ID
eventAPI.getById(id: string): Promise<Event>

// Criar novo evento (apenas admin)
eventAPI.create(event: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<Event>

// Atualizar evento (apenas admin)
eventAPI.update(id: string, event: Partial<Event>): Promise<Event>

// Deletar evento (apenas admin)
eventAPI.delete(id: string): Promise<void>
```

#### 2. User API (`userAPI`)
```typescript
// Obter usuário atual
userAPI.getCurrent(): Promise<User>

// Registrar novo usuário
userAPI.register(user: Omit<User, "id" | "createdAt">): Promise<User>

// Login
userAPI.login(email: string, password: string): Promise<{ user: User; token: string }>

// Logout
userAPI.logout(): Promise<void>
```

#### 3. Enrollment API (`enrollmentAPI`)
```typescript
// Buscar inscrições do usuário
enrollmentAPI.getByUser(userId: string): Promise<Enrollment[]>

// Buscar inscrições de um evento (apenas admin)
enrollmentAPI.getByEvent(eventId: string): Promise<Enrollment[]>

// Inscrever em evento
enrollmentAPI.create(userId: string, eventId: string): Promise<Enrollment>

// Cancelar inscrição
enrollmentAPI.cancel(enrollmentId: string): Promise<void>
```

#### 4. Rating API (`ratingAPI`)
```typescript
// Buscar avaliações de um evento
ratingAPI.getByEvent(eventId: string): Promise<Rating[]>

// Criar avaliação
ratingAPI.create(rating: Omit<Rating, "id" | "createdAt">): Promise<Rating>
```

## Como Integrar o Backend

### Opção 1: Lovable Cloud (Recomendado)

1. Clique no botão "Connect Lovable Cloud" no chat
2. Aguarde a configuração automática do backend
3. Substitua as funções em `src/services/api.ts` com chamadas reais ao Supabase
4. Configure as políticas RLS (Row Level Security) no Supabase

### Opção 2: Backend Customizado

1. Configure seu servidor backend (Node.js, Python, etc.)
2. Crie os endpoints correspondentes às APIs definidas
3. Substitua os `throw new Error("Backend not implemented yet")` em `src/services/api.ts`
4. Configure CORS no seu backend
5. Adicione autenticação JWT ou similar

## Exemplo de Implementação com Fetch

```typescript
// Exemplo: Implementar eventAPI.getAll()
getAll: async (): Promise<Event[]> => {
  const response = await fetch('/api/events', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Erro ao buscar eventos');
  }
  
  return response.json();
}
```

## Banco de Dados Sugerido

### Tabela: events
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('oficina', 'palestra', 'reuniao')),
  date DATE NOT NULL,
  time TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  max_vacancies INTEGER NOT NULL,
  available_vacancies INTEGER NOT NULL,
  requirements TEXT,
  target_audience VARCHAR(255),
  duration VARCHAR(50),
  instructor VARCHAR(255),
  is_private BOOLEAN DEFAULT FALSE, -- RF14, RF20: Controle de privacidade
  materials TEXT, -- RF34: Links para materiais complementares
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RF32: Índice para validação de conflitos de horário
CREATE INDEX idx_events_schedule ON events(date, time, location);
CREATE INDEX idx_events_instructor ON events(date, time, instructor);
```

### Tabela: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  age INTEGER CHECK (age >= 12 AND age <= 59), -- Público-alvo: 12-59 anos
  phone VARCHAR(20),
  school VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: user_roles (RF04, RF05: Sistema de Roles)
```sql
-- CRITICAL: Roles MUST be in a separate table for security
CREATE TYPE app_role AS ENUM ('admin', 'user');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy: Only admins can manage user roles
CREATE POLICY "Admins can manage roles"
ON user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));
```

### Tabela: enrollments
```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  UNIQUE(user_id, event_id)
);
```

### Tabela: ratings
```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);
```

## Autenticação

O sistema está preparado para autenticação baseada em token JWT:

1. Login retorna um token
2. Token é armazenado (localStorage ou cookie)
3. Token é enviado em todas as requisições via header Authorization
4. Backend valida o token em cada requisição

## Próximos Passos

### Requisitos Funcionais Implementados no Front-End:

✅ **RF01-RF03**: Autenticação (login, validação, logout) - `/auth`
✅ **RF04-RF05**: Sistema de roles preparado (admin/user) - usar tabela `user_roles`
✅ **RF06-RF09**: CRUD de eventos (criar, editar, deletar) - `/admin`
✅ **RF10-RF11**: Listagem e detalhes de eventos - `/events`, `/events/:id`
✅ **RF12-RF13**: Gerenciamento de vagas
✅ **RF14**: Eventos públicos/privados (campo `isPrivate`)
✅ **RF15-RF18**: Sistema de inscrições
✅ **RF19**: Exportação de listas de inscritos (CSV)
✅ **RF20-RF21**: Controle de reuniões internas (campo `isPrivate`)
✅ **RF22-RF24**: Gerenciamento de usuários - `/admin/users`
✅ **RF25**: Redefinição de senha - `/auth` (modal)
✅ **RF26-RF27**: Estatísticas e relatórios - `/admin/statistics`
✅ **RF28**: Exportação de dados (CSV/TXT)
✅ **RF29-RF30**: Busca e calendário de eventos
✅ **RF31**: Mensagens de ausência de eventos
✅ **RF32**: Validação de conflitos de horário
✅ **RF33**: Histórico de eventos (eventos passados/futuros)
✅ **RF34**: Materiais complementares (campo `materials`)

### Checklist de Integração Backend:

1. [ ] Escolher entre Lovable Cloud ou backend customizado
2. [ ] Criar tabelas no banco de dados (veja schemas acima)
3. [ ] Implementar sistema de roles usando `user_roles` table
4. [ ] Implementar as funções em `src/services/api.ts`
5. [ ] Configurar variáveis de ambiente (API_URL, etc.)
6. [ ] Implementar validação de conflitos de horário (RF32)
7. [ ] Implementar controle de acesso para eventos privados (RF14, RF20)
8. [ ] Configurar autenticação e JWT tokens
9. [ ] Testar cada endpoint individualmente
10. [ ] Implementar tratamento de erros
11. [ ] Adicionar loading states nos componentes
12. [ ] Configurar política de CORS
13. [ ] Implementar validação de dados server-side
14. [ ] Adicionar testes de integração
15. [ ] Implementar envio de emails (redefinição de senha, confirmações)

### Páginas Criadas:

- `/` - Landing page
- `/auth` - Login/Cadastro/Redefinição de senha
- `/events` - Listagem de eventos com busca e filtros
- `/events/:id` - Detalhes do evento e inscrição
- `/dashboard` - Painel do usuário (eventos inscritos, calendário, avaliações)
- `/admin` - Painel administrativo (criar/gerenciar eventos)
- `/admin/users` - Gerenciamento de usuários (RF22-RF24)
- `/admin/statistics` - Estatísticas e relatórios (RF26-RF27)
- `/about` - Sobre o projeto Meninas Digitais

### Funcionalidades Prontas para Backend:

1. **Autenticação**: Login, cadastro, logout, redefinição de senha
2. **Eventos**: CRUD completo, validação de conflitos, controle de privacidade
3. **Inscrições**: Criar, cancelar, visualizar (admin e usuário)
4. **Avaliações**: Sistema de notas (1-5) com comentários
5. **Usuários**: CRUD completo (apenas admin)
6. **Exportação**: CSV para listas de usuários e inscritos
7. **Estatísticas**: Dashboard com métricas de eventos
8. **Materiais**: Campo para links de materiais complementares

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=your_supabase_url (se usar Lovable Cloud)
VITE_SUPABASE_ANON_KEY=your_anon_key (se usar Lovable Cloud)
```

## Recursos Úteis

- [Documentação Lovable Cloud](https://docs.lovable.dev/features/cloud)
- [Supabase Documentation](https://supabase.io/docs)
- [React Query para gerenciar estado de API](https://tanstack.com/query/latest)
