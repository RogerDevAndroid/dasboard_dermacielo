// Get localStorage data
const roles = JSON.parse(localStorage.getItem('roles')) || [];
const users = JSON.parse(localStorage.getItem('users')) || [];
const documents = JSON.parse(localStorage.getItem('documents')) || [];
const clients = JSON.parse(localStorage.getItem('clients')) || [];
const sales = JSON.parse(localStorage.getItem('sales')) || [];

// Initialize charts
let userRoleDistributionChart;
let salesChart;

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

// Calculate sales for the last 30 days
function calculateRecentSales() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = sales.filter(sale =>
        new Date(sale.completedAt) >= thirtyDaysAgo &&
        sale.status === 'completed'
    );

    const totalAmount = recentSales.reduce((total, sale) => total + sale.total, 0);
    return totalAmount;
}

// Get sales data for the last 7 days
function getSalesDataForLastWeek() {
    const days = [];
    const salesData = [];

    // Create array of last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const dateString = date.toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric'
        });

        days.push(dateString);

        // Calculate sales for this day
        const dayStart = new Date(date);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const daySales = sales.filter(sale =>
            new Date(sale.completedAt) >= dayStart &&
            new Date(sale.completedAt) <= dayEnd &&
            sale.status === 'completed'
        );

        const dayTotal = daySales.reduce((total, sale) => total + sale.total, 0);
        salesData.push(dayTotal);
    }

    return { days, salesData };
}

// Update dashboard statistics
function updateDashboardStats() {
    // Update count displays
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalRoles').textContent = roles.length;
    document.getElementById('totalDocuments').textContent = documents.length;
    document.getElementById('totalClients').textContent = clients.length;
    document.getElementById('totalSales').textContent = formatCurrency(calculateRecentSales());

    // Update charts
    updateUserRoleDistributionChart();
    updateSalesChart();

    // Update tables
    updateRecentUsersTable();
    updateRecentSalesTable();
}

// Update user distribution by role chart
function updateUserRoleDistributionChart() {
    // Count users per role
    const roleCount = {};
    roles.forEach(role => roleCount[role.name] = 0);

    users.forEach(user => {
        if (user.roleId) {
            const role = roles.find(r => r.id === user.roleId);
            if (role) {
                roleCount[role.name] = (roleCount[role.name] || 0) + 1;
            }
        }
    });

    // Prepare chart data
    const roleNames = Object.keys(roleCount);
    const roleCounts = Object.values(roleCount);

    // Get the canvas element
    const ctx = document.getElementById('userRoleDistribution').getContext('2d');

    // Create or update chart
    if (userRoleDistributionChart) {
        userRoleDistributionChart.data.labels = roleNames;
        userRoleDistributionChart.data.datasets[0].data = roleCounts;
        userRoleDistributionChart.update();
    } else {
        userRoleDistributionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: roleNames,
                datasets: [{
                    data: roleCounts,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(100, 100, 100, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.formattedValue;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.raw / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Update sales chart for the last 7 days
function updateSalesChart() {
    const { days, salesData } = getSalesDataForLastWeek();

    // Get the canvas element
    const ctx = document.getElementById('salesChart').getContext('2d');

    // Create or update chart
    if (salesChart) {
        salesChart.data.labels = days;
        salesChart.data.datasets[0].data = salesData;
        salesChart.update();
    } else {
        salesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Ventas',
                    data: salesData,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString('es-MX');
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Venta: ' + formatCurrency(context.raw);
                            }
                        }
                    }
                }
            }
        });
    }
}

// Update recent users table
function updateRecentUsersTable() {
    const tbody = document.getElementById('recentUsersBody');

    // Sort users by creation date (descending)
    const sortedUsers = [...users].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    ).slice(0, 5); // Get most recent 5

    if (sortedUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">
                    No hay usuarios disponibles
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = sortedUsers.map(user => {
        const role = roles.find(r => r.id === user.roleId);
        const roleName = role ? role.name : 'Sin rol';
        const date = user.lastLogin ? formatDate(user.lastLogin) : 'Nunca';

        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-full" src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff" alt="${user.name}">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${user.name}</div>
                            <div class="text-xs text-gray-500">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${roleName}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${date}
                </td>
            </tr>
        `;
    }).join('');
}

// Update recent sales table
function updateRecentSalesTable() {
    const tbody = document.getElementById('recentSalesBody');

    // Sort sales by completion date (descending)
    const sortedSales = [...sales].filter(sale => sale.status === 'completed')
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 5); // Get most recent 5

    if (sortedSales.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                    No hay ventas disponibles
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = sortedSales.map(sale => {
        const date = formatDate(sale.completedAt);

        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${sale.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${sale.client ? sale.client.name : 'Cliente no registrado'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${date}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${formatCurrency(sale.total)}
                </td>
            </tr>
        `;
    }).join('');
}

// Initialize dashboard
function initDashboard() {
    updateDashboardStats();
}

// Run on page load
document.addEventListener('DOMContentLoaded', initDashboard);
