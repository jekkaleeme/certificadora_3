import axios from 'axios';

// --- 1. CONFIGURAÇÃO DO AXIOS ---
export const api = axios.create({
  baseURL: 'http://localhost:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- 2. INTERFACES ---

export interface Event {
  id: string; 
  title: string;
  type: "oficina" | "palestra" | "reuniao";
  date: string;
  time: string;
  location: string;
  description: string;
  maxVacancies: number;
  availableVacancies: number;
  requirements?: string;
  targetAudience?: string;
  duration?: string;
  instructor?: string;
  isPrivate: boolean;
  materials?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  age?: number;
  phone?: string;
  school?: string;
  createdAt?: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  eventId: string;
  enrolledAt: string;
  status: "pending" | "confirmed" | "cancelled";
}

export interface Rating {
  id: string;
  userId: string;
  eventId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// --- 3. IMPLEMENTAÇÃO REAL ---

export const eventAPI = {
  getAll: async (): Promise<Event[]> => {
    // Rota backend: GET /events
    const response = await api.get('/events'); 
    return response.data;
  },

  getById: async (id: string): Promise<Event> => {
    // Rota backend: GET /events/{event_id}
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  create: async (event: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<Event> => {
    // Rota backend: POST /events
    const response = await api.post('/events', event);
    return response.data;
  },

  update: async (id: string, event: Partial<Event>): Promise<Event> => {
    // Rota backend: PUT /events/{event_id}
    const response = await api.put(`/events/${id}`, event);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    // Rota backend: DELETE /events/{event_id}
    await api.delete(`/events/${id}`);
  }
};

export const userAPI = {
  getCurrent: async (): Promise<User> => {
    // Rota backend: GET /users/me
    const response = await api.get('/users/me');
    return response.data;
  },

  // Adicionado para suportar o UserManagement.tsx
  getAll: async (): Promise<User[]> => {
    // Rota backend: GET /users/all
    const response = await api.get('/users/all');
    return response.data;
  },

  register: async (user: Omit<User, "id" | "createdAt">): Promise<User> => {
    // Rota backend: POST /users
    const response = await api.post('/users', user);
    return response.data;
  },

  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    // Rota backend: POST /token
    // O FastAPI OAuth2PasswordRequestForm exige Form Data (username, password)
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/token', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // O backend retorna { access_token: string, token_type: string }
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    // Como o endpoint /token só retorna o token, buscamos o usuário manualmente logo depois
    // para manter a compatibilidade com o que o front espera
    const userResponse = await api.get('/users/me', {
      headers: { Authorization: `Bearer ${response.data.access_token}` }
    });

    return { token: response.data.access_token, user: userResponse.data };
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
  }
};

export const enrollmentAPI = {
  // ⚠️ ROTA FALTANDO NO BACKEND: Listar inscrições de um usuário
  // Seu backend não tem GET /users/{id}/inscriptions ou GET /inscriptions/user/{id}
  // Isso fará o UserDashboard quebrar ou vir vazio.
  getByUser: async (userId: string): Promise<Enrollment[]> => {
    console.warn("Backend sem rota para listar inscrições do usuário. Retornando vazio.");
    // return []; // Descomente para evitar erro 404 até implementar no back
    const response = await api.get(`/users/me/inscriptions`); // Tentativa
    return response.data;
  },

  // Rota backend: GET /events/{event_id}/inscriptions
  getByEvent: async (eventId: string): Promise<Enrollment[]> => {
    const response = await api.get(`/events/${eventId}/inscriptions`);
    return response.data;
  },

  // Rota backend: POST /events/{event_id}/inscribe
  create: async (userId: string, eventId: string): Promise<Enrollment> => {
    // O backend usa o usuário logado (token), então enviamos um corpo vazio ou dados extras se InscriptionCreate exigir
    const response = await api.post(`/events/${eventId}/inscribe`, {});
    return response.data;
  },

  // ⚠️ ROTA FALTANDO NO BACKEND: Cancelar inscrição
  cancel: async (enrollmentId: string): Promise<void> => {
    console.warn("Backend sem rota para cancelar inscrição.");
    // await api.delete(`/inscriptions/${enrollmentId}`);
  }
};

export const ratingAPI = {
  // ⚠️ ROTAS FALTANDO NO BACKEND: Sistema de avaliações não existe nos arquivos enviados.
  
  getByEvent: async (eventId: string): Promise<Rating[]> => {
    console.warn("Backend sem rota de avaliações.");
    return [];
  },

  create: async (rating: Omit<Rating, "id" | "createdAt">): Promise<Rating> => {
    throw new Error("Backend de avaliações não implementado.");
  }
};