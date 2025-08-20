/* ===== Galerie – JS séparé, panier relié via localStorage ===== */

// --- Utils
const GL_FMT = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
const $id = (id) => document.getElementById(id);
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

// --- Badge année (optionnel si pas déjà fait ailleurs)
function glYear() { const y = $id("year"); if (y) y.textContent = new Date().getFullYear(); }

// --- Catalogue (exemples mappés à tes images existantes) ---
// type: "plante" ou "graines" (tu peux adapter / enrichir)
const CATALOG = [
  { id: "c1",  name: "Coléus Rouge",        price: 15, img: "images/coleus1.jpg",      type: "plante",  pop: 8 },
  { id: "c3",  name: "Coléus Écarlate",     price: 15, img: "images/coleus3.jpg",      type: "plante",  pop: 9 },
  { id: "c31", name: "Coléus Écarlate+",    price: 18, img: "images/coleus3 (1).jpg",  type: "plante",  pop: 6 },
  { id: "c4",  name: "Coléus Lime",         price: 12, img: "images/coleus4.jpg",      type: "plante",  pop: 7 },
  { id: "c5",  name: "Coléus Bordeaux",     price: 20, img: "images/coleus5.jpg",      type: "plante",  pop: 7 },
  { id: "c6",  name: "Coléus Tricolore",    price: 22, img: "images/coleus6.jpg",      type: "plante",  pop: 10 },
  { id: "c7",  name: "Coléus Pink Splash",  price: 16, img: "images/coleus7.jpg",      type: "plante",  pop: 6 },
  { id: "c8",  name: "Coléus Velvet",       price: 25, img: "images/coleus8.jpg",      type: "plante",  pop: 5 },
  { id: "cm",  name: "Coléus – Photo main", price: 35, img: "images/coleusMain.jpg",   type: "plante",  pop: 9 },
  // exemples "graines" (dupli si besoin jusqu'à ce que tu aies tes vraies images)
  { id: "g1",  name: "Graines Coléus Rouge", price: 5, img: "images/coleus1.jpg",      type: "graines", pop: 4 },
  { id: "g2",  name: "Graines Tricolore",    price: 5, img: "images/coleus6.jpg",      type: "graines", pop: 3 },
];

// --- Panier (compatible avec app.js si tu l'utilises) ---
const CART_KEY = "coleus_cart_v1";

function glGetCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) ?? []; }
  catch { return []; }
}
function glSetCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  glUpdateCartBadge();
}
function glAddToCart(productId, qty = 1) {
  const p = CATALOG.find(x => x.id === productId);
  if (!p) return;
  const cart = glGetCart();
  const row = cart.find(i => i.id === productId);
  if (row) row.qty += qty;
  else cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty });
  glSetCart(cart);
  glToast(`Ajouté : ${p.name} (${qty})`);
}
function glCartCount() {
  return glGetCart().reduce((a, it) => a + it.qty, 0);
}
function glUpdateCartBadge() {
  const el = $id("cart-count");
  if (el) el.textContent = glCartCount();
}

// --- Toast
let glToastTimer = null;
function glToast(msg) {
  const t = $id("gl-toast");
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  if (glToastTimer) clearTimeout(glToastTimer);
  glToastTimer = setTimeout(() => (t.hidden = true), 1600);
}

// --- Rendu des cartes
function glCardTemplate(p) {
  return `
    <article class="gl-card" data-id="${p.id}">
      <img src="${p.img}" alt="${p.name}" loading="lazy" />
      <div class="gl-card-body">
        <h3 class="gl-card-title">${p.name}</h3>
        <p class="gl-card-sub">${p.type === "graines" ? "Sachet de graines" : "Plante"}</p>
        <div class="gl-card-bottom">
          <span class="gl-price">${GL_FMT(p.price)}</span>
          <div class="gl-actions">
            <button class="btn btn-ghost gl-details" data-id="${p.id}">Détails</button>
            <button class="btn btn-primary gl-add" data-id="${p.id}">Ajouter</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

// --- Filtres / Tri / Recherche
function glFilterSortSearch() {
  const query = ($id("gl-search")?.value || "").trim().toLowerCase();
  const type = $id("gl-filter")?.value || "all";
  const sort = $id("gl-sort")?.value || "pop";

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

function glRender() {
  const grid = $id("product-grid");
  if (!grid) return;
  const items = glFilterSortSearch();
  grid.innerHTML = items.map(glCardTemplate).join("");

  grid.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".gl-add");
    const detailsBtn = e.target.closest(".gl-details");
    if (addBtn) {
      const id = addBtn.dataset.id;
      glAddToCart(id, 1);
    }
    if (detailsBtn) {
      const id = detailsBtn.dataset.id;
      const p = CATALOG.find(x=>x.id===id);
      if (p) alert(`Détails (démo)\n\n${p.name}\n${GL_FMT(p.price)}\nType: ${p.type}`);
    }
  }, { once: true }); // on attache une seule fois (car on re-render)
}

function glBindControls() {
  ["gl-search","gl-filter","gl-sort"].forEach(id => {
    const el = $id(id);
    if (!el) return;
    el.addEventListener("input", glRender);
    el.addEventListener("change", glRender);
  });
}

// --- Boot
document.addEventListener("DOMContentLoaded", () => {
  glYear();
  glUpdateCartBadge();
  glBindControls();
  glRender();
});