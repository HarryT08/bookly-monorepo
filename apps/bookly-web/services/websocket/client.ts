/**
 * WebSocket client for real-time events and notifications in Bookly
 */

import { io, Socket } from 'socket.io-client';
import type { BooklyEvent, ConnectionState, AuthPayload, RoomSubscription } from './types';

type EventCallback = (data: BooklyEvent) => void;

class BooklyWebSocketClient {
	private socket: Socket | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000;
	private state: ConnectionState = 'disconnected';
	private eventHandlers = new Map<string, EventCallback[]>();

	/**
	 * Connect to WebSocket server
	 */
	connect(token?: string): void {
		const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3000';

		this.socket = io(wsUrl, {
			auth: {
				token
			},
			autoConnect: true,
			reconnection: true,
			reconnectionAttempts: this.maxReconnectAttempts,
			reconnectionDelay: this.reconnectDelay
		});

		this.setupEventHandlers();
		this.state = 'connecting';
	}

	/**
	 * Disconnect from WebSocket server
	 */
	disconnect(): void {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
	}

	/**
	 * Check if WebSocket is connected
	 */
	isConnected(): boolean {
		return this.socket?.connected ?? false;
	}

	/**
	 * Get current connection state
	 */
	getState(): ConnectionState {
		return this.state;
	}

	/**
	 * Subscribe to an event
	 */
	on(event: string, handler: EventCallback): void {
		if (this.socket) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			this.socket.on(event, handler as any);

			if (!this.eventHandlers.has(event)) {
				this.eventHandlers.set(event, []);
			}

			this.eventHandlers.get(event)?.push(handler);
		}
	}

	/**
	 * Unsubscribe from an event
	 */
	off(event: string, handler?: EventCallback): void {
		if (this.socket) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			this.socket.off(event, handler as any);

			if (this.eventHandlers.has(event)) {
				const handlers = this.eventHandlers.get(event);

				if (handlers && handler) {
					const index = handlers.indexOf(handler);

					if (index !== -1) {
						handlers.splice(index, 1);
					}
				}
			}
		}
	}

	/**
	 * Emit an event to server
	 */
	emit(event: string, data?: Record<string, unknown>): void {
		if (this.socket?.connected) {
			this.socket.emit(event, data);
		}
	}

	/**
	 * Join a specific room for targeted events
	 */
	joinRoom(subscription: RoomSubscription): void {
		if (!this.socket) return;

		this.socket.emit('join-room', {
			...subscription,
			timestamp: new Date().toISOString()
		});
	}

	/**
	 * Leave a room
	 */
	leaveRoom(subscription: Omit<RoomSubscription, 'events'>): void {
		if (!this.socket) return;

		this.socket.emit('leave-room', {
			...subscription,
			timestamp: new Date().toISOString()
		});
	}

	/**
	 * Join user room for personalized events
	 */
	joinUserRoom(userId: string): void {
		this.joinRoom({
			roomType: 'user',
			roomId: userId
		});
	}

	/**
	 * Join resource room for resource-specific events
	 */
	joinResourceRoom(resourceId: string): void {
		this.joinRoom({
			roomType: 'resource',
			roomId: resourceId
		});
	}

	/**
	 * Join reservation room for reservation updates
	 */
	joinReservationRoom(reservationId: string): void {
		this.joinRoom({
			roomType: 'global',
			roomId: `reservation:${reservationId}`
		});
	}

	/**
	 * Setup internal event handlers
	 */
	private setupEventHandlers(): void {
		if (!this.socket) return;

		this.socket.on('connect', () => {
			this.reconnectAttempts = 0;
			this.state = 'connected';
		});

		this.socket.on('disconnect', (_reason: string) => {
			this.state = 'disconnected';
			this.handleReconnect();
		});

		this.socket.on('connect_error', (_error: Error) => {
			this.handleReconnect();
		});

		this.socket.on('error', (_error: Error) => {
			// Connection error handled
		});

		this.socket.on('auth:error', (_error: unknown) => {
			if (typeof window !== 'undefined') {
				window.location.href = '/sign-in';
			}
		});
	}

	/**
	 * Handle reconnection logic
	 */
	private handleReconnect(): void {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			this.state = 'reconnecting';
			setTimeout(() => {
				if (this.socket && !this.socket.connected) {
					this.socket.connect();
				}
			}, this.reconnectDelay * this.reconnectAttempts);
		} else {
			this.state = 'error';
		}
	}
}

// Singleton instance
export const wsClient = new BooklyWebSocketClient();

export default wsClient;
