const initialProducts = [
    {
        id: 1,
        name: "Matte Finish Foundation",
        price: 1599,
        category: "Makeup",
        stock: 30,
        sold: 0,
        onSale: true,
        originalPrice: 1999,
        offerReason: "Flash Sale",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 2,
        name: "Hydrating Night Cream",
        price: 2250,
        category: "Skincare",
        stock: 25,
        sold: 0,
        onSale: false,
        originalPrice: 2250,
        offerReason: "",
        image: "https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 3,
        name: "Midnight Rose Perfume",
        price: 4500,
        category: "Fragrance",
        stock: 12,
        sold: 0,
        onSale: true,
        originalPrice: 5500,
        offerReason: "Limited Stock Deal",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 4,
        name: "Velvet Red Lipstick",
        price: 1299,
        category: "Makeup",
        stock: 50,
        sold: 0,
        onSale: false,
        originalPrice: 1299,
        offerReason: "",
        image: "https://images.unsplash.com/photo-1586776191368-eb99ed667950?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 5,
        name: "Smoothing Face Powder",
        price: 1875,
        category: "Makeup",
        stock: 20,
        sold: 0,
        onSale: false,
        originalPrice: 1875,
        offerReason: "",
        image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 6,
        name: "Citrus Bloom Cologne",
        price: 3850,
        category: "Fragrance",
        stock: 15,
        sold: 0,
        onSale: false,
        originalPrice: 3850,
        offerReason: "",
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 7,
        name: "Premium Face Wash",
        price: 850,
        category: "Skincare",
        stock: 40,
        sold: 0,
        onSale: false,
        originalPrice: 850,
        offerReason: "",
        image: "https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?auto=format&fit=crop&q=80&w=400",
        variants: [
            { name: "Lemon Refresh", image: "https://images.unsplash.com/photo-1590156221170-cc3984a51fac?auto=format&fit=crop&q=80&w=400" },
            { name: "Charcoal Detox", image: "https://images.unsplash.com/photo-1611082216262-491c3daae48e?auto=format&fit=crop&q=80&w=400" },
            { name: "Aloe Soothing", image: "https://images.unsplash.com/photo-1560944413-4f1146816524?auto=format&fit=crop&q=80&w=400" }
        ]
    }
];

// Initialize data in localStorage if not exists
if (!localStorage.getItem('faiz_products')) {
    localStorage.setItem('faiz_products', JSON.stringify(initialProducts));
}
if (!localStorage.getItem('faiz_users')) {
    localStorage.setItem('faiz_users', JSON.stringify([]));
}
if (!localStorage.getItem('faiz_orders')) {
    localStorage.setItem('faiz_orders', JSON.stringify([]));
}

function getProducts() {
    return JSON.parse(localStorage.getItem('faiz_products'));
}

function saveProducts(products) {
    localStorage.setItem('faiz_products', JSON.stringify(products));
}

function getUsers() {
    return JSON.parse(localStorage.getItem('faiz_users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('faiz_users', JSON.stringify(users));
}

function getOrders() {
    return JSON.parse(localStorage.getItem('faiz_orders')) || [];
}

function saveOrders(orders) {
    localStorage.setItem('faiz_orders', JSON.stringify(orders));
}

function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('faiz_current_user')) || null;
}

function setCurrentUser(user) {
    sessionStorage.setItem('faiz_current_user', JSON.stringify(user));
}

function logout() {
    sessionStorage.removeItem('faiz_current_user');
}

function getCart() {
    return JSON.parse(localStorage.getItem('faiz_cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('faiz_cart', JSON.stringify(cart));
}
