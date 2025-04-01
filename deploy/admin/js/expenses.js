// Expense data management
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Expense categories
const expenseCategories = [
    { id: 'renta', name: 'Renta', icon: 'building', color: 'blue' },
    { id: 'servicios', name: 'Servicios', icon: 'bolt', color: 'yellow' },
    { id: 'inventario', name: 'Inventario', icon: 'boxes-stacked', color: 'green' },
    { id: 'salarios', name: 'Salarios', icon: 'users', color: 'purple' },
    { id: 'marketing', name: 'Marketing', icon: 'bullhorn', color: 'pink' },
    { id: 'otros', name: 'Otros', icon: 'tag', color: 'gray' }
];

// Modal Management
function showModal(modalId, expenseId = null) {
    const modal = document.getElementById(modalId);

    if (modal) {
        modal.classList.remove('hidden');

        if (modalId === 'createExpenseModal') {
            const modalTitle = document.getElementById('expenseModalTitle');
            const expenseForm = document.getElementById('expenseForm');

            // Clear form
            if (expenseForm) {
                expenseForm.reset();
                document.getElementById('expenseId').value = '';

                // Set default date to today
                document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
            }

            if (expenseId) {
                // Edit mode
                const expense = expenses.find(e => e.id === expenseId);
                if (expense) {
                    modalTitle.textContent = 'Editar Gasto';
                    document.getElementById('expenseId').value = expense.id;
                    document.getElementById('expenseConcept').value = expense.concept;
                    document.getElementById('expenseCategory').value = expense.category;
                    document.getElementById('expenseDate').value = expense.date;
                    document.getElementById('expenseAmount').value = expense.amount;
                    document.getElementById('expenseDescription').value = expense.description || '';
                    document.getElementById('expenseStatus').value = expense.status;
                }
            } else {
                // Create mode
                modalTitle.textContent = 'Nuevo Gasto';
            }
        } else if (modalId === 'deleteExpenseModal' && expenseId) {
            // Delete confirmation
            document.getElementById('deleteExpenseId').value = expenseId;
        }

        // Add event listener to close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modalId);
            }
        });
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Form Submission
function handleExpenseSubmit(event) {
    event.preventDefault();

    const expenseId = document.getElementById('expenseId').value;
    const formData = {
        id: expenseId || Date.now().toString(),
        concept: document.getElementById('expenseConcept').value,
        category: document.getElementById('expenseCategory').value,
        date: document.getElementById('expenseDate').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        description: document.getElementById('expenseDescription').value,
        status: document.getElementById('expenseStatus').value,
        creationDate: expenseId ? (expenses.find(e => e.id === expenseId)?.creationDate || new Date().toISOString()) : new Date().toISOString()
    };

    if (expenseId) {
        // Update existing expense
        const index = expenses.findIndex(e => e.id === expenseId);
        if (index !== -1) {
            expenses[index] = formData;
        }
    } else {
        // Create new expense
        expenses.push(formData);
    }

    // Save to localStorage
    localStorage.setItem('expenses', JSON.stringify(expenses));

    // Update table and stats
    renderExpensesTable();
    updateSummaryStats();

    // Close modal
    hideModal('createExpenseModal');
}

// Delete expense
function deleteExpense() {
    const expenseId = document.getElementById('deleteExpenseId').value;
    if (expenseId) {
        expenses = expenses.filter(expense => expense.id !== expenseId);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        renderExpensesTable();
        updateSummaryStats();
        hideModal('deleteExpenseModal');
    }
}

// Get category name and icon
function getCategoryInfo(categoryId) {
    const category = expenseCategories.find(c => c.id === categoryId);
    return category || { name: 'Desconocida', icon: 'question', color: 'gray' };
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

// Format date for display
function formatDateDisplay(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Calculate summary statistics
function updateSummaryStats() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Start of current month
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);

    // Start of previous month
    const startOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1);

    // Start of year
    const startOfYear = new Date(currentYear, 0, 1);

    // Calculate totals
    let currentMonthTotal = 0;
    let previousMonthTotal = 0;
    let yearlyTotal = 0;

    expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const expenseAmount = expense.amount;

        if (expenseDate >= startOfYear) {
            // This year's expenses
            yearlyTotal += expenseAmount;

            if (expenseDate >= startOfCurrentMonth) {
                // Current month's expenses
                currentMonthTotal += expenseAmount;
            } else if (expenseDate >= startOfPreviousMonth && expenseDate < startOfCurrentMonth) {
                // Previous month's expenses
                previousMonthTotal += expenseAmount;
            }
        }
    });

    // Calculate monthly average (for the months that have data)
    const monthsInYear = currentMonth + 1; // 0-indexed months
    const monthlyAverage = monthsInYear > 0 ? yearlyTotal / monthsInYear : 0;

    // Update UI
    document.getElementById('currentMonthTotal').textContent = formatCurrency(currentMonthTotal);
    document.getElementById('previousMonthTotal').textContent = formatCurrency(previousMonthTotal);
    document.getElementById('monthlyAverage').textContent = formatCurrency(monthlyAverage);
    document.getElementById('yearlyTotal').textContent = formatCurrency(yearlyTotal);
}

// Filter expenses based on search and filters
function filterExpenses() {
    const searchTerm = document.getElementById('searchExpense').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    // Get date ranges for filtering
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Define date filter ranges
    let startDate = null;

    switch(dateFilter) {
        case 'current-month':
            startDate = new Date(currentYear, currentMonth, 1);
            break;
        case 'last-month':
            startDate = new Date(currentYear, currentMonth - 1, 1);
            const endDate = new Date(currentYear, currentMonth, 0);
            break;
        case 'last-3-months':
            startDate = new Date(currentYear, currentMonth - 3, 1);
            break;
        case 'year-to-date':
            startDate = new Date(currentYear, 0, 1);
            break;
        default:
            // All periods, no date filtering
            break;
    }

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch =
            expense.concept.toLowerCase().includes(searchTerm) ||
            getCategoryInfo(expense.category).name.toLowerCase().includes(searchTerm) ||
            (expense.description && expense.description.toLowerCase().includes(searchTerm));

        const matchesCategory = categoryFilter === '' || expense.category === categoryFilter;

        // Date filter
        let matchesDate = true;
        if (startDate) {
            const expenseDate = new Date(expense.date);

            if (dateFilter === 'last-month') {
                // Special case for last month (need to check if date is within the month)
                const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
                const lastMonthEnd = new Date(currentYear, currentMonth, 0);
                matchesDate = expenseDate >= lastMonthStart && expenseDate <= lastMonthEnd;
            } else {
                matchesDate = expenseDate >= startDate;
            }
        }

        return matchesSearch && matchesCategory && matchesDate;
    });

    renderExpensesTable(filteredExpenses);
}

// Render expenses table
function renderExpensesTable(expensesToRender = expenses) {
    const tbody = document.getElementById('expensesTableBody');
    if (tbody) {
        if (expensesToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                        <div class="flex flex-col items-center">
                            <i class="fas fa-receipt text-gray-300 text-5xl mb-3"></i>
                            <p>No hay gastos registrados</p>
                            <button onclick="showModal('createExpenseModal')" class="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                                <i class="fas fa-plus mr-2"></i>Registrar Gasto
                            </button>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        // Sort expenses by date (newest first)
        const sortedExpenses = [...expensesToRender].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        tbody.innerHTML = sortedExpenses.map(expense => {
            const category = getCategoryInfo(expense.category);

            return `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <i class="fas fa-${category.icon} text-${category.color}-600 text-xl"></i>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${expense.concept}</div>
                                <div class="text-xs text-gray-500">
                                    ${expense.description ?
                                        (expense.description.length > 30 ?
                                            expense.description.substring(0, 30) + '...' :
                                            expense.description) :
                                        ''}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${category.color}-100 text-${category.color}-800">
                            ${category.name}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${formatDateDisplay(expense.date)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        ${formatCurrency(expense.amount)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            expense.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }">
                            ${expense.status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="showModal('createExpenseModal', '${expense.id}')"
                                class="text-indigo-600 hover:text-indigo-900 mr-3">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="showModal('deleteExpenseModal', '${expense.id}')"
                                class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Add 'Create Expense' button at the end of the table
        tbody.innerHTML += `
            <tr>
                <td colspan="6" class="px-6 py-4">
                    <button onclick="showModal('createExpenseModal')"
                            class="w-full flex justify-center items-center py-2 px-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:border-blue-300">
                        <i class="fas fa-plus mr-2"></i>
                        Registrar nuevo gasto
                    </button>
                </td>
            </tr>
        `;
    }
}

// Initialize expense system
function initExpenses() {
    // Create sample data if none exists
    if (expenses.length === 0) {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        // Generate sample expenses for the past 6 months
        const sampleExpenses = [
            {
                id: 'exp1',
                concept: 'Renta Local Principal',
                category: 'renta',
                date: new Date(currentYear, currentMonth, 5).toISOString().split('T')[0],
                amount: 25000,
                description: 'Pago mensual de renta del local principal',
                status: 'paid',
                creationDate: new Date(currentYear, currentMonth, 5).toISOString()
            },
            {
                id: 'exp2',
                concept: 'Compra de Productos',
                category: 'inventario',
                date: new Date(currentYear, currentMonth, 8).toISOString().split('T')[0],
                amount: 15800.50,
                description: 'Reposición de inventario de productos para venta',
                status: 'paid',
                creationDate: new Date(currentYear, currentMonth, 8).toISOString()
            },
            {
                id: 'exp3',
                concept: 'Servicio de Limpieza',
                category: 'servicios',
                date: new Date(currentYear, currentMonth, 15).toISOString().split('T')[0],
                amount: 3500,
                description: 'Servicio mensual de limpieza',
                status: 'paid',
                creationDate: new Date(currentYear, currentMonth, 15).toISOString()
            },
            {
                id: 'exp4',
                concept: 'Publicidad en Instagram',
                category: 'marketing',
                date: new Date(currentYear, currentMonth, 20).toISOString().split('T')[0],
                amount: 5000,
                description: 'Campaña de publicidad de servicios faciales',
                status: 'paid',
                creationDate: new Date(currentYear, currentMonth, 20).toISOString()
            },
            {
                id: 'exp5',
                concept: 'Salarios',
                category: 'salarios',
                date: new Date(currentYear, currentMonth, 30).toISOString().split('T')[0],
                amount: 45000,
                description: 'Pago de nómina mensual',
                status: 'pending',
                creationDate: new Date(currentYear, currentMonth, 30).toISOString()
            },
            // Previous month
            {
                id: 'exp6',
                concept: 'Renta Local Principal',
                category: 'renta',
                date: new Date(currentYear, currentMonth - 1, 5).toISOString().split('T')[0],
                amount: 25000,
                description: 'Pago mensual de renta del local principal',
                status: 'paid',
                creationDate: new Date(currentYear, currentMonth - 1, 5).toISOString()
            },
            {
                id: 'exp7',
                concept: 'Servicios de Electricidad',
                category: 'servicios',
                date: new Date(currentYear, currentMonth - 1, 10).toISOString().split('T')[0],
                amount: 4200,
                description: 'Pago recibo de luz',
                status: 'paid',
                creationDate: new Date(currentYear, currentMonth - 1, 10).toISOString()
            },
            {
                id: 'exp8',
                concept: 'Salarios',
                category: 'salarios',
                date: new Date(currentYear, currentMonth - 1, 30).toISOString().split('T')[0],
                amount: 45000,
                description: 'Pago de nómina mensual',
                status: 'paid',
                creationDate: new Date(currentYear, currentMonth - 1, 30).toISOString()
            }
        ];

        expenses = sampleExpenses;
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    // Setup event listeners for filters
    const searchInput = document.getElementById('searchExpense');
    const categoryFilter = document.getElementById('categoryFilter');
    const dateFilter = document.getElementById('dateFilter');

    if (searchInput) searchInput.addEventListener('input', filterExpenses);
    if (categoryFilter) categoryFilter.addEventListener('change', filterExpenses);
    if (dateFilter) dateFilter.addEventListener('change', filterExpenses);

    // Render expenses table
    renderExpensesTable();

    // Update summary statistics
    updateSummaryStats();
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', initExpenses);
