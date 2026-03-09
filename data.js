// --- Firebase Configuration ---
// PASTE YOUR FIREBASE CONFIGURATION HERE
const firebaseConfig = {
    apiKey: "AIzaSyBrSpTXFcxmwfvdAu-b0hlLzqAsyy7u_ug",
    authDomain: "faiz-genral-store.firebaseapp.com",
    projectId: "faiz-genral-store",
    storageBucket: "faiz-genral-store.firebasestorage.app",
    messagingSenderId: "824966747333",
    appId: "1:824966747333:web:9be4d6a4ff95a1c0ee8cac",
    measurementId: "G-HX79P92M5S"
};

// Initialize Firebase only if the config is valid
let db = null;
let auth = null;
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
}

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

// Fallback logic for LocalStorage
function initLocalStorage() {
    if (!localStorage.getItem('faiz_products')) {
        localStorage.setItem('faiz_products', JSON.stringify(initialProducts));
    }
    if (!localStorage.getItem('faiz_users')) {
        localStorage.setItem('faiz_users', JSON.stringify([]));
    }
    if (!localStorage.getItem('faiz_orders')) {
        localStorage.setItem('faiz_orders', JSON.stringify([]));
    }
}
initLocalStorage();

// --- Data Fetching Functions ---

async function getProducts() {
    if (db) {
        try {
            const snapshot = await db.collection('products').get();
            let products = snapshot.docs.map(doc => ({ ...doc.data(), id: parseInt(doc.id) || doc.id }));

            // MIGRATION LOGIC: If Firestore is empty, push LocalStorage data to it
            if (products.length === 0) {
                const localData = JSON.parse(localStorage.getItem('faiz_products')) || initialProducts;
                await saveProducts(localData);
                return localData;
            }
            return products;
        } catch (error) {
            console.error("Error fetching products from Firestore:", error);
            return JSON.parse(localStorage.getItem('faiz_products'));
        }
    }
    return JSON.parse(localStorage.getItem('faiz_products'));
}

// REAL-TIME LISTENER
function onProductsChange(callback) {
    if (db) {
        return db.collection('products').onSnapshot(snapshot => {
            const products = snapshot.docs.map(doc => ({ ...doc.data(), id: parseInt(doc.id) || doc.id }));
            // Update local storage cache and always fire callback
            localStorage.setItem('faiz_products', JSON.stringify(products));
            callback(products);
        }, error => {
            console.error("Firestore Listen Error:", error);
        });
    }
    // Fallback: No real-time for local storage
    return () => { };
}

async function saveProducts(products) {
    if (db) {
        try {
            const batch = db.batch();
            products.forEach(product => {
                const docRef = db.collection('products').doc(product.id.toString());
                batch.set(docRef, product);
            });
            await batch.commit();
        } catch (error) {
            console.error("Error saving products to Firestore:", error);
        }
    }
    localStorage.setItem('faiz_products', JSON.stringify(products));
}

async function getUsers() {
    if (db) {
        try {
            const snapshot = await db.collection('users').get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error("Error fetching users from Firestore:", error);
            return JSON.parse(localStorage.getItem('faiz_users')) || [];
        }
    }
    return JSON.parse(localStorage.getItem('faiz_users')) || [];
}

async function saveUsers(users) {
    if (db) {
        try {
            const batch = db.batch();
            users.forEach(user => {
                const docRef = db.collection('users').doc(user.email);
                batch.set(docRef, user);
            });
            await batch.commit();
        } catch (error) {
            console.error("Error saving users to Firestore:", error);
        }
    }
    localStorage.setItem('faiz_users', JSON.stringify(users));
}

async function getOrders() {
    if (db) {
        try {
            const snapshot = await db.collection('orders').get();
            let orders = snapshot.docs.map(doc => doc.data());
            if (orders.length === 0) {
                const localData = JSON.parse(localStorage.getItem('faiz_orders')) || [];
                if (localData.length > 0) await saveOrders(localData);
                return localData;
            }
            return orders;
        } catch (error) {
            console.error("Error fetching orders from Firestore:", error);
            return JSON.parse(localStorage.getItem('faiz_orders')) || [];
        }
    }
    return JSON.parse(localStorage.getItem('faiz_orders')) || [];
}

function onOrdersChange(callback) {
    if (db) {
        return db.collection('orders').onSnapshot(snapshot => {
            const orders = snapshot.docs.map(doc => doc.data());
            localStorage.setItem('faiz_orders', JSON.stringify(orders));
            callback(orders);
        }, error => {
            console.error("Firestore Orders Listen Error:", error);
        });
    }
    return () => { };
}

async function saveOrders(orders) {
    if (db) {
        try {
            const batch = db.batch();
            orders.forEach(order => {
                const docRef = db.collection('orders').doc(order.id.toString());
                batch.set(docRef, order);
            });
            await batch.commit();
        } catch (error) {
            console.error("Error saving orders to Firestore:", error);
        }
    }
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
    if (auth) auth.signOut();
}

function getCart() {
    return JSON.parse(localStorage.getItem('faiz_cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('faiz_cart', JSON.stringify(cart));
}
