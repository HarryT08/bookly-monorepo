/**
 * Eventos relacionados con usuarios que serán emitidos o consumidos por auth-service
 */

// Eventos que auth-service emitirá
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

// Eventos que auth-service escuchará
export interface UserCreatedEvent {
  userId: string;
  email: string;
  role: string;
  timestamp: Date;
}

export interface UserUpdatedEvent {
  userId: string;
  email?: string;
  isActive?: boolean;
  timestamp: Date;
}

export interface UserDeletedEvent {
  userId: string;
  timestamp: Date;
}
