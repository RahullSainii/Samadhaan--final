/* ===========================
   Samadhaan - JavaScript
   =========================== */

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
function getToken() {
    return localStorage.getItem('token');
}

// Helper function to check authentication
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// ===========================
// INDEX.HTML Functions
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    // Register Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }

    // Initialize admin dashboard
    if (window.location.pathname.includes('admin_dashboard.html')) {
        initializeAdminDashboard();
    }
});

// Handle Login
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    // Simple validation
    if (!email || !password || !role) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Please enter a valid email address', 'danger');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.success) {
            // Store token and user data
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            // Verify role matches
            const userRole = data.data.user.role.toLowerCase();
            if (userRole !== role.toLowerCase()) {
                showAlert('Role mismatch. Please select the correct role.', 'danger');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                return;
            }

            showAlert('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                if (role === 'user') {
                    window.location.href = 'user_dashboard.html';
                } else if (role === 'admin') {
                    window.location.href = 'admin_dashboard.html';
                }
            }, 1500);
        } else {
            showAlert(data.message || 'Login failed', 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Network error. Please check if backend is running.', 'danger');
    }
}

// Handle Registration
async function handleRegister() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    // Simple validation
    if (!email || !password || !role) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Please enter a valid email address', 'danger');
        return;
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'danger');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: email.split('@')[0], // Use email prefix as name
                email,
                password,
                role: role.charAt(0).toUpperCase() + role.slice(1), // Capitalize
            }),
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            showAlert('Registration successful! You can now login.', 'success');
            document.getElementById('registerForm').reset();
        } else {
            showAlert(data.message || 'Registration failed', 'danger');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('Network error. Please check if backend is running.', 'danger');
    }
}

// ===========================
// USER DASHBOARD Functions
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication on protected pages
    if (window.location.pathname.includes('dashboard') || window.location.pathname.includes('profile')) {
        if (!checkAuth()) {
            return;
        }
    }

    // Complaint Form Handler
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleComplaintSubmission();
        });
    }

    // Load complaints on user dashboard
    if (window.location.pathname.includes('user_dashboard.html')) {
        loadComplaints();
    }

    // Load admin data on admin dashboard
    if (window.location.pathname.includes('admin_dashboard.html')) {
        loadAdminComplaints();
        updateStatistics();
        initializeCharts();
    }

    // Load profile on profile page
    if (window.location.pathname.includes('profile.html')) {
        loadProfile();
    }
});

// Handle Complaint Submission
async function handleComplaintSubmission() {
    const category = document.getElementById('complaintCategory').value;
    const priority = document.getElementById('complaintPriority').value;
    const description = document.getElementById('complaintDescription').value;

    // Validation
    if (!category || !priority || !description.trim()) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }

    // Description length validation
    if (description.trim().length < 10) {
        showAlert('Description must be at least 10 characters long', 'danger');
        return;
    }

    const token = getToken();
    if (!token) {
        showAlert('Please login first', 'danger');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/complaints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ category, priority, description }),
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Complaint submitted successfully!', 'success');
            document.getElementById('complaintForm').reset();
            // Reload complaints
            loadComplaints();
        } else {
            showAlert(data.message || 'Failed to submit complaint', 'danger');
        }
    } catch (error) {
        console.error('Submit error:', error);
        showAlert('Network error. Please try again.', 'danger');
    }
}

// Load Complaints from Backend
async function loadComplaints() {
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/complaints/my`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (data.success) {
            const tbody = document.getElementById('complaintsTableBody');
            if (tbody) {
                tbody.innerHTML = '';

                if (data.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No complaints found</td></tr>';
                } else {
                    data.data.forEach(complaint => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${complaint.id}</td>
                            <td>${complaint.category}</td>
                            <td>${complaint.description}</td>
                            <td><span class="badge ${getPriorityBadgeClass(complaint.priority)}">${complaint.priority}</span></td>
                            <td><span class="badge ${getStatusBadgeClass(complaint.status)}">${complaint.status}</span></td>
                            <td>${complaint.date}</td>
                        `;
                        tbody.appendChild(row);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Load complaints error:', error);
    }
}

// Get Priority Badge Class
function getPriorityBadgeClass(priority) {
    switch (priority) {
        case 'High':
            return 'bg-danger';
        case 'Medium':
            return 'bg-info';
        case 'Low':
            return 'bg-secondary';
        default:
            return 'bg-secondary';
    }
}

// Get Status Badge Class
function getStatusBadgeClass(status) {
    switch (status) {
        case 'Pending':
            return 'bg-warning';
        case 'In Progress':
            return 'bg-info';
        case 'Resolved':
            return 'bg-success';
        default:
            return 'bg-secondary';
    }
}

// ===========================
// ADMIN DASHBOARD Functions
// ===========================

// Initialize Admin Dashboard
function initializeAdminDashboard() {
    updateStatistics();
    initializeCharts();
}

// Update Statistics
async function updateStatistics() {
    const token = getToken();
    if (!token) return;

    try {
        const [totalRes, pendingRes, resolvedRes] = await Promise.all([
            fetch(`${API_BASE_URL}/stats/total`, {
                headers: { 'Authorization': `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/stats/pending`, {
                headers: { 'Authorization': `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/stats/resolved`, {
                headers: { 'Authorization': `Bearer ${token}` },
            }),
        ]);

        const totalData = await totalRes.json();
        const pendingData = await pendingRes.json();
        const resolvedData = await resolvedRes.json();

        if (totalData.success) {
            document.getElementById('totalComplaints').textContent = totalData.data.total || 0;
        }
        if (pendingData.success) {
            document.getElementById('pendingComplaints').textContent = pendingData.data.pending || 0;
        }
        if (resolvedData.success) {
            document.getElementById('resolvedComplaints').textContent = resolvedData.data.resolved || 0;
        }
    } catch (error) {
        console.error('Update statistics error:', error);
    }
}

// Initialize Charts
async function initializeCharts() {
    const token = getToken();
    if (!token) return;

    // Category Distribution Chart (Bar Chart)
    try {
        const categoryRes = await fetch(`${API_BASE_URL}/stats/category-distribution`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const categoryData = await categoryRes.json();

        if (categoryData.success) {
            const ctxBar = document.getElementById('complaintChart');
            if (ctxBar) {
                // Destroy existing chart if it exists
                if (window.categoryChart) {
                    window.categoryChart.destroy();
                }
                window.categoryChart = new Chart(ctxBar, {
                    type: 'bar',
                    data: {
                        labels: categoryData.data.labels,
                        datasets: [{
                            label: 'Complaints',
                            data: categoryData.data.datasets[0].data,
                            backgroundColor: [
                                'rgba(102, 126, 234, 0.8)',
                                'rgba(40, 167, 69, 0.8)',
                                'rgba(23, 162, 184, 0.8)',
                                'rgba(255, 193, 7, 0.8)',
                                'rgba(220, 53, 69, 0.8)'
                            ],
                            borderColor: [
                                'rgba(102, 126, 234, 1)',
                                'rgba(40, 167, 69, 1)',
                                'rgba(23, 162, 184, 1)',
                                'rgba(255, 193, 7, 1)',
                                'rgba(220, 53, 69, 1)'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Category chart error:', error);
    }

    // Status Distribution Chart (Doughnut Chart)
    try {
        const statusRes = await fetch(`${API_BASE_URL}/stats/status-distribution`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const statusData = await statusRes.json();

        if (statusData.success) {
            const ctxDoughnut = document.getElementById('statusChart');
            if (ctxDoughnut) {
                // Destroy existing chart if it exists
                if (window.statusChart) {
                    window.statusChart.destroy();
                }
                window.statusChart = new Chart(ctxDoughnut, {
                    type: 'doughnut',
                    data: {
                        labels: statusData.data.labels,
                        datasets: [{
                            data: statusData.data.datasets[0].data,
                            backgroundColor: [
                                'rgba(255, 193, 7, 0.8)',
                                'rgba(23, 162, 184, 0.8)',
                                'rgba(40, 167, 69, 0.8)'
                            ],
                            borderColor: [
                                'rgba(255, 193, 7, 1)',
                                'rgba(23, 162, 184, 1)',
                                'rgba(40, 167, 69, 1)'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true
                    }
                });
            }
        }
    } catch (error) {
        console.error('Status chart error:', error);
    }
}

// Load Admin Complaints
async function loadAdminComplaints() {
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/complaints`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (data.success) {
            const tbody = document.getElementById('adminComplaintsTableBody');
            if (tbody) {
                tbody.innerHTML = '';

                if (data.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No complaints found</td></tr>';
                } else {
                    data.data.forEach(complaint => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${complaint.id}</td>
                            <td>${complaint.category}</td>
                            <td>${complaint.description}</td>
                            <td><span class="badge ${getPriorityBadgeClass(complaint.priority)}">${complaint.priority}</span></td>
                            <td>
                                <select class="form-select status-select" onchange="updateStatus(this, '${complaint._id}')">
                                    <option value="Pending" ${complaint.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="In Progress" ${complaint.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                                </select>
                            </td>
                            <td>${complaint.date}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="viewDetails('${complaint._id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        `;
                        tbody.appendChild(row);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Load admin complaints error:', error);
    }
}

// Update Complaint Status
async function updateStatus(selectElement, complaintId) {
    const newStatus = selectElement.value;
    const token = getToken();

    try {
        const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
        });

        const data = await response.json();

        if (data.success) {
            showAlert(`Complaint status updated to ${newStatus}`, 'success');
            updateStatistics();
            initializeCharts();
        } else {
            showAlert(data.message || 'Failed to update status', 'danger');
            // Revert select
            const oldValue = selectElement.getAttribute('data-old-value');
            if (oldValue) selectElement.value = oldValue;
        }
    } catch (error) {
        console.error('Update status error:', error);
        showAlert('Network error. Please try again.', 'danger');
    }
}

// View Complaint Details
async function viewDetails(complaintId) {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (data.success) {
            const complaint = data.data;
            alert(`Complaint ${complaint.id}\n` +
                  `Category: ${complaint.category}\n` +
                  `Description: ${complaint.description}\n` +
                  `Priority: ${complaint.priority}\n` +
                  `Status: ${complaint.status}\n` +
                  `Date: ${complaint.date}`);
        } else {
            showAlert(data.message || 'Failed to load complaint details', 'danger');
        }
    } catch (error) {
        console.error('View details error:', error);
        showAlert('Network error. Please try again.', 'danger');
    }
}

// Logout Function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showAlert('Logging out...', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Show Alert Function
function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ===========================
// SEARCH AND FILTER FUNCTIONS
// ===========================

// Filter function for User Dashboard
async function filterComplaints() {
    const searchInput = document.getElementById('searchInput');
    const filterStatus = document.getElementById('filterStatus');
    const filterCategory = document.getElementById('filterCategory');
    const filterDate = document.getElementById('filterDate');
    
    if (!searchInput || !filterStatus || !filterCategory || !filterDate) return;
    
    const searchTerm = searchInput.value;
    const statusFilter = filterStatus.value;
    const categoryFilter = filterCategory.value;
    const dateFilter = filterDate.value;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (statusFilter) params.append('status', statusFilter);
    if (categoryFilter) params.append('category', categoryFilter);
    if (dateFilter) params.append('date', dateFilter);
    
    const token = getToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/complaints/my?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.getElementById('complaintsTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                
                if (data.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No complaints found matching your filters</td></tr>';
                } else {
                    data.data.forEach(complaint => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${complaint.id}</td>
                            <td>${complaint.category}</td>
                            <td>${complaint.description}</td>
                            <td><span class="badge ${getPriorityBadgeClass(complaint.priority)}">${complaint.priority}</span></td>
                            <td><span class="badge ${getStatusBadgeClass(complaint.status)}">${complaint.status}</span></td>
                            <td>${complaint.date}</td>
                        `;
                        tbody.appendChild(row);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Filter complaints error:', error);
    }
}

// Filter function for Admin Dashboard
async function filterAdminComplaints() {
    const searchInput = document.getElementById('adminSearchInput');
    const filterStatus = document.getElementById('adminFilterStatus');
    const filterCategory = document.getElementById('adminFilterCategory');
    const filterDate = document.getElementById('adminFilterDate');
    
    if (!searchInput || !filterStatus || !filterCategory || !filterDate) return;
    
    const searchTerm = searchInput.value;
    const statusFilter = filterStatus.value;
    const categoryFilter = filterCategory.value;
    const dateFilter = filterDate.value;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (statusFilter) params.append('status', statusFilter);
    if (categoryFilter) params.append('category', categoryFilter);
    if (dateFilter) params.append('date', dateFilter);
    
    const token = getToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/complaints?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.getElementById('adminComplaintsTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                
                if (data.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No complaints found matching your filters</td></tr>';
                } else {
                    data.data.forEach(complaint => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${complaint.id}</td>
                            <td>${complaint.category}</td>
                            <td>${complaint.description}</td>
                            <td><span class="badge ${getPriorityBadgeClass(complaint.priority)}">${complaint.priority}</span></td>
                            <td>
                                <select class="form-select status-select" onchange="updateStatus(this, '${complaint._id}')">
                                    <option value="Pending" ${complaint.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="In Progress" ${complaint.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                                </select>
                            </td>
                            <td>${complaint.date}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="viewDetails('${complaint._id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        `;
                        tbody.appendChild(row);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Filter admin complaints error:', error);
    }
}

// Show filter results message
function showFilterResultsMessage(count) {
    // Remove existing message
    const existingMessage = document.getElementById('filterMessage');
    if (existingMessage) existingMessage.remove();
    
    if (count === 0) {
        const message = document.createElement('div');
        message.id = 'filterMessage';
        message.className = 'alert alert-info mt-3';
        message.innerHTML = '<i class="fas fa-info-circle me-2"></i>No complaints found matching your filters.';
        
        const tableContainer = document.querySelector('#complaintsTableBody')?.parentElement?.parentElement;
        const adminTableContainer = document.querySelector('#adminComplaintsTableBody')?.parentElement?.parentElement;
        const container = tableContainer || adminTableContainer;
        
        if (container && container.parentElement) {
            container.parentElement.insertBefore(message, container.nextSibling);
        }
    }
}

// Clear Filters for User Dashboard
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterDate').value = '';
    
    // Reload all complaints
    loadComplaints();
    
    // Remove message
    const message = document.getElementById('filterMessage');
    if (message) message.remove();
}

// Clear Filters for Admin Dashboard
function clearAdminFilters() {
    document.getElementById('adminSearchInput').value = '';
    document.getElementById('adminFilterStatus').value = '';
    document.getElementById('adminFilterCategory').value = '';
    document.getElementById('adminFilterDate').value = '';
    
    // Reload all complaints
    loadAdminComplaints();
    
    // Remove message
    const message = document.getElementById('filterMessage');
    if (message) message.remove();
}

// Initialize filter event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // User Dashboard filter listeners
    const userSearchInput = document.getElementById('searchInput');
    const userFilterStatus = document.getElementById('filterStatus');
    const userFilterCategory = document.getElementById('filterCategory');
    const userFilterDate = document.getElementById('filterDate');
    
    if (userSearchInput) {
        userSearchInput.addEventListener('input', filterComplaints);
        userFilterStatus.addEventListener('change', filterComplaints);
        userFilterCategory.addEventListener('change', filterComplaints);
        userFilterDate.addEventListener('change', filterComplaints);
    }
    
    // Admin Dashboard filter listeners
    const adminSearchInput = document.getElementById('adminSearchInput');
    const adminFilterStatus = document.getElementById('adminFilterStatus');
    const adminFilterCategory = document.getElementById('adminFilterCategory');
    const adminFilterDate = document.getElementById('adminFilterDate');
    
    if (adminSearchInput) {
        adminSearchInput.addEventListener('input', filterAdminComplaints);
        adminFilterStatus.addEventListener('change', filterAdminComplaints);
        adminFilterCategory.addEventListener('change', filterAdminComplaints);
        adminFilterDate.addEventListener('change', filterAdminComplaints);
    }
    
    // Initialize new features
    initDarkMode();
    updateDateTime();
});

// ===========================
// DARK MODE FUNCTIONS
// ===========================

// Toggle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    
    const toggleBtn = document.getElementById('darkModeToggle');
    if (toggleBtn) {
        const icon = toggleBtn.querySelector('i');
        if (isDark) {
            icon.className = 'fas fa-sun me-2';
            toggleBtn.innerHTML = '<i class="fas fa-sun me-2"></i>Light Mode';
        } else {
            icon.className = 'fas fa-moon me-2';
            toggleBtn.innerHTML = '<i class="fas fa-moon me-2"></i>Dark Mode';
        }
    }
}

// Initialize Dark Mode
function initDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        const toggleBtn = document.getElementById('darkModeToggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-sun me-2"></i>Light Mode';
        }
    }
}

// ===========================
// DATE/TIME DISPLAY
// ===========================

function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
    };
    const dateTimeStr = now.toLocaleString('en-US', options);
    
    const dateTimeElement = document.getElementById('dateTime');
    if (dateTimeElement) {
        dateTimeElement.textContent = dateTimeStr;
    }
}

// Update date/time every minute
setInterval(updateDateTime, 60000);
updateDateTime();

// ===========================
// TOAST NOTIFICATIONS
// ===========================

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
    `;
    
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `
        <i class="fas ${icon} me-2"></i>
        <span>${message}</span>
        <button class="btn-close btn-close-white ms-3" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Make showToast global
window.showToast = showToast;

// ===========================
// EXPORT AND PRINT FUNCTIONS
// ===========================

// Export to CSV
async function exportToCSV() {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/export/csv`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `complaints_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            showToast('Complaints exported successfully!', 'success');
        } else {
            const data = await response.json();
            showToast(data.message || 'Failed to export complaints', 'error');
        }
    } catch (error) {
        console.error('Export error:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

window.exportToCSV = exportToCSV;

// Print Report
function printReport() {
    window.print();
    showToast('Print dialog opened!', 'info');
}

window.printReport = printReport;

// ===========================
// PROFILE FUNCTIONS
// ===========================

function resetProfile() {
    if (confirm('Reset profile to original values?')) {
        document.getElementById('firstName').value = 'Rahul';
        document.getElementById('lastName').value = 'Saini';
        document.getElementById('email').value = 'rsaini1_be23@thapar.edu';
        document.getElementById('phone').value = '8872144340';
        document.getElementById('address').value = 'Thapar University, Patiala';
        document.getElementById('bio').value = 'Student at Thapar University using Samadhaan platform';
        showToast('Profile reset successfully!', 'success');
    }
}

window.resetProfile = resetProfile;

// Toggle Dark Mode Global
window.toggleDarkMode = toggleDarkMode;

// Load Profile
async function loadProfile() {
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/profile/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (data.success) {
            const user = data.data;
            const nameParts = (user.name || '').split(' ');
            document.getElementById('firstName').value = nameParts[0] || '';
            document.getElementById('lastName').value = nameParts.slice(1).join(' ') || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('address').value = user.address || '';
            document.getElementById('bio').value = user.bio || '';
            document.getElementById('profileName').textContent = user.name || '';
            document.getElementById('profileEmail').textContent = user.email || '';
        }
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

// Handle Profile Form Submit
document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const token = getToken();
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;

            try {
                const response = await fetch(`${API_BASE_URL}/profile/update`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: `${firstName} ${lastName}`.trim(),
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        address: document.getElementById('address').value,
                        bio: document.getElementById('bio').value,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    showToast('Profile updated successfully!', 'success');
                    loadProfile(); // Reload to show updated data
                } else {
                    showToast(data.message || 'Failed to update profile', 'error');
                }
            } catch (error) {
                console.error('Update profile error:', error);
                showToast('Network error. Please try again.', 'error');
            }
        });
    }
    
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const currentPwd = document.getElementById('currentPassword').value;
            const newPwd = document.getElementById('newPassword').value;
            const confirmPwd = document.getElementById('confirmPassword').value;
            
            if (newPwd !== confirmPwd) {
                showToast('New passwords do not match!', 'error');
                return;
            }
            
            if (newPwd.length < 6) {
                showToast('Password must be at least 6 characters!', 'error');
                return;
            }

            const token = getToken();
            try {
                const response = await fetch(`${API_BASE_URL}/profile/change-password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        currentPassword: currentPwd,
                        newPassword: newPwd,
                        confirmPassword: confirmPwd,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    document.getElementById('currentPassword').value = '';
                    document.getElementById('newPassword').value = '';
                    document.getElementById('confirmPassword').value = '';
                    showToast('Password updated successfully!', 'success');
                } else {
                    showToast(data.message || 'Failed to update password', 'error');
                }
            } catch (error) {
                console.error('Change password error:', error);
                showToast('Network error. Please try again.', 'error');
            }
        });
    }
});

// ===========================
// CSS ANIMATIONS FOR TOAST
// ===========================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

