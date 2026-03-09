document.addEventListener('DOMContentLoaded', () => {
    const inventoryList = document.getElementById('inventoryList');
    const adminAuth = document.getElementById('adminAuth');
    const loginBtn = document.getElementById('loginBtn');
    const adminPassword = document.getElementById('adminPassword');
    const loginError = document.getElementById('loginError');
    const addNewBtn = document.getElementById('addNewBtn');

    // Variants list for new product
    let currentVariants = [];
    const variantNameInput = document.getElementById('variantNameInput');
    const variantImageInput = document.getElementById('variantImageInput');
    const addVariantToListBtn = document.getElementById('addVariantToListBtn');
    const variantsList = document.getElementById('variantsList');

    addVariantToListBtn.addEventListener('click', () => {
        const name = variantNameInput.value;
        const imageFile = variantImageInput.files[0];

        if (!name || !imageFile) {
            alert('Please provide flavor name and image!');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            currentVariants.push({ name, image: imageData });

            // Display tag
            const tag = document.createElement('div');
            tag.style.cssText = 'background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 5px 10px; border-radius: 8px; display: flex; align-items: center; gap: 8px; font-size: 0.8rem; border: 1px solid #10b981;';
            tag.innerHTML = `
                <img src="${imageData}" style="width: 20px; height: 20px; border-radius: 4px;">
                <span>${name}</span>
                <span style="cursor: pointer; color: #ef4444;" onclick="this.parentElement.remove(); removeVariant('${name}')">&times;</span>
            `;
            variantsList.appendChild(tag);

            // Clear inputs
            variantNameInput.value = '';
            variantImageInput.value = '';
        };
        reader.readAsDataURL(imageFile);
    });

    window.removeVariant = (name) => {
        currentVariants = currentVariants.filter(v => v.name !== name);
    };


    // Simple Admin Protection
    loginBtn.addEventListener('click', () => {
        if (adminPassword.value === 'Faiz507@') {
            localStorage.setItem('isAdminAuthorized', 'true');
            adminAuth.style.display = 'none';
        } else {
            loginError.style.display = 'block';
        }
    });

    // Handle Enter key for login
    adminPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginBtn.click();
    });

    // Add New Product
    addNewBtn.addEventListener('click', () => {
        const name = document.getElementById('newName').value;
        const price = parseInt(document.getElementById('newPrice').value);
        const stock = parseInt(document.getElementById('newStock').value);
        const category = document.getElementById('newCategory').value;
        const imageFile = document.getElementById('newImageFile').files[0];

        if (name && !isNaN(price) && !isNaN(stock) && imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;
                const products = getProducts();
                const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

                const newProduct = {
                    id: newId,
                    name,
                    price,
                    category,
                    stock,
                    sold: 0,
                    image: imageData,
                    variants: currentVariants.length > 0 ? [...currentVariants] : undefined
                };
                products.push(newProduct);
                saveProducts(products);

                // Clear form
                document.getElementById('newName').value = '';
                document.getElementById('newPrice').value = '';
                document.getElementById('newStock').value = '';
                document.getElementById('newImageFile').value = '';
                currentVariants = [];
                variantsList.innerHTML = '';

                alert(`${name} added to store!`);
                renderInventory();
            };
            reader.readAsDataURL(imageFile);
        } else {
            alert('Please fill all fields and select an image from your gallery.');
        }
    });

    function renderInventory() {
        const products = getProducts();
        inventoryList.innerHTML = '';

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${product.image}" style="width: 40px; height: 40px; border-radius: 5px; object-fit: cover;">
                        <div>
                            <strong>${product.name}</strong><br>
                            <small style="color: var(--text-muted)">${product.category}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <input type="number" class="input-edit" id="price-${product.id}" value="${product.price}">
                </td>
                <td>
                    <input type="number" class="input-edit" id="stock-${product.id}" value="${product.stock}">
                    <div style="font-size: 0.75rem; color: var(--primary-color); margin-top: 5px;">
                        Sold: ${product.sold || 0}
                    </div>
                </td>
                <td>
                    <button class="btn-sell" onclick="simulateSale(${product.id})">Sold 1</button>
                    <button class="btn-save" onclick="updateProduct(${product.id})">Save All</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            `;
            inventoryList.appendChild(row);
        });
    }

    window.updateProduct = (id) => {
        const newPrice = parseInt(document.getElementById(`price-${id}`).value);
        const newStock = parseInt(document.getElementById(`stock-${id}`).value);

        let products = getProducts();
        const index = products.findIndex(p => p.id === id);

        if (index !== -1) {
            products[index].price = newPrice;
            products[index].stock = newStock;
            saveProducts(products);
            alert(`${products[index].name} updated!`);
            renderInventory();
        }
    };

    window.simulateSale = (id) => {
        let products = getProducts();
        const index = products.findIndex(p => p.id === id);

        if (index !== -1 && products[index].stock > 0) {
            products[index].stock -= 1;
            products[index].sold = (products[index].sold || 0) + 1;
            saveProducts(products);
            renderInventory();
        } else if (products[index].stock <= 0) {
            alert('Item is out of stock!');
        }
    };

    window.deleteProduct = (id) => {
        let products = getProducts();
        const product = products.find(p => p.id === id);

        if (product && confirm(`Are you sure you want to delete "${product.name}"?`)) {
            const updatedProducts = products.filter(p => p.id !== id);
            saveProducts(updatedProducts);
            renderInventory();
        }
    };

    renderInventory();
});
