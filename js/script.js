let poems = [];
let currentIndex = 0;

const container = document.getElementById('poem-container');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const poemList = document.getElementById('poemList');
const sidebar = document.getElementById('sidebar');
const toggleSidebar = document.getElementById('toggleSidebar');
const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');

async function loadPoemList() {
  try {
    const response = await fetch('file/index.json');
    poems = await response.json();

    if (poems.length > 0) {
      populateSidebar();
      loadPoem(0);
    } else {
      container.innerHTML = "<p>No poems found.</p>";
    }
  } catch (error) {
    console.error('Error loading poem list:', error);
    container.innerHTML = "<p>Failed to load poems.</p>";
  }
}

function populateSidebar() {
  poemList.innerHTML = '';
  poems.forEach((poemFile, index) => {
    const li = document.createElement('li');
    li.textContent = poemFile.replace('.txt', '').replace(/_/g, ' ');
    li.addEventListener('click', () => {
      loadPoem(index);
      sidebar.classList.remove('show'); // close sidebar on mobile after selecting
    });
    poemList.appendChild(li);
  });
}

async function loadPoem(index) {
  if (index < 0 || index >= poems.length) return;

  // Highlight current poem in sidebar
  [...poemList.children].forEach((li, i) => {
    li.classList.toggle('active', i === index);
  });

  container.classList.add('fade-out');
  await new Promise(resolve => setTimeout(resolve, 400));

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

  container.classList.remove('fade-out');
}

// Sidebar toggle
toggleSidebar.addEventListener('click', () => {
  sidebar.classList.toggle('show');
});

// Navigation
prevBtn.addEventListener('click', () => {
  const newIndex = (currentIndex - 1 + poems.length) % poems.length;
  loadPoem(newIndex);
});

nextBtn.addEventListener('click', () => {
  const newIndex = (currentIndex + 1) % poems.length;
  loadPoem(newIndex);
});

// Music (same logic)
function fadeInAudio(audio, targetVolume = 0.3, step = 0.02) {
  audio.volume = 0;
  const fade = setInterval(() => {
    if (audio.volume < targetVolume) {
      audio.volume = Math.min(targetVolume, audio.volume + step);
    } else {
      clearInterval(fade);
    }
  }, 150);
}

function tryAutoPlay() {
  bgMusic.volume = 0.3;
  bgMusic.muted = true;
  bgMusic.play().then(() => {
    bgMusic.muted = false;
    fadeInAudio(bgMusic, 0.3);
    musicBtn.textContent = "⏸ Pause Music";
    musicBtn.classList.add('playing');
  }).catch(() => console.log("Autoplay blocked until user interacts."));
}

musicBtn.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
    fadeInAudio(bgMusic, 0.3);
    musicBtn.textContent = "⏸ Pause Music";
    musicBtn.classList.add('playing');
  } else {
    bgMusic.pause();
    musicBtn.textContent = "🎵 Play Music";
    musicBtn.classList.remove('playing');
  }
});

['click', 'scroll'].forEach(evt => {
  document.addEventListener(evt, () => {
    if (bgMusic.paused) tryAutoPlay();
  }, { once: true });
});

document.addEventListener('DOMContentLoaded', () => {
  loadPoemList();
  tryAutoPlay();
});
