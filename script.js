document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('.main-container');
    let books = JSON.parse(localStorage.getItem('books')) || [
        { id: 1, title: "The Lost Realm", content: "Once upon a time in a hidden kingdom...", likes: 0, comments: [] },
        { id: 2, title: "The Forgotten Forest", content: "Deep within the woods, a secret lay hidden...", likes: 0, comments: [] },
        { id: 3, title: "Echoes of the Past", content: "A mysterious voice whispered through the ages...", likes: 0, comments: [] }
    ];
    
    function updateMainContent(content) {
        mainContainer.innerHTML = '';
        mainContainer.appendChild(content);
    }

    function isLoggedIn() {
        return localStorage.getItem("loggedInUser") !== null;
    }

    function requireLogin() {
        alert("You must be logged in to access this section.");
        updateMainContent(createLoginSection());
    }

    function createHomeSection() {
        const section = document.createElement('section');
        section.id = 'home';
        section.innerHTML = `
            <h2>Read, Write, Share</h2>
            <p>Join the TaleNest community and explore a world of stories.</p>
            <button id="hero-btn">Get Started</button>
        `;
        section.querySelector('#hero-btn').addEventListener('click', () => updateMainContent(createLoginSection()));
        return section;
    }

    function createLibrarySection() {
        if (!isLoggedIn()) return requireLogin();

        const section = document.createElement('section');
        section.id = 'library';
        section.innerHTML = `<h2>Library</h2>`;

        const bookContainer = document.createElement('div');
        bookContainer.className = 'book-container';

        books.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'book';
            bookDiv.innerHTML = `
                <h3>${book.title}</h3>
                <button class="read-btn" data-id="${book.id}">Read</button>
                <button class="edit-story-btn" data-id="${book.id}">Edit</button>
                <button class="delete-btn" data-id="${book.id}">Delete</button>
            `;
            bookContainer.appendChild(bookDiv);
        });

        section.appendChild(bookContainer);

        section.addEventListener('click', (event) => {
            const bookId = event.target.getAttribute('data-id');
            if (event.target.classList.contains('read-btn')) {
                updateMainContent(createBookView(bookId));
            } else if (event.target.classList.contains('edit-story-btn')) {
                updateMainContent(createEditStoryView(bookId));
            } else if (event.target.classList.contains('delete-btn')) {
                books = books.filter(b => b.id != bookId);
                localStorage.setItem('books', JSON.stringify(books));
                updateMainContent(createLibrarySection());
            }
        });

        return section;
    }

    function createBookView(bookId) {
        const book = books.find(b => b.id == bookId);
        if (!book) return createLibrarySection();

        const section = document.createElement('section');
        section.id = 'book-view';
        section.innerHTML = `
            <h2>${book.title}</h2>
            <p>${book.content}</p>
            <button id="like-btn">Like (${book.likes})</button>
            <div id="comments">
                ${book.comments.map((c, index) => `
                    <p>${c} 
                        <button class='edit-comment' data-id='${book.id}' data-index='${index}'>Edit</button>
                        <button class='delete-comment' data-id='${book.id}' data-index='${index}'>Delete</button>
                    </p>`).join('')}
            </div>
            <input type="text" id="comment-input" placeholder="Add a comment...">
            <button id="comment-btn">Comment</button>
            <button id="go-back">Go Back</button>
        `;

        section.querySelector('#like-btn').addEventListener('click', () => {
            book.likes++;
            localStorage.setItem('books', JSON.stringify(books));
            updateMainContent(createBookView(bookId));
        });

        section.querySelector('#comment-btn').addEventListener('click', () => {
            const commentInput = section.querySelector('#comment-input').value;
            if (commentInput.trim()) {
                book.comments.push(commentInput);
                localStorage.setItem('books', JSON.stringify(books));
                updateMainContent(createBookView(bookId));
            }
        });

        section.addEventListener('click', (event) => {
            if (event.target.classList.contains('edit-comment')) {
                const commentIndex = event.target.getAttribute('data-index');
                const newComment = prompt("Edit your comment:", book.comments[commentIndex]);
                if (newComment !== null) {
                    book.comments[commentIndex] = newComment;
                    localStorage.setItem('books', JSON.stringify(books));
                    updateMainContent(createBookView(bookId));
                }
            } else if (event.target.classList.contains('delete-comment')) {
                const commentIndex = event.target.getAttribute('data-index');
                book.comments.splice(commentIndex, 1);
                localStorage.setItem('books', JSON.stringify(books));
                updateMainContent(createBookView(bookId));
            } else if (event.target.id === 'go-back') {
                updateMainContent(createLibrarySection());
            }
        });

        return section;
    }

    function createEditStoryView(bookId) {
        const book = books.find(b => b.id == bookId);
        if (!book) return createLibrarySection();

        const section = document.createElement('section');
        section.innerHTML = `
            <h2>Edit Story</h2>
            <input type="text" id="edit-title" value="${book.title}">
            <textarea id="edit-content">${book.content}</textarea>
            <button id="save-edit">Save</button>
            <button id="go-back">Go Back</button>
        `;

        section.querySelector('#save-edit').addEventListener('click', () => {
            book.title = section.querySelector('#edit-title').value;
            book.content = section.querySelector('#edit-content').value;
            localStorage.setItem('books', JSON.stringify(books));
            updateMainContent(createLibrarySection());
        });

        section.querySelector('#go-back').addEventListener('click', () => {
            updateMainContent(createLibrarySection());
        });

        return section;
    }

    document.getElementById('home').addEventListener('click', () => updateMainContent(createHomeSection()));
    document.getElementById('Library').addEventListener('click', () => updateMainContent(createLibrarySection()));
    document.getElementById('write').addEventListener('click', () => updateMainContent(createWriteSection()));

    updateMainContent(createHomeSection());
});
