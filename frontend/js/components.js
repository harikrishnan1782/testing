// Load sidebar
function loadSidebar() {
    const user = getUserData();
    if (!user) return;

    const sidebarHTML = `
        <div class="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark shadow" style="width: 250px; min-height: 100vh;">
            <a href="dashboard.html" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <i class="fas fa-warehouse fa-2x me-2 text-primary"></i>
                <span class="fs-4 fw-bold">Inventory MS</span>
            </a>
            <hr>
            <ul class="nav nav-pills flex-column mb-auto">
                <li class="nav-item">
                    <a href="dashboard.html" class="nav-link text-white hover-overlay" data-page="dashboard">
                        <i class="fas fa-tachometer-alt me-2"></i> Dashboard
                    </a>
                </li>
                <li>
                    <a href="items.html" class="nav-link text-white hover-overlay" data-page="items">
                        <i class="fas fa-boxes me-2"></i> Inventory Items
                    </a>
                </li>
                <li>
                    <a href="new-sale.html" class="nav-link text-white hover-overlay" data-page="new-sale">
                        <i class="fas fa-cart-plus me-2"></i> New Sale
                    </a>
                </li>
                <li>
                    <a href="sales-list.html" class="nav-link text-white hover-overlay" data-page="sales-list">
                        <i class="fas fa-history me-2"></i> Sales History
                    </a>
                </li>
                ${user.role === 'admin' ? `
                <hr class="my-3">
                <div class="small text-uppercase text-muted fw-bold mb-2 ps-3">Administration</div>
                <li>
                    <a href="reports.html" class="nav-link text-white hover-overlay" data-page="reports">
                        <i class="fas fa-chart-bar me-2"></i> Reports & Analytics
                    </a>
                </li>
                <li>
                    <a href="register.html" class="nav-link text-white hover-overlay" data-page="register">
                        <i class="fas fa-user-plus me-2"></i> Register Staff
                    </a>
                </li>
                ` : ''}
            </ul>
            <hr>
            <div class="dropdown">
                <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                    <div class="bg-primary rounded-circle me-2 d-flex justify-content-center align-items-center" style="width: 32px; height: 32px;">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                    <strong>${user.username}</strong>
                </a>
                <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                    <li><span class="dropdown-item-text text-muted small">Role: ${user.role.toUpperCase()}</span></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i>Sign out</a></li>
                </ul>
            </div>
        </div>
    `;

    const container = document.getElementById('sidebar-container');
    if (container) {
        container.innerHTML = sidebarHTML;
        highlightActiveLink();
    }
}

// Load header
function loadHeader() {
    const user = getUserData();
    if (!user) return;

    const headerHTML = `
        <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4 shadow-sm mb-4">
            <button class="btn btn-outline-secondary d-md-none me-3" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarOffcanvas">
                <i class="fas fa-bars"></i>
            </button>

            <span class="navbar-brand mb-0 h1 d-md-none text-primary fw-bold">
                <i class="fas fa-box-open me-2"></i>Inventory
            </span>

            <div class="ms-auto d-flex align-items-center">
                <div class="dropdown">
                    <button class="btn btn-light dropdown-toggle d-flex align-items-center rounded-pill px-3 shadow-sm border" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <div class="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-2" style="width: 32px; height: 32px;">
                            <strong>${user.username.charAt(0).toUpperCase()}</strong>
                        </div>
                        <span class="fw-semibold me-1">${user.username}</span> 
                        <span class="badge bg-secondary ms-1">${user.role}</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2" aria-labelledby="userDropdown">
                        <li>
                            <a class="dropdown-item text-danger fw-bold" href="#" onclick="logout()">
                                <i class="fas fa-sign-out-alt me-2"></i> Logout
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `;

    const container = document.getElementById('header-container');
    if (container) {
        container.innerHTML = headerHTML;
    }
}

// Highlight active navigation link
function highlightActiveLink() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    const links = document.querySelectorAll('.nav-link[data-page]');
    
    links.forEach(link => {
        const page = link.getAttribute('data-page');
        if (page === currentPage) {
            link.classList.add('active', 'bg-primary');
        } else {
            link.classList.remove('active', 'bg-primary');
        }
    });
}

// Initialize components
function initializeComponents() {
    loadSidebar();
    loadHeader();
}

// Call on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponents);
} else {
    initializeComponents();
}
