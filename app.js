document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');
    const cartToggle = document.getElementById('cartToggle');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const cartCountElement = document.querySelector('.cart-count');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const searchInput = document.getElementById('searchInput');

    // Variant Modal elements
    const variantModal = document.getElementById('variantModal');
    const closeVariantModal = document.getElementById('closeVariantModal');
    const variantGrid = document.getElementById('variantGrid');
    const confirmVariantBtn = document.getElementById('confirmVariantBtn');
    const variantModalTitle = document.getElementById('variantModalTitle');
    let selectedVariant = null;
    let currentProductIdForVariant = null;


    // Load and render products
    function renderProducts(filterText = '') {
        const products = getProducts();
        productGrid.innerHTML = '';

        const filteredProducts = products.filter(p =>
            p.name.toLowerCase().includes(filterText.toLowerCase()) ||
            p.category.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filteredProducts.length === 0) {
            productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No products found matching your search.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= 5;

            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.cursor = 'pointer';
            card.onclick = (e) => {
                if (e.target.tagName !== 'BUTTON') {
                    window.open(`product.html?id=${product.id}`, '_blank', 'width=1100,height=800');
                }
            };
            card.innerHTML = `
                ${isOutOfStock ? '<span class="out-of-stock">Out of Stock</span>' : ''}
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <span class="product-tag">${product.category}</span>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="stock-info">
                        ${isLowStock ? `<span class="low-stock-alert">Only ${product.stock} left!</span>` : `<span>Available: ${product.stock}</span>`}
                        <span style="font-size: 0.7rem; display: block; margin-top: 2px;">Sold: ${product.sold || 0}</span>
                    </div>
                    <div class="product-price-row">
                        <span class="product-price">Rs. ${product.price.toLocaleString()}</span>
                        <button class="btn-add-cart" 
                                onclick="event.stopPropagation(); addToCart(${product.id})" 
                                ${isOutOfStock ? 'disabled' : ''}>
                            ${isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });
    }

    // Cart Logic
    window.addToCart = (productId, variantName = null) => {
        const products = getProducts();
        const product = products.find(p => p.id === productId);

        if (product && product.stock > 0) {
            // Check for variants if not already selected
            if (product.variants && product.variants.length > 0 && !variantName) {
                showVariantModal(product);
                return;
            }

            let cart = getCart();
            // Unique key for cart item should include variant
            const cartItemId = variantName ? `${productId}-${variantName}` : productId;
            const existingItem = cart.find(item => item.cartItemId === cartItemId);

            const itemImage = variantName ? product.variants.find(v => v.name === variantName).image : product.image;

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    ...product,
                    cartItemId: cartItemId,
                    variantName: variantName,
                    image: itemImage,
                    quantity: 1
                });
            }

            saveCart(cart);
            updateCartUI();
            toggleCart(true);

            if (variantModal.style.display === 'block') {
                variantModal.style.display = 'none';
            }
        }
    };

    function showVariantModal(product) {
        currentProductIdForVariant = product.id;
        selectedVariant = null;
        variantModalTitle.textContent = `Select Flavor for ${product.name}`;
        variantGrid.innerHTML = '';
        confirmVariantBtn.disabled = true;

        product.variants.forEach(variant => {
            const option = document.createElement('div');
            option.className = 'variant-option';
            option.innerHTML = `
                <img src="${variant.image}" alt="${variant.name}">
                <span>${variant.name}</span>
            `;
            option.onclick = () => {
                document.querySelectorAll('.variant-option').forEach(el => el.classList.remove('selected'));
                option.classList.add('selected');
                selectedVariant = variant.name;
                confirmVariantBtn.disabled = false;
            };
            variantGrid.appendChild(option);
        });

        variantModal.style.display = 'block';
    }

    confirmVariantBtn.onclick = () => {
        if (selectedVariant && currentProductIdForVariant) {
            addToCart(currentProductIdForVariant, selectedVariant);
        }
    };

    closeVariantModal.onclick = () => variantModal.style.display = 'none';
    window.addEventListener('click', (e) => { if (e.target == variantModal) variantModal.style.display = 'none'; });

    function updateCartUI() {
        const cart = getCart();
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            count += item.quantity;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name} ${item.variantName ? `<br><small style="color: var(--primary-color)">Flavor: ${item.variantName}</small>` : ''}</div>
                    <div class="cart-item-price">${item.quantity} x Rs. ${item.price.toLocaleString()}</div>
                </div>
                <button class="remove-item" onclick="removeFromCart('${item.cartItemId || item.id}')">&times;</button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        cartTotalElement.textContent = `Rs. ${total.toLocaleString()}`;
        cartCountElement.textContent = count;
    }

    window.removeFromCart = (cartItemId) => {
        let cart = getCart();
        cart = cart.filter(item => (item.cartItemId || item.id).toString() !== cartItemId.toString());
        saveCart(cart);
        updateCartUI();
    };

    function toggleCart(open) {
        if (open) {
            cartSidebar.classList.add('open');
            overlay.classList.add('visible');
        } else {
            cartSidebar.classList.remove('open');
            overlay.classList.remove('visible');
        }
    }

    cartToggle.addEventListener('click', () => toggleCart(true));
    closeCart.addEventListener('click', () => toggleCart(false));
    overlay.addEventListener('click', () => toggleCart(false));

    const authModal = document.getElementById('authModal');
    const openLogin = document.getElementById('openLogin');
    const closeAuth = document.getElementById('closeAuth');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const doLogin = document.getElementById('doLogin');
    const doSignup = document.getElementById('doSignup');
    const navAccount = document.getElementById('navAccount');
    const navLogin = document.getElementById('navLogin');

    // UI State for Auth
    function updateAuthUI() {
        const user = getCurrentUser();
        if (user) {
            navAccount.style.display = 'block';
            navLogin.style.display = 'none';
        } else {
            navAccount.style.display = 'none';
            navLogin.style.display = 'block';
        }
    }
    updateAuthUI();

    openLogin.addEventListener('click', (e) => {
        e.preventDefault();
        authModal.style.display = 'block';
    });

    closeAuth.addEventListener('click', () => authModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target == authModal) authModal.style.display = 'none'; });

    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    doSignup.addEventListener('click', () => {
        const name = document.getElementById('signName').value;
        const email = document.getElementById('signEmail').value;
        const pass = document.getElementById('signPass').value;
        const addr = document.getElementById('signAddress').value;

        if (name && email && pass && addr) {
            const res = Auth.signup(name, email, pass, addr);
            if (res.success) {
                authModal.style.display = 'none';
                updateAuthUI();
                alert('Welcome to Faiz Store!');
            } else {
                alert(res.message);
            }
        } else {
            alert('Please fill all fields');
        }
    });

    doLogin.addEventListener('click', () => {
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;

        if (email && pass) {
            const res = Auth.login(email, pass);
            if (res.success) {
                authModal.style.display = 'none';
                updateAuthUI();
            } else {
                alert(res.message);
            }
        }
    });

    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            const res = Auth.googleLogin();
            if (res.success) {
                authModal.style.display = 'none';
                updateAuthUI();
                alert('Signed in with Google!');
            }
        });
    }

    checkoutBtn.addEventListener('click', () => {
        const user = getCurrentUser();
        if (!user) {
            alert('Please login to place an order.');
            authModal.style.display = 'block';
            return;
        }

        const cart = getCart();
        if (cart.length === 0) return;

        let products = getProducts();
        let total = 0;
        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                product.stock -= item.quantity;
                product.sold = (product.sold || 0) + item.quantity;
                total += (product.price * item.quantity);
            }
        });

        // Record Order
        let orders = getOrders();
        const newOrder = {
            id: orders.length + 1001,
            userId: user.id,
            total: total,
            status: 'Pending',
            date: new Date().toLocaleDateString(),
            items: cart
        };
        orders.push(newOrder);
        saveOrders(orders);

        saveProducts(products);
        saveCart([]);
        updateCartUI();
        renderProducts();
        toggleCart(false);
        alert(`Order Placed Successfully! Order ID: #${newOrder.id}`);
    });

    searchInput.addEventListener('input', (e) => {
        renderProducts(e.target.value);
    });

    // Initial load
    renderProducts();
    updateCartUI();
});
