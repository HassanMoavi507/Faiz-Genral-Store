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
    addNewBtn.addEventListener('click', async () => {
        const name = document.getElementById('newName').value;
        const price = parseInt(document.getElementById('newPrice').value);
        const stock = parseInt(document.getElementById('newStock').value);
        const category = document.getElementById('newCategory').value;
        const imageFile = document.getElementById('newImageFile').files[0];

        if (name && !isNaN(price) && !isNaN(stock) && imageFile) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const imageData = e.target.result;
                const products = await getProducts();
                const newId = products.length > 0 ? Math.max(...products.map(p => parseInt(p.id))) + 1 : 1;

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
                await saveProducts(products);

                // Clear form
                document.getElementById('newName').value = '';
                document.getElementById('newPrice').value = '';
                document.getElementById('newStock').value = '';
                document.getElementById('newImageFile').value = '';
                currentVariants = [];
                variantsList.innerHTML = '';

                alert(`${name} added to store!`);
                await renderInventory();
            };
            reader.readAsDataURL(imageFile);
        } else {
            alert('Please fill all fields and select an image from your gallery.');
        }
    });

    async function renderInventory() {
        const products = await getProducts();
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
                    <button class="btn-edit" onclick="openEditModal(${product.id})">Edit</button>
                    <button class="btn-save" onclick="updateProduct(${product.id})">Save All</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            `;
            inventoryList.appendChild(row);
        });
    }

    // Edit Modal Logic
    const editModal = document.getElementById('editModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const saveEditBtn = document.getElementById('saveEditBtn');
    let editVariants = [];

    window.openEditModal = async (id) => {
        const products = await getProducts();
        const product = products.find(p => p.id == id);
        if (!product) return;

        document.getElementById('editProductId').value = product.id;
        document.getElementById('editName').value = product.name;
        document.getElementById('editPrice').value = product.price;
        document.getElementById('editStock').value = product.stock;
        document.getElementById('editCategory').value = product.category;

        const previewImg = document.getElementById('currentEditImage');
        previewImg.src = product.image;
        previewImg.style.display = 'block';

        // Load Variants
        editVariants = product.variants ? [...product.variants] : [];
        renderEditVariants();

        editModal.style.display = 'block';
    };

    function renderEditVariants() {
        const list = document.getElementById('editVariantsList');
        list.innerHTML = '';
        editVariants.forEach(variant => {
            const tag = document.createElement('div');
            tag.style.cssText = 'background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 5px 10px; border-radius: 8px; display: flex; align-items: center; gap: 8px; font-size: 0.8rem; border: 1px solid #10b981;';
            tag.innerHTML = `
                <img src="${variant.image}" style="width: 20px; height: 20px; border-radius: 4px;">
                <span>${variant.name}</span>
                <span style="cursor: pointer; color: #ef4444;" onclick="removeEditVariant('${variant.name}')">&times;</span>
            `;
            list.appendChild(tag);
        });
    }

    window.removeEditVariant = (name) => {
        editVariants = editVariants.filter(v => v.name !== name);
        renderEditVariants();
    };

    document.getElementById('addEditVariantBtn').addEventListener('click', () => {
        const name = document.getElementById('editVariantNameInput').value;
        const imageFile = document.getElementById('editVariantImageInput').files[0];

        if (!name || !imageFile) {
            alert('Please provide flavor name and image!');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            editVariants.push({ name, image: e.target.result });
            renderEditVariants();
            document.getElementById('editVariantNameInput').value = '';
            document.getElementById('editVariantImageInput').value = '';
        };
        reader.readAsDataURL(imageFile);
    });

    saveEditBtn.addEventListener('click', async () => {
        const id = document.getElementById('editProductId').value;
        const name = document.getElementById('editName').value;
        const price = parseInt(document.getElementById('editPrice').value);
        const stock = parseInt(document.getElementById('editStock').value);
        const category = document.getElementById('editCategory').value;
        const imageFile = document.getElementById('editImageFile').files[0];

        let products = await getProducts();
        const index = products.findIndex(p => p.id == id);

        if (index === -1) return;

        const updateData = async () => {
            products[index].name = name;
            products[index].price = price;
            products[index].stock = stock;
            products[index].category = category;
            products[index].variants = editVariants.length > 0 ? editVariants : undefined;

            await saveProducts(products);
            editModal.style.display = 'none';
            alert('Product updated successfully!');
            await renderInventory();
        };

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                products[index].image = e.target.result;
                await updateData();
            };
            reader.readAsDataURL(imageFile);
        } else {
            await updateData();
        }
    });

    closeEditModal.onclick = () => editModal.style.display = 'none';
    window.onclick = (e) => { if (e.target == editModal) editModal.style.display = 'none'; };

    window.updateProduct = async (id) => {
        const newPrice = parseInt(document.getElementById(`price-${id}`).value);
        const newStock = parseInt(document.getElementById(`stock-${id}`).value);

        let products = await getProducts();
        const index = products.findIndex(p => p.id == id);

        if (index !== -1) {
            products[index].price = newPrice;
            products[index].stock = newStock;
            await saveProducts(products);
            alert(`${products[index].name} updated!`);
            await renderInventory();
        }
    };

    window.simulateSale = async (id) => {
        let products = await getProducts();
        const index = products.findIndex(p => p.id == id);

        if (index !== -1 && products[index].stock > 0) {
            products[index].stock -= 1;
            products[index].sold = (products[index].sold || 0) + 1;
            await saveProducts(products);
            await renderInventory();
        } else if (products[index].stock <= 0) {
            alert('Item is out of stock!');
        }
    };

    window.deleteProduct = async (id) => {
        let products = await getProducts();
        const product = products.find(p => p.id == id);

        if (product && confirm(`Are you sure you want to delete "${product.name}"?`)) {
            const updatedProducts = products.filter(p => p.id != id);
            await saveProducts(updatedProducts);
            await renderInventory();
        }
    };

    renderInventory();
});
