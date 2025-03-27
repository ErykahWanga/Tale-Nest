let books = []; // Array to store books
let userLikes = [];
let userComments = [];
let userPublishedBooks = [];
let isLoggedIn = false; // Track login state
let users = {}; // Object to store user data

// Show specified section
function showSection(section) {
    document.getElementById('signup-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('book-list').style.display = 'none';
    document.getElementById('publish-new-book').style.display = 'none';
    document.getElementById('profile-section').style.display = 'none';
    document.getElementById('book-detail').style.display = 'none'; 

    if (section === 'library') {
        if (!isLoggedIn) {
            alert("Please log in to access the library.");
            return;
        }
        document.getElementById('book-list').style.display = 'block';
        fetchBooks();
    } else if (section === 'write') {
        document.getElementById('publish-new-book').style.display = 'block';
    } else if (section === 'profile') {
        document.getElementById('profile-section').style.display = 'block';
        displayProfile();
    } else if (section === 'login') {
        document.getElementById('login-section').style.display = 'block';
    } else if (section === 'signup') {
        document.getElementById('signup-section').style.display = 'block';
    }
}

// Fetch books from server
async function fetchBooks() {
    try {
        const response = await fetch('http://localhost:3000/books');
        const data = await response.json();
        books = data;
        displayBooks(books);
    } catch (error) {
        console.error('Error fetching book data:', error);
    }
}

// Display books in the DOM
function displayBooks(bookArray) {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';
    bookArray.forEach(book => {
        const bookDiv = document.createElement('div');
        const shortDescription = book.content.length > 100 ? book.content.substring(0, 100) + '...' : book.content;

        bookDiv.classList.add('book');
        bookDiv.innerHTML = `
            <h3>${book.title}</h3>
            <img src="${book.coverImage}" alt="${book.title} Cover" class="book-cover">
            <p>${shortDescription}</p>
            <button onclick="readMore(${book.id})">Read More</button>
            <p>Likes: <span id="likes-${book.id}">${book.likes}</span> <span class="like-button" onclick="likeBook(${book.id})">Like</span></p>
            <button onclick="editBook(${book.id})">Edit Book</button>
            <button onclick="deleteBook(${book.id})">Delete Book</button>
            <div class="comments">
                <strong>Comments:</strong>
                <ul id="comments-${book.id}">
                    ${book.comments.map((comment, index) => `
                        <li>
                            ${comment.text}
                            <button onclick="editComment(${book.id}, ${index})">Edit</button>
                        </li>`).join('')}
                </ul>
                <input type="text" id="comment-input-${book.id}" placeholder="Add a comment...">
                <button onclick="commentOnBook(${book.id})">Comment</button>
            </div>
        `;
        bookList.appendChild(bookDiv);
    });
}

// Read more about a book
function readMore(bookId) {
    const book = books.find(b => b.id === String(bookId));
    if (book) {
        const bookDetail = `
            <h3>${book.title}</h3>
            <img src="${book.coverImage}" alt="${book.title} Cover" class="book-cover">
            <p>${book.content}</p>
            <button onclick="hideReadMore()">Close</button>
        `;

        const bookDetailSection = document.getElementById('book-detail');
        bookDetailSection.innerHTML = bookDetail;
        bookDetailSection.style.display = 'block'; // Show the book detail section
    }
}

// Hide the read more detail
function hideReadMore() {
    const bookDetailSection = document.getElementById('book-detail');
    bookDetailSection.style.display = 'none'; // Hide the detail section
}

// Login functionality
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (users[username] && users[username].password === password) {
        isLoggedIn = true;
        document.getElementById('login-message').innerText = "Login successful!";
        showSection('library'); // Redirect to the library after successful login
    } else {
        document.getElementById('login-message').innerText = "Invalid username or password.";
    }
}

// Sign Up functionality
function signup() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    if (username && password) {
        if (!users[username]) {
            users[username] = { password: password, likes: [], comments: [], publishedBooks: [] };
            document.getElementById('signup-message').innerText = "Sign up successful! You can now log in.";
            document.getElementById('signup-username').value = '';
            document.getElementById('signup-password').value = '';
        } else {
            document.getElementById('signup-message').innerText = "Username already exists.";
        }
    } else {
        document.getElementById('signup-message').innerText = "Please fill in both fields.";
    }
}

// Like a book
async function likeBook(bookId) {
    const book = books.find(b => b.id == bookId);
    if (book && !userLikes.includes(bookId)) {
        book.likes += 1;
        userLikes.push(bookId);

        try {
            const response = await fetch(`http://localhost:3000/books/${bookId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ likes: book.likes }),
            });

            if (!response.ok) {
                throw new Error('Failed to update likes on the server');
            }

            document.getElementById(`likes-${bookId}`).innerText = book.likes;

            // Update profile section
            const likedBooksList = document.getElementById('liked-books-list');
            const listItem = document.createElement('li');
            listItem.textContent = book.title;
            likedBooksList.appendChild(listItem);
        } catch (error) {
            console.error('Error liking book:', error);
        }
    }
}

// Comment on a book
async function commentOnBook(bookId) {
    const commentInput = document.getElementById(`comment-input-${bookId}`);
    const commentText = commentInput.value.trim();
    if (commentText) {
        const book = books.find(b => b.id === String(bookId));
        if (book) {
            book.comments.push({ text: commentText });
            userComments.push({ bookId: bookId, text: commentText });
            displayBooks(books);
            displayProfile();
            commentInput.value = '';

            // Update comments on the server
            try {
                const response = await fetch(`http://localhost:3000/books/${bookId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comments: book.comments }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update comments on the server');
                }
            } catch (error) {
                console.error('Error commenting on book:', error);
            }
        }
    }
}

// Display user profile
function displayProfile() {
    const likedBooksList = document.getElementById('liked-books-list');
    const yourCommentsList = document.getElementById('your-comments-list');
    const yourPublishedBooksList = document.getElementById('your-published-books-list');

    likedBooksList.innerHTML = '';
    yourCommentsList.innerHTML = '';
    yourPublishedBooksList.innerHTML = '';

    // Display liked books
    userLikes.forEach(bookId => {
        const book = books.find(b => b.id === String(bookId));
        if (book) {
            const listItem = document.createElement('li');
            listItem.textContent = book.title;
            likedBooksList.appendChild(listItem);
        }
    });

    // Display user's comments
    userComments.forEach(comment => {
        const book = books.find(b => b.id === String(comment.bookId));
        if (book) {
            const listItem = document.createElement('li');
            listItem.textContent = `Comment on "${book.title}": ${comment.text}`;
            yourCommentsList.appendChild(listItem);
        }
    });

    // Display user's published books
    userPublishedBooks.forEach(book => {
        const listItem = document.createElement('li');
        listItem.textContent = book.title;
        yourPublishedBooksList.appendChild(listItem);
    });
}

// Edit a book
async function editBook(bookId) {
    const book = books.find(b => b.id === String(bookId));
    if (book) {
        const newTitle = prompt("Edit Book Title:", book.title);
        const newContent = prompt("Edit Book Content:", book.content);
        if (newTitle !== null && newContent !== null) {
            book.title = newTitle;
            book.content = newContent;
            displayBooks(books);

            // Update the book on the server
            try {
                const response = await fetch(`http://localhost:3000/books/${bookId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: book.title, content: book.content }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update book on the server');
                }
            } catch (error) {
                console.error('Error editing book:', error);
            }
        }
    }
}

// Edit a comment
async function editComment(bookId, commentIndex) {
    const book = books.find(b => b.id === String(bookId));
    if (book && book.comments[commentIndex]) {
        const newComment = prompt("Edit your comment:", book.comments[commentIndex].text);
        if (newComment !== null) {
            book.comments[commentIndex].text = newComment;
            displayBooks(books);
            displayProfile();

            // Update comments on the server
            try {
                const response = await fetch(`http://localhost:3000/books/${bookId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comments: book.comments }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update comment on the server');
                }
            } catch (error) {
                console.error('Error updating comment:', error);
            }
        }
    }
}

// Delete a book
async function deleteBook(bookId) {
    try {
        const response = await fetch(`http://localhost:3000/books/${bookId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            books = books.filter(b => b.id !== String(bookId));
            displayBooks(books);
        } else {
            console.error('Error deleting book:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting book:', error);
    }
}

// Publish a new book
async function publishBook() {
    const titleInput = document.getElementById('new-book-title');
    const contentInput = document.getElementById('new-book-content');

    const newTitle = titleInput.value.trim();
    const newContent = contentInput.value.trim();

    if (newTitle && newContent) {
        const newBook = {
            id: String(books.length + 1),  // Incremental ID
            title: newTitle,
            content: newContent,
            likes: 0,
            comments: [],
            coverImage: 'https://example.com/covers/default_cover.jpg' // Placeholder for the cover image
        };

        books.push(newBook);
        userPublishedBooks.push(newBook);

        // Send new book to server
        try {
            const response = await fetch(`http://localhost:3000/books`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBook),
            });

            if (!response.ok) {
                throw new Error('Failed to publish new book on the server');
            }

            displayBooks(books);
            displayProfile();
            titleInput.value = '';
            contentInput.value = '';
        } catch (error) {
            console.error('Error publishing a new book:', error);
        }
    }
}

// Search for books
function searchBooks() {
    const query = document.getElementById('search').value.toLowerCase();
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(query)
    );
    displayBooks(filteredBooks);
}

// Show library section on initial load
showSection('login');