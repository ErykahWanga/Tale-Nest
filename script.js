let books = []; // Array to store books
let userLikes = [];
let userComments = [];
let userPublishedBooks = [];


function showSection(section) {
    document.getElementById('book-list').style.display = 'none';
    document.getElementById('publish-new-book').style.display = 'none';
    document.getElementById('profile-section').style.display = 'none';

    if (section === 'library') {
        document.getElementById('book-list').style.display = 'block';
        fetchBooks();
    } else if (section === 'write') {
        document.getElementById('publish-new-book').style.display = 'block';
    } else if (section === 'profile') {
        document.getElementById('profile-section').style.display = 'block';
        displayProfile();
    }
}ync


async function fetchBooks() {
    try {
        const response = await fetch('http://localhost:3000/books'); // Fetch from JSON Server
        const data = await response.json();
        books = data; // Store in global books array
        displayBooks(books);
    } catch (error) {
        console.error('Error fetching book data:', error);
    }
}

//display books
function displayBooks(bookArray) {
    const bookList = document.getElementById('book-list'); // Get the book list element
    bookList.innerHTML = '';
    bookArray.forEach(book => { // Loop through the books array
        const bookDiv = document.createElement('div');
        bookDiv.classList.add('book');
        bookDiv.innerHTML = `
            <h3>${book.title}</h3>
            <p>${book.content}</p>
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


async function likeBook(bookId) {
    const book = books.find(b => b.id == bookId); // Loose comparison to handle string/number mismatch
    if (book && !userLikes.includes(bookId)) {
        book.likes += 1;
        userLikes.push(bookId); // Track user likes

        try {
            await fetch(`http://localhost:3000/books/${bookId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ likes: book.likes }),
            });

            document.getElementById(`likes-${bookId}`).innerText = book.likes;
        } catch (error) {
            console.error('Error liking book:', error);
        }

        // UPDATE PROFILE SECTION
        const likedBooksList = document.getElementById('liked-books-list');
        const listItem = document.createElement('li');
        listItem.textContent = book.title;
        likedBooksList.appendChild(listItem);
    }
}


// Function to comment on a book
async function commentOnBook(bookId) {
    const commentInput = document.getElementById(`comment-input-${bookId}`);
    const commentText = commentInput.value.trim();
    if (commentText) {
        const book = books.find(b => b.id === String(bookId));
        if (book) {
            book.comments.push({ text: commentText });
            userComments.push({ bookId: bookId, text: commentText }); // Track user's comments
            displayBooks(books);
            displayProfile(); // Update profile section with new comment
            commentInput.value = '';
        }
    }
}

// display user profile
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
        if(book) {
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

// Function to edit a book
function editBook(bookId) {
    const book = books.find(b => b.id === String(bookId));
    if (book) {
        const newTitle = prompt("Edit Book Title:", book.title);
        const newContent = prompt("Edit Book Content:", book.content);
        if (newTitle !== null && newContent !== null) {
            book.title = newTitle;
            book.content = newContent;
            displayBooks(books);
        }
    }
}

// Function to edit a comment
function editComment(bookId, commentIndex) {
    const book = books.find(b => b.id === String(bookId));
    if (book && book.comments[commentIndex]) {
        const newComment = prompt("Edit your comment:", book.comments[commentIndex].text);
        if (newComment !== null) {
            book.comments[commentIndex].text = newComment;
            displayBooks(books);
            displayProfile(); // Update profile section with edited comment
        }
    }
}

// Function to delete a book
function deleteBook(bookId) {
    books = books.filter(b => b.id !== String(bookId));
    displayBooks(books);
}

// publish a new book
function publishBook() {
    const titleInput = document.getElementById('new-book-title');
    const contentInput = document.getElementById('new-book-content');

    const newTitle = titleInput.value.trim();
    const newContent = contentInput.value.trim();

    if (newTitle && newContent) {
        const newBook = {
            id: String(books.length + 1),
            title: newTitle,
            content: newContent,
            likes: 0,
            comments: []
        };
        books.push(newBook);
        userPublishedBooks.push(newBook); // Track the user's published books
        displayBooks(books);
        displayProfile(); // Update the profile section immediately

        titleInput.value = '';
        contentInput.value = '';
    }
}

// Function to search for books
function searchBooks() {
    const query = document.getElementById('search').value.toLowerCase();
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(query)
    );
    displayBooks(filteredBooks);
}

// Show library section on initial load
showSection('library');
// Fetch books on page load
fetchBooks();   
