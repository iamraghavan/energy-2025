import { io } from 'socket.io-client';

const URL = 'https://two025-energy-event-backend.onrender.com';

export const socket = io(URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
});
