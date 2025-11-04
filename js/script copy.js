let poems = [];
let currentIndex = 0;

const container = document.getElementById('poem-container');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

async function loadPoemList() {
    try {
        const response = await fetch('file/index.json');
        poems = await response.json();
        if (poems.length > 0) loadPoem(0);
        else container.innerHTML = "<p>No poems found.</p>";
    } catch (error) {
        console.error('Error loading poem list:', error);
        container.innerHTML = "<p>Failed to load poems.</p>";
    }
}

async function loadPoem(index) {
    if (index < 0 || index >= poems.length) return;

    container.innerHTML = '<p class="loading">Loading poem...</p>';
    const poemFile = poems[index];

    try {
        const response = await fetch(`file/${poemFile}`);
        const text = await response.text();

        container.innerHTML = `
            <div class="poem-card">
                <h2 class="poem-title">${poemFile.replace('.txt', '').replace(/_/g, ' ')}</h2>
                <pre class="poem-content">${text}</pre>
            </div>
        `;
        currentIndex = index;
    } catch (error) {
        console.error('Error loading poem:', poemFile, error);
        container.innerHTML = "<p>Failed to load this poem.</p>";
    }
}

prevBtn.addEventListener('click', () => {
    const newIndex = (currentIndex - 1 + poems.length) % poems.length;
    loadPoem(newIndex);
});

nextBtn.addEventListener('click', () => {
    const newIndex = (currentIndex + 1) % poems.length;
    loadPoem(newIndex);
});

document.addEventListener('DOMContentLoaded', loadPoemList);
