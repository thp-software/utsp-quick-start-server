import { NetworkTransportType, ServerRuntime } from '@utsp/runtime-server';
import { SpaceDemo } from './applications/SpaceDemo';
import { createHash } from 'crypto';
import { hostname } from 'os';

/**
 * Generates a stable, unique session ID based on the machine's hostname.
 * This ensures the same PC always gets the same session ID across restarts,
 * but different PCs get different IDs.
 */
function generateSessionId(prefix: string): string {
    const machineId = hostname();
    const hash = createHash('sha256').update(machineId).digest('hex').slice(0, 8);
    return `${prefix}-${hash}`;
}

const sessionId = generateSessionId('quick-start');

// Create the server runtime
const server = new ServerRuntime({
    application: new SpaceDemo(),
    mode: NetworkTransportType.WebRTC,
    webrtc: {
        port: 3200,
        host: '0.0.0.0',
        signalUrl: 'https://home-signal.utsp.dev',
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        sessionId,
    },
});

// Start the server
server.start().then(() => {
    console.log('✅ UTSP server started!');
    // The link to join the game. Works only for WebRTC transport.
    console.log(`🔗 Connect at: https://home.utsp.dev/${sessionId}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
});
