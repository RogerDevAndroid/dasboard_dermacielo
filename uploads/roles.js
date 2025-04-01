// Document list from the system
const systemDocuments = [
    { id: 'abril2025', name: 'ABRIL 2025_.xlsx', type: 'excel', url: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID' },
    { id: 'fichaClinica', name: 'Actualizada Ficha Clínica y de Diagnóstico de faciales dermacielo.docx', type: 'document', url: 'https://docs.google.com/document/d/YOUR_DOC_ID' },
    { id: 'baseDatos', name: 'BASE DE DATOS DERMACIELO PACIENTES ACTIVOS.xlsx', type: 'excel', url: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID' },
    { id: 'consentimiento', name: 'CONSENTIMIENTO DEPILACIÓN LÁSER.docx', type: 'document', url: 'https://docs.google.com/document/d/YOUR_DOC_ID' },
    { id: 'enero2025', name: 'ENERO 2025.xlsx', type: 'excel', url: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID' },
    { id: 'febrero2025', name: 'FEBRERO 2025.xlsx', type: 'excel', url: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID' },
    { id: 'marzo2025', name: 'MARZO 2025.xlsx', type: 'excel', url: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID' },
    { id: 'registroVentasMarzo', name: 'REGISTRO DE VENTAS MARZO 2025.xlsm', type: 'excel', url: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID' },
    { id: 'registroVentasEnero', name: 'REGISTRO DE VTAS ENERO 2025 PRIVISIONAL 2.xlsm', type: 'excel', url: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID' }
];

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
                Object.entries(role.documentAccess).forEach(([docId, hasAccess]) => {
                    const checkbox = document.querySelector(`input[name="doc_${docId}"]`);
                    if (checkbox) {
                        checkbox.checked = hasAccess;
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
    container.innerHTML = systemDocuments.map(doc => `
        <div class="flex items-center space-x-2">
            <input type="checkbox" id="doc_${doc.id}" name="doc_${doc.id}" class="rounded text-blue-600">
            <label for="doc_${doc.id}" class="text-sm text-gray-700">
                ${doc.name}
                <i class="fas fa-${doc.type === 'excel' ? 'file-excel text-green-600' : 'file-word text-blue-600'} ml-1"></i>
            </label>
        </div>
    `).join('');
}

// Form Submission
function handleRoleSubmit(event) {
    event.preventDefault();
    
    const roleId = document.getElementById('roleId').value;
    const formData = {
        id: roleId || Date.now().toString(),
        name: document.getElementById('roleName').value,
        description: document.getElementById('roleDescription').value,
        documentAccess: {}
    };

    // Collect document access permissions
    systemDocuments.forEach(doc => {
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
    
    // Update table
    renderRolesTable();
    
    // Close modal
    hideModal('createRoleModal');
}

// Delete role
function deleteRole(roleId) {
    if (confirm('¿Estás seguro de que deseas eliminar este rol?')) {
        roles = roles.filter(role => role.id !== roleId);
        localStorage.setItem('roles', JSON.stringify(roles));
        renderRolesTable();
    }
}

// Render roles table
function renderRolesTable() {
    const tbody = document.getElementById('rolesTableBody');
    tbody.innerHTML = roles.map(role => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${role.name}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-500">${role.description}</div>
            </td>
            <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                    ${Object.entries(role.documentAccess)
                        .filter(([_, hasAccess]) => hasAccess)
                        .map(([docId, _]) => {
                            const doc = systemDocuments.find(d => d.id === docId);
                            return doc ? `
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    <i class="fas fa-${doc.type === 'excel' ? 'file-excel text-green-600' : 'file-word text-blue-600'} mr-1"></i>
                                    ${doc.name.length > 20 ? doc.name.substring(0, 20) + '...' : doc.name}
                                </span>
                            ` : '';
                        }).join('')}
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

// Initialize when document loads
document.addEventListener('DOMContentLoaded', () => {
    renderRolesTable();
});