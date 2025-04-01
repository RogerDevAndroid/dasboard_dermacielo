// Document data management
let documents = JSON.parse(localStorage.getItem('documents')) || [];
const roles = JSON.parse(localStorage.getItem('roles')) || [];

// Modal Management
function showModal(modalId, documentId = null) {
    const modal = document.getElementById(modalId);
    const modalTitle = document.getElementById('documentModalTitle');
    const documentForm = document.getElementById('documentForm');

    if (modal) {
        modal.classList.remove('hidden');

        // Clear form
        if (documentForm) {
            documentForm.reset();
            document.getElementById('documentId').value = '';
        }

        // Populate roles access checkboxes
        populateRolesAccess();

        if (documentId && modalId === 'createDocumentModal') {
            // Edit mode
            const doc = documents.find(d => d.id === documentId);
            if (doc) {
                modalTitle.textContent = 'Editar Documento';
                document.getElementById('documentId').value = doc.id;
                document.getElementById('documentName').value = doc.name;
                document.getElementById('documentType').value = doc.type;
                document.getElementById('documentUrl').value = doc.url;

                // Set roles access checkboxes
                roles.forEach(role => {
                    const checkbox = document.querySelector(`input[name="role_${role.id}"]`);
                    if (checkbox) {
                        checkbox.checked = doc.rolesAccess && doc.rolesAccess.includes(role.id);
                    }
                });
            }
        } else if (documentId && modalId === 'deleteDocumentModal') {
            // Delete confirmation
            document.getElementById('deleteDocumentId').value = documentId;
        } else {
            // Create mode
            if (modalId === 'createDocumentModal') {
                modalTitle.textContent = 'Nuevo Documento';
            }
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

// Populate roles access section in the document modal
function populateRolesAccess() {
    const container = document.getElementById('documentRolesAccess');
    if (container) {
        container.innerHTML = roles.length > 0 ?
            roles.map(role => `
                <div class="flex items-center space-x-2 py-1">
                    <input type="checkbox" id="role_${role.id}" name="role_${role.id}" class="rounded text-blue-600">
                    <label for="role_${role.id}" class="text-sm text-gray-700">
                        ${role.name}
                    </label>
                </div>
            `).join('') :
            '<p class="text-sm text-gray-500">No hay roles disponibles. Por favor, cree roles primero.</p>';
    }
}

// Form Submission
function handleDocumentSubmit() {
    const documentId = document.getElementById('documentId').value;
    const documentName = document.getElementById('documentName').value;
    const documentType = document.getElementById('documentType').value;
    const documentUrl = document.getElementById('documentUrl').value;

    if (!documentName || !documentUrl) {
        alert('Por favor complete todos los campos requeridos');
        return;
    }

    // Collect roles access permissions
    const rolesAccess = [];
    roles.forEach(role => {
        const checkbox = document.querySelector(`input[name="role_${role.id}"]`);
        if (checkbox && checkbox.checked) {
            rolesAccess.push(role.id);
        }
    });

    const formData = {
        id: documentId || Date.now().toString(),
        name: documentName,
        type: documentType,
        url: documentUrl,
        creationDate: documentId ? (documents.find(d => d.id === documentId)?.creationDate || new Date().toISOString()) : new Date().toISOString(),
        rolesAccess: rolesAccess
    };

    if (documentId) {
        // Update existing document
        const index = documents.findIndex(d => d.id === documentId);
        if (index !== -1) {
            documents[index] = formData;
        }
    } else {
        // Create new document
        documents.push(formData);
    }

    // Save to localStorage
    localStorage.setItem('documents', JSON.stringify(documents));

    // Update table
    renderDocumentsTable();

    // Close modal
    hideModal('createDocumentModal');
}

// Delete document
function deleteDocument() {
    const documentId = document.getElementById('deleteDocumentId').value;
    if (documentId) {
        documents = documents.filter(doc => doc.id !== documentId);
        localStorage.setItem('documents', JSON.stringify(documents));
        renderDocumentsTable();
        hideModal('deleteDocumentModal');
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

// Get document type label
function getDocumentTypeLabel(type) {
    switch(type) {
        case 'excel':
            return 'Excel';
        case 'document':
            return 'Word';
        case 'pdf':
            return 'PDF';
        default:
            return 'Archivo';
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

// Filter documents based on search term
function filterDocuments() {
    const searchTerm = document.getElementById('searchDocument').value.toLowerCase();
    const filteredDocs = searchTerm ?
        documents.filter(doc =>
            doc.name.toLowerCase().includes(searchTerm) ||
            getDocumentTypeLabel(doc.type).toLowerCase().includes(searchTerm)
        ) :
        documents;

    renderDocumentsTable(filteredDocs);
}

// Render documents table
function renderDocumentsTable(docsToRender = documents) {
    const tbody = document.getElementById('documentsTableBody');
    if (tbody) {
        tbody.innerHTML = docsToRender.length > 0 ?
            docsToRender.map(doc => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <i class="${getDocumentIcon(doc.type)} text-xl"></i>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${doc.name}</div>
                                <div class="text-xs text-gray-500">
                                    <a href="${doc.url}" target="_blank" class="text-blue-600 hover:underline">Ver documento</a>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            ${getDocumentTypeLabel(doc.type)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${formatDate(doc.creationDate)}
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex flex-wrap gap-1">
                            ${doc.rolesAccess && doc.rolesAccess.length > 0 ?
                                doc.rolesAccess.map(roleId => {
                                    const role = roles.find(r => r.id === roleId);
                                    return role ? `
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            ${role.name}
                                        </span>
                                    ` : '';
                                }).join('') :
                                '<span class="text-xs text-gray-500">Sin acceso asignado</span>'
                            }
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="showModal('createDocumentModal', '${doc.id}')"
                                class="text-indigo-600 hover:text-indigo-900 mr-3">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="showModal('deleteDocumentModal', '${doc.id}')"
                                class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('') :
            `<tr>
                <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                    No hay documentos disponibles
                </td>
            </tr>`;
    }
}

// Initialize document system
function initDocuments() {
    // Setup demo data if none exists
    if (documents.length === 0) {
        const demoDocuments = [
            {
                id: 'doc1',
                name: 'Registro de Ventas Marzo 2025',
                type: 'excel',
                url: 'https://docs.google.com/spreadsheets/d/example1',
                creationDate: '2025-03-01T10:00:00Z',
                rolesAccess: []
            },
            {
                id: 'doc2',
                name: 'Consentimiento Depilación Láser',
                type: 'document',
                url: 'https://docs.google.com/document/d/example2',
                creationDate: '2025-02-15T10:00:00Z',
                rolesAccess: []
            },
            {
                id: 'doc3',
                name: 'Base de Datos Pacientes',
                type: 'excel',
                url: 'https://docs.google.com/spreadsheets/d/example3',
                creationDate: '2025-01-10T10:00:00Z',
                rolesAccess: []
            }
        ];

        documents = demoDocuments;
        localStorage.setItem('documents', JSON.stringify(documents));
    }

    // Render documents table
    renderDocumentsTable();

    // Setup search functionality
    const searchInput = document.getElementById('searchDocument');
    if (searchInput) {
        searchInput.addEventListener('input', filterDocuments);
    }
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', initDocuments);
