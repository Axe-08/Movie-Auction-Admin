// clients/admin/src/js/dashboard.js
class Dashboard {
    static initialize() {
        // Set up event listeners
        document.getElementById('loginButton')?.addEventListener('click', () => Auth.authenticate());
        document.getElementById('adminCode')?.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') Auth.authenticate();
        });

        // Setup tab navigation
        document.querySelectorAll('.nav-tabs .tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.textContent.toLowerCase().replace(/\s+/g, '');
                Dashboard.showTab(tabName);
            });
        });

        // Check for existing session
        const token = localStorage.getItem('adminToken');
        if (token) {
            Auth.verifyAndInitialize(token);
        }
    }

    static showTab(tabName) {
        try {
            // Hide all tab contents and deactivate all tabs
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
            document.querySelectorAll('.nav-tabs .tab').forEach(tab => tab.classList.remove('active'));

            // Show selected tab and activate its button
            const selectedTab = document.getElementById(`${tabName}Tab`);
            const selectedButton = document.querySelector(`.nav-tabs .tab[onclick*="${tabName}"]`);

            if (selectedTab) {
                selectedTab.classList.remove('hidden');
            }
            if (selectedButton) {
                selectedButton.classList.add('active');
            }
        } catch (error) {
            console.error('Error switching tabs:', error);
        }
    }

   
    static updateAllDisplays() {
        try {
            this.updateCurrentItem();
            this.updateHousesList();
            CatalogueManager?.updateCatalogue();
            LeaderboardManager?.updateLeaderboard();
        } catch (error) {
            console.error('Error updating displays:', error);
            this.log('Error updating displays: ' + error.message, 'error');
        }
    }
    
    static updateCurrentItem() {
        try {
            const crew = AuctionState.crewMembers[AuctionState.currentCrewIndex];
            if (!crew) {
                console.warn('No crew member found');
                return;
            }

            const elements = {
                itemName: { value: crew.name || 'Unknown' },
                itemCategory: { value: crew.category || 'N/A' },
                itemRating: { value: crew.rating || 'N/A' },
                itemStatus: { 
                    value: (crew.status || 'UNKNOWN').toUpperCase(),
                    className: `status ${crew.status || 'unknown'}`
                },
                basePrice: { value: ((crew.base_price || 0) / 10000000).toFixed(2) },
                currentBid: { value: ((crew.current_bid || 0) / 10000000).toFixed(2) },
                itemCounter: { value: `${AuctionState.currentCrewIndex + 1}/${AuctionState.crewMembers.length}` }
            };

            // Safely update elements
            Object.entries(elements).forEach(([id, config]) => {
                const element = document.getElementById(id);
                if (element) {
                    if (config.value !== undefined) {
                        element.textContent = config.value;
                    }
                    if (config.className !== undefined) {
                        element.className = config.className;
                    }
                }
            });

            // Update navigation buttons
            this.updateNavigationButtons();
        } catch (error) {
            console.error('Error updating current item:', error);
        }
    }

    static updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.disabled = AuctionState.currentCrewIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = AuctionState.currentCrewIndex === AuctionState.crewMembers.length - 1;
        }
    }

    static updateHousesList() {
        const container = document.getElementById('housesList');
        if (!container) return;
    
        const currentCrew = AuctionState.crewMembers[AuctionState.currentCrewIndex];
    
        // First, calculate spent budget for each house
        const houseBudgets = new Map();
        AuctionState.crewMembers.forEach(crew => {
            if (crew.production_house_id && crew.purchase_price) {
                const currentSpent = houseBudgets.get(crew.production_house_id) || 0;
                houseBudgets.set(crew.production_house_id, currentSpent + crew.purchase_price);
            }
        });
    
        container.innerHTML = AuctionState.houses.map(house => {
            // Calculate remaining budget
            const spentBudget = houseBudgets.get(house.id) || 0;
            const remainingBudget = house.budget - spentBudget;
    
            const canBuy = currentCrew &&
                currentCrew.status === 'available' &&
                remainingBudget >= (currentCrew.current_bid || currentCrew.base_price);
    
            // Get a CSS class based on budget percentage remaining
            const getBudgetStatusClass = () => {
                const percentage = (remainingBudget / house.budget) * 100;
                if (percentage < 20) return 'danger';
                if (percentage < 50) return 'warning';
                return 'available';
            };
    
            return `
                <div class="card mb-20">
                    <div class="flex mb-20">
                        <h3>${house.name}</h3>
                        <div class="budget-info">
                            <div class="status ${getBudgetStatusClass()}">
                                ₹${(remainingBudget / 10000000).toFixed(2)} Cr
                            </div>
                            <div class="total-budget">
                                Total: ₹${(house.budget / 10000000).toFixed(2)} Cr
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-between">
                        <div>Crew Count: ${house.crew_count || 0}</div>
                        <div>Avg Rating: ${house.average_rating ? house.average_rating.toFixed(2) : 'N/A'}</div>
                    </div>
                    <div class="flex mt-10">
                        <button 
                            onclick="Dashboard.assignCrewToHouse(${house.id})"
                            ${!canBuy ? 'disabled' : ''}
                            class="${canBuy ? 'active' : 'disabled'}"
                            title="${!canBuy && currentCrew ? 'Insufficient budget' : ''}"
                        >
                            Assign Crew ${!canBuy ? '(Not Available)' : ''}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    static async assignCrewToHouse(houseId) {
        const crew = AuctionState.crewMembers[AuctionState.currentCrewIndex];
        const token = localStorage.getItem('adminToken');

        if (!crew || crew.status === 'sold') {
            this.log('Crew member not available for sale', 'error');
            return;
        }

        if (!token) {
            this.log('Not authenticated', 'error');
            Auth.logout();
            return;
        }

        const assignButton = document.querySelector(`button[onclick="Dashboard.assignCrewToHouse(${houseId})"]`);
        if (assignButton) assignButton.disabled = true;

        try {
            const response = await fetch(`${config.API_URL}/api/sell`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    crewMemberId: crew.id,
                    productionHouseId: houseId,
                    purchasePrice: crew.current_bid
                })
            });

            if (response.status === 401) {
                this.log('Session expired', 'error');
                Auth.logout();
                return;
            }

            const data = await response.json();

            if (data.success) {
                this.log(`Successfully sold crew member to house ${houseId}`, 'success');
                crew.status = 'sold';
                this.updateCurrentItem();
                await AuctionState.loadInitialData();
                
                const nextAvailableIndex = AuctionState.crewMembers.findIndex((c, index) =>
                    index > AuctionState.currentCrewIndex && c.status !== 'sold'
                );
                if (nextAvailableIndex !== -1) {
                    AuctionState.currentCrewIndex = nextAvailableIndex;
                    this.updateCurrentItem();
                }
            } else {
                this.log(`Failed to sell crew member: ${data.error}`, 'error');
            }
        } catch (error) {
            this.log(`Error selling crew member: ${error.message}`, 'error');
        } finally {
            if (assignButton) assignButton.disabled = false;
        }
    }

    static setNewBid() {
        const newBidInput = document.getElementById('newBid');
        const newBid = parseFloat(newBidInput?.value);
        if (!newBid || isNaN(newBid)) {
            this.log('Invalid bid amount', 'error');
            return;
        }

        const bidInRupees = newBid * 10000000;
        const crew = AuctionState.crewMembers[AuctionState.currentCrewIndex];

        if (!crew) {
            this.log('No crew member selected', 'error');
            return;
        }

        if (bidInRupees <= crew.current_bid) {
            this.log('New bid must be higher than current bid', 'error');
            return;
        }

        // Update local state first
        crew.current_bid = bidInRupees;
        this.updateCurrentItem();

        // Emit socket event
        if (SocketManager.socket) {
            SocketManager.socket.emit('bid_update', {
                crewId: crew.id,
                newBid: bidInRupees
            });
        }
        if (newBidInput) newBidInput.value = '';
    }
    static nextItem() {
        if (AuctionState.currentCrewIndex < AuctionState.crewMembers.length - 1) {
            AuctionState.currentCrewIndex++;
            this.updateCurrentItem();
        }
    }

    static previousItem() {
        if (AuctionState.currentCrewIndex > 0) {
            AuctionState.currentCrewIndex--;
            this.updateCurrentItem();
        }
    }

    static log(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        const logContainer = document.getElementById('eventLog');
        if (!logContainer) {
            console.error('Event log container not found');
            return;
        }
    
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const timestamp = new Date().toLocaleTimeString();
        entry.textContent = `[${timestamp}] ${message}`;
        
        // Insert at the beginning
        logContainer.insertBefore(entry, logContainer.firstChild);
    
        // Limit number of log entries (optional)
        while (logContainer.children.length > 100) {
            logContainer.removeChild(logContainer.lastChild);
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.initialize();
});