// Get documents from localStorage
let documents = JSON.parse(localStorage.getItem('documents')) || [];

// Store roles in localStorage
let roles = JSON.parse(localStorage.getItem('roles')) || [];

// Modal Management
function showModal(modalId, roleId = null) {
    const modal = document.getElementById(modalId);
    const modalTitle = document.getElementById('modalTitle');
    const roleForm = document.getElementById('roleForm');

    if (modal) {
        modal.classList.remove('hidden');

        // Clear form
        roleForm.reset();
        document.getElementById('roleId').value = '';

        // Populate documents access checkboxes
        populateDocumentsAccess();

        if (roleId) {
            // Edit mode
            const role = roles.find(r => r.id === roleId);
            if (role) {
                modalTitle.textContent = 'Editar Rol';
                document.getElementById('roleId').value = role.id;
                document.getElementById('roleName').value = role.name;
                document.getElementById('roleDescription').value = role.description;

                // Set document access checkboxes
                documents.forEach(doc => {
                    const checkbox = document.querySelector(`input[name="doc_${doc.id}"]`);
                    if (checkbox) {
                        checkbox.checked = role.documentAccess && role.documentAccess[doc.id];
                    }
                });
            }
        } else {
            // Create mode
            modalTitle.textContent = 'Crear Nuevo Rol';
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

// Populate documents access section in the modal
function populateDocumentsAccess() {
    const container = document.getElementById('documentsAccess');
    if (container) {
        container.innerHTML = documents.length > 0 ?
            documents.map(doc => `
                <div class="flex items-center space-x-2 py-1">
                    <input type="checkbox" id="doc_${doc.id}" name="doc_${doc.id}" class="rounded text-blue-600">
                    <label for="doc_${doc.id}" class="text-sm text-gray-700">
                        ${doc.name}
                        <i class="${getDocumentIcon(doc.type)} ml-1"></i>
                    </label>
                </div>
            `).join('') :
            '<p class="text-sm text-gray-500">No hay documentos disponibles. Por favor, cree documentos primero.</p>';
    }
}

// Get document icon class based on type
function getDocumentIcon(type) {
    switch(type) {
        case 'excel':
            return 'fas fa-file-excel text-green-600';
        case 'document':
            return 'fas fa-file-word text-blue-600';
        case 'pdf':
            return 'fas fa-file-pdf text-red-600';
        default:
            return 'fas fa-file text-gray-600';
    }
}

// Form Submission
function handleRoleSubmit(event) {
    event.preventDefault();

    const roleId = document.getElementById('roleId').value;
    const roleName = document.getElementById('roleName').value;
    const roleDescription = document.getElementById('roleDescription').value;

    if (!roleName) {
        alert('Por favor ingrese un nombre para el rol');
        return;
    }

    const formData = {
        id: roleId || Date.now().toString(),
        name: roleName,
        description: roleDescription,
        documentAccess: {},
        creationDate: roleId ? (roles.find(r => r.id === roleId)?.creationDate || new Date().toISOString()) : new Date().toISOString()
    };

    // Collect document access permissions
    documents.forEach(doc => {
        const checkbox = document.querySelector(`input[name="doc_${doc.id}"]`);
        if (checkbox) {
            formData.documentAccess[doc.id] = checkbox.checked;
        }
    });

    if (roleId) {
        // Update existing role
        const index = roles.findIndex(r => r.id === roleId);
        if (index !== -1) {
            roles[index] = formData;
        }
    } else {
        // Create new role
        roles.push(formData);
    }

    // Save to localStorage
    localStorage.setItem('roles', JSON.stringify(roles));

    // Update documents with the role access
    updateDocumentsRoleAccess();

    // Update table
    renderRolesTable();

    // Close modal
    hideModal('createRoleModal');
}

// Update documents with role access changes
function updateDocumentsRoleAccess() {
    documents.forEach(doc => {
        // Create a list of roles that have access to this document
        const roleAccess = [];

        roles.forEach(role => {
            if (role.documentAccess && role.documentAccess[doc.id]) {
                roleAccess.push(role.id);
            }
        });

        // Update the document's rolesAccess property
        doc.rolesAccess = roleAccess;
    });

    // Save updated documents to localStorage
    localStorage.setItem('documents', JSON.stringify(documents));
}

// Delete role
function deleteRole(roleId) {
    // Show confirmation dialog
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este rol? Esta acción afectará el acceso a documentos.');
    if (confirmDelete) {
        roles = roles.filter(role => role.id !== roleId);
        localStorage.setItem('roles', JSON.stringify(roles));

        // Update documents access without this role
        updateDocumentsRoleAccess();

        renderRolesTable();
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Render roles table
function renderRolesTable() {
    const tbody = document.getElementById('rolesTableBody');
    if (tbody) {
        if (roles.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                        No hay roles disponibles
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = roles.map(role => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${role.name}</div>
                    <div class="text-xs text-gray-500">
                        ${role.creationDate ? `Creado: ${formatDate(role.creationDate)}` : ''}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-500">${role.description || 'Sin descripción'}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1">
                        ${Object.entries(role.documentAccess || {})
                            .filter(([_, hasAccess]) => hasAccess)
                            .map(([docId, _]) => {
                                const doc = documents.find(d => d.id === docId);
                                return doc ? `
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        <i class="${getDocumentIcon(doc.type)} mr-1"></i>
                                        ${doc.name.length > 20 ? doc.name.substring(0, 20) + '...' : doc.name}
                                    </span>
                                ` : '';
                            }).join('') || '<span class="text-xs text-gray-500">Sin documentos asignados</span>'}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="showModal('createRoleModal', '${role.id}')"
                            class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteRole('${role.id}')"
                            class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Initialize role management system
function initRoles() {
    // Setup demo data if none exists
    if (roles.length === 0) {
        const demoRoles = [
            {
                id: 'role1',
                name: 'Administrador',
                description: 'Acceso completo al sistema',
                documentAccess: {},
                creationDate: new Date().toISOString()
            },
            {
                id: 'role2',
                name: 'Recepcionista',
                description: 'Acceso a documentos de citas y clientes',
                documentAccess: {},
                creationDate: new Date().toISOString()
            },
            {
                id: 'role3',
                name: 'Cosmetóloga',
                description: 'Acceso a documentos clínicos',
                documentAccess: {},
                creationDate: new Date().toISOString()
            }
        ];

        // Check if demo documents exist
        if (documents.length > 0) {
            // Give the admin role access to all documents
            documents.forEach(doc => {
                demoRoles[0].documentAccess[doc.id] = true;

                // Give receptionists access to some documents
                if (doc.type === 'excel') {
                    demoRoles[1].documentAccess[doc.id] = true;
                }

                // Give cosmetólogas access to clinical documents
                if (doc.name.toLowerCase().includes('clínica') ||
                    doc.name.toLowerCase().includes('consentimiento')) {
                    demoRoles[2].documentAccess[doc.id] = true;
                }
            });
        }

        roles = demoRoles;
        localStorage.setItem('roles', JSON.stringify(roles));

        // Update document access based on roles
        updateDocumentsRoleAccess();
    }

    // Render roles table
    renderRolesTable();
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', initRoles);
