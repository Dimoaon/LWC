import { LightningElement, api, track } from 'lwc';

const CLOSE_EVENT = 'close';
const CONFIRM_EVENT = 'confirm';
const KEY_ESCAPE = 'Escape';
const KEY_ENTER = 'Enter';

export default class Modal extends LightningElement {

    // VARIABLES
    @track show = false;
    @track detail = null;
    @track isFirstRender = true;

    // GETTERS
    get title() {
        return this.detail ? this.detail.title : null;
    }

    get closeLabel() {
        return this.detail ? this.detail.closeLabel : null;
    }

    get submitLabel() {
        return this.detail ? this.detail.submitLabel : null;
    }

    get showFooter() {
        return !!this.closeLabel || !!this.submitLabel;
    }

    get footerClass() {
        let result = 'modal__footer';
        if (this.detail && this.detail.buttonsAlign === FOOTER_FULL_WIDTH) {
            result += ' modal__footer_full-width';
        }
        return result;
    }

    // LIFECYCLES
    renderedCallback() {
        if (this.isFirstRender) {
            this.isFirstRender = false;
            this._keyupHandler = this.handleKeyup.bind(this);
            window.addEventListener('keyup', this._keyupHandler);
        }

        this.addCustomCssStyles();
    }

    // INIT METHODS
    addCustomCssStyles() {
        let customCssContainer = this.template.querySelector('.custom-css-container');

        if (!customCssContainer || customCssContainer.childElementCount > 0) {
            return;
        }

        let style = document.createElement('style');

        let customCssStyles = `
            c-modal .modal__body .slds-form-element__label {
                max-width: 100%;
                overflow-wrap: anywhere;
            }
        `;

        style.innerText = customCssStyles.replace(/ +(?= )|\n/g, ' ');
        customCssContainer.appendChild(style);
    }

    disconnectedCallback() {
        window.removeEventListener('keyup', this._keyupHandler);
    }

    // HANDLERS
    handleKeyup(event) {
        if (!this.show) {
            return;
        }
        if (event.key === KEY_ESCAPE) {
            this.handleClose();
        } else if (event.key === KEY_ENTER) {
            this.handleSubmit();
        }
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent(CLOSE_EVENT));
        this.hideModal();
    }

    handleSubmit() {
        this.dispatchEvent(new CustomEvent(CONFIRM_EVENT));
    }

    // METHODS
    showModal() {
        this.show = true;
        document.body.style.overflowY = 'hidden';
    }

    hideModal() {
        this.show = false;
        this.detail = null;
        document.body.style.overflowY = 'auto';
    }

    // API
    @api
    open(detail) {
        if (detail) {
            this.detail = detail;
            this.showModal();
        }
    }

    @api
    hide() {
        this.hideModal();
    }

}
