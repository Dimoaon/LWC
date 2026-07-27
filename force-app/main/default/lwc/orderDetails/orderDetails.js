import { LightningElement, api, track } from 'lwc';
import Toast from 'lightning/toast';

const TOAST_VARIANT_SUCCESS = 'success';

const LOADING_DELAY = 1200;

const CANCELLED_VARIANT = 'cancelled';

const CURRENCY_ISO_CODE = 'USD';

const QUANTITY_MAX = 100;
const UNIT_PRICE_MAX = 150;

const MAX_LENGTHS = {
    name: 80,
    street: 120,
    city: 60,
    country: 60,
    phone: 20
};

const PHONE_PATTERN = /^[+\s\-\(\)0-9]+$/;

const CARD_BRANDS = [
    { code: 'visa', name: 'Visa' },
    { code: 'mastercard', name: 'Mastercard' },
    { code: 'amex', name: 'Amex' },
    { code: 'jcb', name: 'JCB' },
    { code: 'diners', name: 'Diners Club' }
];

const PROCESSING_ORDER = {
    orderNumber: 'SO-10482',
    status: 'Processing',
    shipping: 12.50,
    address: {
        name: 'Acme Outdoors — Receiving',
        street: '500 Timberline Rd',
        city: 'Bozeman, MT 59715',
        country: 'United States',
        phone: '(406) 555-0186'
    },
    payment: {
        expires: '04/27',
        isPaid: true
    },
    lineItems: [
        {
            name: 'TrailPro Insulated Bottle 24oz — Pine',
            sku: 'TPB24-PINE'
        },
        {
            name: 'Summit Daypack — Tan',
            sku: 'SDP-TAN'
        },
        {
            name: 'Wilder Camp Mug 12oz — Forest Green',
            sku: 'WCM12-FG'
        }
    ]
};

const CANCELLED_ORDER = {
    orderNumber: 'SO-10491',
    status: 'Cancelled',
    shipping: 12.50,
    address: {
        name: 'Acme Outdoors — Receiving',
        street: '500 Timberline Rd',
        city: 'Bozeman, MT 59715',
        country: 'United States',
        phone: '(406) 555-0186'
    },
    payment: {
        expires: '04/27',
        isPaid: false
    },
    lineItems: [
        {
            name: 'TrailPro Insulated Bottle 24oz — Pine',
            sku: 'TPB24-PINE'
        },
        {
            name: 'Summit Daypack — Tan',
            sku: 'SDP-TAN'
        }
    ]
};

export default class OrderDetails extends LightningElement {

    // VARIABLES
    @api loadingLabel = null;
    @api backToOrdersLabel = null;
    @api orderLabel = null;
    @api placedOnLabel = null;
    @api placedStepLabel = null;
    @api processingStepLabel = null;
    @api shippedStepLabel = null;
    @api deliveredStepLabel = null;
    @api inProgressLabel = null;
    @api pendingLabel = null;
    @api cancelledTitle = null;
    @api cancelledMessage = null;
    @api orderItemsTitle = null;
    @api skuLabel = null;
    @api quantityLabel = null;
    @api priceLabel = null;
    @api downloadInvoiceLabel = null;
    @api orderSummaryTitle = null;
    @api subtotalLabel = null;
    @api shippingLabel = null;
    @api taxLabel = null;
    @api totalLabel = null;
    @api shippingAddressLabel = null;
    @api editLabel = null;
    @api paymentMethodLabel = null;
    @api paidLabel = null;
    @api viewPaymentDetailsLabel = null;
    @api paidInFullLabel = null;
    @api cardEndingLabel = null;
    @api expiresPrefixLabel = null;
    @api editAddressTitle = null;
    @api addressNameLabel = null;
    @api addressStreetLabel = null;
    @api addressCityLabel = null;
    @api addressCountryLabel = null;
    @api addressPhoneLabel = null;
    @api saveLabel = null;
    @api cancelLabel = null;
    @api phoneValidationMessage = null;
    @api addressSavedMessage = null;
    @api demoVariant = null;
    @api simulateLoading = false;

    @track isFirstRender = true;
    @track isLoading = true;
    @track orderTitle = '';
    @track placedDate = null;
    @track status = null;
    @track cancelledDate = null;
    @track currencyIsoCode = CURRENCY_ISO_CODE;
    @track lineItems = [];
    @track subtotal = null;
    @track shipping = null;
    @track tax = null;
    @track taxRate = null;
    @track total = null;
    @track address = null;
    @track payment = null;
    @track paidDate = null;
    @track paymentBrand = null;
    @track cardText = '';
    @track expiresText = '';
    @track addressForm = {};

    maxLength = MAX_LENGTHS;

    // GETTERS
    get phonePattern() {
        return PHONE_PATTERN.source;
    }

    // LIFECYCLES
    connectedCallback() {
        this.loadOrder();
    }

    renderedCallback() {
        if (this.isFirstRender) {
            this.isFirstRender = false;
            this.addCustomCssStyles();
        }
    }

    // INIT METHODS
    addCustomCssStyles() {
        let customCssContainer = this.template.querySelector('.custom-css-container');

        if (!customCssContainer || customCssContainer.childElementCount > 0) {
            return;
        }

        let style = document.createElement('style');

        let customCssStyles = `
            c-order-details .order__header lightning-button button,
            c-order-details .order__header lightning-button button:hover,
            c-order-details .order__header lightning-button button:focus {
                color: #1F4D3D;
            }

            c-order-details .order__invoice lightning-button button,
            c-order-details .order__invoice lightning-button button:hover,
            c-order-details .order__invoice lightning-button button:focus {
                padding: 0.25rem 0.75rem;
                color: #1F4D3D;
                border-color: #1F4D3D;
            }

            c-order-details .address-form lightning-input input.slds-input {
                min-height: 3rem;
                border-color: #E5E7EB;
            }

            c-order-details .address-form lightning-input input.slds-input:focus {
                border-color: #1F4D3D;
            }
        `;

        style.innerText = customCssStyles.replace(/ +(?= )|\n/g, ' ');
        customCssContainer.appendChild(style);
    }

    // HANDLERS
    handleEditAddress() {
        this.addressForm = { ...this.address };
        this.template.querySelector('c-modal').open({
            title: this.editAddressTitle,
            closeLabel: this.cancelLabel,
            submitLabel: this.saveLabel
        });
    }

    handleFormChange(event) {
        this.addressForm = { ...this.addressForm, [event.target.name]: event.target.value };
    }

    handleSaveAddress() {
        if (!this.validateForm()) {
            return;
        }

        this.address = { ...this.addressForm };
        this.template.querySelector('c-modal').hide();
        Toast.show({ label: this.addressSavedMessage, variant: TOAST_VARIANT_SUCCESS }, this);
    }

    handleModalClose() {
        this.addressForm = {};
    }

    // MAIN METHODS
    loadOrder() {
        let loadingDelay = this.simulateLoading ? LOADING_DELAY : 0;
        let isCancelled = this.demoVariant === CANCELLED_VARIANT;
        let order = isCancelled ? CANCELLED_ORDER : PROCESSING_ORDER;
        let lineItems = [];
        let subtotal = 0;

        order.lineItems.forEach(lineItem => {
            let quantity = Math.floor(Math.random() * (QUANTITY_MAX + 1));
            let lineTotal = quantity * Math.random() * UNIT_PRICE_MAX;

            lineItems.push({
                id: this.generateId(),
                name: lineItem.name,
                sku: lineItem.sku,
                quantity: quantity,
                lineTotal: lineTotal
            });

            subtotal += lineTotal;
        });

        let taxRate = Math.random();
        let tax = subtotal * taxRate;

        this.orderTitle = `${this.orderLabel} #${order.orderNumber}`;
        this.status = order.status;
        this.placedDate = new Date();
        this.cancelledDate = isCancelled ? new Date() : null;
        this.lineItems = lineItems;
        this.subtotal = subtotal;
        this.shipping = order.shipping;
        this.tax = tax;
        this.taxRate = taxRate;
        this.total = subtotal + order.shipping + tax;
        this.address = order.address;
        let brand = CARD_BRANDS[Math.floor(Math.random() * CARD_BRANDS.length)];
        let lastDigits = String(Math.floor(1000 + Math.random() * 9000));

        this.payment = order.payment;
        this.paidDate = order.payment.isPaid ? new Date() : null;
        this.paymentBrand = brand.code;
        this.cardText = `${brand.name} ${this.cardEndingLabel} ${lastDigits}`;
        this.expiresText = `${this.expiresPrefixLabel} ${order.payment.expires}`;

        setTimeout(() => {
            this.isLoading = false;
        }, loadingDelay);
    }

    generateId() {
        return Math.random().toString(36).substring(2, 9);
    }

    validateForm() {
        let inputs = [...this.template.querySelectorAll('.address-form lightning-input')];
        let isValid = true;

        inputs.forEach(input => {
            input.reportValidity();
            if (!input.checkValidity()) {
                isValid = false;
            }
        });

        return isValid;
    }
}
