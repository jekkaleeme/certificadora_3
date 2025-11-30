import axios from 'axios';

// --- 1. CONFIGURAÇÃO DO AXIOS ---
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- HELPER CORRIGIDO ---
const toISOString = (date: string, time: string) => {
    // 1. Cria uma data LOCAL (O navegador entende que "2025-11-30T07:00" é horário do Brasil)
    const localDate = new Date(`${date}T${time}`);
    
    // 2. O .toISOString() converte automaticamente para UTC (soma 3h) e adiciona o Z
    // Vai gerar algo como "2025-11-30T10:00:00.000Z"
    return localDate.toISOString();
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- 2. INTERFACES DE DADOS (O que vem do Backend) ---

export interface Event {
  id: string; 
  title: string;
  type: "oficina" | "palestra" | "reuniao" | "reuniao_interna";
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
  inscriptions_count?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "participant";
  age?: number;
  phone?: string;
  school?: string;
  createdAt?: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  eventId: string;
  event_id?: number;
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

// --- 3. INTERFACES DE ENTRADA (O que vem do Formulário) ---

export interface CreateEventInput {
  title: string;
  type: "oficina" | "palestra" | "reuniao" | "reuniao_interna";
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  endTime: string;
  location: string;
  description: string;
  maxVacancies: string | number; // Inputs HTML costumam retornar string
  instructor: string;
  isPrivate: boolean;
  materials?: string;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
}

export interface CreateRatingInput {
  userId: string;
  eventId: string;
  rating: number;
  comment?: string;
}

// --- 4. IMPLEMENTAÇÃO REAL ---

export const eventAPI = {
  getAll: async (): Promise<Event[]> => {
    const response = await api.get('/events');
    return response.data;
  },

  getById: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // AQUI: Usamos CreateEventInput em vez de any
  create: async (event: CreateEventInput): Promise<Event> => {
    
    // 1. Formata Data/Hora para ISO UTC (com 'Z')
    const startDateTime = toISOString(event.date, event.time);
    const endDateTime = toISOString(event.date, event.endTime);

    if (endDateTime <= startDateTime) {
        throw new Error("O horário de término deve ser maior que o de início.");
    }

    // 2. Traduz Tipo de Evento
    let backendType: string = event.type;
    if (event.type === 'reuniao') {
        backendType = 'reuniao_interna';
    }

    const materialsList = [];
    if (event.materials && event.materials.trim() !== "") {
        materialsList.push({
            title: "Material Complementar",
            url_or_filename: event.materials
        });
    }

    // 3. Monta o Payload Tipado
    const payload = {
      title: event.title,
      description: event.description,
      event_type: backendType,
      start_time: startDateTime,
      end_time: endDateTime, 
      location: event.location,
      host: event.instructor,
      max_vacancies: Number(event.maxVacancies),
      is_public: !event.isPrivate,
      materials: materialsList
    };

    // === LOG 1: O QUE ESTAMOS ENVIANDO ===
    console.log("📦 PAYLOAD ENVIADO:", JSON.stringify(payload, null, 2));

    try {
      const response = await api.post('/events', payload);
      return response.data;
    } catch (error) {
      // === LOG 2: O QUE O BACKEND RESPONDEU (ERRO) ===
      console.error("❌ ERRO DO BACKEND:", error.response?.data);
      console.error("STATUS:", error.response?.status);
      throw error; // Re-lança o erro para o toast do front mostrar
    }
  },

  update: async (id: string, event: Partial<CreateEventInput>): Promise<Event> => {
    
    // Tipagem explícita do payload de update
    type UpdateEventPayload = Partial<{
      title: string;
      description: string;
      location: string;
      host: string;
      event_type: string;
      max_vacancies: number;
      is_public: boolean;
      start_time: string;
      end_time: string;
      materials: { title: string; url_or_filename: string }[];
    }>;

    // Criamos um objeto payload vazio e vamos preenchendo APENAS com o que foi enviado
    const payload: UpdateEventPayload = {};

    // 1. Campos de Texto Simples (Copia direto se existir)
    if (event.title !== undefined) payload.title = event.title;
    if (event.description !== undefined) payload.description = event.description;
    if (event.location !== undefined) payload.location = event.location;

    // 2. Tradução: Instrutor -> Host
    if (event.instructor !== undefined) payload.host = event.instructor;

    // 3. Tradução: Tipo de Evento
    if (event.type) {
        payload.event_type = event.type === 'reuniao' ? 'reuniao_interna' : event.type;
    }

    // 4. Tradução: Vagas (String -> Number e camelCase -> snake_case)
    // Aceita 0, por isso checamos undefined/null e string vazia
    if (event.maxVacancies !== undefined && event.maxVacancies !== "") {
        payload.max_vacancies = Number(event.maxVacancies);
    }

    // 5. Tradução: Privacidade (Inverte a lógica)
    if (event.isPrivate !== undefined) {
        payload.is_public = !event.isPrivate;
    }

    // 6. Tradução: Datas (Igual ao Create: Data + Hora + Z)
    // Assumimos que se mandou editar data/hora, mandou o conjunto (o form do AdminDashboard manda tudo)
    if (event.date && event.time) {
        payload.start_time = toISOString(event.date, event.time);
    }
    
    if (event.date && event.endTime) {
        payload.end_time = toISOString(event.date, event.endTime);
    }

    // 7. Tradução: Materiais (String -> Lista de Objetos)
    if (event.materials !== undefined) {
         const materialsList = [];
         if (event.materials.trim() !== "") {
            materialsList.push({
                title: "Material Complementar",
                url_or_filename: event.materials
            });
        }
        // Nota: Isso sobrescreve a lista anterior. Para edição simples, funciona.
        payload.materials = materialsList;
    }

    console.log("📦 PAYLOAD UPDATE ENVIADO:", JSON.stringify(payload, null, 2));

    try {
        const response = await api.put(`/events/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error("❌ ERRO NO UPDATE:", error.response?.data);
        throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  }
};

export const userAPI = {
  getCurrent: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users/all');
    return response.data;
  },

  register: async (user: RegisterUserInput): Promise<User> => {
    const backendRole = user.role === 'admin' ? 'admin' : 'participant';

    const payload = {
      name: user.name,
      email: user.email,
      password: user.password,
      role: backendRole,
      phone: user.phone || null
    };

    const response = await api.post('/users', payload);
    return response.data;
  },

  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await api.post('/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
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
  getByUser: async (userId: string): Promise<Enrollment[]> => {
    const response = await api.get(`/users/me/inscriptions`); 
    return response.data;
  },

  getByEvent: async (eventId: string): Promise<Enrollment[]> => {
    const response = await api.get(`/events/${eventId}/inscriptions`);
    return response.data;
  },

  create: async (userId: string, eventId: string): Promise<Enrollment> => {
    const response = await api.post(`/events/${eventId}/inscribe`, {});
    return response.data;
  },

  cancel: async (enrollmentId: string): Promise<void> => {
    console.warn("Cancelamento ainda não implementado no backend");
  }
};

export const ratingAPI = {
  getByEvent: async (eventId: string): Promise<Rating[]> => {
    const response = await api.get(`/ratings/event/${eventId}`);
    return response.data;
  },

  create: async (rating: CreateRatingInput): Promise<Rating> => {
    const payload = {
      user_id: rating.userId,
      event_id: rating.eventId,
      rating: rating.rating,
      comment: rating.comment
    };
    const response = await api.post('/ratings/', payload);
    return response.data;
  }
};