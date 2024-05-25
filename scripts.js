document.addEventListener('DOMContentLoaded', function() {
    fetchBestFilm(); // Function to fetch and display the best film
    fetchTopRatedFilms(); // Fetch top rated films
    fetchCategoryFilms('category-1', 'Drama');
    fetchCategoryFilms('category-2', 'Comedy');
    fetchCategoryFilms('free-category', '', 'Free Category');
    fetchCategoryFilms('free-category-2', '', 'Free Category 2'); // 

    const categorySelect = document.getElementById('category-select');
    populateCategories(categorySelect);

    const categorySelect2 = document.getElementById('category-select-2');
    populateCategories(categorySelect2, 'free-category-2');

    document.getElementById('sort-button').addEventListener('click', () => {
        const sortCriteria = document.getElementById('sort-select').value;
        const minScore = document.getElementById('min-score-input').value;
        fetchTopRatedFilms({
            sort_by: sortCriteria,
            imdb_score_min: minScore
        });
    });
});


async function getGenreName(genreId) {
    const response = await fetch(`http://localhost:8000/api/v1/genres/${genreId}`);
    const genre = await response.json();
    return genre.name;
}

function displayFilms(films, containerId, title = '') {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (title) {
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        container.appendChild(titleElement);
    }

    if (films && films.length > 0) {
        const filmList = document.createElement('div');
        filmList.classList.add('film-list', 'row'); 

        films.forEach(film => {
            const filmElement = document.createElement('div');
            filmElement.classList.add('col-lg-3', 'col-md-4', 'col-sm-6'); 
            filmElement.innerHTML = `
                <div class="card h-100">
                    <img src="${film.image_url}" class="card-img-top custom-img" alt="${film.title}" onclick="showFilmDetailsModal(${film.id})">
                    <div class="card-body">
                        <h5 class="card-title">${film.title}</h5>
                        <p class="card-text">IMDb Score: ${film.imdb_score}</p>
                        <button class="btn btn-primary" onclick="showFilmDetailsModal(${film.id})">Détails</button>
                    </div>
                </div>
            `;
            filmList.appendChild(filmElement);
        });

        container.appendChild(filmList);
    } else {
        const noFilmsElement = document.createElement('p');
        noFilmsElement.textContent = 'No films found.';
        container.appendChild(noFilmsElement);
    }
}


function buildQueryURL(baseURL, queryParams) {
    const queryString = new URLSearchParams(queryParams).toString();
    return `${baseURL}?${queryString}`;
}

function reinitializeBootstrapComponents() {
    
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    
    var modalElementList = [].slice.call(document.querySelectorAll('.modal'));
    modalElementList.map(function (modalEl) {
        return new bootstrap.Modal(modalEl);
    });
}

function fetchBestFilm() {
    fetch('http://localhost:8000/api/v1/titles/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.results && data.results.length > 0) {
                
                const bestFilm = data.results.reduce((max, film) => max.imdb_score > film.imdb_score ? max : film);
                displayFilms([bestFilm], 'best-film', 'Top-rated Movie');
            } else {
                console.error('No films found in API data');
            }
        })
        .catch(error => {
            console.error('Error fetching best film:', error);
        });
}


document.getElementById('sort-button').addEventListener('click', () => {
    const sortCriteria = document.getElementById('sort-select').value;
    const minScore = document.getElementById('min-score-input').value;
    fetchTopRatedFilms({
        sort_by: sortCriteria,
        imdb_score_min: minScore
    });
});

function fetchTopRatedFilms(filters = {}) {
    const url = buildQueryURL('http://localhost:8000/api/v1/titles/', filters);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.results && data.results.length > 0) {
                displayFilms(data.results, 'top-rated-films', 'Best Movies');
            } else {
                console.error('No films found in API data');
            }
        })
        .catch(error => {
            console.error('Error fetching top rated films:', error);
        });
}

function showFilmDetailsModal(filmId) {
    fetch(`http://localhost:8000/api/v1/titles/${filmId}`)
        .then(response => response.json())
        .then(film => {
            const modalBody = document.querySelector('#filmDetailsModal .modal-body');
            modalBody.innerHTML = `
                <img src="${film.image_url}" class="img-fluid rounded mb-2" alt="${film.title}">
                <h4>${film.title}</h4>
                <p>Genres: ${film.genres.join(', ')}</p>
                <p>Release Date: ${film.date_published}</p>
                <p>IMDB Score: ${film.imdb_score}</p>
                <p>Director: ${film.directors}</p>
                <p>Cast: ${film.actors.join(', ')}</p>
                <p>Duration: ${film.duration} minutes</p>
                <p>Country: ${film.countries.join(', ')}</p>
                <p>Description: ${film.description}</p>
            `;
            const modal = new bootstrap.Modal(document.getElementById('filmDetailsModal'));
            modal.show();
        })
        .catch(error => console.error('Error loading film details:', error));
}


async function fetchCategoryFilms(containerId, genreId = '', categoryName = '') {
    const url = buildQueryURL('http://localhost:8000/api/v1/titles/', { genre: genreId, page_size: 6 });

    const response = await fetch(url);
    const films = await response.json();

    displayFilmsInCategory(containerId, films.results);
}


async function displayFilmsInCategory(containerId, films) {
    const categorySection = document.getElementById(containerId).querySelector('.film-list');
    categorySection.innerHTML = '';
    films.forEach(film => {
        const filmElement = document.createElement('div');
        filmElement.className = 'col-lg-3 col-md-4 col-sm-6'; 
        filmElement.innerHTML = `
            <div class="card h-100">
                <img src="${film.image_url}" class="card-img-top custom-img" alt="${film.title}" onclick="showFilmDetailsModal(${film.id})">
                <div class="card-body">
                    <h5 class="card-title">${film.title}</h5>
                    <p class="card-text">IMDb Score: ${film.imdb_score}</p>
                    <button class="btn btn-primary" onclick="showFilmDetailsModal(${film.id})">Détails</button>
                </div>
            </div>
        `;
        categorySection.appendChild(filmElement);
    });
}

let genreMap = {};

async function populateCategories(selectElement, containerId = 'free-category') {
    const genresResponse = await fetch('http://localhost:8000/api/v1/genres/');
    const genres = await genresResponse.json();

    for (const genre of genres.results) {
        const option = document.createElement('option');
        option.value = genre.name;
        option.textContent = genre.name;
        selectElement.appendChild(option);
    }

    selectElement.addEventListener('change', async () => {
        const selectedGenre = selectElement.value;
        fetchCategoryFilms(containerId, selectedGenre);
    });
}

function fetchFilmDetails(filmId) {
    fetch(`http://localhost:8000/api/v1/titles/${filmId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayFilmDetails(data);
        })
        .catch(error => {
            console.error('Error fetching film details:', error);
            document.getElementById('film-details').innerHTML = '<p>Error fetching film details.</p>';
        });
}

function displayFilmDetails(film) {
    const filmDetailsSection = document.getElementById('film-details');
    filmDetailsSection.innerHTML = `
        <div class="card">
            <img src="${film.image_url}" class="card-img-top" alt="${film.title}">
            <div class="card-body">
                <h5 class="card-title">${film.title}</h5>
                <p class="card-text">${film.description}</p>
                <p class="card-text">Director: ${film.director}</p>
                <p class="card-text">Release Date: ${film.date_published}</p>
                <p class="card-text">IMDb Score: ${film.imdb_score}</p>
                <a href="/" class="btn btn-primary">Go back</a>
            </div>
        </div>
    `;
}