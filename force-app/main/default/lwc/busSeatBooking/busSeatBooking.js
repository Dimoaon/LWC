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
    @track editingBooking = null;
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
        let selected = this.findSelectedSeat();

        if (!selected) {
            Toast.show({ label: this.noSeatSelectedLabel, variant: TOAST_VARIANT_WARNING }, this);
            return;
        }

        this.isModalOpen = true;
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
        this.isModalOpen = false;
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
        this.isModalOpen = false;
        Toast.show({ label: this.bookingSuccessLabel, variant: TOAST_VARIANT_SUCCESS }, this);
    }

    handleFormChange(event) {
        this.form[event.target.name] = event.target.value;
    }

    handleEditBooking(event) {
        let seatId = event.currentTarget.dataset.id;
        let booking = null;

        if (!seatId) {
            return;
        }

        this.bookings.forEach(b => {
            if (!booking && b.seatId === seatId) {
                booking = b;
            }
        });

        if (!booking) {
            return;
        }

        this.editingBooking = booking;
        this.form = { firstName: booking.firstName, lastName: booking.lastName, phone: booking.phone, email: booking.email };
        this.bookings = this.bookings.filter(b => b.seatId !== seatId);
        this.selectSeat(seatId);
        this.isModalOpen = true;
    }

    handleRemoveBooking(event) {
        let seatId = event.currentTarget.dataset.id;

        if (!seatId) {
            return;
        }

        this.bookings = this.bookings.filter(b => b.seatId !== seatId);
        this.freeSeat(seatId);
    }

    handleSeatClick(event) {
        let seatId = event.currentTarget.dataset.id;
        let seat = null;

        if (!seatId) {
            return;
        }

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
            this.setSeatFree(seat);
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
        let selected = this.findSelectedSeat();

        if (selected) {
            selected.isSelected = false;
            selected.isBooked = true;
        }
    }

    freeSeat(seatId) {
        let seat = null;
        this.seats.forEach(s => {
            if (!seat && s.id === seatId) {
                seat = s;
            }
        });

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
        this.seats.forEach(s => {
            if (!selected && s.isSelected) {
                selected = s;
            }
        });
        return selected;
    }

    selectSeat(seatId) {
        let done = false;
        this.seats.forEach(s => {
            if (!done && s.id === seatId) {
                s.isFree = false;
                s.isSelected = true;
                s.isBooked = false;
                done = true;
            }
        });
    }

    restoreBookedSeat(seatId) {
        let done = false;
        this.seats.forEach(s => {
            if (!done && s.id === seatId) {
                s.isFree = false;
                s.isSelected = false;
                s.isBooked = true;
                done = true;
            }
        });
    }

    setSeatFree(seat) {
        seat.isFree = true;
        seat.isSelected = false;
        seat.isBooked = false;
    }

}
