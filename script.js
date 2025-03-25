document.getElementById('home').addEventListener('click', () => {
    document.querySelector('.main-container').innerHTML = `
        <section id="home">
            <h2>Read, Write, Share</h2>
            <p>Join the TaleNest community and explore a world of stories.</p>
            <button id="hero-btn">Get Started</button>
        </section>
    `;
});

document.getElementById('Library').addEventListener('click', () => {
    document.querySelector('.main-container').innerHTML = `
        <section id="library">
            <h2>Library</h2>
            <p>Browse through a vast collection of stories from various genres.</p>
        </section>
    `;
});

document.getElementById('write').addEventListener('click', () => {
    document.querySelector('.main-container').innerHTML = `
        <section id="write">
            <h2>Write</h2>
            <p>Unleash your creativity and share your stories with the world.</p>
            <div class="publish-area">
                <textarea id="story-content" placeholder="Start writing your story here..."></textarea>
                <button id="publish-btn">Publish</button>
            </div>
        </section>
    `;

    document.getElementById('publish-btn').addEventListener('click', () => {
        const storyContent = document.getElementById('story-content').value;
        if (storyContent.trim()) {
            alert('Your story has been published!');
            document.getElementById('story-content').value = ''; 
        } else {
            alert('Please write something before publishing.');
        }
    });
});

document.getElementById('search').addEventListener('click', () => {
    document.querySelector('.main-container').innerHTML = `
        <section id="search">
            <h2>Search</h2>
            <p>Find your favorite stories or authors with ease.</p>
        </section>
    `;
});
document.getElementById('profile').addEventListener('click', () => {
    document.querySelector('.main-container').innerHTML = `
        <section id="profile">
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
                </div>
            </div>
        </section>
    `;
});