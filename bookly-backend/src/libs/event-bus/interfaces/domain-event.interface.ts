/**
 * Domain Event Interface
 * Base interface for all domain events in the system
 */
export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  timestamp: Date;
  data?: any;
}
