class API {
    static async fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('Not authenticated');
        }

        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            if (response.status === 401) {
                logout();
                throw new Error('Session expired');
            }
            return response;
        });
    }

    static async loadInitialData() {
        return Promise.all([
            this.fetchWithAuth(`${config.API_URL}/api/crew`).then(r => r.json()),
            this.fetchWithAuth(`${config.API_URL}/api/leaderboard`).then(r => r.json())
        ]);
    }
}