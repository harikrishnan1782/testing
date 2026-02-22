// Check authentication
checkAuth();

let addItemModal, editItemModal;

// Initialize modals
document.addEventListener('DOMContentLoaded', () => {
    addItemModal = new bootstrap.Modal(document.getElementById('addItemModal'));
    editItemModal = new bootstrap.Modal(document.getElementById('editItemModal'));
});

// Load all items
async function loadItems() {
    try {
        const data = await apiCall(API_ENDPOINTS.ITEMS);
        
        if (data && data.success) {
            renderItems(data.data);
        } else {
            showAlert('Failed to load inventory items', 'danger');
        }
    } catch (error) {
        console.error('Error loading items:', error);
        showAlert('An error occurred while loading items', 'danger');
    }
}

// Render items table
function renderItems(items) {
    const tbody = document.getElementById('items-table-body');
    
    if (items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <i class="fas fa-box-open fs-1 text-muted d-block mb-3"></i>
                    <p class="text-secondary mb-0">No items found in your inventory.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = items.map(item => {
        let statusBadge = '';
        if (item.quantity <= 0) {
            statusBadge = '<span class="badge bg-danger">Out of Stock</span>';
        } else if (item.quantity <= item.min_stock_level) {
            statusBadge = '<span class="badge bg-warning text-dark">Low Stock</span>';
        } else {
            statusBadge = '<span class="badge bg-success">In Stock</span>';
        }
        
        return `
            <tr>
                <td class="ps-4">
                    <span class="badge bg-light text-dark border">${item.sku}</span>
                </td>
                <td>
                    <div class="fw-bold">${item.name}</div>
                    <small class="text-muted">${item.description || ''}</small>
                </td>
                <td>${formatCurrency(item.price)}</td>
                <td>
                    <span class="fw-bold">${item.quantity}</span>
                    <small class="text-muted">/ min: ${item.min_stock_level}</small>
                </td>
                <td>${statusBadge}</td>
                <td class="text-end pe-4">
                    <div class="btn-group shadow-sm">
                        <button onclick="editItem(${item.id})" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteItem(${item.id}, '${item.name}')" class="btn btn-sm btn-outline-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Handle add item form submission
document.getElementById('add-item-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const itemData = Object.fromEntries(formData);
    
    try {
        const data = await apiCall(API_ENDPOINTS.ITEMS, {
            method: 'POST',
            body: JSON.stringify(itemData)
        });
        
        if (data && data.success) {
            showAlert(data.message, 'success');
            addItemModal.hide();
            e.target.reset();
            loadItems();
        } else {
            showAlert(data.message || 'Failed to add item', 'danger');
        }
    } catch (error) {
        console.error('Error adding item:', error);
        showAlert('An error occurred while adding the item', 'danger');
    }
});

// Edit item
async function editItem(id) {
    try {
        const data = await apiCall(`${API_ENDPOINTS.ITEMS}/${id}`);
        
        if (data && data.success) {
            const item = data.data;
            document.getElementById('edit-item-id').value = item.id;
            document.getElementById('edit-sku').value = item.sku;
            document.getElementById('edit-name').value = item.name;
            document.getElementById('edit-description').value = item.description || '';
            document.getElementById('edit-price').value = item.price;
            document.getElementById('edit-quantity').value = item.quantity;
            document.getElementById('edit-min-stock').value = item.min_stock_level;
            
            editItemModal.show();
        } else {
            showAlert('Failed to load item details', 'danger');
        }
    } catch (error) {
        console.error('Error loading item:', error);
        showAlert('An error occurred while loading item details', 'danger');
    }
}

// Handle edit item form submission
document.getElementById('edit-item-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const itemData = Object.fromEntries(formData);
    const id = itemData.id;
    delete itemData.id;
    
    try {
        const data = await apiCall(`${API_ENDPOINTS.ITEMS}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(itemData)
        });
        
        if (data && data.success) {
            showAlert(data.message, 'success');
            editItemModal.hide();
            loadItems();
        } else {
            showAlert(data.message || 'Failed to update item', 'danger');
        }
    } catch (error) {
        console.error('Error updating item:', error);
        showAlert('An error occurred while updating the item', 'danger');
    }
});

// Delete item
async function deleteItem(id, name) {
    if (!confirmAction(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const data = await apiCall(`${API_ENDPOINTS.ITEMS}/${id}`, {
            method: 'DELETE'
        });
        
        if (data && data.success) {
            showAlert(data.message, 'success');
            loadItems();
        } else {
            showAlert(data.message || 'Failed to delete item', 'danger');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showAlert('An error occurred while deleting the item', 'danger');
    }
}

// Load items on page load
loadItems();
