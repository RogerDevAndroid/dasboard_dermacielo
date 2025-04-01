// User data management
let users = JSON.parse(localStorage.getItem('users')) || [];
const roles = JSON.parse(localStorage.getItem('roles')) || [];

// Define sucursales
const sucursales = [
    { id: 'suc1', name: 'Sucursal Principal' },
    { id: 'suc2', name: 'Cancún' },
    { id: 'suc3', name: 'Tulum' },
    { id: 'suc4', name: 'Playa del Carmen' },
    { id: 'suc5', name: 'Cozumel' },
    { id: 'suc6', name: 'Valladolid' }
];

// Modal Management
function showModal(modalId, userId = null) {
    const modal = document.getElementById(modalId);

    if (modal) {
        modal.classList.remove('hidden');

        if (modalId === 'createUserModal' || modalId === 'editUserModal') {
            // Common form handling for create and edit modals
            const form = document.getElementById('userForm');
            const modalTitle = document.getElementById('userModalTitle');

            // Clear form
            form.reset();
            document.getElementById('userId').value = '';

            // Populate select options
            populateRolesSelect();
            populateSucursalesSelect();

            if (userId && modalId === 'editUserModal') {
                // Edit mode
                const user = users.find(u => u.id === userId);
                if (user) {
                    modalTitle.textContent = 'Editar Usuario';
                    document.getElementById('userId').value = user.id;
                    document.getElementById('userName').value = user.name;
                    document.getElementById('userLastName').value = user.lastName;
                    document.getElementById('userEmail').value = user.email;
                    document.getElementById('userRole').value = user.roleId || '';
                    document.getElementById('userSucursal').value = user.sucursalId || '';
                    document.getElementById('userStatus').value = user.status;

                    // Hide password field for edit
                    document.getElementById('passwordField').classList.add('hidden');
                } else {
                    console.error(`User with ID ${userId} not found`);
                }
            } else {
                // Create mode
                modalTitle.textContent = 'Crear Nuevo Usuario';
                document.getElementById('passwordField').classList.remove('hidden');
            }
        } else if (modalId === 'deleteUserModal') {
            // Delete confirmation
            document.getElementById('deleteUserId').value = userId;
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

// Populate roles select
function populateRolesSelect() {
    const select = document.getElementById('userRole');
    if (select) {
        // Clear existing options except the first empty one
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Add roles as options
        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id;
            option.textContent = role.name;
            select.appendChild(option);
        });
    }
}

// Populate sucursales select
function populateSucursalesSelect() {
    const select = document.getElementById('userSucursal');
    if (select) {
        // Clear existing options except the first empty one
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Add sucursales as options
        sucursales.forEach(sucursal => {
            const option = document.createElement('option');
            option.value = sucursal.id;
            option.textContent = sucursal.name;
            select.appendChild(option);
        });
    }
}

// Form Submission
function handleUserSubmit(event) {
    event.preventDefault();

    const userId = document.getElementById('userId').value;
    const formData = {
        id: userId || Date.now().toString(),
        name: document.getElementById('userName').value,
        lastName: document.getElementById('userLastName').value,
        email: document.getElementById('userEmail').value,
        roleId: document.getElementById('userRole').value,
        sucursalId: document.getElementById('userSucursal').value,
        status: document.getElementById('userStatus').value,
        lastLogin: userId ? (users.find(u => u.id === userId)?.lastLogin || null) : null,
        creationDate: userId ? (users.find(u => u.id === userId)?.creationDate || new Date().toISOString()) : new Date().toISOString()
    };

    // Add password for new users only
    if (!userId) {
        const password = document.getElementById('userPassword').value;
        if (password) {
            formData.password = password; // In a real app, encrypt this
        } else {
            alert('Por favor ingrese una contraseña');
            return;
        }
    }

    if (userId) {
        // Update existing user
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            // Preserve the existing password
            formData.password = users[index].password;
            users[index] = formData;
        }
    } else {
        // Create new user
        users.push(formData);
    }

    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Update table
    renderUsersTable();

    // Close modal
    hideModal(userId ? 'editUserModal' : 'createUserModal');
}

// Delete user
function deleteUser() {
    const userId = document.getElementById('deleteUserId').value;
    if (userId) {
        users = users.filter(user => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));
        renderUsersTable();
        hideModal('deleteUserModal');
    }
}

// Get role name by ID
function getRoleName(roleId) {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Sin rol asignado';
}

// Get sucursal name by ID
function getSucursalName(sucursalId) {
    const sucursal = sucursales.find(s => s.id === sucursalId);
    return sucursal ? sucursal.name : 'Sin sucursal asignada';
}

// Format time ago for last login
function formatTimeAgo(dateString) {
    if (!dateString) return 'Nunca';

    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // difference in seconds

    if (diff < 60) return 'Hace unos segundos';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
    if (diff < 2592000) return `Hace ${Math.floor(diff / 86400)} días`;
    if (diff < 31536000) return `Hace ${Math.floor(diff / 2592000)} meses`;
    return `Hace ${Math.floor(diff / 31536000)} años`;
}

// Get avatar URL
function getAvatarUrl(user) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name + '+' + user.lastName)}&background=0D8ABC&color=fff`;
}

// Filter users based on search term and filters
function filterUsers() {
    const searchTerm = document.getElementById('searchUser').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    const sucursalFilter = document.getElementById('sucursalFilter').value;

    const filteredUsers = users.filter(user => {
        const matchesSearch = searchTerm === '' ||
            user.name.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);

        const matchesRole = roleFilter === '' || user.roleId === roleFilter;
        const matchesSucursal = sucursalFilter === '' || user.sucursalId === sucursalFilter;

        return matchesSearch && matchesRole && matchesSucursal;
    });

    renderUsersTable(filteredUsers);
}

// Render users table
function renderUsersTable(usersToRender = users) {
    const tbody = document.getElementById('usersTableBody');
    if (tbody) {
        if (usersToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                        No hay usuarios disponibles
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = usersToRender.map(user => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-full" src="${getAvatarUrl(user)}" alt="${user.name}">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${user.name} ${user.lastName}</div>
                            <div class="text-sm text-gray-500">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${getRoleName(user.roleId)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${getSucursalName(user.sucursalId)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">
                        ${user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${formatTimeAgo(user.lastLogin)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="showModal('editUserModal', '${user.id}')"
                            class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="showModal('deleteUserModal', '${user.id}')"
                            class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Populate filter selects
function populateFilters() {
    // Roles filter
    const roleFilter = document.getElementById('roleFilter');
    if (roleFilter) {
        roleFilter.innerHTML = '<option value="">Todos los roles</option>';
        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id;
            option.textContent = role.name;
            roleFilter.appendChild(option);
        });
    }

    // Sucursales filter
    const sucursalFilter = document.getElementById('sucursalFilter');
    if (sucursalFilter) {
        sucursalFilter.innerHTML = '<option value="">Todas las sucursales</option>';
        sucursales.forEach(sucursal => {
            const option = document.createElement('option');
            option.value = sucursal.id;
            option.textContent = sucursal.name;
            sucursalFilter.appendChild(option);
        });
    }
}

// Initialize user management system
function initUsers() {
    // Setup demo data if none exists
    if (users.length === 0 && roles.length > 0) {
        const adminRoleId = roles.find(r => r.name === 'Administrador')?.id;
        const receptionistRoleId = roles.find(r => r.name === 'Recepcionista')?.id;

        const demoUsers = [
            {
                id: 'user1',
                name: 'Juan',
                lastName: 'Pérez',
                email: 'juan.perez@dermacielo.com',
                password: 'admin123', // In a real app, encrypt this
                roleId: adminRoleId || '',
                sucursalId: 'suc1',
                status: 'active',
                lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                creationDate: new Date().toISOString()
            },
            {
                id: 'user2',
                name: 'María',
                lastName: 'García',
                email: 'maria.garcia@dermacielo.com',
                password: 'password123', // In a real app, encrypt this
                roleId: receptionistRoleId || '',
                sucursalId: 'suc2',
                status: 'active',
                lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                creationDate: new Date().toISOString()
            }
        ];

        users = demoUsers;
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Setup event listeners for filters
    const searchInput = document.getElementById('searchUser');
    const roleFilter = document.getElementById('roleFilter');
    const sucursalFilter = document.getElementById('sucursalFilter');

    if (searchInput) searchInput.addEventListener('input', filterUsers);
    if (roleFilter) roleFilter.addEventListener('change', filterUsers);
    if (sucursalFilter) sucursalFilter.addEventListener('change', filterUsers);

    // Populate filters
    populateFilters();

    // Render users table
    renderUsersTable();
}

// Simulate login for a user
function simulateLogin(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
        renderUsersTable();
    }
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', initUsers);
