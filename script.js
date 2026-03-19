const PRODUCTS = [
  { id:1, name:'Wireless Pro Earbuds', category:'electronics', emoji:'🎧', price:2499, original:3999, desc:'Premium noise-cancelling earbuds with 30hr battery. Crystal clear sound with deep bass.', rating:5, badge:'sale' },
  { id:2, name:'Smart Watch Elite', category:'electronics', emoji:'⌚', price:8999, original:null, desc:'Health tracking, GPS, SpO2, 7-day battery. Compatible with all smartphones.', rating:4, badge:'new' },
  { id:3, name:'Leather Crossbody Bag', category:'fashion', emoji:'👜', price:1899, original:2599, desc:'Genuine leather with gold hardware. Fits essentials perfectly. Multiple compartments.', rating:5, badge:'sale' },
  { id:4, name:'Silk Scarf Collection', category:'fashion', emoji:'🧣', price:1299, original:null, desc:'100% pure silk with hand-rolled edges. Versatile styling for all occasions.', rating:4, badge:null },
  { id:5, name:'Vitamin C Serum', category:'beauty', emoji:'✨', price:899, original:1299, desc:'20% Vitamin C with hyaluronic acid. Brightens skin, reduces dark spots in 4 weeks.', rating:5, badge:'sale' },
  { id:6, name:'Perfume Noir Edition', category:'beauty', emoji:'🌹', price:3499, original:null, desc:'Woody-oriental fragrance with notes of oud, rose, and amber. 50ml EDP.', rating:4, badge:'new' },
  { id:7, name:'Minimalist Desk Lamp', category:'home', emoji:'💡', price:1599, original:1999, desc:'Touch control, 3 color temperatures, USB charging port. Sleek aluminum design.', rating:5, badge:'sale' },
  { id:8, name:'Ceramic Coffee Set', category:'home', emoji:'☕', price:2299, original:null, desc:'Handcrafted matte ceramic. Set of 4 cups with saucers. Microwave & dishwasher safe.', rating:4, badge:null },
  { id:9, name:'Yoga Mat Premium', category:'sports', emoji:'🧘', price:1199, original:1799, desc:'6mm thick TPE material. Non-slip surface, alignment lines included. Carry bag included.', rating:5, badge:'sale' },
  { id:10, name:'Resistance Bands Set', category:'sports', emoji:'💪', price:699, original:999, desc:'5-level resistance set with door anchor. Perfect for home workouts. Anti-snap material.', rating:4, badge:'new' },
  { id:11, name:'Wireless Charging Pad', category:'electronics', emoji:'⚡', price:1499, original:null, desc:'15W fast wireless charging. Compatible with all Qi devices. LED indicator.', rating:4, badge:null },
  { id:12, name:'Linen Shirt Unisex', category:'fashion', emoji:'👕', price:1099, original:1499, desc:'100% pure linen. Breathable, wrinkle-resistant. Available in 8 colors.', rating:5, badge:'sale' },
];

let cart = JSON.parse(localStorage.getItem('luxe_cart') || '[]');
let currentCategory = 'all';
let searchQuery = '';
let selectedProduct = null;
let modalQty = 1;
let currentUser = JSON.parse(localStorage.getItem('luxe_user') || 'null');
let orders = JSON.parse(localStorage.getItem('luxe_orders') || '[]');

function saveCart() { localStorage.setItem('luxe_cart', JSON.stringify(cart)); }
function saveOrders() { localStorage.setItem('luxe_orders', JSON.stringify(orders)); }

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  let filtered = PRODUCTS.filter(p => {
    const matchCat = currentCategory === 'all' || p.category === currentCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });
  if (!filtered.length) { grid.innerHTML = '<p style="color:var(--muted); grid-column:1/-1; text-align:center; padding:3rem">No products found.</p>'; return; }
  grid.innerHTML = filtered.map(p => `
    <div class="product-card" onclick="openModal(${p.id})">
      <div class="product-img">
        ${p.badge === 'new' ? '<span class="badge-new">NEW</span>' : p.badge === 'sale' ? '<span class="badge-sale">SALE</span>' : ''}
        <span class="product-img-inner">${p.emoji}</span>
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="stars">${'★'.repeat(p.rating)}${'☆'.repeat(5-p.rating)}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc.substring(0,70)}...</div>
        <div class="product-footer">
          <div class="product-price">₹${p.price.toLocaleString('en-IN')}${p.original ? `<span class="original">₹${p.original.toLocaleString('en-IN')}</span>` : ''}</div>
          <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${p.id})">Add +</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterCategory(cat, el) {
  currentCategory = cat;
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  renderProducts();
}

function filterProducts(val) { searchQuery = val; renderProducts(); }

function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  const existing = cart.find(x => x.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...p, qty: 1 });
  saveCart();
  updateCartUI();
  showToast(`${p.emoji} ${p.name} added to cart`);
}

function updateCartUI() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = total;
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!cart.length) {
    container.innerHTML = '<div class="cart-empty"><div class="empty-icon">🛒</div><p>Your cart is empty</p></div>';
    footer.style.display = 'none'; return;
  }
  footer.style.display = 'block';
  container.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div class="cart-item-emoji">${i.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${i.name}</div>
        <div class="cart-item-price">₹${i.price.toLocaleString('en-IN')}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${i.id}, -1)">−</button>
          <span class="qty-display">${i.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i.id}, 1)">+</button>
        </div>
      </div>
      <button class="remove-item" onclick="removeFromCart(${i.id})">✕</button>
    </div>
  `).join('');
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cartSubtotal').textContent = '₹' + sub.toLocaleString('en-IN');
  document.getElementById('cartTotal').textContent = '₹' + sub.toLocaleString('en-IN');
}

function changeQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  saveCart(); updateCartUI();
}

function removeFromCart(id) { cart = cart.filter(x => x.id !== id); saveCart(); updateCartUI(); }

function toggleCart() {
  document.getElementById('cartOverlay').classList.toggle('open');
  document.getElementById('cartSidebar').classList.toggle('open');
  updateCartUI();
}

function openModal(id) {
  selectedProduct = PRODUCTS.find(x => x.id === id);
  modalQty = 1;
  document.getElementById('modalImg').textContent = selectedProduct.emoji;
  document.getElementById('modalCat').textContent = selectedProduct.category;
  document.getElementById('modalName').textContent = selectedProduct.name;
  document.getElementById('modalStars').textContent = '★'.repeat(selectedProduct.rating) + '☆'.repeat(5 - selectedProduct.rating);
  document.getElementById('modalDesc').textContent = selectedProduct.desc;
  document.getElementById('modalPrice').innerHTML = `₹${selectedProduct.price.toLocaleString('en-IN')}${selectedProduct.original ? `<span class="original">₹${selectedProduct.original.toLocaleString('en-IN')}</span>` : ''}`;
  document.getElementById('modalQty').textContent = 1;
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal(e) { if (e.target.id === 'modalOverlay') document.getElementById('modalOverlay').classList.remove('open'); }

function changeModalQty(d) {
  modalQty = Math.max(1, modalQty + d);
  document.getElementById('modalQty').textContent = modalQty;
}

function addModalToCart() {
  for (let i = 0; i < modalQty; i++) addToCart(selectedProduct.id);
  document.getElementById('modalOverlay').classList.remove('open');
}

function goToCheckout() {
  if (!cart.length) { showToast('Cart is empty!'); return; }
  toggleCart();
  document.getElementById('checkoutItems').innerHTML = cart.map(i => `<div class="order-line"><span>${i.emoji} ${i.name} ×${i.qty}</span><span>₹${(i.price*i.qty).toLocaleString('en-IN')}</span></div>`).join('');
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('checkoutSubtotal').textContent = '₹' + sub.toLocaleString('en-IN');
  document.getElementById('checkoutTotal').textContent = '₹' + sub.toLocaleString('en-IN');
  showCheckout();
}

function showCheckout() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('checkout-page').classList.add('active');
  document.getElementById('success-page').style.display = 'none';
  window.scrollTo(0, 0);
}

function placeOrder() {
  const name = document.getElementById('shipName').value;
  if (!name) { showToast('Please fill in your details'); return; }
  const orderId = 'LUXE-' + Date.now().toString(36).toUpperCase();
  const order = { id: orderId, date: new Date().toLocaleDateString('en-IN'), items: [...cart], total: cart.reduce((s, i) => s + i.price * i.qty, 0), status: 'Confirmed' };
  orders.push(order); saveOrders();
  cart = []; saveCart(); updateCartUI();
  document.getElementById('checkout-page').classList.remove('active');
  document.getElementById('orderId').textContent = orderId;
  document.getElementById('success-page').style.display = 'block';
  window.scrollTo(0, 0);
}

function backToStore() {
  document.getElementById('success-page').style.display = 'none';
  document.getElementById('checkout-page').classList.remove('active');
  showPage('store');
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('checkout-page').classList.remove('active');
  document.getElementById('success-page').style.display = 'none';
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  if (name === 'store') {
    document.getElementById('store-page').classList.add('active');
    document.querySelector('nav a:nth-child(1)').classList.add('active');
  } else if (name === 'orders') {
    document.getElementById('orders-page').classList.add('active');
    renderOrders();
  } else if (name === 'auth') {
    document.getElementById('auth-page').classList.add('active');
    if (currentUser) { document.getElementById('loginCard').style.display = 'none'; document.getElementById('registerCard').style.display = 'none'; document.getElementById('profileCard').style.display = 'block'; document.getElementById('profileGreet').textContent = 'Hello, ' + currentUser.name + ' 👋'; }
    else { document.getElementById('loginCard').style.display = 'block'; document.getElementById('registerCard').style.display = 'none'; document.getElementById('profileCard').style.display = 'none'; }
  }
  window.scrollTo(0, 0);
}

function renderOrders() {
  const el = document.getElementById('ordersList');
  if (!orders.length) { el.innerHTML = '<p style="color:var(--muted)">No orders yet. Start shopping!</p>'; return; }
  el.innerHTML = orders.slice().reverse().map(o => `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.5rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
        <div><div style="font-family:'Playfair Display',serif;font-size:1rem;">${o.id}</div><div style="font-size:0.8rem;color:var(--muted)">${o.date}</div></div>
        <span style="background:#1a3a1a;color:var(--green);border-radius:100px;padding:0.25rem 0.75rem;font-size:0.8rem;">${o.status}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem;">${o.items.map(i=>`<span style="background:var(--surface2);border-radius:6px;padding:0.25rem 0.6rem;font-size:0.82rem;">${i.emoji} ${i.name} ×${i.qty}</span>`).join('')}</div>
      <div style="display:flex;justify-content:space-between;font-size:0.9rem;"><span style="color:var(--muted)">Order Total</span><span style="color:var(--accent);font-weight:500;">₹${o.total.toLocaleString('en-IN')}</span></div>
    </div>
  `).join('');
}

function toggleAuthMode() {
  const l = document.getElementById('loginCard'), r = document.getElementById('registerCard');
  l.style.display = l.style.display === 'none' ? 'block' : 'none';
  r.style.display = r.style.display === 'none' ? 'block' : 'none';
}

function loginUser() {
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPass').value;
  if (!email || !pass) { showToast('Please fill in all fields'); return; }
  const users = JSON.parse(localStorage.getItem('luxe_users') || '[]');
  const user = users.find(u => u.email === email && u.pass === pass);
  if (!user) { showToast('Invalid credentials'); return; }
  currentUser = user; localStorage.setItem('luxe_user', JSON.stringify(user));
  showPage('auth'); showToast('Welcome back, ' + user.name + '!');
}

function registerUser() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const pass = document.getElementById('regPass').value;
  if (!name || !email || !pass) { showToast('Please fill all fields'); return; }
  const users = JSON.parse(localStorage.getItem('luxe_users') || '[]');
  if (users.find(u => u.email === email)) { showToast('Email already registered'); return; }
  const user = { name, email, pass };
  users.push(user); localStorage.setItem('luxe_users', JSON.stringify(users));
  currentUser = user; localStorage.setItem('luxe_user', JSON.stringify(user));
  showPage('auth'); showToast('Account created! Welcome, ' + name + '!');
}

function logoutUser() { currentUser = null; localStorage.removeItem('luxe_user'); showPage('auth'); showToast('Signed out successfully'); }

function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function scrollToProducts() { document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' }); }

function formatCard(el) { el.value = el.value.replace(/\s/g,'').replace(/(.{4})/g,'$1 ').trim(); }

// Init
renderProducts();
updateCartUI();
