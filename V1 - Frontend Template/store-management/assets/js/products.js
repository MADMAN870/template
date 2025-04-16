// Products Management Module

const ProductsModule = {
    // Initialize products module
    init() {
        this.setupEventListeners();
        this.loadProducts();
    },

    // Set up event listeners
    setupEventListeners() {
        // Add product form
        document.querySelector('#addProductForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddProduct(e.target);
        });

        // Edit product form
        document.querySelector('#editProductForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditProduct(e.target);
        });

        // Delete product button
        document.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.handleDeleteProduct(productId);
            });
        });

        // Update stock button
        document.querySelectorAll('.update-stock').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.showUpdateStockModal(productId);
            });
        });
    },

    // Load products
    async loadProducts() {
        try {
            const products = await ApiService.products.getAll();
            this.renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Failed to load products');
        }
    },

    // Render products table
    renderProducts(products) {
        const tbody = document.querySelector('#productsTable tbody');
        if (!tbody) return;

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${Utils.formatCurrency(product.price)}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="btn btn-primary edit-product" data-product-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger delete-product" data-product-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-warning update-stock" data-product-id="${product.id}">
                        <i class="fas fa-boxes"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Reattach event listeners
        this.setupEventListeners();
    },

    // Handle add product
    async handleAddProduct(form) {
        const formData = new FormData(form);
        const product = {
            name: formData.get('name'),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            description: formData.get('description'),
            stock: parseInt(formData.get('stock')),
            sku: formData.get('sku')
        };

        try {
            await ApiService.products.create(product);
            this.showSuccess('Product added successfully');
            form.reset();
            this.loadProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            this.showError('Failed to add product');
        }
    },

    // Handle edit product
    async handleEditProduct(form) {
        const formData = new FormData(form);
        const productId = formData.get('id');
        const product = {
            name: formData.get('name'),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            description: formData.get('description'),
            stock: parseInt(formData.get('stock')),
            sku: formData.get('sku')
        };

        try {
            await ApiService.products.update(productId, product);
            this.showSuccess('Product updated successfully');
            this.loadProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            this.showError('Failed to update product');
        }
    },

    // Handle delete product
    async handleDeleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await ApiService.products.delete(productId);
                this.showSuccess('Product deleted successfully');
                this.loadProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                this.showError('Failed to delete product');
            }
        }
    },

    // Show update stock modal
    async showUpdateStockModal(productId) {
        try {
            const product = await ApiService.products.getById(productId);
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>Update Stock</h2>
                    <form id="updateStockForm">
                        <input type="hidden" name="productId" value="${product.id}">
                        <div class="form-group">
                            <label class="form-label">Current Stock</label>
                            <input type="number" class="form-control" value="${product.stock}" disabled>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Adjustment</label>
                            <input type="number" class="form-control" name="adjustment" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Reason</label>
                            <select class="form-control" name="reason" required>
                                <option value="restock">Restock</option>
                                <option value="damage">Damage</option>
                                <option value="return">Return</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-control" name="notes"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Update Stock</button>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);
            modal.querySelector('#updateStockForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpdateStock(e.target);
                modal.remove();
            });
        } catch (error) {
            console.error('Error showing update stock modal:', error);
            this.showError('Failed to load product details');
        }
    },

    // Handle update stock
    async handleUpdateStock(form) {
        const formData = new FormData(form);
        const productId = formData.get('productId');
        const adjustment = parseInt(formData.get('adjustment'));
        const reason = formData.get('reason');
        const notes = formData.get('notes');

        try {
            await ApiService.inventory.updateStock(productId, adjustment);
            this.showSuccess('Stock updated successfully');
            this.loadProducts();
        } catch (error) {
            console.error('Error updating stock:', error);
            this.showError('Failed to update stock');
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

// Initialize products module when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ProductsModule.init();
}); 