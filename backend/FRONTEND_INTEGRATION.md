# Frontend Integration Guide

This guide shows how to connect your existing frontend to the new backend API.

## 🔧 Setup

### 1. Update API Base URL

In your `script.js`, add a constant at the top:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

For production, update this to your deployed backend URL:
```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

### 2. Store JWT Token

After login/register, store the token in localStorage:

```javascript
// After successful login/register
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));
```

## 📝 Updated Functions

### Authentication Functions

#### handleLogin()
```javascript
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    if (!email || !password || !role) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }

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
            if (data.data.user.role !== role) {
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
        showAlert('Network error. Please try again.', 'danger');
    }
}
```

#### handleRegister()
```javascript
async function handleRegister() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    if (!email || !password || !role) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Please enter a valid email address', 'danger');
        return;
    }

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
        showAlert('Network error. Please try again.', 'danger');
    }
}
```

### Complaint Functions

#### handleComplaintSubmission()
```javascript
async function handleComplaintSubmission() {
    const category = document.getElementById('complaintCategory').value;
    const priority = document.getElementById('complaintPriority').value;
    const description = document.getElementById('complaintDescription').value;

    if (!category || !priority || !description.trim()) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }

    if (description.trim().length < 10) {
        showAlert('Description must be at least 10 characters long', 'danger');
        return;
    }

    const token = localStorage.getItem('token');
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
            // Reload complaints table
            loadComplaints();
        } else {
            showAlert(data.message || 'Failed to submit complaint', 'danger');
        }
    } catch (error) {
        console.error('Submit error:', error);
        showAlert('Network error. Please try again.', 'danger');
    }
}
```

#### loadComplaints()
```javascript
async function loadComplaints() {
    const token = localStorage.getItem('token');
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
            tbody.innerHTML = '';

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
    } catch (error) {
        console.error('Load complaints error:', error);
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('user_dashboard.html')) {
        loadComplaints();
    }
});
```

### Admin Dashboard Functions

#### loadAdminComplaints()
```javascript
async function loadAdminComplaints() {
    const token = localStorage.getItem('token');
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
            tbody.innerHTML = '';

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
    } catch (error) {
        console.error('Load admin complaints error:', error);
    }
}
```

#### updateStatus()
```javascript
async function updateStatus(selectElement, complaintId) {
    const newStatus = selectElement.value;
    const token = localStorage.getItem('token');

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
            selectElement.value = selectElement.getAttribute('data-old-value');
        }
    } catch (error) {
        console.error('Update status error:', error);
        showAlert('Network error. Please try again.', 'danger');
    }
}
```

#### updateStatistics()
```javascript
async function updateStatistics() {
    const token = localStorage.getItem('token');

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
            document.getElementById('totalComplaints').textContent = totalData.data.total;
        }
        if (pendingData.success) {
            document.getElementById('pendingComplaints').textContent = pendingData.data.pending;
        }
        if (resolvedData.success) {
            document.getElementById('resolvedComplaints').textContent = resolvedData.data.resolved;
        }
    } catch (error) {
        console.error('Update statistics error:', error);
    }
}
```

#### initializeCharts()
```javascript
async function initializeCharts() {
    const token = localStorage.getItem('token');

    // Category Distribution Chart
    try {
        const categoryRes = await fetch(`${API_BASE_URL}/stats/category-distribution`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const categoryData = await categoryRes.json();

        if (categoryData.success) {
            const ctxBar = document.getElementById('complaintChart');
            if (ctxBar) {
                new Chart(ctxBar, {
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
                            y: { beginAtZero: true }
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Category chart error:', error);
    }

    // Status Distribution Chart
    try {
        const statusRes = await fetch(`${API_BASE_URL}/stats/status-distribution`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const statusData = await statusRes.json();

        if (statusData.success) {
            const ctxDoughnut = document.getElementById('statusChart');
            if (ctxDoughnut) {
                new Chart(ctxDoughnut, {
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
```

### Profile Functions

#### Load Profile
```javascript
async function loadProfile() {
    const token = localStorage.getItem('token');
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
            document.getElementById('firstName').value = user.name?.split(' ')[0] || '';
            document.getElementById('lastName').value = user.name?.split(' ').slice(1).join(' ') || '';
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
```

#### Update Profile
```javascript
document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
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
        } else {
            showToast(data.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Update profile error:', error);
        showToast('Network error. Please try again.', 'error');
    }
});
```

### Export Function

```javascript
async function exportToCSV() {
    const token = localStorage.getItem('token');

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
            showToast('Failed to export complaints', 'error');
        }
    } catch (error) {
        console.error('Export error:', error);
        showToast('Network error. Please try again.', 'error');
    }
}
```

## 🔒 Token Management

Add this helper function to check authentication:

```javascript
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Call on protected pages
if (window.location.pathname.includes('dashboard') || window.location.pathname.includes('profile')) {
    if (!checkAuth()) {
        return;
    }
}
```

## 🚀 Complete Integration Checklist

- [ ] Add API_BASE_URL constant
- [ ] Update handleLogin() to use fetch API
- [ ] Update handleRegister() to use fetch API
- [ ] Update handleComplaintSubmission() to use fetch API
- [ ] Add loadComplaints() function
- [ ] Add loadAdminComplaints() function
- [ ] Update updateStatus() function
- [ ] Update updateStatistics() function
- [ ] Update initializeCharts() function
- [ ] Add loadProfile() function
- [ ] Update profile form submit handler
- [ ] Add checkAuth() function
- [ ] Update exportToCSV() function
- [ ] Test all endpoints
- [ ] Handle error responses
- [ ] Add loading states

## 📝 Notes

- All API calls include the JWT token in the Authorization header
- Error handling is included for network errors
- Token is stored in localStorage
- User data is also stored in localStorage for quick access
- All dates are formatted to match frontend expectations
- Status codes are checked before processing responses

