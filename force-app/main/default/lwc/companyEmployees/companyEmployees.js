import Toast from 'lightning/toast';
import { LightningElement, api, track } from 'lwc';

const MAX_LENGTHS = {
    fullName: 80,
    email: 80,
    roleTitle: 60,
    department: 60,
    phone: 20,
    status: 20,
    notes: 240
};

const LABELS = {
    phoneValidationMessage: 'Phone can contain only +, spaces, -, (), and digits.',
    actionsTitle: 'Actions',
    editActionTitle: 'Edit',
    deleteActionTitle: 'Delete'
};

const PHONE_PATTERN = /^[+\s\-()0-9]+$/;

export default class CompanyEmployees extends LightningElement {
    // VARIABLES
    @api heading = null;
    @api description = null;

    @api companySectionTitle = null;
    @api companySectionDescription = null;
    @api companyNameLabel = null;
    @api companyNameValue = null;
    @api industryLabel = null;
    @api industryValue = null;
    @api hqLocationLabel = null;
    @api hqLocationValue = null;
    @api employeeCountLabel = null;
    @api websiteLabel = null;
    @api websiteValue = null;
    @api taxIdLabel = null;
    @api taxIdValue = null;
    @api accountManagerLabel = null;
    @api accountManagerValue = null;
    @api companyPhoneLabel = null;
    @api companyPhoneValue = null;
    @api billingAddressLabel = null;
    @api billingAddressValue = null;
    @api shippingAddressLabel = null;
    @api shippingAddressValue = null;

    @api employeesSectionTitle = null;
    @api addEmployeeButtonLabel = null;
    @api emptyStateTitle = null;

    @api cancelButtonLabel = null;
    @api saveButtonLabel = null;
    @api fullNameLabel = null;
    @api emailLabel = null;
    @api roleTitleLabel = null;
    @api departmentLabel = null;
    @api startDateLabel = null;
    @api phoneLabel = null;
    @api statusLabel = null;
    @api notesLabel = null;
    @api addSuccessToastTitle = null;
    @api addSuccessToastMessage = null;
    @api editSuccessToastTitle = null;
    @api editSuccessToastMessage = null;

    maxLength = MAX_LENGTHS;
    labels = LABELS;

    @track isFirstRender = true;
    @track employees = [];
    @track isAddEmployeeOpen = false;
    @track editingEmployeeId = null;
    @track employeeForm = {
        fullName: '',
        email: '',
        roleTitle: '',
        department: '',
        startDate: '',
        phone: '',
        status: '',
        notes: ''
    };

    // GETTERS
    get employeeCount() {
        return this.employees.length;
    }

    get hasEmployees() {
        return this.employees.length > 0;
    }

    get maxStartDate() {
        return new Date().toISOString().split('T')[0];
    }

    get companyFields() {
        return [
            {
                id: 'companyName',
                label: this.companyNameLabel,
                value: this.companyNameValue
            },
            {
                id: 'industry',
                label: this.industryLabel,
                value: this.industryValue
            },
            {
                id: 'hqLocation',
                label: this.hqLocationLabel,
                value: this.hqLocationValue
            },
            {
                id: 'employeeCount',
                label: this.employeeCountLabel,
                value: this.employeeCount
            },
            {
                id: 'website',
                label: this.websiteLabel,
                value: this.websiteValue
            },
            {
                id: 'taxId',
                label: this.taxIdLabel,
                value: this.taxIdValue
            },
            {
                id: 'accountManager',
                label: this.accountManagerLabel,
                value: this.accountManagerValue
            },
            {
                id: 'companyPhone',
                label: this.companyPhoneLabel,
                value: this.companyPhoneValue
            },
            {
                id: 'billingAddress',
                label: this.billingAddressLabel,
                value: this.billingAddressValue
            },
            {
                id: 'shippingAddress',
                label: this.shippingAddressLabel,
                value: this.shippingAddressValue
            }
        ];
    }

    get isSaveDisabled() {
        return !this.hasRequiredFields;
    }

    get hasRequiredFields() {
        return (
            this.employeeForm.fullName.trim()
            && this.employeeForm.email.trim()
            && this.employeeForm.roleTitle.trim()
            && this.employeeForm.department.trim()
            && this.employeeForm.startDate.trim()
            && this.employeeForm.phone.trim()
            && this.employeeForm.status.trim()
        );
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
        const customCssContainer = this.template.querySelector('.custom-css-container');

        if (!customCssContainer || customCssContainer.childElementCount > 0) {
            return;
        }

        const style = document.createElement('style');

        let customCssStyles = `
            c-company-employees lightning-input .slds-input {
                min-height: 3rem;
            }

            c-company-employees lightning-textarea .slds-textarea {
                min-height: 8rem;
            }

            c-company-employees .slds-truncate {
                white-space: normal;
                word-break: break-word;
                overflow-wrap: anywhere;
            }
        `;

        style.innerText = customCssStyles.replace(/ +(?= )|\n/g, ' ');
        customCssContainer.appendChild(style);
    }

    // HANDLERS
    handleOpenAddEmployee() {
        this.editingEmployeeId = null;
        this.resetEmployeeForm();
        this.isAddEmployeeOpen = true;
    }

    handleCloseAddEmployee() {
        this.isAddEmployeeOpen = false;
        this.editingEmployeeId = null;
        this.resetEmployeeForm();
    }

    handleEditEmployee(event) {
        const employeeId = event.currentTarget.dataset.id;
        const employee = this.employees.find((item) => item.id === employeeId);

        if (!employee) {
            return;
        }

        this.editingEmployeeId = employeeId;
        this.employeeForm = this.createEmployeeForm(employee);
        this.isAddEmployeeOpen = true;
    }

    handleEmployeeFieldChange(event) {
        const { name, value } = event.target;

        this.employeeForm = {
            ...this.employeeForm,
            [name]: value
        };

        this.applyFieldValidity(event.target);
        event.target.reportValidity();
    }

    handleAddEmployee() {
        if (!this.validateForm()) {
            return;
        }

        const isEditing = Boolean(this.editingEmployeeId);
        const employee = this.buildEmployee();

        if (!employee) {
            return;
        }

        this.employees = this.editingEmployeeId
            ? this.employees.map((item) => (item.id === this.editingEmployeeId ? employee : item))
            : [...this.employees, employee];

        this.showSuccessToast(isEditing);
        this.handleCloseAddEmployee();
    }

    handleDeleteEmployee(event) {
        const employeeId = event.currentTarget.dataset.id;

        this.employees = this.employees.filter((employee) => employee.id !== employeeId);
    }

    // MAIN METHODS
    validateForm() {
        const fields = this.template.querySelectorAll('lightning-input, lightning-textarea');

        return [...fields].every((field) => {
            this.applyFieldValidity(field);
            field.reportValidity();
            return field.checkValidity();
        });
    }

    applyFieldValidity(field) {
        if (field.name !== 'phone') {
            field.setCustomValidity('');
            return;
        }

        const phoneValue = field.value ? field.value.trim() : '';
        const isPhoneValid = !phoneValue || PHONE_PATTERN.test(phoneValue);

        field.setCustomValidity(
            isPhoneValid ? '' : LABELS.phoneValidationMessage
        );
    }

    buildEmployee() {
        const fullName = this.employeeForm.fullName.trim();
        const email = this.employeeForm.email.trim();
        const roleTitle = this.employeeForm.roleTitle.trim();
        const department = this.employeeForm.department.trim();
        const startDate = this.employeeForm.startDate.trim();
        const phone = this.employeeForm.phone.trim();
        const status = this.employeeForm.status.trim();
        const notes = this.employeeForm.notes.trim();

        if (!fullName || !email || !roleTitle || !department || !startDate || !phone || !status) {
            return null;
        }

        return {
            id: this.editingEmployeeId || `${Date.now()}`,
            fullName,
            email,
            roleTitle,
            department,
            startDate,
            phone,
            status,
            notes
        };
    }

    createEmployeeForm(employee = {}) {
        return {
            fullName: employee.fullName || '',
            email: employee.email || '',
            roleTitle: employee.roleTitle || '',
            department: employee.department || '',
            startDate: employee.startDate || '',
            phone: employee.phone || '',
            status: employee.status || '',
            notes: employee.notes || ''
        };
    }

    resetEmployeeForm() {
        this.employeeForm = this.createEmployeeForm();
    }

    showSuccessToast(isEditing) {
        Toast.show(
            {
                label: isEditing ? this.editSuccessToastTitle : this.addSuccessToastTitle,
                message: isEditing ? this.editSuccessToastMessage : this.addSuccessToastMessage,
                variant: 'success'
            },
            this
        );
    }
}
