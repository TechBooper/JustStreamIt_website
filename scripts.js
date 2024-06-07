document.addEventListener('DOMContentLoaded', function() {
    fetchBestFilm();
    fetchTopRatedFilms({
        page_size: 6
    });
    fetchCategoryFilms('category-1', 'Drama');
    fetchCategoryFilms('category-2', 'Comedy');
    fetchCategoryFilms('free-category', '');
    fetchCategoryFilms('free-category-2', '');

    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
        populateCategories(categorySelect, 'free-category');
    }

    const categorySelect2 = document.getElementById('category-select-2');
    if (categorySelect2) {
        populateCategories(categorySelect2, 'free-category-2');
    }
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
        filmList.classList.add('film-list', 'row', 'row-cols-1', 'row-cols-md-2', 'row-cols-lg-3', 'g-4');

        films.forEach(film => {
            const filmElement = document.createElement('div');
            filmElement.classList.add('col', 'mb-4');
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

async function fetchFilmDescription(filmId) {
    const detailsUrl = `http://localhost:8000/api/v1/titles/${filmId}`;
    try {
        const response = await fetch(detailsUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const film = await response.json();
        return film.description || 'No description available.';
    } catch (error) {
        console.error('Error fetching film description:', error);
        return 'No description available.';
    }
}

async function displayBestFilm(film) {
    document.getElementById('best-film-title').textContent = film.title;
    document.getElementById('best-film-year').textContent = `Year: ${film.year}`;
    document.getElementById('best-film-score').textContent = `IMDb Score: ${film.imdb_score}`;
    
    const description = await fetchFilmDescription(film.id);
    document.getElementById('best-film-description').textContent = description;

    const filmCard = document.querySelector('#best-film .d-flex.flex-row.border.rounded');
    filmCard.setAttribute('onclick', `showFilmDetailsModal('${film.id}')`);
    filmCard.style.cursor = 'pointer';


    document.getElementById('best-film-image').innerHTML = `<img src="${film.image_url}" class="img-fluid" alt="Poster of ${film.title}" style="width: 300px;">`;
    document.getElementById('best-film-details-btn').setAttribute('onclick', `event.stopPropagation(); showFilmDetailsModal('${film.id}')`);
}


function buildQueryURL(baseURL, queryParams) {
    const queryString = new URLSearchParams(queryParams).toString();
    return `${baseURL}?${queryString}`;
}

function fetchBestFilm() {
    fetch('http://localhost:8000/api/v1/titles/?ordering=-imdb_score&limit=1') 
    
    
    // Fetching only the top film by IMDb score on the page, not the top film overall due to extreme amount of films
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.results && data.results.length > 0) {
                displayBestFilm(data.results[0]); //
            } else {
                console.error('No films found in API data');
            }
        })
        .catch(error => {
            console.error('Error fetching best film:', error);
        });
}

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
                displayFilms(data.results.slice(0, 6), 'top-rated-films', 'Best Movies');
            } else {
                console.error('No films found in API data');
            }
        })
        .catch(error => {
            console.error('Error fetching top rated films:', error);
        });
}

function showFilmDetailsModal(filmId) {
    const detailsUrl = `http://localhost:8000/api/v1/titles/${filmId}`;

    fetch(detailsUrl)
        .then(response => response.json())
        .then(film => {
            const modalBody = document.querySelector('#filmDetailsModal .modal-body');
            modalBody.innerHTML = `
                <img src="${film.image_url}" class="img-fluid rounded mb-2" alt="${film.title}">
                <h4>${film.title}</h4>
                <p>Genres: ${film.genres.join(', ')}</p>
                <p>Release Date: ${film.year}</p>
                <p>Classification: ${film.rated || 'Not rated'}</p>
                <p>IMDB Score: ${film.imdb_score}</p>
                <p>Director: ${film.directors.join(', ')}</p>
                <p>Cast: ${film.actors.join(', ')}</p>
                <p>Duration: ${film.duration ? `${film.duration} minutes` : 'Not available'}</p>
                <p>Country: ${film.countries ? film.countries.join(', ') : 'Not available'}</p>
                <p>Box Office: ${film.box_office || 'Not available'}</p>
                <p>Description: ${film.description || 'No description available.'}</p>
            `;
            const modal = new bootstrap.Modal(document.getElementById('filmDetailsModal'));
            modal.show();
        })
        .catch(error => console.error('Error loading film details:', error));
}


async function fetchCategoryFilms(containerId, genreId = '') {
    const url = buildQueryURL('http://localhost:8000/api/v1/titles/', {
        genre: genreId,
        page_size: 6
    });

    const response = await fetch(url);
    const films = await response.json();

    displayFilmsInCategory(containerId, films.results);
}

async function displayFilmsInCategory(containerId, films) {
    const categorySection = document.getElementById(containerId).querySelector('.film-list');
    categorySection.innerHTML = '';
    films.forEach(film => {
        const filmElement = document.createElement('div');
        filmElement.className = 'col'; // Bootstrap compatibility
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

async function populateCategories(selectElement, containerId) {
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

function displayFilmDetails(film) {
    const filmDetailsSection = document.getElementById('film-details');
    filmDetailsSection.innerHTML = `
        <div class="card">
            <img src="${film.image_url}" class="card-img-top" alt="${film.title}">
            <div class="card-body">
                <h5 class="card-title">${film.title}</h5>
                <p class="card-text"><strong>Genre:</strong> ${film.genres.join(', ')}</p>
                <p class="card-text"><strong>Release Date:</strong> ${film.date_published}</p>
                <p class="card-text"><strong>Classification:</strong> ${film.rated}</p>
                <p class="card-text"><strong>IMDb Score:</strong> ${film.imdb_score}</p>
                <p class="card-text"><strong>Director:</strong> ${film.directors.join(', ')}</p>
                <p class="card-text"><strong>Actors:</strong> ${film.actors.join(', ')}</p>
                <p class="card-text"><strong>Duration:</strong> ${film.duration} minutes</p>
                <p class="card-text"><strong>Country of Origin:</strong> ${film.countries.join(', ')}</p>
                <p class="card-text"><strong>Box Office Revenue:</strong> ${film.box_office || 'Not available'}</p>
                <p class="card-text"><strong>Description:</strong> ${film.description || 'No description available.'}</p>
                <a href="/" class="btn btn-primary">Go back</a>
            </div>
        </div>
    `;
}
