class Auth {
    static async authenticate() {
        const code = document.getElementById('adminCode').value;
        const loginButton = document.getElementById('loginButton');
        loginButton.textContent = 'Authenticating...';
        loginButton.disabled = true;

        try {
            const response = await fetch(`${config.API_URL}/api/admin/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessCode: code })
            });
            const data = await response.json();

            if (data.success && data.token) {
                localStorage.setItem('adminToken', data.token);
                this.showDashboard();
                SocketManager.initialize(data.token);
                AuctionState.loadInitialData();
            } else {
                this.showError(data.error || 'Invalid admin code');
            }
        } catch (error) {
            this.showError('Authentication failed: ' + error.message);
            console.error('Auth error:', error);
        } finally {
            loginButton.textContent = 'Login';
            loginButton.disabled = false;
        }
    }

    static async verifyAndInitialize(token) {
        try {
            const response = await fetch(`${config.API_URL}/api/admin/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (data.success) {
                this.showDashboard();
                SocketManager.initialize(token);
                AuctionState.loadInitialData();
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Verification error:', error);
            this.logout();
        }
    }

    static showDashboard() {
        document.getElementById('adminLogin').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
    }

    static showError(message) {
        const errorElem = document.getElementById('loginError');
        errorElem.textContent = message;
        errorElem.classList.remove('hidden');
        setTimeout(() => errorElem.classList.add('hidden'), 3000);
    }

    static logout() {
        localStorage.removeItem('adminToken');
        if (SocketManager.socket) {
            SocketManager.socket.disconnect();
        }
        SocketManager.socket = null;
        AuctionState.reset();
        document.getElementById('adminDashboard').classList.add('hidden');
        document.getElementById('adminLogin').classList.remove('hidden');
        document.getElementById('adminCode').value = '';
    }
}