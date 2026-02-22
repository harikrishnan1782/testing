// Check authentication
checkAuth();

let availableItems = [];

// Load available items
async function loadAvailableItems() {
    try {
        const data = await apiCall(API_ENDPOINTS.ITEMS);
        
        if (data && data.success) {
            availableItems = data.data.filter(item => item.quantity > 0);
            addItemRow(); // Add first row
        } else {
            showAlert('Failed to load items', 'danger');
        }
    } catch (error) {
        console.error('Error loading items:', error);
        showAlert('An error occurred while loading items', 'danger');
    }
}

// Add item row
function addItemRow() {
    const container = document.getElementById('items-container');
    const rowIndex = container.children.length;
    
    const row = document.createElement('div');
    row.className = 'row g-2 mb-3 item-row align-items-end';
    row.innerHTML = `
        <div class="col-md-7">
            <label class="form-label small fw-bold">Product</label>
            <select name="item_id[]" class="form-select item-select" required data-row="${rowIndex}">
                <option value="">Choose a product...</option>
                ${availableItems.map(item => `
                    <option value="${item.id}" data-price="${item.price}" data-stock="${item.quantity}">
                        ${item.name} (Stock: ${item.quantity}) — ₹${item.price}
                    </option>
                `).join('')}
            </select>
        </div>
        <div class="col-md-3">
            <label class="form-label small fw-bold">Qty</label>
            <input type="number" name="quantity[]" class="form-control qty-input" min="1" value="1" required data-row="${rowIndex}">
        </div>
        <div class="col-md-2 text-end">
            ${rowIndex > 0 ? `
                <button type="button" class="btn btn-outline-danger remove-row" onclick="removeItemRow(this)">
                    <i class="fas fa-times"></i>
                </button>
            ` : ''}
        </div>
    `;
    
    container.appendChild(row);
    
    // Add event listeners
    row.querySelector('.item-select').addEventListener('change', calculateTotal);
    row.querySelector('.qty-input').addEventListener('input', calculateTotal);
}

// Remove item row
function removeItemRow(button) {
    button.closest('.item-row').remove();
    calculateTotal();
}

// Add item button event
document.getElementById('add-item-btn').addEventListener('click', addItemRow);

// Calculate total
function calculateTotal() {
    let subtotal = 0;
    
    document.querySelectorAll('.item-row').forEach(row => {
        const select = row.querySelector('.item-select');
        const qtyInput = row.querySelector('.qty-input');
        
        if (select.value && qtyInput.value) {
            const selectedOption = select.options[select.selectedIndex];
            const price = parseFloat(selectedOption.dataset.price) || 0;
            const quantity = parseInt(qtyInput.value) || 0;
            const stock = parseInt(selectedOption.dataset.stock) || 0;
            
            // Validate quantity
            if (quantity > stock) {
                qtyInput.value = stock;
                showAlert(`Only ${stock} units available for ${selectedOption.text.split('(')[0].trim()}`, 'warning');
            }
            
            subtotal += price * parseInt(qtyInput.value);
        }
    });
    
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    
    document.getElementById('subtotal-display').textContent = formatCurrency(subtotal);
    document.getElementById('gst-display').textContent = formatCurrency(gst);
    document.getElementById('total-display').textContent = formatCurrency(total);
}

// Handle form submission
document.getElementById('sale-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const customerName = formData.get('customer_name');
    const customerPhone = formData.get('customer_phone');
    
    // Collect items
    const items = [];
    const itemIds = formData.getAll('item_id[]');
    const quantities = formData.getAll('quantity[]');
    
    for (let i = 0; i < itemIds.length; i++) {
        if (itemIds[i] && quantities[i]) {
            items.push({
                item_id: parseInt(itemIds[i]),
                quantity: parseInt(quantities[i])
            });
        }
    }
    
    if (items.length === 0) {
        showAlert('Please select at least one item', 'warning');
        return;
    }
    
    const saleData = {
        customer_name: customerName,
        customer_phone: customerPhone,
        items: items
    };
    
    try {
        const data = await apiCall(API_ENDPOINTS.SALES, {
            method: 'POST',
            body: JSON.stringify(saleData)
        });
        
        if (data && data.success) {
            showAlert(data.message, 'success');
            
            // Redirect to sales list after 2 seconds
            setTimeout(() => {
                window.location.href = 'sales-list.html';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to complete sale', 'danger');
        }
    } catch (error) {
        console.error('Error creating sale:', error);
        showAlert('An error occurred while processing the sale', 'danger');
    }
});

// Load items on page load
loadAvailableItems();
