const config = {
    API_URL: 'https://drop-academics-speech-substance.trycloudflare.com',
    SOCKET_OPTIONS: {

        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    }
};