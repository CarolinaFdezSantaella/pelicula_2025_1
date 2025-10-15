/* =========================
   Modelo + Persistencia
   ========================= */

const STORAGE_KEY = "mis_peliculas";

const mis_peliculas_iniciales = [
  { titulo: "Superlópez", director: "Javier Ruiz Caldera", miniatura: "files/superlopez.png" },
  { titulo: "Jurassic Park", director: "Steven Spielberg", miniatura: "files/jurassicpark.png" },
  { titulo: "Interstellar", director: "Christopher Nolan", miniatura: "files/interstellar.png" }
];

let mis_peliculas = [];

const loadPeliculas = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const savePeliculas = (peliculas) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(peliculas));
};

const seedIfEmpty = () => {
  const data = loadPeliculas();
  if (!data || data.length === 0) {
    savePeliculas(mis_peliculas_iniciales);
  }
};

/* =========================
   Utilidades
   ========================= */

// Escapa HTML para evitar inyecciones si se pegan strings raros
const esc = (str) =>
  String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/* =========================
   Vistas (devuelven HTML)
   ========================= */

const indexView = (peliculas) => {
  if (!peliculas.length) {
    return `
      <div style="text-align:center">
        <p>No hay películas aún.</p>
        <div class="actions">
          <button class="new">Añadir</button>
          <button class="reset">Reset</button>
        </div>
      </div>
    `;
  }

  let view = peliculas
    .map((p, i) => {
      return `
        <article class="movie-card">
          <a href="#" class="show" data-my-id="${i}" title="Ver detalle">
            <img src="${esc(p.miniatura)}"
                 alt="${esc(p.titulo || "Sin título")}"
                 onerror="this.src='files/placeholder.png'"/>
          </a>
          <h3>${p.titulo ? esc(p.titulo) : "<em>Sin título</em>"}</h3>
          <p>${p.director ? esc(p.director) : "<em>Sin director</em>"}</p>
          <div class="actions">
            <button class="edit" data-my-id="${i}">Editar</button>
            <button class="delete" data-my-id="${i}">Borrar</button>
          </div>
        </article>
      `;
    })
    .join("");

  // Barra inferior de acciones
  view += `
    <div class="actions" style="grid-column: 1/-1;">
      <button class="new">Añadir</button>
      <button class="reset">Reset</button>
    </div>
  `;
  return view;
};

const editView = (i, pelicula) => {
  return `
    <h2>Editar Película</h2>
    <div class="field">
      <label for="titulo">Título</label>
      <input type="text" id="titulo" placeholder="Título" value="${esc(pelicula.titulo)}">
    </div>
    <div class="field">
      <label for="director">Director</label>
      <input type="text" id="director" placeholder="Director" value="${esc(pelicula.director)}">
    </div>
    <div class="field">
      <label for="miniatura">Miniatura</label>
      <input type="text" id="miniatura" placeholder="URL de la miniatura" value="${esc(pelicula.miniatura)}">
    </div>
    <div class="actions">
      <button class="update" data-my-id="${i}">Actualizar</button>
      <button class="index">Volver</button>
    </div>
  `;
};

const showView = (pelicula) => {
  return `
    <h2>${pelicula.titulo ? esc(pelicula.titulo) : "<em>Sin título</em>"}</h2>
    <div style="text-align:center">
      <img src="${esc(pelicula.miniatura)}"
           alt="${esc(pelicula.titulo || "Sin título")}"
           onerror="this.src='files/placeholder.png'"
           style="max-width:240px;border-radius:8px"/>
    </div>
    <p><strong>Director:</strong> ${pelicula.director ? esc(pelicula.director) : "<em>Sin director</em>"}</p>
    <div class="actions">
      <button class="index">Volver</button>
    </div>
  `;
};

const newView = () => {
  return `
    <h2>Crear Película</h2>
    <div class="field">
      <label for="titulo">Título</label>
      <input type="text" id="titulo" placeholder="Título">
    </div>
    <div class="field">
      <label for="director">Director</label>
      <input type="text" id="director" placeholder="Director">
    </div>
    <div class="field">
      <label for="miniatura">Miniatura</label>
      <input type="text" id="miniatura" placeholder="URL de la miniatura">
    </div>
    <div class="actions">
      <button class="create">Crear</button>
      <button class="index">Volver</button>
    </div>
  `;
};

/* =========================
   Controladores
   ========================= */

const render = (html, asList = false) => {
  const main = document.getElementById("main");
  if (asList) {
    main.classList.add("movie-list");
  } else {
    main.classList.remove("movie-list");
  }
  main.innerHTML = html;
};

const indexContr = () => {
  mis_peliculas = loadPeliculas();
  render(indexView(mis_peliculas), true);
};

const showContr = (i) => {
  render(showView(mis_peliculas[i]));
};

const newContr = () => {
  render(newView());
};

const createContr = () => {
  const titulo = document.getElementById("titulo").value.trim();
  const director = document.getElementById("director").value.trim();
  const miniatura = document.getElementById("miniatura").value.trim();
  mis_peliculas.push({ titulo, director, miniatura });
  savePeliculas(mis_peliculas);
  indexContr();
};

const editContr = (i) => {
  render(editView(i, mis_peliculas[i]));
};

const updateContr = (i) => {
  mis_peliculas[i].titulo = document.getElementById("titulo").value.trim();
  mis_peliculas[i].director = document.getElementById("director").value.trim();
  mis_peliculas[i].miniatura = document.getElementById("miniatura").value.trim();
  savePeliculas(mis_peliculas);
  indexContr();
};

const deleteContr = (i) => {
  if (confirm("¿Seguro que quieres borrar esta película?")) {
    mis_peliculas.splice(i, 1);
    savePeliculas(mis_peliculas);
    indexContr();
  }
};

const resetContr = () => {
  if (confirm("¿Seguro que quieres reiniciar la lista de películas?")) {
    savePeliculas(mis_peliculas_iniciales);
    indexContr();
  }
};

/* =========================
   Router de eventos
   ========================= */

const matchEvent = (ev, sel) => ev.target.matches(sel);
const myId = (ev) => Number(ev.target.dataset.myId);

document.addEventListener("click", (ev) => {
  if      (matchEvent(ev, ".index"))  { ev.preventDefault(); indexContr(); }
  else if (matchEvent(ev, ".edit"))   { editContr(myId(ev)); }
  else if (matchEvent(ev, ".update")) { updateContr(myId(ev)); }
  else if (matchEvent(ev, ".show"))   { ev.preventDefault(); showContr(myId(ev)); }
  else if (matchEvent(ev, ".new"))    { ev.preventDefault(); newContr(); }
  else if (matchEvent(ev, ".create")) { createContr(); }
  else if (matchEvent(ev, ".delete")) { deleteContr(myId(ev)); }
  else if (matchEvent(ev, ".reset"))  { ev.preventDefault(); resetContr(); }
});

/* =========================
   Inicialización
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  seedIfEmpty();
  indexContr();
});
