import { LightningElement, api, track } from 'lwc';

const CHEVRON_ICONS = {
    expanded: 'utility:chevrondown',
    collapsed: 'utility:chevronright'
};

const STATUS_DEFS = {
    active: {
        labelKey: 'activeBadgeLabel',
        badgeClass: 'department-products__badge department-products__badge_active'
    },
    healthy: {
        labelKey: 'healthyBadgeLabel',
        badgeClass: 'department-products__badge department-products__badge_healthy'
    },
    watch: {
        labelKey: 'watchBadgeLabel',
        badgeClass: 'department-products__badge department-products__badge_watch'
    },
    lowStock: {
        labelKey: 'lowStockBadgeLabel',
        badgeClass: 'department-products__badge department-products__badge_low-stock'
    }
};

const DEPARTMENT_DEFS = [
    {
        name: 'Grocery',
        floor: 'Floor 1',
        status: 'active',
        averageRetail: 4.20,
        onHandTotal: 1240,
        categories: [
            {
                name: 'Dairy',
                status: 'healthy',
                minRetail: 1.10,
                maxRetail: 6.40,
                onHandTotal: 310,
                products: [
                    { name: 'Organic whole milk 1L', sku: 'GR-2041', retail: 1.89, cost: 0.92, onHand: 86, reserved: 12, status: 'active' },
                    { name: 'Aged cheddar 200g', sku: 'GR-2118', retail: 4.50, cost: 2.10, onHand: 54, reserved: 6, status: 'active' },
                    { name: 'Greek yogurt 4-pack', sku: 'GR-2203', retail: 3.20, cost: 1.45, onHand: 41, reserved: 8, status: 'lowStock' }
                ]
            },
            {
                name: 'Bakery',
                status: 'healthy',
                minRetail: 0.90,
                maxRetail: 12.00,
                onHandTotal: 188,
                products: [
                    { name: 'Sourdough loaf', sku: 'GR-3301', retail: 3.80, cost: 1.20, onHand: 27, reserved: 4, status: 'active' },
                    { name: 'Butter croissant', sku: 'GR-3314', retail: 1.40, cost: 0.38, onHand: 96, reserved: 20, status: 'active' }
                ]
            }
        ]
    },
    {
        name: 'Home',
        floor: 'Floor 2',
        status: 'active',
        averageRetail: 28.00,
        onHandTotal: 640,
        categories: [
            {
                name: 'Kitchen',
                status: 'healthy',
                minRetail: 8.00,
                maxRetail: 79.00,
                onHandTotal: 214,
                products: [
                    // { name: 'Stoneware mug', sku: 'HM-1044', retail: 12.00, cost: 4.10, onHand: 73, reserved: 5, status: 'active' },
                    // { name: 'Oak cutting board', sku: 'HM-1088', retail: 34.00, cost: 14.50, onHand: 22, reserved: 2, status: 'active' }
                ]
            },
            {
                name: 'Textiles',
                status: 'watch',
                minRetail: 18.00,
                maxRetail: 89.00,
                onHandTotal: 96,
                products: [
                    { name: 'Linen throw', sku: 'HM-2210', retail: 49.00, cost: 18.00, onHand: 11, reserved: 1, status: 'lowStock' }
                ]
            }
        ]
    },
    {
        name: 'Beauty',
        floor: 'Floor 1',
        status: 'active',
        averageRetail: 16.50,
        onHandTotal: 410,
        categories: [
            // {
            //     name: 'Skin',
            //     status: 'healthy',
            //     minRetail: 7.00,
            //     maxRetail: 42.00,
            //     onHandTotal: 155,
            //     products: [
            //         { name: 'Gentle cleanser 150ml', sku: 'BE-0902', retail: 14.90, cost: 5.60, onHand: 38, reserved: 3, status: 'active' },
            //         { name: 'Day cream SPF', sku: 'BE-0919', retail: 24.00, cost: 9.20, onHand: 19, reserved: 4, status: 'active' }
            //     ]
            // }
        ]
    }
];

export default class DepartmentProducts extends LightningElement {

    // VARIABLES
    @api brandLabel = null;
    @api heading = null;
    @api description = null;
    @api departmentGroupLabel = null;
    @api pricingGroupLabel = null;
    @api stockGroupLabel = null;
    @api statusGroupLabel = null;
    @api nameLabel = null;
    @api skuLabel = null;
    @api retailLabel = null;
    @api costLabel = null;
    @api stockOnHandLabel = null;
    @api reservedLabel = null;
    @api statusLabel = null;
    @api departmentPrefixLabel = null;
    @api categoryPrefixLabel = null;
    @api expandLabel = null;
    @api collapseLabel = null;
    @api averagePrefixLabel = null;
    @api unitsLabel = null;
    @api activeBadgeLabel = null;
    @api healthyBadgeLabel = null;
    @api watchBadgeLabel = null;
    @api lowStockBadgeLabel = null;
    @api currencyIsoCode = null;

    @track departments = [];

    // LIFECYCLES
    connectedCallback() {
        this.initDepartments();
    }

    // HANDLERS
    handleToggleSection(event) {
        let sectionId = event.currentTarget.dataset.id;

        if (!sectionId) {
            return;
        }

        this.departments.forEach((department) => {
            if (department.id === sectionId) {
                this.toggleSection(department);
            }

            if (!department.hasContent) {
                return;
            }

            department.categories.forEach((category) => {
                if (category.id === sectionId) {
                    this.toggleSection(category);
                }
            });
        });
    }

    // MAIN METHODS
    initDepartments() {
        let departments = [];

        DEPARTMENT_DEFS.forEach((departmentDef) => {
            let categories = [];
            let categoryDefs = departmentDef.categories ? departmentDef.categories : [];

            categoryDefs.forEach((categoryDef) => {
                let products = [];
                let productDefs = categoryDef.products ? categoryDef.products : [];

                productDefs.forEach((productDef) => {
                    products.push({
                        id: this.generateId(),
                        title: productDef.name,
                        sku: productDef.sku,
                        retail: productDef.retail,
                        cost: productDef.cost,
                        onHand: productDef.onHand,
                        reserved: productDef.reserved,
                        statusLabel: this[STATUS_DEFS[productDef.status].labelKey],
                        statusClass: STATUS_DEFS[productDef.status].badgeClass
                    });
                });

                categories.push({
                    id: this.generateId(),
                    title: categoryDef.name,
                    isExpanded: true,
                    hasContent: products.length > 0,
                    isContentVisible: products.length > 0,
                    iconName: CHEVRON_ICONS.expanded,
                    toggleLabel: this.collapseLabel,
                    minRetail: categoryDef.minRetail,
                    maxRetail: categoryDef.maxRetail,
                    onHandTotal: categoryDef.onHandTotal,
                    statusLabel: this[STATUS_DEFS[categoryDef.status].labelKey],
                    statusClass: STATUS_DEFS[categoryDef.status].badgeClass,
                    products: products
                });
            });

            departments.push({
                id: this.generateId(),
                title: `${departmentDef.name} · ${departmentDef.floor}`,
                isExpanded: true,
                hasContent: categories.length > 0,
                isContentVisible: categories.length > 0,
                iconName: CHEVRON_ICONS.expanded,
                toggleLabel: this.collapseLabel,
                averageRetail: departmentDef.averageRetail,
                onHandTotal: departmentDef.onHandTotal,
                statusLabel: this[STATUS_DEFS[departmentDef.status].labelKey],
                statusClass: STATUS_DEFS[departmentDef.status].badgeClass,
                categories: categories
            });
        });

        this.departments = departments;
    }

    toggleSection(section) {
        section.isExpanded = !section.isExpanded;
        section.iconName = section.isExpanded ? CHEVRON_ICONS.expanded : CHEVRON_ICONS.collapsed;
        section.toggleLabel = section.isExpanded ? this.collapseLabel : this.expandLabel;
        section.isContentVisible = section.isExpanded && section.hasContent;
    }

    generateId() {
        return Math.random().toString(36).substring(2, 9);
    }
}
