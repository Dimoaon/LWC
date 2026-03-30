import Toast from 'lightning/toast';
import { LightningElement, api, track } from 'lwc';

const CART_ITEMS = [
    {
        id: 'item-1',
        name: 'Performance Hoodie',
        sku: 'SKU-001',
        size: 'M',
        color: 'Black',
        unitPrice: 44.56,
        quantity: 1,
        imageLabel: 'IMG',
        createdAt: '2026-03-20T10:30:00Z'
    },
    {
        id: 'item-2',
        name: 'Trail Runner Jacket',
        sku: 'SKU-014',
        size: 'L',
        color: 'Blue',
        unitPrice: 68,
        quantity: 98,
        imageLabel: 'IMG',
        createdAt: '2026-03-22T14:15:00Z'
    }
];

const SUGGESTED_PRODUCTS = [
    {
        id: 'product-1',
        name: 'All Weather Parka',
        sku: 'SKU-120',
        size: 'XL',
        color: 'Olive',
        quantity: 1,
        unitPrice: 82.5,
        imageLabel: 'IMG'
    },
    {
        id: 'product-2',
        name: 'Summit Training Tee',
        sku: 'SKU-121',
        size: 'M',
        color: 'Gray',
        quantity: 1,
        unitPrice: 29.5,
        imageLabel: 'IMG'
    },
    {
        id: 'product-3',
        name: 'City Commute Backpack',
        sku: 'SKU-122',
        size: 'One Size',
        color: 'Black',
        quantity: 1,
        unitPrice: 74,
        imageLabel: 'IMG'
    }
];

const DEFAULT_CURRENCY_CODE = 'USD';
const DEFAULT_CURRENCY_DISPLAY_AS = 'symbol';
const DEFAULT_CURRENCY_FRACTION_DIGITS = 2;
const DEFAULT_NEWEST_SORT_VALUE = 'newest';
const DEFAULT_OLDEST_SORT_VALUE = 'oldest';
const DEFAULT_MIN_QUANTITY = 1;
const DEFAULT_MAX_QUANTITY = 99;
const DEFAULT_MAX_UNIT_PRICE = 99999;
const DEFAULT_MAX_TEXT_LENGTH = 255;
const INCREASE_QUANTITY_STEP = 1;
const DECREASE_QUANTITY_STEP = -1;
const IMAGE_PLACEHOLDER_FALLBACK = 'IMG';
const ITEM_ID_PREFIX = 'item-';
const PRODUCT_ID_PREFIX = 'product-';
const SUGGESTED_ITEM_INPUT_SELECTOR = '.cart-modal__form lightning-input';
const SUMMARY_ROW_CLASS = 'cart-summary__row';
const TOTAL_SUMMARY_ROW_CLASS = 'cart-summary__row cart-summary__row--total';
const UNIT_PRICE_MAX_ERROR_MESSAGE = 'Unit price must be {max} or less.';
const SORT_OPTIONS = [
    { label: 'Newest to Oldest', value: DEFAULT_NEWEST_SORT_VALUE },
    { label: 'Oldest to Newest', value: DEFAULT_OLDEST_SORT_VALUE }
];
const SIZE_OPTIONS = [
    { label: 'Select size', value: '' },
    { label: 'XS', value: 'XS' },
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
    { label: 'One Size', value: 'One Size' }
];
const COLOR_OPTIONS = [
    { label: 'Select color', value: '' },
    { label: 'Black', value: 'Black' },
    { label: 'Blue', value: 'Blue' },
    { label: 'Gray', value: 'Gray' },
    { label: 'Olive', value: 'Olive' },
    { label: 'White', value: 'White' }
];
const QUANTITY_ACTIONS = {
    increase: 'increase',
    decrease: 'decrease'
};
const QUANTITY_LISTS = {
    cart: 'cart',
    suggested: 'suggested'
};
const SUGGESTED_ITEM_FORM_FIELDS = {
    name: 'name',
    sku: 'sku',
    size: 'size',
    color: 'color',
    unitPrice: 'unitPrice',
    imageUrl: 'imageUrl'
};
const SUMMARY_ROW_IDS = {
    subtotal: 'subtotal',
    shipping: 'shipping',
    tax: 'tax',
    total: 'total'
};
const DEFAULT_SUGGESTED_ITEM_FORM = {
    [SUGGESTED_ITEM_FORM_FIELDS.name]: '',
    [SUGGESTED_ITEM_FORM_FIELDS.sku]: '',
    [SUGGESTED_ITEM_FORM_FIELDS.size]: '',
    [SUGGESTED_ITEM_FORM_FIELDS.color]: '',
    [SUGGESTED_ITEM_FORM_FIELDS.unitPrice]: '',
    [SUGGESTED_ITEM_FORM_FIELDS.imageUrl]: ''
};

export default class CartPage extends LightningElement {
    // VARIABLES
    @api cartTitleLabel = null;
    @api cartItemsCountLabel = null;
    @api clearCartButtonLabel = null;
    @api addProductButtonLabel = null;
    @api sortFieldLabel = null;
    @api skuLabel = null;
    @api sizeLabel = null;
    @api colorLabel = null;
    @api unitPriceLabel = null;
    @api quantityLabel = null;
    @api increaseQuantityButtonLabel = null;
    @api decreaseQuantityButtonLabel = null;
    @api lineTotalLabel = null;
    @api emptyStateTitle = null;
    @api emptyStateText = null;
    @api orderSummaryTitle = null;
    @api totalsHeading = null;
    @api subtotalLabel = null;
    @api shippingLabel = null;
    @api taxLabel = null;
    @api totalLabel = null;
    @api proceedToCheckoutButtonLabel = null;
    @api continueShoppingButtonLabel = null;
    @api addProductModalTitle = null;
    @api addProductModalSubtitle = null;
    @api closeModalButtonLabel = null;
    @api productSearchLabel = null;
    @api addNewItemButtonLabel = null;
    @api addNewItemModalTitle = null;
    @api addNewItemModalSubtitle = null;
    @api productNameLabel = null;
    @api imageUrlLabel = null;
    @api cancelButtonLabel = null;
    @api addToOfferedListButtonLabel = null;
    @api addNewItemDuplicateSkuErrorText = null;
    @api addToCartButtonLabel = null;
    @api noSuggestedProductsText = null;
    @api deleteItemButtonLabel = null;
    @api imagePlaceholderLabel = null;
    @api shippingAmount = null;
    @api taxRate = null;
    @api maxQuantityReachedToastTitle = null;
    @api maxQuantityReachedToastMessage = null;

    sortOptions = SORT_OPTIONS;
    sizeOptions = SIZE_OPTIONS;
    colorOptions = COLOR_OPTIONS;
    currencyCode = DEFAULT_CURRENCY_CODE;
    currencyDisplayAs = DEFAULT_CURRENCY_DISPLAY_AS;
    currencyFractionDigits = DEFAULT_CURRENCY_FRACTION_DIGITS;
    minQuantity = DEFAULT_MIN_QUANTITY;
    maxQuantity = DEFAULT_MAX_QUANTITY;
    maxUnitPrice = DEFAULT_MAX_UNIT_PRICE;
    maxSuggestedItemTextLength = DEFAULT_MAX_TEXT_LENGTH;

    @track isFirstRender = true;
    @track sortOrder = DEFAULT_NEWEST_SORT_VALUE;
    @track cartItems = this.createCartItems();
    @track suggestedProducts = this.createSuggestedProducts();
    @track cartItemRows = [];
    @track filteredSuggestedProducts = [];
    @track summaryRows = [];
    @track isAddProductModalOpen = false;
    @track isAddNewItemView = false;
    @track isSuggestedItemFormValid = false;
    @track productSearchTerm = '';
    @track suggestedItemForm = { ...DEFAULT_SUGGESTED_ITEM_FORM };

    // GETTERS
    get cartTitle() {
        return `${this.cartTitleLabel} (${this.cartItems.length} ${this.cartItemsCountLabel})`;
    }

    get hasCartItems() {
        return this.cartItems.length > 0;
    }

    get hasSuggestedProducts() {
        return this.filteredSuggestedProducts.length > 0;
    }

    get isAddToOfferedListDisabled() {
        return !this.isSuggestedItemFormValid;
    }

    get modalTitle() {
        if (this.isAddNewItemView) {
            return this.addNewItemModalTitle;
        }

        return this.addProductModalTitle;
    }

    get modalSubtitle() {
        if (this.isAddNewItemView) {
            return this.addNewItemModalSubtitle;
        }

        return this.addProductModalSubtitle;
    }

    // LIFECYCLES
    renderedCallback() {
        if (this.isFirstRender) {
            this.isFirstRender = false;
            this.refreshViewData();
        }
    }

    // HANDLERS
    handleSortChange(event) {
        this.sortOrder = event.detail?.value || event.target.value || DEFAULT_NEWEST_SORT_VALUE;
        this.refreshCartViewData();
    }

    handleOpenAddProductModal() {
        this.isAddProductModalOpen = true;
        this.isAddNewItemView = false;
        this.isSuggestedItemFormValid = false;
        this.productSearchTerm = '';
        this.suggestedItemForm = { ...DEFAULT_SUGGESTED_ITEM_FORM };
        this.refreshSuggestedProductsViewData();
    }

    handleCloseAddProductModal() {
        this.isAddProductModalOpen = false;
        this.isAddNewItemView = false;
        this.isSuggestedItemFormValid = false;
        this.productSearchTerm = '';
        this.suggestedItemForm = { ...DEFAULT_SUGGESTED_ITEM_FORM };
        this.refreshSuggestedProductsViewData();
    }

    handleProductSearchChange(event) {
        this.productSearchTerm = event.detail?.value || event.target.value || '';
        this.refreshSuggestedProductsViewData();
    }

    handleOpenAddNewItemView() {
        this.isAddNewItemView = true;
        this.isSuggestedItemFormValid = false;
        this.suggestedItemForm = { ...DEFAULT_SUGGESTED_ITEM_FORM };
    }

    handleCloseAddNewItemView() {
        this.isAddNewItemView = false;
        this.isSuggestedItemFormValid = false;
        this.suggestedItemForm = { ...DEFAULT_SUGGESTED_ITEM_FORM };
    }

    handleSuggestedItemInputChange(event) {
        let fieldName = event.target.name;
        let fieldValue = event.detail?.value || event.target.value || '';

        this.suggestedItemForm = {
            ...this.suggestedItemForm,
            [fieldName]: fieldValue
        };

        this.applySuggestedItemFieldValidity(event.target);
        event.target.reportValidity();
        this.updateSuggestedItemFormValidity();
    }

    handleAddNewSuggestedItem() {
        let productName = this.suggestedItemForm[SUGGESTED_ITEM_FORM_FIELDS.name].trim();
        let sku = this.suggestedItemForm[SUGGESTED_ITEM_FORM_FIELDS.sku].trim();
        let size = this.suggestedItemForm[SUGGESTED_ITEM_FORM_FIELDS.size].trim();
        let color = this.suggestedItemForm[SUGGESTED_ITEM_FORM_FIELDS.color].trim();
        let unitPrice = Number(this.suggestedItemForm[SUGGESTED_ITEM_FORM_FIELDS.unitPrice]);

        if (!this.validateSuggestedItemForm()) {
            return;
        }

        this.suggestedProducts = [
            {
                id: `${PRODUCT_ID_PREFIX}${Date.now()}`,
                name: productName,
                sku,
                size,
                color,
                quantity: this.minQuantity,
                unitPrice,
                imageUrl: this.suggestedItemForm[SUGGESTED_ITEM_FORM_FIELDS.imageUrl].trim(),
                imageLabel: this.imagePlaceholderLabel || IMAGE_PLACEHOLDER_FALLBACK
            },
            ...this.suggestedProducts
        ];
        this.isAddNewItemView = false;
        this.isSuggestedItemFormValid = false;
        this.productSearchTerm = '';
        this.suggestedItemForm = { ...DEFAULT_SUGGESTED_ITEM_FORM };
        this.refreshSuggestedProductsViewData();
    }

    handleAddSuggestedProduct(event) {
        let productId = event.currentTarget.dataset.id;
        let selectedProduct = null;
        let updatedItems = [];
        let existingItemFound = false;
        let isMaxQuantityReached = false;
        let quantityToAdd = 0;

        this.suggestedProducts.forEach((product) => {
            if (product.id === productId) {
                selectedProduct = product;
            }
        });

        if (!selectedProduct) {
            return;
        }

        quantityToAdd = selectedProduct.quantity || this.minQuantity;

        this.cartItems.forEach((item) => {
            if (item.sku === selectedProduct.sku) {
                if (item.quantity >= this.maxQuantity) {
                    isMaxQuantityReached = true;
                    updatedItems.push(item);
                    return;
                }

                existingItemFound = true;
                updatedItems.push({
                    ...item,
                    quantity:
                        item.quantity + quantityToAdd > this.maxQuantity ? this.maxQuantity : item.quantity + quantityToAdd
                });
                return;
            }

            updatedItems.push(item);
        });

        if (isMaxQuantityReached) {
            this.showErrorToast(this.maxQuantityReachedToastTitle, this.maxQuantityReachedToastMessage);
            return;
        }

        if (!existingItemFound) {
            updatedItems.push({
                id: `${ITEM_ID_PREFIX}${Date.now()}`,
                name: selectedProduct.name,
                sku: selectedProduct.sku,
                size: selectedProduct.size,
                color: selectedProduct.color,
                unitPrice: selectedProduct.unitPrice,
                quantity: quantityToAdd,
                imageLabel: selectedProduct.imageLabel || this.imagePlaceholderLabel,
                createdAt: new Date().toISOString()
            });
        }

        this.cartItems = updatedItems;
        this.handleCloseAddProductModal();
        this.refreshCartViewData();
    }

    handleDeleteSuggestedProduct(event) {
        let productId = event.currentTarget.dataset.id;
        let updatedProducts = [];

        this.suggestedProducts.forEach((product) => {
            if (product.id !== productId) {
                updatedProducts.push(product);
            }
        });

        this.suggestedProducts = updatedProducts;
        this.refreshSuggestedProductsViewData();
    }

    handleChangeQuantity(event) {
        let itemId = event.currentTarget.dataset.id;
        let quantityAction = event.currentTarget.dataset.action;
        let quantityList = event.currentTarget.dataset.list;
        let quantityChange = 0;
        let updatedItems = [];

        quantityChange =
            quantityAction === QUANTITY_ACTIONS.increase
                ? INCREASE_QUANTITY_STEP
                : quantityAction === QUANTITY_ACTIONS.decrease
                  ? DECREASE_QUANTITY_STEP
                  : 0;

        if (!quantityChange) {
            return;
        }

        if (quantityList === QUANTITY_LISTS.suggested) {
            this.suggestedProducts.forEach((product) => {
                let nextQuantity = (product.quantity || this.minQuantity) + quantityChange;

                if (product.id === itemId) {
                    updatedItems.push({
                        ...product,
                        quantity:
                            nextQuantity < this.minQuantity
                                ? this.minQuantity
                                : nextQuantity > this.maxQuantity
                                  ? this.maxQuantity
                                  : nextQuantity
                    });
                    return;
                }

                updatedItems.push(product);
            });

            this.suggestedProducts = updatedItems;
            this.refreshSuggestedProductsViewData();
            return;
        }

        this.cartItems.forEach((item) => {
            let nextQuantity = item.quantity + quantityChange;

            if (item.id === itemId) {
                updatedItems.push({
                    ...item,
                    quantity:
                        nextQuantity < this.minQuantity
                            ? this.minQuantity
                            : nextQuantity > this.maxQuantity
                              ? this.maxQuantity
                              : nextQuantity
                });
                return;
            }

            updatedItems.push(item);
        });

        this.cartItems = updatedItems;
        this.refreshCartViewData();
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
        this.refreshCartViewData();
    }

    handleClearCart() {
        this.cartItems = [];
        this.refreshCartViewData();
    }

    // MAIN METHODS
    validateSuggestedItemForm() {
        return this.getSuggestedItemFormValidity(true);
    }

    applySuggestedItemFieldValidity(field) {
        let unitPrice = Number(field.value);
        let isUnitPriceValid = !field.value || unitPrice <= this.maxUnitPrice;
        let sku = field.value ? field.value.trim().toLowerCase() : '';
        let duplicateSkuFound = false;

        if (field.name === SUGGESTED_ITEM_FORM_FIELDS.unitPrice) {
            field.setCustomValidity(
                isUnitPriceValid ? '' : UNIT_PRICE_MAX_ERROR_MESSAGE.replace('{max}', this.maxUnitPrice)
            );
            return;
        }

        if (field.name !== SUGGESTED_ITEM_FORM_FIELDS.sku) {
            field.setCustomValidity('');
            return;
        }

        this.suggestedProducts.forEach((product) => {
            if (product.sku.toLowerCase() === sku) {
                duplicateSkuFound = true;
            }
        });

        field.setCustomValidity(duplicateSkuFound ? this.addNewItemDuplicateSkuErrorText : '');
    }

    updateSuggestedItemFormValidity() {
        this.isSuggestedItemFormValid = this.getSuggestedItemFormValidity(false);
    }

    getSuggestedItemFormValidity(shouldReportValidity) {
        let fields = this.template.querySelectorAll(SUGGESTED_ITEM_INPUT_SELECTOR);

        return [...fields].every((field) => {
            this.applySuggestedItemFieldValidity(field);

            if (shouldReportValidity) {
                field.reportValidity();
            }

            return field.checkValidity();
        });
    }

    refreshViewData() {
        this.refreshCartViewData();
        this.refreshSuggestedProductsViewData();
    }

    refreshCartViewData() {
        this.cartItemRows = this.createCartItemRows();
        this.summaryRows = this.createSummaryRows();
    }

    refreshSuggestedProductsViewData() {
        this.filteredSuggestedProducts = this.createFilteredSuggestedProducts();
    }

    createCartItemRows() {
        let rows = [];

        this.cartItems.forEach((item) => {
            rows.push({
                ...item,
                lineTotal: item.unitPrice * item.quantity
            });
        });

        rows.sort((firstItem, secondItem) => {
            let firstItemDate = new Date(firstItem.createdAt).getTime();
            let secondItemDate = new Date(secondItem.createdAt).getTime();

            if (this.sortOrder === DEFAULT_OLDEST_SORT_VALUE) {
                return firstItemDate - secondItemDate;
            }

            return secondItemDate - firstItemDate;
        });

        return rows;
    }

    createFilteredSuggestedProducts() {
        let searchTerm = this.productSearchTerm.trim().toLowerCase();
        let rows = [];

        this.suggestedProducts.forEach((product) => {
            let matchesSearch =
                !searchTerm ||
                product.name.toLowerCase().includes(searchTerm) ||
                product.sku.toLowerCase().includes(searchTerm);

            if (matchesSearch) {
                rows.push({
                    ...product
                });
            }
        });

        return rows;
    }

    createSummaryRows() {
        let rows = [];
        let subtotal = this.getCartSubtotal();
        let shippingAmount = Number(this.shippingAmount);
        let taxAmount = this.getCartTaxAmount(subtotal);
        let total = subtotal + shippingAmount + taxAmount;

        rows.push({
            id: SUMMARY_ROW_IDS.subtotal,
            label: this.subtotalLabel,
            value: subtotal,
            className: SUMMARY_ROW_CLASS
        });

        rows.push({
            id: SUMMARY_ROW_IDS.shipping,
            label: this.shippingLabel,
            value: shippingAmount,
            className: SUMMARY_ROW_CLASS
        });

        rows.push({
            id: SUMMARY_ROW_IDS.tax,
            label: this.taxLabel,
            value: taxAmount,
            className: SUMMARY_ROW_CLASS
        });

        rows.push({
            id: SUMMARY_ROW_IDS.total,
            label: this.totalLabel,
            value: total,
            className: TOTAL_SUMMARY_ROW_CLASS
        });

        return rows;
    }

    getCartSubtotal() {
        let subtotal = 0;

        this.cartItems.forEach((item) => {
            subtotal += item.unitPrice * item.quantity;
        });

        return subtotal;
    }

    getCartTaxAmount(subtotal) {
        let taxRate = Number(this.taxRate);

        return subtotal * (taxRate / 100);
    }

    createCartItems() {
        let items = [];

        CART_ITEMS.forEach((item) => {
            items.push({
                ...item,
                imageLabel: item.imageLabel || this.imagePlaceholderLabel || IMAGE_PLACEHOLDER_FALLBACK
            });
        });

        return items;
    }

    createSuggestedProducts() {
        let products = [];

        SUGGESTED_PRODUCTS.forEach((product) => {
            products.push({
                ...product,
                quantity: product.quantity || this.minQuantity,
                imageLabel: product.imageLabel || this.imagePlaceholderLabel || IMAGE_PLACEHOLDER_FALLBACK
            });
        });

        return products;
    }

    showErrorToast(label, message) {
        Toast.show(
            {
                label,
                message,
                variant: 'error'
            },
            this
        );
    }
}
