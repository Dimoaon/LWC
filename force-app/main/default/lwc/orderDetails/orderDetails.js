import { LightningElement, api, track } from 'lwc';

const LOADING_DELAY = 1200;

const CANCELLED_VARIANT = 'cancelled';

const CURRENCY_ISO_CODE = 'USD';

const TAX_RATE_MIN = 0.05;
const TAX_RATE_MAX = 0.12;

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
        brand: 'Visa',
        lastDigits: '4242',
        expires: '04/27',
        isPaid: true
    },
    lineItems: [
        {
            name: 'TrailPro Insulated Bottle 24oz — Pine',
            sku: 'TPB24-PINE',
            quantity: 2,
            lineTotal: 39.98
        },
        {
            name: 'Summit Daypack — Tan',
            sku: 'SDP-TAN',
            quantity: 1,
            lineTotal: 79.99
        },
        {
            name: 'Wilder Camp Mug 12oz — Forest Green',
            sku: 'WCM12-FG',
            quantity: 4,
            lineTotal: 15.00
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
        brand: 'Visa',
        lastDigits: '4242',
        expires: '04/27',
        isPaid: false
    },
    lineItems: [
        {
            name: 'TrailPro Insulated Bottle 24oz — Pine',
            sku: 'TPB24-PINE',
            quantity: 2,
            lineTotal: 39.98
        },
        {
            name: 'Summit Daypack — Tan',
            sku: 'SDP-TAN',
            quantity: 1,
            lineTotal: 79.99
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
        `;

        style.innerText = customCssStyles.replace(/ +(?= )|\n/g, ' ');
        customCssContainer.appendChild(style);
    }

    // MAIN METHODS
    loadOrder() {
        let loadingDelay = this.simulateLoading ? LOADING_DELAY : 0;
        let isCancelled = this.demoVariant === CANCELLED_VARIANT;
        let order = isCancelled ? CANCELLED_ORDER : PROCESSING_ORDER;
        let lineItems = [];
        let subtotal = 0;

        order.lineItems.forEach(lineItem => {
            lineItems.push({
                id: this.generateId(),
                name: lineItem.name,
                sku: lineItem.sku,
                quantity: lineItem.quantity,
                lineTotal: lineItem.lineTotal
            });

            subtotal += lineItem.lineTotal;
        });

        let taxRate = Math.random() * (TAX_RATE_MAX - TAX_RATE_MIN) + TAX_RATE_MIN;
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

        setTimeout(() => {
            this.isLoading = false;
        }, loadingDelay);
    }

    generateId() {
        return Math.random().toString(36).substring(2, 9);
    }
}
