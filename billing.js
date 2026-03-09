document.addEventListener('DOMContentLoaded', async () => {
    const posSearch = document.getElementById('posSearch');
    const searchResults = document.getElementById('searchResults');
    const billItems = document.getElementById('billItems');
    const printableItems = document.getElementById('printableItems');
    const billTotalDisplay = document.getElementById('billTotalDisplay');
    const billDate = document.getElementById('billDate');
    const printBillBtn = document.getElementById('printBill');
    const clearBillBtn = document.getElementById('clearBill');

    let currentBill = [];
    let products = await getProducts();

    billDate.textContent = `Date: ${new Date().toLocaleString()}`;

    posSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        searchResults.innerHTML = '';
        if (query.length < 1) return;

        const filtered = products.filter(p => p.name.toLowerCase().includes(query));
        filtered.forEach(p => {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.innerHTML = `<span>${p.name}</span> <span>Rs. ${p.price}</span>`;
            div.onclick = () => addToBill(p);
            searchResults.appendChild(div);
        });
    });

    function addToBill(product) {
        const existing = currentBill.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            currentBill.push({ ...product, quantity: 1 });
        }
        posSearch.value = '';
        searchResults.innerHTML = '';
        renderBill();
    }

    function renderBill() {
        billItems.innerHTML = '';
        printableItems.innerHTML = '';
        let total = 0;

        currentBill.forEach((item, index) => {
            const rowTotal = item.price * item.quantity;
            total += rowTotal;

            // Display Table
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td><input type="number" value="${item.quantity}" class="quantity-input" onchange="updateQty(${item.id}, this.value)"></td>
                <td>${rowTotal}</td>
                <td><button onclick="removeFromBill(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer;">&times;</button></td>
            `;
            billItems.appendChild(tr);

            // Printable Area
            const ptr = document.createElement('tr');
            ptr.innerHTML = `
                <td style="text-align: left; padding: 5px 0;">${item.name}</td>
                <td style="text-align: right; padding: 5px 0;">${item.quantity}</td>
                <td style="text-align: right; padding: 5px 0;">${rowTotal}</td>
            `;
            printableItems.appendChild(ptr);
        });

        billTotalDisplay.textContent = total.toLocaleString();
    }

    window.updateQty = (id, val) => {
        const item = currentBill.find(i => i.id === id);
        if (item) {
            item.quantity = parseInt(val) || 1;
            renderBill();
        }
    };

    window.removeFromBill = (index) => {
        currentBill.splice(index, 1);
        renderBill();
    };

    printBillBtn.addEventListener('click', async () => {
        if (currentBill.length === 0) {
            alert('Bill is empty!');
            return;
        }

        // Update stock and sold counts
        let allProducts = await getProducts();
        currentBill.forEach(billItem => {
            const p = allProducts.find(product => product.id == billItem.id);
            if (p) {
                p.stock -= billItem.quantity;
                p.sold = (p.sold || 0) + billItem.quantity;
            }
        });
        await saveProducts(allProducts);

        // Print
        window.print();

        // Clear after printing
        currentBill = [];
        renderBill();
        products = await getProducts(); // Refresh local list
    });

    clearBillBtn.addEventListener('click', () => {
        if (confirm('Clear current bill?')) {
            currentBill = [];
            renderBill();
        }
    });
});
