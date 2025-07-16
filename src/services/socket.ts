import { io } from 'socket.io-client';

const URL = 'https://two025-energy-event-backend.onrender.com';

// By setting autoConnect to true (the default) and specifying transports,
// we ensure a more reliable and immediate connection for real-time updates.
export const socket = io(URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
});