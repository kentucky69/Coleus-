/* ============================================================================
   GALERIE – JS DÉDIÉ
   - Cartes produits modernes + modal de détails
   - Panier via localStorage (clé partagée avec panier.html)
   - Recherche / filtres / tri
   - Compteur panier + quantités visibles sur chaque carte
   ========================================================================== */


/* ────────────────────────────── 1) CONSTANTES / UTILS ───────────────────── */

// Format monnaie en euros (ex: 12,00 €)
const GL_EUR = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

// Sélecteurs pratiques
const $id = (id) => document.getElementById(id);
const $ = (sel, el = document) => el.querySelector(sel);

// Année automatique dans le footer (optionnel)
function glYear() {
  const y = $id("year");
  if (y) y.textContent = new Date().getFullYear();
}

// Toast (petite notification en bas de l’écran)
let glToastTimer = null;
function glToast(msg) {
  const t = $id("gl-toast");
  if (!t) return;
  const total = glCartCount();
  t.textContent = `${msg} — Panier : ${total}`;
  t.hidden = false;
  if (glToastTimer) clearTimeout(glToastTimer);
  glToastTimer = setTimeout(() => (t.hidden = true), 1600);
}


/* ────────────────────────────── 2) DONNÉES PRODUITS ───────────────────────
   - Adapte librement le CATALOG (prix / type / image / descriptions)
   - type: "plante" | "graines" (utile pour les filtres)
   ------------------------------------------------------------------------- */

const CATALOG = [
  {
    id: "c1", name: "Coléus Rouge", price: 15, img: "images/coleus1.jpg", type: "plante", pop: 8,
    desc: "Feuillage rouge éclatant qui apporte de la chaleur à l’intérieur. Idéal pour illuminer un coin sombre."
  },
  {
    id: "c3", name: "Coléus Écarlate", price: 15, img: "images/coleus3.jpg", type: "plante", pop: 9,
    desc: "Feuillage bicolore intense. Contraste de rouge profond et de vert brillant."
  },
  {
    id: "c31", name: "Coléus Écarlate+", price: 18, img: "images/coleus3 (1).jpg", type: "plante", pop: 6,
    desc: "Version aux feuilles plus grandes et motifs marqués, pour un effet tropical assuré."
  },
  {
    id: "c4", name: "Coléus Lime", price: 12, img: "images/coleus4.jpg", type: "plante", pop: 7,
    desc: "Explosion de fraîcheur vert citron. Accent lumineux et moderne."
  },
  {
    id: "c5", name: "Coléus Bordeaux", price: 20, img: "images/coleus5.jpg", type: "plante", pop: 7,
    desc: "Feuillage pourpre profond très élégant. Parfait avec tons neutres et clairs."
  },
  {
    id: "c6", name: "Coléus Tricolore", price: 22, img: "images/coleus6.jpg", type: "plante", pop: 10,
    desc: "Feuillage multicolore spectaculaire. Pour un style audacieux et original."
  },
  {
    id: "c7", name: "Coléus Pink Splash", price: 16, img: "images/coleus7.jpg", type: "plante", pop: 6,
    desc: "Touches de rose sur fond vert sombre. Touche raffinée et lumineuse."
  },
  {
    id: "c8", name: "Coléus Velvet", price: 25, img: "images/coleus8.jpg", type: "plante", pop: 5,
    desc: "Nuances de violet velouté. Apporte profondeur et texture."
  },
  {
    id: "cm", name: "Coléus – Photo main", price: 35, img: "images/coleusMain.jpg", type: "plante", pop: 9,
    desc: "Exemplaire adulte majestueux. Chaque feuille est une œuvre d’art."
  },
  // Exemples de graines (tu peux remplacer par de vraies images de sachets)
  {
    id: "g1", name: "Graines Coléus Rouge", price: 5, img: "images/coleus1.jpg", type: "graines", pop: 4,
    desc: "Sachet de graines pour cultiver votre propre coléus rouge."
  },
  {
    id: "g2", name: "Graines Tricolore", price: 5, img: "images/coleus6.jpg", type: "graines", pop: 3,
    desc: "Sachet de graines pour obtenir des plants aux feuilles tricolores."
  },
];


/* ────────────────────────────── 3) PANIER (localStorage) ──────────────────
   - Clé partagée avec panier.html : "coleus_cart_v1"
   - Fonctions CRUD + badge
   ------------------------------------------------------------------------- */

const CART_KEY = "coleus_cart_v1";

function glGetCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) ?? []; }
  catch { return []; }
}

function glSetCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  glUpdateCartBadge();
}

function glCartCount() {
  return glGetCart().reduce((a, it) => a + it.qty, 0);
}

function glUpdateCartBadge() {
  const el = $id("cart-count");
  if (el) el.textContent = glCartCount();
}

function glGetItemQty(id) {
  const row = glGetCart().find(i => i.id === id);
  return row ? row.qty : 0;
}

function glAddToCart(productId, qty = 1) {
  const p = CATALOG.find(x => x.id === productId);
  if (!p) return 0;

  const cart = glGetCart();
  const row = cart.find(i => i.id === productId);
  if (row) row.qty += qty;
  else cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty });

  glSetCart(cart);

  const curQty = glGetItemQty(productId);
  glUpdateCardQtyUI(productId);      // met à jour la carte
  glToast(`Ajouté : ${p.name} (${curQty})`);
  return curQty;
}


/* ────────────────────────────── 4) GÉNÉRATION DES CARTES ──────────────────
   - Template HTML d’une carte
   - Rendu + recherche/filtre/tri
   - Synchronisation des quantités sur les cartes
   ------------------------------------------------------------------------- */

// Aperçu (description courte) dans la carte
function glShort(text, n = 90) {
  return text.length > n ? `${text.slice(0, n)}…` : text;
}

// Template d’une carte produit
function glCardTemplate(p) {
  return `
    <div class="gallery-card" data-id="${p.id}">
      <img src="${p.img}" alt="${p.name}" />
      <div class="gallery-card-body">
        <span class="qty-chip" style="display:none"></span>
        <h3 class="gallery-card-title">${p.name}</h3>
        <p class="gallery-card-sub">${p.type === "graines" ? "Sachet de graines" : "Plante"}</p>
        <p class="gallery-card-desc">${glShort(p.desc)}</p>
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

// Filtres / Tri / Recherche
function glFilterSortSearch() {
  const query = ($id("gl-search")?.value || "").trim().toLowerCase();
  const type  = $id("gl-filter")?.value || "all";
  const sort  = $id("gl-sort")?.value || "pop";

  let list = CATALOG.slice();
  if (type !== "all") list = list.filter(p => p.type === type);
  if (query) list = list.filter(p => p.name.toLowerCase().includes(query));

  switch (sort) {
    case "price-asc":  list.sort((a,b)=>a.price-b.price); break;
    case "price-desc": list.sort((a,b)=>b.price-a.price); break;
    case "name-asc":   list.sort((a,b)=>a.name.localeCompare(b.name)); break;
    case "name-desc":  list.sort((a,b)=>b.name.localeCompare(a.name)); break;
    default:           list.sort((a,b)=>b.pop-a.pop); // populaires
  }
  return list;
}

// Rendu de la grille
function glRender() {
  const grid = $id("product-grid");
  if (!grid) return;
  const items = glFilterSortSearch();
  grid.innerHTML = items.map(glCardTemplate).join("");
  glSyncAllCardsQtyUI(); // synchro visuelle des quantités (pastille + texte bouton)
}


/* ────────────────────────────── 5) MISE À JOUR UI DES CARTES ──────────────
   - Mettre à jour quantité affichée (pastille + texte “Ajouter (n)”)
   - Synchroniser après chaque rendu
   ------------------------------------------------------------------------- */

function glUpdateCardQtyUI(id) {
  const card = document.querySelector(`.gallery-card[data-id="${id}"]`);
  if (!card) return;
  const qty = glGetItemQty(id);

  const chip = card.querySelector('.qty-chip');
  const addBtn = card.querySelector('.gl-add');

  if (chip) {
    chip.textContent = qty > 0 ? `×${qty}` : '';
    chip.style.display = qty > 0 ? 'inline-block' : 'none';
  }
  if (addBtn) {
    addBtn.textContent = qty > 0 ? `Ajouter (${qty})` : 'Ajouter';
  }
}

function glSyncAllCardsQtyUI() {
  const cart = glGetCart();
  cart.forEach(item => glUpdateCardQtyUI(item.id));
}


/* ────────────────────────────── 6) MODAL DE DÉTAIL PRODUIT ────────────────
   - Ouvrir / remplir / fermer
   - Ajout au panier depuis le modal
   ------------------------------------------------------------------------- */

function showDetails(productId) {
  const p = CATALOG.find(item => item.id === productId);
  if (!p) return;

  $id("modal-img").src = p.img;
  $id("modal-img").alt = p.name;
  $id("modal-title").textContent = p.name;
  $id("modal-type").textContent = (p.type === "graines") ? "Sachet de graines" : "Plante";
  $id("modal-description").textContent = p.desc;
  $id("modal-price").textContent = GL_EUR(p.price);

  const addButton = $id("modal-add");
  addButton.dataset.id = p.id;

  const modal = $id("details-modal");
  if (modal) modal.hidden = false;
}

function closeDetails() {
  const modal = $id("details-modal");
  if (modal) modal.hidden = true;
}

function glBindModalEvents() {
  const modal = $id("details-modal");
  if (!modal) return;

  // Ferme en cliquant sur overlay ou bouton ✕
  modal.addEventListener("click", (e) => {
    if (e.target.dataset.close) closeDetails();
  });

  // Ajout depuis le modal
  const addBtn = $id("modal-add");
  if (addBtn) {
    addBtn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      glAddToCart(id, 1);
      closeDetails();
    });
  }
}


/* ────────────────────────────── 7) ÉVÉNEMENTS (GRILLE & CONTRÔLES) ────────
   - Délégation de clics sur la grille (un seul listener global)
   - Bind des contrôles (recherche / filtre / tri)
   ------------------------------------------------------------------------- */

function handleGridClick(e) {
  const addBtn = e.target.closest(".gl-add");
  const detailsBtn = e.target.closest(".gl-details");

  if (addBtn) {
    const id = addBtn.dataset.id;
    glAddToCart(id, 1);
    return;
  }

  if (detailsBtn) {
    const id = detailsBtn.dataset.id;
    showDetails(id);
  }
}

function glBindGridEvents() {
  const grid = $id("product-grid");
  if (!grid) return;
  // On attache UNE fois (pas dans glRender)
  grid.removeEventListener("click", handleGridClick);
  grid.addEventListener("click", handleGridClick);
}

function glBindControls() {
  ["gl-search", "gl-filter", "gl-sort"].forEach((id) => {
    const el = $id(id);
    if (!el) return;
    el.addEventListener("input", glRender);
    el.addEventListener("change", glRender);
  });
}


/* ────────────────────────────── 8) BOOTSTRAP (DOMContentLoaded) ─────────── */

document.addEventListener("DOMContentLoaded", () => {
  glYear();                // année footer
  glUpdateCartBadge();     // met à jour badge 🧺 au chargement
  glBindControls();        // recherche, filtres, tri
  glRender();              // premier rendu
  glBindGridEvents();      // clics sur Ajouter / Détails
  glBindModalEvents();     // gestion du modal
});