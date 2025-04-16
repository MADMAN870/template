// Inventory Management Module

const InventoryModule = {
    // Initialize inventory module
    init() {
        this.setupEventListeners();
        this.loadInventory();
        this.checkLowStockAlerts();
    },

    // Set up event listeners
    setupEventListeners() {
        // Stock adjustment form
        document.querySelector('#stockAdjustmentForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStockAdjustment(e.target);
        });

        // Low stock alerts
        document.querySelector('#lowStockAlerts')?.addEventListener('click', () => {
            this.showLowStockProducts();
        });
    },

    // Load inventory
    async loadInventory() {
        try {
            const inventory = await ApiService.inventory.getAll();
            this.renderInventory(inventory);
        } catch (error) {
            console.error('Error loading inventory:', error);
            this.showError('Failed to load inventory');
        }
    },

    // Render inventory table
    renderInventory(inventory) {
        const tbody = document.querySelector('#inventoryTable tbody');
        if (!tbody) return;

        tbody.innerHTML = inventory.map(item => `
            <tr class="${item.quantity <= item.lowStockThreshold ? 'low-stock' : ''}">
                <td>${item.productId}</td>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.lowStockThreshold}</td>
                <td>${item.lastUpdated ? Utils.formatDate(item.lastUpdated) : 'N/A'}</td>
                <td>
                    <button class="btn btn-primary adjust-stock" data-product-id="${item.productId}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-info view-history" data-product-id="${item.productId}">
                        <i class="fas fa-history"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Reattach event listeners
        this.setupEventListeners();
    },

    // Handle stock adjustment
    async handleStockAdjustment(form) {
        const formData = new FormData(form);
        const productId = formData.get('productId');
        const adjustment = parseInt(formData.get('adjustment'));
        const reason = formData.get('reason');
        const notes = formData.get('notes');

        try {
            await ApiService.inventory.updateStock(productId, adjustment);
            this.showSuccess('Stock adjusted successfully');
            form.reset();
            this.loadInventory();
        } catch (error) {
            console.error('Error adjusting stock:', error);
            this.showError('Failed to adjust stock');
        }
    },

    // Check low stock alerts
    async checkLowStockAlerts() {
        try {
            const inventory = await ApiService.inventory.getAll();
            const lowStockProducts = inventory.filter(item => 
                item.quantity <= item.lowStockThreshold
            );

            if (lowStockProducts.length > 0) {
                this.showLowStockNotification(lowStockProducts);
            }
        } catch (error) {
            console.error('Error checking low stock alerts:', error);
        }
    },

    // Show low stock notification
    showLowStockNotification(products) {
        const notification = {
            id: Utils.generateId(),
            type: 'warning',
            message: `${products.length} product(s) are low in stock`,
            timestamp: new Date(),
            products: products
        };

        StoreState.notifications.push(notification);
        UI.updateNotificationBadge();

        // Show notification toast
        this.showToast(notification);
    },

    // Show low stock products
    showLowStockProducts() {
        const lowStockProducts = StoreState.inventory.filter(item => 
            item.quantity <= item.lowStockThreshold
        );

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Low Stock Products</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Current Stock</th>
                            <th>Threshold</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lowStockProducts.map(product => `
                            <tr>
                                <td>${product.productName}</td>
                                <td>${product.quantity}</td>
                                <td>${product.lowStockThreshold}</td>
                                <td>
                                    <button class="btn btn-primary adjust-stock" 
                                            data-product-id="${product.productId}">
                                        Adjust Stock
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // Show stock history
    async showStockHistory(productId) {
        try {
            const history = await ApiService.inventory.getHistory(productId);
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>Stock History</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Adjustment</th>
                                <th>Reason</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${history.map(entry => `
                                <tr>
                                    <td>${Utils.formatDate(entry.timestamp)}</td>
                                    <td>${entry.adjustment}</td>
                                    <td>${entry.reason}</td>
                                    <td>${entry.notes || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            document.body.appendChild(modal);
        } catch (error) {
            console.error('Error showing stock history:', error);
            this.showError('Failed to load stock history');
        }
    },

    // Show toast notification
    showToast(notification) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${notification.type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${notification.message}</span>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
    },

    // Show success message
    showSuccess(message) {
        // Implement success message display
        console.log('Success:', message);
    },

    // Show error message
    showError(message) {
        // Implement error message display
        console.error('Error:', message);
    }
};

// Initialize inventory module when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    InventoryModule.init();
}); 