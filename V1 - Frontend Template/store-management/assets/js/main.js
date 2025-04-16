// Store Management System - Main JavaScript File

// Global state management
const StoreState = {
    products: [],
    categories: [],
    customers: [],
    orders: [],
    inventory: [],
    currentUser: null,
    notifications: []
};

// Utility Functions
const Utils = {
    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Format date
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Generate unique ID
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Validate email
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
};

// API Service
const ApiService = {
    // Base URL for API endpoints
    baseUrl: 'http://localhost:3000/api',

    // Generic fetch function
    async fetch(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Product endpoints
    products: {
        async getAll() {
            return await ApiService.fetch('/products');
        },
        async getById(id) {
            return await ApiService.fetch(`/products/${id}`);
        },
        async create(product) {
            return await ApiService.fetch('/products', {
                method: 'POST',
                body: JSON.stringify(product)
            });
        },
        async update(id, product) {
            return await ApiService.fetch(`/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(product)
            });
        },
        async delete(id) {
            return await ApiService.fetch(`/products/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // Category endpoints
    categories: {
        async getAll() {
            return await ApiService.fetch('/categories');
        },
        async create(category) {
            return await ApiService.fetch('/categories', {
                method: 'POST',
                body: JSON.stringify(category)
            });
        }
    },

    // Customer endpoints
    customers: {
        async getAll() {
            return await ApiService.fetch('/customers');
        },
        async getById(id) {
            return await ApiService.fetch(`/customers/${id}`);
        }
    },

    // Order endpoints
    orders: {
        async getAll() {
            return await ApiService.fetch('/orders');
        },
        async create(order) {
            return await ApiService.fetch('/orders', {
                method: 'POST',
                body: JSON.stringify(order)
            });
        }
    },

    // Inventory endpoints
    inventory: {
        async getAll() {
            return await ApiService.fetch('/inventory');
        },
        async updateStock(productId, quantity) {
            return await ApiService.fetch(`/inventory/${productId}/stock`, {
                method: 'PUT',
                body: JSON.stringify({ quantity })
            });
        }
    }
};

// UI Components
const UI = {
    // Initialize the application
    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.updateNotificationBadge();
    },

    // Set up event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link.getAttribute('href'));
            });
        });

        // Search
        document.querySelector('.search-container button').addEventListener('click', () => {
            this.handleSearch();
        });

        // Notifications
        document.querySelector('.notifications').addEventListener('click', () => {
            this.showNotifications();
        });
    },

    // Handle navigation
    handleNavigation(href) {
        const section = document.querySelector(href);
        if (section) {
            document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
            section.classList.add('active');
            document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
            document.querySelector(`.sidebar-nav a[href="${href}"]`).parentElement.classList.add('active');
        }
    },

    // Handle search
    handleSearch() {
        const searchQuery = document.querySelector('.search-container input').value;
        if (searchQuery.trim()) {
            // Implement search functionality
            console.log('Searching for:', searchQuery);
        }
    },

    // Show notifications
    showNotifications() {
        // Implement notification display
        console.log('Showing notifications');
    },

    // Update notification badge
    updateNotificationBadge() {
        const badge = document.querySelector('.badge');
        badge.textContent = StoreState.notifications.length;
    },

    // Load initial data
    async loadInitialData() {
        try {
            const [products, categories, customers, orders, inventory] = await Promise.all([
                ApiService.products.getAll(),
                ApiService.categories.getAll(),
                ApiService.customers.getAll(),
                ApiService.orders.getAll(),
                ApiService.inventory.getAll()
            ]);

            StoreState.products = products;
            StoreState.categories = categories;
            StoreState.customers = customers;
            StoreState.orders = orders;
            StoreState.inventory = inventory;

            this.updateDashboardStats();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    },

    // Update dashboard statistics
    updateDashboardStats() {
        const stats = {
            totalProducts: StoreState.products.length,
            totalCustomers: StoreState.customers.length,
            totalOrders: StoreState.orders.length,
            totalRevenue: StoreState.orders.reduce((sum, order) => sum + order.total, 0)
        };

        document.querySelector('.stat-value:nth-child(1)').textContent = stats.totalProducts;
        document.querySelector('.stat-value:nth-child(2)').textContent = stats.totalCustomers;
        document.querySelector('.stat-value:nth-child(3)').textContent = stats.totalOrders;
        document.querySelector('.stat-value:nth-child(4)').textContent = Utils.formatCurrency(stats.totalRevenue);
    }
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});

// DOM Elements
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');
const sidebarToggle = document.querySelector('.sidebar-toggle');
const searchInput = document.querySelector('.search-container input');
const notificationBell = document.querySelector('.notifications');

// Toggle Sidebar
function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
}

// Search Functionality
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    // Implement search logic here
    console.log('Searching for:', searchTerm);
}

// Notification Handling
function showNotifications() {
    // Implement notification dropdown
    console.log('Showing notifications');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize any necessary components
    console.log('Store Management System initialized');
});

// Data Management
class StoreManager {
    constructor() {
        this.products = [];
        this.customers = [];
        this.orders = [];
        this.categories = [];
    }

    // Product Management
    addProduct(product) {
        this.products.push(product);
        this.saveToLocalStorage('products');
    }

    updateProduct(id, updatedProduct) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...updatedProduct };
            this.saveToLocalStorage('products');
        }
    }

    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.saveToLocalStorage('products');
    }

    // Customer Management
    addCustomer(customer) {
        this.customers.push(customer);
        this.saveToLocalStorage('customers');
    }

    updateCustomer(id, updatedCustomer) {
        const index = this.customers.findIndex(c => c.id === id);
        if (index !== -1) {
            this.customers[index] = { ...this.customers[index], ...updatedCustomer };
            this.saveToLocalStorage('customers');
        }
    }

    // Order Management
    createOrder(order) {
        this.orders.push(order);
        this.saveToLocalStorage('orders');
    }

    updateOrderStatus(id, status) {
        const index = this.orders.findIndex(o => o.id === id);
        if (index !== -1) {
            this.orders[index].status = status;
            this.saveToLocalStorage('orders');
        }
    }

    // Category Management
    addCategory(category) {
        this.categories.push(category);
        this.saveToLocalStorage('categories');
    }

    // Local Storage Management
    saveToLocalStorage(key) {
        localStorage.setItem(key, JSON.stringify(this[key]));
    }

    loadFromLocalStorage(key) {
        const data = localStorage.getItem(key);
        if (data) {
            this[key] = JSON.parse(data);
        }
    }
}

// Initialize Store Manager
const storeManager = new StoreManager();

// Load initial data
storeManager.loadFromLocalStorage('products');
storeManager.loadFromLocalStorage('customers');
storeManager.loadFromLocalStorage('orders');
storeManager.loadFromLocalStorage('categories');

// Export for use in other modules
window.storeManager = storeManager; 