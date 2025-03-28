// Variable declarations
let books = [];
let userLikes = [];
let userComments = [];
let userPublishedBooks = [];

// Show specified section
function showSection(section) {
  const sections = ['book-list', 'publish-new-book', 'profile-section', 'book-detail'];

  // Hide all sections
  sections.forEach(id => {
    let element = document.getElementById(id);
    if (element) {
      element.style.display = 'none';
    } else {
      console.error(`Element with ID '${id}' not found`);
    }
  });

  // Show the selected section
  let selectedSection = document.getElementById(section === 'library' ? 'book-list' :
                                                 section === 'write' ? 'publish-new-book' :
                                                 section === 'profile' ? 'profile-section' : null);

  if (selectedSection) {
    selectedSection.style.display = 'block';
  }

  // Call relevant functions
  if (section === 'library') {
    if (typeof fetchBooks === "function") {
      fetchBooks();
    } else {
      console.error("fetchBooks function not defined");
    }
  } else if (section === 'profile') {
    if (typeof displayProfile === "function") {
      displayProfile();
    } else {
      console.error("displayProfile function not defined");
    }
  }
}


// Fetch books from server
async function fetchBooks() {
  try {
    const response = await fetch('https://tale-nest-mpjk.vercel.app/books');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    books = data; // Save the books data
    displayBooks(books); // Call to display books
  } catch (error) {
    console.error('Error fetching book data:', error);
    alert('Failed to fetch books. Please try again later.'); // Alert user in case of failure
  }
}

// Display books in the DOM
function displayBooks(bookArray) {
  const bookList = document.getElementById('book-list');
  bookList.innerHTML = ''; // Clear existing content
  bookArray.forEach(book => {
    const shortDescription = book.content.length > 100 ? `${book.content.substring(0, 100)}...` : book.content;

    const bookDiv = document.createElement('div');
    bookDiv.classList.add('book');
    bookDiv.innerHTML = `
      <h3>${escapeHtml(book.title)}</h3>
      <img src="${escapeHtml(book.coverImage)}" alt="${escapeHtml(book.title)} Cover" class="book-cover">
      <p>${escapeHtml(shortDescription)}</p>
      <button onclick="readMore('${book.id}')">Read More</button>
      <p>Likes: <span id="likes-${book.id}">${book.likes}</span> 
      <button class="like-button" onclick="likeBook('${book.id}')">Like</button></p>
      <button onclick="editBook('${book.id}')">Edit Book</button>
      <button onclick="deleteBook('${book.id}')">Delete Book</button>
      <div class="comments">
        <strong>Comments:</strong>
        <ul id="comments-${book.id}">
          ${book.comments.map((comment, index) => `
            <li>
              ${escapeHtml(comment.text)}
              <button onclick="editComment('${book.id}', ${index})">Edit</button>
            </li>`).join('')}
        </ul>
        <input type="text" id="comment-input-${book.id}" placeholder="Add a comment...">
        <button onclick="commentOnBook('${book.id}')">Comment</button>
      </div>
    `;
    bookList.appendChild(bookDiv);
  });
}

// Escape HTML to prevent XSS
function escapeHtml(string) {
  const div = document.createElement('div');
  div.innerText = string;
  return div.innerHTML;
}

// Read more about a book
function readMore(bookId) {
  const book = books.find(b => b.id === bookId);
  if (book) {
    const bookDetail = `
      <h3>${escapeHtml(book.title)}</h3>
      <img src="${escapeHtml(book.coverImage)}" alt="${escapeHtml(book.title)} Cover" class="book-cover">
      <p>${escapeHtml(book.content)}</p>
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

// Like a book
async function likeBook(bookId) {
  const book = books.find(b => b.id === bookId);
  if (book) {
    book.likes += 1; // Update local count
    document.getElementById(`likes-${book.id}`).textContent = book.likes; // Update UI immediately

    // Send the updated likes to the server
    await updateBookOnServer(bookId, { likes: book.likes });
  }
}

// Comment on a book
async function commentOnBook(bookId) {
  const commentInput = document.getElementById(`comment-input-${bookId}`);
  const commentText = commentInput.value.trim();

  if (commentText) {
    const book = books.find(b => b.id === bookId);
    if (book) {
      const newComment = { text: commentText };
      book.comments.push(newComment);
      userComments.push({ bookId: bookId, text: commentText });
      commentInput.value = ''; // Clear input field

      // Update comments on the server
      await updateCommentsOnServer(bookId, book.comments);
    }
  }
}

// Update comments on the server
async function updateCommentsOnServer(bookId, comments) {
  try {
    const response = await fetch(`https://tale-nest-mpjk.vercel.app/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments }),
    });

    if (response.ok) {
      displayBooks(books); // Refresh the displayed book list
      displayProfile(); // Refresh user's profile
    } else {
      console.error('Failed to update comments on the server');
    }
  } catch (error) {
    console.error('Error commenting on book:', error);
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
    const book = books.find(b => b.id === bookId);
    if (book) {
      const listItem = document.createElement('li');
      listItem.textContent = escapeHtml(book.title);
      likedBooksList.appendChild(listItem);
    }
  });

  // Display user's comments
  userComments.forEach(comment => {
    const book = books.find(b => b.id === comment.bookId);
    if (book) {
      const listItem = document.createElement('li');
      listItem.textContent = `Comment on "${escapeHtml(book.title)}": ${escapeHtml(comment.text)}`;
      yourCommentsList.appendChild(listItem);
    }
  });

  // Display user's published books
  userPublishedBooks.forEach(book => {
    const listItem = document.createElement('li');
    listItem.textContent = escapeHtml(book.title);
    yourPublishedBooksList.appendChild(listItem);
  });
}

// Edit a book
async function editBook(bookId) {
  const book = books.find(b => b.id === bookId);
  if (book) {
    const newTitle = prompt("Edit Book Title:", book.title);
    const newContent = prompt("Edit Book Content:", book.content);
    if (newTitle !== null && newContent !== null) {
      book.title = newTitle;
      book.content = newContent;
      await updateBookOnServer(bookId, { title: book.title, content: book.content });
    }
  }
}

// Update book on the server
async function updateBookOnServer(bookId, updates) {
  try {
    const response = await fetch(`https://tale-nest-mpjk.vercel.app/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      console.error('Failed to update book on the server');
    } else {
      displayBooks(books); // Refresh displayed books list
    }
  } catch (error) {
    console.error('Error updating book:', error);
  }
}

// Edit a comment
async function editComment(bookId, commentIndex) {
  const book = books.find(b => b.id === bookId);
  if (book && book.comments[commentIndex]) {
    const newComment = prompt("Edit your comment:", book.comments[commentIndex].text);
    if (newComment !== null) {
      book.comments[commentIndex].text = newComment;
      await updateCommentsOnServer(bookId, book.comments);
    }
  }
}

async function deleteBook(bookId) {
  console.log(`Attempting to delete book with ID: ${bookId}`);

  if (!bookId) {
    console.error("Error: Invalid book ID");
    alert("Error: Invalid book ID");
    return;
  }

  try {
    const token = localStorage.getItem("token"); // Get token if authentication is needed

    const response = await fetch(`https://tale-nest-mpjk.vercel.app/books/${bookId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`, // Add authentication if required
        "Content-Type": "application/json"
      }
    });

    const responseText = await response.text();
    console.log("Response Status:", response.status);
    console.log("Response Body:", responseText); // Debug API response

    if (response.ok) {
      // Remove the book from the local books array
      books = books.filter((b) => b.id !== bookId);
      
      // Remove the book from the UI
      const bookElement = document.getElementById(`book-${bookId}`);
      if (bookElement) {
        bookElement.remove();
      }

      console.log(" Book deleted successfully.");
    } else {
      console.error(" Failed to delete:", response.statusText);
      alert(` Failed to delete: ${responseText}`);
    }
  } catch (error) {
    console.error(" Fetch error:", error);
    alert(" An error occurred while deleting the book. Please try again.");
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
      title: newTitle,
      content: newContent,
      likes: 0,
      comments: [],
      coverImage: 'https://example.com/covers/default_cover.jpg' // Placeholder for cover image
    };

    try {
      const response = await fetch('https://tale-nest-mpjk.vercel.app/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook),
      });

      if (response.ok) {
        const publishedBook = await response.json();
        books.push(publishedBook);
        userPublishedBooks.push(publishedBook);
        displayBooks(books); // Refresh displayed book list
        displayProfile(); // Refresh user profile
        titleInput.value = '';
        contentInput.value = '';
      } else {
        console.error('Failed to publish new book on the server');
      }
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
  displayBooks(filteredBooks); // Show filtered results
}

// Show library section on initial load
showSection('library');