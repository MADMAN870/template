// Customers Management Module

const CustomersModule = {
    // Initialize customers module
    init() {
        this.setupEventListeners();
        this.loadCustomers();
    },

    // Set up event listeners
    setupEventListeners() {
        // Add customer form
        document.querySelector('#addCustomerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddCustomer(e.target);
        });

        // Edit customer form
        document.querySelector('#editCustomerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditCustomer(e.target);
        });

        // View purchase history
        document.querySelectorAll('.view-history').forEach(button => {
            button.addEventListener('click', (e) => {
                const customerId = e.target.dataset.customerId;
                this.showPurchaseHistory(customerId);
            });
        });
    },

    // Load customers
    async loadCustomers() {
        try {
            const customers = await ApiService.customers.getAll();
            this.renderCustomers(customers);
        } catch (error) {
            console.error('Error loading customers:', error);
            this.showError('Failed to load customers');
        }
    },

    // Render customers table
    renderCustomers(customers) {
        const tbody = document.querySelector('#customersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>${customer.totalOrders || 0}</td>
                <td>${Utils.formatCurrency(customer.totalSpent || 0)}</td>
                <td>
                    <button class="btn btn-primary edit-customer" data-customer-id="${customer.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-info view-history" data-customer-id="${customer.id}">
                        <i class="fas fa-history"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Reattach event listeners
        this.setupEventListeners();
    },

    // Handle add customer
    async handleAddCustomer(form) {
        const formData = new FormData(form);
        const customer = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: {
                street: formData.get('street'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode')
            }
        };

        if (!Utils.validateEmail(customer.email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        try {
            await ApiService.customers.create(customer);
            this.showSuccess('Customer added successfully');
            form.reset();
            this.loadCustomers();
        } catch (error) {
            console.error('Error adding customer:', error);
            this.showError('Failed to add customer');
        }
    },

    // Handle edit customer
    async handleEditCustomer(form) {
        const formData = new FormData(form);
        const customerId = formData.get('id');
        const customer = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: {
                street: formData.get('street'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode')
            }
        };

        if (!Utils.validateEmail(customer.email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        try {
            await ApiService.customers.update(customerId, customer);
            this.showSuccess('Customer updated successfully');
            this.loadCustomers();
        } catch (error) {
            console.error('Error updating customer:', error);
            this.showError('Failed to update customer');
        }
    },

    // Show purchase history
    async showPurchaseHistory(customerId) {
        try {
            const [customer, orders] = await Promise.all([
                ApiService.customers.getById(customerId),
                ApiService.orders.getByCustomer(customerId)
            ]);

            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>Purchase History - ${customer.name}</h2>
                    <div class="customer-info">
                        <p><strong>Email:</strong> ${customer.email}</p>
                        <p><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
                        <p><strong>Total Orders:</strong> ${orders.length}</p>
                        <p><strong>Total Spent:</strong> ${Utils.formatCurrency(
                            orders.reduce((sum, order) => sum + order.total, 0)
                        )}</p>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.map(order => `
                                <tr>
                                    <td>${order.id}</td>
                                    <td>${Utils.formatDate(order.date)}</td>
                                    <td>${order.items.length}</td>
                                    <td>${Utils.formatCurrency(order.total)}</td>
                                    <td>
                                        <span class="status-badge status-${order.status.toLowerCase()}">
                                            ${order.status}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            document.body.appendChild(modal);
        } catch (error) {
            console.error('Error showing purchase history:', error);
            this.showError('Failed to load purchase history');
        }
    },

    // Show customer details modal
    async showCustomerDetails(customerId) {
        try {
            const customer = await ApiService.customers.getById(customerId);
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>Customer Details</h2>
                    <div class="customer-details">
                        <div class="detail-group">
                            <label>Name:</label>
                            <span>${customer.name}</span>
                        </div>
                        <div class="detail-group">
                            <label>Email:</label>
                            <span>${customer.email}</span>
                        </div>
                        <div class="detail-group">
                            <label>Phone:</label>
                            <span>${customer.phone || 'N/A'}</span>
                        </div>
                        <div class="detail-group">
                            <label>Address:</label>
                            <span>
                                ${customer.address.street}<br>
                                ${customer.address.city}, ${customer.address.state} ${customer.address.zipCode}
                            </span>
                        </div>
                        <div class="detail-group">
                            <label>Member Since:</label>
                            <span>${Utils.formatDate(customer.createdAt)}</span>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        } catch (error) {
            console.error('Error showing customer details:', error);
            this.showError('Failed to load customer details');
        }
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

// Initialize customers module when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    CustomersModule.init();
}); 