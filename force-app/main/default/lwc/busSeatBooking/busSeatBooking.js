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

    @track maxLength = MAX_LENGTHS;
    @track seats = [];
    @track bookings = [];
    @track isModalOpen = false;
    @track form = {
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
    };

    // GETTERS
    get freeCount() {
        return this.seats.filter(s => s.isFree).length;
    }

    get bookedCount() {
        return this.seats.filter(s => s.isBooked).length;
    }

    get hasBookings() {
        return this.bookings.length > 0;
    }

    // LIFECYCLES
    connectedCallback() {
        this.initSeats();
    }

    // HANDLERS
    handleBookSeat() {
        let selected = null;
        this.seats.forEach(s => {
            if (!selected && s.isSelected) {
                selected = s;
            }
        });

        if (!selected) {
            Toast.show({ label: this.noSeatSelectedLabel, variant: TOAST_VARIANT_WARNING }, this);
            return;
        }

        this.isModalOpen = true;
    }

    handleModalClose() {
        this.isModalOpen = false;
        this.resetForm();
        this.deselectCurrentSeat();
    }

    handleConfirm() {
        let inputs = [...this.template.querySelectorAll('lightning-input')];
        inputs.forEach(input => input.reportValidity());
        let isValid = inputs.every(input => input.checkValidity());

        if (!isValid) {
            return;
        }

        let selected = null;
        this.seats.forEach(s => {
            if (!selected && s.isSelected) {
                selected = s;
            }
        });
        this.bookings.push({
            seatNumber: selected.number,
            firstName: this.form.firstName,
            lastName: this.form.lastName
        });

        this.bookSelectedSeat();
        this.resetForm();
        this.isModalOpen = false;
        Toast.show({ label: this.bookingSuccessLabel, variant: TOAST_VARIANT_SUCCESS }, this);
    }

    handleFormChange(event) {
        this.form[event.target.name] = event.target.value;
    }

    handleSeatClick(event) {
        let seatId = event.currentTarget.dataset.id;

        if (!seatId) {
            return;
        }

        let seat = null;
        this.seats.forEach(s => {
            if (!seat && s.id === seatId) {
                seat = s;
            }
        });

        if (!seat) {
            return;
        }

        if (seat.isFree) {
            this.deselectCurrentSeat();
            seat.isFree = false;
            seat.isSelected = true;
        } else if (seat.isSelected) {
            seat.isFree = true;
            seat.isSelected = false;
        } else if (seat.isBooked) {
            Toast.show({ label: this.seatAlreadyTakenLabel, variant: TOAST_VARIANT_ERROR }, this);
        }
    }

    // METHODS
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
        let selected = null;
        this.seats.forEach(s => {
            if (!selected && s.isSelected) {
                selected = s;
            }
        });

        if (selected) {
            selected.isSelected = false;
            selected.isBooked = true;
        }
    }

    deselectCurrentSeat() {
        let selected = null;
        this.seats.forEach(s => {
            if (!selected && s.isSelected) {
                selected = s;
            }
        });

        if (selected) {
            selected.isFree = true;
            selected.isSelected = false;
        }
    }

}
