// Client data management
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let records = JSON.parse(localStorage.getItem('records')) || [];

// Modal Management
function showModal(modalId, clientId = null) {
    const modal = document.getElementById(modalId);

    if (modal) {
        modal.classList.remove('hidden');

        if (modalId === 'createClientModal') {
            const modalTitle = document.getElementById('clientModalTitle');
            const clientForm = document.getElementById('clientForm');

            // Clear form
            if (clientForm) {
                clientForm.reset();
                document.getElementById('clientId').value = '';
            }

            if (clientId) {
                // Edit mode
                const client = clients.find(c => c.id === clientId);
                if (client) {
                    modalTitle.textContent = 'Editar Cliente';
                    document.getElementById('clientId').value = client.id;
                    document.getElementById('firstName').value = client.firstName;
                    document.getElementById('lastName').value = client.lastName;
                    document.getElementById('email').value = client.email || '';
                    document.getElementById('phone').value = client.phone;
                    document.getElementById('whatsapp').value = client.whatsapp || '';
                    document.getElementById('preferredContact').value = client.preferredContact || 'phone';
                    document.getElementById('birthdate').value = client.birthdate || '';
                    document.getElementById('gender').value = client.gender || '';
                    document.getElementById('address').value = client.address || '';
                    document.getElementById('referredBy').value = client.referredBy || '';
                    document.getElementById('notes').value = client.notes || '';
                    document.getElementById('status').value = client.status;
                }
            } else {
                // Create mode
                modalTitle.textContent = 'Nuevo Cliente';
            }
        } else if (modalId === 'viewClientModal' && clientId) {
            // View client details
            populateClientDetails(clientId);
        } else if (modalId === 'deleteClientModal' && clientId) {
            // Delete confirmation
            document.getElementById('deleteClientId').value = clientId;
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

// Populate client details in view modal
function populateClientDetails(clientId) {
    const client = clients.find(c => c.id === clientId);
    const viewClientTitle = document.getElementById('viewClientTitle');
    const clientDetails = document.getElementById('clientDetails');
    const recordStatus = document.getElementById('recordStatus');

    if (client && viewClientTitle && clientDetails && recordStatus) {
        // Update title
        viewClientTitle.textContent = `${client.firstName} ${client.lastName}`;

        // Get client record if exists
        const clientRecord = records.find(r => r.clientId === clientId);
        const recordLabel = getRecordStatusLabel(clientRecord);

        // Update client details
        clientDetails.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h5 class="text-sm font-medium text-gray-600">Información Personal</h5>
                    <div class="mt-2 space-y-2">
                        <p class="text-sm"><span class="font-medium">Nombre:</span> ${client.firstName} ${client.lastName}</p>
                        <p class="text-sm"><span class="font-medium">Género:</span> ${getGenderLabel(client.gender)}</p>
                        <p class="text-sm"><span class="font-medium">Fecha de Nacimiento:</span> ${client.birthdate ? formatDateDisplay(client.birthdate) : 'No especificada'}</p>
                        <p class="text-sm"><span class="font-medium">Edad:</span> ${client.birthdate ? calculateAge(client.birthdate) : 'No especificada'}</p>
                    </div>
                </div>

                <div>
                    <h5 class="text-sm font-medium text-gray-600">Información de Contacto</h5>
                    <div class="mt-2 space-y-2">
                        <p class="text-sm"><span class="font-medium">Teléfono:</span> ${client.phone}</p>
                        <p class="text-sm"><span class="font-medium">WhatsApp:</span> ${client.whatsapp || 'No especificado'}</p>
                        <p class="text-sm"><span class="font-medium">Email:</span> ${client.email || 'No especificado'}</p>
                        <p class="text-sm"><span class="font-medium">Contacto Preferido:</span> ${getPreferredContactLabel(client.preferredContact)}</p>
                    </div>
                </div>
            </div>

            <div class="mt-4">
                <h5 class="text-sm font-medium text-gray-600">Dirección</h5>
                <p class="text-sm mt-2">${client.address || 'No especificada'}</p>
            </div>

            <div class="mt-4">
                <h5 class="text-sm font-medium text-gray-600">Información Adicional</h5>
                <div class="mt-2 space-y-2">
                    <p class="text-sm"><span class="font-medium">¿Cómo nos conoció?:</span> ${getReferredByLabel(client.referredBy)}</p>
                    <p class="text-sm"><span class="font-medium">Fecha de Registro:</span> ${formatDateDisplay(client.creationDate)}</p>
                    <p class="text-sm"><span class="font-medium">Estado:</span> <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">${client.status === 'active' ? 'Activo' : 'Inactivo'}</span></p>
                </div>
            </div>

            ${client.notes ? `
            <div class="mt-4">
                <h5 class="text-sm font-medium text-gray-600">Notas</h5>
                <p class="text-sm mt-2 italic bg-gray-50 p-3 rounded-lg">${client.notes}</p>
            </div>` : ''}
        `;

        // Update record status
        recordStatus.innerHTML = `
            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-folder-open text-blue-500 text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <h5 class="text-sm font-medium text-gray-900">Estado del Expediente</h5>
                        <span class="px-2 py-1 mt-1 inline-flex text-xs leading-5 font-semibold rounded-full ${recordLabel.bgColor} ${recordLabel.textColor}">
                            ${recordLabel.text}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }
}

// Form Submission
function handleClientSubmit(event) {
    event.preventDefault();

    const clientId = document.getElementById('clientId').value;
    const formData = {
        id: clientId || Date.now().toString(),
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        whatsapp: document.getElementById('whatsapp').value,
        preferredContact: document.getElementById('preferredContact').value,
        birthdate: document.getElementById('birthdate').value,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value,
        referredBy: document.getElementById('referredBy').value,
        notes: document.getElementById('notes').value,
        status: document.getElementById('status').value,
        creationDate: clientId ? (clients.find(c => c.id === clientId)?.creationDate || new Date().toISOString()) : new Date().toISOString()
    };

    if (clientId) {
        // Update existing client
        const index = clients.findIndex(c => c.id === clientId);
        if (index !== -1) {
            clients[index] = formData;
        }
    } else {
        // Create new client
        clients.push(formData);
    }

    // Save to localStorage
    localStorage.setItem('clients', JSON.stringify(clients));

    // Update table
    renderClientsTable();

    // Close modal
    hideModal('createClientModal');
}

// Delete client
function deleteClient() {
    const clientId = document.getElementById('deleteClientId').value;
    if (clientId) {
        // Also delete associated records
        records = records.filter(record => record.clientId !== clientId);
        localStorage.setItem('records', JSON.stringify(records));

        clients = clients.filter(client => client.id !== clientId);
        localStorage.setItem('clients', JSON.stringify(clients));

        renderClientsTable();
        hideModal('deleteClientModal');
    }
}

// Helper Functions
function formatDateDisplay(dateString) {
    if (!dateString) return 'No especificada';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function calculateAge(birthdate) {
    if (!birthdate) return 'No especificada';

    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return `${age} años`;
}

function getGenderLabel(gender) {
    switch(gender) {
        case 'female':
            return 'Femenino';
        case 'male':
            return 'Masculino';
        case 'other':
            return 'Otro';
        default:
            return 'No especificado';
    }
}

function getPreferredContactLabel(preferredContact) {
    switch(preferredContact) {
        case 'phone':
            return 'Teléfono';
        case 'whatsapp':
            return 'WhatsApp';
        case 'email':
            return 'Correo Electrónico';
        default:
            return 'No especificado';
    }
}

function getReferredByLabel(referredBy) {
    switch(referredBy) {
        case 'social':
            return 'Redes Sociales';
        case 'friend':
            return 'Recomendación';
        case 'search':
            return 'Búsqueda en Internet';
        case 'advertising':
            return 'Publicidad';
        case 'other':
            return 'Otro';
        default:
            return 'No especificado';
    }
}

function getRecordStatusLabel(record) {
    if (!record) {
        return { text: 'Sin expediente', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }

    if (record.status === 'complete') {
        return { text: 'Completo', bgColor: 'bg-green-100', textColor: 'text-green-800' };
    }

    return { text: 'Incompleto', bgColor: 'bg-amber-100', textColor: 'text-amber-800' };
}

// Get record completion status
function getClientRecordStatus(clientId) {
    const record = records.find(r => r.clientId === clientId);

    if (!record) {
        return 'none';
    }

    return record.status || 'incomplete';
}

// Filter clients based on search term and filters
function filterClients() {
    const searchTerm = document.getElementById('searchClient').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const recordFilter = document.getElementById('recordFilter').value;

    const filteredClients = clients.filter(client => {
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
        const matchesSearch =
            fullName.includes(searchTerm) ||
            (client.email && client.email.toLowerCase().includes(searchTerm)) ||
            client.phone.includes(searchTerm);

        const matchesStatus = statusFilter === '' || client.status === statusFilter;

        const recordStatus = getClientRecordStatus(client.id);
        const matchesRecord = recordFilter === '' || recordStatus === recordFilter;

        return matchesSearch && matchesStatus && matchesRecord;
    });

    renderClientsTable(filteredClients);
}

// Redirect to client record
function redirectToClientRecord() {
    const clientId = document.getElementById('viewClientId')?.value;
    if (clientId) {
        // Store current client ID in sessionStorage for use in records page
        sessionStorage.setItem('selectedClientId', clientId);
        window.location.href = 'records.html';
    }
}

// Redirect to POS
function redirectToPOS() {
    const clientId = document.getElementById('viewClientId')?.value;
    if (clientId) {
        // Store current client ID in sessionStorage for use in POS page
        sessionStorage.setItem('selectedClientId', clientId);
        window.location.href = 'pos.html';
    }
}

// Render clients table
function renderClientsTable(clientsToRender = clients) {
    const tbody = document.getElementById('clientsTableBody');
    if (tbody) {
        if (clientsToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                        No hay clientes disponibles
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = clientsToRender.map(client => {
            const recordStatus = getClientRecordStatus(client.id);
            const recordLabel = getRecordStatusLabel(records.find(r => r.clientId === client.id));

            return `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                                <img class="h-10 w-10 rounded-full" src="https://ui-avatars.com/api/?name=${encodeURIComponent(client.firstName + '+' + client.lastName)}&background=0D8ABC&color=fff" alt="${client.firstName}">
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${client.firstName} ${client.lastName}</div>
                                <div class="text-xs text-gray-500">
                                    ${client.birthdate ? calculateAge(client.birthdate) : 'Edad no especificada'}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${client.phone}</div>
                        <div class="text-xs text-gray-500">${client.email || ''}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${formatDateDisplay(client.creationDate)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${recordLabel.bgColor} ${recordLabel.textColor}">
                            ${recordLabel.text}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }">
                            ${client.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="viewClient('${client.id}')"
                                class="text-blue-600 hover:text-blue-900 mr-2">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="showModal('createClientModal', '${client.id}')"
                                class="text-indigo-600 hover:text-indigo-900 mr-2">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="showModal('deleteClientModal', '${client.id}')"
                                class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// View client details
function viewClient(clientId) {
    // Set hidden input value for use in redirects
    const viewClientId = document.getElementById('viewClientId') || document.createElement('input');
    viewClientId.type = 'hidden';
    viewClientId.id = 'viewClientId';
    viewClientId.value = clientId;
    document.body.appendChild(viewClientId);

    showModal('viewClientModal', clientId);
}

// Initialize client system
function initClients() {
    // Setup demo data if none exists
    if (clients.length === 0) {
        const demoClients = [
            {
                id: 'client1',
                firstName: 'Ana',
                lastName: 'García Pérez',
                email: 'ana.garcia@example.com',
                phone: '5551234567',
                whatsapp: '5551234567',
                preferredContact: 'whatsapp',
                birthdate: '1988-06-15',
                gender: 'female',
                address: 'Calle Principal 123, Colonia Centro, Cancún, Q.R.',
                referredBy: 'social',
                notes: 'Cliente frecuente, interesada en tratamientos faciales.',
                status: 'active',
                creationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days ago
            },
            {
                id: 'client2',
                firstName: 'Carlos',
                lastName: 'Rodríguez López',
                email: 'carlos.rodriguez@example.com',
                phone: '5559876543',
                whatsapp: '',
                preferredContact: 'phone',
                birthdate: '1975-11-23',
                gender: 'male',
                address: 'Av. De las Palmas 456, Playa del Carmen, Q.R.',
                referredBy: 'friend',
                notes: 'Recomendado por Ana García. Interesado en servicios de depilación láser.',
                status: 'active',
                creationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() // 45 days ago
            },
            {
                id: 'client3',
                firstName: 'María',
                lastName: 'Hernández Gómez',
                email: 'maria.hernandez@example.com',
                phone: '5552345678',
                whatsapp: '5552345678',
                preferredContact: 'email',
                birthdate: '1992-03-08',
                gender: 'female',
                address: 'Calle 10 Norte 789, Tulum, Q.R.',
                referredBy: 'search',
                notes: '',
                status: 'active',
                creationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
            },
            {
                id: 'client4',
                firstName: 'Roberto',
                lastName: 'Martínez Díaz',
                email: 'roberto.martinez@example.com',
                phone: '5558765432',
                whatsapp: '5558765432',
                preferredContact: 'whatsapp',
                birthdate: '1980-09-19',
                gender: 'male',
                address: 'Av. Constituyentes 234, Cancún, Q.R.',
                referredBy: 'advertising',
                notes: 'Vio publicidad en Instagram. Interesado en tratamientos corporales.',
                status: 'inactive',
                creationDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() // 120 days ago
            }
        ];

        clients = demoClients;
        localStorage.setItem('clients', JSON.stringify(clients));

        // Create sample records for demo clients
        if (records.length === 0) {
            const demoRecords = [
                {
                    id: 'record1',
                    clientId: 'client1',
                    status: 'complete',
                    documents: [
                        { type: 'consentimiento', submitted: true, date: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString() },
                        { type: 'historiaClinica', submitted: true, date: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString() },
                        { type: 'evaluacionInicial', submitted: true, date: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString() }
                    ],
                    creationDate: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'record2',
                    clientId: 'client2',
                    status: 'incomplete',
                    documents: [
                        { type: 'consentimiento', submitted: true, date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
                        { type: 'historiaClinica', submitted: false, date: null },
                        { type: 'evaluacionInicial', submitted: true, date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() }
                    ],
                    creationDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
                }
                // client3 and client4 don't have records yet
            ];

            records = demoRecords;
            localStorage.setItem('records', JSON.stringify(records));
        }
    }

    // Setup event listeners for filters
    const searchInput = document.getElementById('searchClient');
    const statusFilter = document.getElementById('statusFilter');
    const recordFilter = document.getElementById('recordFilter');

    if (searchInput) searchInput.addEventListener('input', filterClients);
    if (statusFilter) statusFilter.addEventListener('change', filterClients);
    if (recordFilter) recordFilter.addEventListener('change', filterClients);

    // Render clients table
    renderClientsTable();
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', initClients);
