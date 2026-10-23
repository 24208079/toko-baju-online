'use strict';
/* ==========================================================
   Toko Baju Online - script.js
   Tugas 7 E-Business System: Front-End E-Commerce (HTML, CSS, JavaScript)
   Catatan: ini SIMULASI front-end. Data disimpan di localStorage browser,
   belum terhubung ke database/back-end (PHP/MySQL pada tahap berikutnya).
   ========================================================== */

/* ---------- 1. Data simulasi (mengikuti tabel CATEGORY, PRODUCT, PRODUCT_VARIANT pada Tugas 6) ---------- */
const PRODUCTS = [
  { id: 1, category: 'Kaos', name: 'Kaos Oversize Polos', price: 85000,
    desc: 'Kaos oversize bahan cotton combed 24s. Potongan longgar, adem, dan nyaman dipakai harian.',
    variants: [
      { id: 30, size: 'S', color: 'Hitam', hex: '#1f2937', stok: 25 },
      { id: 31, size: 'M', color: 'Hitam', hex: '#1f2937', stok: 40 },
      { id: 32, size: 'L', color: 'Hitam', hex: '#1f2937', stok: 0 },
      { id: 33, size: 'M', color: 'Putih', hex: '#f3f4f6', stok: 18 },
      { id: 34, size: 'L', color: 'Putih', hex: '#f3f4f6', stok: 12 } ] },
  { id: 2, category: 'Kemeja', name: 'Kemeja Flannel Kotak', price: 165000,
    desc: 'Kemeja flannel motif kotak, bahan tebal lembut, cocok untuk kasual maupun layering.',
    variants: [
      { id: 76, size: 'M', color: 'Merah', hex: '#b91c1c', stok: 8 },
      { id: 77, size: 'L', color: 'Merah', hex: '#b91c1c', stok: 15 },
      { id: 78, size: 'L', color: 'Navy', hex: '#1e3a8a', stok: 6 },
      { id: 79, size: 'XL', color: 'Navy', hex: '#1e3a8a', stok: 0 } ] },
  { id: 3, category: 'Celana', name: 'Celana Chino Slim', price: 195000,
    desc: 'Celana chino slim fit bahan twill stretch. Rapi untuk kuliah, kerja, maupun santai.',
    variants: [
      { id: 90, size: '30', color: 'Krem', hex: '#d9c9a3', stok: 14 },
      { id: 91, size: '32', color: 'Krem', hex: '#d9c9a3', stok: 10 },
      { id: 92, size: '30', color: 'Hitam', hex: '#1f2937', stok: 9 },
      { id: 93, size: '32', color: 'Hitam', hex: '#1f2937', stok: 0 } ] },
  { id: 4, category: 'Jaket', name: 'Hoodie Fleece Basic', price: 210000,
    desc: 'Hoodie fleece tebal dengan kantong depan dan tali serut. Hangat dan nyaman.',
    variants: [
      { id: 100, size: 'M', color: 'Abu-abu', hex: '#9ca3af', stok: 10 },
      { id: 101, size: 'L', color: 'Abu-abu', hex: '#9ca3af', stok: 7 },
      { id: 102, size: 'L', color: 'Navy', hex: '#1e3a8a', stok: 5 } ] },
  { id: 5, category: 'Kaos', name: 'Kaos Polo Basic', price: 95000,
    desc: 'Polo bahan lacoste halus dengan kerah rapi. Bisa untuk santai maupun semi-formal.',
    variants: [
      { id: 40, size: 'M', color: 'Navy', hex: '#1e3a8a', stok: 20 },
      { id: 41, size: 'L', color: 'Navy', hex: '#1e3a8a', stok: 14 },
      { id: 42, size: 'L', color: 'Putih', hex: '#f3f4f6', stok: 9 } ] },
  { id: 6, category: 'Kemeja', name: 'Kemeja Linen Polos', price: 175000,
    desc: 'Kemeja linen polos yang ringan dan sejuk, ideal untuk cuaca panas.',
    variants: [
      { id: 80, size: 'M', color: 'Putih', hex: '#f3f4f6', stok: 11 },
      { id: 81, size: 'L', color: 'Putih', hex: '#f3f4f6', stok: 0 },
      { id: 82, size: 'M', color: 'Krem', hex: '#d9c9a3', stok: 6 } ] }
];
const SIZE_ORDER = ['S', 'M', 'L', 'XL', '30', '32', '34'];
const COURIERS = {
  hemat:   { nama: 'Hemat (5-7 hari)',   ongkir: 12000 },
  reguler: { nama: 'Reguler (3-5 hari)', ongkir: 20000 },
  express: { nama: 'Express (1-2 hari)', ongkir: 35000 }
};
const PAYMENT_METHODS = ['Transfer Bank', 'E-Wallet', 'QRIS'];
const STATUS_LABEL = {
  PENDING: 'Menunggu Pembayaran', PAYMENT_FAILED: 'Pembayaran Gagal', PAID: 'Dibayar',
  PROCESSING: 'Diproses', SHIPPED: 'Dikirim', COMPLETED: 'Selesai', CANCELLED: 'Dibatalkan'
};
const PAY_WINDOW_MS = 24 * 60 * 60 * 1000; // batas waktu bayar 24 jam

/* ---------- 2. Utilitas ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rupiah = n => 'Rp' + Number(n).toLocaleString('id-ID');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = t => new Date(t).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
const param = k => new URLSearchParams(location.search).get(k);

const memStore = {};
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return k in memStore ? memStore[k] : d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { memStore[k] = v; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { delete memStore[k]; } }
};

/* Ilustrasi baju (SVG) agar proyek tidak bergantung pada file gambar */
function garmentSVG(p, hex, colorName) {
  const edge = 'rgba(0,0,0,.28)';
  const dark = 'rgba(0,0,0,.18)';
  let shape = '';
  if (p.category === 'Kaos') {
    shape = `<path d="M62 38 L86 28 Q100 46 114 28 L138 38 L172 76 L148 96 L140 84 L140 172 L60 172 L60 84 L52 96 L28 76 Z" fill="${hex}" stroke="${edge}" stroke-width="2"/>
      <path d="M86 28 Q100 46 114 28" fill="none" stroke="${edge}" stroke-width="3"/>`;
    if (/polo/i.test(p.name)) shape += `<path d="M86 28 L100 52 L114 28 L108 24 L100 34 L92 24 Z" fill="rgba(255,255,255,.4)" stroke="${edge}"/><circle cx="100" cy="66" r="2.5" fill="${edge}"/>`;
  } else if (p.category === 'Kemeja') {
    shape = `<path d="M62 34 L86 26 L100 44 L114 26 L138 34 L176 84 L166 176 L148 178 L146 96 L140 90 L140 176 L60 176 L60 90 L54 96 L52 178 L34 176 L24 84 Z" fill="${hex}" stroke="${edge}" stroke-width="2"/>
      <path d="M86 26 L100 44 L90 54 L76 34 Z M114 26 L100 44 L110 54 L124 34 Z" fill="rgba(255,255,255,.4)" stroke="${edge}"/>
      <path d="M100 44 L100 176" stroke="${edge}" stroke-width="1.5"/>
      <circle cx="104" cy="72" r="2.5" fill="${edge}"/><circle cx="104" cy="98" r="2.5" fill="${edge}"/><circle cx="104" cy="124" r="2.5" fill="${edge}"/><circle cx="104" cy="150" r="2.5" fill="${edge}"/>`;
    if (/flannel|kotak/i.test(p.name)) shape += `<g stroke="${dark}" stroke-width="3" opacity=".7"><path d="M70 60V176M85 60V176M115 60V176M130 60V176M34 100H166M34 130H166M34 160H166"/></g>`;
  } else if (p.category === 'Celana') {
    shape = `<path d="M64 28 L136 28 L144 176 L110 176 L100 80 L90 176 L56 176 Z" fill="${hex}" stroke="${edge}" stroke-width="2"/>
      <path d="M64 40 H136" stroke="${edge}" stroke-width="2"/><path d="M100 40 V80" stroke="${edge}" stroke-width="1.5"/>
      <path d="M70 50 Q80 62 84 50" fill="none" stroke="${edge}"/>`;
  } else {
    shape = `<path d="M60 52 L86 44 L114 44 L140 52 L176 92 L160 168 L142 168 L140 100 L140 176 L60 176 L60 100 L58 168 L40 168 L24 92 Z" fill="${hex}" stroke="${edge}" stroke-width="2"/>
      <path d="M80 44 Q100 10 120 44 Q100 64 80 44 Z" fill="${dark}" stroke="${edge}" stroke-width="2"/>
      <path d="M94 56 V84 M106 56 V84" stroke="${edge}" stroke-width="2.5"/>
      <path d="M72 132 L128 132 L134 160 L66 160 Z" fill="none" stroke="${edge}" stroke-width="2"/>`;
  }
  return `<svg viewBox="0 0 200 200" role="img" aria-label="Ilustrasi ${esc(p.name)} warna ${esc(colorName)}"><rect width="200" height="200" fill="#efeae3"/>${shape}</svg>`;
}

/* Toast (feedback) & dialog konfirmasi (pencegahan kesalahan) */
function toast(msg, type = 'success') {
  let c = $('#toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; c.setAttribute('aria-live', 'polite'); document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = 'toast toast-' + type; t.textContent = msg; c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
function confirmDialog(title, msg, okLabel = 'Ya, lanjutkan') {
  return new Promise(resolve => {
    let d = $('#confirm-dialog');
    if (!d) { d = document.createElement('dialog'); d.id = 'confirm-dialog'; document.body.appendChild(d); }
    if (typeof d.showModal !== 'function') return resolve(window.confirm(title + '\n' + msg));
    d.innerHTML = `<form method="dialog"><h2>${esc(title)}</h2><p>${esc(msg)}</p>
      <div class="dialog-actions"><button value="cancel" class="btn btn-secondary">Batal</button><button value="ok" class="btn btn-primary">${esc(okLabel)}</button></div></form>`;
    d.returnValue = '';
    d.onclose = () => resolve(d.returnValue === 'ok');
    d.showModal();
  });
}

/* Validasi form (pesan error spesifik di dekat field) */
function fieldError(id, msg) {
  const el = document.getElementById(id), err = document.getElementById('err-' + id);
  if (err) err.textContent = msg || '';
  if (el) { if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); }
  return !msg;
}
function runValidation(rules) {
  let first = null;
  rules.forEach(([id, fn]) => {
    const el = document.getElementById(id);
    const ok = fieldError(id, fn(el.value.trim()));
    if (!ok && !first) first = el;
  });
  if (first) first.focus();
  return !first;
}
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isPhone = v => /^(?:\+?62|0)8\d{7,11}$/.test(v.replace(/[\s-]/g, ''));
const clearErrorOnInput = form => form.addEventListener('input', e => { if (e.target.id) fieldError(e.target.id, ''); });

/* ---------- 3. State: produk, stok, keranjang, user, pesanan ---------- */
function findVariant(variantId) {
  for (const p of PRODUCTS) { const v = p.variants.find(x => x.id === Number(variantId)); if (v) return { product: p, variant: v }; }
  return null;
}
const getSold = () => store.get('tbo_sold', {});
const stockOf = id => { const f = findVariant(id); return f ? Math.max(0, f.variant.stok - (getSold()[id] || 0)) : 0; };
const totalStock = p => p.variants.reduce((n, v) => n + stockOf(v.id), 0);

const getCart = () => store.get('tbo_cart', []);
function saveCart(c) { store.set('tbo_cart', c); updateCartBadge(); }
const cartCount = () => getCart().reduce((n, i) => n + i.qty, 0);
function cartLines() {
  return getCart().map(ci => { const f = findVariant(ci.variantId); return f ? { ...ci, product: f.product, variant: f.variant, subtotal: f.product.price * ci.qty } : null; }).filter(Boolean);
}
const cartSubtotal = () => cartLines().reduce((n, l) => n + l.subtotal, 0);
function updateCartBadge() { const b = $('#cart-count'); if (b) b.textContent = cartCount(); }

function addToCart(variantId, qty) {
  const f = findVariant(variantId);
  if (!f) return { ok: false, msg: 'Varian tidak ditemukan.' };
  qty = parseInt(qty, 10);
  if (!Number.isInteger(qty) || qty < 1) return { ok: false, msg: 'Jumlah minimal 1.' };
  const stock = stockOf(variantId);
  if (stock < 1) return { ok: false, msg: 'Stok habis. Silakan pilih varian lain.' };
  const cart = getCart(), ex = cart.find(i => i.variantId === Number(variantId)), already = ex ? ex.qty : 0;
  if (already + qty > stock) return { ok: false, msg: `Stok tersisa ${stock}; di keranjang sudah ada ${already}.` };
  if (ex) ex.qty += qty; else cart.push({ variantId: Number(variantId), qty });
  saveCart(cart);
  return { ok: true, msg: 'Produk ditambahkan ke keranjang.' };
}

const getUsers = () => store.get('tbo_users', []);
const getUser = () => store.get('tbo_session', null);
const getOrders = () => store.get('tbo_orders', []);
const saveOrders = o => store.set('tbo_orders', o);
function nextSeq(key, start) { const n = store.get(key, start) + 1; store.set(key, n); return n; }
function expireOrders() { // decision "masih dalam batas waktu bayar?" -> TIDAK = CANCELLED
  const os = getOrders(); let changed = false;
  os.forEach(o => { if ((o.status === 'PENDING' || o.status === 'PAYMENT_FAILED') && Date.now() > o.deadline) { o.status = 'CANCELLED'; changed = true; } });
  if (changed) saveOrders(os);
}

/* ---------- 4. Layout bersama: header (navigasi konsisten) & footer ---------- */
function renderLayout() {
  const page = document.body.dataset.page, user = getUser();
  const link = (href, key, label) => `<a href="${href}" ${page === key ? 'class="active" aria-current="page"' : ''}>${label}</a>`;
  $('#site-header').innerHTML = `<div class="container nav-wrap">
    <a class="brand" href="index.html">Toko Baju Online</a>
    <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Buka menu">&#9776; Menu</button>
    <nav id="main-nav" class="main-nav" aria-label="Navigasi utama">
      ${link('index.html', 'home', 'Home')}${link('product.html', 'product', 'Produk')}
      ${link('cart.html', 'cart', 'Keranjang <span class="badge" id="cart-count">0</span>')}
      ${link('checkout.html', 'checkout', 'Checkout')}${link('orders.html', 'orders', 'Pesanan')}
      ${user ? `<button type="button" id="logout-btn">Keluar (${esc(user.nama.split(' ')[0])})</button>` : link('login.html', 'login', 'Masuk')}
    </nav></div>`;
  $('#site-footer').innerHTML = `<div class="container footer-inner">
    <span>&copy; 2026 Toko Baju Online &middot; Tugas 7 E-Business System &middot; Yemima Milka Dalita (24208079)</span>
    <span>Mode simulasi front-end &middot; <button type="button" id="reset-demo">Reset data demo</button></span></div>`;
  updateCartBadge();
  const tg = $('#nav-toggle'), nav = $('#main-nav');
  tg.addEventListener('click', () => { const open = nav.classList.toggle('open'); tg.setAttribute('aria-expanded', open); });
  const lo = $('#logout-btn');
  if (lo) lo.addEventListener('click', () => { store.del('tbo_session'); toast('Anda telah keluar.', 'info'); setTimeout(() => location.href = 'index.html', 600); });
  $('#reset-demo').addEventListener('click', async () => {
    if (await confirmDialog('Reset data demo?', 'Semua akun, keranjang, pesanan, dan stok simulasi akan dikembalikan ke kondisi awal.', 'Ya, reset')) {
      ['tbo_cart', 'tbo_users', 'tbo_session', 'tbo_orders', 'tbo_sold', 'tbo_order_seq', 'tbo_pay_seq'].forEach(store.del);
      location.href = 'index.html';
    }
  });
}

/* ---------- 5. Product card & katalog ---------- */
function productCard(p) {
  const stock = totalStock(p), colors = [...new Set(p.variants.map(v => v.color))];
  const sizes = [...new Set(p.variants.map(v => v.size))].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
  return `<article class="product-card">
    <a class="pc-img" href="product.html?id=${p.id}" aria-label="Lihat ${esc(p.name)}">${garmentSVG(p, p.variants[0].hex, p.variants[0].color)}${stock === 0 ? '<span class="tag-soldout">Stok habis</span>' : ''}</a>
    <div class="pc-body"><span class="pc-cat">${esc(p.category)}</span>
      <h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
      <p class="pc-price">${rupiah(p.price)}</p>
      <p class="pc-info">${colors.length} warna &middot; ukuran ${esc(sizes[0])}${sizes.length > 1 ? '-' + esc(sizes[sizes.length - 1]) : ''} &middot; stok ${stock}</p>
      <div class="pc-actions"><a class="btn btn-primary" href="product.html?id=${p.id}">Lihat Detail</a></div></div></article>`;
}

function pageHome() {
  $('#featured').innerHTML = PRODUCTS.slice(0, 4).map(productCard).join('');
  $('#hero-art').innerHTML = garmentSVG(PRODUCTS[0], '#1f2937', 'Hitam');
}

function pageProduct() {
  const id = param('id');
  if (id) return renderDetail(PRODUCTS.find(p => p.id === Number(id)));
  $('#catalog-view').hidden = false;
  const q = $('#search'), cat = $('#filter-cat'), sort = $('#sort'), grid = $('#product-grid'), info = $('#result-info');
  cat.innerHTML = '<option value="">Semua kategori</option>' + [...new Set(PRODUCTS.map(p => p.category))].map(c => `<option>${c}</option>`).join('');
  if (param('cat')) cat.value = param('cat');
  const draw = () => {
    const kw = q.value.trim().toLowerCase();
    let list = PRODUCTS.filter(p => (!cat.value || p.category === cat.value) && (!kw || (p.name + ' ' + p.category).toLowerCase().includes(kw)));
    if (sort.value === 'asc') list.sort((a, b) => a.price - b.price);
    if (sort.value === 'desc') list.sort((a, b) => b.price - a.price);
    if (sort.value === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    info.textContent = `Menampilkan ${list.length} dari ${PRODUCTS.length} produk`;
    grid.innerHTML = list.length ? list.map(productCard).join('') : '<div class="empty" style="grid-column:1/-1"><h3>Produk tidak ditemukan</h3><p class="muted">Coba kata kunci atau kategori lain.</p></div>';
  };
  [q, cat, sort].forEach(el => el.addEventListener('input', draw));
  draw();
}

function renderDetail(p) {
  const view = $('#detail-view'); view.hidden = false;
  if (!p) { view.innerHTML = '<div class="empty"><h2>Produk tidak ditemukan</h2><a class="btn btn-primary" href="product.html">Kembali ke katalog</a></div>'; return; }
  document.title = p.name + ' - Toko Baju Online';
  const colors = [...new Map(p.variants.map(v => [v.color, v.hex]))];
  const first = p.variants.find(v => stockOf(v.id) > 0) || p.variants[0];
  const sel = { color: first.color, size: first.size, qty: 1 };
  view.innerHTML = `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="product.html">Produk</a> / ${esc(p.name)}</nav>
    <div class="detail">
      <div class="detail-img" id="pd-image"></div>
      <div>
        <span class="pc-cat">${esc(p.category)}</span>
        <h1>${esc(p.name)}</h1>
        <p class="detail-price">${rupiah(p.price)}</p>
        <p>${esc(p.desc)}</p>
        <span class="opt-label">Warna: <span id="pd-color-name"></span></span>
        <div class="swatches" id="pd-colors"></div>
        <span class="opt-label">Ukuran</span>
        <div class="sizes" id="pd-sizes"></div>
        <p class="stock-note" id="pd-stock"></p>
        <span class="opt-label">Jumlah</span>
        <div class="qty"><button type="button" data-qty="-1" aria-label="Kurangi jumlah">&minus;</button>
          <input type="number" id="pd-qty" min="1" value="1" aria-label="Jumlah"><button type="button" data-qty="1" aria-label="Tambah jumlah">+</button></div>
        <div class="detail-cta"><button type="button" class="btn btn-primary" id="pd-add">Tambah ke Keranjang</button>
          <a class="btn btn-secondary" href="cart.html">Lihat Keranjang</a></div>
        <div class="feedback" id="pd-feedback" role="status" aria-live="polite"></div>
      </div></div>`;
  const cur = () => p.variants.find(v => v.color === sel.color && v.size === sel.size);
  const draw = () => {
    const v = cur(), stock = v ? stockOf(v.id) : 0;
    $('#pd-image').innerHTML = garmentSVG(p, v ? v.hex : first.hex, sel.color);
    $('#pd-color-name').textContent = sel.color;
    $('#pd-colors').innerHTML = colors.map(([c, hex]) => `<button type="button" class="swatch" data-color="${esc(c)}" style="--sw:${hex}" aria-pressed="${c === sel.color}" title="${esc(c)}"><span class="sr-only">${esc(c)}</span></button>`).join('');
    const sizes = p.variants.filter(x => x.color === sel.color).sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));
    $('#pd-sizes').innerHTML = sizes.map(x => `<button type="button" class="size-btn" data-size="${esc(x.size)}" aria-pressed="${x.size === sel.size}" ${stockOf(x.id) < 1 ? 'disabled title="Stok habis"' : ''}>${esc(x.size)}</button>`).join('');
    const sn = $('#pd-stock');
    sn.className = 'stock-note ' + (stock < 1 ? 'stock-out' : stock <= 5 ? 'stock-low' : 'stock-ok');
    sn.textContent = stock < 1 ? 'Stok habis untuk varian ini. Pilih varian lain.' : stock <= 5 ? `Stok menipis: tersisa ${stock}` : `Stok tersedia: ${stock}`;
    const input = $('#pd-qty');
    sel.qty = Math.min(Math.max(1, sel.qty), Math.max(1, stock)); input.value = sel.qty; input.max = stock;
    $('#pd-add').disabled = stock < 1;
  };
  const say = (msg, ok) => { const f = $('#pd-feedback'); f.textContent = msg; f.className = 'feedback ' + (ok ? 'ok' : 'err'); };
  view.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.color) {
      sel.color = b.dataset.color;
      const opts = p.variants.filter(x => x.color === sel.color);
      const keep = opts.find(x => x.size === sel.size && stockOf(x.id) > 0);
      sel.size = (keep || opts.find(x => stockOf(x.id) > 0) || opts[0]).size; sel.qty = 1; $('#pd-feedback').textContent = ''; draw();
    } else if (b.dataset.size) { sel.size = b.dataset.size; sel.qty = 1; $('#pd-feedback').textContent = ''; draw(); }
    else if (b.dataset.qty) { sel.qty += Number(b.dataset.qty); draw(); }
    else if (b.id === 'pd-add') {
      const v = cur(), r = addToCart(v.id, sel.qty);
      say(r.msg, r.ok); toast(r.msg, r.ok ? 'success' : 'error');
    }
  });
  $('#pd-qty').addEventListener('input', e => { const n = parseInt(e.target.value, 10); sel.qty = Number.isInteger(n) ? n : 1; });
  $('#pd-qty').addEventListener('change', draw);
  draw();
}

/* ---------- 6. Keranjang ---------- */
function pageCart() {
  const box = $('#cart-box'), side = $('#cart-summary');
  const draw = () => {
    const lines = cartLines();
    if (!lines.length) {
      box.innerHTML = '<div class="empty"><h2>Keranjang masih kosong</h2><p class="muted">Pilih baju favorit Anda terlebih dahulu.</p><a class="btn btn-primary" href="product.html">Mulai Belanja</a></div>';
      side.hidden = true; return;
    }
    side.hidden = false;
    box.innerHTML = lines.map(l => `<div class="cart-item" data-id="${l.variant.id}">
      <div class="cart-thumb">${garmentSVG(l.product, l.variant.hex, l.variant.color)}</div>
      <div><p class="ci-name"><a href="product.html?id=${l.product.id}">${esc(l.product.name)}</a></p>
        <p class="ci-var">${esc(l.variant.color)} / ${esc(l.variant.size)} &middot; ${rupiah(l.product.price)} &middot; stok ${stockOf(l.variant.id)}</p>
        <div class="qty"><button type="button" data-act="dec" aria-label="Kurangi jumlah">&minus;</button>
          <input type="number" min="1" max="${stockOf(l.variant.id)}" value="${l.qty}" data-act="set" aria-label="Jumlah ${esc(l.product.name)}"><button type="button" data-act="inc" aria-label="Tambah jumlah">+</button></div></div>
      <div class="ci-right"><strong>${rupiah(l.subtotal)}</strong><button type="button" class="btn btn-danger btn-small" data-act="del">Hapus</button></div></div>`).join('');
    $('#sum-items').textContent = cartCount() + ' item';
    $('#sum-subtotal').textContent = rupiah(cartSubtotal());
  };
  const setQty = (id, qty) => {
    const cart = getCart(), it = cart.find(i => i.variantId === id), stock = stockOf(id);
    if (!it) return;
    if (!Number.isInteger(qty) || qty < 1) { toast('Jumlah minimal 1.', 'error'); return draw(); }
    if (qty > stock) { toast(`Stok hanya tersisa ${stock}.`, 'error'); qty = stock; }
    it.qty = qty; saveCart(cart); draw();
  };
  box.addEventListener('click', async e => {
    const b = e.target.closest('button[data-act]'); if (!b) return;
    const id = Number(b.closest('.cart-item').dataset.id), it = getCart().find(i => i.variantId === id);
    if (b.dataset.act === 'inc') setQty(id, it.qty + 1);
    if (b.dataset.act === 'dec') setQty(id, it.qty - 1);
    if (b.dataset.act === 'del' && await confirmDialog('Hapus dari keranjang?', 'Produk ini akan dihapus dari keranjang Anda.', 'Ya, hapus')) {
      saveCart(getCart().filter(i => i.variantId !== id)); toast('Produk dihapus dari keranjang.', 'info'); draw();
    }
  });
  box.addEventListener('change', e => { if (e.target.dataset.act === 'set') setQty(Number(e.target.closest('.cart-item').dataset.id), parseInt(e.target.value, 10)); });
  draw();
}

/* ---------- 7. Checkout (data pelanggan -> alamat -> pembayaran -> konfirmasi) ---------- */
function pageCheckout() {
  const wrap = $('#checkout-wrap'), user = getUser(), lines = cartLines();
  if (!lines.length) { wrap.innerHTML = '<div class="empty"><h2>Keranjang kosong</h2><p class="muted">Tambahkan produk sebelum checkout.</p><a class="btn btn-primary" href="product.html">Mulai Belanja</a></div>'; return; }
  if (!user) { wrap.innerHTML = '<div class="notice">Anda perlu masuk atau mendaftar terlebih dahulu untuk melanjutkan checkout.</div><a class="btn btn-primary" href="login.html?next=checkout.html">Masuk / Daftar</a>'; return; }
  $('#co-body').hidden = false;
  $('#co-nama').value = user.nama; $('#co-email').value = user.email; $('#co-hp').value = user.hp || '';
  $('#co-kurir').innerHTML = '<option value="">-- Pilih kurir --</option>' + Object.entries(COURIERS).map(([k, c]) => `<option value="${k}">${c.nama} - ${rupiah(c.ongkir)}</option>`).join('');
  $('#co-metode').innerHTML = PAYMENT_METHODS.map(m => `<label class="radio-card"><input type="radio" name="metode" value="${m}"> ${m}</label>`).join('');
  const summary = () => {
    const k = COURIERS[$('#co-kurir').value], ongkir = k ? k.ongkir : 0, sub = cartSubtotal();
    $('#co-list').innerHTML = lines.map(l => `<li><span>${esc(l.product.name)} (${esc(l.variant.color)}/${esc(l.variant.size)}) x${l.qty}</span><span>${rupiah(l.subtotal)}</span></li>`).join('');
    $('#co-sub').textContent = rupiah(sub); $('#co-ongkir').textContent = k ? rupiah(ongkir) : '-'; $('#co-total').textContent = rupiah(sub + ongkir);
  };
  summary();
  const form = $('#checkout-form');
  clearErrorOnInput(form);
  $('#co-kurir').addEventListener('change', summary);
  form.addEventListener('change', e => { if (e.target.name === 'metode') $('#err-co-metode').textContent = ''; });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = runValidation([
      ['co-nama', v => v ? '' : 'Nama penerima wajib diisi.'],
      ['co-email', v => !v ? 'Email wajib diisi.' : isEmail(v) ? '' : 'Format email belum benar, contoh: nama@email.com.'],
      ['co-hp', v => !v ? 'Nomor HP wajib diisi.' : isPhone(v) ? '' : 'Nomor HP tidak valid. Gunakan format 08xxxxxxxxxx.'],
      ['co-alamat', v => !v ? 'Alamat wajib diisi.' : v.length < 10 ? 'Alamat terlalu singkat. Tulis jalan, nomor, dan kelurahan.' : ''],
      ['co-kota', v => v ? '' : 'Kota wajib diisi.'],
      ['co-kurir', v => v ? '' : 'Silakan pilih kurir pengiriman.']
    ]);
    const metode = form.querySelector('input[name="metode"]:checked');
    if (!metode) { $('#err-co-metode').textContent = 'Silakan pilih metode pembayaran.'; if (ok) $('#co-metode input').focus(); ok = false; }
    if (!ok) return toast('Masih ada isian yang belum benar.', 'error');
    for (const l of lines) { // decision: stok tersedia?
      if (stockOf(l.variant.id) < l.qty) return toast(`Stok ${l.product.name} (${l.variant.color}/${l.variant.size}) tidak mencukupi. Ubah jumlah di keranjang.`, 'error');
    }
    const k = COURIERS[$('#co-kurir').value], sub = cartSubtotal();
    if (!await confirmDialog('Buat pesanan?', `Total pembayaran ${rupiah(sub + k.ongkir)}. Pesanan akan dibuat dengan status Menunggu Pembayaran.`, 'Ya, buat pesanan')) return;
    const order = {
      id: nextSeq('tbo_order_seq', 1000), email: user.email, tanggal: Date.now(), deadline: Date.now() + PAY_WINDOW_MS,
      nama: $('#co-nama').value.trim(), hp: $('#co-hp').value.trim(), alamat: $('#co-alamat').value.trim(), kota: $('#co-kota').value.trim(),
      kurir: k.nama, ongkir: k.ongkir, subtotal: sub, total: sub + k.ongkir, metode: metode.value, status: 'PENDING', noResi: '',
      items: lines.map(l => ({ variantId: l.variant.id, nama: l.product.name, warna: l.variant.color, ukuran: l.variant.size, qty: l.qty, price: l.product.price, subtotal: l.subtotal })),
      payments: []
    };
    const os = getOrders(); os.push(order); saveOrders(os); saveCart([]);
    location.href = 'orders.html?new=' + order.id;
  });
}

/* ---------- 8. Pesanan & status transaksi ---------- */
const FLOW = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'];
function orderCard(o, highlight) {
  const idx = FLOW.indexOf(o.status), cancelled = o.status === 'CANCELLED', failed = o.status === 'PAYMENT_FAILED';
  const tl = FLOW.map((s, i) => {
    let c = ''; if (!cancelled) { if (failed && i === 0) c = 'failed'; else if (i < idx) c = 'done'; else if (i === idx) c = 'current'; }
    return `<li class="${c}">${STATUS_LABEL[s]}</li>`;
  }).join('');
  let actions = '', sim = '';
  if (o.status === 'PENDING') actions = `<p class="muted" style="width:100%;margin:0">Bayar dengan <strong>${esc(o.metode)}</strong> sebelum ${fmtDate(o.deadline)}.</p>
      <button class="btn btn-primary" data-act="pay">Bayar Sekarang</button>
      <button class="btn btn-secondary" data-act="payfail">Simulasikan Pembayaran Gagal</button>
      <button class="btn btn-danger" data-act="cancel">Batalkan Pesanan</button>`;
  if (o.status === 'PAYMENT_FAILED') actions = `<p class="muted" style="width:100%;margin:0">Pembayaran gagal. Anda masih dapat membayar ulang sebelum ${fmtDate(o.deadline)}.</p>
      <button class="btn btn-primary" data-act="retry">Bayar Ulang</button>
      <button class="btn btn-secondary" data-act="timeout">Simulasikan Waktu Bayar Habis</button>`;
  if (o.status === 'SHIPPED') actions = '<button class="btn btn-primary" data-act="receive">Konfirmasi Barang Diterima</button>';
  if (o.status === 'PAID') sim = '<button class="btn btn-secondary btn-small" data-act="process">Proses pesanan</button>';
  if (o.status === 'PROCESSING') sim = '<button class="btn btn-secondary btn-small" data-act="ship">Kirim barang &amp; isi no. resi</button>';
  return `<article class="card order-card ${highlight ? 'highlight' : ''}" data-id="${o.id}" id="order-${o.id}">
    <div class="order-head"><div><h2 style="margin:0">Order #${o.id}</h2><span class="muted">${fmtDate(o.tanggal)}</span></div><span class="status st-${o.status}">${STATUS_LABEL[o.status]}</span></div>
    <ol class="timeline" aria-label="Status pesanan">${tl}</ol>
    <div style="overflow-x:auto"><table class="items-table"><thead><tr><th>Produk</th><th>Varian</th><th class="num">Harga</th><th class="num">Jml</th><th class="num">Subtotal</th></tr></thead><tbody>
      ${o.items.map(i => `<tr><td>${esc(i.nama)}</td><td>${esc(i.warna)} / ${esc(i.ukuran)}</td><td class="num">${rupiah(i.price)}</td><td class="num">${i.qty}</td><td class="num">${rupiah(i.subtotal)}</td></tr>`).join('')}
      <tr><td colspan="4" class="num">Ongkir (${esc(o.kurir)})</td><td class="num">${rupiah(o.ongkir)}</td></tr>
      <tr><td colspan="4" class="num"><strong>Total</strong></td><td class="num"><strong>${rupiah(o.total)}</strong></td></tr></tbody></table></div>
    <p style="margin-top:.7rem"><strong>Dikirim ke:</strong> ${esc(o.nama)} (${esc(o.hp)}), ${esc(o.alamat)}, ${esc(o.kota)}<br>
      <strong>No. resi:</strong> ${o.noResi ? esc(o.noResi) : '<span class="muted">belum tersedia</span>'}
      ${o.payments.length ? '<br><strong>Pembayaran:</strong> ' + o.payments.map(p => `#${p.id} ${esc(p.metode)} ${p.status}`).join(', ') : ''}</p>
    ${actions ? `<div class="order-actions">${actions}</div>` : ''}
    ${sim ? `<div class="sim-box"><strong>Simulasi sisi Admin (akan diganti back-end)</strong>${sim}</div>` : ''}</article>`;
}

function pageOrders() {
  const box = $('#orders-box'), user = getUser();
  if (!user) { box.innerHTML = '<div class="notice">Silakan masuk untuk melihat status pesanan Anda.</div><a class="btn btn-primary" href="login.html?next=orders.html">Masuk / Daftar</a>'; return; }
  expireOrders();
  const newId = Number(param('new'));
  if (newId) toast('Pesanan berhasil dibuat. Silakan lakukan pembayaran.', 'success');
  const draw = () => {
    const list = getOrders().filter(o => o.email === user.email).sort((a, b) => b.id - a.id);
    box.innerHTML = list.length ? list.map(o => orderCard(o, o.id === newId)).join('') : '<div class="empty"><h2>Belum ada pesanan</h2><a class="btn btn-primary" href="product.html">Mulai Belanja</a></div>';
  };
  const update = (id, fn) => { const os = getOrders(), o = os.find(x => x.id === id); fn(o); saveOrders(os); draw(); };
  box.addEventListener('click', async e => {
    const b = e.target.closest('button[data-act]'); if (!b) return;
    const id = Number(b.closest('.order-card').dataset.id), o = getOrders().find(x => x.id === id), act = b.dataset.act;
    if (act === 'pay') {
      if (!await confirmDialog('Bayar pesanan?', `Simulasi pembayaran ${rupiah(o.total)} dengan ${o.metode}.`, 'Bayar')) return;
      const short = o.items.find(i => stockOf(i.variantId) < i.qty);
      if (short) return toast(`Stok ${short.nama} (${short.warna}/${short.ukuran}) tidak mencukupi.`, 'error');
      const sold = getSold(); o.items.forEach(i => { sold[i.variantId] = (sold[i.variantId] || 0) + i.qty; }); store.set('tbo_sold', sold);
      update(id, x => { x.payments.push({ id: nextSeq('tbo_pay_seq', 3000), metode: x.metode, status: 'SUCCESS' }); x.status = 'PAID'; });
      toast('Pembayaran berhasil. Stok diperbarui.', 'success');
    }
    if (act === 'payfail') { update(id, x => { x.payments.push({ id: nextSeq('tbo_pay_seq', 3000), metode: x.metode, status: 'FAILED' }); x.status = 'PAYMENT_FAILED'; }); toast('Pembayaran gagal.', 'error'); }
    if (act === 'retry') { update(id, x => { x.status = 'PENDING'; }); toast('Silakan ulangi pembayaran.', 'info'); }
    if (act === 'timeout') { update(id, x => { x.deadline = Date.now() - 1; x.status = 'CANCELLED'; }); toast('Waktu bayar habis. Pesanan dibatalkan.', 'info'); }
    if (act === 'cancel' && await confirmDialog('Batalkan pesanan?', 'Pesanan yang dibatalkan tidak dapat dipulihkan.', 'Ya, batalkan')) { update(id, x => { x.status = 'CANCELLED'; }); toast('Pesanan dibatalkan.', 'info'); }
    if (act === 'process') { update(id, x => { x.status = 'PROCESSING'; }); toast('Status: Diproses.', 'info'); }
    if (act === 'ship') { update(id, x => { x.status = 'SHIPPED'; x.noResi = 'TBO' + String(Date.now()).slice(-8) + x.id; }); toast('Status: Dikirim, no. resi terisi.', 'info'); }
    if (act === 'receive' && await confirmDialog('Barang sudah diterima?', 'Pesanan akan ditandai Selesai.', 'Ya, sudah diterima')) { update(id, x => { x.status = 'COMPLETED'; }); toast('Terima kasih! Pesanan selesai.', 'success'); }
  });
  draw();
  if (newId) { const el = $('#order-' + newId); if (el) el.scrollIntoView({ block: 'center' }); }
}

/* ---------- 9. Login / registrasi (simulasi) ---------- */
function pageLogin() {
  const user = getUser(), next = /^[a-z]+\.html$/.test(param('next') || '') ? param('next') : 'index.html';
  if (user) { $('#auth-wrap').innerHTML = `<div class="card"><h2>Anda sudah masuk</h2><p>Masuk sebagai <strong>${esc(user.nama)}</strong> (${esc(user.email)}).</p><a class="btn btn-primary" href="${next}">Lanjutkan</a></div>`; return; }
  const tabs = $$('.tab'), panels = { login: $('#panel-login'), register: $('#panel-register') };
  const show = k => { tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.tab === k)); Object.entries(panels).forEach(([n, p]) => p.hidden = n !== k); };
  tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.tab)));
  show('login');
  $$('form').forEach(clearErrorOnInput);
  $('#form-register').addEventListener('submit', e => {
    e.preventDefault();
    if (!runValidation([
      ['rg-nama', v => v ? '' : 'Nama lengkap wajib diisi.'],
      ['rg-email', v => !v ? 'Email wajib diisi.' : isEmail(v) ? '' : 'Format email belum benar.'],
      ['rg-hp', v => !v ? 'Nomor HP wajib diisi.' : isPhone(v) ? '' : 'Gunakan format 08xxxxxxxxxx.'],
      ['rg-pass', v => v.length >= 6 ? '' : 'Kata sandi minimal 6 karakter.'],
      ['rg-pass2', v => v === $('#rg-pass').value ? '' : 'Konfirmasi kata sandi tidak sama.']
    ])) return;
    const users = getUsers(), email = $('#rg-email').value.trim().toLowerCase();
    if (users.some(u => u.email === email)) return fieldError('rg-email', 'Email sudah terdaftar. Silakan masuk.');
    const u = { nama: $('#rg-nama').value.trim(), email, hp: $('#rg-hp').value.trim(), password: $('#rg-pass').value };
    users.push(u); store.set('tbo_users', users); store.set('tbo_session', { nama: u.nama, email: u.email, hp: u.hp });
    toast('Registrasi berhasil. Selamat datang!', 'success'); setTimeout(() => location.href = next, 700);
  });
  $('#form-login').addEventListener('submit', e => {
    e.preventDefault();
    if (!runValidation([
      ['lg-email', v => !v ? 'Email wajib diisi.' : isEmail(v) ? '' : 'Format email belum benar.'],
      ['lg-pass', v => v ? '' : 'Kata sandi wajib diisi.']
    ])) return;
    const u = getUsers().find(x => x.email === $('#lg-email').value.trim().toLowerCase() && x.password === $('#lg-pass').value);
    if (!u) return fieldError('lg-pass', 'Email atau kata sandi salah.');
    store.set('tbo_session', { nama: u.nama, email: u.email, hp: u.hp });
    toast('Berhasil masuk.', 'success'); setTimeout(() => location.href = next, 600);
  });
}

/* ---------- 10. Inisialisasi per halaman ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderLayout();
  const pages = { home: pageHome, product: pageProduct, cart: pageCart, checkout: pageCheckout, orders: pageOrders, login: pageLogin };
  const fn = pages[document.body.dataset.page]; if (fn) fn();
});
