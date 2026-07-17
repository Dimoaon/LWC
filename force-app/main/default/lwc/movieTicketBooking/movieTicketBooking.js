import { LightningElement, api, track } from 'lwc';
import Toast from 'lightning/toast';

const TOTAL_SEATS = 50;
const TOAST_VARIANT_ERROR = 'error';
const TOAST_VARIANT_SUCCESS = 'success';
const MAX_LENGTHS = {
    firstName: 50,
    lastName: 50,
    email: 80
};

const DEMO_MOVIES = [
    { title: 'Neon Nights', showtime: '17:45', duration: '2h 08m' },
    { title: 'Silent Harbor', showtime: '20:00', duration: '1h 55m' },
    { title: 'Crimson Sky', showtime: '22:30', duration: '2h 15m' }
];

export default class MovieTicketBooking extends LightningElement {

    // VARIABLES
    @api pageTitle = null;
    @api noMoviesLabel = null;
    @api durationLabel = null;
    @api backToMoviesLabel = null;
    @api screenLabel = null;
    @api noSeatsLabel = null;
    @api seatAlreadyTakenLabel = null;
    @api legendFreeLabel = null;
    @api legendBookedLabel = null;
    @api freeCountLabel = null;
    @api bookedCountLabel = null;
    @api yourBookingsLabel = null;
    @api editLabel = null;
    @api deleteLabel = null;
    @api modalTitle = null;
    @api modalMovieLabel = null;
    @api cancelLabel = null;
    @api confirmLabel = null;
    @api firstNameLabel = null;
    @api lastNameLabel = null;
    @api emailLabel = null;
    @api seatLabel = null;
    @api seatPlaceholderLabel = null;
    @api bookLabel = null;
    @api bookingSuccessLabel = null;
    @api bookingDeletedLabel = null;

    maxLength = MAX_LENGTHS;

    @track isFirstRender = true;
    @track movies = [];
    @track selectedMovieId = null;
    @track editingBookingId = null;
    @track form = {
        firstName: '',
        lastName: '',
        email: '',
        seat: ''
    };

    // GETTERS
    get isMovieSelected() {
        return this.selectedMovieId !== null;
    }

    get hasMovies() {
        return this.movies.length > 0;
    }

    get selectedMovie() {
        let result = null;
        this.movies.forEach(movie => {
            if (movie.id === this.selectedMovieId) {
                result = movie;
            }
        });
        return result;
    }

    get seats() {
        let movie = this.selectedMovie;
        return movie ? movie.seats : [];
    }

    get hasSeats() {
        return this.seats.length > 0;
    }

    get freeCount() {
        return this.seats.filter(seat => seat.isFree).length;
    }

    get bookedCount() {
        return this.seats.filter(seat => seat.isBooked).length;
    }

    get bookings() {
        let movie = this.selectedMovie;
        return movie ? movie.bookings : [];
    }

    get hasBookings() {
        return this.bookings.length > 0;
    }

    get isEditMode() {
        return this.editingBookingId !== null;
    }

    get modalMovieInfo() {
        let movie = this.selectedMovie;
        return movie ? `${movie.title} | ${movie.showtime}` : '';
    }

    get seatOptions() {
        let editing = this.isEditMode ? this.findBooking(this.editingBookingId) : null;
        let editingSeatId = editing ? editing.seatId : null;
        let result = [{ label: this.seatPlaceholderLabel, value: '' }];
        this.seats.forEach(seat => {
            if (seat.isFree || seat.id === editingSeatId) {
                result.push({
                    label: `Seat ${seat.number}`,
                    value: seat.id
                });
            }
        });
        return result;
    }

    // LIFECYCLES
    connectedCallback() {
        this.initMovies();
    }

    renderedCallback() {
        if (this.isFirstRender) {
            this.isFirstRender = false;
            this.addCustomCssStyles();
        }
    }

    // INIT METHODS
    addCustomCssStyles() {
        let container = this.template.querySelector('.custom-css-container');

        if (!container || container.childElementCount > 0) {
            return;
        }

        let style = document.createElement('style');

        let styles = `
            c-movie-ticket-booking lightning-input input.slds-input,
            c-movie-ticket-booking lightning-select select.slds-select {
                min-height: 3rem;
                border-color: #d7d9d9;
                align-items: center;
            }

            c-movie-ticket-booking lightning-input input.slds-input:not(:disabled):hover,
            c-movie-ticket-booking lightning-input input.slds-input:not(:disabled):focus,
            c-movie-ticket-booking lightning-select select.slds-select:not(:disabled):hover,
            c-movie-ticket-booking lightning-select select.slds-select:not(:disabled):focus {
                border-color: #0064b3;
            }

            c-movie-ticket-booking .mobile-seat-picker lightning-button button {
                width: 100%;
                padding: 0.875rem 3rem;
                font-size: 1.125rem;
                font-weight: 400;
                line-height: 1.4;
                color: #ffffff;
                border: 0.0625rem solid #0064b3;
                border-radius: 0;
                background-color: #0064b3;
                transition: color 0.1s, border-color 0.1s, background-color 0.1s;
            }

            c-movie-ticket-booking .mobile-seat-picker lightning-button button:hover,
            c-movie-ticket-booking .mobile-seat-picker lightning-button button:focus {
                color: #ffffff;
                border-color: #004d8a;
                background-color: #004d8a;
            }
        `;

        style.innerText = styles.replace(/ +(?= )|\n/g, ' ');
        container.appendChild(style);
    }

    // HANDLERS
    handleSelectMovie(event) {
        let movieId = event.currentTarget.dataset.id;

        if (!movieId) {
            return;
        }

        this.selectedMovieId = movieId;
    }

    handleBackToMovies() {
        this.selectedMovieId = null;
    }

    handleSeatClick(event) {
        let seatId = event.currentTarget.dataset.id;
        let seat = this.findSeat(seatId);

        if (!seat) {
            return;
        }

        if (seat.isBooked) {
            Toast.show({ label: this.seatAlreadyTakenLabel, variant: TOAST_VARIANT_ERROR }, this);
            return;
        }

        this.form.seat = seat.id;
        this.openBookingModal();
    }

    handleMobileBook() {
        let seatSelect = this.template.querySelector('.mobile-seat-picker lightning-select');

        if (!seatSelect.reportValidity()) {
            return;
        }

        this.openBookingModal();
    }

    handleFormChange(event) {
        this.form[event.target.name] = event.target.value;
    }

    handleModalClose() {
        this.editingBookingId = null;
        this.resetForm();
    }

    handleConfirm() {
        if (!this.validateForm()) {
            return;
        }

        if (this.isEditMode) {
            this.updateBooking(this.form.seat);
        } else {
            this.bookSeat(this.form.seat);
        }

        this.editingBookingId = null;
        this.resetForm();
        this.template.querySelector('c-modal').hide();
        Toast.show({ label: this.bookingSuccessLabel, variant: TOAST_VARIANT_SUCCESS }, this);
    }

    handleEditBooking(event) {
        let bookingId = event.currentTarget.dataset.id;
        let booking = this.findBooking(bookingId);

        if (!booking) {
            return;
        }

        this.editingBookingId = bookingId;
        this.form = {
            firstName: booking.firstName,
            lastName: booking.lastName,
            email: booking.email,
            seat: booking.seatId
        };
        this.openBookingModal();
    }

    handleRemoveBooking(event) {
        let bookingId = event.currentTarget.dataset.id;
        let booking = this.findBooking(bookingId);

        if (!booking) {
            return;
        }

        this.removeBooking(bookingId);
        this.setSeatFree(booking.seatId);
        Toast.show({ label: this.bookingDeletedLabel, variant: TOAST_VARIANT_SUCCESS }, this);
    }

    // MAIN METHODS
    openBookingModal() {
        this.template.querySelector('c-modal').open({ title: this.modalTitle, closeLabel: this.cancelLabel, submitLabel: this.confirmLabel });
    }

    initMovies() {
        let result = [];

        DEMO_MOVIES.forEach(movie => {
            result.push({
                id: this.generateId(),
                title: movie.title,
                showtime: movie.showtime,
                duration: movie.duration,
                seats: this.buildSeats(),
                bookings: []
            });
        });

        this.movies = result;
    }

    buildSeats() {
        let result = [];

        for (let i = 1; i <= TOTAL_SEATS; i++) {
            result.push({
                id: this.generateId(),
                number: i,
                isFree: true,
                isBooked: false
            });
        }

        return result;
    }

    validateForm() {
        let fields = [...this.template.querySelectorAll('.modal-form lightning-input, .modal-form lightning-select')];
        let isValid = true;

        fields.forEach(field => {
            field.reportValidity();
            if (!field.checkValidity()) {
                isValid = false;
            }
        });

        return isValid;
    }

    bookSeat(seatId) {
        let seat = this.findSeat(seatId);

        if (!seat) {
            return;
        }

        this.setSeatBooked(seatId);
        this.selectedMovie.bookings.push({
            id: this.generateId(),
            seatId: seat.id,
            seatNumber: seat.number,
            firstName: this.form.firstName,
            lastName: this.form.lastName,
            email: this.form.email
        });
    }

    updateBooking(seatId) {
        let booking = this.findBooking(this.editingBookingId);
        let seat = this.findSeat(seatId);

        if (!booking || !seat) {
            return;
        }

        if (booking.seatId !== seatId) {
            this.setSeatFree(booking.seatId);
            this.setSeatBooked(seatId);
        }

        booking.seatId = seat.id;
        booking.seatNumber = seat.number;
        booking.firstName = this.form.firstName;
        booking.lastName = this.form.lastName;
        booking.email = this.form.email;
    }

    findSeat(seatId) {
        let result = null;
        this.seats.forEach(seat => {
            if (seat.id === seatId) {
                result = seat;
            }
        });
        return result;
    }

    setSeatFree(seatId) {
        let seat = this.findSeat(seatId);

        if (seat) {
            seat.isFree = true;
            seat.isBooked = false;
        }
    }

    setSeatBooked(seatId) {
        let seat = this.findSeat(seatId);

        if (seat) {
            seat.isFree = false;
            seat.isBooked = true;
        }
    }

    findBooking(bookingId) {
        let result = null;
        this.bookings.forEach(item => {
            if (item.id === bookingId) {
                result = item;
            }
        });
        return result;
    }

    removeBooking(bookingId) {
        let movie = this.selectedMovie;
        movie.bookings = movie.bookings.filter(item => item.id !== bookingId);
    }

    resetForm() {
        this.form = {
            firstName: '',
            lastName: '',
            email: '',
            seat: ''
        };
    }

    generateId() {
        return Math.random().toString(36).substring(2, 9);
    }

}
