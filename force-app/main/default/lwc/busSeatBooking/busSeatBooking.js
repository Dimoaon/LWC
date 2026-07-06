import { LightningElement, api, track } from 'lwc';
import Toast from 'lightning/toast';

const TOTAL_SEATS = 50;
const MAX_LENGTHS = {
    firstName: 50,
    lastName: 50,
    phone: 20,
    email: 80
};
const TOAST_VARIANT_ERROR = 'error';
const TOAST_VARIANT_WARNING = 'warning';
const TOAST_VARIANT_SUCCESS = 'success';
const PHONE_REGEXP = /[+]?[0-9 \(\)\-]{7,20}/;

export default class BusSeatBooking extends LightningElement {

    // VARIABLES
    @api title = null;
    @api description = null;
    @api driverLabel = null;
    @api legendFreeLabel = null;
    @api legendSelectedLabel = null;
    @api legendBookedLabel = null;
    @api seatAlreadyTakenLabel = null;
    @api noSeatSelectedLabel = null;
    @api bookingSuccessLabel = null;
    @api bookingsEmptyLabel = null;
    @api seatNumberLabel = null;
    @api nameLabel = null;
    @api freeCountLabel = null;
    @api bookedCountLabel = null;
    @api bookSeatLabel = null;
    @api modalTitle = null;
    @api firstNameLabel = null;
    @api lastNameLabel = null;
    @api phoneLabel = null;
    @api emailLabel = null;
    @api cancelLabel = null;
    @api confirmLabel = null;
    @api invalidPhoneLabel = null;

    @track isFirstRender = true;
    @track maxLength = MAX_LENGTHS;
    @track seats = [];
    @track bookings = [];
    @track editingBooking = null;
    @track form = {
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
    };

    // GETTERS
    get freeCount() {
        return this.seats.filter(item => item.isFree).length;
    }

    get bookedCount() {
        return this.seats.filter(item => item.isBooked).length;
    }

    get hasBookings() {
        return this.bookings.length > 0;
    }

    get phonePattern() {
        return PHONE_REGEXP.source;
    }

    // LIFECYCLES
    connectedCallback() {
        this.initSeats();
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
            c-bus-seat-booking lightning-input input.slds-input {
                min-height: 3rem;
                border-color: #D7D9D9;
            }

            c-bus-seat-booking lightning-input input.slds-input:not(:disabled):hover,
            c-bus-seat-booking lightning-input input.slds-input:not(:disabled):focus {
                border-color: #0064B3;
            }
        `;

        style.innerText = customCssStyles.replace(/ +(?= )|\n/g, ' ');
        customCssContainer.appendChild(style);
    }

    // HANDLERS
    handleBookSeat() {
        let selected = this.findSelectedSeat();

        if (!selected) {
            Toast.show({ label: this.noSeatSelectedLabel, variant: TOAST_VARIANT_WARNING }, this);
            return;
        }

        this.openBookingModal();
    }

    handleModalClose() {
        if (this.editingBooking) {
            this.bookings.push(this.editingBooking);
            this.restoreBookedSeat(this.editingBooking.seatId);
            this.editingBooking = null;
        } else {
            this.deselectCurrentSeat();
        }

        this.resetForm();
    }

    handleConfirm() {
        let inputs = [...this.template.querySelectorAll('lightning-input')];
        let isValid = inputs.every(input => input.checkValidity());
        let selected = this.findSelectedSeat();

        inputs.forEach(input => input.reportValidity());

        if (!isValid) {
            return;
        }

        this.bookings.push({
            seatId: selected.id,
            seatNumber: selected.number,
            firstName: this.form.firstName,
            lastName: this.form.lastName,
            phone: this.form.phone,
            email: this.form.email
        });

        this.editingBooking = null;
        this.bookSelectedSeat();
        this.resetForm();
        this.template.querySelector('c-modal').hide();
        Toast.show({ label: this.bookingSuccessLabel, variant: TOAST_VARIANT_SUCCESS }, this);
    }

    handleFormChange(event) {
        this.form[event.target.name] = event.target.value;
    }

    handleEditBooking(event) {
        let seatId = event.currentTarget.dataset.id;
        let booking = null;

        this.bookings.forEach(item => {
            if (item.seatId === seatId) {
                booking = item;
            }
        });

        if (!seatId || !booking) {
            return;
        }

        this.editingBooking = booking;
        this.form = { firstName: booking.firstName, lastName: booking.lastName, phone: booking.phone, email: booking.email };
        this.bookings = this.bookings.filter(item => item.seatId !== seatId);
        this.selectSeat(seatId);
        this.openBookingModal();
    }

    handleRemoveBooking(event) {
        let seatId = event.currentTarget.dataset.id;

        if (!seatId) {
            return;
        }

        this.bookings = this.bookings.filter(item => item.seatId !== seatId);
        this.freeSeat(seatId);
    }

    handleSeatClick(event) {
        let seatId = event.currentTarget.dataset.id;
        let seat = this.findSeatById(seatId);

        if (!seatId || !seat) {
            return;
        }

        if (seat.isFree) {
            this.deselectCurrentSeat();
            this.setSeatSelected(seat);
        } else if (seat.isSelected) {
            this.setSeatFree(seat);
        } else if (seat.isBooked) {
            Toast.show({ label: this.seatAlreadyTakenLabel, variant: TOAST_VARIANT_ERROR }, this);
        }
    }

    // METHODS
    openBookingModal() {
        this.template.querySelector('c-modal').open({ title: this.modalTitle, closeLabel: this.cancelLabel, submitLabel: this.confirmLabel });
    }

    initSeats() {
        let result = [];

        for (let i = 1; i <= TOTAL_SEATS; i++) {
            result.push({
                id: this.generateId(),
                number: i,
                isFree: true,
                isSelected: false,
                isBooked: false
            });
        }

        this.seats = result;
    }

    generateId() {
        return Math.random().toString(36).substring(2, 9);
    }

    resetForm() {
        this.form = {
            firstName: '',
            lastName: '',
            phone: '',
            email: ''
        };
    }

    bookSelectedSeat() {
        let selected = this.findSelectedSeat();

        if (selected) {
            this.setSeatBooked(selected);
        }
    }

    freeSeat(seatId) {
        let seat = this.findSeatById(seatId);

        if (seat) {
            this.setSeatFree(seat);
        }
    }

    deselectCurrentSeat() {
        let selected = this.findSelectedSeat();

        if (selected) {
            this.setSeatFree(selected);
        }
    }

    findSelectedSeat() {
        let selected = null;
        this.seats.forEach(item => {
            if (item.isSelected) {
                selected = item;
            }
        });
        return selected;
    }

    findSeatById(seatId) {
        let result = null;
        this.seats.forEach(item => {
            if (item.id === seatId) {
                result = item;
            }
        });
        return result;
    }

    selectSeat(seatId) {
        let seat = this.findSeatById(seatId);

        if (seat) {
            this.setSeatSelected(seat);
        }
    }

    restoreBookedSeat(seatId) {
        let seat = this.findSeatById(seatId);

        if (seat) {
            this.setSeatBooked(seat);
        }
    }

    setSeatFree(seat) {
        seat.isFree = true;
        seat.isSelected = false;
        seat.isBooked = false;
    }

    setSeatSelected(seat) {
        seat.isFree = false;
        seat.isSelected = true;
        seat.isBooked = false;
    }

    setSeatBooked(seat) {
        seat.isFree = false;
        seat.isSelected = false;
        seat.isBooked = true;
    }

}
