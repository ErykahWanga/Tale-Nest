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
        </section>
    `;
});

document.getElementById('search').addEventListener('click', () => {
    document.querySelector('.main-container').innerHTML = `
        <section id="search">
            <h2>Search</h2>
            <p>Find your favorite stories or authors with ease.</p>
        </section>
    `;
});