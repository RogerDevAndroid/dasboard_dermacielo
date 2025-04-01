// Record data management
let records = JSON.parse(localStorage.getItem('records')) || [];
let clients = JSON.parse(localStorage.getItem('clients')) || [];
const products = JSON.parse(localStorage.getItem('products')) || [];
const services = JSON.parse(localStorage.getItem('services')) || [];

// Document types that can be in a record (these could be configurable)
const documentTypes = [
    { id: 'consentimiento', name: 'Consentimiento Informado', required: true, icon: 'file-signature' },
    { id: 'historiaClinica', name: 'Historia Clínica', required: true, icon: 'file-medical' },
    { id: 'evaluacionInicial', name: 'Evaluación Inicial', required: true, icon: 'clipboard-check' },
    { id: 'antes', name: 'Foto Antes', required: false, icon: 'image' },
    { id: 'despues', name: 'Foto Después', required: false, icon: 'image' },
    { id: 'receta', name: 'Receta Médica', required: false, icon: 'prescription' },
    { id: 'observaciones', name: 'Observaciones', required: false, icon: 'comment-medical' }
];

// Check if we have a selected client from another page
function checkForSelectedClient() {
    const selectedClientId = sessionStorage.getItem('selectedClientId');
    if (selectedClientId) {
        // Clear it from sessionStorage
        sessionStorage.removeItem('selectedClientId');

        // Check if client exists
        const client = clients.find(c => c.id === selectedClientId);
        if (client) {
            // Check if client already has a record
            const existingRecord = records.find(r => r.clientId === selectedClientId);
            if (existingRecord) {
                // If record exists, open it for viewing
                viewRecord(existingRecord.id);
            } else {
                // If no record exists, create one
                createNewRecordForClient(selectedClientId);
            }
        }
    }
}

// Modal Management
function showModal(modalId, recordId = null) {
    const modal = document.getElementById(modalId);

    if (modal) {
        modal.classList.remove('hidden');

        if (modalId === 'selectClientModal') {
            // Populate client dropdown
            populateClientSelector();
        } else if (modalId === 'recordModal' && recordId) {
            // View/edit record
            populateRecordModal(recordId);
        } else if (modalId === 'uploadDocumentModal' && recordId) {
            // Document upload
            document.getElementById('uploadRecordId').value = recordId;

            // If there's a document type specified
            const docType = document.getElementById('uploadDocumentType').value;
            if (docType) {
                const docTypeObj = documentTypes.find(dt => dt.id === docType);
                if (docTypeObj) {
                    document.getElementById('uploadDocumentTitle').textContent = `Subir ${docTypeObj.name}`;
                }
            }
        } else if (modalId === 'deleteRecordModal' && recordId) {
            // Delete confirmation
            document.getElementById('deleteRecordId').value = recordId;
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

// Populate client selector dropdown
function populateClientSelector() {
    const selector = document.getElementById('clientSelector');
    if (selector) {
        // Clear existing options except the first one
        while (selector.options.length > 1) {
            selector.remove(1);
        }

        // Get clients that don't have a record yet
        const clientsWithoutRecords = clients.filter(client =>
            client.status === 'active' && !records.some(record => record.clientId === client.id)
        );

        // Add clients as options
        clientsWithoutRecords.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.firstName} ${client.lastName}`;
            selector.appendChild(option);
        });

        // Show message if no clients available
        if (clientsWithoutRecords.length === 0) {
            const option = document.createElement('option');
            option.disabled = true;
            option.textContent = 'No hay clientes sin expediente';
            selector.appendChild(option);
        }
    }
}

// Populate record modal with data
function populateRecordModal(recordId) {
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    const client = clients.find(c => c.id === record.clientId);
    if (!client) return;

    // Set record ID in hidden field
    const recordIdField = document.getElementById('currentRecordId') || document.createElement('input');
    recordIdField.type = 'hidden';
    recordIdField.id = 'currentRecordId';
    recordIdField.value = recordId;
    document.body.appendChild(recordIdField);

    // Update modal title and client info
    document.getElementById('recordModalTitle').textContent = 'Expediente';
    document.getElementById('recordModalSubtitle').textContent = `${formatDateDisplay(record.creationDate)}`;

    // Update client info
    const clientInfo = document.getElementById('clientInfo');
    clientInfo.innerHTML = `
        <div class="flex-shrink-0">
            <img class="h-12 w-12 rounded-full" src="https://ui-avatars.com/api/?name=${encodeURIComponent(client.firstName + '+' + client.lastName)}&background=0D8ABC&color=fff" alt="${client.firstName}">
        </div>
        <div class="ml-4">
            <h4 class="text-lg font-medium text-gray-900">${client.firstName} ${client.lastName}</h4>
            <div class="flex text-sm text-gray-500">
                <p>${client.phone}</p>
                ${client.email ? `<p class="ml-4">${client.email}</p>` : ''}
                ${client.birthdate ? `<p class="ml-4">${calculateAge(client.birthdate)}</p>` : ''}
            </div>
        </div>
    `;

    // Update document list
    populateDocumentsList(record);

    // Update record status
    const recordStatus = document.getElementById('recordStatus');
    const statusLabel = getRecordStatusLabel(record);
    recordStatus.textContent = statusLabel.text;
    recordStatus.className = `px-2 py-1 text-xs font-semibold rounded-full ${statusLabel.bgColor} ${statusLabel.textColor}`;
}

// Populate documents list in record modal
function populateDocumentsList(record) {
    const documentsList = document.getElementById('documentsList');
    if (!documentsList) return;

    const recordDocuments = record.documents || [];

    // Create document items for each document type
    const docItems = documentTypes.map(docType => {
        const docRecord = recordDocuments.find(doc => doc.type === docType.id);
        const isSubmitted = docRecord && docRecord.submitted;

        return `
            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i class="fas fa-${docType.icon} text-blue-500 text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <h4 class="text-sm font-medium text-gray-900">${docType.name}</h4>
                            <p class="text-xs text-gray-500">
                                ${docType.required ? '<span class="text-red-500">Requerido</span>' : 'Opcional'}
                            </p>
                        </div>
                    </div>
                    <div>
                        ${isSubmitted ? `
                            <span class="mr-3 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                <i class="fas fa-check mr-1"></i>Subido el ${formatDateDisplay(docRecord.date)}
                            </span>
                            <button type="button" onclick="viewDocument('${record.id}', '${docType.id}')"
                                    class="text-blue-600 hover:text-blue-900 mr-2">
                                <i class="fas fa-eye"></i>
                            </button>
                        ` : `
                            <button type="button" onclick="uploadDocument('${record.id}', '${docType.id}')"
                                    class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                                <i class="fas fa-upload mr-1"></i>Subir
                            </button>
                        `}
                    </div>
                </div>
                ${isSubmitted && docRecord.notes ? `
                    <div class="mt-2 ml-12">
                        <p class="text-xs text-gray-600 italic">${docRecord.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;
    });

    documentsList.innerHTML = docItems.join('');
}

// Create a new record for a selected client
function createNewRecord() {
    const clientId = document.getElementById('clientSelector').value;
    if (!clientId) {
        alert('Por favor seleccione un cliente');
        return;
    }

    createNewRecordForClient(clientId);
    hideModal('selectClientModal');
}

// Create a new record for a specific client
function createNewRecordForClient(clientId) {
    // Check if client exists
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    // Check if client already has a record
    if (records.some(r => r.clientId === clientId)) {
        return;
    }

    // Create new record
    const newRecord = {
        id: `record_${Date.now()}`,
        clientId,
        status: 'incomplete',
        documents: [],
        creationDate: new Date().toISOString()
    };

    // Add record to list
    records.push(newRecord);

    // Save to localStorage
    localStorage.setItem('records', JSON.stringify(records));

    // Update table
    renderRecordsTable();

    // Open the record modal
    viewRecord(newRecord.id);
}

// Prepare for document upload
function uploadDocument(recordId, documentType) {
    document.getElementById('uploadRecordId').value = recordId;
    document.getElementById('uploadDocumentType').value = documentType;

    // Reset form
    document.getElementById('documentNotes').value = '';
    document.getElementById('documentFile').value = '';

    // Update modal title
    const docType = documentTypes.find(dt => dt.id === documentType);
    if (docType) {
        document.getElementById('uploadDocumentTitle').textContent = `Subir ${docType.name}`;
    }

    showModal('uploadDocumentModal');
}

// Submit document
function submitDocument() {
    const recordId = document.getElementById('uploadRecordId').value;
    const documentType = document.getElementById('uploadDocumentType').value;
    const documentNotes = document.getElementById('documentNotes').value;
    const documentFile = document.getElementById('documentFile').files[0];

    // In a real implementation, we would upload the file to a server here
    // For now, we'll just simulate a successful upload

    // Find the record
    const recordIndex = records.findIndex(r => r.id === recordId);
    if (recordIndex === -1) return;

    // Create document object
    const newDocument = {
        type: documentType,
        submitted: true,
        date: new Date().toISOString(),
        notes: documentNotes,
        // In a real app we would store a file reference
        fileUrl: documentFile ? URL.createObjectURL(documentFile) : null,
        fileName: documentFile ? documentFile.name : 'documento.pdf'
    };

    // Update record documents
    if (!records[recordIndex].documents) {
        records[recordIndex].documents = [];
    }

    // Remove existing document of this type if it exists
    records[recordIndex].documents = records[recordIndex].documents.filter(doc => doc.type !== documentType);

    // Add new document
    records[recordIndex].documents.push(newDocument);

    // Check if all required documents are submitted
    const requiredDocTypes = documentTypes.filter(dt => dt.required).map(dt => dt.id);
    const submittedRequiredDocs = records[recordIndex].documents.filter(
        doc => doc.submitted && requiredDocTypes.includes(doc.type)
    );

    // Update record status if all required documents are submitted
    if (submittedRequiredDocs.length === requiredDocTypes.length) {
        records[recordIndex].status = 'complete';
    } else {
        records[recordIndex].status = 'incomplete';
    }

    // Save to localStorage
    localStorage.setItem('records', JSON.stringify(records));

    // Update UI
    populateRecordModal(recordId);
    renderRecordsTable();

    // Close modal
    hideModal('uploadDocumentModal');
}

// View document
function viewDocument(recordId, documentType) {
    // Find the record and document
    const record = records.find(r => r.id === recordId);
    if (!record || !record.documents) return;

    const document = record.documents.find(doc => doc.type === documentType);
    if (!document) return;

    // In a real app, we would open the document in a viewer
    // For now, we'll just alert with the document details
    alert(`
        Documento: ${documentTypes.find(dt => dt.id === documentType)?.name || documentType}
        Fecha: ${formatDateDisplay(document.date)}
        Nombre de archivo: ${document.fileName || 'Sin nombre'}
        Notas: ${document.notes || 'Sin notas'}

        En una aplicación real, aquí se abriría el documento.
    `);
}

// View record
function viewRecord(recordId) {
    showModal('recordModal', recordId);
}

// Save record changes
function saveRecordChanges() {
    const recordId = document.getElementById('currentRecordId')?.value;
    if (!recordId) return;

    // In this implementation we're not saving any changes
    // because the changes are made directly on the documents

    hideModal('recordModal');
}

// Delete record
function deleteRecord() {
    const recordId = document.getElementById('deleteRecordId').value;
    if (recordId) {
        records = records.filter(record => record.id !== recordId);
        localStorage.setItem('records', JSON.stringify(records));
        renderRecordsTable();
        hideModal('deleteRecordModal');
    }
}

// Filter records based on search term and status
function filterRecords() {
    const searchTerm = document.getElementById('searchRecord').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    const filteredRecords = records.filter(record => {
        // Get client information for this record
        const client = clients.find(c => c.id === record.clientId);
        if (!client) return false;

        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
        const matchesSearch =
            fullName.includes(searchTerm) ||
            (client.email && client.email.toLowerCase().includes(searchTerm)) ||
            (client.phone && client.phone.includes(searchTerm));

        const matchesStatus = statusFilter === '' || record.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    renderRecordsTable(filteredRecords);
}

// Redirect to templates configuration
function redirectToTemplates() {
    alert('Esta funcionalidad permitiría configurar las plantillas de documentos requeridos para diferentes tipos de servicios y tratamientos.');
}

// Render records table
function renderRecordsTable(recordsToRender = records) {
    const tbody = document.getElementById('recordsTableBody');
    if (tbody) {
        if (recordsToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                        <div class="flex flex-col items-center">
                            <i class="fas fa-folder text-gray-300 text-5xl mb-3"></i>
                            <p>No hay expedientes disponibles</p>
                            <button onclick="showModal('selectClientModal')" class="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                                <i class="fas fa-plus mr-2"></i>Crear Expediente
                            </button>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = recordsToRender.map(record => {
            const client = clients.find(c => c.id === record.clientId);
            if (!client) return '';

            const recordDocuments = record.documents || [];
            const requiredDocTypes = documentTypes.filter(dt => dt.required);
            const statusLabel = getRecordStatusLabel(record);

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
                                    ${client.phone}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex flex-wrap gap-2">
                            ${recordDocuments.filter(doc => doc.submitted).map(doc => {
                                const docType = documentTypes.find(dt => dt.id === doc.type);
                                return docType ? `
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        <i class="fas fa-${docType.icon} mr-1"></i>
                                        ${docType.name}
                                    </span>
                                ` : '';
                            }).join('')}
                            ${recordDocuments.filter(doc => doc.submitted).length === 0 ?
                                '<span class="text-xs text-gray-500">Sin documentos</span>' : ''}
                        </div>
                        <div class="mt-1 text-xs text-gray-500">
                            ${recordDocuments.filter(doc => doc.submitted).length}/${requiredDocTypes.length} documentos requeridos
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${formatDateDisplay(record.creationDate)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusLabel.bgColor} ${statusLabel.textColor}">
                            ${statusLabel.text}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="viewRecord('${record.id}')"
                                class="text-blue-600 hover:text-blue-900 mr-2">
                            <i class="fas fa-folder-open"></i>
                        </button>
                        <button onclick="showModal('deleteRecordModal', '${record.id}')"
                                class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Add 'Create Record' button at the end of the table if there are records
        tbody.innerHTML += `
            <tr>
                <td colspan="5" class="px-6 py-4">
                    <button onclick="showModal('selectClientModal')"
                            class="w-full flex justify-center items-center py-2 px-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:border-blue-300">
                        <i class="fas fa-plus mr-2"></i>
                        Crear nuevo expediente
                    </button>
                </td>
            </tr>
        `;
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
    if (!birthdate) return '';

    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return `${age} años`;
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

// Initialize record system
function initRecords() {
    // Setup event listeners for filters
    const searchInput = document.getElementById('searchRecord');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) searchInput.addEventListener('input', filterRecords);
    if (statusFilter) statusFilter.addEventListener('change', filterRecords);

    // Render records table
    renderRecordsTable();

    // Check if we came from client page with a selected client
    checkForSelectedClient();
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', initRecords);
