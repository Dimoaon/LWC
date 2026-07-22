import { LightningElement, api, track } from 'lwc';

const STEP_NAMES = ['Placed', 'Processing', 'Shipped', 'Delivered'];

const CANCELLED_STATUS = 'Cancelled';

export default class OrderStatusTimeline extends LightningElement {

    // VARIABLES
    @api status = null;
    @api placedDate = null;
    @api cancelledDate = null;
    @api cancelledTitle = null;
    @api cancelledMessage = null;
    @api placedLabel = null;
    @api processingLabel = null;
    @api shippedLabel = null;
    @api deliveredLabel = null;
    @api inProgressLabel = null;
    @api pendingLabel = null;

    @track isFirstRender = true;
    @track isCancelled = false;

    @track placedClass = '';
    @track processingClass = '';
    @track shippedClass = '';
    @track deliveredClass = '';

    @track processingSubLabel = '';
    @track shippedSubLabel = '';
    @track deliveredSubLabel = '';

    // LIFECYCLES
    connectedCallback() {
        this.buildSteps();
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
            c-order-status-timeline .cancel-banner__icon svg.slds-icon {
                fill: #991B1B;
            }

            c-order-status-timeline .timeline__step_completed .timeline__marker svg.slds-icon,
            c-order-status-timeline .timeline__step_current .timeline__marker svg.slds-icon {
                fill: #FFFFFF;
            }
        `;

        style.innerText = customCssStyles.replace(/ +(?= )|\n/g, ' ');
        customCssContainer.appendChild(style);
    }

    // MAIN METHODS
    buildSteps() {
        this.isCancelled = this.status === CANCELLED_STATUS;

        if (this.isCancelled) {
            return;
        }

        let currentIndex = STEP_NAMES.indexOf(this.status);

        this.placedClass = this.getStepClass(0, currentIndex);
        this.processingClass = this.getStepClass(1, currentIndex);
        this.shippedClass = this.getStepClass(2, currentIndex);
        this.deliveredClass = this.getStepClass(3, currentIndex);

        this.processingSubLabel = this.getStepSubLabel(1, currentIndex);
        this.shippedSubLabel = this.getStepSubLabel(2, currentIndex);
        this.deliveredSubLabel = this.getStepSubLabel(3, currentIndex);
    }

    getStepClass(index, currentIndex) {
        if (index < currentIndex) {
            return 'timeline__step timeline__step_completed';
        }

        if (index === currentIndex) {
            return 'timeline__step timeline__step_current';
        }

        return 'timeline__step';
    }

    getStepSubLabel(index, currentIndex) {
        if (index < currentIndex) {
            return '';
        }

        if (index === currentIndex) {
            return this.inProgressLabel;
        }

        return this.pendingLabel;
    }
}
