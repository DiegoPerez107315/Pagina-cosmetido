/* ============ NicValia Make up — lógica ============ */
(function () {
  "use strict";

  /* ---------- Carrusel hero ---------- */
  const track = document.getElementById("heroTrack");
  const slides = Array.from(track.children);
  const dotsWrap = document.getElementById("heroDots");
  let current = 0;
  let timer = null;

  slides.forEach(function (_, i) {
    const b = document.createElement("button");
    b.setAttribute("aria-label", "Ir al slide " + (i + 1));
    b.addEventListener("click", function () { goTo(i); restart(); });
    dotsWrap.appendChild(b);
  });

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    track.style.transform = "translateX(-" + current * 100 + "%)";
    Array.from(dotsWrap.children).forEach(function (d, j) {
      d.classList.toggle("active", j === current);
    });
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(function () { goTo(current + 1); }, 5200);
  }
  document.getElementById("heroPrev").addEventListener("click", function () { goTo(current - 1); restart(); });
  document.getElementById("heroNext").addEventListener("click", function () { goTo(current + 1); restart(); });
  const heroEl = document.querySelector(".hero");
  heroEl.addEventListener("mouseenter", function () { clearInterval(timer); });
  heroEl.addEventListener("mouseleave", restart);
  goTo(0);
  restart();

  /* ---------- Header compacto al hacer scroll ---------- */
  // Histéresis: se compacta al pasar SCROLL_ON y solo vuelve a tamaño completo
  // al subir por debajo de SCROLL_OFF. La zona muerta evita el titileo cerca
  // del tope cuando el header cambia de tamaño y reacomoda el scroll.
  const topbar = document.querySelector(".topbar");
  const SCROLL_ON = 90;
  const SCROLL_OFF = 30;
  function onScroll() {
    const y = window.scrollY;
    const compact = topbar.classList.contains("scrolled");
    if (!compact && y > SCROLL_ON) topbar.classList.add("scrolled");
    else if (compact && y < SCROLL_OFF) topbar.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Filtros de catálogo ---------- */
  const chips = Array.from(document.querySelectorAll(".chip"));
  const cards = Array.from(document.querySelectorAll(".product-card"));

  function applyFilter(cat) {
    cards.forEach(function (c) {
      const match = cat === "todos" || c.dataset.cat === cat;
      c.classList.toggle("hidden", !match);
    });
  }
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      applyFilter(chip.dataset.filter);
    });
  });

  function scrollToEl(el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  // tarjetas de categoría → filtran y bajan al catálogo
  Array.from(document.querySelectorAll(".cat-card")).forEach(function (card) {
    card.addEventListener("click", function () {
      const cat = card.dataset.cat;
      const chip = chips.find(function (c) { return c.dataset.filter === cat; });
      if (chip) chip.click();
      scrollToEl(document.getElementById("catalogo"));
    });
  });

  /* ---------- Búsqueda ---------- */
  const searchWrap = document.getElementById("searchWrap");
  const searchInput = document.getElementById("searchInput");
  document.getElementById("searchBtn").addEventListener("click", function () {
    searchWrap.classList.toggle("open");
    if (searchWrap.classList.contains("open")) searchInput.focus();
    else { searchInput.value = ""; applyFilter(activeCat()); }
  });
  function activeCat() {
    const a = chips.find(function (c) { return c.classList.contains("active"); });
    return a ? a.dataset.filter : "todos";
  }
  searchInput.addEventListener("input", function () {
    const q = searchInput.value.trim().toLowerCase();
    if (q.length > 0) scrollIfNeeded();
    cards.forEach(function (c) {
      const name = (c.dataset.name || "").toLowerCase();
      const matchCat = activeCat() === "todos" || c.dataset.cat === activeCat();
      c.classList.toggle("hidden", !(matchCat && name.indexOf(q) !== -1));
    });
  });
  let scrolled = false;
  function scrollIfNeeded() {
    if (scrolled) return;
    scrolled = true;
    scrollToEl(document.getElementById("catalogo"));
    setTimeout(function () { scrolled = false; }, 4000);
  }

  /* ---------- Carrito ---------- */
  const CART_KEY = "nv_cart_v1";
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch (e) { cart = []; }

  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  const itemsWrap = document.getElementById("cartItems");
  const badge = document.getElementById("cartBadge");
  const totalEl = document.getElementById("cartTotal");

  function money(n) {
    return "$" + n.toLocaleString("es-CO");
  }
  function save() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

  function render() {
    const count = cart.reduce(function (s, it) { return s + it.qty; }, 0);
    badge.textContent = count;
    badge.classList.toggle("empty", count === 0);

    itemsWrap.innerHTML = "";
    if (cart.length === 0) {
      const p = document.createElement("p");
      p.className = "cart-empty";
      p.textContent = "Tu carrito está vacío… por ahora 🎀";
      itemsWrap.appendChild(p);
    }
    cart.forEach(function (it) {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML =
        '<img src="' + it.img + '" alt="">' +
        '<div><div class="cart-item-name">' + it.name + "</div>" +
        '<div class="cart-item-price">' + money(it.price) + "</div>" +
        '<div class="qty-row"><button data-act="minus">−</button><span>' + it.qty + '</span><button data-act="plus">+</button></div></div>' +
        '<button class="cart-item-remove" data-act="remove">quitar</button>';
      row.querySelector('[data-act="minus"]').addEventListener("click", function () { changeQty(it.id, -1); });
      row.querySelector('[data-act="plus"]').addEventListener("click", function () { changeQty(it.id, 1); });
      row.querySelector('[data-act="remove"]').addEventListener("click", function () { removeItem(it.id); });
      itemsWrap.appendChild(row);
    });

    const total = cart.reduce(function (s, it) { return s + it.qty * it.price; }, 0);
    totalEl.textContent = money(total);
  }

  function changeQty(id, d) {
    const it = cart.find(function (x) { return x.id === id; });
    if (!it) return;
    it.qty += d;
    if (it.qty <= 0) cart = cart.filter(function (x) { return x.id !== id; });
    save(); render();
  }
  function removeItem(id) {
    cart = cart.filter(function (x) { return x.id !== id; });
    save(); render();
  }

  function openCart() { drawer.classList.add("open"); overlay.classList.add("open"); }
  function closeCart() { drawer.classList.remove("open"); overlay.classList.remove("open"); }
  document.getElementById("cartBtn").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);

  /* toast */
  const toast = document.getElementById("toast");
  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  Array.from(document.querySelectorAll(".add-btn")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      const card = btn.closest(".product-card");
      const id = card.dataset.id;
      const found = cart.find(function (x) { return x.id === id; });
      if (found) found.qty += 1;
      else cart.push({
        id: id,
        name: card.dataset.name,
        price: parseInt(card.dataset.price, 10),
        img: card.querySelector("img") ? card.querySelector("img").src : "",
        qty: 1
      });
      save(); render();
      showToast("Agregado al carrito ✧ " + card.dataset.name);
    });
  });

  document.getElementById("checkoutBtn").addEventListener("click", function () {
    if (cart.length === 0) { showToast("Tu carrito está vacío"); return; }
    showToast("Pedido simulado enviado 💌 ¡Gracias!");
    cart = [];
    save(); render();
    setTimeout(closeCart, 600);
  });

  render();

  /* ---------- Nav suave ---------- */
  Array.from(document.querySelectorAll('a[href^="#"]')).forEach(function (a) {
    a.addEventListener("click", function (ev) {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      ev.preventDefault();
      scrollToEl(target);
    });
  });
})();
