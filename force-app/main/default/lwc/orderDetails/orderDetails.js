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
    state: 60,
    postalCode: 10,
    country: 60,
    phone: 20,
    cardNumber: 16
};

const PHONE_PATTERN = /^[+\s\-\(\)0-9]+$/;
const POSTAL_PATTERN = /^[0-9\-]{4,10}$/;
const CARD_NUMBER_PATTERN = /^[0-9]{16}$/;

const PAID_STATUS = 'paid';
const UNPAID_STATUS = 'unpaid';

const CARD_BRANDS = [
    { code: 'visa', name: 'Visa' },
    { code: 'mastercard', name: 'Mastercard' },
    { code: 'amex', name: 'Amex' },
    { code: 'jcb', name: 'JCB' },
    { code: 'diners', name: 'Diners Club' }
];

//TEST
for (let i = 1; i <= 20; i++) {
    CARD_BRANDS.push({ code: `card${i}`, name: `Card ${i}` });
}

const COUNTRY_OPTIONS = [
    { label: 'United States', value: 'US' },
    { label: 'Canada', value: 'CA' },
    { label: 'Poland', value: 'PL' },
    { label: 'Belarus', value: 'BY' }
];

const STATE_MAP = {
    US: [
        { label: 'California', value: 'CA' },
        { label: 'Florida', value: 'FL' },
        { label: 'Montana', value: 'MT' },
        { label: 'Nevada', value: 'NV' },
        { label: 'Texas', value: 'TX' }
    ],
    CA: [
        { label: 'Alberta', value: 'AB' },
        { label: 'British Columbia', value: 'BC' },
        { label: 'Ontario', value: 'ON' },
        { label: 'Quebec', value: 'QC' }
    ],
    PL: [],
    BY: []
};

const PROCESSING_ORDER = {
    orderNumber: 'SO-10482',
    status: 'Processing',
    shipping: 12.50,
    address: {
        name: 'Acme Outdoors — Receiving',
        street: '500 Timberline Rd',
        city: 'Bozeman',
        stateCode: 'MT',
        postalCode: '59715',
        countryCode: 'US',
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
        city: 'Bozeman',
        stateCode: 'MT',
        postalCode: '59715',
        countryCode: 'US',
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
    @api addressStateLabel = null;
    @api addressPostalCodeLabel = null;
    @api addressCountryLabel = null;
    @api addressPhoneLabel = null;
    @api saveLabel = null;
    @api cancelLabel = null;
    @api closeLabel = null;
    @api phoneValidationMessage = null;
    @api postalCodeValidationMessage = null;
    @api addressRequiredMessage = null;
    @api addressSearchLabel = null;
    @api countryErrorMessage = null;
    @api addressSavedMessage = null;
    @api paymentDetailsTitle = null;
    @api cardLabel = null;
    @api cardTypeLabel = null;
    @api cardNumberLabel = null;
    @api amountLabel = null;
    @api transactionIdLabel = null;
    @api statusLabel = null;
    @api statusPlaceholderLabel = null;
    @api unpaidLabel = null;
    @api cardNumberValidationMessage = null;
    @api paymentSavedMessage = null;
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
    @track cardNumber = '';
    @track transactionId = '';
    @track showAddressForm = false;
    @track showPaymentDetails = false;
    @track showCountryError = false;
    @track cardText = '';
    @track expiresText = '';
    @track addressForm = {};
    @track paymentForm = {};

    maxLength = MAX_LENGTHS;

    // GETTERS
    get phonePattern() {
        return PHONE_PATTERN.source;
    }

    get postalCodePattern() {
        return POSTAL_PATTERN.source;
    }

    get cardNumberPattern() {
        return CARD_NUMBER_PATTERN.source;
    }

    get countryOptions() {
        return COUNTRY_OPTIONS;
    }

    get stateOptions() {
        return STATE_MAP[this.addressForm.countryCode] || [];
    }

    get stateRequired() {
        return this.stateOptions.length > 0;
    }

    get stateDisabled() {
        return this.stateOptions.length === 0;
    }

    get countryName() {
        let result = '';

        if (this.address) {
            COUNTRY_OPTIONS.forEach(item => {
                if (item.value === this.address.countryCode) {
                    result = item.label;
                }
            });
        }

        return result;
    }

    get brandOptions() {
        let result = [];

        CARD_BRANDS.forEach(item => {
            result.push({ label: item.name, value: item.code });
        });

        return result;
    }

    get statusOptions() {
        return [
            { label: this.statusPlaceholderLabel, value: '' },
            { label: this.paidLabel, value: PAID_STATUS },
            { label: this.unpaidLabel, value: UNPAID_STATUS }
        ];
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
            c-order-details .order__header lightning-button button {
                color: #1F4D3D !important;
            }

            c-order-details .order__invoice lightning-button button,
            c-order-details c-modal .modal__footer .slds-button_outline-brand {
                color: #1F4D3D !important;
                border-color: #1F4D3D !important;
            }

            c-order-details .order__invoice lightning-button button {
                padding: 0.25rem 0.75rem;
                background-color: #FFFFFF !important;
            }

            c-order-details c-modal .modal__footer .slds-button_brand {
                color: #FFFFFF !important;
                border-color: #1F4D3D !important;
                background-color: #1F4D3D !important;
            }

            c-order-details .order__header lightning-button button:hover,
            c-order-details .order__header lightning-button button:focus {
                color: #16382C !important;
            }

            c-order-details c-modal .modal__footer .slds-button_brand:hover,
            c-order-details c-modal .modal__footer .slds-button_brand:focus {
                border-color: #16382C !important;
                background-color: #16382C !important;
            }

            c-order-details .order__invoice lightning-button button:hover,
            c-order-details .order__invoice lightning-button button:focus,
            c-order-details c-modal .modal__footer .slds-button_outline-brand:hover,
            c-order-details c-modal .modal__footer .slds-button_outline-brand:focus {
                background-color: #E8F3EE !important;
            }

            c-order-details .modal-form lightning-input input.slds-input,
            c-order-details .modal-form lightning-input-address input.slds-input,
            c-order-details .modal-form lightning-select select.slds-select,
            c-order-details .modal-form lightning-input-address select.slds-select,
            c-order-details .modal-form lightning-input-address .slds-combobox__input,
            c-order-details .modal-form lightning-input-address textarea.slds-textarea {
                min-height: 3rem;
                border-color: #E5E7EB;
                background-color: #FFFFFF !important;
            }

            c-order-details .modal-form lightning-input input.slds-input:focus,
            c-order-details .modal-form lightning-input-address input.slds-input:focus,
            c-order-details .modal-form lightning-select select.slds-select:focus,
            c-order-details .modal-form lightning-input-address select.slds-select:focus,
            c-order-details .modal-form lightning-input-address .slds-combobox__input:focus,
            c-order-details .modal-form lightning-input-address textarea.slds-textarea:focus {
                border-color: #1F4D3D;
            }

            c-order-details .modal-form lightning-input-address textarea.slds-textarea {
                height: 3rem;
                resize: none;
            }

            c-order-details .modal-form lightning-input-address,
            c-order-details .modal-form lightning-input-address fieldset.slds-form-element,
            c-order-details .modal-form lightning-input-address lightning-picklist.slds-form-element,
            c-order-details .modal-form lightning-input-address lightning-lookup-address.slds-form-element {
                margin-bottom: 0;
            }

            c-order-details .modal-form lightning-input-address .slds-dropdown {
                background-color: #FFFFFF !important;
            }

            c-order-details .modal-form lightning-input-address .slds-combobox__input {
                padding-left: 0.75rem !important;
            }

            c-order-details .modal-form lightning-input-address .slds-form-element__row {
                display: none !important;
            }

            c-order-details .modal-form lightning-input-address .slds-form-element__row.slds-grow {
                display: flex !important;
            }

            c-order-details .modal-form lightning-input-address legend.slds-form-element__label {
                display: none !important;
            }
        `;

        style.innerText = customCssStyles.replace(/ +(?= )|\n/g, ' ');
        customCssContainer.appendChild(style);
    }

    // HANDLERS
    handleEditAddress() {
        this.showAddressForm = true;
        this.showPaymentDetails = false;
        this.showCountryError = false;
        this.addressForm = { ...this.address };
        this.template.querySelector('c-modal').open({
            title: this.editAddressTitle,
            closeLabel: this.cancelLabel,
            submitLabel: this.saveLabel
        });
    }

    handleViewPayment() {
        this.showPaymentDetails = true;
        this.showAddressForm = false;
        this.paymentForm = {
            brand: this.paymentBrand,
            cardNumber: this.cardNumber,
            transactionId: this.transactionId,
            status: this.payment.isPaid ? PAID_STATUS : UNPAID_STATUS
        };
        this.template.querySelector('c-modal').open({
            title: this.paymentDetailsTitle,
            closeLabel: this.cancelLabel,
            submitLabel: this.saveLabel
        });
    }

    handleFormChange(event) {
        this.showCountryError = false;

        let name = event.target.name;
        let form = { ...this.addressForm, [name]: event.target.value };

        if (name === 'countryCode') {
            form.stateCode = '';
        }

        this.addressForm = form;
    }

    handleAddressChange(event) {
        let detail = event.detail;
        let countryCode = '';

        COUNTRY_OPTIONS.forEach(item => {
            if (item.label === detail.country) {
                countryCode = item.value;
            }
        });

        if (!countryCode) {
            this.showCountryError = true;
            return;
        }

        this.showCountryError = false;

        let stateCode = '';

        (STATE_MAP[countryCode] || []).forEach(item => {
            if (item.value === detail.province) {
                stateCode = item.value;
            }
        });

        this.addressForm = {
            ...this.addressForm,
            street: detail.street,
            city: detail.city,
            stateCode: stateCode,
            postalCode: detail.postalCode,
            countryCode: countryCode
        };

        setTimeout(() => {
            let fields = [...this.template.querySelectorAll('.modal-form lightning-input, .modal-form lightning-select')];
            fields.forEach(field => {
                field.reportValidity();
            });
        }, 0);
    }

    handlePaymentFormChange(event) {
        this.paymentForm = { ...this.paymentForm, [event.target.name]: event.target.value };
    }

    handleConfirm() {
        if (this.showPaymentDetails) {
            this.savePayment();
        } else {
            this.saveAddress();
        }
    }

    handleModalClose() {
        this.showAddressForm = false;
        this.showPaymentDetails = false;
        this.addressForm = {};
        this.paymentForm = {};
    }

    // MAIN METHODS
    loadOrder() {
        let loadingDelay = this.simulateLoading ? LOADING_DELAY : 0;
        let isCancelled = this.demoVariant === CANCELLED_VARIANT;
        let order = isCancelled ? CANCELLED_ORDER : PROCESSING_ORDER;
        let lineItems = [];
        let subtotal = 0;
        let brand = CARD_BRANDS[Math.floor(Math.random() * CARD_BRANDS.length)];
        let cardNumber = this.generateCardNumber();

        order.lineItems.forEach(lineItem => {
            let quantity = Math.floor(Math.random() * QUANTITY_MAX) + 1;
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

        this.payment = order.payment;
        this.paidDate = order.payment.isPaid ? new Date() : null;
        this.paymentBrand = brand.code;
        this.cardNumber = cardNumber;
        this.cardText = `${brand.name} ${this.cardEndingLabel} ${cardNumber.slice(-4)}`;
        this.expiresText = `${this.expiresPrefixLabel} ${order.payment.expires}`;
        this.transactionId = `TXN-${this.generateId().toUpperCase()}`;

        setTimeout(() => {
            this.isLoading = false;
        }, loadingDelay);
    }

    generateCardNumber() {
        let result = '';

        for (let i = 0; i < 16; i++) {
            result += Math.floor(Math.random() * 10);
        }

        return result;
    }

    generateId() {
        return Math.random().toString(36).substring(2, 9);
    }

    saveAddress() {
        if (!this.validateForm()) {
            return;
        }

        this.address = { ...this.addressForm };
        this.template.querySelector('c-modal').hide();
        Toast.show({ label: this.addressSavedMessage, variant: TOAST_VARIANT_SUCCESS }, this);
    }

    savePayment() {
        let isPaid = this.paymentForm.status === PAID_STATUS;
        let cardNumber = this.paymentForm.cardNumber;
        let brandName = '';

        if (!this.validateForm()) {
            return;
        }

        CARD_BRANDS.forEach(item => {
            if (item.code === this.paymentForm.brand) {
                brandName = item.name;
            }
        });

        this.paymentBrand = this.paymentForm.brand;
        this.cardNumber = cardNumber;
        this.transactionId = this.paymentForm.transactionId;
        this.cardText = `${brandName} ${this.cardEndingLabel} ${cardNumber.slice(-4)}`;
        this.payment = { ...this.payment, isPaid: isPaid };
        this.paidDate = isPaid ? new Date() : null;

        this.template.querySelector('c-modal').hide();
        Toast.show({ label: this.paymentSavedMessage, variant: TOAST_VARIANT_SUCCESS }, this);
    }

    validateForm() {
        let fields = [...this.template.querySelectorAll('.modal-form lightning-input, .modal-form lightning-select')];
        let isValid = true;

        fields.forEach(field => {
            field.reportValidity();
            if (!field.checkValidity()) {
                isValid = false;
            }
        });

        return isValid;
    }
}
