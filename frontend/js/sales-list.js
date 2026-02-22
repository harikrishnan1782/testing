// Check authentication
checkAuth();

let receiptModal;

// Initialize modal
document.addEventListener('DOMContentLoaded', () => {
    receiptModal = new bootstrap.Modal(document.getElementById('receiptModal'));
});

// Load all sales
async function loadSales() {
    try {
        const data = await apiCall(API_ENDPOINTS.SALES);
        
        if (data && data.success) {
            renderSales(data.data);
        } else {
            showAlert('Failed to load sales history', 'danger');
        }
    } catch (error) {
        console.error('Error loading sales:', error);
        showAlert('An error occurred while loading sales', 'danger');
    }
}

// Render sales table
function renderSales(sales) {
    const tbody = document.getElementById('sales-table-body');
    
    if (sales.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <i class="fas fa-receipt fs-1 text-muted d-block mb-3"></i>
                    <p class="text-secondary mb-0">No sales records found.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = sales.map(sale => `
        <tr>
            <td class="ps-4">
                <span class="badge bg-light text-dark border">#INV-${String(sale.id).padStart(5, '0')}</span>
            </td>
            <td>
                <div class="fw-bold">${sale.customer_name || 'Walk-in'}</div>
                <div class="small text-muted">${sale.customer_phone || 'N/A'}</div>
            </td>
            <td>${sale.username || 'N/A'}</td>
            <td>${formatDateTime(sale.sale_date)}</td>
            <td class="text-success fw-bold">${formatCurrency(sale.total_amount)}</td>
            <td class="text-end pe-4">
                <button onclick="viewReceipt(${sale.id})" class="btn btn-sm btn-outline-primary rounded-pill px-3">
                    <i class="fas fa-eye me-1"></i>View
                </button>
            </td>
        </tr>
    `).join('');
}

// View receipt
async function viewReceipt(saleId) {
    try {
        const data = await apiCall(`${API_ENDPOINTS.SALES}/${saleId}`);
        
        if (data && data.success) {
            renderReceipt(data.data.sale, data.data.items);
            receiptModal.show();
        } else {
            showAlert('Failed to load receipt', 'danger');
        }
    } catch (error) {
        console.error('Error loading receipt:', error);
        showAlert('An error occurred while loading the receipt', 'danger');
    }
}

// Render receipt
function renderReceipt(sale, items) {
    const receiptContent = document.getElementById('receipt-content');
    
    receiptContent.innerHTML = `
        <div class="row border-bottom pb-3 mb-4">
            <div class="col-6">
                <h4 class="text-primary fw-bold">Inventory MS</h4>
                <p class="mb-0">Tiruppur, Tamil Nadu</p>
                <p>Phone: +91 98765 43210</p>
            </div>
            <div class="col-6 text-end">
                <h5 class="text-uppercase">Invoice</h5>
                <p class="mb-0">#INV-${String(sale.id).padStart(5, '0')}</p>
                <p>${formatDate(sale.sale_date)}</p>
            </div>
        </div>

        <div class="mb-4">
            <h6 class="text-muted text-uppercase small">Customer Details</h6>
            <p class="mb-0 fw-bold">${sale.customer_name || 'Walk-in'}</p>
            <p>${sale.customer_phone || 'N/A'}</p>
        </div>

        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Item Description</th>
                    <th class="text-center">Qty</th>
                    <th class="text-end">Unit Price</th>
                    <th class="text-end">Total</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>${item.name || 'Unknown Item'}</td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-end">${formatCurrency(item.unit_price)}</td>
                        <td class="text-end">${formatCurrency(item.total_price)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="row justify-content-end mt-4">
            <div class="col-md-5">
                <div class="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(sale.subtotal)}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>GST (18%):</span>
                    <span>${formatCurrency(sale.gst_amount)}</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between">
                    <span class="h5 fw-bold">Grand Total:</span>
                    <span class="h5 fw-bold text-success">${formatCurrency(sale.total_amount)}</span>
                </div>
            </div>
        </div>

        <div class="text-center mt-5 pt-5 border-top">
            <p class="text-muted small">Thank you for shopping with us!</p>
        </div>
    `;
}

// Load sales on page load
loadSales();
