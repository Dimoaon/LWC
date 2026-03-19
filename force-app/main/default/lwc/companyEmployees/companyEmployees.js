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

const CLASSES = {
    truncate: 'slds-truncate',
    notes: 'company-employees__employees-table-notes slds-truncate',
    actionsHeader: 'company-employees__employees-table-actions'
};

const COMPANY_FIELD_DEFS = [
    { id: 'companyName', labelKey: 'companyNameLabel', valueKey: 'companyNameValue' },
    { id: 'industry', labelKey: 'industryLabel', valueKey: 'industryValue' },
    { id: 'hqLocation', labelKey: 'hqLocationLabel', valueKey: 'hqLocationValue' },
    { id: 'employeeCount', labelKey: 'employeeCountLabel', valueKey: 'employeeCount' },
    { id: 'website', labelKey: 'websiteLabel', valueKey: 'websiteValue' },
    { id: 'taxId', labelKey: 'taxIdLabel', valueKey: 'taxIdValue' },
    { id: 'accountManager', labelKey: 'accountManagerLabel', valueKey: 'accountManagerValue' },
    { id: 'companyPhone', labelKey: 'companyPhoneLabel', valueKey: 'companyPhoneValue' },
    { id: 'billingAddress', labelKey: 'billingAddressLabel', valueKey: 'billingAddressValue' },
    { id: 'shippingAddress', labelKey: 'shippingAddressLabel', valueKey: 'shippingAddressValue' }
];

const EMPLOYEE_TABLE_COLUMN_DEFS = [
    { id: 'fullName', labelKey: 'fullNameLabel' },
    { id: 'roleTitle', labelKey: 'roleTitleLabel' },
    { id: 'department', labelKey: 'departmentLabel' },
    { id: 'email', labelKey: 'emailLabel' },
    { id: 'phone', labelKey: 'phoneLabel' },
    { id: 'status', labelKey: 'statusLabel' },
    { id: 'notes', labelKey: 'notesLabel' }
];

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
    classes = CLASSES;

    @track isFirstRender = true;
    @track employees = [];
    @track employeeTableRows = [];
    @track isAddEmployeeOpen = false;
    @track isEmployeeFormValid = false;
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
        return COMPANY_FIELD_DEFS.map(({ id, labelKey, valueKey }) => ({
            id,
            label: this[labelKey],
            value: this[valueKey]
        }));
    }

    get employeeTableColumns() {
        return [
            ...EMPLOYEE_TABLE_COLUMN_DEFS.map(({ id, labelKey }) => ({
                id,
                label: this[labelKey]
            })),
            {
                id: 'actions',
                label: this.labels.actionsTitle,
                headerClass: this.classes.actionsHeader
            }
        ];
    }

    get employeeTableColspan() {
        return this.employeeTableColumns.length;
    }

    get isSaveDisabled() {
        return !this.isEmployeeFormValid;
    }

    // LIFECYCLES
    renderedCallback() {
        if (this.isFirstRender) {
            this.isFirstRender = false;
            this.syncEmployeeTableRows();
            this.addCustomCssStyles();
        }

        if (this.isAddEmployeeOpen) {
            this.updateEmployeeFormValidity();
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
        this.isEmployeeFormValid = false;
        this.isAddEmployeeOpen = true;
    }

    handleCloseAddEmployee() {
        this.isAddEmployeeOpen = false;
        this.isEmployeeFormValid = false;
        this.editingEmployeeId = null;
        this.resetEmployeeForm();
    }

    handleEditEmployee(event) {
        let employeeId = event.currentTarget.dataset.id;
        let employee = this.employees.find((item) => item.id === employeeId);

        if (!employee) {
            return;
        }

        this.editingEmployeeId = employeeId;
        this.employeeForm = this.createEmployeeForm(employee);
        this.isAddEmployeeOpen = true;
    }

    handleEmployeeFieldChange(event) {
        let { name, value } = event.target;

        this.employeeForm = {
            ...this.employeeForm,
            [name]: value
        };

        this.applyFieldValidity(event.target);
        event.target.reportValidity();
        this.updateEmployeeFormValidity();
    }

    handleAddEmployee() {
        if (!this.validateForm()) {
            return;
        }

        let isEditing = Boolean(this.editingEmployeeId);
        let employee = this.buildEmployee();

        if (!employee) {
            return;
        }

        this.employees = this.editingEmployeeId
            ? this.employees.map((item) => (item.id === this.editingEmployeeId ? employee : item))
            : [...this.employees, employee];

        this.syncEmployeeTableRows();
        this.showSuccessToast(isEditing);
        this.handleCloseAddEmployee();
    }

    handleDeleteEmployee(event) {
        let employeeId = event.currentTarget.dataset.id;

        this.employees = this.employees.filter((employee) => employee.id !== employeeId);
        this.syncEmployeeTableRows();
    }

    // MAIN METHODS
    validateForm() {
        return this.getEmployeeFormValidity(true);
    }

    applyFieldValidity(field) {
        if (field.name !== 'phone') {
            field.setCustomValidity('');
            return;
        }

        let phoneValue = field.value ? field.value.trim() : '';
        let isPhoneValid = !phoneValue || PHONE_PATTERN.test(phoneValue);

        field.setCustomValidity(
            isPhoneValid ? '' : LABELS.phoneValidationMessage
        );
    }

    buildEmployee() {
        let fullName = this.employeeForm.fullName.trim();
        let email = this.employeeForm.email.trim();
        let roleTitle = this.employeeForm.roleTitle.trim();
        let department = this.employeeForm.department.trim();
        let startDate = this.employeeForm.startDate.trim();
        let phone = this.employeeForm.phone.trim();
        let status = this.employeeForm.status.trim();
        let notes = this.employeeForm.notes.trim();

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

    updateEmployeeFormValidity() {
        if (!this.isAddEmployeeOpen) {
            this.isEmployeeFormValid = false;
            return false;
        }

        return this.getEmployeeFormValidity(false);
    }

    getEmployeeFormValidity(shouldReportValidity) {
        let fields = this.template.querySelectorAll('lightning-input, lightning-textarea');

        if (!fields.length) {
            this.isEmployeeFormValid = false;
            return false;
        }

        let isFormValid = [...fields].every((field) => {
            this.applyFieldValidity(field);

            if (shouldReportValidity) {
                field.reportValidity();
            }

            return field.checkValidity();
        });

        this.isEmployeeFormValid = isFormValid;

        return isFormValid;
    }

    syncEmployeeTableRows() {
        this.employeeTableRows = this.employees.map((employee) => this.createEmployeeTableRow(employee));
    }

    createEmployeeTableRow(employee) {
        return {
            id: employee.id,
            cells: EMPLOYEE_TABLE_COLUMN_DEFS.map(({ id, labelKey }) => ({
                id: `${employee.id}-${id}`,
                label: this[labelKey],
                value: employee[id],
                valueClass: id === 'notes' ? this.classes.notes : this.classes.truncate
            }))
        };
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
