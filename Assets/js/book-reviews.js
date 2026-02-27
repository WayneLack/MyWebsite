const BOOKS_JSON_PATH = "Assets/data/books.json";

let allBooks = [];
let filteredBooks = [];

const bookGrid = document.getElementById("bookGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const genreFilterWrapper = document.getElementById("genreFilterWrapper");
const genreSelect = document.getElementById("genreSelect");

const modal = document.getElementById("reviewModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalRating = document.getElementById("modalRating");
const modalText = document.getElementById("modalText");

document.addEventListener("DOMContentLoaded", () => {
    loadBooks();

    searchInput.addEventListener("input", handleFilterAndSort);
    sortSelect.addEventListener("change", handleSortChange);
    genreSelect.addEventListener("change", handleFilterAndSort);

    modalCloseBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeModal();
    });
});

async function loadBooks() {
    const response = await fetch(BOOKS_JSON_PATH);
    allBooks = await response.json();

    allBooks.sort((a, b) => new Date(b.date) - new Date(a.date));

    buildGenreOptions(allBooks);
    filteredBooks = [...allBooks];
    renderBooks(filteredBooks);
}

function buildGenreOptions(books) {
    const genres = new Set();
    books.forEach((b) => genres.add(b.genre));

    while (genreSelect.options.length > 1) genreSelect.remove(1);

    [...genres].sort().forEach((g) => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        genreSelect.appendChild(opt);
    });
}

function handleSortChange() {
    if (sortSelect.value === "genre") {
        genreFilterWrapper.classList.remove("hidden");
    } else {
        genreFilterWrapper.classList.add("hidden");
        genreSelect.value = "all";
    }
    handleFilterAndSort();
}

function handleFilterAndSort() {
    const query = searchInput.value.toLowerCase();
    const sortValue = sortSelect.value;
    const selectedGenre = genreSelect.value;

    filteredBooks = allBooks.filter((book) => {
        const matchesTitle = book.title.toLowerCase().includes(query);
        const matchesGenre =
            sortValue === "genre" && selectedGenre !== "all"
                ? book.genre === selectedGenre
                : true;
        return matchesTitle && matchesGenre;
    });

    switch (sortValue) {
        case "date":
            filteredBooks.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case "rating":
            filteredBooks.sort((a, b) => b.rating - a.rating);
            break;
        case "genre":
            filteredBooks.sort((a, b) => a.genre.localeCompare(b.genre));
            break;
        case "vowels":
            const count = (t) => (t.match(/[aeiou]/gi) || []).length;
            filteredBooks.sort((a, b) => count(b.title) - count(a.title));
            break;
    }

    renderBooks(filteredBooks);
}

function renderBooks(books) {
    bookGrid.innerHTML = "";

    books.forEach((book) => {
        const card = document.createElement("button");
        card.className = "book-card";

        const imgWrapper = document.createElement("div");
        imgWrapper.className = "book-card-image-wrapper";

        const img = document.createElement("img");
        img.src = book.cover;
        img.alt = book.title;

        imgWrapper.appendChild(img);
        card.appendChild(imgWrapper);

        const title = document.createElement("p");
        title.className = "book-card-title";
        title.textContent = book.title;

        card.appendChild(title);

        card.addEventListener("click", () => openModal(book));

        bookGrid.appendChild(card);
    });
}

async function openModal(book) {
    modalTitle.textContent = book.title;
    modalDate.textContent = new Date(book.date).toLocaleDateString();
    modalRating.textContent = `Rating: ${book.rating}/10`;

    modalText.textContent = "Loading review...";
    modal.classList.add("is-open");

    const response = await fetch(book.reviewFile);
    modalText.textContent = await response.text();
}

function closeModal() {
    modal.classList.remove("is-open");
}
