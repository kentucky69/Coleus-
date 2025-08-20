const carousels = document.querySelectorAll('.carousel');
  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel__track');
    const slides = Array.from(track.children);
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    const dotsNav = carousel.querySelector('.carousel__dots');

    // Créer les dots
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      if (i === 0) btn.classList.add('active');
      dotsNav.appendChild(btn);
    });
    const dots = Array.from(dotsNav.children);

    let index = 0;
    const update = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot,i) => dot.classList.toggle('active', i===index));
    };

    nextBtn.addEventListener('click', () => {
      index = (index + 1) % slides.length;
      update();
    });
    prevBtn.addEventListener('click', () => {
      index = (index - 1 + slides.length) % slides.length;
      update();
    });
    dots.forEach((dot,i) => dot.addEventListener('click', () => {
      index = i;
      update();
    }));
  });
  
  // --- MENU BURGER ---
const btn = document.querySelector('.nav-toggle');
const links = document.getElementById('nav-links');

btn?.addEventListener('click', () => {
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!expanded));
  links.classList.toggle('open');
  document.body.classList.toggle('no-scroll', !expanded);
});

// === CART/GALLERY (SAFE APPEND) =============================================
(function () {
  // Espace de noms pour éviter les collisions
  window.COLEUS = window.COLEUS || {};

  // --- Utils (noms uniques) ---
  const fmtEur = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
  const $id = (id) => document.getElementById(id);
  const $ = (sel, el = document) => el.querySelector(sel);

  // --- Catalogue (adapte si besoin) ---
  const CATALOG = [
    { id: "c1",  name: "Coléus Rouge",        price: 15,  img: "images/coleus1.jpg",       type: "plante" },
    { id: "c3",  name: "Coléus Écarlate",     price: 15,  img: "images/coleus3.jpg",       type: "plante" },
    { id: "c31", name: "Coléus Écarlate+ ",   price: 18,  img: "images/coleus3 (1).jpg",   type: "plante" },
    { id: "c4",  name: "Coléus Lime",         price: 12,  img: "images/coleus4.jpg",       type: "plante" },
    { id: "c5",  name: "Coléus Bordeaux",     price: 20,  img: "images/coleus5.jpg",       type: "plante" },
    { id: "c6",  name: "Coléus Tricolore",    price: 22,  img: "images/coleus6.jpg",       type: "plante" },
    { id: "c7",  name: "Coléus Pink Splash",  price: 16,  img: "images/coleus7.jpg",       type: "plante" },
    { id: "c8",  name: "Coléus Velvet",       price: 25,  img: "images/coleus8.jpg",       type: "plante" },
    { id: "cm",  name: "Coléus – Photo main", price: 35,  img: "images/coleusMain.jpg",    type: "plante" },
  ];

  // --- Panier (localStorage) ---
  const CART_KEY = "coleus_cart_v1";

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) ?? []; }
    catch { return []; }
  }
  function setCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartBadge();
  }
  function cartCount() {
    return getCart().reduce((a, it) => a + it.qty, 0);
  }
  function updateCartBadge() {
    const el = $id("cart-count");
    if (el) el.textContent = cartCount();
  }
  function addToCart(productId, qty = 1) {
    const p = CATALOG.find(x => x.id === productId);
    if (!p) return;
    const cart = getCart();
    const row = cart.find(i => i.id === productId);
    if (row) row.qty += qty;
    else cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty });
    setCart(cart);
  }
  function removeFromCart(productId) {
    setCart(getCart().filter(i => i.id !== productId));
  }
  function updateQty(productId, qty) {
    const cart = getCart();
    const row = cart.find(i => i.id === productId);
    if (!row) return;
    row.qty = Math.max(1, parseInt(qty || 1, 10));
    setCart(cart);
  }
  function clearCart() { setCart([]); }

  // --- Rendu Galerie (si #product-grid présent) ---
  function renderGallery() {
    const grid = $id("product-grid");
    if (!grid) return;
    grid.innerHTML = CATALOG.map(p => `
      <article class="card product-card" data-id="${p.id}">
        <img src="${p.img}" alt="${p.name}" class="product-img" loading="lazy" />
        <div class="product-body">
          <h3 class="product-title">${p.name}</h3>
          <p class="product-price">${fmtEur(p.price)}</p>
          <div class="product-actions">
            <button class="btn-ghost details-btn" data-id="${p.id}">En savoir plus</button>
            <button class="btn-primary add-btn" data-id="${p.id}">Ajouter</button>
          </div>
        </div>
      </article>
    `).join("");

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.classList.contains("add-btn")) addToCart(id, 1);
      if (btn.classList.contains("details-btn")) alert("Fiche produit à venir 😉");
    });
  }

  // --- Rendu Panier (si #cart-section présent) ---
  function renderCart() {
    const wrapper = $id("cart-section");
    const empty   = $id("cart-empty");
    const list    = $id("cart-list");
    const subtotalEl = $id("subtotal");
    const feesEl     = $id("fees");
    const totalEl    = $id("total");
    const checkoutBtn= $id("checkout-btn");
    const clearBtn   = $id("clear-btn");
    if (!wrapper || !empty) return;

    const items = getCart();
    if (!items.length) { wrapper.hidden = true; empty.hidden = false; return; }
    wrapper.hidden = false; empty.hidden = true;

    list.innerHTML = items.map(it => `
      <div class="cart-item" data-id="${it.id}">
        <img src="${it.img}" alt="${it.name}" class="cart-thumb" />
        <div class="cart-info">
          <h3 class="cart-name">${it.name}</h3>
          <p class="cart-price">${fmtEur(it.price)}</p>
          <div class="cart-controls">
            <label>Qté
              <input class="qty-input" type="number" min="1" value="${it.qty}" inputmode="numeric" />
            </label>
            <button class="btn-ghost remove-btn">Supprimer</button>
          </div>
        </div>
        <div class="cart-line-total">${fmtEur(it.price * it.qty)}</div>
      </div>
    `).join("");

    const subtotal = items.reduce((a, it) => a + it.price * it.qty, 0);
    const fees = 0;
    const total = subtotal + fees;
    if (subtotalEl) subtotalEl.textContent = fmtEur(subtotal);
    if (feesEl)     feesEl.textContent     = fmtEur(fees);
    if (totalEl)    totalEl.textContent    = fmtEur(total);

    list.addEventListener("click", (e) => {
      const btn = e.target.closest(".remove-btn");
      if (!btn) return;
      const root = e.target.closest(".cart-item");
      const id = root?.dataset.id;
      if (!id) return;
      removeFromCart(id);
      renderCart();
    });

    list.addEventListener("change", (e) => {
      const input = e.target.closest(".qty-input");
      if (!input) return;
      const root = e.target.closest(".cart-item");
      const id = root?.dataset.id;
      updateQty(id, input.value);
      renderCart();
    });

    if (checkoutBtn) checkoutBtn.onclick = () => alert("Démo : intégrer un paiement plus tard");
    if (clearBtn)    clearBtn.onclick    = () => { if (confirm("Vider le panier ?")) { clearCart(); renderCart(); } };
  }

  // --- Boot (n’ajoute pas/ ne remplace pas ton code burger) ---
  document.addEventListener("DOMContentLoaded", () => {
    // Badge Panier (si <span id="cart-count"> existe dans ta nav)
    updateCartBadge();

    // Rendu auto selon la page (détecte les éléments présents)
    if ($id("product-grid")) renderGallery();
    if ($id("cart-section") || $id("cart-empty")) renderCart();

    // Année footer (optionnel)
    const y = $id("year"); if (y) y.textContent = new Date().getFullYear();
  });

  // Expose quelques helpers si besoin ailleurs
  window.COLEUS.cart = { getCart, setCart, addToCart, removeFromCart, updateQty, clearCart, updateCartBadge };
})();