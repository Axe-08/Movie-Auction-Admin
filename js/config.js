const config = {
    API_URL: 'https://conditioning-operational-supports-leon.trycloudflare.com',
    SOCKET_OPTIONS: {

        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    }
};