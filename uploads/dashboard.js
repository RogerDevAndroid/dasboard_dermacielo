// Function to fetch and process sales data
async function loadSalesData() {
    // In a real implementation, this would fetch data from the Excel file
    // For now, we'll simulate March 2025 data
    const monthlyData = {
        totalSales: 85600,
        totalServices: 156,
        averageTicket: 548.72,
        monthlyGoal: 100000,
        monthlyProgress: 85.6,
        serviceCategories: {
            'Depilación Láser': { count: 45, revenue: 31500 },
            'Tratamientos Faciales': { count: 38, revenue: 22800 },
            'Limpieza Facial': { count: 35, revenue: 15750 },
            'Rejuvenecimiento': { count: 22, revenue: 11000 },
            'Otros Servicios': { count: 16, revenue: 4550 }
        },
        dailyRevenue: [
            { day: '1', amount: 2800 }, { day: '2', amount: 3100 },
            { day: '3', amount: 2950 }, { day: '4', amount: 2700 },
            { day: '5', amount: 3200 }, { day: '6', amount: 2600 },
            { day: '7', amount: 2400 }, { day: '8', amount: 3300 },
            { day: '9', amount: 3150 }, { day: '10', amount: 2900 },
            { day: '11', amount: 2750 }, { day: '12', amount: 3050 },
            { day: '13', amount: 2850 }, { day: '14', amount: 2650 },
            { day: '15', amount: 3400 }, { day: '16', amount: 3250 },
            { day: '17', amount: 2800 }, { day: '18', amount: 2950 },
            { day: '19', amount: 3100 }, { day: '20', amount: 2700 },
            { day: '21', amount: 2600 }, { day: '22', amount: 3200 },
            { day: '23', amount: 3050 }, { day: '24', amount: 2850 },
            { day: '25', amount: 2750 }, { day: '26', amount: 3150 },
            { day: '27', amount: 2900 }, { day: '28', amount: 2800 },
            { day: '29', amount: 3300 }, { day: '30', amount: 3100 },
            { day: '31', amount: 2950 }
        ],
        topClients: [
            { name: 'María González', visits: 4, spent: 3200 },
            { name: 'Ana Rodríguez', visits: 3, spent: 2800 },
            { name: 'Carmen López', visits: 3, spent: 2600 },
            { name: 'Laura Martínez', visits: 2, spent: 2400 }
        ]
    };

    updateDashboard(monthlyData);
}

// Function to update the dashboard with sales data
function updateDashboard(data) {
    // Update monthly statistics
    document.getElementById('totalSales').textContent = `$${data.totalSales.toLocaleString()}`;
    document.getElementById('totalServices').textContent = data.totalServices;
    document.getElementById('averageTicket').textContent = `$${data.averageTicket.toLocaleString()}`;
    document.getElementById('monthlyProgress').textContent = `${data.monthlyProgress}%`;
    
    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = `${data.monthlyProgress}%`;
        progressBar.setAttribute('aria-valuenow', data.monthlyProgress.toString());
    }

    // Update top services table
    const topServicesBody = document.getElementById('topServicesBody');
    if (topServicesBody) {
        topServicesBody.innerHTML = Object.entries(data.serviceCategories)
            .sort(([, a], [, b]) => b.revenue - a.revenue)
            .map(([name, stats]) => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${name}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${stats.count}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        $${stats.revenue.toLocaleString()}
                    </td>
                </tr>
            `).join('');
    }

    // Update revenue chart
    const revenueCanvas = document.getElementById('revenueChart');
    if (revenueCanvas) {
        const ctx = revenueCanvas.getContext('2d');
        if (ctx) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.dailyRevenue.map(d => `Día ${d.day}`),
                    datasets: [{
                        label: 'Ingresos Diarios',
                        data: data.dailyRevenue.map(d => d.amount),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Ingresos Diarios - Marzo 2025'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // Update service distribution chart
    const distributionCanvas = document.getElementById('serviceDistributionChart');
    if (distributionCanvas) {
        const pieCtx = distributionCanvas.getContext('2d');
        if (pieCtx) {
            new Chart(pieCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(data.serviceCategories),
                    datasets: [{
                        data: Object.values(data.serviceCategories).map(s => s.revenue),
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        title: {
                            display: true,
                            text: 'Distribución de Servicios'
                        }
                    }
                }
            });
        }
    }

    // Update top clients table
    const topClientsBody = document.getElementById('topClientsBody');
    if (topClientsBody) {
        topClientsBody.innerHTML = data.topClients.map(client => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${client.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${client.visits}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    $${client.spent.toLocaleString()}
                </td>
            </tr>
        `).join('');
    }
}

// Initialize dashboard when the document loads
document.addEventListener('DOMContentLoaded', loadSalesData);