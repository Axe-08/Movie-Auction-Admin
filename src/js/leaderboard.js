class LeaderboardManager {
    static updateLeaderboard() {
        const container = document.getElementById('leaderboard');
        
        const sortedHouses = [...AuctionState.houses].sort(
            (a, b) => (b.average_rating || 0) - (a.average_rating || 0)
        );

        container.innerHTML = sortedHouses.map(house => `
            <div class="card mb-20">
                <h3 class="mb-20">${house.name}</h3>
                <div class="grid grid-cols-2 gap-10">
                    <div>Budget: ₹${(house.budget / 10000000).toFixed(2)} Cr</div>
                    <div>Average Rating: ${house.average_rating ? house.average_rating.toFixed(2) : 'N/A'}</div>
                    <div>Total Crew: ${house.crew_count || 0}</div>
                    <div>Categories Filled: ${this.getCategoriesFilled(house)}/6</div>
                </div>
                <div class="mt-10">
                    ${this.generateRequirementsList(house)}
                </div>
            </div>
        `).join('');
    }

    static getCategoriesFilled(house) {
        const categories = ['lead_actors', 'supporting_actors', 'musicians', 'directors', 'nepo_kids', 'comedic_relief'];
        return categories.filter(cat => (house[cat] || 0) > 0).length;
    }

    static generateRequirementsList(house) {
        const requirements = [
            { name: 'Lead Actors', required: 3, current: house.lead_actors || 0 },
            { name: 'Supporting Actors', required: 2, current: house.supporting_actors || 0 },
            { name: 'Musicians', required: 1, current: house.musicians || 0 },
            { name: 'Directors', required: 1, current: house.directors || 0 },
            { name: 'Nepo Kids', required: 1, current: house.nepo_kids || 0 },
            { name: 'Comedic Relief', required: 1, current: house.comedic_relief || 0 }
        ];

        return `
            <div class="requirements-list">
                ${requirements.map(req => `
                    <div class="requirement ${req.current >= req.required ? 'fulfilled' : 'pending'}">
                        ${req.name}: ${req.current}/${req.required}
                    </div>
                `).join('')}
            </div>
        `;
    }
}