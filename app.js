document.addEventListener('DOMContentLoaded', () => {
    const addMovieBtn = document.getElementById('add-movie-btn');
    const movieTitleInput = document.getElementById('movie-title');
    const moviesUl = document.getElementById('movies-ul');
    const OMDB_API_KEY = 'your_omdb_api_key'; // Change for your API key

    // Loading data from local storage
    const loadMovies = () => {
        const movies = JSON.parse(localStorage.getItem('movies')) || [];
        movies.forEach(movie => renderMovie(movie));
    };

    // Saving data to local storage
    const saveMovies = () => {
        const movies = [];
        document.querySelectorAll('#movies-ul li').forEach(li => {
            const title = li.querySelector('h3').innerText;
            const rating = li.querySelector('.movie-actions input') ? li.querySelector('.movie-actions input').value : li.querySelector('.movie-actions div p').innerText.split(' ')[1].slice(0, -2);
            const comment = li.querySelector('.movie-actions textarea') ? li.querySelector('.movie-actions textarea').value : li.querySelector('.movie-actions div p').innerText.split(' ').slice(3).join(' ');
            movies.push({ title, rating, comment });
        });
        localStorage.setItem('movies', JSON.stringify(movies));
    };

    // Confirming deletion
    const confirmDeletion = (callback) => {
        if (confirm('Are you sure you want to delete this movie?')) {
            callback();
        }
    };

    // Film rendering function
    const renderMovie = (movie) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <h3>${movie.title}</h3>
            <div class="movie-actions">
                ${movie.rating ? `<div><p><strong>Rating:</strong> ${movie.rating}/10</p><p><strong>Comment:</strong> ${movie.comment}</p></div>` : `
                <input type="number" min="1" max="10" placeholder="Rate (1-10)" value="${movie.rating || ''}">
                <textarea placeholder="Write a comment">${movie.comment || ''}</textarea>
                <button class="save-btn">Save</button>`}
                <button class="delete-btn">Delete</button>
            </div>
        `;
        moviesUl.appendChild(li);

        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            confirmDeletion(() => {
                moviesUl.removeChild(li);
                saveMovies();
            });
        });

        if (!movie.rating) {
            const saveBtn = li.querySelector('.save-btn');
            saveBtn.addEventListener('click', () => {
                const ratingInput = li.querySelector('input[type="number"]');
                const commentTextarea = li.querySelector('textarea');
                const rating = ratingInput.value.trim();
                const comment = commentTextarea.value.trim();

                if (rating === '' || comment === '') return;

                const reviewDiv = document.createElement('div');
                reviewDiv.innerHTML = `
                    <p><strong>Rating:</strong> ${rating}/10</p>
                    <p><strong>Comment:</strong> ${comment}</p>
                `;
                li.querySelector('.movie-actions').prepend(reviewDiv);

                ratingInput.remove();
                commentTextarea.remove();
                saveBtn.remove();

                saveMovies();
            });
        }
    };

    // Getting iformation about films from OMDB API
    const fetchMovieData = (title) => {
        fetch(`https://www.omdbapi.com/?t=${title}&apikey=${OMDB_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (data.Response === 'True') {
                    renderMovie({
                        title: data.Title,
                        rating: '',
                        comment: ''
                    });
                    saveMovies();
                } else {
                    alert('Movie not found!');
                }
            })
            .catch(error => console.error('Error fetching movie data:', error));
    };

    addMovieBtn.addEventListener('click', () => {
        const movieTitle = movieTitleInput.value.trim();
        if (movieTitle === '') return;

        fetchMovieData(movieTitle);

        movieTitleInput.value = '';
    });

    loadMovies();
});
