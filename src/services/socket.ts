
import { io, type Socket } from 'socket.io-client';
import type { MatchAPI } from '@/lib/types';

const URL = 'https://two025-energy-event-backend.onrender.com';

// Define types for socket events for type safety
export interface ServerToClientEvents {
  matchCreated: (match: MatchAPI) => void;
  matchUpdated: (match: MatchAPI) => void;
  matchDeleted: (data: { matchId: string }) => void;
  scoreUpdate: (match: MatchAPI) => void;
  layoutUpdate: (layout: QuadrantConfig) => void;
  currentLayout: (layout: QuadrantConfig) => void;
}

export interface ClientToServerEvents {
  matchCreated: (match: MatchAPI) => void;
  matchUpdated: (match: MatchAPI) => void;
  matchDeleted: (data: { matchId: string }) => void;
  scoreUpdate: (match: MatchAPI) => void;
  layoutUpdate: (layout: QuadrantConfig) => void;
  getLayout: () => void;
}

export interface QuadrantConfig {
  quadrants: (string | null)[];
}


// By setting autoConnect to true (the default) and specifying transports,
// we ensure a more reliable and immediate connection for real-time updates.
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
});
