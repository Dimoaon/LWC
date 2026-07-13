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
    @api durationLabel = null;
    @api backToMoviesLabel = null;
    @api screenLabel = null;
    @api seatAlreadyTakenLabel = null;
    @api legendFreeLabel = null;
    @api legendBookedLabel = null;
    @api freeCountLabel = null;
    @api bookedCountLabel = null;
    @api yourBookingsLabel = null;
    @api modalTitle = null;
    @api modalMovieLabel = null;
    @api cancelLabel = null;
    @api confirmLabel = null;
    @api firstNameLabel = null;
    @api lastNameLabel = null;
    @api emailLabel = null;
    @api seatLabel = null;
    @api bookLabel = null;
    @api bookingSuccessLabel = null;

    maxLength = MAX_LENGTHS;

    @track isFirstRender = true;
    @track movies = [];
    @track selectedMovieId = null;
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

    get modalMovieInfo() {
        let movie = this.selectedMovie;
        return movie ? `${movie.title} | ${movie.showtime}` : '';
    }

    get seatOptions() {
        let result = [];
        this.seats.forEach(seat => {
            if (seat.isFree) {
                result.push({
                    label: `Seat ${seat.number}`,
                    value: String(seat.number)
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
            c-movie-ticket-booking lightning-combobox button.slds-combobox__input {
                min-height: 3rem;
                border-color: #d7d9d9;
                align-items: center;
            }

            c-movie-ticket-booking lightning-input input.slds-input:not(:disabled):hover,
            c-movie-ticket-booking lightning-input input.slds-input:not(:disabled):focus,
            c-movie-ticket-booking lightning-combobox input.slds-input:not(:disabled):hover,
            c-movie-ticket-booking lightning-combobox input.slds-input:not(:disabled):focus {
                border-color: #0064b3;
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

        if (!seatId || !seat) {
            return;
        }

        if (seat.isBooked) {
            Toast.show({ label: this.seatAlreadyTakenLabel, variant: TOAST_VARIANT_ERROR }, this);
            return;
        }

        this.form.seat = String(seat.number);
        this.openBookingModal();
    }

    handleMobileBook() {
        if (!this.form.seat) {
            return;
        }

        this.openBookingModal();
    }

    handleFormChange(event) {
        this.form[event.target.name] = event.target.value;
    }

    handleModalClose() {
        this.resetForm();
    }

    handleConfirm() {
        if (!this.validateForm()) {
            return;
        }

        this.bookSeat(Number(this.form.seat));
        this.resetForm();
        this.template.querySelector('c-modal').hide();
        Toast.show({ label: this.bookingSuccessLabel, variant: TOAST_VARIANT_SUCCESS }, this);
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

    findSeat(seatId) {
        let result = null;
        this.seats.forEach(seat => {
            if (seat.id === seatId) {
                result = seat;
            }
        });
        return result;
    }

    validateForm() {
        let fields = [...this.template.querySelectorAll('.modal-form lightning-input, .modal-form lightning-combobox')];
        let isValid = true;

        fields.forEach(field => {
            field.reportValidity();
            if (!field.checkValidity()) {
                isValid = false;
            }
        });

        return isValid;
    }

    bookSeat(number) {
        let movie = this.selectedMovie;

        this.seats.forEach(seat => {
            if (seat.number === number) {
                seat.isFree = false;
                seat.isBooked = true;
            }
        });

        movie.bookings.push({
            id: this.generateId(),
            seatNumber: number,
            guestName: `${this.form.firstName} ${this.form.lastName}`,
            email: this.form.email
        });
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
