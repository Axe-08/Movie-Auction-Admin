// clients/admin/src/js/socket.js
class SocketManager {
    static socket = null;

    static initialize(token) {
        if (this.socket) {
            this.socket.disconnect();
        }

        this.socket = io(config.API_URL, {
            ...config.SOCKET_OPTIONS,
            auth: { token }
        });

        this.setupListeners();
    }

    static setupListeners() {
        this.socket.on('connect_error', (error) => {
            console.log('Socket connection error:', error);
            Dashboard.log('Connection error: Retrying...', 'error');
        });

        this.socket.on('reconnect', (attemptNumber) => {
            Dashboard.log(`Reconnected after ${attemptNumber} attempts`, 'success');
            AuctionState.loadInitialData();
        });

        this.socket.on('connect', () => {
            document.getElementById('connectionStatus').textContent = 'Connected';
            document.getElementById('connectionStatus').className = 'status available';
            Dashboard.log('Connected to server', 'success');
        });

        this.socket.on('disconnect', () => {
            document.getElementById('connectionStatus').textContent = 'Disconnected';
            document.getElementById('connectionStatus').className = 'status sold';
            Dashboard.log('Disconnected from server', 'error');
        });

        // Add all other socket event handlers
        this.socket.on('bid_update', this.handleBidUpdate.bind(this));
        this.socket.on('house_budget_updated', this.handleBudgetUpdate.bind(this));
        this.socket.on('sale_complete', this.handleSaleComplete.bind(this));
    }

    static handleBidUpdate(data) {
        AuctionState.updateCrewMember(data.crewId, { current_bid: data.newBid });
        Dashboard.log(`Bid updated: ₹${(data.newBid / 10000000).toFixed(2)} Cr`, 'info');
    }

    static handleBudgetUpdate(data) {
        const house = AuctionState.houses.find(h => h.id === data.houseId);
        if (house) {
            house.budget = data.budget;
            Dashboard.updateHousesList();
        }
    }

    static handleSaleComplete(data) {
        Dashboard.log(`Sale completed: ₹${(data.purchasePrice / 10000000).toFixed(2)} Cr`, 'success');
        AuctionState.loadInitialData();
    }
}