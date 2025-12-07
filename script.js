/**
 * Movie CRUD Application using Fetch API
 * Assumes a RESTful API is running at http://localhost:3000/movies (e.g., using json-server)
 */

const API_URL = 'http://localhost:3000/movies';

// DOM Elements
const movieListDiv = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');
const form = document.getElementById('add-movie-form');
let allMovies = []; // Stores the full, unfiltered list of movies

// --- Utility Functions ---

/**
 * Escapes single quotes in a string for safe use within HTML attribute quotes.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
function escapeQuotes(str) {
    if (typeof str !== 'string') return str;
    // Replace single quotes with their HTML entity equivalent
    return str.replace(/'/g, "&#39;");
}

// --- READ (GET Method) ---

/**
 * Function to dynamically render movies to the HTML.
 * @param {Array<Object>} moviesToDisplay - The list of movie objects to render.
 */
function renderMovies(moviesToDisplay) {
    movieListDiv.innerHTML = '';
    if (moviesToDisplay.length === 0) {
        movieListDiv.innerHTML = '<p>No movies found matching your criteria.</p>';
        return;
    }
    
    moviesToDisplay.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie-item');
        
        // Safely escape title and genre for the onclick attribute
        const safeTitle = escapeQuotes(movie.title);
        const safeGenre = escapeQuotes(movie.genre);

        movieElement.innerHTML = `
            <p><strong>${movie.title}</strong> (${movie.year}) - ${movie.genre}</p>
            <button onclick="editMoviePrompt(${movie.id}, '${safeTitle}', ${movie.year},
                '${safeGenre}')">Edit</button>
            <button onclick="deleteMovie(${movie.id})">Delete</button>
        `;
        movieListDiv.appendChild(movieElement);
    });
}

/**
 * Function to fetch all movies and store them (READ).
 */
function fetchMovies() {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(movies => {
            allMovies = movies; // Store the full list
            renderMovies(allMovies); // Display the full list
        })
        .catch(error => console.error('Error fetching movies:', error));
}

// Initial load
document.addEventListener('DOMContentLoaded', fetchMovies);

// --- Search Functionality ---

searchInput.addEventListener('input', function() {
    const searchTerm = searchInput.value.toLowerCase();

    // Filter the global 'allMovies' array based on title or genre match
    const filteredMovies = allMovies.filter(movie => {
        const titleMatch = movie.title.toLowerCase().includes(searchTerm);
        const genreMatch = movie.genre.toLowerCase().includes(searchTerm);
        return titleMatch || genreMatch;
    });
    renderMovies(filteredMovies); // Display the filtered results
});

// --- CREATE Operation (POST Method) ---

form.addEventListener('submit', function(event) {
    event.preventDefault();

    // Get input values
    const title = document.getElementById('title').value;
    const genre = document.getElementById('genre').value;
    const yearInput = document.getElementById('year').value;
    
    // Simple validation
    if (!title || !genre || !yearInput) {
        alert('Please fill in all fields.');
        return;
    }

    const newMovie = {
        title: title,
        genre: genre,
        year: parseInt(yearInput) // Ensure year is an integer
    };

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovie),
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to add movie');
        return response.json();
    })
    .then(() => {
        this.reset();
        fetchMovies(); // Refresh the list
    })
    .catch(error => console.error('Error adding movie:', error));
});

// --- UPDATE Operation (PUT Method) ---

/**
 * Function to prompt user for new movie data.
 */
function editMoviePrompt(id, currentTitle, currentYear, currentGenre) {
    const newTitle = prompt('Enter new Title:', currentTitle);
    const newYearStr = prompt('Enter new Year:', currentYear);
    const newGenre = prompt('Enter new Genre:', currentGenre);
    
    // Check if user cancelled or left fields empty after prompting
    if (newTitle !== null && newYearStr !== null && newGenre !== null) {
        // Simple check to ensure year is a number
        const newYear = parseInt(newYearStr);
        if (isNaN(newYear)) {
            alert('Year must be a number.');
            return;
        }

        const updatedMovieData = {
            title: newTitle,
            year: newYear,
            genre: newGenre
        };
        // The id is passed separately to the updateMovie function
        updateMovie(id, updatedMovieData);
    }
}

/**
 * Function to send PUT request.
 */
function updateMovie(movieId, updatedMovieData) {
    fetch(`${API_URL}/${movieId}`, { // Target the specific resource by ID
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMovieData),
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to update movie');
        return response.json();
    })
    .then(() => {
        fetchMovies(); // Refresh list
    })
    .catch(error => console.error('Error updating movie:', error));
}

// --- DELETE Operation (DELETE Method) ---

function deleteMovie(movieId) {
    if (!confirm('Are you sure you want to delete this movie?')) {
        return;
    }
    
    fetch(`${API_URL}/${movieId}`, { // Target the specific resource by ID
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to delete movie');
        // No need to return response.json() for a successful DELETE
        fetchMovies(); // Refresh list
    })
    .catch(error => console.error('Error deleting movie:', error));
}