class LeaderboardManager {
    static updateLeaderboard() {
        const container = document.getElementById('leaderboard');
        if (!container) return;
    
        const reqMap = {
            'Lead Actor': 3,
            'Supporting Actor': 2,
            'Musician': 1,
            'Director': 1,
            'Nepo Kid': 1,
            'Comedic Relief': 1
        };
    
        container.innerHTML = AuctionState.houses
            .sort((a, b) => ((b.average_rating || 0) - (a.average_rating || 0)))
            .map(house => {
                const requirements = [
                    { name: 'Lead Actors', required: 3, current: house.lead_actors || 0 },
                    { name: 'Supporting Actors', required: 2, current: house.supporting_actors || 0 },
                    { name: 'Musicians', required: 1, current: house.musicians || 0 },
                    { name: 'Directors', required: 1, current: house.directors || 0 },
                    { name: 'Nepo Kids', required: 1, current: house.nepo_kids || 0 },
                    { name: 'Comedic Relief', required: 1, current: house.comedic_relief || 0 }
                ];
    
                const totalReqMet = requirements.filter(req => req.current >= req.required).length;
                const metAllReqs = totalReqMet === requirements.length;
    
                return `
                    <div class="card mb-20 ${metAllReqs ? 'complete' : ''}">
                        <div class="header-section">
                            <h3>${house.name}</h3>
                            <div class="stats">
                                <div class="budget">₹${(house.budget / 10000000).toFixed(2)} Cr</div>
                                <div class="rating ${metAllReqs ? 'valid' : 'incomplete'}">
                                    Rating: ${house.average_rating ? house.average_rating.toFixed(2) : 'N/A'}
                                    ${!metAllReqs ? ' (Incomplete)' : ''}
                                </div>
                            </div>
                        </div>
                        <div class="requirements-grid">
                            ${requirements.map(req => `
                                <div class="requirement ${req.current >= req.required ? 'fulfilled' : 'pending'}">
                                    <div class="req-name">${req.name}</div>
                                    <div class="req-count">${req.current}/${req.required}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('');
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