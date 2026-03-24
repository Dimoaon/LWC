import { LightningElement } from 'lwc';

const SORT_OPTIONS = [
    { label: 'Newest to Oldest', value: 'newest' },
    { label: 'Oldest to Newest', value: 'oldest' }
];

const CART_ITEMS = [
    {
        id: 'item-1',
        name: 'Performance Hoodie',
        sku: 'SKU-001',
        unitPrice: 44.56,
        quantity: 1,
        imageLabel: 'IMG',
        createdAt: '2026-03-20T10:30:00Z'
    },
    {
        id: 'item-2',
        name: 'Trail Runner Jacket',
        sku: 'SKU-014',
        unitPrice: 68,
        quantity: 2,
        imageLabel: 'IMG',
        createdAt: '2026-03-22T14:15:00Z'
    }
];

const SUGGESTED_PRODUCTS = [
    {
        id: 'product-1',
        name: 'All Weather Parka',
        sku: 'SKU-120',
        unitPrice: 82.5,
        imageLabel: 'IMG'
    },
    {
        id: 'product-2',
        name: 'Summit Training Tee',
        sku: 'SKU-121',
        unitPrice: 29.5,
        imageLabel: 'IMG'
    },
    {
        id: 'product-3',
        name: 'City Commute Backpack',
        sku: 'SKU-122',
        unitPrice: 74,
        imageLabel: 'IMG'
    }
];

const SHIPPING_AMOUNT = 12;
const TAX_AMOUNT = 18;
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

export default class CartPage extends LightningElement {
    // VARIABLES
    sortOptions = SORT_OPTIONS;
    sortOrder = 'newest';
    cartItems = CART_ITEMS;
    suggestedProducts = SUGGESTED_PRODUCTS;
    isAddProductModalOpen = false;
    productSearchTerm = '';

    // GETTERS
    get cartTitle() {
        return `Cart (${this.cartItems.length} items)`;
    }

    get hasCartItems() {
        return this.cartItems.length > 0;
    }

    get hasSuggestedProducts() {
        return this.filteredSuggestedProducts.length > 0;
    }

    get cartItemRows() {
        let rows = [];

        this.cartItems.forEach((item) => {
            rows.push({
                ...item,
                unitPriceFormatted: this.formatCurrency(item.unitPrice),
                lineTotalFormatted: this.formatCurrency(item.unitPrice * item.quantity)
            });
        });

        rows.sort((firstItem, secondItem) => {
            let firstItemDate = new Date(firstItem.createdAt).getTime();
            let secondItemDate = new Date(secondItem.createdAt).getTime();

            if (this.sortOrder === 'oldest') {
                return firstItemDate - secondItemDate;
            }

            return secondItemDate - firstItemDate;
        });

        return rows;
    }

    get filteredSuggestedProducts() {
        let searchTerm = this.productSearchTerm.trim().toLowerCase();
        let rows = [];

        this.suggestedProducts.forEach((product) => {
            let matchesSearch =
                !searchTerm ||
                product.name.toLowerCase().includes(searchTerm) ||
                product.sku.toLowerCase().includes(searchTerm);

            if (matchesSearch) {
                rows.push({
                    ...product,
                    unitPriceFormatted: this.formatCurrency(product.unitPrice)
                });
            }
        });

        return rows;
    }

    get subtotal() {
        let subtotal = 0;

        this.cartItems.forEach((item) => {
            subtotal += item.unitPrice * item.quantity;
        });

        return subtotal;
    }

    get total() {
        return this.subtotal + SHIPPING_AMOUNT + TAX_AMOUNT;
    }

    get summaryRows() {
        let rows = [];

        [
            {
                id: 'subtotal',
                label: 'Subtotal',
                value: this.formatCurrency(this.subtotal),
                className: 'cart-summary__row'
            },
            {
                id: 'shipping',
                label: 'Shipping',
                value: this.formatCurrency(SHIPPING_AMOUNT),
                className: 'cart-summary__row'
            },
            {
                id: 'tax',
                label: 'Tax',
                value: this.formatCurrency(TAX_AMOUNT),
                className: 'cart-summary__row'
            },
            {
                id: 'total',
                label: 'Total',
                value: this.formatCurrency(this.total),
                className: 'cart-summary__row cart-summary__row--total'
            }
        ].forEach((row) => {
            rows.push(row);
        });

        return rows;
    }

    // LIFECYCLES

    // INIT METHODS

    // HANDLERS
    handleSortChange(event) {
        this.sortOrder = event.detail?.value || event.target.value;
    }

    handleOpenAddProductModal() {
        this.isAddProductModalOpen = true;
        this.productSearchTerm = '';
    }

    handleCloseAddProductModal() {
        this.isAddProductModalOpen = false;
        this.productSearchTerm = '';
    }

    handleProductSearchChange(event) {
        this.productSearchTerm = event.detail?.value || event.target.value || '';
    }

    handleAddSuggestedProduct(event) {
        let productId = event.currentTarget.dataset.id;
        let selectedProduct = null;

        this.suggestedProducts.forEach((product) => {
            if (product.id === productId) {
                selectedProduct = product;
            }
        });

        if (!selectedProduct) {
            return;
        }

        let updatedItems = [];
        let existingItemFound = false;

        this.cartItems.forEach((item) => {
            if (item.sku === selectedProduct.sku) {
                existingItemFound = true;
                updatedItems.push({
                    ...item,
                    quantity: item.quantity < MAX_QUANTITY ? item.quantity + 1 : item.quantity
                });
                return;
            }

            updatedItems.push(item);
        });

        if (!existingItemFound) {
            updatedItems.push({
                id: `item-${Date.now()}`,
                name: selectedProduct.name,
                sku: selectedProduct.sku,
                unitPrice: selectedProduct.unitPrice,
                quantity: 1,
                imageLabel: selectedProduct.imageLabel,
                createdAt: new Date().toISOString()
            });
        }

        this.cartItems = updatedItems;
        this.handleCloseAddProductModal();
    }

    handleIncreaseQuantity(event) {
        let itemId = event.currentTarget.dataset.id;
        let updatedItems = [];

        this.cartItems.forEach((item) => {
            if (item.id === itemId) {
                updatedItems.push({
                    ...item,
                    quantity: item.quantity < MAX_QUANTITY ? item.quantity + 1 : item.quantity
                });
                return;
            }

            updatedItems.push(item);
        });

        this.cartItems = updatedItems;
    }

    handleDecreaseQuantity(event) {
        let itemId = event.currentTarget.dataset.id;
        let updatedItems = [];

        this.cartItems.forEach((item) => {
            if (item.id === itemId) {
                updatedItems.push({
                    ...item,
                    quantity: item.quantity > MIN_QUANTITY ? item.quantity - 1 : item.quantity
                });
                return;
            }

            updatedItems.push(item);
        });

        this.cartItems = updatedItems;
    }

    handleDeleteItem(event) {
        let itemId = event.currentTarget.dataset.id;
        let updatedItems = [];

        this.cartItems.forEach((item) => {
            if (item.id !== itemId) {
                updatedItems.push(item);
            }
        });

        this.cartItems = updatedItems;
    }

    handleClearCart() {
        this.cartItems = [];
    }

    // MAIN METHODS
    formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    }
}
