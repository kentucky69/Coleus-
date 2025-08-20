/* ===== Galerie modernisée – JS dédié ===== */

// Format monnaie en euros
const GL_EUR = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

// Accès DOM simplifiés
const $id = (id) => document.getElementById(id);
const $ = (sel, el = document) => el.querySelector(sel);

// Mise à jour de l'année dans le footer
function glYear() {
  const y = $id("year");
  if (y) y.textContent = new Date().getFullYear();
}

// Catalogue enrichi avec descriptions
const CATALOG = [
  {
    id: "c1",
    name: "Coléus Rouge",
    price: 15,
    img: "images/coleus1.jpg",
    type: "plante",
    pop: 8,
    desc: "Cette variété de coléus rouge offre un feuillage vif et éclatant qui apporte de la chaleur à tous les intérieurs. Idéale pour illuminer un coin sombre."
  },
  {
    id: "c3",
    name: "Coléus Écarlate",
    price: 15,
    img: "images/coleus3.jpg",
    type: "plante",
    pop: 9,
    desc: "Le coléus écarlate présente un feuillage bicolore intense. Son contraste de rouge profond et de vert brillant embellit instantanément n’importe quel espace."
  },
  {
    id: "c31",
    name: "Coléus Écarlate+",
    price: 18,
    img: "images/coleus3 (1).jpg",
    type: "plante",
    pop: 6,
    desc: "Une version améliorée de notre coléus écarlate avec des feuilles encore plus grandes et des motifs plus marqués, pour un effet tropical assuré."
  },
  {
    id: "c4",
    name: "Coléus Lime",
    price: 12,
    img: "images/coleus4.jpg",
    type: "plante",
    pop: 7,
    desc: "Le coléus Lime est une explosion de fraîcheur avec ses feuilles vert citron. Parfait pour un accent lumineux et moderne dans votre décor."
  },
  {
    id: "c5",
    name: "Coléus Bordeaux",
    price: 20,
    img: "images/coleus5.jpg",
    type: "plante",
    pop: 7,
    desc: "Avec son feuillage pourpre profond, le coléus Bordeaux incarne l’élégance. Il s’associe merveilleusement bien avec des tons neutres et clairs."
  },
  {
    id: "c6",
    name: "Coléus Tricolore",
    price: 22,
    img: "images/coleus6.jpg",
    type: "plante",
    pop: 10,
    desc: "Cette variété offre un feuillage multicolore spectaculaire. Parfait pour ceux qui recherchent une plante audacieuse et originale."
  },
  {
    id: "c7",
    name: "Coléus Pink Splash",
    price: 16,
    img: "images/coleus7.jpg",
    type: "plante",
    pop: 6,
    desc: "Le coléus Pink Splash séduit par ses touches de rose sur un fond vert sombre. Idéal pour une touche féminine et raffinée."
  },
  {
    id: "c8",
    name: "Coléus Velvet",
    price: 25,
    img: "images/coleus8.jpg",
    type: "plante",
    pop: 5,
    desc: "Avec son feuillage velouté et ses nuances de violet, le coléus Velvet apporte profondeur et texture à votre collection végétale."
  },
  {
    id: "cm",
    name: "Coléus – Photo main",
    price: 35,
    img: "images/coleusMain.jpg",
    type: "plante",
    pop: 9,
    desc: "Exemplaire majestueux pris en photo pour vous montrer toute la beauté d’un coléus adulte. Chaque feuille est une œuvre d’art."
  },
  // Graines – exemples (à adapter selon tes images)
  {
    id: "g1",
    name: "Graines Coléus Rouge",
    price: 5,
    img: "images/coleus1.jpg",
    type: "graines",
    pop: 4,
    desc: "Un sachet de graines pour cultiver votre propre coléus rouge. Conseillé pour les amateurs de jardinage."
  },
  {
    id: "g2",
    name: "Graines Tricolore",
    price: 5,
    img: "images/coleus6.jpg",
    type: "graines",
    pop: 3,
    desc: "Sachet de graines permettant d’obtenir des plants aux feuilles tricolores aux teintes flamboyantes."
  },
];

// Panier (partagé avec panier.html via localStorage)
const CART_KEY = "coleus_cart_v1";
function glGetCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) ?? [];
  } catch {
    return [];
  }
}
function glSetCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  glUpdateCartBadge();
}
function glAddToCart(productId, qty = 1) {
  const p = CATALOG.find((x) => x.id === productId);
  if (!p) return;
  const cart = glGetCart();
  const row = cart.find((i) => i.id === productId);
  if (row) row.qty += qty;
  else cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty });
  glSetCart(cart);
  glToast(`Ajouté : ${p.name} (${qty})`);
}
function glCartCount() {
  return glGetCart().reduce((a, it) => a + it.qty, 0);
}
function glUpdateCartBadge() {
  const el = $id("cart-count");
  if (el) el.textContent = glCartCount();
}

// Toast (notification)
let glToastTimer = null;
function glToast(msg) {
  const t = $id("gl-toast");
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  if (glToastTimer) clearTimeout(glToastTimer);
  glToastTimer = setTimeout(() => {
    t.hidden = true;
  }, 1600);
}

// Génère le HTML d'une carte produit
function glCardTemplate(p) {
  const preview = p.desc.length > 90 ? `${p.desc.substring(0, 90)}…` : p.desc;
  return `
    <div class="gallery-card" data-id="${p.id}">
      <img src="${p.img}" alt="${p.name}" />
      <div class="gallery-card-body">
        <h3 class="gallery-card-title">${p.name}</h3>
        <p class="gallery-card-sub">${p.type === "graines" ? "Sachet de graines" : "Plante"}</p>
        <p class="gallery-card-desc">${preview}</p>
        <div class="gallery-card-bottom">
          <span class="gallery-card-price">${GL_EUR(p.price)}</span>
          <div class="gallery-actions">
            <button class="btn btn-ghost gl-details" data-id="${p.id}">Détails</button>
            <button class="btn btn-primary gl-add" data-id="${p.id}">Ajouter</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Filtre, recherche et tri
function glFilterSortSearch() {
  const query = ($id("gl-search")?.value || "").trim().toLowerCase();
  const type = $id("gl-filter")?.value || "all";
  const sort = $id("gl-sort")?.value || "pop";
  let list = CATALOG.slice();
  if (type !== "all") list = list.filter((p) => p.type === type);
  if (query) list = list.filter((p) => p.name.toLowerCase().includes(query));
  switch (sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      list.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      list.sort((a, b) => b.pop - a.pop);
  }
  return list;
}

// Rendu de la grille
function glRender() {
  const grid = $id("product-grid");
  if (!grid) return;
  const items = glFilterSortSearch();
  grid.innerHTML = items.map(glCardTemplate).join("");
}

// Gestion des événements de clic (délégation)
function glBindGridEvents() {
  const grid = $id("product-grid");
  if (!grid) return;
  grid.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".gl-add");
    const detailsBtn = e.target.closest(".gl-details");
    if (addBtn) {
      const id = addBtn.dataset.id;
      glAddToCart(id, 1);
    }
    if (detailsBtn) {
      const id = detailsBtn.dataset.id;
      showDetails(id);
    }
  });
}

// Ouvre le modal avec les détails du produit
function showDetails(productId) {
  const p = CATALOG.find((item) => item.id === productId);
  if (!p) return;
  const modal = $id("details-modal");
  if (!modal) return;
  // Remplit le contenu du modal
  $id("modal-img").src = p.img;
  $id("modal-img").alt = p.name;
  $id("modal-title").textContent = p.name;
  $id("modal-type").textContent = p.type === "graines" ? "Sachet de graines" : "Plante";
  $id("modal-description").textContent = p.desc;
  $id("modal-price").textContent = GL_EUR(p.price);
  const addButton = $id("modal-add");
  addButton.dataset.id = p.id;
  // Affiche le modal
  modal.hidden = false;
}

// Ferme le modal
function closeDetails() {
  const modal = $id("details-modal");
  if (modal) modal.hidden = true;
}

// Bind des événements pour le modal
function glBindModalEvents() {
  const modal = $id("details-modal");
  if (!modal) return;
  modal.addEventListener("click", (e) => {
    // Ferme si l'overlay ou le bouton de fermeture est cliqué
    if (e.target.dataset.close) {
      closeDetails();
    }
  });
  // Ajout au panier depuis le modal
  const addBtn = $id("modal-add");
  if (addBtn) {
    addBtn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      glAddToCart(id, 1);
      closeDetails();
    });
  }
}

// Liaison des contrôles (recherche, filtre, tri)
function glBindControls() {
  ["gl-search", "gl-filter", "gl-sort"].forEach((id) => {
    const el = $id(id);
    if (!el) return;
    el.addEventListener("input", glRender);
    el.addEventListener("change", glRender);
  });
}

// Initialisation au chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
  glYear();
  glUpdateCartBadge();
  glBindControls();
  glRender();
  glBindGridEvents();
  glBindModalEvents();
});