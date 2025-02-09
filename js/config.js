const config = {
    API_URL: 'https://payment-spectrum-permission-follow.trycloudflare.com',
    SOCKET_OPTIONS: {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    }
};