document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('.main-container');

    function updateMainContent(content) {
        mainContainer.innerHTML = '';
        mainContainer.appendChild(content);
    }

    function isLoggedIn() {
        return localStorage.getItem("loggedInUser") !== null;
    }

    function requireLogin() {
        alert("You must be logged in to access this section.");
        window.location.href = 'login';
    }

    function createHomeSection() {
        const section = document.createElement('section');
        section.id = 'home';
        section.innerHTML = `
            <h2>Read, Write, Share</h2>
            <p>Join the TaleNest community and explore a world of stories.</p>
            <button id="hero-btn">Get Started</button>
        `;
        section.querySelector('#hero-btn').addEventListener('click', () => {
            updateMainContent(createLoginSection()); // Redirect to login section
        });
        return section;
    }
    
    function createLibrarySection() {
        if (!isLoggedIn()) {
            requireLogin();
            return;
        }

        const section = document.createElement('section');
        section.id = 'library';
        section.innerHTML = `
            <h2>Library</h2>
            <p>Browse through a vast collection of stories from various genres.</p>
        `;
        return section;
    }

    function createWriteSection() {
        if (!isLoggedIn()) {
            requireLogin();
            return;
        }

        const section = document.createElement('section');
        section.id = 'write';
        section.innerHTML = `
            <h2>Write</h2>
            <p>Unleash your creativity and share your stories with the world.</p>
            <div class="publish-area">
                <textarea id="story-content" placeholder="Start writing your story here..."></textarea>
                <button id="publish-btn">Publish</button>
            </div>
        `;
        section.querySelector('#publish-btn').addEventListener('click', () => {
            const storyContent = section.querySelector('#story-content').value;
            if (storyContent.trim()) {
                alert('Your story has been published!');
                section.querySelector('#story-content').value = '';
            } else {
                alert('Please write something before publishing.');
            }
        });
        return section;
    }

    function createSearchSection() {
        const section = document.createElement('section');
        section.id = 'search';
        section.innerHTML = `
            <h2>Search</h2>
            <p>Find your favorite stories or authors with ease.</p>
        `;
        return section;
    }

    function createProfileSection() {
        if (!isLoggedIn()) {
            requireLogin();
            return;
        }

        const section = document.createElement('section');
        section.id = 'profile';
        section.innerHTML = `
            <h2>Profile</h2>
            <p>View your profile and manage your stories.</p>
            <div class="profile-area">
                <div class="profile-picture">
                    <img src="path/to/profile-picture.jpg" alt="Profile Picture">
                </div>
                <div class="profile-details">
                    <h3>Username</h3>
                    <p>Email: user@example.com</p>
                    <p>Stories Published: 10</p>
                    <p>Followers: 200</p>
                    <button id="logout">Logout</button>
                </div>
            </div>
        `;
        
        section.querySelector("#logout").addEventListener("click", () => {
            localStorage.removeItem("loggedInUser");
            alert("Logged out successfully!");
            window.location.href = "index.html";
        });

        return section;
    }
    function createLoginSection() {
        const section = document.createElement('section');
        section.id = 'login';
        section.innerHTML = `
            <h2>Login</h2>
            <p>Access your account to explore and share stories.</p>
            <form id="login-form">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                <button type="submit">Login</button>
            </form>
        `;
        return section;
    }

    // Event Delegation for Login Form
    document.addEventListener('submit', (event) => {
        if (event.target.id === 'login-form') {
            event.preventDefault();
            const username = event.target.querySelector('#username').value;
            const password = event.target.querySelector('#password').value;

            if (username && password) {
                localStorage.setItem('loggedInUser', username);
                alert('Login successful!');
                window.location.href = 'index.html';
            } else {
                alert('Please fill in all fields.');
            }
        }
    });

    // Event Listeners for Navigation
    document.getElementById('home').addEventListener('click', () => updateMainContent(createHomeSection()));
    document.getElementById('Library').addEventListener('click', () => updateMainContent(createLibrarySection()));
    document.getElementById('write').addEventListener('click', () => updateMainContent(createWriteSection()));
    document.getElementById('search').addEventListener('click', () => updateMainContent(createSearchSection()));
    document.getElementById('profile').addEventListener('click', () => updateMainContent(createProfileSection()));

    // Load Home section by default
    updateMainContent(createHomeSection());
});