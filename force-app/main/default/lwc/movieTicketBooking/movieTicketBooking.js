import { LightningElement, track } from 'lwc';

const TOTAL_SEATS = 50;

const DEMO_MOVIES = [
    { title: 'Neon Nights', showtime: '17:45', duration: '2h 08m' },
    { title: 'Silent Harbor', showtime: '20:00', duration: '1h 55m' },
    { title: 'Crimson Sky', showtime: '22:30', duration: '2h 15m' }
];

export default class MovieTicketBooking extends LightningElement {

    // VARIABLES
    @track movies = [];
    @track selectedMovieId = null;

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

    // LIFECYCLES
    connectedCallback() {
        this.initMovies();
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

    // MAIN METHODS
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

    generateId() {
        return Math.random().toString(36).substring(2, 9);
    }

}
