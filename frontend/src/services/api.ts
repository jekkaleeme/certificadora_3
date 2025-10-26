// API Service - Prepared for backend integration
// TODO: Replace with actual backend endpoints

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
  isPrivate: boolean; // RF14, RF20: Controle de privacidade
  materials?: string; // RF34: Materiais complementares
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

// Event API
export const eventAPI = {
  // Get all events
  getAll: async (): Promise<Event[]> => {
    // TODO: Replace with actual API call
    // return fetch('/api/events').then(res => res.json());
    throw new Error("Backend not implemented yet");
  },

  // Get event by ID
  getById: async (id: string): Promise<Event> => {
    // TODO: Replace with actual API call
    // return fetch(`/api/events/${id}`).then(res => res.json());
    throw new Error("Backend not implemented yet");
  },

  // Create new event (admin only)
  create: async (event: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<Event> => {
    // TODO: Replace with actual API call
    // return fetch('/api/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event)
    // }).then(res => res.json());
    throw new Error("Backend not implemented yet");
  },

  // Update event (admin only)
  update: async (id: string, event: Partial<Event>): Promise<Event> => {
    // TODO: Replace with actual API call
    // return fetch(`/api/events/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event)
    // }).then(res => res.json());
    throw new Error("Backend not implemented yet");
  },

  // Delete event (admin only)
  delete: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call
    // return fetch(`/api/events/${id}`, { method: 'DELETE' });
    throw new Error("Backend not implemented yet");
  }
};

// User API
export const userAPI = {
  // Get current user
  getCurrent: async (): Promise<User> => {
    // TODO: Replace with actual API call
    // return fetch('/api/users/me').then(res => res.json());
    throw new Error("Backend not implemented yet");
  },

  // Register new user
  register: async (user: Omit<User, "id" | "createdAt">): Promise<User> => {
    // TODO: Replace with actual API call
    // return fetch('/api/users/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(user)
    // }).then(res => res.json());
    throw new Error("Backend not implemented yet");
  },

  // Login
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    // TODO: Replace with actual API call
    // return fetch('/api/users/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // }).then(res => res.json());
    throw new Error("Backend not implemented yet");
  },

  // Logout
  logout: async (): Promise<void> => {
    // TODO: Replace with actual API call
    // return fetch('/api/users/logout', { method: 'POST' });
    throw new Error("Backend not implemented yet");
  }
};

// Enrollment API
export const enrollmentAPI = {
  // Get user enrollments
  getByUser: async (userId: string): Promise<Enrollment[]> => {
    // TODO: Replace with actual API call
    // return fetch(`/api/enrollments/user/${userId}`).then(res => res.json());
    throw new Error("Backend not implemented yet");
  },

  // Get event enrollments (admin only)
  getByEvent: async (eventId: string): Promise<Enrollment[]> => {
    // TODO: Replace with actual API call
    // return fetch(`/api/enrollments/event/${eventId}`).then(res => res.json());
    throw new Error("Backend not implemented yet");
  },

  // Enroll in event
  create: async (userId: string, eventId: string): Promise<Enrollment> => {
    // TODO: Replace with actual API call
    // return fetch('/api/enrollments', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, eventId })
    // }).then(res => res.json());
    throw new Error("Backend not implemented yet");
  },

  // Cancel enrollment
  cancel: async (enrollmentId: string): Promise<void> => {
    // TODO: Replace with actual API call
    // return fetch(`/api/enrollments/${enrollmentId}`, { method: 'DELETE' });
    throw new Error("Backend not implemented yet");
  }
};

// Rating API
export const ratingAPI = {
  // Get event ratings
  getByEvent: async (eventId: string): Promise<Rating[]> => {
    // TODO: Replace with actual API call
    // return fetch(`/api/ratings/event/${eventId}`).then(res => res.json());
    throw new Error("Backend not implemented yet");
  },

  // Create rating
  create: async (rating: Omit<Rating, "id" | "createdAt">): Promise<Rating> => {
    // TODO: Replace with actual API call
    // return fetch('/api/ratings', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(rating)
    // }).then(res => res.json());
    throw new Error("Backend not implemented yet");
  }
};
