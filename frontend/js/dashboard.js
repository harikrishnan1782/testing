// Check authentication
checkAuth();

// Load dashboard data
async function loadDashboard() {
    try {
        const data = await apiCall(API_ENDPOINTS.DASHBOARD);
        
        if (data && data.success) {
            renderMetrics(data.data.metrics);
            renderLowStockItems(data.data.lowStockItems);
            renderRecentSales(data.data.recentSales);
        } else {
            showAlert('Failed to load dashboard data', 'danger');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('An error occurred while loading the dashboard', 'danger');
    }
}

// Render metrics cards
function renderMetrics(metrics) {
    const container = document.getElementById('metrics-cards');
    container.innerHTML = `
        <div class="col-xl-4 col-md-6 mb-4">
            <div class="card border-left-primary shadow h-100 py-2 border-0 border-start border-primary border-5 rounded-3">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Total Revenue (All Time)</div>
                            <div class="h4 mb-0 font-weight-bold text-gray-800">${formatCurrency(metrics.totalRevenue)}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-rupee-sign fa-2x text-gray-300 opacity-25"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-4 col-md-6 mb-4">
            <div class="card border-left-success shadow h-100 py-2 border-0 border-start border-success border-5 rounded-3">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">Total Sales</div>
                            <div class="h4 mb-0 font-weight-bold text-gray-800">${metrics.totalTransactions}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-shopping-cart fa-2x text-gray-300 opacity-25"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-4 col-md-6 mb-4">
            <div class="card border-left-info shadow h-100 py-2 border-0 border-start border-info border-5 rounded-3">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-info text-uppercase mb-1">Items in Catalog</div>
                            <div class="h4 mb-0 font-weight-bold text-gray-800">${metrics.totalItems}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-boxes fa-2x text-gray-300 opacity-25"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render low stock items
function renderLowStockItems(items) {
    const container = document.getElementById('low-stock-container');
    
    if (items && items.length > 0) {
        const itemsHTML = items.map(item => `
            <li class="list-group-item d-flex justify-content-between align-items-center py-3">
                <div>
                    <div class="fw-bold">${item.name}</div>
                    <small class="text-muted">SKU: ${item.sku}</small>
                </div>
                <div class="text-end">
                    <span class="badge bg-danger rounded-pill">${item.quantity} left</span>
                    <div class="extra-small text-muted mt-1">Min: ${item.min_stock_level}</div>
                </div>
            </li>
        `).join('');
        
        container.innerHTML = `<ul class="list-group list-group-flush">${itemsHTML}</ul>`;
    } else {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-check-circle text-success fs-1 mb-2"></i>
                <p class="text-muted">All items are sufficiently stocked!</p>
            </div>
        `;
    }
}

// Render recent sales
function renderRecentSales(sales) {
    const container = document.getElementById('recent-sales-container');
    
    if (sales && sales.length > 0) {
        const salesHTML = sales.map(sale => `
            <tr>
                <td class="ps-3">${sale.username}</td>
                <td>${formatDate(sale.sale_date)}</td>
                <td class="text-end pe-3 fw-bold text-success">${formatCurrency(sale.total_amount)}</td>
            </tr>
        `).join('');
        
        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-light small">
                        <tr>
                            <th class="ps-3">Staff</th>
                            <th>Date</th>
                            <th class="text-end pe-3">Total</th>
                        </tr>
                    </thead>
                    <tbody class="small">
                        ${salesHTML}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="text-center py-5">
                <p class="text-muted">No recent sales</p>
            </div>
        `;
    }
}

// Load dashboard on page load
loadDashboard();
