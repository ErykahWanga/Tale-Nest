const API_URL = "https://tale-nest-mpjk.vercel.app/books";

// User activity log
let userActivity = [];

// Fetch and display books on page load
document.addEventListener("DOMContentLoaded", () => {
    fetchBooks();
    loadUserActivity();
});

function fetchBooks() {
    fetch(API_URL)
        .then(res => res.json())
        .then(books => {
            displayBooks(books);
        })
        .catch(err => console.error("Error fetching books:", err));
}

function displayBooks(books) {
  const container = document.getElementById("books-container");
  container.innerHTML = "";

  books.forEach(book => {
      const bookElement = document.createElement("div");
      bookElement.classList.add("book");

      const shortContent = book.content.length > 100 ? book.content.substring(0, 100) + "..." : book.content;

      bookElement.innerHTML = `
          <img src="${book.cover}" 
               alt="Book Cover" 
               class="book-cover" 
               width="250" height="200"
               
          <h3 contenteditable="true" onblur="editBook('${book.id}', 'title', this.innerText)">${book.title}</h3>
          <button onclick="editBookPrompt('${book.id}')">Edit Book </button>

          <p id="content-${book.id}" data-full="${book.content}">${shortContent}</p>
          <button id="read-btn-${book.id}" onclick="toggleReadMore('${book.id}')">Read More </button>
          <button onclick="likeBook('${book.id}')">Like  <span id="like-${book.id}">${book.likes || 0}</span></button>
          <button onclick="deleteBook('${book.id}')">Delete </button>

          <div class="comments">
              <h4>Comments</h4>
              <div id="comments-${book.id}">
                  ${book.comments.map((c, index) => `
                      <p id="comment-${book.id}-${index}">
                          ${c} 
                          <button onclick="editComment('${book.id}', ${index})">Edit ✏️</button>
                      </p>
                  `).join("")}
              </div>
              <input type="text" id="commentInput-${book.id}" placeholder="Write a comment">
              <button onclick="addComment('${book.id}')">Comment</button>
          </div>
      `;
      container.appendChild(bookElement);
  });
}

// Function to edit book with a prompt
function editBookPrompt(bookId) {
  const newTitle = prompt("Enter new book title:");
  const newContent = prompt("Enter new book content:");
  const newCover = prompt("Enter new cover image URL:");

  if (newTitle || newContent || newCover) {
      fetch(`${API_URL}/${bookId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              ...(newTitle && { title: newTitle }),
              ...(newContent && { content: newContent }),
              ...(newCover && { cover: newCover })
          })
      })
      .then(() => {
          fetchBooks();
          logActivity("Edited a book.");
      })
      .catch(err => console.error("Error editing book:", err));
  }
}

// Function to edit comments
function editComment(bookId, commentIndex) {
  const newComment = prompt("Enter your updated comment:");
  if (!newComment) return;

  fetch(`${API_URL}/${bookId}`)
      .then(res => res.json())
      .then(book => {
          book.comments[commentIndex] = newComment;

          return fetch(`${API_URL}/${bookId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ comments: book.comments })
          });
      })
      .then(() => {
          fetchBooks();
          logActivity("Edited a comment.");
      })
      .catch(err => console.error("Error editing comment:", err));
}

function publishBook() {
    const title = document.getElementById("bookTitle").value;
    const content = document.getElementById("bookContent").value;
    const cover = document.getElementById("bookCover").value; // Get cover input

    if (!title || !content || !cover) {
        alert("Please fill in all fields.");
        return;
    }

    const newBook = {
        title,
        content,
        cover, // Ensure cover is included
        likes: 0,
        comments: []
    };

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook)
    })
    .then(res => res.json())
    .then(() => {
        fetchBooks(); // Refresh library
        document.getElementById("bookTitle").value = "";
        document.getElementById("bookContent").value = "";
        document.getElementById("bookCover").value = "";
    })
    .catch(err => console.error("Error adding book:", err));
}

// Like a book
function likeBook(bookId) {
    fetch(`${API_URL}/${bookId}`)
        .then(res => res.json())
        .then(book => {
            return fetch(`${API_URL}/${bookId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ likes: book.likes + 1 })
            });
        })
        .then(() => {
            fetchBooks();
            logActivity("Liked a book.");
        })
        .catch(err => console.error("Error liking book:", err));
}

// Delete a book
function deleteBook(bookId) {
    fetch(`${API_URL}/${bookId}`, { method: "DELETE" })
        .then(() => {
            fetchBooks();
            logActivity("Deleted a book.");
        })
        .catch(err => console.error("Error deleting book:", err));
}

// Add a comment
function addComment(bookId) {
    const commentInput = document.getElementById(`commentInput-${bookId}`);
    const commentText = commentInput.value;

    if (!commentText) return;

    fetch(`${API_URL}/${bookId}`)
        .then(res => res.json())
        .then(book => {
            const updatedComments = [...book.comments, commentText];

            return fetch(`${API_URL}/${bookId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comments: updatedComments })
            });
        })
        .then(() => {
            commentInput.value = "";
            fetchBooks();
            logActivity("Commented on a book.");
        })
        .catch(err => console.error("Error adding comment:", err));
}

// Edit book title
function editBook(bookId, field, value) {
    fetch(`${API_URL}/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
    })
        .catch(err => console.error("Error editing book:", err));
}

// Toggle Read More
function toggleReadMore(bookId) {
    const contentElement = document.getElementById(`content-${bookId}`);
    const readBtn = document.getElementById(`read-btn-${bookId}`);
    const fullContent = contentElement.getAttribute("data-full");

    if (contentElement.innerText.includes("...")) {
        contentElement.innerText = fullContent;
        readBtn.innerText = "Show Less ";
    } else {
        contentElement.innerText = fullContent.substring(0, 100) + "...";
        readBtn.innerText = "Read More ";
    }
}

// Log user activity
function logActivity(activity) {
    userActivity.push({ text: activity, timestamp: new Date().toLocaleTimeString() });
    saveUserActivity();
    displayUserActivity();
}

// Save activity to localStorage
function saveUserActivity() {
    localStorage.setItem("userActivity", JSON.stringify(userActivity));
}

// Load activity from localStorage
function loadUserActivity() {
    const storedActivity = localStorage.getItem("userActivity");
    if (storedActivity) {
        userActivity = JSON.parse(storedActivity);
        displayUserActivity();
    }
}

// Display user activity in the profile section
function displayUserActivity() {
    const activityLog = document.getElementById("activity-log");
    activityLog.innerHTML = userActivity.map(act => `<p>${act.timestamp} - ${act.text}</p>`).join("");
}

// Show sections
function showSection(sectionId) {
    document.querySelectorAll("section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(sectionId).classList.remove("hidden");
}
 
function searchBooks() {
  const query = document.getElementById("searchInput").value.toLowerCase();

  fetch(API_URL)
      .then(res => res.json())
      .then(books => {
          const filteredBooks = books.filter(book => 
              book.title.toLowerCase().includes(query) || 
              book.content.toLowerCase().includes(query)
          );
          displayBooks(filteredBooks);
      })
      .catch(err => console.error("Error searching books:", err));
}


