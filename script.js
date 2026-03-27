// Product Data
const products = [
    {
        id: 1,
        title: "Fluffy Brown Teddy",
        price: 24.99,
        image: "assets/teddy_product_1_1774544775619.png",
        rating: 4.8,
        reviews: 124
    },
    {
        id: 2,
        title: "Giant White Teddy",
        price: 49.99,
        image: "assets/teddy_product_2_1774544886498.png",
        rating: 4.9,
        reviews: 89
    },
    {
        id: 3,
        title: "Pink Heart Teddy",
        price: 29.99,
        image: "assets/teddy_product_3_1774544912546.png",
        rating: 4.7,
        reviews: 210
    },
    {
        id: 4,
        title: "Teddy Couple Set",
        price: 39.99,
        image: "assets/teddy_product_4_1774544931078.png",
        rating: 5.0,
        reviews: 312
    },
    {
        id: 5,
        title: "Classic Beige Classic",
        price: 19.99,
        image: "https://images.unsplash.com/photo-1559405615-5c1cf76e6a35?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        rating: 4.5,
        reviews: 76
    },
    {
        id: 6,
        title: "Sleepy Time Bear",
        price: 22.99,
        image: "https://images.unsplash.com/photo-1545620857-797f766fb315?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        rating: 4.6,
        reviews: 45
    }
];

let cart = [];

// DOM Elements
const navbar = document.getElementById("navbar");
const menuBtn = document.getElementById("menu-btn");
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const cartBtn = document.getElementById("cart-btn");
const closeCartBtn = document.getElementById("close-cart");
const productContainer = document.getElementById("product-container");
const cartItemsContainer = document.getElementById("cart-items");
const cartCount = document.querySelector(".cart-count");
const totalPriceEl = document.getElementById("total-price");
const orderProductSelect = document.getElementById("order-product");
const orderForm = document.getElementById("order-form");
const orderSuccess = document.getElementById("order-success");
const continueShoppingBtn = document.getElementById("continue-shopping");
const toast = document.getElementById("toast");
const clickCheckoutBtn = document.getElementById("checkout-btn");

// Initialize App
function initApp() {
    renderProducts();
    populateOrderSelect();
    loadCartFromStorage();
}

// Mobile Menu Toggle
menuBtn.addEventListener('click', () => {
    navbar.classList.toggle('active');
});

// Close menu when clicking links
navbar.addEventListener('click', () => {
    navbar.classList.remove('active');
});

// Sticky Navbar Active Links highlight
window.addEventListener('scroll', () => {
    let sections = document.querySelectorAll('section');
    let navLinks = document.querySelectorAll('header nav a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if(pageYOffset >= (sectionTop - sectionHeight / 3)){
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(a => {
        a.classList.remove('active');
        if(a.getAttribute('href').includes(current)){
            a.classList.add('active');
        }
    });

    const header = document.querySelector('.header');
    header.classList.toggle('sticky', window.scrollY > 0);
});

// Sidebar Cart Logic
cartBtn.addEventListener('click', () => {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('active');
});

closeCartBtn.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
});

cartOverlay.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
});

clickCheckoutBtn.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
});

// Render Products
function renderProducts() {
    productContainer.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <h3 class="product-title">${product.title}</h3>
            <div class="product-rating">
                <i class="fa-solid fa-star"></i> ${product.rating} <span>(${product.reviews} reviews)</span>
            </div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="btn btn-primary btn-block add-to-cart-btn" onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        `;
        productContainer.appendChild(productCard);
    });
}

// Populate Order Select Dropdown
function populateOrderSelect() {
    // Keep first option
    let html = `<option value="" disabled selected>Select a product to order</option>`;
    
    // Add Products
    products.forEach(product => {
        html += `<option value="${product.id}">${product.title} - $${product.price.toFixed(2)}</option>`;
    });
    
    // Add "All Cart items" if Cart has Items
    if (cart.length > 0) {
        html += `<option value="cart">Everything in Cart ($${calculateTotal()})</option>`;
    }
    
    orderProductSelect.innerHTML = html;
}

// Add Item to Cart
window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    
    // Check if fully in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    showToast();
    updateCartUI();
    saveCartToStorage();
    populateOrderSelect(); // Refresh dropdown
    
    // Auto-open sidebar on first item
    if(cart.length === 1 && existingItem == undefined) {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
    }
};

// Remove from Cart
window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    saveCartToStorage();
    populateOrderSelect();
};

// Increase / Decrease Qty
window.changeQuantity = function(productId, action) {
    const item = cart.find(i => i.id === productId);
    if(item) {
        if(action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease') {
            item.quantity -= 1;
            if(item.quantity <= 0) {
                removeFromCart(productId);
                return; // removeFromCart handles updating UI
            }
        }
    }
    updateCartUI();
    saveCartToStorage();
    populateOrderSelect();
}

// Update Cart Display
function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-cart-msg">Your cart is empty.</p>`;
        cartCount.innerText = '0';
        totalPriceEl.innerText = '$0.00';
        return;
    }
    
    let totalItems = 0;
    
    cart.forEach(item => {
        totalItems += item.quantity;
        const itemEl = document.createElement('div');
        itemEl.classList.add('cart-item');
        itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <div style="display:flex; align-items:center; gap: 8px; margin-top:5px; font-size:0.9rem;">
                    <button style="border:none; background:#eee; width:20px; height:20px; border-radius:50%; cursor:pointer;" onclick="changeQuantity(${item.id}, 'decrease')">-</button>
                    ${item.quantity}
                    <button style="border:none; background:#eee; width:20px; height:20px; border-radius:50%; cursor:pointer;" onclick="changeQuantity(${item.id}, 'increase')">+</button>
                </div>
            </div>
            <i class="fa-solid fa-trash remove-item" onclick="removeFromCart(${item.id})"></i>
        `;
        cartItemsContainer.appendChild(itemEl);
    });
    
    cartCount.innerText = totalItems;
    totalPriceEl.innerText = '$' + calculateTotal();
}

function calculateTotal() {
    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return total.toFixed(2);
}

function saveCartToStorage() {
    localStorage.setItem('tedTeddyCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('tedTeddyCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Order Form Submission Logic
orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate order placement
    orderSuccess.classList.add('active');
    
    // Clear form and cart
    orderForm.reset();
    cart = [];
    updateCartUI();
    saveCartToStorage();
    populateOrderSelect();
});

continueShoppingBtn.addEventListener('click', () => {
    orderSuccess.classList.remove('active');
    window.location.href = "#products";
});

// Run Init
document.addEventListener("DOMContentLoaded", initApp);
