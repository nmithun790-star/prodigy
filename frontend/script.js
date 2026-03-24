let allProducts = [];
let filteredProducts = [];
let cart = {}; // { [id]: { ...product, qty } }

// ----- LOAD PRODUCTS FROM BACKEND -----
async function loadProducts() {
  try {
    // call your Node backend
    const res = await fetch("http://localhost:5000/products");
    if (!res.ok) {
      throw new Error("HTTP error " + res.status);
    }

    const products = await res.json();
    allProducts = products;
    filteredProducts = products;
    renderProducts();
    updateCartUI();
  } catch (err) {
    console.error("Error loading products:", err);
    const list = document.getElementById("product-list");
    list.innerHTML =
      "<p style='color:red;'>Could not load products from server. Is backend running?</p>";
  }
}

// ----- RENDER PRODUCTS -----
function renderProducts() {
  const list = document.getElementById("product-list");
  list.innerHTML = "";

  if (filteredProducts.length === 0) {
    list.innerHTML = "<p>No products match your search/filter.</p>";
    return;
  }

  filteredProducts.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p><b>Category:</b> ${p.category}</p>
      <p>₹ ${p.price}</p>
      <p>${p.description}</p>
      <button>Add to Cart</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      addToCart(p);
    });

    list.appendChild(card);
  });
}

// ----- CART LOGIC -----
function addToCart(product) {
  if (!cart[product.id]) {
    cart[product.id] = { ...product, qty: 1 };
  } else {
    cart[product.id].qty++;
  }
  updateCartUI();
}

function increaseQty(id) {
  if (cart[id]) {
    cart[id].qty++;
    updateCartUI();
  }
}

function decreaseQty(id) {
  if (!cart[id]) return;
  if (cart[id].qty > 1) {
    cart[id].qty--;
  } else {
    delete cart[id];
  }
  updateCartUI();
}

function removeFromCart(id) {
  if (cart[id]) {
    delete cart[id];
    updateCartUI();
  }
}

// ----- RENDER CART + SUMMARY -----
function updateCartUI() {
  const cartDiv = document.getElementById("cart-items");
  const totalDiv = document.getElementById("cart-total");
  const cartCountSpan = document.getElementById("cart-count");
  const summaryCount = document.getElementById("summary-count");

  if (!cartDiv) return; // safety

  cartDiv.innerHTML = "";
  let total = 0;
  let totalQty = 0;

  const items = Object.values(cart);
  if (items.length === 0) {
    cartDiv.innerHTML = "<p>Your cart is empty.</p>";
    totalDiv.textContent = "Total: ₹0";
    cartCountSpan.textContent = "0";
    if (summaryCount) summaryCount.textContent = "Items: 0";
    return;
  }

  items.forEach((item) => {
    total += item.qty * item.price;
    totalQty += item.qty;

    const row = document.createElement("div");
    row.className = "cart-item";

    // 👇 NOW WITH IMAGE + NAME + PRICE + QTY + REMOVE
    row.innerHTML = `
      <div class="cart-item-left">
        <img src="${item.image}" class="cart-item-img" alt="${item.name}">
        <div>
          <h4>${item.name}</h4>
          <p>₹ ${item.price}</p>
        </div>
      </div>

      <div class="cart-item-right">
        <div class="qty-controls">
          <button onclick="decreaseQty(${item.id})">−</button>
          <span>${item.qty}</span>
          <button onclick="increaseQty(${item.id})">+</button>
        </div>

        <button class="remove-btn" onclick="removeFromCart(${item.id})">
          Remove
        </button>
      </div>
    `;

    cartDiv.appendChild(row);
  });

  totalDiv.textContent = `Total: ₹ ${total}`;
  cartCountSpan.textContent = totalQty.toString();
  if (summaryCount) summaryCount.textContent = `Items: ${totalQty}`;
}

// ----- CART OVERLAY OPEN / CLOSE -----
const cartOverlay = document.getElementById("cart-overlay");
const cartToggleBtn = document.getElementById("cart-toggle-btn");
const closeCartBtn = document.getElementById("close-cart");

cartToggleBtn.addEventListener("click", () => {
  cartOverlay.classList.add("open");
});

closeCartBtn.addEventListener("click", () => {
  cartOverlay.classList.remove("open");
});

// close when clicking outside the cart box
cartOverlay.addEventListener("click", (e) => {
  if (e.target === cartOverlay) {
    cartOverlay.classList.remove("open");
  }
});

// ----- SEARCH FUNCTIONALITY -----
document.getElementById("search-input").addEventListener("input", (e) => {
  const text = e.target.value.toLowerCase();
  filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(text)
  );
  applyCategoryFilterOnly();
});

// ----- CATEGORY FILTER -----
document
  .getElementById("category-filter")
  .addEventListener("change", () => {
    applyCategoryFilterOnly();
  });

function applyCategoryFilterOnly() {
  const category = document.getElementById("category-filter").value;

  let base = allProducts;

  // apply search text if any
  const searchText = document
    .getElementById("search-input")
    .value.toLowerCase();

  base = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchText)
  );

  if (category === "all") {
    filteredProducts = base;
  } else {
    filteredProducts = base.filter((p) => p.category === category);
  }

  renderProducts();
}

// ----- CHECKOUT -----
document.getElementById("checkout-btn").addEventListener("click", () => {
  if (Object.keys(cart).length === 0) {
    alert("Cart is empty!");
    return;
  }

  alert("Order placed successfully! (Demo project)");
});

// ----- INITIAL LOAD -----
loadProducts();
