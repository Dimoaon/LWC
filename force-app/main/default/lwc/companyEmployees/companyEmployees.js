import { api, LightningElement } from 'lwc';

export default class CompanyEmployees extends LightningElement {
    @api heading = null;

    employees = [];

    get hasEmployees() {
        return this.employees.length > 0;
    }
}
