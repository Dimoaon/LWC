import { LightningElement, api, track } from 'lwc';

const EDIT_ADDRESS_EVENT = 'editaddress';

export default class OrderSummaryPanel extends LightningElement {

    // VARIABLES
    @api subtotal = null;
    @api shipping = null;
    @api tax = null;
    @api taxRate = null;
    @api total = null;
    @api currencyIsoCode = null;
    @api address = null;
    @api summaryTitle = null;
    @api subtotalLabel = null;
    @api shippingLabel = null;
    @api taxLabel = null;
    @api totalLabel = null;
    @api shippingAddressLabel = null;
    @api editLabel = null;
    @api payment = null;
    @api paymentBrand = null;
    @api cardText = null;
    @api expiresText = null;
    @api paidDate = null;
    @api paymentMethodLabel = null;
    @api paidLabel = null;
    @api viewPaymentDetailsLabel = null;
    @api paidInFullLabel = null;

    @track isFirstRender = true;

    // GETTERS
    get isVisa() {
        return this.paymentBrand === 'visa';
    }

    get isMastercard() {
        return this.paymentBrand === 'mastercard';
    }

    get isAmex() {
        return this.paymentBrand === 'amex';
    }

    get isJcb() {
        return this.paymentBrand === 'jcb';
    }

    get isDiners() {
        return this.paymentBrand === 'diners';
    }

    // LIFECYCLES
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
            c-order-summary-panel .summary__action-icon svg.slds-icon {
                fill: #D97757;
            }
        `;

        style.innerText = customCssStyles.replace(/ +(?= )|\n/g, ' ');
        customCssContainer.appendChild(style);
    }

    // HANDLERS
    handleEditClick() {
        this.dispatchEvent(new CustomEvent(EDIT_ADDRESS_EVENT));
    }
}