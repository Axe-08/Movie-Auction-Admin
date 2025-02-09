const config = {
    API_URL: 'https://sheet-stamps-products-website.trycloudflare.com',
    SOCKET_OPTIONS: {

        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    }
};