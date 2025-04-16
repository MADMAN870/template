// Orders Management Module

const OrdersModule = {
    // Initialize orders module
    init() {
        this.setupEventListeners();
        this.loadOrders();
    },

    // Set up event listeners
    setupEventListeners() {
        // Create order form
        document.querySelector('#createOrderForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateOrder(e.target);
        });

        // Update order status
        document.querySelectorAll('.update-status').forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                this.showUpdateStatusModal(orderId);
            });
        });

        // View order details
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                this.showOrderDetails(orderId);
            });
        });
    },

    // Load orders
    async loadOrders() {
        try {
            const orders = await ApiService.orders.getAll();
            this.renderOrders(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showError('Failed to load orders');
        }
    },

    // Render orders table
    renderOrders(orders) {
        const tbody = document.querySelector('#ordersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.customerName}</td>
                <td>${Utils.formatDate(order.date)}</td>
                <td>${order.items.length}</td>
                <td>${Utils.formatCurrency(order.total)}</td>
                <td>
                    <span class="status-badge status-${order.status.toLowerCase()}">
                        ${order.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-primary view-details" data-order-id="${order.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-warning update-status" data-order-id="${order.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Reattach event listeners
        this.setupEventListeners();
    },

    // Handle create order
    async handleCreateOrder(form) {
        const formData = new FormData(form);
        const order = {
            customerId: formData.get('customerId'),
            items: JSON.parse(formData.get('items')),
            shippingAddress: {
                street: formData.get('shippingStreet'),
                city: formData.get('shippingCity'),
                state: formData.get('shippingState'),
                zipCode: formData.get('shippingZipCode')
            },
            paymentMethod: formData.get('paymentMethod'),
            notes: formData.get('notes')
        };

        try {
            await ApiService.orders.create(order);
            this.showSuccess('Order created successfully');
            form.reset();
            this.loadOrders();
        } catch (error) {
            console.error('Error creating order:', error);
            this.showError('Failed to create order');
        }
    },

    // Show update status modal
    async showUpdateStatusModal(orderId) {
        try {
            const order = await ApiService.orders.getById(orderId);
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>Update Order Status</h2>
                    <form id="updateStatusForm">
                        <input type="hidden" name="orderId" value="${order.id}">
                        <div class="form-group">
                            <label class="form-label">Current Status</label>
                            <input type="text" class="form-control" value="${order.status}" disabled>
                        </div>
                        <div class="form-group">
                            <label class="form-label">New Status</label>
                            <select class="form-control" name="status" required>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-control" name="notes"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Update Status</button>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);
            modal.querySelector('#updateStatusForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpdateStatus(e.target);
                modal.remove();
            });
        } catch (error) {
            console.error('Error showing update status modal:', error);
            this.showError('Failed to load order details');
        }
    },

    // Handle update status
    async handleUpdateStatus(form) {
        const formData = new FormData(form);
        const orderId = formData.get('orderId');
        const status = formData.get('status');
        const notes = formData.get('notes');

        try {
            await ApiService.orders.updateStatus(orderId, { status, notes });
            this.showSuccess('Order status updated successfully');
            this.loadOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            this.showError('Failed to update order status');
        }
    },

    // Show order details
    async showOrderDetails(orderId) {
        try {
            const order = await ApiService.orders.getById(orderId);
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>Order Details #${order.id}</h2>
                    <div class="order-info">
                        <div class="info-group">
                            <h3>Customer Information</h3>
                            <p><strong>Name:</strong> ${order.customerName}</p>
                            <p><strong>Email:</strong> ${order.customerEmail}</p>
                            <p><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
                        </div>
                        <div class="info-group">
                            <h3>Shipping Address</h3>
                            <p>
                                ${order.shippingAddress.street}<br>
                                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
                            </p>
                        </div>
                        <div class="info-group">
                            <h3>Order Summary</h3>
                            <p><strong>Date:</strong> ${Utils.formatDate(order.date)}</p>
                            <p><strong>Status:</strong> 
                                <span class="status-badge status-${order.status.toLowerCase()}">
                                    ${order.status}
                                </span>
                            </p>
                            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                        </div>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${Utils.formatCurrency(item.price)}</td>
                                    <td>${item.quantity}</td>
                                    <td>${Utils.formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3"><strong>Subtotal</strong></td>
                                <td>${Utils.formatCurrency(order.subtotal)}</td>
                            </tr>
                            <tr>
                                <td colspan="3"><strong>Shipping</strong></td>
                                <td>${Utils.formatCurrency(order.shipping)}</td>
                            </tr>
                            <tr>
                                <td colspan="3"><strong>Tax</strong></td>
                                <td>${Utils.formatCurrency(order.tax)}</td>
                            </tr>
                            <tr>
                                <td colspan="3"><strong>Total</strong></td>
                                <td>${Utils.formatCurrency(order.total)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;

            document.body.appendChild(modal);
        } catch (error) {
            console.error('Error showing order details:', error);
            this.showError('Failed to load order details');
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

// Initialize orders module when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    OrdersModule.init();
}); 