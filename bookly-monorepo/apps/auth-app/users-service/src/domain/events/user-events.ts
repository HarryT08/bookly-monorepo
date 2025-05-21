/**
 * Definiciones de eventos relacionados con usuarios
 * Estos eventos son publicados por users-service y consumidos por otros servicios
 */

export interface UserCreatedEvent {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  timestamp: Date;
}

export interface UserUpdatedEvent {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
  timestamp: Date;
}

export interface UserDeletedEvent {
  userId: string;
  timestamp: Date;
}

// Eventos que users-service escucha de otros servicios
export interface UserRegisteredEvent {
  userId: string;
  email: string;
  role: string;
  timestamp: Date;
}

export interface UserAuthenticatedEvent {
  userId: string;
  email: string;
  timestamp: Date;
}
