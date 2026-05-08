const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('search');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalTags = document.getElementById('modalTags');
const closeModal = document.getElementById('closeModal');

const popularTagsList = [
  "catgirl", "ahegao", "blonde", "big_breasts", "solo", 
  "thighhighs", "school_uniform", "red_hair", "ass", "cum", "tentacles"
];

// Popularne tagi
function createPopularTags() {
  const container = document.getElementById('popularTags');
  container.innerHTML = ''; // czyścimy na wszelki wypadek
  popularTagsList.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-btn';
    btn.textContent = tag;
    btn.addEventListener('click', () => {
      searchInput.value = tag;
      fetchImages(tag);
    });
    container.appendChild(btn);
  });
}

async function fetchImages(tags = "") {
  gallery.innerHTML = '<div class="loading">Ładowanie obrazków (przez proxy)...</div>';

  let baseUrl = `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=50`;
  if (tags) baseUrl += `&tags=${encodeURIComponent(tags)}`;

  // Kilka proxy do wyboru - wypróbujemy po kolei
  const proxies = [
    "https://api.allorigins.win/raw?url=",           // bardzo popularny
    "https://api.codetabs.com/v1/proxy?quest=",     // dobry na JSON
    "https://proxy.corsfix.com/?",                   // nowy
    "https://api.cors.lol/?url="                     // nowy
  ];

  let success = false;

  for (let proxy of proxies) {
    try {
      const url = proxy + encodeURIComponent(baseUrl);
      const res = await fetch(url);

      if (!res.ok) continue;

      const data = await res.json();

      if (data && data.length > 0) {
        renderImages(data);
        success = true;
        console.log(`Działa na proxy: ${proxy}`);
        break;
      }
    } catch (e) {
      console.log(`Proxy ${proxy} nie zadziałał`);
    }
  }

  if (!success) {
    gallery.innerHTML = `
      <div class="loading" style="color:orange">
        Wszystkie proxy aktualnie nie działają.<br><br>
        <strong>Co możesz zrobić:</strong><br>
        1. Włącz rozszerzenie CORS (np. "CORS Unblock")<br>
        2. Wyłącz AdBlock / uBlock na chwilę<br>
        3. Albo użyj wersji demo poniżej
      </div>`;
  }
}

function renderImages(posts) {
  gallery.innerHTML = '';

  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'thumb';

    const preview = post.preview_url || post.sample_url || post.file_url;

    div.innerHTML = `
      <img src="${preview}" loading="lazy" alt="${post.tags}">
      <div class="score">★ ${post.score || '?'}</div>
      <div class="info">${(post.tags || "").substring(0, 70)}${(post.tags || "").length > 70 ? '...' : ''}</div>
    `;

    div.addEventListener('click', () => {
      modalImage.src = post.file_url;
      modalTags.textContent = post.tags || "Brak tagów";
      modal.style.display = 'flex';
    });

    gallery.appendChild(div);
  });
}

// Debounce wyszukiwanie
let timeout;
searchInput.addEventListener('input', () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    fetchImages(searchInput.value.trim());
  }, 500);
});

// Modal
closeModal.addEventListener('click', () => modal.style.display = 'none');
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

// Start
createPopularTags();
fetchImages(""); 