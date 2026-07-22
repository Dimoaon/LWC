import { LightningElement, api } from 'lwc';

export default class OrderLineItemCard extends LightningElement {

    // VARIABLES
    @api name = null;
    @api sku = null;
    @api quantity = null;
    @api lineTotal = null;
    @api currencyIsoCode = null;
    @api skuLabel = null;
    @api quantityLabel = null;
    @api priceLabel = null;
}
