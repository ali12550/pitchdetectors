// Pitch Detectors Tools JavaScript

// Tool Search Functionality
function searchTools() {
    const searchInput = document.getElementById('toolSearch');
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase().trim();
    const sidebarLinks = document.querySelectorAll('.sidebar-links a');
    const toolCards = document.querySelectorAll('.tool-card');

    // Search in sidebar
    sidebarLinks.forEach(link => {
        const text = link.textContent.toLowerCase();
        if (searchTerm === '' || text.includes(searchTerm)) {
            link.parentElement.classList.remove('hidden');
        } else {
            link.parentElement.classList.add('hidden');
        }
    });

    // Search in tool cards
    toolCards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
        if (searchTerm === '' || title.includes(searchTerm) || desc.includes(searchTerm)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });

    // Show/hide categories based on visible links
    document.querySelectorAll('.sidebar-category').forEach(category => {
        const visibleLinks = category.querySelectorAll('.sidebar-links li:not(.hidden)');
        if (visibleLinks.length === 0 && searchTerm !== '') {
            category.classList.add('hidden');
        } else {
            category.classList.remove('hidden');
        }
    });
}

// Collapsible Sidebar Categories
function initSidebarCategories() {
    document.querySelectorAll('.sidebar-category h5').forEach(header => {
        header.addEventListener('click', function () {
            const category = this.parentElement;
            const links = category.querySelector('.sidebar-links');
            if (links) {
                links.classList.toggle('collapsed');
                category.classList.toggle('collapsed');
            }
        });
    });
}

// Active Link Highlighting
function highlightActiveLink() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-links a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
            // Expand parent category
            const category = link.closest('.sidebar-category');
            if (category) {
                category.classList.add('active');
            }
        }
    });
}

// Mobile Sidebar Toggle
function initMobileSidebar() {
    const sidebar = document.querySelector('.tools-sidebar');
    if (!sidebar) return;

    // Create toggle button for mobile
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sidebar-toggle d-md-none d-sm-none btn btn-primary mb-3';
    toggleBtn.innerHTML = '<i class="bi bi-list"></i> Show Tools Menu';
    toggleBtn.onclick = function () {
        sidebar.classList.toggle('mobile-open');
        this.innerHTML = sidebar.classList.contains('mobile-open')
            ? '<i class="bi bi-x"></i> Hide Tools Menu'
            : '<i class="bi bi-list"></i> Show Tools Menu';
    };

    sidebar.parentElement.insertBefore(toggleBtn, sidebar);
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function () {
    initSidebarCategories();
    highlightActiveLink();
    initMobileSidebar();
});

// Export for use in other scripts
window.PitchDetectorsTools = {
    searchTools,
    initSidebarCategories,
    highlightActiveLink,
    initMobileSidebar
};


