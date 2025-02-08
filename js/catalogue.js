class CatalogueManager {
    static state = {
        currentPage: 1,
        itemsPerPage: 10,
        sortField: null,
        sortDirection: 'asc',
        filterText: ''
    };

    static updateCatalogue() {
        const tbody = document.getElementById('catalogueList');
        const paginationContainer = document.getElementById('cataloguePagination');

        let filteredCrew = AuctionState.crewMembers.filter(crew => {
            const searchText = this.state.filterText.toLowerCase();
            return (
                crew.name.toLowerCase().includes(searchText) ||
                crew.category.toLowerCase().includes(searchText) ||
                (crew.buyer_name && crew.buyer_name.toLowerCase().includes(searchText))
            );
        });

        if (this.state.sortField) {
            filteredCrew.sort((a, b) => {
                let aValue = a[this.state.sortField];
                let bValue = b[this.state.sortField];

                if (this.state.sortField === 'base_price' || this.state.sortField === 'current_bid') {
                    aValue = Number(aValue);
                    bValue = Number(bValue);
                }

                if (this.state.sortField === 'buyer_name') {
                    aValue = aValue || '';
                    bValue = bValue || '';
                }

                return this.state.sortDirection === 'asc' 
                    ? aValue > bValue ? 1 : -1 
                    : aValue < bValue ? 1 : -1;
            });
        }

        const totalPages = Math.ceil(filteredCrew.length / this.state.itemsPerPage);
        const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
        const paginatedCrew = filteredCrew.slice(startIndex, startIndex + this.state.itemsPerPage);

        tbody.innerHTML = paginatedCrew.map(crew => `
            <tr>
                <td>${crew.name}</td>
                <td>${crew.category}</td>
                <td>${crew.rating}</td>
                <td>${(crew.base_price / 10000000).toFixed(2)}</td>
                <td>${(crew.current_bid / 10000000).toFixed(2)}</td>
                <td><span class="status ${crew.status}">${crew.status.toUpperCase()}</span></td>
                <td>${crew.buyer_name || '-'}</td>
            </tr>
        `).join('');

        paginationContainer.innerHTML = this.generatePaginationControls(totalPages);
    }

    static generatePaginationControls(totalPages) {
        if (totalPages <= 1) return '';

        let controls = [];
        controls.push(`
            <button 
                onclick="CatalogueManager.changePage(${this.state.currentPage - 1})"
                ${this.state.currentPage === 1 ? 'disabled' : ''}
            >Previous</button>
        `);

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= this.state.currentPage - 2 && i <= this.state.currentPage + 2)
            ) {
                controls.push(`
                    <button 
                        onclick="CatalogueManager.changePage(${i})"
                        class="${i === this.state.currentPage ? 'active' : ''}"
                    >${i}</button>
                `);
            } else if (
                i === this.state.currentPage - 3 ||
                i === this.state.currentPage + 3
            ) {
                controls.push('<span>...</span>');
            }
        }

        controls.push(`
            <button 
                onclick="CatalogueManager.changePage(${this.state.currentPage + 1})"
                ${this.state.currentPage === totalPages ? 'disabled' : ''}
            >Next</button>
        `);

        return controls.join('');
    }

    static changePage(page) {
        this.state.currentPage = page;
        this.updateCatalogue();
    }

    static sort(field) {
        if (this.state.sortField === field) {
            this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.state.sortField = field;
            this.state.sortDirection = 'asc';
        }
        this.updateCatalogue();
    }

    static filter(text) {
        this.state.filterText = text.toLowerCase();
        this.state.currentPage = 1;
        this.updateCatalogue();
    }
}