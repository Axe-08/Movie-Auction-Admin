// clients/admin/src/js/auctionState.js
class AuctionState {
    static currentCrewIndex = 0;
    static crewMembers = [];
    static houses = [];

    static async loadInitialData() {
        try {
            const [crew, leaderboard] = await Promise.all([
                API.fetchWithAuth(`${config.API_URL}/api/crew`).then(r => r.json()),
                API.fetchWithAuth(`${config.API_URL}/api/leaderboard`).then(r => r.json())
            ]);

            const houseMap = new Map(leaderboard.map(house => [house.id, house.name]));

            this.crewMembers = crew.map(member => ({
                ...member,
                status: member.status || 'available',
                current_bid: member.current_bid || member.base_price,
                buyer_name: member.production_house_id ? houseMap.get(member.production_house_id) : null
            }));
            
            this.houses = leaderboard;
            this.currentCrewIndex = this.crewMembers.findIndex(crew => crew.status !== 'sold');
            if (this.currentCrewIndex === -1) this.currentCrewIndex = 0;

            Dashboard.updateAllDisplays();
        } catch (error) {
            console.error('Failed to load initial data:', error);
            // Changed from log to Dashboard.log
            Dashboard.log('Failed to load initial data: ' + error.message, 'error');
        }
    }

    static setCurrentCrew(index) {
        this.currentCrewIndex = index;
        Dashboard.updateCurrentItem();
        Dashboard.updateHousesList();
    }

    static updateCrewMember(crewId, updates) {
        const index = this.crewMembers.findIndex(c => c.id === crewId);
        if (index !== -1) {
            this.crewMembers[index] = { ...this.crewMembers[index], ...updates };
            if (index === this.currentCrewIndex) {
                Dashboard.updateCurrentItem();
            }
            CatalogueManager.updateCatalogue();
        }
    }

    static reset() {
        this.currentCrewIndex = 0;
        this.crewMembers = [];
        this.houses = [];
    }
}